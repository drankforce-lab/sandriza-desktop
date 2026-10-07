#!/usr/bin/env node
'use strict';
/* « REPRENDRE » DOIT RENDRE LA SAISIE — même quand remplir() redessine (2026-10-07).
   Le défaut des Offres : la boîte de reprise paraissait, tous les bancs étaient
   verts, et « Reprendre » rendait un formulaire VIDE — remplir() posait les champs
   puis dessiner() rebâtissait la boîte depuis FORM (vide en création). Aucun banc
   ne cliquait Reprendre puis ne RELISAIT les champs. Celui-ci le fait, dans un
   mini-DOM où innerHTML RECRÉE les éléments (c'est ce qui rend un redessin
   destructeur), puis lit chaque remplir() réel des fenêtres.
   Panne provoquée : retirer `_brReposerDom(r.brouillon)` du socle → le cas 2 refuse. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const DOS = path.join(__dirname, '..', 'src', 'fenetres');
const socle = require(path.join(DOS, 'socle.js'));
const JSB = typeof socle.JS_BROUILLON === 'function' ? socle.JS_BROUILLON() : socle.JS_BROUILLON;
let mal = 0;
const dire = (ok, m) => { console.log((ok ? '  OK   ' : '  NON  ') + m); if (!ok) mal++; };

function monde(BROUILLON, remplirSrc) {
  const ids = new Map(), ecDoc = {};
  const elem = (id, a) => ({ id, value: a.value || '', checked: !!a.checked, style: {}, parentNode: null,
    _h: {}, onchange: null, onclick: null, focus() {},
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); },
    dispatchEvent(ev) {
      (ecDoc[ev.type] || []).forEach((f) => f(ev));
      if (this['on' + ev.type]) this['on' + ev.type](ev);
      (this._h[ev.type] || []).forEach((f) => f(ev));
      return true;
    } });
  const poser = (html) => {
    const rx = /<(input|select|textarea|button)\b([^>]*)>/g; let m;
    while ((m = rx.exec(String(html)))) {
      const at = m[2], id = (at.match(/\bid="([^"]+)"/) || [])[1]; if (!id) continue;
      ids.set(id, elem(id, { value: (at.match(/\bvalue="([^"]*)"/) || [])[1], checked: /\bchecked\b/.test(at) }));
    }
  };
  const conteneur = () => ({ style: {}, parentNode: null, className: '', set innerHTML(h) { poser(h); }, get innerHTML() { return ''; } });
  const corps = conteneur();
  const doc = { getElementById: (id) => ids.get(String(id)) || null, createElement: () => conteneur(),
    body: { appendChild(n) { n.parentNode = this; }, removeChild() {} },
    addEventListener(t, f) { (ecDoc[t] = ecDoc[t] || []).push(f); }, removeEventListener() {}, querySelectorAll: () => [] };
  const win = { szPont: { brouillonSale() {}, appeler(op) {
    return Promise.resolve(op === 'brouillon:lire' ? { ok: true, profil: 'p1', ilYaMin: 5, brouillon: BROUILLON } : { ok: true });
  } } };
  win.addEventListener = () => {};
  const ctx = vm.createContext({ window: win, document: doc, corps, setTimeout: () => 0, clearTimeout() {},
    Promise, JSON, Object, String, Math, Array,
    Event: class { constructor(t, o) { this.type = t; this.bubbles = !!(o && o.bubbles); } } });
  vm.runInContext('(function(){' + JSB + `
    var ETAT = { nom: '', genre: 'percent' }; var BLOC = '';
    function dessiner(){ corps.innerHTML = '<input id="f-nom" value="' + ETAT.nom + '"><select id="f-genre" value="' + ETAT.genre + '">'; }
    dessiner();
    szBrouillonBrancher({ portee: 't', cle: function(){ return '__new__'; }, actif: function(){ return true; },
      rempli: function(){ return true; }, valeurs: function(){ return szBrouillonDuDom(['f-nom','f-genre'], []); },
      remplir: ${remplirSrc} });
    window.__prop = szBrouillonProposer;
    window.__brancherGenre = function(){ var g = document.getElementById('f-genre'); g.onchange = function(){ BLOC = g.value; }; };
    window.__bloc = function(){ return BLOC; };
  })();`, ctx);
  return { win, ids };
}
async function reprendre(BROUILLON, remplirSrc) {
  const m = monde(BROUILLON, remplirSrc);
  const p = m.win.__prop();
  for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
  const oui = m.ids.get('szbr-oui'); if (!oui) return { m, sansBoite: true };
  oui.onclick(); await p; return { m };
}
const BR = { 'f-nom': 'Solde du printemps', 'f-genre': 'tiered', _c: {} };

(async () => {
  console.log('\n== Reprendre rend la saisie ==');
  let r = await reprendre(BR, 'function(v){ szBrouillonAuDom(v); }');
  dire(!r.sansBoite, 'la boîte de reprise se dessine (sinon le banc ne prouve rien)');
  dire(!r.sansBoite && r.m.ids.get('f-nom').value === 'Solde du printemps', 'remplir sans redessin : les champs reviennent (témoin)');
  r = await reprendre(BR, 'function(v){ szBrouillonAuDom(v); dessiner(); }');
  dire(!r.sansBoite && r.m.ids.get('f-nom').value === 'Solde du printemps', 'remplir QUI REDESSINE : les champs reviennent quand même (le défaut des Offres)');
  r = await reprendre(BR, 'function(v){ dessiner(); window.__brancherGenre(); }');
  dire(!r.sansBoite && r.m.win.__bloc() === 'tiered', 'un « change » atteint la liste reposée (les blocs dépendants suivent)');
  r = await reprendre(BR, 'function(v){ return false; }');
  dire(!r.sansBoite && r.m.ids.get('f-nom').value === '', 'remplir qui REFUSE : rien n’est reposé (la ceinture de la fenêtre tient)');
  r = await reprendre({ w: 2, 'f-nom': 'NE PAS POSER' }, 'function(v){}');
  dire(!r.sansBoite && r.m.ids.get('f-nom').value === '', 'brouillon-modèle (sans _c) : le socle ne touche pas au DOM');

  console.log('\n== Aucun remplir n’écrit dans le DOM avant de le redessiner ==');
  const REDESSIN = /(^|[^.\w])(dessiner\w*|charger|recharger|vueRegistre)\s*\(/;
  const ECRIT = /szBrouillonAuDom\s*\(|\.checked\s*=|\.value\s*=|\.innerHTML\s*=/;
  let vus = 0;
  for (const f of fs.readdirSync(DOS).filter((x) => x.endsWith('.js') && x !== 'socle.js')) {
    const t = fs.readFileSync(path.join(DOS, f), 'utf8');
    const rx = /remplir:\s*function\s*\(/g; let mm;
    while ((mm = rx.exec(t))) {
      const i = mm.index;
      const k = t.indexOf('{', i); let n = 0, j = k;
      for (; j < t.length; j++) { if (t[j] === '{') n++; else if (t[j] === '}' && --n === 0) break; }
      const corpsR = t.slice(k + 1, j).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      vus++;
      const mr = REDESSIN.exec(corpsR); if (!mr) continue;
      const avantR = corpsR.slice(0, mr.index), apresR = corpsR.slice(mr.index);
      const ligne = t.slice(0, i).split('\n').length;
      const mort = ECRIT.test(avantR) && !/szBrouillonAuDom\s*\(/.test(apresR);
      dire(!mort, `${f}:${ligne}  ${mort ? 'écrit dans le DOM puis appelle ' + mr[2] + '() — ce qui est posé est effacé' : 'redessine, puis repose la saisie'}`);
    }
  }
  dire(vus >= 15, vus + ' remplir lus (plancher 15 : un banc qui ne lit rien ne prouve rien)');
  console.log(mal ? `\n${mal} refus.` : '\nTOUT EST BON.');
  process.exit(mal ? 1 : 0);
})();
