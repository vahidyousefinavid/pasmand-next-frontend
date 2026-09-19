'use client';

import type { ReactNode } from 'react';

import PageSkeleton from '@/components/views/page-skeleton';
import { useHasService } from '@/lib/cityServices';
import ServiceOff from './service-off';

/**
 * The waste screens, behind the question every other service already asks.
 *
 * `جمع‌آوری پسماند` is opt-*out* on the server — it predates the module system,
 * so a city runs it unless it has switched `requests` off — and the app used to
 * assume that meant "always". A municipality that has not bought collection
 * still got the wizard, the tracking list and the collector chat.
 *
 * Three answers, not two:
 *   on       → the screen
 *   off      → «این خدمت در شهر شما فعال نیست», with what the city does run
 *   unknown  → the screen. A call in flight gets the skeleton; a call that
 *              *failed* gets the content, because taking a service away on a
 *              timeout is worse than showing one that may not be there.
 */
export default function WasteGate({ children, note }: { children: ReactNode; note?: string }) {
  const { has, loading, failed } = useHasService('waste');

  if (loading) return <PageSkeleton />;
  if (!failed && has === false) return <ServiceOff title="جمع‌آوری پسماند" note={note} />;
  return <>{children}</>;
}
