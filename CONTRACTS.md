# CONTRACTS — read before writing code

Shared, already-written foundation. **Do not modify anything in `lib/`.**

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
`three` · `@react-three/fiber` v9 · `@react-three/drei` v10 ·
`@react-three/postprocessing` · `zustand` v5 · `framer-motion` · `maath`.

Node 24 / npm. Project root: `C:\Users\willi\sia-seat-picker`.

## Hard rules for every agent

1. **Only create/edit files inside your assigned directories.** Never touch
   `package.json`, `lib/**`, `app/layout.tsx`, `app/globals.css`,
   `components/scene/**` (except your listed files), or another agent's folder.
2. **Do not run `npm install`, `npm run dev`, or `npm run build`.** A dev server
   and installs are already handled. Concurrent builds corrupt `.next`.
   `npx tsc --noEmit` is allowed; only fix errors in files you own.
3. Everything that uses hooks/three needs `"use client"` at the top of the file.
4. Import with the `@/` alias (`@/lib/store`, `@/components/...`).
5. No new npm dependencies. Use what is listed above.
6. No network assets (no CDN textures, no drei `Environment` presets that fetch
   HDRIs). Generate textures on canvas or use `<Lightformer>`.
7. TypeScript strict. No `any` unless truly unavoidable. No `@ts-ignore`.
8. Match the existing visual language: deep navy, gold accents, glass panels,
   generous whitespace. See "Design language" below.

## Coordinate system (metres)

- `+X` = starboard (right), `+Y` = up, `+Z` = aft. **Nose points toward −Z.**
- Cabin floor is `y = 0`. Cabin inner radius `1.72`, fuselage radius `1.88`,
  fuselage axis at `y = 0.95`.
- Aircraft length 39.5 m: nose `z = −19.75`, tail `z = +19.75`.
- Seats: rows start at `z = −14.0`. First rows 1–2, Business 3–6, Economy 7–29.
- Seat world position helper: `seatWorldPosition(seat) → [x, 0.46, z]`.

## Available from `lib/`

```ts
// lib/types.ts
CabinClass = "first" | "business" | "economy"
SeatStatus = "available" | "occupied"
Step = "search" | "results" | "passengers" | "seats" | "review" | "confirmation"
ScenePhase = "overview" | "flying" | "in-seat" | "confirming"
FareFamily = "lite" | "value" | "flex"
Seat, CabinConfig, Flight, PassengerDetails, SearchParams, Confirmation, SeatFilter

// lib/seatmap.ts
AIRCRAFT              // { length, noseZ, tailZ, fuselageRadius, cabinRadius,
                      //   fuselageAxisY, floorY, wingSpan, cabinFrontZ, cabinRearZ }
CABINS: CabinConfig[]
CABIN_BY_CLASS        // Record<CabinClass, CabinConfig>
SEATS: Seat[]
SEAT_BY_ID: Map<string, Seat>
TOTAL_SEATS: number
EXIT_ROWS: Set<number>
AISLE_X = 0
seatById(id): Seat | undefined
seatsInCabin(cabin): Seat[]
seatsForRow(row): Seat[]
cabinRows(cabin): number[]
cabinExtent(cabin): { front: number; rear: number }
seatWorldPosition(seat): [number, number, number]

// lib/theme.ts
cabinColor            // Record<CabinClass, { base, glow, dim, label, perk }> (hex strings)
statusColor           // { available, occupied, selected }
palette               // { navy, navyDeep, ink, gold, goldBright, mist, white }
BRAND                 // { name, tagline, flightPrefix }

// lib/store.ts
useBooking            // zustand store, see shape below
bookingTotal(state)   // number — fare total in SGD

// lib/flights.ts
FLIGHTS: Flight[]
FLIGHT_BY_ID: Map<string, Flight>
flightById(id): Flight | undefined
AIRPORTS: { code, city, country }[]
FARES: { id, name, price, blurb, perks[] }[]

// lib/camera.ts
STEP_POSE: Record<Step, Pose>          // { position, target, fov }
seatViewPose(seat): Pose
approachPose(seat): Pose
confirmingPose(seat): Pose
```

## Store shape (`useBooking`)

```ts
{
  step: Step;
  search: { origin, destination, date, passengers, cabin };
  flightId: string | null;
  fare: FareFamily;
  passenger: { firstName, lastName, email, phone };
  selectedSeatId: string | null;
  hoveredSeatId: string | null;
  phase: ScenePhase;
  filter: { cabin, window, aisle, exitRow, extraLegroom, maxPrice };
  confirmation: { pnr, boardingGroup, issuedAt } | null;
  hydrated: boolean;

  setStep(step); updateSearch(patch); selectFlight(id); setFare(f);
  updatePassenger(patch); updateFilter(patch);
  hoverSeat(id | null); selectSeat(id); arriveAtSeat(); confirmSeat();
  setPhase(phase); releaseSeat(); resetBooking();
}
```

The store is persisted to `sessionStorage` with `skipHydration`; `<BookingHydrator/>`
in the root layout calls `useBooking.persist.rehydrate()` after mount. Never read
persisted values during render on the server.

## Shared mutable scene state (60fps, no re-renders)

`components/scene/sceneState.ts` is owned by the orchestrator and will exist at
integration time:

```ts
export const sceneState = {
  reveal: 1,      // 0 = roof cut away (overview), 1 = fully enclosed
  progress: 0,    // fly-in progress 0..1
  inside: 0,      // 0 = outside, 1 = inside the cabin
  reduce: false,
};
```

Read it inside `useFrame`, mutate materials/refs directly. Do not `setState` at
60fps.

## Module contracts

### `components/aircraft/**` (agent: aircraft)

`components/aircraft/Aircraft.tsx` must export:

```tsx
export function Aircraft(): JSX.Element
```

It renders the **exterior** only, positioned in world space as described above:
fuselage, nose cone, tail cone + fin, wings + blended winglets, two CFM56
engines on pylons, horizontal stabilisers, and landing gear.

Inside `useFrame`, read `sceneState.reveal`:
- `reveal <= 0.02` → the roof section is fully hidden (top-down cutaway) and the
  cabin is readable from above.
- As `reveal` rises, the roof fades in (`transparent`, opacity) and the upper
  side skin becomes more opaque.
- Always keep the belly, nose and tail opaque so the silhouette holds.
- Also damp total exterior skin opacity with `sceneState.inside` if useful, but
  never cull the geometry (front-face culling already lets the camera see out
  from inside).

Build the fuselage from **separate meshes** (roof / port wall / starboard wall /
belly / nose / tail) so the roof can fade independently. `side: THREE.FrontSide`
on the shell.

Livery: white/ivory body, deep navy tail with a gold abstract wing/bird mark,
gold cheatline running the length of the fuselage, registration `9V-MBA`,
`SINGAPORE` style wordmark optional (keep it abstract — no copied logo). Use
canvas-generated textures in `components/aircraft/textures.ts`.

Props: none. Keep everything self-contained. Target ≤ ~120k triangles total.
Cache generated textures at module scope.

### `components/cabin/**` (agent: cabin)

`components/cabin/Cabin.tsx` must export:

```tsx
export function Cabin(): JSX.Element
```

Interior only: floor/carpet, curved sidewalls with **actual window cut-outs**
(ring frames + a bright exterior plane behind each window), overhead bins,
PSU strip, ceiling panels, front/rear galleys, two lavatories, bulkheads and
curtains between cabins. Interior surfaces must be visible from inside
(`side: THREE.DoubleSide` or inward-facing geometry).

`components/cabin/Seats.tsx` must export:

```tsx
export function Seats(): JSX.Element
```

- Renders all 162 seats from `SEATS` using `InstancedMesh` (one instanced mesh
  per seat part, split per cabin so First / Business / Economy can have
  different geometry). ~9 draw calls total.
- Hover: `onPointerMove` → `event.instanceId` → `hoverSeat(seat.id)`; slight
  lift + `cabinColor[cabin].glow` tint on the hovered instance. `onPointerOut`
  clears it. `onClick` → `selectSeat(seat.id)`; ignore occupied seats.
- Selected seat (from store) is tinted `statusColor.selected` and lifted a few
  cm; occupied seats use `statusColor.occupied` and stay visible but unclickable.
- `raycast` must remain enabled. Set `document.body.style.cursor` while hovering
  an available seat, restore on unmount.

`components/cabin/CabinLabels.tsx` — optional, export
`<CabinLabels visible={boolean} />` with drei `<Text>` zone labels
`FIRST / BUSINESS / ECONOMY` floating just above the cabin, used in overview.

### `components/scene/CameraDirector.tsx` + `Effects.tsx` (agent: camera)

```tsx
export function CameraDirector(): null   // renders nothing, drives useThree().camera
export function Effects(): JSX.Element   // EffectComposer contents
```

- Derive `step` from `usePathname()` (`/` → search, `/results`, `/passengers`,
  `/seats`, `/review`, `/confirmation`).
- On non-seat steps: damp position/target/fov toward `STEP_POSE[step]` using
  `easing.damp3` / `easing.damp` from `maath/easing`. Idle drift is welcome.
- On `/seats`:
  - `phase === "overview"` → damp to `STEP_POSE.seats` (top-down).
  - `phase === "flying"` + `selectedSeatId` → build a `CatmullRomCurve3`
    through `STEP_POSE.seats.position` → `approachPose(seat).position` →
    `seatViewPose(seat).position`, and a second curve for the look-at targets.
    Animate `progress` 0→1 over ~1.6 s with an ease-out-heavy curve, then call
    `arriveAtSeat()`. Write `progress` into `sceneState`.
  - `phase === "in-seat"` → damp to `seatViewPose(seat)`; add subtle breathing
    bob and pointer free-look capped at ±18° on both axes. (Use
    `state.pointer`, and only after the fly-in finishes.)
  - `phase === "confirming"` → damp to `confirmingPose(seat)`.
  - Reversing (back to overview) should play the curve in reverse.
  - Write `sceneState.reveal` and `sceneState.inside` based on progress so the
    aircraft roof closes as you sink inside. `reveal` should go 0→1 between
    progress 0.15 and 0.55; `inside` 0→1 between 0.45 and 1.
- Reduced motion: `prefers-reduced-motion` → snap with a short 0.25 s damp
  instead of the flight, and still call `arriveAtSeat()`.
- Use `useFrame`; never `setState` per frame. Always call `camera.updateProjectionMatrix()`
  when the fov changes.

`Effects`: `EffectComposer` with `N8AO` (or SSAO), subtle `Bloom`
(`luminanceThreshold 0.75`, `intensity ~0.5`), `Vignette`, `SMAA`. Keep it cheap:
no DOF. Must not crash if a pass fails to load.

### `app/seats/page.tsx` + `components/seats/**` (agent: seat-ux)

`app/seats/page.tsx` (default export, `"use client"`):
- Calls `setStep("seats")` on mount.
- Renders the seat-selection chrome **as a pointer-events-none overlay** so the
  3D canvas behind it stays clickable. Panels re-enable pointer events
  (`pointer-events-auto`).
- Header: flight summary (`SQ 938 · SIN → DPS · 737-800`), exit/back link.
- `components/seats/FilterBar.tsx` — cabin selector (All/First/Business/Economy)
  + chips for Window, Aisle, Exit row, Extra legroom + max price. Writes to
  `useBooking.updateFilter`.
- `components/seats/Legend.tsx` — class colours + available/occupied/selected.
- `components/seats/SeatDetailCard.tsx` — only when `phase === "in-seat"` or
  `"confirming"`: seat id, cabin, zone, perks, price, `Confirm this seat` →
  `confirmSeat()`, `Choose another` → `releaseSeat()`. Glass card, framer-motion
  slide-up. When `phase === "confirming"`, show a confirmation state with
  `Continue to payment` → route to `/review`.
- While `phase === "flying"`, show a small "Taking you to your seat…" indicator.
- `components/seats/CabinSummary.tsx` — compact counts per cabin (used in the
  filter bar or header).

Must respect `filter` when showing availability hints (dim/hide non-matching
seats in the legend counts; the 3D map itself is filtered by the cabin agent's
`Seats` only for tinting — pass nothing, it reads the store itself).

### Booking pages + `components/booking/**` (agent: booking-ui)

- `app/page.tsx` — search hero. Brand lockup, origin/destination selects
  (`AIRPORTS`), date, passengers, cabin, `Search flights` → `/results`
  (calls `updateSearch`).
- `app/results/page.tsx` — 3 `FLIGHTS` cards with fare family selector
  (`FARES`), `Select` → `selectFlight(id)` then `/passengers`.
- `app/passengers/page.tsx` — form bound to `updatePassenger`; continue →
  `/seats`. Basic validation (name + email required).
- `app/review/page.tsx` — order summary, fake card form (format-only), total via
  `bookingTotal`, `Pay` → `/confirmation`.
- `app/confirmation/page.tsx` — boarding pass stub with PNR, seat, gate, group,
  `Start over` → `resetBooking()` + `/`.
- `components/booking/Stepper.tsx` — 6 steps, current highlighted, clickable back
  navigation only to completed steps.
- `components/booking/PageShell.tsx` — shared page wrapper (title, subtitle,
  back link, content width) with `pointer-events-auto` glass card.
- `components/booking/BoardingPass.tsx` — the stub.
- Every page calls `setStep(...)` on mount and must not crash on direct load
  (guard missing state: no flight selected → show a "Start a new search" CTA,
  no seat → `/seats`).

## Design language

- Page background is transparent — the 3D canvas is behind everything. Wrap
  content in glass panels: `bg-[#0a1b33]/70 backdrop-blur-xl border border-white/10
  rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]`.
- Type: white/`#F3F7FA` headings, `#A9BACB` secondary, gold `#D9B15C` for
  accents, prices, active states.
- Tailwind v4 — no `tailwind.config.js` needed; use arbitrary values freely.
- Buttons: primary = gold gradient (`from-[#F2D493] to-[#C99B3F]`, navy text,
  `rounded-full`), secondary = `border-white/15 text-white hover:bg-white/10`.
- Keep headings tight (`tracking-tight`), use tabular numbers for times/prices.
- Mobile: panels go full-width bottom sheets; nothing may overflow horizontally.

## Verifying your work

`npx tsc --noEmit` from the project root. Errors in files you don't own are
expected while other agents are still writing — ignore those. Do not "fix"
another agent's file by editing it. Report what you built and any interface
deviations in your final message.
