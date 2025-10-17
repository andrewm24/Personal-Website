# Personal Website

A single-page portfolio for Andrew Makarevich crafted with semantic HTML and immersive CSS. The interface embraces a
mission-control inspired aesthetic to spotlight computer engineering and space systems experience—no binary assets or
build tooling required.

## Getting Started

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to explore the site locally.

## Customization

- Update the copy in `index.html` to reflect new roles, projects, or contact details.
- Tweak the palette, shadows, or radii by adjusting the CSS custom properties defined at the top of `style.css`.
- Add additional sections by duplicating the `panel` pattern—each panel ships with layered gradients and responsive
  layouts out of the box.
- Need imagery or downloads? Drop them into an `assets/` directory and link them in the markup. The baseline project
  remains binary-free for easy version control.

## Deployment

The site is static HTML/CSS, so hosting is as simple as uploading the files to GitHub Pages, Netlify, or any static file
host. Include `index.html`, `style.css`, and any optional assets you add.
