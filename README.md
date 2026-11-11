# Markdown Reader

A simple Windows desktop app for opening and reading Markdown files in a clean, read-only view.

## Security

The app is read-only and hardened for local Markdown viewing:

- Electron sandbox, context isolation, and no Node integration in the renderer
- Markdown is rendered with `markdown-it` (`html: false`) and sanitized with DOMPurify
- External links open in the system browser; in-app navigation and webviews are blocked
- Fonts are bundled locally (no remote font CDN)
- Packaged with ASAR enabled

## Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (LTS recommended)
- Windows 10/11 for the installer build

## Develop

```bash
npm install
npm run dev
```

`npm install` also ensures the Electron binary is available on Windows. Then `npm run dev` opens the app with hot reload. Use **Open Markdown File** (or drag and drop a `.md` file) to try it. A `sample.md` file is included in the repo for a quick test.

## Build Windows installer

```bash
npm run dist
```

This compiles the app and creates an NSIS installer under `release/`. Run the generated `.exe` to install Markdown Reader on your machine.

## Marketing website (Cloudflare Pages)

The site lives in [`website/`](website/). It includes SEO metadata and a `/download` endpoint that redirects to the latest Windows installer on GitHub Releases.

### Deploy on Cloudflare Pages

1. Push the `website/` folder to GitHub (already in this repo).
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the `markdown-reader` repo.
4. Set:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `website`
5. Deploy.

Production domain: **https://easymarkdownreader.com**

Canonical / Open Graph / sitemap URLs are already set to that domain.

### Download button

`/download` is a Cloudflare Pages Function (`functions/download.js` at the repo root). It calls the GitHub Releases API for `latest` and redirects to the Windows `.exe` asset.

## Release a new version

1. Bump `version` in `package.json`
2. `npm run dist`
3. `git tag vX.Y.Z && git push origin vX.Y.Z`
4. `gh release create vX.Y.Z "release/Markdown Reader Setup X.Y.Z.exe" --title "vX.Y.Z" --notes "..."`

The website Download button will automatically pick up the new release.

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Run in development mode              |
| `npm run build` | Build app bundles only             |
| `npm run dist` | Build + package Windows NSIS installer |
| `npm run preview` | Preview the production build     |
