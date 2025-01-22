'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Cross,
    Banknote,
    FileClock,
    MapPinned,
} from 'lucide-react';
import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import Link from 'next/link';

const items = [
    {
        icon: <Cross className="h-7 w-7" />,
        title: 'درخواست جمع آوری',
        description: 'درخواست جمع آوری جهت تصفیه و کمک به محیط زیست',
        color: 'text-[hsl(25,84%,48%)]',
        href:'/new-request'
    },
    {
        icon: <Banknote className="h-7 w-7" />,
        title: 'تعرفه قیمت‌ها',
        description: 'قیمت روز تمامی اقلام',
        color: 'text-[hsl(25,84%,48%)]',
        href:'tariff'
    },
    {
        icon: <FileClock className="h-7 w-7" />,
        title: 'سوابق جمع آوری',
        description: ' لیست سوابق درخواست های شما',
        color: 'text-[hsl(25,84%,48%)]',
        href:'history'
    },
    {
        icon: <MapPinned className="h-7 w-7" />,
        title: 'آدرس ها',
        description: 'آدرس های ثبت شده',
        color: 'text-[hsl(25,84%,48%)]',
        href:'addresses'
    },
];

export default function HomeView() {
    return (
        <div className="min-h-screen bg-background">
            <TopMenu />
            <ScrollArea className="h-[calc(100vh-8rem)] mt-20 mb-16">
                <div className=" p-4">
                    <div className="grid grid-cols-1 md:grid-cols gap-4">
                        {items.map((item, index) => (
                            <Link href={item?.href}>
                                <Card
                                    key={index}
                                    className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none cursor-pointer rounded-xl"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-end space-x-4">
                                            <div className="space-y-1.5">
                                                <h3 className="font-medium leading-none">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <div className={`p-2 rounded-lg ${item.color}`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <Navigation />
        </div>
    );
}