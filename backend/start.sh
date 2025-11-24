docker compose -f docker-compose.yml --env-file .env up -d
docker compose -f docker-compose.elk.yml --env-file .env up -d
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.mail.username= --spring.mail.password="
MAIL_USERNAME="" MAIL_PASSWORD="" ./mvnw spring-boot:run
