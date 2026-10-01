import prisma from "../config/db";

interface CreateEmergencyData {
  patientId: string;

  severity?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  description?: string;

  requiredDepartment?: string;

  pickupAddress: string;

  pickupLatitude: number;

  pickupLongitude: number;

  requiredBloodGroup?:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE";
}

/**
 * Create a new emergency request
 */
export const createEmergency = async (
  data: CreateEmergencyData
) => {
  // Find PatientProfile using logged-in User ID
  const patientProfile =
    await prisma.patientProfile.findUnique({
      where: {
        userId: data.patientId,
      },
    });

  if (!patientProfile) {
    throw new Error(
      "Patient profile not found. Please create a patient profile first."
    );
  }

  // Create emergency
  const emergency =
    await prisma.emergencyRequest.create({
      data: {
        id: crypto.randomUUID(),

        // IMPORTANT:
        // EmergencyRequest.patientId expects PatientProfile.id
        patientId: patientProfile.id,

        severity:
          data.severity || "MEDIUM",

        description:
          data.description,

        requiredDepartment:
          data.requiredDepartment,

        requiredBloodGroup:
          data.requiredBloodGroup,

        pickupAddress:
          data.pickupAddress,

        pickupLatitude:
          data.pickupLatitude,

        pickupLongitude:
          data.pickupLongitude,

        status: "CREATED",

        updatedAt: new Date(),
      },
    });

  // Create first status history
  await prisma.emergencyStatusHistory.create({
    data: {
      id: crypto.randomUUID(),

      emergencyId:
        emergency.id,

      status: "CREATED",

      note:
        "Emergency request created",
    },
  });

  return emergency;
};

/**
 * Get emergency by ID
 */
export const getEmergencyById = async (
  id: string
) => {
  return prisma.emergencyRequest.findUnique({
    where: {
      id,
    },

    include: {
      EmergencyStatusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },

      Hospital: true,

      Ambulance: true,

      notifications: true,
    },
  });
};

/**
 * Get all emergencies belonging to logged-in patient
 */
export const getPatientEmergencies = async (
  userId: string
) => {
  // Find PatientProfile using User ID
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

  return prisma.emergencyRequest.findMany({
    where: {
      patientId:
        patientProfile.id,
    },

    include: {
      Hospital: true,

      Ambulance: true,

      EmergencyStatusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },

      notifications: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Select a hospital for an emergency
 */
export const selectHospitalForEmergency =
  async (
    emergencyId: string,
    hospitalId: string,
    coordinatorId?: string
  ) => {
    // Check emergency
    const emergency =
      await prisma.emergencyRequest.findUnique({
        where: {
          id: emergencyId,
        },
      });

    if (!emergency) {
      throw new Error(
        "Emergency request not found"
      );
    }

    // Check hospital
    const hospital =
      await prisma.hospital.findUnique({
        where: {
          id: hospitalId,
        },
      });

    if (!hospital) {
      throw new Error(
        "Hospital not found"
      );
    }

    // Make sure hospital is active
    if (hospital.status !== "ACTIVE") {
      throw new Error(
        "Selected hospital is not currently active"
      );
    }

    // Update emergency
    const updatedEmergency =
      await prisma.emergencyRequest.update({
        where: {
          id: emergencyId,
        },

        data: {
          hospitalId:
            hospital.id,

          coordinatorId:
            coordinatorId ||
            undefined,

          status:
            "HOSPITAL_SELECTED",

          updatedAt: new Date(),
        },
      });

    // Add status history
    await prisma.emergencyStatusHistory.create({
      data: {
        id: crypto.randomUUID(),

        emergencyId:
          emergencyId,

        status:
          "HOSPITAL_SELECTED",

        note:
          `Hospital selected: ${hospital.name}`,
      },
    });

    return updatedEmergency;
  };