import { NextResponse } from "next/server";
import { fetchFromGoogleSheets } from "@/lib/google-sheets";

export async function GET() {
    try {
        // Fetch all data in parallel
        const [users, suratMasuk, suratKeluar] = await Promise.all([
            fetchFromGoogleSheets("getUsers"),
            fetchFromGoogleSheets("getSuratMasuk"),
            fetchFromGoogleSheets("getSuratKeluar")
        ]);

        const totalUsers = Array.isArray(users) ? users.length : 0;
        const totalSuratMasuk = Array.isArray(suratMasuk) ? suratMasuk.length : 0;
        const totalSuratKeluar = Array.isArray(suratKeluar) ? suratKeluar.length : 0;

        // Calculate letters this month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const suratMasukBulanIni = Array.isArray(suratMasuk) ? suratMasuk.filter((s: any) => {
            const d = new Date(s.createdAt || s.tanggalMasuk); // Fallback to tanggalMasuk if createdAt missing
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length : 0;

        const suratKeluarBulanIni = Array.isArray(suratKeluar) ? suratKeluar.filter((s: any) => {
            const d = new Date(s.createdAt || s.tanggal); // Fallback to tanggal if createdAt missing
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length : 0;

        const suratBulanIni = suratMasukBulanIni + suratKeluarBulanIni;

        return NextResponse.json({
            totalUsers,
            totalSuratKeluar,
            totalSuratMasuk,
            suratBulanIni
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
