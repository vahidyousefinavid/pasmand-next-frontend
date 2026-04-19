import './globals.css';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { CityProvider } from '@/context/data-context';
import localFont from "next/font/local";

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000"

const APP_NAME = "برنامه شهر شهر (شهروند)";
const APP_DEFAULT_TITLE = "برنامه شهر شهر (شهروند)";
const APP_TITLE_TEMPLATE = "برنامه شهر شهر (شهروند)";
const APP_DESCRIPTION = "برنامه شهر شهر (شهروند)";

const tanha = localFont({
  src: [
    {
      path: "../public/fonts/tanha/Tanha.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-tanha",
});

const parastoo = localFont({
  src: [
    {
      path: "../public/fonts/parastoo/Parastoo.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-parastoo",
});

const iranyekan = localFont({
  src: [
    {
      path: "../public/fonts/iranyekan/IRANYekan.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-iranyekan",
});

const vazir = localFont({
  src: [
    {
      path: "../public/fonts/vazir/Vazir.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#00613b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning
    >
      <body className={`${tanha.variable} ${parastoo.variable} ${iranyekan.variable} ${vazir.variable} font-sans`}>
        <CityProvider>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </AuthProvider>
        </CityProvider>
      </body>
    </html>
  );
}