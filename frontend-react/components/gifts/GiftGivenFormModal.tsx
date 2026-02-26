'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { createGiftGiven } from '@/lib/api';
import { GiftType } from '@/types';
import { toDateString } from '@/lib/utils';

interface Fields {
    functionName: string; giftType: GiftType;
    amount: string; voucherDetails: string;
    itemDescription: string; quantity: string;
    givenDate: string; notes: string;
}

interface Props {
    open: boolean; onClose: () => void; onSaved: () => void;
    token: string; personId: number;
}

export default function GiftGivenFormModal({ open, onClose, onSaved, token, personId }: Props) {
    const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<Fields>({
        defaultValues: { giftType: 'cash', quantity: '1', givenDate: new Date().toISOString().split('T')[0] },
    });

    const giftType = watch('giftType');

    useEffect(() => {
        if (open) reset({ giftType: 'cash', quantity: '1', givenDate: new Date().toISOString().split('T')[0] });
    }, [open, reset]);

    async function onSubmit(data: Fields) {
        await createGiftGiven({
            personId,
            functionName: data.functionName,
            giftType: data.giftType,
            amount: data.amount ? Number(data.amount) : null,
            voucherDetails: data.voucherDetails || null,
            itemDescription: data.itemDescription || null,
            quantity: Number(data.quantity) || 1,
            givenDate: toDateString(data.givenDate),
            notes: data.notes || null,
        }, token);
        onSaved();
    }

    return (
        <Modal open={open} onClose={onClose} title="Add Gift Given" size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                <div className="form-group">
                    <label className="label">Function Name *</label>
                    <input {...register('functionName', { required: true })} className="input"
                        placeholder="e.g. Suresh's Birthday" />
                </div>

                <div className="form-group">
                    <label className="label">Gift Type *</label>
                    <select {...register('giftType')} className="input">
                        <option value="cash">💰 Cash</option>
                        <option value="voucher">🎟 Voucher</option>
                        <option value="item">🎁 Item</option>
                    </select>
                </div>

                {giftType === 'cash' && (
                    <div className="form-group">
                        <label className="label">Amount (₹)</label>
                        <input {...register('amount')} type="number" className="input" placeholder="0.00" />
                    </div>
                )}
                {giftType === 'voucher' && (
                    <div className="form-group">
                        <label className="label">Voucher Details</label>
                        <input {...register('voucherDetails')} className="input" />
                    </div>
                )}
                {giftType === 'item' && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="form-group col-span-2">
                            <label className="label">Item Description</label>
                            <input {...register('itemDescription')} className="input" />
                        </div>
                        <div className="form-group">
                            <label className="label">Qty</label>
                            <input {...register('quantity')} type="number" className="input" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div className="form-group">
                        <label className="label">Date</label>
                        <input {...register('givenDate')} type="date" className="input" />
                    </div>
                    <div className="form-group">
                        <label className="label">Notes</label>
                        <input {...register('notes')} className="input" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? 'Saving…' : 'Save Gift'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
