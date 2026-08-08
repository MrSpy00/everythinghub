<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# EverythingHub Universal Design & Engineering Rules

## 1. Zero Emoji / Sticker Rule (Strict Standard)
- **NEVER** use emojis, unicode stickers, or low-quality smileys in UI components, tool definitions, badges, titles, navigation, or documentation (e.g. no 🎬, 🖼️, ⚙️, 🎨, 📝, ✨, 🇹🇷, 🇬🇧, etc.).
- **ALWAYS** use high-quality, crisp, scalable vector SVG icons (Lucide SVG, Tailwind SVG, or custom inline SVGs) with tailored CSS stroke, fill, and neon glow accents.

## 2. Creative Studio & Liquid Glass Aesthetic
- Avoid generic "AI clone" or standard basic dashboard styling.
- Embrace rich creative studio aesthetics:
  - GPU-accelerated WebGL ambient backgrounds (e.g. OGL Chromatic Dotted Waves).
  - Custom fluid follower cursor (`UserCursor`) with OS cursor disabled (`cursor: none`).
  - Liquid glassmorphism (`backdrop-blur-3xl`, subtle specular highlights, ambient violet/indigo refraction).
  - Kinetic typography using the Originkit SVG gooey filter (`TextMorph`).
  - Dual-conic neon sweeping borders (`NeonBorder`).

## 3. Privacy-First & Zero Data Retention
- All computations, conversions, and tool actions run strictly client-side or in-memory.
- No user tracking, no session cookies, no third-party telemetry leaks.
