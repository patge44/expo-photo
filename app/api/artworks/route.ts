import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Les données changent à chaque photo ajoutée : jamais de mise en cache.
// (Critique en multi-clubs : une réponse figée au build serait partagée par tous les clubs.)
export const dynamic = 'force-dynamic';
/**
 * GET /api/artworks              → œuvres publiées (galerie)
 * GET /api/artworks?id=xxx       → une œuvre complète (lecteur audio)
 * GET /api/artworks?number=12    → œuvre publiée portant ce numéro (saisie accessible)
 * GET /api/artworks?all=1        → TOUTES les œuvres (admin uniquement)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const number = searchParams.get('number');
  const wantAll = searchParams.get('all') === '1';

  // Le paramètre all=1 ne livre des données complètes qu'aux administrateurs
  // (double barrière : le middleware protège /admin, ici on protège l'API)
  const isAdmin = request.cookies.get('club_admin_session')?.value === 'authenticated';

  try {
    if (id) {
      const result = await query('SELECT * FROM artworks WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Œuvre introuvable' }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    // Saisie de numéro (accessibilité lecteurs d'écran) : uniquement les
    // œuvres publiées, comparaison insensible à la casse et aux espaces.
    if (number !== null) {
      const trimmed = number.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Numéro manquant' }, { status: 400 });
      }
      const result = await query(
        `SELECT id, title, photo_number
         FROM artworks
         WHERE status = 'published'
           AND LOWER(TRIM(photo_number)) = LOWER(TRIM($1))
         LIMIT 1`,
        [trimmed]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Aucune œuvre publiée ne porte ce numéro' },
          { status: 404 }
        );
      }
      return NextResponse.json(result.rows[0]);
    }

    if (wantAll && isAdmin) {
      const result = await query('SELECT * FROM artworks ORDER BY photo_number ASC');
      return NextResponse.json(result.rows);
    }

    // Par défaut : galerie publique (œuvres publiées, récentes d'abord)
    const result = await query(
      `SELECT id, title, photo_number, image_url
       FROM artworks WHERE status = 'published'
       ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('Erreur API artworks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}