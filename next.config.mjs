/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autonome : nécessaire pour l'image Docker minimale
  output: 'standalone',
  typescript: {
    // !! ATTENTION !!
    // Permet de forcer le build même avec des erreurs TS
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! ATTENTION !!
    // Permet de forcer le build même avec des erreurs ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;