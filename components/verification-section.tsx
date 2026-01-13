"use client";

import { useState } from "react";
import { Search, FileText, CheckCircle, XCircle, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "@/components/file-preview-modal";

// Mock Data Removed - Using Real API

export function VerificationSection() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any | null | "not-found">(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/surat-keluar", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                // Find exact match (case insensitive)
                // Remove spaces from query to match stored format if needed, but let's try exact first
                // The stored format is like "B-005..." (no spaces).
                // If user types with spaces, we should probably strip them.
                const cleanQuery = query.replace(/\s+/g, '').toLowerCase();

                const found = data.find(
                    (l: any) => l.nomor.replace(/\s+/g, '').toLowerCase() === cleanQuery
                );

                if (found) {
                    // Normalize data
                    const normalized = {
                        ...found,
                        fileUrl: found.fileUrl || found.file_url || found.url || found.link || found.lampiran || "",
                        tanggal: (() => {
                            const raw = found.tanggal || found.created_at;
                            if (!raw) return "-";
                            // If already dd/mm/yyyy
                            if (raw.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) return raw;
                            // If ISO
                            try {
                                return new Date(raw).toLocaleDateString("en-GB");
                            } catch (e) {
                                return raw;
                            }
                        })()
                    };
                    setResult(normalized);
                } else {
                    setResult("not-found");
                }
            } else {
                setResult("not-found");
            }
        } catch (error) {
            console.error("Verification failed:", error);
            setResult("not-found");
        } finally {
            setLoading(false);
        }
    };

    const [showPreview, setShowPreview] = useState(false);

    return (
        <section className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-12 md:py-20 gap-8">
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wider uppercase mb-2 shadow-md shadow-blue-600/20">
                    Sistem Bukti & Jejak Surat
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Cek Keaslian <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                        Surat Sekolah
                    </span>
                </h2>
                <p className="text-slate-500 text-lg md:text-xl max-w-lg mx-auto">
                    Masukkan nomor surat untuk memverifikasi keaslian dan detail dokumen.
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full relative group flex flex-col md:block gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Masukkan Nomor Surat..."
                        className="w-full pl-14 pr-4 md:pr-40 py-5 text-lg rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl shadow-slate-200/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query}
                        className="hidden md:flex absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Cek Validitas"
                        )}
                    </button>
                </div>

                {/* Mobile Button */}
                <button
                    type="submit"
                    disabled={loading || !query}
                    className="md:hidden w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Cek Validitas"
                    )}
                </button>
            </form>

            <div className="w-full min-h-[200px] flex flex-col items-center justify-center">
                {result === "not-found" && (
                    <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-red-100 p-3 rounded-full">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-700">Data Tidak Ditemukan</h3>
                            <p className="text-red-600/80">
                                Nomor surat <strong>&quot;{query}&quot;</strong> tidak terdaftar di sistem kami.
                            </p>
                        </div>
                    </div>
                )}

                {result && result !== "not-found" && (
                    <div className="w-full bg-white border-2 border-green-500/20 rounded-2xl p-6 shadow-2xl shadow-green-500/10 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                            ✅ DATA BUJUR / VALID
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="bg-green-50 p-4 rounded-2xl flex-shrink-0">
                                <FileText className="w-12 h-12 text-green-600" />
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Nomor Surat
                                    </p>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {result.nomor}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Perihal
                                        </p>
                                        <p className="font-medium text-slate-700">{result.perihal}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            Tanggal
                                        </p>
                                        <p className="font-medium text-slate-700">{result.tanggal}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    {result.fileUrl ? (
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Lihat Lampiran Surat
                                        </button>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 text-slate-500">
                                            <div className="bg-slate-200 p-2 rounded-full">
                                                <Shield className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <p className="text-sm">
                                                Lampiran tidak tersedia atau disembunyikan karena alasan privasi.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* File Preview Modal */}
            {result && result !== "not-found" && result.fileUrl && (
                <FilePreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    fileName={`Surat - ${result.nomor}`}
                    fileUrl={result.fileUrl}
                />
            )}
        </section>
    );
}
