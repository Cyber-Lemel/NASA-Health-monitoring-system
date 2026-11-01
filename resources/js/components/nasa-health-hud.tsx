import React from 'react';
import { 
    Download, Upload, AlertCircle, AlertTriangle, 
    CheckSquare, ChevronDown 
} from 'lucide-react';

export default function NasaHealthHud({ initialData }: { initialData?: any }) {
    return (
        <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono p-4 flex flex-col gap-4 select-none">
            
            {/* Top Navigation */}
            <nav className="flex items-center gap-8 border-b border-[#1a4b6c] pb-0 text-sm tracking-wider">
                <div className="border-b-2 border-[#5cdbdf] pb-2 text-white font-bold cursor-pointer">DASHBOARD</div>
                <div className="pb-2 text-slate-400 hover:text-[#5cdbdf] cursor-pointer transition-colors">BIOMETRICS</div>
                <div className="pb-2 text-slate-400 hover:text-[#5cdbdf] cursor-pointer transition-colors">SUIT SYSTEMS</div>
                <div className="pb-2 text-slate-400 hover:text-[#5cdbdf] cursor-pointer transition-colors">MISSION LOGS</div>
                <div className="pb-2 text-slate-400 hover:text-[#5cdbdf] cursor-pointer transition-colors">SETTINGS</div>
            </nav>

            {/* Sub-Header & Actions */}
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <div className="border border-[#1a4b6c] px-3 py-1 bg-[#0a1f2e] text-xs">
                        <span className="text-slate-300">EVA STATUS: </span>
                        <span className="text-orange-400 font-bold">ON-GOING</span>
                    </div>
                    <div className="text-xs text-slate-300 tracking-widest uppercase">
                        CREW ID: CDR. ELENA ROVANI | MISSION: ODYSSEY II
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 border border-[#5cdbdf] text-[#5cdbdf] px-4 py-1.5 text-xs hover:bg-[#5cdbdf]/10 transition-colors">
                        <Download className="w-4 h-4" /> IMPORT DATA
                    </button>
                    <button className="flex items-center gap-2 border border-[#5cdbdf] text-[#5cdbdf] px-4 py-1.5 text-xs hover:bg-[#5cdbdf]/10 transition-colors">
                        <Upload className="w-4 h-4" /> EXPORT DATA
                    </button>
                </div>
            </div>

            {/* Main HUD Grid */}
            <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden mt-2">
                
                {/* LEFT COLUMN: Biometrics & Vitals */}
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-1">
                        <h2 className="text-sm tracking-wider text-slate-200">BIOMETRICS & VITALS</h2>
                        <div className="flex items-center gap-2 border border-[#1a4b6c] px-2 py-0.5 bg-[#0a1f2e] text-xs cursor-pointer">
                            SWITCH ASTRONAUT <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <VitalCard title="ECG" value="Heart Rate: 135 bpm" status="(Elevated)" color="#ef4444" type="ecg" />
                        <VitalCard title="SpO2" value="96%" color="#5cdbdf" type="sine" />
                        <VitalCard title="CORE TEMPERATURE" value="38.2°C" status="(Warm)" color="#f97316" type="ecg" />
                        <VitalCard title="RESPIRATION" value="24 bpm" color="#5cdbdf" type="slow-sine" />
                        <VitalCard title="HYDRATION" value="Low, 64%" status="" color="#5cdbdf" valueColor="#ef4444" type="flat" />
                    </div>
                </div>

                {/* CENTER COLUMN: 3D Body & Alerts */}
                <div className="col-span-6 grid grid-cols-2 gap-4">
                    {/* Astronaut Wireframe Placeholder */}
                    <div className="relative border border-[#1a4b6c]/50 bg-gradient-to-b from-transparent to-[#0a1f2e]/30 flex items-center justify-center">
                        {/* Note: Replace this SVG with your actual 3D Canvas or Three.js model */}
                        <div className="absolute top-4 right-4 animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        </div>
                        <svg viewBox="0 0 100 200" className="h-[90%] w-auto stroke-[#5cdbdf] fill-none drop-shadow-[0_0_5px_rgba(92,219,223,0.5)]" strokeWidth="0.5">
                            <path d="M50,20 C45,20 42,25 42,30 C42,35 45,38 50,38 C55,38 58,35 58,30 C58,25 55,20 50,20 Z" />
                            <path d="M50,38 L50,90" />
                            <path d="M42,45 L25,75 L20,110" />
                            <path d="M58,45 L75,75 L80,110" />
                            <path d="M45,90 L30,150 L25,190" />
                            <path d="M55,90 L70,150 L75,190" />
                            {/* Heat signatures */}
                            <circle cx="50" cy="45" r="10" fill="rgba(239,68,68,0.6)" className="blur-md" />
                            <circle cx="30" cy="130" r="8" fill="rgba(249,115,22,0.6)" className="blur-md" />
                            <circle cx="70" cy="130" r="8" fill="rgba(249,115,22,0.6)" className="blur-md" />
                        </svg>
                        <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-[10px]">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 block"></span> HEAT</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 block"></span> HEAT</div>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#1a4b6c] pb-1">
                            <h2 className="text-sm tracking-wider text-slate-200">ACTIVE ALERTS & DETECTED CONDITIONS</h2>
                        </div>
                        
                        {/* Primary Alert */}
                        <div className="border border-orange-500/50 bg-[#1a1005] p-3 text-xs space-y-3">
                            <div className="text-orange-400 font-bold border-b border-orange-500/30 pb-2">
                                INVASIVE: DEHYDRATION & THERMAL EXERTION (MODERATE)
                            </div>
                            <div className="space-y-1">
                                <div className="text-slate-400 mb-1">PROPER ACTION TAKEN</div>
                                <div className="flex gap-2 text-slate-300">
                                    <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>[CHECKED] Liquid Cooling Garment (LCG) flow increased to HIGH.</span>
                                </div>
                                <div className="flex gap-2 text-slate-300">
                                    <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>[CHECKED] In-suit electrolyte hydration dispenser activated (350ml consumed).</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-orange-500/30">
                                <div className="text-slate-400 mb-1">RECOMMENDED ACTION</div>
                                <div className="text-white">Reduce EVA physical exertion, Rest for 10 min.</div>
                            </div>
                        </div>

                        {/* Secondary Alert */}
                        <div className="border border-[#5cdbdf]/50 bg-[#0a1f2e]/50 p-3 text-xs space-y-3">
                            <div className="text-[#5cdbdf] font-bold border-b border-[#5cdbdf]/30 pb-2">
                                INDICATION: SUIT CO2 RISE (MILD)
                            </div>
                            <div className="space-y-1">
                                <div className="text-slate-400 mb-1">PROPER ACTION TAKEN</div>
                                <div className="flex gap-2 text-slate-300">
                                    <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>[CHECKED] Auto-switched to reserve scrubber system.</span>
                                </div>
                                <div className="flex gap-2 text-slate-300">
                                    <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                                    <span>[CHECKED] Primary filtration purge completed.</span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-[#5cdbdf]/30">
                                <div className="text-slate-400 mb-1">RECOMMENDED ACTION</div>
                                <div className="text-white">Monitor PPM levels closely.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Diagnostics & Logs */}
                <div className="col-span-3 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#1a4b6c] pb-1">
                            <h2 className="text-sm tracking-wider text-slate-200">ENVIRONMENTAL & SUIT DIAGNOSTICS</h2>
                        </div>
                        <ProgressBar label="SUIT PRESSURE" value="4.3 psi" percent={60} color="bg-[#5cdbdf]" />
                        <ProgressBar label="O2 LEVELS" value="21%" percent={21} color="bg-orange-400" />
                        <ProgressBar label="RADIATION" value="Safe" percent={85} color="bg-green-500" />
                        <ProgressBar label="BATTERY" value="74%" percent={74} color="bg-orange-400" />
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        <div className="border-b border-[#1a4b6c] pb-1">
                            <h2 className="text-sm tracking-wider text-slate-200">RESPONSE LOG / HISTORY</h2>
                        </div>
                        <div className="text-xs text-slate-400 mb-1">Incident -{'>'} Resolution</div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs border-l border-[#1a4b6c] pl-3 relative">
                            {[1, 2, 3, 4, 5].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-[#1a4b6c]"></div>
                                    <div className="text-slate-300">13:42 - O2 Flow adjust</div>
                                    <div className="text-slate-500">[ACTION] Automated Suit Valve calibr.</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for repeatable UI elements
function VitalCard({ title, value, status, color, valueColor, type }: any) {
    const textColor = valueColor || color;
    return (
        <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-end">
                <span className="text-slate-200">{title}</span>
                <span style={{ color: textColor }} className="font-bold text-sm">
                    {value} {status && <span>{status}</span>}
                </span>
            </div>
            <div className="relative h-12 w-full border border-[#1a4b6c]/50 bg-[#06121e] overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, #1a4b6c33 1px, transparent 1px), linear-gradient(to bottom, #1a4b6c33 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                }}></div>
                <GraphPath type={type} color={color} />
            </div>
        </div>
    );
}

function GraphPath({ type, color }: { type: string, color: string }) {
    let d = "";
    if (type === "ecg") {
        d = "M0,20 L10,20 L15,5 L20,35 L25,20 L40,20 L45,10 L50,30 L55,20 L70,20 L75,5 L80,35 L85,20 L100,20";
    } else if (type === "sine") {
        d = "M0,20 Q12.5,5 25,20 T50,20 T75,20 T100,20";
    } else if (type === "slow-sine") {
        d = "M0,20 Q25,0 50,20 T100,20";
    } else {
        d = "M0,20 L100,20"; // flatline
    }

    return (
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                className="drop-shadow-md"
            />
        </svg>
    );
}

function ProgressBar({ label, value, percent, color }: any) {
    return (
        <div className="text-xs">
            <div className="flex justify-between mb-1">
                <span className="text-slate-300">{label}</span>
                <span className="text-white">{value}</span>
            </div>
            <div className="h-3 w-full bg-[#0a1f2e] border border-[#1a4b6c] relative overflow-hidden flex">
                <div className={`${color} h-full`} style={{ width: `${percent}%` }}></div>
                {/* Indicator Triangle Arrow */}
                <div className="absolute top-0 bottom-0 w-2 bg-white/20" style={{ left: `${percent}%` }}></div>
            </div>
        </div>
    );
}