# Personal Website

A single-page portfolio for Andrew Makarevich delivered with semantic HTML, immersive CSS, and a sprinkle of vanilla
JavaScript—no build tooling or binary assets required. The layout mirrors the résumé content while introducing a
satellite-inspired presentation complete with light/dark theming, parallax hero lighting, and unobtrusive orbital
animations.

## Files

- `index.html` — Content structure, starfield layers, satellite sprite definitions, and accessibility landmarks.
- `style.css` — Deep-space visual system with design tokens, responsive layout rules, and animation styling for the
  starfield, satellites, and language cards.
- `script.js` — Theme + motion toggles, parallax management, spoken language rendering, and preference persistence.

## Getting Started

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to explore the site locally.

## Customization

- **Colors & typography:** Update the tokens at the top of `style.css` to quickly retune fonts, spacing, or accent hues
  for both themes. Each variable is shared, so changes cascade across components.
- **Starfield tuning:** Adjust the `--star-density` and `--star-brightness` tokens in `style.css` to retune how many
  stars appear and how bright they glow. The `starScrollLimit` and `pointerStrength` constants in `script.js` control the
  parallax offset on scroll and pointer move.
- **Satellite passes:** Add another `.satellite` element in `index.html` and reuse the inline SVG `<symbol>` definitions
  (or create your own) to change the number of flyovers. Adjust the `drift-*` keyframes in `style.css` to speed up or
  slow down each orbit.
- **Parallax intensity:** Edit `--parallax-strength` in `style.css` or the `maxOffset` constant inside `script.js` to set
  how far hero copy should glide during scroll. Pair with `starScrollLimit` if you want the background to move more or
  less than the foreground.
- **Language section:** Update the `languageData` array near the top of `script.js` to add, remove, or reorder spoken
  languages. Each entry lets you tweak the proficiency label, description, and optional progress percentage without
  touching the HTML layout.
- **Motion toggle defaults:** The preflight script in `index.html` and the `applyMotion` logic in `script.js` respect
  `prefers-reduced-motion`. To force animations off or on by default, update the stored value logic near the top of both
  scripts.
- **Light/dark labeling:** Modify the toggle text within `script.js` if you want alternative copy (“Night mode”, “Day
  mode”, etc.).

## Deployment

The site is static HTML, CSS, and JavaScript—upload the three files (plus any optional assets you add later) to GitHub
Pages, Netlify, or another static host. No build step is required.
