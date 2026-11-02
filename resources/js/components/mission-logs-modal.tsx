import React, { useState } from 'react';
import { 
    X, ClipboardList, Search, Plus, Download, 
    CheckCircle2, Clock, Filter 
} from 'lucide-react';
import type { TelemetryLogItem } from '@/types/astronaut';
import { toast } from 'sonner';

interface MissionLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: TelemetryLogItem[];
    onAddLog: (title: string, action: string) => void;
}

export default function MissionLogsModal({
    isOpen,
    onClose,
    logs,
    onAddLog,
}: MissionLogsModalProps) {
    const [search, setSearch] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newAction, setNewAction] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    if (!isOpen) return null;

    const filteredLogs = logs.filter(
        (l) =>
            l.title.toLowerCase().includes(search.toLowerCase()) ||
            l.action.toLowerCase().includes(search.toLowerCase()) ||
            l.timestamp.includes(search)
    );

    const handleCreateLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error('Please enter an incident or note title.');
            return;
        }
        onAddLog(newTitle, newAction || '[LOG] Flight Surgeon manual entry logged.');
        setNewTitle('');
        setNewAction('');
        setShowAddForm(false);
        toast.success('Mission log entry recorded.');
    };

    const handleExportLogsTxt = () => {
        const text = logs
            .map((l) => `[${l.timestamp}] ${l.title.toUpperCase()} -> ${l.action}`)
            .join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NASA_Mission_Logs_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Mission incident log exported as text file.');
    };

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
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold tracking-widest text-white uppercase">
                                MISSION INCIDENT & RESOLUTION ARCHIVE
                            </h3>
                            <p className="text-xs text-slate-400">
                                Chronological Telemetry Events, Automated Actions, and Flight Surgeon Notes
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

                {/* Actions Bar */}
                <div className="p-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 bg-[#06121e] border border-[#1a4b6c] px-3 py-1.5 w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-white text-xs focus:outline-none w-full"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-1.5 border border-[#5cdbdf] text-[#5cdbdf] hover:bg-[#5cdbdf]/15 px-3 py-1.5 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{showAddForm ? 'CANCEL' : 'ADD SURGEON NOTE'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportLogsTxt}
                            className="flex items-center gap-1.5 border border-slate-700 bg-slate-900 text-slate-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>EXPORT (.TXT)</span>
                        </button>
                    </div>
                </div>

                {/* Add Form Drawer */}
                {showAddForm && (
                    <form onSubmit={handleCreateLog} className="p-4 border-b border-[#1a4b6c] bg-[#0a1f2e]/70 space-y-3 text-xs animate-in slide-in-from-top-3">
                        <div className="font-bold text-white uppercase text-[11px]">New Flight Surgeon Log Entry</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1">INCIDENT / SUBJECT</label>
                                <input
                                    type="text"
                                    placeholder="e.g. LCG Temperature Calibration"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-[#06121e] border border-[#1a4b6c] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1">ACTION / RESOLUTION DIRECTIVE</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Verified flow pressure at 4.3 psi"
                                    value={newAction}
                                    onChange={(e) => setNewAction(e.target.value)}
                                    className="w-full bg-[#06121e] border border-[#1a4b6c] px-2.5 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#5cdbdf] text-[#030b14] font-bold px-4 py-1.5 hover:brightness-110 cursor-pointer"
                        >
                            CONFIRM & LOG
                        </button>
                    </form>
                )}

                {/* Body Logs List */}
                <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No logs matching filter</div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="border border-[#1a4b6c]/60 bg-[#0a1f2e]/30 p-3 flex items-start justify-between gap-4 hover:border-[#5cdbdf]/50 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#5cdbdf] font-bold font-mono">[{log.timestamp}]</span>
                                        <span className="text-white font-bold">{log.title}</span>
                                    </div>
                                    <div className="text-slate-300 text-[11px] pl-6 border-l border-[#1a4b6c]">
                                        {log.action}
                                    </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-mono shrink-0">
                                    {log.status || 'RESOLVED'}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-[#1a4b6c] bg-[#0a1f2e]/80 text-xs">
                    <span className="text-slate-400">Total Recorded Incidents: <strong className="text-white">{logs.length}</strong></span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-[#5cdbdf] text-[#030b14] font-bold px-5 py-2 text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                        CLOSE LOGS CONSOLE
                    </button>
                </div>
            </div>
        </div>
    );
}
