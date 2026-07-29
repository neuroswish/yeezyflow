# Yeezyflow

## Scope

- Maintain a high-fidelity, interactive Kanye West discography index under the `yeezyflow` identity.
- Keep implementation and local visual assets inside this project.
- Preserve the existing coverflow motion, explicit drag/wheel gesture model, center-card snapping, list view, playback, loading states, accessibility, and responsive behavior.

## Architecture

- Use the existing Next.js App Router, TypeScript, React, and CSS architecture.
- Keep catalog records in `app/data/tracks.json`, covers in `public/covers`, and generated social cards in `public/og-tracks`.
- Deploy through the native Next.js integration on Vercel.
- Do not add dependencies without explicit approval.

## Validation

- Validate with `npm run typecheck`, `npm run lint`, `npm test`, and browser checks at desktop and mobile widths.
- Verify wheel navigation, hold-and-drag navigation, snap-to-center settling, list/search flows, theme switching, deep links, metadata, and media assets.

## Safety

- Do not edit sibling projects in the workspace.
- Do not commit, push, deploy, or modify production resources without explicit user approval.
