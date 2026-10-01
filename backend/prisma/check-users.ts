import prisma from "../src/config/db";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  console.table(users);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });