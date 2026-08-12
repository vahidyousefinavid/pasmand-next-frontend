'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Recycle, PackagePlus } from 'lucide-react';
import { WASTE_TYPES } from '@/lib/wasteTypes';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge } from '@/components/ui/kit';

/**
 * انواع پسماند — the same dotted rail as home, but each node opens.
 *
 * The categories are ordered by what the service actually wants first
 * (recyclables), not alphabetically, and each one ends in a link that carries
 * its id into the request wizard, so reading about a category and asking for it
 * to be collected are one step apart instead of two screens apart.
 */
export default function WasteTypesView() {
  const [open, setOpen] = useState<string | null>(WASTE_TYPES[0].id);

  // TopMenu and the tab bar come from app/(user)/layout.tsx — rendering them
  // here as well would stack two headers on the same screen.
  return (
    <Screen>
        <Hero
          icon={<Recycle className="h-6 w-6" />}
          title="انواع پسماند"
          sub="هر چیزی که تحویل می‌دهید در یکی از این شش دسته می‌گنجد. دسته را درست انتخاب کنید تا جمع‌آور با خودرو و تجهیزات مناسب بیاید."
        />

        <div style={{ position: 'relative', paddingInlineStart: 34 }}>
          <span
            aria-hidden
            style={{
              position: 'absolute', insetInlineStart: 14, top: 26, bottom: 26, width: 2,
              backgroundImage: `linear-gradient(to bottom, ${alpha(C.green, 50)} 55%, transparent 0)`,
              backgroundSize: '2px 10px',
              backgroundRepeat: 'repeat-y',
              maskImage: 'linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            {WASTE_TYPES.map((w, i) => {
              const isOpen = open === w.id;
              const { Icon } = w;
              return (
                <div key={w.id} className="pm-fade-up" style={{ position: 'relative', animationDelay: `${i * 45}ms` }}>
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', insetInlineStart: -26, top: 26,
                      width: 12, height: 12, borderRadius: '50%',
                      background: C.bg,
                      border: `2.5px solid ${w.color}`,
                      boxShadow: isOpen ? `0 0 0 5px ${alpha(w.color, 16)}` : undefined,
                      transition: 'box-shadow .22s ease',
                    }}
                  />

                  <Card
                    accent={w.color}
                    style={{
                      borderColor: isOpen ? alpha(w.color, 35) : C.border,
                      boxShadow: isOpen ? C.shadowLift : C.shadowCard,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : w.id)}
                      aria-expanded={isOpen}
                      style={{
                        display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
                        padding: `${S.s4}px`, background: 'transparent', border: 'none',
                        fontFamily: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'start',
                      }}
                    >
                      <IconBadge color={w.color}><Icon className="h-5 w-5" /></IconBadge>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{w.name}</span>
                        <span style={{ display: 'block', fontSize: S.xs, color: C.muted, marginTop: 5 }}>{w.short}</span>
                      </span>
                      <span style={{ color: C.subtle, flexShrink: 0 }}>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        className="pm-fade-up"
                        style={{
                          padding: `0 ${S.s4}px ${S.s4}px`,
                          borderTop: `1px dashed ${alpha(w.color, 24)}`,
                          marginTop: 2, paddingTop: S.s4,
                        }}
                      >
                        <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{w.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: S.s3 }}>
                          {w.examples.map((ex) => (
                            <span
                              key={ex}
                              style={{
                                fontSize: S.xs, fontWeight: 700, padding: '6px 11px', borderRadius: S.rPill,
                                background: alpha(w.color, 10), color: w.color, border: `1px solid ${alpha(w.color, 22)}`,
                              }}
                            >
                              {ex}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/new-request?type=${w.id}`}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: S.s2, marginTop: S.s4,
                            padding: '11px 18px', borderRadius: S.r2, textDecoration: 'none',
                            background: alpha(w.color, 12), color: w.color,
                            border: `1px solid ${alpha(w.color, 26)}`,
                            fontSize: S.sm, fontWeight: 800,
                          }}
                        >
                          <PackagePlus className="h-4 w-4" />
                          درخواست جمع‌آوری {w.name}
                        </Link>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
    </Screen>
  );
}
