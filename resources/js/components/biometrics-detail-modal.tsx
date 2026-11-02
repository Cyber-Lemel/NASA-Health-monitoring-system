import React, { useState } from 'react';
import { 
    X, Activity, Heart, Thermometer, Droplets, 
    RefreshCw, CheckCircle2, AlertTriangle, Sparkles 
} from 'lucide-react';
import type { AstronautFullData } from '@/types/astronaut';
import { toast } from 'sonner';

interface BiometricsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    astronaut: AstronautFullData;
    onRecalibrate: () => void;
}

export default function BiometricsDetailModal({
    isOpen,
    onClose,
    astronaut,
    onRecalibrate,
}: BiometricsDetailModalProps) {
    const [isRecalibrating, setIsRecalibrating] = useState(false);

    if (!isOpen) return null;

    const handleCalibrate = async () => {
        setIsRecalibrating(true);
        toast.info('Recalibrating physiological skin sensors & optical biosensors...');
        await new Promise((r) => setTimeout(r, 800));
        onRecalibrate();
        toast.success('Biosensor baseline recalibration complete');
        setIsRecalibrating(false);
    };

    const isHighHr = astronaut.vitals.heartRate.numericValue > 110;
    const isWarm = astronaut.vitals.coreTemp.numericValue > 37.8;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl bg-[#06121e] border border-[#1a4b6c] text-[#5cdbdf] font-mono shadow-[0_0_50px_rgba(10,31,46,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
                {/* Tech Corners */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]"></span>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                    ADVANCED BIOMETRICS & PHYSIOLOGY MATRIX
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 border border-cyan-500/40 bg-cyan-950 text-cyan-300">
                                    LEAD-II ECG
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Real-Time Hemodynamic Monitoring for {astronaut.bio.name} ({astronaut.bio.id})
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
                    {/* Primary ECG Waveform Display */}
                    <div className="border border-[#1a4b6c] bg-[#030b14] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className={`w-4 h-4 ${isHighHr ? 'text-red-500 animate-pulse' : 'text-[#5cdbdf]'}`} />
                                <span className="text-white font-bold">ELECTROCARDIOGRAM (ECG LEAD-II)</span>
                                <span className={`text-[10px] px-2 py-0.5 border ${
                                    isHighHr ? 'border-red-500/50 bg-red-950/50 text-red-400' : 'border-emerald-500/50 bg-emerald-950/50 text-emerald-400'
                                }`}>
                                    {astronaut.vitals.heartRate.value} {isHighHr ? 'SINUS TACHYCARDIA' : 'NORMAL SINUS RHYTHM'}
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">25 mm/s • 10 mm/mV</span>
                        </div>

                        {/* Interactive Waveform Canvas SVG */}
                        <div className="relative h-28 w-full border border-[#1a4b6c]/60 bg-[#02070e] overflow-hidden">
                            {/* ECG Grid */}
                            <div 
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #1a4b6c26 1px, transparent 1px), linear-gradient(to bottom, #1a4b6c26 1px, transparent 1px)',
                                    backgroundSize: '16px 16px',
                                }}
                            />
                            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                                <path
                                    d="M0,50 L20,50 L25,48 L30,50 L35,50 L40,15 L45,85 L50,45 L55,50 L65,50 L75,35 L85,50 L120,50 L125,48 L130,50 L135,50 L140,15 L145,85 L150,45 L155,50 L165,50 L175,35 L185,50 L220,50 L225,48 L230,50 L235,50 L240,15 L245,85 L250,45 L255,50 L265,50 L275,35 L285,50 L320,50 L325,48 L330,50 L335,50 L340,15 L345,85 L350,45 L355,50 L365,50 L375,35 L385,50 L400,50"
                                    fill="none"
                                    stroke={isHighHr ? '#ef4444' : '#5cdbdf'}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-[0_0_8px_rgba(92,219,223,0.7)]"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Vitals Parameter Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Core Temperature */}
                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 space-y-2">
                            <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Thermometer className="w-4 h-4 text-orange-400" /> CORE TEMPERATURE
                                </span>
                                <span className="text-orange-400 font-bold">{astronaut.vitals.coreTemp.value}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                                {isWarm 
                                    ? 'Thermal exertion detected. Liquid Cooling Garment active.' 
                                    : 'Thermal regulation nominal.'}
                            </p>
                            <div className="text-[10px] text-slate-500">Normal Range: 36.5°C - 37.5°C</div>
                        </div>

                        {/* Pulse Oximetry */}
                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 space-y-2">
                            <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Activity className="w-4 h-4 text-[#5cdbdf]" /> OXYGEN SATURATION
                                </span>
                                <span className="text-[#5cdbdf] font-bold">{astronaut.vitals.spO2.value}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                                Peripheral capillary oxygen saturation monitored via wrist optical sensors.
                            </p>
                            <div className="text-[10px] text-slate-500">Normal Range: 95% - 100%</div>
                        </div>

                        {/* Hydration */}
                        <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-3 space-y-2">
                            <div className="flex items-center justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Droplets className="w-4 h-4 text-cyan-400" /> HYDRATION LEVEL
                                </span>
                                <span className="text-red-400 font-bold">{astronaut.vitals.hydration.value}</span>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                                In-suit electrolyte replenishment dispenser queue active.
                            </p>
                            <div className="text-[10px] text-slate-500">Baseline Target: 80% - 100%</div>
                        </div>
                    </div>

                    {/* Sensor Recalibration Bar */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/20 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <div className="text-white font-bold text-xs flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#5cdbdf]" />
                                SENSOR NOISE FILTER & ARTIFACT RECALIBRATION
                            </div>
                            <div className="text-slate-400 text-[11px]">
                                Filters EVA motion artifacts and synchronizes galvanic skin sensor baseline.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCalibrate}
                            disabled={isRecalibrating}
                            className="py-1.5 px-4 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 transition-colors cursor-pointer font-bold shrink-0 disabled:opacity-50"
                        >
                            {isRecalibrating ? 'RECALIBRATING...' : 'RECALIBRATE BIOSENSORS'}
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
                        CLOSE BIOMETRICS MATRIX
                    </button>
                </div>
            </div>
        </div>
    );
}
