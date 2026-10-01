import prisma from "../src/config/db";

async function main() {
  const ambulance = await prisma.ambulance.findUnique({
    where: {
      id: "024046c1-d752-4368-b06a-c962adc6b0fb",
    },
  });

  if (!ambulance) {
    throw new Error("Demo ambulance not found");
  }

  await prisma.ambulance.update({
    where: {
      id: ambulance.id,
    },
    data: {
      status: "AVAILABLE",
    },
  });

  console.log("=================================");
  console.log("Demo ambulance reset successfully");
  console.log("Vehicle:", ambulance.vehicleNumber);
  console.log("Status: AVAILABLE");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("Reset failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });