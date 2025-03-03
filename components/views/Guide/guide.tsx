// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Navigation } from '@/components/views/navigation';
// import { TopMenu } from '@/components/views/top-menu';
// import {
//     ArrowRight,
//     HelpCircle,
//     Info,
//     Lightbulb,
//     MapPin,
//     Package,
//     Recycle,
//     Truck,
//     ChevronDown,
//     Search,
//     CheckCircle2,
//     AlertTriangle,
//     BookOpen
// } from 'lucide-react';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// const guideItems = [
//     {
//         icon: <Recycle className="h-8 w-8" />,
//         title: 'درخواست جمع آوری',
//         description: 'برای درخواست جمع آوری، از صفحه اصلی گزینه «درخواست جمع آوری» را انتخاب کنید. سپس نوع و مقدار پسماند را مشخص کنید.',
//         color: 'text-orange-500',
//         bgColor: 'bg-orange-100',
//     },
//     {
//         icon: <MapPin className="h-8 w-8" />,
//         title: 'انتخاب آدرس',
//         description: 'آدرس محل جمع آوری را از لیست آدرس‌های ذخیره شده انتخاب کنید یا آدرس جدیدی را ثبت نمایید.',
//         color: 'text-blue-500',
//         bgColor: 'bg-blue-100',
//     },
//     {
//         icon: <Package className="h-8 w-8" />,
//         title: 'آماده‌سازی پسماند',
//         description: 'پسماندها را به صورت تفکیک شده آماده کنید. این کار به بازیافت بهتر و سریع‌تر کمک می‌کند.',
//         color: 'text-green-500',
//         bgColor: 'bg-green-100',
//     },
//     {
//         icon: <Truck className="h-8 w-8" />,
//         title: 'تحویل به مأمور',
//         description: 'در زمان مقرر، مأمور جمع‌آوری به آدرس شما مراجعه می‌کند. پسماندها را تحویل دهید و رسید دریافت کنید.',
//         color: 'text-purple-500',
//         bgColor: 'bg-purple-100',
//     },
//     {
//         icon: <Info className="h-8 w-8" />,
//         title: 'پیگیری درخواست',
//         description: 'وضعیت درخواست خود را از بخش «سوابق جمع آوری» پیگیری کنید.',
//         color: 'text-indigo-500',
//         bgColor: 'bg-indigo-100',
//     },
//     {
//         icon: <Lightbulb className="h-8 w-8" />,
//         title: 'نکات مهم',
//         description: 'پسماندهای خطرناک مانند باتری‌ها و لامپ‌ها را جداگانه نگهداری کنید. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',
//         color: 'text-amber-500',
//         bgColor: 'bg-amber-100',
//     },
// ];

// const faqs = [
//     {
//         question: 'چگونه می‌توانم از قیمت روز پسماندها مطلع شوم؟',
//         answer: 'از بخش «تعرفه قیمت‌ها» در صفحه اصلی می‌توانید قیمت روز انواع پسماند را مشاهده کنید. قیمت‌ها به صورت روزانه بروزرسانی می‌شوند و بر اساس نوع و کیفیت پسماند متغیر هستند.'
//     },
//     {
//         question: 'آیا امکان لغو درخواست وجود دارد؟',
//         answer: 'بله، تا قبل از اعزام مأمور می‌توانید از بخش «سوابق جمع آوری» درخواست خود را لغو کنید. پس از اعزام مأمور، امکان لغو وجود ندارد و ممکن است جریمه‌ای برای شما در نظر گرفته شود.'
//     },
//     {
//         question: 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟',
//         answer: 'از طریق بخش «تماس با ما» در منوی اصلی می‌توانید با پشتیبانی ارتباط برقرار کنید. همچنین می‌توانید از طریق شماره تلفن 021-12345678 در ساعات اداری با ما تماس بگیرید.'
//     },
//     {
//         question: 'چه نوع پسماندهایی قابل بازیافت هستند؟',
//         answer: 'انواع کاغذ، پلاستیک، شیشه، فلزات، پسماندهای الکترونیکی و باتری‌ها قابل بازیافت هستند. برای اطلاعات بیشتر در مورد نحوه تفکیک و آماده‌سازی هر نوع پسماند، به بخش راهنمای تفکیک پسماند مراجعه کنید.'
//     },
//     {
//         question: 'آیا برای جمع‌آوری پسماند هزینه‌ای دریافت می‌شود؟',
//         answer: 'خیر، خدمات جمع‌آوری پسماند رایگان است. علاوه بر این، بر اساس نوع و مقدار پسماند تحویلی، مبلغی به عنوان تشویق به حساب شما واریز می‌شود.'
//     },
//     {
//         question: 'حداقل مقدار پسماند برای درخواست جمع‌آوری چقدر است؟',
//         answer: 'حداقل مقدار پسماند برای درخواست جمع‌آوری 3 کیلوگرم است. برای مقادیر کمتر، می‌توانید از ایستگاه‌های بازیافت ثابت در سطح شهر استفاده کنید.'
//     }
// ];

// const tips = [
//     {
//         title: 'تفکیک صحیح پسماندها',
//         description: 'پسماندها را به دسته‌های کاغذ، پلاستیک، شیشه و فلز تفکیک کنید. این کار به بازیافت بهتر و سریع‌تر کمک می‌کند.',
//         icon: <CheckCircle2 className="h-6 w-6" />,
//         color: 'text-green-500',
//         bgColor: 'bg-green-100',
//     },
//     {
//         title: 'شستشوی ظروف',
//         description: 'ظروف پلاستیکی و شیشه‌ای را قبل از تحویل بشویید تا از آلودگی و بوی نامطبوع جلوگیری شود.',
//         icon: <CheckCircle2 className="h-6 w-6" />,
//         color: 'text-blue-500',
//         bgColor: 'bg-blue-100',
//     },
//     {
//         title: 'پسماندهای خطرناک',
//         description: 'باتری‌ها، لامپ‌های کم مصرف و پسماندهای الکترونیکی را جداگانه نگهداری کنید و به مأمور جمع‌آوری اطلاع دهید.',
//         icon: <AlertTriangle className="h-6 w-6" />,
//         color: 'text-red-500',
//         bgColor: 'bg-red-100',
//     },
// ];

// const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//         opacity: 1,
//         transition: {
//             staggerChildren: 0.1
//         }
//     }
// };

// const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//         y: 0,
//         opacity: 1,
//         transition: {
//             type: "spring",
//             stiffness: 100
//         }
//     }
// };

// export default function GuidePage() {
//     const [searchTerm, setSearchTerm] = useState('');

//     const filteredGuideItems = guideItems.filter(item =>
//         item.title.includes(searchTerm) ||
//         item.description.includes(searchTerm)
//     );

//     const filteredFaqs = faqs.filter(faq =>
//         faq.question.includes(searchTerm) ||
//         faq.answer.includes(searchTerm)
//     );

//     return (
//         <div className="min-h-screen bg-background">
//             <TopMenu />

//             <div className="bg-gradient-to-r from-[hsl(25,84%,48%)] to-[hsl(25,84%,58%)] p-8 text-white text-center mt-16 relative overflow-hidden">
//                 {/* Decorative elements */}
//                 <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-white opacity-10"></div>
//                 <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full bg-white opacity-10"></div>

//                 <motion.div
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5 }}
//                     className="relative z-10"
//                 >
//                     <HelpCircle className="h-16 w-16 mx-auto mb-4" />
//                     <h1 className="text-3xl font-bold mb-3">راهنمای استفاده از اپلیکیشن</h1>
//                     <p className="max-w-2xl mx-auto text-lg">
//                         در این صفحه با نحوه استفاده از اپلیکیشن و مراحل درخواست جمع‌آوری پسماند آشنا می‌شوید.
//                     </p>

//                     <div className="max-w-md mx-auto mt-6 relative">
//                         <Input
//                             type="text"
//                             placeholder="جستجو در راهنما..."
//                             className="pr-10 py-6 rounded-full border-none shadow-lg text-right"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                     </div>
//                 </motion.div>
//             </div>

//             <ScrollArea className="h-[calc(100vh-12rem)] mb-16">
//                 <div className="p-6 max-w-5xl mx-auto">
//                     <Tabs defaultValue="guide" className="mb-8">
//                         <TabsList className="grid w-full grid-cols-3 mb-6">
//                             <TabsTrigger value="guide" className="flex items-center gap-2">
//                                 <BookOpen className="h-4 w-4" />
//                                 <span>راهنمای استفاده</span>
//                             </TabsTrigger>
//                             <TabsTrigger value="tips" className="flex items-center gap-2">
//                                 <Lightbulb className="h-4 w-4" />
//                                 <span>نکات مفید</span>
//                             </TabsTrigger>
//                             <TabsTrigger value="faq" className="flex items-center gap-2">
//                                 <HelpCircle className="h-4 w-4" />
//                                 <span>سوالات متداول</span>
//                             </TabsTrigger>
//                         </TabsList>

//                         <TabsContent value="guide">
//                             <motion.div
//                                 className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
//                                 variants={containerVariants}
//                                 initial="hidden"
//                                 animate="visible"
//                             >
//                                 {filteredGuideItems.map((item, index) => (
//                                     <motion.div key={index} variants={itemVariants}>
//                                         <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
//                                             <CardHeader className="pb-2 relative">
//                                                 <div className="flex items-center justify-end gap-3">
//                                                     <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
//                                                     <div className={`p-3 rounded-xl ${item.bgColor} ${item.color}`}>
//                                                         {item.icon}
//                                                     </div>
//                                                 </div>
//                                                 {/* <div className="absolute bottom-0 left-0 h-1 w-16 bg-gradient-to-r from-[hsl(25,84%,48%)] to-[hsl(25,84%,58%)] rounded-full"></div> */}
//                                             </CardHeader>
//                                             <CardContent>
//                                                 <p className="text-muted-foreground text-right">{item.description}</p>
//                                             </CardContent>
//                                         </Card>
//                                     </motion.div>
//                                 ))}
//                             </motion.div>

//                             <div className="text-center mb-6">
//                                 <Link href="/new-request" className="inline-flex items-center text-[hsl(25,84%,48%)] hover:underline">
//                                     <span>شروع درخواست جمع آوری</span>
//                                     <ArrowRight className="h-4 w-4 mr-1" />
//                                 </Link>
//                             </div>
//                         </TabsContent>

//                         <TabsContent value="tips">
//                             <motion.div
//                                 className="space-y-4"
//                                 variants={containerVariants}
//                                 initial="hidden"
//                                 animate="visible"
//                             >
//                                 {tips.map((tip, index) => (
//                                     <motion.div key={index} variants={itemVariants}>
//                                         <Card className="border-none shadow-md overflow-hidden">
//                                             <CardContent className="flex p-6 items-center justify-end">
//                                                 <div className="flex items-start gap-4">
//                                                     <div>
//                                                         <h3 className="font-medium text-lg mb-2 text-right">{tip.title}</h3>
//                                                         <p className="text-muted-foreground text-right">{tip.description}</p>
//                                                     </div>
//                                                     <div className={`p-3 rounded-xl ${tip.bgColor} ${tip.color} flex-shrink-0`}>
//                                                         {tip.icon}
//                                                     </div>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     </motion.div>
//                                 ))}

//                                 <motion.div variants={itemVariants}>
//                                     <Card className="border-none shadow-md bg-gradient-to-r from-[hsl(25,84%,48%)] to-[hsl(25,84%,58%)] text-white">
//                                         <CardContent className="flex p-6 items-center justify-end">
//                                             <div className="flex items-center gap-4">
//                                                 <div>
//                                                     <h3 className="font-medium text-lg mb-2 text-right">نیاز به راهنمایی بیشتر دارید؟</h3>
//                                                     <p className="text-white/90 text-right">با پشتیبانی ما تماس بگیرید. کارشناسان ما آماده پاسخگویی به سوالات شما هستند.</p>
//                                                 </div>
//                                                 <div className="p-3 rounded-xl bg-white/20 flex-shrink-0">
//                                                     <Info className="h-6 w-6" />
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </motion.div>
//                             </motion.div>
//                         </TabsContent>

//                         <TabsContent value="faq">
//                             <Accordion type="single" collapsible className="w-full">
//                                 {filteredFaqs.map((faq, index) => (
//                                     <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 gap-4">
//                                         <AccordionTrigger className="text-right hover:text-[hsl(25,84%,48%)] py-4 flex gap-4 justify-end">
//                                             <div className="flex items-center gap-2">
//                                                 <span>{faq.question}</span>
//                                                 {/* <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" /> */}
//                                             </div>
//                                         </AccordionTrigger>
//                                         <AccordionContent className="text-right text-muted-foreground pr-7">
//                                             {faq.answer}
//                                         </AccordionContent>
//                                     </AccordionItem>
//                                 ))}
//                             </Accordion>
//                         </TabsContent>
//                     </Tabs>

//                     <div className="text-center mb-6">
//                         <Link href="/" className="inline-flex items-center text-[hsl(25,84%,48%)] hover:underline">
//                             <span>بازگشت به صفحه اصلی</span>
//                             <ArrowRight className="h-4 w-4 mr-1" />
//                         </Link>
//                     </div>
//                 </div>
//             </ScrollArea>
//             <Navigation />
//         </div>
//     );
// }
"use client"
import React, { useState } from 'react';
import { ArrowRight, HelpCircle, Info, Lightbulb, MapPin, Package, Recycle, Truck, Search, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

// Roadmap steps for the request process
const roadmapSteps = [
    {
        id: 1,
        title: 'درخواست جمع آوری',
        icon: <Recycle className="h-5 w-5 sm:h-6 sm:w-6" />,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
    },
    {
        id: 2,
        title: 'انتخاب آدرس',
        icon: <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
    },
    {
        id: 3,
        title: 'آماده‌سازی پسماند',
        icon: <Package className="h-5 w-5 sm:h-6 sm:w-6" />,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
    },
    {
        id: 4,
        title: 'تحویل به مأمور',
        icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100',
    },
    {
        id: 5,
        title: 'پیگیری درخواست',
        icon: <Info className="h-5 w-5 sm:h-6 sm:w-6" />,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-100',
    }
];

function App() {
    const [activeStep, setActiveStep] = useState(1);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 py-[110px]">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white">
                    <h1 className="text-xl sm:text-2xl font-bold text-center">راهنمای درخواست جمع‌آوری پسماند</h1>
                    <p className="text-center mt-2 opacity-90 text-sm sm:text-base">مسیر درخواست جمع‌آوری پسماند را به صورت گام به گام دنبال کنید</p>
                </div>

                {/* Interactive Roadmap */}
                <div className="p-4 sm:p-6">
                    <div className="relative mb-8 sm:mb-12">
                        {/* Progress Bar - Modified to fill from right to left */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                        <div
                            className="absolute top-1/2 right-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${(activeStep - 1) * 25}%` }}
                        ></div>

                        {/* Steps */}
                        <div className="flex justify-between relative">
                            {roadmapSteps.map((step) => (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center cursor-pointer gap-4 md:gap-0 md:mt-[38px] max-w-[100px]"
                                    onClick={() => setActiveStep(step.id)}
                                >
                                    <div
                                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${step.id <= activeStep ? step.bgColor : 'bg-gray-200'
                                            } ${step.id <= activeStep ? step.color : 'text-gray-400'
                                            } ${step.id === activeStep ? 'ring-2 sm:ring-4 ring-orange-200' : ''
                                            }`}
                                    >
                                        {step.icon}
                                    </div>
                                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center max-w-[60px] sm:max-w-none ${step.id <= activeStep ? 'text-gray-800' : 'text-gray-400'
                                        }`}>
                                        {step.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Details */}
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 sm:p-3 rounded-xl ${roadmapSteps[activeStep - 1].bgColor} ${roadmapSteps[activeStep - 1].color}`}>
                                {roadmapSteps[activeStep - 1].icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold">{roadmapSteps[activeStep - 1].title}</h3>
                        </div>

                        {activeStep === 1 && (
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p>برای درخواست جمع آوری، از صفحه اصلی گزینه «درخواست جمع آوری» را انتخاب کنید. سپس نوع و مقدار پسماند را مشخص کنید.</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>انواع پسماند را از لیست انتخاب کنید</li>
                                    <li>وزن تقریبی هر نوع پسماند را وارد کنید</li>
                                    <li>تصویری از پسماند آماده شده آپلود کنید (اختیاری)</li>
                                </ul>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p>آدرس محل جمع آوری را از لیست آدرس‌های ذخیره شده انتخاب کنید یا آدرس جدیدی را ثبت نمایید.</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>آدرس دقیق و کامل را وارد کنید</li>
                                    <li>شماره تماس معتبر برای هماهنگی را وارد کنید</li>
                                    <li>توضیحات تکمیلی برای راهنمایی مأمور را اضافه کنید</li>
                                </ul>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p>پسماندها را به صورت تفکیک شده آماده کنید. این کار به بازیافت بهتر و سریع‌تر کمک می‌کند.</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>پسماندها را بر اساس نوع (کاغذ، پلاستیک، شیشه و فلز) تفکیک کنید</li>
                                    <li>ظروف را شسته و خشک کنید</li>
                                    <li>پسماندها را در کیسه‌های جداگانه قرار دهید</li>
                                </ul>
                            </div>
                        )}

                        {activeStep === 4 && (
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p>در زمان مقرر، مأمور جمع‌آوری به آدرس شما مراجعه می‌کند. پسماندها را تحویل دهید و رسید دریافت کنید.</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>هویت مأمور را از طریق کد اختصاصی در اپلیکیشن تأیید کنید</li>
                                    <li>پسماندها را به مأمور تحویل دهید</li>
                                    <li>رسید الکترونیکی را در اپلیکیشن مشاهده و تأیید کنید</li>
                                </ul>
                            </div>
                        )}

                        {activeStep === 5 && (
                            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                <p>وضعیت درخواست خود را از بخش «سوابق جمع آوری» پیگیری کنید.</p>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    <li>وضعیت پردازش پسماندها را مشاهده کنید</li>
                                    <li>امتیاز و پاداش دریافتی را بررسی کنید</li>
                                    <li>گزارش تأثیر زیست‌محیطی فعالیت خود را مشاهده کنید</li>
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setActiveStep(prev => Math.min(prev + 1, 5))}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-orange-500 text-white flex items-center gap-2 text-sm sm:text-base ${activeStep === 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`}
                                disabled={activeStep === 5}
                            >
                                <span>مرحله بعد</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-gray-700 flex items-center gap-2 text-sm sm:text-base ${activeStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                disabled={activeStep === 1}
                            >
                                <span>مرحله قبل</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="p-4 sm:p-6 bg-orange-50 border-t border-orange-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                        <h3 className="font-medium text-sm sm:text-base">نکته مهم</h3>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">
                        برای دریافت راهنمایی بیشتر، می‌توانید با پشتیبانی ما از طریق گزینه «تماس با ما» در منوی اصلی تماس بگیرید.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;