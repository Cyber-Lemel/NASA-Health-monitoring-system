import { Link } from '@inertiajs/react';
import NasaLogo from '@/components/nasa-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-[#020813] text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans selection:bg-[#0284c7] selection:text-white">
            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#0b3d91]/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0284c7]/15 rounded-full blur-[160px]" />
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="w-full max-w-2xl relative z-10 my-4 sm:my-8">
                <div className="rounded-3xl border border-[#0b3d91]/70 bg-gradient-to-b from-[#06142c]/95 via-[#030b18]/95 to-[#020813] p-6 sm:p-10 shadow-2xl shadow-[#0b3d91]/25 backdrop-blur-2xl">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="p-2 rounded-2xl bg-slate-900/80 border border-[#0b3d91]/60 shadow-lg shadow-[#0b3d91]/30 transition-transform group-hover:scale-105">
                                <NasaLogo size={52} />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-wide uppercase">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-center text-xs sm:text-sm text-slate-400 font-mono">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
