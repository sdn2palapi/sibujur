"use client";

import { useState, useRef, useEffect } from "react";
import { Save, Shield, Upload, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/components/ui/user-context";

export function MemberSettings() {
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for form fields
    const [nama, setNama] = useState("");
    const [username, setUsername] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [fotoProfil, setFotoProfil] = useState<string | null>(null);

    // Password fields
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Initialize state from user context
    useEffect(() => {
        if (user) {
            setNama(user.name || "");
            setUsername(user.username || "");
            setJabatan(user.jabatan || "");
            setFotoProfil(user.avatar || null);
        }
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const uploadToast = toast.loading("Mengupload foto...");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setFotoProfil(data.url);
                toast.success("Foto berhasil diupload!", { id: uploadToast });
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Gagal mengupload foto.", { id: uploadToast });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                id: user.id,
                role: user.role,
                name: nama,
                username: username,
                jabatan: jabatan,
                avatar: fotoProfil,
                oldName: user.name // Send old name to trigger cascade update
            };

            if (activeTab === "security") {
                if (newPassword !== confirmPassword) {
                    toast.error("Konfirmasi password tidak cocok.");
                    setLoading(false);
                    return;
                }
                if (newPassword) {
                    payload.password = newPassword;
                    payload.oldPassword = oldPassword;
                }
            }

            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                updateUser({
                    name: nama,
                    username: username,
                    jabatan: jabatan,
                    avatar: fotoProfil
                });

                toast.success("Profil berhasil diperbarui!");
                if (activeTab === "security") {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                }
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update profile");
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil</h1>
                <p className="text-slate-500">Kelola informasi pribadi dan keamanan akun Anda.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar / Tabs */}
                <div className="lg:w-64 flex-shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                            activeTab === "profile"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        )}
                    >
                        <User className="w-5 h-5" />
                        Profil Saya
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                            activeTab === "security"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        )}
                    >
                        <Shield className="w-5 h-5" />
                        Keamanan
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

                        {/* Profil Saya */}
                        {activeTab === "profile" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Profil Saya</h3>
                                    <p className="text-slate-500 text-sm">Update foto dan nama tampilan Anda.</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Foto Profil */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative group cursor-pointer"
                                        >
                                            {fotoProfil ? (
                                                <img src={fotoProfil} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-slate-300" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-sm text-blue-600 font-medium hover:underline"
                                        >
                                            Ganti Foto
                                        </button>
                                    </div>

                                    {/* Form Data */}
                                    <div className="flex-1 w-full space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={nama}
                                                onChange={(e) => setNama(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Username (Login)</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Jabatan</label>
                                            <input
                                                type="text"
                                                value={jabatan}
                                                onChange={(e) => setJabatan(e.target.value)}
                                                placeholder="Contoh: Guru Kelas 1"
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Keamanan */}
                        {activeTab === "security" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Keamanan Akun</h3>
                                    <p className="text-slate-500 text-sm">Ganti password akun Anda.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Password Lama</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Password Baru</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
