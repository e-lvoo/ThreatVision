# Contributing / Local dev setup

1. Install dependencies

```bash
npm install
```

2. Create your local environment file

```bash
cp .env.example .env
# edit .env and add your Supabase values
```

3. Generate Supabase types (optional)

```bash
supabase gen types typescript --schema public > src/integrations/supabase/types.ts
```

4. Start the dev server

```bash
npm run dev
```

5. Run tests

```bash
npm run test
```

If you're submitting PRs, ensure linting and tests pass locally.
