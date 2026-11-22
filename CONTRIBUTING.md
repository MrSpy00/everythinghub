# Contributing to EverythingHub

Thanks for helping improve EverythingHub.

## Local Development

```bash
npm install
npm run dev
```

## Checks Before Opening a PR

```bash
npx tsc --noEmit
npm run lint
npm run build
```

- Keep all tools client-side (zero login, zero server-side user tracking).
- Match existing Turkish (`tr`) and English (`en`) localization keys when adding or updating a tool.
- Keep commits small and descriptive (`feat:`, `fix:`, `docs:`, `chore:`).
