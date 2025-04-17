"use client"
import React, { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, Package2Icon, TruckIcon, BanknoteIcon, ScaleIcon, Pencil, X, Trash2, Recycle, Battery, Box, Car, Construction, Loader2 } from 'lucide-react';
import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';
import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';
import { formatDateToJalali } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';

const MapWithNoSSR = dynamic(
  () => import('@/components/views/Components/map'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        در حال بارگذاری نقشه...
      </div>
    )
  }
);

interface HistoryItem {
  _id: string;
  date: string;
  items: {
    material: string;
    category: string;
    pricePerUnit: number;
    quantity: number;
    title: string;
    unit: string;
    description: string;
    _id: string;
  }[];
  status: 'pending' | 'collecting' | 'completed' | 'canceled';
  totalPrice: number;
  location: {
    address: string;
    lat: number;
    lng: number;
    _id: string;
  };
  wasteType?: string;
  timeSlot: {
    date: string;
    time: string;
    _id: string;
  };
  collector?: string;
  user: string;
  __v: number;
}

const statusMap = {
  pending: { label: 'در انتظار تایید', color: 'bg-yellow-100 text-yellow-800' },
  collecting: { label: 'در حال جمع‌آوری', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
  canceled: { label: 'لغو شده', color: 'bg-red-100 text-red-800' }
};

const wasteTypes = [
  {
    id: 'household',
    name: 'پسماند خانگی',
    icon: <Trash2 className="w-8 h-8" />,
    description: 'زباله‌ها و پسماندهای معمولی خانگی'
  },
  {
    id: 'recyclable',
    name: 'قابل بازیافت',
    icon: <Recycle className="w-8 h-8" />,
    description: 'کاغذ، پلاستیک، شیشه و فلزات'
  },
  {
    id: 'electronic',
    name: 'الکترونیکی',
    icon: <Battery className="w-8 h-8" />,
    description: 'وسایل الکترونیکی و باتری‌ها'
  },
  {
    id: 'bulky',
    name: 'اقلام حجیم',
    icon: <Box className="w-8 h-8" />,
    description: 'مبلمان و وسایل بزرگ'
  },
  {
    id: 'automotive',
    name: 'خودرو',
    icon: <Car className="w-8 h-8" />,
    description: 'قطعات و مایعات خودرو'
  },
  {
    id: 'construction',
    name: 'ساختمانی',
    icon: <Construction className="w-8 h-8" />,
    description: 'مصالح ساختمانی و نخاله‌ها'
  }
];

const ItemsSkeleton = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen py-24 px-4">
    <div className="max-w-6xl mx-auto">
      <Skeleton className="h-10 w-64 mx-auto mb-8" />

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Status Tabs Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Sort Buttons Skeleton */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* History Items Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="border-t border-b border-gray-100 py-4 mb-4">
                <Skeleton className="h-4 w-32 mb-3" />
                <ItemsSkeleton />
              </div>
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function HistoryPage() {
  const [sortBy, setSortBy] = useState<'date' | 'totalPrice'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestsItems, setRequestsItems] = useState<HistoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'collecting' | 'completed' | 'canceled'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HistoryItem | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    items: [] as {
      material: string;
      category: string;
      pricePerUnit: number;
      quantity: number;
      title: string;
      unit: string;
      description: string;
      _id: string;

    }[],
    address: '',
    location: null as { lat: number; lng: number } | null,
    date: '',
    time: '',
    wasteType: '' as any
  });
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const timeSlots = [
    '۹:۰۰ - ۱۱:۰۰',
    '۱۱:۰۰ - ۱۳:۰۰',
    '۱۴:۰۰ - ۱۶:۰۰',
    '۱۶:۰۰ - ۱۸:۰۰'
  ];

  const formatPrice = (price: number) => {
    return price?.toLocaleString('fa-IR');
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      setLoadingRequest(true)
      await axiosService({
        url: `${API.CANCEL_REQUEST}/${requestId}`,
        method: 'put',
        token: Cookies.get('auth_token')
      });

      toast({
        title: 'موفق',
        description: 'درخواست با موفقیت لغو شد',
      });

      getRequests();
      setShowConfirmCancel(false);
      setRequestToCancel(null);
      setLoadingRequest(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'لغو درخواست با مشکل مواجه شد',
      });
      setLoadingRequest(false)
    }
  };

  const handleEditRequest = (request: HistoryItem) => {
    setSelectedRequest(request);
    setEditFormData({
      items: [...request.items],
      address: request.location.address,
      location: {
        lat: request.location.lat,
        lng: request.location.lng
      },
      date: request.timeSlot.date,
      time: request.timeSlot.time,
      wasteType: request.wasteType
    });
    setIsEditModalOpen(true);
  };

  const handleLocationSelect = async (latlng: { lat: number; lng: number }) => {
    setEditFormData(prev => ({ ...prev, location: latlng }));
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json&accept-language=fa`
      );
      const data = await response.json();
      setEditFormData(prev => ({ ...prev, address: data.display_name || 'آدرس یافت نشد' }));
    } catch {
      setEditFormData(prev => ({ ...prev, address: 'خطا در دریافت آدرس' }));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditFormData(prev => ({ ...prev, address: value }));

    if (value.length > 2) {
      setLocationLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=ir&accept-language=fa`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: { display_name: string; lat: string; lon: string }) => {
    setEditFormData(prev => ({
      ...prev,
      location: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) },
      address: suggestion.display_name
    }));
    setSuggestions([]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...editFormData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'quantity' || field === 'pricePerUnit' ? Number(value) : value
    };
    setEditFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest || !editFormData.location || !editFormData.address) return;
    try {
      setLoadingRequest(true)
      await axiosService({
        url: `${API.UPDATE_REQUEST}/${selectedRequest._id}`,
        method: 'put',
        token: Cookies.get('auth_token'),
        body: {
          location: {
            address: editFormData.address,
            lat: editFormData.location.lat,
            lng: editFormData.location.lng
          },
          timeSlot: {
            date: editFormData.date,
            time: editFormData.time
          },
          wasteType: editFormData.wasteType
        }
      });
      toast({
        title: 'موفق',
        description: 'درخواست با موفقیت ویرایش شد',
      });
      getRequests();
      setIsEditModalOpen(false);
      setSelectedRequest(null);
      setLoadingRequest(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: 'ویرایش درخواست با مشکل مواجه شد',
      });
      setLoadingRequest(false)
    }
  };

  const getRequests = () => {
    setLoading(true);
    axiosService({
      url: API.USER_REQUESTS,
      method: 'get',
      token: Cookies.get('auth_token')
    })
      .then((res: any) => {
        setRequestsItems(res?.data?.requests || []);
        setLoading(false);
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'ناموفق',
          description: 'متاسفانه انجام نشد صفحه را دوباره بارگزاری کنید',
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    getRequests();
  }, []);

  const filteredAndSortedHistory = [...requestsItems]
    .filter(item => selectedStatus === 'all' || item.status === selectedStatus)
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return order * (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      return order * (a.totalPrice - b.totalPrice);
    });

  // Calculate total stats
  const stats = requestsItems.reduce((acc, curr) => {
    if (curr.status === 'completed') {
      acc.totalEarnings += curr.totalPrice;
      acc.totalWeight += curr.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    acc.totalOrders += 1;
    return acc;
  }, {
    totalEarnings: 0,
    totalWeight: 0,
    totalOrders: 0
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          سوابق درخواست‌ها
        </h1>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">درآمد کل</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalEarnings)} تومان</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BanknoteIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">وزن کل بازیافت</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWeight} کیلوگرم</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ScaleIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">تعداد درخواست‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package2Icon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-full transition-all ${selectedStatus === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              همه
            </button>
            {Object.entries(statusMap).map(([status, { label }]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as any)}
                className={`px-4 py-2 rounded-full transition-all ${selectedStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            تاریخ
            {sortBy === 'date' && (
              sortOrder === 'asc' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />
            )}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'totalPrice') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortBy('totalPrice');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            مبلغ
            {sortBy === 'totalPrice' && (
              sortOrder === 'asc' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />
            )}
          </button>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredAndSortedHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500">هیچ درخواستی یافت نشد</p>
            </div>
          ) : (
            filteredAndSortedHistory.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">شماره درخواست: {item._id}</p>
                      <p className="text-sm text-gray-500">تاریخ: {item.timeSlot.date}</p>
                      <p className="text-sm text-gray-500">ساعت: {item.timeSlot.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${statusMap[item.status].color}`}>
                        {statusMap[item.status].label}
                      </span>
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleEditRequest(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="ویرایش درخواست"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setRequestToCancel(item._id);
                              setShowConfirmCancel(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="لغو درخواست"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>آدرس: {item.location.address}</p>
                    </div>
                    {item.totalPrice > 0 && item.status !== 'pending' && (
                      <div className="text-lg font-bold">
                        {formatPrice(item.totalPrice)} تومان
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">تایید لغو درخواست</h3>
            <p className="text-gray-600 mb-6">
              آیا از لغو این درخواست اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConfirmCancel(false);
                  setRequestToCancel(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={() => requestToCancel && handleCancelRequest(requestToCancel)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <div className="w-[80px] flex justify-center items-center">
                  {loadingRequest ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'تایید لغو'
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000000]">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">ویرایش درخواست</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موقعیت روی نقشه
                  </label>
                  <div className="h-[300px] rounded-lg overflow-hidden border-2 border-gray-200">
                    <MapWithNoSSR
                      center={editFormData.location || { lat: 35.6892, lng: 51.3890 }}
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={editFormData.location}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آدرس دقیق
                  </label>
                  <Input
                    type="text"
                    value={editFormData.address}
                    onChange={handleAddressChange}
                    placeholder="جستجوی آدرس..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  />
                  {locationLoading && (
                    <div className="absolute left-4 top-11">
                      <div className="loader">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4 mt-4">
                      نوع پسماند
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wasteTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setEditFormData(prev => ({
                              ...prev,
                              wasteType: type.id
                            }));
                          }}
                          className={`p-4 bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 flex items-center space-x-3 border ${editFormData.wasteType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500'
                            }`}
                        >
                          <div className="p-2 bg-blue-50 rounded-full">
                            {type.icon}
                          </div>
                          <div className="text-right">
                            <h3 className="font-semibold">{type.name}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    انتخاب بازه زمانی
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setEditFormData(prev => ({ ...prev, time: slot }))}
                        className={`p-4 rounded-lg border ${editFormData.time === slot
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-500'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedRequest(null);
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editFormData.address || !editFormData.location}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <div className="w-[100px] flex justify-center items-center">
                      {loadingRequest ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'ذخیره تغییرات'
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}