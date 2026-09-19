'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Plaque, Card, Shimmer } from '@/components/ui/kit';
import { serviceIcon, useCityServices } from '@/lib/cityServices';

/**
 * «این خدمت در شهر شما فعال نیست».
 *
 * A citizen can still arrive at a switched-off service — an old bookmark, a
 * link from a relative in the next town, the back button. The answer has to be
 * the honest one, and it has to distinguish the two things a blank page cannot:
 * «شهرداری شما این خدمت را ارائه نمی‌دهد» is not «سامانه خراب است».
 *
 * It also does the one useful thing available: name what this city *does* run,
 * so the trip is not wasted.
 */
export default function ServiceOff({
  title,
  note,
}: {
  /** The service that is off, named the way the catalogue names it. */
  title: string;
  note?: string;
}) {
  const { services, city, loading } = useCityServices();

  return (
    <>
      <TopMenu />
      <Screen>
        <Plaque
          section="خدمات شهر"
          city={title}
          note={
            city?.name
              ? `شهرداری ${city.name} این خدمت را فعال نکرده است.`
              : 'این خدمت در شهر شما فعال نیست.'
          }
        />

        <Card accent={C.statusNeutral}>
          <div style={{ padding: S.s5, display: 'grid', gap: S.s3, justifyItems: 'center', textAlign: 'center' }}>
            <span
              aria-hidden
              style={{
                width: 52, height: 52, borderRadius: S.r1, display: 'grid', placeItems: 'center',
                background: alpha(C.statusNeutral, 10),
                border: `1px solid ${alpha(C.statusNeutral, 26)}`,
                color: C.statusNeutral,
              }}
            >
              <Lock className="h-5 w-5" />
            </span>
            <p style={{ margin: 0, fontSize: S.md, fontWeight: 700, color: C.textStrong }}>
              فعلاً در دسترس نیست
            </p>
            <p style={{ margin: 0, fontSize: S.sm, color: C.muted, lineHeight: 1.9, maxWidth: '44ch' }}>
              {note
                || 'هر خدمت را شهرداری همان شهر روشن می‌کند. اگر این خدمت را لازم دارید، از شهرداری شهرتان بخواهید آن را فعال کند.'}
            </p>
            <Link
              href="/contact-us"
              style={{
                minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '11px 18px',
                borderRadius: S.r1, textDecoration: 'none',
                border: `1px solid ${C.borderStrong}`, color: C.text,
                fontSize: S.sm, fontWeight: 700,
              }}
            >
              تماس با پشتیبانی
            </Link>
          </div>
        </Card>

        {/* What this city does run — the trip should not be wasted. */}
        {loading ? (
          <div style={{ marginTop: S.s4 }}><Shimmer height={120} /></div>
        ) : services.length > 0 ? (
          <>
            <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.sm, fontWeight: 700, color: C.textStrong }}>
              {city?.name ? `خدمات فعال ${city.name}` : 'خدمات فعال شهر شما'}
            </p>
            <Card>
              <div>
                {services.map((service, i) => {
                  const Icon = serviceIcon(service.icon);
                  return (
                    <Link
                      key={service.key}
                      href={service.href}
                      style={{
                        display: 'flex', alignItems: 'center', gap: S.s3,
                        padding: S.s4, textDecoration: 'none', color: 'inherit',
                        borderTop: i ? `1px solid ${C.border}` : 'none',
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 38, height: 38, flexShrink: 0, borderRadius: S.r1,
                          display: 'grid', placeItems: 'center',
                          background: alpha(service.color, 10),
                          border: `1px solid ${alpha(service.color, 26)}`,
                          color: service.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: S.base, fontWeight: 700, color: C.textStrong }}>
                          {service.title}
                        </span>
                        <span style={{ display: 'block', marginTop: 3, fontSize: S.xs, color: C.muted }}>
                          {service.short}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </>
        ) : null}
      </Screen>
      <Navigation />
    </>
  );
}
