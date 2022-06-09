
/*
 * Build table and indices.
 */
DO $do$
BEGIN
  RAISE NOTICE 'Initializing database...';
  
  IF NOT EXISTS (
    SELECT NULL FROM pg_sequence
    INNER JOIN pg_class ON pg_sequence.seqrelid = pg_class.oid
    INNER JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public' AND pg_class.relname = 'episode__id_seq'
  ) THEN
    CREATE SEQUENCE public.episode__id_seq
    INCREMENT 1
    START 1;
  END IF;
  

  IF EXISTS(SELECT NULL FROM pg_tables WHERE schemaname = 'public' and tablename = 'episode')
  THEN
    RAISE NOTICE 'Table ''episode'' already exists.';
  ELSE
    RAISE NOTICE 'Creating table ''episode''...';
    CREATE TABLE IF NOT EXISTS public.episode
    (
      _id bigint NOT NULL DEFAULT nextval('episode__id_seq'::regclass),
      guid character varying(255) COLLATE pg_catalog."default" NOT NULL,
      "additionalInfo" text COLLATE pg_catalog."default",
      "pubDate" bigint NOT NULL,
      CONSTRAINT episode_pkey PRIMARY KEY (_id),
	  CONSTRAINT ux_episode_guid UNIQUE (guid)
    )
    TABLESPACE pg_default;
  
  END IF;

  IF EXISTS (
      SELECT NULL FROM pg_index ix
      INNER JOIN pg_class cs1 ON ix.indexrelid = cs1.oid
      INNER JOIN pg_namespace ne ON cs1.relnamespace = ne.oid
      WHERE ne.nspname = 'public' AND cs1.relname = 'idx_episode_pubDate'
  ) THEN
    RAISE NOTICE 'Dropping index ''idx_episode_pubDate''...';
    DROP INDEX public."idx_episode_pubDate";
  END IF;

  RAISE NOTICE 'Creating index ''idx_episode_pubDate''...';
  CREATE INDEX "idx_episode_pubDate"
    ON public.episode USING btree
    ("pubDate" ASC NULLS LAST)
    TABLESPACE pg_default;
END
$do$;