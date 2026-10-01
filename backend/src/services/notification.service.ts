import prisma from "../config/db";

// ======================================================
// CREATE NOTIFICATION
// ======================================================

export const createNotification = async (
  data: {
    userId?: string;
    hospitalId?: string;
    emergencyId?: string;
    type:
      | "EMERGENCY"
      | "AMBULANCE"
      | "HOSPITAL"
      | "SYSTEM";
    title: string;
    message: string;
  }
) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      hospitalId: data.hospitalId,
      emergencyId: data.emergencyId,
      type: data.type,
      title: data.title,
      message: data.message,
    },
  });
};

// ======================================================
// GET HOSPITAL NOTIFICATIONS
// ======================================================

export const getHospitalNotifications = async (
  hospitalId: string
) => {
  return prisma.notification.findMany({
    where: {
      hospitalId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

export const getUserNotifications = async (
  userId: string
) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// ======================================================
// NOTIFY HOSPITAL FOR EMERGENCY
// ======================================================

export const notifyHospitalForEmergency = async (
  emergencyId: string
) => {
  // --------------------------------------------------
  // 1. Get emergency with hospital + ambulance
  // --------------------------------------------------

  const emergency =
    await prisma.emergencyRequest.findUnique({
      where: {
        id: emergencyId,
      },
      include: {
        Hospital: true,
        Ambulance: true,
      },
    });

  // --------------------------------------------------
  // 2. Check emergency exists
  // --------------------------------------------------

  if (!emergency) {
    throw new Error(
      "Emergency request not found"
    );
  }

  // --------------------------------------------------
  // 3. Check hospital exists
  // --------------------------------------------------

  if (
    !emergency.hospitalId ||
    !emergency.Hospital
  ) {
    throw new Error(
      "No hospital has been selected for this emergency"
    );
  }

  // --------------------------------------------------
  // 4. Check ambulance exists
  // --------------------------------------------------

  if (
    !emergency.ambulanceId ||
    !emergency.Ambulance
  ) {
    throw new Error(
      "No ambulance has been assigned to this emergency"
    );
  }

  // --------------------------------------------------
  // 5. Emergency must be EN_ROUTE
  // --------------------------------------------------

  if (
    emergency.status !== "EN_ROUTE"
  ) {
    throw new Error(
      `Emergency must be EN_ROUTE before hospital notification. Current status: ${emergency.status}`
    );
  }

  // --------------------------------------------------
  // 6. Get hospital and ambulance
  // --------------------------------------------------

  const hospital =
    emergency.Hospital;

  const ambulance =
    emergency.Ambulance;

  // --------------------------------------------------
  // 7. Create notification
  // --------------------------------------------------

  const notification =
    await prisma.notification.create({
      data: {
        hospitalId:
          hospital.id,

        emergencyId:
          emergency.id,

        type:
          "AMBULANCE",

        title:
          "Incoming Emergency Ambulance",

        message:
          `Ambulance ${ambulance.vehicleNumber} is approaching ${hospital.name}. ETA: ${ambulance.currentEta ?? 15} minutes.`,
      },
    });

  // --------------------------------------------------
  // 8. Update emergency status
  // --------------------------------------------------

  const updatedEmergency =
    await prisma.emergencyRequest.update({
      where: {
        id: emergency.id,
      },

      data: {
        status:
          "HOSPITAL_NOTIFIED",

        updatedAt:
          new Date(),
      },
    });

  // --------------------------------------------------
  // 9. Add status history
  // --------------------------------------------------

  await prisma.emergencyStatusHistory.create({
    data: {
      id:
        crypto.randomUUID(),

      emergencyId:
        emergency.id,

      status:
        "HOSPITAL_NOTIFIED",

      note:
        `Hospital notified: ${hospital.name}`,
    },
  });

  // --------------------------------------------------
  // 10. Return result
  // --------------------------------------------------

  return {
    notification,
    emergency:
      updatedEmergency,
  };
};