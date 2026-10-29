'use strict';

/*
 * FENÊTRE « DÉPENSES D'ENTREPRISE » — NATIVE (2.5.0)
 * =============================================================================
 * Premier écran du palier 5. La saisie des dépenses déductibles : liste filtrée
 * par année, mois et catégorie fiscale, tuiles de période, fiche de détail avec
 * son reçu, formulaire de saisie DANS la fenêtre — et la lecture automatique
 * d'une facture par glisser-déposer.
 *
 * ⚠ TOUT CE QUI COÛTE RESTE AU SITE. La fenêtre lit un fichier et affiche des
 * champs ; la compression du reçu, son dépôt dans le stockage, l'écriture entrée
 * par entrée et surtout la LECTURE de la facture (clé du service d'IA, pdf.js,
 * canevas, taux de change) vivent dans expenses.js. La clé ne voyage jamais
 * jusqu'ici : ce serait la poser dans un document local.
 *
 * ⚠ RIEN N'EST ENREGISTRÉ AUTOMATIQUEMENT après une lecture de facture. Les
 * champs sont pré-remplis, la personne vérifie, puis confirme. C'est la règle de
 * l'écran web, conservée mot pour mot — une dépense inventée par un modèle et
 * enregistrée toute seule finirait dans une déclaration de revenus.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, JS_TUILES, CSS_JOUR, ICO, TETE, LIEU, SEP_DEC } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('depenses');
const LANGUE = require('../langue');

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
/* LA REFONTE DE LA COMPTABILITE (2026-10-16) : la grammaire .cx du socle (CSS_COMPTA). La tete porte le
   resume, l annee, la zone de depot et le geste principal (#d-actions, redessine avec la vue) ; le corps :
   les pastilles, quatre chiffres, la barre (onglets segmentes et filtres), puis la liste et son panneau.
   << Aucun scroll bar dans l application >> (2026-10-12) : ni le corps ni la liste ne defilent. La carte de
   la liste prend la hauteur qui reste, et c est la hauteur reelle de la liste qui decide du nombre de lignes
   demandees au site (szAutoPagination) — depenses ET fournisseurs. */
.cx-carte>.liste{flex:1 1 0;min-height:0;overflow:hidden}
.cx-barre .droite{font-size:.78rem;color:var(--tx2)}
.cx-barre input[type=search]{min-width:16rem}
.ed-seg button .n{display:inline-block;margin-left:.4rem;padding:0 .4rem;border-radius:99px;background:var(--v08);
  font-size:.7rem;font-weight:600;color:var(--tx)}
.cx-kpis.trois-k{grid-template-columns:repeat(3,minmax(0,1fr))}
/* Les avis : une PASTILLE courte ; le texte complet s ouvre dessous, rien n est efface. */
.dp-avis{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.5rem}
/* Le detail flotte SOUS la pastille, par-dessus la page : l ouvrir ne pousse rien (la mesure de la liste tient). */
.dp-avis details{position:relative;min-width:0;max-width:100%}
.dp-avis summary{list-style:none;cursor:pointer}
.dp-avis summary::-webkit-details-marker{display:none}
.dp-avis details>p{position:absolute;z-index:20;top:calc(100% + .35rem);left:0;width:min(40rem,80vw);margin:0;
  padding:.6rem .8rem;border-radius:12px;background:var(--f-carte2);border:1px solid var(--sz-bord,var(--v14));
  box-shadow:0 12px 28px rgba(0,0,0,.35);font-size:.78rem;line-height:1.45;color:var(--tx)}
.cx-carte .aide strong{color:var(--tx)}
input,select,button,textarea{font:inherit;color:var(--tx);background:var(--v05);
  border:1px solid var(--v16);border-radius:8px;padding:.3rem .55rem}
select,button{cursor:pointer}
input:focus,select:focus,button:focus,textarea:focus{outline:none;border-color:var(--or)}
button:hover:not(:disabled){background:var(--v10)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:var(--or);background:rgba(var(--or-rgb),.14)}
button.prim{background:var(--or);border-color:var(--or);color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:var(--or-clair)}
button.danger{border-color:rgba(239,68,68,.5);color:var(--tx-err2)}
.carte{background:var(--f-carte);border:1px solid var(--v07);border-radius:11px;
  padding:.95rem 1.1rem}
.carte h2{margin:0 0 .5rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;
  color:var(--tx2);font-weight:700}

/* La zone de depot : c est la porte la plus rapide vers une depense saisie.
   ⚠⚠ ELLE PRENAIT TOUTE LA LARGEUR ET DEUX LIGNES DE HAUT, entre les tuiles et
   le tableau — sa remarque : << ses trop gros >>. Une zone de depot n est pas le
   sujet de l ecran, c est un raccourci. Refonte du 2026-10-16 : elle loge dans
   le PANNEAU d appui, a droite de la liste (.cx-depot du socle), sous son titre ;
   elle ne prend plus de place a la liste.
   ⚠ La distinction lecture automatique / simple piece jointe reste en attribut
   title, donc au survol ET au lecteur d ecran, et en clair dans la zone. */
.depot{cursor:pointer;transition:border-color .13s,background .13s}
.depot:hover,.depot.survol{border-color:var(--or);background:rgba(var(--or-rgb),.08);color:var(--tx)}
#d-depot{min-height:7.5rem}
#d-depot svg{width:1.4rem;height:1.4rem;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
/* Au survol d un fichier, elle doit se voir sans changer de taille : la bordure
   s epaissit vers l INTERIEUR (ombre portee interne), jamais en border-width
   qui pousserait les voisins de la barre. */
.depot.survol{box-shadow:inset 0 0 0 1px var(--or)}
/* ⚠⚠ LA ZONE DU FORMULAIRE GARDE SA TAILLE, ET CE N EST PAS UN OUBLI. Les deux
   partagent la classe .depot, mais ce sont deux gestes differents : dans la
   barre, c est un raccourci a cote d un bouton ; dans le formulaire d une
   nouvelle depense, c est LA porte d entree du document, seule au milieu du
   volet. La retrecir aussi aurait applique a un endroit une remarque faite sur
   un autre. */
#d-depot-form{display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.25rem;border:2px dashed rgba(var(--or-rgb),.5);border-radius:12px;
  padding:.85rem 1rem;text-align:center;font-size:inherit;white-space:normal;color:var(--tx2)}
#d-depot-form .gros{font-size:.9rem;font-weight:600;color:var(--tx)}
#d-depot-form .pt{font-size:.74rem}

table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.6875rem;text-transform:uppercase;
  letter-spacing:.06em;color:var(--tx2);font-weight:700;border-bottom:1px solid var(--v10)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:var(--v04)}
tbody td{padding:.3rem .4rem;border-top:1px solid var(--v055);vertical-align:middle}
tbody .num{font-weight:600;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
tbody .dt{font-size:.72rem;color:var(--tx2)}
.pill{display:inline-block;font-size:.6875rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:var(--tx-ok)}
.pill.att{background:rgba(245,158,11,.16);color:var(--tx-att)}
.pill.info{background:rgba(59,130,246,.18);color:var(--tx-bleu)}
.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.vide{padding:1.2rem .6rem;text-align:center;color:var(--tx2);font-size:.84rem}
.aide{font-size:.75rem;color:var(--tx2);line-height:1.45}
/* Dans les boites (fiche, formulaire), un avis reste un PARAGRAPHE : c est un texte a lire en entier
   (lecture de facture, question de fermeture). Il prend les couleurs de la pastille .cx-averti. */
.avis{background:color-mix(in srgb,var(--tx-att) 9%,transparent);border:1px solid color-mix(in srgb,var(--tx-att) 40%,transparent);
  color:var(--tx-att);border-radius:12px;padding:.5rem .75rem;font-size:.79rem;line-height:1.5}
.boite .cx-tuile{padding:.6rem .8rem;gap:.35rem;font-size:.79rem;line-height:1.5}
td .rf-pill.usd{margin-left:.35rem}

.voile{position:fixed;inset:0;background:rgba(6,10,18,.72);display:flex;
  align-items:center;justify-content:center;z-index:50;padding:1rem}
.boite{background:var(--f-carte2);border:1px solid var(--sz-bord,var(--v14));border-radius:16px;
  max-width:44rem;width:100%;max-height:96vh;overflow:auto;padding:.9rem 1rem}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid var(--v08);
  border-bottom:1px solid var(--v08);margin-bottom:.6rem}
.boite .grille .l{font-size:.6875rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2)}
.boite .grille .v{font-size:.86rem;font-weight:600;overflow-wrap:anywhere}
.boite .texte{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.88rem;line-height:1.5;
  background:var(--v03);border:1px solid var(--v07);border-radius:9px;
  padding:.5rem .7rem}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.gros-montant{font-weight:800;font-size:1.7rem;line-height:1;text-align:center;padding:.3rem 0 .1rem}
/* Les rangs de montants de la fiche : .cx-etat du socle (refonte 2026-10-16). */
.boite .cx-etat:last-child{border-bottom:0}
.recu{background:#f2f2f2;border-radius:10px;margin-top:.6rem;padding:.4rem;
  display:flex;align-items:center;justify-content:center;max-height:22rem;overflow:hidden}
.recu img{max-width:100%;max-height:21rem;object-fit:contain}
.boite.large{max-width:62rem}
.det-duo{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);gap:.9rem;align-items:start}
.det-duo .recu{margin-top:0;display:flex;align-items:center;justify-content:center}
.det-duo .recu img{max-height:24rem}

/* Le formulaire : deux colonnes, et le bloc des montants mis en evidence. */
.form{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem}
.form .aide-veh{align-self:end;font-size:.72rem;line-height:1.35}
.form .large{grid-column:1/-1}
.champ{display:flex;flex-direction:column;gap:.2rem}
.champ label{font-size:.7rem;color:var(--tx2)}
.champ input,.champ select{width:100%}
.bloc-montants{grid-column:1/-1;background:var(--f-carte);
  border:1px solid var(--sz-bord,var(--v09));border-radius:14px;padding:.55rem .7rem}
.trois{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:.5rem;align-items:end}
/* La part d affaires (usage mixte, 2026-10-02) entre dans le MEME rang que les
   montants : une colonne etroite, pas une ligne de plus (aucune barre de
   defilement). */
.trois.avec-part{grid-template-columns:1fr 1fr 1fr 6.5rem auto}
/* LISIBILITÉ, ÉTAPE 2 (2026-10-11) : la fiche s élargit (la fenêtre a la place), les montants
   prennent des colonnes égales et « Calc. taxes » quitte le rang des champs pour sa propre ligne,
   à droite — il écrasait la part d affaires dans une colonne de 6,5 rem. */
.boite{max-width:56rem}
.champ label{font-size:.8rem}
.bloc-montants{padding:.8rem 1rem}
.trois,.trois.avec-part{grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem 1rem}
.trois.avec-part{grid-template-columns:repeat(4,minmax(0,1fr))}
.trois > #f-taxes{grid-column:1 / -1;justify-self:end}
@media (max-width:620px){.form,.trois{grid-template-columns:1fr}}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-att)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre native « Dépenses ».
 * `ouverture` = 'nouvelle' pour ouvrir directement sur le formulaire de saisie.
 * ⚠ Ce n'est pas un ornement : le garde-fou ne simule AUCUN clic, donc sans ce
 * paramètre le FORMULAIRE — la moitié utile de cette fenêtre — ne serait jamais
 * dessiné par un jeu d'essai, et pourrait mourir en silence. Mesuré : une sonde
 * posée dans `boiteForm` n'était pas vue tant que la fenêtre s'ouvrait sur la
 * liste.
 */
function pageDepenses(ouverture) {
  /* ⚠ 'fermeture' n'est employé par AUCUNE entrée de menu : il existe pour que
     le garde-fou puisse dessiner la QUESTION de fermeture, qui ne s'atteint
     autrement qu'après deux clics. Un panneau jamais dessiné par un jeu d'essai
     est un panneau qui peut mourir en silence — la leçon a déjà coûté quatre
     versions publiées sur ce projet. */
  /* ⚠ 'fiche' (2026-10-02) ouvre la fiche de la PREMIERE ligne au chargement :
     la part deductible d une depense (vehicule, repas) ne se lit que la, et la
     fiche ne s atteint autrement qu au clic. */
  const ok = ['nouvelle', 'fermeture', 'annuaire', 'fiche'];
  const depart = (ok.indexOf(String(ouverture || '')) >= 0) ? String(ouverture) : 'liste';
  return `${TETE()}
<title>${T("Dépenses d’entreprise — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.depenses}</span><h1>${T("Dépenses d’entreprise")}</h1>
  <span class="cx-resume" id="sous"></span>
  <div class="cx-actions" id="d-actions"></div></div>
<div class="cx" id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE()}${JS_DIRE()}${JS_TUILES('depenses')}
  var corps = document.getElementById('corps');

  var D = null;
  var ANNEE = 0, MOIS = 0, CAT = '';
  function fmtArgent(n){
    return szArgent(n);   /* voir szArgent (socle) : le repli aussi place le symbole */
  }
  var PAGE = 0;
  /* Les tailles de page sont MESUREES (mesurerListe, apres chaque dessin) :
     25 et 30 ne sont que les replis tant que la liste n a pas ete disposee. */
  var TAILLE = 25, ANN_TAILLE = 30;
  var DETAIL = null;         // la depense ouverte (depenses:lire)
  var FORM = null;           // { id, date, categorie, paiement, description, fournisseur, montant, tps, tvq, recu }
  var SUPPR_ARME = false;
  var OCCUPE = false;
  var BR_MINUTE = null;      // minuterie d enregistrement du brouillon
  var BR_REPRIS = 0;         // age du brouillon repris, en minutes
  var FERMER_DEMANDE = false; // on demande quoi faire du brouillon avant de fermer
  var VUE = '${depart === 'annuaire' ? 'annuaire' : 'depenses'}';   // depenses | annuaire
  var ANN = null;            // reponse de depenses:annuaire
  var ANN_Q = '', ANN_PAGE = 0;
  var ANN_FORM = null;       // { id, nom, categorie, neuf }
  var ANN_RETIRE = '';       // id arme pour retrait
  var VERROU = null;         // { obtenu, parQui } — l annuaire est partage
  var OUVERTURE = '${depart}';

  /* ⚠ MÊME PLAFOND QUE L'ÉCRAN WEB : 8 Mo. Au-delà, le fichier traverse le pont
     pour finir refusé plus loin — autant le dire tout de suite, en le nommant. */
  var MAX_OCTETS = 8 * 1024 * 1024;

  /* Le nom d une categorie A L AFFICHAGE : le site envoie aussi son nom anglais
     (libelleEn, 2026-09-25). ⚠ Lecture seule : l option garde value = c.cle,
     et c est la cle qui s enregistre, jamais ce nom. */
  var EN = ${LANGUE.langueCourante() === 'en' ? 'true' : 'false'};
  function nomCat(c){ return (EN && c && c.libelleEn) ? c.libelleEn : (c ? c.libelle : ''); }
  /* Le nom d une categorie d apres sa CLE, pour une ligne de depense (le site y
     met categorieLbl, en francais) : on retrouve la categorie dans la liste
     recue et on prend son nom dans la langue du poste (2026-09-29). */
  function catLbl(cle, lbl){
    var L = ((typeof D !== 'undefined' && D && D.categories) || []).concat((typeof ANN !== 'undefined' && ANN && ANN.categories) || []);
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return nomCat(L[i]) || lbl || '';
    return lbl || '';
  }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  /* ══ LES FRAIS DE VEHICULE (2026-10-02) ═══════════════════════════════════
     Une depense de la categorie << vehicule >> se RATTACHE a un vehicule du
     registre et porte un TYPE de frais : c est ce qui lui donne sa part
     d affaires sur les formulaires fiscaux (km d affaires / km totaux). La
     part elle-meme est calculee par le site, jamais ici.
     ⚠ On AFFICHE le nom du type (szTd) ; on ENVOIE sa cle. */
  var CAT_VEHICULE = 'vehicule';
  function nomVehicule(id){
    var L = (D && D.vehicules) || [];
    for (var i = 0; i < L.length; i++) if (L[i].id === id) return L[i].nom;
    return '';
  }
  function nomTypeVehicule(cle){
    var L = (D && D.typesVehicule) || [];
    for (var i = 0; i < L.length; i++) if (L[i].cle === cle) return szTd(L[i].nom);
    return '';
  }
  function pctPart(p){
    try { return Number(p).toLocaleString('${LIEU()}', { style: 'percent', maximumFractionDigits: 1 }); }
    catch (e) { return Math.round(Number(p) * 100) + ' %'; }
  }

  var MOTIFS = {
    session:            '${T("Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.")}',
    droit:              '${T("Votre rôle ne donne pas accès aux dépenses.")}',
    indisponible:       '${T("L’administration n’est pas encore chargée dans la fenêtre principale.")}',
    pont_indisponible:  '${T("La fenêtre principale ne répond pas.")}',
    delai:              '${T("La fenêtre principale n’a pas répondu à temps.")}',
    operation_inconnue: '${T("Cette version de l’application ne connaît pas cette opération.")}',
    module_depenses:    '${T("Le module des dépenses n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).")}',
    introuvable:        '${T("Cette dépense n’existe plus.")}',
    montant:            '${T("Le montant doit être supérieur à 0.")}',
    recu:               '${T("Le reçu n’a pas pu être déposé dans le stockage — RIEN n’a été enregistré. Une dépense sans sa pièce justificative n’est pas défendable.")}',
    nuage:              '${T("Le nuage a refusé l’écriture — rien n’est conservé. Reconnectez-vous et refaites la saisie.")}',
    total_absent:       '${T("Saisissez d’abord le total payé (taxes incluses) dans « Montant ».")}',
    format:             '${T("Format non pris en charge — image ou PDF seulement.")}',
    trop_lourd:         '${T("Fichier trop volumineux (8 Mo maximum).")}',
    fichier_illisible:  '${T("Ce fichier n’a pas pu être lu.")}',
    image_illisible:    '${T("Cette image n’a pas pu être lue.")}',
    aucun_recu:         '${T("Cette dépense n’a pas de reçu.")}',
    echec:              '${T("L’opération a échoué.")}'
  };
  var LECTURE = {
    cle_absente: '${T("Reçu joint. Lecture automatique indisponible : aucune clé du service d’IA n’est enregistrée (écran Configuration → Clés API).")}',
    pdf:         '${T("Reçu joint. Le PDF n’a pas pu être converti pour la lecture — saisie manuelle.")}',
    illisible:   '${T("Reçu joint. La réponse du service n’était pas exploitable — saisie manuelle.")}',
    service:     '${T("Reçu joint. Le service de lecture n’a pas répondu — saisie manuelle.")}',
    non_fiable:  '${T("Reçu joint. La lecture a été refusée : elle ne correspondait pas au document.")}'
  };
  /* (2026-10-25, audit) Plus d esc() : le texte part vers dire() (textContent), ou vers
     vide() qui echappe de lui-meme — un « & » s affichait « &amp; ». */
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('${T("Erreur inattendue (")}' + (m || '?') + ').');
    if (r && r.detail && m !== 'recu') t += ' (' + String(r.detail).slice(0, 150) + ')';
    return t;
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }
  function vide(titre, detail){
    corps.innerHTML = '<div class="vide"><strong>' + esc(titre)
      + '</strong><div style="margin-top:.4rem">' + esc(detail || '') + '</div></div>';
  }

  /* ══ LES GESTES GROUPES (2026-10-29, sa demande : cases toujours visibles) ═══════════════════
     DEUX selections, une par onglet : changer d onglet les vide toutes les deux (corps.onclick, data-vue).
     · Depenses : Exporter (CSV) et Supprimer (droit D.peutSupprimer, boite « danger » — la meme phrase que la
       fiche). Chaque suppression passe par l op unitaire depenses:supprimer [id], qui reverifie le droit ;
       le recu reste conserve (le serveur refuse de l effacer). Un autre exercice, mois ou categorie vide la
       selection ; changer de page la garde.
     · Fournisseurs (annuaire) : Retirer, seulement ce qui a ete AJOUTE ou CORRIGE ici (un fournisseur livre
       ne se retire pas, comme a la ligne), seulement quand le verrou de l annuaire est TENU. La confirmation
       distingue les retraits des corrections annulees (le fournisseur livre retrouve son classement).
     ⚠ Pas de changement de categorie ni de taxes en lot : une ligne fiscale se choisit facture par facture. */
  var CKD = szCoches({
    zone: corps, barre: 'k-barre',
    lignes: function(){ return (D && VUE === 'depenses') ? (D.lignes || []) : []; },
    contexte: function(){ return ANNEE + '|' + MOIS + '|' + CAT; },
    id: function(r){ return r.id; },
    nom: function(r){ return r.description || r.fournisseur || r.id; },
    fiche: function(r){ return Object.assign({}, r); },
    compte: ['${T("{0} dépense sélectionnée")}', '${T("{0} dépenses sélectionnées")}'],
    actions: [
      /* (2026-10-29, sa décision) PAS DE SUPPRESSION EN LOT, comme les factures : la comptabilité se supprime une
         dépense à la fois, depuis sa fiche. En lot, l export seulement. */
      { cle: 'csv', libelle: '${T("Exporter (CSV)")}' }
    ],
    geste: function(cle, ids, tous){ return lotGesteDep(cle, ids, tous); }
  });
  function lotAnnEcrit(){ return !!(ANN && ANN.peutModifier && VERROU && VERROU.obtenu); }
  var CKA = szCoches({
    zone: corps, barre: 'k-barre-ann',
    lignes: function(){ return (ANN && VUE === 'annuaire') ? (ANN.lignes || []) : []; },
    contexte: function(){ return ANN_Q; },
    id: function(r){ return r.id; },
    nom: function(r){ return r.id + (r.nom ? ' — ' + r.nom : ''); },
    fiche: function(r){ return Object.assign({}, r); },
    compte: ['${T("{0} fournisseur sélectionné")}', '${T("{0} fournisseurs sélectionnés")}'],
    actions: [
      { cle: 'retirer', libelle: '${T("Retirer")}', danger: true, cache: function(){ return !lotAnnEcrit(); },
        aide: '${T("Seulement ce que vous avez ajouté ou corrigé : un fournisseur livré avec l’application ne se retire pas.")}',
        pour: function(f){ return f.origine !== 'integre'; } }
    ],
    geste: function(cle, ids, tous){ return lotGesteAnn(cle, ids, tous); }
  });
  function lotDep(id){ return CKD.fiches()[id] || {}; }
  function lotDepNom(id){ var f = lotDep(id); return (szJour(f.date) || f.dateFr || '') + ' · ' + (f.description || f.fournisseur || id); }
  function lotAnn(id){ return CKA.fiches()[id] || {}; }
  // Un montant affiche (« 1 234,56 $ ») en nombre pour le tableur (1234.56).
  function lotNombre(s){ var v = parseFloat(String(s == null ? '' : s).replace(/[^0-9,.-]/g, '').replace(',', '.')); return isFinite(v) ? v.toFixed(2) : ''; }
  function lotPlus(n){ return n > 8 ? [['…', '${T("et {0} autres")}'.split('{0}').join(n - 8)]] : []; }
  function lotGesteDep(cle, ids, tous){
    if (!ids.length) return;
    if (cle === 'csv') {
      var csv = szCSV(['${T("Date")}', '${T("Description")}', '${T("Fournisseur")}', '${T("Catégorie")}', '${T("Ligne fiscale")}',
        '${T("Mode de paiement")}', '${T("Montant (hors taxes)")}', '${T("TPS")}', '${T("TVQ")}', '${T("Reçu")}'],
        tous.map(function(id){ var f = lotDep(id); return [String(f.date || '').slice(0, 10), f.description || '', f.fournisseur || '',
          catLbl(f.categorie, f.categorieLbl), f.ligne || '', szTd(f.paiement) || '', (Number(f.montantN) || 0).toFixed(2),
          lotNombre(f.tps), lotNombre(f.tvq), f.recu ? '${T("Joint")}' : '${T("Manquant")}']; }));
      return szExporter('depenses-' + new Date().toISOString().slice(0, 10) + '.csv', csv,
        szPl(tous.length, '${T("{0} dépense exportée")}', '${T("{0} dépenses exportées")}').split('{0}').join(tous.length));
    }
    if (cle !== 'supprimer') return;
    var n = ids.length;
    var somme = ids.reduce(function(m, id){ return m + (Number(lotDep(id).montantN) || 0); }, 0);
    return szConfirmer({ danger: true, titre: '${T("Supprimer les dépenses")}',
      texte: szPl(n, '${T("{0} dépense sera supprimée définitivement. Elle disparaîtra de la comptabilité et des rapports d’impôt, et les taxes payées ne seront plus réclamées. Cette action est irréversible.")}',
        '${T("{0} dépenses seront supprimées définitivement. Elles disparaîtront de la comptabilité et des rapports d’impôt, et les taxes payées ne seront plus réclamées. Cette action est irréversible.")}').split('{0}').join(n),
      details: [['${T("Montant (hors taxes)")}', fmtArgent(somme)]]
        .concat(ids.slice(0, 8).map(function(id){ var f = lotDep(id); return [lotDepNom(id), f.montant || '—']; })).concat(lotPlus(n)),
      oui: szPl(n, '${T("Supprimer {0} dépense")}', '${T("Supprimer {0} dépenses")}').split('{0}').join(n) }).then(function(oui){
      if (!oui) return;
      OCCUPE = true;   // pas d actualisation au milieu du lot
      var fin = function(){ OCCUPE = false; CKD.vider(); return charger(); };
      return szLotDerouler({ titre: '${T("Suppression des dépenses")}', ids: ids, nom: lotDepNom, motif: function(r){ return expliquer(r); },
        faire: function(id){ return appeler('depenses:supprimer', [id]); },
        fait: function(k){ return szPl(k, '${T("{0} dépense supprimée.")}', '${T("{0} dépenses supprimées.")}').split('{0}').join(k); } })
        .then(fin, fin);
    });
  }
  function lotGesteAnn(cle, ids, tous){
    if (cle !== 'retirer' || !ids.length) return;
    if (!lotAnnEcrit()) { dire('${T("Annuaire ouvert par")} ' + ((VERROU && VERROU.parQui) || '${T("un collègue")}') + ' ${T("— consultation seulement.")}', 'att'); return; }
    var n = ids.length;
    var corr = ids.filter(function(id){ return lotAnn(id).origine === 'corrige'; }).length, ret = n - corr, ecart = tous.length - n;
    var texte = [
      ret ? szPl(ret, '${T("{0} fournisseur sera retiré de l’annuaire : les prochaines dépenses à son nom ne seront plus classées automatiquement.")}',
        '${T("{0} fournisseurs seront retirés de l’annuaire : les prochaines dépenses à leur nom ne seront plus classées automatiquement.")}').split('{0}').join(ret) : '',
      corr ? szPl(corr, '${T("{0} fournisseur livré perdra votre correction et retrouvera son classement d’origine.")}',
        '${T("{0} fournisseurs livrés perdront votre correction et retrouveront leur classement d’origine.")}').split('{0}').join(corr) : '',
      '${T("Les dépenses déjà saisies ne sont pas modifiées.")}',
      ecart ? szPl(ecart, '${T("{0} autre fournisseur sélectionné est livré avec l’application : il ne change pas.")}',
        '${T("{0} autres fournisseurs sélectionnés sont livrés avec l’application : ils ne changent pas.")}').split('{0}').join(ecart) : ''
    ].filter(Boolean).join(' ');
    // Rouge seulement s il y a un VRAI retrait ; une simple remise au classement d origine ne détruit rien (comme la ligne).
    return szConfirmer({ danger: ret > 0, prudent: !ret, titre: '${T("Retirer des fournisseurs de l’annuaire")}', texte: texte,
      details: ids.slice(0, 8).map(function(id){ var f = lotAnn(id);
        return [id, (catLbl(f.categorie, f.categorieLbl) || '—') + (f.origine === 'corrige' ? ' → ' + (f.categorieBaseLbl || '—') : '')]; }).concat(lotPlus(n)),
      oui: szPl(n, '${T("Retirer {0} fournisseur")}', '${T("Retirer {0} fournisseurs")}').split('{0}').join(n) }).then(function(oui){
      if (!oui) return;
      ANN_RETIRE = '';
      var fin = function(){ CKA.vider(); return chargerAnnuaire(); };
      return szLotDerouler({ titre: '${T("Retrait des fournisseurs")}', ids: ids, nom: function(id){ return id; }, motif: function(r){ return expliquer(r); },
        faire: function(id){ return appeler('depenses:annuaireRetirer', [id]); },
        fait: function(k){ return szPl(k, '${T("{0} fournisseur retiré ou rétabli.")}', '${T("{0} fournisseurs retirés ou rétablis.")}').split('{0}').join(k); } })
        .then(fin, fin);
    });
  }

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div>'; return; }
    var h = '';
    var act = document.getElementById('d-actions');

    if (!D.peutModifier && !D.peutAjouter) {
      h += '<div class="dp-avis">' + avis('<span class="ic">👁</span> ${T("Lecture seule")}',
        '${T("Lecture seule — votre rôle permet de consulter les dépenses, pas de les saisir.")}') + '</div>';
    }

    /* L annuaire est lui aussi en << corps plein >> depuis le 2026-10-12 : sa
       table vit dans une liste bornee et se pagine a la mesure, comme les
       depenses — il defilait avant, et la regle est << aucune glissiere >>. */
    if (VUE === 'annuaire') {
      if (act) act.innerHTML = actionsAnnuaire();
      corps.className = 'cx'; h += vueAnnuaire(); corps.innerHTML = h; CKA.apres(); brancherAnnuaire(); mesurerListe(); return;
    }

    /* LA TETE : l annee (le filtre qui dit l exercice), puis le geste principal, toujours a droite.
       Mois et categorie restent dans la barre, sous les chiffres : ils filtrent la liste. */
    if (act) act.innerHTML = '<select id="d-annee" aria-label="${T("Filtrer par année")}">' + (D.annees || []).map(function(a){
          return '<option value="' + a + '"' + (String(a) === String(D.annee) ? ' selected' : '') + '>${T("Exercice")} ' + a + '</option>';
        }).join('') + '</select>'
      + (D.peutAjouter ? '<button class="prim" id="d-nouvelle">${T("＋ Nouvelle dépense")}</button>' : '');

    /* ⚠ szTuiles(...) ENVELOPPE, il ne remplace rien : le bandeau est ecrit tel
       quel, la piece commune y ajoute le bouton de repli et l etat retenu pour
       ce poste. Les DEUX bandeaux de cette fenetre partagent la meme cle et se
       replient ensemble. Voir JS_TUILES dans socle.js.
       ⚠ Les chiffres de l esquisse « recus manquants » et « plus grosse categorie »
       ne sont PAS poses : la reponse ne porte que la PAGE affichee, et un compte
       tire d une page mentirait sur la periode. */
    h += szTuiles('<div class="cx-kpis">'
      + kpi('', '${T("Total —")} ' + D.periode, D.total, '${T("hors taxes, déductible")}')
      + kpi('ok', '${T("TPS payée")}', D.totalTps, '${T("crédit sur intrants")}')
      + kpi('ok', '${T("TVQ payée")}', D.totalTvq, '${T("remboursement sur intrants")}')
      + kpi('', '${T("Dépenses")}', D.nombre, D.periode)
      + '</div>');

    h += '<div class="cx-barre">' + ongletsVue()
      + '<select id="d-mois"><option value="0"' + (!D.mois ? ' selected' : '') + '>${T("Tous les mois")}</option>'
      + (D.moisNoms || []).map(function(m, i){
          return '<option value="' + (i + 1) + '"' + (D.mois === i + 1 ? ' selected' : '') + '>' + esc(m) + '</option>';
        }).join('') + '</select>'
      + '<select id="d-cat"><option value="">${T("Toutes catégories")}</option>'
      + (D.categories || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (D.categorie === c.cle ? ' selected' : '') + '>'
            + esc(nomCat(c)) + '</option>';
        }).join('') + '</select>'
      + '</div>';

    /* ⚠ PLEINE HAUTEUR (2026-09-19) : la carte prend le reste du corps, la liste
       ne defile pas ; la pagination et le rappel sur les frais Square restent
       colles au bas, toujours visibles. Les deux boites (formulaire, detail)
       sont des voiles en position:fixed — elles flottent au-dessus et ne sont
       donc pas coupees par le corps. */
    h += '<div class="cx-deux"><div class="cx-carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">${T("Aucune dépense pour")} ' + esc(D.periode) + '.</div>';
    } else {
      /* LA LIGNE (refonte 2026-10-16) : description en gras, fournisseur et mode de
         paiement dessous ; la categorie et sa ligne fiscale ; le montant en gras ;
         les taxes sur deux lignes ; le recu en pastille. Crochets gardes : tr[data-id]. */
      h += CKD.barre() + '<div class="liste" data-pages="depenses-liste"><table><thead><tr>' + CKD.th() + '<th>${T("Dépense")}</th><th>${T("Catégorie (ligne fiscale)")}</th>'
        + '<th>${T("Date")}</th><th style="text-align:right">${T("Montant")}</th>'
        + '<th style="text-align:right">${T("Taxes")}</th><th>${T("Reçu")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            var sous = [];
            if (r.fournisseur && r.description) sous.push(esc(r.fournisseur));
            if (r.paiement) sous.push(esc(szTd(r.paiement)));
            return '<tr data-id="' + esc(r.id) + '" class="' + CKD.classe(r) + '" title="${T("Voir le détail")}">'
              + CKD.td(r)
              + '<td><b>' + esc(r.description || r.fournisseur || '—') + '</b>'
              + (r.usd ? '<span class="rf-pill bleu usd">USD</span>' : '')
              + (sous.length ? '<span class="cx-l2">' + sous.join(' · ') + '</span>' : '') + '</td>'
              + '<td>' + esc(catLbl(r.categorie, r.categorieLbl))
              + (r.ligne ? ' <span class="cx-code">' + esc(r.ligne) + '</span>' : '') + '</td>'
              + '<td class="dt" style="white-space:nowrap">' + esc(szJour(r.date) || r.dateFr) + '</td>'
              + '<td class="num"><b>' + esc(r.montant) + '</b></td>'
              + '<td class="num" style="font-weight:400">'
              + (r.aTaxes ? '${T("TPS")} ' + esc(r.tps) + '<span class="cx-l2">${T("TVQ")} ' + esc(r.tvq) + '</span>'
                  : '<span class="cx-gris">—</span>') + '</td>'
              + '<td>' + (r.recu ? '<span class="rf-pill vert">${T("Joint")}</span>'
                  : '<span class="rf-pill ambre">${T("Manquant")}</span>') + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>';
    }
    /* ⚠ Le pied de pages est TOUJOURS pose, meme sur une seule page : s il
       apparaissait apres la mesure, il mangerait la hauteur deja comptee. Il
       porte aussi le rappel sur les frais Square. */
    h += '<div class="cx-pied"><span class="aide">${T("Les <strong>frais de traitement Square</strong> ")}'
      + '${T("sont déjà comptés dans l’Impôt (ligne 8710) — ne les ressaisissez pas ici.")}</span>'
      + (rows.length ? '<div class="droite">'
          + '<button class="mini" id="d-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="d-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>' : '')
      + '</div></div>';

    /* LE PANNEAU D APPUI : la zone de depot (sa place depuis la refonte) et ce qui
       reste a l ecran Comptabilite. */
    h += '<div class="cx-carte">';
    if (D.peutAjouter) {
      h += '<h2>${T("Lire une facture")}</h2>'
        + '<div class="depot cx-depot" id="d-depot" title="'
        + esc(D.lectureAuto
            ? '${T("Déposez une facture : elle est lue automatiquement, et vous vérifiez les champs avant d’enregistrer.")}'
            : '${T("Déposez une facture : elle sera jointe comme reçu. La lecture automatique demande une clé (Configuration → Clés API).")}')
        + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3h16v-3"/></svg>'
        + '<b>${T("Glissez une facture ici")}</b><span>' + (D.lectureAuto
            ? '${T("Photo, image ou PDF — les champs sont pré-remplis, vous vérifiez avant d’enregistrer.")}'
            : '${T("Elle sera jointe comme reçu (lecture automatique indisponible sans clé).")}') + '</span></div>'
        + '<div class="cx-sep"></div>';
    }
    h += '<div class="aide">${T("La ")}<strong>${T("fiscalité")}</strong>${T(" et la ")}<strong>${T("conciliation bancaire")}</strong>${T(" restent à ")}'
      + '${T("l’écran Comptabilité de la fenêtre principale.")}</div>'
      + '</div></div>';

    if (FORM) h += boiteForm();
    else if (DETAIL) h += boiteDetail();

    corps.className = 'cx';
    corps.innerHTML = h;
    CKD.apres();
    brancher();
    mesurerListe();
  }

  /* ── LES PIECES DE LA GRAMMAIRE (refonte 2026-10-16) ── */
  function kpi(cl, lbl, val, sous){
    return '<div class="cx-kpi' + (cl ? ' ' + cl : '') + '"><span>' + esc(lbl) + '</span><b>' + esc(val)
      + '</b><small>' + esc(sous == null ? '' : sous) + '</small></div>';
  }
  /* Un avis : une PASTILLE courte, et le texte complet s ouvre dessous au clic. */
  function avis(court, long, cl){
    return '<details><summary class="cx-averti' + (cl ? ' ' + cl : '') + '"><span>' + court + '</span></summary>'
      + '<p>' + long + '</p></details>';
  }
  /* Les deux vues en onglets segmentes. ⚠ data-vue est lu par le gestionnaire general. */
  function ongletsVue(){
    return '<div class="ed-seg">'
      + '<button class="' + (VUE === 'depenses' ? 'on' : '') + '" data-vue="depenses">${T("Dépenses")}'
      + (D && D.nombre != null ? '<span class="n">' + esc(D.nombre) + '</span>' : '') + '</button>'
      + '<button class="' + (VUE === 'annuaire' ? 'on' : '') + '" data-vue="annuaire">${T("Fournisseurs")}</button>'
      + '</div>';
  }
  function actionsAnnuaire(){
    if (!ANN) return '';
    var ro = !ANN.peutModifier;
    return (ro || (VERROU && !VERROU.obtenu)) ? ''
      : '<button class="prim" id="a-nouveau">${T("＋ Ajouter un fournisseur")}</button>';
  }

  /* La mesure : combien de lignes tiennent VRAIMENT dans la liste bornee de la
     vue affichee. Un seul rappel pour les deux vues (le socle n en retient
     qu un pour le redimensionnement) : il lit la VUE au moment ou il sonne. */
  function mesurerListe(){
    szAutoPagination('.liste', function(n){
      if (VUE === 'annuaire') {
        if (!ANN || n === ANN_TAILLE) return;
        ANN_TAILLE = n; ANN_PAGE = 0; chargerAnnuaire();
      } else {
        if (n === TAILLE) return;
        TAILLE = n; PAGE = 0; charger();
      }
    });
  }

  /* ══ L ANNUAIRE DES FOURNISSEURS ══════════════════════════════════════════
     Demande le 2026-08-09 : << l annuaire doit etre visible, et me permettre
     d ajouter et de modifier >>, << avec le systeme de verrou bien evidemment >>.
     ⚠ DEUX ORIGINES, DISTINGUEES A L ECRAN : ce qui est LIVRE avec
     l application et ce qui a ete APPRIS ou corrige ici. Modifier une entree
     livree ne l ecrase pas — cela cree une correction qui la RECOUVRE, et
     << Retirer la correction >> rend son classement d origine. Les confondre
     ferait croire qu on a detruit un fournisseur alors qu on l a seulement
     ramene a son reglage d usine. */
  function vueAnnuaire(){
    if (!ANN) return '<div class="cx-barre">' + ongletsVue() + '</div>'
      + '<div class="cx-carte"><div class="vide charge">${T("Lecture de l’annuaire…")}</div></div>';
    var ro = !ANN.peutModifier;
    var h = '';

    if (VERROU && !VERROU.obtenu) {
      h += '<div class="dp-avis">' + avis('<span class="ic">🔒</span> ${T("Annuaire ouvert en modification par")} <b>'
          + esc(VERROU.parQui || '${T("un collègue")}') + '</b>',
        '${T("Annuaire ouvert en modification par")} <strong>'
        + esc(VERROU.parQui || '${T("un collègue")}') + '</strong> ${T("— vous pouvez le consulter,")} '
        + '${T("pas le corriger. Deux corrections en même temps, c’est la dernière qui gagne")} '
        + '${T("sans que la première le sache.")}') + '</div>';
    }

    /* Trois chiffres : l annuaire n en a pas un quatrieme a dire. */
    h += szTuiles('<div class="cx-kpis trois-k">'
      + kpi('', '${T("fournisseurs")}', ANN.total, '${T("reconnus d’emblée")}')
      + kpi('', '${T("livrés")}', ANN.integres, '${T("avec l’application")}')
      + kpi('or', '${T("vos corrections")}', ANN.appris, '${T("elles priment")}')
      + '</div>');

    h += '<div class="cx-barre">' + ongletsVue()
      + '<input aria-label="${T("Domaine, nom ou catégorie")}" type="search" id="a-q" placeholder="${T("Nom ou domaine…")}" value="' + esc(ANN_Q) + '">'
      + '<span class="droite">' + ANN.trouves + ' '
      + (ANN.trouves > 1 ? '${T("affichés")}' : '${T("affiché")}') + '</span>'
      + '</div>';

    if (ANN_FORM) {
      h += '<div class="cx-carte"><h2>' + (ANN_FORM.neuf ? '${T("Ajouter un fournisseur")}' : '${T("Corriger le classement")}') + '</h2>'
        + '<div class="form">'
        + '<div class="champ"><label>${T("Domaine ou nom")}</label>'
        + '<input type="text" id="a-id" aria-label="${T("Domaine ou nom")}" value="' + esc(ANN_FORM.id) + '"'
        + (ANN_FORM.neuf ? ' placeholder="ex. render.com"' : ' disabled') + '></div>'
        + '<div class="champ"><label for="a-nom">${T("Nom affiché (facultatif)")}</label>'
        + '<input type="text" id="a-nom" value="' + esc(ANN_FORM.nom) + '" placeholder="ex. Render Services"></div>'
        + '<div class="champ large"><label for="a-cat">${T("Catégorie (ligne fiscale)")}</label><select id="a-cat">'
        + (ANN.categories || []).map(function(c){
            return '<option value="' + esc(c.cle) + '"' + (ANN_FORM.categorie === c.cle ? ' selected' : '') + '>'
              + esc(nomCat(c)) + ' · L.' + esc(c.ligne) + '</option>'; }).join('')
        + '</select></div></div>'
        + '<div class="aide" style="margin:.3rem 0 .5rem">${T("Un domaine complet est accepté et réduit")} '
        + '${T("automatiquement : « render.com », « support@render.com » et « Render » désignent le même fournisseur.")}</div>'
        + '<div class="pied-boite"><button id="a-annuler">${T("Annuler")}</button>'
        + '<button class="prim" id="a-ok">${T("✓ Enregistrer")}</button></div></div>';
    }

    h += '<div class="cx-carte cx-plein">';
    var rows = ANN.lignes || [];
    if (!rows.length) {
      h += '<div class="vide">${T("Aucun fournisseur ne correspond.")}</div>';
    } else {
      h += CKA.barre() + '<div class="liste" data-pages="depenses-annuaire"><table><thead><tr>' + CKA.th() + '<th>${T("Fournisseur")}</th><th>${T("Catégorie (ligne fiscale)")}</th>'
        + '<th>${T("Origine")}</th><th style="text-align:right">${T("Actions")}</th></tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr data-ann="' + esc(r.id) + '" class="' + CKA.classe(r) + '">'
              + CKA.td(r)
              + '<td><b>' + esc(r.id) + '</b>'
              + (r.nom ? '<span class="cx-l2">' + esc(r.nom) + '</span>' : '') + '</td>'
              + '<td>' + esc(catLbl(r.categorie, r.categorieLbl))
              + (r.ligne ? ' <span class="cx-code">' + esc(r.ligne) + '</span>' : '')
              + (r.flou ? ' <span class="rf-pill ambre">${T("polyvalent")}</span>' : '') + '</td>'
              + '<td>' + (r.origine === 'integre' ? '<span class="rf-pill">${T("livré")}</span>'
                  : (r.origine === 'corrige'
                      /* << polyvalent >> et << au lieu de >> etaient ecrits en dur. */
                      ? '<span class="rf-pill bleu">${T("corrigé")}</span> <span class="dt">${T("au lieu de")} '
                        + esc(r.categorieBaseLbl) + '</span>'
                      : '<span class="rf-pill vert">${T("ajouté")}</span>')) + '</td>'
              + '<td style="text-align:right;white-space:nowrap">'
              + ((ro || (VERROU && !VERROU.obtenu)) ? '<span class="dt">—</span>'
                  : '<button class="mini" data-annmod="' + esc(r.id) + '">${T("Modifier")}</button>'
                    + (r.origine === 'integre' ? ''
                        : ' <button class="mini danger" data-annret="' + esc(r.id) + '">'
                          + '✕' + '</button>'))
              + '</td></tr>';
          }).join('')
        + '</tbody></table></div>';
      // Pied de pages toujours pose (meme raison que la liste des depenses).
      if (rows.length) {
        h += '<div class="cx-pied"><div class="droite">'
          + '<button class="mini" id="a-prec"' + (ANN.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (ANN.page + 1) + ' / ' + ANN.pages + '</span>'
          + '<button class="mini" id="a-suiv"' + (ANN.page >= ANN.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div></div>';
      }
    }
    h += '</div>';
    h += '';
    return h;
  }

  function boiteDetail(){
    var e = DETAIL, recuHtml = '';
    var h = '<div class="voile" id="d-voile"><div class="boite' + (e.aRecu && e.recu && !e.recuPdf ? ' large' : '') + '">'
      + '<h3>' + esc(e.fournisseur || e.description || '${T("Dépense")}') + '</h3>'
      + '<div style="text-align:center"><span class="rf-pill">' + esc(catLbl(e.categorie, e.categorieLbl))
      + (e.ligne ? ' · L.' + esc(e.ligne) : '') + '</span></div>'
      + '<div class="gros-montant">' + esc(e.totalTTC)
      + (e.usd ? ' <span class="rf-pill bleu">USD→CAD</span>' : '') + '</div>'
      + '<div class="aide" style="text-align:center;margin-bottom:.5rem">${T("Total payé")}'
      + (e.aTaxes ? ' ${T("(taxes incluses)")}' : '') + '</div>'
      + '<div class="grille">'
      + '<div><div class="l">${T("Date")}</div><div class="v">' + esc(szJour(e.date) || e.dateFr) + '</div></div>'
      + '<div><div class="l">${T("Mode de paiement")}</div><div class="v">' + esc(szTd(e.paiementLbl)) + '</div></div>'
      + (e.categorie === CAT_VEHICULE
          ? '<div><div class="l">${T("Véhicule")}</div><div class="v">'
            + esc(e.vehiculeId ? (nomVehicule(e.vehiculeId) || '${T("Véhicule retiré du registre")}') : '${T("Non rattachée")}') + '</div></div>'
            + '<div><div class="l">${T("Type de frais")}</div><div class="v">'
            + esc(nomTypeVehicule(e.typeVehicule) || '${T("Non précisé")}') + '</div></div>'
          : '')
      + '</div>'
      + '<div class="texte">' + esc(e.description || '${T("(aucune description)")}') + '</div>';

    if (e.aTaxes) {
      h += '<div class="cx-tuile" style="margin-top:.6rem">'
        + '<div class="cx-etat"><span>${T("Montant (hors taxes)")}</span><strong>' + esc(e.montant) + '</strong></div>'
        + '<div class="cx-etat ret"><span>${T("TPS payée")}</span><strong>' + esc(e.tps) + '</strong></div>'
        + '<div class="cx-etat ret"><span>${T("TVQ payée")}</span><strong>' + esc(e.tvq) + '</strong></div>'
        + '<div class="cx-etat fort"><span>${T("Total payé")}</span><strong>' + esc(e.totalTTC) + '</strong></div>'
        + '</div>';
    }
    /* ⚠ LA PART DEDUCTIBLE SE DIT DES QU ELLE N EST PAS ENTIERE : repas a 50 %,
       vehicule a sa part d affaires. Le montant ci-dessus reste ce qui a ete
       PAYE (la comptabilite le garde entier) ; la declaration n en reprend que
       la part — et la meme part s applique aux taxes recuperables. */
    if (typeof e.part === 'number' && e.part < 1) {
      h += '<div class="cx-tuile att" style="margin-top:.6rem">'
        + '<div class="cx-etat fort"><span>${T("Part déductible :")} ' + esc(pctPart(e.part)) + '</span><strong>→ ' + esc(e.deductible) + '</strong></div>'
        + '<div class="aide" style="margin-top:.3rem">' + (e.categorie === CAT_VEHICULE
            ? '${T("La part d’affaires du véhicule (km d’affaires ÷ km totaux de l’année), établie par le registre « Véhicules et déplacements ». Elle s’applique aussi à la TPS et à la TVQ récupérables.")}'
            : ((e.partAffaires !== '' && e.partAffaires != null)
                ? '${T("Usage mixte : part d’affaires de")} ' + esc(pctPart(Number(e.partAffaires) / 100)) + '. '
                : '')
              + '${T("Seule cette part se déclare ; elle s’applique aussi à la TPS et à la TVQ récupérables.")}') + '</div>'
        + '</div>';
    }
    if (e.usd) {
      h += '<div class="avis" style="margin-top:.6rem">${T("Facture en dollars US — origine")} <strong>'
        + esc(e.origine || '—') + '</strong>'
        + (e.fxTaux ? ' ${T("× taux")} <strong>' + esc(e.fxTaux) + '</strong>'
            + (e.fxDate ? ' (' + esc(szQuand(e.fxDate)) + ')' : '')
            + (e.fxApprox ? ' ${T("approximatif")}' : '') : '') + '.</div>';
    }
    if (e.aRecu) {
      /* ⚠ L IMAGE S AFFICHE ICI, LE PDF S OUVRE DANS LA FENETRE PRINCIPALE : un
         PDF distant ne se rend pas dans un document local, et promettre un
         apercu qui reste blanc est pire que renvoyer ailleurs. */
      /* ⚠ RIEN A DIRE QUAND IL N Y A RIEN A MONTRER. Une ligne annoncait << Recu
         en PDF — il s ouvre dans la fenetre principale >> : le bouton
         << Ouvrir le recu >> juste en dessous le dit deja, et mieux. Une phrase
         qui repete un bouton n informe pas, elle encombre. */
      if (e.recu && !e.recuPdf) recuHtml = '<div class="recu"><img src="' + esc(e.recu) + '" alt=""></div>';
    }
    /* ⚠ LE RECU A COTE, PAS DESSOUS (2026-10-04) : une vraie photo de recu
       (21 rem de haut) poussait les boutons hors de la boite, qui defilait de
       55 a 139 px. La fiche passe en deux colonnes quand il y a une image. */
    if (recuHtml) {
      var iCorps = h.indexOf('<div class="grille">');
      if (iCorps > 0) h = h.slice(0, iCorps) + '<div class="det-duo"><div class="det-info">' + h.slice(iCorps) + '</div>' + recuHtml + '</div>';
      else h += recuHtml;
    }

    h += '<div class="pied-boite">'
      + (D.peutSupprimer ? '<button class="danger" id="d-suppr">'
          + '<span class="ic">🗑</span> ${T("Supprimer")}' + '</button>' : '')
      + (e.aRecu ? '<button id="d-recu"><span class="ic">📎</span> ${T("Ouvrir le reçu")}</button>' : '')
      + (D.peutModifier ? '<button class="prim" id="d-modifier"><span class="ic">✎</span> ${T("Modifier")}</button>' : '')
      + '<button id="d-fermer">${T("Fermer")}</button>'
      + '</div>';
    h += '</div></div>';
    return h;
  }

  function boiteForm(){
    var f = FORM;
    var neuf = (f.id === '__new__');
    var h = '<div class="voile" id="d-voile"><div class="boite">'
      + '<h3>' + (neuf ? '${T("＋ Nouvelle dépense")}' : '${T("Modifier la dépense")}') + '</h3>';

    /* ⚠ LA ZONE DE DEPOT S EFFACE UNE FOIS LA FACTURE PRISE (demande du
       2026-08-09 : << quand on glisse une facture, plus besoin de montrer ca >>).
       Elle occupait le haut du formulaire pour proposer un geste deja fait, et
       repoussait les champs a verifier — qui sont, eux, ce qui reste a faire.
       Une ligne discrete la remplace : le fichier reste remplacable. */
    if (neuf && !f.recu) {
      h += '<div class="depot" id="d-depot-form" style="margin-bottom:.6rem">'
        + '<div class="gros"><span class="ic">📄</span> ${T("Importer une facture")}</div>'
        + '<div class="pt">' + (D.lectureAuto
            ? '${T("Photo, image ou PDF — les champs sont pré-remplis, vous vérifiez avant d’enregistrer.")}'
            : '${T("Elle sera jointe comme reçu (lecture automatique indisponible sans clé).")}') + '</div>'
        + '</div>';
    }
    if (BR_REPRIS && neuf) {
      h += '<div class="cx-tuile ok" style="margin-bottom:.6rem;'
        + 'flex-direction:row;gap:.6rem;align-items:center;flex-wrap:wrap">'
        + '<span>${T("↩ Brouillon repris — saisie commencée il y a")} '
        + (BR_REPRIS < 60 ? (BR_REPRIS + ' min') : (Math.round(BR_REPRIS / 60) + ' h'))
        + (f.recu ? '${T(", reçu compris")}' : '') + '.</span>'
        + '<button class="mini" id="f-neuf">${T("Repartir à neuf")}</button></div>';
    }
    if (f.lecture) {
      h += '<div class="' + (f.lectureErr ? 'avis' : 'cx-tuile ok') + '" style="margin-bottom:.6rem;font-size:.79rem;line-height:1.5">'
        + esc(f.lecture) + '</div>';
    }

    h += '<div class="form">'
      + champ('${T("Date")}', '<input type="date" id="f-date" value="' + esc(f.date) + '">', 'f-date')
      + champ('${T("Mode de paiement")}', '<select id="f-pay" aria-label="${T("Mode de paiement")}">' + (D.paiements || []).map(function(p){
          return '<option value="' + esc(p.cle) + '"' + (f.paiement === p.cle ? ' selected' : '') + '>'
            + esc(szTd(p.libelle)) + '</option>'; }).join('') + '</select>')
      /* ⚠ Une dépense de VÉHICULE ajoute deux champs : la catégorie cède alors sa
         pleine largeur (Catégorie | Véhicule, puis Type | aide) — sinon le pied du
         formulaire passait 85 px sous le bord (sonde des débordements, 2026-10-02). */
      + '<div class="champ' + (f.categorie === CAT_VEHICULE ? '' : ' large') + '"><label for="f-cat">${T("Catégorie (ligne fiscale)")}</label><select id="f-cat">'
      + (D.categories || []).map(function(c){
          return '<option value="' + esc(c.cle) + '"' + (f.categorie === c.cle ? ' selected' : '') + '>'
            + esc(nomCat(c)) + ' · L.' + esc(c.ligne) + '</option>'; }).join('')
      + '</select></div>'
      + (f.categorie === CAT_VEHICULE ? champsVehicule(f) : '')
      + champ('${T("Description")}', '<input type="text" id="f-desc" value="' + esc(f.description)
          + '" placeholder="${T("Ex : Publicité Meta juillet")}">', 'f-desc')
      + champ('${T("Fournisseur")}', '<input type="text" id="f-four" value="' + esc(f.fournisseur)
          + '" placeholder="Ex : Meta Platforms">', 'f-four')
      + '<div class="bloc-montants"><div class="trois' + (f.categorie === CAT_VEHICULE ? '' : ' avec-part') + '">'
      + '<div class="champ"><label for="f-montant">${T("Montant (hors taxes)")}</label>'
      + '<input type="number" step="0.01" min="0" id="f-montant" value="' + esc(f.montant) + '" placeholder="0${SEP_DEC()}00"></div>'
      + '<div class="champ"><label for="f-tps">${T("TPS payée")}</label>'
      + '<input type="number" step="0.01" min="0" id="f-tps" value="' + esc(f.tps) + '" placeholder="0${SEP_DEC()}00"></div>'
      + '<div class="champ"><label for="f-tvq">${T("TVQ payée")}</label>'
      + '<input type="number" step="0.01" min="0" id="f-tvq" value="' + esc(f.tvq) + '" placeholder="0${SEP_DEC()}00"></div>'
      /* ⚠ PAS POUR UN VEHICULE : sa part vient du registre des deplacements. */
      + (f.categorie === CAT_VEHICULE ? ''
          : '<div class="champ"><label for="f-part">${T("Part d’affaires (%)")}</label>'
            + '<input type="number" step="1" min="0" max="100" id="f-part" value="' + esc(f.partAffaires) + '" placeholder="100"'
            + ' title="${T("Usage mixte (ex. cellulaire) : seule la part d’affaires se déduit, taxes comprises. Vide : 100 %.")}"></div>')
      + '<button id="f-taxes" title="${T("Déduire TPS et TVQ d’un total payé saisi dans ")}${T("Montant")}">${T("↧ Calc. taxes")}</button>'
      + '</div>'
      /* ⚠ LE MONTANT D ORIGINE RESTE SOUS LES YEUX pendant la saisie : c est la
         seule facon de verifier une conversion, et c est aussi ce qu on relit
         quand on corrige une taxe que la lecture a manquee. */
      + (f.origine
          ? '<div class="aide" style="margin-top:.35rem;color:var(--tx-bleu)"><span class="ic">💵</span> ${T("Facture en ")}'
            + esc(f.origine.devise || 'USD') + ' ${T("— original :")} '
            + [['montant', '${T("montant")}'], ['tps', 'TPS'], ['tvq', 'TVQ']].map(function(p){
                var v = f.origine[p[0]];
                return (v == null) ? '' : (p[1] + ' ' + szArgentChamp(v) + ' US');
              }).filter(Boolean).join(' · ')
            + (f.origine.total != null ? ' · ${T("total")} ' + szArgentChamp(f.origine.total) + ' US' : '')
            + (f.fx ? ' ${T("— taux")} ' + esc(f.fx.taux)
                + (f.fx.date ? ' ${T("du")} ' + esc(szQuand(f.fx.date)) : '')
                + (f.fx.approx ? ' ${T("(taux du jour, faute de mieux)")}' : '') : '')
            + '</div>'
          : '')
      /* L aide et le bouton USD sur UNE rangée (2026-10-02) : la dépense de
         véhicule ajoute une rangée de champs, et le pied passait sous le bord. */
      + '<div class="aide-usd" style="margin-top:.3rem;display:flex;align-items:center;gap:.6rem">'
      + '<div class="aide" style="flex:1;margin:0">${T("Saisissez le <strong>total payé</strong> dans ")}'
      + '${T("« Montant » puis « Calc. taxes » pour en déduire la TPS et la TVQ.")} '
      + '${T("Une facture en dollars US se convertit avec « ⇄ Convertir ».")}'
      + (f.categorie === CAT_VEHICULE ? '' : ' ${T("Usage mixte (ex. cellulaire) : seule la part d’affaires se déduit, taxes comprises.")}')
      + '</div>'
      + '<button id="f-convertir" style="flex:0 0 auto" title="${T("Convertir les montants saisis depuis le dollar US, au taux de la date")}">'
      + '${T("⇄ Convertir depuis USD")}</button></div></div>'
      + '<div class="champ large"><label>${T("Reçu (image ou PDF — facultatif)")}</label>'
      + '<button id="f-recu">' + (f.recu ? '${T("✓ Reçu joint — remplacer")}' : '<span class="ic">📎</span> ${T("Joindre un reçu")}') + '</button></div>'
      + '</div>';

    if (FERMER_DEMANDE) {
      h += '<div class="avis" style="margin-top:.7rem">'
        + '<strong>${T("Fermer sans enregistrer la dépense ?")}</strong><br>'
        + '${T("Votre saisie")}' + (f.recu ? ' ${T("et le reçu importé")}' : '') + ' ${T("peuvent être conservés")} '
        + '${T("en brouillon : « Nouvelle dépense » les reprendra.")}'
        + '</div>'
        + '<div class="pied-boite">'
        + '<button id="f-revenir">${T("← Revenir au formulaire")}</button>'
        + '<button class="danger" id="f-jeter">${T("Jeter la saisie")}</button>'
        + '<button class="prim" id="f-conserver">${T("Conserver le brouillon")}</button>'
        + '</div></div></div>';
      return h;
    }
    h += '<div class="pied-boite">'
      + '<button id="f-annuler">${T("Fermer")}</button>'
      + '<button class="prim" id="f-ok"' + (OCCUPE ? ' disabled' : '') + '>'
      + (neuf ? '${T("+ Ajouter la dépense")}' : '${T("✓ Enregistrer")}') + '</button>'
      + '</div></div></div>';
    return h;
  }
  /* ⚠ L ETIQUETTE ET SON CHAMP ARRIVENT PAR DEUX CHEMINS : le libelle ici, le
     champ en ARGUMENT, deja assemble par l appelant. Aucune lecture du code ne
     peut les rapprocher, et aucun for= ne pouvait donc etre pose par outil.
     L identifiant se donne maintenant en 3e argument — un seul endroit a
     changer, et les quatre appels en profitent. */
  /* Les deux champs d une depense de vehicule. ⚠ Un vehicule RETIRE reste
     proposable : une facture d entretien arrive souvent apres la vente, et elle
     appartient a l annee ou il roulait. Il est marque, pas cache. */
  function champsVehicule(f){
    var vs = (D.vehicules || []);
    var types = (D.typesVehicule || []);
    var h = champ('${T("Véhicule")}', '<select id="f-veh" aria-label="${T("Véhicule")}">'
        + '<option value="">' + (vs.length ? '${T("— non rattachée (part globale) —")}' : '${T("— aucun véhicule inscrit —")}') + '</option>'
        + vs.map(function(v){
            return '<option value="' + esc(v.id) + '"' + (f.vehiculeId === v.id ? ' selected' : '') + '>'
              + esc(v.nom) + (v.retire ? ' ${T("(retiré)")}' : '') + '</option>'; }).join('')
        + '</select>', 'f-veh')
      + champ('${T("Type de frais")}', '<select id="f-tveh" aria-label="${T("Type de frais")}">'
        + '<option value="">${T("— choisir —")}</option>'
        + types.map(function(t){
            return '<option value="' + esc(t.cle) + '"' + (f.typeVehicule === t.cle ? ' selected' : '') + '>'
              + esc(szTd(t.nom)) + '</option>'; }).join('')
        + '</select>', 'f-tveh');
    h += '<div class="aide aide-veh">' + (vs.length
        ? '${T("Part d’affaires : celle du registre du véhicule (stationnement et péages : 100 %).")}'
        : '${T("Aucun véhicule inscrit : la dépense se déclarera en entier.")}')
      + ' <button type="button" class="mini" id="f-vehicules">${T("Ouvrir « Véhicules et déplacements »")}</button></div>';
    return h;
  }
  function champ(l, ctrl, id){
    return '<div class="champ"><label' + (id ? ' for="' + id + '"' : '') + '>' + esc(l) + '</label>' + ctrl + '</div>';
  }

  /* ── LECTURE DU FICHIER, PUIS LE SITE FAIT LE RESTE ────────────────────── */
  function lireFichier(f){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || '')); };
      r.onerror = function(){ res(''); };
      r.readAsDataURL(f);
    });
  }
  function choisirFichier(cb){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*,application/pdf';
    e.onchange = function(){ if (e.files && e.files[0]) cb(e.files[0]); };
    e.click();
  }

  /* ══ LE BROUILLON ══════════════════════════════════════════════════════════
     ⚠⚠ DEUX DEFAUTS CORRIGES ICI, signales le 2026-08-09 (<< il ne conserve que
     la categorie, tout le reste est supprime >>).
     ① L ENREGISTREMENT ETAIT DIFFERE DE 3 SECONDES, ET LA FERMETURE VIDAIT LE
       FORMULAIRE AVANT QUE LA MINUTERIE NE PARTE : le garde << si FORM est nul,
       on abandonne >> faisait le reste. Seul ce qui avait ete ecrit AVANT
       survivait — c est-a-dire la categorie, un <select> dont le changement
       avait declenche un enregistrement trois secondes plus tot. Tout ce que la
       LECTURE D UNE FACTURE avait rempli ne partait jamais : elle remplit les
       champs par programme, sans frappe, donc sans geste a etrangler.
     ② Il n y avait AUCUNE PROPOSITION : la fenetre decidait seule de garder.
     Remede : deux voies distinctes — differee sur geste (pour ne pas encombrer
     le pont a chaque touche) et IMMEDIATE avant toute fermeture, avec les
     valeurs saisies AVANT que le formulaire ne disparaisse. */
  function brouillonValeurs(){
    memoriserForm();
    return { date: FORM.date, categorie: FORM.categorie, paiement: FORM.paiement,
      description: FORM.description, fournisseur: FORM.fournisseur,
      montant: FORM.montant, tps: FORM.tps, tvq: FORM.tvq, recu: !!FORM.recu,
      vehiculeId: FORM.vehiculeId || '', typeVehicule: FORM.typeVehicule || '',
      partAffaires: FORM.partAffaires == null ? '' : String(FORM.partAffaires) };
  }
  function brouillonEcrire(v){
    return appeler('depenses:brouillonEcrire', [v]).then(function(r){
      /* ⚠ UN ECHEC D ENREGISTREMENT SE DIT. Croire son travail a l abri alors
         qu il ne l est pas est pire que de le savoir. */
      if (!r.ok) dire('${T("Le brouillon n’a pas pu être conservé (stockage du poste plein).")}', 'att');
      else if (r.sansRecu) dire('${T("Brouillon conservé, mais SANS le reçu (stockage plein).")}', 'att');
      return r;
    });
  }
  /* Sur geste, etrangle a 3 s : un envoi a chaque touche encombrerait le pont,
     et une minuterie SEULE tiendrait la session ouverte toute la nuit. */
  function brouillonPoser(){
    if (!FORM || FORM.id !== '__new__') return;
    clearTimeout(BR_MINUTE);
    BR_MINUTE = setTimeout(function(){
      if (!FORM || FORM.id !== '__new__') return;
      brouillonEcrire(brouillonValeurs());
    }, 3000);
  }
  /* ⚠ IMMEDIAT, ET LES VALEURS SONT PRISES MAINTENANT : c est tout le correctif.
     Rend une promesse, pour que la fermeture attende l ecriture. */
  function brouillonMaintenant(){
    if (!FORM || FORM.id !== '__new__') return Promise.resolve({ ok: true });
    clearTimeout(BR_MINUTE);
    return brouillonEcrire(brouillonValeurs());
  }
  /* Un formulaire VIDE ne merite aucune question : on ferme, c est tout. */
  function formRempli(){
    if (!FORM) return false;
    memoriserForm();
    return !!(FORM.recu || String(FORM.description || '').trim()
      || String(FORM.fournisseur || '').trim() || (parseFloat(FORM.montant) || 0) > 0);
  }
  /* ⚠ ON DEMANDE, ON NE DECIDE PAS. Fermer en gardant en silence est aussi
     surprenant que fermer en jetant : dans les deux cas la personne ne sait pas
     ce qu il est advenu de son travail. */
  function demanderFermeture(){
    if (!FORM) return;
    if (FORM.id !== '__new__' || !formRempli()) { FORM = null; FERMER_DEMANDE = false; dessiner(); return; }
    FERMER_DEMANDE = true;
    dessiner();
  }

  function memoriserForm(){
    if (!FORM) return;
    var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
    FORM.date = g('f-date'); FORM.paiement = g('f-pay'); FORM.categorie = g('f-cat');
    FORM.description = g('f-desc'); FORM.fournisseur = g('f-four');
    FORM.montant = g('f-montant'); FORM.tps = g('f-tps'); FORM.tvq = g('f-tvq');
    /* ⚠ Les champs du vehicule n existent que pour sa categorie : absents, on
       garde ce qui etait choisi (revenir a la categorie le retrouve). */
    if (document.getElementById('f-veh')) FORM.vehiculeId = g('f-veh');
    if (document.getElementById('f-tveh')) FORM.typeVehicule = g('f-tveh');
    if (document.getElementById('f-part')) FORM.partAffaires = g('f-part');
  }

  function importerFacture(file){
    if (!file) return;
    /* (2026-10-25, audit) Sur l onglet Fournisseurs, le formulaire de depense n est pas dessine :
       la facture etait lue (appel payant) sans que rien n apparaisse. On refuse avant de lire. */
    if (VUE === 'annuaire') { dire('${T("Revenez à l’onglet Dépenses pour y déposer une facture.")}', 'att'); return; }
    if (file.size > MAX_OCTETS) { dire(MOTIFS.trop_lourd + ' (' + file.name + ')', 'att'); return; }
    if (OCCUPE) { dire('${T("Une lecture est déjà en cours.")}', 'att'); return; }
    OCCUPE = true;
    if (!FORM) FORM = formVierge();
    else memoriserForm();
    dessiner();
    dire('${T("Lecture de la facture… (quelques secondes)")}');
    lireFichier(file).then(function(data){
      if (!data) { OCCUPE = false; dire(MOTIFS.fichier_illisible, 'err'); dessiner(); return; }
      appeler('depenses:facture', [file.name, data]).then(function(r){
        OCCUPE = false;
        if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
        FORM.recu = !!r.recu;
        if (r.lu && r.champs) {
          var c = r.champs;
          /* ⚠ ON NE REMPLACE QUE CE QUI A ÉTÉ TROUVÉ : écraser un champ déjà
             saisi par un null effacerait le travail de la personne. */
          if (c.date) FORM.date = c.date;
          if (c.fournisseur) FORM.fournisseur = c.fournisseur;
          if (c.description) FORM.description = c.description;
          if (c.categorie) FORM.categorie = c.categorie;
          if (c.montant != null) FORM.montant = c.montant.toFixed(2);
          if (c.tps != null) FORM.tps = c.tps.toFixed(2);
          if (c.tvq != null) FORM.tvq = c.tvq.toFixed(2);
          /* ⚠ ON GARDE LES MONTANTS D ORIGINE : sans eux, on voit << 12,35 $ >>
             sans pouvoir verifier si la facture disait 8,79 ou 8,97. */
          FORM.origine = c.origine || null;
          FORM.fx = (r.devise === 'USD' && r.fxTaux)
            ? { taux: r.fxTaux, date: r.fxDate || '', approx: !!r.fxApprox, source: r.devise } : null;
          var complet = (parseFloat(FORM.montant) || 0) > 0 && FORM.date
            && (FORM.description || FORM.fournisseur);
          /* ⚠ ON DIT SI LA LECTURE A ÉTÉ RECOUPÉE AVEC LE DOCUMENT. Sur une photo
             ou un PDF numérisé il n y a aucun texte a comparer : la personne est
             alors la seule verification, et elle doit le savoir. */
          /* ⚠ ON DIT D'OÙ VIENT CHAQUE CHOSE. « Lu dans le document » et
             « proposé par la lecture automatique » n'engagent pas la même
             confiance, et la personne doit pouvoir régler son attention en
             conséquence : ce qui vient du document ne se vérifie qu'au coup
             d'oeil, ce qui vient du modèle se relit. */
          FORM.lectureErr = !r.verifie;
          var dd = (r.depuisDocument || []);
          FORM.lecture = (r.verifie
              ? ('${T("✓ Lu directement dans le document :")} ' + (dd.join(', ') || '${T("les montants")}') + '.')
              : '${T("Aucun texte à lire dans ce document (photo ou numérisation) : tout vient de la lecture automatique. Vérifiez CHAQUE champ.")}')
            + (r.modeleEcarte
                ? ' ${T("La lecture automatique a été écartée (elle ne correspondait pas au document) — complétez la description et la catégorie.")}'
                : '')
            // (2026-10-25, audit) Sans esc() ici : FORM.lecture est echappe UNE fois, a l affichage.
            + (r.preuve && !r.verifie ? ' ${T("Lu : «")} ' + r.preuve + ' »' : '')
            + (r.devise === 'USD' && r.fxTaux
                ? ' ${T("Montants convertis depuis le dollar US au taux")} ' + r.fxTaux
                  + (r.fxDate ? ' ${T("du")} ' + szQuand(r.fxDate) : '') + (r.fxApprox ? ' ${T("(approximatif)")}' : '') + '.'
                : '');
          dire(complet
            ? '${T("Facture lue — vérifiez les informations, puis enregistrez.")}'
            : '${T("Facture lue — complétez ce qui manque, puis enregistrez.")}',
            complet ? 'bon' : 'att');
        } else {
          /* ⚠ REFUS DE LECTURE : les champs restent VIDES, et l on dit pourquoi.
             Un champ faux est pire qu un champ vide — il finit dans une
             declaration de revenus, alors qu un champ vide se remarque. */
          FORM.lectureErr = true;
          FORM.lecture = (r.motifLecture === 'non_fiable')
            ? ('${T("Lecture REFUSÉE : ce qui a été proposé ne correspond pas au document (")}'
               + ((r.ecarts || []).join(' ; ') || '${T("écart détecté")}')
               + '${T("), et le document lui-même n’a pas pu être lu (photo ou numérisation).")} '
               + '${T("Rien n’a été rempli — saisissez à la main. Le reçu, lui, est joint.")}')
            : (LECTURE[r.motifLecture] || '${T("Reçu joint — saisie manuelle.")}');
          dire(r.motifLecture === 'non_fiable'
            ? '${T("Lecture refusée — elle ne correspondait pas au document.")}'
            : '${T("Reçu joint — saisie manuelle.")}', 'att');
        }
        dessiner();
        /* ⚠ ECRITURE IMMEDIATE : la lecture remplit les champs PAR PROGRAMME,
           sans frappe — rien n aurait declenche l enregistrement differe, et
           c est precisement ce qui se perdait a la fermeture. */
        brouillonMaintenant();
      });
    });
  }

  function formVierge(){
    var auj = new Date().toISOString().slice(0, 10);
    /* ⚠ PAS LA PREMIERE DE LA LISTE. Le formulaire ouvrait sur << Publicite >>
       simplement parce qu elle vient en tete — une facture de serveurs s y est
       retrouvee classee. << Autres depenses >> n affirme rien ; la vraie
       categorie vient du document quand on peut la lire. */
    var cat = 'autre';
    if (!(D.categories || []).some(function(c){ return c.cle === 'autre'; })) {
      cat = ((D.categories || [])[0] || {}).cle || 'autre';
    }
    var pay = ((D.paiements || [])[0] || {}).cle || 'card';
    return { id: '__new__', date: auj, categorie: cat, paiement: pay,
      description: '', fournisseur: '', montant: '', tps: '', tvq: '', recu: false,
      vehiculeId: '', typeVehicule: '', partAffaires: '',
      lecture: '', lectureErr: false, origine: null, fx: null };
  }

  function enregistrer(){
    if (OCCUPE) return;
    memoriserForm();
    OCCUPE = true;
    dessiner();
    dire('${T("Enregistrement…")}');
    appeler('depenses:enregistrer', [{
      id: FORM.id, date: FORM.date, categorie: FORM.categorie, paiement: FORM.paiement,
      description: FORM.description, fournisseur: FORM.fournisseur,
      montant: FORM.montant, tps: FORM.tps, tvq: FORM.tvq,
      /* Le site ne les garde que pour la categorie << vehicule >>. */
      vehiculeId: FORM.categorie === CAT_VEHICULE ? (FORM.vehiculeId || '') : '',
      typeVehicule: FORM.categorie === CAT_VEHICULE ? (FORM.typeVehicule || '') : '',
      /* Vide = 100 %. La virgule decimale devient un point : le site lit parseFloat. */
      partAffaires: FORM.categorie === CAT_VEHICULE ? '' : String(FORM.partAffaires == null ? '' : FORM.partAffaires).split(',').join('.').trim(),
    }]).then(function(r){
      OCCUPE = false;
      if (!r.ok) { dire(expliquer(r), 'err'); dessiner(); return; }
      dire('${T("Dépense enregistrée —")} ' + r.montant + ' · ' + r.categorie + '.', 'bon');
      /* ⚠ ON FERME, ON N ENCHAINE PAS. Je rouvrais ici un formulaire VIERGE pour
         permettre de saisir la facture suivante — copie de la question que pose
         l ecran web. Mais un formulaire qui se rouvre tout seul ne se lit pas
         comme une invitation : il se lit comme une fenetre qui NE S EST PAS
         FERMEE, et l on doute d avoir enregistre quoi que ce soit. Signale le
         2026-08-09. Le bouton << Nouvelle depense >> est juste au-dessus de la
         liste : enchainer reste a un clic, mais c est un clic VOULU. */
      FORM = null; DETAIL = null; FERMER_DEMANDE = false; BR_REPRIS = 0;
      charger();
    });
  }

  /* ── BRANCHEMENTS ──────────────────────────────────────────────────────── */
  /* ⚠⚠ LA VUE FOURNISSEURS A SON PROPRE BRANCHEUR, et son absence a tout casse.
     Elle appelait brancher() — celui des DEPENSES — qui cherche des champs
     (d-annee, d-mois, d-prec…) absents de cet ecran : rien ne se branchait, donc
     ni la recherche, ni la pagination, ni « Ajouter », ni « Enregistrer » ne
     repondaient. Seuls marchaient les gestes passant par les attributs data-*
     du gestionnaire general. Signale le 2026-08-09 (« changer de page dans les
     fournisseurs, ca ne marche pas »).
     ⚠ LE GARDE-FOU NE POUVAIT PAS LE VOIR : il execute le rendu, jamais les
     gestes — c'est le trou nomme dans reponses-fenetres.js. Un ecran a
     brancheur propre se verifie A LA MAIN. */
  function brancherAnnuaire(){
    var q = document.getElementById('a-q');
    if (q) q.oninput = function(){
      ANN_Q = q.value; ANN_PAGE = 0;
      clearTimeout(window._aq);
      window._aq = setTimeout(function(){ chargerAnnuaire(true); }, 300);
    };
    var bp = document.getElementById('a-prec');
    if (bp) bp.onclick = function(){ ANN_PAGE = Math.max(0, (ANN.page || 0) - 1); chargerAnnuaire(); };
    var bs = document.getElementById('a-suiv');
    if (bs) bs.onclick = function(){ ANN_PAGE = (ANN.page || 0) + 1; chargerAnnuaire(); };
    var nv = document.getElementById('a-nouveau');
    if (nv) nv.onclick = function(){
      ANN_FORM = { id: '', nom: '',
        categorie: ((ANN.categories || [])[0] || {}).cle || 'autre', neuf: true };
      dessiner();
    };
    var an = document.getElementById('a-annuler');
    if (an) an.onclick = function(){ ANN_FORM = null; dessiner(); };
    var ok = document.getElementById('a-ok');
    if (ok) ok.onclick = function(){
      var g = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
      var saisie = { id: ANN_FORM.neuf ? g('a-id') : ANN_FORM.id,
        nom: g('a-nom'), categorie: g('a-cat') };
      dire('${T("Enregistrement…")}');
      appeler('depenses:annuaireEcrire', [saisie]).then(function(r){
        if (!r.ok) {
          dire(r.motif === 'id_requis' ? '${T("Donnez un domaine ou un nom de fournisseur.")}'
            : (r.motif === 'categorie' ? '${T("Choisissez une catégorie.")}' : expliquer(r)), 'err');
          return;
        }
        dire('« ' + r.id + ' ${T("» classé en")} ' + r.categorie + '.', 'bon');
        ANN_FORM = null;
        chargerAnnuaire();
      });
    };
  }

  function brancher(){
    /* ⚠ UN SEUL BRANCHEMENT POUR TOUT LE FORMULAIRE : brancher champ par champ,
       c est en oublier un a chaque champ ajoute. */
    var boite = document.querySelector('.boite');
    if (boite && FORM) {
      boite.addEventListener('input', brouillonPoser);
      boite.addEventListener('change', brouillonPoser);
    }
    var lie = function(id, fn){ var e = document.getElementById(id); if (e) e.onchange = fn; };
    lie('d-annee', function(){ ANNEE = parseInt(this.value, 10) || 0; PAGE = 0; charger(); });
    lie('d-mois', function(){ MOIS = parseInt(this.value, 10) || 0; PAGE = 0; charger(); });
    lie('d-cat', function(){ CAT = this.value; PAGE = 0; charger(); });
    var bp = document.getElementById('d-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('d-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };
    var nv = document.getElementById('d-nouvelle');
    if (nv) nv.onclick = ouvrirNouvelle;

    var dep = document.getElementById('d-depot');
    if (dep) dep.onclick = function(){ choisirFichier(importerFacture); };
    var depF = document.getElementById('d-depot-form');
    if (depF) depF.onclick = function(){ choisirFichier(importerFacture); };

    // ── Fiche de détail
    var f = document.getElementById('d-fermer');
    if (f) f.onclick = fermer;
    var mo = document.getElementById('d-modifier');
    if (mo) mo.onclick = function(){
      FORM = { id: DETAIL.id, date: DETAIL.date, categorie: DETAIL.categorie,
        paiement: DETAIL.paiement, description: DETAIL.description, fournisseur: DETAIL.fournisseur,
        montant: DETAIL.montantN ? String(DETAIL.montantN) : '',
        tps: DETAIL.tpsN ? String(DETAIL.tpsN) : '', tvq: DETAIL.tvqN ? String(DETAIL.tvqN) : '',
        recu: DETAIL.aRecu, vehiculeId: DETAIL.vehiculeId || '', typeVehicule: DETAIL.typeVehicule || '',
        partAffaires: (DETAIL.partAffaires === '' || DETAIL.partAffaires == null) ? '' : String(DETAIL.partAffaires) };
      dessiner();
    };
    var rc = document.getElementById('d-recu');
    if (rc) rc.onclick = function(){
      dire('${T("Ouverture du reçu…")}');
      appeler('depenses:recuOuvrir', [DETAIL.id]).then(function(r){
        dire(r.ok ? '${T("Reçu ouvert dans la fenêtre principale.")}' : expliquer(r), r.ok ? 'bon' : 'err');
      });
    };
    var su = document.getElementById('d-suppr');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME) {
        var eS = DETAIL || {};
        szConfirmer({ danger: true, titre: '${T("Supprimer la dépense")}',
          texte: '${T("La dépense")}' + ' « ' + (eS.fournisseur || eS.description || '—') + ' » '
            + '${T("sera supprimée définitivement. Elle disparaîtra de la comptabilité et des rapports d’impôt, et les taxes payées ne seront plus réclamées. Cette action est irréversible.")}',
          details: [['${T("Date")}', szJour(eS.date) || eS.dateFr || '—'], ['${T("Catégorie")}', catLbl(eS.categorie, eS.categorieLbl) || '—'],
            ['${T("Montant (hors taxes)")}', eS.montant || '—']].concat(eS.aTaxes ? [['${T("Total payé")}', eS.totalTTC]] : []),
          oui: '${T("Supprimer la dépense")}' }).then(function(ok){ if (ok) { SUPPR_ARME = true; su.onclick(); } });
        return;
      }
      SUPPR_ARME = false;
      dire('${T("Suppression…")}');
      appeler('depenses:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('${T("Dépense supprimée (")}' + r.montant + ' · ' + r.categorie + ').', 'bon');
        DETAIL = null;
        charger();
      });
    };

    // ── Formulaire
    var an = document.getElementById('f-annuler');
    if (an) an.onclick = demanderFermeture;
    var rv = document.getElementById('f-revenir');
    if (rv) rv.onclick = function(){ FERMER_DEMANDE = false; dessiner(); };
    var cs = document.getElementById('f-conserver');
    if (cs) cs.onclick = function(){
      /* ⚠ ON ATTEND L ECRITURE AVANT DE FERMER. C est exactement le defaut
         corrige : fermer d abord, ecrire ensuite, c est ne rien ecrire. */
      brouillonMaintenant().then(function(){
        FORM = null; FERMER_DEMANDE = false; dessiner();
        dire('${T("Brouillon conservé — « Nouvelle dépense » le reprendra.")}', 'bon');
      });
    };
    var jt = document.getElementById('f-jeter');
    if (jt) jt.onclick = function(){
      clearTimeout(BR_MINUTE);
      appeler('depenses:brouillonJeter', []).then(function(){
        FORM = null; FERMER_DEMANDE = false; BR_REPRIS = 0; dessiner();
        dire('${T("Saisie jetée.")}', 'att');
      });
    };
    var bj = document.getElementById('f-neuf');
    if (bj) bj.onclick = function(){
      appeler('depenses:brouillonJeter', []).then(function(){
        BR_REPRIS = 0; FORM = formVierge(); dessiner();
        dire('${T("Brouillon jeté — formulaire vierge.")}', 'bon');
      });
    };
    var ok = document.getElementById('f-ok');
    if (ok) ok.onclick = enregistrer;
    /* ⚠ LA CATEGORIE REDESSINE LE FORMULAIRE : les champs du vehicule ne
       paraissent que pour elle. On memorise AVANT, sinon le redessin rend
       chaque champ a sa valeur d origine. Le brouillon suit (ecouteur de la
       boite, plus haut). */
    var fc = document.getElementById('f-cat');
    if (fc) fc.addEventListener('change', function(){ memoriserForm(); dessiner(); });
    var fv = document.getElementById('f-vehicules');
    if (fv) fv.onclick = function(){
      if (P && P.ouvrirModule) { P.ouvrirModule('vehicules'); dire('${T("Le registre des véhicules s’ouvre…")}'); }
    };
    var tx = document.getElementById('f-taxes');
    if (tx) tx.onclick = function(){
      memoriserForm();
      appeler('depenses:taxes', [FORM.montant]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'att'); return; }
        FORM.montant = r.montant.toFixed(2);
        FORM.tps = r.tps.toFixed(2);
        FORM.tvq = r.tvq.toFixed(2);
        dessiner();
        dire('${T("Taxes déduites du total payé.")}', 'bon');
      });
    };
    var cv = document.getElementById('f-convertir');
    if (cv) cv.onclick = function(){
      memoriserForm();
      if (!(parseFloat(FORM.montant) || parseFloat(FORM.tps) || parseFloat(FORM.tvq))) {
        dire('${T("Saisissez d’abord les montants en dollars US.")}', 'att'); return;
      }
      dire('${T("Lecture du taux de change…")}');
      appeler('depenses:convertir', [{ montant: FORM.montant, tps: FORM.tps,
        tvq: FORM.tvq, date: FORM.date }]).then(function(r){
        if (!r.ok) {
          dire(r.motif === 'rien_a_convertir' ? '${T("Rien à convertir.")}' : expliquer(r), 'att');
          return;
        }
        /* ⚠ ON GARDE CE QU ON VIENT DE CONVERTIR : sans le montant d origine
           affiche, personne ne peut verifier le resultat. */
        FORM.origine = { devise: 'USD', montant: r.origine.montant,
          tps: r.origine.tps, tvq: r.origine.tvq, total: null };
        FORM.fx = { taux: r.taux, date: r.date, approx: r.approx, source: r.source };
        if (r.montant != null) FORM.montant = r.montant.toFixed(2);
        if (r.tps != null) FORM.tps = r.tps.toFixed(2);
        if (r.tvq != null) FORM.tvq = r.tvq.toFixed(2);
        dessiner();
        brouillonMaintenant();
        dire('${T("Converti au taux")} ' + r.taux + (r.date ? ' ${T("du")} ' + szJour(r.date) : '')
          + (r.source ? ' (' + r.source + ')' : '')
          + (r.approx ? ' ${T("— taux du jour, faute d’avoir trouvé celui de la date.")}' : '.'),
          r.approx ? 'att' : 'bon');
      });
    };
    var rj = document.getElementById('f-recu');
    if (rj) rj.onclick = function(){
      choisirFichier(function(file){
        if (file.size > MAX_OCTETS) { dire(MOTIFS.trop_lourd, 'att'); return; }
        memoriserForm();
        dire('${T("Préparation du reçu…")}');
        lireFichier(file).then(function(data){
          if (!data) { dire(MOTIFS.fichier_illisible, 'err'); return; }
          appeler('depenses:recu', [file.name, data]).then(function(r){
            if (!r.ok) { dire(expliquer(r), 'err'); return; }
            FORM.recu = true;
            dessiner();
            dire('${T("Reçu joint — il partira dans le stockage à l’enregistrement.")}', 'bon');
          });
        });
      });
    };
  }

  function fermer(){ DETAIL = null; SUPPR_ARME = false; dessiner(); }

  /* ⚠ ON REPREND TOUJOURS CE QUI A ETE COMMENCE. Ouvrir un formulaire vierge
     par-dessus un brouillon effacerait en silence le travail de la derniere
     fois — exactement ce qu on cherche a empecher. */
  function ouvrirNouvelle(){
    DETAIL = null;
    FORM = formVierge();
    BR_REPRIS = 0;
    dessiner();
    appeler('depenses:brouillonLire', []).then(function(r){
      if (!r.ok || !r.brouillon || !FORM || FORM.id !== '__new__') return;
      var b = r.brouillon;
      Object.keys(b).forEach(function(k){ if (b[k] != null && b[k] !== '') FORM[k] = b[k]; });
      FORM.recu = !!(b.recu || r.recu);
      BR_REPRIS = r.ilYaMin || 1;
      dessiner();
      dire('${T("Brouillon repris — rien n’avait été perdu.")}', 'bon');
    });
  }

  /* ⚠ La garde du gestionnaire général : un clic sur une commande est traité par
     SA commande, jamais ici — sinon le clic qui arme un bouton le désarme. */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    if ((VUE === 'annuaire' ? CKA : CKD).clic(ev)) return;   // une case, « tout cocher » ou la barre d actions
    var vv = t.closest('[data-vue]');
    if (vv) {
      var v = vv.getAttribute('data-vue');
      if (v === VUE) return;
      // Chaque onglet a sa selection ; en changer les vide toutes les deux.
      if (CKD.occupe() || CKA.occupe()) return;
      CKD.vider(); CKA.vider();
      VUE = v; ANN_FORM = null; ANN_RETIRE = '';
      /* ⚠ Les deux vues partagent la mesure du socle, qui ne rappelle que si le
         compte CHANGE : une liste de l autre vue qui tiendrait le meme nombre de
         lignes laisserait celle-ci a son repli. On oublie donc la derniere
         mesure en changeant de vue. */
      if (typeof _szAutoDernier !== 'undefined') _szAutoDernier = 0;
      dessiner();
      if (v === 'annuaire') { chargerAnnuaire(); prendreVerrou(); }
      else rendreVerrou();
      return;
    }
    var am = t.closest('[data-annmod]');
    if (am) {
      var idm = am.getAttribute('data-annmod');
      var lg = ((ANN && ANN.lignes) || []).filter(function(x){ return x.id === idm; })[0];
      if (lg) { ANN_FORM = { id: lg.id, nom: lg.nom, categorie: lg.categorie, neuf: false }; dessiner(); }
      return;
    }
    var ar = t.closest('[data-annret]');
    if (ar) {
      var idr = ar.getAttribute('data-annret');
      /* ⚠ CONFIRME DANS UNE BOITE A PART (2026-10-15), qui dit ce qui se passe VRAIMENT : sur un
         fournisseur LIVRE, retirer la correction ne le supprime pas — il retrouve
         son classement d origine. Confondre les deux ferait croire qu on a
         detruit un fournisseur alors qu on l a ramene a son reglage d usine. */
      if (ANN_RETIRE !== idr) {
        var lR = ((ANN && ANN.lignes) || []).filter(function(x){ return x.id === idr; })[0] || {};
        var corrige = (lR.origine === 'corrige');
        szConfirmer({ danger: !corrige, titre: corrige ? '${T("Rétablir le classement d’origine")}' : '${T("Retirer le fournisseur de l’annuaire")}',
          texte: corrige
            ? '${T("La correction apportée au fournisseur")}' + ' « ' + idr + ' » ' + '${T("sera retirée. Il retrouvera son classement livré :")}' + ' ' + lR.categorieBaseLbl + '. ' + '${T("Les dépenses déjà saisies ne sont pas modifiées.")}'
            : '${T("Le fournisseur")}' + ' « ' + idr + ' » ' + '${T("sera retiré de l’annuaire. Les prochaines dépenses à son nom ne seront plus classées automatiquement. Les dépenses déjà saisies ne sont pas modifiées.")}',
          details: [['${T("Catégorie")}', catLbl(lR.categorie, lR.categorieLbl) || '—']],
          oui: corrige ? '${T("Rétablir le classement")}' : '${T("Retirer le fournisseur")}' }).then(function(ok){ if (ok) { ANN_RETIRE = idr; ar.click(); } });
        return;
      }
      ANN_RETIRE = '';
      appeler('depenses:annuaireRetirer', [idr]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.integre
          ? ('« ' + r.id + ' ${T("» retrouve son classement livré :")} ' + r.categorie + '.')
          : ('« ' + r.id + ' ${T("» retiré de l’annuaire.")}'), 'bon');
        chargerAnnuaire();
      });
      return;
    }
    if (t.closest('.boite')) return;
    /* ⚠⚠ UN CLIC A COTE NE JETTE PLUS LA SAISIE. Il fermait le formulaire et tout
       ce qui y avait ete mis — recu importe compris — sans un mot. Signale le
       2026-08-09 : << la fenetre se ferme des que je clique a cote sans
       sauvegarder >>. Le voile ne ferme desormais que la FICHE (qui ne contient
       aucune saisie) ; sous un formulaire, il ne fait rien et on le DIT. */
    if (t.closest('#d-voile')) {
      /* ⚠ LE VOILE NE JETTE PLUS RIEN : sous un formulaire il POSE LA QUESTION,
         il ne decide pas. Il ne ferme directement que les fiches, qui ne
         contiennent aucune saisie. */
      return;   // le voile ne ferme plus (2026-10-07) : seulement Fermer
    }
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) ouvrirDetail(tr.getAttribute('data-id'));
  };

  function ouvrirDetail(id){
    dire('${T("Lecture…")}');
    appeler('depenses:lire', [id]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('');
      DETAIL = r; SUPPR_ARME = false; FORM = null;
      dessiner();
    });
  }

  /* ── GLISSER-DEPOSER ──────────────────────────────────────────────────────
     ⚠ SUR LE DOCUMENT, ET preventDefault DANS LES DEUX : sans cela, un fichier
     lache sur la fenetre la fait NAVIGUER vers ce fichier — la fenetre native
     disparait, remplacee par le PDF. */
  document.addEventListener('dragover', function(ev){
    ev.preventDefault();
    var z = document.getElementById('d-depot-form') || document.getElementById('d-depot');
    if (z) z.classList.add('survol');
  });
  document.addEventListener('dragleave', function(ev){
    if (ev.relatedTarget) return;
    ['d-depot', 'd-depot-form'].forEach(function(id){
      var z = document.getElementById(id); if (z) z.classList.remove('survol');
    });
  });
  document.addEventListener('drop', function(ev){
    ev.preventDefault();
    ['d-depot', 'd-depot-form'].forEach(function(id){
      var z = document.getElementById(id); if (z) z.classList.remove('survol');
    });
    if (!D || !D.peutAjouter) { dire(MOTIFS.droit, 'att'); return; }
    var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (f) importerFacture(f);
  });

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  function chargerAnnuaire(garderSaisie){
    return appeler('depenses:annuaire', [{ q: ANN_Q, page: ANN_PAGE, taille: ANN_TAILLE }]).then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      ANN = r;
      if (garderSaisie) {
        var q = document.getElementById('a-q');
        var d1 = q ? q.selectionStart : null, f1 = q ? q.selectionEnd : null;
        dessiner();
        var q2 = document.getElementById('a-q');
        if (q2) { q2.focus({ preventScroll: true });
          try { if (d1 != null) q2.setSelectionRange(d1, f1); } catch (e) {} }
      } else dessiner();
    });
  }

  /* ⚠ L ANNUAIRE EST PARTAGE, DONC IL SE VERROUILLE (demande du 2026-08-09 :
     << avec le systeme de verrou bien evidemment >>). Deux personnes qui
     corrigent le classement d un meme fournisseur en meme temps, c est la
     derniere qui gagne sans que la premiere le sache — et une facture se
     retrouve dans la mauvaise ligne fiscale sans que personne ne comprenne.
     Le verrou est pris A L OUVERTURE de la vue et rendu quand on la quitte ou
     qu on ferme : c est la regle deja posee pour les fiches. */
  function prendreVerrou(){
    appeler('verrou:prendre', ['expense_vendors', 'annuaire']).then(function(r){
      /* ⚠ verrou:prendre rend un OBJET, pas un booleen — piege deja paye. */
      VERROU = r && r.ok ? { obtenu: !!r.obtenu, parQui: r.parQui || '' } : { obtenu: true, parQui: '' };
      if (VUE === 'annuaire') dessiner();
      if (VERROU && !VERROU.obtenu) {
        dire('${T("Annuaire ouvert par")} ' + (VERROU.parQui || '${T("un collègue")}') + ' ${T("— consultation seulement.")}', 'att');
      }
    });
  }
  function rendreVerrou(){
    if (!VERROU) return;
    VERROU = null;
    appeler('verrou:rendre', ['expense_vendors', 'annuaire']).then(function(){});
  }

  var enCours = false, RELANCE = false;
  function charger(){
    if (enCours) { RELANCE = true; return Promise.resolve(); }
    enCours = true;
    return appeler('depenses:donnees', [{ annee: ANNEE, mois: MOIS, categorie: CAT,
      page: PAGE, taille: TAILLE }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; return charger(); }
      if (!r || !r.ok) { vide('${T("Dépenses indisponibles")}', expliquer(r)); return; }
      D = r;
      ANNEE = D.annee; MOIS = D.mois; CAT = D.categorie;
      var s = document.getElementById('sous');
      if (s) s.textContent = D.periode + ' · ' + D.nombre + ' '
        + (D.nombre > 1 ? '${T("dépenses")}' : '${T("dépense")}') + ' · ' + D.total;
      /* ⚠ L OUVERTURE DIRECTE PASSE PAR LE MEME CHEMIN QUE LE BOUTON : elle relit
         donc le brouillon. Poser un formulaire vierge ici aurait ecrase en
         silence ce qui avait ete commence. */
      if (OUVERTURE === 'annuaire') { OUVERTURE = 'liste'; dessiner(); chargerAnnuaire(); prendreVerrou(); return; }
      if (OUVERTURE === 'fiche') {
        OUVERTURE = 'liste'; dessiner();
        if ((D.lignes || []).length) ouvrirDetail(D.lignes[0].id);
        return;
      }
      var ouvrirApres = ((OUVERTURE === 'nouvelle' || OUVERTURE === 'fermeture')
        && D.peutAjouter && !FORM);
      var poserQuestion = (OUVERTURE === 'fermeture');
      if (ouvrirApres) OUVERTURE = 'liste';
      dessiner();
      if (ouvrirApres) { ouvrirNouvelle(); if (poserQuestion) { FERMER_DEMANDE = true; dessiner(); } }
    });
  }

  /* ⚠ JAMAIS PENDANT UNE SAISIE : le formulaire perdrait ce qui y est écrit. */
  window.szActualiser = function(){ if (!OCCUPE && !FORM && !DETAIL) charger(); };
  window.szRevenir = function(){ if (!OCCUPE && !FORM && !DETAIL) charger(); };

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
      b.textContent = '${T("⧉ Détacher")}';
      b.title = '${T("Ouvrir cet écran dans sa propre fenêtre")}';
      b.onclick = function(){ if (P && P.detacher) P.detacher(); };
    } else {
      b.textContent = '${T("⚓ Ancrer")}';
      b.title = '${T("Ramener cet écran dans la fenêtre principale")}';
      b.onclick = function(){ if (P && P.ancrer) P.ancrer(); };
    }
  };

  // ⚠ LE VERROU SE REND QUAND LA FENETRE PART. Sans cela, l annuaire resterait
  // tenu jusqu a l expiration et le collegue suivant ne pourrait rien corriger.
  window.addEventListener('beforeunload', function(){ rendreVerrou(); });

  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape') {
      ev.preventDefault();
      /* ⚠ On ne ferme pas la fenetre sous une saisie en cours : le formulaire
         se ferme d abord, et la personne voit ce qu elle perd. */
      if (FERMER_DEMANDE) { FERMER_DEMANDE = false; dessiner(); return; }
      if (FORM) { demanderFermeture(); return; }
      if (DETAIL) { fermer(); return; }
      // (2026-10-25, audit) Le formulaire d un fournisseur se ferme avant la fenetre.
      if (ANN_FORM) { ANN_FORM = null; dessiner(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pageDepenses };
