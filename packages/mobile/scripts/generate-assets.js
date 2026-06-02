/**
 * Générateur d'assets placeholder pour UniGest Mobile
 *
 * Crée les fichiers PNG requis par app.json avec les bonnes dimensions.
 * À remplacer par les vrais assets graphiques avant la mise en production.
 *
 * Usage : node scripts/generate-assets.js
 * Requires: npm install canvas (ou utiliser un outil externe)
 *
 * Alternative sans dépendances : utiliser Figma pour exporter les assets
 * aux dimensions exactes ci-dessous.
 */

const fs   = require('fs')
const path = require('path')

const ASSETS_DIR = path.join(__dirname, '..', 'assets')

// ─── Dimensions requises par Expo ─────────────────────────────────────────────
const ASSETS = {
  'icon.png':             { w: 1024, h: 1024, bg: '#6366f1', label: 'UG' },
  'splash.png':           { w: 1284, h: 2778, bg: '#6366f1', label: '🎓' },
  'adaptive-icon.png':    { w: 1024, h: 1024, bg: '#6366f1', label: 'UG' },
  'favicon.png':          { w:   48, h:   48, bg: '#6366f1', label: 'U'  },
  'notification-icon.png':{ w:   96, h:   96, bg: '#ffffff', label: '🔔' },
}

// ─── Instructions si canvas n'est pas dispo ───────────────────────────────────

console.log('📐 Assets requis pour UniGest Mobile :')
console.log('─'.repeat(50))

for (const [file, { w, h, bg }] of Object.entries(ASSETS)) {
  const fullPath = path.join(ASSETS_DIR, file)
  const exists   = fs.existsSync(fullPath)
  console.log(`${exists ? '✅' : '❌'} ${file.padEnd(28)} ${w}×${h}px   bg: ${bg}`)
}

console.log('')
console.log('📌 Pour générer les assets :')
console.log('')
console.log('Option A — Figma (recommandé) :')
console.log('  1. Créez un frame 1024×1024 avec fond #6366f1')
console.log('  2. Ajoutez le texte "UG" en blanc, Police Bold, taille 400')
console.log('  3. Exportez en PNG avec les dimensions de chaque asset')
console.log('')
console.log('Option B — npx expo-template-blank-assets :')
console.log('  npx expo-template-blank-assets --output ./assets')
console.log('')
console.log('Option C — Script automatique (nécessite canvas) :')
console.log('  npm install canvas --save-dev')
console.log('  node scripts/generate-assets.js --generate')

// ─── Génération automatique si --generate est passé ─────────────────────────

if (process.argv.includes('--generate')) {
  try {
    const { createCanvas } = require('canvas')

    for (const [file, { w, h, bg, label }] of Object.entries(ASSETS)) {
      const canvas  = createCanvas(w, h)
      const ctx     = canvas.getContext('2d')

      // Fond
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Texte centré
      ctx.fillStyle = '#ffffff'
      ctx.font      = `bold ${Math.floor(w * 0.25)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, w / 2, h / 2)

      // Sauvegarde
      const buffer = canvas.toBuffer('image/png')
      const out    = path.join(ASSETS_DIR, file)
      fs.writeFileSync(out, buffer)
      console.log(`✅ Généré : ${file}`)
    }

    // Notification sound placeholder (silence WAV 1 seconde)
    const silenceWav = Buffer.from(
      'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00' +
      '\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00',
      'binary',
    )
    fs.writeFileSync(path.join(ASSETS_DIR, 'notification.wav'), silenceWav)
    console.log('✅ Généré : notification.wav')

  } catch {
    console.error('❌ canvas non installé. Lancez : npm install canvas --save-dev')
    process.exit(1)
  }
}
