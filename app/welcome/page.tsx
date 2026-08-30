import Landing from '@/components/views/Welcome/landing';
import { getCities, getServices, loadBoard } from '@/lib/publicData';
import { getVenueHighlights } from '@/lib/publicVenues';
import { JsonLd, SITE_URL, pageMeta, MUNICIPAL_KEYWORDS, SERVICE_KEYWORDS, cityKeywords, BRAND_NAMES } from '@/lib/seo';
import { HOME_FAQS } from '@/lib/faq';

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
    // Named services rather than one service, because there are five of them
    // now and each city chooses its own — which is also what the page shows.
    description:
      'شهرشهر (شهر شهر) سامانهٔ خدمات شهری است؛ خدمات شهرداری را از تلفن همراه به شهروندان می‌رساند: جمع‌آوری و خرید پسماند خشک از درِ خانه، سامانهٔ ۱۳۷، کارتابل شهروندی، رزرو اماکن و جست‌وجوی درگذشتگان — خدمات فعالِ هر شهر را بدون ثبت‌نام ببینید.',
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
      // The same questions the page renders — markup that answers something
      // the visitor cannot see is not a rich result, it is a mismatch.
      mainEntity: HOME_FAQS.map((f) => ({
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
  const [board, cities, catalogue, highlights] = await Promise.all([
    loadBoard(),
    getCities(),
    getServices(),
    // The console's live rail. Its own fallback is an empty list, which takes
    // the rail off the board and leaves every other part of it standing.
    getVenueHighlights(),
  ]);

  /**
   * Each city's services, as structured data.
   *
   * `areaServed` per service, listed once per city that actually runs it — a
   * service that is switched off in a city is not published for that city at
   * all, because the markup and the page have to say the same thing. Only
   * running cities appear: describing a service in a city nobody can use it in
   * would be a false claim in the one place that is read by machines.
   */
  const servicesLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'خدمات شهری فعال شهرشهر به تفکیک شهر',
    itemListElement: cities
      .filter((city) => city.isActive)
      .flatMap((city) =>
        catalogue
          .filter((service) => city.services.includes(service.key))
          .map((service) => ({
            '@type': 'Service',
            name: `${service.title} — ${city.name}`,
            description: service.description,
            serviceType: service.title,
            areaServed: { '@type': 'City', name: city.name },
            provider: { '@id': `${SITE_URL}/#organization` },
          })),
      )
      .map((item, index) => ({ '@type': 'ListItem', position: index + 1, item })),
  };

  return (
    <>
      <JsonLd data={LD} />
      {servicesLd.itemListElement.length > 0 && <JsonLd data={servicesLd} />}
      <Landing board={board} cities={cities} catalogue={catalogue} highlights={highlights} />
    </>
  );
}
