'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
    open, onClose, title, children, size = 'md',
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (open) el.showModal();
        else el.close();
    }, [open]);

    // Close on backdrop click
    function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
        const rect = dialogRef.current?.getBoundingClientRect();
        if (!rect) return;
        const clickedOutside =
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom;
        if (clickedOutside) onClose();
    }

    const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={handleBackdropClick}
            className={clsx(
                // Fix 3 — explicit centering overrides browser default top-left positioning
                'fixed inset-0 m-auto',
                // Size
                'w-full', maxW,
                // Appearance
                'rounded-2xl shadow-2xl border-0 p-0 bg-white',
                // Backdrop
                'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
                // Remove default dialog margin that pushes it to top
                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            )}
        >
            {/* Prevent clicks inside dialog from closing it */}
            <div onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>

            </div>
        </dialog>
    );
}
