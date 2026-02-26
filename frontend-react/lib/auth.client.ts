'use client';

export function getToken(): string {
    if (typeof window === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)gt_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function setToken(token: string): void {
    document.cookie = `gt_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
}

export function clearToken(): void {
    document.cookie = 'gt_token=; path=/; max-age=0';
}
