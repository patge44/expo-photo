import QRCode from 'qrcode';

export async function downloadCartelJPEG(artwork: { id: string, title: string, photo_number?: string, image_url: string }) {
  // Dimensions pour 17cm x 4cm à environ 300 DPI
  const WIDTH = 2000;
  const HEIGHT = 470;
  
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  // 1. Fond blanc pur
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Bordure (traits de coupe) gris clair très fine pour le massicot
  ctx.strokeStyle = '#e2e8f0'; // slate-200
  ctx.lineWidth = 4; // Un peu épais car l'image fait 2000px de large
  ctx.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4);
  
  const margin = 35; 
  const boxSize = HEIGHT - margin * 2; // ~400px de zone pour mettre l'image/QR

  // 2. Récupération & Dessin de la Photo (à gauche)
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Important pour télécharger une image externe sans bloquer le Canvas
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Erreur de chargement d'image pour le cartel"));
    
    // Astuce : On passe par un fecth manuel pour forcer le téléchargement en tant que Blob.
    fetch(artwork.image_url)
      .then(res => res.blob())
      .then(blob => {
        img.src = URL.createObjectURL(blob);
      }).catch(reject);
  });
  
  // Calcul pour conserver les proportions (object-contain)
  const imgRatio = img.width / img.height;
  let drawWidth = boxSize;
  let drawHeight = boxSize;
  
  if (imgRatio > 1) {
    drawHeight = drawWidth / imgRatio;
  } else {
    drawWidth = drawHeight * imgRatio;
  }
  
  const imgX = margin + (boxSize - drawWidth) / 2;
  const imgY = margin + (boxSize - drawHeight) / 2;
  ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);
  
  // 3. Génération & Dessin du QR Code (à droite)
  const qrUrl = `${window.location.origin}/audio/${artwork.id}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: boxSize, color: { dark: '#000000', light: '#ffffff' } });
  
  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.src = qrDataUrl;
  });
  
  const qrX = WIDTH - margin - boxSize;
  ctx.drawImage(qrImg, qrX, margin, boxSize, boxSize);
  
  // 4. Dessin du Texte (au centre)
  const textStartX = margin + boxSize + 60;
  const textEndX = qrX - 60;
  const textCenter = textStartX + (textEndX - textStartX) / 2;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Titre / Numéro avec redimensionnement automatique si trop long
  const maxTextWidth = textEndX - textStartX;
  let fontSize = 72;
  const displayTitle = artwork.photo_number ? `${artwork.photo_number} - ${artwork.title}` : artwork.title;
  
  ctx.font = `bold ${fontSize}px sans-serif`;
  while (ctx.measureText(displayTitle).width > maxTextWidth && fontSize > 24) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px sans-serif`;
  }
  
  ctx.fillStyle = '#0f172a'; // Bleu ardoise très sombre
  ctx.fillText(displayTitle, textCenter, HEIGHT / 2 - 25);
  
  // Sous-titre
  ctx.font = 'normal 32px sans-serif';
  ctx.fillStyle = '#64748b'; // Gris ardoise
  ctx.fillText('Scannez le QR Code pour l\'audiodescription', textCenter, HEIGHT / 2 + 55);
  
  const titleBoxSize = 300;
  
  // 5. Téléchargement de l'image
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');
  link.download = `Cartel_${artwork.photo_number || '00'}_${artwork.title.substring(0, 15).replace(/\s/g, "")}.jpg`;
  link.href = dataUrl;
  
  // Simulation de clic pour forcer le téléchargement
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
