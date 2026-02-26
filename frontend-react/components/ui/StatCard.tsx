interface StatCardProps {
    label: string;
    value: string | number;
    color?: 'primary' | 'green' | 'orange' | 'blue' | 'red';
}

const colorMap = {
    primary: 'text-primary-600',
    green: 'text-success-700',
    orange: 'text-orange-600',
    blue: 'text-info-700',
    red: 'text-red-600',
};

export default function StatCard({ label, value, color = 'primary' }: StatCardProps) {
    return (
        <div className="card flex-1 p-5 text-center min-w-0">
            <div className={`text-3xl font-bold ${colorMap[color]}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{label}</div>
        </div>
    );
}
