# Silverkris Air — 3D seat selection

A seat-selection experience for a Boeing 737-800. The plane is shown from
directly above as a cutaway; tapping a seat flies the camera down into the
cabin and lands you standing in the aisle, where you confirm the seat.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
react-three-fiber, drei, three.js and zustand.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build && npm start   # production
```

## The flow

```
/            search        ─ plane sits three-quarter view, glass search panel
/results     flights       ─ three SQ services, fare families
/passengers  details       ─ passenger form
/seats       seat map      ─ top-down cutaway → fly-in → in-seat confirm
/review      payment       ─ order summary + fake card form
/confirmation done         ─ boarding pass stub
```

## How the "fly inside" works

Everything lives in **one scene with one camera** — there is no scene swap:

- The exterior shell is generated procedurally. The fuselage is swept along a
  spine curve so the tail cone upsweeps correctly, and the shell is split into
  roof / sides / belly / nose / tail meshes so the roof can disappear for the
  cutaway view.
- The cabin interior (sidewalls, windows, bins, galleys, seats) is modelled at
  real scale and always present inside the shell.
- `components/scene/sceneState.ts` holds a few mutable numbers (`reveal`,
  `progress`, `inside`) written by the camera director inside `useFrame` and
  read by the aircraft's materials. No React re-renders run at 60fps.
- On seat click, the camera is animated along a `CatmullRomCurve3` through the
  overview pose, a point above the chosen row, and the in-seat pose. The roof
  fades back in partway down, so you sink into the tube rather than cutting to
  an interior.
- All 162 seats are drawn with a handful of `InstancedMesh` draw calls;
  hover/selection re-tints and lifts individual instances.

## Seat layout (illustrative)

| Cabin    | Rows | Config | Seats |
| -------- | ---- | ------ | ----- |
| First    | 1–2  | 2-2    | 8     |
| Business | 3–6  | 2-2    | 16    |
| Economy  | 7–29 | 3-3    | 138   |

Real Singapore Airlines 737-800s are **two-class** (Business + Economy); the
First cabin here is an illustrative demo configuration. All livery, branding
and the bird mark are original/abstract — no airline trademarks are used.

Seat positions are generated from a per-cabin pitch in `lib/seatmap.ts`, so
changing a row count reflows the whole aircraft. Swapping in a widebody layout
is a config change, not a 3D rebuild.

## Structure

```
app/                     route per booking step
components/aircraft/     procedural exterior (fuselage, wings, engines, gear)
components/cabin/        interior shell + instanced seats + zone labels
components/scene/        canvas, camera director, lighting, effects, state
components/booking/      search / results / passenger / review / boarding pass
components/seats/        seat-map overlay UI (filters, legend, confirm card)
lib/                     types, seat map, flights, store, camera poses, theme
```

## Design notes

- Studio lighting is built from `<Lightformer>` panels rather than an HDRI, so
  nothing is fetched from a CDN at runtime or build time.
- Post-processing: N8AO, light bloom, vignette, SMAA. No depth of field.
- `prefers-reduced-motion` shortens the camera flight to a fade.
- The whole scene is decorative: a 2D booking flow works without it.
