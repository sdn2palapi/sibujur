"use client";

import { Upload, Calendar, User, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

import { useUser } from "@/components/ui/user-context";
import { toast } from "sonner";

export function LetterForm() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [classificationCodes, setClassificationCodes] = useState<any[]>([]);

    useEffect(() => {
        const fetchCodes = async () => {
            try {
                const res = await fetch("/api/classifications");
                if (res.ok) {
                    const data = await res.json();
                    setClassificationCodes(data);
                }
            } catch (error) {
                console.error("Failed to fetch classifications:", error);
            }
        };
        fetchCodes();
    }, []);

    // Numbering State
    const [nomorUrut, setNomorUrut] = useState("001");

    // Fetch existing letters to determine next number
    useEffect(() => {
        const fetchLastNumber = async () => {
            try {
                const res = await fetch("/api/surat-keluar", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        // Extract numbers from existing letters
                        // Format is usually B-XXX/...
                        const numbers = data.map((letter: any) => {
                            const match = letter.nomor.match(/B-(\d+)/);
                            return match ? parseInt(match[1]) : 0;
                        });

                        const maxNum = Math.max(...numbers, 0);
                        setNomorUrut(String(maxNum + 1).padStart(3, '0'));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch last number:", error);
            }
        };
        fetchLastNumber();
    }, []);
    const [useSubNomor, setUseSubNomor] = useState(false);
    const [subCount, setSubCount] = useState<string>("");
    const [subPerihals, setSubPerihals] = useState<string[]>([]);
    const [kodeKlasifikasi, setKodeKlasifikasi] = useState("400.3.5");
    const [kodeInstansi, setKodeInstansi] = useState("/DIK-SDN2PLP/"); // Default fallback
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.kodeInstansi) {
                        setKodeInstansi(data.kodeInstansi);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);
    const [mainPerihal, setMainPerihal] = useState("");
    const [tujuan, setTujuan] = useState("");
    const [file, setFile] = useState<File | null>(null);

    // Helper to convert month to Roman
    const getRomanMonth = (dateString: string) => {
        const month = new Date(dateString).getMonth() + 1;
        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return roman[month - 1] || "";
    };

    const getYear = (dateString: string) => {
        return new Date(dateString).getFullYear();
    };

    // Handle Sub Count Change
    const handleSubCountChange = (val: string) => {
        setSubCount(val);
        const count = parseInt(val) || 0;
        // Preserve existing values if increasing, trim if decreasing
        setSubPerihals(prev => {
            const newArr = new Array(count).fill("");
            for (let i = 0; i < Math.min(prev.length, count); i++) {
                newArr[i] = prev[i];
            }
            return newArr;
        });
    };

    const handleSubPerihalChange = (index: number, val: string) => {
        const newSubs = [...subPerihals];
        newSubs[index] = val;
        setSubPerihals(newSubs);
    };

    // Construct Final Number Preview (Main)
    const finalNumber = `B-${nomorUrut}${useSubNomor ? `.${subCount}` : ""}${kodeInstansi}${kodeKlasifikasi}/${getRomanMonth(date)}/${getYear(date)}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate submission of multiple letters
        const lettersToSave = [];

        // 1. Main Letter
        lettersToSave.push({
            nomor: finalNumber,
            perihal: mainPerihal,
            tujuan: tujuan,
            tipe: "Induk",
            penginput: user.name,
            tanggal: new Date(date).toLocaleDateString("en-GB"),
            rawDate: date,
            status: "Published"
        });

        // 2. Sub Letters
        if (useSubNomor && subPerihals.length > 0) {
            subPerihals.forEach((subP, index) => {
                const subNum = `${nomorUrut}.${index + 1}`;
                const fullNomor = `B-${subNum}${kodeInstansi}${kodeKlasifikasi}/${getRomanMonth(date)}/${getYear(date)}`;
                lettersToSave.push({
                    nomor: fullNomor,
                    perihal: `${mainPerihal} - ${subP}`,
                    tujuan: tujuan,
                    tipe: `Sub-${index + 1}`,
                    penginput: user.name,
                    tanggal: new Date(date).toLocaleDateString("en-GB"),
                    rawDate: date,
                    status: "Published"
                });
            });
        }

        // Upload file if exists
        let fileUrl = "";
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.success) {
                    fileUrl = data.url;
                }
            } catch (err) {
                console.error("Upload failed", err);
                toast.error("Gagal mengupload file.");
            }
        }

        // Save to API
        try {
            // We'll save each letter individually for now, or you could batch them if the API supported it.
            // For simplicity, let's just save the first one or loop through them.
            // Since the user wants "cool" notifications, let's make it look good.

            const savePromises = lettersToSave.map(letter =>
                fetch("/api/surat-keluar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...letter,
                        fileUrl,
                        file_url: fileUrl,
                        link: fileUrl, Link: fileUrl,
                        lampiran: fileUrl, Lampiran: fileUrl,
                        url: fileUrl, Url: fileUrl,
                        file: fileUrl, File: fileUrl,
                        bukti: fileUrl, Bukti: fileUrl
                    })
                })
            );

            await Promise.all(savePromises);

            setLoading(false);

            // Simulate auto-increment for next letter
            const nextNum = String(parseInt(nomorUrut) + 1).padStart(3, '0');
            setNomorUrut(nextNum);
            setUseSubNomor(false);
            setSubCount("");
            setSubPerihals([]);
            setMainPerihal("");
            setTujuan("");
            setFile(null);

            const msg = useSubNomor
                ? `Berhasil menyimpan ${lettersToSave.length} surat (1 Induk + ${subPerihals.length} Sub)!`
                : `Surat berhasil disimpan! Nomor berikutnya: ${nextNum}`;

            toast.custom((t) => (
                <div className="bg-white rounded-xl shadow-xl border border-green-100 p-4 flex gap-4 w-[350px] animate-in slide-in-from-top-2 fade-in duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600" />
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">Surat Berhasil Disimpan!</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {useSubNomor
                                ? `${lettersToSave.length} surat telah ditambahkan ke database.`
                                : `Surat dengan nomor ${finalNumber} telah dibuat.`}
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => toast.dismiss(t)}
                                className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            ), { duration: 5000 });

        } catch (error) {
            console.error("Failed to save letters", error);
            setLoading(false);
            toast.error("Gagal menyimpan surat.", {
                description: "Terjadi kesalahan saat menghubungi server."
            });
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Input Surat Baru</h3>
                <p className="text-slate-500 text-sm">Input detail surat keluar di bawah ini.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8" autoComplete="off">
                {/* Section: Nomor Surat Otomatis */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Format Nomor Surat
                        </h4>
                        <div className="text-xs font-mono bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                            Preview: {finalNumber}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Prefix */}
                        <div className="md:col-span-1">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Prefix</label>
                            <div className="w-full px-3 py-2.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-600 font-mono text-sm text-center select-none">
                                B-
                            </div>
                        </div>

                        {/* Nomor Urut */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">No. Urut</label>
                            <input
                                type="text"
                                value={nomorUrut}
                                readOnly
                                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm outline-none cursor-not-allowed text-center"
                            />
                        </div>

                        {/* Sub Nomor Toggle & Input */}
                        <div className="md:col-span-2 relative">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={useSubNomor}
                                    onChange={(e) => setUseSubNomor(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                Sub Surat
                            </label>
                            <input
                                type="number"
                                value={subCount}
                                onChange={(e) => handleSubCountChange(e.target.value)}
                                disabled={!useSubNomor}
                                placeholder="Jml"
                                min="1"
                                max="100"
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-center disabled:bg-slate-100 disabled:text-slate-400"
                            />
                        </div>

                        {/* Instansi Code */}
                        <div className="md:col-span-3">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Kode Instansi</label>
                            <div className="w-full px-3 py-2.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-600 font-mono text-sm text-center select-none truncate">
                                {kodeInstansi}
                            </div>
                        </div>

                        {/* Kode Klasifikasi */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Klasifikasi</label>
                            <select
                                value={kodeKlasifikasi}
                                onChange={(e) => setKodeKlasifikasi(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all appearance-none"
                            >
                                {classificationCodes.map((item) => (
                                    <option
                                        key={item.code}
                                        value={item.code}
                                        className={item.type === 'main' ? 'font-bold bg-slate-50' : 'pl-4'}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bulan & Tahun */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Bulan/Thn</label>
                            <div className="w-full px-3 py-2.5 bg-slate-200 border border-slate-300 rounded-xl text-slate-600 font-mono text-sm text-center select-none truncate">
                                /{getRomanMonth(date)}/{getYear(date)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Standard Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tanggal Surat</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tujuan Surat</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={tujuan}
                                onChange={(e) => setTujuan(e.target.value)}
                                placeholder="Contoh: Kepala Dinas Pendidikan..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Perihal Utama</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={mainPerihal}
                            onChange={(e) => setMainPerihal(e.target.value)}
                            placeholder="Contoh: Undangan Rapat Koordinasi..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Dynamic Sub-Perihal Inputs */}
                {useSubNomor && subPerihals.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">Detail Sub Surat ({subPerihals.length})</label>
                            <span className="text-xs text-slate-500">Nomor {nomorUrut}.1 s/d {nomorUrut}.{subPerihals.length}</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {subPerihals.map((sub, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <div className="w-16 flex-shrink-0 text-xs font-mono text-slate-500 text-right pt-2">
                                        {nomorUrut}.{idx + 1}
                                    </div>
                                    <input
                                        type="text"
                                        value={sub}
                                        onChange={(e) => handleSubPerihalChange(idx, e.target.value)}
                                        placeholder={`Keterangan khusus untuk surat ke-${idx + 1}`}
                                        className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Upload Scan Surat (Opsional)</label>
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group text-center ${file ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                            }`}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFile(e.target.files[0]);
                                }
                            }}
                        />
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            {file ? <FileText className="w-6 h-6 text-blue-600" /> : <Upload className="w-6 h-6 text-blue-600" />}
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                            {file ? file.name : "Klik untuk upload atau drag & drop file"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF atau JPG (Maks. 5MB)"}
                        </p>
                        {file && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                                className="mt-2 text-xs text-red-500 hover:underline"
                            >
                                Hapus File
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
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
                            "Simpan Surat"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
