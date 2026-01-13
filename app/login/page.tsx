"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock, User } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { PublicFooter } from "@/components/public-footer";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Fetch users from API to verify credentials
            // In a real app, this should be a POST to /api/login
            const res = await fetch("/api/users");
            if (!res.ok) throw new Error("Gagal menghubungi server");

            const users = await res.json();
            const user = users.find((u: any) => u.username === username && u.password === password && u.status === "Active");

            if (user) {
                // Store user info (simplified session)
                localStorage.setItem("user", JSON.stringify(user));

                // Redirect based on role
                if (user.role === "Admin") {
                    router.push("/admin/surat-keluar");
                } else {
                    router.push("/member");
                }
            } else {
                setError("Username atau password salah, atau akun tidak aktif.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Terjadi kesalahan saat login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden">
            <AnimatedBackground />

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col items-center text-center space-y-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 relative animate-in zoom-in duration-500">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                                    SI <span className="text-blue-600">BUJUR</span>
                                </h1>
                            </div>
                        </div>

                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wider uppercase shadow-md shadow-blue-600/20">
                            Sistem Bukti & Jejak Surat
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                            Silakan login terlebih dahulu jika ingin mengelola surat keluar.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Username
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    placeholder="Masukkan password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Masuk ke Dashboard"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <PublicFooter />
        </main>
    );
}
