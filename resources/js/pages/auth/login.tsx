import React, { useState } from 'react';
import { Form, Head, Link, router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import {
    Fingerprint,
    ShieldAlert,
    Lock,
    User,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Hand,
    Scan,
    Shield,
    Activity,
    Cpu,
    LoaderCircle
} from 'lucide-react';
import InputError from '@/components/input-error';
import { register, home } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import NasaLogo from '@/components/nasa-logo';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [scannedBiometric, setScannedBiometric] = useState<string | null>(null);

    // Passkey verification integration
    const {
        verify: verifyPasskey,
        isLoading: isPasskeyLoading,
        error: passkeyError,
        isSupported: isPasskeySupported,
    } = usePasskeyVerify({
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    const handleBiometricClick = (type: string) => {
        if (type === 'TOUCH ID' && isPasskeySupported) {
            verifyPasskey();
            return;
        }
        setScannedBiometric(type);
        setTimeout(() => {
            setScannedBiometric(null);
        }, 2500);
    };

    return (
        <>
            <Head title="NASA AHMS • Secure Gateway Authorization">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            <div className="min-h-screen bg-[#020813] text-slate-100 font-sans selection:bg-[#0284c7] selection:text-white flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
                {/* Background Cosmic Starfield and Ambient Glows */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-24 left-1/4 w-[700px] h-[700px] bg-[#0b3d91]/25 rounded-full blur-[160px]" />
                    <div className="absolute -bottom-24 right-1/4 w-[700px] h-[700px] bg-[#0284c7]/20 rounded-full blur-[170px]" />
                    <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#fc3d21]/10 rounded-full blur-[140px]" />
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                </div>

                {/* Single Front Card Container */}
                <div className="w-full max-w-5xl mx-auto relative z-10 my-auto">
                    {/* Top utility navigation */}
                    <div className="mb-4 px-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <span>←</span>
                            <span>RETURN TO MISSION BRIEFING</span>
                        </Link>
                        <div className="flex items-center gap-3 text-slate-500">
                            <span className="hidden sm:inline text-slate-400">CLEARANCE: LEVEL-4</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-cyan-400 font-medium">TERMINAL // JSC-HOU-9904</span>
                        </div>
                    </div>

                    {/* Front Sci-Fi Console Card */}
                    <div className="relative rounded-3xl border border-[#0b3d91]/60 bg-gradient-to-b from-[#06142c]/95 via-[#030b18]/95 to-[#020813] shadow-2xl shadow-[#0b3d91]/25 backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        {/* High-tech corner accents */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

                        {/* LEFT PANEL: Mission Briefing & Status HUD */}
                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#0b3d91]/40 flex flex-col justify-between bg-gradient-to-b from-[#0b3d91]/25 via-[#040f23]/30 to-transparent relative">
                            {/* Watermark in background */}
                            <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
                                <NasaLogo size={260} />
                            </div>

                            <div className="space-y-6 relative z-10">
                                {/* Top Mission Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b3d91]/40 border border-[#0b3d91]/80 text-[11px] font-mono text-cyan-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                    <span>NASA BIOMEDICAL GATEWAY</span>
                                </div>

                                {/* Logo & Title */}
                                <div className="space-y-3">
                                    <div className="inline-block p-2 rounded-2xl bg-slate-900/80 border border-[#0b3d91]/60 shadow-lg shadow-[#0b3d91]/30">
                                        <NasaLogo size={60} />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans leading-tight">
                                        MISSION CONTROL GATEWAY
                                    </h1>
                                    <p className="text-xs sm:text-sm text-cyan-400 font-mono tracking-wider leading-relaxed">
                                        ASTRONAUT HEALTH MONITORING SYSTEM
                                    </p>
                                    <p className="text-xs sm:text-sm text-slate-300 font-sans font-light leading-relaxed pt-1">
                                        Secure biomedical authorization console for Flight Surgeons, Capsule Communicators,
                                        and Mission Specialists managing real-time deep space telemetry.
                                    </p>
                                </div>

                                {/* Live Terminal Specs Card */}
                                <div className="rounded-2xl border border-slate-800 bg-[#020b18]/80 p-4 space-y-2.5 font-mono text-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400 pb-2 border-b border-slate-800">
                                        <span>RELAY LINK:</span>
                                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                                            DSN GOLDSTONE (ACTIVE)
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400 pb-2 border-b border-slate-800">
                                        <span>ENCRYPTION:</span>
                                        <span className="text-cyan-300">AES-256-GCM CIPHER</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400">
                                        <span>CLEARANCE:</span>
                                        <span className="text-amber-400 font-semibold">LEVEL-4 COSMIC</span>
                                    </div>
                                </div>
                            </div>

                            {/* Left Footer Enlist Note */}
                            <div className="pt-6 mt-6 border-t border-slate-800/80 text-xs font-mono relative z-10">
                                <span className="text-slate-400 block mb-1">New flight personnel?</span>
                                <Link
                                    href={register()}
                                    className="text-cyan-300 font-bold hover:text-white flex items-center gap-1.5 transition-colors"
                                >
                                    <span>Enlist New Crew Member</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Form & Biometrics */}
                        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            {/* Header */}
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-wide">
                                        AUTHORIZATION LOGIN
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 leading-relaxed">
                                        Enter designated callsign credentials to access HUD
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono text-xs shrink-0">
                                    AUTH-GATEWAY
                                </span>
                            </div>

                            {/* Status Alert if Present */}
                            {status && (
                                <div className="mb-5 p-3.5 rounded-xl text-xs font-mono font-medium text-emerald-400 border border-emerald-900/60 bg-emerald-950/40 flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>{status}</span>
                                </div>
                            )}

                            {/* Passkey Error if Present */}
                            {passkeyError && (
                                <div className="mb-5 p-3.5 rounded-xl text-xs font-mono font-medium text-rose-400 border border-rose-900/60 bg-rose-950/40 flex items-center gap-2.5">
                                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>{passkeyError}</span>
                                </div>
                            )}

                            {/* Main Authentication Form */}
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-4 sm:space-y-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Classification Banner */}
                                        <div className="bg-[#0b3d91]/20 border border-[#0b3d91]/50 text-slate-300 text-xs font-mono py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-center leading-relaxed">
                                            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>RESTRICTED ACCESS • ALL SIGN-INS AUDITED BY JSC</span>
                                        </div>

                                        {/* Email / Astronaut ID Input */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                            >
                                                Astronaut ID / NASA Email
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    autoComplete="email"
                                                    className="w-full pl-10 pr-4 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                    placeholder="commander@nasa.gov or AST-00"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password / Encryption Key Input */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="password"
                                                    className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                                >
                                                    Security Encryption Key
                                                </label>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    required
                                                    autoComplete="current-password"
                                                    className="w-full pl-10 pr-12 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                    placeholder="••••••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* Remember / Password Recovery Row */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-1">
                                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    name="remember"
                                                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 h-4 w-4"
                                                />
                                                <span>Remember Station</span>
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={request()}
                                                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors flex items-center gap-1.5"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                    <span>Recover Access Key?</span>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Interactive Biometric Verification Panel */}
                                        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                                    MULTI-FACTOR BIOMETRIC
                                                </span>
                                                {scannedBiometric && (
                                                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        {scannedBiometric} VERIFIED
                                                    </span>
                                                )}
                                                {isPasskeyLoading && (
                                                    <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
                                                        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                                                        PASSKEY AUTHENTICATING...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleBiometricClick('HAND')}
                                                    className="p-3 rounded-xl border border-slate-800 bg-[#020b18]/60 hover:border-cyan-400 hover:bg-[#0b3d91]/20 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300 group cursor-pointer"
                                                >
                                                    <Hand className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                                                    <span className="text-[11px] font-mono tracking-wider font-semibold">HAND</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleBiometricClick('TOUCH ID')}
                                                    disabled={isPasskeyLoading}
                                                    className="p-3 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:border-cyan-400 hover:bg-[#0b3d91]/30 transition-all flex flex-col items-center justify-center gap-1 text-cyan-400 group cursor-pointer"
                                                >
                                                    <Fingerprint className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                                                    <span className="text-[11px] font-mono font-bold tracking-wider">TOUCH ID</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleBiometricClick('RETINA')}
                                                    className="p-3 rounded-xl border border-slate-800 bg-[#020b18]/60 hover:border-cyan-400 hover:bg-[#0b3d91]/20 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300 group cursor-pointer"
                                                >
                                                    <Scan className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                                                    <span className="text-[11px] font-mono tracking-wider font-semibold">RETINA</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing || isPasskeyLoading}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-bold font-mono tracking-wider uppercase text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer pt-3"
                                        >
                                            <Lock className="w-4 h-4 shrink-0" />
                                            <span>{processing ? 'AUTHENTICATING TELEMETRY...' : 'ENTER MISSION CONTROL'}</span>
                                            <ArrowRight className="w-4 h-4 shrink-0" />
                                        </button>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Disable outer layout wrapper to ensure only the single front card is rendered
Login.layout = (page: React.ReactNode) => page;
