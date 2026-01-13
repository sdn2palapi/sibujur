"use client";

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[120px] animate-blob mix-blend-multiply filter" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply filter" />
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply filter" />
        </div>
    );
}
