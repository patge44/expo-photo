import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/**
 * GET /api/images/xxx.jpg → sert l'image du stockage local.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Sécurité : n'accepter QUE des noms de fichiers simples (pas de ../..)
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(name)) {
    return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 });
  }

  try {
    const file = await readFile(path.join(UPLOADS_DIR, name));
    const extension = name.split('.').pop()?.toLowerCase() || 'jpg';

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': MIME_TYPES[extension] || 'image/jpeg',
        // Les fichiers ne changent jamais : le navigateur peut les cacher longtemps
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });
  }
}