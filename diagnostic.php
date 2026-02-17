<?php
/**
 * Diagnostic Script
 * Visit: https://govtssfo.exdotech.com/diagnostic.php
 * DELETE THIS FILE AFTER FIXING ISSUES!
 */

echo "<h2>Laravel Diagnostic Report</h2>";

// Check PHP version
echo "<h3>1. PHP Version</h3>";
echo "Current: " . phpversion() . "<br>";
echo (version_compare(phpversion(), '8.1.0', '>=') ? "✓ OK" : "❌ Need PHP 8.1+") . "<br>";

// Check required extensions
echo "<h3>2. Required Extensions</h3>";
$extensions = ['openssl', 'pdo', 'mbstring', 'tokenizer', 'xml', 'ctype', 'json', 'bcmath'];
foreach ($extensions as $ext) {
    echo $ext . ": " . (extension_loaded($ext) ? "✓ Loaded" : "❌ Missing") . "<br>";
}

// Check directories
echo "<h3>3. Directory Permissions</h3>";
$dirs = [
    'storage' => __DIR__ . '/storage',
    'bootstrap/cache' => __DIR__ . '/bootstrap/cache',
    'vendor' => __DIR__ . '/vendor',
];
foreach ($dirs as $name => $path) {
    if (file_exists($path)) {
        echo $name . ": ✓ Exists (Writable: " . (is_writable($path) ? "Yes" : "No") . ")<br>";
    } else {
        echo $name . ": ❌ Missing<br>";
    }
}

// Check .env file
echo "<h3>4. Configuration Files</h3>";
echo ".env: " . (file_exists(__DIR__ . '/.env') ? "✓ Exists" : "❌ Missing") . "<br>";
echo "vendor/autoload.php: " . (file_exists(__DIR__ . '/vendor/autoload.php') ? "✓ Exists" : "❌ Missing - Run composer install") . "<br>";

// Check .env content
if (file_exists(__DIR__ . '/.env')) {
    $envContent = file_get_contents(__DIR__ . '/.env');
    echo "APP_KEY set: " . (strpos($envContent, 'APP_KEY=base64:') !== false ? "✓ Yes" : "❌ No - Run setup.php") . "<br>";
}

// Check storage structure
echo "<h3>5. Storage Structure</h3>";
$storageDirs = ['app', 'framework', 'framework/cache', 'framework/sessions', 'framework/views', 'logs'];
foreach ($storageDirs as $dir) {
    $path = __DIR__ . '/storage/' . $dir;
    echo "storage/$dir: " . (file_exists($path) ? "✓" : "❌") . "<br>";
}

// Try to load Laravel
echo "<h3>6. Laravel Bootstrap Test</h3>";
try {
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require __DIR__ . '/vendor/autoload.php';
        echo "✓ Autoloader works<br>";
        
        if (file_exists(__DIR__ . '/bootstrap/app.php')) {
            $app = require_once __DIR__ . '/bootstrap/app.php';
            echo "✓ Laravel app bootstrapped<br>";
        } else {
            echo "❌ bootstrap/app.php missing<br>";
        }
    } else {
        echo "❌ vendor/autoload.php missing - You need to upload vendor folder or run composer install<br>";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "<br>";
}

echo "<br><h3>Action Items:</h3>";
echo "<ol>";
echo "<li>If vendor folder is missing: Upload it from your local project OR contact hosting to run 'composer install'</li>";
echo "<li>If APP_KEY is missing: Visit setup.php to generate it</li>";
echo "<li>If storage folders are missing: Create them manually via FTP/cPanel</li>";
echo "<li>Update .env with correct database credentials</li>";
echo "<li>Set storage and bootstrap/cache permissions to 755</li>";
echo "</ol>";

echo "<br><strong style='color:red;'>DELETE THIS FILE AFTER FIXING!</strong>";
