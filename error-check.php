<?php
/**
 * Error Checker - Shows actual Laravel error
 * Visit: https://govtssfo.exdotech.com/error-check.php
 * DELETE AFTER FIXING!
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h2>Laravel Error Check</h2>";

try {
    require __DIR__.'/vendor/autoload.php';
    echo "✓ Autoloader loaded<br>";
    
    $app = require_once __DIR__.'/bootstrap/app.php';
    echo "✓ App bootstrapped<br>";
    
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    echo "✓ Kernel created<br>";
    
    $response = $kernel->handle(
        $request = Illuminate\Http\Request::capture()
    );
    echo "✓ Request handled<br>";
    
    $response->send();
    
    $kernel->terminate($request, $response);
    
} catch (Exception $e) {
    echo "<h3 style='color:red;'>Error Found:</h3>";
    echo "<strong>Message:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>File:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Line:</strong> " . $e->getLine() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    
    echo "<h3>Common Solutions:</h3>";
    echo "<ul>";
    echo "<li>If 'Class not found': Run migrations or check database connection</li>";
    echo "<li>If 'Permission denied': Check storage folder permissions (755)</li>";
    echo "<li>If 'Database error': Check .env database credentials</li>";
    echo "<li>If 'Session error': Create sessions table in database</li>";
    echo "</ul>";
}
