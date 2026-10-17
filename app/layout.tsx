import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { primaryCssVars } from "@/lib/theme";
import { SiteConfigProvider } from '@/components/site-config';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${siteConfig.exhibitionName} - ${siteConfig.clubName}`,
  description: "Exposition photographique inclusive pour malvoyants et non-voyants",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Palette du club : un bloc CSS qui surcharge les variables par défaut.
  const clubVars = primaryCssVars(siteConfig.primaryColor);
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {clubVars && (
          <style
            dangerouslySetInnerHTML={{
              __html: `:root {\n    ${clubVars}\n  }`,
            }}
          />
        )}
        <SiteConfigProvider value={siteConfig}>
          {children}
        </SiteConfigProvider>
      </body>
    </html>
  );
}