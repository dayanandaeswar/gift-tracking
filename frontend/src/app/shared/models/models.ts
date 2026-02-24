export type GiftType = 'cash' | 'voucher' | 'item';

export interface FunctionEvent {
    id: number;
    name: string;
    description?: string;
    eventDate?: string;
    giftsReceived?: GiftReceived[];
}

export interface Person {
    id: number;
    name: string;
    address?: string;
    phone?: string;
}

export interface GiftReceived {
    id: number;
    function: FunctionEvent;
    person: Person;
    giftType: GiftType;
    amount?: number;
    voucherDetails?: string;
    itemDescription?: string;
    quantity: number;
    notes?: string;
    receivedDate: string;
}

export interface GiftGiven {
    id: number;
    person: Person;
    functionName: string;   // inline, no FK
    giftType: GiftType;
    amount?: number;
    voucherDetails?: string;
    itemDescription?: string;
    quantity: number;
    notes?: string;
    givenDate: string;
}

export interface FunctionReport {
    function: FunctionEvent;
    giftsReceived: GiftReceived[];
    summary: { totalCount: number; totalCash: number; totalVouchers: number; totalItems: number };
}

export interface PersonReport {
    person: Person;
    giftsReceived: GiftReceived[];
    giftsGiven: GiftGiven[];
    summary: { totalReceived: number; totalGiven: number; totalCashReceived: number; totalCashGiven: number };
}
