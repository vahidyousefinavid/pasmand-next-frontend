'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  /**
   * Only an explicit choice is remembered.
   *
   * The app needs *a* city to render prices against, so it falls back to the
   * first one — but writing that fallback to localStorage would make a
   * first-time visitor look like someone who had already chosen, and the login
   * screen would skip the city step and quietly sign them up in the wrong city.
   */
  const setSelectedCity = (city: City) => {
    setSelected(city);
    if (city?.id && typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', city.id);
    }
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
    setSelected(found || cities[0]);
  }, [cities]);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities, loadingCities }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
