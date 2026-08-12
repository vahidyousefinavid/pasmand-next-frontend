'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleUser, MenuIcon, LogIn, Leaf, MapPin, ChevronDown, ChevronLeft, Check, X,
  PackagePlus, FileClock, Wallet, MapPinned, Banknote, Trash2, BookOpen, User, Headphones,
  type LucideIcon,
} from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/data-context';
import InstallButton from './InstallButton';
import { C, S, alpha } from '@/components/ui/tokens';

/**
 * The fixed header.
 *
 * Two controls and a title: the menu, the city the whole app is scoped to, and
 * the account. The city picker used to exist twice over — a popover in the bar
 * and a second copy inside the drawer — with two different visual treatments;
 * there is one now, and it opens as a sheet from the same place either way.
 */

/**
 * The drawer's contents, in three groups.
 *
 * A flat list of nine links makes every destination look equally likely; the
 * grouping says which one the app is for (ثبت درخواست), which are the user's own
 * records, and which are reference material you read once.
 */
const MENU_GROUPS: { label: string; items: { title: string; sub: string; href: string; Icon: LucideIcon; color: string }[] }[] = [
  {
    label: 'کارهای من',
    items: [
      { title: 'ثبت درخواست', sub: 'جمع‌آوری پسماند از درِ خانه', href: '/new-request', Icon: PackagePlus, color: C.green },
      { title: 'پیگیری درخواست‌ها', sub: 'مسیر هر درخواست، مرحله به مرحله', href: '/history', Icon: FileClock, color: C.statusInfo },
      { title: 'کیف پول', sub: 'موجودی و برداشت', href: '/wallet', Icon: Wallet, color: C.amber },
      { title: 'آدرس‌های من', sub: 'آدرس‌های ذخیره‌شده', href: '/addresses', Icon: MapPinned, color: C.violet },
    ],
  },
  {
    label: 'اطلاعات',
    items: [
      { title: 'تعرفهٔ قیمت‌ها', sub: 'قیمت روز اقلام بازیافتی', href: '/tariff', Icon: Banknote, color: C.green },
      { title: 'انواع پسماند', sub: 'کدام پسماند در کدام دسته', href: '/waste-types', Icon: Trash2, color: C.statusNeutral },
      { title: 'راهنمای استفاده', sub: 'از ثبت تا تسویه', href: '/guide', Icon: BookOpen, color: C.statusNeutral },
    ],
  },
  {
    label: 'حساب',
    items: [
      { title: 'پروفایل', sub: 'اطلاعات شخصی شما', href: '/profile', Icon: User, color: C.statusNeutral },
      { title: 'پشتیبانی', sub: 'تماس، ایمیل و گفتگو', href: '/contact-us', Icon: Headphones, color: C.statusNeutral },
    ],
  },
];

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  // The list comes from the panel; see context/data-context.tsx.
  const { selectedCity, setSelectedCity, cities } = useCity();
  const pathname = usePathname();

  return (
    <>
      <header
        dir="rtl"
        style={{
          position: 'fixed', insetInline: 0, top: 0, zIndex: 10000,
          background: `linear-gradient(135deg, ${C.heroStart}, ${C.heroEnd})`,
          borderEndStartRadius: 22, borderEndEndRadius: 22,
          boxShadow: C.shadowHero,
          color: C.onHero,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div
          style={{
            maxWidth: 940, margin: '0 auto',
            padding: `${S.s3}px ${S.s4}px`,
            display: 'flex', alignItems: 'center', gap: S.s3,
          }}
        >
          {/* menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="منو"
                style={{
                  display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 13,
                  background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)',
                  color: C.onHero, cursor: 'pointer', flexShrink: 0,
                }}
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="z-[100000] overflow-y-auto p-0 w-[86vw] sm:w-[380px] max-w-[380px]"
              style={{ background: C.bg, color: C.text, borderColor: C.border }}
            >
              <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                {/* ── the header slab, so the drawer opens on the product, not
                    on a list of links ── */}
                <div
                  style={{
                    position: 'relative', overflow: 'hidden',
                    background: `linear-gradient(140deg, ${C.heroStart}, ${C.heroEnd})`,
                    color: C.onHero,
                    padding: `calc(${S.s6}px + env(safe-area-inset-top)) ${S.s4}px ${S.s5}px`,
                  }}
                >
                  <span aria-hidden style={{ position: 'absolute', insetInlineStart: -50, top: -60, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />
                  <span aria-hidden style={{ position: 'absolute', insetInlineEnd: -35, bottom: -70, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: S.s3 }}>
                    <span
                      style={{
                        width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', flexShrink: 0,
                        background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)',
                      }}
                    >
                      <Leaf className="h-5 w-5" />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.md, fontWeight: 800 }}>شهروند سبز</p>
                      <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.onHeroMuted }}>
                        {isAuthenticated ? 'حساب شما فعال است' : 'برای ثبت درخواست وارد شوید'}
                      </p>
                    </div>
                  </div>

                  {/* the city, changeable from inside the drawer too */}
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setCityOpen(true); }}
                    style={{
                      position: 'relative', marginTop: S.s4, width: '100%',
                      display: 'flex', alignItems: 'center', gap: S.s3, cursor: 'pointer', fontFamily: 'inherit',
                      padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r2, textAlign: 'start',
                      background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', color: C.onHero,
                    }}
                  >
                    {selectedCity?.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedCity.icon} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: S.xs, color: C.onHeroMuted }}>شهر</span>
                      <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800 }}>{selectedCity?.name || 'انتخاب کنید'}</span>
                    </span>
                    <ChevronDown className="h-4 w-4" style={{ opacity: 0.8, flexShrink: 0 }} />
                  </button>
                </div>

                {/* ── grouped navigation ── */}
                <nav style={{ padding: `${S.s4}px ${S.s3}px`, display: 'flex', flexDirection: 'column', gap: S.s4, flex: 1 }}>
                  {MENU_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p
                        style={{
                          margin: `0 ${S.s2}px ${S.s2}px`, fontSize: 10, fontWeight: 800,
                          letterSpacing: '0.04em', color: C.subtle,
                        }}
                      >
                        {group.label}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {group.items.map(({ title, sub, href, Icon, color }) => {
                          const active = pathname === href;
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              style={{
                                display: 'flex', alignItems: 'center', gap: S.s3, textDecoration: 'none',
                                padding: `${S.s2}px ${S.s2}px`, borderRadius: S.r2,
                                background: active ? C.surface : 'transparent',
                                border: `1px solid ${active ? alpha(color, 30) : 'transparent'}`,
                                boxShadow: active ? C.shadowCard : 'none',
                              }}
                            >
                              <span
                                style={{
                                  width: 38, height: 38, borderRadius: 13, flexShrink: 0,
                                  display: 'grid', placeItems: 'center',
                                  background: alpha(color, active ? 16 : 10),
                                  border: `1px solid ${alpha(color, active ? 30 : 18)}`,
                                  color,
                                }}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800, color: active ? color : C.textStrong }}>
                                  {title}
                                </span>
                                <span style={{ display: 'block', fontSize: 10, color: C.muted, marginTop: 3 }}>{sub}</span>
                              </span>
                              <ChevronLeft className="h-3.5 w-3.5" style={{ color: C.subtle, flexShrink: 0 }} />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* ── footer ── */}
                <div style={{ padding: `${S.s4}px`, borderTop: `1px dashed ${C.border}`, display: 'flex', flexDirection: 'column', gap: S.s3 }}>
                  <InstallButton />
                  {!isAuthenticated && (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
                        padding: '13px 18px', borderRadius: S.r2, textDecoration: 'none',
                        background: C.green, color: C.onAccent, fontSize: S.sm, fontWeight: 800,
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      ورود / ثبت‌نام
                    </Link>
                  )}
                  <p style={{ margin: 0, fontSize: 10, color: C.subtle, textAlign: 'center' }}>
                    سامانهٔ خدمات شهری شهرشهر
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* city */}
          <button
            type="button"
            onClick={() => setCityOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
              padding: '5px 11px 5px 5px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
              background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)',
              color: C.onHero, fontSize: S.xs, fontWeight: 800,
            }}
          >
            {selectedCity?.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedCity.icon} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span style={{ whiteSpace: 'nowrap' }}>{selectedCity?.name || 'انتخاب شهر'}</span>
            <ChevronDown className="h-3.5 w-3.5" style={{ opacity: 0.75 }} />
          </button>

          <span style={{ flex: 1 }} />

          {/* account */}
          {isAuthenticated ? (
            <Link href="/profile" aria-label="پروفایل" style={{ color: C.onHero, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CircleUser className="h-7 w-7" />
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, textDecoration: 'none',
                padding: '9px 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)',
                color: C.onHero, fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
              }}
            >
              <LogIn className="h-4 w-4" />
              ورود
            </Link>
          )}
        </div>
      </header>

      {/* ── city picker ── */}
      {cityOpen && (
        <div
          dir="rtl"
          onClick={() => setCityOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100001,
            background: 'rgba(9, 20, 16, 0.55)', backdropFilter: 'blur(2px)',
            display: 'grid', placeItems: 'center', padding: S.s4,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 420, background: C.surface, borderRadius: S.r4,
              boxShadow: C.shadowSheet, padding: S.s5, color: C.text,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3, marginBottom: S.s4 }}>
              <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>انتخاب شهر</p>
              <button
                type="button"
                onClick={() => setCityOpen(false)}
                aria-label="بستن"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p style={{ margin: `0 0 ${S.s3}px`, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
              تعرفه‌ها و درخواست‌ها به شهر انتخابی محدود می‌شوند.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
              {cities.map((city) => {
                const on = selectedCity?.id === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setCityOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: S.s3, textAlign: 'start', cursor: 'pointer',
                      padding: `${S.s3}px`, borderRadius: S.r2, fontFamily: 'inherit',
                      background: on ? alpha(C.green, 10) : C.surface2,
                      border: `1.5px solid ${on ? C.green : C.border}`,
                      color: C.text,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={city.icon}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: C.bgSubtle }}
                    />
                    <span style={{ flex: 1, minWidth: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{city.name}</span>
                    {on && (
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.green, color: C.onAccent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
