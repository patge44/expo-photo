-- Table pour les œuvres photographiques
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  author TEXT,
  image_url TEXT, -- URL vers Supabase Storage (images)
  audio_url TEXT, -- URL vers Supabase Storage (audios)
  qr_code_url TEXT, -- URL vers Supabase Storage (qr-codes)
  photo_number TEXT, -- Numéro affiché de la photographie
  
  -- Description structurée
  description_overview TEXT,
  description_details TEXT,
  description_atmosphere TEXT,
  
  -- Statut du flux de travail
  status TEXT DEFAULT 'pending', -- 'pending', 'analyzed', 'validated', 'published'
  
  -- Métadonnées techniques
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour la recherche rapide par statut
CREATE INDEX idx_artworks_status ON artworks(status);

-- RLS (Row Level Security)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Politiques : Tout le monde peut lire les œuvres publiées
CREATE POLICY "Public can view published artworks" 
ON artworks FOR SELECT 
USING (status = 'published');

-- Politiques : Seuls les membres authentifiés peuvent tout faire
CREATE POLICY "Authenticated users can manage everything" 
ON artworks FOR ALL 
USING (auth.role() = 'authenticated');
