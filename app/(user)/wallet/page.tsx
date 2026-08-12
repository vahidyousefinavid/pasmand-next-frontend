import WalletPage from '@/components/views/Wallet/wallet';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'کیف پول',
  description: 'موجودی، تاریخچهٔ تراکنش‌ها و درخواست برداشت.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WalletPage />;
}
