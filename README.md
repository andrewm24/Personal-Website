# Personal Website

A single-page portfolio for Andrew Makarevich delivered with semantic HTML, immersive CSS, vanilla JavaScript, and a
Firebase-ready contact pipeline. The site keeps the aerospace visual direction while adding a hosted resume asset and a
contact form that can write submissions into Cloud Firestore.

## Files

- `index.html` — Content structure, orbital layout, resume link, and the Firebase-backed contact form.
- `style.css` — Deep-space visual system, responsive layout rules, and styling for the form and hosted-asset actions.
- `script.js` — Theme and motion toggles, reveal effects, language rendering, and Firestore contact form submission.
- `firebase-config.js` — Placeholder Firebase Web SDK config. Replace the values with your own Firebase project values.
- `firebase.json` — Firebase Hosting and Firestore deployment config.
- `firestore.rules` — Security rules for the `contactSubmissions` collection.
- `firestore.indexes.json` — Empty index manifest for Firestore.
- `assets/Andrew_Makarevich_Resume.pdf` — Hosted resume file linked from the site.

## Local Preview

```bash
python -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000) to explore the site locally.

## Firebase Setup

1. Create a Firebase project in the Firebase console.
2. Enable `Hosting`.
3. Enable `Cloud Firestore` in production or test mode.
4. Open `firebase-config.js` and replace each placeholder with your Web app config values from Firebase Console.
5. Install the Firebase CLI if needed, then authenticate:

```bash
npm install -g firebase-tools
firebase login
```

6. In this project directory, connect the local repo to your Firebase project:

```bash
firebase use --add
```

7. Deploy Hosting and Firestore rules:

```bash
firebase deploy --only hosting,firestore
```

## Contact Form Behavior

- Submissions are written to the Firestore collection `contactSubmissions`.
- The site never reads messages back publicly.
- `firestore.rules` allow unauthenticated creates only, with basic field-length and email validation.
- The form fails gracefully until `firebase-config.js` is filled in.

## Notes

- Firebase Web config values are public identifiers, not private secrets.
- The current form stores messages in Firestore. If you want email notifications next, the clean follow-up is a Cloud
  Function or a provider like Resend so new submissions trigger an alert to your inbox.
- Because this is a static site, Firebase Hosting is a good fit for the PDF asset, the HTML/CSS/JS bundle, and future
  additions like more downloadable documents.
