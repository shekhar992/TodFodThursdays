# TodFod Season 2 Arena — Implementation Plan

> **Last Updated:** 13 March 2026 — Hero Banner + Admin Workflow Phase Added
> **Status Legend:** ⏳ Not Started · 🔄 In Progress · ✅ Complete · 🔒 Blocked

---

## Product Vision

TodFod Season 2 Arena is a **live event management and gamification platform** — a game show-style host dashboard + audience participation screen for competitive seasonal events. Host runs it on a laptop/projector; teams play on their phones.

---

## Phase Status Overview

| Phase | Title | Status | Notes |
|---|---|---|---|
| 1 | UX Foundation | ✅ Complete | All audit fixes applied, build passing |
| 2 | Real-time Data Layer | ✅ Complete | Supabase + Cloudinary, graceful mock fallback |
| 2.5 | Hero Banner + Branding | ✅ Complete | TodFod Season 2 hero, stats row, gradient text |
| 3 | Admin Workflow | ⏳ Not Started | Score editor, media upload, event status manager |
| 4 | Mobile Player View | ⏳ Not Started | Dedicated phone layout |
| 5 | Puzzle Timer + First-to-Answer | ⏳ Not Started | Core game mechanic |
| 6 | Rank Change Animation System | ⏳ Not Started | Live scoreboard feel |
| 7 | Presenter / Big Screen Mode | ⏳ Not Started | Fullscreen projection |
| 8 | Toast Notification System | ⏳ Not Started | Live event feedback |
| 9 | Puzzle Reveal Screen | ⏳ Not Started | Dramatic answer reveal |
| 10 | Session & Round System | ⏳ Not Started | Structured event flow |
| 11 | Sound Design | ⏳ Not Started | Audio layer |
| 12 | QR Code Join Screen | ⏳ Not Started | `/join` route |
| 13 | Export & Share | ⏳ Not Started | Post-event results |

---

## Phase 1 — UX Foundation

**Goal:** Fix critical WCAG AA + touch UX failures before any feature work. Build on a solid base.

**Scope:** No new features. Existing components only.

### Tasks

#### 1.1 — Focus Rings on All Interactive Elements
- [x] Add global focus ring style in `index.css` using `box-shadow` (not `outline`) — 2px surface + 2px accent
- [x] Verify on: announcements button, nav links, puzzle input, submit button, hint button, close button, scroll buttons
- **Files:** `src/index.css`

#### 1.2 — Contrast Fixes
- [x] `#3A4555` → `#6B7A95` — used for column headers, "pts" sub-label, dim rank numbers
- [x] `#4D5A70` → `#7A8899` — used for secondary text, month labels, descriptions
- [x] Inactive nav links: `rgba(238,242,247,0.30)` → `rgba(238,242,247,0.55)`
- [x] `#3A4555` on subtitles (EventHighlights "Completed · Season 2") → `#6B7A95`
- **Files:** `src/App.tsx`, `src/components/Leaderboard.tsx`, `src/components/UpcomingEvents.tsx`, `src/components/EventHighlights.tsx`

#### 1.3 — Touch Targets: Minimum 44px
- [x] EventHighlights ← → buttons: `w-7 h-7` (28px) → `w-11 h-11` (44px)
- [x] PuzzleArena ✕ close button: `w-7 h-7` (28px) → `w-11 h-11` (44px)
- [x] Announcements "Latest" button: `min-h-[44px]` padding added
- [x] Nav link buttons: `py-3 min-h-[44px]` added
- **Files:** `src/components/EventHighlights.tsx`, `src/components/PuzzleArena.tsx`, `src/App.tsx`

#### 1.4 — ARIA Labels on Icon-Only Controls
- [x] EventHighlights ← button → `aria-label="Scroll left"`
- [x] EventHighlights → button → `aria-label="Scroll right"`
- [x] PuzzleArena ✕ button → `aria-label="Close puzzle"`
- [x] Announcements dropdown button → `aria-expanded={open}` + `aria-haspopup="true"`
- **Files:** `src/components/EventHighlights.tsx`, `src/components/PuzzleArena.tsx`, `src/App.tsx`

#### 1.5 — Replace Emoji Icons with Lucide SVG
- [x] Install `lucide-react`
- [x] EventHighlights: `←` → `<ChevronLeft />`, `→` → `<ChevronRight />`
- [x] PuzzleArena: `✕` → `<X />`, `→` submit → `<ArrowRight />`, `💡` → `<Lightbulb />`
- [x] EventCard: `📅` → `<Calendar />`, `👥` → `<Users />`
- **Files:** `src/components/EventHighlights.tsx`, `src/components/PuzzleArena.tsx`, `src/components/EventCard.tsx`

#### 1.6 — Reduce AnimatedScore Duration
- [x] 1500ms → 800ms in `Leaderboard.tsx`
- **Files:** `src/components/Leaderboard.tsx`

#### 1.7 — Add `prefers-reduced-motion` Gate
- [x] AnimatedScore: if reduced-motion → skip animation, show final value immediately
- [x] Leaderboard row stagger: skip delays if reduced-motion
- [x] UpcomingEvents card stagger: skip delays if reduced-motion
- **Files:** `src/components/Leaderboard.tsx`, `src/components/UpcomingEvents.tsx`

#### 1.8 — Add `<h1>` to Player Page
- [x] Add visually hidden `<h1>TFT2 Arena — Season 2</h1>` at top of Home.tsx
- **Files:** `src/pages/Home.tsx`

#### 1.9 — Align Header Container Width
- [x] Header inner div: `max-w-screen-xl` → `max-w-screen-2xl` (matches main content)
- **Files:** `src/App.tsx`

### Acceptance Criteria
- [x] All interactive elements show a visible focus ring when tabbed to
- [x] All text passes WCAG AA (4.5:1 for body, 3:1 for large text/UI components)
- [x] All touch targets ≥ 44px
- [x] No emoji in structural UI — all replaced with Lucide SVG
- [x] `npm run build` passes with zero TypeScript errors

---

## Phase 2 — Real-time Data Layer

**Goal:** Host on laptop, 30 players on phones — all synced live via Supabase Realtime.

**Architecture:** Supabase for DB + Realtime subscriptions · Cloudinary for event image/video uploads · Graceful fallback to mock data when credentials not set.

### Files Created
- `src/lib/supabase.ts` — Supabase client + `isSupabaseConfigured` flag
- `src/lib/database.types.ts` — TypeScript types for all 4 tables
- `src/lib/cloudinary.ts` — `uploadToCloudinary()` + `cloudinaryUrl()` utilities
- `src/hooks/useTeams.ts` — live teams + realtime subscription
- `src/hooks/useAnnouncements.ts` — live announcements + realtime
- `src/hooks/useEvents.ts` — live events split into highlight/upcoming + realtime
- `src/hooks/useActivePuzzle.ts` — active puzzle + realtime
- `supabase/schema.sql` — full SQL schema + RLS policies + seed data (paste into Supabase SQL editor)
- `.env.example` — template with all 4 required env vars

### Tasks
- [x] Install `@supabase/supabase-js`
- [x] Create `src/lib/supabase.ts` — client + `isSupabaseConfigured` export
- [x] Create `src/lib/database.types.ts` — typed schema for all 4 tables
- [x] Create `supabase/schema.sql` — tables, RLS, realtime, seed data
- [x] Create `src/hooks/useTeams.ts` — fetch + realtime subscription
- [x] Create `src/hooks/useAnnouncements.ts` — fetch + realtime subscription
- [x] Create `src/hooks/useEvents.ts` — fetch + realtime subscription
- [x] Create `src/hooks/useActivePuzzle.ts` — fetch + realtime subscription
- [x] Wire all 4 hooks into `App.tsx` — replace `useState(mock...)` with live data
- [x] Admin handlers write to Supabase (optimistic local + DB persist)
- [x] Create `src/lib/cloudinary.ts` — unsigned upload + URL transformation utility
- [x] Create `.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- [x] `npm run build` passes — ✓ built in 1.42s, 555KB (Supabase SDK adds ~170KB)

### To Activate (awaiting credentials)
1. Copy `.env.example` → `.env.local`
2. Fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from supabase.com → Settings → API
3. Paste `supabase/schema.sql` into Supabase SQL Editor and run it
4. Enable Realtime on all 4 tables: Database → Replication → toggle ON
5. Fill in `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET` from cloudinary.com

### Acceptance Criteria
- [x] Code builds clean — zero TS errors
- [x] Falls back to mock data seamlessly when credentials not provided
- [ ] Admin score change → player leaderboard updates within 500ms *(needs live credentials)*
- [ ] Admin puzzle launch → player sees banner within 500ms *(needs live credentials)*
- [ ] Two different browsers on two different devices both sync correctly *(needs live credentials)*

---

## Phase 3 — Admin Workflow

**Goal:** Give the host full control during a live event — edit scores, upload media, manage event status, and launch puzzles — all from a polished, mistake-proof interface.

**What exists today:** Basic `AdminDashboard` with score fields, announcement post, puzzle launcher, and event creation form. No media upload UI, no inline score editing, no event status toggling.

### Tasks

#### 3.1 — Inline Score Editor on Leaderboard
- [ ] Admin sees editable score field directly on each leaderboard row
- [ ] Click score → input appears with current value, Enter/blur saves
- [ ] ±50 / ±100 quick buttons beside each row (no full number entry needed for small changes)
- [ ] Optimistic update + Supabase write on every change

#### 3.2 — Event Status Manager
- [ ] Event cards in admin show current status badge: Draft / Scheduled / Live / Completed
- [ ] One-click status transitions: Scheduled → Live → Completed
- [ ] Only ONE event can be `live` at a time (auto-demotes previous)
- [ ] Status change writes to Supabase → player UpcomingEvents updates in realtime

#### 3.3 — Media Upload on Events (Cloudinary)
- [ ] Event form: image/video upload field using `uploadToCloudinary()` from `src/lib/cloudinary.ts`
- [ ] Drag-and-drop or file picker, shows upload progress bar
- [ ] Preview thumbnail after upload
- [ ] `cloudinary_public_id` stored in Supabase `events` table; served via `cloudinaryUrl()` helper
- [ ] Post-event "Add Memory" — admin can attach images/videos to completed events

#### 3.4 — Announcement Quick-Post
- [ ] Sticky "Post Announcement" bar at top of admin — always one click away
- [ ] Preset quick messages (e.g. "Puzzle is live!", "Round ended — check leaderboard") for speed
- [ ] Character limit indicator (max 120 chars)
- [ ] Posts to Supabase → ticker + dropdown updates for all players instantly

#### 3.5 — Puzzle Builder UX
- [ ] Inline preview of puzzle as players will see it
- [ ] "Launch" button is clearly destructive (red) with a confirmation step
- [ ] Active puzzle indicator in admin header — shows green dot when one is live
- [ ] "End Puzzle" button to deactivate and trigger reveal (Phase 9)

### Acceptance Criteria
- [ ] Admin can update a score in under 3 clicks
- [ ] Event status change reflects on player screen within 500ms
- [ ] Image upload completes and URL is stored in Supabase
- [ ] Post-announcement → visible in player ticker within 500ms
- [ ] All admin controls have clear labels and confirmation on destructive actions

---

## Phase 4 — Mobile Player View

**Goal:** Dedicated phone-optimized layout for the player screen.

### Tasks
- [ ] Full-width leaderboard readable from distance (score font ≥ 40px on mobile)
- [ ] Bottom-sheet puzzle CTA replacing top banner on mobile
- [ ] Sticky bottom nav replacing top nav links on `< md` breakpoints
- [ ] Cards expand to full-width single column on narrow screens

### Acceptance Criteria
- [ ] Passes on 375px (iPhone SE) and 390px (iPhone 14) viewport
- [ ] All text legible at arm's length
- [ ] No horizontal scroll on any mobile viewport

---

## Phase 4 — Puzzle Timer + First-to-Answer

**Goal:** Live countdown urgency + bonus for speed.

### Tasks
- [ ] Admin sets puzzle duration (30s / 60s / 90s)
- [ ] Animated countdown bar visible to players
- [ ] Auto-close on timeout → show "Time's up" state
- [ ] First correct submission gets configurable bonus pts
- [ ] Answer count shown live: "3 teams answered"

---

## Phase 5 — Rank Change Animation System

**Goal:** Leaderboard reacts visually when scores change.

### Tasks
- [ ] Animated row reorder with spring physics when rankings shift
- [ ] `+150 pts` float animation on updated row
- [ ] `↑2 / ↓1` rank delta badge, fade after 3s
- [ ] Gold flash overlay when Rank 1 changes

---

## Phase 6 — Presenter / Big Screen Mode

**Goal:** Host projects a clean, readable leaderboard on a big screen.

### Tasks
- [ ] `F` key or "Present" button → fullscreen mode
- [ ] Score font: 96px, team name: 32px
- [ ] Header/nav/DEV pill hidden
- [ ] Current time clock overlay for host
- [ ] High-contrast projection palette option

---

## Phase 7 — Toast Notification System

**Goal:** Players always know what's happening without checking the screen constantly.

### Tasks
- [ ] Non-blocking toasts: bottom-right, slide in
- [ ] Triggers: puzzle live, announcement posted, round ended
- [ ] Auto-dismiss 4s, manually dismissible
- [ ] `aria-live="polite"` for screen reader support

---

## Phase 8 — Puzzle Reveal Screen

**Goal:** Dramatic answer reveal after each puzzle closes.

### Tasks
- [ ] Full-screen reveal after puzzle closes
- [ ] Shows: correct answer, teams that answered correctly, bonus recipients
- [ ] 3s countdown before auto-return to leaderboard
- [ ] Host can hold or advance manually

---

## Phase 9 — Session & Round System

**Goal:** Structured event flow: Season → Rounds → Puzzles.

### Tasks
- [ ] Round concept: Round 1 → Semis → Finals
- [ ] Host controls: start round, end round, reset puzzle state
- [ ] Per-round standings archived
- [ ] Round label in header and leaderboard

---

## Phase 10 — Sound Design

**Goal:** Signature live event audio layer.

### Tasks
- [ ] Web Audio API (no external dependency)
- [ ] Sounds: countdown tick, correct answer chime, puzzle launch whoosh, rank change stab
- [ ] Master mute toggle in header
- [ ] Auto-mute when `prefers-reduced-motion` is on

---

## Phase 11 — QR Code Join Screen

**Goal:** Get 30 people on the right URL in 10 seconds.

### Tasks
- [ ] `/join` route with QR code pointing to player URL
- [ ] Full-screen mode for projector display during setup
- [ ] Auto-refresh if URL changes

---

## Phase 12 — Export & Share

**Goal:** Post-event wrap-up and receipts.

### Tasks
- [ ] Final standings card (shareable image via `html2canvas`)
- [ ] CSV export: scores, puzzle results, announcement log
- [ ] Screenshot-optimised "Results" view

---

## Design Principles (Non-Negotiable)

- **Ask before building** anything ambiguous
- **Design before code** — describe the UX intent before writing a component
- **Mobile-first** — every component must work at 375px before scaling up
- **No regression** — `npm run build` must pass after every phase
- **WCAG AA minimum** — 4.5:1 contrast, 44px touch targets, focus rings always
- **No emoji as icons** — Lucide SVG only after Phase 1
- **Semantic tokens** — no raw hex in components after Phase 2 refactor

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React (from Phase 1) |
| Realtime | Supabase (from Phase 2) |
| Build | Vite 8 |
| Fonts | Space Grotesk (headings) + Inter (body) |
