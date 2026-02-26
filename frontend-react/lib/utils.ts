/** Format YYYY-MM-DD string to display date without UTC shift */
export function formatDate(value?: string | null, fmt: 'short' | 'long' = 'short'): string {
    if (!value) return '—';
    const [y, m, d] = value.split('T')[0].split('-').map(Number);
    const date = new Date(y, m - 1, d);   // local time — no UTC shift
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: fmt === 'long' ? 'long' : 'short',
        year: 'numeric',
    });
}

/** Convert Date object to YYYY-MM-DD without UTC shift */
export function toDateString(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value.split('T')[0];
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Format currency in INR */
export function formatCurrency(amount?: number | null): string {
    if (!amount) return '—';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
}
