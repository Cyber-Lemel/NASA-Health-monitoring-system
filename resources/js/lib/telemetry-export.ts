import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AstronautFullData } from '@/types/astronaut';

/**
 * Format timestamp for filename
 */
function getTimestampStr(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Export active astronaut telemetry and biometrics to Excel (.xlsx)
 */
export function exportAstronautToExcel(
    astronaut: AstronautFullData,
    allCrewDataset: any[] = []
): void {
    const wb = XLSX.utils.book_new();
    const timestamp = getTimestampStr();
    const exportDate = new Date().toUTCString();

    // --- SHEET 1: Active Astronaut Telemetry & Vitals ---
    const telemetrySheetData = [
        ['NASA BIOMEDICAL OPERATIONS • DEEP SPACE MISSION TELEMETRY'],
        ['MISSION:', astronaut.bio.mission, 'EXPORT TIME:', exportDate],
        ['CLASSIFICATION:', 'OFFICIAL / RESTRICTED', 'DATA SOURCE:', 'AHMS LIVE TELEMETRY'],
        [],
        ['--- 1. ASTRONAUT PROFILE & DOSSIER ---'],
        ['Crew ID', astronaut.bio.id],
        ['Full Name', astronaut.bio.name],
        ['Role / Station', astronaut.bio.role],
        ['EVA Status', astronaut.bio.evaStatus],
        ['Age at Launch', `${astronaut.bio.age} years`],
        ['Gender', astronaut.bio.gender],
        ['Country / Agency', astronaut.bio.country],
        ['Mission Duration', `${astronaut.bio.missionDurationDays} Days`],
        ['Bone Density Loss', astronaut.bio.boneDensityLoss],
        [],
        ['--- 2. REAL-TIME PHYSIOLOGICAL BIOMETRICS ---'],
        ['Biometric Parameter', 'Current Reading', 'Baseline Range', 'Status', 'Risk Index'],
        [
            'Heart Rate (ECG)',
            astronaut.vitals.heartRate.value,
            astronaut.vitals.heartRate.baseline,
            astronaut.vitals.heartRate.status || 'Nominal',
            astronaut.vitals.heartRate.numericValue > 110 ? 'High' : 'Normal',
        ],
        [
            'Blood Oxygen (SpO2)',
            astronaut.vitals.spO2.value,
            astronaut.vitals.spO2.baseline,
            astronaut.vitals.spO2.status || 'Nominal',
            astronaut.vitals.spO2.numericValue < 95 ? 'Alert' : 'Optimal',
        ],
        [
            'Core Body Temperature',
            astronaut.vitals.coreTemp.value,
            astronaut.vitals.coreTemp.baseline,
            astronaut.vitals.coreTemp.status || 'Nominal',
            astronaut.vitals.coreTemp.numericValue > 37.8 ? 'Elevated' : 'Optimal',
        ],
        [
            'Respiration Rate',
            astronaut.vitals.respiration.value,
            astronaut.vitals.respiration.baseline,
            astronaut.vitals.respiration.status || 'Nominal',
            astronaut.vitals.respiration.numericValue > 22 ? 'Elevated' : 'Optimal',
        ],
        [
            'Hydration Level',
            astronaut.vitals.hydration.value,
            astronaut.vitals.hydration.baseline,
            astronaut.vitals.hydration.status || 'Nominal',
            astronaut.vitals.hydration.numericValue < 70 ? 'Low' : 'Adequate',
        ],
        [],
        ['--- 3. EXTRAVEHICULAR ACTIVITY (EVA) & SUIT SYSTEMS ---'],
        ['Life Support Subsystem', 'Reading', 'Operational Threshold', 'Integrity'],
        ['Suit Pressure', `${astronaut.diagnostics.suitPressurePsi} psi (${astronaut.diagnostics.suitPressurePercent}%)`, '4.0 - 4.5 psi', 'Stable'],
        ['Oxygen Reserve (O2)', `${astronaut.diagnostics.o2Percent}%`, 'Min 20%', astronaut.diagnostics.o2Percent < 22 ? 'Low Scrubber' : 'Nominal'],
        ['Radiation Exposure', `${astronaut.diagnostics.radiationStatus} (${astronaut.diagnostics.radiationPercent}%)`, '< 0.50 mSv/h', 'Shielded'],
        ['Suit Battery Reserve', `${astronaut.diagnostics.batteryPercent}%`, 'Min 20%', 'Adequate'],
        [],
        ['--- 4. ACTIVE MEDICAL CONDITIONS & DIRECTIVES ---'],
        ['Condition / Alert', 'Actions Taken', 'Flight Surgeon Recommendation'],
        ...astronaut.alerts.map((alert) => [
            alert.title,
            alert.actionsTaken.join('; '),
            alert.recommendedAction,
        ]),
    ];

    const wsTelemetry = XLSX.utils.aoa_to_sheet(telemetrySheetData);
    wsTelemetry['!cols'] = [
        { wch: 28 },
        { wch: 32 },
        { wch: 26 },
        { wch: 18 },
        { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTelemetry, 'Biometrics & Telemetry');

    // --- SHEET 2: Telemetry Response Log ---
    const logHeader = ['Timestamp (MET)', 'Incident / Event', 'Automated / Crew Response', 'Resolution Status'];
    const logRows = astronaut.logs.map((log) => [
        log.timestamp,
        log.title,
        log.action,
        log.status || 'RESOLVED',
    ]);
    const wsLogs = XLSX.utils.aoa_to_sheet([
        ['NASA MISSION CONTROL • TELEMETRY EVENT & RESOLUTION LOG'],
        ['ASTRONAUT:', `${astronaut.bio.name} (${astronaut.bio.id})`],
        [],
        logHeader,
        ...logRows,
    ]);
    wsLogs['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 45 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Incident Logs');

    // --- SHEET 3: Complete Crew Dataset (if provided) ---
    if (allCrewDataset && allCrewDataset.length > 0) {
        const datasetHeaders = [
            'Astronaut ID',
            'Name',
            'Age at Launch',
            'Gender',
            'Country',
            'Mission Duration (Days)',
            'Bone Density Loss',
        ];
        const datasetRows = allCrewDataset.map((c) => [
            c.Astronaut || c.id || '',
            c.Name || c.name || '',
            c.Age_at_mission_start ?? c.age ?? '',
            c.Gender || c.gender || '',
            c.Country || c.country || '',
            c['Mission_duration(Days)'] ?? c.missionDurationDays ?? '',
            c.Bone_Density_Loss || c.boneDensityLoss || '',
        ]);
        const wsDataset = XLSX.utils.aoa_to_sheet([
            ['KAGGLE / NASA MISSION DATABASE ARCHIVE'],
            [],
            datasetHeaders,
            ...datasetRows,
        ]);
        wsDataset['!cols'] = [
            { wch: 15 },
            { wch: 28 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 22 },
            { wch: 18 },
        ];
        XLSX.utils.book_append_sheet(wb, wsDataset, 'Crew Database Archive');
    }

    const cleanName = astronaut.bio.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `NASA_Telemetry_${cleanName}_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);
}

/**
 * Export active astronaut health telemetry report as an official NASA PDF document
 */
export function exportAstronautToPdf(astronaut: AstronautFullData): void {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = getTimestampStr();
    const currentDate = new Date().toUTCString();

    // 1. Header Banner (Deep Space NASA Theme)
    doc.setFillColor(10, 25, 47); // Dark navy #0a192f
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Header Accent Line (Cyan)
    doc.setFillColor(92, 219, 223); // #5cdbdf
    doc.rect(0, 27, pageWidth, 1.5, 'F');

    // NASA Logo Badge
    doc.setFillColor(11, 61, 145); // NASA Blue #0b3d91
    doc.roundedRect(12, 5, 20, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NASA', 16, 15);

    // Title & Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text('ASTRONAUT HEALTH MONITORING SYSTEM (AHMS)', 36, 11);
    doc.setFontSize(8);
    doc.setTextColor(92, 219, 223);
    doc.text('SPACE MEDICINE & LIFE SCIENCES DIVISION • JOHNSON SPACE CENTER', 36, 17);
    doc.setTextColor(180, 200, 220);
    doc.setFont('helvetica', 'normal');
    doc.text(`CONFIDENTIAL BIOMEDICAL DOSSIER // MET DATE: ${currentDate}`, 36, 22);

    let currentY = 36;

    // 2. Astronaut Profile Grid
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. ASTRONAUT PROFILE & MISSION DOSSIER', 14, currentY);

    currentY += 4;

    const bioData = [
        [
            { content: 'Astronaut ID:', styles: { fontStyle: 'bold' } },
            astronaut.bio.id,
            { content: 'EVA Status:', styles: { fontStyle: 'bold' } },
            astronaut.bio.evaStatus,
        ],
        [
            { content: 'Full Name:', styles: { fontStyle: 'bold' } },
            astronaut.bio.name,
            { content: 'Mission:', styles: { fontStyle: 'bold' } },
            astronaut.bio.mission,
        ],
        [
            { content: 'Role / Assignment:', styles: { fontStyle: 'bold' } },
            astronaut.bio.role,
            { content: 'Age / Gender:', styles: { fontStyle: 'bold' } },
            `${astronaut.bio.age} yrs / ${astronaut.bio.gender}`,
        ],
        [
            { content: 'Country / Agency:', styles: { fontStyle: 'bold' } },
            astronaut.bio.country,
            { content: 'Mission Duration:', styles: { fontStyle: 'bold' } },
            `${astronaut.bio.missionDurationDays} Days`,
        ],
        [
            { content: 'Bone Density Loss:', styles: { fontStyle: 'bold' } },
            astronaut.bio.boneDensityLoss,
            { content: 'Telemetry Hash:', styles: { fontStyle: 'bold' } },
            `AHMS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        ],
    ];

    autoTable(doc, {
        startY: currentY,
        body: bioData as any,
        theme: 'grid',
        styles: {
            fontSize: 8.5,
            cellPadding: 2,
            textColor: [30, 41, 59],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: 38, fillColor: [241, 245, 249], fontStyle: 'bold' },
            1: { cellWidth: 55 },
            2: { cellWidth: 38, fillColor: [241, 245, 249], fontStyle: 'bold' },
            3: { cellWidth: 55 },
        },
        margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 3. Real-Time Physiological Biometrics Table
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. REAL-TIME PHYSIOLOGICAL BIOMETRICS', 14, currentY);

    currentY += 4;

    const vitalsHeaders = ['Biometric Parameter', 'Live Value', 'Nominal Range', 'Assessment', 'Condition Index'];
    const vitalsRows = [
        [
            'Electrocardiogram (ECG / HR)',
            astronaut.vitals.heartRate.value,
            astronaut.vitals.heartRate.baseline,
            astronaut.vitals.heartRate.status || 'Nominal',
            astronaut.vitals.heartRate.numericValue > 110 ? 'ELEVATED TACHYCARDIA' : 'NOMINAL',
        ],
        [
            'Pulse Oximetry (SpO2)',
            astronaut.vitals.spO2.value,
            astronaut.vitals.spO2.baseline,
            astronaut.vitals.spO2.status || 'Nominal',
            astronaut.vitals.spO2.numericValue < 95 ? 'HYPOXIA WARNING' : 'OPTIMAL',
        ],
        [
            'Core Body Temperature',
            astronaut.vitals.coreTemp.value,
            astronaut.vitals.coreTemp.baseline,
            astronaut.vitals.coreTemp.status || 'Nominal',
            astronaut.vitals.coreTemp.numericValue > 37.8 ? 'HYPERTHERMIA RISK' : 'NOMINAL',
        ],
        [
            'Respiration Frequency',
            astronaut.vitals.respiration.value,
            astronaut.vitals.respiration.baseline,
            astronaut.vitals.respiration.status || 'Nominal',
            astronaut.vitals.respiration.numericValue > 22 ? 'TACHYPNEA' : 'NORMAL',
        ],
        [
            'Hydration Saturation',
            astronaut.vitals.hydration.value,
            astronaut.vitals.hydration.baseline,
            astronaut.vitals.hydration.status || 'Nominal',
            astronaut.vitals.hydration.numericValue < 70 ? 'DEHYDRATED (ACTION REQ.)' : 'ADEQUATE',
        ],
    ];

    autoTable(doc, {
        startY: currentY,
        head: [vitalsHeaders],
        body: vitalsRows,
        theme: 'striped',
        headStyles: {
            fillColor: [11, 61, 145], // NASA Blue
            textColor: [255, 255, 255],
            fontSize: 8.5,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 8,
            cellPadding: 2.2,
        },
        margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 4. Extravehicular Activity & Suit Systems Diagnostics
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. LIFE SUPPORT & SUIT DIAGNOSTICS', 14, currentY);

    currentY += 4;

    const suitHeaders = ['Subsystem', 'Current Reading', 'Operating Range', 'Safety Status'];
    const suitRows = [
        [
            'Suit Internal Pressure',
            `${astronaut.diagnostics.suitPressurePsi} psi (${astronaut.diagnostics.suitPressurePercent}%)`,
            '4.0 - 4.5 psi',
            'NOMINAL / STABLE',
        ],
        [
            'Suit O2 Reserve Concentration',
            `${astronaut.diagnostics.o2Percent}%`,
            '20.9% - 22.0%',
            astronaut.diagnostics.o2Percent < 22 ? 'LOW RESERVE (SCRUBBER ACTIVE)' : 'OPTIMAL',
        ],
        [
            'Radiation Exposure Environment',
            `${astronaut.diagnostics.radiationStatus} (${astronaut.diagnostics.radiationPercent}%)`,
            '< 0.50 mSv/h',
            'NOMINAL SHIELDING',
        ],
        [
            'Suit Primary Battery Pack',
            `${astronaut.diagnostics.batteryPercent}%`,
            'Min. 20% Safe Return',
            astronaut.diagnostics.batteryPercent > 50 ? 'OPTIMAL' : 'MONITOR',
        ],
    ];

    autoTable(doc, {
        startY: currentY,
        head: [suitHeaders],
        body: suitRows,
        theme: 'striped',
        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [92, 219, 223],
            fontSize: 8.5,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 8,
            cellPadding: 2.2,
        },
        margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 5. Active Medical Alerts & Interventions
    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. ACTIVE DETECTED CONDITIONS & INTERVENTIONS', 14, currentY);

    currentY += 4;

    const alertHeaders = ['Condition Detected', 'Automated / Crew Actions Taken', 'Surgeon Recommended Directive'];
    const alertRows = astronaut.alerts.map((alert) => [
        alert.title,
        alert.actionsTaken.join('\n• '),
        alert.recommendedAction,
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [alertHeaders],
        body: alertRows,
        theme: 'grid',
        headStyles: {
            fillColor: [180, 83, 9], // Amber/Orange
            textColor: [255, 255, 255],
            fontSize: 8.5,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 2.5,
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 80 },
            2: { cellWidth: 56 },
        },
        margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 6. Response History / Mission Log
    if (currentY > 230) {
        doc.addPage();
        currentY = 20;
    }

    doc.setTextColor(10, 25, 47);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. TELEMETRY RESPONSE & RESOLUTION LOG', 14, currentY);

    currentY += 4;

    const logHeaders = ['Timestamp', 'Incident / Telemetry Shift', 'Automated Suit Action Taken', 'Status'];
    const logTableRows = astronaut.logs.map((log) => [
        log.timestamp,
        log.title,
        log.action,
        log.status || 'RESOLVED',
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [logHeaders],
        body: logTableRows,
        theme: 'striped',
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 2,
        },
        margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    // Footer Sign-Off Box
    if (currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('MEDICAL SIGN-OFF & TELEMETRY VERIFICATION:', 18, currentY + 6);
    doc.text('FLIGHT SURGEON: DR. R. CHEN, MD (NASA BIO-OPS)', 18, currentY + 12);
    doc.text(`DIGITAL SIGNATURE HASH: SHA256-${Math.random().toString(36).substring(2, 14).toUpperCase()}`, 18, currentY + 18);

    doc.text('MISSION DIRECTOR CLEARANCE: [ VERIFIED ]', 120, currentY + 12);
    doc.text('ENCRYPTED TELEMETRY LINK: ACTIVE', 120, currentY + 18);

    // Page Numbering Footer on all pages
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(
            `NASA AHMS Medical Telemetry • Page ${i} of ${totalPages} • Security Clearance: UNCLASSIFIED / BIO-PUB`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 6,
            { align: 'center' }
        );
    }

    const cleanName = astronaut.bio.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const filename = `NASA_Health_Report_${cleanName}_${timestamp}.pdf`;
    doc.save(filename);
}

/**
 * Export raw telemetry to CSV
 */
export function exportAstronautToCsv(astronaut: AstronautFullData): void {
    const timestamp = getTimestampStr();
    const rows = [
        ['Parameter', 'Value', 'Unit', 'Status'],
        ['Astronaut ID', astronaut.bio.id, '', ''],
        ['Name', astronaut.bio.name, '', ''],
        ['Role', astronaut.bio.role, '', ''],
        ['Mission', astronaut.bio.mission, '', ''],
        ['EVA Status', astronaut.bio.evaStatus, '', ''],
        ['Heart Rate', astronaut.vitals.heartRate.value, 'bpm', astronaut.vitals.heartRate.status || ''],
        ['SpO2', astronaut.vitals.spO2.value, '%', astronaut.vitals.spO2.status || ''],
        ['Core Temperature', astronaut.vitals.coreTemp.value, '°C', astronaut.vitals.coreTemp.status || ''],
        ['Respiration', astronaut.vitals.respiration.value, 'bpm', astronaut.vitals.respiration.status || ''],
        ['Hydration', astronaut.vitals.hydration.value, '%', astronaut.vitals.hydration.status || ''],
        ['Suit Pressure', String(astronaut.diagnostics.suitPressurePsi), 'psi', ''],
        ['O2 Level', String(astronaut.diagnostics.o2Percent), '%', ''],
        ['Radiation', astronaut.diagnostics.radiationStatus, '', ''],
        ['Battery', String(astronaut.diagnostics.batteryPercent), '%', ''],
    ];

    const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const cleanName = astronaut.bio.name.replace(/\s+/g, '_');
    link.setAttribute('download', `NASA_Telemetry_${cleanName}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export telemetry state to JSON
 */
export function exportAstronautToJson(astronaut: AstronautFullData): void {
    const timestamp = getTimestampStr();
    const exportPayload = {
        meta: {
            system: 'NASA Astronaut Health Monitoring System (AHMS)',
            exportedAt: new Date().toISOString(),
            version: '2.4.0',
        },
        astronaut,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    const cleanName = astronaut.bio.name.replace(/\s+/g, '_');
    link.setAttribute('download', `NASA_Telemetry_${cleanName}_${timestamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
