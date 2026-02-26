'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, CalendarDays, Users, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth.actions';
import clsx from 'clsx';

const NAV = [
    { href: '/functions', label: 'Functions', icon: CalendarDays },
    { href: '/persons', label: 'Persons', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar flex flex-col w-56 bg-primary-800 text-white flex-shrink-0">

            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-primary-700">
                <Gift className="w-7 h-7 text-primary-200" />
                <span className="text-lg font-bold">Gift Tracker</span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                                active
                                    ? 'bg-white/20 text-white'
                                    : 'text-primary-200 hover:bg-white/10 hover:text-white',
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout — uses server action via form so proxy.ts sees cookie deletion */}
            <div className="px-2 pb-4 border-t border-primary-700 pt-2">
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                       text-sm font-medium text-primary-200 transition
                       hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </form>
            </div>

        </aside>
    );
}
