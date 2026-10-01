import prisma from "../src/config/db";

async function main() {
  const hospital = await prisma.hospital.update({
    where: {
      id: "cmuktfsk90001tkr0ajp8g2gj",
    },
    data: {
      userId: "cmukt9gwg0001tkv09ovki6so",
    },
  });

  console.log("Hospital linked successfully!");
  console.log({
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    userId: hospital.userId,
  });
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });