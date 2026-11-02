import React, { useState, useEffect, useRef } from 'react';
import { 
    Download, Upload, AlertCircle, AlertTriangle, 
    CheckSquare, Square, ChevronDown, Check, User, Activity, 
    Database, Search, Sparkles, RefreshCw, Radio, Zap, 
    Play, Pause, Wind, Shield, Settings, ClipboardList, Send
} from 'lucide-react';
import Astronaut3DModel from '@/components/astronaut-3d-model';
import TelemetryImportModal from '@/components/telemetry-import-modal';
import TelemetryExportModal from '@/components/telemetry-export-modal';
import SuitSystemsModal from '@/components/suit-systems-modal';
import BiometricsDetailModal from '@/components/biometrics-detail-modal';
import MissionLogsModal from '@/components/mission-logs-modal';
import SystemSettingsModal from '@/components/system-settings-modal';
import type { 
    AstronautFullData, 
    ParsedImportPayload, 
    TelemetryLogItem 
} from '@/types/astronaut';
import { toast } from 'sonner';

// Default initial astronaut: CDR. Elena Rovani
const DEFAULT_ASTRONAUT: AstronautFullData = {
    bio: {
        id: 'AST-00',
        name: 'CDR. Elena Rovani',
        role: 'Mission Commander',
        mission: 'ODYSSEY II',
        evaStatus: 'ON-GOING',
        age: 38,
        gender: 'Female',
        country: 'USA / NASA',
        missionDurationDays: 195,
        boneDensityLoss: '-3.6%',
    },
    vitals: {
        heartRate: {
            title: 'ECG',
            value: 'Heart Rate: 135 bpm',
            numericValue: 135,
            unit: 'bpm',
            status: '(Elevated)',
            color: '#ef4444',
            type: 'ecg',
            baseline: '60 - 100 bpm',
        },
        spO2: {
            title: 'SpO2',
            value: '96%',
            numericValue: 96,
            unit: '%',
            color: '#5cdbdf',
            type: 'sine',
            baseline: '95 - 100%',
        },
        coreTemp: {
            title: 'CORE TEMPERATURE',
            value: '38.2°C',
            numericValue: 38.2,
            unit: '°C',
            status: '(Warm)',
            color: '#f97316',
            type: 'ecg',
            baseline: '36.5 - 37.5°C',
        },
        respiration: {
            title: 'RESPIRATION',
            value: '24 bpm',
            numericValue: 24,
            unit: 'bpm',
            color: '#5cdbdf',
            type: 'slow-sine',
            baseline: '12 - 20 bpm',
        },
        hydration: {
            title: 'HYDRATION',
            value: 'Low, 64%',
            numericValue: 64,
            unit: '%',
            color: '#5cdbdf',
            valueColor: '#ef4444',
            type: 'flat',
            baseline: '80 - 100%',
        },
    },
    diagnostics: {
        suitPressurePsi: 4.3,
        suitPressurePercent: 60,
        o2Percent: 21,
        radiationStatus: 'Safe',
        radiationPercent: 85,
        batteryPercent: 74,
    },
    alerts: [
        {
            level: 'WARNING',
            title: 'INVASIVE: DEHYDRATION & THERMAL EXERTION (MODERATE)',
            actionsTaken: [
                '[CHECKED] Liquid Cooling Garment (LCG) flow increased to HIGH.',
                '[CHECKED] In-suit electrolyte hydration dispenser activated (350ml consumed).',
            ],
            recommendedAction: 'Reduce EVA physical exertion, Rest for 10 min.',
        },
        {
            level: 'INFO',
            title: 'INDICATION: SUIT CO2 RISE (MILD)',
            actionsTaken: [
                '[CHECKED] Auto-switched to reserve scrubber system.',
                '[CHECKED] Primary filtration purge completed.',
            ],
            recommendedAction: 'Monitor PPM levels closely.',
        },
    ],
    logs: [
        {
            id: 'log-1',
            timestamp: '13:42',
            title: 'O2 Flow adjust',
            action: '[ACTION] Automated Suit Valve calibr.',
            status: 'RESOLVED',
        },
        {
            id: 'log-2',
            timestamp: '13:38',
            title: 'LCG Pump boost',
            action: '[ACTION] Thermal garment flow rate set to High.',
            status: 'RESOLVED',
        },
        {
            id: 'log-3',
            timestamp: '13:25',
            title: 'Hydration dispensing',
            action: '[ACTION] 350ml electrolyte fluid delivered.',
            status: 'RESOLVED',
        },
        {
            id: 'log-4',
            timestamp: '13:10',
            title: 'EVA Airlock egress',
            action: '[ACTION] Primary umbilical disconnect confirmed.',
            status: 'RESOLVED',
        },
        {
            id: 'log-5',
            timestamp: '12:55',
            title: 'Suit pressure integrity',
            action: '[ACTION] Pre-EVA leak test passed at 4.3 psi.',
            status: 'RESOLVED',
        },
    ],
};

export default function NasaHealthHud({ initialData }: { initialData?: any }) {
    // Active astronaut data
    const [activeAstronaut, setActiveAstronaut] = useState<AstronautFullData>(DEFAULT_ASTRONAUT);

    // Database crew roster
    const [crewList, setCrewList] = useState<any[]>(() => initialData?.records || []);

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BIOMETRICS' | 'SUIT SYSTEMS' | 'MISSION LOGS' | 'SETTINGS'>('DASHBOARD');

    // Modals visibility
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSuitModalOpen, setIsSuitModalOpen] = useState(false);
    const [isBiometricsModalOpen, setIsBiometricsModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // Astronaut switcher dropdown state
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [switcherSearch, setSwitcherSearch] = useState('');
    const switcherRef = useRef<HTMLDivElement>(null);

    // EVA status selector dropdown state
    const [isEvaSelectorOpen, setIsEvaSelectorOpen] = useState(false);
    const evaSelectorRef = useRef<HTMLDivElement>(null);

    // Real-Time Reverb WebSocket state
    const [isReverbConnected, setIsReverbConnected] = useState(true);
    const [isAutoLiveStream, setIsAutoLiveStream] = useState(false);
    const [isPingingReverb, setIsPingingReverb] = useState(false);
    const [lastReverbPingTime, setLastReverbPingTime] = useState<string>('');

    // Preference settings
    const [isAudioAlertsEnabled, setIsAudioAlertsEnabled] = useState(true);
    const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
    const [pressureUnit, setPressureUnit] = useState<'psi' | 'kPa'>('psi');

    // Interactive alert checklist items state (tracked by key)
    const [actionCheckedState, setActionCheckedState] = useState<Record<string, boolean>>({
        '0-0': true,
        '0-1': true,
        '1-0': true,
        '1-1': true,
    });

    // Live clock
    const [currentTimeStr, setCurrentTimeStr] = useState('13:45:10');

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setIsSwitcherOpen(false);
            }
            if (evaSelectorRef.current && !evaSelectorRef.current.contains(event.target as Node)) {
                setIsEvaSelectorOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // -------------------------------------------------------------
    // REAL-TIME WEBSOCKET LISTENER (Laravel Reverb on port 8080)
    // -------------------------------------------------------------
    useEffect(() => {
        if (!window.Echo) {
            console.warn('Laravel Echo is not initialized on window.');
            return;
        }

        try {
            const channel = window.Echo.channel('mission-telemetry');

            const handleTelemetryEvent = (data: any) => {
                const tel = data.telemetry || data;
                if (!tel) return;

                const hr = tel.heart_rate || 120;
                const spo2 = tel.oxygen_saturation || 98.0;
                const temp = tel.core_temperature || 37.0;
                const pressure = tel.suit_pressure || 4.3;
                const rad = tel.radiation_rate ? `Safe (${tel.radiation_rate} mSv/h)` : 'Safe';
                const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });

                setLastReverbPingTime(nowStr);
                setIsReverbConnected(true);

                // Update active astronaut live vitals
                setActiveAstronaut((prev) => {
                    const hrStatus = hr > 115 ? '(Elevated)' : '(Nominal)';
                    const hrColor = hr > 115 ? '#ef4444' : '#5cdbdf';
                    const tempStatus = temp > 37.8 ? '(Warm)' : '(Normal)';
                    const tempColor = temp > 37.8 ? '#f97316' : '#5cdbdf';

                    return {
                        ...prev,
                        vitals: {
                            ...prev.vitals,
                            heartRate: {
                                ...prev.vitals.heartRate,
                                numericValue: hr,
                                value: `Heart Rate: ${hr} bpm`,
                                status: hrStatus,
                                color: hrColor,
                            },
                            spO2: {
                                ...prev.vitals.spO2,
                                numericValue: spo2,
                                value: `${spo2}%`,
                            },
                            coreTemp: {
                                ...prev.vitals.coreTemp,
                                numericValue: temp,
                                value: `${temp.toFixed(1)}°C`,
                                status: tempStatus,
                                color: tempColor,
                            },
                        },
                        diagnostics: {
                            ...prev.diagnostics,
                            suitPressurePsi: pressure,
                            suitPressurePercent: Math.min(100, Math.round((pressure / 5) * 100)),
                            radiationStatus: rad,
                        },
                        logs: [
                            {
                                id: `log-ws-${Date.now()}`,
                                timestamp: nowStr.slice(0, 5),
                                title: `Live Reverb Telemetry (${tel.astronaut_id || 'WS'})`,
                                action: `[WS PING] HR: ${hr} bpm, SpO2: ${spo2}%, Core Temp: ${temp}°C`,
                                status: 'RESOLVED',
                            },
                            ...prev.logs.slice(0, 5),
                        ],
                    };
                });
            };

            channel.listen('.telemetry.updated', handleTelemetryEvent);
            channel.listen('telemetry.updated', handleTelemetryEvent);

            return () => {
                window.Echo.leave('mission-telemetry');
            };
        } catch (err) {
            console.error('Error connecting to Reverb channel:', err);
        }
    }, []);

    // Manual Reverb ping dispatcher
    const handleTriggerReverbPing = async () => {
        setIsPingingReverb(true);
        try {
            const res = await fetch('/api/telemetry/ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    astronaut_id: activeAstronaut.bio.id,
                    astronaut_name: activeAstronaut.bio.name,
                    role: activeAstronaut.bio.role,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Live telemetry ping broadcasted across Reverb WebSockets');
            }
        } catch (err) {
            console.error('Error triggering Reverb ping:', err);
            toast.error('Failed to dispatch Reverb WebSocket ping');
        } finally {
            setIsPingingReverb(false);
        }
    };

    // Auto-stream continuous interval when enabled
    useEffect(() => {
        if (!isAutoLiveStream) return;
        const streamInterval = setInterval(() => {
            fetch('/api/telemetry/ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    astronaut_id: activeAstronaut.bio.id,
                    astronaut_name: activeAstronaut.bio.name,
                }),
            }).catch(console.error);
        }, 4000);

        return () => clearInterval(streamInterval);
    }, [isAutoLiveStream, activeAstronaut.bio.id, activeAstronaut.bio.name]);

    // Live clock interval
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTimeStr(
                now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Add manual incident log helper
    const handleAddManualLog = (title: string, action: string) => {
        const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
        setActiveAstronaut((prev) => ({
            ...prev,
            logs: [
                {
                    id: `log-man-${Date.now()}`,
                    timestamp: nowStr,
                    title,
                    action,
                    status: 'RESOLVED',
                },
                ...prev.logs,
            ],
        }));
    };

    // Select astronaut from dropdown
    const handleSelectAstronaut = (record: any) => {
        const id = record.Astronaut || record.id || 'AST-01';
        const name = record.Name || record.name || 'Commander Alex Vance';
        const age = record.Age_at_mission_start || record.age || 42;
        const gender = record.Gender || record.gender || 'Male';
        const country = record.Country || record.country || 'USA';
        const missionDays = record['Mission_duration(Days)'] || record.missionDurationDays || 180;
        const boneLoss = record.Bone_Density_Loss || record.boneDensityLoss || '-3.2%';

        const isElena = id === 'AST-00';
        const hr = isElena ? 135 : 74 + ((id.charCodeAt(id.length - 1) * 3) % 24);
        const temp = isElena ? 38.2 : 36.8 + ((id.charCodeAt(id.length - 1) % 5) * 0.1);

        setActiveAstronaut({
            bio: {
                id,
                name,
                role: isElena ? 'Mission Commander' : 'Astronaut Specialist',
                mission: 'ODYSSEY II',
                evaStatus: isElena ? 'ON-GOING' : 'STANDBY',
                age: Number(age),
                gender,
                country,
                missionDurationDays: Number(missionDays),
                boneDensityLoss: boneLoss,
            },
            vitals: {
                heartRate: {
                    title: 'ECG',
                    value: `Heart Rate: ${hr} bpm`,
                    numericValue: hr,
                    unit: 'bpm',
                    status: hr > 100 ? '(Elevated)' : '(Nominal)',
                    color: hr > 100 ? '#ef4444' : '#5cdbdf',
                    type: 'ecg',
                    baseline: '60 - 100 bpm',
                },
                spO2: {
                    title: 'SpO2',
                    value: '98.4%',
                    numericValue: 98.4,
                    unit: '%',
                    color: '#5cdbdf',
                    type: 'sine',
                    baseline: '95 - 100%',
                },
                coreTemp: {
                    title: 'CORE TEMPERATURE',
                    value: `${temp.toFixed(1)}°C`,
                    numericValue: temp,
                    unit: '°C',
                    status: temp > 37.8 ? '(Warm)' : '(Normal)',
                    color: temp > 37.8 ? '#f97316' : '#5cdbdf',
                    type: 'ecg',
                    baseline: '36.5 - 37.5°C',
                },
                respiration: {
                    title: 'RESPIRATION',
                    value: isElena ? '24 bpm' : '17 bpm',
                    numericValue: isElena ? 24 : 17,
                    unit: 'bpm',
                    color: '#5cdbdf',
                    type: 'slow-sine',
                    baseline: '12 - 20 bpm',
                },
                hydration: {
                    title: 'HYDRATION',
                    value: isElena ? 'Low, 64%' : 'Nominal, 86%',
                    numericValue: isElena ? 64 : 86,
                    unit: '%',
                    color: '#5cdbdf',
                    valueColor: isElena ? '#ef4444' : '#5cdbdf',
                    type: 'flat',
                    baseline: '80 - 100%',
                },
            },
            diagnostics: {
                suitPressurePsi: 4.3,
                suitPressurePercent: 60,
                o2Percent: 21,
                radiationStatus: 'Safe',
                radiationPercent: 85,
                batteryPercent: 74,
            },
            alerts: isElena
                ? DEFAULT_ASTRONAUT.alerts
                : [
                      {
                          level: 'NOMINAL',
                          title: 'STATUS NOMINAL • ALL BIOMETRICS STABLE',
                          actionsTaken: [
                              '[CHECKED] Internal biosensors calibrated.',
                              '[CHECKED] Telemetry uplink synchronized with ground station.',
                          ],
                          recommendedAction: 'Proceed with scheduled orbital mission procedures.',
                      },
                  ],
            logs: [
                {
                    id: `log-sw-${Date.now()}`,
                    timestamp: currentTimeStr.slice(0, 5),
                    title: `Switched Telemetry Link to ${name}`,
                    action: `[SWITCH] Active telemetry channel assigned to ${id}`,
                    status: 'RESOLVED',
                },
                ...DEFAULT_ASTRONAUT.logs.slice(0, 4),
            ],
        });

        setIsSwitcherOpen(false);
        toast.info(`Active telemetry switched to ${name} (${id})`);
    };

    // Toggle EVA status
    const handleSetEvaStatus = (status: 'ON-GOING' | 'SCHEDULED' | 'STANDBY' | 'COMPLETED' | 'ABORTED') => {
        setActiveAstronaut((prev) => ({
            ...prev,
            bio: {
                ...prev.bio,
                evaStatus: status,
            },
        }));
        setIsEvaSelectorOpen(false);
        handleAddManualLog(`EVA Status Changed to ${status}`, `[MISSION CONTROL] Flight surgeon updated EVA operational state to ${status}`);
        toast.info(`EVA Status updated to ${status}`);
    };

    // Toggle checklist item
    const handleToggleChecklist = (key: string, label: string) => {
        const next = !actionCheckedState[key];
        setActionCheckedState((prev) => ({
            ...prev,
            [key]: next,
        }));
        const actionText = next ? `[VERIFIED] ${label}` : `[PENDING] ${label}`;
        handleAddManualLog('Checklist Status Shift', actionText);
        toast.success(next ? `Acknowledged: ${label}` : `Action un-checked: ${label}`);
    };

    // Transmit directive to crew
    const handleTransmitDirective = (directiveText: string) => {
        handleAddManualLog('Radio Transmission to Crew', `[VOX COMM] Sent directive: "${directiveText}"`);
        toast.success(`Directive transmitted to ${activeAstronaut.bio.name} via Space-to-Ground Comm`);
    };

    // Diagnostics progress bar click test
    const handleDiagnoseSubsystem = (subsystemName: string) => {
        handleAddManualLog(`${subsystemName} Diagnostic Check`, `[SYSTEM] Subsystem integrity test executed: 100% NOMINAL`);
        toast.info(`Running automated self-test on ${subsystemName}... Status: NOMINAL`);
    };

    // Filter crew roster for switcher
    const filteredCrew = [
        {
            Astronaut: 'AST-00',
            Name: 'CDR. Elena Rovani',
            Country: 'USA',
            Gender: 'Female',
            Age_at_mission_start: 38,
            'Mission_duration(Days)': 195,
            Bone_Density_Loss: '-3.6%',
        },
        ...crewList.filter((c) => (c.Astronaut || c.id) !== 'AST-00'),
    ].filter((c) => {
        if (!switcherSearch) return true;
        const q = switcherSearch.toLowerCase();
        return (
            (c.Name || '').toLowerCase().includes(q) ||
            (c.Astronaut || '').toLowerCase().includes(q) ||
            (c.Country || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono p-4 flex flex-col gap-4 select-none">
            
            {/* Top Navigation Bar with Functional Tabs */}
            <nav className="flex items-center gap-6 sm:gap-8 border-b border-[#1a4b6c] pb-0 text-xs sm:text-sm tracking-wider overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('DASHBOARD')}
                    className={`pb-2 transition-colors cursor-pointer border-b-2 font-bold ${
                        activeTab === 'DASHBOARD'
                            ? 'border-[#5cdbdf] text-white'
                            : 'border-transparent text-slate-400 hover:text-[#5cdbdf]'
                    }`}
                >
                    DASHBOARD
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('BIOMETRICS');
                        setIsBiometricsModalOpen(true);
                    }}
                    className={`pb-2 transition-colors cursor-pointer border-b-2 font-bold ${
                        activeTab === 'BIOMETRICS'
                            ? 'border-[#5cdbdf] text-white'
                            : 'border-transparent text-slate-400 hover:text-[#5cdbdf]'
                    }`}
                >
                    BIOMETRICS
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('SUIT SYSTEMS');
                        setIsSuitModalOpen(true);
                    }}
                    className={`pb-2 transition-colors cursor-pointer border-b-2 font-bold ${
                        activeTab === 'SUIT SYSTEMS'
                            ? 'border-[#5cdbdf] text-white'
                            : 'border-transparent text-slate-400 hover:text-[#5cdbdf]'
                    }`}
                >
                    SUIT SYSTEMS
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('MISSION LOGS');
                        setIsLogsModalOpen(true);
                    }}
                    className={`pb-2 transition-colors cursor-pointer border-b-2 font-bold ${
                        activeTab === 'MISSION LOGS'
                            ? 'border-[#5cdbdf] text-white'
                            : 'border-transparent text-slate-400 hover:text-[#5cdbdf]'
                    }`}
                >
                    MISSION LOGS
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('SETTINGS');
                        setIsSettingsModalOpen(true);
                    }}
                    className={`pb-2 transition-colors cursor-pointer border-b-2 font-bold ${
                        activeTab === 'SETTINGS'
                            ? 'border-[#5cdbdf] text-white'
                            : 'border-transparent text-slate-400 hover:text-[#5cdbdf]'
                    }`}
                >
                    SETTINGS
                </button>
            </nav>

            {/* Sub-Header: Mission Identity, Real-Time Reverb Status & Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-3 border-b border-[#1a4b6c]/40 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Functional EVA Status Dropdown Selector */}
                    <div className="relative" ref={evaSelectorRef}>
                        <button
                            type="button"
                            onClick={() => setIsEvaSelectorOpen(!isEvaSelectorOpen)}
                            className="border border-[#1a4b6c] px-3 py-1 bg-[#0a1f2e] text-xs flex items-center gap-2 hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        >
                            <span className="text-slate-300">EVA STATUS:</span>
                            <span className={`font-bold ${
                                activeAstronaut.bio.evaStatus === 'ON-GOING'
                                    ? 'text-orange-400 animate-pulse'
                                    : activeAstronaut.bio.evaStatus === 'ABORTED'
                                    ? 'text-red-500'
                                    : 'text-emerald-400'
                            }`}>
                                {activeAstronaut.bio.evaStatus}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* EVA Status Selector Menu */}
                        {isEvaSelectorOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#06121e] border border-[#1a4b6c] shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 p-1 flex flex-col divide-y divide-[#1a4b6c]/40 text-xs">
                                {(['ON-GOING', 'STANDBY', 'SCHEDULED', 'COMPLETED', 'ABORTED'] as const).map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleSetEvaStatus(st)}
                                        className="text-left px-3 py-2 hover:bg-[#0a1f2e] text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-slate-300 tracking-widest uppercase">
                        CREW ID: <span className="text-white font-bold">{activeAstronaut.bio.name}</span> | MISSION: {activeAstronaut.bio.mission}
                    </div>

                    {/* Reverb WebSocket Status Pill */}
                    <div className="flex items-center gap-2 px-2.5 py-1 border border-emerald-500/40 bg-emerald-950/40 text-[10px] text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>REVERB WS: {isReverbConnected ? 'ACTIVE (8080)' : 'STANDBY'}</span>
                        {lastReverbPingTime && (
                            <span className="text-slate-400 border-l border-emerald-500/30 pl-2">
                                PING {lastReverbPingTime}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sub-Header Functional Actions: Ping Reverb, Auto-Stream, Import, Export */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Live Reverb Trigger Ping Button */}
                    <button
                        type="button"
                        onClick={handleTriggerReverbPing}
                        disabled={isPingingReverb}
                        title="Dispatch instant real-time telemetry ping across Reverb WebSocket"
                        className="flex items-center gap-1.5 border border-purple-500/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 px-3 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isPingingReverb ? 'PINGING...' : 'PING REVERB'}</span>
                    </button>

                    {/* Auto-Stream Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            const next = !isAutoLiveStream;
                            setIsAutoLiveStream(next);
                            toast.info(next ? 'Continuous live Reverb telemetry stream STARTED' : 'Continuous live stream PAUSED');
                        }}
                        className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                            isAutoLiveStream
                                ? 'border-emerald-400 bg-emerald-950 text-emerald-300 font-bold shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                                : 'border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white'
                        }`}
                    >
                        <Radio className={`w-3.5 h-3.5 ${isAutoLiveStream ? 'animate-pulse text-emerald-400' : ''}`} />
                        <span>AUTO-STREAM: {isAutoLiveStream ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Import Data Button */}
                    <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-1.5 border border-[#5cdbdf] text-[#5cdbdf] px-3.5 py-1.5 text-xs hover:bg-[#5cdbdf]/15 hover:shadow-[0_0_15px_rgba(92,219,223,0.3)] transition-all cursor-pointer"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>IMPORT DATA</span>
                    </button>

                    {/* Export Data Button */}
                    <button
                        type="button"
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-1.5 border border-[#5cdbdf] text-[#030b14] bg-[#5cdbdf] font-bold px-4 py-1.5 text-xs hover:brightness-110 hover:shadow-[0_0_15px_rgba(92,219,223,0.5)] transition-all cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>EXPORT DATA</span>
                    </button>
                </div>
            </div>

            {/* Main HUD Grid */}
            <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
                
                {/* LEFT COLUMN: Biometrics & Vitals */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-1 relative">
                        <h2 className="text-sm tracking-wider text-slate-200">BIOMETRICS & VITALS</h2>
                        
                        {/* SWITCH ASTRONAUT Dropdown Trigger */}
                        <div className="relative" ref={switcherRef}>
                            <button
                                type="button"
                                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                                className="flex items-center gap-2 border border-[#1a4b6c] px-2.5 py-1 bg-[#0a1f2e] text-xs text-slate-200 hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-colors cursor-pointer"
                            >
                                <span>SWITCH ASTRONAUT</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isSwitcherOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-[#06121e] border border-[#1a4b6c] shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 flex flex-col max-h-80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    <div className="p-2 border-b border-[#1a4b6c] bg-[#0a1f2e]">
                                        <div className="flex items-center gap-2 bg-[#06121e] border border-[#1a4b6c]/60 px-2 py-1 text-xs">
                                            <Search className="w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search crew roster..."
                                                value={switcherSearch}
                                                onChange={(e) => setSwitcherSearch(e.target.value)}
                                                className="w-full bg-transparent text-white text-xs focus:outline-none placeholder:text-slate-500"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto divide-y divide-[#1a4b6c]/40 text-xs">
                                        {filteredCrew.map((c, i) => {
                                            const cid = c.Astronaut || c.id || `AST-${i}`;
                                            const isSelected = activeAstronaut.bio.id === cid;
                                            return (
                                                <div
                                                    key={cid}
                                                    onClick={() => handleSelectAstronaut(c)}
                                                    className={`p-2.5 flex items-center justify-between gap-2 hover:bg-[#0a1f2e] cursor-pointer transition-colors ${
                                                        isSelected ? 'bg-[#5cdbdf]/10 text-white' : 'text-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                            isSelected ? 'bg-[#5cdbdf] animate-pulse' : 'bg-slate-600'
                                                        }`} />
                                                        <div className="truncate">
                                                            <div className="font-bold text-white truncate">{c.Name}</div>
                                                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                                                <span className="text-[#5cdbdf] font-mono">{cid}</span>
                                                                <span>• {c.Country || 'NASA'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 text-[#5cdbdf] shrink-0" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Vitals Cards (Clicking opens Biometrics Deep-Dive) */}
                    <div className="flex flex-col gap-4">
                        <VitalCard 
                            title={activeAstronaut.vitals.heartRate.title} 
                            value={activeAstronaut.vitals.heartRate.value} 
                            status={activeAstronaut.vitals.heartRate.status} 
                            color={activeAstronaut.vitals.heartRate.color} 
                            type="ecg" 
                            onClick={() => setIsBiometricsModalOpen(true)}
                        />
                        <VitalCard 
                            title={activeAstronaut.vitals.spO2.title} 
                            value={activeAstronaut.vitals.spO2.value} 
                            color={activeAstronaut.vitals.spO2.color} 
                            type="sine" 
                            onClick={() => setIsBiometricsModalOpen(true)}
                        />
                        <VitalCard 
                            title={activeAstronaut.vitals.coreTemp.title} 
                            value={activeAstronaut.vitals.coreTemp.value} 
                            status={activeAstronaut.vitals.coreTemp.status} 
                            color={activeAstronaut.vitals.coreTemp.color} 
                            type="ecg" 
                            onClick={() => setIsBiometricsModalOpen(true)}
                        />
                        <VitalCard 
                            title={activeAstronaut.vitals.respiration.title} 
                            value={activeAstronaut.vitals.respiration.value} 
                            color={activeAstronaut.vitals.respiration.color} 
                            type="slow-sine" 
                            onClick={() => setIsBiometricsModalOpen(true)}
                        />
                        <VitalCard 
                            title={activeAstronaut.vitals.hydration.title} 
                            value={activeAstronaut.vitals.hydration.value} 
                            status="" 
                            color={activeAstronaut.vitals.hydration.color} 
                            valueColor={activeAstronaut.vitals.hydration.valueColor} 
                            type="flat" 
                            onClick={() => setIsBiometricsModalOpen(true)}
                        />
                    </div>
                </div>

                {/* CENTER COLUMN: 3D Interactive WebGL Skeleton & Alerts */}
                <div className="col-span-12 lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Interactive 3D WebGL Animated Skeleton with 360° Rotation */}
                    <div className="min-h-[460px] flex">
                        <Astronaut3DModel
                            heartRate={activeAstronaut.vitals.heartRate.numericValue}
                            coreTemp={activeAstronaut.vitals.coreTemp.numericValue}
                            evaStatus={activeAstronaut.bio.evaStatus}
                            astronautName={activeAstronaut.bio.name}
                        />
                    </div>

                    {/* Active Alerts Panel with Interactive Checklists and Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#1a4b6c] pb-1 flex items-center justify-between">
                            <h2 className="text-sm tracking-wider text-slate-200">ACTIVE ALERTS & DETECTED CONDITIONS</h2>
                        </div>
                        
                        {activeAstronaut.alerts.map((alert, alertIdx) => {
                            const isCritical = alert.level === 'CRITICAL' || alert.level === 'WARNING';
                            return (
                                <div 
                                    key={alertIdx}
                                    className={`border p-3 text-xs space-y-3 ${
                                        isCritical 
                                            ? 'border-orange-500/50 bg-[#1a1005]' 
                                            : 'border-[#5cdbdf]/50 bg-[#0a1f2e]/50'
                                    }`}
                                >
                                    <div className={`font-bold border-b pb-2 flex items-center justify-between ${
                                        isCritical 
                                            ? 'text-orange-400 border-orange-500/30' 
                                            : 'text-[#5cdbdf] border-[#5cdbdf]/30'
                                    }`}>
                                        <span>{alert.title}</span>
                                        {isCritical && <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />}
                                    </div>

                                    {/* Interactive Checklist Items */}
                                    <div className="space-y-1.5">
                                        <div className="text-slate-400 mb-1">PROPER ACTION TAKEN</div>
                                        {alert.actionsTaken.map((act, actIdx) => {
                                            const itemKey = `${alertIdx}-${actIdx}`;
                                            const isChecked = actionCheckedState[itemKey] ?? true;
                                            return (
                                                <div 
                                                    key={actIdx} 
                                                    onClick={() => handleToggleChecklist(itemKey, act)}
                                                    className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer group transition-colors"
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
                                                    )}
                                                    <span className={isChecked ? '' : 'text-slate-400 line-through'}>
                                                        {act}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Directive with Functional Transmission Button */}
                                    <div className={`pt-2 border-t space-y-2 ${
                                        isCritical ? 'border-orange-500/30' : 'border-[#5cdbdf]/30'
                                    }`}>
                                        <div className="text-slate-400">RECOMMENDED ACTION</div>
                                        <div className="text-white font-medium">{alert.recommendedAction}</div>
                                        <button
                                            type="button"
                                            onClick={() => handleTransmitDirective(alert.recommendedAction)}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-orange-500/60 bg-orange-950/40 text-orange-300 hover:bg-orange-900/60 transition-colors cursor-pointer text-[11px] font-bold"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>TRANSMIT DIRECTIVE TO CREW</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT COLUMN: Diagnostics & Response History */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                    {/* Environmental & Suit Diagnostics */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#1a4b6c] pb-1 flex items-center justify-between">
                            <h2 className="text-sm tracking-wider text-slate-200">ENVIRONMENTAL & SUIT DIAGNOSTICS</h2>
                            <button
                                type="button"
                                onClick={() => setIsSuitModalOpen(true)}
                                className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer"
                            >
                                Control Console
                            </button>
                        </div>
                        <ProgressBar 
                            label="SUIT PRESSURE" 
                            value={`${activeAstronaut.diagnostics.suitPressurePsi} psi`} 
                            percent={activeAstronaut.diagnostics.suitPressurePercent} 
                            color="bg-[#5cdbdf]" 
                            onClick={() => handleDiagnoseSubsystem('Suit Pressure Valves')}
                        />
                        <ProgressBar 
                            label="O2 LEVELS" 
                            value={`${activeAstronaut.diagnostics.o2Percent}%`} 
                            percent={activeAstronaut.diagnostics.o2Percent} 
                            color="bg-orange-400" 
                            onClick={() => handleDiagnoseSubsystem('O2 Reserve Canister')}
                        />
                        <ProgressBar 
                            label="RADIATION" 
                            value={activeAstronaut.diagnostics.radiationStatus} 
                            percent={activeAstronaut.diagnostics.radiationPercent} 
                            color="bg-green-500" 
                            onClick={() => handleDiagnoseSubsystem('Radiation Shielding Array')}
                        />
                        <ProgressBar 
                            label="BATTERY" 
                            value={`${activeAstronaut.diagnostics.batteryPercent}%`} 
                            percent={activeAstronaut.diagnostics.batteryPercent} 
                            color="bg-orange-400" 
                            onClick={() => handleDiagnoseSubsystem('Primary Battery Cell Pack')}
                        />
                    </div>

                    {/* Response Log / History with Functional Log Button */}
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="border-b border-[#1a4b6c] pb-1 flex items-center justify-between">
                            <h2 className="text-sm tracking-wider text-slate-200">RESPONSE LOG / HISTORY</h2>
                            <button
                                type="button"
                                onClick={() => setIsLogsModalOpen(true)}
                                className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer"
                            >
                                Full Archive
                            </button>
                        </div>
                        <div className="text-xs text-slate-400 mb-1">Incident -{'>'} Resolution</div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs border-l border-[#1a4b6c] pl-3 relative max-h-56">
                            {activeAstronaut.logs.map((item, i) => (
                                <div key={item.id || i} className="relative group">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-[#5cdbdf] group-hover:scale-125 transition-transform"></div>
                                    <div className="text-slate-200 font-bold">{item.timestamp} - {item.title}</div>
                                    <div className="text-slate-400 text-[11px]">{item.action}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TelemetryImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onApplyToHud={(data) => {
                    setActiveAstronaut((prev) => ({
                        ...prev,
                        bio: {
                            ...prev.bio,
                            name: data.name || prev.bio.name,
                            id: data.astronautId || prev.bio.id,
                        },
                        vitals: {
                            ...prev.vitals,
                            heartRate: {
                                ...prev.vitals.heartRate,
                                numericValue: data.heartRate || 120,
                                value: `Heart Rate: ${data.heartRate || 120} bpm`,
                            },
                            spO2: {
                                ...prev.vitals.spO2,
                                numericValue: data.spO2 || 97,
                                value: `${data.spO2 || 97}%`,
                            },
                        },
                    }));
                }}
                activeAstronaut={activeAstronaut}
            />

            <TelemetryExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                astronaut={activeAstronaut}
                allCrewDataset={crewList}
            />

            <SuitSystemsModal
                isOpen={isSuitModalOpen}
                onClose={() => setIsSuitModalOpen(false)}
                suitPressure={activeAstronaut.diagnostics.suitPressurePsi}
                o2Percent={activeAstronaut.diagnostics.o2Percent}
                batteryPercent={activeAstronaut.diagnostics.batteryPercent}
                radiationStatus={activeAstronaut.diagnostics.radiationStatus}
                onUpdateSuit={(updates) => {
                    setActiveAstronaut((prev) => ({
                        ...prev,
                        diagnostics: {
                            ...prev.diagnostics,
                            ...updates,
                        },
                    }));
                }}
                onAddLog={handleAddManualLog}
            />

            <BiometricsDetailModal
                isOpen={isBiometricsModalOpen}
                onClose={() => setIsBiometricsModalOpen(false)}
                astronaut={activeAstronaut}
                onRecalibrate={() => {
                    handleAddManualLog('Biosensors Recalibrated', '[DIAGNOSTIC] Galvanic skin sensors and optical PPG recalibrated');
                }}
            />

            <MissionLogsModal
                isOpen={isLogsModalOpen}
                onClose={() => setIsLogsModalOpen(false)}
                logs={activeAstronaut.logs}
                onAddLog={handleAddManualLog}
            />

            <SystemSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                isAudioAlertsEnabled={isAudioAlertsEnabled}
                onToggleAudioAlerts={setIsAudioAlertsEnabled}
                tempUnit={tempUnit}
                onChangeTempUnit={setTempUnit}
                pressureUnit={pressureUnit}
                onChangePressureUnit={setPressureUnit}
            />
        </div>
    );
}

// Sub-components for repeatable UI elements
function VitalCard({ title, value, status, color, valueColor, type, onClick }: any) {
    const textColor = valueColor || color;
    return (
        <div 
            onClick={onClick}
            className="flex flex-col gap-1 text-xs cursor-pointer group hover:brightness-110 transition-all"
        >
            <div className="flex justify-between items-end">
                <span className="text-slate-200 group-hover:text-white transition-colors">{title}</span>
                <span style={{ color: textColor }} className="font-bold text-sm">
                    {value} {status && <span>{status}</span>}
                </span>
            </div>
            <div className="relative h-12 w-full border border-[#1a4b6c]/50 group-hover:border-[#5cdbdf] bg-[#06121e] overflow-hidden transition-colors">
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

function ProgressBar({ label, value, percent, color, onClick }: any) {
    return (
        <div onClick={onClick} className="text-xs cursor-pointer group">
            <div className="flex justify-between mb-1">
                <span className="text-slate-300 group-hover:text-white transition-colors">{label}</span>
                <span className="text-white font-mono">{value}</span>
            </div>
            <div className="h-3 w-full bg-[#0a1f2e] border border-[#1a4b6c] group-hover:border-[#5cdbdf] relative overflow-hidden flex transition-colors">
                <div className={`${color} h-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                <div className="absolute top-0 bottom-0 w-2 bg-white/20" style={{ left: `${percent}%` }}></div>
            </div>
        </div>
    );
}