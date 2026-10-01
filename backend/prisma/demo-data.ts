import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hospitals = [
  {
    name: "Coimbatore City Emergency Hospital",
    registrationNumber: "MEDI-COI-001",
    phone: "0422-4001001",
    email: "emergency@coimbatorecity.demo",
    address: "Avinashi Road",
    city: "Coimbatore",
    latitude: 11.0168,
    longitude: 76.9558,
    emergencyDepartment: "AVAILABLE" as const,
    icuBedsTotal: 20,
    icuBedsAvailable: 12,
    generalBedsTotal: 100,
    generalBedsAvailable: 65,
  },

  {
    name: "Kovai Medical Emergency Center",
    registrationNumber: "MEDI-COI-002",
    phone: "0422-4001002",
    email: "emergency@kovaicenter.demo",
    address: "Trichy Road",
    city: "Coimbatore",
    latitude: 10.997,
    longitude: 76.968,
    emergencyDepartment: "BUSY" as const,
    icuBedsTotal: 15,
    icuBedsAvailable: 5,
    generalBedsTotal: 80,
    generalBedsAvailable: 25,
  },

  {
    name: "Gandhipuram Emergency Hospital",
    registrationNumber: "MEDI-COI-003",
    phone: "0422-4001003",
    email: "emergency@gandhipuram.demo",
    address: "Gandhipuram",
    city: "Coimbatore",
    latitude: 11.0183,
    longitude: 76.9674,
    emergencyDepartment: "AVAILABLE" as const,
    icuBedsTotal: 25,
    icuBedsAvailable: 18,
    generalBedsTotal: 120,
    generalBedsAvailable: 80,
  },
];

async function main() {
  console.log("Creating demo hospitals...");

  for (const hospital of hospitals) {
    const existingHospital =
      await prisma.hospital.findUnique({
        where: {
          registrationNumber:
            hospital.registrationNumber,
        },
      });

    if (existingHospital) {
      console.log(
        `Hospital already exists: ${hospital.name}`
      );
      continue;
    }

    await prisma.hospital.create({
      data: {
        ...hospital,
        lastUpdated: new Date(),
      },
    });

    console.log(
      `Created hospital: ${hospital.name}`
    );
  }

  console.log("Demo hospitals completed.");
}

main()
  .catch((error) => {
    console.error(
      "Demo data error:",
      error
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });