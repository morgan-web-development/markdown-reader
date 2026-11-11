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

## Scripts

| Script        | Description                          |
|---------------|--------------------------------------|
| `npm run dev` | Run in development mode              |
| `npm run build` | Build app bundles only             |
| `npm run dist` | Build + package Windows NSIS installer |
| `npm run preview` | Preview the production build     |
