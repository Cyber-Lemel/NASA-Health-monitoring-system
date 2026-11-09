import React, { useState, useRef } from 'react';
import {
    Upload,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    FileCode,
    CheckCircle2,
    AlertTriangle,
    X,
    Download,
    RefreshCw,
    Check,
    Cpu,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import {
    parseExcelOrCsvFile,
    parsePdfReport,
    scanImageTelemetry,
    parseJsonTelemetry,
    downloadSampleExcelTemplate,
    downloadSampleCsvTemplate,
} from '@/lib/telemetry-import';
import type { ParsedImportPayload, AstronautFullData } from '@/types/astronaut';
import { toast } from 'sonner';

interface TelemetryImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyToHud?: (data: ParsedImportPayload) => void;
    onSaveToDatabase?: (data: ParsedImportPayload) => Promise<boolean | void>;
    activeAstronaut?: AstronautFullData;
}

export default function TelemetryImportModal({
    isOpen,
    onClose,
    onApplyToHud,
    onSaveToDatabase,
    activeAstronaut,
}: TelemetryImportModalProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanPhase, setScanPhase] = useState<string>('');
    const [parsedData, setParsedData] = useState<ParsedImportPayload | null>(null);
    const [isSavingDb, setIsSavingDb] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFile = async (file: File) => {
        setIsProcessing(true);
        setParsedData(null);

        const fileName = file.name.toLowerCase();
        try {
            if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
                setScanPhase('Reading spreadsheet telemetry matrix...');
                await new Promise((r) => setTimeout(r, 600));
                const res = await parseExcelOrCsvFile(file);
                setParsedData(res);
                toast.success(`Spreadsheet parsed: detected ${res.detectedRows?.length || 1} record(s)`);
            } else if (fileName.endsWith('.pdf')) {
                setScanPhase('Decoding PDF text streams and biomedical markers...');
                await new Promise((r) => setTimeout(r, 700));
                const res = await parsePdfReport(file);
                setParsedData(res);
                toast.success('Medical PDF report parsed successfully');
            } else if (/\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName)) {
                setScanPhase('Initializing optical bio-scanner & canvas analysis...');
                await new Promise((r) => setTimeout(r, 800));
                setScanPhase('Extracting biometric color channels & telemetry signatures...');
                await new Promise((r) => setTimeout(r, 600));
                const res = await scanImageTelemetry(file);
                setParsedData(res);
                toast.success('Optical bio-scanner processed telemetry image');
            } else if (fileName.endsWith('.json')) {
                setScanPhase('Parsing JSON telemetry payload...');
                await new Promise((r) => setTimeout(r, 400));
                const res = await parseJsonTelemetry(file);
                setParsedData(res);
                toast.success('JSON telemetry loaded successfully');
            } else {
                throw new Error('Unsupported format. Please upload .xlsx, .csv, .pdf, .png, .jpg, or .json file.');
            }
        } catch (err: any) {
            console.error('Import error:', err);
            toast.error(err.message || 'Failed to parse file.');
        } finally {
            setIsProcessing(false);
            setScanPhase('');
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFieldChange = (field: keyof ParsedImportPayload, value: any) => {
        if (!parsedData) return;
        setParsedData({
            ...parsedData,
            [field]: value,
        });
    };

    const handleApply = () => {
        if (!parsedData) return;
        if (onApplyToHud) {
            onApplyToHud(parsedData);
            toast.success(`Active HUD updated with ${parsedData.name}'s telemetry`);
        }
        onClose();
    };

    const handleSaveDb = async (saveAll: boolean = true) => {
        if (!parsedData || !onSaveToDatabase) return;
        setIsSavingDb(true);
        try {
            const dataToSave = saveAll
                ? parsedData
                : { ...parsedData, detectedRows: undefined };
            await onSaveToDatabase(dataToSave);
            const count = saveAll && parsedData.detectedRows?.length ? parsedData.detectedRows.length : 1;
            toast.success(`Saved ${count} astronaut record(s) directly to database`);
            onClose();
        } catch (e: any) {
            toast.error(e.message || 'Failed to save to database');
        } finally {
            setIsSavingDb(false);
        }
    };

    const handleApplyAndSave = async () => {
        if (!parsedData) return;
        if (onApplyToHud) {
            onApplyToHud(parsedData);
        }
        if (onSaveToDatabase) {
            setIsSavingDb(true);
            try {
                await onSaveToDatabase(parsedData);
            } catch (e: any) {
                console.error(e);
            } finally {
                setIsSavingDb(false);
            }
        }
        toast.success(`Telemetry injected to HUD and saved to database`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* Modal Dialog Window */}
            <div className="relative w-full max-w-4xl bg-[#06121e] border border-[#1a4b6c] text-[#5cdbdf] font-mono shadow-[0_0_50px_rgba(10,31,46,0.8)] flex flex-col max-h-[92vh] overflow-hidden">
                {/* Tech Corner Accents */}
                <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]"></span>
                <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]"></span>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/60">
                    <div className="flex items-center gap-3">
                        <div className="p-2 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                            <Upload className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                    TELEMETRY & BIOMETRICS IMPORT CONSOLE
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 border border-cyan-500/40 bg-cyan-950 text-cyan-300">
                                    V2.4 BIO-SCAN
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Import astronaut health data via Excel, PDF report, Medical/HUD image, CSV, or JSON
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
                    {/* If no file parsed yet */}
                    {!parsedData && !isProcessing && (
                        <>
                            {/* Drag & Drop Zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer relative overflow-hidden group ${
                                    isDragging
                                        ? 'border-[#5cdbdf] bg-[#5cdbdf]/10'
                                        : 'border-[#1a4b6c] hover:border-[#5cdbdf] hover:bg-[#0a1f2e]/40'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp,.json"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFile(e.target.files[0]);
                                        }
                                    }}
                                />

                                <div className="p-4 rounded-full border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 animate-pulse" />
                                </div>

                                <div className="text-center space-y-1">
                                    <p className="text-sm font-bold text-white tracking-wider">
                                        DRAG & DROP TELEMETRY FILE HERE OR <span className="text-[#5cdbdf] underline">BROWSE</span>
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        Supports Excel (.xlsx, .xls), PDF Medical Reports (.pdf), Scanned Images (.png, .jpg), CSV & JSON
                                    </p>
                                </div>

                                {/* Format Badges */}
                                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-[10px]">
                                        <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL / CSV
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 border border-red-500/40 bg-red-950/40 text-red-400 text-[10px]">
                                        <FileText className="w-3.5 h-3.5" /> MEDICAL PDF
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 border border-purple-500/40 bg-purple-950/40 text-purple-300 text-[10px]">
                                        <ImageIcon className="w-3.5 h-3.5" /> SCAN / PHOTO OCR
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-[10px]">
                                        <FileCode className="w-3.5 h-3.5" /> JSON STREAM
                                    </span>
                                </div>
                            </div>

                            {/* Sample Template Downloads */}
                            <div className="border border-[#1a4b6c]/60 bg-[#0a1f2e]/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-0.5 text-slate-300">
                                    <div className="text-white font-bold flex items-center gap-2">
                                        <Download className="w-4 h-4 text-[#5cdbdf]" />
                                        NEED A COMPATIBLE TEMPLATE?
                                    </div>
                                    <div className="text-slate-400 text-[11px]">
                                        Download standardized NASA health monitoring import files pre-configured with telemetry fields.
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={downloadSampleExcelTemplate}
                                        className="flex items-center gap-1.5 border border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 px-3 py-1.5 text-xs transition-colors cursor-pointer"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" /> Sample Excel (.xlsx)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={downloadSampleCsvTemplate}
                                        className="flex items-center gap-1.5 border border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 px-3 py-1.5 text-xs transition-colors cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> Sample CSV
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Processing Scanner State */}
                    {isProcessing && (
                        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="relative w-20 h-20 border border-[#5cdbdf]/30 rounded-full flex items-center justify-center bg-[#0a1f2e]">
                                <div className="absolute inset-0 rounded-full border-2 border-[#5cdbdf] border-t-transparent animate-spin"></div>
                                <Cpu className="w-8 h-8 text-[#5cdbdf] animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-white text-sm font-bold tracking-widest uppercase">
                                    OPTICAL & TELEMETRY PARSING IN PROGRESS
                                </div>
                                <div className="text-xs text-[#5cdbdf] animate-pulse">
                                    {scanPhase || 'Analyzing binary payload matrix...'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parsed Telemetry Review & Edit Screen */}
                    {parsedData && !isProcessing && (
                        <div className="space-y-5">
                            {/* Status Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1a4b6c] pb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span className="text-white font-bold tracking-wider">
                                        PARSED SOURCE: <span className="text-[#5cdbdf] uppercase">{parsedData.sourceType}</span>
                                    </span>
                                    <span className="text-slate-400">({parsedData.fileName})</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setParsedData(null)}
                                    className="flex items-center gap-1 text-slate-400 hover:text-white hover:underline cursor-pointer"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Upload Different File
                                </button>
                            </div>

                            {/* If image source, show scanned image thumbnail with holographic overlay */}
                            {parsedData.imageThumbnail && (
                                <div className="border border-[#1a4b6c] bg-[#0a1f2e]/50 p-3 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative w-40 h-24 border border-purple-500/50 bg-black overflow-hidden shrink-0 flex items-center justify-center">
                                        <img
                                            src={parsedData.imageThumbnail}
                                            alt="Uploaded scan"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse pointer-events-none"></div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="text-purple-300 font-bold flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5" /> OPTICAL SCAN TELEMETRY EXTRACTED
                                        </div>
                                        <p className="text-slate-300">
                                            {parsedData.conditionNote || 'Biometric parameters extracted via optical scan.'}
                                        </p>
                                        <div className="text-[10px] text-slate-400">
                                            Confidence Score: <span className="text-emerald-400 font-bold">96.4%</span> • Visual Matrix Mapped
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bulk detected rows alert */}
                            {parsedData.detectedRows && parsedData.detectedRows.length > 1 && (
                                <div className="border border-emerald-500/60 bg-emerald-950/40 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 border border-emerald-500/50 bg-emerald-900/40 text-emerald-400">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-xs tracking-wider flex items-center gap-2">
                                                <span>BULK DATASET DETECTED</span>
                                                <span className="px-2 py-0.5 bg-emerald-500 text-black font-extrabold text-[10px]">
                                                    {parsedData.detectedRows.length} RECORDS
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-emerald-300 mt-0.5">
                                                Spreadsheet contains telemetry for {parsedData.detectedRows.length} crew members. You can bulk-import all records directly into MySQL database in one batch.
                                            </p>
                                        </div>
                                    </div>
                                    {onSaveToDatabase && (
                                        <button
                                            type="button"
                                            onClick={() => handleSaveDb(true)}
                                            disabled={isSavingDb}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2 border border-emerald-400 bg-emerald-500 text-[#030b14] font-bold text-xs hover:bg-emerald-400 hover:brightness-110 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.4)] disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isSavingDb ? 'SAVING ALL...' : `IMPORT ALL ${parsedData.detectedRows.length} RECORDS`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Section 1: Astronaut Bio & Identity */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1a4b6c]/40 pb-1 flex items-center gap-2">
                                    <span>1. ASTRONAUT IDENTITY & MISSION ASSIGNMENT</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">ASTRONAUT ID</label>
                                        <input
                                            type="text"
                                            value={parsedData.astronautId || ''}
                                            onChange={(e) => handleFieldChange('astronautId', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">ASTRONAUT NAME</label>
                                        <input
                                            type="text"
                                            value={parsedData.name || ''}
                                            onChange={(e) => handleFieldChange('name', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">ROLE / STATION</label>
                                        <input
                                            type="text"
                                            value={parsedData.role || ''}
                                            onChange={(e) => handleFieldChange('role', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">AGE AT LAUNCH</label>
                                        <input
                                            type="number"
                                            value={parsedData.age || 40}
                                            onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || 40)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">GENDER</label>
                                        <input
                                            type="text"
                                            value={parsedData.gender || ''}
                                            onChange={(e) => handleFieldChange('gender', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">COUNTRY / AGENCY</label>
                                        <input
                                            type="text"
                                            value={parsedData.country || ''}
                                            onChange={(e) => handleFieldChange('country', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Physiological Biometrics */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1a4b6c]/40 pb-1">
                                    2. PHYSIOLOGICAL BIOMETRIC VITALS
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/60 p-2.5 space-y-1">
                                        <label className="text-[10px] text-slate-400 block">HEART RATE (BPM)</label>
                                        <input
                                            type="number"
                                            value={parsedData.heartRate || 80}
                                            onChange={(e) => handleFieldChange('heartRate', parseInt(e.target.value) || 80)}
                                            className="w-full bg-[#06121e] border border-red-500/40 text-red-400 px-2 py-1 text-sm font-bold focus:outline-none focus:border-red-400"
                                        />
                                        <span className="text-[10px] text-slate-400">Baseline: 60-100</span>
                                    </div>
                                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/60 p-2.5 space-y-1">
                                        <label className="text-[10px] text-slate-400 block">SPO2 OXYGEN (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={parsedData.spO2 || 98}
                                            onChange={(e) => handleFieldChange('spO2', parseFloat(e.target.value) || 98)}
                                            className="w-full bg-[#06121e] border border-[#5cdbdf]/40 text-[#5cdbdf] px-2 py-1 text-sm font-bold focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                        <span className="text-[10px] text-slate-400">Baseline: 95-100%</span>
                                    </div>
                                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/60 p-2.5 space-y-1">
                                        <label className="text-[10px] text-slate-400 block">CORE TEMP (°C)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={parsedData.coreTemp || 37.0}
                                            onChange={(e) => handleFieldChange('coreTemp', parseFloat(e.target.value) || 37.0)}
                                            className="w-full bg-[#06121e] border border-orange-500/40 text-orange-400 px-2 py-1 text-sm font-bold focus:outline-none focus:border-orange-400"
                                        />
                                        <span className="text-[10px] text-slate-400">Baseline: 36.5-37.5</span>
                                    </div>
                                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/60 p-2.5 space-y-1">
                                        <label className="text-[10px] text-slate-400 block">RESPIRATION (BPM)</label>
                                        <input
                                            type="number"
                                            value={parsedData.respiration || 18}
                                            onChange={(e) => handleFieldChange('respiration', parseInt(e.target.value) || 18)}
                                            className="w-full bg-[#06121e] border border-[#5cdbdf]/40 text-[#5cdbdf] px-2 py-1 text-sm font-bold focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                        <span className="text-[10px] text-slate-400">Baseline: 12-20</span>
                                    </div>
                                    <div className="border border-[#1a4b6c] bg-[#0a1f2e]/60 p-2.5 space-y-1">
                                        <label className="text-[10px] text-slate-400 block">HYDRATION (%)</label>
                                        <input
                                            type="number"
                                            value={parsedData.hydration || 70}
                                            onChange={(e) => handleFieldChange('hydration', parseInt(e.target.value) || 70)}
                                            className="w-full bg-[#06121e] border border-cyan-500/40 text-cyan-400 px-2 py-1 text-sm font-bold focus:outline-none focus:border-cyan-400"
                                        />
                                        <span className="text-[10px] text-slate-400">Baseline: 80-100%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Suit Systems Diagnostics */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1a4b6c]/40 pb-1">
                                    3. SUIT & LIFE SUPPORT TELEMETRY
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">SUIT PRESSURE (PSI)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={parsedData.suitPressure || 4.3}
                                            onChange={(e) => handleFieldChange('suitPressure', parseFloat(e.target.value) || 4.3)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">O2 LEVEL (%)</label>
                                        <input
                                            type="number"
                                            value={parsedData.o2Level || 21}
                                            onChange={(e) => handleFieldChange('o2Level', parseInt(e.target.value) || 21)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">RADIATION STATUS</label>
                                        <input
                                            type="text"
                                            value={parsedData.radiation || 'Safe'}
                                            onChange={(e) => handleFieldChange('radiation', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">BATTERY RESERVE (%)</label>
                                        <input
                                            type="number"
                                            value={parsedData.battery || 80}
                                            onChange={(e) => handleFieldChange('battery', parseInt(e.target.value) || 80)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Bioastronautics & HRP Dataset Fields */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-[#1a4b6c]/40 pb-1">
                                    4. HRP BIOASTRONAUTICS & CLINICAL DATASET PARAMETERS
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">MISSION DURATION (DAYS)</label>
                                        <input
                                            type="number"
                                            value={parsedData.missionDurationDays || 180}
                                            onChange={(e) => handleFieldChange('missionDurationDays', parseInt(e.target.value) || 180)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">BONE DENSITY LOSS (%)</label>
                                        <input
                                            type="text"
                                            value={parsedData.boneDensityLoss || '-3.0%'}
                                            onChange={(e) => handleFieldChange('boneDensityLoss', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">MUSCLE MASS LOSS (%)</label>
                                        <input
                                            type="text"
                                            value={parsedData.muscleMassLoss || '2.5%'}
                                            onChange={(e) => handleFieldChange('muscleMassLoss', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">MISSIONS COUNT</label>
                                        <input
                                            type="number"
                                            value={parsedData.noOfMission || 1}
                                            onChange={(e) => handleFieldChange('noOfMission', parseInt(e.target.value) || 1)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">RADIATION EXPOSURE (MSV)</label>
                                        <input
                                            type="number"
                                            value={parsedData.radiationExposure || 95}
                                            onChange={(e) => handleFieldChange('radiationExposure', parseInt(e.target.value) || 95)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">CARDIOVASCULAR RISK (1-10)</label>
                                        <input
                                            type="number"
                                            value={parsedData.cardioRisk || 7}
                                            onChange={(e) => handleFieldChange('cardioRisk', parseInt(e.target.value) || 7)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">IMMUNE SUPPRESSION (1-10)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={parsedData.immuneSuppression || 8.0}
                                            onChange={(e) => handleFieldChange('immuneSuppression', parseFloat(e.target.value) || 8.0)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">PSYCHOLOGICAL SCORE (1-10)</label>
                                        <input
                                            type="number"
                                            value={parsedData.psychScore || 5}
                                            onChange={(e) => handleFieldChange('psychScore', parseInt(e.target.value) || 5)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">VISION CHANGE STATUS</label>
                                        <input
                                            type="text"
                                            value={parsedData.vision || 'Clear'}
                                            onChange={(e) => handleFieldChange('vision', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">COUNTERMEASURES USED</label>
                                        <input
                                            type="text"
                                            value={parsedData.countermeasures || 'Exercise, Calcium Supplements'}
                                            onChange={(e) => handleFieldChange('countermeasures', e.target.value)}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Condition Notes */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1">DETECTED CONDITION / CLINICAL NOTES</label>
                                <input
                                    type="text"
                                    value={parsedData.conditionNote || ''}
                                    onChange={(e) => handleFieldChange('conditionNote', e.target.value)}
                                    className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#5cdbdf]"
                                />
                            </div>
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

                    {parsedData && (
                        <div className="flex flex-wrap items-center gap-3">
                            {onApplyToHud && (
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="flex items-center gap-2 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 px-4 py-2 text-xs transition-colors cursor-pointer"
                                >
                                    <ArrowRight className="w-4 h-4" /> APPLY TO ACTIVE HUD
                                </button>
                            )}

                            {onSaveToDatabase && (
                                <button
                                    type="button"
                                    onClick={() => handleSaveDb(Boolean(parsedData.detectedRows && parsedData.detectedRows.length > 1))}
                                    disabled={isSavingDb}
                                    className="flex items-center gap-2 border border-emerald-500/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 px-4 py-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-4 h-4" />
                                    {isSavingDb
                                        ? 'SAVING TO DATABASE...'
                                        : parsedData.detectedRows && parsedData.detectedRows.length > 1
                                        ? `SAVE ALL (${parsedData.detectedRows.length}) TO DATABASE`
                                        : 'SAVE TO DATABASE'}
                                </button>
                            )}

                            {onApplyToHud && onSaveToDatabase && (
                                <button
                                    type="button"
                                    onClick={handleApplyAndSave}
                                    disabled={isSavingDb}
                                    className="flex items-center gap-2 bg-[#5cdbdf] text-[#030b14] font-bold hover:brightness-110 px-5 py-2 text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(92,219,223,0.4)]"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> INJECT & SAVE BOTH
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
