"use client";

import { FileText, Calendar, Users, TrendingUp, ArrowUpRight, Clock, Inbox, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardChart } from "@/components/dashboard-chart";
import Link from "next/link";
import { PageSkeleton } from "@/components/page-skeleton";

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSuratKeluar: 0,
        totalSuratMasuk: 0,
        suratBulanIni: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentLetters, setRecentLetters] = useState<any[]>([]);
    const [topContributors, setTopContributors] = useState<any[]>([]);

    // Year Filter State
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>('masuk');

    // Raw data state to allow re-filtering without re-fetching
    const [rawData, setRawData] = useState<{ masuk: any[], keluar: any[] } | null>(null);

    // Helper for date parsing
    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        // Try standard Date constructor first
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;

        // Handle DD/MM/YYYY
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Note: Month is 0-indexed in Date constructor, but 1-indexed in string
            const d2 = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(d2.getTime())) return d2;
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masukRes, keluarRes, usersRes] = await Promise.all([
                    fetch("/api/surat-masuk", { cache: "no-store" }),
                    fetch("/api/surat-keluar", { cache: "no-store" }),
                    fetch("/api/users", { cache: "no-store" })
                ]);

                if (masukRes.ok && keluarRes.ok && usersRes.ok) {
                    const masukRaw = await masukRes.json();
                    const keluarRaw = await keluarRes.json();
                    const users = await usersRes.json();

                    console.log("Dashboard Data Fetch:", {
                        masukCount: Array.isArray(masukRaw) ? masukRaw.length : 'Not Array',
                        keluarCount: Array.isArray(keluarRaw) ? keluarRaw.length : 'Not Array',
                        usersCount: Array.isArray(users) ? users.length : 'Not Array'
                    });

                    // Normalize data to have rawDate with robust checks
                    const masuk = Array.isArray(masukRaw) ? masukRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal_masuk || item.created_at || new Date().toISOString()
                    })) : [];

                    const keluar = Array.isArray(keluarRaw) ? keluarRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal || item.created_at || new Date().toISOString()
                    })) : [];

                    setRawData({ masuk, keluar });

                    // 1. Calculate Basic Stats
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();

                    const masukBulanIni = masuk.filter((item: any) => {
                        const d = parseDate(item.rawDate);
                        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    }).length;

                    const keluarBulanIni = keluar.filter((item: any) => {
                        const d = parseDate(item.rawDate);
                        return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    }).length;

                    setStats({
                        totalUsers: users.length,
                        totalSuratKeluar: keluar.length,
                        totalSuratMasuk: masuk.length,
                        suratBulanIni: masukBulanIni + keluarBulanIni
                    });

                    // Extract Available Years
                    const years = new Set<number>();
                    years.add(currentYear); // Always include current year

                    masuk.forEach((item: any) => {
                        const d = parseDate(item.rawDate);
                        if (d) years.add(d.getFullYear());
                    });
                    keluar.forEach((item: any) => {
                        const d = parseDate(item.rawDate);
                        if (d) years.add(d.getFullYear());
                    });

                    const sortedYears = Array.from(years).sort((a, b) => b - a);
                    setAvailableYears(sortedYears);

                    // 3. Recent Activity (Combine, Sort, Take 5)
                    const allLetters = [
                        ...masuk.map((l: any) => ({ ...l, type: 'Masuk', rawDate: l.rawDate })),
                        ...keluar.map((l: any) => ({ ...l, type: 'Keluar', rawDate: l.rawDate }))
                    ];

                    allLetters.sort((a, b) => {
                        const dateA = parseDate(a.rawDate)?.getTime() || 0;
                        const dateB = parseDate(b.rawDate)?.getTime() || 0;
                        return dateB - dateA;
                    });
                    setRecentLetters(allLetters);

                    // 4. Top Contributors
                    const contributorMap: Record<string, number> = {};
                    keluar.forEach((l: any) => {
                        if (l.penginput) contributorMap[l.penginput] = (contributorMap[l.penginput] || 0) + 1;
                    });
                    masuk.forEach((l: any) => {
                        if (l.penginput) contributorMap[l.penginput] = (contributorMap[l.penginput] || 0) + 1;
                    });

                    const contributors = Object.entries(contributorMap)
                        .map(([name, count]) => {
                            const user = users.find((u: any) => u.name === name);
                            return {
                                name: name,
                                role: user ? user.role : "Unknown",
                                count: count,
                                target: 50,
                                color: "bg-blue-500"
                            };
                        })
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 4);

                    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500"];
                    contributors.forEach((c, i) => c.color = colors[i % colors.length]);

                    setTopContributors(contributors);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
        <div className="space-y-10 pb-10 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Ringkasan aktivitas surat keluar dan kinerja pengguna.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Surat Keluar</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalSuratKeluar}</h3>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-2 bg-green-50 w-fit px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Data Realtime</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Surat Masuk</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalSuratMasuk}</h3>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-2 bg-green-50 w-fit px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Data Realtime</span>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Inbox className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Surat Bulan Ini</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.suratBulanIni}</h3>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-2 bg-green-50 w-fit px-2 py-1 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Data Realtime</span>
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm flex items-start justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">Total Pengguna</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalUsers}</h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium mt-2 bg-slate-50 w-fit px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Updated just now</span>
                        </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Chart */}
                <div className="lg:col-span-2 h-[300px] md:h-[400px]">
                    <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm h-full flex flex-col">
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

                {/* User Progress / Top Contributors */}
                <div className="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm h-full flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Top Kontributor
                    </h3>
                    <div className="flex-1">
                        {topContributors.length > 0 ? (
                            <div className="space-y-6">
                                {topContributors.map((user, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.role}</p>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">
                                                {user.count} <span className="text-slate-400 text-xs font-normal">Surat</span>
                                            </p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${user.color} transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.min((user.count / user.target) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Belum ada data kontributor.
                            </div>
                        )}
                    </div>
                    <Link href="/admin/pengguna" className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors text-center block">
                        Lihat Semua Pengguna
                    </Link>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Riwayat Surat Terakhir
                    </h3>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('masuk')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'masuk'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Surat Masuk
                        </button>
                        <button
                            onClick={() => setActiveTab('keluar')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'keluar'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Surat Keluar
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 sm:px-6 sm:py-4">No. Surat</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4">Perihal</th>
                                <th className="px-4 py-3 sm:px-6 sm:py-4">
                                    {activeTab === 'masuk' ? 'Pengirim' : 'Tujuan'}
                                </th>
                                <th className="hidden sm:table-cell px-6 py-4">Tanggal</th>
                                <th className="hidden md:table-cell px-6 py-4">Penginput</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentLetters.filter(l => l.type === (activeTab === 'masuk' ? 'Masuk' : 'Keluar')).length > 0 ? (
                                recentLetters
                                    .filter(l => l.type === (activeTab === 'masuk' ? 'Masuk' : 'Keluar'))
                                    .slice(0, 5)
                                    .map((letter, index) => (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-slate-900 text-xs sm:text-sm">
                                                {letter.nomor}
                                            </td>
                                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-600 max-w-[150px] sm:max-w-[200px] truncate" title={letter.perihal}>
                                                {letter.perihal}
                                            </td>
                                            <td className="px-4 py-3 sm:px-6 sm:py-4 text-slate-600 text-xs sm:text-sm">
                                                {activeTab === 'masuk' ? letter.pengirim : letter.tujuan}
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 text-slate-500">
                                                {letter.rawDate ? new Date(letter.rawDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 text-slate-600 text-xs">
                                                {letter.penginput || "-"}
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada data {activeTab === 'masuk' ? 'surat masuk' : 'surat keluar'}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                    <Link
                        href={activeTab === 'masuk' ? "/admin/riwayat/surat-masuk" : "/admin/riwayat/surat-keluar"}
                        className="text-sm text-blue-600 font-medium hover:underline"
                    >
                        Lihat Semua Riwayat {activeTab === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                    </Link>
                </div>
            </div >
        </div >
    );
}
