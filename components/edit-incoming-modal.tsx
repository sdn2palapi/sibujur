"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface EditIncomingLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    letter: any;
}

export function EditIncomingLetterModal({ isOpen, onClose, onUpdate, letter }: EditIncomingLetterModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomor: "",
        perihal: "",
        pengirim: "",
        tanggalMasuk: "",
        rawDate: "",
    });

    useEffect(() => {
        if (letter) {
            setFormData({
                nomor: letter.nomor || "",
                perihal: letter.perihal || "",
                pengirim: letter.pengirim || "",
                tanggalMasuk: letter.tanggalMasuk || "",
                rawDate: letter.rawDate || "",
            });
        }
    }, [letter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading("Menyimpan perubahan...");

        try {
            // Format display date from rawDate
            const dateObj = new Date(formData.rawDate);
            const formattedDate = dateObj.toLocaleDateString("en-GB");

            const payload = {
                ...letter,
                ...formData,
                tanggalMasuk: formattedDate
            };

            const response = await fetch("/api/surat-masuk", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to update");

            toast.success("Data surat berhasil diperbarui!", { id: toastId });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating letter:", error);
            toast.error("Gagal menyimpan perubahan.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Edit Surat Masuk</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Surat</label>
                        <input
                            type="text"
                            name="nomor"
                            value={formData.nomor}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Perihal</label>
                        <input
                            type="text"
                            name="perihal"
                            value={formData.perihal}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pengirim</label>
                        <input
                            type="text"
                            name="pengirim"
                            value={formData.pengirim}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Masuk</label>
                        <input
                            type="date"
                            name="rawDate"
                            value={formData.rawDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
