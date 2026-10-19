import QRCode from 'qrcode';

// 300 DPI ≈ 118,11 pixels par cm.
const PX_PER_CM = 118.11;

export async function downloadCartelJPEG(
  artwork: { id: string, title: string, photo_number?: string, image_url: string },
  opts?: { widthCm?: number; heightCm?: number }
) {
  // Dimensions du cartel : personnalisables par club (siteConfig), défauts 17 × 4 cm.
  const widthCm = opts?.widthCm ?? 17;
  const heightCm = opts?.heightCm ?? 4;
  const tabCm = 2; // languette de pliage, fixe

  const WIDTH = Math.round(widthCm * PX_PER_CM);
  const CONTENT_HEIGHT = Math.round(heightCm * PX_PER_CM);
  const TAB_HEIGHT = Math.round(tabCm * PX_PER_CM);

  // Échelle proportionnelle : toutes les tailles de police / marges
  // dérivent de la largeur, la mise en page reste équilibrée.
  const SCALE = WIDTH / 2000;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = CONTENT_HEIGHT + TAB_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // 1. Fond blanc pur sur TOUTE la surface
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bordure (traits de coupe) autour du gabarit total
  ctx.strokeStyle = '#e2e8f0'; // slate-200
  ctx.lineWidth = 4 * SCALE;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // Ligne de Pliure en pointillés (à 2cm du bord haut)
  ctx.beginPath();
  ctx.setLineDash([20 * SCALE, 15 * SCALE]);
  ctx.moveTo(0, TAB_HEIGHT);
  ctx.lineTo(WIDTH, TAB_HEIGHT);
  ctx.strokeStyle = '#cbd5e1'; // slate-300
  ctx.lineWidth = 2 * SCALE;
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Décalage vertical : le contenu se dessine sous la languette.
  ctx.translate(0, TAB_HEIGHT);

  const HEIGHT = CONTENT_HEIGHT;
  const margin = 35 * SCALE;
  const boxSize = HEIGHT - margin * 2;

  // Récupération & Dessin de la Photo (à gauche)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Erreur de chargement d'image pour le cartel"));
    fetch(artwork.image_url)
      .then(res => res.blob())
      .then(blob => {
        img.src = URL.createObjectURL(blob);
      }).catch(reject);
  });

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
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    margin: 1,
    width: Math.round(boxSize),
    color: { dark: '#000000', light: '#ffffff' },
  });

  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.src = qrDataUrl;
  });

  const qrX = WIDTH - margin - boxSize;
  ctx.drawImage(qrImg, qrX, margin, boxSize, boxSize);

  // 4. Dessin du Texte (au centre)
  const textStartX = margin + boxSize + 60 * SCALE;
  const textEndX = qrX - 60 * SCALE;
  const textCenter = (textStartX + textEndX) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Titre / Numéro avec redimensionnement automatique si trop long
  const maxTextWidth = textEndX - textStartX;
  let fontSize = 72 * SCALE;
  const displayTitle = artwork.photo_number ? `${artwork.photo_number} - ${artwork.title}` : artwork.title;

  ctx.font = `bold ${fontSize}px sans-serif`;
  while (ctx.measureText(displayTitle).width > maxTextWidth && fontSize > 24 * SCALE) {
    fontSize -= 2 * SCALE;
    ctx.font = `bold ${fontSize}px sans-serif`;
  }

  ctx.fillStyle = '#0f172a';
  ctx.fillText(displayTitle, textCenter, HEIGHT / 2 - 25 * SCALE);

  // Sous-titre
  ctx.font = `normal ${32 * SCALE}px sans-serif`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Scannez le QR Code pour l\'audiodescription', textCenter, HEIGHT / 2 + 55 * SCALE);

  // 5. Téléchargement de l'image
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');
  link.download = `Cartel_${artwork.photo_number || '00'}_${artwork.title.substring(0, 15).replace(/\s/g, "")}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}