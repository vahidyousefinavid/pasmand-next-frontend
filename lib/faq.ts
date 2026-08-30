/**
 * The guide's questions, in a plain module so both the page (which renders them)
 * and its metadata (which publishes them as FAQPage structured data) read the
 * same text. Answers that only exist in the markup cannot become a rich result.
 */
export interface Faq {
  q: string;
  a: string;
}

export const GUIDE_FAQS: Faq[] = [
  {
    q: 'آیا جمع‌آوری پسماند هزینه دارد؟',
    a: 'خیر. جمع‌آوری رایگان است و بابت پسماند تحویلی، بر اساس نوع و وزن، مبلغی به کیف پول شما واریز می‌شود.',
  },
  {
    q: 'قیمت روز ضایعات را از کجا ببینم؟',
    a: 'از بخش «تعرفهٔ قیمت‌ها». قیمت‌ها برای هر شهر جداگانه ثبت می‌شود و بر اساس بازار تغییر می‌کند.',
  },
  {
    q: 'می‌توانم درخواست جمع‌آوری را لغو کنم؟',
    a: 'تا پیش از تأیید و اعزام جمع‌آور، از صفحهٔ پیگیری می‌توانید درخواست را ویرایش یا لغو کنید. پس از اعزام، امکان لغو وجود ندارد.',
  },
  {
    q: 'حداقل مقدار پسماند برای درخواست چقدر است؟',
    a: 'سه کیلوگرم. برای مقدار کمتر می‌توانید از ایستگاه‌های ثابت بازیافت در سطح شهر استفاده کنید.',
  },
  {
    q: 'پسماند خطرناک مثل باتری را چه کنم؟',
    a: 'باتری، لامپ کم‌مصرف و لوازم الکترونیکی را جدا نگه دارید و در دستهٔ «الکترونیکی» ثبت کنید تا با تجهیزات مناسب جمع‌آوری شود.',
  },
  {
    q: 'مبلغ چه زمانی پرداخت می‌شود؟',
    a: 'بلافاصله پس از توزین در محل، مبلغ به کیف پول شما در برنامه واریز می‌شود و برداشت آن بین ۱ تا ۲۴ ساعت کاری زمان می‌برد.',
  },
];

/**
 * پرسش‌های صفحهٔ نخست — دربارهٔ خودِ سامانه، نه دربارهٔ پسماند.
 *
 * `GUIDE_FAQS` above is the waste service's own guide, and the front page used
 * to borrow its first six. That was right when waste was the only service; a
 * visitor who arrived to book a hall met «حداقل مقدار پسماند چقدر است؟» as the
 * page's idea of what they might be wondering.
 *
 * These three come first because they are the questions somebody has about a
 * municipal platform they have never seen — what is on it, whether they must
 * register, and what to do if their city is not listed — and the waste ones
 * follow, still answered, no longer speaking for every service.
 */
export const HOME_FAQS: Faq[] = [
  {
    q: 'شهرداری من چه خدماتی روی شهرشهر دارد؟',
    a: 'هر شهرداری خودش تعیین می‌کند کدام خدمت فعال باشد. شهر خود را بالای همین صفحه انتخاب کنید تا فهرست خدمات فعال همان شهر را ببینید — از جمع‌آوری پسماند و رزرو اماکن تا سامانهٔ ۱۳۷، کارتابل شهروندی و جست‌وجوی درگذشتگان.',
  },
  {
    q: 'برای دیدن قیمت‌ها و سانس‌ها باید ثبت‌نام کنم؟',
    a: 'خیر. قیمت روز پسماند، اماکن شهر، سانس‌های خالی و تقویم هر مکان، و جست‌وجوی درگذشتگان، همه بدون ثبت‌نام دیده می‌شوند. ورود فقط برای کاری لازم است که به نام شما ثبت می‌شود: رزرو یک سانس، ثبت درخواست جمع‌آوری یا پیگیری نامه.',
  },
  {
    q: 'شهر من در فهرست نیست؛ چه کنم؟',
    a: 'شهرشهر شهر‌به‌شهر اضافه می‌شود و هر شهرداری با پنل و تعرفهٔ خودش به آن می‌پیوندد. از صفحهٔ «تماس با ما» می‌توانید سامانه را به شهرداری شهرتان معرفی کنید.',
  },
  ...GUIDE_FAQS.slice(0, 3),
];
