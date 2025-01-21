'use client'

import { MenuIcon, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Link from "next/link";
import { useState } from "react";

export function TopMenu() {
    const [open, setOpen] = useState(false)
    const menuItems = [
        {
            title: 'صفحه اصلی',
            href: '/'
        },
        {
            title: 'ثبت درخواست جدید',
            href: '/new-request'
        },
        {
            title: 'سوابق فروش',
            href: '/history'
        },
        {
            title: 'تعرفه قیمت‌ها',
            href: '/tariff'
        }
    ]

    return (
        <div className="fixed shadow-custom-elevated rounded-b-[20px] top-0 right-0 left-0 py-2 z-[10000] bg-secondary/100 backdrop-blur supports-[backdrop-filter]:bg-secondary/100">
            <div className="flex items-center justify-between p-4">
                <div className="flex gap-4">
                    <div className="flex md:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger>
                                <MenuIcon />
                            </SheetTrigger>
                            <SheetContent side={'right'} className="pt-24 flex flex-col z-[10000]">
                                <div className="flex flex-col gap-12">
                                    {
                                        menuItems?.map((item) => (
                                            <Link href={item?.href} className="font-bold text-xl ">
                                                {item?.title}
                                            </Link>
                                        ))
                                    }
                                </div>
                            </SheetContent>
                        </Sheet>

                    </div>
                    <h1 className="text-xl text-white font-bold">برنامه پسماند</h1>
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>
        </div>
    )
}