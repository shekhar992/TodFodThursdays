# TodFod Season 2 Arena — Implementation Plan

> **Last Updated:** 23 March 2026 — Phase 14 Shoutouts & Micro Awards system built
> **Production URL:** https://todfod-thursdays.vercel.app/
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
| 2.5 | Hero Banner + Branding | ✅ Complete | Full rewrite: animated leader card, glory tagline, gap teaser, Season 2 identity |
| 2.6 | Auth System | ✅ Complete | Login, Signup, Reset Password pages; Admin user management; role-based access |
| 2.7 | Player Profile + Team Views | ✅ Complete | PlayerProfilePanel, TeamView, PlayerHeader, SeasonTimeline, PastEvents |
| 3 | Admin Workflow | ✅ Complete | Full admin panel: Events, Puzzles, Scores, Teams, Players, Announcements, Users |
| 4 | Mobile Player View | ✅ Complete | PlayerDashboard with all sections; responsive single-column layouts |
| 5 | Puzzle Timer + First-to-Answer | 🔄 In Progress | `usePuzzleTimer` hook + PuzzleModal built; countdown bar visible to players |
| 6 | Rank Change Animation System | ⏳ Not Started | Live scoreboard feel |
| 7 | Presenter / Big Screen Mode | ✅ Complete | StageView: fullscreen, particles, confetti, AnnouncementTicker at top |
| 8 | Toast Notification System | ⏳ Not Started | Live event feedback |
| 9 | Puzzle Reveal Screen | ⏳ Not Started | Dramatic answer reveal |
| 10 | Session & Round System | ⏳ Not Started | Structured event flow |
| 11 | Sound Design | ✅ Complete | `sound.ts` Web Audio API implementation (no external dependency) |
| 12 | QR Code Join Screen | ⏳ Not Started | `/join` route — or print QR from browser |
| 13 | Export & Share | ⏳ Not Started | Post-event results |
| 14 | Shoutouts & Micro Awards | 🔄 In Progress | DB + hook + admin tab + player highlights built |

---

## Strategic Build Order

Ranked by game-night impact. Build in this sequence:

1. **Phase 9 — Puzzle Reveal Screen** — Highest drama moment; biggest gap in live experience right now
2. **Phase 6 — Rank Change Animations** — Makes the leaderboard feel like a live scoreboard, not a table
3. **Phase 5 completion** — First-correct-answer bonus + "X teams answered" live count
4. **Phase 14 — Shoutouts & Micro Awards** — Recognition system + Last Event Highlights ← *in progress*
5. **Phase 8 — Toast Notifications** — Player awareness bridge between admin actions and phone screens
6. **Phase 13 — Export & Share** — Post-event memory; low effort, high goodwill

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

**Status: ✅ Complete**

### Tasks

#### 3.1 — Inline Score Editor on Leaderboard
- [x] Admin sees editable score field directly on each leaderboard row (`AdminScores.tsx`)
- [x] Score input with current value, saves on blur/Enter
- [x] Optimistic update + Supabase write on every change

#### 3.2 — Event Status Manager
- [x] Event cards show current status: Upcoming / Live / Completed
- [x] One-click status transitions: Upcoming → Live → Completed (`AdminEvents.tsx`)
- [x] Only ONE event can be `live` at a time
- [x] Status change writes to Supabase → real-time update on player screen

#### 3.3 — Media Upload on Events (Cloudinary)
- [x] `MediaUploader.tsx` — drag-and-drop or file picker with progress indicator
- [x] Preview thumbnail after upload
- [x] `cloudinary_public_id` stored in Supabase; served via `cloudinaryUrl()` helper

#### 3.4 — Announcement Quick-Post
- [x] Sticky quick-post bar at top of admin (`AdminPanel.tsx`)
- [x] Preset chips ("Puzzle is live!", "Round ended", etc.) — click to populate input before posting
- [x] Character limit indicator
- [x] Supabase write → AnnouncementTicker updates in real-time for all browsers
- [x] Delete persists to Supabase (Realtime propagates removal)
- [x] Ticker hidden when no announcements; no automatic/fallback strings

#### 3.5 — Puzzle Builder UX
- [x] `AdminPuzzles.tsx` — full puzzle management with library and live launcher
- [x] Launch from library auto-tracks which library puzzle is active
- [x] Puzzle auto-removed from library when solved (via `launchedLibraryId` + useEffect)
- [x] Active puzzle indicator; End Puzzle button

#### 3.6 — Team & Player Management
- [x] `AdminTeams.tsx` — create/edit teams with color + emoji
- [x] `AdminPlayers.tsx` — assign players to teams, designate captains
- [x] Team filter pill bar in Players admin for quick per-team review

#### 3.7 — Admin User Management
- [x] `AdminUsers.tsx` — grant/revoke admin role via Supabase `supabaseAdmin` client

### Acceptance Criteria
- [x] Admin can update a score in under 3 clicks
- [x] Event status change reflects on player screen within 500ms
- [x] Image upload completes and URL is stored in Supabase
- [x] Post-announcement → visible in player ticker within 500ms
- [x] Delete-announcement → removed from all browsers instantly
- [x] All admin controls have clear labels and confirmation on destructive actions

---

## Phase 4 — Mobile Player View

**Goal:** Dedicated phone-optimized layout for the player screen.

**Status: ✅ Complete**

### Tasks
- [x] `PlayerDashboard.tsx` — full player experience with all sections
- [x] `PlayerHeader.tsx` — compact top bar with team identity
- [x] `LiveStandings.tsx` — div-based expandable rows (table replaced); 3-column drawer per team (Events / Puzzles / Members); medal ✦ sparkle animation
- [x] `ChallengeBanner.tsx` — puzzle CTA banner when active puzzle is live
- [x] `PuzzleModal.tsx` — full puzzle interaction with timer, hints, submit
- [x] `SeasonTimeline.tsx` — horizontal scrollable timeline with scroll-hint chevron
- [x] `DynamicCallout.tsx` — next event countdown card
- [x] `EventsView.tsx` / `PastEvents.tsx` / `UpcomingEvents.tsx` — event history and previews
- [x] `PlayerProfilePanel.tsx` — player stats, team info, achievement display
- [x] `TeamView.tsx` — team roster and captain info
- [x] `AnnouncementTicker.tsx` — gold scrolling news bar; hidden when empty
- [x] `SpinnerPage.tsx` — loading state while data fetches

### Acceptance Criteria
- [x] All components render on 375px (iPhone SE) viewport
- [x] No raw horizontal scroll on any section
- [x] All text legible at arm's length

---

## Phase 5 — Puzzle Timer + First-to-Answer

**Goal:** Live countdown urgency + bonus for speed.

**Status: 🔄 In Progress** — hook and modal built; bonus pts + answer count pending.

### Tasks
- [x] `usePuzzleTimer.ts` hook — countdown state synchronized with puzzle `time_limit`
- [x] `PuzzleModal.tsx` — countdown bar visible to players while puzzle is active
- [x] Auto-close on timeout → "Time's up" state
- [ ] First correct submission gets configurable bonus pts
- [ ] Answer count shown live: "3 teams answered"

---


---

## Phase 6 — Rank Change Animation System

**Goal:** Leaderboard reacts visually when scores change.

**Status: ⏳ Not Started** — Build after Phase 9

### Tasks
- [ ] Animated row reorder with spring physics when rankings shift
- [ ] `+150 pts` float animation on updated row
- [ ] `↑2 / ↓1` rank delta badge, fade after 3s
- [ ] Gold flash overlay when Rank 1 changes

---

## Phase 7 — Presenter / Big Screen Mode

**Goal:** Host projects a clean, readable leaderboard + live info on a big screen.

**Status: ✅ Complete**

### Tasks
- [x] `StageView.tsx` — dedicated fullscreen broadcast component
- [x] Animated score display at large font size; team names prominent
- [x] `AnnouncementTicker` rendered at top of stage (`z-30`)
- [x] Medal ✦ sparkles on podium positions (two per medal, staggered)
- [x] Particle effects + confetti animations
- [x] Header/nav/admin controls hidden in stage mode

---

## Phase 8 — Toast Notification System

**Goal:** Players always know what's happening without checking the screen constantly.

**Status: ⏳ Not Started**

### Tasks
- [ ] Non-blocking toasts: bottom-right, slide in
- [ ] Triggers: puzzle live, announcement posted, round ended
- [ ] Auto-dismiss 4s, manually dismissible
- [ ] `aria-live="polite"` for screen reader support

---

## Phase 9 — Puzzle Reveal Screen

**Goal:** Dramatic answer reveal after each puzzle closes.

**Status: ⏳ Not Started** — **Build this first (highest drama, biggest gap)**

### Tasks
- [ ] Full-screen reveal triggered when `is_active` flips false on the puzzle
- [ ] Shows: correct answer, which team solved it, player name, awarded points + speed multiplier
- [ ] Shows: "Timed out" state if no team solved in time
- [ ] 3s countdown before auto-return to leaderboard (admin can hold or advance manually)
- [ ] Triggers on both StageView (projector) and PlayerDashboard (phone)

---

## Phase 10 — Session & Round System

**Goal:** Structured event flow: Season → Rounds → Puzzles.

**Status: ⏳ Not Started**

### Tasks
- [ ] Round concept: Round 1 → Semis → Finals
- [ ] Host controls: start round, end round, reset puzzle state
- [ ] Per-round standings archived
- [ ] Round label in header and leaderboard

---

## Phase 11 — Sound Design

**Goal:** Signature live event audio layer.

**Status: ✅ Complete**

### Tasks
- [x] `src/lib/sound.ts` — Web Audio API implementation (zero external dependencies)
- [x] Sounds: countdown tick, correct answer chime, puzzle launch, rank change
- [x] Master mute toggle
- [x] Respects `prefers-reduced-motion` — auto-mutes when set

---

## Phase 12 — QR Code Join Screen

**Goal:** Get 30 people on the right URL in 10 seconds.

**Status: ⏳ Not Started**

### Tasks
- [ ] `/join` route — fullscreen component sized for projector/TV
- [ ] Large QR code generated client-side pointing to `https://todfod-thursdays.vercel.app/`
- [ ] URL printed below QR in large readable font
- [ ] Styled to match arena theme (dark purple, gold glow ring around QR)
- [ ] Shows: event name, season number, current team count
- [ ] Admin toggle: "Show Join Screen" button in admin panel

---

## Phase 13 — Export & Share

**Goal:** Post-event wrap-up and receipts.

**Status: ⏳ Not Started**

### Tasks
- [ ] Final standings card (shareable image via `html2canvas`)
- [ ] CSV export: scores, puzzle results, announcement log
- [ ] Screenshot-optimised "Results" view

---

## Phase 14 — Shoutouts & Micro Awards

**Goal:** Two-track recognition system — admin-created manual shoutouts and system-calculated auto badges — both optionally awarding points that roll up to team totals. Displayed on player dashboard as "Last Event Highlights" with display priority logic.

**Status: 🔄 In Progress**

### Architecture

**Two award tracks:**
- **Manual Shoutouts** — admin creates ad-hoc, any time, any recipient, optional points
- **Auto Badges** — system calculates after event ends and inserts as `pending`; admin reviews, edits points, and publishes

**Points rollup rule:** If recipient is a player → points always apply to their team's total. Player gets name credit; team gets score impact.

**Display priority on player dashboard:**
1. Active puzzle → ChallengeBanner always takes over
2. Today = next event's scheduled date → countdown owns the slot all day
3. Otherwise → "Last Event Highlights" fills the featured slot (stays until displaced by 1 or 2)
4. No highlights published yet → idle / leaderboard only

### Tasks

#### 14.1 — Database Schema ✅
- [x] `shoutouts` table: `id, event_id, event_title, badge_name, badge_emoji, recipient_type, recipient_name, team_id, team_name, points, status (pending|published|dismissed), published_at`
- [x] RLS: public select, authenticated write
- [x] Realtime enabled on `shoutouts`
- [x] Migration: `supabase/migrations/012_shoutouts.sql`

#### 14.2 — Types ✅
- [x] `ShoutoutsRow` type added to `src/lib/database.types.ts`

#### 14.3 — useShoutouts Hook ✅
- [x] `src/hooks/useShoutouts.ts` — fetch + Realtime subscription
- [x] Exposes: `pendingShoutouts`, `publishedShoutouts`, `latestEventShoutouts`
- [x] `latestEventShoutouts` = published shoutouts from most recently published event (for player dashboard)

#### 14.4 — ArenaContext Mutations ✅
- [x] `generateAutoShoutouts(eventId, eventTitle, eventStartedAt, results)` — calculates badges from completedPuzzles + inserts as pending
- [x] Auto badges: Event Champion 👑, First Blood 🩸, Speed Demon ⚡, On Fire 🔥
- [x] `publishShoutout(id, points, teamId?)` — publishes + calls `updateScore` if points > 0
- [x] `dismissShoutout(id)` — soft-discards pending badge
- [x] `addManualShoutout(data)` — creates + immediately publishes

#### 14.5 — Admin Shoutouts Tab ✅
- [x] `AdminShoutouts.tsx` built
- [x] **Pending panel** — auto-calculated queue with editable points, Publish / Dismiss
- [x] **Manual form** — badge presets, emoji, name, team or player picker, points
- [x] **Published log** — scrollable history with timestamps
- [x] `AdminPanel.tsx` sidebar: "Shoutouts" entry added between Scores and Teams

#### 14.6 — Auto-Calculation Hook in AdminEvents ✅
- [x] `handleMarkComplete` in `AdminEvents.tsx` calls `generateAutoShoutouts` after confirming results

#### 14.7 — Player Dashboard ✅
- [x] `LastEventHighlights.tsx` — horizontal scrollable card rail with staggered entrance
- [x] `PlayerDashboard.tsx` — featured slot priority: active puzzle → event day → highlights

### Auto Badge Conditions (v1)

| Badge | Condition | Data source |
|---|---|---|
| 👑 Event Champion | Top result in event | `results[0].teamId` |
| 🩸 First Blood | First puzzle solved | earliest `completedAt` |
| ⚡ Speed Demon | Speed multiplier > 1.75 (~<10s) | `awardedPoints / points` ratio |
| 🔥 On Fire | Team solved 2+ puzzles | `completedPuzzles` grouped by team |

### Acceptance Criteria
- [x] Completing an event auto-generates pending shoutouts in admin Shoutouts tab
- [x] Admin can edit points, publish, or dismiss each pending entry
- [x] Published shoutout with points → team score updates within 500ms for all browsers
- [x] Player dashboard shows Last Event Highlights when no active puzzle and not event day
- [x] Active puzzle correctly displaces Last Event Highlights
- [x] Event day countdown correctly displaces Last Event Highlights
- [x] Manual shoutout (no event) posts immediately to player dashboard

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
