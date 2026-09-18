# شهرشهر — «تابلوی شهر»

The design language of the citizen app. Written 2026-09-18, replacing the
green-gradient-and-white-cards pass of 2026-08.

## What this product is

A resident of نهاوند or ملایر opens this app to do business with their
شهرداری: hand over dry waste and get paid for it by the kilo, book the pool or
the council hall, report a pothole to ۱۳۷, follow a letter through the offices,
find a relative's grave. Waste was the first service; it is not the subject.
The subject is **the municipality**, and the app's single job is: *do city
business, and know where each thing stands.*

The audience is everybody — a shopkeeper, a grandmother, a teenager — on a
phone, often on a slow connection, in Persian, right-to-left.

## The thesis: the city's own signage

Every Iranian street corner carries the same object: an **enamel plaque** —
a deep blue field, a white keyline set in from the edge, the name painted in
a sign-writer's hand. It is how a municipality speaks to a citizen in public,
and it is the most recognisable piece of civic design in the country.

So the app is built as the city's signage system, not as a startup dashboard.
The old design said "friendly green service"; this one says "this is your
municipality, and it keeps a record."

Two devices carry it:

**1. The plaque (`Plaque`).** Every screen opens with one: an enamel slab with
its inset white keyline, the city name in the sign-writer's face, and the
section under it. On the home screen the plaque is large and *is the city
switcher* — tapping it changes city, which really re-scopes the whole app. The
structure encodes something true: you are always somewhere, and the city you
are in decides which services exist.

**2. The code (`Code`).** Everything here has an official number —
`درخواست ۱۴۰۴۲۳۱`, `رزرو-۳۱۱۸۷۸`, `۱۳۷-۴۸۲۱`, `ش-۱۴۰۴/۲۹۳`. Municipal
business is tracked business, so the tracking number is a first-class
typographic object: brass hairline, tabular digits, always in the same corner
of a card. It is what a citizen reads out on the telephone, so it is never
hidden in grey 11px text.

Nothing else is allowed to be loud.

## Colour

| token | value | what it is |
|---|---|---|
| `--sh-enamel` | `#0F3F6B` | the plaque field; the one saturated surface |
| `--sh-enamel-deep` | `#0A2D4E` | its shadow side, and the tab bar's active mark |
| `--sh-tile` | `#1B93A4` | فیروزه — selection, focus, "this one is live" |
| `--sh-brass` | `#9C6B1F` | money, codes, official marks |
| `--sh-wall` | `#F1EEE8` | limewashed plaster: the ground everything sits on |
| `--sh-panel` | `#FFFFFF` | a panel mounted on the wall |
| `--sh-ink` | `#14202B` | text |

Derived from the subject: enamel and keyline from the street plaque, فیروزه
from the tilework behind it, brass from both the metals the waste service
actually trades and the plates on a municipal door, plaster from the wall the
plaque is screwed to.

The five services keep one hue each — waste `#1E7A4F`, اماکن `#2E6FB7`,
۱۳۷ `#B5641A`, کارتابل `#6A4BA8`, درگذشتگان `#2E7C74` — and those hues appear
**only** on that service's own marks: its plaque, its rule, its icon. A card is
not tinted because it would look nice tinted.

Dark theme keeps the same roles: the wall becomes slate, the plaque keeps its
enamel (an enamel sign does not change colour at night; it is lit).

## Type

- **Lalezar** — the sign-writer. Plaques, the app's name, and figures that are
  meant to be read across a room. One weight, used large, never for prose.
- **Estedad** (variable, 300–900) — everything else. A modern Persian text face
  with a full weight axis and real tabular numerals.
- Both self-hosted (OFL). Nothing is fetched from a CDN: Google Fonts and the
  public CDNs are unreliable from Iran, and a stalled font request means a
  screen with no Persian design on it at all.
- Numerals are Persian and tabular wherever a column is read downward. Latin
  letterforms never carry Persian meaning.
- **Never letter-space Persian text** — it breaks the cursive joins. Tracking is
  allowed on digit-only strings (codes), and nowhere else.

## Structure

- **Panels, not cards.** Flat white, 1px hairline, radius 14. No drop shadow
  except on things that genuinely float (the tab bar, a modal). Depth in this
  language comes from the enamel, not from blur.
- **Rules carry meaning.** A 3px rule at the top of a panel means "this belongs
  to that service" and takes the service's hue. A panel with no rule belongs to
  the city itself.
- **One accent per screen.** The plaque is the loud object; everything below it
  is quiet until the citizen has to act.
- **Lists over grids.** A grid of equal tiles says "browse"; these are errands,
  and a list says "here is what there is, in order of what matters".

## Motion

One orchestrated moment: on load the plaque settles down by 8px as the panels
below it rise in sequence, 40ms apart, and then the screen is still. Hover and
press are 120ms. `prefers-reduced-motion` removes all of it, not just some.

## The quality floor

Touch targets ≥44px. Visible focus: a 2px فیروزه ring with a 2px offset,
never `outline: none`. Body text ≥15px. Contrast ≥4.5:1 for text, verified by
computing it in the browser rather than by looking at a screenshot. Every screen
works at 360px with no horizontal scroll, and every icon-only button has an
`aria-label`.
