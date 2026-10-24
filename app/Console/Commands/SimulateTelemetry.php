<?php

namespace App\Console\Commands;

use App\Events\AstronautTelemetryUpdated;
use Illuminate\Console\Command;

class SimulateTelemetry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telemetry:simulate {--once : Broadcast only once} {--interval=3 : Interval in seconds}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate and broadcast astronaut biometric telemetry events over Reverb';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $astronauts = [
            ['id' => 'AST-01', 'name' => 'Commander Alex Vance', 'role' => 'Mission Commander'],
            ['id' => 'AST-02', 'name' => 'Dr. Elena Rostova', 'role' => 'Payload Specialist'],
            ['id' => 'AST-03', 'name' => 'Major Marcus Cole', 'role' => 'Flight Engineer'],
        ];

        $this->info('Starting NASA Biometric Telemetry Broadcast to Reverb...');

        do {
            $selected = $astronauts[array_rand($astronauts)];
            $heartRate = rand(65, 115);
            $oxygen = rand(96, 99) + (rand(0, 9) / 10);
            $temp = round(36.5 + (rand(0, 15) / 10), 1);
            $pressure = round(101.3 + (rand(-10, 10) / 10), 1);
            $radiation = round(0.18 + (rand(0, 30) / 100), 3);

            $status = 'Nominal';
            if ($heartRate > 105) {
                $status = 'Elevated Activity';
            }

            $payload = [
                'astronaut_id' => $selected['id'],
                'astronaut_name' => $selected['name'],
                'role' => $selected['role'],
                'heart_rate' => $heartRate,
                'oxygen_saturation' => $oxygen,
                'core_temperature' => $temp,
                'suit_pressure' => $pressure,
                'radiation_rate' => $radiation,
                'status' => $status,
                'mission_elapsed_time' => 'MET +14:08:32',
            ];

            event(new AstronautTelemetryUpdated($payload));

            $this->line(sprintf(
                '[%s] Broadcasted telemetry for %s: HR %d bpm | O2 %.1f%% | Status: %s',
                now()->format('H:i:s'),
                $selected['name'],
                $heartRate,
                $oxygen,
                $status
            ));

            if ($this->option('once')) {
                break;
            }

            sleep((int) $this->option('interval'));
        } while (true);

        return Command::SUCCESS;
    }
}
