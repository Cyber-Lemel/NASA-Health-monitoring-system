import { Form, Head } from '@inertiajs/react';
import { Fingerprint, Link as LinkIcon, ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Link } from '@inertiajs/react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="AHMS Enlistment - Register" />
            
            <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono selection:bg-[#5cdbdf] selection:text-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Ambient glow backgrounds */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5cdbdf]/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-lg relative z-10 my-8">
                    {/* Main Sci-Fi Container */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/80 backdrop-blur-xl p-8 relative">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#1a4b6c]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#1a4b6c]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1a4b6c]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#1a4b6c]"></div>
                        
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#030b14] border border-[#1a4b6c] text-[10px] tracking-[0.2em] text-slate-400">
                            PERSONNEL ENROLLMENT
                        </div>

                        {/* Headers */}
                        <div className="text-center mb-8 space-y-2 mt-4">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-wider text-white">
                                AHMS ENLISTMENT
                            </h1>
                            <p className="text-xs md:text-sm text-[#5cdbdf] tracking-widest uppercase">
                                Personnel Clearance Protocol
                            </p>
                            <p className="text-xs text-slate-400 tracking-widest uppercase">
                                Identity Verification Required
                            </p>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="bg-[#1a4b6c]/20 border border-[#1a4b6c]/50 text-slate-300 text-xs text-center py-2 tracking-widest uppercase mb-2 flex items-center justify-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-[#5cdbdf]" />
                                        Initialize New Mission Control Profile
                                    </div>

                                    {/* Name Input */}
                                    <div className="grid gap-2">
                                        <label htmlFor="name" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                            Designated Astronaut Name
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                autoFocus
                                                autoComplete="name"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="FULL DESIGNATION"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Email Input */}
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                            Astronaut ID / Email
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoComplete="email"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="ID-NUM / EMAIL"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Input */}
                                    <div className="grid gap-2">
                                        <label htmlFor="password" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                            Assign Encryption Key
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                autoComplete="new-password"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Password Confirmation Input */}
                                    <div className="grid gap-2">
                                        <label htmlFor="password_confirmation" className="text-[10px] md:text-xs text-[#5cdbdf] uppercase tracking-widest">
                                            Verify Encryption Key
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-[#5cdbdf]"></span>
                                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-[#5cdbdf]"></span>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                autoComplete="new-password"
                                                className="w-full bg-[#0a1f2e]/60 border border-[#1a4b6c] text-[#5cdbdf] px-4 py-3 text-sm focus:outline-none focus:border-[#5cdbdf] transition-colors placeholder:text-[#1a4b6c]"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="relative mt-6 group bg-gradient-to-r from-transparent via-[#5cdbdf]/10 to-transparent border border-[#5cdbdf] text-[#5cdbdf] w-full py-4 font-bold tracking-widest uppercase hover:bg-[#5cdbdf] hover:text-[#030b14] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        <span className="absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] border-current"></span>
                                        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] border-current"></span>
                                        <Fingerprint className="w-5 h-5" />
                                        {processing ? 'Generating Profile...' : 'Initialize Clearance'}
                                    </button>
                                </>
                            )}
                        </Form>

                        {/* Footer Links */}
                        <div className="mt-8 flex flex-col items-center gap-4 text-xs">
                            <div className="flex gap-4 tracking-widest uppercase">
                                <Link href={login()} className="text-slate-400 hover:text-[#5cdbdf] transition-colors flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Return to Gateway (Log In)
                                </Link>
                            </div>
                            
                            <div className="text-center text-[10px] text-slate-500 tracking-wider mt-4">
                                <p>AHMS INFRASTRUCTURE</p>
                                <p>Identity generation subject to Level-4 security review.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'AHMS Enlistment',
    description: 'Create your personnel clearance profile',
};