import LoginPage from '@/components/views/Login/login';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'ورود و ثبت‌نام',
  description: 'با شمارهٔ همراه وارد سامانهٔ شهرشهر شوید و درخواست جمع‌آوری پسماند ثبت کنید.',
  path: '/login',
});

export default function Login() {
  return <LoginPage />;
}
