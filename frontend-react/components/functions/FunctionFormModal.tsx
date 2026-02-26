'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { createFunction, updateFunction } from '@/lib/api';
import { FunctionEvent } from '@/types';
import { toDateString } from '@/lib/utils';

interface Fields { name: string; eventDate: string; description: string; }
interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    token: string;
    initial?: FunctionEvent | null;
}

export default function FunctionFormModal({ open, onClose, onSaved, token, initial }: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Fields>();

    useEffect(() => {
        if (open) {
            reset({
                name: initial?.name ?? '',
                eventDate: initial?.eventDate ?? '',
                description: initial?.description ?? '',
            });
        }
    }, [open, initial, reset]);

    async function onSubmit(data: Fields) {
        const payload = { ...data, eventDate: toDateString(data.eventDate) };
        if (initial) await updateFunction(initial.id, payload, token);
        else await createFunction(payload, token);
        onSaved();
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? 'Edit Function' : 'New Function'}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                <div className="form-group">
                    <label className="label">Function Name *</label>
                    <input {...register('name', { required: 'Name is required' })}
                        className="input" placeholder="e.g. Ram's Wedding" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Event Date</label>
                    <input {...register('eventDate')} type="date" className="input" />
                </div>

                <div className="form-group">
                    <label className="label">Description</label>
                    <textarea {...register('description')} className="input" rows={3}
                        placeholder="Optional description..." />
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
