"use client";

import { useState, useEffect, useRef } from "react";
import { Save, School, Settings as SettingsIcon, Shield, Upload, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/components/ui/user-context";
import { PageSkeleton } from "@/components/page-skeleton";

export default function AdminSettings() {
    const { updateUser } = useUser();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for form fields
    const [namaSekolah, setNamaSekolah] = useState("");
    const [alamatSekolah, setAlamatSekolah] = useState("");
    const [emailSekolah, setEmailSekolah] = useState("");
    const [teleponSekolah, setTeleponSekolah] = useState("");
    const [kabupatenSekolah, setKabupatenSekolah] = useState("");
    const [namaKepsek, setNamaKepsek] = useState("");
    const [nipKepsek, setNipKepsek] = useState("");

    const [namaAdmin, setNamaAdmin] = useState("");
    const [usernameAdmin, setUsernameAdmin] = useState("");
    const [nipAdmin, setNipAdmin] = useState("");
    const [jabatanAdmin, setJabatanAdmin] = useState("");
    const [hpAdmin, setHpAdmin] = useState("");
    const [fotoProfil, setFotoProfil] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Reset image error when photo changes
    useEffect(() => {
        setImageError(false);
    }, [fotoProfil]);

    // ... (rest of the file)


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setNamaSekolah(data.namaSekolah || "");
                        setAlamatSekolah(data.alamatSekolah || "");
                        setEmailSekolah(data.emailSekolah || "");
                        setTeleponSekolah(data.teleponSekolah ? String(data.teleponSekolah) : "");
                        setKabupatenSekolah(data.kabupatenSekolah || "");
                        setNamaKepsek(data.namaKepsek || "");
                        setNipKepsek(data.nipKepsek ? String(data.nipKepsek) : "");
                        setNamaAdmin(data.namaAdmin || "");
                        setUsernameAdmin(data.usernameAdmin || "");
                        setNipAdmin(data.nipAdmin ? String(data.nipAdmin) : "");
                        setJabatanAdmin(data.jabatanAdmin || "");
                        setHpAdmin(data.hpAdmin ? String(data.hpAdmin) : "");
                        setFotoProfil(data.fotoProfil || null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast.error("Gagal memuat pengaturan.");
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            toast.error("Ukuran file maksimal 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profile_photos"); // Request specific folder

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

    const getDisplayUrl = (url: string | null) => {
        if (!url) return null;
        try {
            // Handle Google Drive UC Links (export=view)
            if (url.includes("drive.google.com/uc?")) {
                const idMatch = url.match(/id=([^&]+)/);
                if (idMatch && idMatch[1]) {
                    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                }
            }
            // Handle Google Drive View Links
            if (url.includes("drive.google.com/file/d/")) {
                const id = url.split("/d/")[1].split("/")[0];
                return `https://lh3.googleusercontent.com/d/${id}`;
            }
            // Handle Google Drive Open Links
            if (url.includes("drive.google.com/open?id=")) {
                const id = url.split("id=")[1].split("&")[0];
                return `https://lh3.googleusercontent.com/d/${id}`;
            }
            // Handle raw IDs (assuming they are Drive IDs if they don't look like URLs)
            if (!url.startsWith("http") && url.length > 20 && !url.includes("/")) {
                return `https://lh3.googleusercontent.com/d/${url}`;
            }
        } catch (e) {
            console.error("Error parsing URL:", e);
        }
        return url;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const settingsData = {
            namaSekolah,
            alamatSekolah,
            emailSekolah,
            teleponSekolah,
            kabupatenSekolah,
            namaKepsek,
            nipKepsek,
            namaAdmin,
            usernameAdmin,
            nipAdmin,
            jabatanAdmin,
            hpAdmin,
            fotoProfil
        };

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settingsData),
            });

            if (res.ok) {
                // Update global user context immediately
                updateUser({
                    name: namaAdmin,
                    username: usernameAdmin,
                    jabatan: jabatanAdmin,
                    avatar: fotoProfil
                });

                toast.success("Pengaturan berhasil disimpan!", {
                    description: "Perubahan data telah diperbarui di sistem.",
                    duration: 4000,
                });
            } else {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save");
            }
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error("Gagal menyimpan pengaturan.", {
                description: error.message || "Terjadi kesalahan saat menghubungi server.",
            });
        } finally {
            setLoading(false);
        }
    };



    if (fetching) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
                <p className="text-slate-500">Kelola profil sekolah, data admin, dan keamanan akun.</p>
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
                        <School className="w-5 h-5" />
                        Profil Sekolah
                    </button>
                    <button
                        onClick={() => setActiveTab("admin")}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                            activeTab === "admin"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                        )}
                    >
                        <User className="w-5 h-5" />
                        Profil Admin
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

                        {/* Profil Sekolah */}
                        {activeTab === "profile" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Profil Sekolah</h3>
                                    <p className="text-slate-500 text-sm">Informasi dasar sekolah untuk kop surat dan laporan.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Nama Sekolah</label>
                                        <input
                                            type="text"
                                            value={namaSekolah}
                                            onChange={(e) => setNamaSekolah(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                                        <textarea
                                            value={alamatSekolah}
                                            onChange={(e) => setAlamatSekolah(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Email Sekolah</label>
                                            <input
                                                type="email"
                                                value={emailSekolah}
                                                onChange={(e) => setEmailSekolah(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
                                            <input
                                                type="text"
                                                value={teleponSekolah}
                                                onChange={(e) => setTeleponSekolah(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Kabupaten / Kota</label>
                                        <input
                                            type="text"
                                            value={kabupatenSekolah}
                                            onChange={(e) => setKabupatenSekolah(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Nama Kepala Sekolah</label>
                                            <input
                                                type="text"
                                                value={namaKepsek}
                                                onChange={(e) => setNamaKepsek(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">NIP Kepala Sekolah</label>
                                            <input
                                                type="text"
                                                value={nipKepsek}
                                                onChange={(e) => setNipKepsek(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}

                        {/* Profil Admin */}
                        {activeTab === "admin" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Profil Admin</h3>
                                    <p className="text-slate-500 text-sm">Kelola informasi pribadi dan data kepegawaian Anda.</p>
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
                                            {fotoProfil && !imageError ? (
                                                <img
                                                    src={getDisplayUrl(fotoProfil) || ""}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <User className="w-12 h-12 text-slate-300" />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        {/* DEBUG: Show URL */}
                                        {fotoProfil && <p className="text-[10px] text-slate-400 max-w-[200px] break-all">{fotoProfil}</p>}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    value={namaAdmin}
                                                    onChange={(e) => setNamaAdmin(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Username (Login)</label>
                                                <input
                                                    type="text"
                                                    value={usernameAdmin}
                                                    onChange={(e) => setUsernameAdmin(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">NIP (Opsional)</label>
                                                <input
                                                    type="text"
                                                    value={nipAdmin}
                                                    onChange={(e) => setNipAdmin(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Jabatan</label>
                                                <input
                                                    type="text"
                                                    value={jabatanAdmin}
                                                    onChange={(e) => setJabatanAdmin(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Nomor HP / WA</label>
                                                <input
                                                    type="text"
                                                    value={hpAdmin}
                                                    onChange={(e) => setHpAdmin(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                                />
                                            </div>
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
                                    <p className="text-slate-500 text-sm">Update password untuk akun administrator.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Password Lama</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Password Baru</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Konfirmasi Password Baru</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all" />
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
