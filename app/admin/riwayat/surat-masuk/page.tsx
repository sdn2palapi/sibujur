"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Download, Filter, Upload, Loader2 } from "lucide-react";
import { FilePreviewModal } from "@/components/file-preview-modal";
import { FileUploadModal } from "@/components/file-upload-modal";
import { PageSkeleton } from "@/components/page-skeleton";

const MONTHS = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

export default function RiwayatSuratMasukPage() {
    const [suratMasuk, setSuratMasuk] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState({ name: "", url: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/surat-masuk");
                if (response.ok) {
                    const data = await response.json();
                    setSuratMasuk(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to fetch surat masuk:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredSurat = suratMasuk.filter((surat) => {
        const date = new Date(surat.tanggal_masuk || surat.created_at);
        const monthMatch = selectedMonth ? (date.getMonth() + 1).toString() === selectedMonth : true;
        const yearMatch = selectedYear ? date.getFullYear().toString() === selectedYear : true;
        const searchMatch = searchQuery
            ? (surat.perihal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surat.pengirim?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surat.nomor?.toLowerCase().includes(searchQuery.toLowerCase()))
            : true;
        return monthMatch && yearMatch && searchMatch;
    });

    const handlePreview = (item: any) => {
        setPreviewFile({ name: item.perihal, url: item.file_url || "" });
        setIsPreviewOpen(true);
    };

    const handleDownload = (url: string) => {
        if (url) window.open(url, "_blank");
        else alert("File tidak tersedia");
    };

    const [selectedUploadLetter, setSelectedUploadLetter] = useState<any>(null);

    const handleUpload = (surat: any) => {
        setSelectedUploadLetter(surat);
        setIsUploadOpen(true);
    };

    const handleFileUploaded = (file: File) => {
        alert(`File ${file.name} berhasil diupload!`);
    };

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Riwayat Surat Masuk</h1>
                <p className="text-slate-500">Daftar arsip surat yang masuk ke sekolah.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari surat masuk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Semua Bulan</option>
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Semua Tahun</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                            <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">No. Surat</th>
                                <th className="px-6 py-4">Pengirim & Perihal</th>
                                <th className="px-6 py-4">Penginput</th>
                                <th className="px-6 py-4">Tanggal Masuk</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSurat.length > 0 ? (
                                filteredSurat.map((surat, index) => (
                                    <tr key={surat.id || index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{surat.nomor}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{surat.pengirim}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{surat.perihal}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {(surat.penginput || "?").charAt(0)}
                                                </div>
                                                {surat.penginput || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {surat.tanggal_masuk ? new Date(surat.tanggal_masuk).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUpload(surat)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="Upload File"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePreview(surat)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(surat.file_url)}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-slate-400 hover:text-green-600 transition-colors"
                                                    title="Download Lampiran"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data surat masuk untuk periode ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <FilePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileName={previewFile.name}
                fileUrl={previewFile.url}
            />

            <FileUploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleFileUploaded}
                title="Upload Arsip Surat Masuk"
                customFilename={selectedUploadLetter?.nomor}
            />
        </div>
    );
}
