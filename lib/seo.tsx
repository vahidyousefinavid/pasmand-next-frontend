import type { Metadata } from 'next';

/**
 * One place for everything a search engine reads.
 *
 * Two kinds of query matter here and they pull in opposite directions. People
 * who already know the service search the **brand** — and in Persian they type
 * it both ways, «شهرشهر» and «شهر شهر», because the space is not stable in
 * ordinary writing. People who do not know it search the **thing**: قیمت روز
 * ضایعات, جمع‌آوری پسماند, خدمات شهرداری. Every title below carries the brand
 * and the thing, in that order on the home page and the reverse on the content
 * pages, so neither query has to compete with the other.
 */

export const SITE_URL = 'https://shahrshahr.ir';

/** The social card, rendered once at 1200×630 with the site's own typeface. */
export const OG_IMAGE = {
  url: `${SITE_URL}/og.png`,
  width: 1200,
  height: 630,
  alt: 'شهر شهر — سامانهٔ خدمات شهری؛ خرید و جمع‌آوری پسماند خشک از درِ خانه',
};

/** The brand, as it is written when there is one canonical form. */
export const SITE_NAME = 'شهرشهر';

/**
 * Every form of the name a person might type or a search engine might see.
 * The spaced spelling is not a typo — it is how most people write it, and a
 * name that appears on the page in only one form is invisible to the other.
 */
export const BRAND_NAMES = ['شهرشهر', 'شهر شهر', 'شهروند سبز', 'سامانه شهرشهر', 'اپلیکیشن شهر شهر'];

/**
 * What the product is, not what it currently does.
 *
 * شهرشهر is a city-services platform; waste collection is the first service
 * running on it, not its definition. Describing it as a "waste management
 * system" would rank it for a category it means to outgrow and would misname it
 * to anyone who arrives from a brand search.
 */
export const SITE_TAGLINE = 'سامانهٔ خدمات شهری';

/** The service live on the platform today. Others are expected to follow. */
export const CURRENT_SERVICE = 'جمع‌آوری و خرید پسماند خشک';

/** The cities the service currently covers; they carry most of the local intent. */
export const CITIES = ['همدان', 'نهاوند', 'ملایر', 'اصفهان'];

/**
 * What the service actually is, in the words people search with.
 *
 * Split in two because they answer different questions: the municipal framing
 * (what kind of system is this) and the transactional one (what can I do with
 * it today). Both belong on the home page; a content page takes the half that
 * matches it.
 */
export const MUNICIPAL_KEYWORDS = [
  'خدمات شهری',
  'سامانه خدمات شهری',
  'خدمات شهرداری',
  'خدمات شهری آنلاین',
  'سامانه شهروندی',
  'درخواست خدمات شهری',
  'شهروند سبز',
  'شهر هوشمند',
  'سامانه شهرداری',
];

export const SERVICE_KEYWORDS = [
  'جمع آوری پسماند',
  'خرید ضایعات',
  'خرید پسماند خشک',
  'قیمت روز ضایعات',
  'بازیافت',
  'جمع آوری زباله خشک',
  'خرید ضایعات در محل',
  'تفکیک زباله',
];

/** The service keywords, said once per city — this is where local search lives. */
export const cityKeywords = (words: string[] = ['خرید ضایعات', 'جمع آوری پسماند']) =>
  CITIES.flatMap((city) => words.map((w) => `${w} ${city}`));

/**
 * Page metadata with the shared parts filled in — canonical URL, Open Graph and
 * the Twitter card — so a page only states its own title and description.
 */
export function pageMeta({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    // The brand rides on every page: a site that names itself only on the home
    // page gives a brand search one weak page to match instead of ten.
    keywords: [...keywords, ...BRAND_NAMES, 'پسماند', 'بازیافت', ...CITIES],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: SITE_NAME,
      url,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
  };
}

/**
 * JSON-LD for the organisation and the site itself, emitted once from the root
 * layout. This is what lets Google show a name, a logo and the site's own
 * search box rather than guessing from the page title.
 */
export const ORGANISATION_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      // Google reads these as the same entity, which is how a search for the
      // spaced spelling reaches a site written without the space.
      alternateName: BRAND_NAMES.filter((n) => n !== SITE_NAME),
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      description:
        'شهرشهر (شهروند سبز) سامانهٔ خدمات شهری است که خدمات شهرداری را از طریق تلفن همراه به شهروندان می‌رساند. نخستین خدمت فعال آن، جمع‌آوری و خرید پسماند خشک از درِ خانه با توزین در محل و پرداخت به کیف پول است.',
      areaServed: CITIES.map((name) => ({ '@type': 'City', name })),
      knowsAbout: [...MUNICIPAL_KEYWORDS, ...SERVICE_KEYWORDS],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+98-918-214-4970',
          contactType: 'customer support',
          areaServed: 'IR',
          availableLanguage: ['fa'],
        },
      ],
      sameAs: [
        'https://instagram.com/shahrshahr',
        'https://eitaa.com/shahrshahr',
        'https://ble.ir/shahrshahr',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: BRAND_NAMES.filter((n) => n !== SITE_NAME),
      inLanguage: 'fa-IR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service`,
      name: 'جمع‌آوری و خرید پسماند خانگی',
      serviceType: 'خدمات شهری',
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: CITIES.map((name) => ({ '@type': 'City', name })),
      description:
        'ثبت درخواست آنلاین، مراجعهٔ جمع‌آور به آدرس شما، توزین در محل و واریز مبلغ به کیف پول.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'IRR', description: 'جمع‌آوری رایگان است.' },
    },
  ],
};

/** Renders a JSON-LD block. Next keeps this out of the React tree's text flow. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
