import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getPersons } from '@/lib/api';
import TableSkeleton from '@/components/ui/TableSkeleton';
import type { PaginatedResponse } from '@/types/pagination';
import type { Person } from '@/types';
import PersonsTableClient from '@/components/persons/PersonsTableClient';

export default function PersonsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    return (
        <Suspense fallback={<TableSkeleton title="Persons" cols={5} />}>
            {/* @ts-expect-error Async Server Component */}
            <PersonsServer searchParamsPromise={searchParams} />
        </Suspense>
    );
}

async function PersonsServer({
    searchParamsPromise,
}: {
    searchParamsPromise: Promise<Record<string, string | undefined>>;
}) {
    const sp = await searchParamsPromise;
    const token = (await cookies()).get('gt_token')?.value ?? '';

    const opts = {
        page: Math.max(1, Number(sp.page ?? 1)),
        pageSize: Math.max(1, Number(sp.pageSize ?? 20)),
        sortBy: sp.sortBy ?? 'name',
        sortDir: (sp.sortDir ?? 'asc') as 'asc' | 'desc',
    };

    const EMPTY: PaginatedResponse<Person> = {
        items: [], total: 0, totalPages: 0, ...opts,
    };

    const data = await getPersons(token, opts).catch(() => EMPTY);

    return <PersonsTableClient token={token} data={data} />;
}
