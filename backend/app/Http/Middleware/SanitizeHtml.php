<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeHtml
{
    private static array $htmlFields = ['content', 'description', 'bio'];

    public function handle(Request $request, Closure $next): Response
    {
        foreach (self::$htmlFields as $field) {
            if ($request->has($field) && is_string($request->input($field))) {
                $request->merge([$field => self::purify($request->input($field))]);
            }
        }

        return $next($request);
    }

    public static function purify(string $html): string
    {
        // Allow safe formatting tags only; strip scripts/iframes/event attributes
        return strip_tags($html, [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
            'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
            'blockquote', 'code', 'pre', 'hr', 'a', 'img',
        ]);
    }
}
