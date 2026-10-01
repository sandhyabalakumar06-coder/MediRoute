import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo ambulance...");

  const existingAmbulance =
    await prisma.ambulance.findUnique({
      where: {
        vehicleNumber: "TN38-MR-001",
      },
    });

  if (existingAmbulance) {
    console.log(
      "Demo ambulance already exists."
    );
    console.log(existingAmbulance);
    return;
  }

  const ambulance =
    await prisma.ambulance.create({
      data: {
        id: crypto.randomUUID(),

        vehicleNumber:
          "TN38-MR-001",

        driverName:
          "Demo Ambulance Driver",

        phone:
          "9000000020",

        status:
          "AVAILABLE",

        latitude:
          11.0183,

        longitude:
          76.9674,

        currentEta:
          null,

        lastUpdated:
          new Date(),
      },
    });

  console.log(
    "Demo ambulance created successfully!"
  );

  console.log(ambulance);
}

main()
  .catch((error) => {
    console.error(
      "Demo ambulance creation failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });