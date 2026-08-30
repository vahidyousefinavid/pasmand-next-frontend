/**
 * رزرو اماکن، پیش از داشتن حساب.
 *
 * The booking module used to begin at the login form: the front page said
 * «رزرو اماکن · فعال» and every route into it went through a pair of input
 * fields. So the one service on this platform a citizen would come looking for
 * by name — «ساعت استخر»، «رزرو سالن ورزشی» — could not be seen, priced or
 * planned by anybody who had not already signed up for something else.
 *
 * These fetchers read the public half of the module: which places a city lets,
 * when they open, what a session costs and how many places are left. The seat
 * itself is still claimed by the signed-in API and always will be — what the
 * public pages do is get somebody to the exact session they want *before* they
 * are asked for a phone number, and hand them straight back to it afterwards.
 */

const API = process.env.DOMAIN_API || 'http://pasmand-api:3008';

export interface VenueSession {
  _id: string;
  from: string;
  to: string;
  audience: string;
  label: string;
  price: number;
  capacity: number;
  taken: number;
  left: number;
  available: boolean;
  blockedReason: string;
}

export interface CalendarDay {
  dateKey: string;
  date: string;
  weekday: number;
  weekdayName: string;
  jy: number;
  jm: number;
  jd: number;
  monthName: string;
  say: string;
  ahead: number;
  isToday: boolean;
  closed: boolean;
  reason: string;
  sessionCount: number;
  audiences: string[];
}

export interface PublicVenue {
  _id: string;
  title: string;
  kind: string;
  kindTitle: string;
  group: string;
  description: string;
  address: string;
  phone?: string;
  rules?: string;
  photos: string[];
  facilities: string[];
  capacity?: number;
  price: number;
  needsApproval: boolean;
  minNoticeHours?: number;
  cancelDeadlineHours?: number;
  maxPerCitizenPerWeek?: number;
  bookingWindowDays?: number;
  location?: { lat: number; lng: number } | null;
  nextOpen?: { date: string; dateKey: string; weekdayName: string; say: string; ahead: number } | null;
  audiences?: string[];
  priceFrom?: number | null;
  priceTo?: number | null;
  /**
   * The next few hours that can actually be taken, one per day so a card offers
   * a choice rather than one busy afternoon. Present on the public list only.
   */
  nextSessions?: VenueHighlight[];
}

export interface VenueCatalogue {
  audiences: { key: string; title: string; short: string; color: string }[];
  kinds: { key: string; title: string; group: string }[];
  /** `icon` names a lucide drawing; see `groupIcon` in `Public/venue-bits`. */
  groups: { key: string; title: string; color: string; icon?: string }[];
  facilities?: string[];
}

export interface VenueCityFace {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  announcement?: string;
}

export interface CityVenues {
  city: VenueCityFace;
  venues: PublicVenue[];
  catalogue: VenueCatalogue;
}

export interface VenueDay {
  city: VenueCityFace;
  venue: PublicVenue;
  date: string;
  say: string;
  dateKey: string;
  weekday: number | null;
  weekdayName: string;
  closed: boolean;
  reason: string;
  bookable: boolean;
  sessions: VenueSession[];
  calendar: CalendarDay[];
  catalogue: VenueCatalogue;
}

/** «استخر شهدا · فردا ۱۶:۰۰ · ۳ جا مانده» — one line the front page can act on. */
export interface VenueHighlight {
  venue: string;
  venueTitle: string;
  kind: string;
  photo: string;
  dateKey: string;
  say: string;
  ahead: number;
  from: string;
  to: string;
  audience: string;
  label: string;
  price: number;
  left: number;
}

export interface CityHighlights {
  _id: string;
  slug: string;
  name: string;
  venueCount: number;
  soon: VenueHighlight[];
}

async function get<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    // A page that is mostly about something else must not die because one
    // section could not be filled.
    console.error(`public venues ${path} failed:`, (error as Error).message);
    return null;
  }
}

/**
 * How long each of these may be stale, decided by what the number *means*.
 *
 * A list of places changes when an operator adds one — minutes of staleness
 * cost nothing. «چند جا مانده» is a different kind of fact: quoting a free seat
 * that went half an hour ago sends somebody through a login to be refused, so
 * the day view is nearly live and the front page's teaser sits between the two.
 */
const LIST_TTL = 600;
const DAY_TTL = 45;
const HIGHLIGHT_TTL = 120;

export const getCityVenues = (city: string, group?: string) =>
  get<CityVenues>(`/api/v1/public/cities/${encodeURIComponent(city)}/venues${group ? `?group=${encodeURIComponent(group)}` : ''}`, LIST_TTL);

export const getCityVenue = (city: string, id: string, date?: string) =>
  get<VenueDay>(`/api/v1/public/cities/${encodeURIComponent(city)}/venues/${encodeURIComponent(id)}${date ? `?date=${encodeURIComponent(date)}` : ''}`, DAY_TTL);

export async function getVenueHighlights(): Promise<CityHighlights[]> {
  const payload = await get<{ cities: CityHighlights[] }>('/api/v1/public/venues/highlights', HIGHLIGHT_TTL);
  return payload?.cities || [];
}

/**
 * Where a visitor is sent to finish what they started.
 *
 * The public pages end at «رزرو این سانس», and this is the whole of the handoff:
 * the login is told which city the visitor was reading (so it does not sign
 * them up in the wrong one) and where to put them afterwards (`next`), and the
 * app's own booking screen is told which venue and which day to open. Somebody
 * who chose Thursday's ۱۶:۰۰ before signing up comes back to Thursday's ۱۶:۰۰.
 */
export function bookHref(cityId: string, venueId: string, dateKey: string) {
  const next = `/venues?venue=${venueId}&date=${dateKey}`;
  return `/login?city=${encodeURIComponent(cityId)}&next=${encodeURIComponent(next)}`;
}

/** ۰۸:۰۰ → «۰۸:۰۰», in the digits the rest of the page is written in. */
export const faTime = (time: string) => String(time || '').replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
