# FileZone

Free browser-based file management toolkit — PDFs, images, converters, calculators, and text tools, all processed locally in the browser with no uploads.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/filezone run dev` — run the frontend (port 21727)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 (port 21727)
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/filezone/src/pages/ToolPage.tsx` — all tool implementations + TOOL_COMPONENTS registry + NO_DONE_TOOLS
- `artifacts/filezone/src/pages/` — page components (Home, About, PrivacyPolicy, TermsOfService, Contact, CategoryPage)
- `artifacts/filezone/src/components/layout/` — Navbar, Footer
- `artifacts/api-server/src/routes/` — Express routes (tools.ts, admin.ts, index.ts)
- `lib/db/src/schema/` — Drizzle schema (`tools.ts`, `siteSettings.ts`)
- `artifacts/api-server/src/seed.ts` — DB seed script (44 tools across 5 categories)
- `vercel.json` — Vercel deployment config (set Render API URL before deploying)
- `render.yaml` — Render deployment config (full-stack deploy)

## Architecture decisions

- All file processing runs client-side in the browser via WebAssembly / browser APIs — no file data ever hits the server.
- The backend only stores anonymous usage counts (`usageCount` per tool slug) and site visitor totals.
- `TOOL_COMPONENTS` in ToolPage.tsx maps slug → React component. Keys must exactly match DB slugs.
- `NO_DONE_TOOLS` set lists tool slugs that skip usage tracking (text/calculator/convert tools).
- Vite dev server proxies `/api/*` → `http://localhost:8080`, `/sitemap.xml` and `/robots.txt` → API routes.

## Product

- **PDF Tools** (9): merge, split, compress, PDF↔JPG, rotate, watermark, PDF→text, protect
- **Image Tools** (8): compress, resize, convert format, crop, image↔PDF, flip, rotate, watermark, base64
- **Convert Tools** (7): CSV↔JSON, Markdown→HTML, HTML→text, URL encoder/decoder, color converter (HEX/RGB/HSL), number base converter
- **Calculators** (12): age, BMI, percentage, CGPA, GPA, EMI, SIP, GST, income tax, currency, scientific, loan, discount, attendance, date difference
- **Text Tools** (4): word counter, QR generator, Base64, JSON formatter

## Deployment

### Render (recommended, full-stack)
1. Push code to GitHub
2. Connect repo in Render dashboard
3. Render reads `render.yaml` automatically — creates API service + static frontend + free PostgreSQL DB
4. After first deploy, run seed: `node artifacts/api-server/dist/seed.mjs` via Render shell

### Vercel (frontend) + Render (backend)
1. Deploy API to Render first, get the public URL (e.g. `https://filezone-api.onrender.com`)
2. In `vercel.json`, replace `"https://your-render-api-url.onrender.com"` with your Render URL
3. Import frontend repo into Vercel, set root directory: `artifacts/filezone`, build command: `pnpm run build`, output: `dist/public`

## User preferences

- Creator: **Yasin Miyade** — branding on Footer, About page, Privacy Policy, Terms of Service
- All tools should work in the browser with no server-side file processing

## Gotchas

- `TOOL_COMPONENTS` keys must exactly match the `slug` column in the DB `tools` table. Slug mismatches cause "Tool Not Found" errors.
- After schema changes, always run `pnpm --filter @workspace/db run push` then re-seed.
- The frontend build output goes to `artifacts/filezone/dist/public` (configured in `vite.config.ts`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
