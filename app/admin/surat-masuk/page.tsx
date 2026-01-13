"use client";

import { useState } from "react";
import { Save, Inbox, History, CheckCircle2 } from "lucide-react";
import { SuratMasukTable } from "@/components/surat-masuk-table";
import { toast } from "sonner";

import { useUser } from "@/components/ui/user-context";

export default function SuratMasukPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<"input" | "riwayat">("input");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let fileUrl = "";
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.success) fileUrl = data.url;
            }

            // Prepare data object
            const formData = new FormData(e.target as HTMLFormElement);
            const suratData = {
                nomor: (e.target as any)[0].value, // Accessing inputs by index is risky, better to use state or name attributes
                tanggalMasuk: (e.target as any)[1].value,
                pengirim: (e.target as any)[2].value,
                perihal: (e.target as any)[3].value,
                fileUrl: fileUrl,
                penginput: user.name,
                rawDate: (e.target as any)[1].value,
                status: "Archived"
            };

            // Save to API
            await fetch("/api/surat-masuk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(suratData)
            });

            toast.custom((t) => (
                <div className="bg-white rounded-xl shadow-xl border border-green-100 p-4 flex gap-4 w-[350px] animate-in slide-in-from-top-2 fade-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600" />
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">Surat Masuk Disimpan!</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Surat berhasil dicatat ke dalam sistem oleh {user.name}.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => toast.dismiss(t)}
                                className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            ), { duration: 5000 });

            setFile(null);
            // Reset other fields here if needed
        } catch (error) {
            toast.error("Gagal menyimpan surat.", {
                description: "Terjadi kesalahan saat menghubungi server."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Surat Masuk</h1>
                <p className="text-slate-500">Kelola surat masuk: catat baru atau lihat riwayat.</p>
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
                    <Inbox className="w-4 h-4" />
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

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "input" ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Input Surat Masuk</h2>
                            <p className="text-slate-500">Catat surat masuk baru ke dalam sistem.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nomor Surat</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            placeholder="Contoh: 421.2/001/Disdik/2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Tanggal Masuk</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Pengirim</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            placeholder="Instansi/Perorangan Pengirim"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Perihal</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            placeholder="Perihal Surat"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Lampiran (File)</label>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                                            }`}
                                        onClick={() => document.getElementById('sm-file-upload')?.click()}
                                    >
                                        <input
                                            id="sm-file-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        <p className="text-sm text-slate-500">
                                            {file ? file.name : "Klik atau drag file surat di sini (PDF/JPG)"}
                                        </p>
                                        {file && <p className="text-xs text-blue-600 mt-1">Klik untuk ganti</p>}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? "Menyimpan..." : "Simpan Surat Masuk"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Riwayat Surat Masuk</h2>
                            <p className="text-slate-500">Daftar surat masuk yang telah dicatat.</p>
                        </div>
                        <SuratMasukTable />
                    </div>
                )}
            </div>
        </div>
    );
}
