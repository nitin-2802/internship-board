# Responsive Internship Board

An accessible, framework-free student internship listing interface built with semantic HTML, responsive CSS, and vanilla JavaScript.

**Live Preview:** https://github.com/nitin-2802/internship-board

## Features
- **Reusable Card Rendering:** Loads records dynamically from `data/internships.json` while preserving all record IDs (`INT-101` to `INT-105`).
- **Search & Multi-Filter:** Live search across title, domain, location, skills, and ID, paired with Domain and Work Mode filters.
- **UI States:** Includes loading, empty, error, and one-click retry states (testable via the footer "Test error & retry state" control).
- **Accessible Details & Apply Dialog:** Keyboard-navigable `<dialog>` with client-side validation for required name, valid email, safe `http(s)` URLs, and duplicate applications.
- **Accessibility:** Skip link, semantic landmarks, explicit form labels, `aria-live` result announcements, and visible `:focus-visible` states.

## Run Locally
Because the app uses `fetch()` to load `data/internships.json`, run it through a local server rather than opening `index.html` directly:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx serve .
```

Then open `http://localhost:8000`.

## Responsive & Accessibility Testing
| Viewport | Layout | Horizontal Scroll | Status |
| --- | --- | --- | --- |
| 360px (Mobile) | Single-column filters & cards | None | Pass |
| 768px (Tablet) | 4-column filter bar, 2-column card grid | None | Pass |
| 1280px (Desktop) | 4-column filter bar, 3-column card grid | None | Pass |

**Keyboard Check:** Tested `Tab` / `Shift+Tab`, `Enter`, `Space`, and `Escape` across skip link, search, filters, cards, and modal dialog.

## Screenshots
![Mobile 360px](screenshots/mobile-360.png)
![Tablet 768px](screenshots/tablet-768.png)
![Desktop 1280px](screenshots/desktop-1280.png)
