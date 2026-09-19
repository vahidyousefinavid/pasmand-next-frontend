'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, PackagePlus, Wallet, User } from 'lucide-react';
import { C, S, alpha } from '@/components/ui/tokens';
import { useHasService } from '@/lib/cityServices';

/**
 * The tab bar.
 *
 * Five destinations with the primary action raised out of the row — on a phone
 * the thing a citizen opens this app to do should not be one of five identical
 * grey glyphs. Labels stay visible: icon-only bars are guessing games in any
 * language, and more so in one the icon set was not drawn for.
 *
 * «پیگیری» used to sit in the second slot and it went to `/history`, which is
 * the history of *waste requests* — one of five services. A citizen whose hall
 * booking was waiting on approval, or whose ۱۳۷ report had just moved, found
 * none of it there. «کارهای من» is the same slot answering the question the tab
 * always implied: everything of yours that is still open, whichever service it
 * belongs to. `/history` is unchanged and still reachable from the waste
 * section — it is the deep list, not the tab.
 */
const TABS = [
  { href: '/', label: 'خانه', Icon: Home },
  { href: '/activity', label: 'کارهای من', Icon: ListChecks },
  /**
   * The waste request, which is only a tab where the city collects waste.
   * Every other service is reached from the home screen's list; this one has a
   * tab because it is the errand most people come for — in a city that runs
   * it. A municipality that has switched collection off should not have a
   * permanent button for it at the bottom of every screen.
   */
  { href: '/new-request', label: 'درخواست', Icon: PackagePlus, primary: true, service: 'waste' },
  { href: '/wallet', label: 'کیف پول', Icon: Wallet },
  { href: '/profile', label: 'پروفایل', Icon: User },
];

export function Navigation() {
  const pathname = usePathname();
  // `undefined` while the answer is unknown — the tab stays until the city
  // actually says no, so a slow call does not make the bar jump.
  const { has: hasWaste } = useHasService('waste');
  const tabs = TABS.filter((tab) => !tab.service || hasWaste !== false);

  return (
    <nav
      dir="rtl"
      /**
       * A bar, not a floating pill.
       *
       * The old tab bar hovered above the content with a raised FAB punched
       * through it, which is the house style of every consumer app and left a
       * strip of page visible underneath that nothing could ever use. This one
       * is fixed to the bottom edge, sits on the wall, and marks the tab you
       * are on with an enamel bar over it — the way a sign marks a platform.
       */
      style={{
        position: 'fixed', insetInline: 0, bottom: 0, zIndex: 100000,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 0 rgba(20,32,43,0.04)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 560, margin: '0 auto',
          display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        }}
      >
        {tabs.map(({ href, label, Icon, primary }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 5,
                minHeight: 60, padding: '9px 2px 8px', textDecoration: 'none',
                color: active ? C.enamelInk : C.muted,
                transition: 'color .16s ease',
              }}
            >
              {/* The mark of the current tab: a short enamel bar on the top
                  edge, in line with the rules that head every panel. */}
              <span
                aria-hidden
                style={{
                  position: 'absolute', top: 0, insetInline: '28%', height: 3,
                  borderRadius: '0 0 3px 3px',
                  background: active ? C.enamelInk : 'transparent',
                }}
              />
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
              <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, whiteSpace: 'nowrap' }}>
                {/* «درخواست» is still the errand most people come for, so it
                    keeps a mark of its own — a brass underline rather than a
                    button jumping out of the bar. */}
                {label}
                {primary && !active && (
                  <span aria-hidden style={{
                    display: 'block', height: 2, marginTop: 3, borderRadius: 2,
                    background: alpha(C.brass, 55),
                  }} />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
