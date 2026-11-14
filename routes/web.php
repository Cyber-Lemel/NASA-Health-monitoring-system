<?php

use App\Events\AstronautTelemetryUpdated;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\DatasetController;
use App\Models\DatasetRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Main Mission Control Dashboard (Direct entry point - no landing page, no authentication required)
$dashboardHandler = function () {
    $records = DatasetRecord::orderBy('Astronaut', 'asc')->get();
    return inertia('dashboard', [
        'records' => $records,
    ]);
};

Route::get('/', $dashboardHandler)->name('home');
Route::get('/dashboard', $dashboardHandler)->name('dashboard');

// Kaggle Dataset Archive & Management (Directly accessible - no authentication required)
Route::get('/dataset', [DatasetController::class, 'index'])->name('dataset.index');
Route::post('/api/dataset/import', [DatasetController::class, 'import'])->name('dataset.import');
Route::post('/api/dataset/records', [DatasetController::class, 'store'])->name('dataset.store');
Route::put('/api/dataset/records/{astronaut}', [DatasetController::class, 'update'])->name('dataset.update');
Route::delete('/api/dataset/records/{astronaut}', [DatasetController::class, 'destroy'])->name('dataset.destroy');
Route::post('/api/dataset/records/bulk-delete', [DatasetController::class, 'bulkDestroy'])->name('dataset.bulkDestroy');

// Real-time Telemetry & WebSockets
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
            $dbRecord = DatasetRecord::where('Astronaut', $astronautId)->first();
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
Route::post('/api/ai/chat', [ChatbotController::class, 'chat'])->name('ai.chat');

// Catch-all auth redirects to ensure no login screens or gates are shown
Route::redirect('/login', '/')->name('login');
Route::redirect('/register', '/')->name('register');
Route::redirect('/forgot-password', '/')->name('password.request');
Route::redirect('/reset-password', '/')->name('password.reset');
Route::redirect('/two-factor-challenge', '/');
Route::redirect('/email/verify', '/');

Route::redirect('/settings', '/');

