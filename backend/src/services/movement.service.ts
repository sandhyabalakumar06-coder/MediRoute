import prisma from "../config/db";
import {
  emitAmbulanceLocationUpdate,
  emitEmergencyUpdate,
} from "../socket";

// ============================================================
// DEMO ROUTE
// Gandhipuram pickup → Green Valley Medical Center
// ============================================================

const DEMO_ROUTE = [
  {
    latitude: 11.0200,
    longitude: 76.9690,
  },
  {
    latitude: 11.0196,
    longitude: 76.9696,
  },
  {
    latitude: 11.0192,
    longitude: 76.9702,
  },
  {
    latitude: 11.0189,
    longitude: 76.9708,
  },
  {
    latitude: 11.0187,
    longitude: 76.9714,
  },
  {
    latitude: 11.0185,
    longitude: 76.9719,
  },
  {
    latitude: 11.0183,
    longitude: 76.9725,
  },
];

// Keep track of running simulations
const activeMovements =
  new Map<string, NodeJS.Timeout>();

// ============================================================
// START AUTOMATIC MOVEMENT
// ============================================================

export const startAutomaticAmbulanceMovement =
  async (
    emergencyId: string
  ) => {
    // Prevent duplicate movement
    if (
      activeMovements.has(
        emergencyId
      )
    ) {
      console.log(
        `Movement already running for emergency ${emergencyId}`
      );

      return;
    }

    const emergency =
      await prisma.emergencyRequest.findUnique(
        {
          where: {
            id: emergencyId,
          },
          include: {
            Ambulance: true,
            Hospital: true,
          },
        }
      );

    if (!emergency) {
      throw new Error(
        "Emergency not found"
      );
    }

    if (!emergency.Ambulance) {
      throw new Error(
        "No ambulance assigned"
      );
    }

    if (!emergency.Hospital) {
      throw new Error(
        "No hospital selected"
      );
    }

    if (
      emergency.status !==
        "EN_ROUTE" &&
      emergency.status !==
        "HOSPITAL_NOTIFIED"
    ) {
      throw new Error(
        `Ambulance movement cannot start from ${emergency.status}`
      );
    }

    console.log(
      `🚑 Starting automatic movement for ${emergencyId}`
    );

    let currentStep = 0;

    // ----------------------------------------------------------
    // Set initial position
    // ----------------------------------------------------------

    await updateMovementPosition(
      emergencyId,
      currentStep
    );

    currentStep++;

    // ----------------------------------------------------------
    // Move ambulance every 3 seconds
    // ----------------------------------------------------------

    const timer =
      setInterval(async () => {
        try {
          // ----------------------------------------------------
          // Route completed
          // ----------------------------------------------------

          if (
            currentStep >=
            DEMO_ROUTE.length
          ) {
            clearInterval(timer);

            activeMovements.delete(
              emergencyId
            );

            await finishMovement(
              emergencyId
            );

            console.log(
              `🏥 Ambulance reached hospital for ${emergencyId}`
            );

            return;
          }

          // ----------------------------------------------------
          // Update current location
          // ----------------------------------------------------

          await updateMovementPosition(
            emergencyId,
            currentStep
          );

          currentStep++;
        } catch (error) {
          console.error(
            "Automatic movement error:",
            error
          );

          clearInterval(timer);

          activeMovements.delete(
            emergencyId
          );
        }
      }, 3000);

    activeMovements.set(
      emergencyId,
      timer
    );
  };

// ============================================================
// UPDATE MOVEMENT POSITION
// ============================================================

const updateMovementPosition =
  async (
    emergencyId: string,
    step: number
  ) => {
    const emergency =
      await prisma.emergencyRequest.findUnique(
        {
          where: {
            id: emergencyId,
          },
          include: {
            Ambulance: true,
            Hospital: true,
          },
        }
      );

    if (!emergency) {
      throw new Error(
        "Emergency not found"
      );
    }

    if (!emergency.Ambulance) {
      throw new Error(
        "Ambulance not found"
      );
    }

    const position =
      DEMO_ROUTE[step];

    if (!position) {
      return;
    }

    // ----------------------------------------------------------
    // Calculate remaining ETA
    // ----------------------------------------------------------

    const remainingSteps =
      DEMO_ROUTE.length -
      step -
      1;

    const eta =
      Math.max(
        remainingSteps * 1,
        0
      );

    // ----------------------------------------------------------
    // Update ambulance database
    // ----------------------------------------------------------

    const ambulance =
      await prisma.ambulance.update(
        {
          where: {
            id: emergency.Ambulance.id,
          },
          data: {
            latitude:
              position.latitude,

            longitude:
              position.longitude,

            currentEta: eta,

            status: "EN_ROUTE",

            lastUpdated:
              new Date(),
          },
        }
      );

    // ----------------------------------------------------------
    // Update emergency ETA
    // ----------------------------------------------------------

    const updatedEmergency =
      await prisma.emergencyRequest.update(
        {
          where: {
            id: emergencyId,
          },
          data: {
            destinationEta: eta,

            status: "EN_ROUTE",

            updatedAt:
              new Date(),
          },
        }
      );

    // ----------------------------------------------------------
    // Send ambulance location
    // through Socket.IO
    // ----------------------------------------------------------

    emitAmbulanceLocationUpdate(
      emergencyId,
      {
        ambulanceId:
          ambulance.id,

        latitude:
          ambulance.latitude,

        longitude:
          ambulance.longitude,

        currentEta:
          ambulance.currentEta,

        status:
          ambulance.status,

        timestamp:
          ambulance.lastUpdated,
      }
    );

    // ----------------------------------------------------------
    // Send complete emergency update
    // ----------------------------------------------------------

    emitEmergencyUpdate(
      emergencyId,
      {
        emergency:
          updatedEmergency,

        ambulance,
      }
    );

    console.log(
      `🚑 ${ambulance.vehicleNumber} → ${ambulance.latitude}, ${ambulance.longitude} | ETA: ${eta} min`
    );
  };

// ============================================================
// FINISH MOVEMENT
// ============================================================

const finishMovement =
  async (
    emergencyId: string
  ) => {
    const emergency =
      await prisma.emergencyRequest.findUnique(
        {
          where: {
            id: emergencyId,
          },
          include: {
            Ambulance: true,
            Hospital: true,
          },
        }
      );

    if (!emergency) {
      return;
    }

    if (!emergency.Ambulance) {
      return;
    }

    // ----------------------------------------------------------
    // Update ambulance
    // ----------------------------------------------------------

    const ambulance =
      await prisma.ambulance.update(
        {
          where: {
            id: emergency.Ambulance.id,
          },
          data: {
            latitude:
              emergency.Hospital
                ?.latitude ??
              emergency.Ambulance
                .latitude,

            longitude:
              emergency.Hospital
                ?.longitude ??
              emergency.Ambulance
                .longitude,

            currentEta: 0,

            status:
              "AT_HOSPITAL",

            lastUpdated:
              new Date(),
          },
        }
      );

    // ----------------------------------------------------------
    // Update emergency
    // ----------------------------------------------------------

    const updatedEmergency =
      await prisma.emergencyRequest.update(
        {
          where: {
            id: emergencyId,
          },
          data: {
            status: "ARRIVED",

            destinationEta: 0,

            updatedAt:
              new Date(),
          },
        }
      );

    // ----------------------------------------------------------
    // Status history
    // ----------------------------------------------------------

    await prisma.emergencyStatusHistory.create(
      {
        data: {
          id: crypto.randomUUID(),

          emergencyId,

          status: "ARRIVED",

          note:
            `Ambulance ${ambulance.vehicleNumber} automatically arrived at ${emergency.Hospital?.name || "hospital"}.`,
        },
      }
    );

    // ----------------------------------------------------------
    // Hospital notification
    // ----------------------------------------------------------

    if (emergency.Hospital) {
      await prisma.notification.create(
        {
          data: {
            hospitalId:
              emergency.Hospital.id,

            emergencyId,

            type: "AMBULANCE",

            title:
              "Ambulance Arrived",

            message:
              `Ambulance ${ambulance.vehicleNumber} has arrived at ${emergency.Hospital.name}.`,
          },
        }
      );
    }

    // ----------------------------------------------------------
    // Real-time update
    // ----------------------------------------------------------

    emitAmbulanceLocationUpdate(
      emergencyId,
      {
        ambulanceId:
          ambulance.id,

        latitude:
          ambulance.latitude,

        longitude:
          ambulance.longitude,

        currentEta: 0,

        status:
          "AT_HOSPITAL",

        timestamp:
          ambulance.lastUpdated,
      }
    );

    emitEmergencyUpdate(
      emergencyId,
      {
        emergency:
          updatedEmergency,

        ambulance,
      }
    );

    console.log(
      `🏥 Emergency ${emergencyId} completed ambulance journey`
    );
  };

// ============================================================
// STOP MOVEMENT
// ============================================================

export const stopAutomaticAmbulanceMovement =
  (
    emergencyId: string
  ) => {
    const timer =
      activeMovements.get(
        emergencyId
      );

    if (timer) {
      clearInterval(timer);

      activeMovements.delete(
        emergencyId
      );

      console.log(
        `🛑 Ambulance movement stopped for ${emergencyId}`
      );
    }
  };