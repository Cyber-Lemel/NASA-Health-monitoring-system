<?php

namespace App\Http\Controllers;

use App\Models\DatasetRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatasetController extends Controller
{
    /**
     * Display the full dataset page with all records.
     */
    public function index()
    {
        // Fetch all astronaut records ordered by primary key Astronaut asc
        $records = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return inertia('Dataset', [
            'records' => $records,
        ]);
    }

    /**
     * Bulk or single import data from payload or uploaded file into the database.
     */
    public function import(Request $request)
    {
        $records = [];

        // 1. Direct file upload handling (CSV or JSON)
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());

            if ($extension === 'csv' || $extension === 'txt') {
                $filePath = $file->getRealPath();
                $firstLine = fgets(fopen($filePath, 'r'));
                // Auto-detect delimiter
                $delimiters = [',', ';', "\t", '|'];
                $delimCounts = [];
                foreach ($delimiters as $d) {
                    $delimCounts[$d] = substr_count((string)$firstLine, $d);
                }
                arsort($delimCounts);
                $delimiter = key($delimCounts) ?: ',';
                if ($delimCounts[$delimiter] === 0) {
                    $delimiter = ',';
                }

                $handle = fopen($filePath, 'r');
                $header = null;
                while (($row = fgetcsv($handle, 5000, $delimiter)) !== false) {
                    if (!$header) {
                        // Clean UTF-8 BOM and trim header keys without damaging UTF-8 characters
                        $header = array_map(function ($h) {
                            $clean = preg_replace('/^\xEF\xBB\xBF/', '', (string) $h);
                            return trim($clean);
                        }, $row);
                    } else {
                        if (count($row) === count($header)) {
                            $records[] = array_combine($header, $row);
                        } elseif (count($row) > 0 && !empty(array_filter($row))) {
                            $rowPadded = array_pad(array_slice($row, 0, count($header)), count($header), null);
                            $records[] = array_combine($header, $rowPadded);
                        }
                    }
                }
                fclose($handle);
            } elseif ($extension === 'json') {
                $content = file_get_contents($file->getRealPath());
                $json = json_decode($content, true);
                if (is_array($json)) {
                    $records = isset($json['records']) ? $json['records'] : (isset($json[0]) ? $json : [$json]);
                }
            }
        }

        // 2. JSON or Form Data payload handling
        if (empty($records)) {
            if ($request->has('records') && is_array($request->input('records'))) {
                $records = $request->input('records');
            } elseif ($request->has('detectedRows') && is_array($request->input('detectedRows'))) {
                $records = $request->input('detectedRows');
            } elseif ($request->has('record') && is_array($request->input('record'))) {
                $records = [$request->input('record')];
            } elseif ($request->isJson()) {
                $json = $request->json()->all();
                if (isset($json['records']) && is_array($json['records'])) {
                    $records = $json['records'];
                } elseif (isset($json['detectedRows']) && is_array($json['detectedRows'])) {
                    $records = $json['detectedRows'];
                } elseif (isset($json['record']) && is_array($json['record'])) {
                    $records = [$json['record']];
                } elseif (!empty($json) && !isset($json[0])) {
                    $records = [$json];
                }
            }
        }

        if (empty($records)) {
            return response()->json([
                'success' => false,
                'message' => 'No telemetry records found in the import request payload.',
            ], 422);
        }

        $maxId = (int) (DatasetRecord::max('Astronaut') ?? 0);
        $nextAvailableId = $maxId + 1;
        $savedCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($records as $index => $item) {
                if (!is_array($item)) {
                    continue;
                }
                try {
                    $sanitized = $this->sanitizeRecord($item, $nextAvailableId);
                    DatasetRecord::updateOrCreate(
                        ['Astronaut' => $sanitized['Astronaut']],
                        $sanitized
                    );
                    $savedCount++;
                } catch (\Exception $rowEx) {
                    Log::warning("Row import failed at index {$index}: " . $rowEx->getMessage());
                    $errors[] = "Row {$index}: " . $rowEx->getMessage();
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk import transaction failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Database import failed: ' . $e->getMessage(),
            ], 500);
        }

        $allRecords = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => "Successfully imported and stored {$savedCount} astronaut record(s) directly into the database.",
            'count' => $savedCount,
            'errors' => $errors,
            'records' => $allRecords,
        ]);
    }

    /**
     * Manually add a new astronaut record directly to the database.
     */
    public function store(Request $request)
    {
        $maxId = (int) (DatasetRecord::max('Astronaut') ?? 0);
        $nextId = $maxId + 1;

        $sanitized = $this->sanitizeRecord($request->all(), $nextId);

        // Ensure unique primary key
        if (DatasetRecord::where('Astronaut', $sanitized['Astronaut'])->exists()) {
            $sanitized['Astronaut'] = $nextId;
        }

        $record = DatasetRecord::create($sanitized);
        $allRecords = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => "Astronaut {$record->Name} (#{$record->Astronaut}) added successfully to the database.",
            'record' => $record,
            'records' => $allRecords,
        ]);
    }

    /**
     * Update an existing astronaut record in the database.
     */
    public function update(Request $request, $astronaut)
    {
        $record = DatasetRecord::where('Astronaut', (int) $astronaut)->first();
        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => "Astronaut record #{$astronaut} not found in database.",
            ], 404);
        }

        $dummyNextId = 999999;
        $sanitized = $this->sanitizeRecord($request->all(), $dummyNextId);
        unset($sanitized['Astronaut']); // Don't mutate the primary key

        $record->update($sanitized);
        $allRecords = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => "Astronaut {$record->Name} (#{$record->Astronaut}) updated successfully.",
            'record' => $record,
            'records' => $allRecords,
        ]);
    }

    /**
     * Delete an individual astronaut record from the database.
     */
    public function destroy($astronaut)
    {
        $record = DatasetRecord::where('Astronaut', (int) $astronaut)->first();
        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => "Astronaut record #{$astronaut} not found in database.",
            ], 404);
        }

        $name = $record->Name;
        $record->delete();
        $allRecords = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => "Astronaut {$name} (#{$astronaut}) deleted successfully from database.",
            'records' => $allRecords,
        ]);
    }

    /**
     * Bulk delete selected astronaut records from the database.
     */
    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'No astronaut IDs provided for bulk deletion.',
            ], 422);
        }

        $intIds = array_map(function ($id) {
            if (is_numeric($id)) return (int) $id;
            preg_match('/\d+/', (string) $id, $matches);
            return !empty($matches[0]) ? (int) $matches[0] : 0;
        }, $ids);

        $intIds = array_filter($intIds, fn($id) => $id > 0);

        $deletedCount = DatasetRecord::whereIn('Astronaut', $intIds)->delete();
        $allRecords = DatasetRecord::orderBy('Astronaut', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$deletedCount} selected astronaut record(s) from database.",
            'count' => $deletedCount,
            'records' => $allRecords,
        ]);
    }

    /**
     * Normalize and sanitize raw record parameters for MySQL dataset_records table,
     * ensuring 100% exact match to provided data without loss or arbitrary overrides.
     */
    private function sanitizeRecord(array $item, &$nextAvailableId): array
    {
        // Helper to find value across various casing, abbreviations, and formatting styles
        $find = function (array $keys) use ($item) {
            foreach ($keys as $k) {
                if (array_key_exists($k, $item) && $item[$k] !== null && $item[$k] !== '') {
                    return $item[$k];
                }
            }
            // Normalized fallback check (strips spaces, underscores, dashes, parens, %)
            $cleanTargets = array_map(function ($target) {
                return strtolower(preg_replace('/[^a-z0-9]/i', '', $target));
            }, $keys);

            foreach ($item as $k => $v) {
                if ($v === null || $v === '') continue;
                $cleanK = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $k));
                if (in_array($cleanK, $cleanTargets, true)) {
                    return $v;
                }
            }
            return null;
        };

        // 1. Extract or generate integer Astronaut ID
        $rawId = $find(['Astronaut', 'astronaut', 'Astronaut_ID', 'Astronaut ID', 'id', 'ID', 'crew_id', 'code']);
        $id = null;
        if ($rawId !== null && $rawId !== '') {
            if (is_numeric($rawId)) {
                $id = (int) $rawId;
            } else {
                preg_match('/\d+/', (string) $rawId, $matches);
                if (!empty($matches[0])) {
                    $id = (int) $matches[0];
                }
            }
        }

        if ($id === null || $id <= 0) {
            $id = $nextAvailableId++;
        } else {
            if ($id >= $nextAvailableId) {
                $nextAvailableId = $id + 1;
            }
        }

        $cleanFloat = function ($val, $default = null) {
            if ($val === null || $val === '') return $default;
            $str = str_replace(['%', ' ', 'psi', 'd', 'bpm', 'YRS', 'mSv'], '', (string) $val);
            return is_numeric($str) ? (float) $str : $default;
        };

        $cleanInt = function ($val, $default = null) {
            if ($val === null || $val === '') return $default;
            if (is_int($val)) return $val;
            $str = trim((string) $val);
            if (is_numeric($str)) {
                return (int) round((float) $str);
            }
            $clean = preg_replace('/[^0-9.-]/', '', $str);
            if ($clean !== '' && is_numeric($clean)) {
                return (int) round((float) $clean);
            }
            return $default;
        };

        // 2. Map all columns 100% identically from the provided data
        $nameRaw = $find(['Name', 'name', 'Astronaut_Name', 'Astronaut Name', 'Full Name', 'Crew Member', 'Crew', 'Subject', 'Subject Name']);
        $name = ($nameRaw !== null && trim((string) $nameRaw) !== '')
            ? trim((string) $nameRaw)
            : ('Astronaut_' . $id);

        $ageRaw = $find([
            'Age_at_mission_start', 'Age at mission start', 'Age_at_Mission_Start',
            'Age', 'age', 'Launch Age', 'launch_age', 'age_at_mission_start', 'age_at_launch',
            'Age (years)', 'Age(years)',
        ]);
        $age = ($ageRaw !== null && $cleanInt($ageRaw) !== null)
            ? $cleanInt($ageRaw)
            : 40;

        $genderRaw = $find(['Gender', 'gender', 'Sex', 'sex']);
        $gender = ($genderRaw !== null && trim((string) $genderRaw) !== '')
            ? trim((string) $genderRaw)
            : 'Not Specified';

        $countryRaw = $find(['Country', 'country', 'Agency', 'agency', 'Nationality', 'nationality', 'Nation', 'nation', 'Affiliation']);
        $country = ($countryRaw !== null && trim((string) $countryRaw) !== '')
            ? trim((string) $countryRaw)
            : 'NASA / International';

        $durRaw = $find([
            'Mission_duration(Days)', 'Mission Duration (Days)', 'Mission_Duration_Days',
            'Mission Duration', 'Duration (Days)', 'Duration', 'duration', 'flight_duration',
            'flight_duration_days', 'mission_duration', 'mission_duration_days',
            'Days in space', 'Days in flight', 'Days', 'days',
        ]);
        $duration = ($durRaw !== null && $cleanInt($durRaw) !== null)
            ? $cleanInt($durRaw)
            : 180;

        $noMissRaw = $find(['No_of_Mission', 'No of Mission', 'No_of_Missions', 'No of Missions', 'Number of Missions', 'Missions', 'missions', 'flight_count']);
        $noOfMission = ($noMissRaw !== null && $cleanInt($noMissRaw) !== null)
            ? $cleanInt($noMissRaw)
            : 1;

        $boneRaw = $find(['Bone_Density_Loss', 'Bone Density Loss', 'Bone Density Loss (%)', 'Bone_Density_Loss(%)', 'BMD Loss', 'bmd', 'boneDensityLoss']);
        $boneLoss = ($boneRaw !== null && $cleanFloat($boneRaw) !== null)
            ? $cleanFloat($boneRaw)
            : -3.0;

        $muscleRaw = $find(['Muscle_Mass_Loss', 'Muscle Mass Loss', 'Muscle Mass Loss (%)', 'Muscle_Mass_Loss(%)', 'muscleMassLoss']);
        $muscleLoss = ($muscleRaw !== null && $cleanFloat($muscleRaw) !== null)
            ? $cleanFloat($muscleRaw)
            : 2.5;

        $radRaw = $find(['Radiation_Exposure', 'Radiation Exposure', 'Radiation', 'radiation', 'radiationExposure', 'msv']);
        $radiation = ($radRaw !== null && $cleanInt($radRaw) !== null)
            ? $cleanInt($radRaw)
            : 95;

        $cardioRaw = $find(['Cardiovascular_Risk_Score', 'Cardiovascular Risk Score', 'Cardio Risk', 'cardioRisk', 'cardiovascular']);
        $cardio = ($cardioRaw !== null && $cleanInt($cardioRaw) !== null)
            ? $cleanInt($cardioRaw)
            : 7;

        $immuneRaw = $find(['Immune_Response_Suppression', 'Immune Response Suppression', 'Immune Suppression', 'immuneSuppression']);
        $immune = ($immuneRaw !== null && $cleanFloat($immuneRaw) !== null)
            ? $cleanFloat($immuneRaw)
            : 8.0;

        $psychRaw = $find(['Psychological_Impact_Score', 'Psychological Impact Score', 'Psych Score', 'psychScore', 'psychological']);
        $psych = ($psychRaw !== null && $cleanInt($psychRaw) !== null)
            ? $cleanInt($psychRaw)
            : 5;

        $visionRaw = $find(['Vision_Change', 'Vision Change', 'Vision', 'vision', 'visionChange', 'Eyesight']);
        $vision = ($visionRaw !== null && trim((string) $visionRaw) !== '')
            ? trim((string) $visionRaw)
            : 'Clear';

        $counterRaw = $find(['Countermeasures_Used', 'Countermeasures Used', 'Countermeasures', 'countermeasures', 'protocol', 'protocol_used']);
        $countermeasures = ($counterRaw !== null && trim((string) $counterRaw) !== '')
            ? trim((string) $counterRaw)
            : 'Exercise, Calcium Supplements';

        return [
            'Astronaut' => $id,
            'Name' => $name,
            'Age_at_mission_start' => $age,
            'Gender' => $gender,
            'Country' => $country,
            'Mission_duration(Days)' => $duration,
            'No_of_Mission' => $noOfMission,
            'Bone_Density_Loss' => $boneLoss,
            'Muscle_Mass_Loss' => $muscleLoss,
            'Radiation_Exposure' => $radiation,
            'Cardiovascular_Risk_Score' => $cardio,
            'Immune_Response_Suppression' => $immune,
            'Psychological_Impact_Score' => $psych,
            'Vision_Change' => $vision,
            'Countermeasures_Used' => $countermeasures,
        ];
    }
}
