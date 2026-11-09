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
    UserPlus,
    Edit3,
    Trash2,
    Activity,
    Shield,
    Sparkles,
    Calendar,
    Globe,
    Bone,
    FileSpreadsheet,
    FileCode,
    ChevronRight,
    RefreshCw,
    X,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Eye,
    LogOut,
    Radio,
    Upload,
    Check,
    CheckSquare,
    Square,
} from 'lucide-react';
import NasaLogo from '@/components/nasa-logo';
import TelemetryImportModal from '@/components/telemetry-import-modal';
import type { ParsedImportPayload } from '@/types/astronaut';
import { logout } from '@/routes';
import { toast } from 'sonner';

export interface DatasetRecordItem {
    id?: number;
    Astronaut?: string | number;
    Name?: string;
    Age_at_mission_start?: number;
    Gender?: string;
    Country?: string;
    'Mission_duration(Days)'?: number;
    No_of_Mission?: number;
    Bone_Density_Loss?: string | number;
    Muscle_Mass_Loss?: string | number;
    Radiation_Exposure?: number;
    Cardiovascular_Risk_Score?: number;
    Immune_Response_Suppression?: number;
    Psychological_Impact_Score?: number;
    Vision_Change?: string;
    Countermeasures_Used?: string;
}

interface DatasetProps {
    records: DatasetRecordItem[];
}

export default function Dataset({ records = [] }: DatasetProps) {
    // Local editable records state
    const [localRecords, setLocalRecords] = useState<DatasetRecordItem[]>(records);

    // Sync local records if Inertia server prop updates
    useEffect(() => {
        if (records && Array.isArray(records)) {
            setLocalRecords(records);
        }
    }, [records]);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGender, setSelectedGender] = useState<string>('all');
    const [selectedCountry, setSelectedCountry] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Selection state for bulk operations
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    // Modals
    const [selectedAstronaut, setSelectedAstronaut] = useState<DatasetRecordItem | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isManualAddOpen, setIsManualAddOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DatasetRecordItem | null>(null);
    const [deletingRecord, setDeletingRecord] = useState<DatasetRecordItem | null>(null);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for Manual Add
    const [manualForm, setManualForm] = useState({
        Astronaut: '',
        Name: '',
        Age_at_mission_start: 38,
        Gender: 'Male',
        Country: 'USA / NASA',
        'Mission_duration(Days)': 180,
        No_of_Mission: 1,
        Bone_Density_Loss: '-3.2%',
        Muscle_Mass_Loss: '2.5%',
        Radiation_Exposure: 95,
        Cardiovascular_Risk_Score: 6,
        Immune_Response_Suppression: 7.5,
        Psychological_Impact_Score: 4,
        Vision_Change: 'Clear',
        Countermeasures_Used: 'ARED Resistive Exercise, Bisphosphonates',
    });

    // Form state for Edit Record
    const [editForm, setEditForm] = useState({
        Astronaut: '' as string | number,
        Name: '',
        Age_at_mission_start: 40,
        Gender: 'Male',
        Country: 'USA / NASA',
        'Mission_duration(Days)': 180,
        No_of_Mission: 1,
        Bone_Density_Loss: '-3.0%',
        Muscle_Mass_Loss: '2.5%',
        Radiation_Exposure: 95,
        Cardiovascular_Risk_Score: 6,
        Immune_Response_Suppression: 7.5,
        Psychological_Impact_Score: 4,
        Vision_Change: 'Clear',
        Countermeasures_Used: 'ARED Resistive Exercise, Bisphosphonates',
    });

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

    // Close modals on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedAstronaut(null);
                setIsManualAddOpen(false);
                setIsEditModalOpen(false);
                setDeletingRecord(null);
                setIsBulkDeleteConfirmOpen(false);
                setIsImportModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Distinct countries for filter dropdown
    const countries = useMemo(() => {
        const set = new Set<string>();
        localRecords.forEach((r) => {
            if (r.Country) set.add(r.Country);
        });
        return Array.from(set).sort();
    }, [localRecords]);

    // Analytics metrics calculated from localRecords
    const metrics = useMemo(() => {
        if (!localRecords.length) {
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

        localRecords.forEach((r) => {
            const dur = Number(r['Mission_duration(Days)'] ?? (r as any).duration ?? (r as any).missionDurationDays ?? (r as any).Mission_duration) || 0;
            totalDuration += dur;
            if (dur > maxDuration) maxDuration = dur;

            const age = Number(r.Age_at_mission_start ?? (r as any).age ?? (r as any).Age) || 0;
            totalAge += age;

            if (r.Bone_Density_Loss !== undefined && r.Bone_Density_Loss !== null) {
                const numeric = parseFloat(String(r.Bone_Density_Loss).replace('%', ''));
                if (!isNaN(numeric)) {
                    totalBoneLoss += numeric;
                    validBoneLossCount++;
                }
            }
        });

        return {
            totalCount: localRecords.length,
            avgDuration: Math.round(totalDuration / localRecords.length),
            maxDuration,
            avgAge: +(totalAge / localRecords.length).toFixed(1),
            avgBoneLoss: validBoneLossCount > 0 ? +(totalBoneLoss / validBoneLossCount).toFixed(2) : -3.2,
            distinctCountries: countries.length || 1,
        };
    }, [localRecords, countries]);

    // Filter and sort records
    const filteredRecords = useMemo(() => {
        return localRecords
            .filter((item) => {
                const q = searchQuery.toLowerCase().trim();
                const idStr = String(item.Astronaut ?? item.id ?? '').toLowerCase();
                const nameStr = String(item.Name ?? '').toLowerCase();
                const countryStr = String(item.Country ?? '').toLowerCase();

                const matchesSearch = !q || nameStr.includes(q) || idStr.includes(q) || countryStr.includes(q);

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
                        valA = Number(a.Astronaut ?? a.id ?? 0);
                        valB = Number(b.Astronaut ?? b.id ?? 0);
                        break;
                    case 'name':
                        valA = a.Name || '';
                        valB = b.Name || '';
                        break;
                    case 'age':
                        valA = Number(a.Age_at_mission_start ?? (a as any).age ?? (a as any).Age) || 0;
                        valB = Number(b.Age_at_mission_start ?? (b as any).age ?? (b as any).Age) || 0;
                        break;
                    case 'duration':
                        valA = Number(a['Mission_duration(Days)'] ?? (a as any).duration ?? (a as any).missionDurationDays ?? (a as any).Mission_duration) || 0;
                        valB = Number(b['Mission_duration(Days)'] ?? (b as any).duration ?? (b as any).missionDurationDays ?? (b as any).Mission_duration) || 0;
                        break;
                    case 'boneLoss':
                        valA = parseFloat(String(a.Bone_Density_Loss || '0').replace('%', ''));
                        valB = parseFloat(String(b.Bone_Density_Loss || '0').replace('%', ''));
                        break;
                    default:
                        valA = Number(a.Astronaut ?? 0);
                        valB = Number(b.Astronaut ?? 0);
                }

                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
    }, [localRecords, searchQuery, selectedGender, selectedCountry, sortField, sortOrder]);

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

    // Selection handlers
    const isAllSelected =
        filteredRecords.length > 0 &&
        filteredRecords.every((r) => selectedIds.includes(r.Astronaut ?? r.id ?? ''));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            const currentIds = new Set(filteredRecords.map((r) => r.Astronaut ?? r.id ?? ''));
            setSelectedIds(selectedIds.filter((id) => !currentIds.has(id)));
        } else {
            const newSet = new Set(selectedIds);
            filteredRecords.forEach((r) => {
                const id = r.Astronaut ?? r.id;
                if (id !== undefined) newSet.add(id);
            });
            setSelectedIds(Array.from(newSet));
        }
    };

    const toggleSelectRow = (recordId: string | number) => {
        if (selectedIds.includes(recordId)) {
            setSelectedIds(selectedIds.filter((id) => id !== recordId));
        } else {
            setSelectedIds([...selectedIds, recordId]);
        }
    };

    // CSV / JSON Exporters
    const exportDataToCsv = (items: DatasetRecordItem[], filename: string) => {
        if (!items.length) {
            toast.error('No dataset records available to export');
            return;
        }
        const headers = [
            'Astronaut_ID',
            'Name',
            'Age_at_Mission_Start',
            'Gender',
            'Country',
            'Mission_Duration_Days',
            'Bone_Density_Loss',
            'Muscle_Mass_Loss',
            'Radiation_Exposure',
            'Cardiovascular_Risk_Score',
            'Immune_Response_Suppression',
            'Psychological_Impact_Score',
            'Vision_Change',
            'Countermeasures_Used',
        ];

        const rows = items.map((r) => [
            r.Astronaut ?? r.id ?? '',
            `"${(r.Name || '').replace(/"/g, '""')}"`,
            r.Age_at_mission_start ?? '',
            r.Gender ?? '',
            `"${(r.Country || '').replace(/"/g, '""')}"`,
            r['Mission_duration(Days)'] ?? '',
            r.Bone_Density_Loss ?? '',
            r.Muscle_Mass_Loss ?? '',
            r.Radiation_Exposure ?? '',
            r.Cardiovascular_Risk_Score ?? '',
            r.Immune_Response_Suppression ?? '',
            r.Psychological_Impact_Score ?? '',
            `"${(r.Vision_Change || '').replace(/"/g, '""')}"`,
            `"${(r.Countermeasures_Used || '').replace(/"/g, '""')}"`,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportDataToJson = (items: DatasetRecordItem[], filename: string) => {
        if (!items.length) {
            toast.error('No dataset records available to export');
            return;
        }
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', dataStr);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportAllCsv = () => {
        exportDataToCsv(filteredRecords, `NASA_AHMS_Full_Cohort_${Date.now()}.csv`);
        toast.success(`Exported ${filteredRecords.length} records to CSV`);
    };

    const exportAllJson = () => {
        exportDataToJson(filteredRecords, `NASA_AHMS_Full_Cohort_${Date.now()}.json`);
        toast.success(`Exported ${filteredRecords.length} records to JSON archive`);
    };

    const exportSelectedCsv = () => {
        const selectedItems = localRecords.filter((r) => selectedIds.includes(r.Astronaut ?? r.id ?? ''));
        exportDataToCsv(selectedItems, `NASA_AHMS_Selected_${selectedItems.length}_Crew_${Date.now()}.csv`);
        toast.success(`Exported ${selectedItems.length} selected records to CSV`);
    };

    const exportSelectedJson = () => {
        const selectedItems = localRecords.filter((r) => selectedIds.includes(r.Astronaut ?? r.id ?? ''));
        exportDataToJson(selectedItems, `NASA_AHMS_Selected_${selectedItems.length}_Crew_${Date.now()}.json`);
        toast.success(`Exported ${selectedItems.length} selected records to JSON`);
    };

    // Helper for BMD badge
    const getBoneLossBadge = (lossVal?: string | number) => {
        if (lossVal === undefined || lossVal === null || lossVal === '') {
            return { text: 'N/A', color: 'text-slate-400 bg-[#0a1f2e] border-[#1a4b6c]' };
        }
        const str = String(lossVal);
        const num = parseFloat(str.replace('%', ''));
        const display = str.includes('%') ? str : `${num}%`;

        if (num <= -4.0) {
            return { text: display, color: 'text-rose-400 bg-rose-950/40 border-rose-800/80 shadow-[0_0_8px_rgba(244,63,94,0.25)]' };
        }
        if (num <= -2.5) {
            return { text: display, color: 'text-amber-400 bg-amber-950/40 border-amber-800/80' };
        }
        return { text: display, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80' };
    };

    // API: Manual Add Astronaut
    const handleManualAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/dataset/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(manualForm),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to create astronaut record');
            }

            if (data.records) {
                setLocalRecords(data.records);
            } else if (data.record) {
                setLocalRecords((prev) => [...prev, data.record]);
            }
            toast.success(`Astronaut ${data.record?.Name || manualForm.Name} added directly to database!`);
            setIsManualAddOpen(false);
            setManualForm({
                Astronaut: '',
                Name: '',
                Age_at_mission_start: 38,
                Gender: 'Male',
                Country: 'USA / NASA',
                'Mission_duration(Days)': 180,
                No_of_Mission: 1,
                Bone_Density_Loss: '-3.2%',
                Muscle_Mass_Loss: '2.5%',
                Radiation_Exposure: 95,
                Cardiovascular_Risk_Score: 6,
                Immune_Response_Suppression: 7.5,
                Psychological_Impact_Score: 4,
                Vision_Change: 'Clear',
                Countermeasures_Used: 'ARED Resistive Exercise, Bisphosphonates',
            });
        } catch (err: any) {
            toast.error(err.message || 'Failed to add astronaut record');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (record: DatasetRecordItem) => {
        setEditingRecord(record);
        setEditForm({
            Astronaut: record.Astronaut ?? record.id ?? '',
            Name: record.Name || '',
            Age_at_mission_start: Number(record.Age_at_mission_start ?? (record as any).age ?? (record as any).Age) || 40,
            Gender: record.Gender || 'Male',
            Country: record.Country || 'NASA / International',
            'Mission_duration(Days)': Number(record['Mission_duration(Days)'] ?? (record as any).duration ?? (record as any).missionDurationDays ?? (record as any).Mission_duration) || 180,
            No_of_Mission: Number(record.No_of_Mission) || 1,
            Bone_Density_Loss: String(record.Bone_Density_Loss ?? '-3.0%'),
            Muscle_Mass_Loss: String(record.Muscle_Mass_Loss ?? '2.5%'),
            Radiation_Exposure: Number(record.Radiation_Exposure) || 95,
            Cardiovascular_Risk_Score: Number(record.Cardiovascular_Risk_Score) || 6,
            Immune_Response_Suppression: Number(record.Immune_Response_Suppression) || 7.5,
            Psychological_Impact_Score: Number(record.Psychological_Impact_Score) || 4,
            Vision_Change: record.Vision_Change || 'Clear',
            Countermeasures_Used: record.Countermeasures_Used || 'ARED Resistive Exercise, Bisphosphonates',
        });
        setIsEditModalOpen(true);
    };

    // API: Save Edit Record
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;
        setIsSubmitting(true);
        const astronautId = editingRecord.Astronaut ?? editingRecord.id;

        try {
            const res = await fetch(`/api/dataset/records/${astronautId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to update astronaut record');
            }

            if (data.records) {
                setLocalRecords(data.records);
            } else if (data.record) {
                setLocalRecords((prev) =>
                    prev.map((r) => ((r.Astronaut ?? r.id) === astronautId ? data.record : r))
                );
            }
            toast.success(`Astronaut ${data.record?.Name || editForm.Name} updated successfully`);
            setIsEditModalOpen(false);
            setEditingRecord(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update astronaut record');
        } finally {
            setIsSubmitting(false);
        }
    };

    // API: Delete Single Record
    const handleConfirmDelete = async () => {
        if (!deletingRecord) return;
        setIsSubmitting(true);
        const astronautId = deletingRecord.Astronaut ?? deletingRecord.id;

        try {
            const res = await fetch(`/api/dataset/records/${astronautId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                },
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete astronaut record');
            }

            if (data.records) {
                setLocalRecords(data.records);
            } else {
                setLocalRecords((prev) => prev.filter((r) => (r.Astronaut ?? r.id) !== astronautId));
            }
            setSelectedIds((prev) => prev.filter((id) => id !== astronautId));
            toast.success(`Astronaut ${deletingRecord.Name || astronautId} deleted from database`);
            setDeletingRecord(null);
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete record');
        } finally {
            setIsSubmitting(false);
        }
    };

    // API: Bulk Delete Selected Records
    const handleConfirmBulkDelete = async () => {
        if (!selectedIds.length) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/dataset/records/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to bulk-delete records');
            }

            if (data.records) {
                setLocalRecords(data.records);
            } else {
                const deletedSet = new Set(selectedIds);
                setLocalRecords((prev) => prev.filter((r) => !deletedSet.has(r.Astronaut ?? r.id ?? '')));
            }
            toast.success(`Successfully deleted ${data.count || selectedIds.length} astronaut record(s)`);
            setSelectedIds([]);
            setIsBulkDeleteConfirmOpen(false);
        } catch (err: any) {
            toast.error(err.message || 'Bulk deletion failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // API: Save Scan / Telemetry Import to Database
    const handleSaveImportToDatabase = async (data: ParsedImportPayload) => {
        const recordPayload = {
            Astronaut: data.astronautId,
            Name: data.name,
            Age_at_mission_start: data.age,
            Gender: data.gender,
            Country: data.country,
            'Mission_duration(Days)': data.missionDurationDays,
            No_of_Mission: data.noOfMission,
            Bone_Density_Loss: data.boneDensityLoss,
            Muscle_Mass_Loss: data.muscleMassLoss,
            Radiation_Exposure: data.radiationExposure,
            Cardiovascular_Risk_Score: data.cardioRisk,
            Immune_Response_Suppression: data.immuneSuppression,
            Psychological_Impact_Score: data.psychScore,
            Vision_Change: data.vision,
            Countermeasures_Used: data.countermeasures,
            ...(data.rawRecord || {}),
        };

        const payload =
            data.detectedRows && data.detectedRows.length > 0
                ? { detectedRows: data.detectedRows }
                : { record: recordPayload };

        const res = await fetch('/api/dataset/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const resJson = await res.json();
        if (!res.ok || !resJson.success) {
            throw new Error(resJson.message || 'Database import failed');
        }

        if (resJson.records) {
            setLocalRecords(resJson.records);
        }
        toast.success(`Database updated: ${resJson.count || 1} astronaut record(s) saved directly!`);
    };

    const hasActiveFilters = searchQuery !== '' || selectedGender !== 'all' || selectedCountry !== 'all';

    return (
        <>
            <Head title="NASA AHMS • Bioastronautics Telemetry Archive">
                <link rel="icon" href="/favicon.svg?v=nasa" type="image/svg+xml" />
            </Head>

            {/* NASA AHMS HUD Main Container */}
            <div className="min-h-screen bg-[#030b14] text-[#5cdbdf] font-mono selection:bg-[#0284c7] selection:text-white p-3 sm:p-6 relative select-none overflow-x-hidden">
                {/* Background Tech Gradients */}
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
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Brand Identity */}
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
                                            MYSQL DATABASE: <code className="text-[#5cdbdf]">dataset_records</code>
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 tracking-wider mt-0.5">
                                        HUMAN RESEARCH PROGRAM (HRP) • FULL CRUD • BULK IMPORT • ASTRONAUT ROSTER SYNC
                                    </p>
                                </div>
                            </div>

                            {/* Middle Status Indicators */}
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
                                    <span className="text-slate-400">STATUS:</span>
                                    <span className="text-cyan-300 font-bold">FLIGHT SURGEON ACTIVE</span>
                                </div>
                            </div>

                            {/* Action Buttons: Manual Add, Scan Import, Mission HUD, Exports */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setIsManualAddOpen(true)}
                                    className="border border-[#5cdbdf] bg-[#5cdbdf]/15 text-[#5cdbdf] hover:bg-[#5cdbdf] hover:text-[#030b14] px-3.5 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-[0_0_12px_rgba(92,219,223,0.2)]"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>MANUAL ADD</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="border border-emerald-500/80 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3.5 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>SCAN / IMPORT</span>
                                </button>

                                <Link
                                    href="/dashboard"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] px-3.5 py-2 text-xs tracking-widest uppercase hover:bg-[#0b3d91]/30 hover:border-[#5cdbdf] hover:text-white transition-all flex items-center gap-1.5 font-bold shadow-[0_0_10px_rgba(92,219,223,0.1)]"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>MISSION HUD</span>
                                </Link>

                                <button
                                    onClick={exportAllCsv}
                                    type="button"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] px-2.5 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                                    title="Export all cohort records to CSV"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>CSV</span>
                                </button>

                                <button
                                    onClick={exportAllJson}
                                    type="button"
                                    className="border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 hover:text-white hover:border-[#5cdbdf] px-2.5 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                                    title="Export all cohort records to JSON"
                                >
                                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                                    <span>JSON</span>
                                </button>

                                <Link
                                    href={logout()}
                                    method="post"
                                    as="button"
                                    type="button"
                                    className="border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 px-2.5 py-2 text-xs tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                                    title="Sign out"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>EXIT</span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Stat Metrics Strip */}
                    <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
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
                                Active Database Records
                            </div>
                        </div>

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

                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>MEAN LAUNCH AGE</span>
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.avgAge} <span className="text-xs text-amber-300 font-normal">YRS</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Baseline Mission Onset
                            </div>
                        </div>

                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>AGENCIES / NATIONS</span>
                                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                                {metrics.distinctCountries}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                International Roster
                            </div>
                        </div>

                        <div className="border border-[#1a4b6c] bg-[#06121e]/80 p-3.5 relative">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                                <span>SELECTED DATA</span>
                                <CheckSquare className="w-3.5 h-3.5 text-[#5cdbdf]" />
                            </div>
                            <div className="text-2xl font-bold text-[#5cdbdf] mt-1.5 tracking-wider">
                                {selectedIds.length} <span className="text-xs text-slate-400 font-normal">ROWS</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Ready for Bulk Ops
                            </div>
                        </div>
                    </section>

                    {/* Bulk Selection Action Bar - Appears when 1+ rows are checked */}
                    {selectedIds.length > 0 && (
                        <div className="border-2 border-[#5cdbdf] bg-[#0a1f2e] p-3.5 shadow-[0_0_20px_rgba(92,219,223,0.3)] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 bg-[#5cdbdf] text-[#030b14] font-bold text-xs uppercase tracking-wider">
                                    {selectedIds.length} RECORD{selectedIds.length > 1 ? 'S' : ''} SELECTED
                                </span>
                                <span className="text-xs text-slate-300">
                                    Perform bulk operations on chosen astronaut records
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={exportSelectedCsv}
                                    className="flex items-center gap-1.5 border border-emerald-500 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 px-3 py-1.5 text-xs transition-colors cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>EXPORT SELECTED (CSV)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={exportSelectedJson}
                                    className="flex items-center gap-1.5 border border-amber-500 bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 px-3 py-1.5 text-xs transition-colors cursor-pointer"
                                >
                                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                                    <span>EXPORT SELECTED (JSON)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsBulkDeleteConfirmOpen(true)}
                                    className="flex items-center gap-1.5 border border-red-500 bg-red-950/80 text-red-300 hover:bg-red-600 hover:text-white px-3 py-1.5 text-xs transition-colors cursor-pointer font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>BULK DELETE ({selectedIds.length})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedIds([])}
                                    className="flex items-center gap-1 border border-slate-700 bg-slate-900 text-slate-400 hover:text-white px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>CLEAR</span>
                                </button>
                            </div>
                        </div>
                    )}

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
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="px-3 py-2 bg-[#030b14] border border-[#1a4b6c] text-slate-300 hover:border-[#5cdbdf] focus:border-[#5cdbdf] focus:outline-none cursor-pointer text-xs uppercase"
                            >
                                <option value="all">GENDER: ALL</option>
                                <option value="male">MALE</option>
                                <option value="female">FEMALE</option>
                            </select>

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

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] hover:border-[#5cdbdf] transition-all flex items-center gap-1.5 cursor-pointer uppercase font-bold"
                                title="Toggle Sort Direction"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5" />
                                <span>{sortOrder === 'asc' ? 'ASC ▲' : 'DESC ▼'}</span>
                            </button>

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

                            <div className="px-3 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-300 text-xs tracking-wider">
                                SHOWING: <strong className="text-[#5cdbdf]">{filteredRecords.length}</strong> / {localRecords.length}
                            </div>
                        </div>
                    </div>

                    {/* Main Telemetry Table Container */}
                    <div className="border border-[#1a4b6c] bg-[#06121e]/90 relative backdrop-blur-md overflow-hidden">
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#5cdbdf]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#5cdbdf]" />

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[#0a1f2e] border-b border-[#1a4b6c] text-[#5cdbdf] tracking-wider uppercase font-bold">
                                        {/* Selection Checkbox */}
                                        <th className="p-3.5 w-10 text-center">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAll}
                                                className="p-1 hover:text-white transition-colors cursor-pointer"
                                                title={isAllSelected ? 'Deselect all visible rows' : 'Select all visible rows'}
                                            >
                                                {isAllSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-[#5cdbdf]" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-500" />
                                                )}
                                            </button>
                                        </th>
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
                                        <th className="p-3.5 text-right">ACTIONS</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#1a4b6c]/40">
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-12 text-center text-slate-400 font-mono">
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
                                                        className="px-4 py-2 border border-[#1a4b6c] bg-[#0a1f2e] text-[#5cdbdf] hover:border-[#5cdbdf] transition-all text-xs tracking-wider cursor-pointer"
                                                    >
                                                        RESET ALL FILTERS
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record, index) => {
                                            const recordId = record.Astronaut ?? record.id ?? index;
                                            const isSelected = selectedIds.includes(recordId);
                                            const boneBadge = getBoneLossBadge(record.Bone_Density_Loss);
                                            const durationNum = Number(record['Mission_duration(Days)'] ?? (record as any).duration ?? (record as any).missionDurationDays ?? (record as any).Mission_duration) || 0;
                                            const durationPercent = Math.min(100, Math.round((durationNum / 365) * 100));
                                            const ageNum = record.Age_at_mission_start ?? (record as any).age ?? (record as any).Age;

                                            return (
                                                <tr
                                                    key={recordId}
                                                    onClick={() => setSelectedAstronaut(record)}
                                                    className={`hover:bg-[#0b3d91]/20 transition-colors cursor-pointer group ${
                                                        isSelected ? 'bg-[#5cdbdf]/10 border-l-2 border-l-[#5cdbdf]' : ''
                                                    }`}
                                                >
                                                    {/* Row Checkbox */}
                                                    <td
                                                        className="p-3.5 text-center"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSelectRow(recordId)}
                                                            className="p-1 hover:text-white transition-colors cursor-pointer"
                                                            title={isSelected ? 'Deselect row' : 'Select row'}
                                                        >
                                                            {isSelected ? (
                                                                <CheckSquare className="w-4 h-4 text-[#5cdbdf]" />
                                                            ) : (
                                                                <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                                                            )}
                                                        </button>
                                                    </td>

                                                    {/* ID Badge */}
                                                    <td className="p-3.5 font-bold text-[#5cdbdf]">
                                                        <span className="px-2 py-1 border border-[#1a4b6c] bg-[#0a1f2e] group-hover:border-[#5cdbdf] transition-colors">
                                                            {record.Astronaut !== undefined
                                                                ? `AST-${record.Astronaut}`
                                                                : `AST-${String(index + 1).padStart(2, '0')}`}
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
                                                        {ageNum ? (
                                                            <span>
                                                                {ageNum}{' '}
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

                                                    {/* Action Buttons: Inspect, Edit, Delete, HUD */}
                                                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedAstronaut(record)}
                                                                className="p-1.5 border border-[#1a4b6c] bg-[#0a1f2e] text-slate-400 hover:text-[#5cdbdf] hover:border-[#5cdbdf] transition-all cursor-pointer"
                                                                title="Inspect Physiological Dossier"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEdit(record)}
                                                                className="p-1.5 border border-sky-800/80 bg-sky-950/40 text-sky-400 hover:text-white hover:border-sky-400 transition-all cursor-pointer"
                                                                title="Edit Astronaut Telemetry Record"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingRecord(record)}
                                                                className="p-1.5 border border-red-900/60 bg-red-950/40 text-red-400 hover:text-white hover:border-red-500 transition-all cursor-pointer"
                                                                title="Delete Astronaut Record from Database"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>

                                                            <Link
                                                                href="/dashboard"
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
                            <span>TOTAL DATABASE RECORDS: <strong className="text-[#5cdbdf]">{localRecords.length}</strong></span>
                            <span>SYNC ENGINE: <strong className="text-emerald-400">MYSQL ATOMIC</strong></span>
                        </div>
                    </footer>
                </div>

                {/* MODAL 1: Manual Add Astronaut Modal */}
                {isManualAddOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setIsManualAddOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-2xl border border-[#1a4b6c] bg-[#06121e] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono max-h-[92vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#5cdbdf]" />

                            <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-3 mb-4 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 border border-[#5cdbdf]/40 bg-[#5cdbdf]/10 text-[#5cdbdf]">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wider">
                                            MANUAL ADD ASTRONAUT RECORD
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                            Inserts record directly into MySQL <code className="text-[#5cdbdf]">dataset_records</code>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsManualAddOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleManualAddSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            ASTRONAUT ID (LEAVE BLANK FOR AUTO-INCREMENT)
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.Astronaut}
                                            onChange={(e) => setManualForm({ ...manualForm, Astronaut: e.target.value })}
                                            placeholder="e.g. 76 (or auto)"
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            CREW MEMBER NAME *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={manualForm.Name}
                                            onChange={(e) => setManualForm({ ...manualForm, Name: e.target.value })}
                                            placeholder="e.g. CDR. Sarah Connor"
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            LAUNCH AGE
                                        </label>
                                        <input
                                            type="number"
                                            value={manualForm.Age_at_mission_start}
                                            onChange={(e) =>
                                                setManualForm({
                                                    ...manualForm,
                                                    Age_at_mission_start: parseInt(e.target.value) || 40,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            GENDER
                                        </label>
                                        <select
                                            value={manualForm.Gender}
                                            onChange={(e) => setManualForm({ ...manualForm, Gender: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf] uppercase"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            AGENCY / COUNTRY
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.Country}
                                            onChange={(e) => setManualForm({ ...manualForm, Country: e.target.value })}
                                            placeholder="e.g. USA / NASA, ESA, JAXA"
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            MISSION DURATION (DAYS)
                                        </label>
                                        <input
                                            type="number"
                                            value={manualForm['Mission_duration(Days)']}
                                            onChange={(e) =>
                                                setManualForm({
                                                    ...manualForm,
                                                    'Mission_duration(Days)': parseInt(e.target.value) || 180,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            BONE MINERAL DENSITY LOSS (%)
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.Bone_Density_Loss}
                                            onChange={(e) =>
                                                setManualForm({ ...manualForm, Bone_Density_Loss: e.target.value })
                                            }
                                            placeholder="-3.2%"
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            MUSCLE MASS LOSS (%)
                                        </label>
                                        <input
                                            type="text"
                                            value={manualForm.Muscle_Mass_Loss}
                                            onChange={(e) =>
                                                setManualForm({ ...manualForm, Muscle_Mass_Loss: e.target.value })
                                            }
                                            placeholder="2.5%"
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            RADIATION EXPOSURE (MSV)
                                        </label>
                                        <input
                                            type="number"
                                            value={manualForm.Radiation_Exposure}
                                            onChange={(e) =>
                                                setManualForm({
                                                    ...manualForm,
                                                    Radiation_Exposure: parseInt(e.target.value) || 95,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            CARDIO RISK SCORE (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            value={manualForm.Cardiovascular_Risk_Score}
                                            onChange={(e) =>
                                                setManualForm({
                                                    ...manualForm,
                                                    Cardiovascular_Risk_Score: parseInt(e.target.value) || 6,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1">
                                        COUNTERMEASURES PROTOCOL
                                    </label>
                                    <input
                                        type="text"
                                        value={manualForm.Countermeasures_Used}
                                        onChange={(e) =>
                                            setManualForm({ ...manualForm, Countermeasures_Used: e.target.value })
                                        }
                                        className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a4b6c]">
                                    <button
                                        type="button"
                                        onClick={() => setIsManualAddOpen(false)}
                                        className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-5 py-2 border border-[#5cdbdf] bg-[#5cdbdf] text-[#030b14] font-bold hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{isSubmitting ? 'SAVING...' : 'SAVE RECORD TO DATABASE'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Edit Astronaut Record Modal */}
                {isEditModalOpen && editingRecord && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-2xl border border-[#1a4b6c] bg-[#06121e] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono max-h-[92vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#5cdbdf]" />

                            <div className="flex items-center justify-between border-b border-[#1a4b6c] pb-3 mb-4 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 border border-sky-400/40 bg-sky-950/60 text-sky-400">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wider">
                                            EDIT ASTRONAUT RECORD // ID: {editingRecord.Astronaut ?? editingRecord.id}
                                        </h3>
                                        <p className="text-[11px] text-slate-400">
                                            Updating telemetry in MySQL <code className="text-[#5cdbdf]">dataset_records</code>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            ASTRONAUT ID (PRIMARY KEY)
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            value={editForm.Astronaut}
                                            className="w-full bg-[#030b14] border border-[#1a4b6c]/60 px-3 py-1.5 text-slate-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            CREW MEMBER NAME *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.Name}
                                            onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            LAUNCH AGE
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.Age_at_mission_start}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    Age_at_mission_start: parseInt(e.target.value) || 40,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            GENDER
                                        </label>
                                        <select
                                            value={editForm.Gender}
                                            onChange={(e) => setEditForm({ ...editForm, Gender: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf] uppercase"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            AGENCY / COUNTRY
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.Country}
                                            onChange={(e) => setEditForm({ ...editForm, Country: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            MISSION DURATION (DAYS)
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm['Mission_duration(Days)']}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    'Mission_duration(Days)': parseInt(e.target.value) || 180,
                                                })
                                            }
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            BONE MINERAL DENSITY LOSS
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.Bone_Density_Loss}
                                            onChange={(e) => setEditForm({ ...editForm, Bone_Density_Loss: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-slate-400 mb-1">
                                            MUSCLE MASS LOSS
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.Muscle_Mass_Loss}
                                            onChange={(e) => setEditForm({ ...editForm, Muscle_Mass_Loss: e.target.value })}
                                            className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1">
                                        COUNTERMEASURES PROTOCOL
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.Countermeasures_Used}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, Countermeasures_Used: e.target.value })
                                        }
                                        className="w-full bg-[#0a1f2e] border border-[#1a4b6c] px-3 py-1.5 text-white focus:outline-none focus:border-[#5cdbdf]"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a4b6c]">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-5 py-2 border border-sky-400 bg-sky-500 text-[#030b14] font-bold hover:brightness-110 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{isSubmitting ? 'UPDATING...' : 'SAVE CHANGES TO DATABASE'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 3: Delete Record Confirmation */}
                {deletingRecord && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setDeletingRecord(null)}
                    >
                        <div
                            className="relative w-full max-w-md border border-red-800/80 bg-[#06121e] p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden font-mono text-xs space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle className="w-6 h-6 shrink-0" />
                                <h3 className="text-base font-bold text-white tracking-wider">
                                    CONFIRM RECORD DELETION
                                </h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                Are you sure you want to permanently remove astronaut record{' '}
                                <strong className="text-white">
                                    {deletingRecord.Name} (AST-{deletingRecord.Astronaut ?? deletingRecord.id})
                                </strong>{' '}
                                from the MySQL database? This action is irreversible.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDeletingRecord(null)}
                                    className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-red-500 bg-red-600 text-white font-bold hover:bg-red-500 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? 'DELETING...' : 'DELETE PERMANENTLY'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 4: Bulk Delete Confirmation */}
                {isBulkDeleteConfirmOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setIsBulkDeleteConfirmOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-md border border-red-800/80 bg-[#06121e] p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden font-mono text-xs space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-red-400">
                                <Trash2 className="w-6 h-6 shrink-0" />
                                <h3 className="text-base font-bold text-white tracking-wider">
                                    CONFIRM BULK DELETION
                                </h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                You are about to permanently delete{' '}
                                <strong className="text-red-400 font-bold">
                                    {selectedIds.length} selected astronaut record(s)
                                </strong>{' '}
                                from the MySQL <code className="text-[#5cdbdf]">dataset_records</code> database table.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkDeleteConfirmOpen(false)}
                                    className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmBulkDelete}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-red-500 bg-red-600 text-white font-bold hover:bg-red-500 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{isSubmitting ? 'DELETING ALL...' : `DELETE ALL ${selectedIds.length} RECORDS`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 5: Telemetry Scan & Bulk Import Modal */}
                <TelemetryImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSaveToDatabase={handleSaveImportToDatabase}
                />

                {/* MODAL 6: Astronaut Inspection Detail Modal (NASA Dossier) */}
                {selectedAstronaut && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
                        onClick={() => setSelectedAstronaut(null)}
                    >
                        <div
                            className="relative w-full max-w-xl border border-[#1a4b6c] bg-[#06121e] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden font-mono"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#5cdbdf]" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#5cdbdf]" />

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
                                            CALLSIGN: AST-{selectedAstronaut.Astronaut ?? selectedAstronaut.id ?? 'N/A'} • NASA HRP ARCHIVE
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

                            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">MISSION DURATION</span>
                                    <span className="text-lg font-bold text-white mt-1 block">
                                        {selectedAstronaut['Mission_duration(Days)'] ?? (selectedAstronaut as any).duration ?? (selectedAstronaut as any).missionDurationDays ?? 180} <span className="text-xs text-sky-400 font-normal">Days</span>
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
                                        {selectedAstronaut.Age_at_mission_start ?? (selectedAstronaut as any).age ?? 40} <span className="text-xs text-amber-300 font-normal">Years</span>
                                    </span>
                                </div>

                                <div className="p-3 border border-[#1a4b6c] bg-[#0a1f2e]">
                                    <span className="text-slate-400 block text-[10px] tracking-wider">AFFILIATION / AGENCY</span>
                                    <span className="text-sm font-bold text-[#5cdbdf] mt-1 block truncate">
                                        {selectedAstronaut.Country || 'NASA / International'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 border border-[#1a4b6c] bg-[#0a1f2e]/80 text-xs text-slate-300 leading-relaxed mb-6">
                                <div className="text-[#5cdbdf] font-bold mb-1.5 flex items-center gap-1.5 tracking-wider">
                                    <Shield className="w-3.5 h-3.5" /> MICROGRAVITY PHYSIOLOGICAL EVALUATION
                                </div>
                                <p className="text-slate-300 font-sans text-xs">
                                    Subject logged <strong className="text-white font-mono">{selectedAstronaut['Mission_duration(Days)']} days</strong> in orbital microgravity with{' '}
                                    <strong className="text-rose-400 font-mono">{selectedAstronaut.Bone_Density_Loss}</strong> bone mineral density demineralization.
                                    Prescribed counter-measures: {selectedAstronaut.Countermeasures_Used || 'Advanced Resistive Exercise Device (ARED) protocol, bisphosphonate therapeutic counters, and targeted post-flight neuromuscular rehabilitation.'}
                                </p>
                            </div>

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

Dataset.layout = (page: React.ReactNode) => page;
