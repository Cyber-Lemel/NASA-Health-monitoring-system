import React, { useState } from 'react';
import { 
    X, Settings as SettingsIcon, Bell, Radio, 
    Gauge, Thermometer, User, ExternalLink, Check 
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

interface SystemSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAudioAlertsEnabled: boolean;
    onToggleAudioAlerts: (enabled: boolean) => void;
    tempUnit: 'C' | 'F';
    onChangeTempUnit: (unit: 'C' | 'F') => void;
    pressureUnit: 'psi' | 'kPa';
    onChangePressureUnit: (unit: 'psi' | 'kPa') => void;
}

export default function SystemSettingsModal({
    isOpen,
    onClose,
    isAudioAlertsEnabled,
    onToggleAudioAlerts,
    tempUnit,
    onChangeTempUnit,
    pressureUnit,
    onChangePressureUnit,
}: SystemSettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-[#06121e] border border-[#1a4b6c] text-[#5cdbdf] font-mono shadow-[0_0_50px_rgba(10,31,46,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
                {/* Tech Corners */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]"></span>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                            <SettingsIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                MISSION CONTROL HUD PREFERENCES
                            </h3>
                            <p className="text-xs text-slate-400">
                                Calibration Units, WebSocket Telemetry, and Operational Alerts
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
                <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                    {/* Setting 1: Temperature Unit */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="text-white font-bold flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-orange-400" />
                                TEMPERATURE CALIBRATION SCALE
                            </div>
                            <div className="text-slate-400 text-[11px]">
                                Set core body temperature display standard (°Celsius / °Fahrenheit)
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-[#06121e] border border-[#1a4b6c] p-0.5">
                            <button
                                type="button"
                                onClick={() => onChangeTempUnit('C')}
                                className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                                    tempUnit === 'C' ? 'bg-[#5cdbdf] text-[#030b14]' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                °C (Celsius)
                            </button>
                            <button
                                type="button"
                                onClick={() => onChangeTempUnit('F')}
                                className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                                    tempUnit === 'F' ? 'bg-[#5cdbdf] text-[#030b14]' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                °F (Fahrenheit)
                            </button>
                        </div>
                    </div>

                    {/* Setting 2: Pressure Unit */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="text-white font-bold flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-[#5cdbdf]" />
                                SUIT PRESSURE METRIC
                            </div>
                            <div className="text-slate-400 text-[11px]">
                                Units for suit differential and atmospheric pressure
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-[#06121e] border border-[#1a4b6c] p-0.5">
                            <button
                                type="button"
                                onClick={() => onChangePressureUnit('psi')}
                                className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                                    pressureUnit === 'psi' ? 'bg-[#5cdbdf] text-[#030b14]' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                PSI (Pounds/sq in)
                            </button>
                            <button
                                type="button"
                                onClick={() => onChangePressureUnit('kPa')}
                                className={`px-3 py-1 font-bold cursor-pointer transition-colors ${
                                    pressureUnit === 'kPa' ? 'bg-[#5cdbdf] text-[#030b14]' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                kPa (Kilopascals)
                            </button>
                        </div>
                    </div>

                    {/* Setting 3: Audio Alerts */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="text-white font-bold flex items-center gap-2">
                                <Bell className="w-4 h-4 text-emerald-400" />
                                AUDITORY BIOMETRIC ALERTS & CHIMES
                            </div>
                            <div className="text-slate-400 text-[11px]">
                                Synthesizes audio pulse chimes when heart rate or thermal limits exceed threshold
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAudioAlertsEnabled}
                                onChange={(e) => {
                                    onToggleAudioAlerts(e.target.checked);
                                    toast.info(e.target.checked ? 'Auditory biometric chimes enabled' : 'Auditory biometric chimes muted');
                                }}
                                className="w-4 h-4 rounded text-[#5cdbdf] focus:ring-0 bg-[#06121e] border-[#1a4b6c]"
                            />
                            <span className="text-white">{isAudioAlertsEnabled ? 'ACTIVE' : 'MUTED'}</span>
                        </label>
                    </div>

                    {/* Setting 4: Account & Security Profile */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/30 p-3.5 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <div className="text-white font-bold flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-400" />
                                FLIGHT SURGEON PROFILE & SECURITY
                            </div>
                            <div className="text-slate-400 text-[11px]">
                                Password, Two-Factor Authentication, and Passkeys security
                            </div>
                        </div>
                        <Link
                            href="/settings/profile"
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 transition-colors font-bold cursor-pointer"
                        >
                            <span>MANAGE</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t border-[#1a4b6c] bg-[#0a1f2e]/80">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#5cdbdf] text-[#030b14] font-bold px-5 py-2 text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                        SAVE & CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}
