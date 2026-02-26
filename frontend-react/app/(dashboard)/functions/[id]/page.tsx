import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getFunctionReport, getPersons } from '@/lib/api';
import FunctionDetailClient from '@/components/functions/FunctionDetailClient';
import DetailSkeleton from '@/components/ui/DetailSkeleton';

export default async function FunctionDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    const { id } = await params;

    return (
        <Suspense fallback={<DetailSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <FunctionDetailServer
                id={Number(id)}
                searchParamsPromise={searchParams}
            />
        </Suspense>
    );
}

async function FunctionDetailServer({
    id,
    searchParamsPromise,
}: {
    id: number;
    searchParamsPromise: Promise<Record<string, string | undefined>>;
}) {
    const sp = await searchParamsPromise;
    const token = (await cookies()).get('gt_token')?.value ?? '';

    // Pagination/sort state for the gifts table
    const giftsOpts = {
        page: Math.max(1, Number(sp.page ?? 1)),
        pageSize: Math.max(1, Number(sp.pageSize ?? 20)),
        sortBy: sp.sortBy ?? 'receivedDate',
        sortDir: (sp.sortDir ?? 'desc') as 'asc' | 'desc',
    };

    const [report, persons] = await Promise.all([
        getFunctionReport(id, token).catch(() => null),
        // Fetch all persons for the gift form dropdown (no pagination needed)
        getPersons(token, { page: 1, pageSize: 1000 })
            .then(r => r.items)
            .catch(() => []),
    ]);

    if (!report) notFound();

    return (
        <FunctionDetailClient
            report={report}
            persons={persons}
            token={token}
            giftsOpts={giftsOpts}
        />
    );
}
