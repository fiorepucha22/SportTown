<?php

$devOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$configured = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
)));

$productionOrigins = array_values(array_filter([
    rtrim((string) env('APP_URL', 'https://eventixs.es'), '/'),
]));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | En producción con Nginx, el frontend y /api comparten dominio (sin CORS).
    | Estos orígenes cubren www, preproducción y desarrollo con Vite.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $configured !== []
        ? $configured
        : (env('APP_ENV') === 'production' ? $productionOrigins : $devOrigins),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
