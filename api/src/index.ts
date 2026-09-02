// index.ts
//
// This is what actually runs when you do `npm run dev` in the api
// workspace (or `npm run dev` at the repo root, which runs both
// workspaces together). It's the ONLY file that calls app.listen() —
// see app.ts for why that separation exists.

import "dotenv/config"; // loads variables from .env into process.env before anything else runs
import { createApp } from "./app";

const app = createApp();

// PORT comes from the environment so it's configurable per-environment
// without touching code (a real deployment might set this differently).
// 3001 is the local default, chosen to avoid colliding with Vite's
// default frontend port (5173).
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`Overwatch API listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
