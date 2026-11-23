# Anamika Consultant — Next.js

Next.js (App Router, TypeScript) conversion of the original single-file HTML page.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure

```
app/
  layout.tsx          fonts (next/font), metadata, viewport
  page.tsx            assembles the sections
  globals.css         the original stylesheet, unchanged apart from font variables
components/           static markup split by section (server components)
  Backdrop, Hero, Journey, ChatCta, Services, Remedies,
  Business, Results, Faq, Footer, FloatingUi
  CosmosEngine.tsx    client component: loads gsap + pixi.js and starts the animation
lib/cosmos-engine.js  the original GSAP/Pixi script, ported 1:1 (with cleanup on unmount)
```

## Notes

- `gsap@3.12.5` and `pixi.js@7.4.0` are the same versions the HTML loaded from the CDN, now installed from npm and imported only in the browser.
- `reactStrictMode` is off in `next.config.mjs` because the animation script mutates the DOM directly and would run twice in dev otherwise.
- The animation relies on element IDs and class names in the components. If you rename any, update `lib/cosmos-engine.js` too.
- Placeholders to replace: the WhatsApp number `910000000000` (Hero, ChatCta, Footer, FloatingUi), the "Dr. Astra" name in the hero slides and cards, and the sample planetary values.
- Fonts load from Google Fonts at build time, so the first `npm run build` needs internet access.
