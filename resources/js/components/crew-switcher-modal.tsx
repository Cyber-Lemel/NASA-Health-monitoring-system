import React, { useState, useMemo, useEffect } from 'react';
import {
    X,
    Search,
    User,
    Check,
    Globe,
    Clock,
    Bone,
    Shield,
    Users,
    ChevronRight,
    Activity
} from 'lucide-react';
import NasaLogo from '@/components/nasa-logo';

interface CrewSwitcherModalProps {
    isOpen: boolean;
    onClose: () => void;
    crewList: any[];
    activeAstronautId: string;
    onSelectAstronaut: (record: any) => void;
}

export default function CrewSwitcherModal({
    isOpen,
    onClose,
    crewList,
    activeAstronautId,
    onSelectAstronaut,
}: CrewSwitcherModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgency, setSelectedAgency] = useState<string>('all');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Distinct agencies for filtering
    const agencies = useMemo(() => {
        const set = new Set<string>();
        crewList.forEach((c) => {
            const country = c.Country || c.country;
            if (country) set.add(country);
        });
        return Array.from(set).sort();
    }, [crewList]);

    // Filtered crew members
    const filteredCrew = useMemo(() => {
        return crewList.filter((c) => {
            const q = searchQuery.toLowerCase().trim();
            const name = String(c.Name || c.name || '').toLowerCase();
            const id = String(c.Astronaut || c.id || '').toLowerCase();
            const country = String(c.Country || c.country || '').toLowerCase();
            const role = String(c.Role || c.role || '').toLowerCase();

            const matchesQuery = !q || name.includes(q) || id.includes(q) || country.includes(q) || role.includes(q);
            const matchesAgency = selectedAgency === 'all' || country.toLowerCase() === selectedAgency.toLowerCase();

            return matchesQuery && matchesAgency;
        });
    }, [crewList, searchQuery, selectedAgency]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none font-mono"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl border border-[#1a4b6c] bg-[#06121e] p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tech Reticles */}
                <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#5cdbdf] pointer-events-none" />
                <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#5cdbdf] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#5cdbdf] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#5cdbdf] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
                                <span>NASA AHMS // CREW ROSTER SELECTION</span>
                            </h2>
                            <p className="text-[11px] text-slate-400 tracking-wider">
                                SWITCH ACTIVE TELEMETRY CHANNEL • LIVE DSN SYNCHRONIZATION
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                        title="Close Roster"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-3 text-xs">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH BY NAME, CALLSIGN, OR AGENCY..."
                            className="w-full pl-8 pr-7 py-2 bg-[#030b14] border border-[#1a4b6c] text-[#5cdbdf] placeholder:text-slate-600 focus:outline-none focus:border-[#5cdbdf] text-xs tracking-wider"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Agency Filter */}
                    <select
                        value={selectedAgency}
                        onChange={(e) => setSelectedAgency(e.target.value)}
                        className="px-2.5 py-2 bg-[#030b14] border border-[#1a4b6c] text-slate-300 focus:outline-none focus:border-[#5cdbdf] cursor-pointer text-xs uppercase"
                    >
                        <option value="all">AGENCY: ALL</option>
                        {agencies.map((agency) => (
                            <option key={agency} value={agency}>
                                {agency}
                            </option>
                        ))}
                    </select>

                    {/* Count */}
                    <div className="px-3 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 text-xs shrink-0">
                        ROSTER: <strong className="text-[#5cdbdf]">{filteredCrew.length}</strong>
                    </div>
                </div>

                {/* Roster List / Grid */}
                <div className="overflow-y-auto divide-y divide-[#1a4b6c]/40 text-xs flex-1 max-h-[420px] pr-1">
                    {filteredCrew.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                            <p className="text-white font-bold text-xs tracking-wider">NO MATCHING CREW MEMBERS FOUND</p>
                            <p className="text-slate-500 text-[11px]">No astronauts match "{searchQuery}". Clear query or filter.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedAgency('all');
                                }}
                                className="px-3 py-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] hover:border-[#5cdbdf] text-xs"
                            >
                                RESET FILTERS
                            </button>
                        </div>
                    ) : (
                        filteredCrew.map((astronaut, idx) => {
                            const cid = String(astronaut.Astronaut ?? astronaut.id ?? `AST-${idx}`);
                            const name = astronaut.Name || astronaut.name || `Astronaut ${cid}`;
                            const country = astronaut.Country || astronaut.country || 'NASA / International';
                            const role = astronaut.Role || astronaut.role || 'Astronaut Specialist';
                            const duration = astronaut['Mission_duration(Days)'] || 180;
                            const boneLoss = astronaut.Bone_Density_Loss || '-3.0%';
                            const isSelected = String(activeAstronautId) === cid;

                            return (
                                <div
                                    key={`${cid}-${idx}`}
                                    onClick={() => {
                                        onSelectAstronaut(astronaut);
                                        onClose();
                                    }}
                                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                        isSelected
                                            ? 'bg-[#5cdbdf]/15 text-white border-l-2 border-l-[#5cdbdf]'
                                            : 'text-slate-300 hover:bg-[#0a1f2e] hover:text-white hover:border-l-2 hover:border-l-[#5cdbdf]/60 border-l-2 border-l-transparent'
                                    }`}
                                >
                                    {/* Left: Avatar & Info */}
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div
                                            className={`w-9 h-9 border flex items-center justify-center font-bold text-sm shrink-0 ${
                                                isSelected
                                                    ? 'border-[#5cdbdf] bg-[#5cdbdf]/20 text-[#5cdbdf] shadow-[0_0_8px_rgba(92,219,223,0.4)]'
                                                    : 'border-[#1a4b6c] bg-[#0a1f2e] text-slate-300'
                                            }`}
                                        >
                                            {name.charAt(0)}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold text-white text-xs tracking-wide flex items-center gap-2 truncate">
                                                <span className="truncate">{name}</span>
                                                <span className="px-1.5 py-0.2 rounded border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf] font-mono text-[10px]">
                                                    {cid}
                                                </span>
                                                {isSelected && (
                                                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                                                <span className="text-slate-300">{role}</span>
                                                <span>•</span>
                                                <span className="text-slate-400">{country}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Metrics & Selection */}
                                    <div className="flex items-center gap-4 text-right shrink-0">
                                        <div className="hidden sm:block text-[10px] text-slate-400 font-mono">
                                            <div>FLIGHT: <strong className="text-sky-300">{duration}d</strong></div>
                                            <div>BMD: <strong className="text-rose-400">{boneLoss}</strong></div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {isSelected ? (
                                                <span className="px-2.5 py-1 border border-emerald-500 bg-emerald-950/60 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> LINKED
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="px-2.5 py-1 border border-[#1a4b6c] bg-[#030b14] text-[#5cdbdf] hover:border-[#5cdbdf] hover:bg-[#5cdbdf] hover:text-slate-950 transition-all text-[10px] font-bold flex items-center gap-1"
                                                >
                                                    <span>LINK HUD</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer status */}
                <div className="border-t border-[#1a4b6c] pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                        NASA AHMS • BIOMEDICAL TELEMETRY ROTATION PROTOCOL
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                    >
                        CLOSE ROSTER
                    </button>
                </div>
            </div>
        </div>
    );
}

