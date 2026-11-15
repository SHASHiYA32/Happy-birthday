<div align="center">

# 🎂 Wish Spark by DevDynamo

**A birthday card that opens like a real one.**

Write the wishes. Add the photos. Send a private link and a six-digit code.
They tap the card, it swings open, and your words arrive one by one, with the song playing.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%C2%B7%20DB%20%C2%B7%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r187-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

</div>

<br />

## ✨ The idea

When someone's birthday comes around, a message in a chat feels small. **Many Happy Returns** turns it into a little moment:

1. You log in and write a handful of wishes, each with an optional photo.
2. The site seals them into a card and gives you a **hidden link** and a **one-time code**.
3. On the birthday, the person opens the link, types the code, and the card plays out for them: a cover that swings open, a music-box tune, confetti, and every wish and photo drifting past on its own.

<br />

## 🎁 Features

### For the sender
- **Account-based creation.** You must be logged in to make a card.
- **Up to 8 wishes per card**, each with its own optional photo.
- **Birthday lock.** The card stays sealed until the birthday you choose.
- **Private link + 6-digit code**, shown once so they can be sent in separate messages.
- **Dashboard** to copy links, issue a fresh code, or delete a card together with its photos.
- **Smart uploads.** Photos are shrunk in the browser before upload, which also removes hidden location data.

### For the receiver
- **Code gate** with six animated digit boxes, paste support and auto-submit.
- **3D card-opening intro.** A hinged cover swings open, then the view zooms into the card.
- **Birthday song** played as a music box, synthesised live in the browser (no audio file).
- **Auto-advancing slideshow.** Wishes reveal word by word, photos sit in taped polaroid frames with a slow drift, and the colours change from slide to slide.
- **Full control.** Pause, play, back, next, mute, keyboard arrows, and press-and-hold to pause.
- **Three.js confetti** that falls gently and bursts when the card opens.
- **Reduced-motion friendly.** Heavy animation is skipped for people who ask for it.

<br />

## 🎨 Design

The look is deliberately **not** the usual gradient-and-glass template. It borrows from letterpress stationery:

| | |
|---|---|
| **Paper** | Warm cream background with a printed grain over everything |
| **Type** | *Fraunces* for display, *Karla* for text, *Caveat* for handwritten wishes |
| **Palette** | Tomato, marigold, deep teal, blush and ink |
| **Controls** | Stamped buttons with hard offset shadows, underline-only form fields |
| **Motion** | GSAP timelines for the big moments, Motion for springs and page transitions |

<br />

## 🧰 Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript |
| Styling | Tailwind CSS 4 with custom design tokens, self-hosted fonts via Fontsource |
| Animation | GSAP and `@gsap/react`, Motion, Three.js with React Three Fiber |
| Backend | Supabase Auth, Postgres with Row Level Security, private Storage bucket |
| Validation | Zod |
| Audio | Web Audio API (synthesised, no files) |

<br />

## 🔄 How it works

```
 SENDER                                         RECEIVER
 ──────                                         ────────
 Sign up / log in
      │
 Write wishes + add photos
      │
 Server validates input, checks real image
 type, stores photos in a private bucket,
 hashes a random 6-digit code
      │
 Link + code shown once  ───── sent separately ───►  Opens the link
                                                       │
                                                  Types the code
                                                       │
                                        Server checks code, birthday date
                                        and lockout, then sets a signed,
                                        short-lived cookie
                                                       │
                                        Photos stream through a protected
                                        route that re-checks the cookie
                                                       │
                                        Cover opens  →  song  →  slideshow
```

<br />

## 🔐 Security

Security was a first-class requirement, not an afterthought.

**Authentication**
- Supabase email and password login; sessions are re-verified on the server for every protected route.
- Strong password rules, identical error messages for every failed login, and rate limiting on login and sign-up.
- Open-redirect protection on the post-login `next` parameter.

**The code (OTP)**
- Cryptographically random, stored only as a salted **scrypt hash**, compared in constant time.
- Escalating lockout: every 5 wrong guesses locks the card for 15 minutes, doubling up to 24 hours.
- Issuing a new code instantly invalidates any open viewing session.

**Photos and data**
- The storage bucket is **private**; no storage URL is ever handed to a browser.
- Photos are served only through an app route that checks a signed viewer cookie, and direct visits, new tabs and hotlinking are refused.
- Images are fetched into memory and painted on a **canvas**: no `<img>` tag, no blob URL, nothing to right-click or drag.
- Uploads are checked by their real file signature, not the file name or browser-reported type, and size-capped.
- **Row Level Security** on every table, plus column-level permissions so owners can never read OTP hashes.
- The service-role key lives only on the server and the code is marked `server-only`, so the build fails if it is ever imported into client code.

**Browser hardening**
- Strict Content Security Policy, `X-Frame-Options: DENY`, `nosniff`, no-referrer, HSTS and a locked-down Permissions Policy.
- Card pages are marked `noindex` and never cached.

> **Honest limit:** no website can stop a screenshot or screen recording. The photo protection removes every easy way to save an image, but cannot prevent someone photographing their own screen.

<br />

## 🗂️ Project structure

```
birthday-card/
├── supabase/
│   └── schema.sql              # tables, RLS, private bucket, profile trigger
├── src/
│   ├── proxy.ts                # session refresh + route protection
│   ├── app/
│   │   ├── page.tsx            # landing
│   │   ├── (auth)/login, signup
│   │   ├── create/             # card builder (login required)
│   │   ├── dashboard/          # your cards
│   │   ├── c/[slug]/           # public card: code gate, then the experience
│   │   ├── api/card/[slug]/image/[index]/   # protected photo route
│   │   └── actions/            # server actions: auth, cards, viewer
│   ├── components/
│   │   ├── Hero.tsx            # animated landing hero
│   │   ├── Confetti.tsx        # Three.js confetti (lazy-loaded)
│   │   ├── CreateForm.tsx      # wishes + photo upload
│   │   ├── OtpGate.tsx         # six-digit code entry
│   │   ├── CardExperience.tsx  # 3D cover, slideshow, ending
│   │   └── ProtectedImage.tsx  # canvas-rendered photos
│   └── lib/
│       ├── birthday-song.ts    # Web Audio music box
│       ├── compress-image.ts   # in-browser downscale + metadata strip
│       ├── supabase/           # server, admin and session clients
│       └── security/           # OTP, viewer session, rate limit, validation
```

<br />

## 🗄️ Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per registered user, created automatically on sign-up |
| `cards` | Recipient, sender, birthday date, link slug, hashed code and lockout state |
| `card_slides` | Each wish, its position and the path of its photo |
| `storage: birthday` | Private bucket; files live under `<user id>/<card id>/` |

<br />

## ⚙️ Configuration

The app reads these environment variables. **None of them belong in source control.**

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Publishable key used for user sessions |
| `SUPABASE_ANON_KEY` | Server | Anon key (kept out of client code) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Lets the server open a card after a correct code |
| `CARD_SESSION_SECRET` | **Server only** | Signs the viewer cookie; use a long random string |

<br />

## 🛣️ Ideas for later

- Scheduled delivery by email or WhatsApp on the birthday morning
- Short video or voice-note slides
- Custom cover themes and a choice of songs
- Shared cards where friends add their own wishes before sealing

<br />

<div align="center">

Made with care for the people who deserve a proper birthday.

</div>
