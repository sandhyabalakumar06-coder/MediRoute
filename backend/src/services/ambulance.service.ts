import prisma from "../config/db";

import {
  emitEmergencyUpdate,
  emitAmbulanceLocationUpdate,
} from "../socket";

import {
  startAutomaticAmbulanceMovement,
  stopAutomaticAmbulanceMovement,
} from "./movement.service";


// ======================================================
// GET ALL AMBULANCES
// ======================================================

export const getAllAmbulances = async () => {
  const ambulances = await prisma.ambulance.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      AmbulanceOperator: {
        include: {
          User: true,
        },
      },

      EmergencyRequest: {
        where: {
          status: {
            notIn: [
              "COMPLETED",
              "CANCELLED",
            ],
          },
        },

        include: {
          Hospital: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return ambulances;
};


// ======================================================
// GET AVAILABLE AMBULANCES
// ======================================================

export const getAvailableAmbulances = async () => {
  const ambulances =
    await prisma.ambulance.findMany({
      where: {
        status: "AVAILABLE",
      },

      orderBy: {
        lastUpdated: "desc",
      },

      include: {
        AmbulanceOperator: {
          include: {
            User: true,
          },
        },
      },
    });

  return ambulances;
};


// ======================================================
// GET SINGLE AMBULANCE
// ======================================================

export const getAmbulanceById = async (
  ambulanceId: string
) => {
  const ambulance =
    await prisma.ambulance.findUnique({
      where: {
        id: ambulanceId,
      },

      include: {
        AmbulanceOperator: {
          include: {
            User: true,
          },
        },

        EmergencyRequest: {
          include: {
            Hospital: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  return ambulance;
};


// ======================================================
// ASSIGN AMBULANCE TO EMERGENCY
// ======================================================

export const assignAmbulanceToEmergency = async (
  emergencyId: string,
  ambulanceId: string
) => {
  const emergency =
    await prisma.emergencyRequest.findUnique({
      where: {
        id: emergencyId,
      },

      include: {
        Hospital: true,

        PatientProfile: {
          include: {
            User: true,
          },
        },
      },
    });

  if (!emergency) {
    throw new Error(
      "Emergency request not found"
    );
  }

  if (!emergency.hospitalId) {
    throw new Error(
      "Hospital must be selected before assigning an ambulance"
    );
  }

  if (
    emergency.status !==
      "HOSPITAL_SELECTED" &&
    emergency.status !==
      "AMBULANCE_REQUESTED"
  ) {
    throw new Error(
      `Ambulance cannot be assigned when emergency status is ${emergency.status}`
    );
  }

  const ambulance =
    await prisma.ambulance.findUnique({
      where: {
        id: ambulanceId,
      },

      include: {
        AmbulanceOperator: {
          include: {
            User: true,
          },
        },
      },
    });

  if (!ambulance) {
    throw new Error(
      "Ambulance not found"
    );
  }

  if (
    ambulance.status !== "AVAILABLE"
  ) {
    throw new Error(
      `Ambulance is not available. Current status: ${ambulance.status}`
    );
  }

  const now = new Date();

  const result =
    await prisma.$transaction(
      async (tx) => {

        // ------------------------------------------
        // Update ambulance
        // ------------------------------------------

        const updatedAmbulance =
          await tx.ambulance.update({
            where: {
              id: ambulanceId,
            },

            data: {
              status: "ASSIGNED",
              currentEta: 15,
              lastUpdated: now,
            },
          });


        // ------------------------------------------
        // Update emergency
        // ------------------------------------------

        const updatedEmergency =
          await tx.emergencyRequest.update({
            where: {
              id: emergencyId,
            },

            data: {
              ambulanceId: ambulanceId,
              status:
                "AMBULANCE_ASSIGNED",
              destinationEta: 15,
              updatedAt: now,
            },

            include: {
              Hospital: true,
              Ambulance: true,
            },
          });


        // ------------------------------------------
        // Status history
        // ------------------------------------------

        await tx.emergencyStatusHistory.create({
          data: {
            id: crypto.randomUUID(),

            emergencyId:
              emergencyId,

            status:
              "AMBULANCE_ASSIGNED",

            note:
              `Ambulance ${ambulance.vehicleNumber} assigned`,

            createdAt: now,
          },
        });


        // ------------------------------------------
        // Hospital notification
        // ------------------------------------------

        if (emergency.hospitalId) {
          await tx.notification.create({
            data: {
              hospitalId:
                emergency.hospitalId,

              emergencyId:
                emergencyId,

              type: "AMBULANCE",

              title:
                "Ambulance Assigned",

              message:
                `Ambulance ${ambulance.vehicleNumber} has been assigned to the emergency.`,
            },
          });
        }


        // ------------------------------------------
        // Patient notification
        // ------------------------------------------

        if (
          emergency
            .PatientProfile
            ?.userId
        ) {
          await tx.notification.create({
            data: {
              userId:
                emergency.PatientProfile
                  .userId,

              emergencyId:
                emergencyId,

              type: "AMBULANCE",

              title:
                "Ambulance Assigned",

              message:
                `Ambulance ${ambulance.vehicleNumber} has been assigned to your emergency.`,
            },
          });
        }


        return {
          ambulance:
            updatedAmbulance,

          emergency:
            updatedEmergency,
        };
      }
    );


  // ------------------------------------------
  // Socket update
  // ------------------------------------------

  emitEmergencyUpdate(
    "emergency-updated",
    result.emergency
  );


  return result;
};


// ======================================================
// START AMBULANCE JOURNEY
// ======================================================

export const startAmbulanceJourney = async (
  emergencyId: string
) => {
  const emergency =
    await prisma.emergencyRequest.findUnique({
      where: {
        id: emergencyId,
      },

      include: {
        Ambulance: true,

        Hospital: true,

        PatientProfile: {
          include: {
            User: true,
          },
        },
      },
    });


  if (!emergency) {
    throw new Error(
      "Emergency request not found"
    );
  }


  if (!emergency.ambulanceId) {
    throw new Error(
      "No ambulance has been assigned to this emergency"
    );
  }


  if (
    emergency.status !==
    "AMBULANCE_ASSIGNED"
  ) {
    throw new Error(
      `Journey cannot start when emergency status is ${emergency.status}`
    );
  }


  if (!emergency.Ambulance) {
    throw new Error(
      "Assigned ambulance not found"
    );
  }


  const now = new Date();


  const result =
    await prisma.$transaction(
      async (tx) => {

        // ------------------------------------------
        // Ambulance -> EN_ROUTE
        // ------------------------------------------

        const updatedAmbulance =
          await tx.ambulance.update({
            where: {
              id:
                emergency.ambulanceId!,
            },

            data: {
              status: "EN_ROUTE",
              currentEta: 15,
              lastUpdated: now,
            },
          });


        // ------------------------------------------
        // Emergency -> EN_ROUTE
        // ------------------------------------------

        const updatedEmergency =
          await tx.emergencyRequest.update({
            where: {
              id: emergencyId,
            },

            data: {
              status: "EN_ROUTE",
              destinationEta: 15,
              updatedAt: now,
            },

            include: {
              Ambulance: true,
              Hospital: true,
            },
          });


        // ------------------------------------------
        // Status history
        // ------------------------------------------

        await tx.emergencyStatusHistory.create({
          data: {
            id: crypto.randomUUID(),

            emergencyId:
              emergencyId,

            status:
              "EN_ROUTE",

            note:
              "Ambulance journey started",

            createdAt: now,
          },
        });


        // ------------------------------------------
        // Hospital notification
        // ------------------------------------------

        if (emergency.hospitalId) {
          await tx.notification.create({
            data: {
              hospitalId:
                emergency.hospitalId,

              emergencyId:
                emergencyId,

              type: "AMBULANCE",

              title:
                "Ambulance En Route",

              message:
                "The assigned ambulance is now en route to the hospital.",
            },
          });
        }


        // ------------------------------------------
        // Patient notification
        // ------------------------------------------

        if (
          emergency
            .PatientProfile
            ?.userId
        ) {
          await tx.notification.create({
            data: {
              userId:
                emergency.PatientProfile
                  .userId,

              emergencyId:
                emergencyId,

              type: "AMBULANCE",

              title:
                "Ambulance En Route",

              message:
                "Your assigned ambulance is now on the way.",
            },
          });
        }


        return {
          ambulance:
            updatedAmbulance,

          emergency:
            updatedEmergency,
        };
      }
    );


  // ------------------------------------------
  // Socket update
  // ------------------------------------------

  emitEmergencyUpdate(
    "emergency-updated",
    result.emergency
  );


  // ------------------------------------------
  // Start simulated movement
  // ------------------------------------------

  startAutomaticAmbulanceMovement(
    emergencyId
  );


  return result;
};


// ======================================================
// ARRIVE AMBULANCE AT HOSPITAL
// ======================================================

export const arriveAmbulanceAtHospital =
  async (
    emergencyId: string
  ) => {

    const emergency =
      await prisma.emergencyRequest.findUnique({
        where: {
          id: emergencyId,
        },

        include: {
          Ambulance: true,

          Hospital: true,

          PatientProfile: {
            include: {
              User: true,
            },
          },
        },
      });


    if (!emergency) {
      throw new Error(
        "Emergency request not found"
      );
    }


    if (!emergency.ambulanceId) {
      throw new Error(
        "No ambulance assigned to this emergency"
      );
    }


    if (!emergency.Hospital) {
      throw new Error(
        "Hospital is not selected"
      );
    }


    if (
      emergency.status !==
        "EN_ROUTE" &&
      emergency.status !==
        "HOSPITAL_NOTIFIED"
    ) {
      throw new Error(
        `Ambulance cannot arrive when emergency status is ${emergency.status}`
      );
    }


    // ------------------------------------------
    // Stop movement
    // ------------------------------------------

    stopAutomaticAmbulanceMovement(
      emergencyId
    );


    const now = new Date();


    const result =
      await prisma.$transaction(
        async (tx) => {

          // ----------------------------------------
          // Ambulance -> AT_HOSPITAL
          // ----------------------------------------

          const updatedAmbulance =
            await tx.ambulance.update({
              where: {
                id:
                  emergency.ambulanceId!,
              },

              data: {
                status:
                  "AT_HOSPITAL",

                latitude:
                  emergency.Hospital!
                    .latitude,

                longitude:
                  emergency.Hospital!
                    .longitude,

                currentEta: 0,

                lastUpdated: now,
              },
            });


          // ----------------------------------------
          // Emergency -> ARRIVED
          // ----------------------------------------

          const updatedEmergency =
            await tx.emergencyRequest.update({
              where: {
                id: emergencyId,
              },

              data: {
                status: "ARRIVED",

                destinationEta: 0,

                updatedAt: now,
              },

              include: {
                Ambulance: true,
                Hospital: true,
              },
            });


          // ----------------------------------------
          // Status history
          // ----------------------------------------

          await tx.emergencyStatusHistory.create({
            data: {
              id: crypto.randomUUID(),

              emergencyId:
                emergencyId,

              status:
                "ARRIVED",

              note:
                "Ambulance arrived at hospital",

              createdAt: now,
            },
          });


          // ----------------------------------------
          // Hospital notification
          // ----------------------------------------

          if (emergency.hospitalId) {
            await tx.notification.create({
              data: {
                hospitalId:
                  emergency.hospitalId,

                emergencyId:
                  emergencyId,

                type: "AMBULANCE",

                title:
                  "Ambulance Arrived",

                message:
                  "The ambulance has arrived at the selected hospital.",
              },
            });
          }


          // ----------------------------------------
          // Patient notification
          // ----------------------------------------

          if (
            emergency
              .PatientProfile
              ?.userId
          ) {
            await tx.notification.create({
              data: {
                userId:
                  emergency.PatientProfile
                    .userId,

                emergencyId:
                  emergencyId,

                type: "AMBULANCE",

                title:
                  "Arrived at Hospital",

                message:
                  "The ambulance has arrived at the selected hospital.",
              },
            });
          }


          return {
            ambulance:
              updatedAmbulance,

            emergency:
              updatedEmergency,
          };
        }
      );


    // ------------------------------------------
    // Socket - ambulance location
    // ------------------------------------------

    emitAmbulanceLocationUpdate(
      "ambulance-location-updated",
      {
        ambulanceId:
          result.ambulance.id,

        latitude:
          result.ambulance.latitude,

        longitude:
          result.ambulance.longitude,

        currentEta:
          result.ambulance.currentEta,

        status:
          result.ambulance.status,
      }
    );


    // ------------------------------------------
    // Socket - emergency
    // ------------------------------------------

    emitEmergencyUpdate(
      "emergency-updated",
      result.emergency
    );


    return result;
  };


// ======================================================
// UPDATE AMBULANCE LOCATION
// ======================================================

export const updateAmbulanceLocation =
  async (
    ambulanceId: string,
    latitude: number,
    longitude: number
  ) => {

    // ------------------------------------------
    // Validate latitude
    // ------------------------------------------

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error(
        "Invalid latitude"
      );
    }


    // ------------------------------------------
    // Validate longitude
    // ------------------------------------------

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "Invalid longitude"
      );
    }


    // ------------------------------------------
    // Find ambulance
    // ------------------------------------------

    const ambulance =
      await prisma.ambulance.findUnique({
        where: {
          id: ambulanceId,
        },

        include: {
          EmergencyRequest: {
            where: {
              status: {
                in: [
                  "AMBULANCE_ASSIGNED",
                  "EN_ROUTE",
                  "HOSPITAL_NOTIFIED",
                ],
              },
            },

            include: {
              Hospital: true,
            },

            take: 1,
          },
        },
      });


    if (!ambulance) {
      throw new Error(
        "Ambulance not found"
      );
    }


    // ------------------------------------------
    // Update ambulance location
    // ------------------------------------------

    const updatedAmbulance =
      await prisma.ambulance.update({
        where: {
          id: ambulanceId,
        },

        data: {
          latitude,
          longitude,
          lastUpdated: new Date(),
        },
      });


    // ------------------------------------------
    // Socket - ambulance location
    // ------------------------------------------

    emitAmbulanceLocationUpdate(
      "ambulance-location-updated",
      {
        ambulanceId:
          updatedAmbulance.id,

        latitude:
          updatedAmbulance.latitude,

        longitude:
          updatedAmbulance.longitude,

        currentEta:
          updatedAmbulance.currentEta,

        status:
          updatedAmbulance.status,
      }
    );


    // ------------------------------------------
    // Find active emergency
    // ------------------------------------------

    const activeEmergency =
      ambulance.EmergencyRequest[0];


    if (activeEmergency) {

      const updatedEmergency =
        await prisma.emergencyRequest.update({
          where: {
            id: activeEmergency.id,
          },

          data: {
            updatedAt: new Date(),
          },

          include: {
            Ambulance: true,
            Hospital: true,
          },
        });


      // ----------------------------------------
      // Socket - emergency update
      // ----------------------------------------

      emitEmergencyUpdate(
        "emergency-updated",
        updatedEmergency
      );
    }


    return updatedAmbulance;
  };