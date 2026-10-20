"use client";

import { useState, useEffect } from "react";
import { LetterForm } from "@/components/letter-form";
import { LetterTable } from "@/components/letter-table";
import { PenTool, History, AlertCircle } from "lucide-react";

export default function AdminSuratKeluar() {
    const [activeTab, setActiveTab] = useState<"input" | "riwayat">("input");
    const [unuploadedCount, setUnuploadedCount] = useState<number>(0);

    const fetchPendingCount = async () => {
        try {
            const res = await fetch("/api/surat-keluar", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const count = data.filter((item: any) => !(item.fileUrl || item.file_url || item.url || item.link || item.lampiran)).length;
                    setUnuploadedCount(count);
                }
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        fetchPendingCount();
    }, [activeTab]);

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Surat Keluar</h1>
                <p className="text-slate-500">Kelola surat keluar: buat baru atau verifikasi riwayat dokumen.</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("input")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "input"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <PenTool className="w-4 h-4" />
                    Input Surat
                </button>
                <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "riwayat"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <History className="w-4 h-4" />
                    <span>Riwayat & Verifikasi</span>
                    {unuploadedCount > 0 && (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-600/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            {unuploadedCount} Belum Upload
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "input" ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Input Surat Keluar</h2>
                            <p className="text-slate-500">Isi form di bawah untuk menginput nomor surat baru.</p>
                        </div>
                        <LetterForm />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <LetterTable />
                    </div>
                )}
            </div>
        </div>
    );
}
