# BRD Hospital

Marketing + booking site for BRD Hospital (a gynecology practice), plus a private
admin dashboard for staff to manage appointments and payments. React 19 +
TypeScript + Vite on the frontend, Supabase (Postgres + Auth + Edge Functions)
on the backend.
##### ** Smart School Mnagment Gmail lo supabase **


## How to run the project

**Prerequisites:** Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**. The site renders and is fully clickable
without any backend setup — booking and the admin dashboard just show a
"not connected" message until Supabase is configured (see
[BACKEND_SETUP.md](./BACKEND_SETUP.md)).

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check, then production-build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | Run oxlint |

For project structure, the admin dashboard, i18n, and deployment, see
**[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** — that's the full day-to-day
reference. For first-time Supabase setup, see
**[BACKEND_SETUP.md](./BACKEND_SETUP.md)**.

## Frontend tooling

This project uses Vite with React and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
