"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, CheckCircle2, Settings, Users, RefreshCw, X, LayoutDashboard, PenTool, Inbox, History, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useUser } from "@/components/ui/user-context";

type Role = "admin" | "guru";

const MENU_ITEMS = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["admin", "guru"],
    },
    {
        title: "Surat Keluar",
        href: "/admin/surat-keluar",
        icon: PenTool,
        roles: ["admin", "guru"],
    },
    {
        title: "Input Surat Masuk",
        href: "/admin/surat-masuk",
        icon: Inbox,
        roles: ["admin", "guru"],
    },
    {
        title: "Agenda Surat",
        href: "/admin/agenda",
        icon: BookOpen,
        roles: ["admin"],
    },
    {
        title: "Manajemen Pengguna",
        href: "/admin/pengguna",
        icon: Users,
        roles: ["admin"],
    },
    {
        title: "Pengaturan Surat",
        href: "/admin/pengaturan-surat",
        icon: FileText,
        roles: ["admin"],
    },
    {
        title: "Pengaturan",
        href: "/admin/settings",
        icon: Settings,
        roles: ["admin", "guru"],
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
    const [unuploadedCount, setUnuploadedCount] = useState<number>(0);

    // Fetch unuploaded count to show attention badge
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/surat-keluar", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const count = data.filter((item: any) => !(item.fileUrl || item.file_url || item.url || item.link || item.lampiran)).length;
                        setUnuploadedCount(count);
                    }
                }
            } catch (e) {
                // ignore
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, [pathname]);

    // Map user role to sidebar role
    // If user is Admin, show everything. If Guru/Member, hide restricted items.
    const userRole = user?.role === "Admin" ? "admin" : "guru";

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobile}
                />
            )}

            <aside
                className={cn(
                    "bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-xl shadow-slate-200/50",
                    isCollapsed ? "w-20" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={toggleCollapse}
                        title="Klik untuk mengecilkan menu"
                    >
                        <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            <span className="font-bold text-slate-900 text-lg block leading-none whitespace-nowrap">
                                SI BUJUR
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={closeMobile} className="md:hidden text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {MENU_ITEMS.filter((item) => item.roles.includes(userRole)).map((item) => {
                        let href = item.href;
                        if (userRole !== "admin" && href.startsWith("/admin")) {
                            href = href.replace("/admin", "/member");
                        }

                        const isActive = href === "/admin" || href === "/member"
                            ? pathname === href
                            : pathname.startsWith(href);

                        const isSuratKeluar = item.href === "/admin/surat-keluar";

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out relative group outline-none focus:outline-none border border-transparent",
                                    isActive
                                        ? "bg-blue-50/80 text-blue-700 shadow-sm backdrop-blur-sm border-blue-100"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                    isCollapsed && "justify-center px-2"
                                )}
                            >
                                <div className="relative flex items-center justify-center">
                                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                                    {/* Collapsed attention badge */}
                                    {isCollapsed && isSuratKeluar && unuploadedCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <>
                                        <span className="whitespace-nowrap">{item.title}</span>
                                        {/* Expanded attention badge */}
                                        {isSuratKeluar && unuploadedCount > 0 && (
                                            <span
                                                className="ml-auto bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-600/30 animate-pulse"
                                                title={`${unuploadedCount} surat keluar belum di-upload file`}
                                            >
                                                {unuploadedCount}
                                            </span>
                                        )}
                                    </>
                                )}

                                {/* Custom Tooltip for Collapsed State */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg shadow-blue-600/20 pointer-events-none z-50 flex items-center gap-2">
                                        <span>{item.title}</span>
                                        {isSuratKeluar && unuploadedCount > 0 && (
                                            <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                                                {unuploadedCount} belum upload
                                            </span>
                                        )}
                                        {/* Arrow */}
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-blue-600" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
