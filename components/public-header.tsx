import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function PublicHeader() {
    return (
        <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between bg-white/30 backdrop-blur-xl sticky top-0 z-50 border-b border-white/20 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-none">
                            SI <span className="text-blue-600">BUJUR</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-500 tracking-wide">
                            SD NEGERI 2 PALAPI
                        </p>
                    </div>
                </div>

                <Link
                    href="/login"
                    className="text-sm font-bold text-blue-600 transition-all px-6 py-2 rounded-full border border-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-blue-600/30"
                >
                    Login
                </Link>
            </div>
        </header>
    );
}
