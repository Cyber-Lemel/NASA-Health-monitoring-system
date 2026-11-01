import { Form, Head } from '@inertiajs/react';
import { Fingerprint, Hand, Focus, ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import { Link } from '@inertiajs/react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="AHMS Secure Gateway - Log in" />
            <PasskeyVerify />
            
            <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono selection:bg-[#5cdbdf] selection:text-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Ambient glow backgrounds */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5cdbdf]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
                    {/* Starfield simulation dots */}
                    <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white/40 rounded-full"></div>
                    <div className="absolute top-[40%] right-[15%] w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="absolute bottom-[20%] left-[30%] w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                <div className="w-full max-w-lg relative z-10">
                    {/* Main Sci-Fi Container */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/80 backdrop-blur-xl p-8 relative">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#1a4b6c]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#1a4b6c]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1a4b6c]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#1a4b6c]"></div>
                        
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#030b14] border border-[#1a4b6c] text-[10px] tracking-[0.2em] text-slate-400">
                            SYSTEM TERMINAL
                        </div>

                        {/* Headers */}
                        <div className="text-center mb-8 space-y-2 mt-4">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white">
                                AHMS SECURE GATEWAY
                            </h1>
                            <p className="text-xs md:text-sm text-[#5cdbdf] tracking-widest uppercase">
                                Astronaut Health Monitoring System
                            </p>
                            <p className="text-xs text-slate-400 tracking-widest uppercase">
                                Authorization Required
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-green-400 border border-green-900/50 bg-green-900/20 py-2">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="bg-[#1a4b6c]/20 border border-[#1a4b6c]/50 text-slate-300 text-xs text-center py-2 tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                                        Secure Mission Control Access - Classified Status
                                    </div>

                                    {/* Email Input */}
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                            Enter Astronaut ID / Email
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="ID-NUM / EMAIL"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Input */}
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="password" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                                Secure Passcode / Encryption Key
                                            </label>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-red-500"></div>
                                                <div className="w-2 h-2 bg-yellow-500"></div>
                                                <div className="w-2 h-2 bg-green-500"></div>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Simulated Biometrics Panel */}
                                    <div className="mt-4 pt-4 border-t border-[#1a4b6c]/50">
                                        <p className="text-center text-[10px] md:text-xs text-slate-400 uppercase tracking-widest mb-4">
                                            Biometric Verification Required
                                        </p>
                                        <div className="flex justify-center gap-6 md:gap-8">
                                            <div className="relative p-4 border border-[#1a4b6c] bg-[#0a1f2e]/30 group cursor-not-allowed">
                                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500"></span>
                                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500"></span>
                                                <Hand className="w-8 h-8 text-orange-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="relative p-4 border border-[#5cdbdf] bg-[#5cdbdf]/10 group cursor-not-allowed">
                                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#5cdbdf]"></span>
                                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#5cdbdf]"></span>
                                                <Fingerprint className="w-8 h-8 text-[#5cdbdf] animate-pulse" />
                                            </div>
                                            <div className="relative p-4 border border-[#1a4b6c] bg-[#0a1f2e]/30 group cursor-not-allowed">
                                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500"></span>
                                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500"></span>
                                                <Focus className="w-8 h-8 text-orange-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="relative mt-6 group bg-gradient-to-r from-[#5cdbdf] to-[#4bc2c6] text-[#030b14] w-full py-4 font-bold tracking-widest uppercase hover:brightness-110 transition-all disabled:opacity-50"
                                    >
                                        <span className="absolute top-1 left-1 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#030b14]"></span>
                                        <span className="absolute bottom-1 right-1 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#030b14]"></span>
                                        {processing ? 'Authenticating...' : 'Enter Mission Control'}
                                    </button>
                                </>
                            )}
                        </Form>

                        {/* Footer Links */}
                        <div className="mt-8 flex flex-col items-center gap-4 text-xs">
                            <div className="flex gap-4 tracking-widest uppercase">
                                {canResetPassword && (
                                    <Link href={request()} className="text-slate-400 hover:text-[#5cdbdf] transition-colors">
                                        Recover Key
                                    </Link>
                                )}
                                <span className="text-[#1a4b6c]">|</span>
                                <Link href={register()} className="text-slate-400 hover:text-[#5cdbdf] transition-colors">
                                    Enlist (Sign Up)
                                </Link>
                            </div>
                            
                            <div className="text-center text-[10px] text-slate-500 tracking-wider mt-4">
                                <p>RESTRICTED ACCESS.</p>
                                <p>All activities are monitored and encrypted. AES-256 standard.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'AHMS Secure Gateway',
    description: 'Astronaut Health Monitoring System - Authorization Required',
};