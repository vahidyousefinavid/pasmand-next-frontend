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

/** The modules this citizen's city runs. Empty until it answers. */
export function useCityServices() {
  const [services, setServices] = useState<CityService[]>([]);
  const [city, setCity] = useState<{ _id: string; name: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) { setLoading(false); return; }

    axiosService({ url: '/api/v1/services', method: 'get', token })
      .then((res: any) => {
        setServices(res?.data?.services || []);
        setCity(res?.data?.city || null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return { services, city, loading };
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

export const VENUE_KINDS: Record<string, string> = {
  sports: 'سالن ورزشی',
  hall: 'سالن و فرهنگسرا',
  market_stall: 'غرفهٔ بازارچه',
  amphitheater: 'آمفی‌تئاتر',
  other: 'سایر',
};
