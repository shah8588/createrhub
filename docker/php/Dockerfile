FROM php:8.3-fpm-alpine

# System deps
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    freetype-dev \
    libjpeg-turbo-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    zip \
    exif \
    pcntl \
    bcmath \
    gd \
    intl \
    xml \
    opcache

# Redis extension via PECL
RUN pecl install redis \
 && docker-php-ext-enable redis

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# PHP config for dev
RUN echo "opcache.enable=0" >> /usr/local/etc/php/conf.d/opcache.ini \
 && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "upload_max_filesize=500M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "post_max_size=500M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/backend

USER www-data
