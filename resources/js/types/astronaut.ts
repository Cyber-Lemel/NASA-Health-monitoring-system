export interface AstronautBio {
    id: string; // e.g. "AST-01"
    name: string; // e.g. "Commander Alex Vance"
    role: string; // e.g. "Mission Commander"
    mission: string; // e.g. "ODYSSEY II"
    evaStatus: 'ON-GOING' | 'SCHEDULED' | 'STANDBY' | 'COMPLETED' | 'ABORTED';
    age: number;
    gender: string;
    country: string;
    missionDurationDays: number;
    boneDensityLoss: string;
}

export interface VitalMetric {
    title: string;
    value: string;
    numericValue: number;
    unit: string;
    status?: string;
    color: string;
    valueColor?: string;
    type: 'ecg' | 'sine' | 'slow-sine' | 'flat';
    baseline: string;
}

export interface SuitDiagnostics {
    suitPressurePsi: number; // e.g. 4.3 psi
    suitPressurePercent: number; // e.g. 60%
    o2Percent: number; // e.g. 21%
    radiationStatus: string; // e.g. "Safe" or "Elevated"
    radiationPercent: number; // e.g. 85%
    batteryPercent: number; // e.g. 74%
}

export interface MedicalAlert {
    level: 'CRITICAL' | 'WARNING' | 'NOMINAL' | 'INFO';
    title: string;
    description?: string;
    actionsTaken: string[];
    recommendedAction: string;
}

export interface TelemetryLogItem {
    id: string;
    timestamp: string;
    title: string;
    action: string;
    status?: 'RESOLVED' | 'PENDING' | 'IN_PROGRESS';
}

export interface AstronautFullData {
    bio: AstronautBio;
    vitals: {
        heartRate: VitalMetric;
        spO2: VitalMetric;
        coreTemp: VitalMetric;
        respiration: VitalMetric;
        hydration: VitalMetric;
    };
    diagnostics: SuitDiagnostics;
    alerts: MedicalAlert[];
    logs: TelemetryLogItem[];
}

export interface ParsedImportPayload {
    sourceType: 'excel' | 'pdf' | 'image' | 'json' | 'csv';
    fileName: string;
    astronautId?: string | number;
    name?: string;
    role?: string;
    mission?: string;
    age?: number;
    gender?: string;
    country?: string;
    evaStatus?: string;
    missionDurationDays?: number;
    noOfMission?: number;
    boneDensityLoss?: string | number;
    muscleMassLoss?: string | number;
    radiationExposure?: number;
    cardioRisk?: number;
    immuneSuppression?: number;
    psychScore?: number;
    vision?: string;
    countermeasures?: string;
    heartRate?: number;
    spO2?: number;
    coreTemp?: number;
    respiration?: number;
    hydration?: number;
    suitPressure?: number;
    o2Level?: number;
    radiation?: string;
    battery?: number;
    conditionNote?: string;
    detectedRows?: any[];
    rawTextPreview?: string;
    imageThumbnail?: string;
    rawRecord?: Record<string, any>;
}
