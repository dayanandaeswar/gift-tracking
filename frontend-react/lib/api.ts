const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? 'API Error');
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

// ── Query builder ────────────────────────────────────────────────
export function buildQuery(
    params: Record<string, string | number | undefined>,
): string {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== '') {
            sp.set(k, String(v));
        }
    });
    const q = sp.toString();
    return q ? `?${q}` : '';
}

// ── Normalize paginated response ─────────────────────────────────
// Wraps plain array from backend into PaginatedResponse shape
function normalizePaginated<T>(
    res: T[] | import('@/types/pagination').PaginatedResponse<T>,
    opts: import('@/types/pagination').PaginationParams,
    defaultSortBy: string,
): import('@/types/pagination').PaginatedResponse<T> {
    if (Array.isArray(res)) {
        return {
            items: res,
            total: res.length,
            page: opts.page ?? 1,
            pageSize: opts.pageSize ?? (res.length > 0 ? res.length : 20),
            totalPages: 1,
            sortBy: opts.sortBy ?? defaultSortBy,
            sortDir: opts.sortDir ?? 'asc',
        };
    }
    return res;
}

// ── Auth ─────────────────────────────────────────────────────────
export const loginApi = (username: string, password: string) =>
    request<{ access_token: string; user: { id: number; username: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ username, password }) },
    );

// ── Functions ────────────────────────────────────────────────────
import type { FunctionEvent, Person, FunctionReport, PersonReport } from '@/types';
import type { PaginatedResponse, PaginationParams } from '@/types/pagination';

export const getFunctions = (
    token: string,
    opts: PaginationParams = {},
): Promise<PaginatedResponse<FunctionEvent>> =>
    request<PaginatedResponse<FunctionEvent> | FunctionEvent[]>(
        `/functions${buildQuery(opts as Record<string, string | number | undefined>)}`,
        {},
        token,
    ).then(res => normalizePaginated(res, opts, 'eventDate'));

export const createFunction = (d: object, t: string) =>
    request<FunctionEvent>('/functions',
        { method: 'POST', body: JSON.stringify(d) }, t);

export const updateFunction = (id: number, d: object, t: string) =>
    request<FunctionEvent>(`/functions/${id}`,
        { method: 'PUT', body: JSON.stringify(d) }, t);

export const deleteFunction = (id: number, t: string) =>
    request<void>(`/functions/${id}`, { method: 'DELETE' }, t);

// ── Persons ──────────────────────────────────────────────────────
export const getPersons = (
    token: string,
    opts: PaginationParams = {},
): Promise<PaginatedResponse<Person>> =>
    request<PaginatedResponse<Person> | Person[]>(
        `/persons${buildQuery(opts as Record<string, string | number | undefined>)}`,
        {},
        token,
    ).then(res => normalizePaginated(res, opts, 'name'));

export const createPerson = (d: object, t: string) =>
    request<Person>('/persons',
        { method: 'POST', body: JSON.stringify(d) }, t);

export const updatePerson = (id: number, d: object, t: string) =>
    request<Person>(`/persons/${id}`,
        { method: 'PUT', body: JSON.stringify(d) }, t);

export const deletePerson = (id: number, t: string) =>
    request<void>(`/persons/${id}`, { method: 'DELETE' }, t);

// ── Reports ──────────────────────────────────────────────────────
export const getFunctionReport = (id: number, t: string) =>
    request<FunctionReport>(`/reports/function/${id}`, {}, t);

export const getPersonReport = (id: number, t: string) =>
    request<PersonReport>(`/reports/person/${id}`, {}, t);

// ── Gifts Received ───────────────────────────────────────────────
export const createGiftReceived = (d: object, t: string) =>
    request('/gifts-received', { method: 'POST', body: JSON.stringify(d) }, t);

export const updateGiftReceived = (id: number, d: object, t: string) =>
    request(`/gifts-received/${id}`, { method: 'PUT', body: JSON.stringify(d) }, t);

export const deleteGiftReceived = (id: number, t: string) =>
    request<void>(`/gifts-received/${id}`, { method: 'DELETE' }, t);

// ── Gifts Given ──────────────────────────────────────────────────
export const createGiftGiven = (d: object, t: string) =>
    request('/gifts-given', { method: 'POST', body: JSON.stringify(d) }, t);

export const updateGiftGiven = (id: number, d: object, t: string) =>
    request(`/gifts-given/${id}`, { method: 'PUT', body: JSON.stringify(d) }, t);

export const deleteGiftGiven = (id: number, t: string) =>
    request<void>(`/gifts-given/${id}`, { method: 'DELETE' }, t);
