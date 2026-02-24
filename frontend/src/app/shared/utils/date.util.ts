/**
 * Converts a Date object or ISO string to plain YYYY-MM-DD string.
 * Prevents timezone shifting when sending date-only values to API.
 */
export function toDateString(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value.split('T')[0]; // already a string
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
