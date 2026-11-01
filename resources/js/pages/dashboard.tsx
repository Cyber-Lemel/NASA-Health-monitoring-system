import { Head, Link } from '@inertiajs/react';
import NasaHealthHud from '@/components/nasa-health-hud';
import { dashboard, logout } from '@/routes';
import { LogOut, Database } from 'lucide-react';

export default function Dashboard() {
    return (
        <>
            <Head title="Mission Control Dashboard" />
            
            <div className="relative bg-[#030b14] min-h-screen">
                
                {/* Floating System Action Bar (Top Right) */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-4 font-mono">
                    <Link
                        href="/dataset"
                        className="relative group border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 px-4 py-1.5 text-[10px] sm:text-xs tracking-widest uppercase hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-colors flex items-center gap-2"
                    >
                        <Database className="w-3.5 h-3.5" />
                        System Dataset
                    </Link>
                    
                    {/* Secure Logout Button - Requires method="post" in Inertia */}
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        type="button"
                        className="relative group border border-red-900/50 bg-red-950/40 text-red-500 px-4 py-1.5 text-[10px] sm:text-xs tracking-widest uppercase hover:bg-red-600 hover:text-white hover:border-red-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Terminate Session
                    </Link>
                </div>

                {/* Main HUD Component */}
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