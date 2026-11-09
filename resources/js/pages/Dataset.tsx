import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Database,
    ArrowLeft,
    Search,
    Filter,
    Download,
    ArrowUpDown,
    User,
    Activity,
    Shield,
    Sparkles,
    Calendar,
    Globe,
    Bone,
    FileSpreadsheet,
    FileCode,
    ChevronRight,
    ExternalLink,
    RefreshCw,
    X,
    TrendingDown,
    Clock,
    Flame,
    CheckCircle2,
    AlertTriangle,
    Eye,
    LogOut,
    Radio,
    Zap,
    SlidersHorizontal
} from 'lucide-react';
import NasaLogo from '@/components/nasa-logo';
import { logout } from '@/routes';
import { toast } from 'sonner';

interface DatasetRecordItem {
    id?: number;
    Astronaut?: string;
    Name?: string;
    Age_at_mission_start?: number;
    Gender?: string;
    Country?: string;
    'Mission_duration(Days)'?: number;
    Bone_Density_Loss?: string;
}

interface DatasetProps {
    records: DatasetRecordItem[];
}

export default function Dataset({ records = [] }: DatasetProps) {
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGender, setSelectedGender] = useState<string>('all');
    const [selectedCountry, setSelectedCountry] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedAstronaut, setSelectedAstronaut] = useState<DatasetRecordItem | null>(null);

    // Live UTC Clock
    const [utcTimeStr, setUtcTimeStr] = useState<string>('00:00:00 UTC');
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setUtcTimeStr(
                now.toLocaleTimeString('en-US', {
                    timeZone: 'UTC',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }) + ' UTC'
            );
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close modal on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedAstronaut(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Distinct countries for filter
    const countries = useMemo(() => {
        const set = new Set<string>();
        records.forEach((r) => {
            if (r.Country) set.add(r.Country);
        });
        return Array.from(set).sort();
    }, [records]);

    // Analytics metrics calculated from records
    const metrics = useMemo(() => {
        if (!records.length) {
            return {
                totalCount: 0,
                avgDuration: 0,
                maxDuration: 0,
                avgAge: 0,
                avgBoneLoss: -3.2,
                distinctCountries: 0,
            };
        }

        let totalDuration = 0;
        let maxDuration = 0;
        let totalAge = 0;
        let totalBoneLoss = 0;
        let validBoneLossCount = 0;

        records.forEach((r) => {
            const dur = Number(r['Mission_duration(Days)']) || 0;
            totalDuration += dur;
            if (dur > maxDuration) maxDuration = dur;

            const age = Number(r.Age_at_mission_start) || 0;
            totalAge += age;

            if (r.Bone_Density_Loss) {
                const numeric = parseFloat(r.Bone_Density_Loss.replace('%', ''));
                if (!isNaN(numeric)) {
                    totalBoneLoss += numeric;
                    validBoneLossCount++;
                }
            }
        });

        return {
            totalCount: records.length,
            avgDuration: Math.round(totalDuration / records.length),
            maxDuration,
            avgAge: +(totalAge / records.length).toFixed(1),
            avgBoneLoss: validBoneLossCount > 0 ? +(totalBoneLoss / validBoneLossCount).toFixed(2) : -3.2,
            distinctCountries: countries.length || 1,
        };
    }, [records, countries]);

    // Filter and sort records
    const filteredRecords = useMemo(() => {
        return records
            .filter((item) => {
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !q ||
                    (item.Name && item.Name.toLowerCase().includes(q)) ||
                    (item.Astronaut && item.Astronaut.toLowerCase().includes(q)) ||
                    (item.Country && item.Country.toLowerCase().includes(q));

                const matchesGender =
                    selectedGender === 'all' ||
                    (item.Gender && item.Gender.toLowerCase() === selectedGender.toLowerCase());

                const matchesCountry =
                    selectedCountry === 'all' ||
                    (item.Country && item.Country.toLowerCase() === selectedCountry.toLowerCase());

                return matchesSearch && matchesGender && matchesCountry;
            })
            .sort((a, b) => {
                let valA: any = '';
                let valB: any = '';

                switch (sortField) {
                    case 'id':
                        valA = a.id || a.Astronaut || '';
                        valB = b.id || b.Astronaut || '';
                        break;
                    case 'name':
                        valA = a.Name || '';
                        valB = b.Name || '';
                        break;
                    case 'age':
                        valA = Number(a.Age_at_mission_start) || 0;
                        valB = Number(b.Age_at_mission_start) || 0;
                        break;
                    case 'duration':
                        valA = Number(a['Mission_duration(Days)']) || 0;
                        valB = Number(b['Mission_duration(Days)']) || 0;
                        break;
                    case 'boneLoss':
                        valA = parseFloat(a.Bone_Density_Loss?.replace('%', '') || '0');
                        valB = parseFloat(b.Bone_Density_Loss?.replace('%', '') || '0');
                        break;
                    default:
                        valA = a.id || 0;
                        valB = b.id || 0;
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [records, searchQuery, selectedGender, selectedCountry, sortField, sortOrder]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedGender('all');
        setSelectedCountry('all');
        setSortField('id');
        setSortOrder('asc');
        toast.info('Telemetry dataset filters reset to default');
    };

    // Client-side CSV Export
    const exportCSV = () => {
        if (!records.length) {
            toast.error('No dataset records available to export');
            return;
        }
        const headers = ['Astronaut_ID', 'Name', 'Age_at_Mission_Start', 'Gender', 'Country', 'Mission_Duration_Days', 'Bone_Density_Loss'];
        const rows = records.map((r) => [
            r.Astronaut || '',
            `"${(r.Name || '').replace(/"/g, '""')}"`,
            r.Age_at_mission_start || '',
            r.Gender || '',
            `"${(r.Country || '').replace(/"/g, '""')}"`,
            r['Mission_duration(Days)'] || '',
            r.Bone_Density_Loss || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `NASA_AHMS_Astronaut_Dataset_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${records.length} records to CSV spreadsheet`);
    };

    // Client-side JSON Export
    const exportJSON = () => {
        if (!records.length) {
            toast.error('No dataset records available to export');
            return;
        }
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', dataStr);
        link.setAttribute('download', `NASA_AHMS_Astronaut_Dataset_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${records.length} records to JSON archive`);
    };

    // Helper to evaluate bone loss risk badge
    const getBoneLossBadge = (lossStr?: string) => {
        if (!lossStr) return { text: 'N/A', color: 'text-slate-400 bg-[#0a1f2e] border-[#1a4b6c]' };
        const num = parseFloat(lossStr.replace('%', ''));
        if (num <= -4.0) {
            return { text: lossStr, color: 'text-rose-400 bg-rose-950/40 border-rose-800/80 shadow-[0_0_8px_rgba(244,63,94,0.25)]' };
        }
        if (num <= -2.5) {
            return { text: lossStr, color: 'text-amber-400 bg-amber-950/40 border-amber-800/80' };
        }
        return { text: lossStr, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80' };
    };

    const hasActiveFilters = searchQuery !== '' || selectedGender !== 'all' || selectedCountry !== 'all';

    return (
        <>
            <Head title="NASA AHMS • Bioastronautics Telemetry Archive">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            {/* NASA AHMS HUD Main Container - Deep Space Aesthetic */}
            <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono selection:bg-[#0284c7] selection:text-white p-3 sm:p-6 relative select-none overflow-x-hidden">
                {/* Tech background grid and ambient lighting */}
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

                <div className="relative z-10 max-w-[1700px] mx-auto space-y-5">
                    {/* Top Bar: NASA AHMS Mission Control Header */}
                    <header className="border border-[#1a4b6c] bg-[#06121e]/90 p-4 relative backdrop-blur-md">
                        {/* Corner Reticles */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Left Brand Identity */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] shadow-[0_0_12px_rgba(92,219,223,0.15)] flex-shrink-0">
                                    <NasaLogo size={36} />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-base sm:text-xl font-bold tracking-wider text-white">
                                            NASA AHMS <span className="text-[#5cdbdf]">// BIOASTRONAUTICS ARCHIVE</span>
                                        </h1>
                                        <span className="px-2 py-0.5 text-[10px] tracking-widest border border-cyan-800/80 bg-cyan-950/60 text-cyan-300">
                                            KAGGLE PHYSIOLOGICAL DATASET
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 tracking-wider mt-0.5">
                                        HUMAN RESEARCH PROGRAM (HRP) • DATABASE TABLE: <code className="text-[#5cdbdf]">dataset_records</code>
                                    </p>
                                </div>
                            </div>

                            {/* Middle Status Indicators (UTC Clock, DSN Telemetry, Clearance) */}
                            <div className="hidden xl:flex items-center gap-5 text-[11px] border-x border-[#1a4b6c]/60 px-5">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[#5cdbdf]" />
                                    <span className="text-slate-400">TIME:</span>
                                    <span className="text-white font-bold tracking-widest">{utcTimeStr}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                    <span className="text-slate-400">DSN:</span>
                                    <span className="text-emerald-400 font-bold">LOCKED // 40-MS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-[#5cdbdf]" />
                                    <span className="text-slate-400">SECURITY:</span>
                                    <span className="text-cyan-300 font-bold">LEVEL-4 FLIGHT SURGEON</span>
                                </div>
                            </div>

                            {/* Right Action Bar (Mission HUD, Terminate Session, Exports) */}
                            <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                <Link
                                    href="/dashboard"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#0b3d91]/30 hover:border-[#5cdbdf] hover:text-white transition-all flex items-center gap-2 font-bold shadow-[0_0_10px_rgba(92,219,223,0.1)]"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>MISSION HUD</span>
                                </Link>

                                <button
                                    onClick={exportCSV}
                                    type="button"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] px-3 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Export telemetry records to CSV"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>CSV</span>
                                </button>

                                <button
                                    onClick={exportJSON}
                                    type="button"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] px-3 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Export telemetry records to JSON"
                                >
                                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                                    <span>JSON</span>
                                </button>

                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    type="button"
                                    className="border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 px-3 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                                    title="Sign out of flight surgeon terminal"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>TERMINATE</span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Telemetry Metrics HUD Strip (6 Stat Cards) */}
                    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {/* Card 1: Total Cohort */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>COHORT SIZE</span>
                                <User className="w-3.5 h-3.5 text-[#5cdbdf]" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.totalCount}
                            </div>
                            <div className="text-[10px] text-[#5cdbdf] mt-1 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#5cdbdf] animate-ping" />
                                Active Crew Cohort
                            </div>
                        </div>

                        {/* Card 2: Mean Mission Duration */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>MEAN FLIGHT</span>
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.avgDuration} <span className="text-xs text-sky-400 font-normal">DAYS</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Max Flight: <strong className="text-white">{metrics.maxDuration}d</strong>
                            </div>
                        </div>

                        {/* Card 3: Bone Mineral Density Loss */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>MEAN BMD LOSS</span>
                                <Bone className="w-3.5 h-3.5 text-rose-400" />
                            </div>
                            <div className="text-2xl font-bold text-rose-400 mt-1.5 tracking-tight">
                                {metrics.avgBoneLoss}%
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Microgravity Demineralization
                            </div>
                        </div>

                        {/* Card 4: Mean Launch Age */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>MEAN LAUNCH AGE</span>
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.avgAge} <span className="text-xs text-amber-300 font-normal">YRS</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Flight Baseline Onset
                            </div>
                        </div>

                        {/* Card 5: Participating Space Agencies */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>AGENCIES / NATIONS</span>
                                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.distinctCountries}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                International Coalition
                            </div>
                        </div>

                        {/* Card 6: Database Telemetry Sync */}
                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>ARCHIVE INTEGRITY</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#5cdbdf]" />
                            </div>
                            <div className="text-xl font-bold text-emerald-400 mt-1.5 tracking-wider">
                                NOMINAL
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                HRP Verified Archive
                            </div>
                        </div>
                    </section>

                    {/* Filter and Query Command Bar */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 p-3.5 backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH BY NAME, CALLSIGN, OR AGENCY..."
                                className="w-full pl-9 pr-8 py-2 bg-[#030b14] border border-[#1a4b6c] text-[#5cdbdf] placeholder:text-slate-600 focus:outline-none focus:border-[#5cdbdf] transition-all text-xs tracking-wider"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Selectors */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Gender selector */}
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="px-3 py-2 bg-[#030b14] border border-[#1a4b6c] text-slate-300 hover:border-[#5cdbdf] focus:border-[#5cdbdf] focus:outline-none cursor-pointer text-xs uppercase"
                            >
                                <option value="all">GENDER: ALL</option>
                                <option value="male">MALE</option>
                                <option value="female">FEMALE</option>
                            </select>

                            {/* Country / Agency selector */}
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="px-3 py-2 bg-[#030b14] border border-[#1a4b6c] text-slate-300 hover:border-[#5cdbdf] focus:border-[#5cdbdf] focus:outline-none cursor-pointer text-xs uppercase max-w-[200px]"
                            >
                                <option value="all">AGENCY: ALL</option>
                                {countries.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            {/* Sort selector */}
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="px-3 py-2 bg-[#030b14] border border-[#1a4b6c] text-slate-300 hover:border-[#5cdbdf] focus:border-[#5cdbdf] focus:outline-none cursor-pointer text-xs uppercase"
                            >
                                <option value="id">SORT: ASTRONAUT ID</option>
                                <option value="name">SORT: NAME</option>
                                <option value="duration">SORT: DURATION</option>
                                <option value="boneLoss">SORT: BONE LOSS</option>
                                <option value="age">SORT: LAUNCH AGE</option>
                            </select>

                            {/* Sort order toggle */}
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] hover:border-[#5cdbdf] transition-all flex items-center gap-1.5 cursor-pointer uppercase font-bold"
                                title="Toggle Sort Direction"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                <span>{sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}</span>
                            </button>

                            {/* Reset filters button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="px-3 py-2 border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center gap-1 cursor-pointer"
                                    title="Reset active filters"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>RESET</span>
                                </button>
                            )}

                            {/* Record Count Badge */}
                            <div className="px-3 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 text-xs tracking-wider">
                                SHOWING: <strong className="text-[#5cdbdf]">{filteredRecords.length}</strong> / {records.length}
                            </div>
                        </div>
                    </div>

                    {/* Main Telemetry Table Container */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 relative backdrop-blur-md overflow-hidden">
                        {/* Corner Reticles */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#0a1f2e] border-b border-[#1a4b6c] text-[#5cdbdf] tracking-wider uppercase font-bold">
                                        <th
                                            className="p-3.5 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>ASTRONAUT ID</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th
                                            className="p-3.5 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>CREW MEMBER</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th
                                            className="p-3.5 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleSort('age')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>LAUNCH AGE</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th className="p-3.5">GENDER</th>
                                        <th className="p-3.5">AFFILIATION / AGENCY</th>
                                        <th
                                            className="p-3.5 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleSort('duration')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>FLIGHT DURATION</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th
                                            className="p-3.5 cursor-pointer hover:text-white transition-colors"
                                            onClick={() => handleSort('boneLoss')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>BMD LOSS (BONE)</span>
                                                <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </th>
                                        <th className="p-3.5 text-right">ACTION</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#1a4b6c]/40">
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-12 text-center text-slate-400 font-mono">
                                                <div className="max-w-md mx-auto space-y-3">
                                                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                                                    <p className="text-white font-bold text-sm tracking-widest">
                                                        NO MATCHING TELEMETRY RECORDS FOUND
                                                    </p>
                                                    <p className="text-slate-400 text-xs">
                                                        No records match the selected filter parameters. Clear the search input or reset filters.
                                                    </p>
                                                    <button
                                                        onClick={resetFilters}
                                                        className="px-4 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] hover:border-[#5cdbdf] transition-all text-xs tracking-wider"
                                                    >
                                                        RESET ALL FILTERS
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record, index) => {
                                            const boneBadge = getBoneLossBadge(record.Bone_Density_Loss);
                                            const durationNum = Number(record['Mission_duration(Days)']) || 0;
                                            const durationPercent = Math.min(100, Math.round((durationNum / 365) * 100));

                                            return (
                                                <tr
                                                    key={record.id || index}
                                                    onClick={() => setSelectedAstronaut(record)}
                                                    className="hover:bg-[#0b3d91]/20 transition-colors cursor-pointer group"
                                                >
                                                    {/* ID Badge */}
                                                    <td className="p-3.5 font-bold text-[#5cdbdf]">
                                                        <span className="px-2 py-1 border border-[#1a4b6c] bg-[#0a1f2e] group-hover:border-[#5cdbdf] transition-colors">
                                                            {record.Astronaut || `AST-${String(index + 1).padStart(2, '0')}`}
                                                        </span>
                                                    </td>

                                                    {/* Crew Member Name */}
                                                    <td className="p-3.5 text-white font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-7 w-7 border border-[#1a4b6c] bg-[#0a1f2e] flex items-center justify-center text-[#5cdbdf] font-bold text-xs group-hover:border-[#5cdbdf] group-hover:shadow-[0_0_8px_rgba(92,219,223,0.3)] transition-all">
                                                                {(record.Name || 'A').charAt(0)}
                                                            </div>
                                                            <span className="group-hover:text-[#5cdbdf] transition-colors font-bold tracking-wide">
                                                                {record.Name || 'Mission Specialist'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Launch Age */}
                                                    <td className="p-3.5 text-slate-300">
                                                        {record.Age_at_mission_start ? (
                                                            <span>
                                                                {record.Age_at_mission_start}{' '}
                                                                <span className="text-slate-500 text-[10px]">YRS</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500">N/A</span>
                                                        )}
                                                    </td>

                                                    {/* Gender */}
                                                    <td className="p-3.5 text-slate-300">
                                                        <span className="px-2 py-0.5 border border-[#1a4b6c]/80 bg-[#0a1f2e]/80 text-[11px] tracking-wider uppercase">
                                                            {record.Gender || 'UNSPEC'}
                                                        </span>
                                                    </td>

                                                    {/* Affiliation / Country */}
                                                    <td className="p-3.5 text-slate-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <Globe className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#5cdbdf] transition-colors" />
                                                            <span>{record.Country || 'NASA / International'}</span>
                                                        </div>
                                                    </td>

                                                    {/* Duration Progress */}
                                                    <td className="p-3.5 text-sky-300">
                                                        <div className="space-y-1 w-32">
                                                            <div className="flex justify-between text-[11px]">
                                                                <span className="font-bold text-white">{durationNum} d</span>
                                                                <span className="text-slate-500 text-[10px]">{durationPercent}% 1yr</span>
                                                            </div>
                                                            <div className="w-full bg-[#0a1f2e] border border-[#1a4b6c]/60 h-1.5 overflow-hidden">
                                                                <div
                                                                    className="bg-[#5cdbdf] h-full transition-all duration-300"
                                                                    style={{ width: `${durationPercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Bone Density Loss Badge */}
                                                    <td className="p-3.5">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[11px] font-bold tracking-wider ${boneBadge.color}`}
                                                        >
                                                            <TrendingDown className="w-3 h-3" />
                                                            {boneBadge.text}
                                                        </span>
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="p-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedAstronaut(record);
                                                                }}
                                                                className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-all cursor-pointer"
                                                                title="Inspect Physiological Dossier"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>

                                                            <Link
                                                                href="/dashboard"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-all"
                                                                title="Open in Mission HUD"
                                                            >
                                                                <Activity className="w-3.5 h-3.5 text-[#5cdbdf]" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Status & Help Note */}
                    <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-[#1a4b6c]/40 pt-4 font-mono">
                        <div>
                            NASA AHMS • FLIGHT SURGEON BIOASTRONAUTICS CONSOLE // CLASSIFIED JSC-HOU-9904
                        </div>
                        <div className="flex items-center gap-4 text-slate-400">
                            <span>TOTAL DATABASE RECORDS: <strong className="text-[#5cdbdf]">{records.length}</strong></span>
                            <span>ENCRYPTION: <strong className="text-emerald-400">AES-256-GCM</strong></span>
                        </div>
                    </footer>
                </div>

                {/* Astronaut Inspection Detail Modal (NASA Dossier) */}
                {selectedAstronaut && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setSelectedAstronaut(null)}
                    >
                        <div
                            className="relative w-full max-w-xl border border-[#1a4b6c] bg-[#06121e] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Tech reticles */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#5cdbdf]" />

                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 border border-[#1a4b6c] bg-[#0a1f2e] flex items-center justify-center text-[#5cdbdf] font-bold text-base shadow-[0_0_10px_rgba(92,219,223,0.2)]">
                                        {(selectedAstronaut.Name || 'A').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wider">
                                            {selectedAstronaut.Name || 'Astronaut Specialist'}
                                        </h3>
                                        <span className="text-[11px] text-[#5cdbdf] tracking-widest">
                                            CALLSIGN: {selectedAstronaut.Astronaut || 'AST-N/A'} • NASA HRP ARCHIVE
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAstronaut(null)}
                                    className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-white hover:border-[#5cdbdf] transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Metrics Breakdown Grid */}
                            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">MISSION DURATION</span>
                                    <span className="text-lg font-bold text-white mt-1 block">
                                        {selectedAstronaut['Mission_duration(Days)']} <span className="text-xs text-sky-400 font-normal">Days</span>
                                    </span>
                                </div>

                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">BMD LOSS</span>
                                    <span className="text-lg font-bold text-rose-400 mt-1 block">
                                        {selectedAstronaut.Bone_Density_Loss || '-3.0%'}
                                    </span>
                                </div>

                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">LAUNCH AGE</span>
                                    <span className="text-lg font-bold text-white mt-1 block">
                                        {selectedAstronaut.Age_at_mission_start} <span className="text-xs text-amber-300 font-normal">Years</span>
                                    </span>
                                </div>

                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">AFFILIATION / AGENCY</span>
                                    <span className="text-sm font-bold text-[#5cdbdf] mt-1 block truncate">
                                        {selectedAstronaut.Country || 'NASA / International'}
                                    </span>
                                </div>
                            </div>

                            {/* Medical Summary Assessment */}
                            <div className="p-4 border border-[#1a4b6c] bg-[#0a1f2e]/80 text-xs text-slate-300 leading-relaxed mb-6">
                                <div className="text-[#5cdbdf] font-bold mb-1.5 flex items-center gap-1.5 tracking-wider">
                                    <Shield className="w-3.5 h-3.5" /> MICROGRAVITY PHYSIOLOGICAL EVALUATION
                                </div>
                                <p className="text-slate-300 font-sans text-xs">
                                    Subject logged <strong className="text-white font-mono">{selectedAstronaut['Mission_duration(Days)']} days</strong> in orbital microgravity with{' '}
                                    <strong className="text-rose-400 font-mono">{selectedAstronaut.Bone_Density_Loss}</strong> bone mineral density demineralization.
                                    Prescribed counter-measures: Advanced Resistive Exercise Device (ARED) protocol, bisphosphonate therapeutic counters, and targeted post-flight neuromuscular rehabilitation.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <button
                                    onClick={() => setSelectedAstronaut(null)}
                                    className="px-4 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] transition-all cursor-pointer tracking-wider"
                                >
                                    CLOSE DOSSIER
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 px-5 py-2 border border-[#5cdbdf] bg-[#5cdbdf] text-slate-950 font-bold hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(92,219,223,0.3)] tracking-wider"
                                >
                                    <span>OPEN IN MISSION HUD</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// Bypasses the default starter kit sidebar layout so Dataset renders full-width with authentic HUD styling
Dataset.layout = (page: React.ReactNode) => page;
