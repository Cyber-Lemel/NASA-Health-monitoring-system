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
    // ... existing telemetry code ...
})->name('telemetry.ping');


// <-- ADD YOUR NEW ROUTE HERE -->
Route::get('/dataset', [DatasetController::class, 'index'])->name('dataset.index');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    require __DIR__.'/settings.php';
});