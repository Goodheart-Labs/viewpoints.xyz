#!/bin/zsh

DB_USER=viewpoints
DB_PASSWORD=viewpoints
DB_DATABASE=viewpoints_development

psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
psql -c "CREATE DATABASE $DB_DATABASE;"
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;"

# Exit the PostgreSQL CLI
echo "PostgreSQL database and user created successfully."
