/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const { createCardPin } = require("../src/utils/cardGenerator");

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  const company = await prisma.company.create({
    data: {
      name: "TestCO",
    },
  });
  console.log(`Created company with id: ${company.id}`);

  const apiKey = await prisma.apiKey.create({
    data: {
      key: "test-api-key",
      companyId: company.id,
    },
  });
  console.log(`Created api key with id: ${apiKey.id}`);
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
