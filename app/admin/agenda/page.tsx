"use client";

import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Calendar } from "lucide-react";
import { useUser } from "@/components/ui/user-context";
import { PageSkeleton } from "@/components/page-skeleton";



export default function AgendaPage() {
    const [activeTab, setActiveTab] = useState<"masuk" | "keluar">("masuk");
    const [incomingData, setIncomingData] = useState<any[]>([]);
    const [outgoingData, setOutgoingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const componentRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [settings, setSettings] = useState({
        namaSekolah: "SMK NEGERI 2 PALANGKA RAYA",
        kabupatenSekolah: "Palangka Raya",
        namaKepsek: "H. SUNDAJO, S.Pd., M.Pd.",
        nipKepsek: "19700101 199503 1 005"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, incomingRes, outgoingRes] = await Promise.all([
                    fetch("/api/settings", { cache: "no-store" }),
                    fetch("/api/surat-masuk", { cache: "no-store" }),
                    fetch("/api/surat-keluar", { cache: "no-store" })
                ]);

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (Object.keys(data).length > 0) {
                        setSettings(prev => ({
                            ...prev,
                            namaSekolah: data.namaSekolah || prev.namaSekolah,
                            kabupatenSekolah: data.kabupatenSekolah || prev.kabupatenSekolah,
                            namaKepsek: data.namaKepsek || prev.namaKepsek,
                            nipKepsek: data.nipKepsek || prev.nipKepsek
                        }));
                    }
                }

                if (incomingRes.ok) {
                    const data = await incomingRes.json();
                    setIncomingData(data);
                }

                if (outgoingRes.ok) {
                    const data = await outgoingRes.json();
                    setOutgoingData(data);
                }

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Print Handler
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Agenda_Surat_${activeTab}_${new Date().toISOString().split('T')[0]}`,
    });

    const data = activeTab === "masuk" ? incomingData : outgoingData;

    if (loading) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Buku Agenda Surat</h1>
                    <p className="text-slate-500">Rekapitulasi surat masuk dan keluar untuk laporan.</p>
                </div>
                <button
                    onClick={() => handlePrint()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Cetak Agenda
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("masuk")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "masuk" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Agenda Surat Masuk
                </button>
                <button
                    onClick={() => setActiveTab("keluar")}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "keluar" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Agenda Surat Keluar
                </button>
            </div>

            {/* Preview & Print Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 overflow-x-auto" ref={componentRef}>
                    {/* Print Header - Only visible when printing usually, but we show it here for preview */}
                    <div className="mb-8 text-center hidden print:block">
                        <h2 className="text-xl font-bold uppercase">Buku Agenda Surat {activeTab === "masuk" ? "Masuk" : "Keluar"}</h2>
                        <h3 className="text-lg font-semibold uppercase">{settings.namaSekolah}</h3>
                        <p className="text-sm text-slate-500">Periode: Desember 2024</p>
                    </div>

                    <table className="w-full text-left text-sm border-collapse border border-slate-300">
                        <thead className="bg-slate-50 text-slate-900 font-bold text-center">
                            <tr>
                                <th className="border border-slate-300 px-4 py-2 w-12">No</th>
                                <th className="border border-slate-300 px-4 py-2">Nomor Surat</th>
                                <th className="border border-slate-300 px-4 py-2">Tanggal</th>
                                <th className="border border-slate-300 px-4 py-2">
                                    {activeTab === "masuk" ? "Pengirim" : "Tujuan"}
                                </th>
                                <th className="border border-slate-300 px-4 py-2">Perihal</th>
                                <th className="border border-slate-300 px-4 py-2">Ket</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.id} className="print:break-inside-avoid">
                                    <td className="border border-slate-300 px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border border-slate-300 px-4 py-2">{item.nomor}</td>
                                    <td className="border border-slate-300 px-4 py-2 text-center">
                                        {activeTab === "masuk" ? item.tanggalMasuk : item.tanggal}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2">
                                        {activeTab === "masuk" ? item.pengirim : item.tujuan}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-2">{item.perihal}</td>
                                    <td className="border border-slate-300 px-4 py-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Signature Block */}
                    <div className="mt-16 flex justify-end print:break-inside-avoid">
                        <div className="text-center min-w-[200px]">
                            <p className="mb-1">{settings.kabupatenSekolah}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p className="font-bold mb-20">Kepala Sekolah,</p>
                            <p className="font-bold underline">{settings.namaKepsek}</p>
                            <p>NIP. {settings.nipKepsek}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 20mm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .hidden.print\\:block {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
