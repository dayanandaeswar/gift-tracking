'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
    // Clear the cookie server-side so proxy.ts sees it immediately
    (await cookies()).delete('gt_token');
    redirect('/login');
}
