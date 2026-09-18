'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Moon, Sun, SunMoon } from 'lucide-react';

import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import { useCity } from '@/context/data-context';
import { SKINS, useSkin, type Skin } from '@/context/skin-context';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Plaque, Card, Code, SectionTitle } from '@/components/ui/kit';

/**
 * ظاهر — the two choices a citizen has about how this app looks.
 *
 * They are shown the way they are chosen: each option *is* a small plaque in
 * the colour it would paint, so nobody has to tap one to find out what «زغالی»
 * means. The preview above them is the real component, in the real language,
 * changing the moment a choice is made — there is no «ذخیره» button, because
 * the screen has already done what it promised.
 */

const MODES: { key: string; title: string; note: string; Icon: typeof Sun }[] = [
  { key: 'light', title: 'روشن', note: 'همیشه روشن', Icon: Sun },
  { key: 'dark', title: 'تاریک', note: 'همیشه تاریک', Icon: Moon },
  { key: 'system', title: 'مثل گوشی', note: 'از تنظیم دستگاه پیروی می‌کند', Icon: SunMoon },
];

export default function AppearanceView() {
  const { skin, setSkin } = useSkin();
  const { theme, setTheme } = useTheme();
  const { selectedCity } = useCity();
  const [mounted, setMounted] = useState(false);

  // The theme is only known in the browser; rendering a chosen state on the
  // server would mark the wrong one until hydration.
  useEffect(() => setMounted(true), []);

  const cityName = selectedCity?.name || 'شهر شما';

  return (
    <>
      <TopMenu />
      <Screen>
        <Plaque
          section="تنظیمات"
          city="ظاهر برنامه"
          note="رنگ تابلوها و روشن یا تاریک بودن صفحه — انتخاب شما روی همین دستگاه می‌ماند."
        />

        <SectionTitle title="رنگ شهر" />

        <div role="radiogroup" aria-label="رنگ شهر" style={{ display: 'grid', gap: S.s3 }}>
          {SKINS.map((option) => {
            const on = skin === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSkin(option.key as Skin)}
                style={{
                  display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
                  padding: S.s3, borderRadius: S.r3, cursor: 'pointer',
                  textAlign: 'start', fontFamily: 'inherit',
                  background: C.surface,
                  border: `1.5px solid ${on ? C.enamelInk : C.border}`,
                }}
              >
                {/* The option is a plaque in the colour it would paint —
                    keyline and all, at the size of a thumbnail. */}
                <span
                  aria-hidden
                  style={{
                    position: 'relative', width: 64, height: 46, flexShrink: 0,
                    borderRadius: S.r2, overflow: 'hidden',
                    background: `linear-gradient(180deg, ${option.swatch}, ${option.swatchDeep})`,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute', inset: 4, borderRadius: 6,
                      border: `1.5px solid ${option.key === 'ink' ? 'rgba(230,201,138,0.62)' : 'rgba(255,255,255,0.72)'}`,
                      opacity: 0.6,
                    }}
                  />
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: S.base, fontWeight: 700, color: C.textStrong }}>
                    {option.title}
                    {option.key === 'green' && (
                      <span style={{ fontSize: S.xs, fontWeight: 600, color: C.muted, marginInlineStart: 8 }}>
                        پیش‌فرض
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                    {option.note}
                  </span>
                </span>

                <span
                  aria-hidden
                  style={{
                    width: 24, height: 24, flexShrink: 0, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: on ? C.enamelInk : 'transparent',
                    border: `1.5px solid ${on ? C.enamelInk : C.borderStrong}`,
                    color: on ? C.onHero : 'transparent',
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>

        <SectionTitle title="روشن یا تاریک" />

        <Card>
          <div role="radiogroup" aria-label="روشن یا تاریک">
            {MODES.map((mode, i) => {
              const on = mounted && theme === mode.key;
              return (
                <button
                  key={mode.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTheme(mode.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
                    minHeight: 60, padding: `${S.s3}px ${S.s4}px`, cursor: 'pointer',
                    textAlign: 'start', fontFamily: 'inherit',
                    background: 'transparent', border: 'none',
                    borderTop: i ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 36, height: 36, flexShrink: 0, borderRadius: S.r1,
                      display: 'grid', placeItems: 'center',
                      background: alpha(C.enamelInk, 10),
                      border: `1px solid ${alpha(C.enamelInk, 24)}`,
                      color: C.enamelInk,
                    }}
                  >
                    <mode.Icon className="h-4 w-4" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: S.base, fontWeight: 700, color: C.textStrong }}>
                      {mode.title}
                    </span>
                    <span style={{ display: 'block', marginTop: 2, fontSize: S.xs, color: C.muted }}>
                      {mode.note}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: 22, height: 22, flexShrink: 0, borderRadius: '50%',
                      display: 'grid', placeItems: 'center',
                      background: on ? C.enamelInk : 'transparent',
                      border: `1.5px solid ${on ? C.enamelInk : C.borderStrong}`,
                      color: on ? C.onHero : 'transparent',
                    }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* What the choice actually does, shown rather than described. */}
        <SectionTitle title="پیش‌نمایش" tone={C.brass} />
        <Plaque
          section="شهرداری"
          city={cityName}
          note="تابلوی هر صفحه با همین رنگ کشیده می‌شود."
          aside={<Code tone="rgba(255,255,255,0.86)">۱۴۰۴۲۳۱</Code>}
        />
        <p style={{ margin: `-${S.s2}px 0 0`, fontSize: S.xs, color: C.muted, lineHeight: 1.9 }}>
          رنگ خدمات — پسماند، اماکن، ۱۳۷، کارتابل و درگذشتگان — با تغییر رنگ شهر عوض نمی‌شود؛
          هر خدمت رنگ خودش را دارد تا از روی رنگ شناخته شود.
        </p>
      </Screen>
      <Navigation />
    </>
  );
}
