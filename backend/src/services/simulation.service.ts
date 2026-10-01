import prisma from "../config/db";
import { emitEmergencyUpdate } from "../socket";

export const createDemoEmergency = async () => {
  // --------------------------------------------------
  // 1. Find demo patient
  // --------------------------------------------------
  const patient = await prisma.user.findUnique({
    where: {
      email: "patient@mediroute.demo",
    },
    include: {
      PatientProfile: true,
    },
  });

  if (!patient || !patient.PatientProfile) {
    throw new Error(
      "Demo patient account/profile not found"
    );
  }

  // --------------------------------------------------
  // 2. Find demo coordinator
  // --------------------------------------------------
  const coordinator = await prisma.user.findUnique({
    where: {
      email: "coordinator@mediroute.demo",
    },
  });

  if (!coordinator) {
    throw new Error(
      "Demo coordinator account not found"
    );
  }

  // --------------------------------------------------
  // 3. Find an active hospital
  // --------------------------------------------------
  const hospital = await prisma.hospital.findFirst({
    where: {
      status: "ACTIVE",
      emergencyDepartment: {
        not: "CLOSED",
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!hospital) {
    throw new Error(
      "No active hospital available"
    );
  }

  // --------------------------------------------------
  // 4. Find an available ambulance
  // --------------------------------------------------
  const ambulance = await prisma.ambulance.findFirst({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      vehicleNumber: "asc",
    },
  });

  if (!ambulance) {
    throw new Error(
      "No available ambulance found"
    );
  }

  // --------------------------------------------------
  // 5. Create emergency
  // --------------------------------------------------
  const emergency = await prisma.emergencyRequest.create({
    data: {
      id: crypto.randomUUID(),

      patientId:
        patient.PatientProfile.id,

      coordinatorId:
        coordinator.id,

      hospitalId:
        hospital.id,

      severity: "HIGH",

      description:
        "Demo emergency created for MediRoute end-to-end simulation.",

      requiredDepartment:
        "Emergency",

      requiredBloodGroup:
        "O_POSITIVE",

      pickupAddress:
        "Gandhipuram, Coimbatore",

      pickupLatitude:
        11.0183,

      pickupLongitude:
        76.9674,

      status:
        "HOSPITAL_SELECTED",

      updatedAt:
        new Date(),
    },
  });

  // --------------------------------------------------
  // 6. Emergency CREATED history
  // --------------------------------------------------
  await prisma.emergencyStatusHistory.create({
    data: {
      id: crypto.randomUUID(),

      emergencyId:
        emergency.id,

      status:
        "CREATED",

      note:
        "Demo emergency created.",
    },
  });

  // --------------------------------------------------
  // 7. Hospital selected history
  // --------------------------------------------------
  await prisma.emergencyStatusHistory.create({
    data: {
      id: crypto.randomUUID(),

      emergencyId:
        emergency.id,

      status:
        "HOSPITAL_SELECTED",

      note:
        `Demo hospital selected: ${hospital.name}`,
    },
  });

  // --------------------------------------------------
  // 8. Assign ambulance to emergency
  // --------------------------------------------------
  const updatedEmergency =
    await prisma.emergencyRequest.update({
      where: {
        id: emergency.id,
      },

      data: {
        ambulanceId:
          ambulance.id,

        status:
          "AMBULANCE_ASSIGNED",

        updatedAt:
          new Date(),
      },
    });

  // --------------------------------------------------
  // 9. Update ambulance
  //
  // IMPORTANT:
  // Your actual Prisma Ambulance model uses:
  // latitude
  // longitude
  //
  // It does NOT use:
  // currentLatitude
  // currentLongitude
  // currentEmergencyId
  // --------------------------------------------------
  await prisma.ambulance.update({
    where: {
      id: ambulance.id,
    },

    data: {
      status:
        "ASSIGNED",

      latitude:
        11.0200,

      longitude:
        76.9690,

      lastUpdated:
        new Date(),
    },
  });

  // --------------------------------------------------
  // 10. Ambulance assigned history
  // --------------------------------------------------
  await prisma.emergencyStatusHistory.create({
    data: {
      id: crypto.randomUUID(),

      emergencyId:
        emergency.id,

      status:
        "AMBULANCE_ASSIGNED",

      note:
        `Ambulance assigned: ${ambulance.vehicleNumber}`,
    },
  });

  // --------------------------------------------------
  // 11. Notify hospital
  // --------------------------------------------------
  await prisma.notification.create({
    data: {
      hospitalId:
        hospital.id,

      emergencyId:
        emergency.id,

      type:
        "AMBULANCE",

      title:
        "New Demo Emergency",

      message:
        `Demo emergency assigned to ${hospital.name}. Ambulance ${ambulance.vehicleNumber} is preparing for departure.`,
    },
  });

  // --------------------------------------------------
  // 12. Send real-time update
  // --------------------------------------------------
  emitEmergencyUpdate(
    emergency.id,
    updatedEmergency
  );

  // --------------------------------------------------
  // 13. Return demo data
  // --------------------------------------------------
  return {
    emergency:
      updatedEmergency,

    hospital:
      hospital,

    ambulance:
      {
        ...ambulance,

        status:
          "ASSIGNED",

        latitude:
          11.0200,

        longitude:
          76.9690,
      },

    patient: {
      id:
        patient.id,

      name:
        patient.name,

      email:
        patient.email,
    },
  };
};