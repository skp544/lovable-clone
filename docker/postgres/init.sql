-- Runs once, on first initialisation of the postgres-data volume.
-- The default `vibe` user / `lovable` database come from POSTGRES_USER / POSTGRES_DB.
-- Temporal (docker-compose.yml, SKIP_DB_CREATE=true) needs its own user and databases.

CREATE USER temporal WITH PASSWORD 'temporal';

CREATE DATABASE temporal OWNER temporal;
CREATE DATABASE temporal_visibility OWNER temporal;
