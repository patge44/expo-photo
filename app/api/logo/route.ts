import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
  try {
    const data = await readFile(path.join(uploadsDir, 'logo.png'));
    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Pas de logo configuré' }, { status: 404 });
  }
}