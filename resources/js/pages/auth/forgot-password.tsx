import React from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import {
    KeyRound,
    Mail,
    ArrowRight,
    LoaderCircle,
    CheckCircle2,
    ShieldAlert,
    Radio,
    Lock,
    Shield,
    Sparkles
} from 'lucide-react';
import InputError from '@/components/input-error';
import { login, home } from '@/routes';
import { email } from '@/routes/password';
import NasaLogo from '@/components/nasa-logo';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="NASA AHMS • Cryptographic Key Recovery">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            <div className="min-h-screen bg-[#020813] text-slate-100 font-sans selection:bg-[#0284c7] selection:text-white flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden">
                {/* Background Cosmic Starfield and Ambient Glows */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] bg-[#0b3d91]/25 rounded-full blur-[150px]" />
                    <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-[#0284c7]/20 rounded-full blur-[160px]" />
                    <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#fc3d21]/10 rounded-full blur-[130px]" />
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

                {/* Expanded Responsive Container */}
                <div className="w-full max-w-4xl mx-auto relative z-10 my-4 sm:my-8">
                    {/* Top utility bar */}
                    <div className="mb-3 sm:mb-4 px-2 flex items-center justify-between text-xs font-mono">
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <span>←</span>
                            <span>RETURN TO GATEWAY LOGIN</span>
                        </Link>
                        <div className="flex items-center gap-3 text-slate-500">
                            <span className="hidden sm:inline">OVERRIDE PROTOCOL</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-cyan-400 font-medium">KEY-REC-09</span>
                        </div>
                    </div>

                    {/* Main Expanded Dual-Panel Container */}
                    <div className="relative rounded-3xl border border-[#0b3d91]/70 bg-gradient-to-b from-[#06142c]/95 via-[#030b18]/95 to-[#020813] shadow-2xl shadow-[#0b3d91]/25 backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        {/* High-tech corner accents */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

                        {/* LEFT PANEL: Emergency Security Briefing */}
                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#0b3d91]/40 flex flex-col justify-between bg-gradient-to-b from-[#0b3d91]/20 via-[#040f23]/40 to-transparent relative">
                            {/* Watermark in background */}
                            <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
                                <NasaLogo size={220} />
                            </div>

                            <div className="space-y-6 relative z-10">
                                {/* Top Mission Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b3d91]/40 border border-[#0b3d91]/80 text-[11px] font-mono text-cyan-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span>SECURITY OVERRIDE</span>
                                </div>

                                {/* Logo & Title */}
                                <div className="space-y-3">
                                    <div className="inline-block p-2 rounded-2xl bg-slate-900/80 border border-[#0b3d91]/60 shadow-lg shadow-[#0b3d91]/30">
                                        <NasaLogo size={58} />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
                                        KEY RECOVERY
                                    </h1>
                                    <p className="text-xs sm:text-sm text-cyan-400 font-mono tracking-wider">
                                        CRYPTOGRAPHIC RESET PROTOCOL
                                    </p>
                                    <p className="text-xs text-slate-300 font-sans font-light leading-relaxed">
                                        Transmit your registered astronaut callsign or NASA email. Our deep-space communications
                                        network will dispatch an emergency cryptographic reset sequence to restore your credentials.
                                    </p>
                                </div>

                                {/* Network status card */}
                                <div className="rounded-2xl border border-slate-800 bg-[#020b18]/80 p-4 space-y-2 font-mono text-xs">
                                    <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800">
                                        <span>DSN RELAYS:</span>
                                        <span className="text-emerald-400 font-semibold">ALL ONLINE</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>HASH ALGORITHM:</span>
                                        <span className="text-cyan-300">SHA-256 SIGNED</span>
                                    </div>
                                </div>
                            </div>

                            {/* Left Footer Link */}
                            <div className="pt-6 mt-6 border-t border-slate-800/80 text-xs font-mono relative z-10">
                                <Link
                                    href={login()}
                                    className="text-cyan-300 font-bold hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <span>Return to Gateway Login</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Form */}
                        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            {/* Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white font-sans tracking-wide">
                                        DISPATCH RESET LINK
                                    </h2>
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                                        Verification sequence will be transmitted to email
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono text-xs">
                                    RESET-REQ
                                </span>
                            </div>

                            {/* Success Status if sent */}
                            {status && (
                                <div className="mb-6 p-4 rounded-xl text-xs font-mono font-medium text-emerald-400 border border-emerald-900/60 bg-emerald-950/40 flex items-center gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span>{status}</span>
                                </div>
                            )}

                            {/* Form */}
                            <Form {...email.form()} className="space-y-5">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="block text-xs font-mono uppercase tracking-wider text-cyan-300"
                                            >
                                                Registered Astronaut Email Address
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-4 py-3.5 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                                    placeholder="e.g. astronaut@nasa.gov"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="email-password-reset-link-button"
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 active:scale-98 text-slate-950 font-bold font-mono tracking-wider uppercase text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer mt-3"
                                        >
                                            {processing ? (
                                                <>
                                                    <LoaderCircle className="w-4 h-4 animate-spin text-slate-950" />
                                                    <span>TRANSMITTING RECOVERY LINK...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <KeyRound className="w-4 h-4 text-slate-950" />
                                                    <span>TRANSMIT RECOVERY SEQUENCE</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
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

// Override default layout so it renders in full NASA theme
ForgotPassword.layout = (page: React.ReactNode) => page;
