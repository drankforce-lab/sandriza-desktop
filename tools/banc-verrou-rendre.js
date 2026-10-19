/* ══ BANC : « verrou:rendre » NOMME TOUJOURS SA FICHE (2026-10-19, audit — lot S1) ═══════════════════════
   Le site tient désormais un verrou PAR (portée, id) : `verrou:rendre` sans dire laquelle est refusé
   (`portee_requise`) — la fenêtre ne rendrait plus rien, et sa fiche resterait « en traitement » chez les
   collègues. Ce banc lit toutes les fenêtres et exige :
     1. chaque appel à `verrou:rendre` passe une portée (chaîne) ET un identifiant :
          P.appeler('verrou:rendre', 'orders', ID)   ou   appeler('verrou:rendre', ['orders', ID]) ;
     2. toute fenêtre qui PREND un verrou (`verrou:prendre`) le REND quelque part.
   Panne provoquée intégrée : le même contrôle appliqué à un appel nu doit le refuser.
     node tools/banc-verrou-rendre.js */
'use strict';
const fs = require('fs');
const path = require('path');
const DOS = path.join(__dirname, '..', 'src', 'fenetres');

// Un appel est juste s'il nomme une portée littérale suivie d'un identifiant.
const APPEL = /appeler\(\s*'verrou:rendre'\s*(,\s*\[?\s*'[a-z_]+'\s*,\s*(?:[A-Za-z_][\w.]*|'[\w-]+')\s*\]?)?\s*\)/g;
const fautesDe = (src) => {
  const out = [];
  let m;
  APPEL.lastIndex = 0;
  while ((m = APPEL.exec(src))) { if (!m[1]) out.push(m[0]); }
  // Tout autre appel à verrou:rendre que la forme ci-dessus ne reconnaît pas compte aussi comme faute.
  const tous = (src.match(/'verrou:rendre'/g) || []).length;
  const reconnus = (src.match(APPEL) || []).length;
  if (tous > reconnus) out.push((tous - reconnus) + ' appel(s) de forme inconnue');
  return out;
};

let ko = 0, n = 0;
for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js'))) {
  const src = fs.readFileSync(path.join(DOS, f), 'utf8');
  const prend = /'verrou:prendre'/.test(src), rend = /'verrou:rendre'/.test(src);
  if (!prend && !rend) continue;
  n++;
  const fautes = fautesDe(src);
  if (fautes.length) { ko++; console.log('  ✗ ' + f + ' : verrou:rendre sans [portée, id] — ' + fautes.join(' | ')); }
  if (prend && !rend) { ko++; console.log('  ✗ ' + f + ' : prend un verrou et ne le rend jamais'); }
}
// Panne provoquée : un appel nu DOIT être attrapé, sinon le banc ne prouve rien.
if (!fautesDe("try { P.appeler('verrou:rendre'); } catch (e) {}").length || !fautesDe("appeler('verrou:rendre', [])").length) {
  ko++; console.log('  ✗ le contrôle laisse passer un appel nu : il ne garde rien');
}
console.log(ko ? '✗ VERROUS : ' + ko + ' faute(s)' : '✓ VERROUS : ' + n + ' fenêtres, chaque verrou pris est rendu, et rendu par son nom');
process.exit(ko ? 1 : 0);
