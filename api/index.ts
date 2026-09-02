// index.ts (Vercel entrypoint — NOT the same file as src/index.ts)
//
// Vercel automatically treats any file directly inside an /api folder
// as a serverless function. This file is that entrypoint for
// PRODUCTION only.
//
// It is intentionally almost empty. Every real route and every piece of
// middleware lives in src/app.ts and is shared with local dev
// (src/index.ts, which calls app.listen() instead). This file's only
// job is to hand our Express app to Vercel's Node.js runtime.
//
// This works with no extra wrapper because Vercel's runtime expects a
// function of (req, res) — and an Express app returned by express() IS
// exactly that kind of function, so we can export it directly.
//
// NOTE: we have not yet performed a real deployment to verify this end
// to end (that happens as part of Phase 1's "Deployment foundation"
// build item). Local dev (src/index.ts) is fully verified; this file
// is the production counterpart and should be treated as unverified
// until we deploy and check it.

import { createApp } from "./src/app";

export default createApp();
