import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Activity,
    Shield,
    Database,
    Radio,
    Zap,
    Heart,
    Thermometer,
    Wind,
    Sun,
    ArrowRight,
    Sparkles,
    Cpu,
    Orbit,
    ChevronRight,
    ExternalLink,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Lock,
    UserCheck,
    Crosshair
} from 'lucide-react';
import type { Auth } from '@/types/auth';
import NasaLogo from '@/components/nasa-logo';
import Astronaut3DModel from '@/components/astronaut-3d-model';

interface TelemetryData {
    astronaut_id: string;
    astronaut_name: string;
    role: string;
    heart_rate: number;
    oxygen_saturation: number;
    core_temperature: number;
    suit_pressure: number;
    radiation_rate: number;
    status: string;
    mission_elapsed_time: string;
}

interface WelcomeProps {
    initialTelemetry?: TelemetryData;
}

export default function Welcome({ initialTelemetry }: WelcomeProps) {
    const { auth } = usePage<{ auth?: Auth }>().props;

    // Live telemetry simulation state
    const [telemetry, setTelemetry] = useState<TelemetryData>(
        initialTelemetry || {
            astronaut_id: 'AST-00',
            astronaut_name: 'CDR. Elena Rovani',
            role: 'Mission Commander',
            heart_rate: 76,
            oxygen_saturation: 98.6,
            core_temperature: 37.0,
            suit_pressure: 4.3,
            radiation_rate: 0.214,
            status: 'Nominal',
            mission_elapsed_time: 'MET +14:08:32',
        }
    );

    // Audio ambience simulation state
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    // Live clock updater
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Live micro-telemetry fluctuations for realism
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry((prev) => {
                const hrDrift = (Math.random() - 0.48) * 2;
                const nextHr = Math.round(Math.max(68, Math.min(138, prev.heart_rate + hrDrift)));
                const nextSpo2 = +(Math.max(97.2, Math.min(99.4, prev.oxygen_saturation + (Math.random() - 0.5) * 0.2))).toFixed(1);
                const nextTemp = +(Math.max(36.7, Math.min(37.4, prev.core_temperature + (Math.random() - 0.5) * 0.05))).toFixed(1);
                const nextPressure = +(Math.max(4.2, Math.min(4.4, prev.suit_pressure + (Math.random() - 0.5) * 0.02))).toFixed(1);
                const nextRad = +(Math.max(0.19, Math.min(0.24, prev.radiation_rate + (Math.random() - 0.5) * 0.005))).toFixed(3);

                return {
                    ...prev,
                    heart_rate: nextHr,
                    oxygen_saturation: nextSpo2,
                    core_temperature: nextTemp,
                    suit_pressure: nextPressure,
                    radiation_rate: nextRad,
                    status: nextHr > 115 ? 'Elevated Workload' : 'Nominal Operations',
                };
            });
        }, 3200);

        return () => clearInterval(interval);
    }, []);

    // Canvas ECG wave animation
    const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = ecgCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const drawEcg = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // Subtle grid
            ctx.strokeStyle = 'rgba(11, 61, 145, 0.2)';
            ctx.lineWidth = 1;
            for (let x = 0; x < w; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += 15) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Waveform
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.beginPath();

            const midY = h / 2;
            for (let x = 0; x < w; x++) {
                const sample = (x + offset) % 180;
                let y = midY;

                if (sample >= 50 && sample < 65) {
                    // P-wave
                    y = midY - Math.sin(((sample - 50) / 15) * Math.PI) * 7;
                } else if (sample >= 75 && sample < 80) {
                    // Q-dip
                    y = midY + 5;
                } else if (sample >= 80 && sample < 90) {
                    // R-spike
                    y = midY - Math.sin(((sample - 80) / 10) * Math.PI) * 28;
                } else if (sample >= 90 && sample < 95) {
                    // S-dip
                    y = midY + 8;
                } else if (sample >= 115 && sample < 140) {
                    // T-wave
                    y = midY - Math.sin(((sample - 115) / 25) * Math.PI) * 11;
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
            ctx.shadowBlur = 0;
            offset += 1.8;
            animationFrameId = requestAnimationFrame(drawEcg);
        };

        drawEcg();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <>
            <Head title="NASA AHMS • Astronaut Health Monitoring System | Deep Space Mission Operations">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            <div className="min-h-screen bg-[#020813] text-slate-100 font-sans selection:bg-[#0284c7] selection:text-white overflow-x-hidden flex flex-col relative">
                {/* Background Starfield and Nebula Glows */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-[#0b3d91]/25 via-[#0284c7]/10 to-transparent rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 -left-40 w-[650px] h-[650px] bg-gradient-to-tr from-[#0b3d91]/20 via-[#38bdf8]/10 to-transparent rounded-full blur-[150px]" />
                    <div className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] bg-[#fc3d21]/5 rounded-full blur-[160px]" />
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                {/* Top Mission Operations Header */}
                <header className="sticky top-0 z-50 w-full border-b border-[#0b3d91]/40 bg-[#020813]/90 backdrop-blur-xl transition-all">
                    {/* Mission Status Top Ribbon */}
                    <div className="w-full bg-[#051124] border-b border-[#0b3d91]/30 px-4 sm:px-8 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                DSN GOLDSTONE ACTIVE // 2.4 GHz LINK OK
                            </span>
                            <span className="hidden md:inline text-slate-600">|</span>
                            <span className="hidden md:inline text-slate-300">
                                ORBITAL INCLINATION: <strong className="text-cyan-400">51.64°</strong>
                            </span>
                            <span className="hidden lg:inline text-slate-600">|</span>
                            <span className="hidden lg:inline text-slate-300">
                                TELEMETRY PACKET: <strong className="text-cyan-400">#492,108 SYNCED</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-cyan-300 font-mono font-medium">{currentTime}</span>
                            <span className="text-slate-500 hidden sm:inline">|</span>
                            <span className="text-slate-400 font-mono hidden sm:inline">
                                {telemetry.mission_elapsed_time}
                            </span>
                        </div>
                    </div>

                    {/* Main Navbar */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                        {/* NASA Logo and Title */}
                        <div className="flex items-center gap-3.5">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative flex items-center justify-center p-1 rounded-xl bg-slate-900/80 border border-[#0b3d91]/60 shadow-lg shadow-[#0b3d91]/20 group-hover:border-cyan-400/80 transition-all">
                                    <NasaLogo size={42} className="transition-transform duration-300 group-hover:scale-105" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-white uppercase">
                                            NASA AHMS
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#fc3d21]/20 text-[#fc3d21] border border-[#fc3d21]/40">
                                            LEVEL-4
                                        </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-cyan-400 tracking-wider hidden sm:block">
                                        ASTRONAUT HEALTH MONITORING SYSTEM
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Middle Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-7 font-mono text-xs tracking-wider">
                            <a
                                href="#overview"
                                className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                            >
                                <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> OVERVIEW
                            </a>
                            <a
                                href="#scanner"
                                className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                            >
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> 3D BIO-SCANNER
                            </a>
                            <a
                                href="#capabilities"
                                className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                            >
                                <Shield className="w-3.5 h-3.5 text-cyan-400" /> CAPABILITIES
                            </a>
                            {auth?.user && (
                                <Link
                                    href="/dataset"
                                    className="text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5 bg-[#0b3d91]/30 px-2.5 py-1 rounded-md border border-[#0b3d91]/60"
                                >
                                    <Database className="w-3.5 h-3.5 text-cyan-400" /> KAGGLE DATASET
                                </Link>
                            )}
                        </nav>

                        {/* Header Action Buttons */}
                        <div className="flex items-center gap-3 font-mono text-xs">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="relative group inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    <Activity className="w-4 h-4 text-slate-950 animate-pulse" />
                                    <span>MISSION CONTROL</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-200 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all font-semibold"
                                    >
                                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>SECURE LOGIN</span>
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="relative group hidden sm:inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 transition-all"
                                    >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>ENLIST CREW</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section id="overview" className="relative z-10 pt-10 sm:pt-16 pb-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Left Hero Details */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Mission Badge */}
                            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0b3d91]/30 border border-[#0b3d91]/60 backdrop-blur-md">
                                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                                <span className="font-mono text-xs text-cyan-300 tracking-wider">
                                    NASA HUMAN RESEARCH PROGRAM • ARTEMIS & MARS MISSIONS
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08]">
                                MISSION-CRITICAL <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                                    BIOMEDICAL INTELLIGENCE
                                </span> <br />
                                FOR DEEP SPACE EXPLORATION.
                            </h1>

                            {/* Description */}
                            <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl leading-relaxed">
                                Continuous multi-channel vital telemetry, extravehicular suit life support diagnostics,
                                cosmic radiation dosimetry, and autonomous medical intervention protocols protecting astronauts
                                beyond low Earth orbit.
                            </p>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-sm">
                                <Link
                                    href={auth?.user ? dashboard() : login()}
                                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
                                >
                                    <span>ENTER MISSION CONTROL</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>

                                {auth?.user ? (
                                    <Link
                                        href="/dataset"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white transition-all"
                                    >
                                        <Database className="w-4 h-4 text-cyan-400" />
                                        <span>EXPLORE ASTRONAUT DATASET</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white transition-all"
                                    >
                                        <Shield className="w-4 h-4 text-cyan-400" />
                                        <span>ENLIST FLIGHT CREW</span>
                                    </Link>
                                )}
                            </div>

                            {/* Telemetry Quick Bar */}
                            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>HEART RATE</span>
                                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                                    </div>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {telemetry.heart_rate} <span className="text-xs text-rose-400 font-normal">BPM</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>SPO2 SAT</span>
                                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {telemetry.oxygen_saturation} <span className="text-xs text-cyan-300 font-normal">%</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>CORE TEMP</span>
                                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                                    </div>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {telemetry.core_temperature} <span className="text-xs text-amber-300 font-normal">°C</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                        <span>SUIT PRESS</span>
                                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div className="text-xl font-bold text-white mt-1">
                                        {telemetry.suit_pressure} <span className="text-xs text-emerald-300 font-normal">PSI</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Hero Visual Card - Live Telemetry & ECG Monitor */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-2xl border border-[#0b3d91]/60 bg-gradient-to-b from-[#06142c]/90 via-[#030b18]/95 to-[#020813] p-5 shadow-2xl shadow-[#0b3d91]/20 backdrop-blur-xl">
                                {/* Top Terminal Header */}
                                <div className="flex items-center justify-between border-b border-[#0b3d91]/40 pb-3 mb-4 font-mono text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="font-semibold text-white">LIVE TELEMETRY STREAM</span>
                                    </div>
                                    <span className="text-cyan-400 text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                                        CH-01 • {telemetry.astronaut_id}
                                    </span>
                                </div>

                                {/* Subject Details */}
                                <div className="flex items-center justify-between mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-[#0b3d91]/30 border border-[#0b3d91]/60 flex items-center justify-center font-mono font-bold text-cyan-300 text-sm">
                                            AST
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white text-sm">{telemetry.astronaut_name}</div>
                                            <div className="text-xs font-mono text-slate-400">{telemetry.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
                                        <div className="text-[10px] text-slate-400">EVA STATUS</div>
                                        <div className="text-xs font-semibold text-emerald-400">{telemetry.status}</div>
                                    </div>
                                </div>

                                {/* ECG Waveform Canvas */}
                                <div className="rounded-xl border border-slate-800 bg-[#020813] p-3 mb-4">
                                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                                        <span className="flex items-center gap-1.5 text-cyan-300">
                                            <Activity className="w-3.5 h-3.5" /> LEAD-II ELECTROCARDIOGRAM
                                        </span>
                                        <span className="text-rose-400 font-semibold">{telemetry.heart_rate} BPM (R-PEAK SYNC)</span>
                                    </div>
                                    <div className="w-full h-28 overflow-hidden rounded-lg bg-black/40 relative">
                                        <canvas
                                            ref={ecgCanvasRef}
                                            width={440}
                                            height={112}
                                            className="w-full h-full block"
                                        />
                                    </div>
                                </div>

                                {/* Secondary Biosensors Bar */}
                                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                                        <span className="text-slate-400">DOSIMETRY:</span>
                                        <span className="text-amber-400 font-semibold">{telemetry.radiation_rate} mSv/h</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                                        <span className="text-slate-400">O2 RESERVE:</span>
                                        <span className="text-cyan-400 font-semibold">94.8% (6.2h)</span>
                                    </div>
                                </div>

                                {/* Link to Full Dashboard */}
                                <div className="mt-4 pt-3 border-t border-slate-800/80">
                                    <Link
                                        href={dashboard()}
                                        className="w-full py-2.5 rounded-xl bg-[#0b3d91]/30 hover:bg-[#0b3d91]/50 border border-[#0b3d91]/60 text-cyan-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <span>LAUNCH FULL MISSION HUD</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3D Holographic Bio-Scanner Showcase Section */}
                <section id="scanner" className="relative z-10 py-16 lg:py-24 border-t border-b border-[#0b3d91]/30 bg-gradient-to-b from-[#020813] via-[#040f22] to-[#020813]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/60 text-cyan-400 font-mono text-xs">
                                <Sparkles className="w-3.5 h-3.5" /> 3D INTERACTIVE BIOMECHANICAL TELEMETRY
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                                HOLOGRAPHIC SUIT & ANATOMY SCANNER
                            </h2>
                            <p className="text-slate-300 text-sm sm:text-base font-light">
                                Interactive real-time 3D rendering powered by Three.js. Inspect astronaut skeletal load,
                                thermal metabolic exertion gradients, and EMU space suit pressurized seal integrity.
                            </p>
                        </div>

                        {/* Interactive 3D Scanner Container */}
                        <div className="relative rounded-3xl border border-[#0b3d91]/80 bg-[#030c1c]/90 p-4 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-[#0b3d91]/30 overflow-hidden">
                            {/* Decorative corner reticles */}
                            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                {/* The 3D Component */}
                                <div className="lg:col-span-8 h-[480px] sm:h-[540px] w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                                    <Astronaut3DModel
                                        heartRate={telemetry.heart_rate}
                                        coreTemp={telemetry.core_temperature}
                                        evaStatus={telemetry.status}
                                        astronautName={telemetry.astronaut_name}
                                    />
                                </div>

                                {/* Scanner Capabilities & Telemetry Diagnostic Column */}
                                <div className="lg:col-span-4 space-y-4 font-mono text-xs">
                                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                                        <div className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Cpu className="w-4 h-4" /> BIOMETRIC LAYER MODES
                                        </div>
                                        <p className="text-slate-400 font-sans text-xs">
                                            Switch between Skeleton Wireframe, Thermal Exertion Map, and Pressurized EMU Suit mode using the controls on the model.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                                        <div className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> SUIT SEAL PRESSURE
                                        </div>
                                        <div className="text-lg font-bold text-white font-mono">
                                            {telemetry.suit_pressure} PSI <span className="text-emerald-400 text-xs font-normal">(NOMINAL)</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="bg-emerald-400 h-full w-[88%]" />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                                        <div className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Heart className="w-4 h-4" /> CARDIAC OUTPUT
                                        </div>
                                        <div className="text-lg font-bold text-white font-mono">
                                            {telemetry.heart_rate} BPM <span className="text-cyan-300 text-xs font-normal">(REGULAR SINUS)</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-sans">
                                            Pulsing cardiac LED synchronized with calculated stroke volume and cardiac index.
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <Link
                                            href={dashboard()}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all font-mono text-xs uppercase"
                                        >
                                            <Activity className="w-4 h-4" /> OPEN TELEMETRY CONTROLS
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core System Capabilities Grid */}
                <section id="capabilities" className="relative z-10 py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b3d91]/30 border border-[#0b3d91]/60 text-cyan-300 font-mono text-xs">
                            <Shield className="w-3.5 h-3.5 text-cyan-400" /> AVIONICS & MEDICAL SUBSYSTEMS
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            ENGINEERED FOR EXTREME ENVIRONMENTS
                        </h2>
                        <p className="text-slate-300 text-sm sm:text-base font-light">
                            Architected in accordance with NASA Human-System Integration Requirements (NASA-STD-3001)
                            for deep space missions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Card 1 */}
                        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-400/60 hover:bg-[#06152e]/80 transition-all shadow-lg hover:shadow-cyan-500/10">
                            <div className="h-12 w-12 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="font-mono text-base font-bold text-white mb-2 tracking-wide">
                                CONTINUOUS BIOMETRICS
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                                Real-time acquisition of multi-lead ECG, galvanic skin response (GSR), SpO2, core body
                                temperature, and respiratory tidal volume.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-400/60 hover:bg-[#06152e]/80 transition-all shadow-lg hover:shadow-cyan-500/10">
                            <div className="h-12 w-12 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="font-mono text-base font-bold text-white mb-2 tracking-wide">
                                SPACESUIT DIAGNOSTICS
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                                Telemetry hooks into Portable Life Support System (PLSS) sublimators, Sabatier scrubbers,
                                oxygen pressure regulators, and thermal garment loop.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-400/60 hover:bg-[#06152e]/80 transition-all shadow-lg hover:shadow-cyan-500/10">
                            <div className="h-12 w-12 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                                <Sun className="w-6 h-6" />
                            </div>
                            <h3 className="font-mono text-base font-bold text-white mb-2 tracking-wide">
                                RADIATION DOSIMETRY
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                                Continuous calculation of cumulative absorbed Sieverts, Solar Particle Event (SPE)
                                alerts, and deep-space Galactic Cosmic Ray dosimeter logging.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-400/60 hover:bg-[#06152e]/80 transition-all shadow-lg hover:shadow-cyan-500/10">
                            <div className="h-12 w-12 rounded-xl bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <h3 className="font-mono text-base font-bold text-white mb-2 tracking-wide">
                                BIOASTRONAUTICS ARCHIVE
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
                                Longitudinal physiological dataset tracking microgravity bone mineral density loss (BMD),
                                launch ages, and extended orbital duration adaptation. Access restricted to authenticated personnel.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Kaggle Dataset Interactive Highlight Banner (Visible Only When Authenticated) */}
                {auth?.user && (
                    <section className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl border border-[#0b3d91]/70 bg-gradient-to-r from-[#071936] via-[#040f23] to-[#0b2552] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                            {/* Background NASA Watermark */}
                            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                                <NasaLogo size={360} />
                            </div>

                            <div className="relative z-10 max-w-2xl space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs">
                                    <Database className="w-3.5 h-3.5" /> SCIENTIFIC TELEMETRY REPOSITORY
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    NASA Astronaut Health Dataset
                                </h3>
                                <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
                                    Explore comprehensive spaceflight physiological records compiled from NASA and international space
                                    agencies. Analyze microgravity bone density loss, launch ages, and extended mission durations.
                                </p>
                                <div className="pt-2 flex flex-wrap items-center gap-4 font-mono text-xs">
                                    <Link
                                        href="/dataset"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20"
                                    >
                                        <span>VIEW ASTRONAUT DATASETS</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <span className="text-slate-400">
                                        Archive table: <code className="text-cyan-300">dataset_records</code>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Mission Readiness Action Banner */}
                <section className="relative z-10 py-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="space-y-6">
                        <NasaLogo size={64} className="mx-auto drop-shadow-[0_0_20px_rgba(11,61,145,0.8)]" />
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            READY TO COMMENCE MISSION MONITORING?
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-light">
                            Authenticate with your designated NASA flight controller callsign or enlist new crew members
                            into the biomedical monitoring gateway.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-sm pt-2">
                            <Link
                                href={auth?.user ? dashboard() : login()}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 font-bold shadow-xl shadow-cyan-500/20 transition-all"
                            >
                                <Lock className="w-4 h-4" />
                                <span>{auth?.user ? 'OPEN CONSOLE' : 'AUTHORIZATION LOGIN'}</span>
                            </Link>
                            {!auth?.user && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white transition-all"
                                >
                                    <UserCheck className="w-4 h-4 text-cyan-400" />
                                    <span>ENLIST CREW MEMBER</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Mission Footer */}
                <footer className="relative z-10 border-t border-[#0b3d91]/40 bg-[#020610] py-12 text-slate-400 font-mono text-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
                            {/* Col 1 */}
                            <div className="space-y-3 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <NasaLogo size={36} />
                                    <div>
                                        <div className="text-white font-bold tracking-wider">NASA AHMS</div>
                                        <div className="text-[10px] text-cyan-400">HUMAN RESEARCH PROGRAM</div>
                                    </div>
                                </div>
                                <p className="text-slate-400 font-sans text-xs max-w-md font-light">
                                    National Aeronautics and Space Administration • Lyndon B. Johnson Space Center (JSC Houston, TX)
                                    Astronaut Health Monitoring System. Built for deep space and planetary surface operations.
                                </p>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-2">
                                <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                                    NAVIGATION
                                </div>
                                <div className="flex flex-col space-y-1.5 text-slate-400">
                                    <Link href="/" className="hover:text-cyan-400 transition-colors">Mission Briefing</Link>
                                    <Link href={dashboard()} className="hover:text-cyan-400 transition-colors">Mission Control HUD</Link>
                                    {auth?.user && (
                                        <Link href="/dataset" className="hover:text-cyan-400 transition-colors">Kaggle Telemetry Archive</Link>
                                    )}
                                    <Link href={login()} className="hover:text-cyan-400 transition-colors">Personnel Gateway</Link>
                                </div>
                            </div>

                            {/* Col 3 */}
                            <div className="space-y-2">
                                <div className="text-white font-semibold uppercase tracking-wider text-[11px]">
                                    SECURITY & PROTOCOL
                                </div>
                                <div className="flex flex-col space-y-1.5 text-slate-400 text-[11px]">
                                    <span>NASA-STD-3001 COMPLIANT</span>
                                    <span>AES-256 ENCRYPTED RELAY</span>
                                    <span>DSN TELEMETRY FEED</span>
                                    <span>LEVEL-4 CLEARANCE</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                            <div>
                                © {new Date().getFullYear()} NASA Biomedical Operations. Official Mission Operations System.
                            </div>
                            <div className="flex items-center gap-4">
                                <span>SYSTEM STATUS: <strong className="text-emerald-400">ALL SYSTEMS NOMINAL</strong></span>
                                <span>BUILD: <strong className="text-cyan-400">AHMS-v3.4.1</strong></span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
