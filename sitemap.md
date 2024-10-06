# Site Structure

## Root
- CHANGELOG.md
- Dockerfile
- PROJECT_STRUCTURE.md
- README.md
- env.d.ts
- package-lock.json
- package.json
- shopify.app.toml
- shopify.web.toml
- sitemap.md
- tsconfig.json
- vite.config.ts

## app
- db.server.ts
- entry.server.tsx
- globals.d.ts
- root.tsx
- routes/
  - _index/
    - route.tsx
    - styles.module.css
  - app._index.tsx
  - app.additional.tsx
  - app.tsx
  - auth.$.tsx
  - auth.login/
    - error.server.tsx
    - route.tsx
  - webhooks.app.uninstalled.tsx
  - webhooks.customers.data_request.tsx
  - webhooks.customers.redact.tsx
  - webhooks.shop.redact.tsx
- shopify.server.ts

## prisma
- dev.sqlite
- migrations/
  - 20240530213853_create_session_table/
    - migration.sql
- schema.prisma

## public
- favicon.ico
