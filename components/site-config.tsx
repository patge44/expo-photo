'use client';

import { createContext, useContext } from 'react';

type SiteConfig = {
  clubName: string;
  exhibitionName: string;
  introText: string;
};

const SiteConfigContext = createContext<SiteConfig>({
  clubName: 'PHOTOCLUB des Sorinières',
  exhibitionName: 'Accords visibles',
  introText:
    "Vivez la photographie au-delà du regard : chaque image est décrite par l'audiodescription pour les personnes malvoyantes.",
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