# Admin Setup Guide

## Generate Private Key

```bash
openssl genrsa -out private_key.pem 2048
```

## Generate Public Key

Generate the public key to put in `application.yml`:

```bash
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

## Register Admin User

Run the admin registration client located at `backend/src/main/resources/keys`:

```bash
java AdminRegistrationClient.java
```

## Example Registration Request

Use the following curl command to register an admin user:

```bash
curl -X POST http://localhost:8088/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "",
    "password": "",
    "fullName": "",
    "address": "",
    "recaptchaToken": "",
    "adminSignature": ""
  }'
```

Replace the email, password, fullName, address, and adminSignature values with your actual admin credentials and
generated signature.