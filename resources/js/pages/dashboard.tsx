import { Head, Link } from '@inertiajs/react'; // 1. Import Link
import NasaHealthHud from '@/components/nasa-health-hud';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Mission Control Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* 2. Add this navigation block */}
                <div className="flex justify-end">
                    <Link
                        href="/dataset"
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500"
                    >
                        View Kaggle Dataset
                    </Link>
                </div>

                <NasaHealthHud />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Mission Control Dashboard',
            href: dashboard(),
        },
    ],
};