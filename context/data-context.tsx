// app/context/CityContext.tsx یا هر مسیر مشابه
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cities } from '@/variables';
import { City } from '@/lib/types/types';

type CityContextType = {
    selectedCity: City|null;
    setSelectedCity: (city: City) => void;
};

const defaultCity = cities[0];

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCityId = localStorage.getItem('selectedCity');
            const found = cities.find(city => city.id === savedCityId);
            if (found) {
                setSelectedCity(found);
            } else {
                // اگر چیزی در localStorage نبود، بذار شهر پیش‌فرض
                setSelectedCity(cities[0]);
            }
        }
    }, []);

    useEffect(() => {
        if(selectedCity?.id){
            localStorage.setItem('selectedCity', selectedCity?.id);
        }
    }, [selectedCity]);

    return (
        <CityContext.Provider value={{ selectedCity, setSelectedCity }}>
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
