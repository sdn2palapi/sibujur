export function AdminFooter() {
    return (
        <footer className="bg-white border-t border-slate-200 py-6 px-8 text-center md:text-left shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <p className="text-sm text-slate-500">
                <span className="md:hidden">
                    &copy; {new Date().getFullYear()} <span className="font-bold mx-1">|</span> Si Bujur by <a href="https://www.instagram.com/masalfy" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-700 hover:text-blue-600 transition-colors">Mas Alfy</a>
                </span>
                <span className="hidden md:inline">
                    &copy; {new Date().getFullYear()} | Si Bujur (Sistem Bukti & Jejak Surat) by <a href="https://www.instagram.com/masalfy" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-700 hover:text-blue-600 transition-colors">Mas Alfy</a>. All rights reserved.
                </span>
            </p>
        </footer>
    );
}
