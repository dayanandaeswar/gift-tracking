'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserPlus, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { createGiftReceived, updateGiftReceived, createPerson } from '@/lib/api';
import { GiftReceived, GiftType, Person } from '@/types';
import { toDateString } from '@/lib/utils';
import clsx from 'clsx';

interface GiftFields {
    personId: string;
    giftType: GiftType;
    amount: string;
    voucherDetails: string;
    itemDescription: string;
    quantity: string;
    receivedDate: string;
    notes: string;
}

interface PersonFields { name: string; address: string; phone: string; }

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    token: string;
    persons: Person[];
    functionId: number;
    eventDate?: string;
    editGift?: GiftReceived | null;
}

export default function GiftReceivedFormModal(props: Props) {
    const { open, onClose, onSaved, token, functionId, eventDate, editGift } = props;

    const isEdit = !!editGift;

    // Fix 1 — keep local persons list so newly created person appears immediately
    const [persons, setPersons] = useState<Person[]>(props.persons);
    const [showNewPerson, setShowNewPerson] = useState(false);
    const [creatingPerson, setCreatingPerson] = useState(false);
    const [personCreated, setPersonCreated] = useState<Person | null>(null);

    // Fix 2 — compute correct default date once
    function getDefaultDate(): string {
        if (editGift?.receivedDate) return editGift.receivedDate.split('T')[0];
        if (eventDate) return eventDate.split('T')[0];
        return new Date().toISOString().split('T')[0];
    }

    const giftForm = useForm<GiftFields>({
        defaultValues: {
            personId: editGift?.person?.id?.toString() ?? '',
            giftType: editGift?.giftType ?? 'cash',
            amount: editGift?.amount?.toString() ?? '',
            voucherDetails: editGift?.voucherDetails ?? '',
            itemDescription: editGift?.itemDescription ?? '',
            quantity: editGift?.quantity?.toString() ?? '1',
            receivedDate: getDefaultDate(),
            notes: editGift?.notes ?? '',
        },
    });

    const personForm = useForm<PersonFields>({
        defaultValues: { name: '', address: '', phone: '' },
    });

    const giftType = giftForm.watch('giftType');

    // Sync parent persons list into local state when dialog opens
    useEffect(() => {
        if (open) {
            setPersons(props.persons);
        }
    }, [open, props.persons]);

    // Reset form every time the dialog opens — picks up correct eventDate and editGift
    useEffect(() => {
        if (open) {
            giftForm.reset({
                personId: editGift?.person?.id?.toString() ?? '',
                giftType: editGift?.giftType ?? 'cash',
                amount: editGift?.amount?.toString() ?? '',
                voucherDetails: editGift?.voucherDetails ?? '',
                itemDescription: editGift?.itemDescription ?? '',
                quantity: editGift?.quantity?.toString() ?? '1',
                receivedDate: getDefaultDate(),   // ← Fix 2: always recomputed on open
                notes: editGift?.notes ?? '',
            });
            setShowNewPerson(false);
            setPersonCreated(null);
            personForm.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editGift, eventDate]);

    async function createNewPerson() {
        const data = personForm.getValues();
        if (!data.name.trim()) return;
        setCreatingPerson(true);
        try {
            const created = await createPerson(data, token) as Person;

            // Fix 1 — add to local list immediately
            setPersons(prev => [...prev, created]);
            setPersonCreated(created);

            // Fix 1 — auto-select the newly created person right away
            giftForm.setValue('personId', created.id.toString(), {
                shouldValidate: true,
                shouldDirty: true,
            });

            setTimeout(() => {
                setShowNewPerson(false);
                personForm.reset();
                setPersonCreated(null);
            }, 1200);
        } finally {
            setCreatingPerson(false);
        }
    }

    async function onSubmit(data: GiftFields) {
        const payload = {
            personId: Number(data.personId),
            giftType: data.giftType,
            amount: data.amount ? Number(data.amount) : null,
            voucherDetails: data.voucherDetails || null,
            itemDescription: data.itemDescription || null,
            quantity: Number(data.quantity) || 1,
            receivedDate: toDateString(data.receivedDate),
            notes: data.notes || null,
            functionId,
        };
        if (isEdit) await updateGiftReceived(editGift!.id, payload, token);
        else await createGiftReceived(payload, token);
        onSaved();
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Edit Gift Received' : 'Add Gift Received'}
            size="lg"
        >
            <form onSubmit={giftForm.handleSubmit(onSubmit)} className="flex flex-col gap-4">

                {/* ── Person selector ────────────────────────────── */}
                <div className="flex gap-2 items-end">
                    <div className="form-group flex-1">
                        <label className="label">Person *</label>
                        <select
                            {...giftForm.register('personId', { required: 'Person is required' })}
                            className="input"
                        >
                            <option value="">Select person…</option>
                            {persons.map(p => (
                                <option key={p.id} value={p.id.toString()}>
                                    {p.name}{p.phone ? ` — ${p.phone}` : ''}
                                </option>
                            ))}
                        </select>
                        {giftForm.formState.errors.personId && (
                            <p className="text-xs text-red-500">
                                {giftForm.formState.errors.personId.message}
                            </p>
                        )}
                    </div>

                    {!isEdit && (
                        <button
                            type="button"
                            onClick={() => setShowNewPerson(v => !v)}
                            className={clsx(
                                'btn-secondary h-[38px] whitespace-nowrap',
                                showNewPerson && 'border-red-300 text-red-600 hover:bg-red-50',
                            )}
                        >
                            <UserPlus className="w-4 h-4" />
                            {showNewPerson ? 'Cancel' : 'New Person'}
                        </button>
                    )}
                </div>

                {/* ── Inline new person panel ─────────────────────── */}
                {showNewPerson && !isEdit && (
                    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4
                          flex flex-col gap-3">
                        <p className="text-sm font-semibold text-primary-700 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add New Person
                        </p>

                        <input
                            {...personForm.register('name')}
                            className="input"
                            placeholder="Full Name *"
                        />
                        <textarea
                            {...personForm.register('address')}
                            className="input"
                            rows={2}
                            placeholder="Address (optional)"
                        />
                        <input
                            {...personForm.register('phone')}
                            className="input"
                            placeholder="Phone (optional)"
                        />

                        <button
                            type="button"
                            onClick={createNewPerson}
                            disabled={creatingPerson || !personForm.watch('name')}
                            className="btn-primary justify-center"
                        >
                            {creatingPerson
                                ? 'Creating…'
                                : <><Check className="w-4 h-4" /> Create &amp; Select Person</>}
                        </button>

                        {personCreated && (
                            <p className="text-xs text-success-700 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                "{personCreated.name}" created and selected!
                            </p>
                        )}
                    </div>
                )}

                {/* ── Gift type ───────────────────────────────────── */}
                <div className="form-group">
                    <label className="label">Gift Type *</label>
                    <select {...giftForm.register('giftType')} className="input">
                        <option value="cash">💰 Cash</option>
                        <option value="voucher">🎟 Voucher</option>
                        <option value="item">🎁 Item</option>
                    </select>
                </div>

                {giftType === 'cash' && (
                    <div className="form-group">
                        <label className="label">Amount (₹)</label>
                        <input
                            {...giftForm.register('amount')}
                            type="number"
                            className="input"
                            placeholder="0.00"
                        />
                    </div>
                )}
                {giftType === 'voucher' && (
                    <div className="form-group">
                        <label className="label">Voucher Details</label>
                        <input
                            {...giftForm.register('voucherDetails')}
                            className="input"
                            placeholder="Brand, value, code…"
                        />
                    </div>
                )}
                {giftType === 'item' && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="form-group col-span-2">
                            <label className="label">Item Description</label>
                            <input {...giftForm.register('itemDescription')} className="input" />
                        </div>
                        <div className="form-group">
                            <label className="label">Qty</label>
                            <input
                                {...giftForm.register('quantity')}
                                type="number"
                                className="input"
                            />
                        </div>
                    </div>
                )}

                {/* ── Date & Notes ────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                        <label className="label">Date</label>
                        <input
                            {...giftForm.register('receivedDate')}
                            type="date"
                            className="input"
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Notes</label>
                        <input
                            {...giftForm.register('notes')}
                            className="input"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                {/* ── Actions ─────────────────────────────────────── */}
                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={giftForm.formState.isSubmitting}
                        className="btn-primary"
                    >
                        {giftForm.formState.isSubmitting
                            ? 'Saving…'
                            : isEdit ? 'Update Gift' : 'Save Gift'}
                    </button>
                </div>

            </form>
        </Modal>
    );
}
