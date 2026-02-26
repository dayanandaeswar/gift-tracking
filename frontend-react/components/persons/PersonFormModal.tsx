'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { createPerson, updatePerson } from '@/lib/api';
import { Person } from '@/types';

interface Fields { name: string; address: string; phone: string; }
interface Props {
    open: boolean; onClose: () => void; onSaved: () => void;
    token: string; initial?: Person | null;
}

export default function PersonFormModal({ open, onClose, onSaved, token, initial }: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Fields>();

    useEffect(() => {
        if (open) reset({ name: initial?.name ?? '', address: initial?.address ?? '', phone: initial?.phone ?? '' });
    }, [open, initial, reset]);

    async function onSubmit(data: Fields) {
        if (initial) await updatePerson(initial.id, data, token);
        else await createPerson(data, token);
        onSaved();
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? 'Edit Person' : 'New Person'}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="form-group">
                    <label className="label">Full Name *</label>
                    <input {...register('name', { required: 'Name is required' })} className="input" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Address</label>
                    <textarea {...register('address')} className="input" rows={3} />
                </div>
                <div className="form-group">
                    <label className="label">Phone</label>
                    <input {...register('phone')} className="input" placeholder="9876543210" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                        {isSubmitting ? 'Saving…' : (initial ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
