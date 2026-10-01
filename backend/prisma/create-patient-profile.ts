import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo patient profile...");

  const patient = await prisma.user.findUnique({
    where: {
      email: "patient@mediroute.demo",
    },
  });

  if (!patient) {
    throw new Error(
      "Demo patient user not found. Please run the seed first."
    );
  }

  console.log("Demo patient found:", patient.email);

  const existingProfile =
    await prisma.patientProfile.findUnique({
      where: {
        userId: patient.id,
      },
    });

  if (existingProfile) {
    console.log("Patient profile already exists.");
    console.log(existingProfile);
    return;
  }

  const profile =
    await prisma.patientProfile.create({
      data: {
        id: crypto.randomUUID(),

        userId: patient.id,

        bloodGroup: "O_POSITIVE",

        address:
          "Gandhipuram, Coimbatore",

        latitude: 11.0183,

        longitude: 76.9674,

        emergencyContactName:
          "Demo Emergency Contact",

        emergencyContactPhone:
          "9000000010",

        updatedAt: new Date(),
      },
    });

  console.log(
    "Patient profile created successfully!"
  );

  console.log(profile);
}

main()
  .catch((error) => {
    console.error(
      "Patient profile creation failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });