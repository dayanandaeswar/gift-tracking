'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { FunctionEvent } from '@/types';
import { deleteFunction } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import FunctionFormModal from './FunctionFormModal';

interface Props { initialData: FunctionEvent[]; token: string; }

export default function FunctionListClient({ initialData, token }: Props) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FunctionEvent | null>(null);

    function openAdd() { setEditing(null); setModalOpen(true); }
    function openEdit(f: FunctionEvent) { setEditing(f); setModalOpen(true); }

    async function handleDelete(f: FunctionEvent) {
        if (!confirm(`Delete "${f.name}"?`)) return;
        await deleteFunction(f.id, token);
        router.refresh();
    }

    function onSaved() {
        setModalOpen(false);
        router.refresh();
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Functions</h1>
                <button onClick={openAdd} className="btn-primary no-print">
                    <Plus className="w-4 h-4" /> New Function
                </button>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-th">#</th>
                            <th className="table-th">Function Name</th>
                            <th className="table-th">Event Date</th>
                            <th className="table-th">Gifts</th>
                            <th className="table-th no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialData.map((f, i) => (
                            <tr key={f.id} className="hover:bg-gray-50 transition">
                                <td className="table-td text-gray-400 font-mono">{i + 1}</td>
                                <td className="table-td font-semibold text-gray-900">{f.name}</td>
                                <td className="table-td">{formatDate(f.eventDate)}</td>
                                <td className="table-td">
                                    <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                                        {f.giftsReceived?.length ?? 0} gifts
                                    </span>
                                </td>
                                <td className="table-td no-print">
                                    <div className="flex items-center gap-1">
                                        <Link href={`/functions/${f.id}`} className="btn-icon text-primary-600 hover:bg-primary-50" title="View">
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => openEdit(f)} className="btn-icon text-amber-600 hover:bg-amber-50" title="Edit">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(f)} className="btn-icon text-red-600 hover:bg-red-50" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!initialData.length && (
                    <div className="py-16 text-center text-gray-400">
                        No functions yet. Click "New Function" to get started.
                    </div>
                )}
            </div>

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
