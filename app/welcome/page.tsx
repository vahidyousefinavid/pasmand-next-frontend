import Landing from '@/components/views/Welcome/landing';
import { getCities, loadBoard } from '@/lib/publicData';
import { JsonLd, SITE_URL, pageMeta, MUNICIPAL_KEYWORDS, SERVICE_KEYWORDS, cityKeywords, BRAND_NAMES } from '@/lib/seo';
import { GUIDE_FAQS } from '@/lib/faq';

/**
 * The public home page.
 *
 * Served at `/` by the middleware for anyone without a session, so its canonical
 * is the site root rather than this path — two URLs showing one page is the
 * fastest way to split a brand's ranking between them.
 *
 * Rendered per request rather than at build time, because the prices on it are
 * live: a board showing what a city paid the day the image was built would be
 * worse than no board. The fetch has its own fallback, so an API that is
 * restarting costs the page its price list and nothing else.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  ...pageMeta({
    title: 'شهر شهر | سامانهٔ خدمات شهری — شهروند سبز',
    description:
      'شهرشهر (شهر شهر) سامانهٔ خدمات شهری است؛ خدمات شهرداری را از تلفن همراه به شهروندان می‌رساند. خدمت فعال امروز: جمع‌آوری و خرید پسماند خشک از درِ خانه، توزین در محل و پرداخت به کیف پول — در نهاوند، ملایر و اصفهان.',
    path: '/',
    keywords: [...MUNICIPAL_KEYWORDS, ...SERVICE_KEYWORDS, ...cityKeywords(['خدمات شهری', 'خرید ضایعات'])],
  }),
  // `absolute` skips the layout's «%s | شهرشهر» template, which was appending
  // the brand a second time: «شهر شهر | … — شهروند سبز | شهرشهر». The brand is
  // the query this page has to win, but saying it twice wastes the width Google
  // gives a title and reads as a mistake.
  title: { absolute: 'شهر شهر | سامانهٔ خدمات شهری — شهروند سبز' },
};

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'شهر شهر — سامانهٔ خدمات شهری',
      alternateName: BRAND_NAMES,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fa-IR',
      description:
        'سامانهٔ خدمات شهری شهرشهر؛ نخستین خدمت فعال آن جمع‌آوری و خرید پسماند خشک از درِ خانه است.',
    },
    {
      // The same questions as the guide, answered on the page a brand search
      // lands on, so the answer can be shown without a second click.
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#home-faq`,
      mainEntity: GUIDE_FAQS.slice(0, 4).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default async function Welcome() {
  // The board can only show cities that have published prices; the coverage map
  // has to show the ones that have not opened yet as well.
  const [board, cities] = await Promise.all([loadBoard(), getCities()]);

  return (
    <>
      <JsonLd data={LD} />
      <Landing board={board} cities={cities} />
    </>
  );
}
