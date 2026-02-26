import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPersonReport } from '@/lib/api';
import PersonDetailClient from '@/components/persons/PersonDetailClient';
import DetailSkeleton from '@/components/ui/DetailSkeleton';

export default async function PersonDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <Suspense fallback={<DetailSkeleton />}>
            <PersonDetailServer id={Number(id)} />
        </Suspense>
    );
}

async function PersonDetailServer({ id }: { id: number }) {
    const token = (await cookies()).get('gt_token')?.value ?? '';
    const report = await fetchPersonDetail(id, token);
    if (!report) notFound();
    return <PersonDetailClient report={report} token={token} />;
}

async function fetchPersonDetail(id: number, token: string) {
    'use cache';
    return getPersonReport(id, token).catch(() => null);
}
