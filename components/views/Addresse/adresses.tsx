'use client';

import { useState } from 'react';
import { MapPin, Plus, X, Home, Building2, Briefcase } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamic import of Map component with no SSR
const MapWithNoSSR = dynamic(
  () => import('@/components/views/NewRequest/steps/map-component'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        در حال بارگذاری نقشه...
      </div>
    )
  }
);

interface Address {
  id: string;
  title: string;
  type: 'home' | 'work' | 'other';
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

const mockAddresses: Address[] = [
  {
    id: '1',
    title: 'منزل',
    type: 'home',
    address: 'تهران، خیابان ولیعصر، کوچه مهر، پلاک ۱۲',
    location: { lat: 35.6892, lng: 51.3890 }
  },
  {
    id: '2',
    title: 'محل کار',
    type: 'work',
    address: 'تهران، خیابان شریعتی، کوچه بهار، ساختمان آفتاب',
    location: { lat: 35.7219, lng: 51.4081 }
  }
];

const addressTypeIcons = {
  home: <Home className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  other: <Building2 className="w-5 h-5" />
};

const addressTypeLabels = {
  home: 'خانه',
  work: 'محل کار',
  other: 'سایر'
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    type: 'home' as Address['type'],
    address: '',
    location: null as LatLng | null
  });
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddAddress = () => {
    if (newAddress.title && newAddress.address && newAddress.location) {
      const address: Address = {
        id: (addresses.length + 1).toString(),
        title: newAddress.title,
        type: newAddress.type,
        address: newAddress.address,
        location: {
          lat: newAddress.location.lat,
          lng: newAddress.location.lng
        }
      };
      setAddresses([...addresses, address]);
      setIsModalOpen(false);
      setNewAddress({
        title: '',
        type: 'home',
        address: '',
        location: null
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleLocationSelect = async (latlng: LatLng) => {
    setNewAddress(prev => ({ ...prev, location: latlng }));
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=fa`
      );
      const data = await response.json();
      setNewAddress(prev => ({ ...prev, address: data.display_name || 'آدرس یافت نشد' }));
    } catch {
      setNewAddress(prev => ({ ...prev, address: 'خطا در دریافت آدرس' }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAddress(prev => ({ ...prev, address: value }));

    if (value.length > 2) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=ir&accept-language=fa`
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
    setNewAddress(prev => ({
      ...prev,
      location: latlng,
      address: suggestion.display_name
    }));
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">آدرس‌های من</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            افزودن آدرس جدید
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    {addressTypeIcons[address.type]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{address.title}</h3>
                    <span className="text-sm text-gray-500">{addressTypeLabels[address.type]}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>{address.address}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding new address */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000000]">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">افزودن آدرس جدید</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان آدرس
                    </label>
                    <input
                      type="text"
                      value={newAddress.title}
                      onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                      placeholder="مثال: خانه، محل کار"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع آدرس
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(addressTypeLabels).map(([type, label]) => (
                        <button
                          key={type}
                          onClick={() => setNewAddress({ ...newAddress, type: type as Address['type'] })}
                          className={`p-3 rounded-lg border flex items-center justify-center gap-2
                            ${newAddress.type === type
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-blue-500'
                            }`}
                        >
                          {addressTypeIcons[type as Address['type']]}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موقعیت روی نقشه
                    </label>
                    <div className="h-[300px] rounded-lg overflow-hidden border-2 border-gray-200">
                      <MapWithNoSSR
                        center={{ lat: 35.6892, lng: 51.3890 }}
                        onLocationSelect={handleLocationSelect}
                        selectedLocation={newAddress.location}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس دقیق
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={handleAddressChange}
                      placeholder="جستجوی آدرس..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    />
                    {loading && (
                      <div className="absolute left-4 top-11">
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

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleAddAddress}
                      disabled={!newAddress.title || !newAddress.address || !newAddress.location}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      ثبت آدرس
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}