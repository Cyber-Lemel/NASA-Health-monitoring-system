import React, { useState } from 'react';
import {
    Download,
    FileSpreadsheet,
    FileText,
    FileCode,
    Database,
    CheckCircle2,
    X,
    User,
    Activity,
    Shield,
    Sparkles,
} from 'lucide-react';
import {
    exportAstronautToExcel,
    exportAstronautToPdf,
    exportAstronautToCsv,
    exportAstronautToJson,
} from '@/lib/telemetry-export';
import type { AstronautFullData } from '@/types/astronaut';
import { toast } from 'sonner';

interface TelemetryExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    astronaut: AstronautFullData;
    allCrewDataset?: any[];
}

type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

export default function TelemetryExportModal({
    isOpen,
    onClose,
    astronaut,
    allCrewDataset = [],
}: TelemetryExportModalProps) {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
    const [includeAllCrew, setIncludeAllCrew] = useState<boolean>(true);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Artificial tiny delay for tactile HUD response
            await new Promise((r) => setTimeout(r, 450));

            if (selectedFormat === 'excel') {
                exportAstronautToExcel(astronaut, includeAllCrew ? allCrewDataset : []);
                toast.success(`Excel telemetry report generated for ${astronaut.bio.name}`);
            } else if (selectedFormat === 'pdf') {
                exportAstronautToPdf(astronaut);
                toast.success(`Official NASA PDF report downloaded for ${astronaut.bio.name}`);
            } else if (selectedFormat === 'csv') {
                exportAstronautToCsv(astronaut);
                toast.success(`CSV telemetry stream exported for ${astronaut.bio.name}`);
            } else if (selectedFormat === 'json') {
                exportAstronautToJson(astronaut);
                toast.success(`JSON telemetry payload generated for ${astronaut.bio.name}`);
            }
            onClose();
        } catch (err: any) {
            console.error('Export error:', err);
            toast.error(err.message || 'Export failed.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* Modal Dialog Window */}
            <div className="relative w-full max-w-3xl bg-[#06121e] border border-[#1a4b6c] text-[#5cdbdf] font-mono shadow-[0_0_50px_rgba(10,31,46,0.8)] flex flex-col max-h-[92vh] overflow-hidden">
                {/* Tech Corner Accents */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]"></span>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                    MISSION TELEMETRY EXPORT CENTER
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 border border-emerald-500/40 bg-emerald-950 text-emerald-300">
                                    CERTIFIED BIO-DATA
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Export astronaut health records, physiological biometrics, and incident logs
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

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                    {/* Active Astronaut Dossier Summary Card */}
                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/40 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4b6c]/50 pb-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#5cdbdf]" />
                                <span className="text-white font-bold">{astronaut.bio.name}</span>
                                <span className="text-[#5cdbdf]">({astronaut.bio.id})</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                <span className="px-2 py-0.5 border border-orange-500/40 bg-orange-950/40 text-orange-400">
                                    EVA: {astronaut.bio.evaStatus}
                                </span>
                                <span className="text-slate-400">MISSION: {astronaut.bio.mission}</span>
                            </div>
                        </div>

                        {/* Quick Metrics Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                            <div className="bg-[#06121e] border border-[#1a4b6c]/60 p-2">
                                <div className="text-slate-400 text-[10px]">HEART RATE</div>
                                <div className="text-red-400 font-bold">{astronaut.vitals.heartRate.value}</div>
                            </div>
                            <div className="bg-[#06121e] border border-[#1a4b6c]/60 p-2">
                                <div className="text-slate-400 text-[10px]">SPO2 OXYGEN</div>
                                <div className="text-[#5cdbdf] font-bold">{astronaut.vitals.spO2.value}</div>
                            </div>
                            <div className="bg-[#06121e] border border-[#1a4b6c]/60 p-2">
                                <div className="text-slate-400 text-[10px]">CORE TEMP</div>
                                <div className="text-orange-400 font-bold">{astronaut.vitals.coreTemp.value}</div>
                            </div>
                            <div className="bg-[#06121e] border border-[#1a4b6c]/60 p-2">
                                <div className="text-slate-400 text-[10px]">SUIT PRESSURE</div>
                                <div className="text-white font-bold">{astronaut.diagnostics.suitPressurePsi} psi</div>
                            </div>
                            <div className="bg-[#06121e] border border-[#1a4b6c]/60 p-2">
                                <div className="text-slate-400 text-[10px]">HYDRATION</div>
                                <div className="text-cyan-400 font-bold">{astronaut.vitals.hydration.value}</div>
                            </div>
                        </div>
                    </div>

                    {/* Format Selection Cards */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-200 tracking-wider block uppercase">
                            SELECT EXPORT FORMAT & ENCODING:
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Option 1: Excel */}
                            <div
                                onClick={() => setSelectedFormat('excel')}
                                className={`border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                                    selectedFormat === 'excel'
                                        ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                                        : 'border-[#1a4b6c] bg-[#0a1f2e]/30 hover:border-slate-500 hover:bg-[#0a1f2e]/60'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 border border-emerald-500/40 bg-emerald-950/60 text-emerald-400">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Microsoft Excel (.xlsx)</div>
                                            <div className="text-[10px] text-emerald-400">Standardized Multi-Sheet Workbook</div>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={selectedFormat === 'excel'}
                                        onChange={() => setSelectedFormat('excel')}
                                        className="text-emerald-500 focus:ring-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Comprehensive dossier containing active vitals, life support diagnostics, incident history, and database archive.
                                </p>
                            </div>

                            {/* Option 2: PDF */}
                            <div
                                onClick={() => setSelectedFormat('pdf')}
                                className={`border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                                    selectedFormat === 'pdf'
                                        ? 'border-red-400 bg-red-950/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                                        : 'border-[#1a4b6c] bg-[#0a1f2e]/30 hover:border-slate-500 hover:bg-[#0a1f2e]/60'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 border border-red-500/40 bg-red-950/60 text-red-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Official NASA Medical PDF (.pdf)</div>
                                            <div className="text-[10px] text-red-400">Printable Vector Document</div>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={selectedFormat === 'pdf'}
                                        onChange={() => setSelectedFormat('pdf')}
                                        className="text-red-500 focus:ring-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Formatted Space Medicine & Life Sciences report with mission headers, vital tables, alerts, and surgeon verification.
                                </p>
                            </div>

                            {/* Option 3: CSV */}
                            <div
                                onClick={() => setSelectedFormat('csv')}
                                className={`border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                                    selectedFormat === 'csv'
                                        ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_15px_rgba(92,219,223,0.15)]'
                                        : 'border-[#1a4b6c] bg-[#0a1f2e]/30 hover:border-slate-500 hover:bg-[#0a1f2e]/60'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 border border-cyan-500/40 bg-cyan-950/60 text-cyan-400">
                                            <FileCode className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Delimited Telemetry Stream (.csv)</div>
                                            <div className="text-[10px] text-cyan-400">Data Science & Python Pandas</div>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={selectedFormat === 'csv'}
                                        onChange={() => setSelectedFormat('csv')}
                                        className="text-cyan-500 focus:ring-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Raw tabular export suited for machine learning models, external charts, and statistical analysis.
                                </p>
                            </div>

                            {/* Option 4: JSON */}
                            <div
                                onClick={() => setSelectedFormat('json')}
                                className={`border p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                                    selectedFormat === 'json'
                                        ? 'border-purple-400 bg-purple-950/20 shadow-[0_0_15px_rgba(192,132,252,0.15)]'
                                        : 'border-[#1a4b6c] bg-[#0a1f2e]/30 hover:border-slate-500 hover:bg-[#0a1f2e]/60'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 border border-purple-500/40 bg-purple-950/60 text-purple-400">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Structured Telemetry Payload (.json)</div>
                                            <div className="text-[10px] text-purple-400">Full Object Graph</div>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        checked={selectedFormat === 'json'}
                                        onChange={() => setSelectedFormat('json')}
                                        className="text-purple-500 focus:ring-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Direct machine payload with metadata, vitals thresholds, suit telemetry, and timestamps for system integrations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scope Options */}
                    {selectedFormat === 'excel' && allCrewDataset && allCrewDataset.length > 0 && (
                        <div className="border border-[#1a4b6c]/60 bg-[#0a1f2e]/30 p-3 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <div className="text-white font-bold flex items-center gap-2">
                                    <Database className="w-4 h-4 text-[#5cdbdf]" />
                                    INCLUDE COMPLETE MISSION CREW ARCHIVE?
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                    Appends an extra workbook sheet with all {allCrewDataset.length} astronaut database records from MySQL.
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeAllCrew}
                                    onChange={(e) => setIncludeAllCrew(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#5cdbdf] focus:ring-0 bg-[#06121e] border-[#1a4b6c] cursor-pointer"
                                />
                                <span>Include Archive</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#1a4b6c] bg-[#0a1f2e]/80">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border border-slate-700 hover:border-slate-500 text-slate-300 px-4 py-2 text-xs transition-colors cursor-pointer"
                    >
                        CANCEL
                    </button>

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-[#5cdbdf] text-[#030b14] font-bold hover:brightness-110 px-6 py-2 text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(92,219,223,0.4)] disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'GENERATING ARCHIVE...' : `DOWNLOAD ${selectedFormat.toUpperCase()}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
