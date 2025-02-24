<?php

namespace App\Http\Middleware;

use Bouncer, Closure;

class ScopeBouncer
{
    public function handle($request, Closure $next, $identifier)
    {
        Bouncer::scope()->to($identifier);

        return $next($request);
    }
}
