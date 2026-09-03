// routes/users.ts
//
// Admin-only user management: create a new user (with a temporary
// password, since there's no email-invite system — see
// PROJECT_STATE.md Section 35D's zero-cost policy), list users in the
// organization, and update a user's capabilities/active status.
//
// Every route in this file requires the "admin" capability — that's
// enforced once, for the whole router, via requireCapability applied
// with router.use() below, rather than repeated on each route.

import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { hashPassword } from "../auth/passwords";
import { generateTemporaryPassword } from "../auth/tempPassword";
import { requireCapability } from "../auth/middleware";
import { CAPABILITIES } from "../auth/capabilities";
import { logger } from "../logger";

export const usersRouter = Router();

usersRouter.use(requireCapability(CAPABILITIES.ADMIN));

usersRouter.post("/", async (req: Request, res: Response) => {
  const { email, name, capabilities } = req.body ?? {};

  if (typeof email !== "string" || typeof name !== "string") {
    res.status(400).json({ error: "Email and name are required" });
    return;
  }
  if (capabilities !== undefined && !Array.isArray(capabilities)) {
    res.status(400).json({ error: "capabilities must be an array of strings" });
    return;
  }

  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ error: "A user with that email already exists" });
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      organizationId: req.user!.organizationId,
      email: normalizedEmail,
      name,
      passwordHash,
      capabilities: capabilities ?? [],
      mustChangePassword: true,
    },
  });

  logger.info({ userId: user.id, createdBy: req.user!.id }, "User created by admin");

  // This is the ONLY time the temporary password is ever available in
  // plaintext, anywhere — not stored, not logged, not retrievable
  // again after this response. The admin must relay it to the new
  // user directly (text, verbally, however) right now.
  res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    capabilities: user.capabilities,
    temporaryPassword,
  });
});

usersRouter.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { organizationId: req.user!.organizationId },
    select: {
      id: true,
      email: true,
      name: true,
      capabilities: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
});

usersRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { capabilities, isActive, name } = req.body ?? {};

  // Always scope by organizationId too, not just id — this is what
  // stops an admin from one organization editing a user that belongs
  // to a different one, consistent with the multi-tenant scoping
  // decision from Phase 0.
  const existing = await prisma.user.findFirst({
    where: { id, organizationId: req.user!.organizationId },
  });
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const data: { capabilities?: string[]; isActive?: boolean; name?: string } = {};
  if (capabilities !== undefined) {
    if (!Array.isArray(capabilities)) {
      res.status(400).json({ error: "capabilities must be an array of strings" });
      return;
    }
    data.capabilities = capabilities;
  }
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      res.status(400).json({ error: "isActive must be true or false" });
      return;
    }
    data.isActive = isActive;
  }
  if (name !== undefined) {
    if (typeof name !== "string") {
      res.status(400).json({ error: "name must be a string" });
      return;
    }
    data.name = name;
  }

  const updated = await prisma.user.update({ where: { id }, data });

  logger.info({ userId: id, updatedBy: req.user!.id, changes: Object.keys(data) }, "User updated by admin");

  res.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    capabilities: updated.capabilities,
    isActive: updated.isActive,
  });
});