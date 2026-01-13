"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminFooter } from "@/components/admin-footer";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar-context";
import { UserProvider, useUser } from "@/components/ui/user-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }

        const parsed = JSON.parse(storedUser);
        if (parsed.role !== "Admin") {
            router.push("/member");
        }
    }, [router]);

    return (
        <div className="h-screen bg-slate-50 flex overflow-hidden">
            <AdminSidebar />
            <div
                className={cn(
                    "flex-1 flex flex-col h-full transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                <AdminHeader />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto space-y-8">{children}</div>
                </main>
                <AdminFooter />
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProvider>
            <SidebarProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </SidebarProvider>
        </UserProvider>
    );
}

