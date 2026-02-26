import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="main-content flex-1 overflow-y-auto bg-gray-50 p-6">
                {children}
            </main>
        </div>
    );
}
