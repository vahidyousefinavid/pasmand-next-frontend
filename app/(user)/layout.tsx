import { cookies } from 'next/headers';

import { TopMenu } from '@/components/views/top-menu';
import { Navigation } from '@/components/views/navigation';
import PublicChrome from '@/components/views/Welcome/public-chrome';

/**
 * Two audiences share these routes, and until now they shared the chrome too.
 *
 * Four of the pages under here are public — the price list, the waste
 * categories, the guide and support — because they are what the site is found
 * for. A visitor who arrives at «قیمت روز ضایعات» from a search, or from the
 * front page, is not signed in and has no account; wrapping that page in the
 * app's own furniture handed them a bottom tab bar with «کیف پول» and
 * «پروفایل», a city picker and a notification bell, all belonging to an
 * application they have not entered. It made the site look like an app they
 * were already lost inside.
 *
 * The cookie is read on the server, so the right chrome is in the first HTML
 * and there is no flash of the wrong one — and no hydration mismatch, which
 * reading it in the browser would have caused.
 */
export default function UserLayout({ children }: { children: React.ReactNode }) {
  const signedIn = Boolean(cookies().get('auth_token'));

  if (!signedIn) {
    return <PublicChrome>{children}</PublicChrome>;
  }

  return (
    <>
      <TopMenu />
      {children}
      <Navigation />
    </>
  );
}
