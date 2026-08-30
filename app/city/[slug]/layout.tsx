import PublicChrome from '@/components/views/Welcome/public-chrome';

/**
 * The city pages are the public site, always.
 *
 * Deliberately outside the `(user)` group, whose layout swaps in the
 * application's furniture — a bottom tab bar, a city picker, a notification
 * bell — the moment a cookie is present. These pages are the answer to
 * «شهرداری من چه خدماتی دارد» and they are shown to anybody who asks; a citizen
 * who happens to be signed in should still see a page of a website, with one
 * clear way back into their app, rather than an app page about a city they may
 * not even be a resident of.
 */
export default function CityLayout({ children }: { children: React.ReactNode }) {
  return <PublicChrome>{children}</PublicChrome>;
}
