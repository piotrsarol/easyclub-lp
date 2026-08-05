# EasyClub landing page

Marketing landing page for the EasyClub pilot program. Built with Next.js, React, TypeScript and a small custom CSS design system so the page stays fast and does not add an animation dependency.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Pilot applications

`POST /api/leads` validates the payload on the server with Zod and writes to Supabase through the server-only REST API when these variables are configured:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_LEADS_TABLE` (optional, defaults to `pilot_leads`)

Copy `.env.example` to `.env.local` and never expose the service-role key to the browser. The honeypot field in the form silently accepts basic automated submissions. The SQL table definition is in `supabase/migrations/001_pilot_leads.sql`; the table has RLS enabled and is intended to be written by the server route only.
