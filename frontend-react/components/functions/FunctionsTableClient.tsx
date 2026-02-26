'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import FunctionFormModal from './FunctionFormModal';
import { deleteFunction } from '@/lib/api';
import { revalidateFunction } from '@/app/actions/gifts.actions';
import { formatDate } from '@/lib/utils';
import type { FunctionEvent } from '@/types';
import type { PaginatedResponse } from '@/types/pagination';

interface Props {
    token: string;
    data: PaginatedResponse<FunctionEvent>;
}

export default function FunctionsTableClient({ token, data }: Props) {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FunctionEvent | null>(null);

    function openAdd() { setEditing(null); setModalOpen(true); }
    function openEdit(f: FunctionEvent) { setEditing(f); setModalOpen(true); }

    async function handleDelete(f: FunctionEvent) {
        if (!confirm(`Delete "${f.name}"?`)) return;
        await deleteFunction(f.id, token);
        await revalidateFunction(f.id);
        router.refresh();
    }

    function onSaved() {
        setModalOpen(false);
        router.refresh();
    }

    const columns: Column<FunctionEvent>[] = [
        {
            key: '#',
            label: '#',
            sortable: false,
            className: 'w-12 text-gray-400 font-mono text-xs',
            render: (_, index) => index + 1,
        },
        {
            key: 'name',
            label: 'Function Name',
            sortable: true,
            render: row => (
                <div>
                    <div className="font-semibold text-gray-900">{row.name}</div>
                    {row.description && (
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'eventDate',
            label: 'Event Date',
            sortable: true,
            render: row => formatDate(row.eventDate),
        },
        {
            key: 'createdAt',
            label: 'Created',
            sortable: true,
            className: 'text-gray-400 text-xs',
            render: row => formatDate(row.createdAt),
        },
        {
            key: 'gifts',
            label: 'Gifts',
            sortable: false,
            className: 'text-center',
            render: row => (
                <span className="inline-flex items-center rounded-full
                         bg-primary-100 px-2.5 py-0.5
                         text-xs font-semibold text-primary-700">
                    {(row as any).giftsCount ?? row.giftsReceived?.length ?? 0}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'no-print w-28',
            render: row => (
                <div className="flex items-center gap-1">
                    <Link
                        href={`/functions/${row.id}`}
                        className="btn-icon text-primary-600 hover:bg-primary-50"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => openEdit(row)}
                        className="btn-icon text-amber-600 hover:bg-amber-50"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
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
        <div>
            <div className="page-header">
                <h1 className="page-title">Functions</h1>
                <button onClick={openAdd} className="btn-primary no-print">
                    <Plus className="w-4 h-4" /> New Function
                </button>
            </div>

            <DataTable
                data={data}
                columns={columns}
                emptyText='No functions yet. Click "New Function" to get started.'
            />

            <FunctionFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={onSaved}
                token={token}
                initial={editing}
            />
        </div>
    );
}
