// seed.ts
//
// Creates the very first Organization and the very first User, since
// Overwatch deliberately has no self-signup flow — technicians and
// staff are added by an admin, not by registering themselves (see
// PROJECT_STATE.md's deferred features list under the multi-tenant
// decision).
//
// This reads the admin's email/password/name from environment
// variables rather than hardcoding them, so no real credential ever
// lives in this file or in git. Run with: npm run prisma:seed
// (from the api workspace, or via the root-level script).

import "dotenv/config";
import { prisma } from "../src/db";
import { hashPassword } from "../src/auth/passwords";
import { MASTER_CAPABILITIES } from "../src/auth/capabilities";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME || "Admin";
  const orgName = process.env.SEED_ORG_NAME || "Default Organization";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in api/.env before seeding. " +
        "These are not committed anywhere — set them locally only for this one-time setup."
    );
  }

  // Reuse the organization if one already exists (e.g. re-running the
  // seed script shouldn't create a second one), otherwise create it.
  let organization = await prisma.organization.findFirst();
  if (!organization) {
    organization = await prisma.organization.create({ data: { name: orgName } });
    console.log(`Created organization: ${organization.name} (${organization.id})`);
  } else {
    console.log(`Using existing organization: ${organization.name} (${organization.id})`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
  if (existingUser) {
    console.log(`User ${adminEmail} already exists — skipping creation.`);
    return;
  }

  const passwordHash = await hashPassword(adminPassword);

  const user = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: adminName,
      capabilities: MASTER_CAPABILITIES,
    },
  });

  console.log(`Created admin user: ${user.email} (${user.id})`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });