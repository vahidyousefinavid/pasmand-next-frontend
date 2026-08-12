'use client';

import { Check } from 'lucide-react';
import { WASTE_TYPES } from '@/lib/wasteTypes';
import { C, S, alpha } from '@/components/ui/tokens';
import { Card, IconBadge } from '@/components/ui/kit';

interface FirstStepProps {
  onNext: (wasteType: string) => void;
  selected?: string;
}

/**
 * Step one — what is being handed over.
 *
 * Picking a category advances immediately; there is no "next" button, because
 * the choice *is* the step. The current selection stays marked so coming back
 * from step two shows what was chosen rather than an empty grid.
 */
export default function FirstStep({ onNext, selected }: FirstStepProps) {
  return (
    <div>
      <p style={{ margin: `0 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>
        چه چیزی تحویل می‌دهید؟
      </p>

      <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {WASTE_TYPES.map((w, i) => {
          const isOn = selected === w.id;
          const { Icon } = w;
          return (
            <div key={w.id} className="pm-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <Card
                accent={isOn ? w.color : undefined}
                onClick={() => onNext(w.id)}
                style={{
                  borderColor: isOn ? alpha(w.color, 40) : C.border,
                  boxShadow: isOn ? C.shadowLift : C.shadowCard,
                  height: '100%',
                }}
              >
                <div style={{ padding: `${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                  <IconBadge color={w.color}><Icon className="h-5 w-5" /></IconBadge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{w.name}</p>
                    <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>{w.short}</p>
                  </div>
                  {isOn && (
                    <span
                      style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'grid', placeItems: 'center', background: w.color, color: C.onAccent,
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
