'use client';

import {
    useRouter, useSearchParams, usePathname,
} from 'next/navigation';
import {
    ArrowUp, ArrowDown, ArrowUpDown,
    ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { PaginatedResponse } from '@/types/pagination';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    className?: string;
    render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    data: PaginatedResponse<T>;
    columns: Column<T>[];
    emptyText?: string;
}

const PAGE_SIZES = [10, 20, 50, 100];

export default function DataTable<T extends { id: number }>({
    data,
    columns,
    emptyText = 'No records found.',
}: DataTableProps<T>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Always read from URL — single source of truth
    const page = Number(searchParams.get('page') ?? data.page);
    const pageSize = Number(searchParams.get('pageSize') ?? data.pageSize);
    const sortBy = searchParams.get('sortBy') ?? data.sortBy;
    const sortDir = (searchParams.get('sortDir') ?? data.sortDir) as 'asc' | 'desc';

    const { items = [], total = 0, totalPages = 0 } = data;
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    // ── URL state helpers ────────────────────────────────────────
    function push(next: Partial<{
        page: number; pageSize: number;
        sortBy: string; sortDir: 'asc' | 'desc';
    }>) {
        const sp = new URLSearchParams(searchParams.toString());
        if (next.page !== undefined) sp.set('page', String(next.page));
        if (next.pageSize !== undefined) sp.set('pageSize', String(next.pageSize));
        if (next.sortBy !== undefined) sp.set('sortBy', next.sortBy);
        if (next.sortDir !== undefined) sp.set('sortDir', next.sortDir);
        // Reset to page 1 when sort or pageSize changes
        if (next.sortBy !== undefined || next.pageSize !== undefined) {
            sp.set('page', '1');
        }
        router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    }

    function onSort(col: string) {
        const nextDir: 'asc' | 'desc' =
            sortBy === col ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
        push({ sortBy: col, sortDir: nextDir });
    }

    // ── Page numbers ─────────────────────────────────────────────
    function pageNumbers(): (number | '…')[] {
        if (totalPages <= 7)
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '…')[] = [1];
        if (page > 3) pages.push('…');
        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, page + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (page < totalPages - 2) pages.push('…');
        pages.push(totalPages);
        return pages;
    }

    return (
        <div className="card overflow-hidden">

            {/* ── Top meta row ──────────────────────────────────── */}
            <div className="flex items-center justify-between
                      px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs text-gray-500">
                    {total === 0
                        ? 'No results'
                        : <>
                            Showing{' '}
                            <span className="font-semibold">{from}</span>–
                            <span className="font-semibold">{to}</span>{' '}
                            of <span className="font-semibold">{total}</span>
                        </>}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <label htmlFor="pageSize">Rows:</label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={e => push({ pageSize: Number(e.target.value) })}
                        className="input py-0.5 px-2 h-7 w-[72px] text-xs"
                    >
                        {PAGE_SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    className={clsx('table-th select-none', col.className)}
                                >
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => onSort(col.key)}
                                            className="inline-flex items-center gap-1
                                 text-xs font-semibold uppercase tracking-wide
                                 hover:text-primary-700 transition"
                                        >
                                            {col.label}
                                            {sortBy !== col.key && (
                                                <ArrowUpDown className="w-3 h-3 text-gray-300" />
                                            )}
                                            {sortBy === col.key && sortDir === 'asc' && (
                                                <ArrowUp className="w-3 h-3 text-primary-600" />
                                            )}
                                            {sortBy === col.key && sortDir === 'desc' && (
                                                <ArrowDown className="w-3 h-3 text-primary-600" />
                                            )}
                                        </button>
                                    ) : (
                                        <span className="text-xs font-semibold uppercase tracking-wide">
                                            {col.label}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-16 text-center text-sm text-gray-400"
                                >
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            items.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                                >
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={clsx('table-td', col.className)}
                                        >
                                            {col.render(row, from + index - 1)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1
                        px-4 py-3 border-t border-gray-100">
                    <button
                        onClick={() => push({ page: 1 })}
                        disabled={page <= 1}
                        className="btn-icon disabled:opacity-30"
                        title="First"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => push({ page: page - 1 })}
                        disabled={page <= 1}
                        className="btn-icon disabled:opacity-30"
                        title="Previous"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {pageNumbers().map((p, i) =>
                        p === '…' ? (
                            <span key={`e${i}`}
                                className="px-1 text-gray-400 select-none text-sm">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => push({ page: p as number })}
                                className={clsx(
                                    'w-8 h-8 rounded-lg text-sm font-medium transition',
                                    page === p
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100',
                                )}
                            >
                                {p}
                            </button>
                        ),
                    )}

                    <button
                        onClick={() => push({ page: page + 1 })}
                        disabled={page >= totalPages}
                        className="btn-icon disabled:opacity-30"
                        title="Next"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => push({ page: totalPages })}
                        disabled={page >= totalPages}
                        className="btn-icon disabled:opacity-30"
                        title="Last"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
