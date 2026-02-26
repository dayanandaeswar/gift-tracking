'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Printer, Trash2 } from 'lucide-react';
import { PersonReport } from '@/types';
import { deleteGiftGiven } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import GiftGivenFormModal from '@/components/gifts/GiftGivenFormModal';

interface Props { report: PersonReport; token: string; }

export default function PersonDetailClient({ report, token }: Props) {
    const router = useRouter();
    const [tab, setTab] = useState<'received' | 'given'>('received');
    const [modal, setModal] = useState(false);

    const { person, giftsReceived, giftsGiven, summary } = report;

    async function handleDeleteGiven(id: number) {
        if (!confirm('Remove this gift?')) return;
        await deleteGiftGiven(id, token);
        router.refresh();
    }

    function giftDetails(g: { giftType: string; amount?: number | null; voucherDetails?: string | null; itemDescription?: string | null; quantity?: number }) {
        if (g.giftType === 'cash') return formatCurrency(g.amount);
        if (g.giftType === 'voucher') return g.voucherDetails ?? '—';
        return `${g.itemDescription} (Qty: ${g.quantity})`;
    }

    return (
        <div id="printable">

            {/* Toolbar */}
            <div className="page-header no-print">
                <div className="flex items-center gap-3">
                    <Link href="/persons" className="btn-icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="page-title">{person.name}</h1>
                        <p className="text-sm text-gray-400">
                            {person.address}
                            {person.phone && ` · ${person.phone}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setModal(true)} className="btn-primary">
                        <Plus className="w-4 h-4" /> Add Gift Given
                    </button>
                    <button onClick={() => window.print()} className="btn-secondary">
                        <Printer className="w-4 h-4" /> Print A4
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="print-only hidden mb-4">
                <h1 className="text-2xl font-bold">{person.name}</h1>
                <p className="text-gray-500">{person.address} {person.phone && `· ${person.phone}`}</p>
                <hr className="my-3" />
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-6">
                <StatCard label="Received" value={summary.totalReceived} color="primary" />
                <StatCard label="Cash Received" value={formatCurrency(summary.totalCashReceived)} color="green" />
                <StatCard label="Given" value={summary.totalGiven} color="red" />
                <StatCard label="Cash Given" value={formatCurrency(summary.totalCashGiven)} color="orange" />
            </div>

            {/* Tabs */}
            <div className="no-print flex gap-1 mb-4 border-b border-gray-200">
                {(['received', 'given'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition
              ${tab === t
                                ? 'border-primary-600 text-primary-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {t === 'received' ? `↙ Received (${giftsReceived.length})` : `↗ Given (${giftsGiven.length})`}
                    </button>
                ))}
            </div>

            {/* Gifts Received Table */}
            <div className={`card overflow-hidden mb-6 tab-panel ${tab !== 'received' ? 'hidden no-print' : ''}`}>
                <div className="px-5 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-600">
                    Gifts Received
                </div>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-th">#</th>
                            <th className="table-th">Function</th>
                            <th className="table-th">Type</th>
                            <th className="table-th">Details</th>
                            <th className="table-th">Date</th>
                            <th className="table-th">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {giftsReceived.map((g, i) => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="table-td text-gray-400">{i + 1}</td>
                                <td className="table-td font-medium">{g.function?.name}</td>
                                <td className="table-td"><Badge type={g.giftType} /></td>
                                <td className="table-td">{giftDetails(g)}</td>
                                <td className="table-td">{formatDate(g.receivedDate)}</td>
                                <td className="table-td text-gray-400">{g.notes ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!giftsReceived.length && (
                    <div className="py-8 text-center text-gray-400">No gifts received.</div>
                )}
            </div>

            {/* Gifts Given Table */}
            <div className={`card overflow-hidden tab-panel ${tab !== 'given' ? 'hidden no-print' : ''}`}>
                <div className="px-5 py-3 bg-gray-50 border-b text-sm font-semibold text-gray-600">
                    Gifts Given
                </div>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-th">#</th>
                            <th className="table-th">Function</th>
                            <th className="table-th">Type</th>
                            <th className="table-th">Details</th>
                            <th className="table-th">Date</th>
                            <th className="table-th">Notes</th>
                            <th className="table-th no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {giftsGiven.map((g, i) => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="table-td text-gray-400">{i + 1}</td>
                                <td className="table-td font-medium">{g.functionName}</td>
                                <td className="table-td"><Badge type={g.giftType} /></td>
                                <td className="table-td">{giftDetails(g)}</td>
                                <td className="table-td">{formatDate(g.givenDate)}</td>
                                <td className="table-td text-gray-400">{g.notes ?? '—'}</td>
                                <td className="table-td no-print">
                                    <button onClick={() => handleDeleteGiven(g.id)}
                                        className="btn-icon text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!giftsGiven.length && (
                    <div className="py-8 text-center text-gray-400">No gifts given.</div>
                )}
            </div>

            {/* Print Footer */}
            <div className="print-footer hidden mt-4 text-right text-xs text-gray-400">
                Printed on: {new Date().toLocaleString('en-IN')}
            </div>

            <GiftGivenFormModal
                open={modal}
                onClose={() => setModal(false)}
                onSaved={() => { setModal(false); router.refresh(); }}
                token={token}
                personId={person.id}
            />
        </div>
    );
}
