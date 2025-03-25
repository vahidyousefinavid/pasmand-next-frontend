"use client"
import React, { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, Package2Icon, TruckIcon, BanknoteIcon, ScaleIcon } from 'lucide-react';
import { axiosService } from '@/lib/axiosService';
import { API } from '@/services/const';
import Cookies from 'js-cookie';
import { toast } from '@/hooks/use-toast';
import { formatDateToJalali } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";

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
  status: 'pending' | 'collecting' | 'completed' | 'cancelled';
  totalPrice: number;
  location: {
    address: string;
    lat: number;
    lng: number;
    _id: string;
  };
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
  cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-800' }
};

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
  const [requestsItems, setRequestsItems] = useState<HistoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'collecting' | 'completed' | 'cancelled'>('all');

  const formatPrice = (price: number) => {
    return price?.toLocaleString('fa-IR');
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
              className={`px-4 py-2 rounded-full transition-all ${
                selectedStatus === 'all'
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
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedStatus === status
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
                    <span className={`px-3 py-1 rounded-full text-sm ${statusMap[item.status].color}`}>
                      {statusMap[item.status].label}
                    </span>
                  </div>

                  {item.items.length > 0 && item.status !== 'pending' && (
                    <div className="border-t border-b border-gray-100 py-4 mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">اقلام:</h3>
                      <div className="space-y-2">
                        {item.items.map((subItem) => (
                          <div key={subItem._id} className="flex justify-between text-sm">
                            <span>{subItem.title} ({subItem.quantity} {subItem.unit})</span>
                            <span>{formatPrice(subItem.pricePerUnit * subItem.quantity)} تومان</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
    </div>
  );
}