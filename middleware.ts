import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth gate.
 *
 * Everything used to redirect to /login without a cookie, which meant a search
 * engine — which never has a cookie — saw exactly one page on this domain: the
 * login form. Nothing else could be indexed, because nothing else could be
 * fetched.
 *
 * The pages below carry no personal data and need no token: the waste
 * categories, the guide, the price list (its API is public) and the contact
 * page. They are the site's actual searchable content, so they are served to
 * anyone. Everything else — the citizen's own requests, wallet, addresses and
 * profile — stays behind the cookie.
 */
const PUBLIC_PATHS = [
  '/login',
  '/report',
  '/welcome',
  '/waste-types',
  '/guide',
  '/tariff',
  '/contact-us',
  // Somebody looking for a relative's grave arrives from a search engine and
  // should not meet a login form; the register is published on purpose.
  '/deceased',
];

/** Public families: everything under these is served without a session. */
const PUBLIC_PREFIXES = ['/tariff/'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token');
  const isLoginPage = pathname === '/login';

  /**
   * The site root serves two different pages to two different visitors.
   *
   * Signed in, `/` is the citizen's home. Signed out — which is every search
   * engine, always — it used to redirect to the login form, so the only page
   * Google could see at the most important URL on the domain was a pair of
   * input fields. It is now *rewritten* to the public landing page: a rewrite,
   * not a redirect, so the content is served at `https://shahrshahr.ir/` itself
   * and the brand's ranking accrues to the root rather than to /welcome.
   */
  if (pathname === '/' && !token) {
    return NextResponse.rewrite(new URL('/welcome', request.url));
  }

  // `/tariff/nahavand` is as public as `/tariff`. An exact-match list sent the
  // per-city price lists — the pages a local search actually lands on — to the
  // login form.
  const isPublic = PUBLIC_PATHS.includes(pathname)
    || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublic) {
    // A signed-in visitor has no business on the login form.
    if (token && isLoginPage) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Static assets, the API routes and the crawler files are never gated.
    // `.*\\..*` covers anything with a file extension — og.png, sw.js,
    // robots.txt, the fonts — so a new asset can never be accidentally put
    // behind the login the way og.png was.
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};
