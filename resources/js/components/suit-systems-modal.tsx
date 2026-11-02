import React, { useState } from 'react';
import { 
    X, Shield, Wind, Battery, Gauge, Zap, 
    CheckCircle2, RefreshCw, AlertTriangle, Cpu 
} from 'lucide-react';
import { toast } from 'sonner';

interface SuitSystemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suitPressure: number;
    o2Percent: number;
    batteryPercent: number;
    radiationStatus: string;
    onUpdateSuit: (updates: {
        suitPressurePsi?: number;
        o2Percent?: number;
        batteryPercent?: number;
    }) => void;
    onAddLog: (title: string, action: string) => void;
}

export default function SuitSystemsModal({
    isOpen,
    onClose,
    suitPressure,
    o2Percent,
    batteryPercent,
    radiationStatus,
    onUpdateSuit,
    onAddLog,
}: SuitSystemsModalProps) {
    const [lcgFlow, setLcgFlow] = useState<'HIGH' | 'MEDIUM' | 'LOW' | 'AUTO'>('HIGH');
    const [scrubberActive, setScrubberActive] = useState<'PRIMARY' | 'RESERVE'>('RESERVE');
    const [isPurging, setIsPurging] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(false);

    if (!isOpen) return null;

    const handleLcgChange = (level: 'HIGH' | 'MEDIUM' | 'LOW' | 'AUTO') => {
        setLcgFlow(level);
        onAddLog(`LCG Flow Adjusted to ${level}`, `[CONTROL] Liquid Cooling Garment coolant flow set to ${level}`);
        toast.success(`Liquid Cooling Garment flow set to ${level}`);
    };

    const handleScrubberToggle = () => {
        const next = scrubberActive === 'PRIMARY' ? 'RESERVE' : 'PRIMARY';
        setScrubberActive(next);
        onAddLog(`CO2 Scrubber Switched to ${next}`, `[SUIT] Active filtration switched to ${next} canister`);
        toast.info(`Active CO2 scrubber canister switched to ${next}`);
    };

    const handleCalibrateValves = async () => {
        setIsCalibrating(true);
        toast.info('Initiating suit pressure valve calibration...');
        await new Promise((r) => setTimeout(r, 800));
        onUpdateSuit({ suitPressurePsi: 4.3 });
        onAddLog('Suit Pressure Valves Calibrated', '[SUIT] Automated micro-valve seal test passed at 4.3 psi');
        toast.success('Suit pressure calibrated to nominal 4.3 psi');
        setIsCalibrating(false);
    };

    const handlePurgeFilter = async () => {
        setIsPurging(true);
        toast.warning('Executing primary loop O2 purge & filtration flush...');
        await new Promise((r) => setTimeout(r, 900));
        onUpdateSuit({ o2Percent: Math.min(22, o2Percent + 1) });
        onAddLog('O2 Filtration Loop Purged', '[SUIT] Nitrogen/CO2 contaminants flushed; O2 loop refreshed');
        toast.success('O2 filtration loop purge complete');
        setIsPurging(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#06121e] border border-[#1a4b6c] text-[#5cdbdf] font-mono shadow-[0_0_50px_rgba(10,31,46,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
                {/* Tech Corners */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]"></span>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                            <Wind className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                EVA SUIT LIFE SUPPORT CONTROL CENTER
                            </h3>
                            <p className="text-xs text-slate-400">
                                Subsystem Diagnostics & Extravehicular Garment Flow Management
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                    {/* Status Overview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 text-center space-y-1">
                            <Gauge className="w-4 h-4 mx-auto text-[#5cdbdf]" />
                            <div className="text-[10px] text-slate-400">SUIT PRESSURE</div>
                            <div className="text-white font-bold text-sm">{suitPressure} psi</div>
                            <div className="text-[9px] text-emerald-400">Nominal 4.0-4.5</div>
                        </div>

                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 text-center space-y-1">
                            <Wind className="w-4 h-4 mx-auto text-orange-400" />
                            <div className="text-[10px] text-slate-400">OXYGEN RESERVE</div>
                            <div className="text-orange-400 font-bold text-sm">{o2Percent}%</div>
                            <div className="text-[9px] text-slate-400">Threshold 20%</div>
                        </div>

                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 text-center space-y-1">
                            <Shield className="w-4 h-4 mx-auto text-emerald-400" />
                            <div className="text-[10px] text-slate-400">RADIATION</div>
                            <div className="text-emerald-400 font-bold text-sm">{radiationStatus}</div>
                            <div className="text-[9px] text-slate-400">0.21 mSv/h Safe</div>
                        </div>

                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 text-center space-y-1">
                            <Battery className="w-4 h-4 mx-auto text-yellow-400" />
                            <div className="text-[10px] text-slate-400">SUIT BATTERY</div>
                            <div className="text-white font-bold text-sm">{batteryPercent}%</div>
                            <div className="text-[9px] text-slate-400">4.8h Remaining</div>
                        </div>
                    </div>

                    {/* Control 1: Liquid Cooling Garment (LCG) Pump */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-white font-bold text-xs flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-[#5cdbdf]" />
                                    LIQUID COOLING GARMENT (LCG) THERMAL PUMP
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                    Regulates chilled water loop circulation to mitigate thermal exertion.
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 border border-cyan-500/40 bg-cyan-950 text-cyan-300">
                                ACTIVE: {lcgFlow}
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {(['HIGH', 'MEDIUM', 'LOW', 'AUTO'] as const).map((flow) => (
                                <button
                                    key={flow}
                                    type="button"
                                    onClick={() => handleLcgChange(flow)}
                                    className={`py-2 text-xs border font-bold transition-all cursor-pointer ${
                                        lcgFlow === flow
                                            ? 'border-[#5cdbdf] bg-[#5cdbdf] text-[#030b14] shadow-[0_0_10px_rgba(92,219,223,0.5)]'
                                            : 'border-[#1a4b6c] bg-[#06121e] text-slate-300 hover:text-white hover:border-slate-500'
                                    }`}
                                >
                                    {flow}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Control 2: CO2 Scrubber Canister */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-white font-bold text-xs flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-orange-400" />
                                    CO2 CHEMICAL SCRUBBER CANISTER
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                    Lithium hydroxide canister filtering carbon dioxide from exhaled suit gas.
                                </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 border border-orange-500/40 bg-orange-950 text-orange-300">
                                ACTIVE: {scrubberActive}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleScrubberToggle}
                                className="flex-1 py-2 px-3 border border-orange-500/60 bg-orange-950/40 text-orange-300 hover:bg-orange-900/50 transition-colors cursor-pointer font-bold"
                            >
                                SWITCH TO {scrubberActive === 'PRIMARY' ? 'RESERVE CANISTER' : 'PRIMARY CANISTER'}
                            </button>
                            <button
                                type="button"
                                onClick={handlePurgeFilter}
                                disabled={isPurging}
                                className="flex-1 py-2 px-3 border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isPurging ? 'FLUSHING LOOP...' : 'EXECUTE LOOP PURGE'}
                            </button>
                        </div>
                    </div>

                    {/* Control 3: Pressure Valves & Seals */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="text-white font-bold text-xs flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-emerald-400" />
                                    SUIT PRESSURE REGULATOR & RELIEF VALVES
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                    Automated solenoid valves maintaining atmospheric pressure differential.
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCalibrateValves}
                            disabled={isCalibrating}
                            className="w-full py-2 px-4 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 transition-colors cursor-pointer font-bold disabled:opacity-50"
                        >
                            {isCalibrating ? 'CALIBRATING VALVES...' : 'CALIBRATE SOLENOID VALVES & PRESSURE RELIEF'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-[#1a4b6c] bg-[#0a1f2e]/80">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#5cdbdf] text-[#030b14] font-bold px-5 py-2 text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                        CLOSE CONTROL CONSOLE
                    </button>
                </div>
            </div>
        </div>
    );
}
