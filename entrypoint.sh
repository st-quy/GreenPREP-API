#!/bin/sh

# Wait for the database to be ready
echo "Waiting for postgres..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "PostgreSQL is up"

# echo "Starting the application..."
npm start