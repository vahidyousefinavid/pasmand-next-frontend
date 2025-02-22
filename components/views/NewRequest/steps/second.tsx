import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';

const MapWithNoSSR = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      در حال بارگذاری نقشه...
    </div>
  ),
});

interface SecondStepProps {
  onNext: (location: { lat: number; lng: number; address: string }) => void;
  onBack: () => void;
}

export default function SecondStep({ onNext, onBack }: SecondStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [geoLocationError, setGeoLocationError] = useState<string>('');

  const defaultCenter = { lat: 35.6892, lng: 51.3890 }; // تهران

  const handleLocationSelect = async (latlng: { lat: number; lng: number }) => {
    setSelectedLocation(latlng);
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=fa`
      );
      const data = await response.json();
      setAddress(data.display_name || 'آدرس یافت نشد');
    } catch {
      setAddress('خطا در دریافت آدرس');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            value
          )}&format=json&addressdetails=1&limit=5&countrycodes=ir&accept-language=fa`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: { display_name: string; lat: string; lon: string }) => {
    const latlng = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setSelectedLocation(latlng);
    setAddress(suggestion.display_name);
    setSuggestions([]);
  };

  const getCurrentLocation = () => {
    setGeoLocationError('');
    setLoading(true);
    
    if (!navigator.geolocation) {
      setGeoLocationError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setSelectedLocation(latlng);
        await handleLocationSelect(latlng);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'خطا در دریافت موقعیت مکانی';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'دسترسی به موقعیت مکانی رد شد';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'موقعیت مکانی در دسترس نیست';
            break;
          case error.TIMEOUT:
            errorMessage = 'درخواست موقعیت مکانی با تاخیر مواجه شد';
            break;
        }
        setGeoLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">موقعیت مکانی را انتخاب کنید</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="relative h-[400px] rounded-lg mb-6 overflow-hidden border-2 border-gray-200">
          <MapWithNoSSR
            center={defaultCenter}
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
          <button
            onClick={getCurrentLocation}
            className="absolute top-4 left-4 px-4 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-blue-50 transition-colors z-[1000] flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            موقعیت فعلی
          </button>
        </div>
        <div className="space-y-4">
          {geoLocationError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-right">
              {geoLocationError}
            </div>
          )}
          <div className="relative">
            <Input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="جستجوی آدرس..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
            {loading && (
              <div className="absolute left-4 top-5">
                <div className="loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg w-full mt-1 max-h-40 overflow-y-auto text-right">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() =>
                onNext({
                  lat: selectedLocation?.lat || 0,
                  lng: selectedLocation?.lng || 0,
                  address,
                })
              }
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              مرحله بعد
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}