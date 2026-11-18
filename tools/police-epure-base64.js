#!/usr/bin/env node
'use strict';
/*
 * LA POLICE DU LOOK « ÉPURÉ » (relooking, 2026-11-18)
 * =============================================================================
 * Écrit src/fenetres/police-epure.js à partir de src/polices/epure/*.woff2.
 * Même raison que tools/police-en-base64.js : les fenêtres sont des documents
 * data: (origine opaque, sandbox) — une police ne s'y charge QU'EN BASE64 — et
 * l'application tourne hors ligne (jamais Google Fonts au lancement).
 * ⚠ Un dossier À PART (src/polices/epure/) : police-en-base64.js prend « la seule
 * police » de src/polices/ ; une seconde y casserait son choix par défaut.
 * Plus Jakarta Sans, variable 400–800, sous-ensemble latin, SIL OFL 1.1.
 *   node tools/police-epure-base64.js
 */
const fs = require('fs');
const path = require('path');
const DOSSIER = path.join(__dirname, '..', 'src', 'polices', 'epure');
const SORTIE = path.join(__dirname, '..', 'src', 'fenetres', 'police-epure.js');
const f = fs.readdirSync(DOSSIER).filter((x) => /\.woff2$/i.test(x));
if (f.length !== 1) { console.error('REFUS - il faut exactement un .woff2 dans src/polices/epure/ (' + f.length + ')'); process.exit(1); }
const b = fs.readFileSync(path.join(DOSSIER, f[0]));
if (b.slice(0, 4).toString('latin1') !== 'wOF2') { console.error('REFUS - ' + f[0] + ' n est pas un woff2'); process.exit(1); }
const b64 = b.toString('base64');
if (b64.length > 80000) console.warn('ATTENTION - ' + Math.round(b64.length / 1024) + ' Ko encodés, recopiés dans chaque fenêtre');
const css = '@font-face{font-family:"SzEpure";font-style:normal;font-weight:400 800;font-display:block;'
  + 'src:url(data:font/woff2;base64,' + b64 + ') format("woff2")}';
fs.writeFileSync(SORTIE, "'use strict';\n/* ⚠ FICHIER GÉNÉRÉ par tools/police-epure-base64.js — ne pas éditer à la main. "
  + f[0] + ' (SIL OFL 1.1). */\nmodule.exports = ' + JSON.stringify(css) + ';\n', 'utf8');
console.log('OK - ' + f[0] + ' → police-epure.js (' + Math.round(b64.length / 1024) + ' Ko encodés)');
