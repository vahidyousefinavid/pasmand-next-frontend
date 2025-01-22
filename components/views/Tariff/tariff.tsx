'use client';

import { useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface PriceItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  change: number;
  category: string;
}

const priceData: PriceItem[] = [
  {
    id: '1',
    name: 'آهن آلات',
    price: 25000,
    unit: 'کیلوگرم',
    change: 2.5,
    category: 'فلزات'
  },
  {
    id: '2',
    name: 'مس',
    price: 180000,
    unit: 'کیلوگرم',
    change: 1.8,
    category: 'فلزات'
  },
  {
    id: '3',
    name: 'آلومینیوم',
    price: 85000,
    unit: 'کیلوگرم',
    change: -1.2,
    category: 'فلزات'
  },
  {
    id: '4',
    name: 'پت',
    price: 15000,
    unit: 'کیلوگرم',
    change: 3.2,
    category: 'پلاستیک'
  },
  {
    id: '5',
    name: 'نایلون',
    price: 12000,
    unit: 'کیلوگرم',
    change: -0.8,
    category: 'پلاستیک'
  },
  {
    id: '6',
    name: 'کاغذ باطله',
    price: 8000,
    unit: 'کیلوگرم',
    change: 1.5,
    category: 'کاغذ'
  },
  {
    id: '7',
    name: 'مقوا',
    price: 9500,
    unit: 'کیلوگرم',
    change: 2.1,
    category: 'کاغذ'
  },
  {
    id: '8',
    name: 'شیشه',
    price: 5000,
    unit: 'کیلوگرم',
    change: 0.5,
    category: 'شیشه'
  }
];

const categories = ['همه', 'فلزات', 'پلاستیک', 'کاغذ', 'شیشه'];

export default function PricesPage() {
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [sortBy, setSortBy] = useState<'price' | 'change'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedPrices = priceData
    .filter(item => selectedCategory === 'همه' || item.category === selectedCategory)
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * order;
    });

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR');
  };

  const formatChange = (change: number) => {
    return change.toLocaleString('fa-IR', { signDisplay: 'always', minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const SortButton = ({ type, label }: { type: 'price' | 'change'; label: string }) => (
    <button
      onClick={() => {
        if (sortBy === type) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(type);
          setSortOrder('desc');
        }
      }}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
      {label}
      {sortBy === type && (
        sortOrder === 'asc' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          قیمت روز اقلام بازیافتی
        </h1>

        {/* فیلترها */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* دکمه‌های مرتب‌سازی برای نمایش موبایل */}
        <div className="md:hidden flex gap-2 mb-4">
          <SortButton type="price" label="مرتب‌سازی بر اساس قیمت" />
          <SortButton type="change" label="مرتب‌سازی بر اساس تغییرات" />
        </div>

        {/* جدول برای دسکتاپ */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">نام کالا</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">دسته‌بندی</th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'price') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('price');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    قیمت (تومان)
                    {sortBy === 'price' && (
                      sortOrder === 'asc' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">واحد</th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'change') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('change');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    تغییرات (٪)
                    {sortBy === 'change' && (
                      sortOrder === 'asc' ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedPrices.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className={`inline-flex items-center gap-1 ${
                      item.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change > 0 ? <ArrowUpIcon size={16} /> : <ArrowDownIcon size={16} />}
                      {formatChange(item.change)}٪
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* کارت‌ها برای موبایل */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filteredAndSortedPrices.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                  item.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.change > 0 ? <ArrowUpIcon size={14} /> : <ArrowDownIcon size={14} />}
                  {formatChange(item.change)}٪
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">دسته‌بندی:</span>
                  <span className="text-gray-900">{item.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">قیمت:</span>
                  <span className="text-gray-900 font-medium">{formatPrice(item.price)} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">واحد:</span>
                  <span className="text-gray-900">{item.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* توضیحات */}
        <div className="mt-8 text-center text-sm text-gray-500">
          قیمت‌های نمایش داده شده به صورت میانگین و تقریبی می‌باشند و ممکن است بر اساس شرایط و کیفیت اقلام تغییر کنند.
        </div>
      </div>
    </div>
  );
}