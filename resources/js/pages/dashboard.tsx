import { Head } from '@inertiajs/react';
import NasaHealthHud from '@/components/nasa-health-hud';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Mission Control Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
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
