/*
 * Creates web app users and assigns appropriate permissions.
 */
DO $do$
DECLARE
  readonlyuser varchar = quote_ident('ridrevsweb');
  readonlypass varchar = quote_literal('ridrevsweb');
  writeuser varchar = quote_ident('ridrevswrite');
  writepass varchar = quote_literal('ridrevswrite');
BEGIN
  IF NOT EXISTS (SELECT NULL FROM pg_user WHERE usename = readonlyuser)
  THEN
  	EXECUTE 'CREATE ROLE ' || readonlyuser || ' WITH
      LOGIN
      NOSUPERUSER
      INHERIT
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      PASSWORD ' || readonlypass;

    EXECUTE 'COMMENT ON ROLE ' || readonlyuser || ' IS ''Read-only user for ridiculousrevisions DB.''';
  END IF;
  
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO ' || readonlyuser;
  
  IF NOT EXISTS (SELECT NULL FROM pg_user WHERE usename = writeuser)
  THEN
  	EXECUTE 'CREATE ROLE ' || writeuser || ' WITH
      LOGIN
      NOSUPERUSER
      INHERIT
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      PASSWORD ' || writepass;

    EXECUTE 'COMMENT ON ROLE ' || writeuser || ' IS ''Write user for ridiculousrevisions DB.''';
  END IF;
  
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT INSERT, SELECT, UPDATE, DELETE, TRUNCATE ON TABLES TO ' || writeuser;
	
  EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, USAGE ON SEQUENCES TO ' || writeuser;

END
$do$;
