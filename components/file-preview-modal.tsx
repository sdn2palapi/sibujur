"use client";

import { X, Download, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    fileUrl?: string; // Mock URL
}

export function FilePreviewModal({ isOpen, onClose, fileName, fileUrl }: FilePreviewModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const getPreviewUrl = (url?: string) => {
        if (!url) return "";

        // Try to extract ID from "id=" parameter
        const idMatch = url.match(/id=([^&]+)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
        }

        // Try to extract ID from "/d/" path
        const dMatch = url.match(/\/d\/([^\/]+)/);
        if (dMatch && dMatch[1]) {
            return `https://drive.google.com/file/d/${dMatch[1]}/preview`;
        }

        return url;
    };

    const previewUrl = getPreviewUrl(fileUrl);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FileTextIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 truncate max-w-md">{fileName}</h3>
                            <p className="text-xs text-slate-500">Google Drive Preview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.open(fileUrl, "_blank")}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download / Buka Asli"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => window.open(previewUrl, "_blank")}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Buka di Tab Baru"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Tutup"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body (Iframe) */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-none"
                            allow="autoplay"
                            title="File Preview"
                        />
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <p>URL file tidak valid atau tidak dapat dipreview.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
}
