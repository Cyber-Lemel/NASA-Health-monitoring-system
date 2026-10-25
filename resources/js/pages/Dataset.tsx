import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Database, Download, Sparkles, User, Activity } from 'lucide-react';

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
    return (
        <>
            <Head title="NASA Health Dataset • Kaggle Telemetry Archive" />
            <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black p-4 sm:p-8">
                {/* Ambient glow backgrounds */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
                    <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                    {/* Header bar with Navigation */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-slate-300 transition hover:bg-slate-800 hover:text-white hover:border-slate-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                    <Database className="h-6 w-6 text-cyan-400" />
                                    <span>NASA Astronaut Health Dataset</span>
                                </h1>
                                <p className="text-xs font-mono text-slate-400 mt-0.5">
                                    Kaggle Spaceflight Physiological Archive // MySQL Table: <code className="text-cyan-300">dataset_records</code>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5">
                                Total Records: <strong className="text-cyan-400">{records.length}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-950/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-sans">
                                <thead>
                                    <tr className="border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400">
                                        <th className="p-3.5">Astronaut ID</th>
                                        <th className="p-3.5">Astronaut Name</th>
                                        <th className="p-3.5">Age at Launch</th>
                                        <th className="p-3.5">Gender</th>
                                        <th className="p-3.5">Country</th>
                                        <th className="p-3.5">Mission Duration</th>
                                        <th className="p-3.5">Bone Density Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 text-sm">
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-xs">
                                                No records found in database. Run <code className="text-cyan-400">php artisan db:seed --class=DatasetRecordSeeder</code> to seed data.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record, index) => (
                                            <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-3.5 font-mono text-xs text-cyan-300 font-semibold">
                                                    {record.Astronaut || `AST-${String(index + 1).padStart(2, '0')}`}
                                                </td>
                                                <td className="p-3.5 font-medium text-white flex items-center gap-2">
                                                    <span className="h-7 w-7 rounded-lg bg-sky-950 border border-sky-800/50 flex items-center justify-center text-sky-400 text-xs font-mono">
                                                        {(record.Name || 'A').charAt(0)}
                                                    </span>
                                                    <span>{record.Name}</span>
                                                </td>
                                                <td className="p-3.5 font-mono text-xs text-slate-300">
                                                    {record.Age_at_mission_start} yrs
                                                </td>
                                                <td className="p-3.5 text-xs text-slate-300">
                                                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 font-mono">
                                                        {record.Gender}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-mono text-xs text-slate-300">
                                                    {record.Country}
                                                </td>
                                                <td className="p-3.5 font-mono text-xs text-sky-300">
                                                    {record['Mission_duration(Days)']} days
                                                </td>
                                                <td className="p-3.5 font-mono text-xs font-semibold text-rose-400">
                                                    {record.Bone_Density_Loss}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}