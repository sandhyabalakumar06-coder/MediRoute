import prisma from "../config/db";

// ======================================================
// GET HOSPITAL BLOOD INVENTORY
// ======================================================

export const getHospitalBloodInventory = async (
  hospitalId: string
) => {
  const hospital = await prisma.hospital.findUnique({
    where: {
      id: hospitalId,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const inventory = await prisma.bloodInventory.findMany({
    where: {
      hospitalId,
    },
    orderBy: {
      bloodGroup: "asc",
    },
  });

  return inventory;
};

// ======================================================
// UPDATE BLOOD INVENTORY
// ======================================================

export const updateBloodInventory = async (
  hospitalId: string,
  bloodGroup:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE",
  units: number
) => {
  const hospital = await prisma.hospital.findUnique({
    where: {
      id: hospitalId,
    },
  });

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  if (units < 0) {
    throw new Error(
      "Blood units cannot be negative"
    );
  }

  const inventory =
    await prisma.bloodInventory.upsert({
      where: {
        hospitalId_bloodGroup: {
          hospitalId,
          bloodGroup,
        },
      },
      update: {
        units,
        lastUpdated: new Date(),
      },
      create: {
        hospitalId,
        bloodGroup,
        units,
        lastUpdated: new Date(),
      },
    });

  return inventory;
};

// ======================================================
// GET BLOOD AVAILABILITY SUMMARY
// ======================================================

export const getBloodAvailabilitySummary = async (
  hospitalId: string
) => {
  const inventory =
    await getHospitalBloodInventory(
      hospitalId
    );

  return inventory.map((item) => ({
    bloodGroup: item.bloodGroup,
    units: item.units,
    available: item.units > 0,
    lastUpdated: item.lastUpdated,
  }));
};