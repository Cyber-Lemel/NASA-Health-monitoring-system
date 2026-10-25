import React from 'react';

export default function Dataset({ records }) {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
                <h1 className="text-2xl font-bold mb-6 tracking-wider">NASA Health Dataset</h1>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20 text-gray-300">
                                <th className="p-3">Astronaut ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Age</th>
                                <th className="p-3">Gender</th>
                                <th className="p-3">Country</th>
                                <th className="p-3">Mission Duration (Days)</th>
                                <th className="p-3">Bone Density Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                    {/* These keys must match your DB columns exactly */}
                                    <td className="p-3">{record.Astronaut}</td>
                                    <td className="p-3">{record.Name}</td>
                                    <td className="p-3">{record.Age_at_mission_start}</td>
                                    <td className="p-3">{record.Gender}</td>
                                    <td className="p-3">{record.Country}</td>
                                    {/* Use bracket notation for columns with special characters like parenthesis */}
                                    <td className="p-3">{record['Mission_duration(Days)']}</td>
                                    <td className="p-3">{record.Bone_Density_Loss}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}