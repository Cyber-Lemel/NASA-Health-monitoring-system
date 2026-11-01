import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { ArrowRight, Activity, AlertTriangle, Hand, LogIn } from 'lucide-react';
import type { Auth } from '@/types/auth';

export default function Welcome() {
    const { auth } = usePage<{ auth?: Auth }>().props;

    return (
        <>
            <Head title="AHMS - Astronaut Health Monitoring System" />
            <div className="min-h-screen bg-[#030b14] text-white font-sans selection:bg-[#5cdbdf] selection:text-black overflow-x-hidden flex flex-col relative">
                
                {/* Ambient glow backgrounds */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-[#5cdbdf]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]" />
                </div>

                {/* Top Navigation */}
                <header className="relative z-50 w-full px-6 py-4 flex items-center justify-between border-b border-[#1a4b6c]/50 bg-[#030b14]/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-900 border border-red-500/50 flex items-center justify-center text-[10px] font-bold tracking-tighter text-white overflow-hidden relative">
                            <span className="relative z-10">NASA</span>
                            <div className="absolute w-full h-[1px] bg-red-500 transform rotate-45"></div>
                        </div>
                        <div className="leading-tight hidden sm:block">
                            <span className="font-mono text-sm tracking-widest block text-slate-200">ASTRONAUT HEALTH MONITORING</span>
                            <span className="font-mono text-sm tracking-widest block text-slate-200">SYSTEM (AHMS)</span>
                        </div>
                    </div>

                    <nav className="hidden xl:flex items-center gap-6 font-mono text-xs tracking-widest text-[#5cdbdf]">
                        <Link href="/" className="pb-1 border-b-2 border-[#5cdbdf] text-[#5cdbdf]">ABOUT</Link>
                        <Link href="/" className="pb-1 text-slate-400 hover:text-[#5cdbdf] transition-colors">FEATURES</Link>
                        <Link href="/" className="pb-1 text-slate-400 hover:text-[#5cdbdf] transition-colors">SYSTEM STATS</Link>
                        <Link href="/" className="pb-1 text-slate-400 hover:text-[#5cdbdf] transition-colors">SUPPORT</Link>
                    </nav>

                    {/* Authentication Buttons (Integrated directly into the header) */}
                    <div className="flex items-center gap-3 font-mono text-sm z-50">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="relative group bg-gradient-to-r from-[#5cdbdf] to-[#4bc2c6] text-[#030b14] px-6 py-2.5 font-bold tracking-widest uppercase hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <span className="absolute top-1 left-1 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#030b14]"></span>
                                <span className="absolute bottom-1 right-1 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#030b14]"></span>
                                MISSION CONTROL (DASHBOARD)
                            </Link>
                        ) : (
                            <>
                                {/* Log In Button -> Routes to login.tsx */}
                                <Link
                                    href={login()}
                                    className="relative group border border-[#5cdbdf] text-[#5cdbdf] px-5 sm:px-8 py-2.5 tracking-widest uppercase hover:bg-[#5cdbdf]/10 transition-colors flex items-center gap-2"
                                >
                                    <span className="absolute -top-[1px] -left-[1px] w-2 h-2 bg-[#5cdbdf] group-hover:w-3 group-hover:h-3 transition-all duration-300"></span>
                                    <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 bg-[#5cdbdf] group-hover:w-3 group-hover:h-3 transition-all duration-300"></span>
                                    <LogIn className="w-4 h-4 hidden sm:block" />
                                    LOGIN
                                </Link>

                                {/* Register Button -> Routes to register.tsx */}
                                <Link
                                    href={register()}
                                    className="relative group bg-[#5cdbdf] text-[#030b14] px-5 sm:px-8 py-2.5 font-bold tracking-widest uppercase hover:bg-white transition-all flex items-center gap-2 hidden md:flex"
                                >
                                    <span className="absolute top-1 left-1 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#030b14]"></span>
                                    <span className="absolute bottom-1 right-1 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#030b14]"></span>
                                    LAUNCH CONSOLE
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Main Hero Section */}
                <main className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto px-6 py-12 lg:py-20 flex flex-col justify-between">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
                        
                        {/* Hero Text Content */}
                        <div className="space-y-8 max-w-2xl relative">
                            <div className="absolute -inset-10 border border-[#1a4b6c]/30 rounded-3xl -z-10 bg-[#0a1f2e]/10 backdrop-blur-sm hidden lg:block">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#1a4b6c]"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#1a4b6c]"></div>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                                MISSION-CRITICAL <br/>
                                HEALTH <br/>
                                INTELLIGENCE FOR DEEP <br/>
                                SPACE EXPLORATION
                            </h1>
                            
                            <p className="text-xl text-slate-300 font-light max-w-xl">
                                Real-time biometric monitoring, suit diagnostics, and automated incident response for astronauts beyond Earth.
                            </p>

                            <div className="flex flex-wrap items-center gap-6 pt-4 font-mono">
                                {/* Large Hero Button -> Routes to register (or dashboard if already logged in) */}
                                <Link 
                                    href={auth?.user ? dashboard() : register()} 
                                    className="relative group bg-[#5cdbdf] text-[#030b14] px-8 py-3.5 font-bold tracking-wider flex items-center gap-2 hover:bg-white transition-colors"
                                >
                                    <span className="absolute top-1 left-1 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#030b14]"></span>
                                    <span className="absolute bottom-1 right-1 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#030b14]"></span>
                                    Login <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button className="relative group border border-[#5cdbdf] text-[#5cdbdf] px-8 py-3.5 tracking-wider hover:bg-[#5cdbdf]/10 transition-colors">
                                    <span className="absolute -top-[1px] -left-[1px] w-2 h-2 bg-[#5cdbdf]"></span>
                                    <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 bg-[#5cdbdf]"></span>
                                    REQUEST SYSTEM DEMO
                                </button>
                            </div>
                        </div>

                        {/* Hero Graphic - Standalone Astronaut visual */}
                        <div className="relative h-[600px] w-full flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg viewBox="0 0 150 300" className="h-[90%] w-auto stroke-[#5cdbdf] fill-none drop-shadow-[0_0_8px_rgba(92,219,223,0.5)]" strokeWidth="0.5">
                                    <path d="M75,20 C60,20 50,35 50,55 C50,70 60,80 75,80 C90,80 100,70 100,55 C100,35 90,20 75,20 Z" />
                                    <path d="M55,45 C55,45 75,35 95,45 C98,60 85,72 75,72 C65,72 52,60 55,45 Z" fill="rgba(10,31,46,0.8)" />
                                    <path d="M75,80 L75,140" />
                                    <path d="M50,90 L20,130 L10,180" />
                                    <path d="M100,90 L130,130 L140,180" />
                                    <path d="M60,140 L40,230 L30,280" />
                                    <path d="M90,140 L110,230 L120,280" />
                                    <circle cx="65" cy="100" r="15" fill="rgba(249,115,22,0.7)" className="blur-xl" />
                                    <circle cx="45" cy="210" r="12" fill="rgba(239,68,68,0.7)" className="blur-xl" />
                                    <circle cx="105" cy="210" r="12" fill="rgba(239,68,68,0.7)" className="blur-xl" />
                                </svg>

                                <div className="absolute top-[25%] left-[25%] h-12 w-12 rounded-full border border-red-500/50 flex items-center justify-center bg-red-500/10">
                                    <div className="absolute inset-0 rounded-full border-2 border-red-500 border-t-transparent animate-spin-slow"></div>
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}