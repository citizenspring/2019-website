#!/bin/bash
# This shell scripts copies the production database to the local database
# Usage: npm run db:copyprod (from the root of the repo)
#
# To run the server with the local version of the production database, run:
# PG_DATABASE=citizenspring_prod_snapshot npm start

ENV="${1}"
set -e

LOCALDBUSER="citizenspring"
LOCALDBNAME="citizenspring_prod_snapshot"
DBDUMPS_DIR="dbdumps/"

FILENAME="`date +"%Y-%m-%d"`-prod.pgsql"

if [[ ! -d ${DBDUMPS_DIR} ]]; then
  mkdir -p "${DBDUMPS_DIR}"
fi

if [[ ! -s ${DBDUMPS_DIR}${FILENAME} ]]; then
  PG_URL_ENVIRONMENT_VARIABLE=`heroku config:get PG_URL_ENVIRONMENT_VARIABLE -a "citizenspring"`
  PG_URL_ENVIRONMENT_VARIABLE="${PG_URL_ENVIRONMENT_VARIABLE:-DATABASE_URL}"
  PG_URL=`heroku config:get ${PG_URL_ENVIRONMENT_VARIABLE} -a "citizenspring"`
  echo "Dumping ${ENV} database"
  pg_dump -O -c -F t "${PG_URL}" > "${DBDUMPS_DIR}${FILENAME}"
fi

echo "DB dump saved in ${DBDUMPS_DIR}${FILENAME}"

if psql "${LOCALDBNAME}" -c '\q' 2>/dev/null; then
  echo "Dropping ${LOCALDBNAME}"
  dropdb "${LOCALDBNAME}"
fi

echo "Creating ${LOCALDBNAME}"
createdb "${LOCALDBNAME}"

# Add POSTGIS extension
psql "${LOCALDBNAME}" -c "CREATE EXTENSION POSTGIS;"



# The first time we run it, we will trigger FK constraints errors
set +e
pg_restore --no-acl -n public -O -c -d "${LOCALDBNAME}" "${DBDUMPS_DIR}${FILENAME}" 2>/dev/null
set -e

# So we run it twice :-)
pg_restore --no-acl -n public -O -c -d "${LOCALDBNAME}" "${DBDUMPS_DIR}${FILENAME}"

echo "DB restored to postgres://localhost/${LOCALDBNAME}"

# cool trick: all stdout ignored in this block
{
  set +e
  # We make sure the user $LOCALDBUSER has access; could fail
  psql "${LOCALDBNAME}" -c "CREATE ROLE ${LOCALDBUSER} WITH login;" 2>/dev/null
  set -e

  # Change ownership of all tables
  tables=`psql -qAt -c "select tablename from pg_tables where schemaname = 'public';" "${LOCALDBNAME}"`

  for tbl in $tables ; do
    psql "${LOCALDBNAME}" -c "alter table \"${tbl}\" owner to ${LOCALDBUSER};"
  done

  # Change ownership of the database
  psql "${LOCALDBNAME}" -c "alter database ${LOCALDBNAME} owner to ${LOCALDBUSER};"

  psql "${LOCALDBNAME}" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${LOCALDBUSER};"

} | tee >/dev/null

echo "
---------
All done!
---------

To start the OpenCollective API with the local version of the production database, run:

PG_DATABASE=\"${LOCALDBNAME}\" npm start
"
