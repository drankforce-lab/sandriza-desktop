#!/usr/bin/env node
'use strict';

/*
 * BANC — LE SUIVI DES GÉNÉRATIONS : SA PETITE FENÊTRE, ET PLUS RIEN DANS LES FENÊTRES DE TRAVAIL
 * =============================================================================
 *   node tools/banc-pastille-generations.js
 *
 * ⚠⚠ L'HISTOIRE (2026-10-18 → 2026-10-19).
 *   · images\93.png : la pastille « 1 génération en cours · 0,65 $ US » — « je clique,
 *     rien ne se passe » (localStorage LÈVE dans une page `data:`) ;
 *   · images\94.png : « ✓ 1 génération terminée » restait là pour toujours ;
 *   · puis sa demande du 2026-10-19 : « la notification de génération ne doit PAS être
 *     dessinée DANS les fenêtres de l'application » — et sa décision : la boîte de suivi
 *     des Photos devient LE MODÈLE, dans une petite fenêtre Windows à part.
 *
 * ── CE QU'IL MESURE ─────────────────────────────────────────────────────────
 *   0. PLUS DE PASTILLE : le socle (JS_DIRE, JS_SOCLE, CSS) ne pose plus rien des
 *      générations dans les fenêtres de travail.
 *   1. LA MÊME BOÎTE QUE LES PHOTOS : la feuille CSS_SUIVI est dans la page Photos ET
 *      dans la petite fenêtre, telle quelle ; le balisage de suiviOuvrir (st, n, lst, lg,
 *      nm, et, ep, pd, jauge, pc, Annuler, Fermer) est celui de la petite fenêtre.
 *   2. LA RÈGLE (src/taches.js, fonctions pures) : en cours, à confirmer, échouée non vue
 *      → montrées ; terminée ou arrêtée → 8 s, puis rien ; vue, rejetée → rien. Le
 *      pourcentage ne dépasse pas 99 tant que ce n'est pas fini.
 *   3. LE COMPORTEMENT DE LA PAGE (vrai script, faux document) : une boîte par génération,
 *      une ligne par étape ; « Annuler » DIT le montant engagé avant d'arrêter, et
 *      n'arrête qu'à la confirmation ; « Fermer » retire la boîte ; le clic sur le titre
 *      ouvre la fenêtre Générations (et à défaut le pont) ; « Terminé » s'en va à 8 s.
 *   4. LE CHEMIN : la fenêtre (sans cadre, toujours au-dessus, sans barre des tâches, sans
 *      focus, née cachée, montrée par showInactive), le service démarré par main.js, et le
 *      chemin jusqu'à la fenêtre Générations.
 *
 * ⚠ CE QU'IL NE VOIT PAS : la fenêtre réellement peinte par Electron — ce banc n'ouvre
 * pas Electron. Il garde le chemin et le comportement du script, pas le pixel.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.join(__dirname, '..');
let dur = 0;
const dit = (ok, quoi) => { console.log((ok ? '  OK   ' : '  NON  ') + quoi); if (!ok) dur = 1; };

const socle = require(path.join(RACINE, 'src', 'fenetres', 'socle.js'));
const srcSocle = fs.readFileSync(path.join(RACINE, 'src', 'fenetres', 'socle.js'), 'utf8');
const main = fs.readFileSync(path.join(RACINE, 'src', 'main.js'), 'utf8');
const preload = fs.readFileSync(path.join(RACINE, 'src', 'pont-preload.js'), 'utf8');
const taches = require(path.join(RACINE, 'src', 'taches.js'));
const srcTaches = fs.readFileSync(path.join(RACINE, 'src', 'taches.js'), 'utf8');
const pageT = require(path.join(RACINE, 'src', 'fenetres', 'taches.js')).pageTaches();
const pageP = require(path.join(RACINE, 'src', 'fenetres', 'photos.js')).pagePhotos('');
const srcPhotos = fs.readFileSync(path.join(RACINE, 'src', 'fenetres', 'photos.js'), 'utf8');

const T0 = 1760800000000;
const et = (lib, etat, t0, t1) => ({ lib, etat, t0: t0 || 0, t1: t1 || 0 });
const g = (etat, extra) => Object.assign({ id: 'g' + Math.random().toString(36).slice(2), genre: 'atelier', etat, cout: 0.07,
  produitNom: 'Atelier · Robe portefeuille', dureeEstimee: 30,
  etapes: [et('Capture de la vue 3D', 'fait', T0 - 9000, T0 - 8000), et('Contrôle du prix', 'fait', T0 - 8000, T0 - 7000),
    et('Génération chez The New Black', 'cours', T0 - 6000), et('Rangement dans la photothèque', 'att')] }, extra || {});

// ── Le vrai script de la page, dans un faux document ──
function monde(opts) {
  const appels = [];
  const minuteries = [];
  let horloge = T0;
  const pile = { innerHTML: '', _h: {}, getBoundingClientRect: () => ({ height: pile.innerHTML ? 180 : 0 }),
    addEventListener(t, f) { (pile._h[t] = pile._h[t] || []).push(f); } };
  const document = { getElementById: (id) => (id === 'pile' ? pile : null), addEventListener() {} };
  const pont = {
    appeler(op, ...a) { appels.push([op].concat(a)); return Promise.resolve({ ok: true }); },
    ouvrirModule(nom) { appels.push(['ouvrirModule', nom]); return Promise.resolve(!opts.coquilleRefuse); },
  };
  const ctx = { document, window: { szPont: pont }, console, Date: { now: () => horloge },
    setTimeout: (f, ms) => { minuteries.push({ f, quand: horloge + ms }); return minuteries.length; }, clearTimeout() {},
    Promise, Math, Number, String, Array, JSON };
  vm.createContext(ctx);
  const s = pageT.slice(pageT.indexOf('<script>') + 8, pageT.lastIndexOf('</script>'));
  vm.runInContext(s, ctx, { filename: 'taches-page.js' });
  // un clic sur un élément de la boîte `id` qui porte l'attribut `attr` (valeur `val`)
  const cliquer = (id, attr, val) => {
    const box = { getAttribute: () => id };
    const cible = { hasAttribute: (a) => a === attr, getAttribute: (a) => (a === attr ? val : null),
      closest: (q) => (/suivi/.test(q) ? box : cible) };
    pile._h.click.forEach((f) => f({ target: cible }));
  };
  const avancer = (ms) => { horloge += ms; minuteries.filter((m) => m.f && m.quand <= horloge).forEach((m) => { const f = m.f; m.f = null; f(); }); };
  return { pile, appels, cliquer, avancer, maj: (l) => ctx.window.szMaj(l) };
}
const attendre = () => new Promise((r) => setImmediate(r));

(async () => {
  // ── 0. plus de pastille ──
  console.log('\n=== Plus rien des générations DANS les fenêtres de travail ===');
  dit(!/generations:etat/.test(socle.JS_DIRE()) && !/generations:etat/.test(socle.JS_SOCLE()), 'JS_DIRE et JS_SOCLE ne lisent plus la file des générations');
  dit(!/szGen|sz-gen/.test(srcSocle), 'le socle ne porte plus ni le script ni la feuille de la pastille');
  dit(!/szGen|sz-gen/.test(socle.CSS_SOCLE + socle.CSS_JOUR), 'aucune règle .sz-gen dans les feuilles communes');

  // ── 1. la même boîte ──
  console.log('\n=== La boîte est celle des Photos ===');
  dit(typeof socle.CSS_SUIVI === 'string' && socle.CSS_SUIVI.length > 1500 && /\.suivi\{position:fixed/.test(socle.CSS_SUIVI), 'le socle exporte CSS_SUIVI (' + String(socle.CSS_SUIVI || '').length + ' caractères)');
  dit(pageP.indexOf(socle.CSS_SUIVI) >= 0 && /\$\{CSS_SUIVI\}/.test(srcPhotos), 'la page Photos pose CSS_SUIVI (sa propre boîte, inchangée)');
  dit(pageT.indexOf(socle.CSS_SUIVI) >= 0, 'la petite fenêtre pose CSS_SUIVI, telle quelle');
  const posFixe = (pageT.match(/#pile \.suivi\{[^}]*\}/) || [''])[0];
  dit(/position:relative/.test(posFixe) && !/background|border|font|color/.test(posFixe), 'seule différence : la boîte n’est plus en position fixe (rien de visuel n’est redéfini)');

  // ── 2. la règle ──
  console.log('\n=== Ce que la fenêtre montre — et quand elle s’en va ===');
  const { REGLE_JS } = require(path.join(RACINE, 'src', 'fenetres', 'taches.js'));
  dit(pageT.indexOf(REGLE_JS) >= 0 && /REGLE_JS/.test(srcTaches) && !/function aMontrer/.test(srcTaches),
    'UNE règle : la page et le processus principal appliquent le même texte (REGLE_JS), aucune copie dans src/taches.js');
  const vue = (l, t) => taches.aMontrer(l, t == null ? T0 : t);
  dit(vue([]).length === 0, 'rien en cours ni à traiter : RIEN (la fenêtre se cache)');
  const c = vue([g('cours')])[0];
  dit(!!c && c.N === 4 && c.n === 2 && c.pct > 0 && c.pct < 100, 'en cours : montrée, 2 étapes faites sur 4, ' + (c && c.pct) + ' %');
  dit(!!c && c.etapes.map((e) => e.etat).join(',') === 'faite,faite,cours,attente', 'les lignes portent les états des Photos (faite, cours, attente)');
  dit(!!c && c.etapes[0].duree === 1 && c.etapes[2].duree === 6, 'les durées sont mesurées (1 s faite, 6 s en cours)');
  dit(!!c && c.reste > 0, 'un temps restant est estimé (' + (c && c.reste) + ' s)');
  dit(vue([g('attente')]).length === 1 && vue([g('echec')]).length === 1, 'à confirmer, échouée non vue : montrées');
  dit(vue([g('echec', { vu: true })]).length === 0 && vue([g('rejete', { fin: T0 - 1000 })]).length === 0, 'échouée vue, rejetée : rien');
  dit(vue([g('fini', { fin: T0 - 3000 })]).length === 1 && vue([g('fini', { fin: T0 - 3000 })])[0].pct === 100, 'terminée il y a 3 s : montrée, 100 %');
  dit(vue([g('fini', { fin: T0 - 9000 })]).length === 0, 'terminée il y a 9 s : rien (elle reste dans l’historique de la fenêtre Générations)');
  dit(vue([g('interrompu', { fin: T0 - 2000 })]).length === 1 && vue([g('interrompu', { fin: T0 - 9000 })]).length === 0, 'arrêtée : 8 s, puis rien');
  const lent = g('cours', { etapes: [et('Génération chez The New Black', 'cours', T0 - 600000)] });
  dit(vue([lent])[0].pct <= 99, 'une étape qui traîne ne fait pas croire à la fin (≤ 99 %)');
  dit(vue([g('fini', { fin: T0 - 1000 }), g('cours')])[0].etat === 'cours', 'en cours d’abord');

  // ── 3. le comportement de la page ──
  console.log('\n=== La page : une boîte par génération, une ligne par étape ===');
  {
    const m = monde({});
    const gc = g('cours', { cout: 0.065 });
    const h = m.maj(taches.aMontrer([gc], T0));
    const html = m.pile.innerHTML;
    dit(h > 0, 'szMaj rend la hauteur à donner à la fenêtre (' + h + ' px)');
    const morceaux = ['class="suivi', 'class="st"', 'class="n"', 'class="lst"', 'class="lg"', 'class="nm"', 'class="et ', 'class="ep"',
      'class="pd"', 'class="jauge"', 'class="pc"', 'class="bt"', 'class="mini dgr"', 'class="mini"'];
    const manque = morceaux.filter((x) => html.indexOf(x) < 0);
    dit(!manque.length, 'le balisage de suiviOuvrir (Photos) : ' + (manque.length ? 'MANQUE ' + manque.join(', ') : 'st, n, lst, lg, nm, et, ep, pd, jauge, pc, bt, Annuler, Fermer'));
    dit((html.match(/class="lg"/g) || []).length === 4 && /Étape 3\/4 · Génération chez The New Black/.test(html), 'une ligne par étape : « Étape 3/4 · Génération chez The New Black »');
    dit(/>2 \/ 4</.test(html), 'l’en-tête dit « 2 / 4 »');
    dit(/Rendu photo · Atelier · Robe portefeuille/.test(html), 'le titre : type · produit');
    dit(/0,07 \$ US engagés/.test(html), 'la phrase d’état dit le montant engagé (0,07 $ US)');
    m.cliquer(gc.id, 'data-g', 'annuler');
    dit(!m.appels.some((a) => a[0] === 'generations:agir'), '« Annuler » n’arrête RIEN tout seul…');
    dit(/ne sera pas remboursé/.test(m.pile.innerHTML) && /Arrêter la génération/.test(m.pile.innerHTML) && /suivi annule/.test(m.pile.innerHTML),
      '…il dit d’abord le montant engagé, non remboursé, et demande « Arrêter la génération »');
    m.cliquer(gc.id, 'data-g', 'continuer');
    dit(!/ne sera pas remboursé/.test(m.pile.innerHTML) && !m.appels.some((a) => a[0] === 'generations:agir'), '« Continuer » : rien n’est arrêté, la boîte redevient normale');
    m.cliquer(gc.id, 'data-g', 'annuler'); m.cliquer(gc.id, 'data-g', 'arreter'); await attendre();
    dit(m.appels.some((a) => a[0] === 'generations:agir' && a[1] === gc.id && a[2] === 'interrompre'), 'confirmé : generations:agir(id, « interrompre »)');
    m.cliquer(gc.id, 'data-ouvrir', '1'); await attendre();
    dit(m.appels.some((a) => a[0] === 'ouvrirModule' && a[1] === 'generations'), 'le clic sur le titre ouvre la fenêtre Générations');
    m.cliquer(gc.id, 'data-g', 'fermer');
    dit(m.pile.innerHTML === '', '« Fermer » retire la boîte');
    dit(m.maj(taches.aMontrer([gc], T0)) === 0, '…et elle ne revient pas : hauteur 0, la fenêtre se cache');
  }
  {
    const m = monde({ coquilleRefuse: true });
    const gc = g('cours');
    m.maj(taches.aMontrer([gc], T0));
    m.cliquer(gc.id, 'data-ouvrir', '1'); await attendre(); await attendre();
    dit(m.appels.some((a) => a[0] === 'generations:ouvrir'), 'la coquille refuse : le repli passe par le pont (generations:ouvrir)');
  }
  {
    const m = monde({});
    const ge = g('echec', { message: 'Le prix a changé.' });
    m.maj(taches.aMontrer([ge], T0));
    dit(/Le prix a changé/.test(m.pile.innerHTML) && !/data-g="annuler"/.test(m.pile.innerHTML), 'échouée : son message, pas d’« Annuler »');
    m.cliquer(ge.id, 'data-g', 'fermer'); await attendre();
    dit(m.appels.some((a) => a[0] === 'generations:agir' && a[2] === 'vu'), 'échouée fermée : marquée vue (la fenêtre Générations ne la signale plus)');
  }
  {
    const m = monde({});
    const gf = g('fini', { fin: T0 - 1000, etapes: [et('Capture de la vue 3D', 'fait', T0 - 9000, T0 - 8000)] });
    m.maj(taches.aMontrer([gf], T0));
    dit(/✓ Terminé\./.test(m.pile.innerHTML), 'terminée : « ✓ Terminé. »');
    m.avancer(6000);
    dit(m.pile.innerHTML !== '', '…toujours là 6 s plus tard (7 s après la fin)');
    m.avancer(1200);
    dit(m.pile.innerHTML === '', '…partie d’elle-même à 8 s, sans attendre une nouvelle lecture');
  }

  // ── 4. le chemin ──
  console.log('\n=== La fenêtre, le service, et le chemin jusqu’à la fenêtre Générations ===');
  const opt = (srcTaches.match(/new BrowserWindow\(\{([\s\S]*?)webPreferences/) || ['', ''])[1];
  ['show: false', 'frame: false', 'transparent: true', 'alwaysOnTop: true', 'skipTaskbar: true', 'focusable: false'].forEach((o) =>
    dit(opt.indexOf(o) >= 0, 'la petite fenêtre : ' + o));
  dit(/showInactive\(\)/.test(srcTaches) && !/\.show\(\)|\.focus\(\)/.test(srcTaches), 'elle paraît par showInactive (jamais show/focus : elle ne vole pas le clavier)');
  dit(/require\('\.\/taches'\)/.test(main) && main.indexOf('taches.demarrer({ appeler: (op, args) => executerOpSite(op, args || [], null), appliquerTheme })') >= 0,
    'main.js démarre le service au lancement, par le pont du site');
  dit(/taches\.refaire\(\)/.test(main) && /taches\.fenetreCourante\(\)/.test(main), 'elle suit la langue et le thème');
  const mo = main.match(/const _MODULES_OUVRABLES\s*=\s*\[([^\]]*)\]/);
  dit(!!mo && /'generations'/.test(mo[1]), '`generations` est dans _MODULES_OUVRABLES (module:ouvrir)');
  dit(/case 'generations':\s*\{[\s\S]{0,700}?_dockOuvrir\('generations'\)[\s\S]{0,80}?break;/.test(main), 'actionApp : `case \'generations\'` ouvre par _dockOuvrir');
  dit(/'generations':\s*\['Générations', \(\) => pageGenerations\(\)\]/.test(main), 'PAGES_ANCRABLES déclare la page Générations');
  dit(/ouvrirModule:\s*\(nom\)\s*=>\s*ipcRenderer\.invoke\('module:ouvrir'/.test(preload), 'le preload expose ouvrirModule');
  dit(/'generations:ouvrir'/.test(main.split('const LIMITES_PONT')[0] || main) && /'generations:agir'/.test(main), '`generations:ouvrir` et `generations:agir` sont dans la liste blanche du pont');

  console.log(dur ? '\n✗ le suivi des générations : voir les NON ci-dessus\n'
    : '\n✓ le suivi des générations vit dans sa petite fenêtre, avec la boîte des Photos — et plus rien dans les fenêtres de travail\n');
  process.exit(dur);
})().catch((e) => { console.log('  NON  exception : ' + (e && e.stack || e)); process.exit(1); });
