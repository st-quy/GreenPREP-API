#!/bin/sh

# Wait for the database to be ready
echo "Waiting for postgres..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "PostgreSQL is up"

echo "Running migrations..."
npm run run-migration
if [ $? -ne 0 ]; then
  echo "Error running migrations. Exiting..."
  exit 1
fi
echo "Migrations completed successfully."

echo "Starting the application..."
npm start