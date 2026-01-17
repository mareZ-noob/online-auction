#!/bin/bash

# Wrapper script to run image migration inside Docker
# This makes it easier to run on Azure VM without installing dependencies

set -e

echo "========================================="
echo "Product Image Migration to MinIO"
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

echo "Running migration inside Docker container..."
echo ""

# Run Python script inside a temporary container
docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres bash << 'EOF'
# Install Python dependencies
apt-get update -qq && apt-get install -y -qq python3-pip wget uuid-runtime > /dev/null 2>&1
pip3 install --break-system-packages -q minio psycopg2-binary requests

# Download the migration script
cat > /tmp/migrate.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import os
import sys
import uuid
import requests
import psycopg2
from minio import Minio
from minio.error import S3Error
from urllib.parse import urlparse
import mimetypes
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

GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def print_colored(message, color=RESET):
    print(f"{color}{message}{RESET}")

def get_file_extension(url):
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[1]
    return ext.lstrip('.') if ext else 'jpg'

def download_image(url, timeout=10):
    try:
        response = requests.get(url, timeout=timeout, stream=True)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print_colored(f"  ✗ Download failed: {e}", RED)
        return None

def upload_to_minio(minio_client, bucket, filename, data, content_type):
    try:
        minio_client.put_object(
            bucket, filename, BytesIO(data),
            length=len(data), content_type=content_type
        )
        return True
    except S3Error as e:
        print_colored(f"  ✗ MinIO upload failed: {e}", RED)
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

    print_colored("\nFetching images from database...", YELLOW)
    cursor.execute("""
        SELECT product_id, image_url FROM product_images 
        WHERE image_url LIKE 'http://%' OR image_url LIKE 'https://picsum%'
    """)
    images = cursor.fetchall()
    
    total = len(images)
    print_colored(f"Found {total} images to migrate\n", GREEN)
    
    if total == 0:
        print_colored("No images to migrate.", YELLOW)
        return 0

    success = 0
    failed = 0
    
    for idx, (product_id, image_url) in enumerate(images, 1):
        print_colored(f"[{idx}/{total}] Processing Product ID: {product_id}", YELLOW)
        print(f"  Original URL: {image_url}")
        
        image_data = download_image(image_url)
        if not image_data:
            failed += 1
            print()
            continue
        
        extension = get_file_extension(image_url)
        content_type = mimetypes.guess_type(f"file.{extension}")[0] or 'application/octet-stream'
        new_filename = f"{uuid.uuid4()}.{extension}"
        
        if upload_to_minio(minio_client, MINIO_BUCKET, new_filename, image_data, content_type):
            new_url = f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{new_filename}"
            try:
                cursor.execute(
                    "UPDATE product_images SET image_url = %s WHERE product_id = %s AND image_url = %s",
                    (new_url, product_id, image_url)
                )
                conn.commit()
                print_colored(f"  ✓ Migrated to: {new_url}", GREEN)
                success += 1
            except Exception as e:
                print_colored(f"  ✗ Database update failed: {e}", RED)
                conn.rollback()
                failed += 1
        else:
            failed += 1
        print()

    cursor.close()
    conn.close()

    print_colored("=" * 50, GREEN)
    print_colored("Migration Summary", GREEN)
    print_colored("=" * 50, GREEN)
    print(f"Total images:          {total}")
    print_colored(f"Successfully migrated: {success}", GREEN)
    if failed > 0:
        print_colored(f"Failed:                {failed}", RED)
    print_colored("=" * 50, GREEN)
    
    return 0 if success == total else 1

if __name__ == "__main__":
    sys.exit(main())
PYTHON_SCRIPT

# Run the migration
python3 /tmp/migrate.py

# Clean up
rm -f /tmp/migrate.py
EOF

echo ""
echo "Migration complete!"
