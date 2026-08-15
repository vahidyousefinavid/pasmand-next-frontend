import ContactUsPage from '@/components/views/ContactUs/contact-us';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'تماس با پشتیبانی',
  description:
    'تلفن، ایمیل و گفتگوی آنلاین پشتیبانی سامانهٔ شهرشهر — روزهای کاری ۸ صبح تا ۸ شب، به‌همراه پاسخ پرسش‌های رایج دربارهٔ درخواست و تسویه.',
  path: '/contact-us',
  keywords: ['تماس با ما', 'پشتیبانی شهرشهر', 'شماره تماس جمع آوری پسماند'],
});

export default function ContactUs() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'شهر شهر', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'تماس با ما', item: `${SITE_URL}/contact-us` },
          ],
        }}
      />
      <ContactUsPage />
    </>
  );
}
