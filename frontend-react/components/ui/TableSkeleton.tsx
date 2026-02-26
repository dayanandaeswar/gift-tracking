export default function TableSkeleton({
    title,
    cols = 5,
    rows = 6,
}: {
    title: string;
    cols?: number;
    rows?: number;
}) {
    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {/* Table header */}
                <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b">
                    {Array.from({ length: cols }).map((_, i) => (
                        <div key={i}
                            className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-100">
                        {Array.from({ length: cols }).map((_, j) => (
                            <div key={j}
                                className="h-4 bg-gray-100 rounded animate-pulse flex-1"
                                style={{ opacity: 1 - i * 0.1 }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
