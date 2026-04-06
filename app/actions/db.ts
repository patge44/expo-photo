'use server';

import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enregistre une œuvre dans Supabase.
 * 1. Upload l'image dans le bucket 'artworks'.
 * 2. Insère les métadonnées dans la table 'artworks'.
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

    // 1. Upload de l'image (conversion base64 vers Buffer)
    const base64Data = formData.imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Récupération de l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('artworks')
      .getPublicUrl(fileName);

    // 2. Insertion en base de données
    const { error: dbError } = await supabase
      .from('artworks')
      .insert({
        id,
        title: formData.title,
        author: formData.author,
        photo_number: formData.photoNumber,
        image_url: publicUrl,
        description_overview: formData.description.overview,
        description_details: formData.description.details,
        description_atmosphere: formData.description.atmosphere,
        status: 'published'
      });

    if (dbError) throw dbError;

    return { success: true, id };
  } catch (error: any) {
    console.error("Erreur SaveArtwork:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Supprime une œuvre dans Supabase.
 * 1. Supprime l'image du bucket 'artworks'.
 * 2. Supprime la ligne de la table 'artworks'.
 */
export async function deleteArtworkAction(id: string, imageUrl: string) {
  try {
    // 1. Extraction du nom de fichier depuis l'URL
    const fileName = imageUrl.split('/').pop();
    
    if (fileName) {
      // 2. Suppression du fichier dans le bucket Storage
      const { error: storageError } = await supabase.storage
        .from('artworks')
        .remove([fileName]);
        
      if (storageError) throw storageError;
    }

    // 3. Suppression dans la base de données
    const { error: dbError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur DeleteArtwork:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour les métadonnées (texte, titre, numéro) d'une œuvre existante.
 */
export async function updateArtworkAction(id: string, updateData: {
  title: string;
  photo_number: string;
  description_overview: string;
  description_details: string;
  description_atmosphere: string;
}) {
  try {
    const { data: updatedRows, error } = await supabase
      .from('artworks')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!updatedRows || updatedRows.length === 0) {
      throw new Error("Mise à jour refusée par la base de données. Avez-vous ajouté la politique SQL pour l'UPDATE ?");
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Erreur UpdateArtwork:", error);
    return { success: false, error: error.message };
  }
}
