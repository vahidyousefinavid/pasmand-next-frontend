'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileClock, Home, PackagePlus, Wallet, User } from 'lucide-react';
import { C, S, alpha } from '@/components/ui/tokens';

/**
 * The tab bar.
 *
 * Five destinations with the primary action raised out of the row — on a phone
 * the thing a citizen opens this app to do should not be one of five identical
 * grey glyphs. Labels stay visible: icon-only bars are guessing games in any
 * language, and more so in one the icon set was not drawn for.
 */
const TABS = [
  { href: '/', label: 'خانه', Icon: Home },
  { href: '/history', label: 'پیگیری', Icon: FileClock },
  { href: '/new-request', label: 'درخواست', Icon: PackagePlus, primary: true },
  { href: '/wallet', label: 'کیف پول', Icon: Wallet },
  { href: '/profile', label: 'پروفایل', Icon: User },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      style={{
        position: 'fixed', insetInline: 0, bottom: 0, zIndex: 100000,
        display: 'flex', justifyContent: 'center',
        padding: `0 ${S.s3}px calc(${S.s3}px + env(safe-area-inset-bottom))`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 470,
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'end',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 26,
          padding: `${S.s2}px ${S.s2}px`,
          boxShadow: C.shadowLift,
        }}
      >
        {TABS.map(({ href, label, Icon, primary }) => {
          const active = pathname === href;

          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'grid', justifyItems: 'center', gap: 5, textDecoration: 'none',
                  marginTop: -26,
                }}
              >
                <span
                  style={{
                    width: 52, height: 52, borderRadius: 20, display: 'grid', placeItems: 'center',
                    background: `linear-gradient(140deg, ${C.heroStart}, ${C.heroEnd})`,
                    color: C.onHero,
                    border: `3px solid ${C.surface}`,
                    boxShadow: `0 10px 22px ${alpha(C.green, 34)}`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: active ? C.green : C.muted }}>{label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                display: 'grid', justifyItems: 'center', gap: 4, textDecoration: 'none',
                padding: `${S.s2}px 0 6px`, borderRadius: 16,
                background: active ? alpha(C.green, 10) : 'transparent',
                color: active ? C.green : C.muted,
                transition: 'background .2s ease, color .2s ease',
              }}
            >
              <Icon className="h-5 w-5" />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
