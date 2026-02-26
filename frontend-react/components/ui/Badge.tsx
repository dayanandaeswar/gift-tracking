import clsx from 'clsx';
import { GiftType } from '@/types';

const styles: Record<GiftType, string> = {
    cash: 'bg-success-100 text-success-700',
    voucher: 'bg-warning-100 text-warning-700',
    item: 'bg-info-100    text-info-700',
};

const labels: Record<GiftType, string> = {
    cash: '💰 Cash', voucher: '🎟 Voucher', item: '🎁 Item',
};

export default function Badge({ type }: { type: GiftType }) {
    return (
        <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', styles[type])}>
            {labels[type]}
        </span>
    );
}
