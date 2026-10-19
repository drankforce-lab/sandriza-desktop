/* ============================================================================
   banc-atelier-3d-ancre.js — LE MÊME PARCOURS, ATELIER ANCRÉ (2026-10-18)
   ----------------------------------------------------------------------------
   Son bogue (« j'ouvre un AUTRE modèle en vue 3D, ça me ramène dans l'ancien »)
   vient d'un Atelier ANCRÉ dans la fenêtre principale : une WebContentsView
   (comme main.js, dock:ouvrir — backgroundThrottling compris), posée sur une
   fenêtre. Ce banc rejoue le parcours de tools/banc-atelier-3d-modeles.js (sa
   page, ses deux modèles, ses chemins) DANS une telle vue, et ce que l'hôte fait
   pendant ce temps : voiler / dévoiler la vue (un menu de l'application),
   changer ses dimensions, la faire se relire (szRevenir, au retour sur la section)
   et l'actualiser (szActualiser, une écriture ailleurs).

   ⚠ INVISIBLE (sa règle, .claude/memory/feedback_essais_electron_invisibles.md) :
   la fenêtre n'est jamais montrée (show:false) et la vue est rendue HORS ÉCRAN
   (offscreen : elle se croit visible, ses images d'animation tournent — sans quoi
   la vue 3D ne dessinerait rien) ; une erreur du processus principal s'écrit
   dans un fichier et ferme l'essai — jamais de boîte à l'écran.

     node_modules/electron/dist/electron.exe tools/banc-atelier-3d-ancre.js
     SZ_B3A_CHEMINS=tous …        tous les chemins (par défaut : la tuile, le sien)
     SZ_B3A_SORTIE=<dossier> …    garde les captures
   ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { app, BaseWindow, WebContentsView } = require('electron');

const journalErr = path.join(os.tmpdir(), 'sz-b3a-erreur.txt');
process.on('uncaughtException', (e) => { try { fs.writeFileSync(journalErr, String(e && e.stack || e)); } catch (x) {} app.exit(1); });
process.on('unhandledRejection', (e) => { try { fs.writeFileSync(journalErr, String(e && e.stack || e)); } catch (x) {} app.exit(1); });

const { page, CHEMINS } = require('./banc-atelier-3d-modeles.js');
const SORTIE = process.env.SZ_B3A_SORTIE || '';
app.commandLine.appendSwitch('enable-unsafe-swiftshader');


function un(chemin, vueb) {
  return new Promise((resolve) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sz-b3a-'));
    const fic = path.join(tmp, 'banc.html');
    fs.writeFileSync(fic, page(chemin, vueb, true), 'utf8');
    // une fenêtre JAMAIS montrée, et une vue rendue HORS ÉCRAN (offscreen) : la page se croit visible, ses images d animation
    // tournent, et rien ne paraît sur le poste
    const win = new BaseWindow({ width: 1400, height: 900, show: false, skipTaskbar: true });
    const view = new WebContentsView({ webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: false, backgroundThrottling: true, offscreen: true } });
    win.contentView.addChildView(view);
    view.setBounds({ x: 0, y: 64, width: 1400, height: 836 });
    const parts = {}; let fini = false;
    const finir = (verdict) => { if (fini) return; fini = true; clearInterval(hote); clearTimeout(garde);
      try { win.destroy(); } catch (e) {} try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} resolve(verdict); };
    view.webContents.on('console-message', (e, niveau, msg) => {
      const m = /^B3M\|([^|]+)\|([^|]+)\|(.*)$/s.exec(msg);
      if (m) { (parts[m[1]] = parts[m[1]] || {})[m[2]] = m[3]; return; }
      // l ÉCRAN ENTIER de la vue ancrée (en-tête compris), au moment où la page le demande
      const ec = /^B3M-ECRAN\|(.*)$/.exec(msg);
      if (ec) { if (SORTIE) view.webContents.capturePage().then((img) => { try { fs.writeFileSync(path.join(SORTIE, 'ecran-' + vueb + '-' + chemin + '-' + ec[1] + '.png'), img.toPNG()); } catch (x) {} }).catch(() => {}); return; }
      if (process.env.SZ_B3A_BAVARD) console.log('  [page] ' + String(msg).slice(0, 300));
      if (msg === 'B3M-FIN') {
        const lire = (k) => { const p = parts[k]; if (!p || p.fin === undefined) return null; return Object.keys(p).filter((x) => x !== 'fin').sort((a, b) => a - b).map((x) => p[x]).join(''); };
        if (SORTIE) Object.keys(parts).filter((k) => /^img:/.test(k)).forEach((k) => { const d = lire(k); if (d) fs.writeFileSync(path.join(SORTIE, 'ancre-' + vueb + '-' + chemin + '-' + k.slice(4) + '.png'), Buffer.from(d.replace(/^data:image\/png;base64,/, ''), 'base64')); });
        finir({ err: lire('erreur'), etapes: lire('etapes') });
      }
    });
    // L HÔTE, pendant le parcours : un menu de l application voile la vue et la rend, la zone change de taille, la section se
    // rouvre (szRevenir) et une écriture ailleurs l actualise (szActualiser)
    let k = 0;
    const hote = setInterval(() => {
      k++;
      try {
        if (k % 3 === 0) { view.setVisible(false); setTimeout(() => { try { view.setVisible(true); } catch (e) {} }, 120); }
        if (k % 4 === 0) view.setBounds({ x: 0, y: 64, width: 1400 - (k % 8), height: 836 });
        if (k % 5 === 0) view.webContents.executeJavaScript('window.szRevenir && window.szRevenir()', true).catch(() => {});
        if (k % 7 === 0) view.webContents.executeJavaScript('window.szActualiser && window.szActualiser()', true).catch(() => {});
      } catch (e) {}
    }, 450);
    const garde = setTimeout(() => finir({ err: 'aucune réponse en 90 s', etapes: null }), 90000);
    view.webContents.loadFile(fic);
  });
}

app.whenReady().then(async () => {
  if (SORTIE) fs.mkdirSync(SORTIE, { recursive: true });
  let echec = 0;
  const seulement = (process.env.SZ_B3A_CHEMINS || 'tuile').split(',');
  for (const vb of ['cartes', 'liste']) for (const ch of CHEMINS.filter((c) => seulement.indexOf(c) >= 0 || seulement[0] === 'tous')) {
    const r = await un(ch, vb);
    const E = r.etapes ? JSON.parse(r.etapes) : [], b = E.filter((e) => /^B/.test(e.etape || '')).pop();
    if (r.err || !b) { echec++; console.log('✗ ancré ' + vb.padEnd(7) + ch.padEnd(8) + (r.err || 'rien') + '  ' + JSON.stringify(E)); }
    else console.log('✓ ancré ' + vb.padEnd(7) + ch.padEnd(8) + 'B montré en ' + ((E.filter((e) => e.ms != null)[0] || {}).ms) + ' ms (vue ' + b.v3 + ', corps ' + b.r + ', WebGL ' + b.glBase + ', toiles ' + b.cle + ', sélection ' + b.sel + ')');
  }
  console.log(echec ? '>>> ' + echec + ' parcours ancré(s) qui rouvrent le mauvais modèle' : '>>> ancré : tous les parcours ouvrent le bon modèle');
  app.exit(echec ? 1 : 0);
});
app.on('window-all-closed', () => {});
