import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // On ne protège que les chemins qui commencent par /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // On vérifie si notre passeport (cookie) est présent
    const sessionCookie = request.cookies.get('club_admin_session');
    
    if (!sessionCookie || sessionCookie.value !== 'authenticated') {
      // Pas de passeport = Retour à la page de connexion
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Tout va bien, on le laisse passer
  return NextResponse.next();
}

// Configuration du middleware pour s'appliquer à ces routes :
export const config = {
  matcher: ['/admin/:path*'],
};
