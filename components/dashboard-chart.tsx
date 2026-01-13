"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface ChartData {
    month: string;
    masuk: number;
    keluar: number;
}

interface DashboardChartProps {
    data: ChartData[];
    className?: string;
    hideTitle?: boolean;
}

export function DashboardChart({ data, className, hideTitle = false }: DashboardChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const maxValue = useMemo(() => {
        return Math.max(...data.map(d => Math.max(d.masuk, d.keluar)), 5); // Min max 5
    }, [data]);

    // Helper to calculate Y position
    const getY = (value: number) => {
        const height = 200; // Chart height
        const padding = 20;
        const availableHeight = height - padding * 2;
        return height - padding - (value / maxValue) * availableHeight;
    };

    // Helper to calculate X position
    const getX = (index: number) => {
        const width = 100; // Percentage
        return (index / (data.length - 1)) * width;
    };

    // Generate smooth path
    const generatePath = (type: 'masuk' | 'keluar') => {
        if (data.length === 0) return "";

        const points = data.map((d, i) => ({
            x: getX(i),
            y: getY(type === 'masuk' ? d.masuk : d.keluar)
        }));

        let path = `M 0,${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;

            // Using percentage for X, pixels for Y is tricky in SVG path d attribute if viewBox is not set correctly.
            // Let's assume viewBox width is 1000 for easier calculation.
            // Re-calculating points based on 1000 width.
        }
        return "";
    };

    // Simplified Path Generation with fixed viewBox width 1000
    const width = 1000;
    const height = 200;

    const getPoint = (index: number, value: number) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - (value / maxValue) * height; // Removed bottom padding completely
        return { x, y };
    };

    const makePath = (type: 'masuk' | 'keluar') => {
        if (data.length === 0) return "";
        const points = data.map((d, i) => getPoint(i, type === 'masuk' ? d.masuk : d.keluar));

        let d = `M ${points[0].x},${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp2x = p0.x + (p1.x - p0.x) / 2;

            d += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    const makeArea = (type: 'masuk' | 'keluar') => {
        const linePath = makePath(type);
        return `${linePath} L ${width},${height} L 0,${height} Z`;
    };

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col ${className || ""}`}>
            <div className="flex items-center justify-between mb-2 md:mb-6">
                {!hideTitle ? (
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Statistik Surat</h3>
                        <p className="text-sm text-slate-500">Grafik tahun berjalan (Jan - Des)</p>
                    </div>
                ) : <div />} {/* Spacer if title hidden */}

                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-slate-600">Masuk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Keluar</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative min-h-[160px] md:min-h-[250px] w-full">
                {/* SVG Chart */}
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                        <line
                            key={t}
                            x1="0"
                            y1={height - t * height}
                            x2={width}
                            y2={height - t * height}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Areas */}
                    <motion.path
                        d={makeArea('masuk')}
                        fill="url(#gradMasuk)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 1 }}
                    />
                    <motion.path
                        d={makeArea('keluar')}
                        fill="url(#gradKeluar)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Lines */}
                    <motion.path
                        d={makePath('masuk')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    <motion.path
                        d={makePath('keluar')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    />

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Interactive Points Overlay */}
                    {data.map((d, i) => {
                        const pm = getPoint(i, d.masuk);
                        const pk = getPoint(i, d.keluar);
                        return (
                            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                                {/* Invisible hit area */}
                                <rect
                                    x={getPoint(i, 0).x - (width / data.length / 2)}
                                    y="0"
                                    width={width / data.length}
                                    height={height}
                                    fill="transparent"
                                    className="cursor-crosshair"
                                />

                                {hoveredIndex === i && (
                                    <>
                                        <circle cx={pm.x} cy={pm.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                                        <circle cx={pk.x} cy={pk.y} r="6" fill="#10b981" stroke="white" strokeWidth="2" />
                                        <line x1={pm.x} y1={0} x2={pm.x} y2={height} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                                    </>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-0 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded-lg py-2 px-3 shadow-xl z-20 pointer-events-none"
                        style={{
                            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="font-bold mb-1 border-b border-white/10 pb-1">{data[hoveredIndex].month}</div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Masuk: {data[hoveredIndex].masuk}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Keluar: {data[hoveredIndex].keluar}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between -mt-2 md:mt-2 px-2 relative z-10">
                {data.map((d, i) => (
                    <div key={i} className="text-[10px] md:text-xs text-slate-400 font-medium text-center w-8">
                        {d.month}
                    </div>
                ))}
            </div>
        </div>
    );
}
