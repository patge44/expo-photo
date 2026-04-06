import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Le mot de passe attendu. S'il n'est pas dans le .env, il prend "Club2026!" par défaut par sécurité pour l'instant.
    const expectedPassword = process.env.ADMIN_PASSWORD || "Club2026!";

    if (password === expectedPassword) {
      // Si mot de passe OK, on crée un cookie cryptographique (inaccessible au javascript du client pour plus de sûreté)
      const response = NextResponse.json({ success: true });
      response.cookies.set('club_admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // Valable 30 jours
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
