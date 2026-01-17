#!/bin/sh
set -e

# Replace environment variables in config.js
cat > /usr/share/nginx/html/admin/config.js << EOF
window.ENV = {
  VITE_API_BASE_URL: '${VITE_API_BASE_URL}',
  VITE_API_SSE_BASE_URL: '${VITE_API_SSE_BASE_URL}'
};
EOF

echo "Runtime configuration injected:"
cat /usr/share/nginx/html/admin/config.js

# Start nginx
exec nginx -g 'daemon off;'
