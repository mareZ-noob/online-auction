# 🛠️ Setup Example Data

Follow this guide to populate your local database with example data (users, products, auctions, etc.).

## Prerequisites

1. **Python 3.x** installed.
2. **Docker** installed and running.
3. Your Postgres container must be running (assumed name: `postgres`).
4. Database `auction_db` must exist.

---

## Step 1: Download the Dataset

1. Visit the [Flipkart Products Dataset on Kaggle](https://www.kaggle.com/datasets/PromptCloudHQ/flipkart-products).
2. Download the dataset.
3. Extract the ZIP file.
4. Move the `.csv` file to the same directory as your `database.py` script.

> **Note:** Ensure the CSV filename matches what is defined inside `database.py` (e.g.,
`flipkart_com-ecommerce_sample.csv`).

---

## Step 2: Install Dependencies

Install the required Python libraries to parse the CSV and generate fake data:

```bash
pip install pandas faker
```

## Step 3: Generate SQL Scripts

Run the Python script to process the data and generate the SQL files:

```bash
python database.py
```

Success Output: This process will generate a file in this directory:

- **imported_data/import_products.sql** (Product data)

## Step 4: Import Data into Docker Postgres

You need to copy the generated SQL files into the container and execute them against the auction_db database.

1. Import General Data (script.sql)

```bash
# Copy file to container
docker cp script.sql postgres:/tmp/script.sql

# Execute SQL
docker exec -it postgres psql -U postgres -d auction_db -f /tmp/script.sql
```

2. Import Products (import_products.sql)

```bash
# Copy file to container
docker cp import_products.sql postgres:/tmp/import_products.sql

# Execute SQL
docker exec -it postgres psql -U postgres -d auction_db -f /tmp/import_products.sql
```

3. Verification
You can verify the data import by logging into the database:

```bash
docker exec -it postgres psql -U postgres -d auction_db -c "SELECT COUNT(*) FROM products;"
```
