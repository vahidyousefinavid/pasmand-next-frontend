'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Flower2, Landmark, MapPin, Search, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { faDigits } from '@/lib/when';
import { C, S, alpha } from '@/components/ui/tokens';
import { Card, EmptyState, Hero, Screen, SectionTitle, Shimmer } from '@/components/ui/kit';

/**
 * یادبود — the city's memorial page.
 *
 * Three layers, in the order a visitor needs them:
 *   1. a story rail of اطلاعیه‌ها that are live *right now* (a تشییع tomorrow
 *      morning is the most time-critical thing on the page),
 *   2. a filter between مشاهیر and the city's own یادبودها,
 *   3. a grid of everyone.
 *
 * ── On the missing photographs ─────────────────────────────────────────────
 *
 * Almost nobody here has a portrait — there is no photograph of باباطاهر — and
 * a grid of empty thumbnails reads as broken software rather than as history.
 * So a card with no image draws a monogram tile whose colour is derived from
 * the name itself: stable per person, varied across the grid, and never a grey
 * rectangle. The design has to work at zero photographs, because that is the
 * state it ships in.
 */

interface Person {
  _id: string;
  kind: 'notable' | 'martyr' | 'citizen';
  firstName: string; lastName: string; fullName: string; knownAs: string;
  title: string; bio: string;
  birthYear: number | null; deathYear: number | null; yearsText: string;
  relation: string;
  restingPlace: string; buriedHere: boolean; restingCity: string; restingNote: string;
  portrait: string; slug: string;
  viewCount: number; tributeCount: number;
  isFeatured: boolean;
}

interface Story {
  _id: string;
  kind: string;
  title: string; body: string;
  ceremonyKind: string;
  ceremonyDateText: string; ceremonyTimeText: string;
  venueName: string; address: string;
  isOfficial: boolean;
  expiresAt: string | null;
  media: { url: string; type: string }[];
  memorial?: { fullName: string; knownAs: string; firstName: string; lastName: string; portrait: string; slug: string } | null;
}

const CEREMONY_LABEL: Record<string, string> = {
  tashyi: 'تشییع', khatm: 'ختم', sevom: 'سوم', haftom: 'هفتم',
  chehelom: 'چهلم', salgard: 'سالگرد', other: 'مراسم',
};

/** Stable per name, varied across a grid — see the note on missing photos. */
const TILE_HUES = [C.green, C.amber, C.violet, C.blue, C.statusNeutral];

function nameOf(p: { knownAs?: string; fullName?: string; firstName?: string; lastName?: string }): string {
  return p.knownAs || p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim();
}

function hueOf(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TILE_HUES[h % TILE_HUES.length];
}

/**
 * `fa()` groups thousands, so a year comes out «۱٬۰۳۷». Years are digits, not
 * quantities. `yearsText` wins whenever it is set — it is the field that
 * carries «حدود» and «سال دقیق ثبت نشده», and overwriting that with a tidy
 * range would turn a careful hedge into a false precision.
 */
function years(p: Person): string {
  if (p.yearsText) return p.yearsText;
  const b = p.birthYear ? faDigits(String(p.birthYear)) : '';
  const d = p.deathYear ? faDigits(String(p.deathYear)) : '';
  if (b && d) return `${b} – ${d} میلادی`;
  if (d) return `درگذشت ${d} میلادی`;
  return '';
}

/* ── the monogram tile ────────────────────────────────────────────────────── */

/**
 * The letter on the tile.
 *
 * Not the first letter of the display name: «سردار شهید حسین همدانی» would give
 * «س», and so would سرلشکر and سرتیپ and every other rank — a column of
 * identical tiles showing a military title rather than a person. `firstName`
 * holds the actual given name, so حسین gets «ح» and علی gets «ع».
 */
function initialOf(person: Person): string {
  const source = (person.firstName || nameOf(person)).trim();
  return source.charAt(0) || '؟';
}

function Portrait({ person, size }: { person: Person; size: number }) {
  const name = nameOf(person);
  // Hue still keyed on the full name, so two «ع» tiles are not the same colour.
  const hue = hueOf(name);

  if (person.portrait) {
    return (
      <img
        src={person.portrait}
        alt={name}
        style={{ width: size, height: size, borderRadius: S.r2, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      aria-hidden
      style={{
        width: size, height: size, borderRadius: S.r2, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: `linear-gradient(145deg, ${alpha(hue, 22)}, ${alpha(hue, 8)})`,
        border: `1px solid ${alpha(hue, 26)}`,
        color: hue, fontSize: size * 0.34, fontWeight: 800,
      }}
    >
      {initialOf(person)}
    </div>
  );
}

/* ── story rail ───────────────────────────────────────────────────────────── */

function StoryRail({ stories, onOpen }: { stories: Story[]; onOpen: (i: number) => void }) {
  if (!stories.length) return null;

  return (
    <div style={{ margin: `0 0 ${S.s5}px` }}>
      <div
        // Bleeds to both edges so the rail reads as scrollable rather than as a
        // list that happens to be cut off.
        style={{
          display: 'flex', gap: S.s3, overflowX: 'auto', paddingBottom: S.s2,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}
        className="pm-no-scrollbar"
      >
        {stories.map((story, i) => {
          const label = story.memorial ? nameOf(story.memorial) : (story.title || 'اطلاعیه');
          const hue = story.isOfficial ? C.green : C.amber;
          return (
            <button
              key={story._id}
              onClick={() => onOpen(i)}
              style={{
                flexShrink: 0, width: 78, border: 'none', background: 'none', padding: 0,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 70, height: 70, borderRadius: '50%', margin: '0 auto',
                  padding: 3, background: `linear-gradient(140deg, ${hue}, ${alpha(hue, 35)})`,
                }}
              >
                <div
                  style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: C.surface, display: 'grid', placeItems: 'center',
                    overflow: 'hidden', border: `2px solid ${C.surface}`,
                  }}
                >
                  {story.memorial?.portrait ? (
                    <img src={story.memorial.portrait} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, fontWeight: 800, color: hue }}>
                      {label.trim().charAt(0) || '؟'}
                    </span>
                  )}
                </div>
              </div>
              <p
                style={{
                  margin: `${S.s2}px 0 0`, fontSize: S.xs, color: C.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── story viewer ─────────────────────────────────────────────────────────── */

const STORY_MS = 6000;

function StoryViewer({
  stories, index, onClose, onIndex,
}: { stories: Story[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(Date.now());

  const next = useCallback(() => {
    if (index + 1 < stories.length) onIndex(index + 1);
    else onClose();
  }, [index, stories.length, onIndex, onClose]);

  const prev = useCallback(() => {
    if (index > 0) onIndex(index - 1);
  }, [index, onIndex]);

  useEffect(() => {
    startedAt.current = Date.now();
    setProgress(0);
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      setProgress(Math.min(1, elapsed / STORY_MS));
      if (elapsed >= STORY_MS) next();
    }, 50);
    return () => clearInterval(tick);
  }, [index, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: «forward» is to the left, so the arrow keys are mirrored.
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  const story = stories[index];
  if (!story) return null;

  const who = story.memorial ? nameOf(story.memorial) : '';
  const isCeremony = story.kind === 'ceremony';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 90, background: '#0b1220',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* progress bars — one per story, the current one filling */}
      <div style={{ display: 'flex', gap: 4, padding: `${S.s3}px ${S.s3}px 0` }}>
        {stories.map((s, i) => (
          <div key={s._id} style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }}>
            <div
              style={{
                height: '100%', borderRadius: 2, background: '#fff',
                width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: S.s2, padding: S.s3 }}>
        <span style={{ flex: 1, color: '#fff', fontSize: S.sm, fontWeight: 800 }}>
          {who || 'اطلاعیه'}
          {story.isOfficial && (
            <span style={{ marginInlineStart: S.s2, fontSize: S.xs, fontWeight: 700, color: alpha('#fff', 70) }}>
              · اطلاعیهٔ شهرداری
            </span>
          )}
        </span>
        <button
          onClick={onClose}
          aria-label="بستن"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center', padding: S.s5 }}>
        {/* Tap zones. In RTL the leading edge is the right one, so the LEFT
            third advances and the RIGHT third goes back. */}
        <button onClick={next} aria-label="بعدی"
          style={{ position: 'absolute', insetInlineEnd: 'auto', left: 0, top: 0, bottom: 0, width: '33%', background: 'none', border: 'none', cursor: 'pointer' }} />
        <button onClick={prev} aria-label="قبلی"
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '33%', background: 'none', border: 'none', cursor: 'pointer' }} />

        <div style={{ maxWidth: 520, textAlign: 'center', color: '#fff' }}>
          {isCeremony && (
            <span
              style={{
                display: 'inline-block', marginBottom: S.s3, padding: '4px 12px',
                borderRadius: S.rPill, background: alpha('#fff', 14),
                fontSize: S.xs, fontWeight: 800,
              }}
            >
              {CEREMONY_LABEL[story.ceremonyKind] || 'مراسم'}
            </span>
          )}

          {story.title && (
            <h2 style={{ margin: `0 0 ${S.s3}px`, fontSize: S.xl, fontWeight: 800, lineHeight: 1.6 }}>
              {story.title}
            </h2>
          )}

          {story.body && (
            <p style={{ margin: 0, fontSize: S.base, lineHeight: 2.1, color: alpha('#fff', 88) }}>
              {story.body}
            </p>
          )}

          {(story.ceremonyDateText || story.venueName) && (
            <div
              style={{
                marginTop: S.s5, padding: S.s4, borderRadius: S.r2,
                background: alpha('#fff', 10), textAlign: 'start',
              }}
            >
              {story.ceremonyDateText && (
                <p style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', fontSize: S.sm }}>
                  <Clock className="h-4 w-4" style={{ flexShrink: 0 }} />
                  <span className="tnum">
                    {story.ceremonyDateText}
                    {story.ceremonyTimeText ? ` · ساعت ${story.ceremonyTimeText}` : ''}
                  </span>
                </p>
              )}
              {story.venueName && (
                <p style={{ margin: `${S.s2}px 0 0`, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: S.sm }}>
                  <MapPin className="h-4 w-4" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span>
                    <strong style={{ fontWeight: 800 }}>{story.venueName}</strong>
                    {story.address ? <><br />{story.address}</> : null}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: S.s4, color: alpha('#fff', 60) }}>
        <button onClick={prev} disabled={index === 0} aria-label="قبلی"
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
          <ChevronRight className="h-6 w-6" />
        </button>
        <button onClick={next} aria-label="بعدی"
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

/* ── person card ──────────────────────────────────────────────────────────── */

function PersonCard({ person }: { person: Person }) {
  const restingLine = person.restingNote
    ? person.restingNote
    : person.buriedHere
      ? person.restingPlace
      : `مدفون در ${person.restingCity || 'شهری دیگر'}`;

  // A grave in this city is the only case that earns the brass. A grave
  // elsewhere, or none at all, is stated in grey — it is not this city's
  // monument to show off.
  const here = person.buriedHere && !person.restingNote;

  return (
    <Card>
      <div style={{ padding: S.s4, display: 'flex', gap: S.s3 }}>
        <Portrait person={person} size={64} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
            {nameOf(person)}
          </p>

          <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted }}>
            {person.title}
            {years(person) ? <>{person.title ? ' · ' : ''}<bdi className="tnum">{years(person)}</bdi></> : null}
          </p>

          {person.relation && (
            <span
              style={{
                display: 'inline-block', marginTop: S.s2, padding: '3px 9px',
                borderRadius: S.rPill, fontSize: S.xs, fontWeight: 700,
                color: C.textStrong,
                background: alpha(here ? C.amber : C.muted, 12),
                border: `1px solid ${alpha(here ? C.amber : C.muted, 26)}`,
              }}
            >
              {person.relation}
            </span>
          )}

          {person.bio && (
            <p
              style={{
                margin: `${S.s2}px 0 0`, fontSize: S.xs, color: C.text, lineHeight: 2,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {person.bio}
            </p>
          )}

          {restingLine && (
            <p
              style={{
                margin: `${S.s3}px 0 0`, display: 'flex', gap: 6, alignItems: 'flex-start',
                fontSize: S.xs, color: C.muted, lineHeight: 1.9,
              }}
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: here ? C.amber : C.muted, flexShrink: 0, marginTop: 3 }} />
              <span>{here ? <strong style={{ color: C.textStrong, fontWeight: 800 }}>{restingLine}</strong> : restingLine}</span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ── the cemetery register ────────────────────────────────────────────────── */

interface GraveRow {
  _id: string;
  firstName: string; lastName: string; fatherName: string;
  deathDate: string; cemetery: string; section: string; row: string; number: string;
}

/**
 * جست‌وجوی آرامستان — the municipal register, kept exactly as it was.
 *
 * This is a different dataset from everything else on the page and stays that
 * way: a clerk's record of who is buried in which plot. Someone searching it is
 * looking for a relative's grave, so it asks for nothing and shows only the
 * four things they came for. It lives behind its own tab rather than mixed into
 * the grid, so a search for «حسین» by a grieving daughter never returns a
 * philosopher who died in 1037.
 */
function RegisterSearch({ citySlug }: { citySlug: string }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<GraveRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const canSearch = q.trim().length >= 2;

  const search = () => {
    if (!canSearch) return;
    setLoading(true);
    setMessage('');
    axiosService({
      url: '/api/v1/deceased',
      method: 'get',
      params: { q: q.trim(), ...(citySlug ? { city: citySlug } : {}) },
    })
      .then((res: any) => setRows(res?.data?.results || []))
      .catch((err: any) => {
        setRows([]);
        setMessage(err?.data?.message || 'جست‌وجو انجام نشد.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <form
        onSubmit={(e) => { e.preventDefault(); search(); }}
        style={{ display: 'flex', gap: S.s2, marginBottom: S.s4 }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Search className="h-4 w-4" style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input
            className="pm-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مثلاً محمدرضا کریمی"
            style={{ paddingInlineStart: 40 }}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={!canSearch || loading}
          style={{
            flexShrink: 0, padding: '0 22px', borderRadius: S.r2,
            cursor: canSearch ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            fontSize: S.sm, fontWeight: 800, background: C.green, color: C.onAccent,
            border: 'none', opacity: canSearch ? 1 : 0.5,
          }}
        >
          جست‌وجو
        </button>
      </form>

      {loading ? (
        <Shimmer height={104} />
      ) : rows === null ? (
        <EmptyState
          icon={<Flower2 className="h-6 w-6" />}
          title="نام را بنویسید"
          sub="جست‌وجو با نام و نام خانوادگی انجام می‌شود؛ نوشتن بخشی از نام هم کافی است."
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Flower2 className="h-6 w-6" />} title={message || 'نتیجه‌ای یافت نشد'} sub="املای دیگری را امتحان کنید یا فقط نام خانوادگی را بنویسید." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {rows.map((row) => (
            <Card key={row._id}>
              <div style={{ padding: S.s4 }}>
                <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
                  {row.firstName} {row.lastName}
                </p>
                {(row.fatherName || row.deathDate) && (
                  <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                    {row.fatherName ? `فرزند ${row.fatherName}` : ''}
                    {row.fatherName && row.deathDate ? ' · ' : ''}
                    {row.deathDate ? `تاریخ درگذشت ${row.deathDate}` : ''}
                  </p>
                )}
                <div
                  style={{
                    display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: S.s3,
                    padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r1,
                    background: alpha(C.green, 7), border: `1px solid ${alpha(C.green, 18)}`,
                  }}
                >
                  <MapPin className="h-3.5 w-3.5" style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />
                  {[
                    row.cemetery && { label: 'آرامستان', value: row.cemetery },
                    row.section && { label: 'قطعه', value: row.section },
                    row.row && { label: 'ردیف', value: row.row },
                    row.number && { label: 'شماره', value: row.number },
                  ].filter(Boolean).map((item: any) => (
                    <span key={item.label} className="tnum" style={{ fontSize: S.xs, color: C.text }}>
                      <span style={{ color: C.muted }}>{item.label}: </span>
                      <strong style={{ color: C.textStrong, fontWeight: 800 }}>{item.value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── screen ───────────────────────────────────────────────────────────────── */

type Tab = 'all' | 'notable' | 'martyr' | 'citizen' | 'register';

export default function MemorialsPage() {
  const [citySlug, setCitySlug] = useState('');
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const [people, setPeople] = useState<Person[] | null>(null);
  const [counts, setCounts] = useState<{ notable?: number; martyr?: number; citizen?: number }>({});
  const [cityName, setCityName] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [storyAt, setStoryAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCitySlug(params.get('city') || '');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let alive = true;

    axiosService({
      url: '/api/v1/memorials/stories',
      method: 'get',
      params: citySlug ? { city: citySlug } : {},
    })
      .then((res: any) => { if (alive) setStories(res?.data?.results || []); })
      .catch(() => { if (alive) setStories([]); });

    return () => { alive = false; };
  }, [ready, citySlug]);

  useEffect(() => {
    if (!ready || tab === 'register') return;
    let alive = true;
    setLoading(true);

    axiosService({
      url: '/api/v1/memorials',
      method: 'get',
      params: {
        ...(citySlug ? { city: citySlug } : {}),
        ...(tab === 'all' ? {} : { kind: tab }),
        ...(query.trim().length >= 2 ? { q: query.trim() } : {}),
      },
    })
      .then((res: any) => {
        if (!alive) return;
        setPeople(res?.data?.results || []);
        setCounts(res?.data?.counts || {});
        setCityName(res?.data?.city?.name || '');
      })
      .catch(() => { if (alive) setPeople([]); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [ready, citySlug, tab, query]);

  const tabs = useMemo(() => ([
    { key: 'all' as Tab, label: 'همه' },
    { key: 'notable' as Tab, label: `مشاهیر${counts.notable ? ` (${faDigits(String(counts.notable))})` : ''}` },
    { key: 'martyr' as Tab, label: `شهدا${counts.martyr ? ` (${faDigits(String(counts.martyr))})` : ''}` },
    { key: 'citizen' as Tab, label: `یادبودها${counts.citizen ? ` (${faDigits(String(counts.citizen))})` : ''}` },
    { key: 'register' as Tab, label: 'جست‌وجوی آرامستان' },
  ]), [counts]);

  return (
    <Screen>
      <Hero
        icon={<Flower2 className="h-6 w-6" />}
        title={cityName ? `یادبود ${cityName}` : 'یادبود'}
        sub="مشاهیر و مفاخر شهر، اطلاعیه‌های مراسم، و یادبود درگذشتگان."
      />

      {storyAt !== null && (
        <StoryViewer
          stories={stories}
          index={storyAt}
          onIndex={setStoryAt}
          onClose={() => setStoryAt(null)}
        />
      )}

      <StoryRail stories={stories} onOpen={setStoryAt} />

      {/* filter + search */}
      <div style={{ display: 'flex', gap: S.s2, marginBottom: S.s4, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '7px 14px', borderRadius: S.rPill, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800,
              background: tab === t.key ? C.green : alpha(C.muted, 10),
              color: tab === t.key ? C.onAccent : C.text,
              border: `1px solid ${tab === t.key ? C.green : alpha(C.muted, 20)}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'register' ? <RegisterSearch citySlug={citySlug} /> : (
      <>
      <div style={{ position: 'relative', marginBottom: S.s4 }}>
        <Search
          className="h-4 w-4"
          style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }}
        />
        <input
          className="pm-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جست‌وجوی نام"
          style={{ paddingInlineStart: 40 }}
          autoComplete="off"
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {[0, 1, 2].map((i) => <Shimmer key={i} height={120} />)}
        </div>
      ) : !people || people.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-6 w-6" />}
          title={query ? 'نتیجه‌ای یافت نشد' : 'هنوز یادبودی ثبت نشده'}
          sub={query ? 'املای دیگری را امتحان کنید.' : 'به‌زودی مشاهیر و یادبودهای این شهر اینجا نمایش داده می‌شود.'}
        />
      ) : (
        <>
          <SectionTitle title={tab === 'notable' ? 'مشاهیر و مفاخر' : tab === 'martyr' ? 'شهدا' : tab === 'citizen' ? 'یادبودها' : 'همه'} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {people.map((person, i) => (
              <div key={person._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 30}ms` }}>
                <PersonCard person={person} />
              </div>
            ))}
          </div>
        </>
      )}
      </>
      )}

      <p style={{ margin: `${S.s5}px 0 0`, fontSize: S.xs, color: C.subtle, textAlign: 'center', lineHeight: 1.9 }}>
        اطلاعات مشاهیر از منابع عمومی گردآوری شده است. برای اصلاح یا افزودن یادبود با شهرداری تماس بگیرید.
      </p>
    </Screen>
  );
}
