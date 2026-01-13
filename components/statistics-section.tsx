"use client";

import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardChart } from "@/components/dashboard-chart";

export function StatisticsSection() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [totalSurat, setTotalSurat] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masukRes, keluarRes] = await Promise.all([
                    fetch("/api/surat-masuk", { cache: "no-store" }),
                    fetch("/api/surat-keluar", { cache: "no-store" })
                ]);

                if (masukRes.ok && keluarRes.ok) {
                    const masukRaw = await masukRes.json();
                    const keluarRaw = await keluarRes.json();

                    console.log("Public Stats Fetch:", {
                        masukCount: Array.isArray(masukRaw) ? masukRaw.length : 'Not Array',
                        keluarCount: Array.isArray(keluarRaw) ? keluarRaw.length : 'Not Array'
                    });

                    // Normalize data
                    const masuk = Array.isArray(masukRaw) ? masukRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal_masuk || item.created_at || new Date().toISOString()
                    })) : [];

                    const keluar = Array.isArray(keluarRaw) ? keluarRaw.map((item: any) => ({
                        ...item,
                        rawDate: item.tanggal || item.created_at || new Date().toISOString()
                    })) : [];

                    setTotalSurat(masuk.length + keluar.length);

                    // Process Data for Full Year
                    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                    const today = new Date();
                    const currentYear = today.getFullYear();
                    const data = [];

                    for (let i = 0; i < 12; i++) {
                        const monthName = months[i];

                        const countMasuk = masuk.filter((item: any) => {
                            const itemDate = new Date(item.rawDate);
                            return itemDate.getMonth() === i && itemDate.getFullYear() === currentYear;
                        }).length;

                        const countKeluar = keluar.filter((item: any) => {
                            const itemDate = new Date(item.rawDate);
                            return itemDate.getMonth() === i && itemDate.getFullYear() === currentYear;
                        }).length;

                        data.push({
                            month: monthName,
                            masuk: countMasuk,
                            keluar: countKeluar
                        });
                    }
                    setChartData(data);
                }
            } catch (error) {
                console.error("Failed to fetch statistics:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <section className="w-full max-w-5xl mx-auto px-4 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-900/5 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Statistik Surat</h3>
                            <p className="text-sm text-slate-500">Tren volume surat tahun {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-2xl font-bold text-slate-900">{totalSurat}</p>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Surat</p>
                    </div>
                </div>

                <div className="relative w-full">
                    <DashboardChart
                        data={chartData}
                        hideTitle={true}
                        className="h-full border-none shadow-none bg-transparent p-0"
                    />
                </div>
            </div>
        </section>
    );
}
