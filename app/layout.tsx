import './globals.css';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import PushRegister from '@/components/push-register';
import { CityProvider, CityScope } from '@/context/data-context';
import RouteProgress from '@/components/route-progress';
import { BRAND_NAMES, CITIES, JsonLd, MUNICIPAL_KEYWORDS, OG_IMAGE, ORGANISATION_LD, SERVICE_KEYWORDS, SITE_URL } from '@/lib/seo';

const APP_NAME = 'شهرشهر';
/**
 * Every title used to be the literal string «برنامه شهر شهر (شهروند)» — the same
 * words on all twelve pages, naming the app rather than what it does. A result
 * page that reads "برنامه" tells a searcher nothing, and identical titles across
 * a site are the single clearest signal to Google that the pages are duplicates.
 * Each page now states its own subject, and the template appends the brand.
 */
const APP_DEFAULT_TITLE = 'شهر شهر | سامانهٔ خدمات شهری — شهروند سبز';
const APP_TITLE_TEMPLATE = '%s | شهرشهر';
const APP_DESCRIPTION =
  'شهرشهر (شهر شهر) سامانهٔ خدمات شهری است و خدمات شهرداری را از تلفن همراه به شهروندان می‌رساند. خدمت فعال امروز: جمع‌آوری و خرید پسماند خشک از درِ خانه، توزین در محل و پرداخت به کیف پول.';

// The typeface is declared once as an @font-face in globals.css and served from
// /public/fonts. It used to be four next/font/local faces here, none of which
// was ever applied to an element.

export const metadata: Metadata = {
  // Without this, every canonical and Open Graph URL in the app is relative and
  // Next drops it.
  metadataBase: new URL(SITE_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    ...BRAND_NAMES,
    ...MUNICIPAL_KEYWORDS,
    ...SERVICE_KEYWORDS,
    ...CITIES.map((c) => `خدمات شهری ${c}`),
    ...CITIES.map((c) => `خرید ضایعات ${c}`),
  ],
  alternates: { canonical: '/' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: APP_NAME,
    url: SITE_URL,
    title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
    description: APP_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  /**
   * تأییدیهٔ مالکیت دامنه برای اینماد.
   *
   * One of the three verification methods اینماد offers — a meta tag on the
   * domain's main page — chosen over the other two (a file at the site root,
   * a temporary page-title change) because it is the only one that touches
   * nothing a visitor or a crawler reads: no title flicker during the check,
   * no stray file to remember to remove. Declared on the root layout rather
   * than only on `/welcome` so it is present at `shahrshahr.ir/` regardless of
   * which page the auth-gate rewrite serves there.
   *
   * Left in place after verification passes — اینماد's own instructions only
   * say the *title* method must be reverted, not this one, and a meta tag
   * nobody reads costs nothing to keep.
   */
  other: { enamad: '48168053' },
};

export const viewport: Viewport = {
  themeColor: "#00613b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* The two faces the first screen actually paints in — body text and
            headings. Fetching them alongside the CSS rather than after it
            removes a round trip on a cold load; Medium is left to load on
            demand, since little above the fold is set in it. */}
        <link rel="preload" href="/fonts/iransans/IRANSansWeb.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/iransans/IRANSansWeb_Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Who runs this site, what it does and where — stated once, in the form
            Google reads directly instead of inferring from the copy. */}
        <JsonLd data={ORGANISATION_LD} />
      </head>
      <body className="font-sans">
        {/* Outside every provider: the sign that a tap registered must not wait
            for anything else to be ready. */}
        <RouteProgress />
        <CityProvider>
          <AuthProvider>
            <Providers>
              {/* Keyed on the city the server has agreed to — see CityScope. */}
              <CityScope>{children}</CityScope>
              <PushRegister />
              <Toaster />
            </Providers>
          </AuthProvider>
        </CityProvider>
      </body>
    </html>
  );
}