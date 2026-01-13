"use client";

import { useUser } from "@/components/ui/user-context";
import { AnimatedBackground } from "@/components/animated-background";
import { FileText, Inbox, Clock, ArrowRight, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardChart } from "@/components/dashboard-chart";
import { PageSkeleton } from "@/components/page-skeleton";

export default function MemberDashboard() {
    const { user } = useUser();
    const [stats, setStats] = useState({
        suratMasuk: 0,
        suratKeluar: 0,
        recentActivity: [] as any[]
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Year Filter State
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [rawData, setRawData] = useState<{ masuk: any[], keluar: any[] } | null>(null);

    // Helper for date parsing
    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const d2 = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(d2.getTime())) return d2;
        }
        return null;
    };


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [masukRes, keluarRes] = await Promise.all([
                    fetch("/api/surat-masuk", { cache: "no-store" }),
                    fetch("/api/surat-keluar", { cache: "no-store" })
                ]);

                if (masukRes.ok && keluarRes.ok) {
                    const masukRaw = await masukRes.json();
                    const keluarRaw = await keluarRes.json();

                    // Normalize data
                    const masuk = Array.isArray(masukRaw) ? masukRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal_masuk || item.created_at || new Date().toISOString()
                    })) : [];

                    const keluar = Array.isArray(keluarRaw) ? keluarRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal || item.created_at || new Date().toISOString()
                    })) : [];

                    setRawData({ masuk, keluar });

                    // Extract Available Years
                    const years = new Set<number>();
                    const currentYear = new Date().getFullYear();
                    years.add(currentYear);

                    masuk.forEach((item: any) => {
                        const d = parseDate(item.rawDate);
                        if (d) years.add(d.getFullYear());
                    });
                    keluar.forEach((item: any) => {
                        const d = parseDate(item.rawDate);
                        if (d) years.add(d.getFullYear());
                    });

                    setAvailableYears(Array.from(years).sort((a, b) => b - a));

                    // Combine and sort for recent activity
                    const allActivity = [
                        ...masuk.map((m: any) => ({ ...m, type: 'masuk' })),
                        ...keluar.map((k: any) => ({ ...k, type: 'keluar' }))
                    ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
                        .slice(0, 5);

                    setStats({
                        suratMasuk: masuk.length,
                        suratKeluar: keluar.length,
                        recentActivity: allActivity
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Update Chart Data when selectedYear or rawData changes
    useEffect(() => {
        if (!rawData) return;

        const { masuk, keluar } = rawData;
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const newChartData = [];

        for (let i = 0; i < 12; i++) {
            const monthName = months[i];
            const countMasuk = masuk.filter((item: any) => {
                const d = parseDate(item.rawDate);
                return d && d.getMonth() === i && d.getFullYear() === selectedYear;
            }).length;
            const countKeluar = keluar.filter((item: any) => {
                const d = parseDate(item.rawDate);
                return d && d.getMonth() === i && d.getFullYear() === selectedYear;
            }).length;

            newChartData.push({
                month: monthName,
                masuk: countMasuk,
                keluar: countKeluar
            });
        }
        setChartData(newChartData);
    }, [selectedYear, rawData]);

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            <AnimatedBackground />

            {/* Welcome Section */}
            <div className="relative z-10">
                <h1 className="text-3xl font-bold text-slate-900">
                    Selamat Datang, <span className="text-blue-600">{user.name}</span>
                </h1>
                <p className="text-slate-500 mt-2">
                    Dashboard anggota untuk pengelolaan surat masuk dan keluar.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                            <Inbox className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Surat Masuk</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.suratMasuk}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Surat Keluar</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.suratKeluar}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Aktivitas</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.suratMasuk + stats.suratKeluar}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid: Chart & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Chart Section (2/3 width) */}
                <div className="lg:col-span-2 h-full">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Statistik Surat
                            </h3>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>Tahun {year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <DashboardChart data={chartData} hideTitle={true} className="h-full border-none shadow-none p-0" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions (1/3 width) - Aligned with stats card */}
                <div className="flex flex-col gap-6 h-full">
                    <Link href="/member/surat-masuk" className="flex-1 group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Input Surat Masuk</h3>
                            <p className="text-blue-100 text-sm mb-4">Catat surat masuk baru.</p>
                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium group-hover:bg-white/30 transition-colors">
                                Mulai Input <Inbox className="w-3 h-3" />
                            </span>
                        </div>
                        <Inbox className="absolute -bottom-2 -right-2 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </Link>

                    <Link href="/member/surat-keluar" className="flex-1 group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex flex-col justify-center">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-1">Input Surat Keluar</h3>
                            <p className="text-emerald-100 text-sm mb-4">Buat surat keluar baru.</p>
                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium group-hover:bg-white/30 transition-colors">
                                Mulai Input <FileText className="w-3 h-3" />
                            </span>
                        </div>
                        <FileText className="absolute -bottom-2 -right-2 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </Link>
                </div>
            </div>

            {/* Recent Activity Section (Full Width) */}
            <div className="relative z-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Aktivitas Terbaru</h3>
                    <Link href="/member/riwayat/surat-keluar" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Lihat Semua <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 hover:border-slate-200">
                                <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${item.type === 'masuk' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {item.type === 'masuk' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {item.perihal}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {item.nomor}
                                        </span>
                                        <span className="text-xs text-slate-400">• {item.tanggal}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                            Belum ada aktivitas surat.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
