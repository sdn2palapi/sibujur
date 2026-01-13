"use client";

import { useState } from "react";
import { LetterForm } from "@/components/letter-form";
import { LetterTable } from "@/components/letter-table";
import { PenTool, History } from "lucide-react";

export default function AdminSuratKeluar() {
    const [activeTab, setActiveTab] = useState<"input" | "riwayat">("input");

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Surat Keluar</h1>
                <p className="text-slate-500">Kelola surat keluar: buat baru atau lihat riwayat.</p>
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
                    Riwayat
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
