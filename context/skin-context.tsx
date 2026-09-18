'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * The colour the city's signs are enamelled in.
 *
 * A skin changes the plaque's field and the dark surfaces derived from it —
 * the drawer's head, the rate board on the public site, the wash over the
 * hero photograph. It changes nothing else: the wall, the brass a code is
 * plated in, the five service hues and every status colour mean the same
 * thing whichever colour the sign is painted, so they are shared (see the
 * skin blocks in globals.css).
 *
 * The choice is this device's, not the account's: it is a preference about
 * *this screen*, it has to be readable before the first API call, and a
 * citizen switching phones is not owed the same colour on both.
 */

export type Skin = 'green' | 'enamel' | 'ink';

export const SKINS: {
  key: Skin; title: string; note: string;
  /** The two ends of that skin's plaque, for drawing the option itself. */
  swatch: string; swatchDeep: string;
}[] = [
  { key: 'green', title: 'سبز', note: 'رنگ همیشگی شهرشهر', swatch: '#0f6a4c', swatchDeep: '#0a4a36' },
  { key: 'enamel', title: 'لاجوردی', note: 'رنگ تابلوی نام معابر', swatch: '#0f3f6b', swatchDeep: '#0a2d4e' },
  { key: 'ink', title: 'زغالی', note: 'چدن با حاشیهٔ برنجی', swatch: '#303b47', swatchDeep: '#1e2730' },
];

export const SKIN_STORAGE_KEY = 'shahrshahr-skin';

/** Green is the default: it is the colour this product already had. */
export const DEFAULT_SKIN: Skin = 'green';

const isSkin = (value: unknown): value is Skin =>
  value === 'green' || value === 'enamel' || value === 'ink';

const SkinContext = createContext<{ skin: Skin; setSkin: (skin: Skin) => void }>({
  skin: DEFAULT_SKIN,
  setSkin: () => undefined,
});

export function SkinProvider({ children }: { children: ReactNode }) {
  const [skin, setSkinState] = useState<Skin>(DEFAULT_SKIN);

  // The attribute is already on <html> by now — the inline script in layout.tsx
  // puts it there before first paint. This only catches up with it.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(SKIN_STORAGE_KEY) : null;
    if (isSkin(stored)) setSkinState(stored);
  }, []);

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, next);
    } catch {
      // A private window can refuse storage; the choice still holds for this
      // visit, which is the part the citizen can see.
    }
    // The default skin carries no attribute, so `:root` stays the green block.
    if (next === DEFAULT_SKIN) document.documentElement.removeAttribute('data-skin');
    else document.documentElement.setAttribute('data-skin', next);
  }, []);

  return <SkinContext.Provider value={{ skin, setSkin }}>{children}</SkinContext.Provider>;
}

export const useSkin = () => useContext(SkinContext);
