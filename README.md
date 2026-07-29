# yeezyflow

An interactive, responsive index of 55 Kanye West tracks spanning 17 releases from 2004–2026. Yeezyflow combines a draggable, wheel-controlled coverflow with a searchable list view, sorting, theme controls, animated metadata, deep links, per-track social cards, and YouTube-backed playback.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm test
```

The production application uses Next.js App Router and is configured for Vercel. Catalog metadata and local cover artwork are sourced from current Apple Music records; no audio is hosted by this project.
