'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateFunction(functionId: number) {
    revalidatePath(`/functions/${functionId}`);
    revalidatePath('/functions');
}

export async function revalidatePerson(personId: number) {
    revalidatePath(`/persons/${personId}`);
    revalidatePath('/persons');
}
