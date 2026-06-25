# its.deja.babyxo — Deja Williams official site

A static, GitHub Pages–ready website for **Deja Williams**: model portfolio, apparel shop, and modeling-booking — built around her own voice: *"Soft voice, wild heart. Sweet… until I'm not."*

```
its.deja.babyxo/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   └── images/        ← drop real photos here (see names below)
└── README.md
```

## 1. Preview locally
Just open `index.html` in a browser. (For the image auto-loader to work over `file://`, most browsers are fine; if not, run a tiny server: `python -m http.server` then visit `http://localhost:8000`.)

## 2. Add the real photos
The site shows labeled placeholders until you add images. Drop files with these **exact names** into `assets/images/`:

| File | Used for |
|------|----------|
| `portrait.jpg` | About-section portrait (4:5) |
| `gallery-01.jpg` … `gallery-06.jpg` | Portfolio gallery |
| `shop-tee.jpg`, `shop-hoodie.jpg`, `shop-set.jpg`, `shop-cap.jpg` | Product photos (4:5) |
| `og-cover.jpg` | Social share preview (1200×630) |

Any slot with a matching file auto-fills; the rest stay as styled placeholders. No code change needed.

## 3. Deploy to GitHub Pages
1. Create a repo (e.g. `its-deja-babyxo`) and push these files to `main`.
2. Repo **Settings → Pages → Source: Deploy from a branch → `main` / root**.
3. Live at `https://<username>.github.io/its-deja-babyxo/`.
4. **Custom domain** later: buy a domain, add it under Settings → Pages → Custom domain, and create a `CNAME` file. (e.g. `itsdejababyxo.com`)

## 4. Wire the apparel shop to Stripe (when ready)
The cart works front-end now; payments are stubbed. Easiest path for a static site:
1. At **dashboard.stripe.com**, create a **Payment Link** for each product.
2. Paste each URL into the `stripeLink` field in the `PRODUCTS` array at the top of `assets/js/main.js`.
3. Single-item bags will redirect straight to Stripe checkout.
4. For a true multi-item cart, add a small serverless function (Stripe Checkout Session) on Vercel/Netlify and point `checkoutBtn` at it — the hook is marked `TODO` in `main.js`.

To **edit products** (name, price, description, image), just edit that same `PRODUCTS` array.

## 5. Wire the modeling booking (when ready)
The booking form validates and confirms in preview. To make it real, pick one:
- **Calendly / Cal.com** — replace the `<form id="bookingForm">` with their embed for live availability + auto-confirmations.
- **Formspree / Getform** — set the form `action` to your endpoint and `method="POST"` to receive requests by email (no backend).
- **Custom endpoint** — POST the form data yourself. Hook is marked `TODO` in `main.js`.

Update the contact email (`hello@itsdejababyxo.com`) in `index.html` to Deja's real address.

## Brand quick-reference
- **Palette:** terracotta `#a8482e`, plum `#3d1f2b`, champagne `#e8c9a8`, cream `#f7efe6`, gold `#c9a24b`, espresso `#1a1012`
- **Type:** Playfair Display (headlines) · Cormorant Garamond (accents) · Jost (body)
- **Voice:** soft + edge; warm, magnetic, a little dangerous.

— Built as the first pass. Everything is editable; nothing is locked.
