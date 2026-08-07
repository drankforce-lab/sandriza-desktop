'use strict';

/*
 * ASSISTANT « PRÉPARATION DE COMMANDE » — NATIF, QUATRE ÉTAPES
 * =============================================================================
 * Prélèvement, vérification, étiquette, expédition. Écrit ici, aucune page du
 * site chargée, aucun appel web : la fenêtre demande au pont, qui fait faire au
 * site ce que lui seul peut faire — imprimer, appeler le transporteur, écrire.
 *
 * ⚠ POURQUOI CETTE FENÊTRE-LÀ COMPTE PLUS QUE LES AUTRES.
 * On la tient à côté d'un colis, souvent debout, parfois sur un second écran
 * posé dans l'entrepôt. Elle doit se lire de loin et se manœuvrer sans chercher :
 * de gros compteurs, une ligne par article, aucun défilement, et un bouton par
 * étape. C'est aussi pour ça que la liste des articles est PAGINÉE.
 *
 * ⚠ CE QUI N'EN SORT PAS. Ni moyen de paiement, ni coût d'acquisition, ni marge.
 * Une fenêtre de préparation n'a aucune raison de les connaître, et elle est
 * posée là où passent des gens qui n'ont pas à les voir.
 *
 * ⚠ L'ÉTAT DE VÉRIFICATION VIT DANS `COMPTES`, PAS DANS LES CHAMPS AFFICHÉS.
 * La liste est paginée et redessinée à chaque page : lire les champs au moment
 * de conclure n'aurait rendu que la page visible, et les articles des autres
 * pages auraient compté pour zéro — un colis déclaré vérifié sans l'être.
 */

const { CSS_SOCLE, JS_SOCLE } = require('./socle');

const CSS_PROPRE = `
.entete{display:flex;gap:1.1rem;align-items:baseline;flex-wrap:wrap;margin-bottom:.55rem}
.entete .num{font:700 1.15rem/1 Georgia,serif;color:#e8dcc6}
.entete .cli{font-size:.9rem}
.entete .adr{font-size:.78rem;color:#8fa1b8;flex:1 1 100%}
.art{display:flex;align-items:center;gap:.6rem;padding:.3rem .35rem;border-radius:7px;
  border:1px solid transparent}
.art:hover{background:rgba(255,255,255,.035)}
.art.ok{border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.08)}
.art.trop{border-color:rgba(248,113,113,.6);background:rgba(248,113,113,.08)}
.art .pt{flex:0 0 auto;width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,.22);
  display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700}
.art.ok .pt{background:#4ade80;border-color:#4ade80;color:#0e1522}
.art.trop .pt{background:#f87171;border-color:#f87171;color:#0e1522}
.art .d{flex:1 1 auto;min-width:0}
.art .n{font-size:.92rem;font-weight:600;line-height:1.25}
.art .v{font-size:.76rem;color:#8fa1b8}
.art .cpt{flex:0 0 auto;font-variant-numeric:tabular-nums;font-size:.88rem;min-width:3rem;text-align:right}
.art .q{flex:0 0 4.4rem}
.barre{flex:0 0 auto;height:6px;border-radius:6px;background:rgba(255,255,255,.09);overflow:hidden;margin:.5rem 0 .2rem}
.barre span{display:block;height:100%;background:#4ade80;width:0;transition:width .18s}
.gros{font:700 1.6rem/1 Georgia,serif;color:#e8dcc6}
.duo{display:flex;gap:.7rem;flex-wrap:wrap}
.duo>*{flex:1 1 220px}
.etat{display:flex;align-items:center;gap:.5rem;font-size:.86rem;padding:.4rem 0}
`;

/** Page complète de l'assistant. `id` = commande à préparer. */
function pageCommande(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Préparation — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}</style></head><body>
<div class="tete"><span class="ic">📦</span><h1 id="titre">Préparation</h1>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">Précédent</button>
    <button id="btn-suiv">Suivant</button>
    <button id="btn-annuler">Fermer</button>
    <button id="btn-enr" class="prim" disabled>Expédier</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE}
  MOTIFS.suivi_requis = 'Entrez un numéro de suivi, ou cochez « expédier sans numéro ».';

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null, CMD = null, COMPTES = {}, PAGI = null;

  function dire(t, genre){
    var m = document.getElementById('msg');
    m.textContent = t || ''; m.className = 'msg' + (genre ? ' ' + genre : '');
  }
  function vide(titre, detail){
    document.getElementById('corps').innerHTML =
      '<div class="vide"><div class="gros">' + esc(titre) + '</div><div>' + esc(detail || '') + '</div></div>';
    document.getElementById('pas').innerHTML = '';
    ['btn-enr','btn-prec','btn-suiv'].forEach(function(b){ document.getElementById(b).disabled = true; });
  }

  function attendus(){ return CMD.articles.reduce(function(n, a){ return n + a.quantite; }, 0); }
  function comptes(){
    var n = 0;
    CMD.articles.forEach(function(a){ n += Math.min(COMPTES[a.cle] || 0, a.quantite); });
    return n;
  }
  function toutVerifie(){
    return CMD.articles.every(function(a){ return (COMPTES[a.cle] || 0) === a.quantite; });
  }

  function dessiner(){
    var h = [];
    var enTete = '<div class="entete"><span class="num">' + esc(CMD.numero) + '</span>'
      + '<span class="cli">' + esc(CMD.client) + '</span>'
      + '<span class="adr">' + esc(CMD.adresse) + '</span></div>';

    // 1 — Prélèvement
    h.push('<div class="etape"><div class="carte plein" id="c-zone">' + enTete
      + '<h2>Articles à prélever — ' + CMD.nbColis + (CMD.nbColis > 1 ? ' unités' : ' unité') + '</h2>'
      + '<div class="rech"><input placeholder="Filtrer par nom, taille ou couleur…"><span class="cpt" id="c-cpt"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div>'
      + '<div style="margin-top:.6rem;display:flex;gap:.45rem;flex-wrap:wrap">'
      + '<button type="button" id="c-bon">🖨 Bon de prélèvement</button>'
      + '<button type="button" id="c-colis">🖨 Bon de colisage</button>'
      + '</div></div></div>');

    // 2 — Vérification
    h.push('<div class="etape"><div class="carte plein" id="c-zone2">'
      + '<h2>Vérification du colis</h2>'
      + '<div class="etat"><span class="gros" id="c-prog">0</span>'
      + '<span style="color:#8fa1b8">sur ' + attendus() + ' unités confirmées</span></div>'
      + '<div class="barre"><span id="c-barre"></span></div>'
      + '<div class="rech"><input placeholder="Filtrer…"><span class="cpt" id="c-cpt2"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div></div></div>');

    // 3 — Étiquette
    h.push('<div class="etape"><div class="carte"><h2>Étiquette d’expédition</h2><div class="duo">'
      + '<div class="ch"><label for="c-transp">Transporteur</label><select id="c-transp">'
      + CTX.transporteurs.map(function(t){ return '<option value="' + esc(t.cle) + '">' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label>&nbsp;</label><button type="button" id="c-etiq">Générer l’étiquette</button></div>'
      + '</div></div>'
      + '<div class="carte plein"><h2>Numéro de suivi</h2><div class="duo">'
      + '<div class="ch"><label for="c-suivi">Numéro</label><input id="c-suivi" placeholder="rempli par l’étiquette"></div>'
      + '</div>'
      + '<label style="display:flex;align-items:center;gap:.45rem;font-size:.85rem;margin-top:.7rem;cursor:pointer">'
      + '<input type="checkbox" id="c-sans"> Expédier sans numéro de suivi</label>'
      + '<div class="aide" style="margin-top:.4rem">Remise en main propre, cueillette, transporteur local. '
      + 'Le client reçoit alors un courriel <strong>sans lien de suivi</strong> — c’est préférable à un numéro '
      + 'inventé qu’elle chercherait en vain.</div></div></div>');

    // 4 — Expédition
    h.push('<div class="etape"><div class="carte plein"><h2>Récapitulatif</h2>'
      + '<div id="c-recap"></div>'
      + '<label style="display:flex;align-items:center;gap:.45rem;font-size:.86rem;margin-top:.8rem;cursor:pointer">'
      + '<input type="checkbox" id="c-pret"> Marquer « prête à l’expédition »</label>'
      + '<div class="aide" style="margin-top:.5rem">« Expédier » écrit le statut, envoie le courriel de suivi '
      + 'au client et referme cette fenêtre.</div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');
    document.getElementById('c-pret').checked = !!CMD.dejaPret;
    poser('c-suivi', CMD.suivi || '');
    if (CMD.transporteur) poser('c-transp', CMD.transporteur);

    listes();
    brancher();

    Assist.poser([
      { t: 'Prélèvement',  obl: [] },
      { t: 'Vérification', obl: [] },
      { t: 'Étiquette',    obl: [] },
      { t: 'Expédition',   obl: [] }
    ], function(i){
      if (i === 0 && PAGI) PAGI.dessiner();
      if (i === 1 && PAGI2) { PAGI2.dessiner(); majProgres(); }
      if (i === 3) recap();
    });

    bEnr.disabled = !CTX.peutExpedier;
    if (!CTX.peutExpedier) dire('Votre rôle ne permet pas d’expédier.', 'att');
  }

  var PAGI2 = null;
  function listes(){
    // Etape 1 : la liste de prelevement, en lecture.
    PAGI = new Pagi(document.getElementById('c-zone'), {
      ligne: function(a){
        return '<div class="art"><span class="pt"></span><div class="d">'
          + '<div class="n">' + esc(a.nom) + '</div>'
          + '<div class="v">' + esc([a.taille, a.couleur].filter(Boolean).join(' · ') || a.sku) + '</div></div>'
          + '<span class="cpt">×' + a.quantite + '</span></div>';
      },
      surMaj: function(){
        var c = document.getElementById('c-cpt');
        if (c) c.textContent = CMD.articles.length + (CMD.articles.length > 1 ? ' lignes' : ' ligne');
      }
    });
    PAGI.tout = CMD.articles;
    PAGI.brancher();

    // Etape 2 : la meme liste, avec un compteur par ligne.
    PAGI2 = new Pagi(document.getElementById('c-zone2'), {
      ligne: function(a){
        var v = COMPTES[a.cle] || 0;
        var cl = v === a.quantite ? ' ok' : (v > a.quantite ? ' trop' : '');
        return '<div class="art' + cl + '" data-cle="' + esc(a.cle) + '">'
          + '<span class="pt">' + (v === a.quantite ? '✓' : (v > a.quantite ? '!' : '')) + '</span>'
          + '<div class="d"><div class="n">' + esc(a.nom) + '</div>'
          + '<div class="v">' + esc([a.taille, a.couleur].filter(Boolean).join(' · ') || a.sku) + '</div></div>'
          + '<span class="cpt">' + v + '/' + a.quantite + '</span>'
          + '<input class="q" type="number" min="0" step="1" data-cle="' + esc(a.cle) + '" value="' + v + '">'
          + '</div>';
      },
      surMaj: function(){
        var c = document.getElementById('c-cpt2');
        if (c) c.textContent = toutVerifie() ? 'colis complet' : 'incomplet';
      }
    });
    PAGI2.tout = CMD.articles;
    PAGI2.brancher();
    document.getElementById('c-zone2').querySelector('.liste').addEventListener('input', function(ev){
      var q = ev.target.closest('.q'); if (!q) return;
      COMPTES[q.dataset.cle] = Math.max(0, parseInt(q.value, 10) || 0);
      PAGI2.dessiner(); majProgres();
    });
  }

  function majProgres(){
    var att = attendus(), f = comptes();
    var g = document.getElementById('c-prog'); if (g) g.textContent = f;
    var b = document.getElementById('c-barre');
    if (b) b.style.width = (att ? Math.round((f / att) * 100) : 100) + '%';
  }

  function recap(){
    var z = document.getElementById('c-recap'); if (!z) return;
    function lg(k, v, alerte){
      return '<div class="art" style="border:0"><div class="d"><div class="v">' + esc(k) + '</div>'
        + '<div class="n"' + (alerte ? ' style="color:#fbbf24"' : '') + '>' + (v || '—') + '</div></div></div>';
    }
    var t = (CTX.transporteurs.find(function(x){ return x.cle === val('c-transp'); }) || {}).nom || val('c-transp');
    var complet = toutVerifie();
    z.innerHTML = lg('Commande', esc(CMD.numero))
      + lg('Client', esc(CMD.client))
      + lg('Vérification', complet ? 'colis complet' : (comptes() + ' sur ' + attendus() + ' — INCOMPLET'), !complet)
      + lg('Transporteur', esc(t))
      + lg('Numéro de suivi', val('c-suivi') ? esc(val('c-suivi'))
            : (coché('c-sans') ? 'aucun — assumé' : 'aucun'), !val('c-suivi') && !coché('c-sans'));
  }

  function brancher(){
    document.getElementById('c-bon').onclick = function(){ imprimer('bon', this); };
    document.getElementById('c-colis').onclick = function(){ imprimer('colisage', this); };
    document.getElementById('c-etiq').onclick = etiquette;
    document.getElementById('c-suivi').oninput = function(){ dire(''); };
  }

  function imprimer(genre, b){
    b.disabled = true; dire('Envoi à l’impression…');
    P.appeler('commande:bon', ID, genre).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Envoyé à l’impression.', 'bon');
    });
  }

  function etiquette(){
    var b = document.getElementById('c-etiq');
    b.disabled = true; dire('Demande au transporteur…');
    P.appeler('commande:etiquette', ID, val('c-transp')).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      if (r.suivi) { poser('c-suivi', r.suivi); dire('Étiquette générée — suivi ' + r.suivi, 'bon'); }
      // ⚠ Pas de numero = pas d etiquette, meme si l appel n a pas leve d erreur.
      // Annoncer un succes ici ferait expedier une commande sans etiquette.
      else dire('Aucun numéro reçu : l’étiquette n’a PAS été générée. Voyez l’avis dans la fenêtre principale.', 'err');
    });
  }

  function verrou(){
    return P.appeler('verrou:prendre', 'orders', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 commande réservée'; return; }
      sous.textContent = '⚠ en traitement par ' + (v.parQui || 'quelqu’un d’autre');
      bEnr.disabled = true;
      dire('Cette commande est déjà en traitement ailleurs.', 'err');
    });
  }

  function charger(){
    P.appeler('commande:contexte').then(function(c){
      if (!c || !c.ok) { vide('Préparation indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('commande:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Commande indisponible', expliquer(r)); return; }
        CMD = r;
        document.getElementById('titre').textContent = 'Préparation — ' + r.numero;
        dessiner();
        return verrou();
      });
    });
  }

  function expedier(){
    // ⚠ UN COLIS INCOMPLET NE PART PAS SANS UN SECOND CLIC. La verification ne
    // sert a rien si on peut l ignorer d un geste distrait ; mais l interdire
    // bloquerait les cas legitimes (envoi partiel assume).
    if (!toutVerifie() && window._szForcer !== true) {
      window._szForcer = true;
      dire('Colis INCOMPLET (' + comptes() + ' sur ' + attendus() + '). Recliquez « Expédier » pour assumer un envoi partiel.', 'att');
      return;
    }
    bEnr.disabled = true;
    dire('Expédition…');
    var pret = coché('c-pret');
    P.appeler('commande:prete', ID, pret).then(function(){
      return P.appeler('commande:expedier', ID, val('c-transp'), val('c-suivi'), coché('c-sans'));
    }).then(function(r){
      if (!r || !r.ok) { bEnr.disabled = false; window._szForcer = false; dire(expliquer(r), 'err'); return; }
      dire(r.sansSuivi ? 'Expédiée sans numéro de suivi.' : 'Expédiée — courriel envoyé.', 'bon');
      setTimeout(function(){ P.fermer(); }, 900);
    });
  }

  bEnr.onclick = expedier;
  document.getElementById('btn-annuler').onclick = function(){ P.fermer(); };
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageCommande };
