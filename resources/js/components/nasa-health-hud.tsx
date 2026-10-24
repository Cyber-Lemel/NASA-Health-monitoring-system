import React, { useEffect, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Flame,
    Gauge,
    Heart,
    Radio,
    RefreshCw,
    Send,
    Shield,
    Sparkles,
    Terminal,
    Wifi,
    WifiOff,
    Wind,
    Zap,
} from 'lucide-react';

export interface TelemetryData {
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

interface TelemetryPacket {
    id: string;
    received_at: string;
    data: TelemetryData;
}

interface NasaHealthHudProps {
    initialData?: TelemetryData;
}

export default function NasaHealthHud({ initialData }: NasaHealthHudProps) {
    const defaultData: TelemetryData = {
        astronaut_id: 'AST-01',
        astronaut_name: 'Commander Alex Vance',
        role: 'Mission Commander',
        heart_rate: 76,
        oxygen_saturation: 98.4,
        core_temperature: 37.0,
        suit_pressure: 101.3,
        radiation_rate: 0.215,
        status: 'Nominal',
        mission_elapsed_time: 'MET +14:08:32',
    };

    const [telemetry, setTelemetry] = useState<TelemetryData>(initialData || defaultData);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
    const [packets, setPackets] = useState<TelemetryPacket[]>([]);
    const [isPinging, setIsPinging] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('Just now');
    const [pulseAnim, setPulseAnim] = useState(false);

    useEffect(() => {
        let channel: any = null;

        if (typeof window !== 'undefined' && window.Echo) {
            try {
                // Subscribe to Reverb WebSocket channel
                channel = window.Echo.channel('mission-telemetry');

                channel.listen('.telemetry.updated', (payload: { telemetry: TelemetryData; timestamp: string }) => {
                    if (payload && payload.telemetry) {
                        setTelemetry(payload.telemetry);
                        setLastUpdated(new Date().toLocaleTimeString());
                        setPulseAnim(true);
                        setTimeout(() => setPulseAnim(false), 800);

                        setPackets((prev) => [
                            {
                                id: Math.random().toString(36).substring(2, 9),
                                received_at: new Date().toLocaleTimeString(),
                                data: payload.telemetry,
                            },
                            ...prev.slice(0, 7),
                        ]);
                    }
                });

                // Check pusher connection status if available
                const pusher = (window.Echo.connector as any)?.pusher;
                if (pusher?.connection) {
                    setConnectionStatus(pusher.connection.state === 'connected' ? 'connected' : 'connecting');
                    pusher.connection.bind('state_change', (states: any) => {
                        if (states.current === 'connected') {
                            setConnectionStatus('connected');
                        } else if (states.current === 'connecting') {
                            setConnectionStatus('connecting');
                        } else {
                            setConnectionStatus('disconnected');
                        }
                    });
                } else {
                    setConnectionStatus('connected');
                }
            } catch (error) {
                console.error('Error binding to Reverb channel:', error);
                setConnectionStatus('disconnected');
            }
        }

        return () => {
            if (channel && typeof window !== 'undefined' && window.Echo) {
                window.Echo.leaveChannel('mission-telemetry');
            }
        };
    }, []);

    const sendBiometricPing = async (customId?: string) => {
        setIsPinging(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/api/telemetry/ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    astronaut_id: customId || telemetry.astronaut_id,
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
        } catch (err) {
            console.error('Failed to trigger telemetry ping:', err);
        } finally {
            setIsPinging(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            {/* Top Mission Control Bar */}
            <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-slate-950/80 p-6 backdrop-blur-xl shadow-2xl shadow-sky-950/30">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`} />
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            </span>
                            <span className="font-mono text-xs uppercase tracking-widest text-sky-400 font-semibold">
                                NASA Mission Control HUD // Real-Time Biometric Feed
                            </span>
                        </div>
                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>BioTelemetry Telepresence</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full border border-sky-500/30 bg-sky-950/50 text-sky-300 font-mono font-medium">
                                LIVE REVERB WS
                            </span>
                        </h2>
                    </div>

                    {/* Connection & MET Details */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-slate-300">
                            {connectionStatus === 'connected' ? (
                                <Wifi className="h-4 w-4 text-emerald-400 animate-pulse" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-amber-400" />
                            )}
                            <span>Reverb:</span>
                            <span className={connectionStatus === 'connected' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                                {connectionStatus.toUpperCase()}
                            </span>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-mono text-xs text-slate-300">
                            <span className="text-slate-400">MET: </span>
                            <span className="text-cyan-300 font-bold">{telemetry.mission_elapsed_time}</span>
                        </div>

                        <button
                            onClick={() => sendBiometricPing()}
                            disabled={isPinging}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 active:scale-95"
                        >
                            <Send className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                            <span>{isPinging ? 'Transmitting...' : 'Ping Telemetry'}</span>
                        </button>
                    </div>
                </div>

                {/* Astronaut Profile & Quick Switcher */}
                <div className="relative mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-900/50 to-slate-900 flex items-center justify-center font-mono font-bold text-sky-300 shadow-inner ${pulseAnim ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 transition-all' : ''}`}>
                            {telemetry.astronaut_id.split('-')[1]}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white text-base">{telemetry.astronaut_name}</h3>
                                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${telemetry.status === 'Nominal' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'}`}>
                                    {telemetry.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono">
                                {telemetry.role} // ID: {telemetry.astronaut_id} // Updated: {lastUpdated}
                            </p>
                        </div>
                    </div>

                    {/* Astronaut Selection Pill */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono mr-1">Switch Astronaut:</span>
                        {[
                            { id: 'AST-01', label: 'Vance' },
                            { id: 'AST-02', label: 'Rostova' },
                            { id: 'AST-03', label: 'Cole' },
                        ].map((ast) => (
                            <button
                                key={ast.id}
                                onClick={() => sendBiometricPing(ast.id)}
                                className={`px-2.5 py-1 text-xs font-mono rounded border transition ${telemetry.astronaut_id === ast.id ? 'bg-sky-500/20 border-sky-400 text-sky-200' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                            >
                                {ast.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vitals Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Heart Rate Card */}
                <div className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-slate-950/70 p-4 backdrop-blur-md transition hover:border-rose-500/40">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-mono font-medium uppercase tracking-wider text-rose-400/90 flex items-center gap-1.5">
                            <Heart className={`h-3.5 w-3.5 text-rose-500 ${pulseAnim ? 'scale-125 animate-ping' : ''}`} />
                            Heart Rate
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">BPM</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                            {telemetry.heart_rate}
                        </span>
                        <span className="text-xs font-mono text-rose-400">bpm</span>
                    </div>
                    {/* Pulsing ECG line visual */}
                    <div className="mt-3 h-8 w-full overflow-hidden flex items-center">
                        <svg className="w-full h-8 text-rose-500/60" viewBox="0 0 100 24" preserveAspectRatio="none">
                            <path
                                d="M0,12 L20,12 L25,4 L30,20 L35,6 L40,16 L45,12 L100,12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                        <span>Range: 60 - 120</span>
                        <span className={telemetry.heart_rate > 100 ? 'text-amber-400' : 'text-emerald-400'}>
                            {telemetry.heart_rate > 100 ? 'Elevated' : 'Optimal'}
                        </span>
                    </div>
                </div>

                {/* Oxygen Saturation Card */}
                <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-950/70 p-4 backdrop-blur-md transition hover:border-cyan-500/40">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-mono font-medium uppercase tracking-wider text-cyan-400/90 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-cyan-400" />
                            O2 Saturation
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">SpO2</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                            {telemetry.oxygen_saturation}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">%</span>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, telemetry.oxygen_saturation)}%` }}
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                        <span>Target: ≥ 95.0%</span>
                        <span className="text-emerald-400">Safe</span>
                    </div>
                </div>

                {/* Core Temperature Card */}
                <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-slate-950/70 p-4 backdrop-blur-md transition hover:border-amber-500/40">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-mono font-medium uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5 text-amber-400" />
                            Core Temp
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Celsius</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                            {telemetry.core_temperature}
                        </span>
                        <span className="text-xs font-mono text-amber-400">°C</span>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                            style={{ width: `${((telemetry.core_temperature - 35) / 4) * 100}%` }}
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                        <span>Norm: 36.5 - 37.5</span>
                        <span className="text-emerald-400">Normothermic</span>
                    </div>
                </div>

                {/* Suit Pressure Card */}
                <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-950/70 p-4 backdrop-blur-md transition hover:border-indigo-500/40">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-mono font-medium uppercase tracking-wider text-indigo-400/90 flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                            Suit Pressure
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Atm</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                            {telemetry.suit_pressure}
                        </span>
                        <span className="text-xs font-mono text-indigo-400">kPa</span>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (telemetry.suit_pressure / 110) * 100)}%` }}
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                        <span>101.3 kPa Nominal</span>
                        <span className="text-emerald-400">Pressurized</span>
                    </div>
                </div>

                {/* Radiation Exposure Card */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-950/70 p-4 backdrop-blur-md transition hover:border-emerald-500/40">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-mono font-medium uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-emerald-400" />
                            Radiation Dose
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Rate</span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                            {telemetry.radiation_rate}
                        </span>
                        <span className="text-xs font-mono text-emerald-400">μSv/h</span>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, (telemetry.radiation_rate / 0.5) * 100)}%` }}
                        />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                        <span>Limit: &lt; 0.500</span>
                        <span className="text-emerald-400">Safe Level</span>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Live Reverb WebSocket Telemetry Log & Architecture Stack Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Inbound Packets Terminal */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-cyan-400" />
                            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold">
                                Inbound Reverb WebSocket Event Stream
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                            Channel: <code className="text-cyan-300">mission-telemetry</code>
                        </span>
                    </div>

                    <div className="mt-3 font-mono text-xs space-y-2 max-h-56 overflow-y-auto pr-1">
                        {packets.length === 0 ? (
                            <div className="py-6 text-center text-slate-400">
                                <Radio className="h-6 w-6 mx-auto mb-2 text-slate-400 animate-pulse" />
                                <p>Listening for real-time Reverb broadcasts...</p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Click &quot;Ping Telemetry&quot; above or run <code className="text-sky-300">php artisan telemetry:simulate</code> in console.
                                </p>
                            </div>
                        ) : (
                            packets.map((pkt) => (
                                <div
                                    key={pkt.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 transition-all hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                                        <span className="text-slate-400">[{pkt.received_at}]</span>
                                        <span className="text-sky-300 font-semibold">{pkt.data.astronaut_name}</span>
                                        <span className="text-slate-400 text-[11px]">({pkt.data.astronaut_id})</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px]">
                                        <span className="text-rose-400">{pkt.data.heart_rate} bpm</span>
                                        <span className="text-cyan-400">{pkt.data.oxygen_saturation}% O2</span>
                                        <span className="text-slate-400">{pkt.data.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Stack Verification Checklist */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                            <Shield className="h-4 w-4 text-emerald-400" />
                            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-semibold">
                                Architecture Stack Status
                            </h3>
                        </div>

                        <ul className="mt-4 space-y-3 font-mono text-xs">
                            <li className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 border border-slate-800/60">
                                <span className="text-slate-300">Framework</span>
                                <span className="flex items-center gap-1.5 font-bold text-red-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    Laravel 13.x
                                </span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 border border-slate-800/60">
                                <span className="text-slate-300">Frontend UI</span>
                                <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    React 18.3.1
                                </span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 border border-slate-800/60">
                                <span className="text-slate-300">Adapter</span>
                                <span className="flex items-center gap-1.5 font-bold text-purple-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    Inertia.js
                                </span>
                            </li>
                            <li className="flex items-center justify-between rounded-lg bg-slate-900/50 p-2 border border-slate-800/60">
                                <span className="text-slate-300">WebSockets</span>
                                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    Laravel Reverb (:8080)
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                        Run: <code className="text-cyan-300">php artisan reverb:start</code> for local WebSocket server.
                    </div>
                </div>
            </div>
        </div>
    );
}
