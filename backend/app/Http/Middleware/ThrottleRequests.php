<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\RateLimiter as FacadesRateLimiter;

class ThrottleRequests
{
    public function handle(Request $request, Closure $next, $maxAttempts = 60, $decayMinutes = 1)
    {
        $key = $request->ip();

        if (FacadesRateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'success' => false,
                'message' => 'Trop de tentatives. Veuillez réessayer dans ' . $decayMinutes . ' minute(s).'
            ], 429);
        }

        FacadesRateLimiter::hit($key, $decayMinutes * 60);

        return $next($request);
    }
}