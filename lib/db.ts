import { Pool } from 'pg';

// La connexion vient de DATABASE_URL (voir .env du VPS).
// Exemple : postgres://expo:motdepasse@expo-postgres:5432/expodb
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL manquante dans les variables d'environnement.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 10 connexions maximum, largement suffisant
});

/**
 * Exécute une requête SQL paramétrée.
 * TOUJOURS passer les valeurs par $1, $2... (jamais par concaténation !)
 */
export async function query(text: string, params: unknown[] = []) {
  return pool.query(text, params);
}