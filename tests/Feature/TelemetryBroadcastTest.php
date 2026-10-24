<?php

use App\Events\AstronautTelemetryUpdated;
use Illuminate\Support\Facades\Event;

test('welcome page renders with initial telemetry', function () {
    $response = $this->get('/');

    $response->assertOk();
});

test('telemetry ping broadcasts event with valid payload', function () {
    Event::fake([
        AstronautTelemetryUpdated::class,
    ]);

    $response = $this->postJson('/api/telemetry/ping', [
        'astronaut_id' => 'AST-02',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    Event::assertDispatched(AstronautTelemetryUpdated::class, function ($event) {
        return $event->telemetry['astronaut_id'] === 'AST-02'
            && $event->broadcastOn()[0]->name === 'mission-telemetry';
    });
});
