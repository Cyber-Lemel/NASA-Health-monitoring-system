import React, { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import {
    Fingerprint,
    ShieldAlert,
    UserCheck,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    BadgeCheck
} from 'lucide-react';
import InputError from '@/components/input-error';
import { login, home } from '@/routes';
import { store } from '@/routes/register';
import NasaLogo from '@/components/nasa-logo';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Mission Specialist');

    const ROLES = [
        'Mission Commander',
        'Flight Surgeon',
        'Payload Specialist',
        'Systems Engineer'
    ];

    return (
        <>
            <Head title="NASA AHMS • Enlist Crew Member">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            <div className="min-h-screen bg-[#020813] text-slate-100 font-sans selection:bg-[#0284c7] selection:text-white flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
                {/* Background Cosmic Starfield and Ambient Glows */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-24 right-1/4 w-[700px] h-[700px] bg-[#0b3d91]/25 rounded-full blur-[160px]" />
                    <div className="absolute -bottom-24 left-1/4 w-[700px] h-[700px] bg-[#0284c7]/20 rounded-full blur-[170px]" />
                    <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#fc3d21]/10 rounded-full blur-[140px]" />
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
                            <span className="hidden sm:inline text-slate-400">HUMAN RESEARCH PROGRAM</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-cyan-400 font-medium">PROTOCOL // FORM-NASA-281</span>
                        </div>
                    </div>

                    {/* Front Sci-Fi Console Card */}
                    <div className="relative rounded-3xl border border-[#0b3d91]/60 bg-gradient-to-b from-[#06142c]/95 via-[#030b18]/95 to-[#020813] shadow-2xl shadow-[#0b3d91]/25 backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                        {/* High-tech corner accents */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

                        {/* LEFT PANEL: Mission Clearance Briefing */}
                        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#0b3d91]/40 flex flex-col justify-between bg-gradient-to-b from-[#0b3d91]/25 via-[#040f23]/30 to-transparent relative">
                            {/* Watermark in background */}
                            <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
                                <NasaLogo size={260} />
                            </div>

                            <div className="space-y-6 relative z-10">
                                {/* Top Mission Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b3d91]/40 border border-[#0b3d91]/80 text-[11px] font-mono text-cyan-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                                    <span>ASTRONAUT ENLISTMENT CORPS</span>
                                </div>

                                {/* Logo & Title */}
                                <div className="space-y-3">
                                    <div className="inline-block p-2 rounded-2xl bg-slate-900/80 border border-[#0b3d91]/60 shadow-lg shadow-[#0b3d91]/30">
                                        <NasaLogo size={60} />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans leading-tight">
                                        CREW ENLISTMENT
                                    </h1>
                                    <p className="text-xs sm:text-sm text-cyan-400 font-mono tracking-wider leading-relaxed">
                                        FLIGHT READINESS ONBOARDING
                                    </p>
                                    <p className="text-xs sm:text-sm text-slate-300 font-sans font-light leading-relaxed pt-1">
                                        Register new mission personnel and generate biometric profile clearance for
                                        lunar, Martian, and orbital deep-space missions.
                                    </p>
                                </div>

                                {/* Operational Directives Card */}
                                <div className="rounded-2xl border border-slate-800 bg-[#020b18]/80 p-4 space-y-2.5 font-mono text-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400 pb-2 border-b border-slate-800">
                                        <span>BIO-CLEARANCE:</span>
                                        <span className="text-cyan-300 font-semibold">LEVEL-4 COSMIC</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400 pb-2 border-b border-slate-800">
                                        <span>COMPLIANCE:</span>
                                        <span className="text-emerald-400 font-semibold">NASA-STD-3001</span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-1 text-slate-400">
                                        <span>DSN INTEGRATION:</span>
                                        <span className="text-cyan-300">AUTOMATIC SYNC</span>
                                    </div>
                                </div>
                            </div>

                            {/* Left Footer Login Link */}
                            <div className="pt-6 mt-6 border-t border-slate-800/80 text-xs font-mono relative z-10">
                                <span className="text-slate-400 block mb-1">Already hold active credentials?</span>
                                <Link
                                    href={login()}
                                    className="text-cyan-300 font-bold hover:text-white flex items-center gap-1.5 transition-colors"
                                >
                                    <span>Authorized Gateway Login</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Enlistment Form */}
                        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            {/* Header */}
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-wide">
                                        PERSONNEL CLEARANCE
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 leading-relaxed">
                                        Assign designated astronaut identification and encryption keys
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono text-xs shrink-0">
                                    NEW-PROFILE
                                </span>
                            </div>

                            {/* Form */}
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password', 'password_confirmation']}
                                disableWhileProcessing
                                className="space-y-4 sm:space-y-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Directive Banner */}
                                        <div className="bg-[#0b3d91]/20 border border-[#0b3d91]/50 text-slate-300 text-xs font-mono py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-center leading-relaxed">
                                            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <span>INITIALIZE NEW ASTRONAUT TELEMETRY STREAM</span>
                                        </div>

                                        {/* Role Selector Badges */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal">
                                                Flight Specialty / Role Designation
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                                                {ROLES.map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => setSelectedRole(role)}
                                                        className={`px-3.5 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer min-h-[44px] ${
                                                            selectedRole === role
                                                                ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                                                                : 'border-slate-800 bg-[#020b18]/60 text-slate-400 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <span className="truncate">{role}</span>
                                                        {selectedRole === role && (
                                                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Name Input */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="name"
                                                className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                            >
                                                Designated Astronaut Name
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    required
                                                    autoFocus
                                                    autoComplete="name"
                                                    className="w-full pl-10 pr-4 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                    placeholder="CDR. Alex Vance"
                                                />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="email"
                                                className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                            >
                                                Astronaut Callsign / Official Email
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
                                                    autoComplete="email"
                                                    className="w-full pl-10 pr-4 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                    placeholder="alex.vance@nasa.gov"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Passwords in responsive grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            {/* Password */}
                                            <div className="space-y-1.5">
                                                <label
                                                    htmlFor="password"
                                                    className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                                >
                                                    Assign Encryption Key
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        required
                                                        autoComplete="new-password"
                                                        className="w-full pl-10 pr-11 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                        placeholder="••••••••"
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

                                            {/* Confirm Password */}
                                            <div className="space-y-1.5">
                                                <label
                                                    htmlFor="password_confirmation"
                                                    className="block text-xs font-mono uppercase tracking-wider text-cyan-300 leading-normal"
                                                >
                                                    Verify Encryption Key
                                                </label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                                        <Lock className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        name="password_confirmation"
                                                        required
                                                        autoComplete="new-password"
                                                        className="w-full pl-10 pr-11 py-3 bg-[#020b18]/80 border border-slate-700/80 rounded-xl text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all leading-normal"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer"
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        </div>

                                        {/* Terms Acknowledgement */}
                                        <div className="p-3 rounded-xl bg-[#020b18]/70 border border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed flex items-start gap-2.5">
                                            <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            <span>
                                                I certify adherence to NASA-STD-3001 spaceflight medical confidentiality
                                                and biomedical telemetry encryption directives.
                                            </span>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-bold font-mono tracking-wider uppercase text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer pt-3"
                                        >
                                            <Fingerprint className="w-4 h-4 shrink-0" />
                                            <span>{processing ? 'INITIALIZING CLEARANCE...' : 'INITIALIZE ASTRONAUT CLEARANCE'}</span>
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
Register.layout = (page: React.ReactNode) => page;
