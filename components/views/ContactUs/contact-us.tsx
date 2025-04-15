"use client"
import React, { useState } from 'react';
import {
    Phone,
    Mail,
    MessageCircle,
    Clock,
    MapPin,
    Instagram,
    Twitter,
    Facebook,
    Headphones,
    ArrowRight,
    CheckCircle2,
    Globe,
    PhoneCall,
    MessagesSquare,
    Users,
    Heart
} from 'lucide-react';
import { Chat } from '@/components/ui/chat';
import { ChatButton } from '@/components/ui/chat-button';

function ContactUs() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleStartChat = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsChatOpen(true);
        }, 1000);
    };

    const stats = [
        { icon: <Users className="h-6 w-6" />, value: '+۵', label: 'کاربر فعال' },
        { icon: <PhoneCall className="h-6 w-6" />, value: '۲۴/۷', label: 'پشتیبانی' },
        { icon: <MessagesSquare className="h-6 w-6" />, value: '۹۸٪', label: 'رضایت مشتری' },
        { icon: <Heart className="h-6 w-6" />, value: '+۱۰', label: 'بازخورد مثبت' },
    ];

    const contactMethods = [
        {
            icon: <Phone className="h-6 w-6" />,
            title: 'تماس تلفنی',
            description: 'پاسخگویی در روزهای کاری از ساعت ۸ صبح تا ۸ شب',
            action: '۰۹۱۸۲۱۴۴۹۷۰',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
            link: 'tel:989182144970'
        },
        {
            icon: <Mail className="h-6 w-6" />,
            title: 'ایمیل پشتیبانی',
            description: 'پاسخگویی در کمتر از ۲۴ ساعت کاری',
            action: 'support@shahrhshar.ir',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            link: 'mailto:support@example.com'
        },
        {
            icon: <MessageCircle className="h-6 w-6" />,
            title: 'چت آنلاین',
            description: 'گفتگوی آنلاین با کارشناسان پشتیبانی',
            action: 'شروع گفتگو',
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            link: '#chat'
        }
    ];

    const socialMedia = [
        {
            icon: <Instagram className="h-5 w-5" />,
            name: 'Instagram',
            username: '@recycling_app',
            color: 'hover:text-pink-500',
            bgHover: 'hover:bg-pink-50',
            link: 'https://instagram.com/shahrshahr'
        },
        {
            icon: <MessageCircle className="h-5 w-5" />,
            name: 'Eitaa',
            username: '@recycling_app',
            color: 'hover:text-yellow-500',
            bgHover: 'hover:bg-yellow-50',
            link: 'https://eitaa.com/shahrshahr'
        },
        {
            icon: <MessageCircle className="h-5 w-5" />,
            name: 'Bale',
            username: '@recycling_app',
            color: 'hover:text-green-500',
            bgHover: 'hover:bg-green-50',
            link: 'https://ble.ir/shahrshahr'
        },
        {
            icon: <Twitter className="h-5 w-5" />,
            name: 'Twitter',
            username: '@recycling_app',
            color: 'hover:text-blue-400',
            bgHover: 'hover:bg-blue-50',
            link: 'https://twitter.com/shahrshahr'
        },
        {
            icon: <Facebook className="h-5 w-5" />,
            name: 'Facebook',
            username: 'recycling.app',
            color: 'hover:text-blue-600',
            bgHover: 'hover:bg-blue-50',
            link: 'https://facebook.com/shahrshahr'
        }
    ];

    const faqs = [
        {
            question: 'ساعات پاسخگویی تلفنی چگونه است؟',
            answer: 'همکاران ما در روزهای کاری از ساعت ۸ صبح تا ۸ شب آماده پاسخگویی به شما هستند.'
        },
        {
            question: 'چگونه درخواست خود را پیگیری کنم؟',
            answer: 'با ورود به حساب کاربری خود و مراجعه به بخش «سوابق درخواست‌ها» می‌توانید وضعیت درخواست خود را پیگیری کنید.'
        },
        {
            question: 'در صورت تأخیر در جمع‌آوری چه کنم؟',
            answer: 'در صورت تأخیر بیش از ۳۰ دقیقه، می‌توانید از طریق تماس با پشتیبانی یا چت آنلاین موضوع را پیگیری کنید.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80')] mix-blend-overlay opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                        <Headphones className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-6 text-white">تماس با پشتیبانی</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                        کارشناسان ما با افتخار آماده پاسخگویی به سؤالات شما هستند. از هر طریقی که راحت‌تر هستید با ما در تماس باشید.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500">
                                    {stat.icon}
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Methods */}
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contactMethods.map((method, index) => (
                        <a
                            key={index}
                            href={method.link}
                            onClick={index === 2 ? (e) => {
                                e.preventDefault();
                                handleStartChat();
                            } : undefined}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                        >
                            <div className="p-8">
                                <div className={`${method.bgColor} ${method.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {method.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{method.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{method.description}</p>
                                <div className="flex items-center text-orange-500 font-medium">
                                    <span>{method.action}</span>
                                    <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Map & Info Section */}
            <div className="max-w-6xl mx-auto px-4 mt-16">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="p-8 md:p-12">
                            <h2 className="text-2xl font-bold mb-6">دفتر مرکزی</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-50 text-orange-500 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">آدرس</p>
                                        <p className="text-gray-600">تهران شهر تهران-میرداماد-خیابان شمس تبریزی شمالی-خیابان یکم-پلاک -1-طبقه چهارم-واحد 15</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-50 text-orange-500 p-3 rounded-lg">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">ساعات کاری</p>
                                        <p className="text-gray-600">شنبه تا چهارشنبه - ۸ صبح تا ۸ شب</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-orange-50 text-orange-500 p-3 rounded-lg">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg">شبکه‌های اجتماعی</p>
                                        <div className="flex gap-3 mt-2">
                                            {/* {socialMedia.map((social, index) => (
                                                <a
                                                    key={index}
                                                    href="#"
                                                    className={`p-2 rounded-lg transition-all duration-300 ${social.color} ${social.bgHover}`}
                                                >
                                                    {social.icon}
                                                </a>
                                            ))} */}
                                            در حال انجام ....
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[400px] bg-gray-100">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d219.09999906728095!2d51.43135764206126!3d35.76128032815204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1744749850181!5m2!1sen!2s"
                                className="absolute inset-0 w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQs Section */}
            <div className="max-w-4xl mx-auto px-4 mt-16 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">سؤالات متداول</h2>
                    <p className="text-gray-600">پاسخ سؤالات پرتکرار شما</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex gap-4">
                                    <CheckCircle2 className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">{faq.question}</h4>
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Components */}
            <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            {!isChatOpen && (
                <ChatButton onClick={handleStartChat} isLoading={isLoading} />
            )}
        </div>
    );
}

export default ContactUs;