'use client';

import { createContext, useContext } from 'react';

type SiteConfig = {
  clubName: string;
  exhibitionName: string;
  introText: string;
  primaryColor: string;
  logoUrl: string;
  aiProvider: string;
  cartelWidthCm: number;
  cartelHeightCm: number;
};

const SiteConfigContext = createContext<SiteConfig>({
  clubName: 'PHOTOCLUB des Sorinières',
  exhibitionName: 'De la note à l\'image',
  introText:
    "Vivez la photographie au-delà du regard : chaque image est décrite par l'audiodescription pour les personnes malvoyantes.",
  primaryColor: '',
  logoUrl: '',
  aiProvider: 'gemini',
  cartelWidthCm: 17,
  cartelHeightCm: 4,
});

export function SiteConfigProvider({
  value,
  children,
}: {
  value: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}