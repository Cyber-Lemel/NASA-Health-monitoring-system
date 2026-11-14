<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_visit_the_dashboard_directly()
    {
        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_guests_can_visit_home_directly()
    {
        $response = $this->get(route('home'));
        $response->assertOk();
    }

    public function test_guests_can_visit_the_dataset_page_directly()
    {
        $response = $this->get(route('dataset.index'));
        $response->assertOk();
    }
}
