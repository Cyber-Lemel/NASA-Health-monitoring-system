import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import NasaHealthHud, { TelemetryData } from '@/components/nasa-health-hud';
import { Activity, ArrowRight, BookOpen, Layers, Radio, Shield, Sparkles } from 'lucide-react';

import type { Auth } from '@/types/auth';

interface WelcomeProps {
    initialTelemetry?: TelemetryData;
}

export default function Welcome({ initialTelemetry }: WelcomeProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;

    return (
        <>
            <Head title="NASA Health Monitoring System" />
            <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
                {/* Ambient glow backgrounds */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
                    <div className="absolute bottom-10 left-1/3 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px]" />
                </div>

                {/* Navbar */}
                <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black tracking-wider">
                                🚀
                            </div>
                            <div>
                                <span className="font-bold text-base tracking-tight text-white block leading-tight">
                                    NASA HMS
                                </span>
                                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                                    Health Monitoring System
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 border border-slate-800 rounded-full px-3 py-1 bg-slate-900/60 text-xs font-mono text-slate-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Laravel 13 • React 18 • Reverb</span>
                            </div>

                            <nav className="flex items-center gap-3">
                                {auth?.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
                                    >
                                        <span>Mission Dashboard</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-950/60 px-3.5 py-1 text-xs font-mono text-sky-300 shadow-inner">
                            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                            <span>Real-Time Biometric Telemetry Broadcasting</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                            NASA Astronaut <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                                Health Monitoring System
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                            High-frequency biometric telemetry infrastructure powered by <strong>Laravel 13</strong>,
                            <strong> React 18 (Inertia.js)</strong>, and ultra-low latency WebSocket streaming via
                            <strong> Laravel Reverb</strong>.
                        </p>
                    </div>

                    {/* Real-Time Telemetry HUD Component */}
                    <NasaHealthHud initialData={initialTelemetry} />

                    {/* Feature & Architecture Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                                <Radio className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-white text-base">Laravel Reverb WebSockets</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                First-party real-time WebSocket server built directly for Laravel, capable of handling thousands of concurrent mission telemetry connections at sub-millisecond latencies.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-white text-base">React 18 & Inertia.js</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                Seamless single-page application experience with React 18, utilizing Inertia.js for modern routing and state synchronization without complex API layers.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-white text-base">Laravel 13 Architecture</h3>
                            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                                Built with the latest Laravel 13 framework, feature-rich authentication scaffolding, Pest 5 testing suite, SQLite database, and automatic route wayfinding.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-8 mt-16 text-center text-xs font-mono text-slate-400">
                    <p>NASA Health Monitoring System • Powered by Laravel 13, React 18, Inertia.js & Laravel Reverb</p>
                </footer>
            </div>
        </>
    );
}
