<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    public function test_login_route_redirects_to_home()
    {
        $response = $this->get('/login');
        $response->assertRedirect('/');
    }

    public function test_register_route_redirects_to_home()
    {
        $response = $this->get('/register');
        $response->assertRedirect('/');
    }

    public function test_forgot_password_route_redirects_to_home()
    {
        $response = $this->get('/forgot-password');
        $response->assertRedirect('/');
    }
}
