import { LetterTable } from "@/components/letter-table";

export default function RiwayatSuratKeluarPage() {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Riwayat Surat Keluar</h1>
                <p className="text-slate-500">Daftar arsip surat keluar yang telah dibuat.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <LetterTable />
            </div>
        </div>
    );
}
