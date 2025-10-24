# Personal Website

A single-page portfolio for Andrew Makarevich built with semantic HTML, modern CSS, and a touch of vanilla JavaScript.
The layout mirrors the résumé structure while presenting a polished aerospace-inspired aesthetic that remains lightweight
and easy to customize.

## Getting Started

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to view the site locally. Deploy the three files (`index.html`,
`style.css`, `script.js`) to any static host when you are ready to publish.

## Customization Notes

- **Branding & copy:** Update text directly in `index.html`. The navigation, hero, experience, projects, skills, language,
and contact sections are grouped for quick edits.
- **Design tokens:** The top of `style.css` defines colors, shadows, and spacing. Adjust these variables to retheme the
site while keeping components consistent.
- **Language list:** Modify the `languageData` array in `script.js` to add, remove, or reorder entries. Each language card
is rendered automatically with a badge and progress bar.
- **Navigation toggle:** The JavaScript also powers the mobile navigation button. No additional dependencies are
required.

## Accessibility & Performance

- Skip link, semantic landmarks, and high-contrast color palette support accessible navigation.
- Prefers-reduced-motion media query is honored for users who disable animations at the OS level.
- Fonts load from Google Fonts with `preconnect` hints to keep the experience responsive.
