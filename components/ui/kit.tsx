'use client';

/**
 * The small set of primitives the redesigned screens are built from.
 *
 * Everything here styles itself from `tokens.ts`, not from Tailwind classes, so
 * these components can sit next to the untouched shadcn screens without either
 * side leaking into the other.
 */

import { ReactNode, CSSProperties, useEffect } from 'react';
import { Check, ChevronLeft, X } from 'lucide-react';
import { C, S, F, alpha } from './tokens';

/* ── page chrome ─────────────────────────────────────────────────────────── */

export function Screen({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      dir="rtl"
      className="sh-wall"
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        /**
         * Room for the fixed top bar (62px of content) and the floating tab
         * bar, plus a gap on each side — *when they are there*. The public
         * chrome has neither, and sets these two variables to a few pixels, so
         * a visitor without an account does not get a hundred pixels of empty
         * band top and bottom where the app's furniture would have been.
         */
        padding: `calc(var(--pm-chrome-top, 78px) + env(safe-area-inset-top)) 0 calc(var(--pm-chrome-bottom, 104px) + env(safe-area-inset-bottom))`,
        ...style,
      }}
    >
      <div style={{ width: '100%', maxWidth: 940, margin: '0 auto', padding: `0 ${S.s4}px` }}>
        {children}
      </div>
    </div>
  );
}

/**
 * The plaque — the one object this design is built around.
 *
 * It is the enamel name-plate off an Iranian street corner: a deep field, a
 * white keyline set in from the edge, the name painted in a sign-writer's hand.
 * Every screen opens with one, so a citizen always knows which city they are
 * in and which part of it they are looking at, in the idiom the municipality
 * already uses on every wall in town.
 *
 * `onClick` makes it the city switcher (home), which is the honest thing for it
 * to be: changing the city on the plaque re-scopes the whole app underneath.
 */
export function Plaque({
  city,
  section,
  note,
  tone = C.enamel,
  icon,
  aside,
  onClick,
  large,
}: {
  /** The city, painted large. On a screen with no city, its own name. */
  city: string;
  /** Which part of the system this screen belongs to. */
  section?: string;
  /** One line under the section — what this screen is for. */
  note?: string;
  /** The service's hue, when the screen belongs to one. */
  tone?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  onClick?: () => void;
  large?: boolean;
}) {
  const Tag = onClick ? 'button' : 'section';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="sh-plaque"
      aria-label={onClick ? `${city} — تغییر شهر` : undefined}
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        textAlign: 'start',
        font: 'inherit',
        color: C.onHero,
        /**
         * The field is enamel on every screen.
         *
         * It used to take the service's hue, which made ۱۳۷ an ochre plaque and
         * اماکن a blue one — and in the dark theme, where those hues lighten so
         * they can be read as text, white on ochre fell to 2.4:1. It was also
         * wrong about the product: a street plaque in a town is always the same
         * blue, and what changes is the name on it. The service marks itself
         * with its rule, the way every panel below does.
         */
        background: `linear-gradient(180deg, ${C.enamel}, ${C.enamelDeep})`,
        borderRadius: S.r3,
        padding: large ? `${S.s5}px ${S.s5}px ${S.s4}px` : `${S.s4}px ${S.s4}px`,
        marginBottom: S.s4,
        boxShadow: C.shadowHero,
        cursor: onClick ? 'pointer' : undefined,
        border: 'none',
        overflow: 'hidden',
      }}
    >
      {/* The keyline. A real plaque has its border painted inside the edge, not
          at it — that inset is most of why the object reads as enamel. */}
      <span
        aria-hidden
        style={{
          position: 'absolute', inset: 6, borderRadius: S.r2,
          border: `1.5px solid ${C.keyline}`, opacity: 0.55, pointerEvents: 'none',
        }}
      />

      {/* Which service this screen belongs to: the same rule that heads that
          service's panels, run down the plaque's start edge. */}
      {tone !== C.enamel && (
        <span
          aria-hidden
          style={{
            position: 'absolute', insetInlineStart: 0, insetBlock: 0, width: 4,
            background: tone,
          }}
        />
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: S.s3 }}>
        {icon && (
          <span
            aria-hidden
            style={{
              width: large ? 46 : 38, height: large ? 46 : 38, flexShrink: 0,
              borderRadius: S.r1, display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.24)',
            }}
          >
            {icon}
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {section && (
            <p style={{
              margin: 0, fontSize: S.xs, fontWeight: 600,
              color: 'rgba(255,255,255,0.74)',
            }}>
              {section}
            </p>
          )}
          <h1 style={{
            margin: section ? '2px 0 0' : 0,
            fontFamily: F.display,
            fontWeight: 400,
            fontSize: large ? S.xxl : S.xl,
            lineHeight: 1.45,
            letterSpacing: 0,
          }}>
            {city}
          </h1>
          {note && (
            <p style={{
              margin: `${S.s2}px 0 0`, fontSize: S.sm, lineHeight: 1.85,
              color: C.onHeroMuted, maxWidth: '44ch',
            }}>
              {note}
            </p>
          )}
        </div>

        {aside}
        {onClick && <ChevronLeft size={18} aria-hidden style={{ opacity: 0.7, flexShrink: 0 }} />}
      </div>
    </Tag>
  );
}

/** Kept so screens written against the old chrome keep compiling. */
export function Hero({ title, sub, icon, aside }: { title: string; sub?: string; icon?: ReactNode; aside?: ReactNode }) {
  return <Plaque city={title} note={sub} icon={icon} aside={aside} />;
}

/**
 * A tracking number, as an object.
 *
 * Every piece of municipal business here has one, and it is what a citizen
 * reads down the telephone — so it is set in brass on its own plate rather
 * than tucked into grey small print. Digits only get the tracking; Persian
 * letters must never be letter-spaced, it breaks the joins.
 */
export function Code({ children, tone = C.brass }: { children: ReactNode; tone?: string }) {
  const text = String(children ?? '');
  const digitsOnly = /^[۰-۹٠-٩0-9\s./-]+$/.test(text);
  return (
    <span
      className="tnum"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: S.r1,
        border: `1px solid ${alpha(tone, 34)}`,
        background: alpha(tone, 9),
        color: tone,
        fontSize: S.xs, fontWeight: 700, lineHeight: 1.7,
        letterSpacing: digitsOnly ? '0.04em' : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      <bdi>{children}</bdi>
    </span>
  );
}

export function SectionTitle({ title, action, tone }: { title: string; action?: ReactNode; tone?: string }) {
  return (
    <div
      /* `.sh-action` gives whatever is passed as `action` a real target: these
         are one- and two-word links and they were 18px tall. */
      className="sh-head"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3, margin: `${S.s6}px 0 ${S.s3}px` }}
    >
      <h2 style={{
        margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong,
        display: 'flex', alignItems: 'center', gap: S.s2,
      }}>
        {/* A short rule in the section's own colour: the same mark that runs
            across the top of that service's panels, so the heading and the
            things under it are visibly the same family. */}
        <span aria-hidden style={{ width: 3, height: '1.05em', borderRadius: 2, background: tone || C.enamel, flexShrink: 0 }} />
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ── surfaces ────────────────────────────────────────────────────────────── */

export function Card({
  children,
  accent,
  onClick,
  style,
  interactive,
  className,
}: {
  children: ReactNode;
  /** Draws a 3px rule across the top in this colour — see DESIGN.md. */
  accent?: string;
  onClick?: () => void;
  style?: CSSProperties;
  interactive?: boolean;
  /** For the stagger (`sh-rise`), which a list sets per item. */
  className?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={['sh-panel', className].filter(Boolean).join(' ')}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'start',
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: S.r3,
        // A panel is mounted flat on the wall; only things that genuinely
        // float — the tab bar, a modal — are allowed to cast anything.
        boxShadow: C.shadowCard,
        overflow: 'hidden',
        cursor: onClick || interactive ? 'pointer' : undefined,
        transition: 'border-color .16s ease, background .16s ease',
        font: 'inherit',
        color: 'inherit',
        ...style,
      }}
    >
      {/* The rule says which service this panel belongs to. Solid, not faded:
          it is a label, and half of a label is not a label. */}
      {accent && <span aria-hidden style={{ display: 'block', height: 3, background: accent }} />}
      {children}
    </Tag>
  );
}

export function IconBadge({ color, size = 44, children }: { color: string; size?: number; children: ReactNode }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: S.r1, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: alpha(color, 10),
        border: `1px solid ${alpha(color, 26)}`,
        color,
      }}
    >
      {children}
    </span>
  );
}

export function Chip({
  children,
  color = C.statusNeutral,
  active,
  onClick,
}: {
  children: ReactNode;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        fontSize: S.xs, fontWeight: 700, lineHeight: 1,
        // Tall enough to hit with a thumb, and squared off like everything else
        // in this language rather than rounded into a lozenge.
        minHeight: 34, padding: '9px 12px', borderRadius: S.r1,
        background: active ? color : 'transparent',
        color: active ? C.onAccent : C.muted,
        border: `1px solid ${active ? color : C.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .16s ease, color .16s ease, border-color .16s ease',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/* ── controls ────────────────────────────────────────────────────────────── */

export function Btn({
  children,
  onClick,
  variant = 'primary',
  color = C.green,
  disabled,
  full,
  type = 'button',
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'soft' | 'ghost';
  color?: string;
  disabled?: boolean;
  full?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
}) {
  const palette =
    variant === 'primary'
      ? { background: color, color: C.onAccent, border: `1px solid ${color}` }
      : variant === 'soft'
        ? { background: alpha(color, 10), color, border: `1px solid ${alpha(color, 30)}` }
        : { background: 'transparent', color: C.text, border: `1px solid ${C.borderStrong}` };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="sh-press"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
        width: full ? '100%' : undefined,
        minHeight: 48,
        padding: '13px 20px', borderRadius: S.r2,
        fontSize: S.base, fontWeight: 700, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background .16s ease, opacity .16s ease, transform .12s ease',
        ...palette,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── read-outs ───────────────────────────────────────────────────────────── */

export function Stat({ label, value, unit, icon, color = C.green }: { label: string; value: ReactNode; unit?: string; icon?: ReactNode; color?: string }) {
  return (
    <Card>
      <div style={{ padding: `${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
        {icon && <IconBadge color={color} size={40}>{icon}</IconBadge>}
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: S.xs, color: C.muted, fontWeight: 600 }}>{label}</p>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.lg, fontWeight: 800, color: C.textStrong, whiteSpace: 'nowrap' }}>
            {value}
            {unit && <span style={{ fontSize: S.xs, fontWeight: 600, color: C.muted, marginInlineStart: 4 }}>{unit}</span>}
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * A ring that reads as a share of something. Pure SVG — no chart library on a
 * PWA that has to load over a phone connection.
 */
export function ProgressRing({ value, size = 74, label, color = C.green }: { value: number; size?: number; label?: string; color?: string }) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={alpha(color, 14)} strokeWidth={7} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.textStrong, lineHeight: 1 }}>
            {Math.round(pct)}٪
          </div>
          {label && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── the step rail ───────────────────────────────────────────────────────── */

export type Step = {
  key: string;
  title: string;
  /** Shown under the title once the step is reached. */
  detail?: string;
};

/**
 * The step-by-step read-out, the same idea as karnama's scan console: a fixed
 * list of stages where what has happened, what is happening and what has not
 * started yet are three visibly different things.
 *
 * Used for both request tracking (the stages a request passes through) and the
 * new-request wizard (the stages the citizen passes through), because they are
 * the same object seen from two sides.
 */
export function StepRail({
  steps,
  current,
  failed,
  color = C.green,
  compact,
}: {
  steps: Step[];
  /** Index of the active step. Everything before it counts as done. */
  current: number;
  /** Render the current step as a failure instead of in-progress. */
  failed?: boolean;
  color?: string;
  compact?: boolean;
}) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const stateColor = failed && active ? C.statusDanger : done || active ? color : C.subtle;
        const last = i === steps.length - 1;

        return (
          <li key={s.key} style={{ display: 'flex', gap: S.s3, alignItems: 'flex-start', position: 'relative' }}>
            {/* node + the dotted thread down to the next node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <span
                style={{
                  width: compact ? 20 : 26, height: compact ? 20 : 26, borderRadius: '50%',
                  display: 'grid', placeItems: 'center',
                  background: done ? stateColor : active ? alpha(stateColor, 16) : 'transparent',
                  border: `2px solid ${done || active ? stateColor : C.border}`,
                  color: done ? C.onAccent : stateColor,
                  transition: 'background .25s ease, border-color .25s ease',
                }}
              >
                {done ? (
                  <Check size={compact ? 11 : 14} strokeWidth={3} />
                ) : (
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
                      animation: active && !failed ? 'pmPulseDot 1.5s ease-in-out infinite' : undefined,
                      opacity: active ? 1 : 0.5,
                    }}
                  />
                )}
              </span>

              {!last && (
                <span
                  style={{
                    width: 2, flex: 1, minHeight: compact ? 22 : 30, marginBlock: 3,
                    // A dotted thread rather than a solid rule: the gap between
                    // two stages is a wait, and a dashed line reads as one.
                    backgroundImage: `linear-gradient(to bottom, ${done ? stateColor : C.borderStrong} 55%, transparent 0)`,
                    backgroundSize: '2px 9px',
                    backgroundRepeat: 'repeat-y',
                    opacity: done ? 1 : 0.75,
                  }}
                />
              )}
            </div>

            <div style={{ paddingBottom: last ? 0 : compact ? S.s3 : S.s4, minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: compact ? S.xs : S.sm,
                  fontWeight: active ? 800 : 700,
                  color: done ? C.text : active ? (failed ? C.statusDanger : C.textStrong) : C.subtle,
                  transition: 'color .25s ease',
                }}
              >
                {s.title}
              </p>
              {s.detail && (done || active) && (
                <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>{s.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── overlays ────────────────────────────────────────────────────────────── */

export function Modal({ children, onClose, wide }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  /**
   * Escape closes it, and so does a visible button.
   *
   * Tapping the backdrop used to be the only way out. That is fine for a
   * confirmation the size of a postcard and useless for the ones that are not:
   * the construction form is taller than the screen, so the backdrop is
   * scrolled off and there is nothing to tap — a sheet with no way back.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // A page scrolling behind an open sheet is the other half of feeling stuck.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      dir="rtl"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000000,
        background: 'rgba(9, 20, 16, 0.55)', backdropFilter: 'blur(2px)',
        display: 'grid', placeItems: 'center', padding: S.s4,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%', maxWidth: wide ? 620 : 420, maxHeight: '88vh', overflowY: 'auto',
          background: C.surface, borderRadius: S.r4, boxShadow: C.shadowSheet, color: C.text,
        }}
      >
        {/* Sticky, so it is still reachable at the bottom of a long form. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          style={{
            position: 'sticky', top: S.s3, insetInlineStart: '100%',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            width: 34, height: 34, marginInlineEnd: S.s3, marginBottom: -34,
            borderRadius: 999, cursor: 'pointer', zIndex: 2,
            background: C.surface2, border: `1px solid ${C.border}`, color: C.muted,
          }}
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ── form pieces ─────────────────────────────────────────────────────────── */

/**
 * Label + control. The input styling lives in one CSS class (`.pm-field`) so
 * native inputs, the Jalali date picker and the address search all look alike.
 */
export function Field({
  label,
  hint,
  children,
  icon,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: S.sm, fontWeight: 700, color: C.text, marginBottom: S.s2 }}>
        {icon}
        {label}
      </span>
      {children}
      {hint && <span style={{ display: 'block', marginTop: 6, fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>{hint}</span>}
    </label>
  );
}

/** Two or more mutually exclusive views. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 0,
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: S.r2,
        padding: 0, overflow: 'hidden',
      }}
    >
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              minHeight: 44, padding: '11px 8px', cursor: 'pointer',
              border: 'none',
              borderInlineStart: i ? `1px solid ${C.border}` : 'none',
              // The chosen one is painted enamel: a selected state that is a
              // colour change, not a floating white pill on a grey tray.
              fontFamily: 'inherit', fontSize: S.sm, fontWeight: 700,
              background: on ? C.enamel : 'transparent',
              color: on ? C.onHero : C.muted,
              transition: 'background .16s ease, color .16s ease',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A loading placeholder with the same sweep the history list uses. */
export function Shimmer({ height = 96, radius = S.r3 }: { height?: number; radius?: number }) {
  return (
    <div
      style={{
        height, borderRadius: radius, position: 'relative', overflow: 'hidden',
        background: C.surface, border: `1px solid ${C.border}`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute', inset: 0, width: '40%',
          background: `linear-gradient(90deg, transparent, ${C.bgSubtle}, transparent)`,
          animation: 'pmSweep 1.4s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ── empty ───────────────────────────────────────────────────────────────── */

export function EmptyState({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <Card>
      <div style={{ padding: `${S.s7}px ${S.s5}px`, display: 'grid', justifyItems: 'center', gap: S.s3, textAlign: 'center' }}>
        <IconBadge color={C.green} size={56}>{icon}</IconBadge>
        <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{title}</p>
        {sub && <p style={{ margin: 0, fontSize: S.sm, color: C.muted, lineHeight: 1.8, maxWidth: '40ch' }}>{sub}</p>}
        {action}
      </div>
    </Card>
  );
}
