/**
 * Design tokens for the citizen app, in the shape the vehicle project uses.
 *
 * Every value is a CSS variable reference rather than a literal, so one inline
 * style renders correctly in both themes — the variables are defined in
 * globals.css under `:root` and redefined under `html[data-theme="dark"]`.
 *
 * Because these are `var(...)` strings and not hex, the `${C.green}1F` alpha
 * suffix trick cannot work. Use `alpha()`:
 *   background: alpha(C.green, 12)
 */
export const C = {
  green:     'var(--pm-green)',
  greenDark: 'var(--pm-green-dark)',
  greenSoft: 'var(--pm-green-soft)',
  amber:     'var(--pm-amber)',
  red:       'var(--pm-red)',
  blue:      'var(--pm-blue)',
  violet:    'var(--pm-violet)',

  /* «تابلوی شهر» — see DESIGN.md. The enamel of a street plaque, the فیروزه of
     the tile behind it, and the brass of a municipal door plate. */
  enamel:     'var(--sh-enamel)',
  /** Enamel where it is *text* rather than a surface — flips with the theme. */
  enamelInk:  'var(--sh-enamel-ink)',
  enamelDeep: 'var(--sh-enamel-deep)',
  enamelLit:  'var(--sh-enamel-lit)',
  tile:       'var(--sh-tile)',
  tileDeep:   'var(--sh-tile-deep)',
  brass:      'var(--sh-brass)',
  brassLit:   'var(--sh-brass-lit)',
  wall:       'var(--sh-wall)',
  wallDeep:   'var(--sh-wall-deep)',
  keyline:    'var(--sh-keyline)',

  /* The five modules, for the screens that belong to one. */
  waste:      'var(--sh-waste)',
  venues:     'var(--sh-venues)',
  reports:    'var(--sh-reports)',
  cartable:   'var(--sh-cartable)',
  memorials:  'var(--sh-memorials)',

  bg:        'var(--pm-bg)',
  bgSubtle:  'var(--pm-bg-subtle)',
  surface:   'var(--pm-surface)',
  surface2:  'var(--pm-surface-2)',

  heroStart: 'var(--pm-hero-start)',
  heroEnd:   'var(--pm-hero-end)',
  onHero:    'var(--pm-on-hero)',
  onHeroMuted: 'var(--pm-on-hero-muted)',

  textStrong: 'var(--pm-text-strong)',
  text:       'var(--pm-text)',
  muted:      'var(--pm-muted)',
  subtle:     'var(--pm-subtle)',
  onAccent:   'var(--pm-on-accent)',

  border:       'var(--pm-border)',
  borderStrong: 'var(--pm-border-strong)',

  shadowCard:  'var(--pm-shadow-card)',
  shadowLift:  'var(--pm-shadow-lift)',
  shadowHero:  'var(--pm-shadow-hero)',
  shadowSheet: 'var(--pm-shadow-sheet)',

  statusOk:      'var(--pm-status-ok)',
  statusWarn:    'var(--pm-status-warn)',
  statusInfo:    'var(--pm-status-info)',
  statusDanger:  'var(--pm-status-danger)',
  statusNeutral: 'var(--pm-status-neutral)',
} as const;

/**
 * One hue per service module, and nowhere else.
 *
 * A service's colour marks its own things — its plaque, the rule at the top of
 * its panels, its icon — so that a citizen learns «نارنجی یعنی ۱۳۷» without
 * being told. It is never used to tint a surface for decoration.
 */
export const SERVICE_COLOR: Record<string, string> = {
  waste:     'var(--sh-waste)',
  venues:    'var(--sh-venues)',
  reports:   'var(--sh-reports)',
  cartable:  'var(--sh-cartable)',
  memorials: 'var(--sh-memorials)',
  // The panel and the API do not spell every module the same way — ۱۳۷ is
  // `report137` there and `reports` here, and the cemetery register answers to
  // both of its names.
  report137: 'var(--sh-reports)',
  report:    'var(--sh-reports)',
  venue:     'var(--sh-venues)',
  booking:   'var(--sh-venues)',
  deceased:  'var(--sh-memorials)',
  letter:    'var(--sh-cartable)',
};

/** The hue of a known service, or nothing — see `serviceColor` below. */
export const serviceHue = (key?: string): string | undefined =>
  (key && SERVICE_COLOR[key]) || undefined;

/**
 * The hue to mark a service with, falling back to enamel.
 *
 * Only for *marks* — a rule, an icon tint, a bar. Never as text on an unknown
 * key: enamel is a dark surface colour, and in the night theme it lands at
 * 1.47:1 on a dark panel. Text should use `serviceHue` and keep whatever the
 * API sent when the key is one this build does not know.
 */
export const serviceColor = (key?: string): string =>
  serviceHue(key) || 'var(--sh-enamel)';

/** The two faces. Lalezar paints plaques; Estedad does everything else. */
export const F = {
  display: "'Lalezar', 'Estedad', system-ui, sans-serif",
  body:    "'Estedad', 'IRANSans', system-ui, sans-serif",
} as const;

/** One hue per waste type — see --pm-waste-* in globals.css. */
export const WASTE_COLOR = {
  household:    'var(--pm-waste-household)',
  recyclable:   'var(--pm-waste-recyclable)',
  electronic:   'var(--pm-waste-electronic)',
  bulky:        'var(--pm-waste-bulky)',
  automotive:   'var(--pm-waste-automotive)',
  construction: 'var(--pm-waste-construction)',
} as const;

/**
 * Type scale and spacing. Fluid so one set of numbers works from a 360px phone
 * to a desktop without a breakpoint for every size.
 */
export const S = {
  /* Persian loses its dots below ~12px, and these are labels a grandmother
     reads on a bus. The floors are raised so that even a 360px phone renders
     nothing under 12px. */
  xs:   'clamp(0.76rem, 0.72rem + 0.18vw, 0.82rem)',
  sm:   'clamp(0.86rem, 0.82rem + 0.2vw, 0.94rem)',
  base: 'clamp(0.95rem, 0.9rem + 0.22vw, 1.04rem)',
  md:   'clamp(1rem, 0.94rem + 0.3vw, 1.14rem)',
  lg:   'clamp(1.14rem, 1.04rem + 0.45vw, 1.36rem)',
  xl:   'clamp(1.34rem, 1.18rem + 0.7vw, 1.7rem)',
  xxl:  'clamp(1.6rem, 1.3rem + 1.3vw, 2.3rem)',

  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 22,
  s6: 30,
  s7: 42,

  /**
   * Radii, tightened.
   *
   * The old set (12/16/20/26) rounded everything into soft lozenges, which is
   * the house style of every consumer app and says nothing about a
   * municipality. A plaque is a rectangle with its corners just taken off.
   */
  r1: 8,
  r2: 10,
  r3: 14,
  r4: 18,
  rPill: 999,
} as const;

/**
 * Translucent variant of any colour — a hex literal, a `var(--x)` or a colour
 * passed down as a prop. `color-mix` is what makes this work on variables.
 *
 * @param percent opacity 0–100.
 */
export function alpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export type RequestStatus = 'pending' | 'collecting' | 'completed' | 'canceled';

export const STATUS_THEME: Record<RequestStatus, { label: string; color: string }> = {
  pending:    { label: 'در انتظار تأیید',  color: C.statusWarn },
  collecting: { label: 'در حال جمع‌آوری', color: C.statusInfo },
  completed:  { label: 'تکمیل شده',        color: C.statusOk },
  canceled:   { label: 'لغو شده',          color: C.statusDanger },
};

/** Persian digits everywhere a number is read rather than computed with. */
export function fa(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString('fa-IR');
}
