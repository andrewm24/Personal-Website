# Personal Website

A single-page portfolio for Andrew Makarevich delivered with semantic HTML and expressive CSS—no build tooling or
binary assets required. The refreshed layout mirrors the résumé content while introducing a monochrome mission-control
look and a theme toggle for light or dark viewing.

## Getting Started

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to explore the site locally.

## Customization

- Update copy in `index.html` to reflect new roles, projects, or contact details.
- Adjust the shared design tokens at the top of `style.css` to fine-tune typography, spacing, and the subtle accent hue
  that gives the interface its space-inspired pop.
- Extend the résumé-aligned sections by duplicating the `.section` pattern or add more project cards inside the `.cards`
  grid.
- Need imagery or downloads later? Drop them into an `assets/` directory and link them in the markup. The default
  project stays binary-free for painless version control.

## Deployment

The site is static HTML and CSS—simply upload `index.html`, `style.css`, and any optional assets to GitHub Pages, Netlify,
or another static host.
