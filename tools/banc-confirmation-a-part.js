#!/usr/bin/env node
'use strict';
/* ============================================================================
   banc-confirmation-a-part.js — UNE CONFIRMATION EST UNE BOÎTE À PART (2026-10-15)
   ----------------------------------------------------------------------------
   SA RÈGLE, capture à l'appui (« Envoyer » qui devenait « Confirmer l'envoi ? ») :
   « les confirmations devraient toujours être une fenêtre à part et ce pour toute
   l'administration et non un bouton qui change », puis « les messages de
   confirmation doivent être faits de manière professionnelle ».
   ➡ Toute confirmation passe par szConfirmer (socle, JS_CONFIRMER) : une boîte
   dessinée par la page, à son thème, qui nomme l'action et ses conséquences.

   ⚠ POURQUOI UN BANC. Le motif « premier clic : le bouton devient Confirmer ? »
   était RECOPIÉ de fenêtre en fenêtre — 120 endroits dans 50 fenêtres. La
   prochaine fenêtre arrivera copiée sur une voisine ; si rien ne le refuse,
   elle arrivera avec le bouton qui change.

   CE QUI FAIT ÉCHOUER, dans src/fenetres/*.js (hors socle.js) :
     · un libellé « Confirmer … ? » (T("Confirmer ?"), T("Confirmer l’envoi ?"), …) ;
     · un libellé « Confirmer — … » (le bouton armé qui annonce l'action) ;
     · un message « Cliquez « Confirmer ? » » / « Cliquez pour confirmer » ;
     · un bouton dont le texte devient « Confirmer » sur place (textContent = …Confirmer).
   Les EXCEPTIONS sont nommées ci-dessous, avec leur motif — une liste sans motif
   redevient un trou au bout de trois mois.

   PANNE PROVOQUÉE (à rejouer si on touche à ce banc) : remettre dans une
   fenêtre `(ARME === x ? '${T("Confirmer ?")}' : '${T("Supprimer")}')` — le
   banc doit nommer la fenêtre et la ligne.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const DOS = path.join(__dirname, '..', 'src', 'fenetres');

/* Exceptions : un « Confirmer » qui n'est PAS une confirmation d'action. */
const EXCEPTIONS = [
  // Caisse : libellé du champ de saisie « Confirmer » le NIP (on retape le NIP), pas un bouton armé.
  { f: 'caisse.js', rx: /<span>\$\{T\("Confirmer"\)\}<\/span><input id="nip-conf"/ },
];

const MOTIFS = [
  [/T\("Confirmer[^"]*\?\s*"\)/, 'libellé « Confirmer … ? » (bouton armé)'],
  [/T\("Confirmer\s*[—–-]/, 'libellé « Confirmer — … » (bouton armé)'],
  [/Cliquez\s*«\s*Confirmer/, 'message « Cliquez « Confirmer ? » »'],
  [/Cliquez pour confirmer/, 'message « Cliquez pour confirmer »'],
  [/textContent\s*=\s*'\$\{T\("Confirmer/, 'bouton dont le texte devient « Confirmer » sur place'],
];

const fautes = [];
for (const f of fs.readdirSync(DOS).filter((n) => n.endsWith('.js') && n !== 'socle.js').sort()) {
  const lignes = fs.readFileSync(path.join(DOS, f), 'utf8').split(/\r?\n/);
  lignes.forEach((l, i) => {
    if (EXCEPTIONS.some((e) => e.f === f && e.rx.test(l))) return;
    for (const [rx, quoi] of MOTIFS) {
      if (rx.test(l)) { fautes.push(f + ':' + (i + 1) + '  ' + quoi + '\n      ' + l.trim().slice(0, 140)); break; }
    }
  });
}

console.log('== CONFIRMATIONS : une boîte à part (szConfirmer), jamais un bouton qui change ==');
if (fautes.length) {
  for (const x of fautes) console.log('  ✗ ' + x);
  console.log('\n>>> ' + fautes.length + ' confirmation(s) encore « bouton qui change » — passer par szConfirmer({ titre, texte, oui, danger }).');
  process.exit(1);
}
console.log('>>> aucune confirmation « bouton qui change » : toutes passent par une boîte à part');
