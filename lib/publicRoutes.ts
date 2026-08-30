import type { PublicCity, PublicService } from './publicData';

/**
 * جایی که هر خدمت، برای کسی که هنوز حساب ندارد، شروع می‌شود.
 *
 * The catalogue the API sends carries `href` — where a service starts *inside
 * the app*, behind the login. That is the right answer for the signed-in menu
 * and the wrong one for a public page, where it produced a grid of five cards
 * that all went to the same login form.
 *
 * This table is the public answer instead, and the important field is `access`,
 * which has **three** states rather than two. The first version had two, and it
 * was dishonest: رزرو اماکن was labelled «بدون ثبت‌نام» because the calendar can
 * be read without an account — but a seat cannot be taken without one, and a
 * badge that promises otherwise is discovered to be false at exactly the moment
 * somebody has decided to go swimming on Thursday.
 *
 *   open    — the whole thing works with no account. Only درگذشتگان.
 *   browse  — look freely, act with a login. اماکن (see the sessions, sign in to
 *             book) and پسماند (see the prices, sign in to request a pickup).
 *             `note` says which half needs the account, in a verb.
 *   login   — personal by nature; it starts at the login and says so on its
 *             face. ۱۳۷ is filed *by* somebody and a letter belongs *to*
 *             somebody, so there is nothing to show first.
 */
export type Access = 'open' | 'browse' | 'login';

export interface ServiceEntry {
  href: string;
  action: string;
  access: Access;
  /** What the login is for — shown on the card, never discovered after it. */
  note: string;
}

/** `/login?next=…`, with the destination kept intact through the round trip. */
export const loginTo = (next: string, cityId?: string) =>
  `/login?${cityId ? `city=${encodeURIComponent(cityId)}&` : ''}next=${encodeURIComponent(next)}`;

export function serviceEntry(service: PublicService, city: PublicCity): ServiceEntry {
  const slug = city.slug || city._id;

  switch (service.key) {
    case 'venues':
      return {
        href: `/city/${slug}/venues`,
        action: 'دیدن سانس‌ها',
        access: 'browse',
        note: 'رزرو با ورود',
      };

    case 'deceased':
      // The register is per city, and the page reads `?city=` — a link without
      // it searches whichever city happens to sort first.
      return {
        href: `/deceased?city=${encodeURIComponent(slug)}`,
        action: 'جست‌وجوی نام',
        access: 'open',
        note: 'بدون ثبت‌نام',
      };

    case 'waste':
      return {
        href: `/tariff/${slug}`,
        action: 'قیمت روز پسماند',
        access: 'browse',
        note: 'ثبت درخواست با ورود',
      };

    case 'report137':
      return { href: loginTo('/reports', city._id), action: 'ثبت گزارش ۱۳۷', access: 'login', note: 'با ورود' };

    case 'cartable':
      return { href: loginTo('/cartable', city._id), action: 'پیگیری نامه‌ها', access: 'login', note: 'با ورود' };

    default:
      return { href: loginTo(service.href || '/', city._id), action: 'شروع', access: 'login', note: 'با ورود' };
  }
}

/** The city's own public page — every service it runs, on one address. */
export const cityHref = (city: { slug?: string; _id: string }) => `/city/${city.slug || city._id}`;
