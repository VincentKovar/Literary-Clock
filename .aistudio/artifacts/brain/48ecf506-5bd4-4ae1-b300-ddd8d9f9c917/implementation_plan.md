# GitHub Pages Deployment & Blank Page Resolution Plan

Resolve the blank page issue encountered on GitHub Pages by configuring Vite with relative asset resolution, updating PWA manifest paths, and providing a production-ready GitHub Actions deployment workflow.

## User Review & Critical Decisions

> [!IMPORTANT]
> The blank page on GitHub Pages occurs because default Vite builds use root-absolute paths (`/assets/...`). When deployed under a GitHub repository subpath (e.g., `https://username.github.io/repository-name/`), the browser fails to locate JS/CSS bundles (returning 404), resulting in an unrendered blank screen.

- **Confirmed Decision 1**: Configured relative base path (`base: './'`), guaranteeing assets load seamlessly across any repository name or custom domain.
- **Confirmed Decision 2**: GitHub Actions automated workflow (`.github/workflows/deploy.yml`) to automatically build and deploy the `dist/` directory whenever code is pushed.

---

### 1. Overview & Core Concept

- **What It Does**: Fixes asset resolution so the Literary Clock renders immediately upon visiting the GitHub Pages URL, without manual path adjustments.
- **Target Audience**: Anyone viewing or installing the Literary Clock PWA hosted via GitHub Pages.
- **Key Value**: 100% reliable automated deployment and asset resolution across subpaths and custom domains.

---

### 2. User Experience & Visual Design

- **Visual Consistency**: No changes to the rich solid oak frame, brass dial controls, or parchment typography. All fonts, styles, and assets remain identical to local dev.
- **First Load Experience**: Instant rendering of the clock on GitHub Pages with working audio synthesis, interactive brass dials, and PWA install prompt.
- **Asset Integrity**: Relative referencing for `/icon.svg`, `/pwa-192x192.png`, `/apple-touch-icon.png`, and generated scripts/stylesheets.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Relative Base (`base: './'`) vs Hardcoded Repo Name**
  - *Chosen Approach*: `base: './'` in `vite.config.ts`.
  - *Why*: Allows you to rename your GitHub repository or test in staging environments without modifying code.
  - *Alternatives Considered*: Hardcoding `base: '/my-repo-name/'`, which breaks if the repository is renamed or tested locally.

- **Decision 2: Automated GitHub Actions Workflow**
  - *Chosen Approach*: Create `.github/workflows/deploy.yml` using GitHub's official `actions/deploy-pages@v4`.
  - *Why*: Eliminates manual `gh-pages` branch pushing; GitHub automatically compiles TypeScript, bundles Tailwind, and publishes `dist/`.
  - *Alternatives Considered*: Manual commit of `dist` to git branch, which bloats git history and is prone to human error.

- **Decision 3: PWA Manifest Scope & Start URL**
  - *Chosen Approach*: Update `start_url` and `scope` to `'./'` in `VitePWA` config.
  - *Why*: Ensures the Progressive Web App installs and caches resources relative to the GitHub Pages subpath rather than hijacking the root domain.

---

### 4. Technical Architecture & Deployment Flow

```
┌────────────────────────┐
│  git push origin main  │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│  GitHub Actions Workflow (.github/workflows) │
│  - Checkout code                             │
│  - Setup Node 22                             │
│  - npm ci                                    │
│  - npm run build (Vite with base: './')      │
│  - Upload artifact (dist/)                   │
└───────────┬──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│  GitHub Pages Runtime                        │
│  https://<username>.github.io/<repo>/        │
│  - index.html requests ./assets/index-xxx.js │
│  - Assets resolve at correct subpath (200 OK)│
│  - Literary Clock PWA renders flawlessly     │
└──────────────────────────────────────────────┘
```

#### Proposed File Modifications:
1. `vite.config.ts`:
   - Add `base: './'`.
   - Update `manifest.start_url` and `manifest.scope` to `'./'`.
2. `index.html`:
   - Adjust `<link>` tags to relative paths (`./icon.svg`, `./pwa-192x192.png`, `./apple-touch-icon.png`).
3. `.github/workflows/deploy.yml`:
   - Create automated workflow with proper `pages: write` and `id-token: write` permissions.
