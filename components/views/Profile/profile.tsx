'use client';

import { useState } from 'react';
import { User, Phone, Mail, Edit2, Camera, Package2, MapPin, Bell, LogOut } from 'lucide-react';

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const mockProfile: UserProfile = {
  name: 'علی محمدی',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  email: 'ali@example.com',
};

const mockNotificationSettings: NotificationSetting[] = [
  {
    id: 'new_price',
    title: 'تغییرات قیمت',
    description: 'اطلاع‌رسانی در مورد تغییرات قیمت اقلام بازیافتی',
    enabled: true,
  },
  {
    id: 'collection_reminder',
    title: 'یادآوری جمع‌آوری',
    description: 'یادآوری زمان مراجعه برای جمع‌آوری پسماند',
    enabled: true,
  },
  {
    id: 'special_offers',
    title: 'پیشنهادات ویژه',
    description: 'دریافت پیشنهادات و تخفیف‌های ویژه',
    enabled: false,
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSetting[]>(mockNotificationSettings);

  const handleSaveProfile = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ));
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">پروفایل کاربری</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون اصلی */}
          <div className="lg:col-span-2 space-y-6">
            {/* کارت اطلاعات شخصی */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">اطلاعات شخصی</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <span>{profile.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span dir="ltr">{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span dir="ltr">{profile.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* تنظیمات اعلان‌ها */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-6">تنظیمات اعلان‌ها</h2>
              <div className="space-y-6">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-500">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notification.enabled}
                        onChange={() => toggleNotification(notification.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ستون کناری */}
          <div className="space-y-6">
            {/* کارت آواتار */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg">{profile.name}</h3>
            </div>

            {/* منوی دسترسی سریع */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-4">دسترسی سریع</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-right flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Package2 className="w-5 h-5 text-gray-500" />
                  <span>سفارش‌های من</span>
                </button>
                <button className="w-full p-3 text-right flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>آدرس‌های من</span>
                </button>
                <button className="w-full p-3 text-right flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span>اعلان‌ها</span>
                </button>
                <button className="w-full p-3 text-right flex items-center gap-3 hover:bg-gray-50 rounded-lg text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}