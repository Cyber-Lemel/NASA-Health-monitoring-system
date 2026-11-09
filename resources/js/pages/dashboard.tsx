import { Head } from '@inertiajs/react';
import NasaHealthHud from '@/components/nasa-health-hud';

interface DashboardProps {
    records?: any[];
}

export default function Dashboard({ records = [] }: DashboardProps) {
    return (
        <>
            <Head title="Mission Control HUD • NASA AHMS">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>
            
            <div className="relative bg-[#030b14] min-h-screen selection:bg-[#0284c7] selection:text-white">
                <NasaHealthHud initialData={{ records }} />
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => page;
