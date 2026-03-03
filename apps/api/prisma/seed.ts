import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/utils/password.js";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://localhost:5432/galileo_dev";

async function main() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // Create test brand
    const brand = await prisma.brand.upsert({
      where: { slug: "galileo-luxe" },
      update: {},
      create: {
        name: "Galileo Luxe",
        slug: "galileo-luxe",
        did: "did:galileo:brand:galileo-luxe",
      },
    });

    console.log(`Brand created: ${brand.id}`);

    // Create test admin user
    const passwordHash = await hashPassword("changeme123");

    const admin = await prisma.user.upsert({
      where: { email: "admin@galileo.test" },
      update: {},
      create: {
        email: "admin@galileo.test",
        passwordHash,
        role: "BRAND_ADMIN",
        brandId: brand.id,
      },
    });

    console.log(`Admin user created: ${admin.id}`);

    console.log("Seed completed successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
