<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCorsForApi
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');
        $allowed = config('app.frontend_url', 'http://localhost:3000');

        if ($request->isMethod('OPTIONS')) {
            $response = response('', 204);
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: $allowed ?: '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
            $response->headers->set('Access-Control-Max-Age', '86400');
            return $response;
        }

        $response = $next($request);

        if ($origin && ($allowed === '*' || $origin === $allowed)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        } elseif ($allowed === '*') {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
        $response->headers->set('Access-Control-Max-Age', '86400');

        return $response;
    }
}
