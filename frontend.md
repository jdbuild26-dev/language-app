# LangLearn — Frontend Documentation

A full-featured language learning web application built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Clerk v7** authentication. The frontend communicates with a **FastAPI** backend and gracefully falls back to local mock CSV data when the backend is unavailable.

---

## Tech Stack

| Technology | Purpose | Version |
|---|---|---|
| Next.js | Framework (App Router) | ^16.1.6 |
| React | UI | ^19.2.4 |
| TypeScript | Type safety | ~5.9.3 |
| Tailwind CSS | Styling | ^3.4.17 |
| Clerk | Authentication | ^7.0.4 |
| TanStack Query | Server state / data fetching | ^5.90.16 |
| Framer Motion | Animations | ^12.23.26 |
| Recharts | Charts & progress graphs | ^3.7.0 |
| Radix UI | Accessible UI primitives | various |
| Lucide React | Icons | ^0.555.0 |
| Heroicons | Icons | ^2.2.0 |
| PapaParse | CSV parsing (mock data) | ^5.5.3 |
| react-hot-toast | Toast notifications | ^2.6.0 |
| Embla Carousel | Carousel / flashcard UI | ^8.6.0 |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (ClerkProvider, Header, Footer)
│   ├── page.tsx                # Homepage
│   ├── providers.tsx           # TanStack Query + theme providers
│   ├── dashboard/              # Student dashboard + sub-pages
│   │   ├── assignments/
│   │   ├── friends/
│   │   ├── progress/
│   │   ├── referral/
│   │   └── teachers/
│   ├── teacher-dashboard/      # Teacher dashboard + sub-pages
│   │   ├── assignments/
│   │   ├── calendar/           # Weekly schedule with event management
│   │   ├── classes/
│   │   ├── profile/
│   │   ├── referral/
│   │   └── students/
│   ├── vocabulary/             # Vocabulary lessons, flashcards, practice
│   ├── grammar/                # Grammar lessons + 12 practice types
│   ├── practice/               # Cross-skill practice hub
│   │   ├── reading/            # 20+ reading exercise types
│   │   ├── listening/          # 9 listening exercise types
│   │   ├── writing/
│   │   └── speaking/
│   ├── ai-practice/            # AI conversation scenarios
│   ├── stories/                # Story reader + learn mode
│   ├── blogs/
│   ├── find-teacher/
│   ├── onboarding/             # new-profile / student / teacher flows
│   ├── profile/[username]/
│   ├── sign-in/ & sign-up/
│   └── privacy-policy, refund-policy, terms-conditions
│
├── features/                   # Feature-scoped logic & UI
│   ├── ai-practice/            # Chat UI, AudioPlayer, scenario pages
│   ├── auth/                   # Onboarding modals, ClerkGates
│   ├── blogs/
│   ├── grammar/                # Grammar lesson & practice pages
│   ├── practice/               # All practice exercise components
│   ├── progress-report/
│   ├── stories/
│   ├── student-dashboard/      # Student layout + dashboard pages
│   ├── teacher-dashboard/      # Teacher layout + dashboard pages
│   └── vocabulary/             # Vocabulary components, data, utils
│
├── components/                 # Shared UI components
│   ├── layout/                 # Header, SecondaryNav, Footer, FooterWrapper
│   └── ui/                     # shadcn/ui primitives (Button, Card, Input…)
│
├── utils/                      # Shared utilities
│   └── practiceFetcher.ts      # Fetches practice data; falls back to mock CSV
│
├── styles/
│   └── globals.css
│
public/
└── mock-data/                  # Local CSV files used as fallback data
    ├── csv/                    # General exercise CSVs
    ├── grammar/                # Grammar-specific CSVs
    └── practice/
        ├── grammar/
        ├── listening/
        └── reading/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Clerk account — [clerk.com](https://clerk.com)
- FastAPI backend (optional — app works with mock data when backend is down)

### 1. Clone & Install

```bash
git clone https://github.com/jdbuild26-dev/language-app.git
cd language-app
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/new-profile

NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production Build

```bash
npm run build
npm start
```

---

## Authentication

Authentication is handled entirely by **Clerk v7** (`@clerk/nextjs`).

- `ClerkProvider` wraps the entire app in `src/app/layout.tsx`
- Auth gates use custom `ClerkGates.tsx` wrappers (not `<SignedIn>` / `<SignedOut>` directly)
- Sign-in: `/sign-in` — Sign-up: `/sign-up`
- After sign-up, users are routed to `/onboarding/new-profile` to choose student or teacher role
- Teacher onboarding: `/onboarding/teacher` — validates experience (0–100 years), subject, bio
- Student onboarding: `/onboarding/student`

---

## Key Features

### Student Dashboard (`/dashboard`)
- Overview of progress, streaks, and recent activity
- Sub-sections: Assignments, Friends, Progress Report, Teachers, Referral

### Teacher Dashboard (`/teacher-dashboard`)
- Application questionnaire with per-question validation
- Students management — add students by Profile ID via connection request
- Weekly calendar — create/view/delete class events, persisted in `localStorage`
- Assignments, Classes, Profile, Referral sections

### Vocabulary (`/vocabulary`)
- Lessons with word lists
- Flashcard review mode
- 10+ practice exercise types (fill-in-blank, spelling, group words, dictation, etc.)

### Grammar (`/grammar`)
- Lessons browser
- 12 practice types: fill-blanks-options, four-options, two-options, three-options, fill-blanks, fill-blanks-question, reorder-words, transformation, rewrite, combination, find-error, ai-check

### Practice Hub (`/practice`)
- Reading: 20+ types (bubble selection, comprehension, diagram mapping, highlight, match pairs, reorder, etc.)
- Listening: 9 types (conversation, fill blanks, interactive, order, passage, select, type, etc.)
- Writing and Speaking sections

### AI Practice (`/ai-practice`)
- Scenario-based conversations with an AI language tutor
- Text-to-speech playback via Web Speech API (`AudioPlayer.tsx`)
  - Waits for voices to load before speaking
  - Prefers French voices when available
  - Gracefully ignores `interrupted`/`canceled` speech errors
- General and scenario-specific chat modes

### Stories (`/stories`)
- Story browser and reader
- Learn mode for vocabulary in context

---

## Data Fetching

- **TanStack Query** manages all server state and caching
- API base URL: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
- `src/utils/practiceFetcher.ts` — fetches practice questions from the backend; if the backend is unavailable, automatically falls back to the matching CSV file in `public/mock-data/`

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in redirect path | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up redirect path | Yes |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Post sign-in redirect | Yes |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Post sign-up redirect | Yes |
| `NEXT_PUBLIC_API_URL` | FastAPI backend base URL | No (falls back to mock data) |

---

## Docker

A `Dockerfile` and `nginx.conf` are included for containerized deployment.

```bash
docker build -t langlearn .
docker run -p 3000:3000 langlearn
```

---

## Deployment

### Vercel (recommended)

1. Import the repository on [vercel.com](https://vercel.com)
2. Add all environment variables from `.env.example`
3. Deploy

### Netlify

1. Connect the repository on [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

---

## Notes

- `typescript.ignoreBuildErrors: true` is set in `next.config.mjs` — TypeScript errors do not block production builds
- `.next/` is gitignored — do not commit build artifacts
- Mock CSV data lives in `public/mock-data/` and is served statically — no backend needed for practice exercises
