'use client';

import { useCallback, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { AlertCircle, FileText, Landmark } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Card, EmptyState, Hero, IconBadge, Modal, Screen, Shimmer, Btn } from '@/components/ui/kit';
import { LETTER_STATUS } from '@/lib/cityServices';
import { jalaliDateTime, relative } from '@/lib/when';

/**
 * کارتابل شهروندی.
 *
 * The question this screen answers is «نامه‌ام کجاست؟», and the answer is the
 * trail: which desk has it now, and every desk it passed through. That is why
 * the detail view is a timeline rather than a status badge — a citizen who can
 * see that their letter moved from شهرسازی to فنی last Tuesday does not need to
 * telephone anybody.
 *
 * Read-only on purpose. The letters live in the municipality's own automation;
 * this mirrors them for the person waiting, and inventing actions here would be
 * pretending to drive a system this app does not drive.
 */

interface Step { _id: string; status: string; desk: string; note: string; at: string; byName: string }
interface Letter {
  _id: string; refNumber: string; subject: string; kind: string; summary: string;
  status: keyof typeof LETTER_STATUS; currentDesk: string; actionNeeded: string;
  history: Step[]; createdAt: string; updatedAt: string;
}

const TONE: Record<string, string> = {
  wait: C.statusWarn, work: C.statusInfo, done: C.statusOk, stop: C.statusNeutral,
};
const colourOf = (status: string) => TONE[LETTER_STATUS[status]?.tone || 'wait'];

export default function CartablePage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [open, setOpen] = useState<Letter | null>(null);


  /**
   * Opened from a notification: the link carries the row's id, and the sheet
   * for it goes up as soon as the list arrives.
   */
  const openFromLink = (rows: Letter[]) => {
    const wanted = new URLSearchParams(window.location.search).get('open');
    const row = wanted ? rows.find((r) => r._id === wanted) : null;
    if (row) setOpen(row);
  };

  const load = useCallback(() => {
    axiosService({ url: '/api/v1/cartable', method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => { setLetters(res?.data?.letters || []); setBlocked(''); openFromLink(res?.data?.letters || []); })
      .catch((err: any) => setBlocked(err?.data?.message || 'دریافت کارتابل انجام نشد.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const waiting = letters.filter((l) => l.actionNeeded).length;

  return (
    <>
      <Screen>
        <Hero
          icon={<FileText className="h-6 w-6" />}
          title="کارتابل شهروندی"
          sub="آخرین وضعیت نامه‌ها و درخواست‌های اداری شما در شهرداری."
          aside={
            <div style={{ textAlign: 'start' }}>
              <p style={{ margin: 0, fontSize: S.xs, color: C.onHeroMuted, fontWeight: 600 }}>در انتظار اقدام شما</p>
              <p className="tnum" style={{ margin: '6px 0 0', fontSize: S.xl, fontWeight: 800 }}>
                {loading ? '…' : fa(waiting)}
              </p>
            </div>
          }
        />

        {blocked ? (
          <EmptyState icon={<FileText className="h-6 w-6" />} title="این خدمت در دسترس نیست" sub={blocked} />
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {[0, 1, 2].map((i) => <Shimmer key={i} height={86} />)}
          </div>
        ) : letters.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="نامه‌ای در کارتابل شما نیست"
            sub="وقتی درخواستی در شهرداری به نام شما ثبت شود، این‌جا می‌بینیدش و مرحله‌به‌مرحله دنبالش می‌کنید."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {letters.map((letter, i) => {
              const status = LETTER_STATUS[letter.status] || LETTER_STATUS.submitted;
              const colour = colourOf(letter.status);
              return (
                <div key={letter._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                  <Card onClick={() => setOpen(letter)} accent={letter.actionNeeded ? C.amber : undefined}>
                    <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', gap: S.s3, alignItems: 'center' }}>
                      <IconBadge color={colour} size={44}><Landmark className="h-5 w-5" /></IconBadge>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {letter.subject}
                        </p>
                        <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                          {letter.refNumber}{letter.currentDesk ? ` · ${letter.currentDesk}` : ''}
                        </p>
                        {letter.actionNeeded && (
                          <p style={{ margin: '6px 0 0', display: 'flex', gap: 5, fontSize: S.xs, color: C.amber, fontWeight: 700 }}>
                            <AlertCircle className="h-3.5 w-3.5" style={{ flexShrink: 0 }} />
                            نیازمند اقدام شما
                          </p>
                        )}
                      </div>

                      <span style={{ textAlign: 'start', flexShrink: 0 }}>
                        <span
                          style={{
                            display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
                            background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
                          }}
                        >
                          {status.label}
                        </span>
                        <span style={{ display: 'block', marginTop: 5, fontSize: 10, color: C.subtle }}>
                          {relative(letter.updatedAt)}
                        </span>
                      </span>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      {open && <LetterSheet letter={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function LetterSheet({ letter, onClose }: { letter: Letter; onClose: () => void }) {
  const status = LETTER_STATUS[letter.status] || LETTER_STATUS.submitted;
  const colour = colourOf(letter.status);

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <div>
          <span
            style={{
              display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
              background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
            }}
          >
            {status.label}
          </span>
          <p style={{ margin: `${S.s2}px 0 0`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{letter.subject}</p>
          <p className="tnum" style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted }}>
            شمارهٔ نامه {letter.refNumber}{letter.kind ? ` · ${letter.kind}` : ''}
          </p>
        </div>

        {letter.summary && <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{letter.summary}</p>}

        {letter.actionNeeded && (
          <p
            style={{
              margin: 0, display: 'flex', gap: 8, padding: S.s3, borderRadius: S.r2,
              background: alpha(C.amber, 10), border: `1px solid ${alpha(C.amber, 24)}`,
              fontSize: S.sm, color: C.text, lineHeight: 2,
            }}
          >
            <AlertCircle className="h-4 w-4" style={{ color: C.amber, flexShrink: 0, marginTop: 3 }} />
            {letter.actionNeeded}
          </p>
        )}

        {/* The trail, oldest first, on a rail — the shape of «کجا رفته». */}
        <div>
          <p style={{ margin: `0 0 ${S.s3}px`, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>مسیر نامه</p>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
            {letter.history.map((step, index) => {
              const stepColour = colourOf(step.status);
              const last = index === letter.history.length - 1;
              return (
                <li key={step._id} style={{ display: 'flex', gap: S.s3, paddingBottom: last ? 0 : S.s4, position: 'relative' }}>
                  <span style={{ display: 'grid', justifyItems: 'center', flexShrink: 0, width: 18 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: stepColour, marginTop: 4 }} />
                    {!last && <span style={{ flex: 1, width: 2, background: C.border, marginTop: 4 }} />}
                  </span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                      {(LETTER_STATUS[step.status] || {}).label || step.status}
                      {step.desk ? ` — ${step.desk}` : ''}
                    </span>
                    {step.note && (
                      <span style={{ display: 'block', marginTop: 4, fontSize: S.xs, color: C.muted, lineHeight: 1.9 }}>{step.note}</span>
                    )}
                    <span className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 10, color: C.subtle }}>
                      {jalaliDateTime(step.at)}{step.byName ? ` · ${step.byName}` : ''}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <Btn full variant="ghost" onClick={onClose}>بستن</Btn>
      </div>
    </Modal>
  );
}
