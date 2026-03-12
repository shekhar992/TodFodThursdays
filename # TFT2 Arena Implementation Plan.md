# TFT2 Arena Implementation Plan

## Goal

Turn the current neon UI prototype into a convincing interactive product demo where admin actions visibly affect the player experience in real time using local frontend state.

## Current Status

The project now has:

- App shell with role switching
- Player home page
- Admin dashboard
- **Shared arena state** — teams, announcements, highlight events, upcoming events, and active puzzle
  are all held in `App.tsx` and passed as props throughout the tree
- Strong visual identity and animation system

Admin actions now mutate live shared state:

- Post Announcement → immediately appears in the announcement ticker
- Add Event → immediately appears in the player-facing upcoming events grid
- Launch Puzzle → immediately replaces the active puzzle in the player arena (PuzzleArena resets via `key`)
- Update Team Score → immediately updates the leaderboard

Player-facing display components (`AnnouncementTicker`, `PuzzleArena`, `EventHighlights`,
`UpcomingEvents`) no longer import mock data directly — they consume live props only.

## Implementation Phases

### Phase 1: Shared State Foundation ✅ COMPLETED

Objective:
Create a single source of truth for all arena data.

Scope:
- Move mock data into top-level app state or a small React context
- Manage:
  - teams
  - announcements
  - highlight events
  - upcoming events
  - active puzzle
- Pass state and actions down through props or context

Output:
Admin and player views read from the same live state.

### Phase 2: Wire Admin Actions ✅ COMPLETED

Objective:
Make the admin dashboard functional.

Scope:
- Add Event should create a new upcoming event
- Post Announcement should update the announcement ticker
- Launch Puzzle should replace the active puzzle
- Update Team Score should continue updating leaderboard values

Output:
Switching from admin to player shows real changes.

### Phase 3: Refactor Display Components ✅ COMPLETED

Objective:
Remove direct imports of mock data from visual components.

Scope:
- AnnouncementTicker should receive announcements as props
- PuzzleArena should receive active puzzle as prop
- EventHighlights should receive highlight events as prop
- UpcomingEvents should receive events as prop

Output:
UI components become reusable and data-agnostic.

### Phase 4: Product UX Pass

Objective:
Improve demo credibility and usability.

Scope:
- Empty states for missing events or puzzle
- Better form validation
- Success and error messaging
- Smooth section navigation
- Mobile layout review
- Stronger player/admin mode distinction

Output:
The prototype feels intentional and presentation-ready.

### Phase 5: Routing Preparation

Objective:
Match the intended role-based product structure.

Scope:
- Add routes for `/` and `/admin`
- Keep dev role switcher for preview mode
- Prepare for future auth gating

Output:
The prototype structure aligns with the planned real app.

### Phase 6: Backend-Ready Data Layer

Objective:
Avoid coupling UI directly to mock data forever.

Scope:
- Define local actions such as:
  - createEvent
  - postAnnouncement
  - launchPuzzle
  - updateTeamScore
- Keep a clean boundary so these can later call APIs

Output:
Future backend integration becomes straightforward.

### Phase 7: Documentation

Objective:
Make the project easy to demo and hand off.

Scope:
- Add README
- Document:
  - setup
  - scripts
  - feature overview
  - demo flow
  - future backend plan

Output:
The project is understandable without verbal explanation.

## Recommended Build Order

1. Shared state foundation
2. Admin action wiring
3. Component refactor
4. UX polish
5. Routing
6. Backend-ready abstractions
7. Documentation

## Immediate Next Task

Implement Phase 4 — UX polish pass to improve demo credibility:
empty states, stronger form validation, smooth section navigation,
mobile layout review, and sharper player/admin mode distinction.

## Success Criteria For Next Milestone

- Empty state shown when no upcoming events exist
- Player/admin transition feels intentional and polished
- Mobile layout reviewed and corrected where needed
- All admin form fields have clear validation feedback
- Role switching demonstrates a full live workflow