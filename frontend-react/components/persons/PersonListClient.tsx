'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Gift, Pencil, Trash2 } from 'lucide-react';
import { Person } from '@/types';
import { deletePerson } from '@/lib/api';
import PersonFormModal from './PersonFormModal';

interface Props { initialData: Person[]; token: string; }

export default function PersonListClient({ initialData, token }: Props) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Person | null>(null);

    function openAdd() { setEditing(null); setModalOpen(true); }
    function openEdit(p: Person) { setEditing(p); setModalOpen(true); }

    async function handleDelete(p: Person) {
        if (!confirm(`Delete "${p.name}"?`)) return;
        await deletePerson(p.id, token);
        router.refresh();
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Persons</h1>
                <button onClick={openAdd} className="btn-primary no-print">
                    <Plus className="w-4 h-4" /> New Person
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-th">#</th>
                            <th className="table-th">Name</th>
                            <th className="table-th">Address</th>
                            <th className="table-th">Phone</th>
                            <th className="table-th no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialData.map((p, i) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition">
                                <td className="table-td text-gray-400 font-mono">{i + 1}</td>
                                <td className="table-td font-semibold text-gray-900">{p.name}</td>
                                <td className="table-td text-gray-500">{p.address ?? '—'}</td>
                                <td className="table-td text-gray-500">{p.phone ?? '—'}</td>
                                <td className="table-td no-print">
                                    <div className="flex items-center gap-1">
                                        <Link href={`/persons/${p.id}`}
                                            className="btn-icon text-primary-600 hover:bg-primary-50" title="View Gifts">
                                            <Gift className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => openEdit(p)} className="btn-icon text-amber-600 hover:bg-amber-50">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(p)} className="btn-icon text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!initialData.length && (
                    <div className="py-12 text-center text-gray-400">No persons yet.</div>
                )}
            </div>

            <PersonFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={() => { setModalOpen(false); router.refresh(); }}
                token={token}
                initial={editing}
            />
        </div>
    );
}
