'use strict';

/*
 * ASSISTANT « PRÉPARATION DE COMMANDE » — NATIF, TROIS ÉTAPES
 * =============================================================================
 * Vérification, étiquette, expédition. (L'étape « Préparation » a été retirée le
 * 2026-08-07 à la demande de l'utilisateur : sa liste d'articles faisait doublon
 * avec celle de la vérification ; ses boutons d'impression y ont migré, et la
 * question du bon de commande se pose toujours à l'ouverture.) Aucune page du
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

const { CSS_SOCLE, CSS_JOUR, JS_SOCLE, ICO } = require('./socle');

const CSS_PROPRE = `
.entete{display:flex;gap:1.1rem;align-items:baseline;flex-wrap:wrap;margin-bottom:.55rem}
.entete .num{font:700 1.15rem/1 Georgia,serif;color:var(--tx-creme)}
.entete .cli{font-size:.9rem}
.entete .adr{font-size:.78rem;color:var(--tx2);flex:1 1 100%}
.art{display:flex;align-items:center;gap:.6rem;padding:.3rem .35rem;border-radius:7px;
  border:1px solid transparent}
.art:hover{background:var(--v035)}
.art.ok{border-color:rgba(74,222,128,.5);background:rgba(74,222,128,.08)}
.art.trop{border-color:rgba(248,113,113,.6);background:rgba(248,113,113,.08)}
.art .pt{flex:0 0 auto;width:20px;height:20px;border-radius:50%;border:1px solid var(--v22);
  display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700}
.art.ok .pt{background:#4ade80;border-color:#4ade80;color:#0e1522}
.art.trop .pt{background:#f87171;border-color:#f87171;color:#0e1522}
.art .d{flex:1 1 auto;min-width:0}
.art .n{font-size:.92rem;font-weight:600;line-height:1.25}
.art .v{font-size:.76rem;color:var(--tx2)}
.art .cpt{flex:0 0 auto;font-variant-numeric:tabular-nums;font-size:.88rem;min-width:3rem;text-align:right}
.art .q{flex:0 0 4.4rem}
.barre{flex:0 0 auto;height:6px;border-radius:6px;background:var(--v09);overflow:hidden;margin:.5rem 0 .2rem}
.barre span{display:block;height:100%;background:#4ade80;width:0;transition:width .18s}
.gros{font:700 1.6rem/1 Georgia,serif;color:var(--tx-creme)}
.duo{display:flex;gap:.7rem;flex-wrap:wrap}
.duo>*{flex:1 1 220px}
.etat{display:flex;align-items:center;gap:.5rem;font-size:.86rem;padding:.4rem 0}
`;

/** Page complète de l'assistant. `id` = commande à préparer. */
function pageCommande(id) {
  const ident = JSON.stringify(String(id || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Préparation — Administration Sandriza</title>
<style>${CSS_SOCLE}${CSS_PROPRE}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.orders}</span><h1 id="titre">Préparation</h1>
  <span class="sous" id="sous"></span></div>
<div class="pas" id="pas"></div>
<div class="corps" id="corps"><div class="sz-squel" role="status" aria-label="Chargement en cours"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <span class="actions">
    <button id="btn-prec">Précédent</button>
    <button id="btn-suiv">Suivant</button>
    <button id="btn-enr" class="prim" disabled>Expédier</button>
  </span></div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE}
  MOTIFS.suivi_requis = 'Entrez un numéro de suivi, ou cochez « expédier sans numéro ».';
  // Les motifs de l etiquette et de l impression — le dictionnaire de la
  // fenetre Expedition, repris : les codes AA de Postes Canada et les motifs
  // du transporteur n arrivaient jamais jusqu ici (releve du 2026-08-08).
  MOTIFS.poids_invalide = 'Le poids du colis doit être supérieur à zéro.';
  MOTIFS.deja_etiquetee = 'Une étiquette existe déjà pour cette commande — rien n’a été commandé.';
  MOTIFS.secrets = 'Identifiants du transporteur indisponibles. Reconnectez-vous, puis réessayez.';
  MOTIFS.config = 'Configuration du transporteur incomplète.';
  MOTIFS.origine = 'Adresse d’expédition incomplète — Configuration puis Transporteurs.';
  MOTIFS.destination = 'Adresse du destinataire incomplète dans la commande.';
  MOTIFS.refus_transporteur = 'Le transporteur a refusé la demande.';
  MOTIFS.etiquette_absente = 'Aucune étiquette enregistrée pour cette commande.';
  MOTIFS.impression = 'L’impression a échoué.';
  MOTIFS.reseau = 'Le réseau a échoué — rien n’a été commandé.';
  // Le DETAIL du transporteur est conserve tel quel (les codes AA de Postes
  // Canada designent toujours les identifiants) — l expliquer du socle le
  // jetait, et l on cherchait la panne du mauvais cote.
  function expliquerD(r){ return (r && r.detail) ? String(r.detail) : expliquer(r); }

  var ID   = ${ident};
  var bEnr = document.getElementById('btn-enr');
  var sous = document.getElementById('sous');
  var CTX = null, CMD = null, COMPTES = {};
  var PDF = null;        // etiquette en base64, gardee pour imprimer sans repasser par le nuage
  var LECTURE = false;   // verrou refuse : cette fenetre ne fait que regarder

  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }
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
      + (CMD.prioritaire ? '<span style="font-size:.76rem;background:#7c2d12;color:#fdba74;'
          + 'border-radius:99px;padding:.12rem .55rem;font-weight:700"><span class="ic" aria-hidden="true">⚡</span> Prioritaire</span>' : '')
      + '<span class="cli">' + esc(CMD.client) + '</span>'
      + '<span class="adr">' + esc(CMD.adresse) + '</span>'
      + (CMD.notes ? '<span class="adr" style="color:var(--tx-or2)"><span class="ic">📝</span> ' + esc(CMD.notes) + '</span>' : '')
      + '</div>';

    /* 1 — Vérification.
       ⚠ L ETAPE << PREPARATION >> A ETE RETIREE (demande le 2026-08-07 : << elle
       ne sert a rien >>). Sa liste d articles faisait DOUBLON avec celle-ci, qui
       montre les memes lignes AVEC les compteurs — strictement plus. Apres la
       question du bon de commande, on arrive donc directement ici.
       ⚠ RIEN N EST PERDU : l en-tete (numero, client, adresse) et les DEUX
       boutons d impression (Bon de commande, Bordereau) ont migre dans cette
       etape — ils n ont pas disparu avec elle. */
    h.push('<div class="etape"><div class="carte plein" id="c-zone2">' + enTete
      + '<h2>Vérification du colis</h2>'
      + '<div class="etat"><span class="gros" id="c-prog">0</span>'
      + '<span style="color:var(--tx2)">sur ' + attendus() + ' unités confirmées</span></div>'
      + '<div class="barre"><span id="c-barre"></span></div>'
      /* ⚠ LE CHAMP DE SCAN, ET IL EST EN PREMIER. On verifie un colis un lecteur
         a la main, sans regarder l ecran : le champ doit avoir le focus, avaler
         le retour du lecteur, se vider et le reprendre aussitot. Un champ qu il
         faut recliquer entre deux articles rend le lecteur inutile. */
      + '<div class="rech" style="margin-bottom:.35rem">'
      + '<input id="c-scan" placeholder="Scannez le code-barres de l’article…" autocomplete="off">'
      + '</div>'
      + '<div id="c-scan-msg" style="min-height:1.2em;font-size:.8rem;color:var(--tx2);margin-bottom:.4rem"></div>'
      + '<div class="rech"><input placeholder="Filtrer…"><span class="cpt" id="c-cpt2"></span></div>'
      + '<div class="liste"></div><div class="pagi"></div>'
      + '<div style="margin-top:.6rem;display:flex;gap:.45rem;flex-wrap:wrap">'
      + '<button type="button" id="c-bon"><span class="ic">🖨</span> Bon de commande</button>'
      + '<button type="button" id="c-colis"><span class="ic">🧾</span> Bordereau</button>'
      + '</div></div></div>');

    /* 2 — Étiquette. ⚠ ELLE SE FABRIQUE ICI, DANS L ASSISTANT (2026-08-07).
       Une premiere correction l avait renvoyee vers la fenetre Expedition parce
       que l ancien chemin (Admin.printLabel) LIT LE FORMULAIRE DU SITE et
       commandait donc une etiquette FACTUREE au service par defaut et a 0,5 kg.
       Deplacer n etait pas reparer : on prepare un colis d un seul tenant, et
       sortir de l assistant pour l etiqueter casse le geste.
       On garde donc l etiquette ICI, et l on y ajoute ce qui manquait — le
       SERVICE et le POIDS, qui fixent le prix — en passant par expedition:etiquette,
       la seule operation qui les recoit explicitement. */
    h.push('<div class="etape"><div class="carte"><h2>Étiquette d’expédition</h2><div class="duo">'
      /* ⚠ UN TRANSPORTEUR NON CONFIGURE SE DIT ICI, PAS AU MOMENT DE PAYER.
         Le contexte rend maintenant « pret » (une seule source, la meme que les
         services) : on le marque dans la liste. Avant, un transporteur sans
         identifiants s offrait comme les autres, on preparait le colis, et l on
         ne l apprenait qu a l achat de l etiquette. */
      + '<div class="ch"><label for="c-transp">Transporteur</label><select id="c-transp">'
      + CTX.transporteurs.map(function(t){
          return '<option value="' + esc(t.cle) + '">' + esc(t.nom)
            + (t.pret === false ? ' — non configuré' : '') + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="c-service">Service</label><select id="c-service"></select></div>'
      + '</div><div class="duo" style="margin-top:.5rem">'
      + '<div class="ch"><label for="c-poids">Poids du colis (kg)</label>'
      + '<input id="c-poids" type="number" min="0.001" step="0.001" value="0.5"></div>'
      + '<div class="ch"><label>&nbsp;</label><button type="button" id="c-etiq">Générer l’étiquette</button></div>'
      + '<div class="ch"><label>&nbsp;</label><button type="button" id="c-etiq-imp" style="display:none"><span class="ic">🖨</span> Imprimer l’étiquette</button></div>'
      + '</div>'
      + '<div class="aide" id="c-poids-note" style="margin-top:.4rem"></div>'
      + '</div>'
      + '<div class="carte plein"><h2>Numéro de suivi</h2><div class="duo">'
      + '<div class="ch"><label for="c-suivi">Numéro</label><input id="c-suivi" placeholder="rempli par l’étiquette"></div>'
      + '</div>'
      + '<label style="display:flex;align-items:center;gap:.45rem;font-size:.85rem;margin-top:.7rem;cursor:pointer">'
      + '<input type="checkbox" id="c-sans"> Expédier sans numéro de suivi</label>'
      + '<div class="aide" style="margin-top:.4rem">Remise en main propre, cueillette, transporteur local. '
      + 'Le client reçoit alors un courriel <strong>sans lien de suivi</strong> — c’est préférable à un numéro '
      + 'inventé qu’elle chercherait en vain.</div></div></div>');

    // 3 — Expédition
    h.push('<div class="etape"><div class="carte plein"><h2>Récapitulatif</h2>'
      + '<div id="c-recap"></div>'
      + '<label style="display:flex;align-items:center;gap:.45rem;font-size:.86rem;margin-top:.8rem;cursor:pointer">'
      + '<input type="checkbox" id="c-pret"> Marquer « prête à l’expédition »</label>'
      + '<div class="aide" style="margin-top:.5rem">« Expédier » écrit le statut, envoie le courriel de suivi '
      + 'au client et referme cette fenêtre.</div></div></div>');

    document.getElementById('corps').innerHTML = h.join('');
    document.getElementById('c-pret').checked = !!CMD.dejaPret;
    /* ⚠ LA CASE S ENREGISTRE AU CLIC, PAS A L EXPEDITION. Elle n etait poussee
       qu au moment d expedier : cocher << prete >> puis fermer la fenetre perdait
       l information, alors que c est justement l etat qu on pose pour SORTIR du
       dossier et y revenir plus tard. L ecran du site l enregistre au clic
       (toggleReadyToShip), on fait pareil. */
    document.getElementById('c-pret').onchange = function(){
      if (LECTURE) { this.checked = !this.checked; dire('Commande en traitement ailleurs — lecture seule.', 'err'); return; }
      var v = this.checked;
      P.appeler('commande:prete', ID, v).then(function(r){
        if (r && r.ok) { CMD.dejaPret = v; dire(v ? 'Marquée prête à l’expédition.' : 'Marque « prête » retirée.', 'bon'); }
        else dire(expliquer(r), 'err');
      });
    };
    poser('c-suivi', CMD.suivi || '');
    if (CMD.transporteur) poser('c-transp', CMD.transporteur);

    listes();
    brancher();

    Assist.poser([
      /* ⚠ CHAQUE ETAPE PORTE SA REGLE (fait/refus, voir le socle), et elle sert
         aux DEUX endroits : le vert du fil ET le refus d avancer — Suivant comme
         un clic direct dans le fil. Signale le 2026-08-07 : << Suivant ne doit
         pas etre disponible tant que la verification n est pas complete >>. */
      { t: 'Vérification', obl: [],
        fait: toutVerifie,
        refus: function(){ return 'Vérifiez le colis d’abord — ' + comptes() + ' sur ' + attendus() + ' unités confirmées.'; } },
      /* ⚠ << suivi rempli OU envoi sans numero assume >>. L ancienne forme
         (obl: c-suivi) rendait l etape Expedition INATTEIGNABLE pour une remise
         en main propre : la case cochee ne remplit aucun champ, et le fil comme
         Suivant refusaient — alors que le bouton Expedier, lui, acceptait. Deux
         regles pour le meme etat finissent toujours par se contredire. */
      { t: 'Étiquette',    obl: [],
        fait: function(){ return !!String(val('c-suivi') || '').trim() || coché('c-sans'); },
        refus: 'Générez l’étiquette, ou cochez « Expédier sans numéro de suivi ».' },
      { t: 'Expédition',   obl: [] }
    ], function(i){
      if (i === 0 && PAGI2) { PAGI2.dessiner(); majProgres(); }
      if (i === 2) recap();
    });

    majExpedier();
    if (!CTX.peutExpedier) dire('Votre rôle ne permet pas d’expédier.', 'att');
  }

  /* ⚠ LE STATUT SUIT LES GESTES, PLUS LES INDEX D ETAPES (revu au retrait de
     l etape Preparation — piloter par index aurait fait passer une commande en
     << Verification >> a la simple OUVERTURE, puisque l etape 0 EST la
     verification desormais). << En preparation >> se pose a l ouverture de
     l assistant ; << Verification >> a la PREMIERE unite confirmee (scan ou
     saisie) — c est le geste qui prouve qu on verifie, pas un ecran affiche.
     L expedition, elle, passe par son propre chemin (courriel, stock).
     ⚠ Le site REFUSE de reculer un statut (voir commande:statut) : rouvrir une
     commande deja expediee ne la remet pas en preparation. */
  function avancerStatut(voulu){
    if (LECTURE) return;
    if (!voulu || !CTX || !CTX.peutExpedier) return;
    P.appeler('commande:statut', ID, voulu).then(function(r){
      if (r && r.ok && r.statut && !r.inchange) { CMD.statut = r.statut; }
    }).catch(function(){ /* un statut qui ne monte pas ne doit pas bloquer la preparation */ });
  }
  // La premiere unite confirmee fait passer en << Verification >> — une seule
  // fois : le garde local evite un aller-retour de pont a chaque frappe.
  function statutVerification(){
    if (CMD && (CMD.statut === 'pending' || CMD.statut === 'confirmed' || CMD.statut === 'preparing')) {
      avancerStatut('verification');
    }
  }

  var PAGI2 = null;
  function listes(){
    // L unique liste : les articles AVEC leur compteur. Celle de l ancienne
    // etape Preparation (les memes lignes, sans compteur) est partie avec elle.
    PAGI2 = new Pagi(document.getElementById('c-zone2'), {
      ligne: function(a){
        var v = COMPTES[a.cle] || 0;
        var cl = v === a.quantite ? ' ok' : (v > a.quantite ? ' trop' : '');
        return '<div class="art' + cl + '" data-cle="' + esc(a.cle) + '">'
          + '<span class="pt">' + (v === a.quantite ? '✓' : (v > a.quantite ? '!' : '')) + '</span>'
          + '<div class="d"><div class="n">' + esc(a.nom) + '</div>'
          + '<div class="v">' + esc([[a.taille, a.couleur].filter(Boolean).join(' · '), a.sku]
              .filter(Boolean).join(' · ')) + '</div></div>'
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
      statutVerification();
      majExpedier();
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
        + '<div class="n"' + (alerte ? ' style="color:var(--tx-att)"' : '') + '>' + (v || '—') + '</div></div></div>';
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
    var sc = document.getElementById('c-scan');
    if (sc) {
      sc.onkeydown = function(ev){
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        var code = this.value;
        this.value = '';
        scanner(code);
        try { this.focus(); } catch (e) {}
      };
    }
    document.getElementById('c-bon').onclick = function(){ imprimer('bon', this); };
    document.getElementById('c-colis').onclick = function(){ imprimer('colisage', this); };
    document.getElementById('c-etiq').onclick = etiquette;
    var sn = document.getElementById('c-sans');
    if (sn) sn.onchange = majExpedier;
    /* ⚠ UN SEUL oninput. Il y en avait DEUX poses l un apres l autre : le
       second (dire('')) ECRASAIT le premier (majExpedier) — coller un numero
       de suivi a la main ne rearmait pas Expedier. */
    var su = document.getElementById('c-suivi');
    if (su) su.oninput = function(){ dire(''); majExpedier(); majBoutonImpression(); };
    var tr = document.getElementById('c-transp');
    if (tr) tr.onchange = majServices;
    var ei = document.getElementById('c-etiq-imp');
    if (ei) ei.onclick = imprimerEtiquette;
    majBoutonImpression();
  }

  /* ⚠⚠ ON DEMANDE D IMPRIMER LE BON DE COMMANDE, COMME LE FAIT L ECRAN DU SITE.
     Demande par l utilisateur le 2026-08-07 : la fenetre posait deux boutons
     d impression et n en proposait aucun, alors que le site OUVRE le travail par
     cette question (_confirmPrintPickingSlip). Preparer une commande commence par
     sortir le bon : ne pas le proposer, c est obliger a y penser chaque fois, et
     le bon finit par etre oublie.
     ⚠ LES MEMES MOTS QUE LE SITE, y compris la nuance de la RE-ENTREE : revenir
     dans une commande deja en preparation ne se dit pas comme la commencer, et
     l ecran du site distingue deja les deux. Reinventer la phrase ici, c est
     deux formulations pour un meme geste.
     ⚠ ET ELLE NE BLOQUE RIEN : << Non, continuer >> ferme et laisse travailler.
     Les deux boutons d impression restent dans l etape, pour reimprimer plus tard. */
  function demanderBon(deja){
    var v = document.createElement('div');
    /* ⚠ Le voile porte un identifiant : szRevenir doit pouvoir le REFERMER quand
       le bouton du site ramene une fenetre deja ouverte — le laisser trainer,
       c est reposer la question a chaque focus, le defaut signale. */
    v.id = 'bc-voile';
    v.setAttribute('style', 'position:fixed;inset:0;background:rgba(8,12,20,.82);'
      + 'display:flex;align-items:center;justify-content:center;padding:1.5rem;z-index:60');
    v.innerHTML = '<div style="background:var(--f-carte);border:1px solid var(--v12);'
      + 'border-radius:13px;padding:1.15rem 1.3rem;max-width:34rem;width:100%">'
      + '<h3 style="margin:0 0 .6rem;font:700 1.05rem/1.25 Georgia,serif"><span class="ic">🚀</span> Préparation de la commande '
      + esc(CMD.numero) + '</h3>'
      + '<p style="margin:.35rem 0;font-size:.9rem">' + (deja
          ? 'Cette commande est déjà en préparation.'
          : 'Vous vous apprêtez à commencer la préparation de cette commande.') + '</p>'
      + '<p style="margin:.35rem 0;font-size:.9rem">' + (deja
          ? 'Désirez-vous (ré)imprimer un <strong>bon de commande</strong> avant de poursuivre ?'
          : 'Pour débuter, désirez-vous imprimer un <strong>bon de commande</strong> ?') + '</p>'
      + '<div style="display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem;flex-wrap:wrap">'
      + '<button type="button" id="bc-non">Non, continuer sans imprimer</button>'
      + '<button type="button" class="prim" id="bc-oui"><span class="ic">🖨</span> Oui, imprimer le bon</button>'
      + '</div></div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    document.getElementById('bc-non').onclick = fermer;
    document.getElementById('bc-oui').onclick = function(){
      var b = this;
      fermer();
      // On reutilise le meme chemin que le bouton de l etape : une seule facon
      // d imprimer un bon, donc un seul endroit ou la corriger.
      var vrai = document.getElementById('c-bon');
      imprimer('bon', vrai || b);
    };
  }

  /* ══ LE SCAN ═══════════════════════════════════════════════════════════════
     ⚠ LES MEMES REGLES QUE L ECRAN DU SITE, reprises une par une :
       - code inconnu  -> refus, son grave, message rouge ;
       - ligne DEJA complete -> refus, son grave, message ambre (sans quoi on
         scanne deux fois le meme article et le compte ment) ;
       - sinon +1, son aigu, message vert avec le compte et le mot
         << ligne complete >> quand elle l est.
     ⚠ LA CORRESPONDANCE DU CODE SE FAIT DANS LE SITE (commande:scan) : le
     code-barres porte la forme COMPACTE du SKU, pas la forme affichee. */
  function bip(ok){
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      var a = new C(), o = a.createOscillator(), g = a.createGain();
      o.frequency.value = ok ? 1180 : 320;
      g.gain.value = 0.06;
      o.connect(g); g.connect(a.destination);
      o.start();
      setTimeout(function(){ try { o.stop(); a.close(); } catch (e) {} }, ok ? 70 : 190);
    } catch (e) { /* un poste sans son ne doit pas empecher de verifier */ }
  }
  function scanMsg(t, couleur){
    var el = document.getElementById('c-scan-msg');
    if (el) { el.textContent = t || ''; el.style.color = couleur || '#8fa1b8'; }
  }
  function scanner(code){
    if (!String(code || '').trim()) return;
    if (LECTURE) { bip(false); scanMsg('Commande en traitement ailleurs — lecture seule.', '#f87171'); return; }
    P.appeler('commande:scan', ID, code).then(function(r){
      if (!r || !r.ok) {
        bip(false);
        scanMsg(r && r.motif === 'code_inconnu'
          ? '⚠ Code inconnu : ' + (r.code || code)
          : expliquer(r), '#f87171');
        return;
      }
      var att = 0;
      CMD.articles.forEach(function(a){ if (a.cle === r.cle) att = a.quantite; });
      var v = COMPTES[r.cle] || 0;
      if (v >= att) {
        bip(false);
        scanMsg('⚠ Déjà complet : ' + r.sku + ' (' + att + '/' + att + ')', '#fbbf24');
        return;
      }
      COMPTES[r.cle] = v + 1;
      statutVerification();
      bip(true);
      scanMsg('✓ ' + r.sku + ' — ' + (v + 1) + '/' + att
        + ((v + 1) === att ? ' (ligne complète)' : ''), '#4ade80');
      if (PAGI2) { PAGI2.dessiner(); }
      majProgres();
      majExpedier();
      // Le fil se rafraichit sur les evenements input/change du corps — or un
      // scan valide au lecteur ne produit que le keydown Entree : sans cet appel,
      // la derniere unite confirmee laissait l etape << incomplete >> a l ecran.
      Assist.fil();
    });
  }

  function imprimer(genre, b){
    if (LECTURE) { dire('Commande en traitement ailleurs — lecture seule.', 'err'); return; }
    b.disabled = true; dire('Envoi à l’impression…');
    P.appeler('commande:bon', ID, genre).then(function(r){
      b.disabled = false;
      // ⚠ Le pont rend maintenant un VERDICT (releve du 2026-08-08) : avant,
      // << Envoye a l impression >> s affichait meme quand rien ne sortait.
      if (!r || !r.ok) { dire(expliquerD(r), 'err'); return; }
      dire('Envoyé à l’impression.', 'bon');
    });
  }

  /* ⚠ SERVICES ET POIDS VIENNENT DU SITE (expedition:contexte / expedition:lire) :
     ce sont les memes listes et le meme calcul que la fenetre Expedition, donc une
     seule source. Le poids est le poids NET (articles moins remboursements), et
     une estimation se DIT — c est lui qui fixe le prix. */
  var EXP = null;   // { transporteurs: [{cle,nom,pret,services}] }
  function chargerExpedition(){
    return P.appeler('expedition:contexte').then(function(c){
      if (c && c.ok) EXP = c;
      return P.appeler('expedition:lire', ID);
    }).then(function(r){
      if (r && r.ok && r.poids) {
        var p = document.getElementById('c-poids');
        if (p && r.poids.calcule > 0) p.value = r.poids.calcule;
        var n = document.getElementById('c-poids-note');
        if (n) {
          n.textContent = r.poids.estime
            ? '⚠ Certains articles n’ont pas de poids configuré — estimation à 300 g par article. Vérifiez : le poids fixe le prix.'
            : '✅ Poids calculé depuis les articles de la commande.';
          n.style.color = r.poids.estime ? '#f0c987' : '#86e5a8';
        }
      }
      majServices();
    }).catch(function(){ majServices(); });
  }

  function majServices(){
    var sel = document.getElementById('c-service');
    var tr = val('c-transp');
    if (!sel) return;
    var liste = [];
    ((EXP && EXP.transporteurs) || []).forEach(function(t){ if (t.cle === tr) liste = t.services || []; });
    /* ⚠ AVOIR DES SERVICES N EST PAS ETRE PRET. CARRIERS_PONT liste les services
       de Postes Canada et de FedEx en dur, mais « pret » dit s il y a des
       identifiants. Sans cette seconde condition, le bouton restait actif pour
       un transporteur sans identifiants et l on ne l apprenait qu au moment de
       payer — apres avoir prepare le colis. */
    var pret = true;
    (CTX.transporteurs || []).forEach(function(t){ if (t.cle === tr && t.pret === false) pret = false; });
    var utilisable = liste.length > 0 && pret;
    sel.innerHTML = liste.length
      ? liste.map(function(x){ return '<option value="' + esc(x.cle) + '">' + esc(x.libelle) + '</option>'; }).join('')
      : '<option value="">— transporteur non configuré —</option>';
    sel.disabled = !utilisable;
    var b = document.getElementById('c-etiq');
    if (b) {
      b.disabled = !utilisable;
      b.title = utilisable ? ''
        : 'Ce transporteur n’a pas d’identifiants : Configuration → Transporteurs.';
    }
    var n = document.getElementById('c-poids-note');
    if (!pret && n) {
      n.textContent = '⚠ Ce transporteur n’a pas d’identifiants — aucune étiquette ne peut être achetée. Configuration → Transporteurs.';
      n.style.color = '#f0c987';
    }
  }

  /* ⚠ ON PASSE PAR expedition:etiquette, qui RECOIT le service et le poids.
     L ancien chemin (commande:etiquette -> Admin.printLabel) les lisait dans le
     formulaire du SITE : absents ici, il commandait une etiquette FACTUREE au
     service par defaut et a 0,5 kg. L operation reste en place pour les coquilles
     anterieures, mais cette fenetre ne l emprunte plus. */
  function etiquette(){
    if (LECTURE) { dire('Commande en traitement ailleurs — lecture seule.', 'err'); return; }
    var poids = parseFloat(val('c-poids'));
    if (!(poids > 0)) { dire('Le poids du colis doit être supérieur à zéro.', 'err'); return; }
    /* ⚠ UNE ETIQUETTE EXISTE DEJA ? La question se pose ICI, dans la fenetre —
       plus dans des modales du site invisibles depuis l entrepot (releve du
       2026-08-08 : double achat possible, modale du site detournee, appel
       natif qui expirait a 60 s). L aveu part au pont (forcer) : sans lui, le
       garde du site refuse. */
    if (CMD.aUneEtiquette || String(val('c-suivi') || '').trim()) {
      voileEtiq('⚠ Une étiquette existe déjà',
        '<p style="margin:.35rem 0;font-size:.9rem">Une étiquette a déjà été facturée pour cette commande'
        + (CMD.suivi ? ' (suivi <strong>' + esc(CMD.suivi) + '</strong>)' : '') + '.</p>'
        + '<p style="margin:.35rem 0;font-size:.9rem">En commander une seconde sera <strong>facturé une '
        + 'seconde fois</strong>. Pour réimprimer celle qui existe, « <span class="ic">🖨</span> Imprimer l’étiquette » suffit.</p>',
        'Commander quand même', function(){ acheterEtiquette(poids, true); });
      return;
    }
    acheterEtiquette(poids, false);
  }
  function acheterEtiquette(poids, forcer){
    var b = document.getElementById('c-etiq');
    b.disabled = true; dire('Demande au transporteur…', 'att');
    P.appeler('expedition:etiquette', ID, val('c-transp'), val('c-service'), poids, forcer).then(function(r){
      b.disabled = false;
      if (!r || !r.ok) { dire(expliquerD(r), 'err'); return; }
      // ⚠ Pas de numero = pas d etiquette, meme sans exception levee. Annoncer un
      // succes ici ferait expedier une commande sans etiquette.
      if (!r.suivi) { dire('Aucun numéro reçu : l’étiquette n’a PAS été générée.', 'err'); return; }
      poser('c-suivi', r.suivi);
      /* ⚠ LE PDF EST GARDE ET S IMPRIME — il etait JETE (releve du 2026-08-08) :
         la fenetre achetait l etiquette et ne l imprimait jamais, ni le
         bordereau qui la suit. Meme patron que la fenetre Expedition. */
      PDF = r.pdf || null;
      CMD.aUneEtiquette = true;
      CMD.suivi = r.suivi;
      majExpedier();
      majBoutonImpression();
      voileEtiq('✅ Étiquette créée',
        '<p style="margin:.35rem 0;font-size:.9rem">Suivi : <strong>' + esc(r.suivi) + '</strong></p>'
        + '<p style="margin:.35rem 0;font-size:.9rem">Imprimer l’étiquette et le bordereau maintenant ?</p>',
        '🖨 Imprimer maintenant', imprimerEtiquette);
    }).catch(function(){ b.disabled = false; dire('L’opération a échoué.', 'err'); });
  }
  // Un voile a deux boutons, pour la question du rachat et la proposition
  // d impression — meme peau que la question du bon de commande.
  function voileEtiq(titre, corps, libelle, surOui){
    var v = document.createElement('div');
    v.setAttribute('style', 'position:fixed;inset:0;background:rgba(8,12,20,.82);'
      + 'display:flex;align-items:center;justify-content:center;padding:1.5rem;z-index:60');
    v.innerHTML = '<div style="background:var(--f-carte);border:1px solid var(--v12);'
      + 'border-radius:13px;padding:1.15rem 1.3rem;max-width:30rem;width:100%">'
      + '<h3 style="margin:0 0 .6rem;font:700 1.05rem/1.25 Georgia,serif">' + titre + '</h3>'
      + corps
      + '<div style="display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem;flex-wrap:wrap">'
      + '<button type="button" id="ve-non">Annuler</button>'
      + '<button type="button" class="prim" id="ve-oui">' + libelle + '</button></div></div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    document.getElementById('ve-non').onclick = fermer;
    document.getElementById('ve-oui').onclick = function(){ fermer(); surOui(); };
  }
  function imprimerEtiquette(){
    if (LECTURE) { dire('Commande en traitement ailleurs — lecture seule.', 'err'); return; }
    dire('Impression de l’étiquette et du bordereau…');
    P.appeler('expedition:imprimer', ID, PDF).then(function(r){
      dire(r && r.ok ? 'Étiquette et bordereau envoyés à l’impression.' : expliquerD(r),
        r && r.ok ? 'bon' : 'err');
    });
  }
  // Le bouton de reimpression n apparait que s il y a une etiquette a imprimer.
  function majBoutonImpression(){
    var b = document.getElementById('c-etiq-imp');
    if (!b) return;
    b.style.display = (CMD && CMD.aUneEtiquette) || String(val('c-suivi') || '').trim() ? '' : 'none';
  }

  /* ⚠ LE VERROU SE REND A LA FERMETURE (2026-08-07). Il etait pris a l ouverture
     mais JAMAIS rendu : fermer l assistant laissait la commande << En
     traitement >> pour tout le monde jusqu a la peremption du verrou. Or c est
     precisement ce verrou qui pilote le bouton des listes — demande de
     l utilisateur : << si on sort de l assistant, tu ramenes le bouton >>. */
  var VERROU_PRIS = false;
  function verrou(){
    return P.appeler('verrou:prendre', 'orders', ID).then(function(v){
      if (!v || !v.ok) { sous.textContent = ''; return; }
      if (v.obtenu) { VERROU_PRIS = true; sous.textContent = v.horsLigne ? '🔓 hors ligne' : '🔒 Section verrouillée en modification par : ' + (v.par || 'vous'); return; }
      sous.textContent = '⚠ en traitement par ' + (v.parQui || 'quelqu’un d’autre');
      /* ⚠ EN LECTURE POUR DE BON (releve du 2026-08-08) : on ne desarmait que
         le bouton Expedier, que majExpedier REARMAIT au premier input — et le
         scan, le statut, l impression et meme l ACHAT D UNE ETIQUETTE
         restaient permis. Deux personnes sur le meme colis, c est deux
         etiquettes facturees et deux courriels au client. */
      LECTURE = true;
      bEnr.disabled = true;
      dire('Cette commande est déjà en traitement ailleurs — lecture seule.', 'err');
    });
  }
  function rendreVerrou(){
    if (!VERROU_PRIS) return;
    VERROU_PRIS = false;
    try { P.appeler('verrou:rendre'); } catch (e) {}
  }
  // Toutes les sorties passent par la : le X de la fenetre, Echap, Fermer, et la
  // fermeture apres expedition.
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  /* ⚠⚠ L ETAPE D ARRIVEE SUIT LE STATUT — LA MEME REGLE QUE L ECRAN DU SITE.
     _startFulfillmentFlow (admin.js) route deja ainsi : en verification, ecran
     de verification SANS question ; en preparation sans suivi, question du bon en
     re-entree ; sinon, debut du parcours. Cette fenetre ouvrait TOUJOURS a
     l etape 1 avec la question — signale le 2026-08-07 : << je clique sur
     Verifier et je n arrive pas a la verification >>. Reinventer un routage ici
     plutot que reprendre celui du site, c est deux regles pour un meme geste. */
  function accueillir(statut){
    // Plus de saut d etape : l etape 0 EST la verification, pour tout statut.
    // Ouvrir l assistant, c est commencer la preparation : le statut le dit
    // tout de suite, et la liste des commandes derriere le voit.
    avancerStatut('preparing');
    // La question du bon : au DEBUT du parcours, ou en re-entree d une
    // preparation sans etiquette — jamais quand on vient verifier ou expedier.
    if (statut === 'verification') return;
    if (statut === 'preparing' && String(val('c-suivi') || '').trim()) return;
    demanderBon(statut === 'preparing');
  }

  /* ⚠ APPELE PAR LA COQUILLE quand le bouton du site rouvre une fenetre DEJA
     ouverte. ouvrirNative la ramene au premier plan SANS RIEN CHANGER : on
     restait plante sur l ecran d avant, question du bon comprise — d ou
     l impression que << l assistant se recharge et repose toujours la meme
     question >>. On relit la commande (le statut a pu bouger entre-temps) et on
     se place a l etape que ce statut commande. */
  window.szRevenir = function(){
    var v = document.getElementById('bc-voile');
    if (v && v.parentNode) v.parentNode.removeChild(v);
    P.appeler('commande:lire', ID).then(function(r){
      if (!r || !r.ok || !CMD) return;
      CMD.statut = r.statut;
      // Le suivi peut etre arrive par la fenetre Expedition pendant qu on etait
      // ailleurs : on le reprend, sans ecraser une saisie en cours.
      if (r.suivi && !String(val('c-suivi') || '').trim()) poser('c-suivi', r.suivi);
      Assist.aller(0);
      majExpedier();
    });
  };

  function charger(){
    P.appeler('commande:contexte').then(function(c){
      if (!c || !c.ok) { vide('Préparation indisponible', expliquer(c)); return; }
      CTX = c;
      return P.appeler('commande:lire', ID).then(function(r){
        if (!r || !r.ok) { vide('Commande indisponible', expliquer(r)); return; }
        CMD = r;
        /* ⚠ Le statut D OUVERTURE est capture ICI : accueillir() passe la
           commande a << preparing >> des l ouverture, et lire CMD.statut apres
           coup aurait fait dire << deja en preparation >> a une commande qu on
           vient tout juste de commencer. */
        var statutOuverture = r.statut;
        document.getElementById('titre').textContent = 'Préparation — ' + r.numero;
        dessiner();
        return verrou().then(function(){ chargerExpedition(); accueillir(statutOuverture); });
      });
    });
  }

  /* ⚠⚠ EXPEDIER RESTE DESARME TANT QUE LES DEUX CONDITIONS NE SONT PAS REMPLIES
     — la verification COMPLETE et l etiquette GENEREE. C etait le comportement
     d avant, et il a ete perdu en reecrivant : le bouton etait actif des
     l ouverture, sur un colis dont rien n avait ete verifie (signale le
     2026-08-07, capture a l appui).
     Ce n est pas du zele : expedier, c est changer le statut, decompter le stock
     et ENVOYER UN COURRIEL au client avec un lien de suivi. Fait avant d avoir
     verifie le colis, on annonce un envoi qu on n a pas prepare ; fait sans
     etiquette, on annonce un suivi qui n existe pas.
     ⚠ L ENVOI SANS NUMERO RESTE POSSIBLE — remise en main propre, cueillette,
     transporteur local — mais il faut cocher la case, donc l assumer. Sans cette
     porte, on aurait ferme un cas legitime en croyant bien faire.
     ⚠ ET LE BOUTON DIT POURQUOI il est desarme : un bouton gris sans explication
     se lit comme une panne, et l on cherche ailleurs. */
  function majExpedier(){
    if (!bEnr) return;
    var sansNum = coché('c-sans');
    var aSuivi = !!String(val('c-suivi') || '').trim();
    var verifOk = toutVerifie();
    var etiqOk = aSuivi || sansNum;
    var pret = !LECTURE && !!(CTX && CTX.peutExpedier) && verifOk && etiqOk;
    bEnr.disabled = !pret;
    var pourquoi = '';
    if (LECTURE) pourquoi = 'Commande en traitement ailleurs — lecture seule.';
    else if (!CTX || !CTX.peutExpedier) pourquoi = 'Votre rôle ne permet pas d’expédier.';
    else if (!verifOk) pourquoi = 'Vérifiez le colis d’abord — ' + comptes() + ' sur ' + attendus() + ' unités confirmées.';
    else if (!etiqOk) pourquoi = 'Générez l’étiquette (étape 2), ou cochez « Expédier sans numéro de suivi ».';
    bEnr.title = pourquoi || 'Marquer la commande expédiée et prévenir le client';
    return pourquoi;
  }

  function expedier(){
    // ⚠ UN COLIS INCOMPLET NE PART PAS SANS UN SECOND CLIC. La verification ne
    // sert a rien si on peut l ignorer d un geste distrait ; mais l interdire
    // bloquerait les cas legitimes (envoi partiel assume).
    var refus = majExpedier();
    if (refus) { dire(refus, 'att'); return; }
    bEnr.disabled = true;
    dire('Expédition…');
    var pret = coché('c-pret');
    P.appeler('commande:prete', ID, pret).then(function(){
      return P.appeler('commande:expedier', ID, val('c-transp'), val('c-suivi'), coché('c-sans'));
    }).then(function(r){
      if (!r || !r.ok) { majExpedier(); dire(expliquer(r), "err"); return; }
      dire(r.sansSuivi ? 'Expédiée sans numéro de suivi.' : 'Expédiée — courriel envoyé.', 'bon');
      setTimeout(function(){ P.fermer(); }, 900);
    });
  }

  bEnr.onclick = expedier;
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });
  charger();
})();
</script></body></html>`;
}

module.exports = { pageCommande };
