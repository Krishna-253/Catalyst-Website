# Vibes (vibes.b150.ai) Scraped Project

This repository contains the complete mirrored frontend code and web scraper for **[vibes.b150.ai](https://vibes.b150.ai/)** ("Vibes: The Builder Economy" by B150).

---

## 📁 Directory Structure

```
vibes-scraper/
├── scraper.py                 # Python web scraper & asset localizer script
├── site/                      # Fully functional offline-ready mirrored website
│   ├── index.html             # Localized main webpage
│   ├── index_original.html    # Original un-modified HTML
│   ├── assets/
│   │   ├── built/
│   │   │   ├── screen.css     # Main Ghost theme stylesheet
│   │   │   └── source.js      # Main Ghost theme JavaScript
│   │   ├── fonts/             # Inter, JetBrains Mono, and PPNeueBit fonts
│   │   ├── images/            # Background video and skin graphics
│   │   └── js/
│   │       ├── vibes-terminal-morph.js   # Custom typewriter / block cursor animation
│   │       ├── vibes-sticky-nav.js       # Sticky header scroll listener
│   │       └── vibes-fade-animations.js  # Staggered entrance animations
│   ├── external/              # External CDN resources & images (Ghost Storage, jsDelivr)
│   └── public/                # Ghost cards styles and scripts
└── README.md
```

---

## 🚀 How to Run Locally

You can preview the scraped website using Python's built-in HTTP server:

```bash
cd site
python -m http.server 8000
```

Then open your browser at:
`http://localhost:8000`
