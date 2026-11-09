import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import {
    Download, Upload, AlertCircle, AlertTriangle,
    CheckSquare, Square, ChevronDown, Check, User, Activity,
    Database, Search, Sparkles, RefreshCw, Radio, Zap,
    Play, Pause, Wind, Shield, Settings, ClipboardList, Send, X,
    LogOut, Clock, Heart, Volume2, VolumeX, Users, Layers, Expand,
    CheckCircle2, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import NasaLogo from '@/components/nasa-logo';
import { logout } from '@/routes';
import Astronaut3DModel from '@/components/astronaut-3d-model';
import TelemetryImportModal from '@/components/telemetry-import-modal';
import TelemetryExportModal from '@/components/telemetry-export-modal';
import SuitSystemsModal from '@/components/suit-systems-modal';
import BiometricsDetailModal from '@/components/biometrics-detail-modal';
import MissionLogsModal from '@/components/mission-logs-modal';
import SystemSettingsModal from '@/components/system-settings-modal';
import CrewSwitcherModal from '@/components/crew-switcher-modal';
import type {
    AstronautFullData,
    ParsedImportPayload,
    TelemetryLogItem,
    MedicalAlert
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
                '[CHECKED] In-suit fluid pouch replenishment initiated (150mL electrolyte consumed).',
            ],
            recommendedAction: 'Resting interval required. Pause strenuous tasks.',
        },
        {
            level: 'WARNING',
            title: 'ELEVATED METABOLIC RATE (HEART RATE > 130 BPM)',
            actionsTaken: [
                '[CHECKED] Real-time biometrics streaming to Flight Surgeon Houston console.',
                '[CHECKED] O2 flow rate bumped to 1.2 kg/hr nominal envelope.',
            ],
            recommendedAction: 'Order crew member to hold station for 180 seconds until heart rate drops below 110 bpm.',
        },
    ],
    logs: [
        {
            id: 'log-1',
            timestamp: '13:42:05',
            title: 'EVA Depressurization Complete',
            action: '[TELEMETRY] Airlock depressurized to 0.0 kPa. Outer hatch unlatched.',
            status: 'RESOLVED',
        },
        {
            id: 'log-2',
            timestamp: '13:35:19',
            title: 'Suit Pressure Regulated',
            action: '[ACTION] Primary oxygen regulator set to 4.3 psi nominal envelope.',
            status: 'RESOLVED',
        },
        {
            id: 'log-3',
            timestamp: '13:20:00',
            title: 'Pre-breathe Protocol Complete',
            action: '[BIO] 120-minute 100% O2 pre-breathe verified to purge blood nitrogen.',
            status: 'RESOLVED',
        },
        {
            id: 'log-4',
            timestamp: '12:50:44',
            title: 'Biosensor Array Calibrated',
            action: '[DIAGNOSTIC] Chest ECG electrodes and galvanic skin telemetry calibrated.',
            status: 'RESOLVED',
        },
    ],
};

// Fallback crew roster if database is unseeded
const DEFAULT_CREW_ROSTER = [
    {
        Astronaut: 'AST-01',
        Name: 'Commander Alex Vance',
        Country: 'USA',
        Gender: 'Male',
        Age_at_mission_start: 42,
        'Mission_duration(Days)': 180,
        Bone_Density_Loss: '-3.2%',
        Role: 'Mission Commander',
    },
    {
        Astronaut: 'AST-02',
        Name: 'Dr. Elena Rostova',
        Country: 'Canada',
        Gender: 'Female',
        Age_at_mission_start: 36,
        'Mission_duration(Days)': 210,
        Bone_Density_Loss: '-4.1%',
        Role: 'Payload Specialist',
    },
    {
        Astronaut: 'AST-03',
        Name: 'Major Marcus Cole',
        Country: 'United Kingdom',
        Gender: 'Male',
        Age_at_mission_start: 45,
        'Mission_duration(Days)': 150,
        Bone_Density_Loss: '-2.8%',
        Role: 'Flight Engineer',
    },
];

// Helper to generate dynamic astronaut profile from dataset record
function generateAstronautProfile(record: any, timeStr: string): AstronautFullData {
    const id = record.Astronaut || record.id || 'AST-XX';
    const name = record.Name || record.name || 'Unknown Specialist';
    const role = record.Role || record.role || 'Astronaut Specialist';
    const country = record.Country || record.country || 'NASA / International';
    const age = Number(record.Age_at_mission_start) || 40;
    const gender = record.Gender || record.gender || 'Not Specified';
    const missionDays = Number(record['Mission_duration(Days)']) || 180;
    const boneLoss = record.Bone_Density_Loss || '-3.0%';

    // Seed-based pseudo-random vitals
    const seed = (id.charCodeAt(id.length - 1) || 42) + missionDays;
    const hr = 70 + (seed % 65); // 70 to 135 bpm
    const spo2 = 95 + (seed % 5); // 95 to 99%
    const coreTemp = +(36.7 + ((seed % 15) / 10)).toFixed(1); // 36.7 to 38.2 C
    const respiration = 14 + (seed % 12); // 14 to 26 bpm
    const hydrationPct = 60 + (seed % 35); // 60 to 95%
    const suitPressurePsi = +(4.1 + ((seed % 4) / 10)).toFixed(1); // 4.1 to 4.4 psi
    const suitPressurePercent = Math.min(100, Math.round((suitPressurePsi / 5) * 100));
    const o2Percent = 20 + (seed % 3); // 20 to 22%
    const batteryPercent = 65 + (seed % 30); // 65 to 95%

    const isHrElevated = hr > 115;
    const hrStatus = isHrElevated ? '(Elevated)' : hr > 100 ? '(Moderate)' : '(Nominal)';
    const hrColor = isHrElevated ? '#ef4444' : hr > 100 ? '#f97316' : '#5cdbdf';
    const spo2Color = spo2 < 96 ? '#f97316' : '#5cdbdf';
    const tempStatus = coreTemp > 37.8 ? '(Warm)' : '(Normal)';
    const tempColor = coreTemp > 37.8 ? '#f97316' : '#5cdbdf';
    const hydrationStatus = hydrationPct < 70 ? 'Low, ' : 'Optimal, ';
    const hydrationValColor = hydrationPct < 70 ? '#ef4444' : '#5cdbdf';

    const evaStatus: 'ON-GOING' | 'SCHEDULED' | 'STANDBY' | 'COMPLETED' =
        missionDays > 190 ? 'ON-GOING' : missionDays > 160 ? 'STANDBY' : 'SCHEDULED';

    const radiationStatus = isHrElevated && evaStatus === 'ON-GOING' ? 'Safe (0.24 mSv/h)' : 'Safe (0.18 mSv/h)';

    // Dynamic alert sets
    const alerts: MedicalAlert[] = [];
    if (isHrElevated) {
        alerts.push({
            level: 'WARNING',
            title: 'ELEVATED METABOLIC ACTIVITY (HEART RATE EXCEEDS 115 BPM)',
            actionsTaken: [
                `[CHECKED] Real-time biometrics synchronized with Flight Surgeon console (${name}).`,
                '[CHECKED] Primary oxygen regulator maintained at 4.3 psi nominal envelope.',
            ],
            recommendedAction: 'Direct astronaut to hold station and perform 180s controlled breathing cycle.',
        });
    }

    if (hydrationPct < 70) {
        alerts.push({
            level: 'WARNING',
            title: 'HYDRATION ADVISORY: FLUID INTAKE DEFICIT DETECTED',
            actionsTaken: [
                '[CHECKED] In-suit hydration pouch consumption monitor queried.',
                '[CHECKED] Liquid Cooling Garment (LCG) thermal loops set to auto-balance.',
            ],
            recommendedAction: 'Authorize in-suit electrolyte beverage consumption (minimum 250mL).',
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            level: 'NOMINAL',
            title: 'ALL BIOMEDICAL TELEMETRY CHANNELS NOMINAL',
            actionsTaken: [
                '[CHECKED] Electrocardiogram waveform sinus rhythm confirmed nominal.',
                '[CHECKED] Core temperature within thermo-neutral equilibrium (36.8 - 37.3°C).',
            ],
            recommendedAction: 'Continue nominal mission EVA timeline and physiological monitoring.',
        });
    }

    const logs: TelemetryLogItem[] = [
        {
            id: `log-${Date.now()}-1`,
            timestamp: timeStr,
            title: `Telemetry Profile Loaded: ${name}`,
            action: `[SYSTEM] Synchronized telemetry for ${id} (${country}) - Duration: ${missionDays}d`,
            status: 'RESOLVED',
        },
        {
            id: `log-${Date.now()}-2`,
            timestamp: timeStr.slice(0, 5) + ':02',
            title: 'Biosensor Array Synced',
            action: `[DIAGNOSTIC] Heart rate (${hr} bpm) and SpO2 (${spo2}%) linked to DSN channel`,
            status: 'RESOLVED',
        },
        {
            id: `log-${Date.now()}-3`,
            timestamp: timeStr.slice(0, 5) + ':00',
            title: 'EVA Suit Link Verified',
            action: `[TELEMETRY] Internal pressure ${suitPressurePsi} psi, battery cell ${batteryPercent}%`,
            status: 'RESOLVED',
        },
    ];

    return {
        bio: {
            id,
            name,
            role,
            mission: 'ODYSSEY II',
            evaStatus,
            age,
            gender,
            country,
            missionDurationDays: missionDays,
            boneDensityLoss: boneLoss,
        },
        vitals: {
            heartRate: {
                title: 'ECG',
                value: `Heart Rate: ${hr} bpm`,
                numericValue: hr,
                unit: 'bpm',
                status: hrStatus,
                color: hrColor,
                type: 'ecg',
                baseline: '60 - 100 bpm',
            },
            spO2: {
                title: 'SpO2',
                value: `${spo2}%`,
                numericValue: spo2,
                unit: '%',
                color: spo2Color,
                type: 'sine',
                baseline: '95 - 100%',
            },
            coreTemp: {
                title: 'CORE TEMPERATURE',
                value: `${coreTemp}°C`,
                numericValue: coreTemp,
                unit: '°C',
                status: tempStatus,
                color: tempColor,
                type: 'ecg',
                baseline: '36.5 - 37.5°C',
            },
            respiration: {
                title: 'RESPIRATION',
                value: `${respiration} bpm`,
                numericValue: respiration,
                unit: 'bpm',
                color: '#5cdbdf',
                type: 'slow-sine',
                baseline: '12 - 20 bpm',
            },
            hydration: {
                title: 'HYDRATION',
                value: `${hydrationStatus}${hydrationPct}%`,
                numericValue: hydrationPct,
                unit: '%',
                color: '#5cdbdf',
                valueColor: hydrationValColor,
                type: 'flat',
                baseline: '80 - 100%',
            },
        },
        diagnostics: {
            suitPressurePsi,
            suitPressurePercent,
            o2Percent: Math.round(o2Percent),
            radiationStatus,
            radiationPercent: 85,
            batteryPercent,
        },
        alerts,
        logs,
    };
}

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
    const [isCrewSwitcherOpen, setIsCrewSwitcherOpen] = useState(false);

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
    const [currentTimeStr, setCurrentTimeStr] = useState('13:45:10 UTC');

    // Always keep activeAstronautRef synchronized
    const activeAstronautRef = useRef(activeAstronaut);
    useEffect(() => {
        activeAstronautRef.current = activeAstronaut;
    }, [activeAstronaut]);

    // Synchronize crewList if initialData changes
    useEffect(() => {
        if (initialData?.records && Array.isArray(initialData.records) && initialData.records.length > 0) {
            setCrewList(initialData.records);
        }
    }, [initialData?.records]);

    // Close EVA dropdown on outside click or Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (evaSelectorRef.current && !evaSelectorRef.current.contains(event.target as Node)) {
                setIsEvaSelectorOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsEvaSelectorOpen(false);
                setIsCrewSwitcherOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
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

                const targetId = activeAstronautRef.current.bio.id;
                // If ping explicitly targeted another astronaut, don't overwrite current astronaut's vitals
                if (tel.astronaut_id && String(tel.astronaut_id) !== String(targetId)) {
                    return;
                }

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
                    const hrStatus = hr > 115 ? '(Elevated)' : hr > 100 ? '(Moderate Activity)' : '(Nominal)';
                    const hrColor = hr > 115 ? '#ef4444' : hr > 100 ? '#f97316' : '#5cdbdf';
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
                                title: `Live Reverb Telemetry (${prev.bio.name})`,
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
                toast.success(`Dispatched real-time ping for ${activeAstronaut.bio.name}`);
            }
        } catch {
            toast.error('Failed to dispatch Reverb ping');
        } finally {
            setIsPingingReverb(false);
        }
    };

    // Auto-stream interval effect
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
            }).catch(() => {});
        }, 3000);

        return () => clearInterval(streamInterval);
    }, [isAutoLiveStream, activeAstronaut.bio.id, activeAstronaut.bio.name]);

    // Live clock interval
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTimeStr(
                now.toLocaleTimeString('en-US', {
                    timeZone: 'UTC',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }) + ' UTC'
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

    // Effective crew roster (combines fallback if empty)
    const effectiveCrewList = crewList && crewList.length > 0 ? crewList : DEFAULT_CREW_ROSTER;

    // Select astronaut from crew roster
    const handleSelectAstronaut = (record: any) => {
        const profile = generateAstronautProfile(record, currentTimeStr);
        setActiveAstronaut(profile);

        // Reset checklists to verified for the new astronaut's alert items
        const initialChecks: Record<string, boolean> = {};
        profile.alerts.forEach((alert, aIdx) => {
            alert.actionsTaken.forEach((_, actIdx) => {
                initialChecks[`${aIdx}-${actIdx}`] = true;
            });
        });
        setActionCheckedState(initialChecks);
        toast.info(`Switched Active Telemetry to: ${profile.bio.name} (${profile.bio.id})`);
    };

    // Auto-select initial astronaut if dataset loaded
    useEffect(() => {
        if (crewList.length > 0 && activeAstronaut.bio.id === 'AST-00') {
            const elenaDb = crewList.find(
                (c) =>
                    String(c.Astronaut).toUpperCase() === 'AST-00' ||
                    String(c.Name).toLowerCase().includes('elena rovani')
            );
            if (elenaDb) {
                setActiveAstronaut(generateAstronautProfile(elenaDb, currentTimeStr));
            }
        }
    }, [crewList]);

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

    // Acknowledge all alerts at once
    const handleAcknowledgeAllAlerts = () => {
        const allChecked: Record<string, boolean> = {};
        activeAstronaut.alerts.forEach((alert, aIdx) => {
            alert.actionsTaken.forEach((_, actIdx) => {
                allChecked[`${aIdx}-${actIdx}`] = true;
            });
        });
        setActionCheckedState(allChecked);
        handleAddManualLog('All Alerts Acknowledged', '[FLIGHT SURGEON] All active biomedical condition checklists verified');
        toast.success('All clinical alerts acknowledged');
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

    return (
        <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono p-3 sm:p-5 pb-28 sm:pb-32 flex flex-col gap-4 select-none relative overflow-x-hidden">
            {/* Background cosmic glow and coordinate grid */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#0b3d91]/15 rounded-full blur-[160px]" />
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#0284c7]/10 rounded-full blur-[170px]" />
                <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#5cdbdf]/5 rounded-full blur-[140px]" />
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* TOP COMMAND HEADER: Unified NASA AHMS Command Bar */}
            <header className="relative z-30 border border-[#1a4b6c] bg-[#06121e]/95 p-3 sm:p-3.5 backdrop-blur-md">
                {/* Tech Reticles */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    {/* Left: Brand & Mission Identity */}
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] shadow-[0_0_12px_rgba(92,219,223,0.2)] shrink-0">
                            <NasaLogo size={32} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold tracking-wider text-white">
                                    NASA AHMS <span className="text-[#5cdbdf]">// MISSION CONTROL HUD</span>
                                </h1>
                                <span className="px-1.5 py-0.2 text-[9px] tracking-widest border border-cyan-800/80 bg-cyan-950/60 text-cyan-300">
                                    HRP LEVEL-4
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 tracking-wider">
                                BIOASTRONAUTICS TELEMETRY & OPERATIONS • EXPEDITION 71
                            </p>
                        </div>
                    </div>

                    {/* Center: Live Telemetry Status Cluster */}
                    <div className="flex items-center gap-3 text-[11px] bg-[#030b14]/90 border border-[#1a4b6c]/60 px-3 py-1.5 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#5cdbdf]" />
                            <span className="text-slate-400">TIME:</span>
                            <span className="text-white font-bold tracking-widest">{currentTimeStr}</span>
                        </div>
                        <span className="text-slate-600">|</span>
                        <div className="flex items-center gap-1.5">
                            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-slate-400">DSN:</span>
                            <span className="text-emerald-400 font-bold">LOCKED // 40-MS</span>
                        </div>
                        <span className="text-slate-600 hidden md:inline">|</span>
                        <div className="hidden md:flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-slate-400">REVERB:</span>
                            <span className="text-emerald-400 font-bold">{isReverbConnected ? 'ACTIVE' : 'STANDBY'}</span>
                        </div>
                    </div>

                    {/* Right: Integrated System Action Toolbar */}
                    <div className="flex items-center gap-2 text-xs shrink-0 flex-wrap sm:flex-nowrap">
                        <Link
                            href="/dataset"
                            className="border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] px-3 py-1.5 text-xs tracking-wider uppercase hover:bg-[#0b3d91]/30 hover:border-[#5cdbdf] hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(92,219,223,0.1)] shrink-0"
                        >
                            <Database className="w-3.5 h-3.5" />
                            <span>DATASET ARCHIVE</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-[#5cdbdf] hover:border-[#5cdbdf] px-2.5 py-1.5 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Import Telemetry into Database & HUD"
                        >
                            <Upload className="w-3.5 h-3.5 text-cyan-400" />
                            <span>IMPORT</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsExportModalOpen(true)}
                            className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-[#5cdbdf] hover:border-[#5cdbdf] px-2.5 py-1.5 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Export Mission Telemetry"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>EXPORT</span>
                        </button>

                        <Link
                            href={logout()}
                            method="post"
                            as="button"
                            type="button"
                            className="border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 px-2.5 py-1.5 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Terminate Flight Surgeon Session"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>TERMINATE</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* SECONDARY TOOLBAR: Navigation Tabs & Telemetry Controls */}
            <div className="relative z-25 border border-[#1a4b6c] bg-[#06121e]/90 p-2.5 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                {/* Console Navigation Tabs */}
                <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('DASHBOARD')}
                        className={`px-3 py-1.5 border transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs tracking-wider ${
                            activeTab === 'DASHBOARD'
                                ? 'border-[#5cdbdf] bg-[#0a1f2e] text-white shadow-[0_0_10px_rgba(92,219,223,0.2)]'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-[#1a4b6c]'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>DASHBOARD</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('BIOMETRICS');
                            setIsBiometricsModalOpen(true);
                        }}
                        className={`px-3 py-1.5 border transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs tracking-wider ${
                            activeTab === 'BIOMETRICS'
                                ? 'border-[#5cdbdf] bg-[#0a1f2e] text-white'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-[#1a4b6c]'
                        }`}
                    >
                        <Heart className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>BIOMETRICS</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('SUIT SYSTEMS');
                            setIsSuitModalOpen(true);
                        }}
                        className={`px-3 py-1.5 border transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs tracking-wider ${
                            activeTab === 'SUIT SYSTEMS'
                                ? 'border-[#5cdbdf] bg-[#0a1f2e] text-white'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-[#1a4b6c]'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>SUIT SYSTEMS</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('MISSION LOGS');
                            setIsLogsModalOpen(true);
                        }}
                        className={`px-3 py-1.5 border transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs tracking-wider ${
                            activeTab === 'MISSION LOGS'
                                ? 'border-[#5cdbdf] bg-[#0a1f2e] text-white'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-[#1a4b6c]'
                        }`}
                    >
                        <ClipboardList className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>MISSION LOGS</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab('SETTINGS');
                            setIsSettingsModalOpen(true);
                        }}
                        className={`px-3 py-1.5 border transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs tracking-wider ${
                            activeTab === 'SETTINGS'
                                ? 'border-[#5cdbdf] bg-[#0a1f2e] text-white'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-[#1a4b6c]'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>SETTINGS</span>
                    </button>
                </nav>

                {/* Right: Live Stream & Reverb Ping Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Live Reverb Trigger Ping */}
                    <button
                        type="button"
                        onClick={handleTriggerReverbPing}
                        disabled={isPingingReverb}
                        title="Dispatch instant real-time telemetry ping across Reverb WebSocket"
                        className="flex items-center gap-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] px-3 py-1.5 text-xs tracking-wider uppercase transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <Zap className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>{isPingingReverb ? 'PINGING...' : 'PING REVERB'}</span>
                    </button>

                    {/* Continuous Auto-Stream Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            const next = !isAutoLiveStream;
                            setIsAutoLiveStream(next);
                            toast.info(next ? 'Continuous live Reverb stream ACTIVE (3s cadence)' : 'Continuous live stream PAUSED');
                        }}
                        className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                            isAutoLiveStream
                                ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 font-bold shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                                : 'border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white hover:border-[#5cdbdf]'
                        }`}
                    >
                        <Radio className={`w-3.5 h-3.5 ${isAutoLiveStream ? 'animate-pulse text-emerald-400' : ''}`} />
                        <span>AUTO-STREAM: {isAutoLiveStream ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Audio Alert Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            const next = !isAudioAlertsEnabled;
                            setIsAudioAlertsEnabled(next);
                            toast.info(next ? 'Telemetry audio alarms enabled' : 'Telemetry audio alarms muted');
                        }}
                        className={`p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-colors cursor-pointer`}
                        title={isAudioAlertsEnabled ? 'Mute Telemetry Audio' : 'Enable Telemetry Audio'}
                    >
                        {isAudioAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* ACTIVE CREW MEMBER & EVA OPERATIONAL BANNER */}
            <div className="relative z-20 border border-[#1a4b6c] bg-gradient-to-r from-[#06121e] via-[#0a1f2e] to-[#06121e] p-3 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Left: Active Astronaut Profile Details */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-[#1a4b6c] bg-[#030b14] flex items-center justify-center text-[#5cdbdf] font-bold text-base shadow-[0_0_10px_rgba(92,219,223,0.2)] shrink-0">
                        {activeAstronaut.bio.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-wide">
                                {activeAstronaut.bio.name}
                            </span>
                            <span className="px-1.5 py-0.2 border border-[#5cdbdf]/60 bg-[#5cdbdf]/10 text-[#5cdbdf] text-[10px] font-bold">
                                {activeAstronaut.bio.id}
                            </span>
                            <span className="text-slate-400 text-xs">• {activeAstronaut.bio.role}</span>
                            <span className="text-slate-400 text-xs">• {activeAstronaut.bio.country}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                            <span>MISSION: <strong className="text-white">{activeAstronaut.bio.mission}</strong></span>
                            <span>•</span>
                            <span>DURATION: <strong className="text-sky-300">{activeAstronaut.bio.missionDurationDays} Days</strong></span>
                            <span>•</span>
                            <span>BMD LOSS: <strong className="text-rose-400">{activeAstronaut.bio.boneDensityLoss}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Right: EVA Status Selector & Switch Crew Trigger */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Functional EVA Status Dropdown Selector */}
                    <div className="relative z-30" ref={evaSelectorRef}>
                        <button
                            type="button"
                            onClick={() => setIsEvaSelectorOpen(!isEvaSelectorOpen)}
                            className="border border-[#1a4b6c] px-3 py-1.5 bg-[#030b14] text-xs flex items-center gap-2 hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        >
                            <span className="text-slate-400">EVA STATUS:</span>
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
                            <div className="absolute top-full right-0 mt-1 w-44 bg-[#06121e] border border-[#1a4b6c] shadow-[0_15px_35px_rgba(0,0,0,0.95)] z-50 p-1 flex flex-col divide-y divide-[#1a4b6c]/40 text-xs">
                                {(['ON-GOING', 'STANDBY', 'SCHEDULED', 'COMPLETED', 'ABORTED'] as const).map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleSetEvaStatus(st)}
                                        className="text-left px-3 py-2 hover:bg-[#0a1f2e] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                                    >
                                        <span>{st}</span>
                                        {activeAstronaut.bio.evaStatus === st && (
                                            <Check className="w-3 h-3 text-[#5cdbdf]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Switch Astronaut Trigger - Opens Dedicated CrewSwitcherModal */}
                    <button
                        type="button"
                        onClick={() => setIsCrewSwitcherOpen(true)}
                        className="flex items-center gap-2 border border-[#1a4b6c] bg-[#030b14] px-3.5 py-1.5 text-xs text-slate-200 hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-all cursor-pointer font-bold tracking-wider"
                        title="Switch active astronaut telemetry profile"
                    >
                        <Users className="w-3.5 h-3.5 text-[#5cdbdf]" />
                        <span>SWITCH ASTRONAUT</span>
                    </button>
                </div>
            </div>

            {/* MAIN HUD 3-COLUMN COCKPIT GRID */}
            <div className="relative z-10 grid grid-cols-12 gap-4 flex-1">
                {/* LEFT COLUMN: Biometrics & Telemetry Waveforms */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-3">
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 p-3 flex flex-col h-full">
                        <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#5cdbdf]" />
                                <h2 className="text-xs font-bold tracking-wider text-white">BIOMETRICS & VITALS</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBiometricsModalOpen(true)}
                                className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span>Deep Telemetry</span>
                                <Expand className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Waveform Vital Cards */}
                        <div className="flex flex-col gap-3 flex-1 justify-between">
                            <VitalCard
                                title={activeAstronaut.vitals.heartRate.title}
                                value={activeAstronaut.vitals.heartRate.value}
                                status={activeAstronaut.vitals.heartRate.status}
                                color={activeAstronaut.vitals.heartRate.color}
                                type="ecg"
                                baseline="Baseline: 60 - 100 bpm"
                                onClick={() => setIsBiometricsModalOpen(true)}
                            />

                            <VitalCard
                                title={activeAstronaut.vitals.spO2.title}
                                value={activeAstronaut.vitals.spO2.value}
                                color={activeAstronaut.vitals.spO2.color}
                                type="sine"
                                baseline="Baseline: 95 - 100%"
                                onClick={() => setIsBiometricsModalOpen(true)}
                            />

                            <VitalCard
                                title={activeAstronaut.vitals.coreTemp.title}
                                value={activeAstronaut.vitals.coreTemp.value}
                                status={activeAstronaut.vitals.coreTemp.status}
                                color={activeAstronaut.vitals.coreTemp.color}
                                type="ecg"
                                baseline="Baseline: 36.5 - 37.5°C"
                                onClick={() => setIsBiometricsModalOpen(true)}
                            />

                            <VitalCard
                                title={activeAstronaut.vitals.respiration.title}
                                value={activeAstronaut.vitals.respiration.value}
                                color={activeAstronaut.vitals.respiration.color}
                                type="slow-sine"
                                baseline="Baseline: 12 - 20 bpm"
                                onClick={() => setIsBiometricsModalOpen(true)}
                            />

                            <VitalCard
                                title={activeAstronaut.vitals.hydration.title}
                                value={activeAstronaut.vitals.hydration.value}
                                status=""
                                color={activeAstronaut.vitals.hydration.color}
                                valueColor={activeAstronaut.vitals.hydration.valueColor}
                                type="flat"
                                baseline="Baseline: 80 - 100%"
                                onClick={() => setIsBiometricsModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: 3D Holographic Scanner & Active Alerts Side-By-Side */}
                <div className="col-span-12 xl:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Left Center: 3D Biomechanical Scanner */}
                    <div className="min-h-[460px] flex flex-col">
                        <Astronaut3DModel
                            heartRate={activeAstronaut.vitals.heartRate.numericValue}
                            coreTemp={activeAstronaut.vitals.coreTemp.numericValue}
                            evaStatus={activeAstronaut.bio.evaStatus}
                            astronautName={activeAstronaut.bio.name}
                        />
                    </div>

                    {/* Right Center: Active Clinical Alerts & Directives */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 p-3.5 relative flex flex-col justify-between min-h-[460px]">
                        {/* Tech Reticles */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                        <div>
                            <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <h2 className="text-xs font-bold tracking-wider text-white">ACTIVE ALERTS & PROTOCOLS</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                                        {activeAstronaut.alerts.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAcknowledgeAllAlerts}
                                        className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer"
                                    >
                                        Verify All
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {activeAstronaut.alerts.map((alert, alertIdx) => {
                                    const isCritical = alert.level === 'CRITICAL' || alert.level === 'WARNING';
                                    return (
                                        <div
                                            key={alertIdx}
                                            className={`border p-3 text-xs space-y-2.5 transition-all ${
                                                isCritical
                                                    ? 'border-amber-500/50 bg-[#1a1205]'
                                                    : 'border-[#1a4b6c] bg-[#0a1f2e]'
                                            }`}
                                        >
                                            <div className={`font-bold border-b pb-1.5 flex items-center justify-between ${
                                                isCritical
                                                    ? 'text-amber-400 border-amber-500/30'
                                                    : 'text-[#5cdbdf] border-[#1a4b6c]'
                                            }`}>
                                                <span className="tracking-wide text-[11px] leading-tight">{alert.title}</span>
                                                {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                                            </div>

                                            {/* Action Checklist */}
                                            <div className="space-y-1.5 text-[11px]">
                                                <div className="text-slate-400 text-[10px]">VERIFIED MEDICAL PROTOCOLS:</div>
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
                                                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                            ) : (
                                                                <Square className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
                                                            )}
                                                            <span className={isChecked ? 'text-slate-200' : 'text-slate-500 line-through'}>
                                                                {act}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Directive Transmission */}
                                            <div className="pt-2 border-t border-[#1a4b6c]/50 space-y-1.5">
                                                <div className="text-[10px] text-slate-400 leading-snug">
                                                    ACTION: <strong className="text-white">{alert.recommendedAction}</strong>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTransmitDirective(alert.recommendedAction)}
                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#5cdbdf] bg-[#0a1f2e] text-[#5cdbdf] hover:bg-[#5cdbdf] hover:text-slate-950 transition-all cursor-pointer text-[10px] font-bold tracking-wider"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    <span>TRANSMIT DIRECTIVE TO CREW</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Suit Diagnostics & Incident Response History */}
                <div className="col-span-12 xl:col-span-3 flex flex-col gap-4">
                    {/* Environmental & EMU Suit Diagnostics */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 p-3.5">
                        <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#5cdbdf]" />
                                <h2 className="text-xs font-bold tracking-wider text-white">SUIT & LIFE SUPPORT</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSuitModalOpen(true)}
                                className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span>Control Console</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <ProgressBar
                                label="SUIT PRESSURE (PLSS)"
                                value={`${activeAstronaut.diagnostics.suitPressurePsi} psi`}
                                percent={activeAstronaut.diagnostics.suitPressurePercent}
                                color="bg-[#5cdbdf]"
                                onClick={() => handleDiagnoseSubsystem('Suit Pressure Valves')}
                            />
                            <ProgressBar
                                label="O2 RESERVES"
                                value={`${activeAstronaut.diagnostics.o2Percent}%`}
                                percent={activeAstronaut.diagnostics.o2Percent}
                                color="bg-orange-400"
                                onClick={() => handleDiagnoseSubsystem('O2 Reserve Canister')}
                            />
                            <ProgressBar
                                label="RADIATION DOSIMETRY"
                                value={activeAstronaut.diagnostics.radiationStatus}
                                percent={activeAstronaut.diagnostics.radiationPercent}
                                color="bg-emerald-400"
                                onClick={() => handleDiagnoseSubsystem('Radiation Shielding Array')}
                            />
                            <ProgressBar
                                label="BATTERY CELL CAPACITY"
                                value={`${activeAstronaut.diagnostics.batteryPercent}%`}
                                percent={activeAstronaut.diagnostics.batteryPercent}
                                color="bg-sky-400"
                                onClick={() => handleDiagnoseSubsystem('Primary Battery Cell Pack')}
                            />
                        </div>
                    </div>

                    {/* Mission Incident Response Log */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 p-3.5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-2 mb-3">
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-[#5cdbdf]" />
                                <h2 className="text-xs font-bold tracking-wider text-white">RESPONSE LOG & EVENTS</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLogsModalOpen(true)}
                                className="text-[10px] text-[#5cdbdf] hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <span>Full Archive</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs border-l border-[#1a4b6c]/80 pl-3 relative max-h-[300px]">
                            {activeAstronaut.logs.map((item, i) => (
                                <div key={item.id || i} className="relative group">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-[#5cdbdf] group-hover:scale-125 transition-transform shadow-[0_0_6px_rgba(92,219,223,0.8)]"></div>
                                    <div className="text-white font-bold tracking-wide flex items-center justify-between text-[11px]">
                                        <span>{item.timestamp} - {item.title}</span>
                                        <span className="text-[9px] px-1 py-0.2 rounded border border-emerald-800 bg-emerald-950/60 text-emerald-400">
                                            {item.status || 'LOGGED'}
                                        </span>
                                    </div>
                                    <div className="text-slate-400 text-[10px] mt-0.5">{item.action}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Crew Roster Switcher Modal */}
            <CrewSwitcherModal
                isOpen={isCrewSwitcherOpen}
                onClose={() => setIsCrewSwitcherOpen(false)}
                crewList={effectiveCrewList}
                activeAstronautId={activeAstronaut.bio.id}
                onSelectAstronaut={handleSelectAstronaut}
            />

            {/* Telemetry Import Modal */}
            <TelemetryImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onApplyToHud={(data) => {
                    const profile = generateAstronautProfile({
                        Astronaut: data.astronautId || 'AST-' + Math.floor(10 + Math.random() * 90),
                        Name: data.name || 'Mission Specialist',
                        Country: data.country || 'NASA / International',
                        Gender: data.gender || 'Not Specified',
                        Age_at_mission_start: data.age || 40,
                    }, currentTimeStr);

                    setActiveAstronaut((prev) => ({
                        ...profile,
                        bio: {
                            ...profile.bio,
                            name: data.name || prev.bio.name,
                            id: data.astronautId || prev.bio.id,
                        },
                        vitals: {
                            ...profile.vitals,
                            heartRate: {
                                ...profile.vitals.heartRate,
                                numericValue: data.heartRate || profile.vitals.heartRate.numericValue,
                                value: `Heart Rate: ${data.heartRate || profile.vitals.heartRate.numericValue} bpm`,
                            },
                            spO2: {
                                ...profile.vitals.spO2,
                                numericValue: data.spO2 || profile.vitals.spO2.numericValue,
                                value: `${data.spO2 || profile.vitals.spO2.numericValue}%`,
                            },
                        },
                    }));
                }}
                onSaveToDatabase={async (data) => {
                    const recordPayload = {
                        Astronaut: data.astronautId || 'AST-' + Math.floor(10 + Math.random() * 90),
                        Name: data.name || 'Mission Specialist',
                        Country: data.country || 'NASA / International',
                        Gender: data.gender || 'Not Specified',
                        Age_at_mission_start: data.age || 40,
                        'Mission_duration(Days)': 180,
                        Bone_Density_Loss: '-3.0%',
                    };

                    const response = await fetch('/api/dataset/import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({ record: recordPayload }),
                    });

                    const resJson = await response.json();
                    if (resJson.success && resJson.records) {
                        setCrewList(resJson.records);
                    }
                }}
                activeAstronaut={activeAstronaut}
            />

            {/* Telemetry Export Modal */}
            <TelemetryExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                astronaut={activeAstronaut}
                allCrewDataset={crewList}
            />

            {/* Suit Systems Control Modal */}
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

            {/* Biometrics Detail Modal */}
            <BiometricsDetailModal
                isOpen={isBiometricsModalOpen}
                onClose={() => setIsBiometricsModalOpen(false)}
                astronaut={activeAstronaut}
                onRecalibrate={() => {
                    handleAddManualLog('Biosensors Recalibrated', '[DIAGNOSTIC] Galvanic skin sensors and optical PPG recalibrated');
                }}
            />

            {/* Mission Logs Modal */}
            <MissionLogsModal
                isOpen={isLogsModalOpen}
                onClose={() => setIsLogsModalOpen(false)}
                logs={activeAstronaut.logs}
                onAddLog={handleAddManualLog}
            />

            {/* System Settings Modal */}
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
function VitalCard({ title, value, status, color, valueColor, type, baseline, onClick }: any) {
    const textColor = valueColor || color;
    return (
        <div
            onClick={onClick}
            className="flex flex-col gap-1.5 p-2.5 border border-[#1a4b6c]/80 bg-[#0a1f2e] hover:border-[#5cdbdf] transition-all cursor-pointer group shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
        >
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold group-hover:text-white transition-colors tracking-wider">{title}</span>
                <span style={{ color: textColor }} className="font-bold text-xs tracking-wider">
                    {value} {status && <span className="text-[10px] font-normal">{status}</span>}
                </span>
            </div>

            <div className="relative h-11 w-full border border-[#1a4b6c]/60 bg-[#06121e] overflow-hidden group-hover:border-[#5cdbdf]/80 transition-colors">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #1a4b6c22 1px, transparent 1px), linear-gradient(to bottom, #1a4b6c22 1px, transparent 1px)',
                        backgroundSize: '10px 10px',
                    }}
                />
                <GraphPath type={type} color={color} />
            </div>

            {baseline && (
                <div className="text-[9px] text-slate-500 font-mono tracking-wider flex justify-between">
                    <span>{baseline}</span>
                    <span className="text-[#5cdbdf] opacity-0 group-hover:opacity-100 transition-opacity">EXPAND ↗</span>
                </div>
            )}
        </div>
    );
}

function GraphPath({ type, color }: { type: string; color: string }) {
    let d = '';
    if (type === 'ecg') {
        d = 'M0,20 L10,20 L15,5 L20,35 L25,20 L40,20 L45,10 L50,30 L55,20 L70,20 L75,5 L80,35 L85,20 L100,20';
    } else if (type === 'sine') {
        d = 'M0,20 Q12.5,5 25,20 T50,20 T75,20 T100,20';
    } else if (type === 'slow-sine') {
        d = 'M0,20 Q25,0 50,20 T100,20';
    } else {
        d = 'M0,20 L100,20'; // flatline
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
        <div onClick={onClick} className="text-xs cursor-pointer group space-y-1">
            <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300 group-hover:text-white transition-colors">{label}</span>
                <span className="text-white font-mono font-bold">{value}</span>
            </div>
            <div className="h-2.5 w-full bg-[#030b14] border border-[#1a4b6c] group-hover:border-[#5cdbdf] relative overflow-hidden flex transition-colors">
                <div className={`${color} h-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                <div className="absolute top-0 bottom-0 w-2 bg-white/30" style={{ left: `${percent}%` }} />
            </div>
        </div>
    );
}
