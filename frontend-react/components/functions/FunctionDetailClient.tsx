'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Printer, Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import GiftReceivedFormModal from '@/components/gifts/GiftReceivedFormModal';
import { deleteGiftReceived } from '@/lib/api';
import { revalidateFunction } from '@/app/actions/gifts.actions';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { FunctionReport, GiftReceived, Person } from '@/types';
import type { PaginationParams, PaginatedResponse } from '@/types/pagination';

interface Props {
    report: FunctionReport;
    persons: Person[];
    token: string;
    giftsOpts: Required<PaginationParams>;
}

export default function FunctionDetailClient({
    report, persons, token, giftsOpts,
}: Props) {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [editGift, setEditGift] = useState<GiftReceived | null>(null);

    // Derive directly from prop — never useState(report)
    const { function: fn, giftsReceived, summary } = report;

    // Build paginated shape from report data for DataTable
    // Sort and slice client-side (data already fetched server-side)
    const sortedGifts = [...giftsReceived].sort((a, b) => {
        const dir = giftsOpts.sortDir === 'asc' ? 1 : -1;
        switch (giftsOpts.sortBy) {
            case 'person':
                return dir * a.person?.name?.localeCompare(b.person?.name ?? '') ?? 0;
            case 'giftType':
                return dir * a.giftType.localeCompare(b.giftType);
            case 'amount':
                return dir * ((a.amount ?? 0) - (b.amount ?? 0));
            case 'receivedDate':
                return dir * (new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime());
            default:
                return 0;
        }
    });

    const paginatedGifts: PaginatedResponse<GiftReceived> = {
        items: sortedGifts.slice(
            (giftsOpts.page - 1) * giftsOpts.pageSize,
            giftsOpts.page * giftsOpts.pageSize,
        ),
        total: giftsReceived.length,
        page: giftsOpts.page,
        pageSize: giftsOpts.pageSize,
        totalPages: Math.ceil(giftsReceived.length / giftsOpts.pageSize),
        sortBy: giftsOpts.sortBy,
        sortDir: giftsOpts.sortDir,
    };

    function openAdd() { setEditGift(null); setModalOpen(true); }
    function openEdit(g: GiftReceived) { setEditGift(g); setModalOpen(true); }

    async function handleDelete(id: number) {
        if (!confirm('Remove this gift?')) return;
        await deleteGiftReceived(id, token);
        await revalidateFunction(fn.id);
        router.refresh();
    }

    async function onSaved() {
        setModalOpen(false);
        await revalidateFunction(fn.id);
        router.refresh();
    }

    function giftDetails(g: GiftReceived) {
        if (g.giftType === 'cash') return formatCurrency(g.amount);
        if (g.giftType === 'voucher') return g.voucherDetails ?? '—';
        return `${g.itemDescription ?? '—'} (Qty: ${g.quantity})`;
    }

    const columns: Column<GiftReceived>[] = [
        {
            key: '#',
            label: '#',
            sortable: false,
            className: 'w-12 text-gray-400 font-mono text-xs',
            render: (_, i) => i + 1,
        },
        {
            key: 'person',
            label: 'Person',
            sortable: true,
            render: row => (
                <div>
                    <div className="font-medium text-gray-900">{row.person?.name}</div>
                    {row.person?.address && (
                        <div className="text-xs text-gray-400 truncate max-w-[180px]">
                            {row.person.address}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'giftType',
            label: 'Type',
            sortable: true,
            render: row => <Badge type={row.giftType} />,
        },
        {
            key: 'amount',
            label: 'Details',
            sortable: true,
            className: 'font-medium',
            render: row => giftDetails(row),
        },
        {
            key: 'receivedDate',
            label: 'Date',
            sortable: true,
            render: row => formatDate(row.receivedDate),
        },
        {
            key: 'notes',
            label: 'Notes',
            sortable: false,
            className: 'text-gray-400',
            render: row => row.notes ?? '—',
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'no-print w-24',
            render: row => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => openEdit(row)}
                        className="btn-icon text-amber-600 hover:bg-amber-50"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="btn-icon text-red-600 hover:bg-red-50"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div id="printable">

            {/* ── Toolbar ───────────────────────────────────────── */}
            <div className="page-header no-print">
                <div className="flex items-center gap-3">
                    <Link href="/functions" className="btn-icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="page-title">{fn.name}</h1>
                        {fn.eventDate && (
                            <p className="text-sm text-gray-500">
                                {formatDate(fn.eventDate, 'long')}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={openAdd} className="btn-primary">
                        <Plus className="w-4 h-4" /> Add Gift
                    </button>
                    <button onClick={() => window.print()} className="btn-secondary">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* ── Print header ──────────────────────────────────── */}
            <div className="print-only hidden mb-4">
                <h1 className="text-2xl font-bold">{fn.name}</h1>
                <p className="text-gray-500">{formatDate(fn.eventDate, 'long')}</p>
                <hr className="my-3" />
            </div>

            {/* ── Stats ─────────────────────────────────────────── */}
            <div className="flex gap-4 mb-6">
                <StatCard label="Total Gifts" value={summary.totalCount} color="primary" />
                <StatCard label="Cash Received" value={formatCurrency(summary.totalCash)} color="green" />
                <StatCard label="Vouchers" value={summary.totalVouchers} color="orange" />
                <StatCard label="Items" value={summary.totalItems} color="blue" />
            </div>

            {/* ── Gifts table header ────────────────────────────── */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-700">
                    Gifts Received ({giftsReceived.length})
                </h2>
            </div>

            {/* ── Gifts DataTable ───────────────────────────────── */}
            <DataTable
                data={paginatedGifts}
                columns={columns}
                emptyText='No gifts recorded yet. Click "Add Gift" to begin.'
            />

            {/* ── Print footer ──────────────────────────────────── */}
            <div className="print-footer hidden mt-6 text-right text-xs text-gray-400">
                Printed on: {new Date().toLocaleString('en-IN')}
            </div>

            <GiftReceivedFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={onSaved}
                token={token}
                persons={persons}
                functionId={fn.id}
                eventDate={fn.eventDate}
                editGift={editGift}
            />
        </div>
    );
}
