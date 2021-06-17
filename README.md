semver.tomask.space
    /tag/<vendor/image>/list?filter=^8.0.*-fpm-alpine$
    [
        8.0.0-fpm-alpine,
        8.0.1-fpm-alpine,
        8.0.2-fpm-alpine,
        8.0.3-fpm-alpine
    ]

    [
        8.0.0-dev-fmp-alpine,
        8.0.0-prod-fmp-alpine
    ]

    /tag/<vendor/image>/missing?against=<vendor/repo>&filter=^8\.0\.(\d%2B)-fpm-alpine$

- <vendor/image>
    - tomaskubat/php
    - library/php
- https://semver.tomask.space/tags/tomaskubat/php-prod/missing?against=library/php&filter=^8\.0\.(\d%2B)-fpm-alpine$
- nactu tagy tomaskubat/php-prod (metoda)
- vyfiltruji (metoda jako endpoint)
- nactu tagy library/php
- vyfiltruji
- rozdil mnozin "library/php" - "tomaskubat/php" = missing (metoda jako endpoint)