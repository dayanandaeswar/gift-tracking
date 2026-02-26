import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { getFunctions } from '@/lib/api';
import FunctionsTableClient from '@/components/functions/FunctionsTableClient';
import TableSkeleton from '@/components/ui/TableSkeleton';
import type { PaginatedResponse } from '@/types/pagination';
import type { FunctionEvent } from '@/types';

export default function FunctionsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    return (
        <Suspense fallback={<TableSkeleton title="Functions" cols={6} />}>
            {/* @ts-expect-error Async Server Component */}
            <FunctionsServer searchParamsPromise={searchParams} />
        </Suspense>
    );
}

async function FunctionsServer({
    searchParamsPromise,
}: {
    searchParamsPromise: Promise<Record<string, string | undefined>>;
}) {
    const sp = await searchParamsPromise;
    const token = (await cookies()).get('gt_token')?.value ?? '';

    const opts = {
        page: Math.max(1, Number(sp.page ?? 1)),
        pageSize: Math.max(1, Number(sp.pageSize ?? 20)),
        sortBy: sp.sortBy ?? 'eventDate',
        sortDir: (sp.sortDir ?? 'asc') as 'asc' | 'desc',
    };

    const EMPTY: PaginatedResponse<FunctionEvent> = {
        items: [], total: 0, totalPages: 0, ...opts,
    };

    const data = await getFunctions(token, opts).catch(() => EMPTY);

    return <FunctionsTableClient token={token} data={data} />;
}
