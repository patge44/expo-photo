/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build autonome : nécessaire pour l'image Docker minimale
  output: 'standalone',
  // Les server actions transmettent l'image en base64 :
  // la limite par défaut (1 Mo) faisait échouer les grandes photos.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;