# KawanPaper

KawanPaper is your go-to app for chatting mainly with research papers (journal articles, conference papers, etc.)

Features:

- PDF upload and automatic parsing
- Generate key insights from research papers
- Chat with a specific paper

## Setup

Make sure you have an up to date Docker instalation and then clone this repo. We will divide the installation process into 3 parts, minio setup, database migration, and launching the app.

### Configuration

- Main configuration: copy the `.env.example` file to `.env`
- Docker compose configuration: copy the `docker.env.example` to `docker.env`

These config have a predefined values to make it easier to deploy. Note there are some env vars that we need to define:

`.env`

- `VITE_MINIO_ACCESS_KEY`
- `VITE_MINIO_SECRET_KEY`

`docker.env`

- `OPENAI_API_KEY`

You can add your Open AI key in the `docker.env` and for the minio credentials, we will create one in the next step.

### Minio Setup

> This is a new thing for me, back in the day we can set the access key and secret from environment variable, but apparently now we must create it from the web console which is a bit cumbersome

1. Run `docker compose up minio -d`
2. Login to console: http://localhost:9001 using the credentials available in the `docker.env` file
3. Create a new bucket named `kawanpaper`
4. Create new access key by visiting *User > Access Key* and clicking `Create access key +`
5. Copy the Access Key and Secret key to the `.env` file.
6. Go to *Administrator > Buckets* and select the bucket `kawanpaper`, then click `Anonymous > Add Access Rule +`. Enter the prefix `/` and click Save.

Phew! You should have a ready to use `.env` now.

## Database Migration

Start the Postgres container by running `docker compose up postgres -d`

Then, you can use DBeaver or your favorite DBMS tool to create a new database, for example `kawanpaper` and run the migration script in the `migration.sql`. You should now see some tables, functions, and triggers in the database. Make sure to use the credentials provided in the `compose.yml`

## Starting the App

Before running the app, make sure:

1. The `.env` file is updated with Minio credentials
2. Minio bucket has been created
3. Anonymous access to the minio bucket has been added
4. Database has been updated using the `migration.sql` file

Now you're ready to start the app!

Run `docker compose up -d` to start the remaining containers.

The app should be available at: http://localhost:5000
