# Personal Website

A single-page portfolio for Andrew Makarevich delivered with semantic HTML, immersive CSS, and a sprinkle of vanilla
JavaScript—no build tooling or binary assets required. The layout mirrors the résumé content while introducing a
satellite-inspired presentation complete with light/dark theming, parallax hero lighting, and unobtrusive orbital
animations.

## Getting Started

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to explore the site locally.

## Customization

- Update copy in `index.html` to reflect new roles, projects, or contact details.
- Tune the shared design tokens at the top of `style.css` to adjust typography, accent hues, and panel transparency for
  both light and dark modes in one place.
- Control the orbital animation speed by editing the `.orbit` selectors and their `drift-*` keyframes in `style.css`;
  comments highlight how to slow down or add more satellite passes.
- Modify the parallax motion intensity inside the final script block in `index.html`—increase the `maxOffset` constant
  for a gentler response or lower it for a more reactive hero translation.
- Extend the résumé-aligned sections by duplicating the `.section` pattern or add more project cards inside the `.cards`
  grid.
- Need imagery or downloads later? Drop them into an `assets/` directory and link them in the markup. The default
  project stays binary-free for painless version control.

## Deployment

The site is static HTML and CSS—simply upload `index.html`, `style.css`, and any optional assets to GitHub Pages, Netlify,
or another static host.
