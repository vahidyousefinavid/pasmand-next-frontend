'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Building2, CalendarCheck, FileText, Flower2, Megaphone, Recycle, type LucideIcon,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';

/**
 * خدمات شهر, as the app sees them.
 *
 * The list comes from the API rather than from a constant here, because which
 * services exist is the *city's* answer, not the app's: a municipality switches
 * a module on in its panel and it appears in its citizens' app without a
 * deploy. All this file adds is the icon each key is drawn with, which is the
 * one thing a JSON payload cannot carry.
 */

export interface CityService {
  key: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  isPublic: boolean;
}

const ICONS: Record<string, LucideIcon> = {
  Recycle,
  Megaphone,
  FileText,
  CalendarCheck,
  Flower2,
  Building2,
};

export const serviceIcon = (name: string): LucideIcon => ICONS[name] || Building2;

/**
 * The modules this citizen's city runs. Empty until it answers.
 *
 * `failed` matters as much as the list does. This one call decides which
 * services exist in the whole app — ۱۳۷, کارتابل, اماکن and درگذشتگان have no
 * static entry anywhere, they are only ever rendered from this array. When the
 * call was swallowed with `.catch(() => undefined)`, a citizen of a city that
 * runs four services saw a waste-only app with no error and nothing to retry,
 * indistinguishable from a city that genuinely runs one. So the failure is
 * reported and the caller can offer «تلاش دوباره».
 */
/**
 * One answer, shared by everything that asks.
 *
 * Which services a city runs now decides the tab bar, the drawer, the home
 * screen and the gate in front of every waste route — five or six components on
 * a single screen. Each used to mount its own copy of this hook and fire its
 * own `/api/v1/services`, so a phone on a slow connection paid for the same
 * answer five times before it could draw a tab bar.
 *
 * The result lives in the module and the subscribers share it: the first
 * caller makes the request, the rest wait on the same promise, and a `retry()`
 * from any of them refreshes all of them.
 */
type ServicesState = {
  services: CityService[];
  city: { _id: string; name: string; slug: string } | null;
  loading: boolean;
  failed: boolean;
};

const EMPTY: ServicesState = { services: [], city: null, loading: true, failed: false };

let cache: ServicesState = EMPTY;
let inflight: Promise<void> | null = null;
const listeners = new Set<(state: ServicesState) => void>();

const publish = (next: ServicesState) => {
  cache = next;
  listeners.forEach((listener) => listener(next));
};

function load(force = false): Promise<void> {
  if (inflight && !force) return inflight;
  const token = Cookies.get('auth_token');
  if (!token) {
    // Nothing to ask with. Not a failure — an anonymous visitor simply has no
    // city yet, and the callers treat "no services" as "not signed in".
    publish({ services: [], city: null, loading: false, failed: false });
    return Promise.resolve();
  }

  publish({ ...cache, loading: true, failed: false });
  inflight = axiosService({ url: '/api/v1/services', method: 'get', token })
    .then((res: any) => {
      publish({
        services: res?.data?.services || [],
        city: res?.data?.city || null,
        loading: false,
        failed: false,
      });
    })
    .catch(() => {
      publish({ ...cache, loading: false, failed: true });
    })
    .finally(() => { inflight = null; });

  return inflight;
}

export function useCityServices() {
  const [state, setState] = useState<ServicesState>(cache);

  useEffect(() => {
    listeners.add(setState);
    setState(cache);
    // Only the first mount fetches; everything else joins the same request.
    if (cache === EMPTY || (cache.loading && !inflight)) load();
    return () => { listeners.delete(setState); };
  }, []);

  return {
    services: state.services,
    city: state.city,
    loading: state.loading,
    failed: state.failed,
    retry: () => load(true),
  };
}

/**
 * Does this citizen's city run a given module?
 *
 * Waste is the reason this exists. It predates the module system, so on the
 * server it is opt-*out* (`features.requests !== false`) where the other five
 * are opt-in — but a municipality that does not buy waste collection can
 * switch it off, and until now the app ignored that: it kept a «درخواست» tab,
 * a price table and a «ثبت درخواست جمع‌آوری» button for a city that does not
 * collect anything. Every other service already disappears when its city has
 * not asked for it; this makes waste behave the same.
 *
 * `unknown` is not `false`. While the call is in flight, or after it has
 * failed, the answer is "we do not know yet" — hiding half the app because a
 * request timed out would be worse than showing it. Callers render nothing,
 * or a skeleton, until `settled`.
 */
export function useHasService(key: string) {
  const { services, city, loading, failed, retry } = useCityServices();
  const settled = !loading && !failed;
  return {
    has: settled ? services.some((service) => service.key === key) : undefined,
    settled,
    loading,
    failed,
    retry,
    city,
    services,
  };
}

/** Status vocabulary shared by the module screens. */
export const REPORT_STATUS: Record<string, { label: string; tone: 'wait' | 'work' | 'done' | 'stop' }> = {
  received: { label: 'ثبت شد', tone: 'wait' },
  in_review: { label: 'در حال بررسی', tone: 'work' },
  in_progress: { label: 'در دست اقدام', tone: 'work' },
  done: { label: 'انجام شد', tone: 'done' },
  rejected: { label: 'بسته شد', tone: 'stop' },
};

export const REPORT_CATEGORIES: { key: string; label: string }[] = [
  { key: 'obstruction', label: 'سد معبر' },
  { key: 'asphalt', label: 'آسفالت و معبر' },
  { key: 'waste', label: 'زبالهٔ رهاشده' },
  { key: 'lighting', label: 'روشنایی' },
  { key: 'greenery', label: 'فضای سبز' },
  { key: 'water', label: 'آب‌گرفتگی' },
  { key: 'traffic', label: 'تابلو و علائم' },
  { key: 'other', label: 'موارد دیگر' },
];

export const LETTER_STATUS: Record<string, { label: string; tone: 'wait' | 'work' | 'done' | 'stop' }> = {
  submitted: { label: 'ثبت شد', tone: 'wait' },
  in_review: { label: 'در حال بررسی', tone: 'work' },
  pending: { label: 'در انتظار مدارک', tone: 'wait' },
  approved: { label: 'تأیید شد', tone: 'done' },
  rejected: { label: 'رد شد', tone: 'stop' },
  archived: { label: 'بایگانی', tone: 'stop' },
};

export const BOOKING_STATUS: Record<string, { label: string; tone: 'wait' | 'work' | 'done' | 'stop' }> = {
  pending: { label: 'در انتظار تأیید', tone: 'wait' },
  confirmed: { label: 'قطعی', tone: 'done' },
  canceled: { label: 'لغو شد', tone: 'stop' },
  rejected: { label: 'رد شد', tone: 'stop' },
  done: { label: 'برگزار شد', tone: 'work' },
};

/**
 * Kept only for screens that have not been moved over yet. The catalogue is
 * served by the API now (`Utils/venueKinds.js`), because which kinds exist is
 * the platform's answer and a copy here goes stale the moment one is added.
 */
export const VENUE_KINDS: Record<string, string> = {
  sports: 'سالن ورزشی',
  hall: 'سالن و فرهنگسرا',
  market_stall: 'غرفهٔ بازارچه',
  amphitheater: 'آمفی‌تئاتر',
  other: 'سایر',
};
