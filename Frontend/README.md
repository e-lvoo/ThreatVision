# ThreatVision

ThreatVision is an academic prototype for campus and network-focused malware detection and anomaly monitoring. It provides a React-based dashboard demonstrating detection pipelines, alerting, severity scoring, and incident reporting for final-year or graduate-level projects.

Getting started (local development):

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd threatvision-dashboard

# Install dependencies (npm or pnpm)
npm install

# Start development server
npm run dev
```

Project highlights:
- Network traffic monitoring views and tables
- Threat severity levels (Low / Medium / High) and confidence scores
- Alerts timeline, detection metrics and exportable reports
- Model performance dashboards for deep-learning detection models

Academic use:
- Replace or extend mock data in `src/data` with experimental datasets.
- Implement or integrate detection models in `src/models` and update the UI pages in `src/pages`.
- Cite this repository as a project artifact when presenting results.

If you need the lockfile regenerated, run `npm install` after pulling changes.

Environment & Supabase types
--------------------------------
- Copy `.env.example` to `.env` and fill in your Supabase project values:

```sh
cp .env.example .env
# edit .env and add your VITE_SUPABASE_URL and keys
```

- To generate (or re-generate) Supabase TypeScript types for your schema (optional):

```sh
# Requires the Supabase CLI or use the web UI to export types. Example with the CLI:
supabase gen types typescript --schema public > src/integrations/supabase/types.ts
```

Testing & Local Development
--------------------------------
- Install dependencies:

```sh
npm install
```

- Start dev server:

```sh
npm run dev
```

- Run tests:

```sh
npm run test
```

Security note
--------------------------------
- Do NOT commit `.env` with real credentials. Use `.env.example` for placeholders and add `.env` to `.gitignore`.


Environment & local setup
-------------------------

Create a local `.env` file by copying `.env.example` and filling in your Supabase details:

```bash
cp .env.example .env
# then edit .env and add your real values
```

Testing
-------

Run unit tests with Vitest:

```bash
npm run test
```

Generate Supabase types
-----------------------

To regenerate `src/integrations/supabase/types.ts` (recommended after schema changes) use the Supabase CLI:

```bash
# install supabase CLI or use npx
npx supabase gen types typescript --project-id <PROJECT_ID> > src/integrations/supabase/types.ts
```

Replace `<PROJECT_ID>` with your Supabase project id (or use `VITE_SUPABASE_PROJECT_ID`).

Security note
-------------

Do not commit `.env` or secrets to the repository. Use environment variables in CI and your hosting provider.
