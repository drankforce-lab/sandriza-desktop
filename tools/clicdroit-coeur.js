/* ============================================================================
   clicdroit-coeur.js — LE CLIC DROIT, ESSAYÉ AU RENDU (2026-10-13)
   ----------------------------------------------------------------------------
   ⚠ CE FICHIER N'EST PAS UN MODULE NODE : c'est un FRAGMENT que
   `banc-clic-droit.js` colle dans la page, à la place de `__COEUR__` (même
   contrat que debordement-coeur.js : mesurer(racine, contexte), `trouve`,
   `comptes`).

   ── CE QU'IL FAIT ───────────────────────────────────────────────────────────
   Dans chaque fenêtre rendue avec son jeu de réponses, il prend les LIGNES
   visibles (mêmes sélecteurs que JS_CTX du socle : [data-ctx-ligne],
   [data-ligne], [data-id], tr, li, .ligne — hors <thead>), en essaie au plus
   trois, et leur envoie un VRAI événement « contextmenu ». Il relève :
     · si un menu (.ctx) est apparu, et ses entrées ;
     · une entrée SANS libellé (un pictogramme seul : illisible dans un menu) ;
     · une exception levée pendant le clic droit.
   ⚠ IL NE CLIQUE JAMAIS UNE ENTRÉE : une entrée peut supprimer. On regarde le
     menu, on le referme (Échap), c'est tout.
   ============================================================================ */

var trouve = {};
var comptes = { vus: 0, invisibles: 0, voile: 0, image: 0, illisible: 0,
  inactifs: 0, souVoile: 0, decoratifs: 0, filtre: 0 };

function dit(s) { try { console.log('ELG-CR|' + s); } catch (x) {} }

function _visibleCd(el) {
  if (!el || !el.getBoundingClientRect) return false;
  var r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  var cs = getComputedStyle(el);
  return cs.display !== 'none' && cs.visibility !== 'hidden';
}

function mesurer(racine, contexte) {
  var erreurs = [];
  window.addEventListener('error', function (e) { erreurs.push(String((e && e.message) || e)); });
  var cand = Array.prototype.slice.call(racine.querySelectorAll('[data-ctx-ligne], [data-ligne], [data-id], tr, li, .ligne'))
    .filter(function (el) { return !el.closest('thead') && !el.closest('.ctx') && _visibleCd(el); });
  // Une ligne, pas ses sous-éléments : on écarte une candidate contenue dans une autre candidate retenue.
  var lignes = [];
  cand.forEach(function (el) { if (!lignes.some(function (l) { return l.contains(el) || el.contains(l); })) lignes.push(el); });
  var essayees = 0, menus = 0, vides = [], entrees = {};
  lignes.slice(0, 3).forEach(function (l) {
    essayees++;
    var r = l.getBoundingClientRect();
    var cible = l.querySelector('td, span, b, div') || l;
    try {
      var ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, view: window, button: 2,
        clientX: Math.round(r.left + Math.min(40, r.width / 2)), clientY: Math.round(r.top + r.height / 2) });
      cible.dispatchEvent(ev);
    } catch (e) { erreurs.push('dispatch ' + e.message); }
    var m = document.querySelector('.ctx');
    if (m && _visibleCd(m)) {
      menus++;
      Array.prototype.forEach.call(m.querySelectorAll('button'), function (b) {
        var t = String(b.textContent || '').replace(/\s+/g, ' ').trim();
        if (!/[A-Za-zÀ-ſ]/.test(t)) vides.push(t || '(vide)');
        else entrees[t] = 1;
      });
    }
    try { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } catch (e) {}
    try { document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } catch (e) {}
    var reste = document.querySelector('.ctx'); if (reste && reste.parentNode) reste.parentNode.removeChild(reste);
  });
  dit('CTX|' + contexte + '|' + lignes.length + '|' + essayees + '|' + menus + '|' + vides.length + '|'
    + Object.keys(entrees).slice(0, 12).join(' ; ').replace(/\|/g, '/') + '|' + erreurs.slice(0, 2).join(' / ').replace(/\|/g, '/'));
}
