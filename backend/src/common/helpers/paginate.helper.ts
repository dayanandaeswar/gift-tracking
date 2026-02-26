import { SelectQueryBuilder } from 'typeorm';

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    sortBy: string;
    sortDir: 'asc' | 'desc';
}

export async function paginate<T>(
    qb: SelectQueryBuilder<T>,
    page: number,
    pageSize: number,
    sortBy: string,
    sortDir: 'asc' | 'desc',
): Promise<PaginatedResult<T>> {
    const [items, total] = await qb
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        sortBy,
        sortDir,
    };
}
