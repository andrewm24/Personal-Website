# Personal Website

A single-page personal site for Andrew Makarevich built with semantic HTML and handcrafted CSS. The current design leans
into a computer engineering and space systems aesthetic while staying lightweight—no binary assets or build tooling
required.

## Getting Started

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) to preview the site.

## Customization

- Update the copy in `index.html` to reflect new roles, projects, or contact details.
- Adjust colors or layout tokens in `style.css` by editing the CSS custom properties near the top of the file.
- Need to add media? Place optional assets in an `assets/` directory and reference them from the markup. The baseline
  project ships without binaries to keep Git history small.

## Deployment

Because the site is just static HTML and CSS, you can deploy it anywhere that serves static files, such as GitHub Pages,
Netlify, or an S3 bucket. Upload `index.html` and `style.css`, along with any optional assets you add.
