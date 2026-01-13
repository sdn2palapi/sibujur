"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit2, FileText, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Classification {
    code: string;
    label: string;
    type: "main" | "sub";
}

export default function PengaturanSuratPage() {
    const [codes, setCodes] = useState<Classification[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<Classification>({ code: "", label: "", type: "main" });

    // Numbering Settings State
    const [lastNumber, setLastNumber] = useState("");
    const [resetFrequency, setResetFrequency] = useState("yearly");
    const [kodeInstansi, setKodeInstansi] = useState("/DIK-SDN2PLP/");

    useEffect(() => {
        fetchCodes();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                if (data.lastNumber) setLastNumber(data.lastNumber);
                if (data.resetFrequency) setResetFrequency(data.resetFrequency);
                if (data.kodeInstansi) setKodeInstansi(data.kodeInstansi);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/classifications", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                // Filter out empty/padding rows
                const filteredData = Array.isArray(data) ? data.filter((item: any) => item.code && item.code.trim() !== "") : [];
                setCodes(filteredData);
            }
        } catch (error) {
            console.error("Failed to fetch codes:", error);
            toast.error("Gagal memuat data klasifikasi.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCode = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.code || !formData.label) {
            toast.error("Kode dan Label harus diisi.");
            return;
        }

        const newCodes = [...codes];
        if (isEditing && editIndex !== null) {
            newCodes[editIndex] = formData;
        } else {
            // Check for duplicate code
            if (codes.some(c => c.code === formData.code)) {
                toast.error("Kode klasifikasi sudah ada.");
                return;
            }
            newCodes.push(formData);
        }

        // Sort codes (optional, but good for display)
        // Simple alpha sort on code
        newCodes.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

        await saveToServer(newCodes);
        resetForm();
    };

    const handleDelete = async (index: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus kode ini?")) {
            const newCodes = codes.filter((_, i) => i !== index);
            await saveToServer(newCodes);
        }
    };

    const saveToServer = async (newData: Classification[]) => {
        setSaving(true);
        try {
            const res = await fetch("/api/classifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newData),
            });

            if (res.ok) {
                setCodes(newData);
                toast.success("Data berhasil disimpan!");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan perubahan.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (index: number) => {
        setFormData(codes[index]);
        setEditIndex(index);
        setIsEditing(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ code: "", label: "", type: "main" });
        setIsEditing(false);
        setEditIndex(null);
    };

    const handleSaveNumberSettings = async () => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lastNumber,
                    resetFrequency,
                    kodeInstansi
                }),
            });

            if (res.ok) {
                toast.success("Pengaturan nomor berhasil disimpan!");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Gagal menyimpan pengaturan nomor.");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan Surat</h1>
                <p className="text-slate-500">Kelola kode klasifikasi dan penomoran surat otomatis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form & Settings */}
                <div className="space-y-8">
                    {/* Form Input Klasifikasi */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            {isEditing ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                            {isEditing ? "Edit Klasifikasi" : "Tambah Klasifikasi"}
                        </h3>

                        <form onSubmit={handleSaveCode} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Kode</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="Contoh: 400.3.5"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Keterangan (Label)</label>
                                <textarea
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="Contoh: Pendidikan Dasar..."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Tipe</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            checked={formData.type === "main"}
                                            onChange={() => setFormData({ ...formData, type: "main" })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">Utama (Bold)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            checked={formData.type === "sub"}
                                            onChange={() => setFormData({ ...formData, type: "sub" })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">Sub (Indented)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Pengaturan Nomor Surat */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-500" />
                            Format Penomoran
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nomor Terakhir Digunakan</label>
                                <input
                                    type="text"
                                    value={lastNumber}
                                    onChange={(e) => setLastNumber(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-mono text-center text-lg tracking-widest"
                                />
                                <p className="text-xs text-slate-500">Ubah manual jika terjadi kesalahan urutan.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Kode Instansi</label>
                                <input
                                    type="text"
                                    value={kodeInstansi}
                                    onChange={(e) => setKodeInstansi(e.target.value)}
                                    placeholder="/DIK-SDN2PLP/"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-mono"
                                />
                                <p className="text-xs text-slate-500">Kode yang akan muncul di setiap nomor surat.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Reset Nomor</label>
                                <select
                                    value={resetFrequency}
                                    onChange={(e) => setResetFrequency(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                >
                                    <option value="yearly">Setiap Tahun (Januari)</option>
                                    <option value="monthly">Setiap Bulan</option>
                                    <option value="never">Tidak Pernah</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSaveNumberSettings}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl transition-all active:scale-95"
                            >
                                Simpan Pengaturan Nomor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Daftar Kode Klasifikasi</h3>
                            <span className="text-sm text-slate-500">{codes.length} Kode</span>
                        </div>

                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
                                {codes.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group ${item.type === 'sub' ? 'pl-8 bg-slate-50/30' : ''}`}
                                    >
                                        <div className={`font-mono text-sm ${item.type === 'main' ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                                            {item.code}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${item.type === 'main' ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                                                {item.label.replace(/\\u00A0/g, '')} {/* Remove indent chars for display */}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(index)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {codes.length === 0 && (
                                    <div className="p-8 text-center text-slate-500">
                                        Belum ada data klasifikasi.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
