<?php

use App\Events\AstronautTelemetryUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DatasetController; // <-- ADD THIS LINE HERE

Route::get('/', function () {
    return inertia('welcome', [
        'initialTelemetry' => [
            'astronaut_id' => 'AST-01',
            'astronaut_name' => 'Commander Alex Vance',
            'role' => 'Mission Commander',
            'heart_rate' => 74,
            'oxygen_saturation' => 98.4,
            'core_temperature' => 37.0,
            'suit_pressure' => 101.3,
            'radiation_rate' => 0.215,
            'status' => 'Nominal',
            'mission_elapsed_time' => 'MET +14:08:32',
        ],
    ]);
})->name('home');

Route::post('/api/telemetry/ping', function (Request $request) {
    $astronautId = $request->input('astronaut_id', 'AST-00');
    $astronautName = $request->input('astronaut_name');
    $role = $request->input('role');

    if (!$astronautName) {
        $astronauts = [
            ['id' => 'AST-00', 'name' => 'CDR. Elena Rovani', 'role' => 'Mission Commander'],
            ['id' => 'AST-01', 'name' => 'Commander Alex Vance', 'role' => 'Mission Commander'],
            ['id' => 'AST-02', 'name' => 'Dr. Elena Rostova', 'role' => 'Payload Specialist'],
            ['id' => 'AST-03', 'name' => 'Major Marcus Cole', 'role' => 'Flight Engineer'],
        ];
        $found = collect($astronauts)->firstWhere('id', $astronautId);
        if ($found) {
            $astronautName = $found['name'];
            $role = $found['role'];
        } else {
            $dbRecord = \App\Models\DatasetRecord::where('Astronaut', $astronautId)->first();
            $astronautName = $dbRecord ? $dbRecord->Name : 'Mission Specialist';
            $role = 'Astronaut Specialist';
        }
    }

    $heartRate = (int) ($request->input('heart_rate') ?: rand(70, 138));
    $oxygen = (float) ($request->input('oxygen_saturation') ?: round(rand(955, 995) / 10, 1));
    $temp = (float) ($request->input('core_temperature') ?: round(rand(366, 384) / 10, 1));
    $pressure = (float) ($request->input('suit_pressure') ?: round(rand(41, 45) / 10, 1)); // 4.1 to 4.5 psi
    $radiation = (float) ($request->input('radiation_rate') ?: round(rand(180, 245) / 1000, 3));

    $status = $heartRate > 115 ? 'Elevated Activity' : ($heartRate > 100 ? 'Moderate Workload' : 'Nominal');

    $telemetry = [
        'astronaut_id' => $astronautId,
        'astronaut_name' => $astronautName,
        'role' => $role,
        'heart_rate' => $heartRate,
        'oxygen_saturation' => $oxygen,
        'core_temperature' => $temp,
        'suit_pressure' => $pressure,
        'radiation_rate' => $radiation,
        'status' => $status,
        'mission_elapsed_time' => 'MET +14:08:'.str_pad((string) rand(10, 59), 2, '0', STR_PAD_LEFT),
    ];

    event(new AstronautTelemetryUpdated($telemetry));

    return response()->json([
        'success' => true,
        'message' => 'Telemetry ping dispatched to Reverb WebSocket channel',
        'telemetry' => $telemetry,
    ]);
})->name('telemetry.ping');


// Route to preview / test the Flare (Ignition) error page
Route::get('/flare-demo', function () {
    throw new \Exception('Flare / Ignition Error Display Test: Telemetry and database error tracking is active.');
});

// NASA AI Chatbot endpoint (accessible across the entire system)
Route::post('/api/ai/chat', [App\Http\Controllers\ChatbotController::class, 'chat'])->name('ai.chat');

// Authenticated & verified routes (Kaggle Dataset protected from public access)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dataset', [DatasetController::class, 'index'])->name('dataset.index');
    Route::post('/api/dataset/import', [DatasetController::class, 'import'])->name('dataset.import');

    Route::get('dashboard', function () {
        $records = \App\Models\DatasetRecord::all();
        return inertia('dashboard', [
            'records' => $records,
        ]);
    })->name('dashboard');
    require __DIR__.'/settings.php';
});