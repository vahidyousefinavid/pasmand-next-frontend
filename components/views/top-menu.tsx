'use client';

import {
    CircleUser,
    MenuIcon,
    LogIn,
    Leaf,
    MapPin,
    ChevronDown,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';
import InstallButton from './InstallButton';
import { cities } from '@/variables';

export function TopMenu() {
    const [open, setOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const [selectedCity, setSelectedCity] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedCity = localStorage.getItem('selectedCity');
            return cities.find((city) => city.id === savedCity) || cities[0];
        }
        return cities[0];
    });
    const [showCitiesInSideMenu, setShowCitiesInSideMenu] = useState(false);

    useEffect(() => {
        localStorage.setItem('selectedCity', selectedCity.id);
    }, [selectedCity]);

    const menuItems = [
        { title: 'صفحه اصلی', href: '/' },
        { title: 'ثبت درخواست جدید', href: '/new-request' },
        { title: 'سوابق فروش', href: '/history' },
        { title: 'تعرفه قیمت‌ها', href: '/tariff' },
        { title: 'آدرس های ثبت شده', href: '/addresses' },
        { title: 'کیف پول', href: '/wallet' },
        { title: 'پشتیبانی', href: '/contact-us' },
    ];

    return (
        <div className="fixed shadow-custom-elevated rounded-b-[20px] top-0 right-0 left-0 z-[10000] bg-secondary/100 backdrop-blur supports-[backdrop-filter]:bg-secondary/100">
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between text-xl text-white">
                    <div className="flex gap-4 items-center">
                        {/* موبایل: منوی کناری */}
                        <div className="flex md:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger>
                                    <MenuIcon />
                                </SheetTrigger>
                                <SheetContent
                                    side={'right'}
                                    className="pt-24 flex flex-col z-[10000] overflow-y-auto"
                                >
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-full">
                                                <Leaf className="w-8 h-8 text-green-400" />
                                            </div>
                                            <h2 className="text-xl font-bold">برنامه شهروند</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={() =>
                                                    setShowCitiesInSideMenu(!showCitiesInSideMenu)
                                                }
                                                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 border border-transparent transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={selectedCity.icon}
                                                        alt={selectedCity.name}
                                                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                                    />
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            {selectedCity.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">خدمات شهری</p>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showCitiesInSideMenu ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {showCitiesInSideMenu && (
                                                <div className="grid grid-cols-1 gap-3 pt-2">
                                                    {cities.map((city) => (
                                                        <button
                                                            key={city.id}
                                                            onClick={() => {
                                                                setSelectedCity(city);
                                                                setShowCitiesInSideMenu(false);
                                                            }}
                                                            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${selectedCity.id === city.id
                                                                ? 'bg-emerald-50 border border-emerald-200'
                                                                : 'hover:bg-gray-50 border border-transparent'
                                                                }`}
                                                        >
                                                            <img
                                                                src={city.icon}
                                                                alt={city.name}
                                                                className="w-12 h-12 rounded-lg object-cover shadow-sm"
                                                            />
                                                            <div className="text-right">
                                                                <p className="font-medium text-gray-900">
                                                                    {city.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    خدمات شهری
                                                                </p>
                                                            </div>
                                                            {selectedCity.id === city.id && (
                                                                <div className="mr-auto">
                                                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-px bg-gray-200 my-4" />
                                        <div className="flex flex-col gap-6">
                                            {menuItems.map((item, index) => (
                                                <Link
                                                    key={index}
                                                    href={item.href}
                                                    className="font-bold text-xl hover:text-emerald-600 transition-colors"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    {item.title}
                                                </Link>
                                            ))}
                                            <InstallButton />
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* لوگو و انتخاب شهر */}
                        <div className="flex flex-col items-start gap-1 relative">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 backdrop-blur-md p-2 rounded-full">
                                    <Leaf className="w-6 h-6 text-green-400" />
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild
                                    // className='absolute bottom-[-30px] right-[7px]'
                                    >
                                            <button className="flex items-center gap-2 p-1 rounded-full bg-secondary/100 hover:bg-secondary/100 transition text-sm text-white/90">
                                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full">
                                                <img
                                                    src={selectedCity.icon}
                                                    alt={selectedCity.name}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                        </div>
                                                {/* <span>{selectedCity.name}</span> */}
                                                <ChevronDown className="w-4 h-4 text-white/70" />
                                            </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-2 mt-2 z-[10001]">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-2">
                                                <MapPin className="w-5 h-5 text-gray-500" />
                                                <h3 className="font-medium text-gray-900">انتخاب شهر</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {cities.map((city) => (
                                                    <button
                                                        key={city.id}
                                                        onClick={() => setSelectedCity(city)}
                                                        className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-all duration-200 ${selectedCity.id === city.id
                                                            ? 'bg-emerald-50 border border-emerald-200'
                                                            : 'hover:bg-gray-50 border border-transparent'
                                                            }`}
                                                    >
                                                        <img
                                                            src={city.icon}
                                                            alt={city.name}
                                                            className="w-10 h-10 rounded-lg object-cover shadow-sm"
                                                        />
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900">
                                                                {city.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">خدمات شهری</p>
                                                        </div>
                                                        {selectedCity.id === city.id && (
                                                            <div className="mr-auto">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <h1 className="text-xl text-white font-bold">برنامه شهروند</h1>
                            </div>

                        </div>
                    </div>

                    {/* سمت راست: پروفایل یا ورود */}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Link href="/profile">
                                <CircleUser className="cursor-pointer w-7 h-7" />
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" className="text-white gap-2">
                                    <LogIn className="w-5 h-5" />
                                    ورود / ثبت نام
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
