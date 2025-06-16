DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'codecake') THEN
        CREATE DATABASE codecake;
    END IF;
END
$$;

\c codecake;

-- Créer le schéma ecommerce_yt
CREATE SCHEMA IF NOT EXISTS ecommerce_yt;

-- Définir le schéma par défaut
SET search_path TO ecommerce_yt;

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la séquence pour les IDs utilisateur
CREATE SEQUENCE IF NOT EXISTS ecommerce_user_seq;

-- Créer la table authority
CREATE TABLE IF NOT EXISTS authority (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Donner les permissions nécessaires
GRANT ALL ON SCHEMA ecommerce_yt TO codecake;
GRANT ALL ON ALL TABLES IN SCHEMA ecommerce_yt TO codecake;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ecommerce_yt TO codecake; 