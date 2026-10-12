'use client';

import { createContext, useContext } from 'react';

type SiteConfig = { clubName: string; exhibitionName: string };

const SiteConfigContext = createContext<SiteConfig>({
  clubName: 'PHOTOCLUB des Sorinières',
  exhibitionName: 'Accords visibles',
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