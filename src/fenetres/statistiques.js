'use strict';

/*
 * FENÊTRE « STATISTIQUES » — NATIVE (2.2.0, palier 4)
 * =============================================================================
 * Deux onglets : GOOGLE ANALYTICS (la fréquentation de la boutique) et
 * TÉLÉPHONIE (les appels Twilio, leur coût et le solde prépayé).
 *
 * ⚠⚠ CES CHIFFRES NE VIENNENT PAS DE LA BASE. Ils sont demandés à Google et à
 * Twilio par le réseau, à chaque affichage. Deux conséquences tenues ici :
 *   ① la lecture est LONGUE et peut échouer sans que rien ne soit cassé ;
 *   ② un refus NE VIDE JAMAIS L'ÉCRAN — les chiffres déjà affichés restent, et
 *      l'erreur est dite en bas avec l'heure de la dernière lecture réussie.
 *      « Aucune donnée » après une panne de réseau ferait croire à une chute
 *      de fréquentation, ce qui est un mensonge coûteux.
 *
 * ⚠ La PÉRIODE est envoyée en paramètre à chaque appel : elle n'est l'état de
 * personne d'autre que cette fenêtre.
 *
 * ⚠ PÉRIMÈTRE : les RÉGLAGES (clé du compte de service Google, compte Twilio)
 * restent à l'écran Configuration de la fenêtre principale — la fenêtre le dit.
 * L'onglet « Recherche invalide » du même écran a sa propre fenêtre.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);
  font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;
  padding:.6rem 1.1rem;border-bottom:1px solid var(--v08);
  background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .sous{font-size:.73rem;color:var(--tx2);margin-left:auto}
.corps{flex:1 1 auto;min-height:0;padding:.8rem 1.05rem;overflow-y:auto;
  display:flex;flex-direction:column;gap:.7rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.barreoutils{flex:0 0 auto;display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}
.barreoutils .droite{margin-left:auto;display:flex;gap:.5rem;align-items:center;
  font-size:.78rem;color:var(--tx2)}
input,button,select{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
button{cursor:pointer}
input:focus,button:focus,select:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#8f6f42;border-color:#a3824f;color:var(--tx-sur-accent);font-weight:600}
button.prim:hover:not(:disabled){background:#a3824f}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:.5rem}
.tuile{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.5rem .65rem;text-align:center}
.tuile .val{font-size:1.15rem;font-weight:800;line-height:1.2;white-space:nowrap}
.tuile .lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:var(--tx2);margin-top:.12rem}
.tuile .val.or{color:var(--tx-or)}.tuile .val.bon{color:var(--tx-ok)}.tuile .val.mal{color:var(--tx-err)}
.tuile .val.att{color:var(--tx-att)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.6rem .75rem}
.carte h3{margin:0 0 .4rem;font:700 .82rem/1.3 Georgia,serif;color:var(--tx-gris2)}
.grilles{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.55rem}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.22rem .4rem;font-size:.66rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody td{padding:.26rem .4rem;border-top:1px solid var(--v055);vertical-align:top}
tbody tr:hover td{background:var(--v04)}
.num{text-align:right;white-space:nowrap}
.dt{font-size:.72rem;color:var(--tx2)}
.chemin{font-size:.68rem;color:var(--tx3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tronq{max-width:20rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Graphique : des barres qui montent, une graduation, rien de plus. */
.graph{display:flex;align-items:flex-end;gap:2px;height:130px;
  border-left:1px solid var(--v12);border-bottom:1px solid var(--v12);
  padding:0 .2rem}
.col{flex:1 1 0;min-width:2px;background:#8f6f42;border-radius:2px 2px 0 0;position:relative}
.col:hover{background:#c9a97e}
.gmax{font-size:.66rem;color:var(--tx2);margin-bottom:.15rem}
.avis{border-radius:9px;padding:.42rem .65rem;font-size:.78rem;line-height:1.55}
.avis.att{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.32);color:#fde68a}
.avis.mal{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.34);color:var(--tx-err2)}
.note{font-size:.73rem;color:var(--tx2);line-height:1.6;border-top:1px solid var(--v07);
  padding-top:.5rem;margin-top:.2rem}
.vide{padding:1.4rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Statistiques ». */
function pageStatistiques(ongletDepart) {
  const dep = (ongletDepart === 'tel') ? 'tel' : 'ga';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Statistiques — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.mktstats}</span><h1>Statistiques</h1>
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

  var ONGLET = ${JSON.stringify(dep)};   // ga | tel
  var DGA = null, DTEL = null;           // la DERNIERE lecture REUSSIE
  var LUGA = '', LUTEL = '';             // heure de cette lecture
  var AVGA = '', AVTEL = '';             // le refus a afficher SANS effacer les chiffres
  var PLAGE = '7d';                      // 7d | 30d | 90d
  var JOURS = 30;                        // 7 | 30 | 90
  var CHARGE = false;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function nb(n){ return Number(n || 0).toLocaleString('fr-CA'); }
  function heure(){
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès aux statistiques.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'Le service n’a pas répondu à temps. Réessayez : les chiffres affichés sont ceux de la dernière lecture réussie.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    ga_desactive:       'Le suivi Google Analytics est désactivé. Configuration → Statistiques, dans la fenêtre principale.',
    ga_sans_propriete:  'Aucun identifiant de propriété GA4 n’est renseigné. Configuration → Statistiques.',
    ga_sans_cle:        'Aucune clé de compte de service Google n’est enregistrée. Configuration → Statistiques.',
    tel_desactive:      'La téléphonie est désactivée. Configuration → Téléphonie, dans la fenêtre principale.',
    tel_sans_compte:    'Aucun compte Twilio n’est enregistré. Configuration → Téléphonie.',
    reseau:             'Le service n’a pas pu être joint.',
    refus:              'Le service a refusé la demande.',
    echec:              'La lecture a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' ' + esc(String(r.detail).slice(0, 160));
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec' }; });
  }

  /* Un refus qui EMPECHE toute lecture (pas encore configuré, pas le droit) se
     montre en pleine page ; un refus PASSAGER se met en bandeau au-dessus des
     chiffres deja lus. La difference n est pas cosmetique : dans le second cas
     les chiffres affiches sont encore vrais, ils sont juste vieux. */
  function bloquant(m){
    return m === 'droit' || m === 'ga_desactive' || m === 'ga_sans_propriete'
        || m === 'ga_sans_cle' || m === 'tel_desactive' || m === 'tel_sans_compte'
        || m === 'operation_inconnue' || m === 'session';
  }

  function onglets(){
    var h = '<div class="barreoutils">'
      + '<button class="mini' + (ONGLET === 'ga' ? ' actif' : '') + '" data-onglet="ga">Google Analytics</button>'
      + '<button class="mini' + (ONGLET === 'tel' ? ' actif' : '') + '" data-onglet="tel">Téléphonie</button>';
    if (ONGLET === 'ga') {
      h += [['7d', '7 jours'], ['30d', '30 jours'], ['90d', '90 jours']].map(function(p){
        return '<button class="mini' + (PLAGE === p[0] ? ' actif' : '') + '" data-plage="' + p[0] + '">'
          + p[1] + '</button>';
      }).join('');
    } else {
      h += [[7, '7 jours'], [30, '30 jours'], [90, '90 jours']].map(function(p){
        return '<button class="mini' + (JOURS === p[0] ? ' actif' : '') + '" data-jours="' + p[0] + '">'
          + p[1] + '</button>';
      }).join('');
    }
    var lu = (ONGLET === 'ga') ? LUGA : LUTEL;
    h += '<div class="droite">'
      + (lu ? '<span>lu à ' + esc(lu) + '</span>' : '')
      + '<button class="mini" id="st-relire"' + (CHARGE ? ' disabled' : '') + '>'
      + (CHARGE ? 'Lecture…' : '↻ Relire') + '</button>'
      + '</div></div>';
    return h;
  }

  function renvoi(){
    return '<div class="note">Les <strong>réglages</strong> — clé du compte de service Google, '
      + 'compte Twilio — vivent à l’écran <strong>Configuration</strong> de la fenêtre principale. '
      + 'Les recherches sans résultat ont leur propre fenêtre.</div>';
  }

  function tuile(lbl, val, cl){
    return '<div class="tuile"><div class="val' + (cl ? ' ' + cl : '') + '">' + esc(val)
      + '</div><div class="lbl">' + esc(lbl) + '</div></div>';
  }

  /* Le graphique : des barres proportionnelles au plus haut jour. Le maximum
     est ECRIT au-dessus — une barre sans echelle ne dit rien. */
  function graphique(serie, cle, mot){
    if (!serie || !serie.length) return '<div class="vide">Aucune donnée sur la période.</div>';
    var max = 1, i;
    for (i = 0; i < serie.length; i++) if (Number(serie[i][cle]) > max) max = Number(serie[i][cle]);
    var cols = serie.map(function(s){
      var v = Number(s[cle]) || 0;
      var h = Math.max(v > 0 ? 3 : 0, Math.round(v / max * 100));
      return '<div class="col" style="height:' + h + '%" title="' + esc(s.date) + ' — '
        + nb(v) + ' ' + esc(mot) + '"></div>';
    }).join('');
    return '<div class="gmax">Maximum : ' + nb(max) + ' ' + esc(mot) + ' en une journée</div>'
      + '<div class="graph">' + cols + '</div>';
  }

  function tableau(titre, colonne, valeur, lignes, cleNom, cleVal){
    var corpsT = lignes && lignes.length
      ? lignes.map(function(x){
          return '<tr><td class="tronq">' + esc(x[cleNom]) + '</td><td class="num">'
            + nb(x[cleVal]) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="2" class="dt" style="text-align:center">—</td></tr>';
    return '<div class="carte"><h3>' + esc(titre) + '</h3><table><thead><tr><th>'
      + esc(colonne) + '</th><th class="num">' + esc(valeur) + '</th></tr></thead><tbody>'
      + corpsT + '</tbody></table></div>';
  }

  /* ══ ONGLET GOOGLE ANALYTICS ════════════════════════════════════════════ */
  function vueGa(){
    var h = '';
    if (AVGA) h += '<div class="avis att">' + AVGA + '</div>';
    if (!DGA) {
      return h + (AVGA ? '' : '<div class="vide">Lecture des statistiques…</div>');
    }
    var t = DGA.totaux;
    h += '<div class="tuiles">' + tuile('Visiteurs', nb(t.visiteurs), 'or')
      + tuile('Sessions', nb(t.sessions), 'or')
      + tuile('Pages vues', nb(t.pagesVues), 'or') + '</div>';
    if (DGA.engagement) {
      h += '<div class="tuiles">' + tuile('Durée moy. session', DGA.engagement.dureeMoyenne)
        + tuile('Taux de rebond', DGA.engagement.rebond)
        + tuile('Pages / session', DGA.engagement.pagesParSession)
        + tuile('Taux d’engagement', DGA.engagement.engagement) + '</div>';
    }
    h += '<div class="carte"><h3><span class="ic">📈</span> Pages vues par jour — ' + esc(DGA.plageLibelle) + '</h3>'
      + graphique(DGA.serie, 'vues', 'pages vues') + '</div>';

    var pages = (DGA.pages || []).length
      ? DGA.pages.map(function(p){
          return '<tr><td class="tronq">' + esc(p.titre)
            + (p.chemin && p.chemin !== p.titre ? '<div class="chemin">' + esc(p.chemin) + '</div>' : '')
            + '</td><td class="num">' + nb(p.vues) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="2" class="dt" style="text-align:center">—</td></tr>';
    h += '<div class="carte"><h3><span class="ic">🔝</span> Pages populaires</h3><table><thead><tr><th>Page</th>'
      + '<th class="num">Vues</th></tr></thead><tbody>' + pages + '</tbody></table></div>';

    h += '<div class="grilles">'
      + tableau('🌍 Pays', 'Pays', 'Visiteurs', DGA.pays, 'nom', 'visiteurs')
      + tableau('🏙️ Villes', 'Ville', 'Visiteurs', DGA.villes, 'nom', 'visiteurs')
      + tableau('📱 Appareils', 'Type', 'Visiteurs', DGA.appareils, 'nom', 'visiteurs')
      + tableau('🌐 Sources de trafic', 'Canal', 'Sessions', DGA.sources, 'nom', 'sessions')
      + tableau('🧑 Nouveaux / connus', 'Type', 'Visiteurs', DGA.nouveauxConnus, 'nom', 'visiteurs')
      + '</div>';
    return h;
  }

  /* ══ ONGLET TÉLÉPHONIE ══════════════════════════════════════════════════ */
  function vueTel(){
    var h = '';
    if (AVTEL) h += '<div class="avis att">' + AVTEL + '</div>';
    if (!DTEL) {
      return h + (AVTEL ? '' : '<div class="vide">Lecture des appels…</div>');
    }
    var t = DTEL.totaux;
    /* ⚠ Le solde prepaye : quand il tombe a zero, la ligne cesse de repondre.
       Absent, on le DIT — un solde vide n est pas un solde nul. */
    h += '<div class="avis' + (DTEL.solde ? ' att' : ' mal') + '" style="display:flex;'
      + 'justify-content:space-between;gap:1rem;flex-wrap:wrap">'
      + '<span><span class="ic">📞</span> Appels des <strong>' + DTEL.jours + ' derniers jours</strong>. '
      + 'Coûts en dollars US, la devise de facturation.</span>'
      + '<span>' + (DTEL.solde ? '<span class="ic">💰</span> Solde restant : <strong>' + esc(DTEL.solde) + '</strong>'
                               : 'Solde indisponible') + '</span></div>';
    h += '<div class="tuiles">' + tuile('Appels', nb(t.appels), 'or')
      + tuile('Entrants', nb(t.entrants))
      + tuile('Répondus', nb(t.repondus), 'bon')
      + tuile('Manqués', nb(t.manques), t.manques ? 'mal' : '')
      + tuile('Minutes', nb(t.minutes))
      + tuile('Durée moy.', t.dureeMoyenne)
      + tuile('Coût total', t.cout, 'att') + '</div>';
    h += '<div class="carte"><h3><span class="ic">📈</span> Appels par jour</h3>'
      + graphique(DTEL.serie, 'appels', 'appels') + '</div>';

    var rows = (DTEL.appels || []).length
      ? DTEL.appels.map(function(c){
          return '<tr><td>' + esc(c.de) + '</td><td class="dt">' + esc(c.sens) + '</td>'
            + '<td class="dt">' + esc(c.statut) + '</td><td class="num">' + c.duree + ' s</td>'
            + '<td class="num">' + esc(c.cout || '—') + '</td>'
            + '<td class="dt">' + esc(c.date) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="6" class="dt" style="text-align:center">Aucun appel.</td></tr>';
    h += '<div class="carte"><h3><span class="ic">📋</span> Appels récents</h3><table><thead><tr><th>Appelant</th>'
      + '<th>Sens</th><th>Statut</th><th class="num">Durée</th><th class="num">Coût</th>'
      + '<th>Date</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    return h;
  }

  function dessiner(){
    corps.innerHTML = onglets() + (ONGLET === 'ga' ? vueGa() : vueTel()) + renvoi();
    var b = document.getElementById('st-relire');
    if (b) b.onclick = function(){ charger(true); };
  }

  function charger(demande){
    if (CHARGE) return;
    CHARGE = true;
    dessiner();
    var pourGa = (ONGLET === 'ga');
    var op = pourGa ? 'stats:ga' : 'stats:telephonie';
    var arg = pourGa ? PLAGE : JOURS;
    appeler(op, [arg]).then(function(r){
      CHARGE = false;
      if (r && r.ok) {
        if (pourGa) { DGA = r; LUGA = heure(); AVGA = ''; }
        else        { DTEL = r; LUTEL = heure(); AVTEL = ''; }
        dessiner();
        if (demande) dire('Chiffres à jour.', 'bon');
        return;
      }
      var texte = expliquer(r);
      /* ⚠ ON N EFFACE RIEN. Les chiffres deja lus restent a l ecran, avec la
         raison du refus au-dessus et l heure de la derniere lecture reussie. */
      if (bloquant(r && r.motif)) {
        if (pourGa) { DGA = null; AVGA = texte; } else { DTEL = null; AVTEL = texte; }
      } else {
        var vieux = pourGa ? LUGA : LUTEL;
        var suffixe = vieux ? (' Les chiffres affichés sont ceux de ' + vieux + '.') : '';
        if (pourGa) AVGA = texte + suffixe; else AVTEL = texte + suffixe;
      }
      dessiner();
      dire(texte, 'err');
    });
  }

  corps.addEventListener('click', function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var og = t.closest('[data-onglet]');
    if (og) {
      var v = og.getAttribute('data-onglet');
      if (v === ONGLET) return;
      ONGLET = v;
      /* On ne relit que si cet onglet n a rien : revenir sur un onglet deja lu
         doit etre instantane, pas repayer une seconde d attente. */
      if ((ONGLET === 'ga' && !DGA && !AVGA) || (ONGLET === 'tel' && !DTEL && !AVTEL)) charger(false);
      else dessiner();
      return;
    }
    var bp = t.closest('[data-plage]');
    if (bp) { PLAGE = bp.getAttribute('data-plage'); charger(true); return; }
    var bj = t.closest('[data-jours]');
    if (bj) { JOURS = parseInt(bj.getAttribute('data-jours'), 10) || 30; charger(true); return; }
  });

  window.szActualiser = function(){ if (!CHARGE) charger(false); };
  window.szRevenir = function(){ if (!CHARGE) charger(false); };

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
        + 'border:1px solid var(--v16);border-radius:7px;background:var(--v05);'
        + 'color:var(--tx);cursor:pointer;flex:0 0 auto');
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
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });

  if (sous) sous.textContent = 'chiffres demandés à Google et à Twilio';
  charger(false);
})();
</script>
</body></html>`;
}

module.exports = { pageStatistiques };
