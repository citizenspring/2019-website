#!/usr/bin/env bash
set -e

# Only run migrations automatically on staging and production
if [ "$SEQUELIZE_ENV" = "staging" ] || [ "$SEQUELIZE_ENV" = "production" ]; then
  echo "- running db:migrate on $SEQUELIZE_ENV environment"
  npm run db:migrate
  exit $?; # exit with return code of previous command
fi

# On any other environment, first let's check if postgres is installed
if command -v psql > /dev/null; then
  echo "✓ Postgres installed"
else
  echo "𐄂 psql command doesn't exist. Make sure you have Postgres installed ($> brew install postgres)"
fi


echo ""
echo "Running tests with jest"
jest --verbose false --detectOpenHandles --testMatch **/__tests__/**/*.test.js --testPathIgnorePatterns build/
echo ""
if [ "$NODE_ENV" = "test" ] || [ -z "$NODE_ENV" ]; then
  echo "Cleaning"
  FILES=`psql -l | sed 's/|.*//' | grep citizenspring-test- || true`
  for DB in $FILES; do echo "dropdb $DB"; dropdb $DB; done;
fi