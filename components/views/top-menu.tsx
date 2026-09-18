'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CircleUser, MenuIcon, LogIn, Leaf, MapPin, ChevronDown, ChevronLeft, Check, X,
  PackagePlus, FileClock, Wallet, MapPinned, Banknote, Trash2, BookOpen, User, Headphones,
  Settings,
  MessagesSquare, Bell, ListChecks,
  Globe,
  type LucideIcon,
} from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/data-context';
import InstallButton from './InstallButton';
import { C, S, alpha } from '@/components/ui/tokens';
import NotificationCenter from '@/components/notification-center';
import { serviceIcon, useCityServices } from '@/lib/cityServices';
import { SKINS, useSkin } from '@/context/skin-context';
import MessagesBell from '@/components/messages-bell';

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
      // First, because it is the answer to the question the rest of this group
      // asks one service at a time.
      { title: 'همهٔ کارهای من', sub: 'درخواست، رزرو، گزارش و نامه — در یک فهرست', href: '/activity', Icon: ListChecks, color: C.green },
      { title: 'ثبت درخواست', sub: 'جمع‌آوری پسماند از درِ خانه', href: '/new-request', Icon: PackagePlus, color: C.green },
      { title: 'پیگیری درخواست‌ها', sub: 'مسیر هر درخواست پسماند، مرحله به مرحله', href: '/history', Icon: FileClock, color: C.statusInfo },
      { title: 'پیام‌ها', sub: 'گفتگو با جمع‌آوران', href: '/messages', Icon: MessagesSquare, color: C.statusInfo },
      { title: 'اعلان‌ها', sub: 'هر خبری که برای شما آمده', href: '/notifications', Icon: Bell, color: C.amber },
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
      // `/settings` had no inbound link anywhere in the app, and it is the only
      // place the light/dark theme can be changed — the setting existed but
      // could be reached only by typing the URL.
      { title: 'تنظیمات', sub: 'ظاهر برنامه و حالت روشن/تاریک', href: '/settings', Icon: Settings, color: C.statusNeutral },
      { title: 'پشتیبانی', sub: 'تماس، ایمیل و گفتگو', href: '/contact-us', Icon: Headphones, color: C.statusNeutral },
      // The public site is a one-way door without this. `/` serves the landing
      // page only to visitors with no cookie, so once you are signed in the
      // page describing the service becomes unreachable from inside the app —
      // and it is where the tariff, the waste guide and the FAQ are introduced.
      { title: 'صفحهٔ نخست سایت', sub: 'معرفی سامانه و خدمات شهری', href: '/welcome', Icon: Globe, color: C.green },
    ],
  },
];

export function TopMenu() {
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  // The list comes from the panel; see context/data-context.tsx.
  const { selectedCity, setSelectedCity, cities, switching } = useCity();
  // Whatever this city runs beyond the waste service — the drawer is where
  // somebody goes looking for a service they were told about.
  const { services: cityModules } = useCityServices();
  const { skin, setSkin } = useSkin();
  const pathname = usePathname();

  /**
   * The plaque on the home screen opens this picker. Keeping one dialog and
   * calling it from wherever the city is named beats a second copy that can
   * drift out of step with this one.
   */
  useEffect(() => {
    const open = () => setCityOpen(true);
    window.addEventListener('shahrshahr:city-picker', open);
    return () => window.removeEventListener('shahrshahr:city-picker', open);
  }, []);

  return (
    <>
      <header
        dir="rtl"
        /**
         * A rail, not a slab.
         *
         * The top bar used to be a second green gradient with rounded corners,
         * which meant two loud objects stacked on every screen — it and the
         * hero under it — and a citizen's eye had nowhere to rest. The plaque
         * is the object that speaks now; this is the shelf it hangs from:
         * panel white, one hairline, and the controls in ink.
         */
        style={{
          position: 'fixed', insetInline: 0, top: 0, zIndex: 10000,
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          color: C.text,
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
                  display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: S.r1,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.text, cursor: 'pointer', flexShrink: 0,
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
                    background: `linear-gradient(180deg, ${C.enamel}, ${C.enamelDeep})`,
                    color: C.onHero,
                    padding: `calc(${S.s6}px + env(safe-area-inset-top)) ${S.s4}px ${S.s5}px`,
                  }}
                >
                  {/* The drawer opens on the plaque, keyline and all, so it is
                      recognisably the same object that heads every screen. */}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', insetInline: 8, top: 'calc(env(safe-area-inset-top) + 8px)', bottom: 8,
                      borderRadius: S.r2, border: `1.5px solid ${C.keyline}`, opacity: 0.5,
                    }}
                  />

                  <div style={{ position: 'relative' }}>
                    <p className="sh-display" style={{ margin: 0, fontSize: S.xl }}>شهرشهر</p>
                    <p style={{ margin: '2px 0 0', fontSize: S.xs, color: C.onHeroMuted }}>
                      {isAuthenticated ? 'سامانهٔ خدمات شهری — حساب شما فعال است' : 'سامانهٔ خدمات شهری — برای ثبت درخواست وارد شوید'}
                    </p>
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
                      <img src={selectedCity.icon} alt={`نشان شهر ${selectedCity.name}`} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
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
                  {cityModules.filter((service) => service.key !== 'waste').length > 0 && (
                    <div>
                      <p style={{ margin: `0 ${S.s2}px ${S.s2}px`, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: C.subtle }}>
                        خدمات شهر شما
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {cityModules.filter((service) => service.key !== 'waste').map((service) => {
                          const Icon = serviceIcon(service.icon);
                          const active = pathname === service.href;
                          return (
                            <Link
                              key={service.key}
                              href={service.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              style={{
                                display: 'flex', alignItems: 'center', gap: S.s3, textDecoration: 'none',
                                padding: `${S.s2}px ${S.s2}px`, borderRadius: S.r2,
                                background: active ? C.surface : 'transparent',
                                border: `1px solid ${active ? alpha(service.color, 30) : 'transparent'}`,
                                boxShadow: active ? C.shadowCard : 'none',
                              }}
                            >
                              <span
                                style={{
                                  width: 38, height: 38, borderRadius: 13, flexShrink: 0, display: 'grid', placeItems: 'center',
                                  background: alpha(service.color, 12), color: service.color,
                                  border: `1px solid ${alpha(service.color, 22)}`,
                                }}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{service.title}</span>
                                <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: C.muted }}>{service.short}</span>
                              </span>
                              <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {MENU_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p
                        style={{
                          margin: `0 ${S.s2}px ${S.s2}px`, fontSize: 11, fontWeight: 700,
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
                                <span style={{ display: 'block', fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</span>
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
                  {/* The colour of the city's signs, where somebody will
                      actually come across it. The full choice — including
                      روشن/تاریک — is one tap further on, in تنظیمات. */}
                  <div>
                    <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 600, color: C.muted }}>رنگ شهر</p>
                    <div role="radiogroup" aria-label="رنگ شهر" style={{ display: 'flex', gap: S.s2 }}>
                      {SKINS.map((option) => {
                        const on = skin === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            aria-label={option.title}
                            title={option.title}
                            onClick={() => setSkin(option.key)}
                            style={{
                              flex: 1, minHeight: 44, cursor: 'pointer', padding: 5,
                              borderRadius: S.r1, background: C.surface,
                              border: `1.5px solid ${on ? C.enamelInk : C.border}`,
                            }}
                          >
                            <span
                              aria-hidden
                              style={{
                                display: 'grid', placeItems: 'center', height: 26, borderRadius: 5,
                                background: `linear-gradient(180deg, ${option.swatch}, ${option.swatchDeep})`,
                                color: '#fff',
                              }}
                            >
                              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </span>
                            <span style={{ display: 'block', marginTop: 4, fontSize: 11, fontWeight: on ? 800 : 600, color: on ? C.textStrong : C.muted }}>
                              {option.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                  <p style={{ margin: 0, fontSize: 11, color: C.subtle, textAlign: 'center' }}>
                    سامانهٔ خدمات شهری شهرشهر
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* The product's own name, in the sign-writer's face — the bar is
              where it belongs. Which *city* you are in is the plaque's job on
              the screen below, and saying it twice made neither one mean
              anything; the city is still changed from here through the drawer,
              and from the plaque itself on the home screen. */}
          <Link
            href="/"
            aria-label="شهرشهر — خانه"
            style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 6, flexShrink: 0,
              // A 44px-high target: it was 23px, which is a link you have to
              // aim at rather than one you can tap.
              minHeight: 44, paddingBlock: 10, paddingInline: 2,
              textDecoration: 'none', color: C.enamelInk,
            }}
          >
            <span className="sh-display" style={{ fontSize: S.md }}>شهرشهر</span>
            {selectedCity?.name && (
              <span style={{ fontSize: S.xs, fontWeight: 600, color: C.muted, whiteSpace: 'nowrap' }}>
                <bdi>{selectedCity.name}</bdi>
              </span>
            )}
          </Link>

          <span style={{ flex: 1 }} />

          {/* Two different things, two controls: what happened (the bell)
              and what somebody said to you (the conversations). */}
          <MessagesBell />

          <NotificationCenter />

          {/* account */}
          {isAuthenticated ? (
            <Link href="/profile" aria-label="پروفایل" style={{ color: C.text, display: 'grid', placeItems: 'center', flexShrink: 0, width: 44, height: 44 }}>
              <CircleUser className="h-6 w-6" />
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, textDecoration: 'none',
                minHeight: 40, padding: '9px 14px', borderRadius: S.r1,
                background: C.enamel, border: `1px solid ${C.enamel}`,
                color: C.onHero, fontSize: S.xs, fontWeight: 700, whiteSpace: 'nowrap',
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

            {/* What actually happens when they choose — every screen in the
                app answers for this city, not only the price list. */}
            <p style={{ margin: `0 0 ${S.s3}px`, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
              خدمات، تعرفه‌ها، اماکن و همهٔ کارهای شما به شهر انتخابی تغییر می‌کند.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
              {cities.map((city) => {
                const on = selectedCity?.id === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    disabled={switching}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: S.s3, textAlign: 'start',
                      cursor: switching ? 'progress' : 'pointer', opacity: switching && !on ? 0.6 : 1,
                      padding: `${S.s3}px`, borderRadius: S.r2, fontFamily: 'inherit',
                      background: on ? alpha(C.green, 10) : C.surface2,
                      border: `1.5px solid ${on ? C.green : C.border}`,
                      color: C.text,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={city.icon}
                      alt={`نشان شهر ${city.name}`}
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
