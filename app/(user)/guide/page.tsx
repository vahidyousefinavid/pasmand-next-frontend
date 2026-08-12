import GuidePage from '@/components/views/Guide/guide';
import { GUIDE_FAQS } from '@/lib/faq';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'راهنمای فروش و جمع‌آوری پسماند',
  description:
    'پنج قدم از ثبت درخواست تا واریز مبلغ: انتخاب دستهٔ پسماند، تعیین محل، آماده‌سازی و تفکیک، تحویل به جمع‌آور و توزین، و تسویه در کیف پول.',
  path: '/guide',
  keywords: ['راهنمای بازیافت', 'چگونه ضایعات بفروشیم', 'آموزش تفکیک پسماند', 'جمع آوری پسماند در محل'],
});

/**
 * The questions as FAQPage data. These are the answers people type into Google
 * verbatim ("آیا جمع‌آوری پسماند هزینه دارد"), and marked up this way they can
 * be shown as the answer rather than as one more blue link.
 */
const LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/guide#faq`,
  mainEntity: GUIDE_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Guide() {
  return (
    <>
      <JsonLd data={LD} />
      <GuidePage />
    </>
  );
}
