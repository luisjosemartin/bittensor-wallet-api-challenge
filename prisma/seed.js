/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();

function generateRandomPart() {
  const keyBytes = crypto.randomBytes(32);
  return keyBytes.toString('base64url');
}

async function main() {
  console.log(`Start seeding ...`);

  // Create a default API key for development/testing
  const randomPart = generateRandomPart();
  const keyHash = await bcrypt.hash(randomPart, 10);
  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash: keyHash,
      name: "Development API Key",
      scopes: ["WALLET_READ", "WALLET_CREATE", "WALLET_TRANSFER"],
      isActive: true,
    },
  });

  const fullApiKey = `ak.${apiKey.id}.${randomPart}`;
  console.log(`Created API Key with id: ${apiKey.id}`);
  console.log(`Full API Key: ${fullApiKey}`);
  console.log(`⚠️  Save this API key - it won't be shown again!`);

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
