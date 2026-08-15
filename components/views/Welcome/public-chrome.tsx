'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { LayoutGrid, LogIn } from 'lucide-react';

import { C, S, alpha } from '@/components/ui/tokens';

/**
 * The public site's furniture: one header, one footer, shared by the front page
 * and by every page a visitor can reach without an account.
 *
 * It exists because those pages used to be wrapped in the *application's*
 * chrome — a bottom tab bar with «کیف پول» and «پروفایل», a city picker, a
 * notification bell — shown to somebody who has no account and cannot use any
 * of it. A public page should look like a page on a website.
 */

/**
 * The mark is the app's own icon — the one already sitting on the home screen
 * of everybody who installed the PWA. A site that introduces a product with a
 * different mark than the product carries is asking people to learn two.
 */
/**
 * The cities whose price pages the footer links to.
 *
 * Hard-coded rather than fetched: the footer is rendered on every public page,
 * including client-rendered ones, and a link list is not worth a request on
 * each of them. `/tariff` itself always shows the live set.
 */
const CITY_LINKS = [
  { slug: 'nahavand', name: 'نهاوند' },
  { slug: 'malayer', name: 'ملایر' },
  { slug: 'isfahan', name: 'اصفهان' },
];

function Emblem({ size = 34 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      style={{
        width: size, height: size, borderRadius: size / 3.2, flexShrink: 0,
        boxShadow: `0 6px 16px ${alpha(C.green, 26)}`,
      }}
    />
  );
}

export function useSignedIn() {
  // After mount, never during render: these pages are served to anonymous
  // visitors and their HTML is what search engines index, so the first paint
  // has to be identical for everyone.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { setSignedIn(Boolean(Cookies.get('auth_token'))); }, []);
  return signedIn;
}

export function PublicHeader({ signedIn }: { signedIn: boolean }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
      <header className="ss-head" data-stuck={stuck}>
      <div className="ss-wrap" style={{ display: 'flex', alignItems: 'center', gap: S.s3, height: 66 }}>
        <Emblem />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="ss-display" style={{ display: 'block', fontSize: 17, color: C.textStrong, lineHeight: 1.2 }}>
            شهرشهر
          </span>
          <span style={{ display: 'block', fontSize: 11, color: C.muted }}>سامانهٔ خدمات شهری</span>
        </span>

        <nav style={{ display: 'flex', alignItems: 'center', gap: S.s4 }}>
          <Link href="/tariff" className="ss-only-wide" style={{ fontSize: 13, fontWeight: 700, color: C.text, textDecoration: 'none' }}>
            قیمت روز
          </Link>
          <Link href="/waste-types" className="ss-only-wide" style={{ fontSize: 13, fontWeight: 700, color: C.text, textDecoration: 'none' }}>
            انواع پسماند
          </Link>
          <Link href="/guide" className="ss-only-wide" style={{ fontSize: 13, fontWeight: 700, color: C.text, textDecoration: 'none' }}>
            راهنما
          </Link>
          <Link
            href={signedIn ? '/' : '/login'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
              padding: '10px 17px', borderRadius: 999,
              background: C.green, color: C.onAccent, fontSize: 13, fontWeight: 800,
              boxShadow: `0 6px 16px ${alpha(C.green, 26)}`,
            }}
          >
            {signedIn ? <LayoutGrid className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
            {signedIn ? 'ورود به برنامه' : 'ورود شهروندان'}
          </Link>
        </nav>
      </div>
    </header>

  );
}

export function PublicFooter({ signedIn }: { signedIn: boolean }) {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, background: C.bgSubtle }}>
      <div
        className="ss-wrap"
        style={{
          paddingBlock: S.s6,
          display: 'grid', gap: S.s5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        }}
      >
        {/* Who this is */}
        <div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Emblem size={34} />
            <span>
              <span className="ss-display" style={{ display: 'block', fontSize: 15, color: C.textStrong }}>
                شهرشهر / شهر شهر
              </span>
              <span style={{ display: 'block', fontSize: 11, color: C.muted }}>سامانهٔ خدمات شهری</span>
            </span>
          </span>
          <p style={{ margin: `${S.s3}px 0 0`, fontSize: 12, color: C.muted, lineHeight: 2, maxWidth: '32ch' }}>
            خدمت فعال: جمع‌آوری و خرید پسماند خشک از درِ خانه، با توزین در محل و پرداخت به کیف پول.
          </p>
        </div>

        {/* Three columns, because a public site has three kinds of page: what
            it costs, how it works, and where it runs. A single row of links
            said none of that. */}
        <FooterColumn
          title="قیمت‌ها"
          links={[
            { href: '/tariff', label: 'تعرفهٔ قیمت‌ها' },
            ...CITY_LINKS.map((city) => ({ href: `/tariff/${city.slug}`, label: `قیمت ضایعات ${city.name}` })),
          ]}
        />

        <FooterColumn
          title="راهنما"
          links={[
            { href: '/waste-types', label: 'انواع پسماند' },
            { href: '/guide', label: 'راهنمای جمع‌آوری' },
            { href: '/contact-us', label: 'پشتیبانی شهروندان' },
          ]}
        />

        <FooterColumn
          title="حساب کاربری"
          links={[
            { href: signedIn ? '/' : '/login', label: signedIn ? 'ورود به برنامه' : 'ورود شهروندان' },
            { href: signedIn ? '/new-request' : '/login', label: 'ثبت درخواست جمع‌آوری' },
            { href: '/report', label: 'معرفی سامانه' },
          ]}
        />
      </div>

      <div className="ss-wrap" style={{ paddingBottom: S.s5 }}>
        <p style={{ margin: 0, paddingTop: S.s4, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.subtle, lineHeight: 2 }}>
          شهرشهر — شهروند سبز · خدمات شهری هر شهر زیر نظر شهرداری همان شهر ارائه می‌شود.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p style={{ margin: `0 0 ${S.s3}px`, fontSize: 12, fontWeight: 800, color: C.textStrong }}>{title}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} style={{ fontSize: 12, fontWeight: 600, color: C.muted, textDecoration: 'none' }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The wrapper the public pages are rendered inside.
 *
 * `--pm-chrome-*` is how the shared `Screen` component learns that there is no
 * fixed app bar above it and no floating tab bar below: it reserves 78px and
 * 104px for those by default, which on a public page is just an empty band.
 */
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const signedIn = useSignedIn();

  return (
    <div
      className="ss"
      dir="rtl"
      style={{ minHeight: '100vh', ['--pm-chrome-top' as any]: '10px', ['--pm-chrome-bottom' as any]: '28px' }}
    >
      <PublicHeader signedIn={signedIn} />
      {children}
      <PublicFooter signedIn={signedIn} />
    </div>
  );
}
