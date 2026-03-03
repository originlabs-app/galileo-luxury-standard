import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/utils/password.js";

// Production guard: require SEED_PASSWORD to prevent accidental seeding
if (process.env.NODE_ENV === "production") {
  if (!process.env.SEED_PASSWORD) {
    console.error(
      "❌ SEED_PASSWORD environment variable is required when NODE_ENV=production. " +
        "Set SEED_PASSWORD to confirm you intend to seed a production database.",
    );
    process.exit(1);
  }
}

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
      update: { role: "ADMIN" },
      create: {
        email: "admin@galileo.test",
        passwordHash,
        role: "ADMIN",
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
