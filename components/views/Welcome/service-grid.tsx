'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Recycle, Megaphone, FileText, CalendarCheck, Flower2, Building2, Map as MapIcon,
  ArrowLeft, Lock, Check,
} from 'lucide-react';

import { alpha } from '@/components/ui/tokens';
import type { PublicCity, PublicService } from '@/lib/publicData';

/**
 * «چه کاری می‌خواهید انجام دهید؟»
 *
 * The one question a first-time visitor arrives with.
 *
 * Two things shape this section, and both are reactions to what was here
 * before. The first version was seven identical white rectangles in a
 * three-column grid — the most generic layout a page can have, and one that
 * says every service matters exactly the same amount, which is never true. A
 * municipality running waste collection and little else should not present it
 * as one seventh of a menu.
 *
 * So the layout is **weighted**: the city's headline service takes a panel of
 * its own, the next two take half-panels, and the rest are a quiet list. Each
 * card is tinted with its own service colour rather than being another white
 * box, so the section reads as a set of different places rather than a table.
 *
 * The second thing: every card states **before it is tapped** whether it needs
 * an account. A visitor should meet a sign-in when they commit to something,
 * not when they get curious — and never as a surprise.
 */

const ICONS: Record<string, any> = {
  Recycle, Megaphone, FileText, CalendarCheck, Flower2, Building2, Map: MapIcon,
};

/** What a citizen is actually going to do, in their own words. */
const ACTION: Record<string, string> = {
  waste: 'قیمت روز را ببینید و درخواست بدهید',
  report137: 'مشکلی در شهر را گزارش کنید',
  cartable: 'نامه‌هایتان را پیگیری کنید',
  venues: 'سانس‌های خالی را ببینید و رزرو کنید',
  deceased: 'محل دفن را جست‌وجو کنید',
  urban: 'پروانه و کاربری را پیگیری کنید',
  citymap: 'کاربری و تراکم ملک را ببینید',
};

/** The few words a larger panel has room to add. */
const DETAIL: Record<string, string[]> = {
  waste: ['قیمت روز', 'توزین در محل', 'پرداخت به کیف پول'],
  venues: ['تقویم هر مکان', 'سانس خالی', 'رزرو آنلاین'],
  report137: ['عکس و موقعیت', 'پیگیری تا رفع'],
  citymap: ['کاربری اراضی', 'تراکم', 'فضای سبز'],
  urban: ['پروانهٔ ساخت', 'تغییر کاربری', 'تخفیف عوارض'],
  deceased: ['جست‌وجوی نام', 'قطعه و ردیف'],
  cartable: ['وضعیت نامه', 'مرحله‌به‌مرحله'],
};

/**
 * تا جایی که می‌شود، بدون ورود.
 *
 * Several services have a public half this grid used to walk straight past:
 * «رزرو اماکن» sent a visitor to a login when `/city/<slug>/venues` already
 * lists every hall, its calendar and its free sessions to somebody with no
 * account — handing them to the sign-in only once they pick a session, with
 * that session carried along. `null` means there is genuinely nothing to show
 * without an account, and the card says so.
 */
const OPEN_DOOR: Record<string, (slug: string) => string | null> = {
  venues: (slug) => `/city/${slug}/venues`,
  citymap: () => '/city-map',
  deceased: () => '/deceased',
  waste: (slug) => `/tariff/${slug}`,
  report137: () => null,
  cartable: () => null,
  urban: () => null,
};

/** Which services deserve the big panels when a city runs several. */
const PROMINENCE = ['venues', 'waste', 'urban', 'report137', 'citymap', 'cartable', 'deceased'];

export default function ServiceGrid({
  cities,
  catalogue,
}: {
  cities: PublicCity[];
  catalogue: PublicService[];
}) {
  const live = useMemo(() => cities.filter((c) => c.isActive), [cities]);
  const [city, setCity] = useState<PublicCity | null>(live[0] || null);

  /**
   * شهری که دفعهٔ پیش انتخاب کرده بود.
   *
   * A visitor from همدان should not have to notice that the section opened on
   * نهاوند and change it on every visit. Read after mount rather than in the
   * initial state, because the server has no idea which city this is and a
   * different first render on the client is a hydration mismatch.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ss_city');
      const hit = saved && live.find((c) => c.slug === saved);
      if (hit) setCity(hit);
    } catch {
      // A browser that refuses storage still gets the first city.
    }
  }, [live]);

  const choose = (c: PublicCity) => {
    setCity(c);
    try { localStorage.setItem('ss_city', c.slug); } catch { /* not essential */ }
  };

  const { on, off } = useMemo(() => {
    const enabled = new Set(city?.services || []);
    const rank = (k: string) => {
      const i = PROMINENCE.indexOf(k);
      return i < 0 ? PROMINENCE.length : i;
    };
    return {
      on: catalogue.filter((s) => enabled.has(s.key)).sort((a, b) => rank(a.key) - rank(b.key)),
      off: catalogue.filter((s) => !enabled.has(s.key)),
    };
  }, [catalogue, city]);

  const featured = on.slice(0, 3);
  const rest = on.slice(3);

  return (
    <section className="ss-wrap ss-services">
      <header className="ss-services-head">
        <div>
          <p className="ss-eyebrow">خدمات</p>
          <h2 className="ss-display ss-services-title">چه کاری می‌خواهید انجام دهید؟</h2>
        </div>

        {live.length > 0 && (
          <div className="ss-city-switch" role="group" aria-label="انتخاب شهر">
            {live.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => choose(c)}
                aria-pressed={city?._id === c._id}
                className="ss-city-pill"
                data-on={city?._id === c._id ? 'true' : 'false'}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {featured.length > 0 && (
        <div className="ss-bento" data-count={featured.length}>
          {featured.map((service, i) => (
            <ServiceCard
              key={service.key}
              service={service}
              city={city}
              size={i === 0 ? 'lead' : 'half'}
              index={i}
            />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <ul className="ss-svc-list">
          {rest.map((service, i) => (
            <li key={service.key}>
              <ServiceCard service={service} city={city} size="row" index={featured.length + i} />
            </li>
          ))}
        </ul>
      )}

      {/* Services this city has not switched on are named rather than hidden:
          «سامانه ندارد» and «شهرداری من روشن نکرده» are very different answers,
          and a visitor who cannot tell them apart assumes the first. */}
      {off.length > 0 && (
        <p className="ss-svc-off">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          <span>
            در {city?.name || 'این شهر'} هنوز فعال نشده: {off.map((s) => s.title).join('، ')}
          </span>
        </p>
      )}
    </section>
  );
}

function ServiceCard({
  service,
  city,
  size,
  index,
}: {
  service: PublicService;
  city: PublicCity | null;
  size: 'lead' | 'half' | 'row';
  index: number;
}) {
  const Icon = ICONS[service.icon] || FileText;
  const open = city?.slug ? OPEN_DOOR[service.key]?.(city.slug) ?? null : null;
  const href = open || (service.isPublic ? service.href : `/login?next=${encodeURIComponent(service.href)}`);
  const needsAccount = !open && !service.isPublic;
  const detail = DETAIL[service.key] || [];

  return (
    <Link
      href={href}
      className="ss-scard ss-rise"
      data-size={size}
      style={{
        // One hue per card, used for the wash, the rule, the icon and the
        // shadow — so the colour reads as the service's identity rather than
        // as decoration applied on top of a white box.
        ['--svc' as any]: service.color,
        ['--svc-wash' as any]: alpha(service.color, 8),
        ['--svc-line' as any]: alpha(service.color, 22),
        ['--svc-glow' as any]: alpha(service.color, 18),
        animationDelay: `${Math.min(index, 6) * 55}ms`,
      }}
    >
      {/* A large, very faint mark of the service's own icon: each panel gets a
          different silhouette at a glance, which is what stops a grid of cards
          reading as a table. */}
      <Icon className="ss-scard-ghost" aria-hidden />

      <span className="ss-scard-top">
        <span className="ss-scard-icon" aria-hidden><Icon /></span>
        <span className="ss-scard-flag" data-locked={needsAccount ? 'true' : 'false'}>
          {needsAccount ? 'نیاز به ورود' : 'بدون ثبت‌نام'}
        </span>
      </span>

      <span className="ss-scard-body">
        <span className="ss-scard-title">{service.title}</span>
        <span className="ss-scard-line">{ACTION[service.key] || service.short}</span>

        {size !== 'row' && detail.length > 0 && (
          <span className="ss-scard-detail">
            {detail.map((d) => (
              <span key={d}>
                <Check className="h-3 w-3" aria-hidden />
                {d}
              </span>
            ))}
          </span>
        )}
      </span>

      <span className="ss-scard-cta">
        {needsAccount ? 'ورود و ادامه' : 'ببینید'}
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}
