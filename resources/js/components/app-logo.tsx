import { usePage } from '@inertiajs/react';
import NasaLogo from '@/components/nasa-logo';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-[#0b3d91]/20 border border-[#0b3d91]/40 p-1">
                <NasaLogo size={28} />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-100 uppercase">
                    NASA AHMS
                </span>
                <span className="truncate text-[10px] text-cyan-400 font-mono">
                    {name || 'Deep Space Telemetry'}
                </span>
            </div>
        </>
    );
}
