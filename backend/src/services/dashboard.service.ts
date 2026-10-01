import prisma from "../config/db";

// ======================================================
// PATIENT DASHBOARD
// ======================================================

export const getPatientDashboard = async (
  userId: string
) => {
  const patientProfile =
    await prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!patientProfile) {
    throw new Error(
      "Patient profile not found"
    );
  }

  const emergencies =
    await prisma.emergencyRequest.findMany({
      where: {
        patientId: patientProfile.id,
      },
      include: {
        Hospital: true,
        Ambulance: true,
        EmergencyStatusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const activeEmergencies =
    emergencies.filter(
      (emergency) =>
        ![
          "COMPLETED",
          "CANCELLED",
        ].includes(emergency.status)
    );

  return {
    patient: {
      id: patientProfile.id,
      bloodGroup:
        patientProfile.bloodGroup,
      address:
        patientProfile.address,
    },
    totalEmergencies:
      emergencies.length,
    activeEmergencies:
      activeEmergencies.length,
    emergencies,
  };
};

// ======================================================
// HOSPITAL DASHBOARD
// ======================================================

export const getHospitalDashboard = async (
  userId: string
) => {
  const hospital =
    await prisma.hospital.findUnique({
      where: {
        userId,
      },
      include: {
        bloodInventory: true,
      },
    });

  if (!hospital) {
    throw new Error(
      "Hospital profile not found"
    );
  }

  const emergencies =
    await prisma.emergencyRequest.findMany({
      where: {
        hospitalId: hospital.id,
        status: {
          notIn: [
            "COMPLETED",
            "CANCELLED",
          ],
        },
      },
      include: {
        Ambulance: true,
        PatientProfile: {
          include: {
            User: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        EmergencyStatusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const notifications =
    await prisma.notification.findMany({
      where: {
        hospitalId: hospital.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

  return {
    hospital: {
      id: hospital.id,
      name: hospital.name,
      city: hospital.city,
      address: hospital.address,
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      status: hospital.status,
      emergencyDepartment:
        hospital.emergencyDepartment,
      icuBedsTotal:
        hospital.icuBedsTotal,
      icuBedsAvailable:
        hospital.icuBedsAvailable,
      generalBedsTotal:
        hospital.generalBedsTotal,
      generalBedsAvailable:
        hospital.generalBedsAvailable,
      lastUpdated:
        hospital.lastUpdated,
    },

    bloodInventory:
      hospital.bloodInventory,

    activeEmergencies:
      emergencies,

    activeEmergencyCount:
      emergencies.length,

    notifications,
  };
};

// ======================================================
// AMBULANCE DASHBOARD
// ======================================================

export const getAmbulanceDashboard = async (
  userId: string
) => {
  const operator =
    await prisma.ambulanceOperator.findUnique({
      where: {
        userId,
      },
      include: {
        Ambulance: true,
      },
    });

  if (!operator) {
    throw new Error(
      "Ambulance operator profile not found"
    );
  }

  const ambulanceIds =
    operator.Ambulance.map(
      (ambulance) => ambulance.id
    );

  const emergencies =
    await prisma.emergencyRequest.findMany({
      where: {
        ambulanceId: {
          in: ambulanceIds,
        },
        status: {
          notIn: [
            "COMPLETED",
            "CANCELLED",
          ],
        },
      },
      include: {
        Hospital: true,
        PatientProfile: {
          include: {
            User: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        EmergencyStatusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    operator: {
      id: operator.id,
      licenseNumber:
        operator.licenseNumber,
    },

    ambulances:
      operator.Ambulance,

    activeEmergencies:
      emergencies,

    activeEmergencyCount:
      emergencies.length,
  };
};

// ======================================================
// COORDINATOR DASHBOARD
// ======================================================

export const getCoordinatorDashboard =
  async () => {
    const activeEmergencies =
      await prisma.emergencyRequest.findMany({
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
          Ambulance: true,
          PatientProfile: {
            include: {
              User: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
          EmergencyStatusHistory: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const hospitals =
      await prisma.hospital.findMany({
        orderBy: {
          name: "asc",
        },
      });

    const ambulances =
      await prisma.ambulance.findMany({
        orderBy: {
          vehicleNumber: "asc",
        },
      });

    const availableAmbulances =
      ambulances.filter(
        (ambulance) =>
          ambulance.status ===
          "AVAILABLE"
      );

    const notifications =
      await prisma.notification.findMany({
        where: {
          isRead: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

    return {
      statistics: {
        activeEmergencies:
          activeEmergencies.length,

        criticalEmergencies:
          activeEmergencies.filter(
            (emergency) =>
              emergency.severity ===
              "CRITICAL"
          ).length,

        availableHospitals:
          hospitals.filter(
            (hospital) =>
              hospital.status ===
                "ACTIVE" &&
              hospital.emergencyDepartment ===
                "AVAILABLE"
          ).length,

        totalHospitals:
          hospitals.length,

        availableAmbulances:
          availableAmbulances.length,

        totalAmbulances:
          ambulances.length,
      },

      activeEmergencies,

      hospitals,

      ambulances,

      notifications,
    };
  };

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export const getAdminDashboard =
  async () => {
    const [
      totalUsers,
      activeUsers,
      totalHospitals,
      activeHospitals,
      totalAmbulances,
      availableAmbulances,
      totalEmergencies,
      activeEmergencies,
      completedEmergencies,
      cancelledEmergencies,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      prisma.hospital.count(),

      prisma.hospital.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.ambulance.count(),

      prisma.ambulance.count({
        where: {
          status: "AVAILABLE",
        },
      }),

      prisma.emergencyRequest.count(),

      prisma.emergencyRequest.count({
        where: {
          status: {
            notIn: [
              "COMPLETED",
              "CANCELLED",
            ],
          },
        },
      }),

      prisma.emergencyRequest.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.emergencyRequest.count({
        where: {
          status: "CANCELLED",
        },
      }),
    ]);

    const usersByRole =
      await prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      });

    const emergenciesBySeverity =
      await prisma.emergencyRequest.groupBy({
        by: ["severity"],
        _count: {
          id: true,
        },
      });

    const recentEmergencies =
      await prisma.emergencyRequest.findMany({
        include: {
          Hospital: true,
          Ambulance: true,
          PatientProfile: {
            include: {
              User: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

    return {
      statistics: {
        totalUsers,
        activeUsers,

        totalHospitals,
        activeHospitals,

        totalAmbulances,
        availableAmbulances,

        totalEmergencies,
        activeEmergencies,
        completedEmergencies,
        cancelledEmergencies,
      },

      usersByRole,

      emergenciesBySeverity,

      recentEmergencies,
    };
  };