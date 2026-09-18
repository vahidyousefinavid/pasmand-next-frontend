'use client';

import { ThemeProvider } from 'next-themes';

import { SkinProvider } from '@/context/skin-context';

/**
 * Two independent choices, both the citizen's.
 *
 *   روشن / تاریک   handled by next-themes, written to `data-theme` on <html>
 *   رنگ شهر        handled by SkinProvider, written to `data-skin`
 *
 * `attribute` is `data-theme` rather than `class` because that is what every
 * token in globals.css keys off; with the default (`class`) next-themes wrote
 * `class="dark"` and not one variable changed, so the dark palette this app
 * ships could not be reached from the interface at all.
 *
 * There used to be an effect here that called `setTheme('light')` whenever the
 * theme was anything else. It ran on every render, so choosing تاریک in
 * settings flipped straight back to روشن — the switch was real, the choice
 * was not. It is gone.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      themes={['light', 'dark']}
      disableTransitionOnChange
    >
      <SkinProvider>{children}</SkinProvider>
    </ThemeProvider>
  );
}
