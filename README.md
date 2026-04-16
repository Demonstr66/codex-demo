# Frontend Landing Page (Vite + Vue 3 + TypeScript)

Simple frontend-only project prepared for GitHub Pages deployment via GitHub Actions.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push to the `main` branch.
2. In GitHub repository settings, enable **Pages** and set the source to **GitHub Actions**.
3. The workflow `.github/workflows/deploy-pages.yml` builds and deploys automatically.

### Base path handling

`vite.config.ts` automatically sets the correct base path in GitHub Actions using the repository name (from `GITHUB_REPOSITORY`). Local development keeps `/` as the base.
