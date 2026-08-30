'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Modal } from '@/components/ui/kit';
import { faDigits } from '@/lib/when';

/**
 * A year is not a quantity.
 *
 * `fa()` groups thousands — correct for ۸۵٬۰۰۰ تومان and wrong for ۱۴۰۵, which
 * it printed as «۱٬۴۰۵» on every date card and in the calendar's own title.
 */
const faYear = (year: number) => faDigits(String(year));

/**
 * انتخاب روز — یک نوار برای روزهای نزدیک، یک تقویم برای بقیه.
 *
 * The rail is what a booking screen is for: the next few days, one tap away,
 * the way OpenTable and every court-booking app put the near dates in reach.
 * But a rail is only honest about the first week — a booking window of thirty
 * days scrolled sideways is a list nobody reads to the end, and «۳۱» followed
 * by «۱» is two numbers with no month between them. So each card carries its
 * own month and year, and the far end of the rail opens a real calendar.
 *
 * Neither one decides anything: both draw `calendar` exactly as the API
 * computed it — which days are open, which are closed and why, and how many
 * sessions each has. A day this file offered that the server would refuse is
 * the bug the whole schedule engine exists to prevent.
 */

export interface CalendarDay {
  dateKey: string;
  /** «۱۴۰۵/۰۵/۲۵» */
  date: string;
  weekday: number;
  weekdayName: string;
  /** The pieces, so nothing has to be parsed back out of Persian digits. */
  jy: number;
  jm: number;
  jd: number;
  monthName: string;
  /** «یکشنبه ۲۵ مرداد» */
  say: string;
  /** ۰ امروز، ۱ فردا… */
  ahead: number;
  isToday: boolean;
  closed: boolean;
  reason: string;
  sessionCount: number;
  audiences: string[];
}

/** «امروز» و «فردا» are what people call those two days; the rest are weekdays. */
const dayLabel = (day: CalendarDay) =>
  day.ahead === 0 ? 'امروز' : day.ahead === 1 ? 'فردا' : day.weekdayName;

const WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/* ── the rail ─────────────────────────────────────────────────────────────── */

export function DateStrip({
  days,
  value,
  onPick,
  title = 'روز را انتخاب کنید',
  railLength = 10,
}: {
  days: CalendarDay[];
  value: string;
  onPick: (dateKey: string) => void;
  /** What the rail is for, printed beside the calendar link. */
  title?: string;
  /** How many days stay on the rail before the calendar takes over. */
  railLength?: number;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  /**
   * The rail shows the first stretch of the window — plus the chosen day,
   * wherever it is. Picking ۲۸ مرداد from the calendar and then finding the
   * rail still ending at ۲۵ would leave the screen disagreeing with itself.
   */
  const rail = useMemo(() => {
    const head = days.slice(0, railLength);
    const picked = days.find((d) => d.dateKey === value);
    return picked && !head.some((d) => d.dateKey === value) ? [...head, picked] : head;
  }, [days, value, railLength]);

  const picked = days.find((d) => d.dateKey === value);

  /**
   * Bring the chosen day into view.
   *
   * It used to be enough that the rail *contained* the chosen day, because the
   * only way to choose one was to tap it — so it was on screen by definition.
   * The public site can now hand the sheet a day that was picked before the
   * citizen even had an account, and «دوشنبه ۲ شهریور» arriving half off the
   * left edge of the rail is the screen disagreeing with the link that opened
   * it. `nearest` so a day already in view does not jump.
   */
  const railRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!value) return;
    const chosen = railRef.current?.querySelector<HTMLElement>(`[data-day="${value}"]`);
    chosen?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value, rail]);

  return (
    <>
      {/* The calendar is offered up here rather than at the far end of the
          rail: an entry point a person has to scroll sideways to discover is
          one most people never find. «۲۵ مرداد» beside it says which day is
          currently chosen, which is the other thing a rail hides once it has
          been scrolled. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: S.s2, marginBottom: S.s2 }}>
        <p style={{ margin: 0, fontSize: S.xs, fontWeight: 700, color: C.muted }}>{title}</p>
        {picked && (
          <p style={{ margin: 0, fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>
            {picked.say}
          </p>
        )}
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          style={{
            marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: S.rPill, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, fontWeight: 800,
            background: alpha(C.green, 8), color: C.green, border: `1px solid ${alpha(C.green, 26)}`,
          }}
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          تقویم
        </button>
      </div>

      <div ref={railRef} className="pm-scroll-x" style={{ display: 'flex', gap: 7, paddingBottom: 4 }}>
        {rail.map((day) => {
          const on = day.dateKey === value;
          return (
            <button
              key={day.dateKey}
              type="button"
              data-day={day.dateKey}
              onClick={() => onPick(day.dateKey)}
              aria-pressed={on}
              aria-label={`${day.say}${day.closed ? ' — تعطیل' : ''}`}
              style={{
                flexShrink: 0, width: 82, padding: '9px 0 8px', borderRadius: S.r2, cursor: 'pointer',
                fontFamily: 'inherit', display: 'grid', gap: 2, justifyItems: 'center',
                background: on ? C.green : day.closed ? C.bgSubtle : C.surface2,
                color: on ? C.onAccent : day.closed ? C.subtle : C.text,
                border: `1px solid ${on ? C.green : C.border}`,
                opacity: day.closed && !on ? 0.75 : 1,
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>{dayLabel(day)}</span>
              <span className="tnum" style={{ fontSize: S.md, fontWeight: 800, lineHeight: 1.2 }}>
                {fa(day.jd)}
              </span>
              {/* The month, and the year with it. A date strip that crosses
                  اسفند into فروردین is otherwise «۲۹» then «۱» — and even
                  inside one month, a card that does not say which month it is
                  in is a number waiting to be misread. */}
              <span className="tnum" style={{ fontSize: 9.5, opacity: 0.9, fontWeight: 700 }}>
                {day.monthName} {faYear(day.jy)}
              </span>
              <span style={{ fontSize: 9, opacity: 0.82 }}>
                {day.closed ? 'تعطیل' : `${fa(day.sessionCount)} سانس`}
              </span>
            </button>
          );
        })}

        {days.length > rail.length && (
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            style={{
              flexShrink: 0, width: 82, padding: '9px 0 8px', borderRadius: S.r2, cursor: 'pointer',
              fontFamily: 'inherit', display: 'grid', gap: 4, justifyItems: 'center', alignContent: 'center',
              background: alpha(C.green, 8), color: C.green,
              border: `1px dashed ${alpha(C.green, 34)}`,
            }}
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
            <span style={{ fontSize: 10, fontWeight: 800 }}>روزهای بعد</span>
            <span className="tnum" style={{ fontSize: 9, opacity: 0.9 }}>
              تا {fa(days.length - 1)} روز
            </span>
          </button>
        )}
      </div>

      {calendarOpen && (
        <MonthSheet
          days={days}
          value={value}
          onClose={() => setCalendarOpen(false)}
          onPick={(dateKey) => {
            onPick(dateKey);
            setCalendarOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ── the calendar ─────────────────────────────────────────────────────────── */

/**
 * تقویم ماه، فقط تا انتهای پنجرهٔ رزرو.
 *
 * A month grid rather than a longer rail, because choosing «جمعهٔ هفتهٔ بعد»
 * is a spatial act: people find a date by where it sits in the week, not by
 * scrolling past twenty of them. Days the window does not reach are drawn and
 * disabled instead of being left out — a calendar with holes in it reads as
 * broken, while a greyed day reads as «not this one».
 */
function MonthSheet({
  days,
  value,
  onPick,
  onClose,
}: {
  days: CalendarDay[];
  value: string;
  onPick: (dateKey: string) => void;
  onClose: () => void;
}) {
  /** The months the window touches, in order, each with the days it covers. */
  const months = useMemo(() => {
    const out: { jy: number; jm: number; monthName: string; byDay: Map<number, CalendarDay> }[] = [];
    days.forEach((day) => {
      let month = out.find((m) => m.jy === day.jy && m.jm === day.jm);
      if (!month) {
        month = { jy: day.jy, jm: day.jm, monthName: day.monthName, byDay: new Map() };
        out.push(month);
      }
      month.byDay.set(day.jd, day);
    });
    return out;
  }, [days]);

  const picked = days.find((d) => d.dateKey === value);
  const startIndex = Math.max(0, months.findIndex((m) => m.jy === picked?.jy && m.jm === picked?.jm));
  const [index, setIndex] = useState(startIndex);
  const month = months[index];

  if (!month) return null;

  /**
   * How long this month is.
   *
   * ۳۱ for the first six, ۳۰ for the next five, and اسفند is ۲۹ or ۳۰ — which
   * the window itself answers whenever it reaches that far, and otherwise does
   * not matter, because every day past the window is disabled anyway.
   */
  // `Array.from` rather than spreading the iterator: this project compiles to
  // a target where spreading a Map's keys needs --downlevelIteration.
  const length = month.jm <= 6 ? 31 : month.jm <= 11 ? 30 : Math.max(29, ...Array.from(month.byDay.keys()));

  /**
   * Which column the first of the month falls in.
   *
   * Derived from a day we actually have rather than computed: `weekday` is
   * already on every row, ۰ = شنبه, and walking back from it is arithmetic no
   * date library is needed for.
   */
  const known = month.byDay.values().next().value as CalendarDay;
  const firstWeekday = (((known.weekday - ((known.jd - 1) % 7)) % 7) + 7) % 7;

  const cells: (CalendarDay | number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length }, (_, i) => month.byDay.get(i + 1) || i + 1),
  ];

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: S.s4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.s2, marginBottom: S.s4 }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            style={{
              width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', cursor: 'pointer',
              background: C.surface2, border: `1px solid ${C.border}`, color: C.muted,
            }}
          >
            <X className="h-4 w-4" />
          </button>

          <p className="tnum" style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
            {month.monthName} {faYear(month.jy)}
          </p>

          {/* In RTL the previous month sits to the right, which is where the
              chevron pointing that way belongs. */}
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            aria-label="ماه پیش"
            style={navStyle(index === 0)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={index === months.length - 1}
            onClick={() => setIndex(index + 1)}
            aria-label="ماه بعد"
            style={navStyle(index === months.length - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {WEEK.map((w) => (
            <span key={w} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: C.subtle }}>
              {w}
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((cell, i) => {
            if (cell === null) return <span key={`blank-${i}`} />;

            // A bare number is a day the booking window does not reach.
            if (typeof cell === 'number') {
              return (
                <span
                  key={`out-${cell}`}
                  className="tnum"
                  style={{
                    aspectRatio: '1', display: 'grid', placeItems: 'center', borderRadius: 11,
                    fontSize: S.xs, color: C.subtle, opacity: 0.45,
                  }}
                >
                  {fa(cell)}
                </span>
              );
            }

            const on = cell.dateKey === value;
            const disabled = cell.closed;
            return (
              <button
                key={cell.dateKey}
                type="button"
                disabled={disabled}
                onClick={() => onPick(cell.dateKey)}
                aria-label={`${cell.say}${disabled ? ' — تعطیل' : ` — ${cell.sessionCount} سانس`}`}
                aria-current={on ? 'date' : undefined}
                style={{
                  aspectRatio: '1', display: 'grid', gap: 1, placeContent: 'center', justifyItems: 'center',
                  borderRadius: 11, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  background: on ? C.green : disabled ? 'transparent' : alpha(C.green, 7),
                  color: on ? C.onAccent : disabled ? C.subtle : C.textStrong,
                  border: `1px solid ${on ? C.green : cell.isToday ? alpha(C.green, 45) : 'transparent'}`,
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <span className="tnum" style={{ fontSize: S.xs, fontWeight: 800 }}>{fa(cell.jd)}</span>
                {/* Availability at a glance: a dot for a day with hours, a
                    dash for a day the venue is shut. */}
                <span
                  aria-hidden
                  style={{
                    width: disabled ? 7 : 4, height: disabled ? 1.5 : 4, borderRadius: 4,
                    background: on ? C.onAccent : disabled ? C.borderStrong : C.green,
                    opacity: on ? 0.9 : 1,
                  }}
                />
              </button>
            );
          })}
        </div>

        <p style={{ margin: `${S.s4}px 0 0`, fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
          روزهای کم‌رنگ یا خارج از بازهٔ رزرو هستند یا مکان در آن‌ها تعطیل است.
        </p>
      </div>
    </Modal>
  );
}

const navStyle = (disabled: boolean) => ({
  width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: C.surface2, border: `1px solid ${C.border}`,
  color: disabled ? C.subtle : C.text, opacity: disabled ? 0.5 : 1,
}) as const;
