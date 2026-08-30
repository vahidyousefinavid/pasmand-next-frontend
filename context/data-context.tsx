'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { cities as FALLBACK_CITIES } from '@/variables';
import { City } from '@/lib/types/types';

/**
 * The cities the app offers.
 *
 * They come from the panel now — `GET /api/v1/cities` returns every city an
 * administrator has created and left active — instead of the hardcoded list in
 * `variables/`, which had drifted from the database (the id the app called
 * نهاوند was stored as «تهران»). Adding a city in the panel now adds it here.
 *
 * The hardcoded list survives as a fallback for one case only: the very first
 * paint, and a network that fails before the list arrives. A city picker with
 * nothing in it is worse than a stale one.
 */
type CityContextType = {
  selectedCity: City | null;
  setSelectedCity: (city: City) => void;
  /** Every active city, for pickers. */
  cities: City[];
  loadingCities: boolean;
  /**
   * The city everything on screen is currently *about*.
   *
   * Deliberately not the same value as `selectedCity`. That one changes the
   * instant somebody taps a name in the picker, which is right for the header;
   * this one changes only once the server has accepted the switch, and it is
   * what the screens are keyed on. Bumping it earlier would send every screen
   * off to refetch while the API still answers for the old city — the new name
   * in the header above the old city's data, which is the worst of both.
   */
  cityScope: string;
  /** True while the server is being told. The picker says so rather than looking stuck. */
  switching: boolean;
};

const CityContext = createContext<CityContextType | undefined>(undefined);

/** The API returns mongo documents; the app has always keyed cities by `id`. */
function normalise(raw: any): City {
  return {
    id: raw._id || raw.id,
    name: raw.name,
    code: raw.code,
    icon: raw.icon || '',
    lat: raw.lat,
    lng: raw.lng,
  };
}

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
  const [cities, setCities] = useState<City[]>(FALLBACK_CITIES as City[]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [selectedCity, setSelected] = useState<City | null>(null);
  const [switching, setSwitching] = useState(false);
  /**
   * Seeded from the browser's own memory so a reload does not remount the tree
   * a second time for somebody who has already chosen.
   */
  const [cityScope, setScope] = useState<string>(() =>
    (typeof window === 'undefined' ? '' : localStorage.getItem('selectedCity') || ''));

  /**
   * Only an explicit choice is remembered — and the server is told about it.
   *
   * The app needs *a* city to render prices against, so it falls back to the
   * first one — but writing that fallback to localStorage would make a
   * first-time visitor look like someone who had already chosen, and the login
   * screen would skip the city step and quietly sign them up in the wrong city.
   *
   * The API call is the important half. Every module answers for the city on
   * the citizen's own record (`currentCity`), and this choice used to live in
   * `localStorage` alone: the header said ملایر while اماکن، تعرفه، ۱۳۷ and the
   * rest all answered for نهاوند, the city they had signed up in. A switcher
   * that only the browser knows about is not a switcher.
   */
  const setSelectedCity = (city: City) => {
    const previous = selectedCity;
    setSelected(city);
    if (!city?.id || typeof window === 'undefined') return;
    localStorage.setItem('selectedCity', city.id);

    const token = Cookies.get('auth_token');
    // Nobody signed in: there is no server-side city to change, so the switch
    // is complete the moment it is made.
    if (!token) { setScope(city.id); return; }

    setSwitching(true);
    fetch('/api/v1/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentCity: city.id }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        // Only now: every module answers for `currentCity`, and this is the
        // moment it became the new one. `cityScope` is what the screens are
        // keyed on, so they remount and ask again — the services grid, the
        // venues, the tariff, «کارهای من», all of it, without each screen
        // having to know that a city can change underneath it.
        setScope(city.id);
      })
      .catch(() => {
        // The server still answers for the old city, so showing the new one
        // would be a lie. Put the picker back and leave the screens alone.
        setSelected(previous);
        if (previous?.id) localStorage.setItem('selectedCity', previous.id);
      })
      .finally(() => setSwitching(false));
  };

  useEffect(() => {
    let alive = true;

    fetch('/api/v1/cities')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!alive) return;
        const list = (data?.cities || []).map(normalise).filter((c: City) => c.id && c.name);
        if (list.length) setCities(list);
      })
      .catch(() => {
        // Keep the fallback list; the picker still works offline.
      })
      .finally(() => alive && setLoadingCities(false));

    return () => {
      alive = false;
    };
  }, []);

  // Re-resolve the stored choice whenever the list changes: the saved id may
  // belong to a city that was renamed, or to one that has since been switched
  // off, in which case the app must not keep sending requests to it.
  useEffect(() => {
    if (typeof window === 'undefined' || !cities.length) return;

    const savedId = localStorage.getItem('selectedCity');
    const found = cities.find((c) => c.id === savedId);
    // `setSelected`, not `setSelectedCity`: resolving a default is not a choice.
    const resolved = found || cities[0];
    setSelected(resolved);
    // A first-time visitor has no saved city, so the scope is empty until the
    // list arrives. Set once; a real switch is the only other thing that moves it.
    setScope((prev) => prev || resolved?.id || '');
  }, [cities]);

  /**
   * شهرِ حقیقی، از روی حساب کاربر — نه از روی حافظهٔ این مرورگر.
   *
   * `localStorage` is a hint, not a fact: it belongs to one browser, and the
   * citizen's city belongs to their account. When the two disagree — a phone
   * that has not been opened since they moved, a second device, a switch whose
   * request never landed — the header was drawn from the browser and every
   * module answered from the server, so the app showed نهاوند's name over
   * ملایر's data and nothing on screen admitted it.
   *
   * Asked once, after the city list has arrived so the answer can be resolved
   * to a real row. Signed-out visitors have no account to ask about.
   */
  const reconciled = useRef(false);
  useEffect(() => {
    if (reconciled.current || !cities.length || typeof window === 'undefined') return;
    const token = Cookies.get('auth_token');
    if (!token) return;
    reconciled.current = true;

    fetch('/api/v1/services', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const id = data?.city?._id;
        const found = id && cities.find((c) => c.id === String(id));
        if (!found) return;
        setSelected(found);
        localStorage.setItem('selectedCity', found.id);
        // Only moves if the browser was wrong, and then the screens should
        // refetch — which is the whole point of keying them on this.
        setScope(found.id);
      })
      .catch(() => {
        // Offline, or the API is restarting. The saved choice still stands.
      });
  }, [cities]);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities, loadingCities, cityScope, switching }}>
      {children}
    </CityContext.Provider>
  );
};

/**
 * هر چیزی که «شهر» عوض شدنش را باید بفهمد.
 *
 * Everything under here is keyed on `cityScope`, so choosing a different city
 * remounts the screen and every hook on it fetches again. The alternative was a
 * city dependency threaded through each of a dozen screens' effects, one of
 * which would always be forgotten — and the one that was forgotten showed
 * ملایر's data under نهاوند's name.
 *
 * `display: contents` so this wrapper adds nothing to the layout it wraps.
 */
export const CityScope = ({ children }: { children: React.ReactNode }) => {
  const { cityScope, switching } = useCity();

  return (
    <>
      <div key={cityScope || 'boot'} style={{ display: 'contents' }}>{children}</div>

      {/* The switch takes a round trip. Saying so is the difference between a
          moment's wait and a button that looks broken. */}
      {switching && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', insetInline: 0, bottom: 'calc(96px + env(safe-area-inset-bottom))',
            zIndex: 100001, display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          }}
        >
          <span
            style={{
              padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 800,
              background: 'var(--pm-text-strong)', color: 'var(--pm-bg)',
              boxShadow: 'var(--pm-shadow-lift)',
            }}
          >
            در حال تغییر شهر…
          </span>
        </div>
      )}
    </>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
