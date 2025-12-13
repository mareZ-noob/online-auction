docker cp import_products.sql postgres:/tmp/import_products.sql
docker exec -it postgres psql -U postgres -d auction_db -f /tmp/import_products.sql
openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem