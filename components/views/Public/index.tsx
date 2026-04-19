"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { motion } from "framer-motion";
import {
    Presentation,
    Maximize2,
    ChevronRight,
    ChevronLeft,
    FileText,
    Layers,
    BarChart2,
    PieChart,
    Workflow,
    Building2,
    Cpu,
    Telescope,
    CheckCircle,
    Map,
    Users,
    Database,
    Shield,
    LineChart,
    Recycle,
    Smartphone,
    Globe,
    TrendingUp,
    Target,
    Award,
    Rocket,
    Heart,
    Zap,
    ArrowDown,
    Clock,
    DollarSign,
    Leaf,
    Star,
    Settings,
    Activity,
    MapPin,
    CreditCard,
    TreePine,
    Cctv,
    Bot,
    Coins,
    ChevronUp,
    Phone,
    Mail,
    ExternalLink,
    Handshake,
    BarChart3,
    Gauge,
    Network,
    Microscope,
    Briefcase,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart as LC,
    Line,
    PieChart as PC,
    Pie,
    Cell,
    Area,
    AreaChart,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────

const SLIDE_TITLES = [
    "کاور معرفی",
    "خلاصه اجرایی",
    "چشم‌انداز و فلسفه",
    "ساختار سامانه",
    "مدل قرارداد",
    "تحلیل فنی",
    "جریان کاری",
    "برنامه‌های آینده",
    "گزارش‌گیری",
    "موردکاوی نهاوند",
    "شاخص‌های کلیدی",
    "ارزش پیشنهادی",
    "معماری فنی",
    "نقشه راه",
    "جمع‌بندی",
];

const CHART_COLORS = {
    violet: "#8B5CF6",
    indigo: "#6366F1",
    cyan: "#06B6D4",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#F43F5E",
    sky: "#0EA5E9",
    fuchsia: "#D946EF",
};

const PIE_COLORS = [
    CHART_COLORS.violet,
    CHART_COLORS.cyan,
    CHART_COLORS.emerald,
    CHART_COLORS.amber,
];

// نمونه داده‌های نمودارها
const wasteBarData = [
    { name: "شهریور", قبل: 1200, بعد: 900 },
    { name: "مهر", قبل: 1150, بعد: 800 },
    { name: "آبان", قبل: 1100, بعد: 750 },
    { name: "آذر", قبل: 1050, بعد: 680 },
];

const participationData = [
    { ماه: "فروردین", درخواست: 120, بازیافت: 40 },
    { ماه: "اردیبهشت", درخواست: 280, بازیافت: 110 },
    { ماه: "خرداد", درخواست: 450, بازیافت: 200 },
    { ماه: "تیر", درخواست: 620, بازیافت: 310 },
    { ماه: "مرداد", درخواست: 800, بازیافت: 420 },
];

const wasteTypeData = [
    { name: "پسماند خشک", value: 40 },
    { name: "پسماند تر", value: 35 },
    { name: "پسماند بازیافتی", value: 15 },
    { name: "پسماند ویژه", value: 10 },
];

const costSavingsData = [
    { ماه: "فاز ۱", هزینه: 100 },
    { ماه: "فاز ۲", هزینه: 85 },
    { ماه: "فاز ۳", هزینه: 70 },
    { ماه: "فاز ۴", هزینه: 55 },
];

const kpiGaugeData = [
    { label: "کاهش هزینه", value: 85, max: 100 },
    { label: "افزایش بازیافت", value: 72, max: 100 },
    { label: "رضایت شهروندان", value: 90, max: 100 },
];

const roadmapPhases = [
    {
        phase: "فاز ۱",
        title: "پایلوت و آزمایشی",
        duration: "۳ ماه",
        items: ["نهاوند", "اپلیکیشن پایه", "یک شهر آزمایشی"],
        status: "complete",
        color: CHART_COLORS.emerald,
    },
    {
        phase: "فاز ۲",
        title: "توسعه شهری",
        duration: "۶ ماه",
        items: ["۵ شهر هدف", "ماژول پیشرفته", "داشبورد هوشمند"],
        status: "active",
        color: CHART_COLORS.violet,
    },
    {
        phase: "فاز ۳",
        title: "گسترش ملی",
        duration: "۱۲ ماه",
        items: ["۲۰ شهر", "یکپارچگی ملی", "AI و IoT"],
        status: "pending",
        color: CHART_COLORS.cyan,
    },
    {
        phase: "فاز ۴",
        title: "پایداری کامل",
        duration: "۱۸ ماه",
        items: ["همه شهرها", "اقتصاد چرخشی", "صدور تجربه"],
        status: "pending",
        color: CHART_COLORS.amber,
    },
];

// داده‌های رادار چارت برای تحلیل فنی
const techRadarData = [
    { subject: "امنیت", A: 85, fullMark: 100 },
    { subject: "مقیاس‌پذیری", A: 90, fullMark: 100 },
    { subject: "کاربرپذیری", A: 88, fullMark: 100 },
    { subject: "سرعت پاسخ", A: 85, fullMark: 100 },
    { subject: "یکپارچگی", A: 92, fullMark: 100 },
    { subject: "هوشمندی", A: 80, fullMark: 100 },
];

// داده‌های رضایت پیمانکاران
const contractorData = [
    { name: "پیمانکار الف", سهم: 35, رضایت: 4.8 },
    { name: "پیمانکار ب", سهم: 28, رضایت: 4.6 },
    { name: "پیمانکار ج", سهم: 22, رضایت: 4.5 },
    { name: "پیمانکار د", سهم: 15, رضایت: 4.7 },
];

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────

function GlowOrb({
    className = "",
    color = "violet",
}: {
    className?: string;
    color?: string;
}) {
    const colors: Record<string, string> = {
        violet: "bg-violet-500/20",
        indigo: "bg-indigo-500/20",
        cyan: "bg-cyan-500/20",
        emerald: "bg-emerald-500/20",
    };
    return (
        <div
            className={`absolute rounded-full blur-3xl ${colors[color]} ${className}`}
        />
    );
}

function SlideWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full !h-full min-h-[85vh] bg-[#13151F] border border-white/[0.07] rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/40 backdrop-blur-xl relative overflow-hidden"
        >
            {children}
        </motion.div>
    );
}

function SlideHeader({
    icon,
    title,
    subtitle,
    iconColor = "violet",
}: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    iconColor?: string;
}) {
    const iconColors: Record<string, string> = {
        violet: "text-violet-400 bg-violet-500/15",
        indigo: "text-indigo-400 bg-indigo-500/15",
        cyan: "text-cyan-400 bg-cyan-500/15",
        emerald: "text-emerald-400 bg-emerald-500/15",
        amber: "text-amber-400 bg-amber-500/15",
        rose: "text-rose-400 bg-rose-500/15",
        sky: "text-sky-400 bg-sky-500/15",
        fuchsia: "text-fuchsia-400 bg-fuchsia-500/15",
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-2xl ${iconColors[iconColor]}`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
                    {subtitle && (
                        <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
            <div className="h-px bg-gradient-to-r from-violet-500/50 via-transparent to-transparent" />
        </div>
    );
}

function BulletItem({ icon, text }: { icon?: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <div className="mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
            </div>
            {icon && <div className="text-violet-400 mt-0.5">{icon}</div>}
            <span className="text-gray-300 leading-relaxed text-sm md:text-base">
                {text}
            </span>
        </div>
    );
}

function StatCard({
    value,
    label,
    icon,
    trend,
    color = "violet",
}: {
    value: string;
    label: string;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
}) {
    const colors: Record<string, string> = {
        violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
        indigo: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
        cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
        emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
        amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
    };

    const iconColors: Record<string, string> = {
        violet: "text-violet-400",
        indigo: "text-indigo-400",
        cyan: "text-cyan-400",
        emerald: "text-emerald-400",
        amber: "text-amber-400",
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 backdrop-blur-sm hover:shadow-lg hover:shadow-${color === "violet" ? "violet" : color}-500/10 transition-all duration-300`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-white/5 ${iconColors[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
        </motion.div>
    );
}

function Card({
    children,
    className = "",
    hover = true,
}: {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}) {
    return (
        <div
            className={`bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5 ${hover ? "hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300" : ""
                } ${className}`}
        >
            {children}
        </div>
    );
}

function FlowNode({
    title,
    subtitle,
    icon: Icon,
    color = "violet",
}: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: string;
}) {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        violet: { bg: "from-violet-500/15 to-violet-600/5", border: "border-violet-500/30", text: "text-violet-400" },
        cyan: { bg: "from-cyan-500/15 to-cyan-600/5", border: "border-cyan-500/30", text: "text-cyan-400" },
        emerald: { bg: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/30", text: "text-emerald-400" },
        amber: { bg: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/30", text: "text-amber-400" },
        indigo: { bg: "from-indigo-500/15 to-indigo-600/5", border: "border-indigo-500/30", text: "text-indigo-400" },
        rose: { bg: "from-rose-500/15 to-rose-600/5", border: "border-rose-500/30", text: "text-rose-400" },
    };

    const c = colorMap[color];

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 w-full max-w-sm text-center backdrop-blur-sm shadow-lg`}
        >
            {Icon && <div className={`${c.text} mb-3 flex justify-center`}>{Icon}</div>}
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </motion.div>
    );
}

function ArrowConnector({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center py-3">
            <div className="w-0.5 h-10 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
            </div>
            {label && (
                <span className="text-xs text-gray-500 mt-2 bg-white/5 px-3 py-1 rounded-full">
                    {label}
                </span>
            )}
        </div>
    );
}

function GridArrow({ from, to }: { from: string; to: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-500">
            <span className="text-sm">{from}</span>
            <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
                <path d="M0 8H22M22 8L16 2M22 8L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">{to}</span>
        </div>
    );
}

function ProgressBar({
    value,
    max = 100,
    color = "violet",
    label,
}: {
    value: number;
    max?: number;
    color?: string;
    label?: string;
}) {
    const colorMap: Record<string, string> = {
        violet: "from-violet-600 to-violet-400",
        emerald: "from-emerald-600 to-emerald-400",
        cyan: "from-cyan-600 to-cyan-400",
        amber: "from-amber-600 to-amber-400",
    };

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-bold">{value}%</span>
                </div>
            )}
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

function Tag({ text, color = "violet" }: { text: string; color?: string }) {
    const colorMap: Record<string, string> = {
        violet: "bg-violet-500/15 text-violet-300 border-violet-500/20",
        emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
        cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
        amber: "bg-amber-500/15 text-amber-300 border-amber-500/20",
        rose: "bg-rose-500/15 text-rose-300 border-rose-500/20",
        indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
    };

    return (
        <span className={`text-xs px-3 py-1.5 rounded-full border ${colorMap[color]}`}>
            {text}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────────────────────

function BarChartSlide({
    data,
    title,
}: {
    data: { name: string; قبل: number; بعد: number }[];
    title: string;
}) {
    return (
        <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
            <h4 className="text-gray-300 font-semibold mb-4 text-sm">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1A1D2E",
                            border: "1px solid #ffffff15",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                    />
                    <Bar dataKey="قبل" fill={CHART_COLORS.rose} radius={[6, 6, 0, 0]} name="قبل از سامانه" />
                    <Bar dataKey="بعد" fill={CHART_COLORS.emerald} radius={[6, 6, 0, 0]} name="بعد از سامانه" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function LineChartSlide({
    data,
    title,
    keys,
}: {
    data: { [key: string]: string | number }[];
    title: string;
    keys: { key: string; color: string; name: string }[];
}) {
    return (
        <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
            <h4 className="text-gray-300 font-semibold mb-4 text-sm">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <LC data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey={Object.keys(data[0] || {})[0]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1A1D2E",
                            border: "1px solid #ffffff15",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                    />
                    {keys.map((k) => (
                        <Line
                            key={k.key}
                            type="monotone"
                            dataKey={k.key}
                            stroke={k.color}
                            strokeWidth={3}
                            dot={{ fill: k.color, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LC>
            </ResponsiveContainer>
        </div>
    );
}

function PieChartSlide({
    data,
    title,
}: {
    data: { name: string; value: number }[];
    title: string;
}) {
    return (
        <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5 ">
            <h4 className="text-gray-300 font-semibold mb-4 text-sm">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <PC>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#6B7280" }}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1A1D2E",
                            border: "1px solid #ffffff15",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                        formatter={(value: number) => [`${value}%`, "سهم"]}
                    />
                </PC>
            </ResponsiveContainer>
        </div>
    );
}

function AreaChartSlide({
    data,
    title,
    dataKey,
}: {
    data: { [key: string]: string | number }[];
    title: string;
    dataKey: string;
}) {
    return (
        <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
            <h4 className="text-gray-300 font-semibold mb-4 text-sm">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.violet} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey={Object.keys(data[0] || {})[0]} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1A1D2E",
                            border: "1px solid #ffffff15",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={CHART_COLORS.violet}
                        strokeWidth={2}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function RadarChartSlide({
    data,
    title,
}: {
    data: { subject: string; A: number; fullMark: number }[];
    title: string;
}) {
    return (
        <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5 ">
            <h4 className="text-gray-300 font-semibold mb-4 text-sm">{title}</h4>
            <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#ffffff15" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 9 }} />
                    <Radar
                        name="امتیاز سامانه"
                        dataKey="A"
                        stroke={CHART_COLORS.violet}
                        fill={CHART_COLORS.violet}
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1A1D2E",
                            border: "1px solid #ffffff15",
                            borderRadius: 12,
                            color: "#fff",
                        }}
                    />
                    <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 01: COVER
// ─────────────────────────────────────────────────────────────

function Slide01Cover() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center">
            <GlowOrb className="w-96 h-96 -top-20 -right-20" color="violet" />
            <GlowOrb className="w-64 h-64 bottom-10 -left-10" color="cyan" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-8">
                    <Globe className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-300 text-sm font-medium">
                        سامانه ملی هوشمند مدیریت پسماند شهری
                    </span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black mb-4">
                    <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                        شهر شهر
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 mb-2 font-light">
                    مدل ملی مدیریت هوشمند پسماند شهری
                </p>
                <p className="text-gray-500 text-base mb-12">
                    از نهاوند تا سراسر کشور — تحولی دیجیتال در خدمات شهری
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                        <Smartphone className="w-5 h-5 text-violet-400" />
                        <span className="text-sm text-gray-300">اپلیکیشن شهروندان</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                        <Settings className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-gray-300">اپ پیمانکاران</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm text-gray-300">پنل شهرداری</span>
                    </div>
                </div>

                <div className="mt-16 flex items-center justify-center gap-8">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">۱۵</div>
                        <div className="text-xs text-gray-500">اسلاید</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    {/* <div className="text-center">
                        <div className="text-3xl font-bold text-white">۳</div>
                        <div className="text-xs text-gray-500">ذینفع</div>
                    </div> */}
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">۱۵٪</div>
                        <div className="text-xs text-gray-500">کاهش هزینه</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">۱۰٪</div>
                        <div className="text-xs text-gray-500">افزایش بازیافت</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 02: EXECUTIVE SUMMARY
// ─────────────────────────────────────────────────────────────

function Slide02Executive() {
    const features = [
        {
            icon: <Smartphone className="w-5 h-5" />,
            title: "اپ شهروندان",
            desc: "ثبت درخواست، پیگیری، کیف‌پول دیجیتال، امتیازدهی",
            color: "violet",
        },
        {
            icon: <Settings className="w-5 h-5" />,
            title: "اپ پیمانکاران",
            desc: "مدیریت مأموریت، GPS، گزارش عملکرد، پاداش",
            color: "cyan",
        },
        {
            icon: <Building2 className="w-5 h-5" />,
            title: "پنل شهرداری",
            desc: "داشبورد تحلیلی، نظارت، گزارش‌گیری، مدیریت قراردادها",
            color: "emerald",
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<FileText className="w-6 h-6" />}
                title="خلاصه اجرایی"
                subtitle="یک نگاه کلی به پروژه شهر شهر"
                iconColor="violet"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div className={`inline-flex p-3 rounded-xl mb-4 bg-${f.color}-500/10`}>
                            <div className={`text-${f.color}-400`}>{f.icon}</div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    value="۳ لایه"
                    label="سامانه یکپارچه"
                    icon={<Layers className="w-5 h-5" />}
                    color="violet"
                />
                <StatCard
                    value="۱۵٪"
                    label="کاهش هزینه"
                    icon={<TrendingUp className="w-5 h-5" />}
                    trend="↑ هدف"
                    color="emerald"
                />
                <StatCard
                    value="۱۰٪"
                    label="افزایش بازیافت"
                    icon={<Recycle className="w-5 h-5" />}
                    trend="↑ هدف"
                    color="cyan"
                />
                <StatCard
                    value="۴.۵/۵"
                    label="رضایت شهروندان"
                    icon={<Star className="w-5 h-5" />}
                    trend="↑ هدف"
                    color="amber"
                />
            </div>

            <div className="mt-8 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20 rounded-2xl p-6">
                <p className="text-gray-300 text-base leading-relaxed">
                    <strong className="text-violet-300">هدف اصلی:</strong> ایجاد نظامی ملی و
                    دیجیتال برای مدیریت پسماند شهری که هزینه‌ها را کاهش دهد، کیفیت خدمات
                    را افزایش دهد و شهرها را به‌سوی پایداری محیط‌زیستی سوق دهد. این سامانه
                    با رویکردی قابل‌انطباق برای تمام شهرها — از کوچک تا کلان‌شهر — طراحی
                    شده است.
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 03: VISION
// ─────────────────────────────────────────────────────────────

function Slide03Vision() {
    const visions = [
        {
            icon: <Database className="w-6 h-6" />,
            title: "داده‌محور",
            desc: "تبدیل مدیریت پسماند سنتی به مدیریت داده‌محور و تعاملی با قابلیت تحلیل بلادرنگ",
            color: "violet",
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "مشارکت مردمی",
            desc: "افزایش رضایت مردمی و سهم بازیافت واقعی از طریق تعامل مستقیم شهروندان با سامانه",
            color: "cyan",
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "زیرساخت ملی",
            desc: "فراهم‌سازی زیرساخت نرم‌افزاری مشترک برای همه‌ی شهرها با مدل قرارداد منعطف",
            color: "emerald",
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "شفافیت",
            desc: "ایجاد شفافیت مالی و عملیاتی میان شهرداری‌ها و پیمانکاران با گزارش‌های شفاف",
            color: "amber",
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Telescope className="w-6 h-6" />}
                title="چشم‌انداز و فلسفه طراحی"
                subtitle="آینده‌ای روشن‌تر برای مدیریت شهری"
                iconColor="indigo"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visions.map((v, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.5 }}
                        className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-6 flex gap-5 hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color === "violet"
                                ? "from-violet-500/20 to-violet-600/5"
                                : v.color === "cyan"
                                    ? "from-cyan-500/20 to-cyan-600/5"
                                    : v.color === "emerald"
                                        ? "from-emerald-500/20 to-emerald-600/5"
                                        : "from-amber-500/20 to-amber-600/5"
                                } flex items-center justify-center flex-shrink-0`}
                        >
                            <div
                                className={
                                    v.color === "violet"
                                        ? "text-violet-400"
                                        : v.color === "cyan"
                                            ? "text-cyan-400"
                                            : v.color === "emerald"
                                                ? "text-emerald-400"
                                                : "text-amber-400"
                                }
                            >
                                {v.icon}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl">
                <div className="flex items-start gap-4">
                    <Target className="w-8 h-8 text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            فلسفه اصلی طراحی
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            سامانه «شهر شهر» بر پایه سه اصل بنیادین ساخته شده است:{' '}
                            <span className="text-violet-300 font-medium">
                                فناوری‌محوری
                            </span>{' '}
                            (استفاده از جدیدترین فناوری‌های روز)،{' '}
                            <span className="text-cyan-300 font-medium">کاربرمحوری</span>{' '}
                            (طراحی با تمرکز بر تجربه کاربری ساده) و{' '}
                            <span className="text-emerald-300 font-medium">
                                پایداری‌محوری
                            </span>{' '}
                            (توجه به محیط‌زیست و توسعه پایدار شهری).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 04: SYSTEM STRUCTURE
// ─────────────────────────────────────────────────────────────

function Slide04Structure() {
    const layers = [
        {
            layer: "لایه ۱",
            title: "اپلیکیشن شهروندان",
            icon: <Smartphone className="w-8 h-8" />,
            color: "violet",
            items: [
                "ثبت سه‌مرحله‌ای درخواست جمع‌آوری",
                "نمایش وضعیت: ارسال، در حال جمع‌آوری، تکمیل‌شده",
                "کیف پول شهری و پرداخت آنلاین",
                "سیستم امتیازدهی و تخفیفات",
                "راهنمای استفاده و مرکز تماس",
            ],
        },
        {
            layer: "لایه ۲",
            title: "اپ پیمانکاران",
            icon: <Settings className="w-8 h-8" />,
            color: "cyan",
            items: [
                "دریافت و مدیریت درخواست‌ها",
                "تأیید، لغو یا ثبت عملیات",
                "ثبت تصویر و وزن پسماند",
                "سیستم پاداش مبتنی بر عملکرد",
                "ردیابی خودکار مسیر با GPS",
            ],
        },
        {
            layer: "لایه ۳",
            title: "پنل مدیریت شهری",
            icon: <Building2 className="w-8 h-8" />,
            color: "emerald",
            items: [
                "گزارش‌گیری تحلیلی از آمار جمع‌آوری",
                "نظارت بر پیمانکاران بلادرنگ",
                "تعریف مناطق، تعرفه‌ها، شیفت‌ها",
                "گزارش‌های مقایسه‌ای شهری و دوره‌ای",
                "مدیریت شکایات و بازخورد مردمی",
            ],
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Layers className="w-6 h-6" />}
                title="ساختار سامانه"
                subtitle="سه لایه یکپارچه برای مدیریت هوشمند"
                iconColor="cyan"
            />

            <div className="space-y-5">
                {layers.map((layer, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className={`bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-6 hover:border-${layer.color}-500/30 transition-all duration-300`}
                    >
                        <div className="flex items-start gap-5">
                            <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${layer.color === "violet"
                                    ? "from-violet-500/20 to-violet-600/5"
                                    : layer.color === "cyan"
                                        ? "from-cyan-500/20 to-cyan-600/5"
                                        : "from-emerald-500/20 to-emerald-600/5"
                                    } flex items-center justify-center flex-shrink-0`}
                            >
                                <div
                                    className={
                                        layer.color === "violet"
                                            ? "text-violet-400"
                                            : layer.color === "cyan"
                                                ? "text-cyan-400"
                                                : "text-emerald-400"
                                    }
                                >
                                    {layer.icon}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                                        {layer.layer}
                                    </span>
                                    <h3 className="text-xl font-bold text-white">{layer.title}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {layer.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-violet-400" />
                                            <span className="text-gray-300 text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 05: CONTRACT MODEL
// ─────────────────────────────────────────────────────────────

function Slide05Contract() {
    const models = [
        {
            title: "پیمانکاری مستقیم",
            desc: "درآمد مشترک بین شهرداری و مجری طرح با تقسیم منافع",
            icon: <Handshake className="w-6 h-6" />,
            color: "violet",
            features: ["همکاری مستقیم", "تقسیم درآمد", "شفافیت کامل"],
        },
        {
            title: "سرویس اشتراکی",
            desc: "مدل SaaS با پرداخت ماهیانه بر اساس مصرف و تعداد کاربران",
            icon: <Globe className="w-6 h-6" />,
            color: "cyan",
            features: ["هزینه جاری", "مقیاس‌پذیر", "بدون سرمایه اولیه"],
        },
        {
            title: "بهره‌برداری بلندمدت",
            desc: "مدل BOT با ساخت، بهره‌برداری و انتقال پس از دوره قرارداد",
            icon: <Clock className="w-6 h-6" />,
            color: "emerald",
            features: ["سرمایه‌گذاری بلندمدت", "انتقال فناوری", "پایداری"],
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Handshake className="w-6 h-6" />}
                title="مدل قرارداد با شهرداری‌ها"
                subtitle="ساختار توافقی و متناسب با توان مالی هر شهر"
                iconColor="emerald"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {models.map((model, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div
                            className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${model.color === "violet"
                                ? "from-violet-500/20 to-violet-600/5"
                                : model.color === "cyan"
                                    ? "from-cyan-500/20 to-cyan-600/5"
                                    : "from-emerald-500/20 to-emerald-600/5"
                                } flex items-center justify-center mb-4`}
                        >
                            <div
                                className={
                                    model.color === "violet"
                                        ? "text-violet-400"
                                        : model.color === "cyan"
                                            ? "text-cyan-400"
                                            : "text-emerald-400"
                                }
                            >
                                {model.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{model.title}</h3>
                        <p className="text-gray-400 text-sm mb-4">{model.desc}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {model.features.map((f, idx) => (
                                <Tag key={idx} text={f} color={model.color as "violet" | "cyan" | "emerald"} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-violet-500/10 to-emerald-500/10 border border-violet-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-violet-400" />
                    <h3 className="text-white font-semibold">هدف مدل قرارداد</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                    تمام شهرها — از کوچک تا کلان‌شهر — بتوانند بدون فشار مالی زیاد و با
                    رضایت عمومی بالا به این سامانه متصل شوند. ما آمادگی داریم با هر
                    شهرداری وارد مذاکره برای تعیین مدل همکاری متناسب با توان شهر شویم.
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 06: TECHNICAL ANALYSIS
// ─────────────────────────────────────────────────────────────

function Slide06Technical() {
    const techSpecs = [
        { label: "امنیت", value: 95, color: "violet" },
        { label: "مقیاس‌پذیری", value: 90, color: "cyan" },
        { label: "کاربرپذیری", value: 88, color: "emerald" },
        { label: "یکپارچگی", value: 92, color: "amber" },
        { label: "هوشمندی", value: 80, color: "emerald" },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Cpu className="w-6 h-6" />}
                title="تحلیل اجزای فنی"
                subtitle="معماری مدرن و فناوری‌های روز"
                iconColor="violet"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4 text-violet-400" />
                            شاخص‌های فنی کلیدی
                        </h3>
                        {techSpecs.map((spec, i) => (
                            <div key={i} className="mb-3">
                                <ProgressBar
                                    value={spec.value}
                                    label={spec.label}
                                    color={spec.color}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            نوآوری‌های کلیدی
                        </h3>
                        <div className="space-y-2">
                            <BulletItem text="تجربه کاربری بومی و ساده برای شهروندان" />
                            <BulletItem text="تحلیل داده و نظم‌دهی به عملیات پیمانکاران" />
                            <BulletItem text="داشبورد داده‌محور برای تصمیم‌سازی هوشمند" />
                            <BulletItem text="API مشترک بین شهرها برای یکپارچگی ملی" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        ارزیابی سامانه
                    </h3>
                    <RadarChartSlide data={techRadarData} title="امتیازات فنی در شش محور" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                            <div className="text-violet-400 font-bold text-xl">۹۵٪</div>
                            <div className="text-gray-500 text-xs">امنیت</div>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                            <div className="text-cyan-400 font-bold text-xl">۹۰٪</div>
                            <div className="text-gray-500 text-xs">مقیاس‌پذیری</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 07: WORKFLOW
// ─────────────────────────────────────────────────────────────

function Slide07Workflow() {
    const steps = [
        { title: "ثبت درخواست", desc: "شهروند در اپ", color: "violet", icon: <Smartphone className="w-5 h-5" /> },
        { title: "تأیید پیمانکار", desc: "اختصاص خودکار", color: "cyan", icon: <CheckCircle className="w-5 h-5" /> },
        { title: "جمع‌آوری", desc: "GPS و ثبت وزن", color: "emerald", icon: <Truck className="w-5 h-5" /> },
        { title: "گزارش", desc: "ثبت در سامانه", color: "amber", icon: <FileText className="w-5 h-5" /> },
        { title: "پرداخت", desc: "کیف پول شهری", color: "rose", icon: <CreditCard className="w-5 h-5" /> },
        { title: "تحلیل", desc: "پنل شهرداری", color: "indigo", icon: <BarChart2 className="w-5 h-5" /> },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Workflow className="w-6 h-6" />}
                title="جریان کاری سامانه"
                subtitle="فرآیند از ثبت درخواست تا تحلیل نهایی"
                iconColor="amber"
            />

            <div className="relative">
                {/* مسیر اتصال */}
                {/* <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-full hidden lg:block transform -translate-y-1/2" /> */}

                <div dir="ltr" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div
                                className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${step.color === "violet"
                                    ? "from-violet-500/20 to-violet-600/5 border-violet-500/30"
                                    : step.color === "cyan"
                                        ? "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30"
                                        : step.color === "emerald"
                                            ? "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30"
                                            : step.color === "amber"
                                                ? "from-amber-500/20 to-amber-600/5 border-amber-500/30"
                                                : step.color === "rose"
                                                    ? "from-rose-500/20 to-rose-600/5 border-rose-500/30"
                                                    : "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30"
                                    } border flex items-center justify-center mb-3 relative`}
                            >
                                <div
                                    className={
                                        step.color === "violet"
                                            ? "text-violet-400"
                                            : step.color === "cyan"
                                                ? "text-cyan-400"
                                                : step.color === "emerald"
                                                    ? "text-emerald-400"
                                                    : step.color === "amber"
                                                        ? "text-amber-400"
                                                        : step.color === "rose"
                                                            ? "text-rose-400"
                                                            : "text-indigo-400"
                                    }
                                >
                                    {step.icon}
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#13151F] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                                    {i + 1}
                                </div>
                            </div>
                            <h4 className="text-white text-sm mb-2 font-semibold">{step.title}</h4>
                            <p className="text-gray-500 text-xs">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <span className="text-gray-400">گزارش نهایی</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-gray-400">شهرداری</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-400">سامانه مرکزی</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500" />
                        <span className="text-gray-400">پیمانکار</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500" />
                        <span className="text-gray-400">شهروند 🡒 اپ شهر شهر</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// نیاز به اضافه کردن import Truck
import { Truck } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SLIDE 08: FUTURE PLANS
// ─────────────────────────────────────────────────────────────

function Slide08Future() {
    const plans = [
        {
            icon: <Bot className="w-6 h-6" />,
            title: "هوش مصنوعی",
            desc: "پیش‌بینی حجم پسماند و زمان‌بندی خودکار مسیرها",
            color: "violet",
        },
        {
            icon: <Network className="w-6 h-6" />,
            title: "پیشنهاد خودکار",
            desc: "انتخاب پیمانکاران بر اساس موقعیت و ظرفیت",
            color: "cyan",
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            title: "پرداخت مستقیم",
            desc: "اتصال مستقیم به کارت بانکی برای پرداخت ساده‌تر",
            color: "emerald",
        },
        {
            icon: <Leaf className="w-6 h-6" />,
            title: "اعتبار سبز",
            desc: "امتیاز و تخفیف عوارض شهری برای شهروندان بازیافت‌گر",
            color: "amber",
        },
        {
            icon: <Building2 className="w-6 h-6" />,
            title: "پسماند ویژه",
            desc: "مدیریت پسماند ساختمانی، الکترونیکی، بیمارستانی",
            color: "rose",
        },
        {
            icon: <Cpu className="w-6 h-6" />,
            title: "شهر هوشمند",
            desc: "هم‌پوشانی با پروژه‌های شهر هوشمند",
            color: "indigo",
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Rocket className="w-6 h-6" />}
                title="برنامه‌های آینده و توسعه هوشمند"
                subtitle="نقشه راه تحول دیجیتال"
                iconColor="fuchsia"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-4 hover:border-violet-500/30 transition-all duration-300"
                    >
                        <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color === "violet"
                                ? "from-violet-500/20 to-violet-600/5"
                                : plan.color === "cyan"
                                    ? "from-cyan-500/20 to-cyan-600/5"
                                    : plan.color === "emerald"
                                        ? "from-emerald-500/20 to-emerald-600/5"
                                        : plan.color === "amber"
                                            ? "from-amber-500/20 to-amber-600/5"
                                            : plan.color === "rose"
                                                ? "from-rose-500/20 to-rose-600/5"
                                                : "from-indigo-500/20 to-indigo-600/5"
                                } flex items-center justify-center mb-3`}
                        >
                            <div
                                className={
                                    plan.color === "violet"
                                        ? "text-violet-400"
                                        : plan.color === "cyan"
                                            ? "text-cyan-400"
                                            : plan.color === "emerald"
                                                ? "text-emerald-400"
                                                : plan.color === "amber"
                                                    ? "text-amber-400"
                                                    : plan.color === "rose"
                                                        ? "text-rose-400"
                                                        : "text-indigo-400"
                                }
                            >
                                {plan.icon}
                            </div>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-1">{plan.title}</h4>
                        <p className="text-gray-400 text-xs">{plan.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20 rounded-2xl">
                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-fuchsia-400" />
                    <p className="text-gray-300 text-sm">
                        <strong className="text-fuchsia-300">افق ۱۴۰۸:</strong> پوشش کامل
                        تمام شهرهای کشور با سامانه یکپارچه مدیریت پسماند هوشمند
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 09: REPORTING
// ─────────────────────────────────────────────────────────────

function Slide09Reporting() {
    return (
        <div>
            <SlideHeader
                icon={<BarChart2 className="w-6 h-6" />}
                title="گزارش‌گیری و تحلیل عملکرد"
                subtitle="داشبوردهای تحلیلی و گزارش‌های پیشرفته"
                iconColor="emerald"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-5">
                    <BarChartSlide data={wasteBarData} title="روند کاهش پسماند دفنی (تن)" />
                    <LineChartSlide
                        data={participationData}
                        title="افزایش مشارکت مردمی"
                        keys={[
                            { key: "درخواست", color: CHART_COLORS.violet, name: "تعداد درخواست‌ها" },
                            { key: "بازیافت", color: CHART_COLORS.emerald, name: "میزان بازیافت (تن)" },
                        ]}
                    />
                </div>
                <div className="space-y-5">
                    <PieChartSlide data={wasteTypeData} title="سهم انواع پسماند" />
                    <AreaChartSlide data={costSavingsData} title="روند کاهش هزینه‌های عملیاتی" dataKey="هزینه" />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-xl p-3 text-center">
                    <div className="text-emerald-400 font-bold text-lg">+۲۴۰٪</div>
                    <div className="text-gray-500 text-xs">رشد درخواست‌ها</div>
                </div>
                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-xl p-3 text-center">
                    <div className="text-violet-400 font-bold text-lg">۹۲٪</div>
                    <div className="text-gray-500 text-xs">موفقیت مأموریت‌ها</div>
                </div>
                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-xl p-3 text-center">
                    <div className="text-cyan-400 font-bold text-lg">۴.۷/۵</div>
                    <div className="text-gray-500 text-xs">رضایت مردمی</div>
                </div>
                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-xl p-3 text-center">
                    <div className="text-amber-400 font-bold text-lg">-۳۰٪</div>
                    <div className="text-gray-500 text-xs">کاهش هزینه</div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 10: CASE STUDY - NAHAVAND
// ─────────────────────────────────────────────────────────────

function Slide10CaseStudy() {
    const results = [
        { label: "کاهش زمان جمع‌آوری", value: "۱۵٪", color: "emerald" },
        { label: "کاهش هزینه سوخت", value: "۱۲٪", color: "cyan" },
        { label: "افزایش مشارکت", value: "۸۰٪", color: "violet" },
        { label: "رضایت شهروندان", value: "۴.۶/۵", color: "amber" },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Map className="w-6 h-6" />}
                title="موردکاوی: شهر نهاوند"
                subtitle="نتایج پیاده‌سازی آزمایشی"
                iconColor="cyan"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            دامنه پیاده‌سازی
                        </h3>
                        <ul className="space-y-2">
                            <BulletItem text="مناطق منتخب: مناطق ۱, ۲ و بخشی از مناطق تجاری" />
                            <BulletItem text="مدت پایلوت: ۳ ماه" />
                            <BulletItem text="تعداد کاربران: ۱۰۰+ شهروند" />
                            <BulletItem text="تعداد پیمانکاران: ۱ تیم عملیاتی" />
                        </ul>
                    </div>

                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-400" />
                            دستاوردهای کلیدی
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {results.map((r, i) => (
                                <div key={i} className="text-center p-3 bg-white/5 rounded-xl">
                                    <div className={`text-${r.color}-400 font-bold text-xl`}>
                                        {r.value}
                                    </div>
                                    <div className="text-gray-500 text-xs">{r.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            چالش‌ها و درس‌آموخته‌ها
                        </h3>
                        <ul className="space-y-2">
                            <BulletItem text="نیاز به آموزش کاربران مسن‌تر" />
                            <BulletItem text="مقاومت اولیه در برابر تغییر" />
                            <BulletItem text="اهمیت صحت داده‌های ورودی" />
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <Quote className="w-5 h-5 text-cyan-400 mt-0.5" />
                            <p className="text-gray-300 text-sm italic">
                                نتایج موفقیت‌آمیز پایلوت در نهاوند، زمینه را برای توسعه و گسترش
                                سامانه «شهر شهر» به سایر شهرهای کشور فراهم کرده است.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// نیاز به اضافه کردن import Quote
import { Quote } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SLIDE 11: KPIs
// ─────────────────────────────────────────────────────────────

function Slide11KPIs() {
    return (
        <div>
            <SlideHeader
                icon={<Gauge className="w-6 h-6" />}
                title="شاخص‌های کلیدی موفقیت (KPIs)"
                subtitle="اندازه‌گیری و پایش عملکرد سامانه"
                iconColor="amber"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-4">شاخص‌های هدف</h3>
                        <div className="space-y-3">
                            <ProgressBar value={85} label="کاهش هزینه‌های عملیاتی (هدف ۱۵٪)" color="emerald" />
                            <ProgressBar value={72} label="افزایش نرخ بازیافت (هدف ۱۰٪)" color="violet" />
                            <ProgressBar value={90} label="رضایت شهروندان (هدف ۴.۵/۵)" color="cyan" />
                            <ProgressBar value={60} label="کاهش پسماند دفنی (هدف ۲۰٪)" color="amber" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">روش‌های پایش</h3>
                    <ul className="space-y-3">
                        <BulletItem text="مقایسه هزینه‌های عملیاتی قبل و بعد از اجرا" />
                        <BulletItem text="اندازه‌گیری وزن مواد بازیافتی جمع‌آوری شده" />
                        <BulletItem text="نظرسنجی‌های منظم درون‌برنامه‌ای" />
                        <BulletItem text="تحلیل داده‌های GPS و مسیرهای بهینه‌سازی‌شده" />
                    </ul>

                    <div className="mt-5 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">پیشرفت به‌سمت اهداف</span>
                            <span className="text-violet-400 font-bold">۷۷٪</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "77%" }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 12: VALUE PROPOSITION
// ─────────────────────────────────────────────────────────────

function Slide12ValueProposition() {
    const stakeholders = [
        {
            title: "شهروندان",
            icon: <Users className="w-5 h-5" />,
            color: "violet",
            benefits: [
                "راحتی و سهولت ثبت درخواست",
                "مشارکت مؤثر و دریافت پاداش",
                "شفافیت اطلاعات",
                "کاهش مشکلات زیست‌محیطی",
            ],
        },
        {
            title: "پیمانکاران",
            icon: <Briefcase className="w-5 h-5" />,
            color: "cyan",
            benefits: [
                "افزایش بهره‌وری و کاهش هزینه",
                "مدیریت داده‌محور",
                "کسب درآمد پایدار",
                "شفافیت مالی و عملیاتی",
            ],
        },
        {
            title: "شهرداری‌ها",
            icon: <Building2 className="w-5 h-5" />,
            color: "emerald",
            benefits: [
                "مدیریت یکپارچه و هوشمند",
                "تصمیم‌گیری داده‌محور",
                "کاهش هزینه‌های عمومی",
                "ارتقاء شاخص‌های زیست‌محیطی",
            ],
        },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Star className="w-6 h-6" />}
                title="ارزش پیشنهادی سامانه"
                subtitle="ارزش‌های منحصر‌به‌فرد برای هر ذینفع"
                iconColor="violet"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stakeholders.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5"
                    >
                        <div
                            className={`inline-flex p-3 rounded-xl mb-4 ${s.color === "violet"
                                ? "bg-violet-500/10 text-violet-400"
                                : s.color === "cyan"
                                    ? "bg-cyan-500/10 text-cyan-400"
                                    : "bg-emerald-500/10 text-emerald-400"
                                }`}
                        >
                            {s.icon}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
                        <ul className="space-y-2">
                            {s.benefits.map((b, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-violet-400 flex-shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-violet-500/10 to-emerald-500/10 border border-violet-500/20 rounded-2xl text-center">
                <p className="text-gray-300 text-sm">
                    <strong className="text-violet-300">نتیجه نهایی:</strong> افزایش کیفیت
                    زندگی شهری، کاهش آلودگی محیط‌زیست و ایجاد اقتصاد چرخشی پایدار
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 13: TECHNICAL ARCHITECTURE
// ─────────────────────────────────────────────────────────────

function Slide13Architecture() {
    const techStack = [
        { name: "Next.js", role: "فرانت‌اند اپلیکیشن", color: "violet" },
        { name: "React.js", role: "پنل مدیریت شهری", color: "cyan" },
        { name: "Node.js + Express", role: "بک‌اند و API", color: "emerald" },
        { name: "MongoDB / PostgreSQL", role: "پایگاه داده", color: "amber" },
        { name: "OAuth 2.0 + JWT", role: "امنیت و احراز هویت", color: "rose" },
    ];

    return (
        <div>
            <SlideHeader
                icon={<Network className="w-6 h-6" />}
                title="معماری فنی سامانه"
                subtitle="میکروسرویس‌ها و فناوری‌های مدرن"
                iconColor="violet"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-violet-400" />
                            تکنولوژی‌های مورد استفاده
                        </h3>
                        <div className="space-y-2">
                            {techStack.map((tech, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                    <span className="text-white font-mono text-sm">{tech.name}</span>
                                    <span className="text-gray-400 text-xs">{tech.role}</span>
                                    <div className={`w-2 h-2 rounded-full bg-${tech.color}-500`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            لایه‌های امنیتی
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Tag text="OAuth 2.0" color="violet" />
                            <Tag text="JWT" color="cyan" />
                            <Tag text="Rate Limiting" color="emerald" />
                            <Tag text="XSS Protection" color="amber" />
                            <Tag text="SQL Injection" color="rose" />
                            <Tag text="HTTPS" color="indigo" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-4">مقیاس‌پذیری سامانه</h3>
                    <div className="space-y-4">
                        <ProgressBar value={95} label="Horizontal Scaling" color="violet" />
                        <ProgressBar value={90} label="Microservices" color="cyan" />
                        <ProgressBar value={85} label="Message Queues" color="emerald" />
                        <ProgressBar value={88} label="Load Balancing" color="amber" />
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span>پشتیبانی از ۱۰۰,۰۰۰+ درخواست همزمان</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 14: ROADMAP
// ─────────────────────────────────────────────────────────────

function Slide14Roadmap() {
    return (
        <div>
            <SlideHeader
                icon={<Rocket className="w-6 h-6" />}
                title="نقشه راه توسعه"
                subtitle="از پایلوت تا پایداری کامل"
                iconColor="indigo"
            />

            <div className="relative">
                {/* خط زمان */}
                <div className="absolute right-0 left-0 top-1/2 h-0.5 bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-500 rounded-full hidden lg:block" />

                <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    {roadmapPhases.map((phase, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#1A1D2E] border border-white/[0.06] rounded-2xl p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span
                                    className="text-xs font-mono px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: `${phase.color}30`, color: phase.color }}
                                >
                                    {phase.phase}
                                </span>
                                <span className="text-gray-500 text-xs">{phase.duration}</span>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-2">{phase.title}</h3>
                            <ul className="space-y-1 mb-3">
                                {phase.items.map((item, idx) => (
                                    <li key={idx} className="text-gray-400 text-xs flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-current" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div
                                className={`h-1 rounded-full ${phase.status === "complete"
                                    ? "bg-emerald-500"
                                    : phase.status === "active"
                                        ? "bg-violet-500 animate-pulse"
                                        : "bg-gray-700"
                                    }`}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl">
                <div dir="ltr" className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-400 text-xs">تکمیل‌شده</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-gray-400 text-xs">در حال اجرا</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-700" />
                        <span className="text-gray-400 text-xs">برنامه آینده</span>
                    </div>
                    <div className="text-cyan-400 text-sm font-mono">
                        هدف: پوشش ۱۰۰٪ شهرها تا ۱۴۰۸
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SLIDE 15: CONCLUSION
// ─────────────────────────────────────────────────────────────

function Slide15Conclusion() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-[75vh] text-center">
            <GlowOrb className="w-96 h-96 -top-20 -right-20" color="violet" />
            <GlowOrb className="w-64 h-64 bottom-10 -left-10" color="emerald" />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-5 py-2 mb-8">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                    <span className="text-violet-300 text-sm font-medium">
                        جمع‌بندی و افق پیش‌رو
                    </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        «شهر شهر»
                    </span>
                </h2>

                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                    نه‌تنها یک سامانه کاربردی، بلکه الگویی برای تحول ملی در مدیریت پسماند شهری
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    <Tag text="فناوری‌محور" color="violet" />
                    <Tag text="شفاف" color="cyan" />
                    <Tag text="مقیاس‌پذیر" color="emerald" />
                    <Tag text="پایدار" color="amber" />
                    <Tag text="مشارکتی" color="rose" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
                    <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-violet-400">اقتصادی</div>
                        <div className="text-gray-400 text-sm">کاهش هزینه تا ۱۵٪</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-cyan-400">اجتماعی</div>
                        <div className="text-gray-400 text-sm">رضایت ۴.۵/۵</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                        <div className="text-2xl font-bold text-emerald-400">زیست‌محیطی</div>
                        <div className="text-gray-400 text-sm">کاهش پسماند دفنی ۲۰٪</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-violet-500/20 to-emerald-500/20 border border-violet-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
                    <p className="text-gray-300 text-base leading-relaxed">
                        آمادگی داریم با هر شهرداری وارد مذاکره برای تعیین مدل همکاری
                        (توافقی متناسب با توان شهر) شویم تا همه‌ی شهروندان از خدمات مدیریت
                        پسماند دیجیتالی و باکیفیت برخوردار شوند.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Phone className="w-4 h-4" />
                            <span>۰۹۹۹۹۰۹۶۰۵۲</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Mail className="w-4 h-4" />
                            <span>info@shahrshahr.ir</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function ShahrShahrReport() {
    const [swiper, setSwiper] = useState<any>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    // const [theme, setTheme] = useState<"dark" | "light">("dark");

    // useEffect(() => {
    //     const saved = localStorage.getItem("theme");
    //     if (saved === "light" || saved === "dark") {
    //         setTheme(saved);
    //     }
    // }, []);

    // useEffect(() => {
    //     document.documentElement.classList.toggle("dark", theme === "dark");
    //     localStorage.setItem("theme", theme);
    // }, [theme]);
    const slides = [
        <Slide01Cover />,
        <Slide02Executive />,
        <Slide03Vision />,
        <Slide04Structure />,
        <Slide05Contract />,
        <Slide06Technical />,
        <Slide07Workflow />,
        <Slide08Future />,
        <Slide09Reporting />,
        <Slide10CaseStudy />,
        <Slide11KPIs />,
        <Slide12ValueProposition />,
        <Slide13Architecture />,
        <Slide14Roadmap />,
        <Slide15Conclusion />,
    ];

    return (
        <div className="min-h-screen bg-[#0B0D17] overflow-hidden" dir="rtl">
            {/* <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="fixed top-4 left-4 z-50 px-4 py-2 rounded-xl border 
             bg-white/80 dark:bg-slate-900/80 backdrop-blur 
             text-slate-800 dark:text-slate-100"
            >
                {theme === "dark" ? "🌞 لایت" : "🌙 دارک"}
            </button> */}


            {/* دکمه تمام صفحه */}
            <div className="flex fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-2 justify-center">
                <button
                    onClick={() => {
                        const elem = document.documentElement;
                        if (!document.fullscreenElement) {
                            elem.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 text-sm"
                >
                    <Maximize2 className="w-4 h-4" />
                    تمام صفحه
                </button>
            </div>


            {/* حاشیه تزئینی */}
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent z-50" />
            <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-50" />

            <div className="container mx-auto px-4 py-8">
                {/* هدر با ناوبری */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Recycle className="w-8 h-8 text-violet-400" />
                        <span className="text-white font-bold text-xl">شهر شهر</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => swiper?.slidePrev()}
                            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-gray-400 text-sm font-mono">
                            {activeIndex + 1} / {slides.length}
                        </span>
                        <button
                            onClick={() => swiper?.slideNext()}
                            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Swiper */}
                <Swiper
                    modules={[Pagination, Keyboard, Mousewheel]}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    keyboard={{ enabled: true }}
                    mousewheel={{ forceToAxis: true }}
                    spaceBetween={30}
                    slidesPerView={1}
                    onSwiper={setSwiper}
                    onSlideChange={(e) => setActiveIndex(e.activeIndex)}
                    className="rounded-3xl"
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index}>
                            <SlideWrapper>{slide}</SlideWrapper>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
        </div>
    );
}