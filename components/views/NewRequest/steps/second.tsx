
// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import { LatLng } from "leaflet";

// const MapWithNoSSR = dynamic(
//   () => import('./map-component'),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
//         در حال بارگذاری نقشه...
//       </div>
//     )
//   }
// );

// interface SecondStepProps {
//   onNext: (location: { lat: number; lng: number; address: string }) => void;
//   onBack: () => void;
// }


// export default function SecondStep({ onNext, onBack }: SecondStepProps) {
//   const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
//   const [address, setAddress] = useState('');
//   const defaultCenter = { lat: 35.6892, lng: 51.3890 }; // تهران

//   const handleLocationSelect = (latlng: LatLng) => {
//     setSelectedLocation(latlng);
//     // در اینجا می‌توانید از یک سرویس Geocoding برای تبدیل مختصات به آدرس استفاده کنید
//     setAddress('آدرس انتخاب شده');
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold text-center mb-8">موقعیت مکانی را انتخاب کنید</h2>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="h-[200px] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
//           {/* <p className="text-gray-500">نقشه اینجا نمایش داده خواهد شد</p> */}
//           <MapWithNoSSR
//             center={defaultCenter}
//             onLocationSelect={handleLocationSelect}
//             selectedLocation={selectedLocation}
//           />
//         </div>
//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="جستجوی آدرس..."
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
//           />
//           <div className="flex justify-between">
//             <button
//               onClick={() => onNext({ lat: 0, lng: 0, address: 'آدرس نمونه' })}
//               className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               مرحله بعد
//             </button>
//             <button
//               onClick={onBack}
//               className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               بازگشت
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const defaultCenter = { lat: 35.6892, lng: 51.3890 }; // تهران

  const handleLocationSelect = async (latlng: LatLng) => {
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
    const latlng = new LatLng(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    setSelectedLocation(latlng);
    setAddress(suggestion.display_name);
    setSuggestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8">موقعیت مکانی را انتخاب کنید</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="h-[400px] rounded-lg mb-6 overflow-hidden border-2 border-gray-200">
          <MapWithNoSSR
            center={defaultCenter}
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
        <div className="space-y-4">
          <div className="relative">
            <input
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
