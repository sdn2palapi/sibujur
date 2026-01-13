"use client";

import { Bell, LogOut, User, Menu, Search, ArrowUpRight, ArrowDownLeft, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useUser } from "@/components/ui/user-context";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NotificationItem {
    id: string;
    type: 'masuk' | 'keluar';
    nomor: string;
    perihal: string;
    date: Date;
    senderOrReceiver: string;
    isRead: boolean;
}

export function AdminHeader() {
    const { toggleMobile } = useSidebar();
    const { user } = useUser();

    // Notification State
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const [masukRes, keluarRes] = await Promise.all([
                    fetch("/api/surat-masuk", { cache: "no-store" }),
                    fetch("/api/surat-keluar", { cache: "no-store" })
                ]);

                if (masukRes.ok && keluarRes.ok) {
                    const masuk = await masukRes.json();
                    const keluar = await keluarRes.json();

                    const combined = [
                        ...masuk.map((m: any) => ({
                            id: `m-${m.id}`,
                            type: 'masuk',
                            nomor: m.nomor,
                            perihal: m.perihal,
                            date: new Date(m.rawDate),
                            senderOrReceiver: m.pengirim,
                            isRead: false
                        })),
                        ...keluar.map((k: any) => ({
                            id: `k-${k.id}`,
                            type: 'keluar',
                            nomor: k.nomor,
                            perihal: k.perihal,
                            date: new Date(k.rawDate),
                            senderOrReceiver: k.tujuan,
                            isRead: false
                        }))
                    ];

                    // Sort by date desc
                    combined.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

                    // Take top 5
                    setNotifications(combined.slice(0, 5) as NotificationItem[]);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const [imageError, setImageError] = useState(false);

    // Reset image error when avatar changes
    useEffect(() => {
        setImageError(false);
    }, [user.avatar]);

    const getDisplayUrl = (url: string | null) => {
        if (!url) return null;
        if (url.includes("ui-avatars.com")) return null; // Explicitly block ui-avatars
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

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm/50 backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMobile}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="relative hidden md:block w-full max-w-xl ml-4">
                    <input
                        type="text"
                        placeholder="Cari surat, arsip, atau menu..."
                        className="peer w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-all duration-300 peer-focus:left-4 peer-focus:text-blue-600" />
                </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "relative p-2.5 rounded-xl transition-all duration-200 outline-none",
                            isOpen
                                ? "bg-blue-50 text-blue-600 shadow-sm ring-2 ring-blue-100"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right z-50 ring-1 ring-black/5">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Update aktivitas surat terbaru</p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" />
                                        Tandai dibaca
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600/50" />
                                        <span className="text-xs">Memuat notifikasi...</span>
                                    </div>
                                ) : notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => markAsRead(item.id)}
                                                className={cn(
                                                    "p-4 hover:bg-slate-50 transition-all group cursor-pointer relative",
                                                    !item.isRead && "bg-blue-50/30"
                                                )}
                                            >
                                                {!item.isRead && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                                )}
                                                <div className="flex gap-3.5">
                                                    <div className={cn(
                                                        "mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm",
                                                        item.type === 'masuk' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                                    )}>
                                                        {item.type === 'masuk' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                                item.type === 'masuk'
                                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            )}>
                                                                {item.type === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                                                                {item.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <p className={cn(
                                                            "text-sm font-semibold text-slate-900 truncate mb-0.5 leading-snug",
                                                            !item.isRead && "text-blue-900"
                                                        )}>
                                                            {item.perihal}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                                                            <span className="font-medium text-slate-600">{item.senderOrReceiver}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span className="font-mono text-slate-400">{item.nomor}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-900 font-medium text-sm">Tidak ada notifikasi</p>
                                        <p className="text-slate-500 text-xs mt-1">Aktivitas surat akan muncul di sini.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center">
                                <Link href="/admin/riwayat/surat-masuk" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 group">
                                    Lihat Semua Aktivitas
                                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1.5">{user.jabatan}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-slate-100">
                        {user.avatar && !imageError && getDisplayUrl(user.avatar) ? (
                            <img
                                src={getDisplayUrl(user.avatar) || ""}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <User className="w-5 h-5 text-blue-600" />
                        )}
                    </div>

                    <Link
                        href="/login"
                        className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Keluar"
                    >
                        <LogOut className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
