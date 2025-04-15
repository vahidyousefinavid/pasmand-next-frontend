'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Cross,
    Banknote,
    FileClock,
    MapPinned,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    Leaf,
    Gift,
    Recycle,
    ArrowUpRight,
    Wallet,
    Phone,
    Trash2
} from 'lucide-react';
import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation as SwiperNavigation, EffectFade, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-creative';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';

const items = [
    {
        icon: <Cross className="h-7 w-7" />,
        title: 'درخواست جمع آوری',
        description: 'درخواست جمع آوری جهت تصفیه و کمک به محیط زیست',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: '/new-request'
    },
    {
        icon: <Wallet className="h-7 w-7" />,
        title: 'کیف پول',
        description: 'خدمات مالی شما',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'wallet'
    },
    {
        icon: <Banknote className="h-7 w-7" />,
        title: 'تعرفه قیمت‌ها',
        description: 'قیمت روز تمامی اقلام',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'tariff'
    },
    {
        icon: <FileClock className="h-7 w-7" />,
        title: 'سوابق جمع آوری',
        description: ' لیست سوابق درخواست های شما',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'history'
    },
    {
        icon: <MapPinned className="h-7 w-7" />,
        title: 'آدرس ها',
        description: 'آدرس های ثبت شده',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'addresses'
    },
    {
        icon: <HelpCircle className="h-7 w-7" />,
        title: 'راهنمای استفاده',
        description: 'آموزش استفاده از اپلیکیشن',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'guide'
    },
    {
        icon: <Phone className="h-7 w-7" />,
        title: 'پشتیبانی',
        description: 'پشتیبانی و تماس با ما',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'contact-us'
    },
    {
        icon: <Trash2 className="h-7 w-7" />,
        title: 'انواع پسماند',
        description: 'آموزش و اطلاع رسانی انواع پسماند',
        color: 'text-[hsl(25,84%,48%)]',
        bgColor: 'bg-[hsl(25,84%,48%)]/10',
        href: 'waste-types'
    },
];

const banners = [
    {
        title: 'تخفیف ویژه برای جمع آوری بیش از ۵ کیلوگرم!',
        description: 'با جمع آوری بیشتر، به محیط زیست کمک کنید و از تخفیف های ویژه بهره مند شوید.',
        bgColor: 'from-[hsl(25,84%,48%)] to-[hsl(25,84%,58%)]',
        textColor: 'text-white',
        icon: <Recycle className="h-8 w-8 mb-0" />,
        buttonText: 'درخواست جمع‌آوری',
        buttonLink: '/new-request',
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1470&auto=format&fit=crop'
    },
    {
        title: 'همراه با ما در حفظ محیط زیست سهیم باشید',
        description: 'با تفکیک زباله‌ها و بازیافت آنها، به حفظ منابع طبیعی کمک کنید.',
        bgColor: 'from-emerald-600 to-emerald-500',
        textColor: 'text-white',
        icon: <Leaf className="h-8 w-8 mb-0" />,
        buttonText: 'مشاهده راهنما',
        buttonLink: '/guide',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1474&auto=format&fit=crop'
    },
    {
        title: 'جایزه ویژه برای کاربران فعال',
        description: 'با ثبت بیش از ۵ درخواست در ماه، شانس خود را برای دریافت جوایز نقدی امتحان کنید.',
        bgColor: 'from-blue-600 to-blue-500',
        textColor: 'text-white',
        icon: <Gift className="h-8 w-8 mb-0" />,
        buttonText: 'شرایط دریافت جایزه',
        buttonLink: '/guide',
        image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab0?q=80&w=1470&auto=format&fit=crop'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export default function HomeView() {
    const [mounted, setMounted] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const { user } = useAuth()
    useEffect(() => {
        setMounted(true);
    }, []);

    console.log(user);

    return (
        <div className="min-h-screen bg-background">
            <TopMenu />

            {/* Enhanced Advertisement Banner with Swiper */}
            <div className="mt-16 pt-[20px] px-[20px]">
                {mounted && (
                    <Swiper
                        spaceBetween={0}
                        centeredSlides={true}
                        effect={'creative'}
                        creativeEffect={{
                            prev: {
                                shadow: true,
                                translate: [0, 0, -400],
                            },
                            next: {
                                translate: ['100%', 0, 0],
                            },
                        }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                            renderBullet: function (index, className) {
                                return `<span class="${className} w-3 h-3"></span>`;
                            },
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        modules={[Autoplay, Pagination, SwiperNavigation, EffectFade, EffectCreative]}
                        className="mySwiper relative min-h-[220px] md:h-[350px]"
                        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                    >
                        {banners.map((banner, index) => (
                            <SwiperSlide key={index}>
                                <div
                                    className={`h-full min-h-[220px] md:h-[350px] rounded-lg bg-gradient-to-r ${banner.bgColor} ${banner.textColor} relative overflow-hidden py-6`}
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${index === 0 ? 'hsl(25,84%,48%), hsl(25,84%,58%)' : index === 1 ? '#059669, #10b981' : '#2563eb, #3b82f6'})`,
                                    }}
                                >
                                    {/* Background image with overlay */}
                                    <div
                                        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
                                        style={{ backgroundImage: `url(${banner.image})` }}
                                    ></div>

                                    {/* Decorative elements */}
                                    <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-white opacity-10"></div>
                                    <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full bg-white opacity-10"></div>
                                    <div className="absolute top-[30%] left-[20%] w-[70px] h-[70px] rounded-full bg-white opacity-10"></div>
                                    <div className="absolute bottom-[20%] right-[15%] w-[100px] h-[100px] rounded-full bg-white opacity-10"></div>

                                    <div className="h-full flex items-center justify-center px-6">
                                        <div className="max-w-4xl mx-auto relative z-10">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-8">
                                                <div className="text-center md:text-right md:flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="md:flex-shrink-0 flex items-center justify-center">
                                                            <div className={`p-3 md:p-6 rounded-full bg-white/20 backdrop-blur-sm animate-pulse`}>
                                                                {banner.icon}
                                                            </div>
                                                        </div>                                                        <h3 className="text-lg md:text-2xl font-bold">{banner.title}</h3>
                                                    </div>
                                                    {/* <h3 className="font-bold text-lg md:text-3xl mb-1 md:mb-3 leading-tight">{banner.title}</h3> */}
                                                    <p className="text-sm md:text-lg mb-3 md:mb-4 max-w-lg mx-auto md:mx-0 opacity-90">{banner.description}</p>
                                                    <Link
                                                        href={banner.buttonLink}
                                                        className="inline-flex items-center gap-2 bg-white hover:bg-opacity-90 transition-all duration-300 font-medium py-2 md:py-3 px-6 md:px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                                        style={{ color: index === 0 ? 'hsl(25,84%,48%)' : index === 1 ? '#059669' : '#2563eb' }}
                                                    >
                                                        <span>{banner.buttonText}</span>
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Link>
                                                </div>

                                                {/* <div className="md:flex-shrink-0 flex items-center justify-center">
                                                    <div className={`p-3 md:p-6 rounded-full bg-white/20 backdrop-blur-sm animate-pulse`}>
                                                        {banner.icon}
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}

                        {/* Custom navigation buttons */}
                        <div className="swiper-button-prev !hidden md:!flex absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 transition-all duration-300 rounded-full w-12 h-12 items-center justify-center cursor-pointer backdrop-blur-sm">
                            <ChevronRight className="h-6 w-6 text-white" />
                        </div>
                        <div className="swiper-button-next !hidden md:!flex absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 transition-all duration-300 rounded-full w-12 h-12 items-center justify-center cursor-pointer backdrop-blur-sm">
                            <ChevronLeft className="h-6 w-6 text-white" />
                        </div>

                        {/* Banner indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                            {banners.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-10 bg-white' : 'w-3 bg-white/50'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </Swiper>
                )}
            </div>
            <div className="p-4 md:p-6 ">
                <motion.div
                    dir="rtl"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {items.map((item, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Link href={item?.href}>
                                <Card
                                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-none cursor-pointer rounded-xl group"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-start items-center space-x-4">
                                            <div className="space-y-2 flex-1">
                                                <h3 className="font-medium text-lg leading-none group-hover:text-[hsl(25,84%,48%)] transition-colors duration-300">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            {/* </ScrollArea> */}
            <Navigation />
        </div>
    );
}