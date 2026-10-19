#!/usr/bin/env node
'use strict';

/*
 * BANC — LA PASTILLE DES GÉNÉRATIONS OUVRE-T-ELLE QUELQUE CHOSE, ET S'EN VA-T-ELLE ?
 * =============================================================================
 *   node tools/banc-pastille-generations.js
 *
 * ⚠⚠ POURQUOI CE BANC EXISTE — DEUX CAPTURES DU MÊME JOUR (2026-10-18).
 *   · images\93.png : « 1 génération en cours · 0,65 $ US » — « je clique, rien ne
 *     se passe ». Le panneau retenait « ouvert » dans localStorage ; une fenêtre
 *     native est une page `data:`, où localStorage LÈVE : la lecture rendait
 *     toujours « fermé », dans TOUTES les fenêtres. Rien ne le signalait — le
 *     bouton se dessinait, son gestionnaire tournait, il ne se passait rien.
 *   · images\94.png : « ✓ 1 génération terminée » restait là pour toujours, et
 *     comme le clic ne faisait rien, on ne pouvait même pas la retirer.
 *
 * ── CE QU'IL MESURE ─────────────────────────────────────────────────────────
 *   1. LE CLIC : le vrai script de la pastille (JS_GEN, tel que le socle le pose
 *      dans chaque fenêtre) tourne dans un contexte où localStorage LÈVE comme en
 *      `data:` ; on clique la pastille et on exige un appel
 *      `ouvrirModule('generations')` — et, si la coquille refuse, le repli par le
 *      pont (`generations:ouvrir`).
 *   2. LE CHEMIN JUSQU'À LA FENÊTRE : `generations` dans la liste blanche
 *      `_MODULES_OUVRABLES`, un `case 'generations'` qui passe par `_dockOuvrir`,
 *      la page déclarée dans PAGES_ANCRABLES, `ouvrirModule` exposé par le preload,
 *      et `generations:ouvrir` connu du pont (liste blanche de main.js).
 *   3. PARTOUT : chaque fenêtre qui pose le socle (JS_DIRE / JS_SOCLE) reçoit la
 *      pastille — JS_DIRE doit contenir son script.
 *   4. LA RÈGLE D'AFFICHAGE (sa règle du 2026-10-18) : en cours → visible ; à
 *      confirmer → alerte ; échouée non vue → erreur ; échouée VUE → rien ;
 *      terminée → « Génération terminée » 8 s, PUIS RIEN ; interrompue, rejetée,
 *      liste vide → rien. Et la pastille, peinte puis 8 s passées, DISPARAÎT du
 *      document (la minuterie qu'elle pose elle-même).
 *
 * ⚠ CE QU'IL NE VOIT PAS : la fenêtre réellement peinte par Electron — ce poste
 * n'ouvre pas Electron dans les bancs. Il garde le chemin et le comportement du
 * script, pas le pixel.
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

// ── Le script de la pastille, TEL QU'IL EST POSÉ (on le découpe dans JS_DIRE) ──
const dire = socle.JS_DIRE();
const i0 = dire.indexOf('var _szGenT = null');
const i1 = dire.indexOf("window.addEventListener('pagehide', function(){ if (_szGenT)");
if (i0 < 0 || i1 < 0) {
  console.log('\n  NON  le script de la pastille est introuvable dans JS_DIRE — ce banc n’a rien vérifié\n');
  process.exit(1);
}
const JS = dire.slice(i0, dire.indexOf('\n', i1) + 1);

// ── 0. aucune trace de localStorage dans la pastille ──
console.log('\n=== La pastille ne dépend plus de localStorage ===');
dit(!/localStorage/.test(JS), 'le script de la pastille ne lit ni n’écrit localStorage (il lève en data:)');

// ── Un faux document, minimal mais honnête : les éléments existent, se retirent, se cliquent ──
function monde(opts) {
  const appels = [];
  const minuteries = [];
  let horloge = opts.maintenant;
  const el = (tag) => {
    const e = { tagName: tag, children: [], parentNode: null, className: '', innerHTML: '', title: '', type: '', _h: {},
      classList: { _s: () => e.className.split(/\s+/).filter(Boolean),
        contains(c) { return this._s().indexOf(c) >= 0; },
        add(c) { if (!this.contains(c)) e.className = (e.className + ' ' + c).trim(); },
        toggle(c, v) { if (v) this.add(c); else e.className = this._s().filter((x) => x !== c).join(' '); } },
      setAttribute() {}, addEventListener(t, f) { (e._h[t] = e._h[t] || []).push(f); },
      appendChild(c) { c.parentNode = e; e.children.push(c); return c; },
      insertBefore(c) { c.parentNode = e; e.children.push(c); return c; },
      removeChild(c) { e.children = e.children.filter((x) => x !== c); c.parentNode = null; return c; },
      click() { (e._h.click || []).forEach((f) => f({ target: e })); } };
    return e;
  };
  const body = el('body');
  const document = { readyState: 'complete', hidden: false, body, createElement: el, querySelector: () => null, addEventListener() {} };
  const pont = {
    appeler(op) { appels.push(['appeler', op]); return op === 'generations:etat' ? Promise.resolve(opts.etat) : Promise.resolve({ ok: true }); },
    ouvrirModule(nom) { appels.push(['ouvrirModule', nom]); return Promise.resolve(opts.coquilleRefuse ? false : true); },
  };
  const ctx = {
    document, window: { szPont: pont, addEventListener() {} }, console,
    Date: { now: () => horloge },
    setInterval: () => 1, clearInterval() {},
    setTimeout: (f, ms) => { minuteries.push({ f, quand: horloge + ms }); return minuteries.length; }, clearTimeout(id) { if (minuteries[id - 1]) minuteries[id - 1].f = null; },
    Promise, Math, Number, String, Array, JSON,
  };
  // localStorage LÈVE, comme dans une page data: (SecurityError)
  Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError: localStorage interdit en data:'); } });
  ctx.window.localStorage = undefined;
  vm.createContext(ctx);
  vm.runInContext(JS, ctx, { filename: 'pastille-generations.js' });
  const pill = () => body.children.find((c) => /\bsz-gen\b/.test(c.className)) || null;
  const avancer = (ms) => { horloge += ms; minuteries.filter((m) => m.f && m.quand <= horloge).forEach((m) => { const f = m.f; m.f = null; f(); }); };
  return { ctx, appels, pill, avancer, regle: (l, t) => ctx.szGenPastille(l, t) };
}
const attendre = () => new Promise((r) => setImmediate(r));

const T0 = 1760800000000;
const g = (etat, extra) => Object.assign({ id: 'g' + Math.random(), etat, cout: 0.65, produitNom: 'Chemise Walla', etapes: [] }, extra || {});

(async () => {
  // ── 1. le clic ──
  console.log('\n=== Le clic sur la pastille ouvre la fenêtre Générations ===');
  {
    const m = monde({ maintenant: T0, etat: { ok: true, liste: [g('cours')] } });
    await attendre(); await attendre();
    const p = m.pill();
    dit(!!p, 'une génération en cours : la pastille est dans le document');
    if (p) {
      dit(/1 génération en cours/.test(p.innerHTML) && /0,65 \$ US/.test(p.innerHTML), 'elle dit « 1 génération en cours · 0,65 $ US » (' + p.innerHTML.replace(/<[^>]+>/g, '').trim() + ')');
      p.click(); await attendre();
      dit(m.appels.some((a) => a[0] === 'ouvrirModule' && a[1] === 'generations'), 'le clic appelle ouvrirModule(\'generations\') — malgré un localStorage qui lève');
    }
  }
  {
    const m = monde({ maintenant: T0, etat: { ok: true, liste: [g('cours')] }, coquilleRefuse: true });
    await attendre(); await attendre();
    const p = m.pill(); if (p) { p.click(); await attendre(); await attendre(); }
    dit(m.appels.some((a) => a[0] === 'appeler' && a[1] === 'generations:ouvrir'), 'la coquille refuse : le repli passe par le pont (generations:ouvrir)');
  }

  // ── 2. le chemin jusqu'à la fenêtre ──
  console.log('\n=== Le chemin jusqu’à la fenêtre ===');
  const mo = main.match(/const _MODULES_OUVRABLES\s*=\s*\[([^\]]*)\]/);
  dit(!!mo && /'generations'/.test(mo[1]), '`generations` est dans _MODULES_OUVRABLES (module:ouvrir)');
  dit(/case 'generations':\s*\{[\s\S]{0,700}?_dockOuvrir\('generations'\)[\s\S]{0,80}?break;/.test(main), 'actionApp : `case \'generations\'` ouvre par _dockOuvrir (ni dock:naviguer muet, ni fenêtre non ancrable)');
  dit(/const _dockOuvrir = async \(cle, etat\)/.test(main) && /return _dockOuvrir\(cle, etat\);/.test(main), '`_dockOuvrir` existe, et dock:ouvrir passe par lui');
  dit(/'generations':\s*\['Générations', \(\) => pageGenerations\(\)\]/.test(main), 'PAGES_ANCRABLES déclare la page (ancrable et détachable)');
  dit(/DETACHES_PAR_DEFAUT = new Set\(\[[^\]]*'generations'/.test(main), 'détachée par défaut (une vraie fenêtre au premier clic)');
  dit(/ouvrirModule:\s*\(nom\)\s*=>\s*ipcRenderer\.invoke\('module:ouvrir'/.test(preload), 'le preload des fenêtres expose ouvrirModule');
  dit(/'generations:ouvrir'/.test(main.split('const LIMITES_PONT')[0] || main), '`generations:ouvrir` est dans la liste blanche du pont');
  let page = '';
  try { page = require(path.join(RACINE, 'src', 'fenetres', 'generations.js')).pageGenerations(); } catch (e) { page = ''; }
  dit(page.length > 1000 && /class="sz-fen-generations"/.test(page), 'la page Générations se fabrique (' + page.length + ' octets), et cache sa propre pastille');

  // ── 3. partout ──
  console.log('\n=== La pastille est posée dans chaque fenêtre du socle ===');
  dit(/szGenOuvrirFenetre/.test(socle.JS_DIRE()), 'JS_DIRE porte la pastille');
  dit(/szGenOuvrirFenetre/.test(socle.JS_SOCLE()), 'JS_SOCLE aussi (il inclut JS_DIRE)');
  const dossier = path.join(RACINE, 'src', 'fenetres');
  const avec = fs.readdirSync(dossier).filter((f) => f.endsWith('.js')).filter((f) => /\$\{JS_(DIRE|SOCLE)\(\)\}/.test(fs.readFileSync(path.join(dossier, f), 'utf8')));
  dit(avec.length >= 20, avec.length + ' fenêtres posent JS_DIRE ou JS_SOCLE — elles portent toutes la pastille');

  // ── 4. la règle d'affichage ──
  console.log('\n=== Quand la pastille paraît — et quand elle s’en va ===');
  const m = monde({ maintenant: T0, etat: { ok: true, liste: [] } });
  const r = (l, t) => m.regle(l, t == null ? T0 : t);
  dit(r([]) === null, 'rien en cours ni à traiter : AUCUNE pastille');
  dit(!!r([g('cours')]) && r([g('cours')]).roue === true, 'en cours : visible, la roue tourne');
  dit(r([g('attente')]) && r([g('attente')]).ton === 'alerte' && /génération à confirmer/.test(r([g('attente')]).texte), 'à confirmer : couleur d’alerte, « 1 génération à confirmer »');
  dit(r([g('echec')]) && r([g('echec')]).ton === 'erreur' && /génération échouée/.test(r([g('echec')]).texte), 'échouée non ouverte : couleur d’erreur, « 1 génération échouée »');
  dit(r([g('echec', { vu: true })]) === null, 'échouée déjà ouverte dans la fenêtre : plus de pastille');
  dit(r([g('fini', { fin: T0 - 3000 })]) && /Génération terminée/.test(r([g('fini', { fin: T0 - 3000 })]).texte), 'terminée il y a 3 s : « ✓ Génération terminée »');
  dit(r([g('fini', { fin: T0 - 9000 })]) === null, 'terminée il y a 9 s : plus de pastille (elle reste dans l’historique de la fenêtre)');
  dit(r([g('interrompu'), g('rejete')]) === null, 'interrompue ou rejetée (son propre geste) : pas de pastille');
  const mix = r([g('cours'), g('attente')]);
  dit(mix && mix.roue && mix.ton === 'alerte' && /1 à confirmer/.test(mix.texte), 'en cours + à confirmer : la roue, et l’alerte dite');

  // la disparition RÉELLE : peinte « terminée », puis 8 s, sans nouvelle lecture
  {
    const m2 = monde({ maintenant: T0, etat: { ok: true, liste: [g('fini', { fin: T0 - 1000 })] } });
    await attendre(); await attendre();
    dit(!!m2.pill() && /Génération terminée/.test(m2.pill().innerHTML), 'terminée : la pastille paraît « ✓ Génération terminée »');
    m2.avancer(6000);
    dit(!!m2.pill(), '…toujours là 6 s plus tard (7 s après la fin)');
    m2.avancer(1200);
    dit(!m2.pill(), '…partie d’elle-même à 8 s, sans attendre une nouvelle lecture');
  }

  console.log(dur ? '\n✗ la pastille des générations : voir les NON ci-dessus\n' : '\n✓ la pastille ouvre la fenêtre Générations dans chaque fenêtre, et s’en va quand il n’y a rien à traiter\n');
  process.exit(dur);
})().catch((e) => { console.log('  NON  exception : ' + (e && e.stack || e)); process.exit(1); });
