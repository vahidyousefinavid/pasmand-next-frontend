'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import {
    Trash2,
    Recycle,
    Battery,
    Box,
    Car,
    Construction,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const wasteTypes = [
    {
        id: 'household',
        name: 'پسماند خانگی',
        icon: <Trash2 className="w-8 h-8" />,
        description: 'شامل زباله‌های روزمره‌ای مثل پوست میوه، ته‌مانده غذا، دستمال کاغذی مصرف‌شده، و سایر موادی که معمولاً در سطل زباله خانگی می‌ریزیم. بهتره این‌ها رو از موارد قابل بازیافت جدا نگه داریم تا فرآیند بازیافت بهینه بمونه.'
    },
    {
        id: 'recyclable',
        name: 'قابل بازیافت',
        icon: <Recycle className="w-8 h-8" />,
        description: 'موادی مثل بطری‌های پلاستیکی، قوطی‌های فلزی، کاغذ باطله، مقوا، و شیشه که در صورت تمیز بودن دوباره قابل استفاده‌ هستند. برای مثال، بطری نوشابه، قوطی کنسرو، یا روزنامه قدیمی.'
    },
    {
        id: 'electronic',
        name: 'الکترونیکی',
        icon: <Battery className="w-8 h-8" />,
        description: 'لوازم برقی خراب یا بلااستفاده مثل باتری‌ها، گوشی قدیمی، شارژر، کابل، لپ‌تاپ یا تلویزیون. این وسایل نباید با زباله‌های دیگر مخلوط بشن چون می‌تونن محیط زیست رو آلوده کنن.'
    },
    {
        id: 'bulky',
        name: 'اقلام حجیم',
        icon: <Box className="w-8 h-8" />,
        description: 'اشیای بزرگ مثل مبل، تشک، کمد و لوازم چوبی که در زباله‌دان جا نمی‌گیرن. معمولاً نیاز به جمع‌آوری ویژه دارن.'
    },
    {
        id: 'automotive',
        name: 'خودرو',
        icon: <Car className="w-8 h-8" />,
        description: 'شامل روغن سوخته، باتری خودرو، لاستیک فرسوده و قطعات یدکی. این پسماندها نیاز به دفع خاص دارن چون ممکنه خطرناک باشن.'
    },
    {
        id: 'construction',
        name: 'ساختمانی',
        icon: <Construction className="w-8 h-8" />,
        description: 'پسماندهایی مثل آجر، گچ، سیمان، سرامیک شکسته، و نخاله‌های حاصل از تعمیرات یا ساخت‌وساز. این موارد معمولاً توسط شهرداری یا شرکت‌های تخصصی جمع‌آوری می‌شن.'
    },
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

export default function WasteTypesPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-background pt-10 pb-10">
            <TopMenu />
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80')] mix-blend-overlay opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                        <Trash2 className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6 text-white">انواع پسماند</h1>
                    {/* <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                        کارشناسان ما با افتخار آماده پاسخگویی به سؤالات شما هستند. از هر طریقی که راحت‌تر هستید با ما در تماس باشید.
                    </p> */}
                </div>
            </div>
            <div className="pt-20 px-4 md:px-6">
                {/* <h2 className="text-2xl font-bold text-right mb-6">انواع پسماند</h2> */}
                <motion.div
                    dir="rtl"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate={mounted ? 'visible' : 'hidden'}
                >
                    {wasteTypes.map((item, index) => (
                        <motion.div key={index} variants={itemVariants}>
                        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-none rounded-xl group cursor-default">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4">
                              <div className="space-y-2 flex-1">
                                <h3 className="font-semibold text-lg leading-none group-hover:text-[hsl(25,84%,48%)] transition-colors duration-300">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-muted-foreground text-justify">{item.description}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-[hsl(25,84%,48%)]/10 text-[hsl(25,84%,48%)] group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
            </div>
            <Navigation />
        </div>
    );
}
