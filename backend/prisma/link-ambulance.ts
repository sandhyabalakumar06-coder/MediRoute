import prisma from "../src/config/db";

async function main() {
  const userId = "cmukt9gwl0002tkv0cl5rfm3i";

  const operator = await prisma.ambulanceOperator.upsert({
    where: {
      userId,
    },
    update: {},
    create: {
      id: crypto.randomUUID(),
      userId,
      licenseNumber: "TN-AMB-DEMO-001",
      updatedAt: new Date(),
    },
  });

  const ambulance = await prisma.ambulance.update({
    where: {
      id: "024046c1-d752-4368-b06a-c962adc6b0fb",
    },
    data: {
      operatorId: operator.id,
    },
  });

  console.log("✅ Ambulance operator linked successfully!");

  console.log({
    operatorId: operator.id,
    userId: operator.userId,
    ambulanceId: ambulance.id,
    vehicleNumber: ambulance.vehicleNumber,
  });
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });