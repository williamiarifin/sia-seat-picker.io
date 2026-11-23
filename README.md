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

The app is a fully static export (see GitHub Pages below), so there is no
`next start`. To preview the production build:

```bash
npm run build      # writes ./out
npx serve out
```

## Deploy to GitHub Pages

Pushing to `main` deploys automatically via `.github/workflows/deploy.yml`:

1. `next.config.ts` builds with `output: "export"`, `trailingSlash: true` and a
   `basePath` read from `NEXT_PUBLIC_BASE_PATH`.
2. The workflow derives that base path from the repository name, so renaming
   the repo cannot break the build — a project site is served from
   `https://<user>.github.io/<repo>/`, and a `<user>.github.io` repo is served
   from the root.
3. It writes `out/.nojekyll` so Pages does not drop the `_next` asset folder,
   then publishes through `actions/deploy-pages`.

`lib/paths.ts` strips the base path from `usePathname()` before comparing
routes, otherwise the seat map would lose its pointer events under
`/<repo>/seats/`.

To reproduce a Pages build locally:

```powershell
$env:NEXT_PUBLIC_BASE_PATH="/your-repo-name"
npm run build
npx serve out
```

GitHub Pages on a **private** repo requires a paid plan; on the free plan the
repository has to be public. If you would rather keep it private, Vercel or
Cloudflare Pages work as-is — the export is just static files.

## Emailing the ticket

`/confirmation` can send a real copy of the boarding pass to the address entered
on the passenger step. Because the site is a static export, this goes through
[EmailJS](https://www.emailjs.com) directly from the browser — no backend, no
domain, no API secret.

It degrades gracefully: with no configuration the button is disabled and
"Save PDF" still works.

### Setup (about two minutes)

1. Create a free EmailJS account and **add a service** (connect Gmail, Outlook
   or any SMTP mailbox).
2. **Create an email template.** Set:
   - **To Email:** `{{to_email}}`
   - **Subject:** `Your Silverkris Air boarding pass — {{pnr}}`
   - **Body:** the HTML below (EmailJS' code editor handles it).
3. Copy the **Service ID**, **Template ID** and **Public Key** from the
   dashboard.
4. Provide them to the build, either locally in `.env.local`:

   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
   ```

   …or for GitHub Pages, add three **repository variables** in
   Settings → Secrets and variables → Actions → **Variables**:
   `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`. The deploy
   workflow already maps them into the build.
5. In EmailJS → Account → Security, restrict the public key to your Pages
   domain (`williamiarifin.github.io`) so nobody else can spend your quota.

### Template variables

| Variable | Example |
| --- | --- |
| `to_email` | the address typed on the confirmation page |
| `passenger_name` | Wei Tan |
| `pnr` | K7P2QX |
| `flight_number` / `origin` / `destination` | SQ 938 / SIN / DPS |
| `origin_city` / `destination_city` | Singapore / Denpasar |
| `depart` / `arrive` / `duration` | 08:20 / 11:05 / 2h 45m |
| `date` | Sat 18 December 2026 |
| `seat` / `cabin` / `seat_zone` | 12A / Economy / Exit row · extra legroom |
| `boarding_group` | 2 |
| `gate` / `terminal` | B4 / Terminal 2 |
| `aircraft` / `registration` | Boeing 737-800 / 9V-MBA |
| `total` | SGD 402 |

Template body:

```html
<table width="100%" cellpadding="0" cellspacing="0"
  style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a1b33;">
  <tr>
    <td style="background:#0a1b33;padding:20px 24px;color:#fff;">
      <div style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#d9b15c;">Silverkris Air</div>
      <div style="font-size:18px;font-weight:600;margin-top:6px;">Your boarding pass</div>
    </td>
  </tr>
  <tr>
    <td style="padding:24px;">
      <div style="font-size:10px;letter-spacing:.18em;color:#6b7a89;">PASSENGER</div>
      <div style="font-size:18px;font-weight:600;margin:2px 0 18px;">{{passenger_name}}</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:22px;font-weight:700;">{{origin}}</td>
          <td style="text-align:center;font-size:11px;color:#6b7a89;">{{depart}}<br />{{duration}}</td>
          <td style="text-align:right;font-size:22px;font-weight:700;">{{destination}}</td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #e6e2d8;">
        <tr>
          <td style="padding:12px 0;"><div style="font-size:10px;color:#6b7a89;">FLIGHT</div><div style="font-weight:600;">{{flight_number}}</div></td>
          <td style="padding:12px 0;"><div style="font-size:10px;color:#6b7a89;">DATE</div><div style="font-weight:600;">{{date}}</div></td>
          <td style="padding:12px 0;"><div style="font-size:10px;color:#6b7a89;">GATE</div><div style="font-weight:600;">{{gate}}</div></td>
          <td style="padding:12px 0;text-align:right;"><div style="font-size:10px;color:#6b7a89;">SEAT</div><div style="font-size:22px;font-weight:700;color:#b98f3c;">{{seat}}</div></td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#6b7a89;">
        Booking reference <strong style="color:#0a1b33;">{{pnr}}</strong> ·
        {{cabin}} · Boarding group {{boarding_group}}<br />
        {{terminal}} · {{aircraft}} · {{registration}}
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#0a1b33;padding:14px 24px;color:#8fa3b8;font-size:11px;">
      Total paid {{total}}. Gate closes 15 minutes before departure.
    </td>
  </tr>
</table>
```

Free EmailJS plans allow 200 emails a month (2 on the trial tier). If sending
fails the UI says so and leaves the pass on screen — nothing is silently
swallowed.


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
