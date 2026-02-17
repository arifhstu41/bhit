# Laravel Deployment Checklist

## Server Requirements
- PHP >= 8.1
- MySQL/MariaDB
- Apache/Nginx with mod_rewrite enabled
- Composer

## Deployment Steps

1. **Upload Files**
   - Upload all files to server (except .env)
   - Set document root to `/public` folder OR use root .htaccess

2. **Set Permissions**
   ```bash
   chmod -R 755 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

3. **Create .env File**
   - Copy .env.example to .env
   - Update database credentials:
     ```
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=your_database
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     ```
   - Set APP_URL to your domain
   - Set APP_ENV=production
   - Set APP_DEBUG=false

4. **Install Dependencies**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

5. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

6. **Run Migrations**
   ```bash
   php artisan migrate --force
   ```

7. **Optimize**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Apache Configuration (if not using root .htaccess)
Set document root to `/public` folder in your virtual host:
```apache
DocumentRoot /path/to/your/project/public
<Directory /path/to/your/project/public>
    AllowOverride All
    Require all granted
</Directory>
```

## Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Troubleshooting 404 Errors

1. **Check mod_rewrite is enabled** (Apache):
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

2. **Check .htaccess files exist**:
   - Root: .htaccess (redirects to public)
   - public/.htaccess (Laravel routes)

3. **Check file permissions**:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

4. **Clear cache**:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

5. **Check storage link**:
   ```bash
   php artisan storage:link
   ```
