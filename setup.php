<?php
/**
 * Manual Setup Script
 * Visit: https://govtssfo.exdotech.com/setup.php
 * DELETE THIS FILE AFTER SETUP!
 */

// Generate APP_KEY
function generateKey() {
    return 'base64:'.base64_encode(random_bytes(32));
}

// Read .env file
$envFile = __DIR__ . '/.env';
$envExampleFile = __DIR__ . '/.env.example';

if (!file_exists($envFile)) {
    if (file_exists($envExampleFile)) {
        copy($envExampleFile, $envFile);
        echo "✓ .env file created from .env.example<br>";
    } else {
        die("❌ .env.example file not found!");
    }
}

// Read current .env
$envContent = file_get_contents($envFile);

// Generate new key if not exists
if (strpos($envContent, 'APP_KEY=') === false || strpos($envContent, 'APP_KEY=') !== false && preg_match('/APP_KEY=\s*$/', $envContent)) {
    $newKey = generateKey();
    $envContent = preg_replace('/APP_KEY=.*/', 'APP_KEY=' . $newKey, $envContent);
    
    if (strpos($envContent, 'APP_KEY=') === false) {
        $envContent .= "\nAPP_KEY=" . $newKey;
    }
    
    file_put_contents($envFile, $envContent);
    echo "✓ APP_KEY generated: " . $newKey . "<br>";
} else {
    echo "✓ APP_KEY already exists<br>";
}

// Set permissions
@chmod(__DIR__ . '/storage', 0755);
@chmod(__DIR__ . '/bootstrap/cache', 0755);
echo "✓ Permissions set<br>";

echo "<br><strong>Setup Complete!</strong><br>";
echo "<br><strong style='color:red;'>IMPORTANT: Delete this setup.php file now!</strong><br>";
echo "<br>Next steps:<br>";
echo "1. Update .env file with your database credentials<br>";
echo "2. Visit your site to test<br>";
echo "3. If you see database errors, you need to run migrations manually via cPanel or phpMyAdmin<br>";
