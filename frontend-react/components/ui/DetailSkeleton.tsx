export default function DetailSkeleton() {
    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
                    <div>
                        <div className="h-7 w-52 bg-gray-200 rounded-lg animate-pulse mb-1" />
                        <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Stat cards */}
            <div className="flex gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="card flex-1 p-5 text-center">
                        <div className="h-9 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mx-auto" />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                    ))}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-100">
                        {[1, 2, 3, 4, 5, 6].map(j => (
                            <div key={j}
                                className="h-4 bg-gray-100 rounded animate-pulse flex-1"
                                style={{ opacity: 1 - i * 0.08 }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
