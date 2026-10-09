'use server';

import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// Dossier des images : /app/uploads dans le conteneur (monté depuis le VPS)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

/**
 * Enregistre une œuvre :
 * 1. Écrit l'image sur le disque (stockage local).
 * 2. Insère les métadonnées dans PostgreSQL.
 */
export async function saveArtworkAction(formData: {
  title: string;
  author: string;
  photoNumber: string;
  imageData: string; // Base64
  description: {
    overview: string;
    details: string;
    atmosphere: string;
  };
}) {
  try {
    const id = uuidv4();
    const fileName = `${id}.jpg`;

    // 1. Écriture de l'image (base64 -> fichier)
    const base64Data = formData.imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(path.join(UPLOADS_DIR, fileName), buffer);

    // 2. Insertion en base — valeurs passées par paramètres ($1...$8)
    const result = await query(
      `INSERT INTO artworks
        (id, title, author, photo_number, image_url,
         description_overview, description_details, description_atmosphere, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published')
       RETURNING id`,
      [
        id,
        formData.title,
        formData.author,
        formData.photoNumber,
        `/api/images/${fileName}`,
        formData.description.overview,
        formData.description.details,
        formData.description.atmosphere,
      ]
    );

    return { success: true, id: result.rows[0].id as string };
  } catch (error: unknown) {
    console.error("Erreur SaveArtwork:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Supprime une œuvre : l'image du disque, puis la ligne en base.
 */
export async function deleteArtworkAction(id: string, imageUrl: string) {
  try {
    // 1. Extraction du nom de fichier depuis l'URL (/api/images/xxx.jpg)
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      try {
        await unlink(path.join(UPLOADS_DIR, fileName));
      } catch (fileError) {
        // Le fichier peut manquer sans gravité : on loggue mais on continue
        console.warn("Image absente du disque (suppression ignorée) :", fileName);
      }
    }

    // 2. Suppression en base
    const result = await query('DELETE FROM artworks WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      throw new Error("Œuvre introuvable en base.");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur DeleteArtwork:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Met à jour les métadonnées d'une œuvre existante.
 */
export async function updateArtworkAction(id: string, updateData: {
  title: string;
  photo_number: string;
  description_overview: string;
  description_details: string;
  description_atmosphere: string;
}) {
  try {
    const result = await query(
      `UPDATE artworks SET
        title = $1,
        photo_number = $2,
        description_overview = $3,
        description_details = $4,
        description_atmosphere = $5
       WHERE id = $6
       RETURNING id`,
      [
        updateData.title,
        updateData.photo_number,
        updateData.description_overview,
        updateData.description_details,
        updateData.description_atmosphere,
        id,
      ]
    );

    if (result.rowCount === 0) {
      throw new Error("Mise à jour refusée : œuvre introuvable en base.");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur UpdateArtwork:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}