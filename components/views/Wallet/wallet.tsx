"use client";
import React, { useEffect, useState } from 'react';
import { WalletIcon, ArrowUpIcon, ArrowDownIcon, HistoryIcon, TrendingUpIcon, PlusIcon, ArrowRightIcon, PhoneIcon, WifiIcon, BusIcon, HomeIcon, GiftIcon, ReceiptIcon, BanIcon as BankIcon, CreditCardIcon } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { API } from '@/services/const';
import moment from 'jalali-moment';

interface Transaction {
    _id: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'transfer';
    status: 'pending' | 'completed' | 'failed';
    reference: string | null;
    createdAt: string;
}

const services = [
    { icon: PhoneIcon, title: 'شارژ موبایل', color: 'bg-purple-500' },
    { icon: WifiIcon, title: 'بسته اینترنت', color: 'bg-blue-500' },
    { icon: BusIcon, title: 'بلیط اتوبوس', color: 'bg-green-500' },
    { icon: HomeIcon, title: 'قبوض', color: 'bg-orange-500' },
    { icon: GiftIcon, title: 'کارت هدیه', color: 'bg-pink-500' },
    { icon: ReceiptIcon, title: 'خدمات شهری', color: 'bg-teal-500' }
];

export default function WalletPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('services');
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawalLoading, setWithdrawalLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        getWalletInfo();
    }, []);

    const getWalletInfo = () => {
        setLoading(true);
        axiosService({
            url: API.GET_WALLET,
            method: "get",
            token: Cookies.get("auth_token"),
        })
            .then((res) => {
                setBalance(res?.data?.wallet?.balance || 0);
                setTransactions(res?.data?.wallet?.transactions || []);
                setLoading(false);
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "ناموفق",
                    description: "متاسفانه انجام نشد صفحه را دوباره بارگزاری کنید",
                });
                setLoading(false);
            });
    };

    const handleDeposit = () => {
        setLoading(true);
        axiosService({
            url: API.ADD_TRANSACTION_WALLET,
            method: "post",
            token: Cookies.get("auth_token"),
            body: { amount: 100000, type: 'deposit' },
        })
            .then(() => {
                toast({
                    variant: "success",
                    title: "موفق",
                    description: "موجودی با موفقیت افزایش یافت",
                });
                getWalletInfo();
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "ناموفق",
                    description: "متاسفانه انجام نشد صفحه را دوباره بارگزاری کنید",
                });
                setLoading(false);
            });
    };

    const handleWithdraw = () => {
        if (!withdrawalAmount || isNaN(Number(withdrawalAmount)) || Number(withdrawalAmount) <= 0) {
            toast({
                variant: "destructive",
                title: "خطا",
                description: "لطفا مبلغ معتبر وارد کنید",
            });
            return;
        }

        if (Number(withdrawalAmount) > balance) {
            toast({
                variant: "destructive",
                title: "خطا",
                description: "موجودی کافی نیست",
            });
            return;
        }

        setWithdrawalLoading(true);
        axiosService({
            url: API.ADD_TRANSACTION_WALLET,
            method: "post",
            token: Cookies.get("auth_token"),
            body: { amount: Number(withdrawalAmount), type: 'withdrawal' },
        })
            .then(() => {
                toast({
                    variant: "success",
                    title: "موفق",
                    description: "برداشت با موفقیت انجام شد",
                });
                setIsWithdrawModalOpen(false);
                setWithdrawalAmount('');
                getWalletInfo();
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "ناموفق",
                    description: "متاسفانه انجام نشد، لطفا دوباره تلاش کنید",
                });
            })
            .finally(() => {
                setWithdrawalLoading(false);
            });
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('fa-IR');
    };

    const formatDate = (date: string) => {
        const formattedDate = moment(date).locale('fa').format('YYYY/MM/DD - hh:mm:ss');
        return formattedDate.replace(/\d/g, (match) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(match)]);
    };

    const formatTransactionType = (type: String) => {
        switch (type) {
            case 'deposit':
                return 'واریز';
            case 'withdrawal':
                return 'برداشت';
            case 'transfer':
                return 'انتقال';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // حذف کاراکترهای غیر عددی
        let value = e.target.value.replace(/\D/g, "");

        // افزودن جداکننده‌ی هزارگان
        let formattedValue = Number(value).toLocaleString("fa-IR");

        setWithdrawalAmount(value ? formattedValue : "");
    };

    const statusMap = {
        pending: { label: 'در انتظار تایید', color: 'bg-yellow-100 text-yellow-800' },
        completed: { label: 'تکمیل شده', color: 'bg-green-100 text-green-800' },
        failed: { label: 'لغو شده', color: 'bg-red-100 text-red-800' }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 py-[140px]">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">کیف پول من</h1>
                    <p className="mt-2 text-gray-600">مدیریت موجودی و خدمات مالی</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <WalletIcon className="w-6 h-6" />
                                موجودی کیف پول
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative">
                            {loading ? (
                                <Skeleton className="h-10 w-48 mb-6 bg-white/20" />
                            ) : (
                                <div className="text-4xl font-bold mb-6  transition-transform duration-300">
                                    {balance.toLocaleString("fa-IR")} تومان
                                </div>
                            )}
                            <div className="gap-3">
                                {/* <Button
                                    onClick={handleDeposit}
                                    variant="secondary"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transform hover:scale-105 transition-all"
                                >
                                    <PlusIcon className="w-5 h-5 ml-2" />
                                    افزایش موجودی
                                </Button> */}
                                <Button
                                    onClick={() => setIsWithdrawModalOpen(true)}
                                    variant="secondary"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transform hover:scale-105 transition-all"
                                >
                                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    برداشت
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-300"></div>
                    </Card>

                    <Card className="bg-white border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <TrendingUpIcon className="w-5 h-5 text-purple-500" />
                                گزارش عملکرد
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600">تراکنش‌های موفق</span>
                                {loading ? (
                                    <Skeleton className="h-6 w-20" />
                                ) : (
                                    <span className="font-bold text-gray-900">
                                        {formatPrice(transactions.filter(t => t.status === 'completed').length)} مورد
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600">مجموع واریزها</span>
                                {loading ? (
                                    <Skeleton className="h-6 w-28" />
                                ) : (
                                    <span className="font-bold text-green-600">
                                        {formatPrice(transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0))} تومان
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <span className="text-gray-600">مجموع برداشت‌ها</span>
                                {loading ? (
                                    <Skeleton className="h-6 w-28" />
                                ) : (
                                    <span className="font-bold text-red-600">
                                        {formatPrice(transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0))} تومان
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-gray-100/50 p-1">
                        <TabsTrigger value="services" className="flex-1">خدمات</TabsTrigger>
                        <TabsTrigger value="history" className="flex-1">تاریخچه تراکنش‌ها</TabsTrigger>
                    </TabsList>

                    <TabsContent value="services" className="space-y-6">
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {services.map((service, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="flex flex-col items-center gap-3 h-auto py-6 hover:bg-gray-50 transition-all hover:scale-105 hover:shadow-md"
                                >
                                    <div className={`p-3 rounded-xl ${service.color} text-white transform transition-transform group-hover:scale-110`}>
                                        <service.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{service.title}</span>
                                </Button>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="bg-gray-50 rounded-xl p-6">
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <Card
                                    key={transaction._id}
                                    className="border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className={`font-bold ${transaction.type === 'deposit'
                                            ? 'text-green-600'
                                            : transaction.type === 'withdrawal'
                                                ? 'text-red-600'
                                                : 'text-yellow-600'
                                            }`}>
                                            {transaction.type === 'deposit' ? '+' : '-'} {formatPrice(transaction.amount)} تومان
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${statusMap[transaction.status].color}`}>
                                                {statusMap[transaction.status].label}
                                            </span>
                                            <div>
                                                <div className="font-medium">{formatTransactionType(transaction.reference || transaction.type)}</div>
                                                <div className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</div>
                                            </div>
                                            <div className={`p-2 rounded-xl ${transaction.type === 'deposit'
                                                ? 'bg-green-100 text-green-600'
                                                : transaction.type === 'withdrawal'
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                {transaction.type === 'deposit' ? <ArrowDownIcon className="w-5 h-5" /> : <ArrowUpIcon className="w-5 h-5" />}
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
                <DialogContent className="sm:max-w-[425px] pt-10 gap-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            برداشت از کیف پول
                        </DialogTitle>
                        {/* <DialogDescription className='flex'>
                            لطفا مبلغ مورد نظر برای برداشت را وارد کنید
                        </DialogDescription> */}
                        <DialogDescription className='flex'>
                            برای انجام شدن کامل 1 تا 24 ساعت کاری نیاز به بررسی و واریز دارد.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">موجودی فعلی</span>
                                <span className="font-medium text-gray-900">{formatPrice(balance)} تومان</span>
                            </div>
                            <Card className="border-dashed">
                                <CardContent className="pt-6">
                                    <div className="flex gap-4 items-center">
                                        <Input
                                            type="number"
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            className="text-left pr-16 text-lg w-[85%]"
                                            placeholder="0"
                                        />
                                        <span className="flex text-gray-500">
                                            تومان
                                        </span>
                                    </div>

                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <DialogFooter className='gap-2'>
                        <Button
                            variant="outline"
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600"
                            disabled={withdrawalLoading}
                        >
                            {withdrawalLoading ? (
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    در حال پردازش...
                                </div>
                            ) : (
                                'تایید و برداشت'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}