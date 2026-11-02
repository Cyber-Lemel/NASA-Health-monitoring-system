<?php

namespace App\Http\Controllers;

use App\Models\DatasetRecord;

use Illuminate\Http\Request;

class DatasetController extends Controller
{
    public function index()
    {
        // Fetch 50 rows from your manual phpMyAdmin table
        $records = DatasetRecord::take(50)->get();

        // Pass the data as a prop named 'records' to a React page named 'Dataset'
        return inertia('Dataset', [
            'records' => $records
        ]);
    }

    public function import(Request $request)
    {
        $records = $request->input('records', []);
        if (empty($records) && $request->has('record')) {
            $records = [$request->input('record')];
        }

        if (empty($records) && $request->isJson()) {
            $json = $request->json()->all();
            if (isset($json['records'])) {
                $records = $json['records'];
            } elseif (isset($json['record'])) {
                $records = [$json['record']];
            } elseif (!empty($json) && !isset($json[0])) {
                $records = [$json];
            }
        }

        $created = [];
        foreach ($records as $item) {
            $created[] = DatasetRecord::create([
                'Astronaut' => $item['Astronaut'] ?? $item['astronautId'] ?? 'AST-' . rand(20, 99),
                'Name' => $item['Name'] ?? $item['name'] ?? 'Mission Specialist',
                'Age_at_mission_start' => isset($item['Age_at_mission_start']) ? (int) $item['Age_at_mission_start'] : (isset($item['age']) ? (int) $item['age'] : 40),
                'Gender' => $item['Gender'] ?? $item['gender'] ?? 'Not Specified',
                'Country' => $item['Country'] ?? $item['country'] ?? 'NASA / International',
                'Mission_duration(Days)' => isset($item['Mission_duration(Days)']) ? (int) $item['Mission_duration(Days)'] : (isset($item['missionDurationDays']) ? (int) $item['missionDurationDays'] : 180),
                'Bone_Density_Loss' => $item['Bone_Density_Loss'] ?? $item['boneDensityLoss'] ?? '-3.0%',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' astronaut record(s) imported successfully.',
            'records' => DatasetRecord::all(),
        ]);
    }
}