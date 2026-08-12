import WelcomeView from '@/components/views/Welcome/welcome';
import { JsonLd, SITE_URL, pageMeta, MUNICIPAL_KEYWORDS, SERVICE_KEYWORDS, cityKeywords, BRAND_NAMES } from '@/lib/seo';
import { GUIDE_FAQS } from '@/lib/faq';

/**
 * The public home page.
 *
 * Served at `/` by the middleware for anyone without a session, so its canonical
 * is the site root rather than this path — two URLs showing one page is the
 * fastest way to split a brand's ranking between them.
 */
export const metadata = {
  ...pageMeta({
    title: 'شهر شهر | سامانهٔ خدمات شهری — شهروند سبز',
    description:
      'شهرشهر (شهر شهر) سامانهٔ خدمات شهری است؛ خدمات شهرداری را از تلفن همراه به شهروندان می‌رساند. خدمت فعال امروز: جمع‌آوری و خرید پسماند خشک از درِ خانه، توزین در محل و پرداخت به کیف پول — در نهاوند، ملایر و اصفهان.',
    path: '/',
    keywords: [...MUNICIPAL_KEYWORDS, ...SERVICE_KEYWORDS, ...cityKeywords(['خدمات شهری', 'خرید ضایعات'])],
  }),
  // The brand is the query this page has to win; say it the way people type it.
  title: 'شهر شهر | سامانهٔ خدمات شهری — شهروند سبز',
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

export default function Welcome() {
  return (
    <>
      <JsonLd data={LD} />
      <WelcomeView />
    </>
  );
}
