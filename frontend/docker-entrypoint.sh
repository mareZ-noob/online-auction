#!/bin/sh
set -e

# Replace environment variables in config.js
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  VITE_API_BASE_URL: '${VITE_API_BASE_URL}',
  VITE_API_SSE_BASE_URL: '${VITE_API_SSE_BASE_URL}',
  VITE_RECAPTCHA_SITE_KEY: '${VITE_RECAPTCHA_SITE_KEY}'
};
EOF

echo "Runtime configuration injected:"
cat /usr/share/nginx/html/config.js

# Start nginx
exec nginx -g 'daemon off;'
