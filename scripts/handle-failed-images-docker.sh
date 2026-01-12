#!/bin/bash

# Script to handle failed image migrations by replacing them with a placeholder
# This runs inside Docker to avoid dependency issues

set -e

echo "========================================="
echo "Handling Failed Image Migrations"
echo "========================================="
echo ""

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "Error: docker compose not found"
    exit 1
fi

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "Error: .env.prod not found"
    exit 1
fi

echo "Running fallback script inside Docker container..."
echo ""

# Run Python script inside a temporary container
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres bash << 'EOF'
# Install Python dependencies
apt-get update -qq && apt-get install -y -qq python3-pip wget uuid-runtime > /dev/null 2>&1
pip3 install --break-system-packages -q minio psycopg2-binary requests

# Create the fallback script
cat > /tmp/fallback.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import os
import sys
import requests
import psycopg2
from minio import Minio
from minio.error import S3Error
from io import BytesIO

# Configuration from environment
MINIO_ENDPOINT = 'minio:9000'
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = 'auction-products'
MINIO_PUBLIC_URL = 'https://web-hcmus.club/files'

POSTGRES_HOST = 'localhost'
POSTGRES_PORT = '5432'
POSTGRES_DB = 'auction_db'
POSTGRES_USER = 'postgres'
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'postgres')

PLACEHOLDER_SOURCE = "https://dummyimage.com/600x400/cccccc/000000&text=No+Image"
PLACEHOLDER_FILENAME = "placeholder.png"

GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def print_colored(message, color=RESET):
    print(f"{color}{message}{RESET}")

def ensure_placeholder_exists(minio_client):
    """Ensure placeholder image exists in MinIO"""
    try:
        # Check if object exists
        try:
            minio_client.stat_object(MINIO_BUCKET, PLACEHOLDER_FILENAME)
            print_colored(f"✓ Placeholder image already exists in MinIO", GREEN)
            return True
        except S3Error:
            pass # Does not exist, proceed to create
            
        print_colored(f"Downloading placeholder from {PLACEHOLDER_SOURCE}...", YELLOW)
        response = requests.get(PLACEHOLDER_SOURCE, timeout=10)
        response.raise_for_status()
        data = response.content
        
        print_colored(f"Uploading placeholder to MinIO...", YELLOW)
        minio_client.put_object(
            MINIO_BUCKET, 
            PLACEHOLDER_FILENAME, 
            BytesIO(data), 
            length=len(data), 
            content_type="image/png"
        )
        print_colored(f"✓ Placeholder uploaded successfully", GREEN)
        return True
    except Exception as e:
        print_colored(f"✗ Failed to setup placeholder: {e}", RED)
        return False

def main():
    print_colored("Connecting to MinIO...", YELLOW)
    try:
        minio_client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY,
                            secret_key=MINIO_SECRET_KEY, secure=False)
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
        print_colored("✓ MinIO connected", GREEN)
    except Exception as e:
        print_colored(f"✗ MinIO connection failed: {e}", RED)
        return 1

    # Ensure placeholder exists
    if not ensure_placeholder_exists(minio_client):
        return 1
        
    placeholder_url = f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{PLACEHOLDER_FILENAME}"
    print_colored(f"Placeholder URL: {placeholder_url}", GREEN)

    print_colored("Connecting to PostgreSQL...", YELLOW)
    try:
        conn = psycopg2.connect(host=POSTGRES_HOST, port=POSTGRES_PORT,
                               database=POSTGRES_DB, user=POSTGRES_USER,
                               password=POSTGRES_PASSWORD)
        cursor = conn.cursor()
        print_colored("✓ PostgreSQL connected", GREEN)
    except Exception as e:
        print_colored(f"✗ PostgreSQL connection failed: {e}", RED)
        return 1

    print_colored("\nFetching failed images (still http://)...", YELLOW)
    cursor.execute("""
        SELECT product_id, image_url FROM product_images 
        WHERE image_url LIKE 'http://%' OR image_url LIKE 'https://picsum%'
    """)
    images = cursor.fetchall()
    
    total = len(images)
    print_colored(f"Found {total} failed images to replace with placeholder\n", GREEN)
    
    if total == 0:
        print_colored("No failed images found.", YELLOW)
        return 0

    success = 0
    failed = 0
    
    # We can do a bulk update or individual updates. Individual is safer for logging.
    for idx, (product_id, image_url) in enumerate(images, 1):
        # Update database
        try:
            cursor.execute(
                "UPDATE product_images SET image_url = %s WHERE product_id = %s AND image_url = %s",
                (placeholder_url, product_id, image_url)
            )
            # Commit every 100 records or at the end
            if idx % 100 == 0:
                conn.commit()
                print_colored(f"[{idx}/{total}] Updated batch...", YELLOW)
            success += 1
        except Exception as e:
            print_colored(f"  ✗ Database update failed for Product {product_id}: {e}", RED)
            conn.rollback()
            failed += 1

    conn.commit()
    
    cursor.close()
    conn.close()

    print_colored("=" * 50, GREEN)
    print_colored("Fallback Summary", GREEN)
    print_colored("=" * 50, GREEN)
    print(f"Total failed images:   {total}")
    print_colored(f"Replaced with placeholder: {success}", GREEN)
    if failed > 0:
        print_colored(f"Failed to update:          {failed}", RED)
    print_colored("=" * 50, GREEN)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
PYTHON_SCRIPT

# Run the fallback script
python3 /tmp/fallback.py

# Clean up
rm -f /tmp/fallback.py
EOF

echo ""
echo "Fallback handling complete!"
