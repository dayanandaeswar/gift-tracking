'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Gift, Pencil, Trash2 } from 'lucide-react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import PersonFormModal from './PersonFormModal';
import { deletePerson } from '@/lib/api';
import { revalidatePerson } from '@/app/actions/gifts.actions';
import type { Person } from '@/types';
import type { PaginatedResponse } from '@/types/pagination';

interface Props {
    token: string;
    data: PaginatedResponse<Person>;
}

export default function PersonsTableClient({ token, data }: Props) {
    const router = useRouter();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Person | null>(null);

    function openAdd() { setEditing(null); setModalOpen(true); }
    function openEdit(p: Person) { setEditing(p); setModalOpen(true); }

    async function handleDelete(p: Person) {
        if (!confirm(`Delete "${p.name}"?`)) return;
        await deletePerson(p.id, token);
        await revalidatePerson(p.id);
        router.refresh();
    }

    function onSaved() {
        setModalOpen(false);
        router.refresh();
    }

    const columns: Column<Person>[] = [
        {
            key: '#',
            label: '#',
            sortable: false,
            className: 'w-12 text-gray-400 font-mono text-xs',
            render: (_, index) => index + 1,
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: row => (
                <span className="font-semibold text-gray-900">{row.name}</span>
            ),
        },
        {
            key: 'address',
            label: 'Address',
            sortable: false,
            className: 'text-gray-500 max-w-[240px]',
            render: row => (
                <span className="truncate block max-w-[240px]">
                    {row.address ?? '—'}
                </span>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            sortable: true,
            className: 'text-gray-500',
            render: row => row.phone ?? '—',
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            className: 'no-print w-28',
            render: row => (
                <div className="flex items-center gap-1">
                    <Link
                        href={`/persons/${row.id}`}
                        className="btn-icon text-primary-600 hover:bg-primary-50"
                        title="View Gifts"
                    >
                        <Gift className="w-4 h-4" />
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
                <h1 className="page-title">Persons</h1>
                <button onClick={openAdd} className="btn-primary no-print">
                    <Plus className="w-4 h-4" /> New Person
                </button>
            </div>

            <DataTable
                data={data}
                columns={columns}
                emptyText="No persons yet. Click 'New Person' to get started."
            />

            <PersonFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={onSaved}
                token={token}
                initial={editing}
            />
        </div>
    );
}
