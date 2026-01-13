export function PageHeaderSkeleton() {
    return (
        <div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse-fast mb-2"></div>
            <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse-fast"></div>
        </div>
    );
}

export function PageContentSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Toolbar/Filter Bar Skeleton */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
                <div className="h-10 w-full md:w-64 bg-slate-200 rounded-lg animate-pulse-fast"></div>
                <div className="flex gap-2">
                    <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse-fast"></div>
                    <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse-fast"></div>
                </div>
            </div>

            {/* Table/Content Rows Skeleton */}
            <div className="p-0">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-4 border-b border-slate-100 last:border-0">
                        <div className="h-4 w-8 bg-slate-200 rounded animate-pulse-fast mr-4"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse-fast"></div>
                            <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse-fast"></div>
                        </div>
                        <div className="h-8 w-24 bg-slate-200 rounded animate-pulse-fast"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-300">
            <PageHeaderSkeleton />
            <PageContentSkeleton />
        </div>
    );
}
