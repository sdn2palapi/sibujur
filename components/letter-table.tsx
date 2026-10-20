"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { MoreHorizontal, FileText, Eye, Filter, Upload, Download, Search, Pencil, Trash, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "@/components/file-preview-modal";
import { FileUploadModal } from "@/components/file-upload-modal";
import { EditOutgoingLetterModal } from "@/components/edit-outgoing-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";
import { PageContentSkeleton } from "@/components/page-skeleton";

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

export function LetterTable() {
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "unuploaded" | "uploaded">("all");

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState({ name: "", url: "" });
    const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<any>(null);

    // State for history data
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/surat-keluar");
                if (res.ok) {
                    const rawData = await res.json();

                    // Helper to parse date
                    const parseDateString = (str: string) => {
                        if (!str) return new Date().toISOString();
                        // Check if dd/mm/yyyy
                        if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                            const [d, m, y] = str.split('/');
                            return `${y}-${m}-${d}`;
                        }
                        return str;
                    };

                    // Normalize data
                    const data = Array.isArray(rawData) ? rawData.map((item: any) => ({
                        ...item,
                        rawDate: parseDateString(item.rawDate || item.tanggal || item.created_at),
                        createdAt: item.created_at || item.id || 0,
                        fileUrl: item.fileUrl || item.file_url || item.url || item.link || item.lampiran || ""
                    })) : [];

                    setHistoryData(data);

                    // Extract unique years
                    const years = Array.from(new Set(data.map((item: any) => {
                        const d = new Date(item.rawDate);
                        return d.getFullYear().toString();
                    }))).sort((a: any, b: any) => b - a); // Sort descending

                    setAvailableYears(years as string[]);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Summary counts for verification
    const unuploadedCount = historyData.filter(item => !item.fileUrl).length;
    const uploadedCount = historyData.filter(item => !!item.fileUrl).length;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredHistory = historyData.filter((item) => {
        const date = new Date(item.rawDate);
        const monthMatch = selectedMonth ? (date.getMonth() + 1).toString() === selectedMonth : true;
        const yearMatch = selectedYear ? date.getFullYear().toString() === selectedYear : true;

        const isUploaded = !!item.fileUrl;
        const statusMatch =
            statusFilter === "all"
                ? true
                : statusFilter === "unuploaded"
                ? !isUploaded
                : isUploaded;

        const query = searchQuery.trim().toLowerCase();
        const searchMatch =
            !query ||
            item.nomor?.toLowerCase().includes(query) ||
            item.perihal?.toLowerCase().includes(query) ||
            item.tujuan?.toLowerCase().includes(query) ||
            item.penginput?.toLowerCase().includes(query);

        return monthMatch && yearMatch && statusMatch && searchMatch;
    }).sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || a.id || 0;
        const timeB = new Date(b.createdAt).getTime() || b.id || 0;
        return timeB - timeA;
    }); // Sort latest input first

    // Pagination Logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

    const handlePreview = (item: any) => {
        if (!item.fileUrl) {
            toast.error("File belum diupload", {
                description: "Silakan klik tombol Upload File berwarna merah untuk mengunggah berkas surat ini."
            });
            return;
        }
        setPreviewFile({ name: item.perihal, url: item.fileUrl });
        setIsPreviewOpen(true);
    };

    const handleDownload = (item: any) => {
        if (!item.fileUrl) {
            toast.error("File belum diupload", {
                description: "Silakan upload file surat terlebih dahulu."
            });
            return;
        }
        window.open(item.fileUrl, "_blank");
    };

    const handleUpload = (item: any) => {
        setSelectedLetterId(item.id);
        setSelectedLetter(item);
        setIsUploadOpen(true);
    };

    const handleFileUploaded = async (file: File, url: string) => {
        if (!selectedLetterId) return;

        try {
            // Optimistic update
            setHistoryData(prev => prev.map(item =>
                item.id === selectedLetterId ? { ...item, fileUrl: url } : item
            ));

            const res = await fetch("/api/surat-keluar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedLetterId,
                    fileUrl: url,
                    file_url: url,
                    link: url, Link: url,
                    lampiran: url, Lampiran: url,
                    url: url, Url: url,
                    file: url, File: url,
                    bukti: url, Bukti: url
                }),
            });

            if (res.ok) {
                setIsUploadOpen(false);
                toast.success("File berhasil disimpan dan diverifikasi!");
            } else {
                toast.error("Gagal menyimpan link file ke database.");
                // Revert optimistic update if failed
                const fetchHistory = async () => {
                    const res = await fetch("/api/surat-keluar");
                    if (res.ok) {
                        const data = await res.json();
                        setHistoryData(data);
                    }
                };
                fetchHistory();
            }
        } catch (error) {
            console.error("Error updating file URL:", error);
            toast.error("Terjadi kesalahan saat menyimpan link file.");
        }
    };

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (item: any) => {
        setDeleteItem(item);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        setIsDeleting(true);
        try {
            // Optimistic update
            setHistoryData(prev => prev.filter(i => i.id !== deleteItem.id));

            const res = await fetch("/api/surat-keluar", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deleteItem.id }),
            });

            if (!res.ok) {
                toast.error("Gagal menghapus surat.");
                // Revert if failed
                const fetchHistory = async () => {
                    const res = await fetch("/api/surat-keluar");
                    if (res.ok) {
                        const data = await res.json();
                        setHistoryData(data);
                    }
                };
                fetchHistory();
            } else {
                toast.success("Surat berhasil dihapus");
            }
        } catch (error) {
            console.error("Error deleting letter:", error);
            toast.error("Terjadi kesalahan saat menghapus surat.");
        } finally {
            setIsDeleting(false);
            setIsDeleteOpen(false);
            setDeleteItem(null);
        }
    };

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const handleEdit = (item: any) => {
        setEditItem(item);
        setIsEditOpen(true);
    };

    const handleUpdateSuccess = () => {
        // Refresh data
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/surat-keluar");
                if (res.ok) {
                    const data = await res.json();
                    setHistoryData(data);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };
        fetchHistory();
    };

    if (loading) {
        return <PageContentSkeleton />;
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Riwayat & Verifikasi Surat Keluar</h2>
                    <p className="text-slate-500 text-sm">Daftar arsip surat keluar. Surat dengan tanda merah belum memiliki file lampiran.</p>
                </div>
            </div>

            {/* Alert Banner if any letters are unuploaded */}
            {unuploadedCount > 0 && (
                <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start md:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-0 shadow-inner">
                            <AlertTriangle className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-red-900 text-sm md:text-base">
                                    Perhatian: Ada {unuploadedCount} Surat Keluar Belum Di-upload!
                                </h3>
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white shadow-sm">
                                    Perlu Perhatian
                                </span>
                            </div>
                            <p className="text-xs md:text-sm text-red-700/90 mt-1">
                                Dokumen bertanda merah belum memiliki berkas scan surat keluar. Segera klik tombol <strong>Upload</strong> pada baris surat terkait agar verifikasi lengkap.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center">
                        {statusFilter !== "unuploaded" ? (
                            <button
                                onClick={() => {
                                    setStatusFilter("unuploaded");
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs md:text-sm font-bold rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <AlertCircle className="w-4 h-4" />
                                Lihat Surat Belum Upload ({unuploadedCount})
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setStatusFilter("all");
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-red-300 text-red-700 text-xs md:text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
                            >
                                Tampilkan Semua Surat
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => {
                        setStatusFilter("all");
                        setCurrentPage(1);
                    }}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 border",
                        statusFilter === "all"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                >
                    <span>Semua Surat</span>
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                    )}>
                        {historyData.length}
                    </span>
                </button>

                <button
                    onClick={() => {
                        setStatusFilter("unuploaded");
                        setCurrentPage(1);
                    }}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 border",
                        statusFilter === "unuploaded"
                            ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30"
                            : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>Belum Upload (Tanda Merah)</span>
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        statusFilter === "unuploaded" ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                    )}>
                        {unuploadedCount}
                    </span>
                </button>

                <button
                    onClick={() => {
                        setStatusFilter("uploaded");
                        setCurrentPage(1);
                    }}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 border",
                        statusFilter === "uploaded"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30"
                            : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    )}
                >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Terupload / Valid</span>
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        statusFilter === "uploaded" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    )}>
                        {uploadedCount}
                    </span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Cari nomor, perihal, tujuan, penginput..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Semua Tahun</option>
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Nomor Surat</th>
                                <th className="px-6 py-4">Perihal & Tujuan</th>
                                <th className="px-6 py-4">Penginput</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4 text-center">Status Berkas</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedHistory.length > 0 ? (
                                paginatedHistory.map((item) => {
                                    const isUploaded = !!item.fileUrl;
                                    return (
                                        <tr
                                            key={item.id}
                                            className={cn(
                                                "transition-colors",
                                                isUploaded
                                                    ? "hover:bg-slate-50/50 border-l-4 border-l-transparent"
                                                    : "bg-red-50/30 hover:bg-red-50/60 border-l-4 border-l-red-500"
                                            )}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-medium text-slate-700 flex items-center gap-2">
                                                    {!isUploaded && (
                                                        <span className="flex h-2.5 w-2.5 relative" title="Perhatian: File surat belum diupload!">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                    <span>{item.nomor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{item.perihal}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{item.tujuan}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                        {item.penginput ? item.penginput.charAt(0) : "U"}
                                                    </div>
                                                    {item.penginput || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {item.rawDate ? new Date(item.rawDate).toLocaleDateString("en-GB") : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isUploaded ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        Terupload
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 shadow-sm animate-pulse whitespace-nowrap">
                                                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                                        Belum Upload File
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {!isUploaded ? (
                                                        <button
                                                            onClick={() => handleUpload(item)}
                                                            title="Segera Upload File Surat Keluar!"
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-red-600/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                                        >
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <span>Upload File</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpload(item)}
                                                            title="Ganti / Upload Ulang File"
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit Surat"
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePreview(item)}
                                                        title={isUploaded ? "Lihat File" : "File belum diupload"}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            isUploaded
                                                                ? "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                                                : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                        )}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(item)}
                                                        title={isUploaded ? "Download File" : "File belum diupload"}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            isUploaded
                                                                ? "text-slate-400 hover:text-green-600 hover:bg-green-50"
                                                                : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                        )}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        title="Hapus Surat"
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data surat untuk kriteria ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredHistory.length > itemsPerPage && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} dari {filteredHistory.length} data
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
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
                title="Upload Arsip Surat Keluar"
                customFilename={selectedLetter?.nomor}
            />

            <EditOutgoingLetterModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdate={handleUpdateSuccess}
                letter={editItem}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                title="Hapus Surat Keluar"
                message={`Apakah Anda yakin ingin menghapus surat nomor "${deleteItem?.nomor}"? Tindakan ini tidak dapat dibatalkan.`}
                isDeleting={isDeleting}
            />
        </div>
    );
}
