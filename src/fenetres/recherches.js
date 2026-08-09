'use strict';

/*
 * FENÊTRE « RECHERCHES SANS RÉSULTAT » — NATIVE (1.73.0, palier 4)
 * =============================================================================
 * Ce que les clientes ont cherché dans la boutique sans rien trouver. Deux
 * séries, deux durées : le DÉTAIL des 30 derniers jours (avec le nombre de
 * fois et la dernière date) et l'ARCHIVE par mois, conservée 5 ans — la seule
 * qui dise « cette demande revient chaque automne » plutôt que « quelqu'un a
 * cherché ça une fois ».
 *
 * ⚠ CHAQUE LIGNE EST UNE VENTE MANQUÉE, ou un mot que la boutique n'emploie
 * pas alors que les clientes l'emploient. C'est une liste de courses, pas un
 * tableau de bord : elle reste volontairement dépouillée.
 *
 * ⚠ VIDER N'EFFACE QUE LE DÉTAIL : l'archive reste, et ce qui reviendra sera
 * réenregistré. La confirmation le dit.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:#8fa1b8}
input,button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
button{cursor:pointer}
input:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.5rem .65rem}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.tuile .val{font-size:.95rem;font-weight:800;margin-top:.1rem}
.tuile .sub{font-size:.66rem;color:#8fa1b8;margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}
.carte h2{margin:0 0 .5rem;font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:#8fa1b8;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:.86rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody tr:hover td{background:rgba(255,255,255,.04)}
.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.fin{width:1%;white-space:nowrap;text-align:right}
.dt{font-size:.72rem;color:#8fa1b8}
.mot{display:inline-flex;align-items:center;gap:.35rem;padding:.16rem .6rem;
  border:1px solid rgba(255,255,255,.14);border-radius:99px;font-size:.82rem;margin:.15rem}
.mot strong{font-variant-numeric:tabular-nums;color:#c9a97e}
.vide{padding:1.4rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Recherches sans résultat ». */
function pageRecherches() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Recherches sans résultat — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🔎</span><h1>Recherches sans résultat</h1>
  <span class="sous" id="sous"></span></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var msg = document.getElementById('msg');
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');

  var D = null;
  var Q = '';
  var ARME = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à ces statistiques.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  function filtrees(){
    var q = Q.trim().toLowerCase();
    if (!q) return D.recentes || [];
    return (D.recentes || []).filter(function(x){
      return String(x.q).toLowerCase().indexOf(q) !== -1;
    });
  }

  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var rows = filtrees();
    if (sous) sous.textContent = '30 derniers jours';

    var h = '<div class="tuiles">'
      + '<div class="tuile"><div class="lbl">Requêtes distinctes</div><div class="val">'
      + (D.recentes || []).length + '</div><div class="sub">30 derniers jours</div></div>'
      + '<div class="tuile"><div class="lbl">Recherches en tout</div><div class="val">'
      + (D.total || 0) + '</div><div class="sub">toutes occurrences</div></div>'
      + '<div class="tuile"><div class="lbl">Archive</div><div class="val">'
      + (D.archive || []).length + '</div><div class="sub">'
      + (D.etendue ? esc(D.etendue) : 'aucun mois archivé') + '</div></div>'
      + '</div>';

    h += '<div class="barreoutils">'
      + '<input type="search" id="rs-q" placeholder="Chercher dans la liste…" value="' + esc(Q) + '">'
      + '<div class="droite">'
      + (D.peutModifier && (D.recentes || []).length
          ? '<button class="mini danger" id="rs-vider">'
            + (ARME ? 'Confirmer ?' : 'Vider le détail') + '</button>' : '')
      + '<span>' + rows.length + ' requête' + (rows.length > 1 ? 's' : '') + '</span>'
      + '</div></div>';

    h += '<div class="carte"><h2>Ce qu’on a cherché sans trouver</h2>';
    if (!rows.length) {
      h += '<div class="vide">' + (Q ? 'Rien ne correspond.'
        : 'Aucune recherche infructueuse dans les 30 derniers jours.') + '</div>';
    } else {
      h += '<table><thead><tr><th>Recherche</th><th class="num">Fois</th>'
        + '<th>Dernière</th>' + (D.peutModifier ? '<th></th>' : '') + '</tr></thead><tbody>'
        + rows.map(function(x){
            return '<tr><td>' + esc(x.q) + '</td>'
              + '<td class="num">' + x.fois + '</td>'
              + '<td class="dt">' + esc(x.derniere || '—') + '</td>'
              + (D.peutModifier
                  ? '<td class="fin"><button class="mini danger" data-retirer="' + esc(x.q)
                    + '" title="Traitée — retirer de la liste">&#10005;</button></td>'
                  : '') + '</tr>';
          }).join('')
        + '</tbody></table>';
    }
    h += '</div>';

    /* L ARCHIVE : la seule serie qui dise ce qui REVIENT, saison apres saison.
       Une requete vue une fois n y pese rien ; une demande recurrente ressort. */
    h += '<div class="carte"><h2>Ce qui revient le plus'
      + (D.etendue ? ' <span class="dt">· archive conservée 5 ans · ' + esc(D.etendue) + '</span>' : '')
      + '</h2>';
    if (!(D.archive || []).length) {
      h += '<div class="vide">L’archive se remplira au fil des mois.</div>';
    } else {
      h += '<div>' + D.archive.map(function(a){
        return '<span class="mot">' + esc(a.q) + '<strong>' + a.fois + '</strong></span>';
      }).join('') + '</div>';
    }
    h += '</div>';

    corps.innerHTML = h;

    var q = document.getElementById('rs-q');
    if (q) q.oninput = function(){ Q = q.value; redessinerSansPerdreLaSaisie(); };

    var bv = document.getElementById('rs-vider');
    if (bv) bv.onclick = function(){
      if (!ARME) {
        ARME = true; dessiner();
        dire('Cliquez « Confirmer ? » — seul le détail des 30 jours est effacé ; l’archive reste, '
          + 'et ce qui reviendra sera réenregistré.', 'att');
        return;
      }
      ARME = false;
      appeler('recherches:vider', []).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        dire(r.efface + ' requête' + (r.efface > 1 ? 's effacées' : ' effacée') + ' du détail.', 'bon');
        charger();
      });
    };
  }

  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('rs-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('rs-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var br = t.closest('[data-retirer]');
    if (br) {
      br.disabled = true;
      appeler('recherches:retirer', [br.getAttribute('data-retirer')]).then(function(r){
        if (!r.ok) { br.disabled = false; dire(expliquer(r), 'err'); return; }
        dire('« ' + (r.q || '') + ' » retirée de la liste.', 'bon');
        charger();
      });
      return;
    }
    /* ⚠ Un clic sur une commande est traite par SA commande : sans cette
       garde, le clic remonterait ici et desarmerait ce qu il vient d armer
       (defaut vecu le 2026-08-09). */
    if (t.closest('button, input, select, label')) return;
    if (ARME) { ARME = false; dessiner(); }
  });

  function charger(){
    appeler('recherches:liste', []).then(function(r){
      if (!r || !r.ok) { vide('Recherches indisponibles', expliquer(r)); return; }
      D = r;
      dessiner();
    });
  }

  window.szActualiser = function(){
    var q = document.getElementById('rs-q');
    if (q && document.activeElement === q && q.value) return;
    if (ARME) return;
    charger();
  };
  window.szRevenir = function(){ charger(); };

  /* ── MODE ANCRE ── Le meme bouton que les autres ecrans. */
  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete');
    if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) {
      b = document.createElement('button');
      b.id = 'sz-detacher';
      b.type = 'button';
      b.setAttribute('style', 'font:inherit;font-size:.74rem;padding:.14rem .5rem;margin-left:.6rem;'
        + 'border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.05);'
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto');
      t.appendChild(b);
    }
    if (actif) {
      b.textContent = '⧉ Détacher';
      b.title = 'Ouvrir cet écran dans sa propre fenêtre';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '⚓ Ancrer';
      b.title = 'Ramener cet écran dans la fenêtre principale';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      if (ARME) { ARME = false; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageRecherches };
