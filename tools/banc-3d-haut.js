#!/usr/bin/env node
/* ============================================================================
   banc-3d-haut.js — LE BANC DE RENDU DES HAUTS EN 3D (2026-10-18)
   ----------------------------------------------------------------------------
   Sa demande, sur une capture de t-shirt XS aux épaules déchirées : « je veux que
   tu te fasses des bancs de rendu… que ce soit parfait, aucun défaut ».

   Une capture ne se juge pas d'un coup d'œil en bloc : ce banc MESURE. Pour chaque
   cas (t-shirt XS et L, sweat XS, chemise M), la vraie fenêtre Atelier est ouverte
   dans Chrome sans tête (le vrai moteur WebGL, le vrai cœur du site pour la 3D), et
   la page compte, sur le maillage VISIBLE (là où la toile de la pièce est opaque) :

     éclats    triangles dont une arête est > 2 × ou < 0,4 × sa longueur au patron
               (une écharde : le tissu ne s'étire pas ainsi ; les triangles-aiguilles
               du bord découpé, < 0,02 cm² au patron, ne comptent pas) ;
     plis      paires de triangles voisins dont les normales font > 75° (pli cassé,
               pointe, triangle retourné) ;
     dedans    sommets visibles enfoncés de plus de 3 mm dans le corps ;
     fentes    en mode DIAGNOSTIC (endroit vert, envers rouge, fond vide), îlots
               d'envers ou de vide ENTOURÉS de tissu dans les gros plans d'épaule —
               une fente à la couture, un trou, l'envers vu par un interstice.
               (Les grandes ouvertures — encolure, bas de manche — sont légitimes :
               un îlot de plus de 2 % du tissu à l'image n'est pas compté.)
     couture   l'écart DESSINÉ de chaque couture (sommets de bord d'une pièce contre
               le bord de l'autre), au plus 1,5 mm.

   Options d'analyse : --profil (étirement rang par rang), --detail (par pièce),
   --zip (écart de chaque couture), --piresm (pires triangles de manche),
   --brut (la forme construite, sans ajustement au corps), --sansplis.

   Il sort aussi les images (vues normales, avec et sans mannequin, et
   diagnostiques) pour l'œil : un banc vert sur une image fausse se resserre.

     node tools/banc-3d-haut.js                 # tous les cas, verdict
     node tools/banc-3d-haut.js --cas ts-xs     # un seul cas
     node tools/banc-3d-haut.js --sortie <dossier>   # garde les images (sinon : %TEMP%)

   Chrome est lancé UNE fois par cas (5 lancements, séquentiels).

     ballon    le bombé de la tête de manche AU-DELÀ de celui du mannequin dessous ;
     épaulette la tête qui REMONTE au-dessus de la ligne d épaule prolongée (ses 3
               derniers cm jusqu au point d épaule) : une tête de t-shirt prolonge
               l épaule et tombe le long du bras.
   --tubes donne les anneaux du mannequin (bras, tronc, capsule des épaules) ; --detail
   donne aussi, par pièce, où sont les sommets dans le corps et contre quel tube.

   asym      le devant gauche contre le droit (un sommet et son miroir), rangs 8 à 25 cm :
             une torsion (seuil 0,5 cm ; les plis de vie, voulus asymétriques, font 0,3).
   arc       l écart de hauteur d un rang du devant (12, 16, 20 cm) sur |x| <= 10 : un
             motif imprimé ne doit pas s arquer (seuil 0,5 cm).
   Cas cs-xs : SON modèle — un chemisier XS à motif imprimé (texte + logo), avec la vue
   « facedessus » (au-dessus des épaules, l encolure visible) : ses deux captures.

   VERDICT : sans option, sur les PLAFONDS de non-régression (ce que le moteur atteint,
   cas par cas — voir PLAFONDS) ; --strict : sur la cible, zéro. Le reste avant zéro est
   toujours affiché.

   Linux : Chrome cherché aussi dans /usr/bin (google-chrome, chromium) ou SZ_CHROME ; le
   site (son cœur 3D) dans ../Sandriza ou SZ_SITE.
   ⚠ PAS ENCORE DANS bancs.js (2026-10-18) : sa liste est LUE dans build.yml, et la
   construction n extrait que ce dépôt — il lui faudrait AUSSI le site (un second
   checkout, SZ_SITE). Et ~50 s pour les 5 cas. À lancer à la main, sur le poste, après
   tout changement du moteur 3D (src/fenetres/atelier.js).
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
// le site (son cœur 3D, assets/js/atelier.js) : le dépôt voisin, ou SZ_SITE (une construction qui l extrait ailleurs)
const SITE = path.resolve(process.env.SZ_SITE || path.join(RACINE, '..', 'Sandriza'));
process.chdir(RACINE);
const { pageAtelier } = require('../src/fenetres/atelier.js');
const REP = require('./reponses-fenetres.js');

const ARGS = process.argv.slice(2);
const arg = (k) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : null; };
const SORTIE = path.resolve(arg('--sortie') || path.join(os.tmpdir(), 'banc-3d-haut'));
const SEUL = arg('--cas');

// ⚠ des SEUILS À ZÉRO : un défaut qui se voit n a pas de quota. L embu d une tête de manche (tissu un peu tassé ou tendu, sans
// cassure) n est pas un défaut : seuls l étirement au-delà de 2 fois et le tassement sous 0,4 fois — une écharde — comptent.
const SEUILS = { etires: 0, plis: 0, dedans: 0, fentes: 0, couture: 0.15, ballon: 0.5, epaulette: 0.3, arc: 0.5, asym: 0.5 };
/* LES PLAFONDS DE NON-RÉGRESSION (2026-10-18) : ce que le moteur ATTEINT aujourd hui, cas par cas. Sans option, le verdict (et le
   code de sortie) se juge sur eux — un banc de non-régression qu on peut lancer à chaque changement ; ce qui reste au-dessus de
   ZÉRO est toujours affiché (« reste »). --strict juge sur la cible, zéro. ⚠ Un plafond se BAISSE quand le moteur progresse,
   il ne se monte jamais pour faire passer un changement. Le reste des seuils (dedans, couture, ballon, épaulette) vaut pour tous. */
const PLAFONDS = {
  'ts-xs': { etires: 113, plis: 58, fentes: 0 },
  'ts-l': { etires: 256, plis: 106, fentes: 2 },
  'sw-xs': { etires: 241, plis: 21, fentes: 1 },
  'ch-m': { etires: 423, plis: 70, fentes: 3 },
  'cs-xs': { etires: 121, plis: 31, fentes: 2 },
};
const STRICT = ARGS.includes('--strict');

const CAS = [
  { id: 'ts-xs', base: 'tshirt', taille: 'XS', options: { encolure: 'ronde', manche: 'courte', longueur: 22 } },
  { id: 'ts-l', base: 'tshirt', taille: 'L', options: { encolure: 'ronde', manche: 'courte', longueur: 22 } },
  { id: 'sw-xs', base: 'sweat', taille: 'XS' },
  { id: 'ch-m', base: 'chemise', taille: 'M' },
  // (2026-10-18) SON modèle « Test » : un CHEMISIER, base XS, avec un MOTIF imprimé (texte + logo) — vu de face-dessus et sans mannequin
  { id: 'cs-xs', base: 'chemisier', taille: 'XS', options: { encolure: 'ronde', manche: 'courte', longueur: 20 }, motif: true },
].filter((c) => !SEUL || c.id === SEUL);
if (ARGS.includes('--brut')) CAS.forEach((c) => { c.brut = true; });
if (ARGS.includes('--sansplis')) CAS.forEach((c) => { c.sansPlis = true; });

function chrome() {
  const l = [process.env.SZ_CHROME || '',
    path.join(process.env['ProgramFiles'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Google/Chrome/Application/chrome.exe'),
    // Linux (ubuntu-latest a google-chrome) et macOS
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  return l.find((p) => p && fs.existsSync(p));
}
// on referme NOS Chrome (retrouvés par leur dossier temporaire) — voir banc-contraste-rendu.js du site
function fermerNosChrome(motif) {
  if (!motif) return;
  if (process.platform !== 'win32') { try { spawnSync('pkill', ['-f', String(motif)], { stdio: 'ignore', timeout: 30000 }); } catch (e) {} return; }
  try {
    const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command',
      "@(Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*" + String(motif).replace(/'/g, "''") + "*' }) | ForEach-Object { $_.ProcessId }"],
      { encoding: 'utf8', timeout: 60000 });
    String((r && r.stdout) || '').split(/\s+/).map(Number).filter(Boolean).forEach((pid) =>
      spawnSync('taskkill', ['/F', '/T', '/PID', String(pid)], { stdio: 'ignore', timeout: 30000 }));
  } catch (e) {}
}

/* ── La page ─────────────────────────────────────────────────────────────── */
const jeux = REP['atelier.js'] || (REP.REPONSES && REP.REPONSES['atelier.js']);
const scen = jeux[0];

// le script du banc, dans la page (ES5, aucune dépendance)
const SCRIPT_PAGE = function () {
  var B = window.__szBanc3d, CAS = B.cas, n0 = Date.now();
  function log(s) { console.log(s); }
  function envoyer(cle, txt) { var T = 3000; for (var i = 0, k = 0; i < txt.length; i += T, k++) log('BANC3D|' + cle + '|' + k + '|' + txt.slice(i, i + T)); log('BANC3D|' + cle + '|fin|'); }
  function attendre() {
    var mo = B.moteur, v = mo && mo.v3(), g = mo && mo.glv();
    if (Date.now() - n0 > 60000) { envoyer('erreur', 'le moteur ne s est pas construit'); log('BANC3D-FIN'); return; }
    if (!v || !g || !g.mailles || !g.mailles.length || !g.cam) { setTimeout(attendre, 250); return; }
    setTimeout(function () { try { mesurer(); } catch (e) { envoyer('erreur', String(e && e.stack || e)); } log('BANC3D-FIN'); }, 2500);
  }
  function alphaDe(ma) {
    var tc = ma.pc.toile, w = 256, h = Math.max(16, Math.round(256 * tc.height / tc.width));
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.drawImage(tc, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h).data;
    return function (u, v) { var x = Math.max(0, Math.min(w - 1, Math.floor(u * w))), y = Math.max(0, Math.min(h - 1, Math.floor(v * h))); return d[(y * w + x) * 4 + 3]; };
  }
  function geo(tubes) {
    var res = { etires: 0, plis: 0, dedans: 0, triVisibles: 0, pires: [], parPiece: {} };
    var g = B.moteur.glv();
    g.mailles.forEach(function (ma, mi) {
      // ce qui est DESSINÉ : le maillage conforme s il existe (tout y est dans la pièce), sinon la grille découpée par la toile
      var rd = ma.rendu || ma, conf = !!ma.rendu;
      var cle = ma.pid + mi, cpt = res.parPiece[cle] = { etires: 0, plis: 0, rangs: {} }, fautif = new Uint8Array(rd.pos.length / 3);
      var P = rd.pos, I = rd.idx, U = rd.uv, A = conf ? function () { return 255; } : alphaDe(ma), bb = ma.pc.bb, bw = bb.x1 - bb.x0, bh = bb.y1 - bb.y0;
      var nt = I.length / 3, vis = new Uint8Array(nt), nrm = new Float32Array(nt * 3), aretes = {};
      for (var t = 0; t < nt; t++) {
        var a = I[t * 3], b = I[t * 3 + 1], c = I[t * 3 + 2];
        var uc = (U[a * 2] + U[b * 2] + U[c * 2]) / 3, vc = (U[a * 2 + 1] + U[b * 2 + 1] + U[c * 2 + 1]) / 3;
        if (A(uc, vc) < 128 || A(U[a * 2], U[a * 2 + 1]) < 128 || A(U[b * 2], U[b * 2 + 1]) < 128 || A(U[c * 2], U[c * 2 + 1]) < 128) continue;
        // l aire du triangle AU PATRON : un triangle-aiguille (bord découpé, < 0,02 cm²) ne se voit pas — ni son étirement ni son pli
        var aP = Math.abs((U[b * 2] - U[a * 2]) * bw * (U[c * 2 + 1] - U[a * 2 + 1]) * bh - (U[b * 2 + 1] - U[a * 2 + 1]) * bh * (U[c * 2] - U[a * 2]) * bw) / 2;
        if (aP < 0.02) { vis[t] = 2; res.triVisibles++; continue; }
        vis[t] = 1; res.triVisibles++;
        var ex = P[b * 3] - P[a * 3], ey = P[b * 3 + 1] - P[a * 3 + 1], ez = P[b * 3 + 2] - P[a * 3 + 2];
        var fx = P[c * 3] - P[a * 3], fy = P[c * 3 + 1] - P[a * 3 + 1], fz = P[c * 3 + 2] - P[a * 3 + 2];
        var nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx, nl = Math.hypot(nx, ny, nz) || 1;
        nrm[t * 3] = nx / nl; nrm[t * 3 + 1] = ny / nl; nrm[t * 3 + 2] = nz / nl;
        var pire = 1, ok = true;
        [[a, b], [b, c], [c, a]].forEach(function (e) {
          var L3 = Math.hypot(P[e[1] * 3] - P[e[0] * 3], P[e[1] * 3 + 1] - P[e[0] * 3 + 1], P[e[1] * 3 + 2] - P[e[0] * 3 + 2]);
          var L2 = Math.hypot((U[e[1] * 2] - U[e[0] * 2]) * bw, (U[e[1] * 2 + 1] - U[e[0] * 2 + 1]) * bh);
          if (L2 < 0.05) return;
          var s = L3 / L2; if (s > 2.0 || s < 0.4) { ok = false; if (Math.abs(Math.log(s)) > Math.abs(Math.log(pire))) pire = s; }
          var k = Math.min(e[0], e[1]) + '_' + Math.max(e[0], e[1]); (aretes[k] = aretes[k] || []).push(t);
        });
        if (!ok && conf && ma.pid === 'manche' && (res.piresManche = res.piresManche || []).length < 40) res.piresManche.push([Math.round(rd.vx[a] * 10) / 10, Math.round(rd.vy[a] * 10) / 10, Math.round(pire * 100) / 100]);
        if (!ok && conf && ma.pid === 'manche' && (!res.pireTri || pire > res.pireTri.s)) res.pireTri = { s: pire, v: [a, b, c].map(function (q) { return [rd.vx[q], rd.vy[q], P[q * 3], P[q * 3 + 1], P[q * 3 + 2]].map(function (x) { return Math.round(x * 100) / 100; }); }) };
        if (!ok) { cpt[pire > 1 ? 'tire' : 'tasse'] = (cpt[pire > 1 ? 'tire' : 'tasse'] || 0) + 1; if (pire > 1 && conf && (cpt.exTire = cpt.exTire || []).length < 5) cpt.exTire.push([Math.round(rd.vx[a] * 10) / 10, Math.round(rd.vy[a] * 10) / 10, Math.round(pire * 100) / 100]); if (pire < 1 && conf && (cpt.exTasse = cpt.exTasse || []).length < 5) cpt.exTasse.push([Math.round(rd.vx[a] * 10) / 10, Math.round(rd.vy[a] * 10) / 10, Math.round(pire * 100) / 100]); }
        if (!ok) { cpt.etires++; var rg = conf ? 0 : Math.floor(Math.floor(a / (ma.J + 1)) / 4) * 4; cpt.rangs[rg] = (cpt.rangs[rg] || 0) + 1; fautif[a] = fautif[b] = fautif[c] = 1; res.etires++; if (res.pires.length < 12) res.pires.push({ pid: ma.pid, s: Math.round(pire * 100) / 100, p: [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]].map(function (x) { return Math.round(x * 10) / 10; }) }); }
      }
      Object.keys(aretes).forEach(function (k) {
        var l = aretes[k]; if (l.length !== 2 || vis[l[0]] !== 1 || vis[l[1]] !== 1) return;
        var d = nrm[l[0] * 3] * nrm[l[1] * 3] + nrm[l[0] * 3 + 1] * nrm[l[1] * 3 + 1] + nrm[l[0] * 3 + 2] * nrm[l[1] * 3 + 2];
        if (d < Math.cos(75 * Math.PI / 180)) { res.plis++; cpt.plis++; if (conf && (cpt.exPlis = cpt.exPlis || []).length < 30) { var va = I[l[0] * 3]; cpt.exPlis.push([Math.round(rd.vx[va] * 10) / 10, Math.round(rd.vy[va] * 10) / 10, Math.round(Math.acos(Math.max(-1, d)) * 180 / Math.PI)]); } [l[0], l[1]].forEach(function (tt) { fautif[I[tt * 3]] = fautif[I[tt * 3 + 1]] = fautif[I[tt * 3 + 2]] = 2; }); }
      });
      // collision : les sommets des triangles visibles, contre les tubes du corps
      var vu = new Uint8Array(P.length / 3);
      for (var t2 = 0; t2 < nt; t2++) if (vis[t2]) { vu[I[t2 * 3]] = 1; vu[I[t2 * 3 + 1]] = 1; vu[I[t2 * 3 + 2]] = 1; }
      for (var k2 = 0; k2 < vu.length; k2++) if (vu[k2] && enfonce(tubes, P[k2 * 3], P[k2 * 3 + 1], P[k2 * 3 + 2]) > 0.3) { res.dedans++; fautif[k2] = 3; if ((cpt.exDedans = cpt.exDedans || []).length < 6) cpt.exDedans.push([rd.vx ? Math.round(rd.vx[k2] * 10) / 10 : '-', rd.vy ? Math.round(rd.vy[k2] * 10) / 10 : '-', Math.round(P[k2 * 3] * 10) / 10, Math.round(P[k2 * 3 + 1] * 10) / 10, Math.round(P[k2 * 3 + 2] * 10) / 10, enfonce.qui, Math.round(enfonce(tubes, P[k2 * 3], P[k2 * 3 + 1], P[k2 * 3 + 2]) * 100) / 100]); }
      // la teinte des défauts (vue « defauts ») : étiré rouge, pli cassé bleu, dans le corps magenta
      var K = new Float32Array(fautif.length * 4), COL = [null, [1, 0, 0], [0, 0.3, 1], [1, 0, 1]];
      for (var k3 = 0; k3 < fautif.length; k3++) if (fautif[k3]) { var cc = COL[fautif[k3]]; K[k3 * 4] = cc[0]; K[k3 * 4 + 1] = cc[1]; K[k3 * 4 + 2] = cc[2]; K[k3 * 4 + 3] = 1; }
      var gl = g.gl; gl.bindBuffer(gl.ARRAY_BUFFER, ma.bK); gl.bufferData(gl.ARRAY_BUFFER, K, gl.STATIC_DRAW); ma.kDefauts = K;
      var PC = { devant: [0.1, 0.8, 0.2], dos: [0.2, 0.4, 1], manche: [1, 0.2, 0.2] }[ma.pid] || [1, 1, 0], KP = new Float32Array(fautif.length * 4);
      for (var k4 = 0; k4 < fautif.length; k4++) { KP[k4 * 4] = PC[0]; KP[k4 * 4 + 1] = PC[1]; KP[k4 * 4 + 2] = PC[2]; KP[k4 * 4 + 3] = 1; } ma.kPieces = KP;
    });
    return res;
  }
  // la profondeur (cm) d un point dans le corps : 0 s il est dehors (même géométrie que repousser)
  function enfonce(tubes, x, y, z) {
    var pire = 0;
    for (var t = 0; t < tubes.length; t++) {
      var T = tubes[t], q = (x - T.c0.x) * T.ax[0] + (y - T.c0.y) * T.ax[1] + (z - (T.c0.z || 0)) * T.ax[2];
      if (q < T.pmin || q > T.pmax) continue;
      var an = T.an, pr = T.proj, i = 0, mont = pr[pr.length - 1] > pr[0];
      while (i + 1 < pr.length - 1 && (mont ? pr[i + 1] < q : pr[i + 1] > q)) i++;
      var u = Math.max(0, Math.min(1, (q - pr[i]) / ((pr[i + 1] - pr[i]) || 1))), a = an[i], b = an[i + 1];
      var cx = a.c.x + (b.c.x - a.c.x) * u, cy = a.c.y + (b.c.y - a.c.y) * u, cz = (a.c.z || 0) + ((b.c.z || 0) - (a.c.z || 0)) * u;
      var rx = a.rx + (b.rx - a.rx) * u, rz = a.rz + (b.rz - a.rz) * u;
      var dx = x - cx, dy = y - cy, dz = z - cz, pa = dx * T.ax[0] + dy * T.ax[1] + dz * T.ax[2];
      dx -= T.ax[0] * pa; dy -= T.ax[1] * pa; dz -= T.ax[2] * pa;
      var e; if (T.vertical) e = Math.sqrt((dx / rx) * (dx / rx) + (dz / rz) * (dz / rz));
      else { var uu = T.u, du = dx * uu[0] + dy * uu[1] + dz * uu[2]; e = Math.sqrt((du / rx) * (du / rx) + (dz / rz) * (dz / rz)); }
      if (e < 1 && (1 - e) * Math.min(rx, rz) > pire) { pire = (1 - e) * Math.min(rx, rz); enfonce.qui = T.nom; }
    }
    return pire;
  }
  // la distance (cm) d un point au corps, DEHORS : la plus petite sur tous les tubes (même géométrie que repousser)
  function ecartCorps(tubes, x, y, z) {
    var best = 1e9;
    for (var t = 0; t < tubes.length; t++) {
      var T = tubes[t], q = (x - T.c0.x) * T.ax[0] + (y - T.c0.y) * T.ax[1] + (z - (T.c0.z || 0)) * T.ax[2];
      if (q < T.pmin - 0.5 || q > T.pmax + 0.5) continue;
      var an = T.an, pr = T.proj, i = 0, mont = pr[pr.length - 1] > pr[0];
      while (i + 1 < pr.length - 1 && (mont ? pr[i + 1] < q : pr[i + 1] > q)) i++;
      var u = Math.max(0, Math.min(1, (q - pr[i]) / ((pr[i + 1] - pr[i]) || 1))), a = an[i], b = an[i + 1];
      var cx = a.c.x + (b.c.x - a.c.x) * u, cy = a.c.y + (b.c.y - a.c.y) * u, cz = (a.c.z || 0) + ((b.c.z || 0) - (a.c.z || 0)) * u;
      var rx = a.rx + (b.rx - a.rx) * u, rz = a.rz + (b.rz - a.rz) * u;
      var dx = x - cx, dy = y - cy, dz = z - cz, pa = dx * T.ax[0] + dy * T.ax[1] + dz * T.ax[2];
      dx -= T.ax[0] * pa; dy -= T.ax[1] * pa; dz -= T.ax[2] * pa;
      var e, rr; if (T.vertical) { e = Math.sqrt((dx / rx) * (dx / rx) + (dz / rz) * (dz / rz)); }
      else { var uu = T.u, du = dx * uu[0] + dy * uu[1] + dz * uu[2]; e = Math.sqrt((du / rx) * (du / rx) + (dz / rz) * (dz / rz)); }
      rr = Math.hypot(dx, dy, dz) || 1e-6; var dd = Math.max(0, rr - rr / Math.max(e, 1e-6));
      if (dd < best) { best = dd; ecartCorps.pied = [x - dx / rr * dd, y - dy / rr * dd, z - dz / rr * dd]; }
    }
    return best;
  }
  // LA BOSSE DE LA TÊTE DE MANCHE : sur la moitié haute de la tête (sous le bord de tête, jusqu au bas de la tête), l écart du tissu
  // au corps (bras, épaules). Une tête de t-shirt prolonge l épaule et tombe le long du bras : elle ne s en écarte que de l aisance.
  function bosseTete(tubes) {
    var g = B.moteur.glv(), pire = 0, ou = null, sommet = 0, souOu = null;
    g.mailles.forEach(function (ma) {
      if (ma.pid !== 'manche' || !ma.rendu || !ma.bordTeteY) return;
      var c = ma.pc.p.contour, ch = Math.max(c[0].y, c[2].y), W = c[2].x - c[0].x, rd = ma.rendu;
      for (var v = 0; v < rd.n; v++) {
        var x = rd.vx[v], y = rd.vy[v]; if (Math.abs(x) > W / 3 || y > ch + 1 || y < ma.bordTeteY(x) + 0.3) continue;
        var e = ecartCorps(tubes, rd.pos[v * 3], rd.pos[v * 3 + 1], rd.pos[v * 3 + 2]);
        if (e > pire && e < 1e8) { pire = e; ou = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; }
        if (Math.abs(x) < 3 && e < 1e8 && e > sommet) { sommet = e; souOu = [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round((y - ma.bordTeteY(x)) * 10) / 10]; }
      }
    });
    // LA BOSSE au sens de la silhouette : sur le profil du SOMMET de tête (la colonne du milieu), la hauteur au-dessus de la droite qui
    // va du point d épaule (le bord de tête) au bras 4 cm sous le bas de la tête. Une tête qui prolonge l épaule et tombe le long du
    // bras reste près de cette droite ; une manche ballon s en écarte vers le dehors.
    var ballon = 0;
    g.mailles.forEach(function (ma) {
      if (ma.pid !== 'manche' || !ma.rendu) return;
      var c = ma.pc.p.contour, ch = Math.max(c[0].y, c[2].y), rd = ma.rendu, col = [];
      for (var v = 0; v < rd.n; v++) if (Math.abs(rd.vx[v]) < 0.35 && rd.vy[v] <= ch + 4.2) col.push(v);
      col.sort(function (a, b) { return rd.vy[a] - rd.vy[b]; });
      if (col.length < 4) return;
      var P = rd.pos, N = rd.nor;
      // le bombé d un profil (liste de points) au-dessus de sa corde, du côté de la normale
      var bombe = function (pts) {
        var A = pts[0], Bp = pts[pts.length - 1], ax = [Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]], l2 = ax[0] * ax[0] + ax[1] * ax[1] + ax[2] * ax[2] || 1, m = 0;
        pts.forEach(function (p, i) { var w = [p[0] - A[0], p[1] - A[1], p[2] - A[2]], t = (w[0] * ax[0] + w[1] * ax[1] + w[2] * ax[2]) / l2;
          var pp = [w[0] - ax[0] * t, w[1] - ax[1] * t, w[2] - ax[2] * t], v = col[i]; if (pp[0] * N[v * 3] + pp[1] * N[v * 3 + 1] + pp[2] * N[v * 3 + 2] > 0) m = Math.max(m, Math.hypot(pp[0], pp[1], pp[2])); });
        return m;
      };
      var tissu = col.map(function (v) { return [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]]; });
      // le même profil SUR LE CORPS (le pied de chaque point) : le bombé du mannequin lui-même ; seul l EXCÈS fait la manche ballon
      var corps = tissu.map(function (p) { ecartCorps.pied = null; ecartCorps(tubes, p[0], p[1], p[2]); return ecartCorps.pied || p; });
      ballon = Math.max(ballon, bombe(tissu) - bombe(corps));
    });
    // L ÉPAULETTE : la tête ne doit jamais REMONTER au-dessus de la ligne d épaule prolongée (ses 3 derniers cm jusqu au point d épaule du
    // devant, puis au-delà). Mesuré indépendamment du mannequin : une épaulette ou une manche ballon dépasse cette ligne.
    var monte = 0, monteOu = null, dv = g.mailles.filter(function (m) { return m.pid === 'devant' && m.rendu; })[0];
    if (dv) {
      var cf = dv.pc.p.contour, rdv = dv.rendu, proche = function (px, py) { var b = -1, bd = 1e9; for (var v = 0; v < rdv.n; v++) { var d = Math.hypot(rdv.vx[v] - px, rdv.vy[v] - py); if (d < bd) { bd = d; b = v; } } return [rdv.pos[b * 3], rdv.pos[b * 3 + 1], rdv.pos[b * 3 + 2]]; };
      g.mailles.forEach(function (ma) {
        if (ma.pid !== 'manche' || !ma.rendu) return;
        var rd = ma.rendu, sx = 0; for (var v0 = 0; v0 < rd.n; v0++) sx += rd.pos[v0 * 3]; var S = sx >= 0 ? 1 : -1;
        // la ligne d épaule LOCALE : les 3 derniers cm de la couture (une épaule arrondie près du cou n a pas à compter)
        var lE = Math.hypot(cf[1].x - cf[2].x, cf[1].y - cf[2].y) || 1, f3 = Math.min(1, 3 / lE);
        var N0 = proche(S * (cf[2].x + (cf[1].x - cf[2].x) * f3), cf[2].y + (cf[1].y - cf[2].y) * f3), E0 = proche(S * cf[2].x, cf[2].y);
        var hx = E0[0] - N0[0], hz = E0[2] - N0[2], hl = Math.hypot(hx, hz) || 1, pente = (E0[1] - N0[1]) / hl;
        for (var v = 0; v < rd.n; v++) {
          if (Math.abs(rd.vx[v]) > 3 || rd.vy[v] > 6) continue;
          var px = rd.pos[v * 3] - N0[0], pz = rd.pos[v * 3 + 2] - N0[2], s = (px * hx + pz * hz) / hl;
          if (s < hl) continue;                                  // seulement au-delà du point d épaule
          var hm = rd.pos[v * 3 + 1] - (N0[1] + pente * s); if (hm > monte) { monte = hm; monteOu = [Math.round(rd.vx[v] * 10) / 10, Math.round(rd.vy[v] * 10) / 10, Math.round((s - hl) * 10) / 10]; }
        }
      });
    }
    // L ARC DES RANGS (2026-10-18, son motif : le texte s arquait sur la poitrine) : un rang du patron devant doit rester à peu
    // près à niveau ; l écart de hauteur 3D d un rang (12, 16, 20 cm sous la ligne), sur |x| <= 10
    var arc = 0, arcOu = null;
    if (dv) [12, 16, 20].forEach(function (yr) { var lo = 1e9, hi = -1e9, rdv2 = dv.rendu;
      for (var v = 0; v < rdv2.n; v++) if (Math.abs(rdv2.vy[v] - yr) < 0.35 && Math.abs(rdv2.vx[v]) <= 10) { lo = Math.min(lo, rdv2.pos[v * 3 + 1]); hi = Math.max(hi, rdv2.pos[v * 3 + 1]); }
      if (hi > lo && hi - lo > arc) { arc = hi - lo; arcOu = yr; } });
    // LA SYMÉTRIE DU DEVANT (2026-10-18, son motif vu de dessus semblait penché) : un sommet (x, y) du patron et son miroir (-x, y)
    // doivent être symétriques en 3D (x opposés, même hauteur, même profondeur) ; le plus grand écart, rangs 8 à 25 cm, |x| <= 12
    var asym = 0, asymOu = null;
    if (dv) { var rS = dv.rendu, cleS = {};
      for (var v = 0; v < rS.n; v++) cleS[Math.round(rS.vx[v] * 100) + '_' + Math.round(rS.vy[v] * 100)] = v;
      for (var v2 = 0; v2 < rS.n; v2++) { if (rS.vx[v2] <= 0.5 || rS.vx[v2] > 12 || rS.vy[v2] < 8 || rS.vy[v2] > 25) continue;
        var w2 = cleS[Math.round(-rS.vx[v2] * 100) + '_' + Math.round(rS.vy[v2] * 100)]; if (w2 === undefined) continue;
        var e2 = Math.max(Math.abs(rS.pos[v2 * 3] + rS.pos[w2 * 3]), Math.abs(rS.pos[v2 * 3 + 1] - rS.pos[w2 * 3 + 1]), Math.abs(rS.pos[v2 * 3 + 2] - rS.pos[w2 * 3 + 2]));
        if (e2 > asym) { asym = e2; asymOu = [Math.round(rS.vx[v2] * 10) / 10, Math.round(rS.vy[v2] * 10) / 10, [0, 1, 2].map(function (c) { return Math.round((c ? rS.pos[v2 * 3 + c] - rS.pos[w2 * 3 + c] : rS.pos[v2 * 3] + rS.pos[w2 * 3]) * 100) / 100; })]; } } }
    return { asym: Math.round(asym * 100) / 100, asymOu: asymOu, arc: Math.round(arc * 100) / 100, arcOu: arcOu, cm: Math.round(pire * 100) / 100, ou: ou, sommet: Math.round(sommet * 100) / 100, sommetOu: souOu, ballon: Math.round(ballon * 100) / 100, monte: Math.round(monte * 100) / 100, monteOu: monteOu };
  }
  // un point visé : le haut de la tête de manche (côté sg), en 3D
  function epaule(sg) {
    var g = B.moteur.glv(), best = null;
    g.mailles.forEach(function (ma) {
      if (ma.pid !== 'manche') return;
      var P = ma.pos, sx = 0; for (var k = 0; k < P.length; k += 3) sx += P[k]; if ((sx >= 0 ? 1 : -1) !== sg) return;
      for (var k2 = 0; k2 < P.length; k2 += 3) if (!best || P[k2 + 1] > best[1]) best = [P[k2], P[k2 + 1], P[k2 + 2]];
    });
    return best;
  }
  function cou() {
    var g = B.moteur.glv(), best = null;
    g.mailles.forEach(function (ma) { if (ma.pid !== 'devant') return; var P = ma.pos; for (var k = 0; k < P.length; k += 3) if (Math.abs(P[k]) < 1.5 && (!best || P[k + 1] > best[1])) best = [P[k], P[k + 1], P[k + 2]]; });
    return best;
  }
  function viser(v, cible, zoom) {
    var mo = B.moteur, g = mo.glv(), cv = document.getElementById('v3-canevas');
    v.zoom = zoom; v.px = 0; v.py = 0; mo.peindre();
    if (!cible) return;
    var M = g.cam.M, w = M[12] * cible[0] + M[13] * cible[1] + M[14] * cible[2] + M[15];
    var sx = ((M[0] * cible[0] + M[1] * cible[1] + M[2] * cible[2] + M[3]) / w * 0.5 + 0.5) * g.cam.W;
    var sy = (0.5 - (M[4] * cible[0] + M[5] * cible[1] + M[6] * cible[2] + M[7]) / w * 0.5) * g.cam.H;
    v.px = g.cam.W / 2 - sx; v.py = g.cam.H / 2 - sy; mo.peindre();
  }
  // les îlots d envers ou de vide entourés de tissu, dans une image diagnostique
  function fentes(cv) {
    var W = cv.width, H = cv.height, c = document.createElement('canvas'); c.width = W; c.height = H;
    var gx = c.getContext('2d'); gx.drawImage(cv, 0, 0); var d = gx.getImageData(0, 0, W, H).data;
    var cl = new Uint8Array(W * H), tissu = 0;           // 1 = endroit, 2 = envers ou vide
    for (var p = 0; p < W * H; p++) { var r = d[p * 4], gg = d[p * 4 + 1], a = d[p * 4 + 3]; if (a > 200 && gg > 150 && r < 100) { cl[p] = 1; tissu++; } else if (a < 30 || (r > 150 && gg < 100)) cl[p] = 2; else cl[p] = 1; }
    var vu = new Uint8Array(W * H), n = 0, pile = [], ilots = [];
    for (var s = 0; s < W * H; s++) {
      if (cl[s] !== 2 || vu[s]) continue;
      var aire = 0, bord = false, x0 = W, y0 = H, x1 = 0, y1 = 0; pile.push(s); vu[s] = 1;
      while (pile.length) { var q = pile.pop(), x = q % W, y = (q - x) / W; aire++; if (x === 0 || y === 0 || x === W - 1 || y === H - 1) bord = true;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        [q - 1, q + 1, q - W, q + W].forEach(function (z) { if (z >= 0 && z < W * H && !vu[z] && cl[z] === 2 && Math.abs((z % W) - x) <= 1) { vu[z] = 1; pile.push(z); } }); }
      if (bord || aire < 4 || aire > tissu * 0.02) continue;
      n++; if (ilots.length < 10) ilots.push({ aire: aire, x: x0, y: y0, l: x1 - x0 + 1, h: y1 - y0 + 1 });
    }
    return { n: n, ilots: ilots };
  }
  function mesurer() {
    var mo = B.moteur, v = mo.v3(), g = mo.glv(), cv = document.getElementById('v3-canevas');
    var res = { cas: CAS.id, geo: geo(mo.tubes()), fentes: 0, vues: {} };
    res.ecarts = (g.ecarts || []).concat([g.ecartsAvantZip || {}]); 
    res.bosse = bosseTete(mo.tubes());
    res.tubes = mo.tubes().map(function (T) { var a = T.an[0], b = T.an[T.an.length - 1]; return [T.nom, T.an.length, (T.nom === "tronc" ? T.an.slice(-12) : T.an.slice(0, 9)).map(function (q) { return [q.c.x, q.c.y, q.rx, q.rz].map(function (x) { return Math.round(x * 10) / 10; }); }), [a.c.x, a.c.y, a.c.z || 0, a.rx, a.rz].map(function (x) { return Math.round(x * 10) / 10; }), [b.c.x, b.c.y, b.c.z || 0, b.rx, b.rz].map(function (x) { return Math.round(x * 10) / 10; })]; }); res.erreurConf = g.erreurConf || ''; res.ecartsRendus = g.ecartsRendus || {}; res.loft = (g.loft || []).filter(function (l) { return l[3] > 0.3; }).slice(0, 30);
    // le profil rang par rang (devant, première manche) : étirement horizontal et vertical moyens, en ‰ de la longueur au patron
    res.profil = {};
    g.mailles.forEach(function (ma, mi) {
      if (ma.pid !== 'devant' && !(ma.pid === 'manche' && !res.profil.manche)) return;
      var P = ma.pos, U = ma.uv, J = ma.J, bb = ma.pc.bb, A = alphaDe(ma), lignes = [];
      for (var i = 0; i + 1 < ma.R; i++) {
        var sh = 0, nh = 0, sv = 0, nv = 0, mx = 0;
        for (var j = 0; j < J; j++) {
          var q = i * (J + 1) + j; if (A(U[q * 2], U[q * 2 + 1]) < 128) continue;
          var e = function (q2) { var L3 = Math.hypot(P[q2 * 3] - P[q * 3], P[q2 * 3 + 1] - P[q * 3 + 1], P[q2 * 3 + 2] - P[q * 3 + 2]), L2 = Math.hypot((U[q2 * 2] - U[q * 2]) * (bb.x1 - bb.x0), (U[q2 * 2 + 1] - U[q * 2 + 1]) * (bb.y1 - bb.y0)); return L2 > 0.01 ? L3 / L2 : 1; };
          var h = e(q + 1), v2 = e(q + J + 1); sh += h; nh++; sv += v2; nv++; mx = Math.max(mx, h, v2);
        }
        if (nh) lignes.push([i, Math.round(ma.yp[i] * 10) / 10, Math.round(sh / nh * 100) / 100, Math.round(sv / nv * 100) / 100, Math.round(mx * 100) / 100]);
      }
      res.profil[ma.pid === 'devant' ? 'devant' : 'manche'] = lignes;
    });
    var gauche = epaule(1), droite = epaule(-1), haut = cou();
    var VUES = [
      ['face', 0, 0.05, 1, null], ['tq', 0.62, 0.12, 1, null], ['dos', Math.PI, 0.05, 1, null], ['profil', Math.PI / 2, 0.05, 1, null], ['dessus', 0, 0.95, 1, null],
      ['epaule-face', 0, 0.08, 4, gauche], ['epaule-face2', 0, 0.08, 4, droite], ['epaule-tq', 0.75, 0.15, 4, gauche], ['epaule-dos', Math.PI, 0.1, 4, droite],
      ['epaule-dessus', 0.3, 0.8, 4, gauche], ['encolure', 0, 0.12, 3, haut],
      // SA vue : de face, la caméra au-dessus des épaules (~30°), l encolure et les deux têtes de manche dans le cadre
      ['facedessus', 0, 0.52, 1.7, haut]
    ];
    VUES.forEach(function (vv) {
      v.yaw = vv[1]; v.pitch = vv[2]; v.vueNom = '';
      // normale avec mannequin, normale SANS mannequin (sa capture : l intérieur de l encolure), diagnostique
      [['m', true, false], ['n', false, false], ['d', false, true], ['x', false, false], ['p', false, false], ['q', false, false], ['c', true, false]].forEach(function (m) {
        // « q » : la manche SEULE (le corps masqué), en couleurs de pièces ; « c » : le MANNEQUIN seul
        g.mailles.forEach(function (ma) { if (ma.nIdx0 === undefined) ma.nIdx0 = ma.nIdx; ma.nIdx = (m[0] === 'q' && ma.pid !== 'manche') || m[0] === 'c' ? 0 : ma.nIdx0; });
        if (m[0] === 'q') m = ['q', false, false, 'p'];
        var mode = m[3] || m[0];
        if (mode === 'x' || mode === 'p') g.mailles.forEach(function (ma) { if (!ma[mode === 'x' ? 'kDefauts' : 'kPieces']) return; g.gl.bindBuffer(g.gl.ARRAY_BUFFER, ma.bK); g.gl.bufferData(g.gl.ARRAY_BUFFER, ma[mode === 'x' ? 'kDefauts' : 'kPieces'], g.gl.STATIC_DRAW); });
        v.mannequin = m[1]; mo.diag(m[2]); v.carte = mode === 'x' || mode === 'p'; viser(v, vv[4], vv[3]);
        if (m[2] && vv[4]) { var f = fentes(cv); res.vues[vv[0]] = f; res.fentes += f.n; }
        envoyer('img:' + vv[0] + '-' + m[0], cv.toDataURL('image/png'));
      });
    });
    mo.diag(false); v.carte = false; g.mailles.forEach(function (ma) { if (ma.nIdx0 !== undefined) ma.nIdx = ma.nIdx0; });
    envoyer('mesures', JSON.stringify(res));
  }
  attendre();
};

// fabriquer les modèles dans la page, avec le VRAI cœur du site (tracer, graduer)
const SCRIPT_MODELES = function () {
  var c = window.__szBanc3d.cas, A = window.Atelier, T = ['XS', 'S', 'M', 'L', 'XL'];
  var ap = A.apercuCoeur({ base: c.base, taille: c.taille, options: c.options });
  var pr = A.preparerCoeur({ base: c.base, options: c.options, tailleBase: c.taille, pieces: ap.pieces });
  var m = { id: 'banc_' + c.id, createdAt: '2026-10-18T00:00:00Z', updatedAt: '2026-10-18T00:00:00Z', nom: 'Banc ' + c.id, ref: '', categorie: 'hauts', etat: 'brouillon',
    base: c.base, options: c.options || {}, aisances: {}, tailleBase: c.taille, tailles: T, pieces: pr.pieces, assemblages: pr.assemblages || [], edite: false,
    instantanes: [], motif: null, design3d: null, photo3d: null, planche: null, produitId: '', notes: '', version: 1, versions: [{ n: 1, date: '2026-10-18T00:00:00Z', note: 'banc' }] };
  if (c.motif) {
    // un motif PLACÉ sur le devant, comme le sien : un texte, un logo (une forme orange à sa place), un second texte
    var dv = pr.pieces.filter(function (p) { return p.id === 'devant'; })[0], pli = dv && dv.aupli;
    m.motif = { mode: 'place', piece: 'devant', zone: { x: pli ? -15 : 2, y: 12, l: 30, h: 35 }, raccord: 'droit', procede: 'dtf', ppp: 300, souscouche: 'auto', fond: 'transparent',
      calques: [
        { id: 'c1', type: 'texte', texte: 'SANDRIZA', police: 'Arial', couleur: '#111111', gras: true, ajustement: 'etirer', x: 4, y: 2, l: 22, h: 4, rot: 0, opacite: 1, visible: true },
        { id: 'c2', type: 'forme', forme: 'rect', couleur: '#E8870E', plein: true, x: 12, y: 12, l: 6, h: 6, rot: 45, opacite: 1, visible: true },
        { id: 'c3', type: 'texte', texte: 'Stein Monast', police: 'Arial', couleur: '#2A2D34', gras: true, ajustement: 'etirer', x: 6, y: 21, l: 18, h: 2.6, rot: 0, opacite: 1, visible: true }] };
  }
  localStorage.setItem('elg_atelier_modeles', JSON.stringify([m]));
  localStorage.setItem('sz-atelier-mannequin', '1');
  if (c.sansPlis) localStorage.setItem('sz-atelier-vie', JSON.stringify({ plis: 'aucun', tissu: 'moyen' })); else localStorage.removeItem('sz-atelier-vie');
};

function page(c) {
  let h = pageAtelier('3d:banc_' + c.id);
  const pont = '<script>window.__szBanc3d={cas:' + JSON.stringify(c) + '};' + 'window.__REP=' + JSON.stringify(scen.reponses) + ';'
    + 'window.__R2={};window.DB={getProductById:function(){return null;},updateProduct:function(){return null;}};'
    + 'window.TursoDB={uploadObject:function(){return Promise.resolve("");},uploadObjectBrut:function(){return Promise.resolve("");},fetchObjectDataUrl:function(u){return Promise.resolve(u);}};'
    + 'window.szPont={appeler:function(op,a){'
    + 'if(op==="atelier:apercu3d")return Promise.resolve(window.Atelier.apercu3dCoeur(a));'
    + 'if(op==="atelier:croquis")return Promise.resolve(window.Atelier.croquisCoeur(a));'
    + 'if(op==="atelier:vignette")return Promise.resolve({ok:true,garde:true});'
    + 'if(op==="atelier:donnees"){var d0=JSON.parse(JSON.stringify(window.__REP["atelier:donnees"]));d0.modeles=window.Atelier.getModeles().map(function(m){var x=JSON.parse(JSON.stringify(m));x.verrouille=false;x.vignette="";return x;});return Promise.resolve(d0);}'
    + 'var r=window.__REP[op];return Promise.resolve(r?JSON.parse(JSON.stringify(r)):{ok:false,motif:"operation_inconnue"});},fermer:function(){},detacher:function(){},ancrer:function(){},imageLocale:function(){return Promise.resolve(null);}};'
    + '</script><script src="file:///' + path.join(SITE, 'assets/js/atelier.js').replace(/\\/g, '/') + '"></script>'
    + '<script>(' + SCRIPT_MODELES.toString() + ')();</script>';
  const i = h.indexOf('<script');
  h = h.slice(0, i) + pont + h.slice(i);
  return h.replace('</body>', '<script>(' + SCRIPT_PAGE.toString() + ')();</script></body>');
}

/* ── Le passage ──────────────────────────────────────────────────────────── */
const exe = chrome();
if (!exe) { console.error('✗ Chrome introuvable — banc impossible.'); process.exit(1); }
fs.mkdirSync(SORTIE, { recursive: true });
let echec = 0;
const bilan = [];
for (const c of CAS) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-b3d-'));
  const fic = path.join(tmp, 'banc.html'), journal = path.join(tmp, 'chrome.log');
  fs.writeFileSync(fic, page(c), 'utf8');
  spawnSync(exe, ['--headless=new', '--disable-gpu-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--window-size=1500,1000', '--enable-logging', '--v=0', '--log-file=' + journal,
    '--user-data-dir=' + path.join(tmp, 'profil'), '--virtual-time-budget=240000', 'file:///' + fic.replace(/\\/g, '/')],
  { stdio: 'ignore', timeout: 300000 });
  const jusqua = Date.now() + 20000;
  let txt = '';
  while (Date.now() < jusqua) {
    try { txt = fs.readFileSync(journal, 'utf8'); if (/BANC3D-FIN/.test(txt)) break; } catch (e) {}
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
  fermerNosChrome(tmp);
  // les morceaux : BANC3D|cle|k|texte
  const parts = {};
  txt.split(/\r?\n/).forEach((l) => {
    const m = /"BANC3D\|([^|]+)\|([^|]+)\|(.*)", source/.exec(l); if (!m) return;
    (parts[m[1]] = parts[m[1]] || {})[m[2]] = m[3];
  });
  const lire = (k) => { const p = parts[k]; if (!p || p.fin === undefined) return null; return Object.keys(p).filter((x) => x !== 'fin').sort((a, b) => a - b).map((x) => p[x]).join(''); };
  if (lire('erreur')) { console.log('✗ ' + c.id + ' : ' + lire('erreur')); echec++; continue; }
  const mes = lire('mesures');
  if (!mes) { console.log('✗ ' + c.id + " : la page n'a pas rendu ses mesures (journal : " + journal + ')'); echec++; continue; }
  const r = JSON.parse(mes);
  Object.keys(parts).filter((k) => /^img:/.test(k)).forEach((k) => {
    const d = lire(k); if (!d) return;
    fs.writeFileSync(path.join(SORTIE, c.id + '-' + k.slice(4) + '.png'), Buffer.from(d.replace(/^data:image\/png;base64,/, ''), 'base64'));
  });
  const g = r.geo, ko = [], pl = STRICT ? SEUILS : Object.assign({}, SEUILS, PLAFONDS[c.id] || {});
  if (g.etires > pl.etires) ko.push(g.etires + ' étiré(s) (plafond ' + pl.etires + ')');
  if (g.plis > pl.plis) ko.push(g.plis + ' pli(s) cassé(s) (plafond ' + pl.plis + ')');
  if (g.dedans > SEUILS.dedans) ko.push(g.dedans + ' sommet(s) dans le corps');
  if (r.fentes > pl.fentes) ko.push(r.fentes + ' fente(s) (plafond ' + pl.fentes + ')');
  const reste = [g.etires && g.etires + ' éclat(s)', g.plis && g.plis + ' pli(s)', r.fentes && r.fentes + ' fente(s)'].filter(Boolean);
  const ecMax = Math.max(0, ...Object.values(r.ecartsRendus || {}).map((e) => e[0]));
  if (ecMax > SEUILS.couture) ko.push('couture ouverte de ' + ecMax + ' cm');
  if (r.bosse && r.bosse.ballon > SEUILS.ballon) ko.push('tête de manche bombée (' + r.bosse.ballon + ' cm de plus que l épaule du mannequin)');
  if (r.bosse && r.bosse.monte > SEUILS.epaulette) ko.push('épaulette : la tête remonte de ' + r.bosse.monte + ' cm au-dessus de la ligne d épaule');
  if (r.bosse && r.bosse.arc > SEUILS.arc) ko.push('rang arqué de ' + r.bosse.arc + ' cm (motif courbé, rang ' + r.bosse.arcOu + ')');
  if (r.bosse && r.bosse.asym > SEUILS.asym) ko.push('devant asymétrique de ' + r.bosse.asym + ' cm ' + JSON.stringify(r.bosse.asymOu));
  if (r.erreurConf) ko.push('maillage conforme en erreur : ' + String(r.erreurConf).split(String.fromCharCode(10))[0]);
  if (ko.length) echec++;
  bilan.push(r);
  console.log((ko.length ? '✗ ' : '✓ ') + c.id.padEnd(6) + ` triangles ${g.triVisibles}, éclats ${g.etires}, plis cassés ${g.plis}, dans le corps ${g.dedans}, fentes ${r.fentes}, couture la plus ouverte ${ecMax} cm, épaulette ${r.bosse ? r.bosse.monte : '?'} cm, bombé en excès ${r.bosse ? r.bosse.ballon : '?'} cm, arc des rangs ${r.bosse ? r.bosse.arc : '?'} cm, asymétrie ${r.bosse ? r.bosse.asym : '?'} cm`
    + (ko.length ? '  ← ' + ko.join(', ') : '') + (!ko.length && reste.length ? '  (reste avant zéro : ' + reste.join(', ') + ')' : ''));
  if (ARGS.includes('--zip')) console.log('   écarts dessinés : ' + JSON.stringify(r.ecartsRendus));
  if (ARGS.includes('--piresm')) console.log('   pires manche (x, y, ×) : ' + JSON.stringify(g.piresManche) + ' | pire triangle : ' + JSON.stringify(g.pireTri));
  if (ARGS.includes('--tubes')) (r.tubes || []).forEach((t) => console.log('   tube ' + JSON.stringify(t)));
  if (ARGS.includes('--profil')) Object.keys(r.profil || {}).forEach((k) => { console.log('   profil ' + k + ' [rang, yp, horiz, vert, max]'); r.profil[k].forEach((l) => console.log('     ' + JSON.stringify(l))); });
  if (ARGS.includes('--detail')) Object.keys(g.parPiece).forEach((k) => console.log('      ' + k + ' : ' + JSON.stringify(g.parPiece[k])));
  if (ko.length) {
    (g.pires || []).slice(0, 4).forEach((p) => console.log('      étiré ' + p.pid + ' ×' + p.s + ' en ' + p.p.join(', ')));
    Object.keys(r.vues).forEach((k) => { if (r.vues[k].n) console.log('      ' + k + ' : ' + r.vues[k].n + ' îlot(s) ' + JSON.stringify(r.vues[k].ilots.slice(0, 3))); });
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
fs.writeFileSync(path.join(SORTIE, 'mesures.json'), JSON.stringify(bilan, null, 1));
console.log('\nimages : ' + SORTIE);
console.log(echec ? `>>> ${echec} cas en défaut` + (STRICT ? ' (cible zéro)' : ' (plafonds de non-régression)') : (STRICT ? '>>> les hauts en 3D sont propres' : '>>> aucun cas au-dessus de ses plafonds (--strict : la cible zéro)'));
process.exit(echec ? 1 : 0);
