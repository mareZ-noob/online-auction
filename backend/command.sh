docker cp import_products.sql postgres:/tmp/import_products.sql
docker exec -it postgres psql -U postgres -d auction_db -f /tmp/import_products.sql