'use strict';

/*
 * FENÊTRE « STUDIO VIRTUEL » — NATIVE (Catalogue, palier 5, chantier #14)
 * =============================================================================
 * Mise en scène guidée d'une photo studio (fond blanc) par Photoroom. On importe
 * une photo, on choisit UNE des trois voies, une AMBIANCE de marque, et l'on juge
 * d'abord en APERÇU GRATUIT (sandbox, filigrané) avant de dépenser un crédit.
 *
 *   👗 Mannequin virtuel — le vêtement porté par un modèle réel, décor et lumière
 *      intégrés (un seul appel). C'est la voie « pieds dans le sable ».
 *   👻 Fantôme habillé — le mannequin disparaît, puis un décor pro est posé
 *      (fond + ombre ancrée + relumière ; deux appels).
 *   📦 Produit à plat — détourage + décor + ombre + relumière (un appel).
 *
 * ⚠ TOUT LE TRAVAIL EST AU RELAIS (photoroom-proxy.php) : cette fenêtre n'envoie
 * qu'une image, une voie, une ambiance et le drapeau « aperçu ». Les clés ne la
 * traversent jamais, les crédits se comptent là-bas, l'ambiance s'y résout.
 *
 * ⚠ L'APERÇU SANDBOX EST GRATUIT ET FILIGRANÉ : c'est le levier crédits. Le bouton
 * payant s'arme en deux temps pour qu'aucun crédit ne parte par mégarde.
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
.tete .credits{margin-left:auto;font-size:.74rem;color:#8fa1b8}
.tete .credits b{color:#c9a97e}
.ro{flex:0 0 auto;margin:.7rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:#f0d6a0;border-radius:9px;padding:.5rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;
  display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-content:start}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.9rem 1rem;min-width:0;display:flex;flex-direction:column}
.carte.large{grid-column:1/-1}
.carte h2{margin:0 0 .1rem;font:700 .74rem/1.2 system-ui;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8}
.carte .sous{margin:0 0 .7rem;font-size:.75rem;color:#6d7f96}
/* Dépôt de photo */
.depot{border:1.5px dashed #2b3444;border-radius:10px;background:#0f1724;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem;
  min-height:9rem;text-align:center;color:#8fa1b8;font-size:.82rem;padding:1rem;-webkit-user-select:none;user-select:none}
.depot:hover,.depot.survol{border-color:#c9a97e;color:#cbd8e6}
.depot .gros{font-size:1.6rem;filter:grayscale(1) brightness(1.6)}
.depot img{max-width:100%;max-height:14rem;border-radius:8px}
.depot .refaire{font-size:.72rem;color:#8fa1b8;text-decoration:underline;margin-top:.3rem}
/* Choix dans la photothèque */
.phbarre{display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem}
.phbarre .phinfo{font-size:.74rem;color:#8fa1b8;margin-left:auto;white-space:nowrap}
.phbarre #ph-q{flex:1 1 auto;min-width:6rem;max-width:22rem;font:inherit;color:#e8edf5;
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.34rem .55rem}
.phbarre #ph-q:focus{outline:none;border-color:#c9a97e}
/* ⚠ 7rem, pas 5,5 : la vignette porte desormais une coche et des pastilles.
   A l ancienne largeur, le nom passait dessous et devenait illisible. */
.phgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:.5rem;
  max-height:20rem;overflow-y:auto;padding-right:.2rem}
.phgrille::-webkit-scrollbar{width:8px}
.phgrille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.phvig{background:#0f1724;border:1px solid #2b3444;border-radius:8px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;transition:border-color .12s}
.phvig:hover{border-color:#c9a97e}
.phvig img{width:100%;height:4.6rem;object-fit:contain;background:#0b1220}
.phvig .attente{font-size:.68rem;color:#6d7f96;padding:1.6rem .3rem}
.phvig .phnom{font-size:.64rem;color:#8fa1b8;padding:.15rem .25rem;max-width:100%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* ── Explorateur : filtres, panier de selection, coches et pastilles ─────── */
.phfiltres{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center;margin-bottom:.45rem}
.jeton{font:inherit;font-size:.73rem;padding:.16rem .55rem;border-radius:99px;cursor:pointer;
  color:#cbd8e6;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15)}
.jeton:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3)}
.jeton:disabled{opacity:.4;cursor:default}
.jeton.on{background:rgba(201,169,126,.2);border-color:#c9a97e;color:#e8dcc6;font-weight:600}
.jeton.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600}
.phfiltres select{font:inherit;font-size:.73rem;color:#cbd8e6;background:#0f1724;
  border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:.14rem .4rem}
.phsel{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.45rem;
  padding:.35rem .5rem;border-radius:9px;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.08)}
.phsel .cpt{font-size:.76rem;color:#8fa1b8}
.phsel .cpt.on{color:#e8dcc6;font-weight:700}
.phsel .droite{margin-left:auto;display:flex;align-items:center;gap:.4rem}
.phsel .aide{font-size:.72rem;color:#8fa1b8}
.phvig{position:relative}
.phvig.pris{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset}
.phcoche{position:absolute;top:.2rem;left:.2rem;width:1.05rem;height:1.05rem;z-index:2;
  border-radius:5px;border:1px solid rgba(255,255,255,.35);background:rgba(8,12,20,.7);
  display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#17202c}
.phvig.pris .phcoche{background:#c9a97e;border-color:#c9a97e;font-weight:700}
.phpast{position:absolute;top:.2rem;right:.2rem;z-index:2;display:flex;gap:.12rem}
.phpast .pt{font-size:.6rem;line-height:1;padding:.12rem .22rem;border-radius:4px;
  background:rgba(8,12,20,.75);color:#8fa1b8}
.phpast .pt.fait{color:#4ade80}
/* Le panier venu de l explorateur : ce qu on s apprete a traiter. */
.panier{margin-top:.55rem;padding:.5rem .6rem;border-radius:10px;
  background:rgba(201,169,126,.1);border:1px solid rgba(201,169,126,.35)}
.panier .pt{display:flex;align-items:center;gap:.4rem;font-size:.8rem;margin-bottom:.4rem}
.panier .pt .dt{color:#8fa1b8;font-size:.74rem}
.panier .pt button{margin-left:auto}
.panier .pv{display:flex;gap:.25rem;align-items:center;flex-wrap:wrap;margin-bottom:.45rem}
.panier .pv img{width:2.2rem;height:2.2rem;object-fit:contain;border-radius:5px;background:#0b1220}
.panier .pv .tr{width:2.2rem;height:2.2rem;border-radius:5px;background:rgba(255,255,255,.06)}
.panier .pv .pl{font-size:.72rem;color:#8fa1b8}
.panier button.prim{width:100%}
/* ── Suivi des lots ──────────────────────────────────────────────────────── */
.lots{display:flex;flex-direction:column;gap:.5rem;max-height:26rem;overflow-y:auto}
.lotc{background:#111a29;border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:.5rem .65rem}
.lotc.vif{border-color:#c9a97e}
.lott{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;margin-bottom:.35rem}
.lott strong{font-size:.85rem}
.lott .dt{font-size:.72rem;color:#8fa1b8;margin-left:auto}
.lotc .jauge{height:.42rem;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
.lotc .jauge i{display:block;height:100%;background:#c9a97e;transition:width .3s}
.lotd{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:.35rem;
  font-size:.76rem;color:#cbd8e6}
.lotd .mal{color:#f87171}
.lotd .droite{margin-left:auto;display:flex;gap:.3rem;flex-wrap:wrap}
.lote{margin-top:.3rem;font-size:.71rem;color:#8fa1b8;line-height:1.5}
.pill.acc{background:rgba(201,169,126,.18);color:#dcc39b}
.pill.err{background:rgba(239,68,68,.16);color:#f87171}
/* Voies + ambiances : tuiles cliquables */
.tuiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.45rem}
.tuile{background:#111a29;border:1px solid rgba(255,255,255,.09);border-radius:9px;
  padding:.5rem .6rem;cursor:pointer;-webkit-user-select:none;user-select:none;
  display:flex;align-items:center;gap:.5rem;text-align:left;
  transition:border-color .12s,background .12s}
.tuile:hover{border-color:rgba(201,169,126,.5)}
.tuile.on{border-color:#c9a97e;background:rgba(201,169,126,.14)}
/* ⚠ Emoji en GRIS (comme le reste de l administration), jamais en couleur. */
.tuile .em{font-size:1.15rem;line-height:1;flex:0 0 auto;filter:grayscale(1) brightness(1.45);opacity:.9}
.tuile .txt{display:flex;flex-direction:column;min-width:0}
.tuile .t{font-size:.8rem;font-weight:700;line-height:1.2}
.tuile .d{font-size:.68rem;color:#6d7f96;line-height:1.22;margin-top:.06rem}
.amb{grid-template-columns:1fr 1fr}
/* Galerie de modèles — c'est la liste de CHOIX du mannequin, plus un menu texte.
   ⚠ contain et non cover : on veut voir la SILHOUETTE ENTIÈRE (demande du
   2026-08-11 : « je veux juste voir la forme du modèle et le corps aussi »).
   cover avec object-position:top recadrait sur le visage — exactement ce
   qu'il ne fallait pas montrer.
   ⚠ AUCUN ACCENT GRAVE ICI : cette feuille vit dans un littéral de gabarit. */
.mgal-info{font-size:.72rem;color:#8fa1b8;flex:1 1 12rem;min-width:0}
.mgrille{display:grid;grid-template-columns:repeat(auto-fill,minmax(5.8rem,1fr));gap:.55rem;
  max-height:24rem;overflow-y:auto;padding-right:.2rem}
.mgrille::-webkit-scrollbar{width:8px}
.mgrille::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
.mvig{background:#0f1724;border:1px solid #2b3444;border-radius:9px;overflow:hidden;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;position:relative;
  transition:border-color .12s,background .12s}
.mvig:hover{border-color:rgba(201,169,126,.6);background:#121c2c}
.mvig.on{border-color:#c9a97e;box-shadow:0 0 0 1px #c9a97e inset;background:rgba(201,169,126,.1)}
.mvig img{width:100%;height:9rem;object-fit:contain;background:#0b1220;padding:.15rem;display:block}
.mvig .matt{height:9rem;display:flex;align-items:center;justify-content:center;
  color:#5c6b80;font-size:.7rem;width:100%;background:#0b1220;text-align:center;padding:.3rem}
.mvig .mnom{font-size:.72rem;font-weight:600;color:#cbd8e6;padding:.24rem .3rem;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mvig.on .mnom{color:#e7d3b3}
/* Pastille discrète : cette vignette montre VOTRE vêtement, pas le témoin. */
.mvig .mtag{position:absolute;top:.25rem;right:.25rem;font-size:.6rem;line-height:1;
  padding:.14rem .3rem;border-radius:5px;background:rgba(201,169,126,.9);color:#1a1208;font-weight:700}
.mvig .mcoche{position:absolute;top:.25rem;left:.25rem;font-size:.7rem;line-height:1;
  width:1.05rem;height:1.05rem;border-radius:50%;background:#c9a97e;color:#1a1208;
  display:flex;align-items:center;justify-content:center;font-weight:700}
.mbarre{display:flex;align-items:center;gap:.5rem;margin-top:.55rem;flex-wrap:wrap}
.ch{margin:.7rem 0 0}
.ch label{display:block;margin-bottom:.25rem;font-size:.76rem;color:#8fa1b8}
select{width:100%;font:inherit;color:#e8edf5;background:#0f1724;border:1px solid #2b3444;
  border-radius:8px;padding:.4rem .5rem}
select:focus{outline:none;border-color:#c9a97e}
.bascule{display:flex;align-items:flex-start;gap:.55rem;font-size:.82rem;cursor:pointer;
  -webkit-user-select:none;user-select:none;margin:.2rem 0 0}
.bascule input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;margin-top:.12rem;flex:0 0 auto}
.bascule .d{font-size:.72rem;color:#6d7f96;display:block;margin-top:.08rem}
/* Résultat */
.res{align-items:center;justify-content:center;min-height:12rem;text-align:center;color:#8fa1b8}
.res img{max-width:100%;max-height:22rem;border-radius:9px;border:1px solid rgba(255,255,255,.1)}
.res .filig{margin-top:.5rem;font-size:.74rem;color:#facc15}
.res .avis{margin-top:.4rem;font-size:.74rem;color:#8fa1b8}
.res .dims{font-size:.7rem;color:#6d7f96;margin-top:.2rem}
.res .dl{margin-top:.6rem}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.55rem;
  padding:.55rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#facc15}
button{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.42rem .8rem;cursor:pointer}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.5;cursor:default}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bd97}
button.conf{background:#f0a05a;border-color:#f0a05a;color:#241703;font-weight:700}
.vide{padding:1rem;text-align:center;color:#8fa1b8;font-size:.82rem}
/* ⚠ LA SURCOUCHE DU LANCEMENT DE LOT. Elle manquait — habillage ET fonction :
   ouvrirLotVoile() appelait un voile() qui n'existait nulle part, et le clic
   mourait sur un ReferenceError. Le bouton « Traiter ces N en lot… » n'a donc
   JAMAIS rien fait, par aucun des deux chemins (panier ou sélecteur). */
.voile{position:fixed;inset:0;background:rgba(8,12,20,.82);display:flex;
  align-items:center;justify-content:center;padding:1.1rem;z-index:60}
.voile .boite{background:#16202f;border:1px solid rgba(255,255,255,.12);
  border-radius:13px;padding:1rem 1.15rem;max-width:29rem;width:100%;
  max-height:88vh;overflow-y:auto;box-shadow:0 18px 46px rgba(0,0,0,.5)}
.voile h3{margin:0 0 .5rem;font:700 1.02rem/1.25 Georgia,serif}
.voile p{margin:.6rem 0 0;font-size:.79rem;line-height:1.55}
.voile input[type=text],.voile input:not([type]){width:100%;font:inherit;color:#e8edf5;
  background:#0f1724;border:1px solid #2b3444;border-radius:8px;padding:.4rem .5rem}
.voile input:focus{outline:none;border-color:#c9a97e}
.rc{display:flex;align-items:flex-start;gap:.55rem;font-size:.8rem;line-height:1.5;
  cursor:pointer;-webkit-user-select:none;user-select:none;margin:.6rem 0 0}
.rc input{width:1.05rem;height:1.05rem;accent-color:#c9a97e;cursor:pointer;
  margin-top:.12rem;flex:0 0 auto}
.fin2{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.9rem}
@media (max-width:720px){.corps{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageStudio(mode) {
  /* ⚠ IDENTIFIANT D OUVERTURE << explorateur >> : le banc ne clique pas, et le
     selecteur de photos ne s atteint qu apres un clic. Sans lui, l ECRAN QUI
     CHOISIT CE QU ON VA PAYER resterait hors de tout controle. Angle mort #32. */
  const explo = String(mode || '') === 'explorateur';
  const lotsDep = String(mode || '') === 'lots';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Studio virtuel — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">🎨</span><h1>Studio virtuel</h1>
  <span class="credits" id="credits"></span></div>
<div class="ro" id="ro" hidden>Lecture seule : votre rôle ne permet pas de lancer de traitement.</div>
<div class="corps" id="corps"><div class="carte large"><div class="vide">Chargement…</div></div></div>
<div class="pied"><span class="msg" id="msg"></span>
  <button id="b-apercu" disabled>Aperçu gratuit</button>
  <button class="prim" id="b-final" disabled>Générer en pleine qualité</button></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  /* ── MODE ANCRE ── le meme bouton d'ancrage/detachement que les autres ecrans.
     La coquille appelle szModeAncre(true) quand la vue est ANCREE, (false) quand
     elle est DETACHEE ; on montre le bon libelle et on route vers le pont. */
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
        + 'color:#e8edf5;cursor:pointer;flex:0 0 auto;-webkit-user-select:none;user-select:none');
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
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var bApercu = document.getElementById('b-apercu');
  var bFinal = document.getElementById('b-final');
  var creditsEl = document.getElementById('credits');
  var RO = false, OCCUPE = false, ARME = false;
  var PHOTO = null;      // data URL d une photo importee (fichier), reduite
  var PHOTO_ID = '';     // id d une photo CHOISIE dans la phototheque (l image reste au site)
  var PHOTO_URL = '';    // adresse de la vignette choisie (affichage seulement)
  var PICKER = false;    // le choix dans la phototheque est-il ouvert ?
  var PHOTHQ = [];       // [{id,nom,apercu,enAttente}] cumule (defilement infini)
  var PH_Q = '';         // recherche courante (nom / code)
  var PH_PAGE = 0;       // derniere page chargee
  var PH_TAILLE = 60;    // photos par page
  var PH_TOTAL = 0;      // total correspondant a la recherche
  var PH_FIN = false;    // plus rien a charger
  var PH_OCC = false;    // une page est-elle en cours de chargement ?
  // ⚠ Trois etats : tant qu il est faux, on ne dit PAS << vide >>.
  var PH_CHARGE = false;
  // ── EXPLORATEUR (#28) ──────────────────────────────────────────────────────
  var PH_FILTRES = [];   // jetons actifs (traitee, isolee, orpheline...)
  var PH_SANS = '';      // sans tel traitement precis
  var PH_LOT = '';       // lot d import
  var PH_TRI = 'recent';
  var PH_META = null;    // filtres/traitements/lots disponibles + tousLesIds
  var SEL = {};          // { <idPhoto>: true } — le panier de selection
  var PH_DEB = null;     // minuterie anti-rebond de la recherche
  var VOIE = 'humain';   // humain | fantome | plat
  var PRESET = '';       // cle d ambiance
  var PRESETS = [];      // [{cle,label,emoji,desc}]
  var RESULT = null;     // { image, essai, decorErreur, upNote, largeur, hauteur }
  var ENREG = false;     // le resultat a-t-il ete enregistre dans la phototheque ?
  // Galerie de modeles : apercus SANDBOX (gratuits) du vetement sur chaque modele,
  // pour choisir AVANT de generer en pleine qualite.
  var MODELE_SEL = 'sophia'; // modele choisi (persiste entre les rendus)
  var APM = {};              // cache : modele -> data URL de l apercu de VOTRE vetement
  var APM_SIG = '';          // empreinte (photo+ambiance) pour invalider le cache
  var COMPARE_STOP = false;  // demande d arret de la generation en cours
  /* PORTRAITS PERSISTANTS : modele -> adresse R2. Fabriques UNE FOIS a partir d un
     vetement temoin pris dans la phototheque, puis relus indefiniment.
     ⚠ C EST TOUT L INTERET : << je ne veux pas payer un nouveau credit a chaque
     fois que je consulte la liste >>. Rien ici ne rappelle Photoroom. */
  var PORTRAITS = {};
  var PORT_OCC = false;      // fabrication des portraits en cours
  var PORT_STOP = false;     // demande d arret

  var VOIES = [
    { cle: 'humain',  em: '👗', t: 'Mannequin virtuel', d: 'Porté par un modèle, décor intégré' },
    { cle: 'fantome', em: '👻', t: 'Fantôme habillé',   d: 'Sans mannequin, décor pro ajouté' },
    { cle: 'plat',    em: '📦', t: 'Produit à plat',    d: 'Détourage + décor + ombre' }
  ];
  // Quelques modèles (mannequin virtuel). Le relais accepte tout nom connu.
  // Les 16 modeles REELS de Photoroom (virtualModel.model.preset.name, verifies
  // dans la doc 2026-08-11). Sophia en tete = choix par defaut. Photoroom ne
  // publie pas l apparence de chaque modele : le bouton << Comparer >> genere un
  // apercu sandbox gratuit du VRAI vetement sur chacun pour choisir a l oeil.
  var MODELES = ['sophia','emma','ava','zoe','maya','lena','julia','fiona',
                 'avery','taylor','kendall','casey','sam','jordan','jackson','reece'];

  /* LES POSES — les douze valeurs officielles de Photoroom (verifiees dans la
     documentation le 2026-08-11). ⚠ ELLE ETAIT FIXEE EN DUR au trois-quarts
     cote serveur : le choix appartenait au code, pas a la personne qui regarde
     le resultat — et il a ete refuse des le premier essai (<< je n aime pas
     cette pose >>). Le trois-quarts reste le DEFAUT (il montre la coupe et le
     tombe mieux qu une pose de face), mais il se change maintenant d un clic,
     et l apercu est gratuit : on juge sur piece sans depenser un credit. */
  var POSES = [
    { cle: '34turn',           t: 'Trois-quarts (défaut)' },
    { cle: 'standing',         t: 'Debout, de face' },
    { cle: 'powerstance',      t: 'Posture affirmée' },
    { cle: 'walkingforward',   t: 'En marche' },
    { cle: 'handinpocket',     t: 'Main dans la poche' },
    { cle: 'crossedarms',      t: 'Bras croisés' },
    { cle: 'overtheshoulder',  t: 'Regard par-dessus l’épaule' },
    { cle: 'back',             t: 'De dos' },
    { cle: 'seated',           t: 'Assise' },
    { cle: 'adjustingclothing',t: 'Ajuste son vêtement' },
    { cle: 'playfulspin',      t: 'Tourne sur elle-même' },
    { cle: 'random',           t: 'Au hasard' }
  ];
  var POSE_SEL = '34turn';

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès au traitement d’image.',
    photo_absente:      'Importez d’abord une photo.',
    non_configure:      'Aucune clé Photoroom configurée (Configuration ▸ Clés API).',
    indisponible:       'Le service n’est pas prêt dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée. Rechargez (Ctrl+R) ; si cela revient, reconnectez-vous.',
    version_coquille:   'Cette version de l’application ne sait pas encore ouvrir cet écran.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    return (MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').'))
      + (r && r.detail ? ' (' + esc(r.detail) + ')' : '');
  }
  function appeler(op, args){
    var p;
    try { p = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { return Promise.resolve({ ok: false, motif: 'pont_indisponible' }); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ ok: false, motif: 'pont_indisponible' });
    return p.then(function(r){ return r || { ok: false, motif: 'echec' }; })
            .catch(function(e){ return { ok: false, motif: 'echec', detail: (e && e.message) || e }; });
  }

  // Réduction locale avant l envoi : un cliché de téléphone pèserait plusieurs Mo
  // sur le pont. 3000 px sur le grand côté suffit (Photoroom rend 1K a 4K), et le
  // fond studio étant opaque, le JPEG ne coûte aucune transparence.
  function reduire(dataUrl, cb){
    try {
      var im = new Image();
      im.onload = function(){
        try {
          var max = 3000, w = im.naturalWidth, h = im.naturalHeight;
          var ech = Math.min(1, max / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * ech)), chh = Math.max(1, Math.round(h * ech));
          var c = document.createElement('canvas'); c.width = cw; c.height = chh;
          c.getContext('2d').drawImage(im, 0, 0, cw, chh);
          cb(c.toDataURL('image/jpeg', 0.92));
        } catch (e) { cb(dataUrl); }
      };
      im.onerror = function(){ cb(dataUrl); };
      im.src = dataUrl;
    } catch (e) { cb(dataUrl); }
  }

  function majBoutons(){
    var pret = aUnePhoto() && !!PRESET && !RO && !OCCUPE;
    bApercu.disabled = !pret;
    bFinal.disabled = !pret;
    if (!pret && ARME) { ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité'; }
  }

  function aUnePhoto(){ return !!PHOTO || !!PHOTO_ID; }

  /* ══ LE SUIVI DES LOTS ════════════════════════════════════════════════════
     Sa demande : voir << lot xxxxx — photo 15 sur 500 >>, pouvoir arreter,
     mettre en pause, reprendre LA OU C ETAIT RENDU, en placer plusieurs en
     file, et donner une priorite.

     ⚠ ARRETER N EFFACE RIEN : ce qui est fait reste fait, et le reste est
     repris tel quel si l on change d avis. Seul << Retirer >> efface le lot de
     la liste — et il refuse tant que le lot tourne. */
  var LOTS = null, LOTS_VUE = false, LOTS_T = null;

  var LOT_ETATS = { file: 'En file', encours: 'En cours', pause: 'En pause',
    fini: 'Terminé', arrete: 'Arrêté' };

  function lotsHtml(){
    if (!LOTS) return '<div class="vide">Lecture des traitements…</div>';
    var l = LOTS.lots || [];
    if (!l.length) {
      return '<div class="vide">Aucun traitement. Choisissez des photos depuis la '
        + 'photothèque, puis « Traiter en lot ».</div>';
    }
    return l.map(function(x){
      var fait = x.faits + x.echecs;
      var pct = x.total ? Math.round((fait / x.total) * 100) : 0;
      var g = '';
      if (LOTS.peutModifier) {
        if (x.etat === 'encours' || x.etat === 'file') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="pause">⏸ Pause</button>';
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="arreter">⏹ Arrêter</button>';
        }
        if ((x.etat === 'pause' || x.etat === 'arrete') && x.restants) {
          g += '<button class="jeton prim" data-lot="' + esc(x.id) + '" data-geste="reprendre">▶ Reprendre</button>';
        }
        if (x.etat === 'encours' || x.etat === 'file' || x.etat === 'pause') {
          g += '<button class="jeton' + (x.priorite ? ' on' : '') + '" data-lot="' + esc(x.id)
            + '" data-geste="priorite" data-val="' + (x.priorite ? '0' : '1') + '">'
            + (x.priorite ? '★ Prioritaire' : '☆ Prioriser') + '</button>';
        }
        if (x.etat !== 'encours') {
          g += '<button class="jeton" data-lot="' + esc(x.id) + '" data-geste="retirer">✕ Retirer</button>';
        }
      }
      return '<div class="lotc' + (x.etat === 'encours' ? ' vif' : '') + '">'
        + '<div class="lott"><strong>' + esc(x.nom) + '</strong>'
        + '<span class="pill ' + (x.etat === 'fini' ? 'bon' : x.etat === 'encours' ? 'acc'
            : x.etat === 'arrete' ? 'err' : 'neutre') + '">' + (LOT_ETATS[x.etat] || x.etat) + '</span>'
        + (x.priorite ? '<span class="pill acc">★ Priorité</span>' : '')
        + '<span class="dt">' + esc(x.quoiLibelle) + '</span></div>'
        + '<div class="jauge"><i style="width:' + pct + '%"></i></div>'
        + '<div class="lotd">'
        // ⚠ << photo 15 sur 500 >>, et QUELLE photo : sans le nom, un lot bloque
        // sur une image abimee ne se diagnostique pas.
        + '<span>' + (x.etat === 'encours' && x.courant
            ? ('Photo ' + (fait + 1) + ' sur ' + x.total + ' — ' + esc(x.courant.nom))
            : (fait + ' sur ' + x.total)) + '</span>'
        + (x.echecs ? '<span class="mal">' + x.echecs + ' échec' + (x.echecs > 1 ? 's' : '') + '</span>' : '')
        + '<span class="droite">' + g + '</span></div>'
        + (x.echecs && x.detailEchecs.length
            ? '<div class="lote">' + x.detailEchecs.map(function(e){
                return esc(e.nom) + ' : ' + esc(String(e.detail).slice(0, 80)); }).join(' · ') + '</div>'
            : '')
        + '</div>';
    }).join('');
  }

  function chargerLots(){
    appeler('lots:etat', []).then(function(r){
      if (!r || !r.ok) return;
      LOTS = r;
      if (LOTS_VUE) dessiner();
    });
  }

  function lotsSuivre(){
    if (LOTS_T) return;
    chargerLots();
    LOTS_T = setInterval(function(){ if (LOTS_VUE && !document.hidden) chargerLots(); }, 2000);
  }
  window.addEventListener('pagehide', function(){ if (LOTS_T) { clearInterval(LOTS_T); LOTS_T = null; } });

  function brancherLots(){
    corps.querySelectorAll('[data-lot]').forEach(function(el){
      el.onclick = function(){
        el.disabled = true;
        appeler('lots:agir', [el.getAttribute('data-lot'), el.getAttribute('data-geste'),
          el.getAttribute('data-val')]).then(function(r){
          if (!r.ok) { el.disabled = false; dire(expliquer(r), 'err'); return; }
          chargerLots();
        });
      };
    });
    var f = document.getElementById('lots-fermer');
    if (f) f.onclick = function(){ LOTS_VUE = false; dessiner(); };
  }

  /* ══ LE PANIER VENU DE L EXPLORATEUR (#32) ═══════════════════════════════
     Sa demande : << la selection doit etre ramenee au studio virtuel, et l on
     execute le lot a cet endroit >>. L explorateur CHOISIT, le Studio DECIDE —
     c est ici qu on voit la voie, l ambiance et le modele, donc ici que le
     choix du traitement a du sens.
     ⚠ ON SONDE, on ne recoit pas : deux fenetres natives ne peuvent pas se
     parler. Le panier vit dans la page, les deux le lisent. */
  var PANIER = [];
  function panierHtml(){
    if (!PANIER.length) return '';
    var n = PANIER.length;
    return '<div class="panier"><div class="pt">'
      + '<strong>' + n + ' photo' + (n > 1 ? 's' : '') + '</strong> '
      + '<span class="dt">venue' + (n > 1 ? 's' : '') + ' de l’explorateur</span>'
      + '<button class="mini" id="pn-vider" title="Oublier cette sélection">✕</button></div>'
      + '<div class="pv">' + PANIER.slice(0, 8).map(function(p){
          return p.apercu ? '<img src="' + esc(p.apercu) + '" alt="" loading="lazy">'
                          : '<span class="tr"></span>'; }).join('')
      + (n > 8 ? '<span class="pl">+' + (n - 8) + '</span>' : '') + '</div>'
      + '<button class="prim" id="pn-lot">⚙ Traiter ' + (n > 1 ? ('ces ' + n) : 'cette photo') + ' en lot…</button>'
      + '</div>';
  }

  function chargerPanier(){
    appeler('panier:lire', []).then(function(r){
      if (!r || !r.ok) return;
      var avant = PANIER.length;
      PANIER = r.photos || [];
      // On ne redessine que si ca a change : sinon on redessinerait toutes les
      // deux secondes sous les doigts de quelqu un.
      if (PANIER.length !== avant && !PICKER && !LOTS_VUE) dessiner();
    });
  }

  function depotHtml(){
    // Le suivi des lots prend toute la colonne : c est un ecran, pas un encart.
    if (LOTS_VUE) {
      return '<div class="phbarre"><button id="lots-fermer">← Retour</button>'
        + '<span class="phinfo">Traitements par lot</span></div>'
        + '<div class="lots">' + lotsHtml() + '</div>';
    }
    // Une photo est déjà choisie (fichier OU photothèque) : on la montre.
    if (aUnePhoto()) {
      var apercu = PHOTO || PHOTO_URL;
      var vue = apercu
        ? '<img src="' + apercu + '" alt="photo">'
        : '<span class="gros">🖼️</span><span>Photo de la photothèque sélectionnée</span>';
      return '<div class="depot" id="depot">' + vue
        + '<span class="refaire">Choisir une autre photo</span></div>'
        + '<input type="file" id="fichier" accept="image/*" hidden>';
    }
    // Le choix dans la photothèque est ouvert : recherche + grille de vignettes,
    // chargée par pages (défilement infini) pour tenir des milliers de photos.
    if (PICKER) {
      var grille = '<div class="phgrille" id="ph-grille">' + phVignettesHtml() + '</div>';
      return '<div class="phbarre"><button id="ph-retour">← Retour</button>'
        + '<input type="search" id="ph-q" placeholder="Rechercher (nom, code, produit, SKU)…" value="' + esc(PH_Q) + '"'
        + (RO ? ' disabled' : '') + '>'
        + '<span class="phinfo" id="ph-info"></span></div>'
        + phFiltresHtml() + phSelectionHtml() + grille;
    }
    // Rien de choisi : dépôt de fichier + accès à la photothèque.
    return '<div class="depot" id="depot"><span class="gros">📷</span>'
      + '<span>Glissez une photo studio ici, ou cliquez pour choisir un fichier</span>'
      + '<span style="font-size:.7rem;color:#6d7f96">Fond blanc, un vêtement — JPEG ou PNG</span></div>'
      + '<input type="file" id="fichier" accept="image/*" hidden>'
      + '<div style="text-align:center;margin-top:.5rem;display:flex;gap:.4rem;justify-content:center">'
      + '<button id="ph-ouvrir">📚 Depuis la photothèque</button>'
      // ⚠ L EXPLORATEUR EST DANS SA PROPRE FENETRE (#32) : le selecteur
      // ci-contre reste pour prendre UNE photo vite fait, l explorateur sert a
      // en choisir des centaines — il lui faut de la place et un apercu.
      + '<button id="ph-explorateur" title="Parcourir la photothèque en grand, avec aperçu">'
      + '🗂️ Explorateur…</button>'
      // Le suivi reste joignable meme sans lot en cours : c est la qu on
      // retrouve ce qui s est termine, et les echecs a comprendre.
      + '<button id="lots-voir">⚙ Traitements'
      + ((LOTS && LOTS.lots && LOTS.lots.length) ? ' (' + LOTS.lots.length + ')' : '')
      + '</button></div>'
      + panierHtml();
  }

  function voiesHtml(){
    return VOIES.map(function(v){
      return '<div class="tuile' + (VOIE === v.cle ? ' on' : '') + '" data-voie="' + v.cle + '">'
        + '<span class="em">' + v.em + '</span><span class="t">' + esc(v.t) + '</span>'
        + '<span class="d">' + esc(v.d) + '</span></div>';
    }).join('');
  }

  function nomModele(m){ return m.charAt(0).toUpperCase() + m.slice(1); }
  function sigActuelle(){
    var p = PHOTO_ID || (PHOTO ? (PHOTO.length + ':' + PHOTO.slice(0, 40)) : '');
    return p + '|' + PRESET;
  }
  function portraitsFaits(){
    var n = 0;
    for (var i = 0; i < MODELES.length; i++) { if (PORTRAITS[MODELES[i]]) n++; }
    return n;
  }
  /* Ce qu on montre pour un mannequin, par ordre de preference :
       1. l apercu de VOTRE vetement (le plus utile pour juger) ;
       2. son portrait persistant (le temoin, relu de R2 — gratuit) ;
       3. un carre d attente qui DIT ce qu il manque.
     ⚠ Une seule grille pour les deux : deux listes cote a cote obligeaient a
     choisir un mannequin dans l une en le regardant dans l autre. */
  function vignetteHtml(m){
    var mien = APM[m], port = PORTRAITS[m];
    var vis;
    if (mien)      vis = '<img src="' + mien + '" alt="' + esc(nomModele(m)) + '" loading="lazy">'
                       + '<span class="mtag">votre photo</span>';
    else if (port) vis = '<img src="' + esc(port) + '" alt="' + esc(nomModele(m)) + '" loading="lazy">';
    else           vis = '<span class="matt">portrait<br>à venir</span>';
    return '<div class="mvig' + (MODELE_SEL === m ? ' on' : '') + '" data-mod="' + esc(m) + '"'
      + ' title="' + esc(nomModele(m)) + '">' + vis
      + (MODELE_SEL === m ? '<span class="mcoche">✓</span>' : '')
      + '<span class="mnom">' + esc(nomModele(m)) + '</span></div>';
  }
  function grilleModelesHtml(){
    return '<div class="mgrille" id="mgrille">'
      + MODELES.map(vignetteHtml).join('') + '</div>';
  }
  function modeleHtml(){
    if (VOIE !== 'humain') return '';
    // ⚠ Retour au MENU DÉROULANT (demande du 2026-08-12) : la galerie de vignettes
    // est retirée. Les aperçus par mannequin sortaient identiques et n'aidaient pas
    // au choix ; le nom suffit. Le modèle et la pose se choisissent dans deux listes.
    var h = '<div class="ch"><label>Pose</label>'
      + '<select id="pose"' + (RO ? ' disabled' : '') + '>'
      + POSES.map(function(p){ return '<option value="' + p.cle + '"'
          + (POSE_SEL === p.cle ? ' selected' : '') + '>' + esc(p.t) + '</option>'; }).join('')
      + '</select>'
      + '<div class="aide" style="margin-top:.25rem;font-size:.7rem;color:#6d7f96">'
      + 'L’aperçu est gratuit : essayez-en plusieurs avant de générer.</div></div>';
    h += '<div class="ch"><label>Modèle</label>'
      + '<select id="modele-sel"' + (RO ? ' disabled' : '') + '>'
      + MODELES.map(function(m){ return '<option value="' + esc(m) + '"'
          + (MODELE_SEL === m ? ' selected' : '') + '>' + esc(nomModele(m)) + '</option>'; }).join('')
      + '</select></div>';
    return h;
  }
  // Redessine UNE vignette sans toucher au reste (on ne casse ni le défilement
  // de la grille, ni le focus, pendant une fabrication qui dure).
  function majVig(m){
    var v = corps.querySelector('[data-mod="' + m + '"]');
    if (!v) return;
    var neuf = document.createElement('div');
    neuf.innerHTML = vignetteHtml(m);
    var rempl = neuf.firstChild;
    if (rempl) { v.parentNode.replaceChild(rempl, v); brancherVignettes(); }
  }
  function brancherVignettes(){
    corps.querySelectorAll('[data-mod]').forEach(function(el){
      el.onclick = function(){ choisirModele(el.getAttribute('data-mod')); };
    });
  }

  function ambiancesHtml(){
    if (!PRESETS.length) return '<div class="vide">Aucune ambiance.</div>';
    return '<div class="tuiles amb">' + PRESETS.map(function(p){
      return '<div class="tuile' + (PRESET === p.cle ? ' on' : '') + '" data-preset="' + esc(p.cle) + '">'
        + '<span class="em">' + (p.emoji || '🎨') + '</span><span class="t">' + esc(p.label) + '</span>'
        + '<span class="d">' + esc(p.desc || '') + '</span></div>';
    }).join('') + '</div>';
  }

  function resultatHtml(){
    if (!RESULT) return '<div class="vide">L’image apparaîtra ici. Commencez par un <strong>aperçu gratuit</strong>.</div>';
    var h = '<img src="' + RESULT.image + '" alt="résultat">';
    if (RESULT.essai) h += '<div class="filig">⚠ Aperçu filigrané (sandbox) — gratuit. « Générer en pleine qualité » retire le filigrane.</div>';
    if (RESULT.decorErreur) h += '<div class="filig">⚠ Le décor n’a pas pu être appliqué : ' + esc(RESULT.decorErreur) + '</div>';
    if (RESULT.upNote) h += '<div class="avis">' + esc(RESULT.upNote) + '</div>';
    if (RESULT.largeur) h += '<div class="dims">' + RESULT.largeur + ' × ' + RESULT.hauteur + ' px</div>';
    h += '<div class="dl"><button id="b-dl">Télécharger l’image</button> '
      + '<button id="b-save"' + (ENREG ? ' disabled' : '') + '>' + (ENREG ? '✓ Dans la photothèque' : '💾 Enregistrer dans la photothèque') + '</button></div>';
    return h;
  }

  function dessiner(){
    var av = document.getElementById('ro'); if (av) av.hidden = !RO;
    var h = [];
    h.push('<div class="carte"><h2>1 · Photo</h2>'
      + '<p class="sous">La photo de départ, prise en studio sur fond blanc.</p>' + depotHtml() + '</div>');
    h.push('<div class="carte"><h2>2 · Voie</h2>'
      + '<p class="sous">Comment mettre le vêtement en valeur.</p>'
      + '<div class="tuiles">' + voiesHtml() + '</div>' + modeleHtml() + '</div>');
    h.push('<div class="carte large"><h2>3 · Ambiance</h2>'
      + '<p class="sous">Un clic règle décor, ombre ancrée et lumière. Réglable au besoin plus tard.</p>'
      + ambiancesHtml() + '</div>');
    h.push('<div class="carte large res" id="res">' + resultatHtml() + '</div>');
    corps.innerHTML = h.join('');
    brancher();
    majBoutons();
  }

  function brancher(){
    var depot = document.getElementById('depot');
    var fichier = document.getElementById('fichier');
    if (depot && fichier && !RO && !aUnePhoto()) {
      depot.onclick = function(){ fichier.click(); };
      depot.ondragover = function(e){ e.preventDefault(); depot.classList.add('survol'); };
      depot.ondragleave = function(){ depot.classList.remove('survol'); };
      depot.ondrop = function(e){ e.preventDefault(); depot.classList.remove('survol');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) lireFichier(e.dataTransfer.files[0]); };
      fichier.onchange = function(){ if (fichier.files && fichier.files[0]) lireFichier(fichier.files[0]); };
    }
    // « Choisir une autre photo » : on repart de zéro.
    if (depot && aUnePhoto() && !RO) { depot.onclick = function(){ reinitPhoto(); }; }
    var phO = document.getElementById('ph-ouvrir'); if (phO) phO.onclick = ouvrirPicker;
    var px = document.getElementById('ph-explorateur');
    if (px) px.onclick = function(){
      appeler('explorateur:ouvrir', []).then(function(r){
        dire(r && r.ok ? 'Explorateur ouvert dans sa fenêtre.' : expliquer(r),
          (r && r.ok) ? 'bon' : 'err');
      });
    };
    var lv = document.getElementById('lots-voir');
    if (lv) lv.onclick = function(){ LOTS_VUE = true; chargerLots(); dessiner(); };
    var pnv = document.getElementById('pn-vider');
    if (pnv) pnv.onclick = function(){
      appeler('panier:vider', []).then(function(){ PANIER = []; dessiner(); });
    };
    var pnl = document.getElementById('pn-lot');
    if (pnl) pnl.onclick = function(){
      // Le meme voile que depuis le selecteur : une seule facon de lancer.
      SEL = {};
      PANIER.forEach(function(p){ SEL[p.id] = true; });
      ouvrirLotVoile();
    };
    brancherLots();
    var phR = document.getElementById('ph-retour'); if (phR) phR.onclick = function(){ PICKER = false; PHOTHQ = []; PH_Q = ''; dessiner(); };
    var phQ = document.getElementById('ph-q');
    if (phQ) {
      phQ.oninput = function(){ phRecherche(phQ.value); };
      phQ.onsearch = function(){ if (PH_DEB) { clearTimeout(PH_DEB); PH_DEB = null; } PH_Q = String(phQ.value || '').trim(); PH_PAGE = 0; PH_FIN = false; phChargerPage(true); };
    }
    var phG = document.getElementById('ph-grille');
    if (phG) {
      phBrancherVignettes(phG);
      phG.onscroll = function(){
        if (PH_OCC || PH_FIN) return;
        if (phG.scrollTop + phG.clientHeight >= phG.scrollHeight - 120) phChargerPage(false);
      };
      majPhInfo();
    }
    brancherExplorateur();
    corps.querySelectorAll('[data-voie]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; VOIE = el.getAttribute('data-voie'); RESULT = null; dessiner();
        dire('Voie : ' + VOIE + '.', 'att'); };
    });
    corps.querySelectorAll('[data-preset]').forEach(function(el){
      el.onclick = function(){ if (RO || OCCUPE) return; PRESET = el.getAttribute('data-preset'); dessiner(); };
    });
    var ps = document.getElementById('pose');
    /* ⚠ La pose change ce que le rendu montre : le cache des apercus par modele
       (APM) porte donc sur une pose donnee. On le vide, sinon la grille
       garderait les silhouettes de l ancienne pose. */
    if (ps) ps.onchange = function(){
      POSE_SEL = ps.value;
      APM = {}; APM_SIG = '';
      dessiner();
      dire('Pose : ' + (POSES.filter(function(p){ return p.cle === POSE_SEL; })[0] || {}).t + '.', 'att');
    };
    var msel = document.getElementById('modele-sel');
    if (msel) msel.onchange = function(){ choisirModele(msel.value); };
    // Anciens boutons de galerie retirés (menu déroulant) ; gardes conservées au
    // cas où un rendu partiel les ramènerait.
    var bm = document.getElementById('b-mgen');
    if (bm) bm.onclick = genererApercusModeles;
    var bp = document.getElementById('b-port');
    if (bp) bp.onclick = fabriquerPortraits;
    var br = document.getElementById('b-port-refaire');
    if (br) br.onclick = refairePortraits;
    brancherVignettes();
    var dl = document.getElementById('b-dl');
    if (dl && RESULT) dl.onclick = telecharger;
    var sv = document.getElementById('b-save');
    if (sv && RESULT) sv.onclick = enregistrerResultat;
  }

  /* ⚠ ON NE REDESSINE PAS TOUT, et surtout on n arrete plus la fabrication en
     cours. Choisir un mannequin pendant que les portraits se fabriquent est
     naturel — l ancienne version arretait la generation a ce clic, ce qui
     laissait la liste a moitie remplie sans le dire. */
  function choisirModele(m){
    var av = MODELE_SEL;
    MODELE_SEL = m;
    if (av !== m) dire('Modèle : ' + nomModele(m) + '.', 'bon');
  }

  /* ══ PORTRAITS PERSISTANTS ═════════════════════════════════════════════════
     Un appel PAR mannequin (seize traitements d image dans un seul appel
     depasseraient le delai du pont), et chaque portrait est depose dans R2 des
     qu il est pret : si la fabrication est interrompue a mi-chemin, ce qui est
     deja fait est deja garde. Rouvrir la fenetre ne refabrique QUE ce qui
     manque — c est ce qui fait qu on ne repaye jamais pour regarder la liste. */
  function fabriquerPortraits(){
    if (PORT_OCC) { PORT_STOP = true; dire('Arrêt demandé…', 'att'); return; }
    if (RO || OCCUPE) return;
    var todo = MODELES.filter(function(m){ return !PORTRAITS[m]; });
    if (!todo.length) { dire('Les portraits sont déjà là.', 'att'); return; }
    PORT_OCC = true; PORT_STOP = false;
    bApercu.disabled = true; bFinal.disabled = true;
    dessiner();
    var i = 0, echecs = 0;
    function fini(msg, cl){
      PORT_OCC = false; bApercu.disabled = RO; bFinal.disabled = RO;
      dessiner(); majBoutons(); dire(msg, cl);
    }
    function suite(){
      if (PORT_STOP) { fini('Arrêté — les portraits déjà faits sont gardés.', 'att'); return; }
      if (i >= todo.length) {
        fini(echecs ? ('Portraits prêts, sauf ' + echecs + '. Recliquez pour reprendre.')
                    : 'Portraits prêts — cliquez celui qui vous plaît.',
             echecs ? 'att' : 'bon');
        return;
      }
      var m = todo[i]; i++;
      dire('Portrait ' + i + '/' + todo.length + ' — ' + nomModele(m) + '…');
      appeler('studio:modeleGenerer', [{ modele: m }]).then(function(r){
        if (r && r.ok && r.vignette) { PORTRAITS[m] = r.vignette; majVig(m); }
        else {
          echecs++;
          /* Un motif qui ne se corrigera pas tout seul arrête la série : enchaîner
             quinze échecs identiques ne dit rien de plus que le premier. */
          if (r && (r.motif === 'phototheque_vide' || r.motif === 'non_configure'
                 || r.motif === 'droit' || r.motif === 'session')) {
            fini(expliquer(r), 'err'); return;
          }
        }
        suite();
      });
    }
    suite();
  }

  function refairePortraits(){
    if (PORT_OCC || RO || OCCUPE) return;
    dire('Retrait des anciens portraits…');
    appeler('studio:modelesVider').then(function(r){
      if (!r || !r.ok) { dire(expliquer(r), 'err'); return; }
      PORTRAITS = {};
      dessiner();
      fabriquerPortraits();
    });
  }

  // Génère (ou arrête) les aperçus SANDBOX du vêtement sur chaque modèle. Séquentiel
  // (le pont porte une image à la fois), avec progression et arrêt.
  var COMPARE_OCC = false;
  function genererApercusModeles(){
    if (COMPARE_OCC) { COMPARE_STOP = true; return; }   // 2e clic = Arrêter
    if (RO || OCCUPE || !aUnePhoto()) return;
    if (APM_SIG !== sigActuelle()) { APM = {}; APM_SIG = sigActuelle(); }
    var todo = MODELES.filter(function(m){ return !APM[m]; });
    if (!todo.length) { dire('Tous les aperçus sont déjà générés — cliquez un modèle.', 'att'); return; }
    COMPARE_OCC = true; COMPARE_STOP = false;
    bApercu.disabled = true; bFinal.disabled = true;
    /* ⚠ LE LIBELLÉ NE VIT QU'À UN ENDROIT (modeleHtml). L'écrire aussi ici
       remettait « Générer les aperçus » alors que le bouton s'appelle autrement
       depuis la refonte — un bouton qui se contredit d'un clic à l'autre. */
    var bm = document.getElementById('b-mgen'); if (bm) bm.textContent = 'Arrêter';
    var i = 0;
    function fini(msg, cl){
      COMPARE_OCC = false; bApercu.disabled = RO; bFinal.disabled = RO;
      dessiner(); majBoutons(); dire(msg, cl);
    }
    function suite(){
      if (COMPARE_STOP) { fini('Arrêté.', 'att'); return; }
      if (i >= todo.length) { fini('Aperçus prêts — cliquez le modèle qui vous plaît.', 'bon'); return; }
      var m = todo[i]; i++;
      dire('Aperçu ' + i + '/' + todo.length + ' — ' + nomModele(m) + '…');
      var s = { geste: 'humain', preset: PRESET, apercu: true,
                options: { modele: m, pose: POSE_SEL } };
      if (PHOTO_ID) s.photoId = PHOTO_ID; else s.image = PHOTO;
      appeler('studio:traiter', [s]).then(function(r){
        if (r && r.ok && r.image) { APM[m] = r.image; majVig(m); }
        suite();
      });
    }
    suite();
  }

  function reinitPhoto(){
    PHOTO = null; PHOTO_ID = ''; PHOTO_URL = ''; PICKER = false; RESULT = null; ENREG = false;
    dessiner();
  }

  function lireFichier(f){
    if (!f || String(f.type).indexOf('image/') !== 0) { dire('Ce n’est pas une image.', 'err'); return; }
    dire('Lecture de la photo…');
    var fr = new FileReader();
    fr.onload = function(){ reduire(String(fr.result || ''), function(petite){
      PHOTO = petite; PHOTO_ID = ''; PHOTO_URL = ''; PICKER = false; RESULT = null; ENREG = false;
      dessiner(); dire('Photo prête.', 'bon'); }); };
    fr.onerror = function(){ dire('Lecture impossible.', 'err'); };
    fr.readAsDataURL(f);
  }

  // Grille de vignettes (partagee : rendu initial + rafraichissements de page).
  function phVignettesHtml(){
    if (!PHOTHQ.length) {
      /* ⚠ TROIS ETATS, PAS DEUX. << Pas encore charge >> n est PAS << vide >> :
         la synchronisation peut n avoir pas encore repondu, et annoncer
         << Photothèque vide >> a ce moment-la fait croire que la mediatheque a
         ete perdue — le message le plus inquietant possible sur des photos.
         Le site fait deja voyager l etat charge ; cette fenetre l ignorait. */
      if (!PH_CHARGE) {
        return '<div class="vide" style="grid-column:1/-1">Lecture de la photothèque…</div>';
      }
      return '<div class="vide" style="grid-column:1/-1">'
        + (PH_Q ? 'Aucune photo ne correspond à « ' + esc(PH_Q) + ' ».'
                : 'Aucune photo dans la photothèque. Importez-en depuis l’écran Photothèque.') + '</div>';
    }
    return PHOTHQ.map(function(p){
      var img = p.apercu
        ? '<img src="' + esc(p.apercu) + '" alt="' + esc(p.nom) + '" loading="lazy">'
        : '<span class="attente">en cours…</span>';
      var pris = !!SEL[p.id];
      // Les pastilles disent ce qu on ne devine pas d une vignette : deja
      // traitee (donc deja payee), detouree, rattachee a un produit.
      var pastilles = '';
      if ((p.faits || []).length) pastilles += '<span class="pt fait" title="Déjà traitée">✓</span>';
      if (p.isole) pastilles += '<span class="pt" title="Détourée">◇</span>';
      if (p.lieId) pastilles += '<span class="pt" title="' + esc(p.lieNom || 'Produit lié') + '">🔗</span>';
      return '<div class="phvig' + (pris ? ' pris' : '') + '" data-ph="' + esc(p.id) + '"'
        + ' title="' + esc(p.nom) + (p.lieNom ? ' — ' + esc(p.lieNom) : '') + '">'
        + '<span class="phcoche" data-sel="' + esc(p.id) + '">' + (pris ? '✓' : '') + '</span>'
        + (pastilles ? '<span class="phpast">' + pastilles + '</span>' : '')
        + img + '<span class="phnom">' + esc(p.nom) + '</span></div>';
    }).join('');
  }

  /* ══ LES FILTRES (#28) ════════════════════════════════════════════════════
     Le selecteur n offrait qu une recherche texte : pour choisir vingt photos
     parmi quatre cents, il fallait les reconnaitre a l oeil. Le coeur du site
     savait deja tout cela de chaque photo — ce n etait simplement pas offert. */
  function phFiltresHtml(){
    if (!PH_META) return '';
    var jeton = function(cle, nom){
      return '<button class="jeton' + (PH_FILTRES.indexOf(cle) >= 0 ? ' on' : '') + '"'
        + ' data-filtre="' + esc(cle) + '">' + esc(nom) + '</button>';
    };
    var h = '<div class="phfiltres">'
      + (PH_META.filtres || []).map(function(f){ return jeton(f.cle, f.nom); }).join('');
    // Le filtre le plus utile : ce qui n a PAS encore recu tel traitement.
    // Retraiter une photo deja faite coute un appel pour rien.
    h += '<select id="ph-sans"><option value="">Traitement — tous</option>'
      + (PH_META.traitements || []).map(function(t){
          return '<option value="' + esc(t.cle) + '"' + (PH_SANS === t.cle ? ' selected' : '')
            + '>Sans « ' + esc(t.nom) + ' »</option>'; }).join('') + '</select>';
    if ((PH_META.lots || []).length) {
      h += '<select id="ph-lot"><option value="">Tous les lots</option>'
        + PH_META.lots.map(function(l){
            return '<option value="' + esc(l.cle) + '"' + (PH_LOT === l.cle ? ' selected' : '')
              + '>' + esc(l.nom) + '</option>'; }).join('') + '</select>';
    }
    h += '<select id="ph-tri">'
      + [['recent', 'Plus récentes'], ['code', 'Code'], ['name', 'Nom'],
         ['linked', 'Liées d’abord'], ['size', 'Plus lourdes']].map(function(t){
          return '<option value="' + t[0] + '"' + (PH_TRI === t[0] ? ' selected' : '') + '>'
            + t[1] + '</option>'; }).join('') + '</select>';
    if (PH_FILTRES.length || PH_SANS || PH_LOT || PH_Q) {
      h += '<button class="jeton" id="ph-vider">✕ Tout effacer</button>';
    }
    return h + '</div>';
  }

  /* Le panier de selection : ce qu on emporte, visible AVANT de lancer quoi
     que ce soit. ⚠ << Tout selectionner >> porte sur TOUT LE RESULTAT du
     filtre, pas sur la page affichee — sinon il faudrait defiler six pages
     pour prendre 340 photos. Le coeur envoie exprès les identifiants. */
  function phSelectionHtml(){
    var n = Object.keys(SEL).length;
    var dispo = (PH_META && PH_META.tousLesIds) ? PH_META.tousLesIds.length : 0;
    return '<div class="phsel">'
      + '<span class="cpt' + (n ? ' on' : '') + '">' + (n ? n + ' photo' + (n > 1 ? 's' : '') + ' choisie' + (n > 1 ? 's' : '') : 'Aucune sélection') + '</span>'
      + '<button class="jeton" id="ph-tout"' + (dispo ? '' : ' disabled') + '>Tout sélectionner (' + dispo + ')</button>'
      + '<button class="jeton" id="ph-inv"' + (dispo ? '' : ' disabled') + '>Inverser</button>'
      + '<button class="jeton" id="ph-rien"' + (n ? '' : ' disabled') + '>Vider</button>'
      + '<span class="droite">'
      /* ⚠ ph-ouvrir-sel, PAS ph-ouvrir : ce dernier est le bouton
         « Depuis la photothèque » de l'écran de départ. Le doublon d'identifiant
         a fait que mon câblage écrasait le sien — et le bouton d'entrée ne
         faisait plus rien. Un identifiant réutilisé ne casse rien de visible :
         il détourne, en silence. */
      + (n === 1 ? '<button class="jeton prim" id="ph-ouvrir-sel">Ouvrir cette photo →</button>' : '')
      + (n > 1 ? '<button class="jeton prim" id="ph-lot">⚙ Traiter ces ' + n + ' photos en lot…</button>' : '')
      + '</span></div>';
  }

  /* ══ LANCER UN LOT (#27) ══════════════════════════════════════════════════
     ⚠ ON ANNONCE CE QUE CA COUTE AVANT, PAS APRES. Chaque photo est un appel
     facture : lancer 500 photos sans le dire serait la pire surprise possible.
     Le choix << refaire celles deja traitees >> est DECOCHE par defaut — le
     coeur les ecarte, et les recompter demande un geste volontaire. */
  /* ⚠⚠ CETTE FONCTION MANQUAIT, ET C EST TOUT LE DEFAUT. ouvrirLotVoile
     l appelait depuis le debut ; elle n existait ni ici ni globalement. Le
     clic sur << Traiter ces N en lot... >> levait donc un ReferenceError et
     mourait la : aucune surcouche, aucun message, rien. Les deux chemins
     etaient touches (le panier venu de l explorateur ET la barre du
     selecteur) — le lot n a jamais pu partir depuis l ecran.
     ⚠ LECON : un helper copie d une fenetre a l autre se copie ENTIER, code
     ET habillage. Ici seuls les appels avaient suivi. */
  function voile(html, apres){
    var v = document.createElement('div');
    v.className = 'voile';
    v.innerHTML = '<div class="boite">' + html + '</div>';
    document.body.appendChild(v);
    var fermer = function(){ if (v.parentNode) v.parentNode.removeChild(v); };
    // Clic hors de la boite = annuler (rien n est lance tant qu on n a pas
    // clique << Lancer le lot >>).
    v.onclick = function(ev){ if (ev.target === v) fermer(); };
    if (apres) apres(fermer);
    return fermer;
  }

  function ouvrirLotVoile(){
    var ids = Object.keys(SEL);
    /* ⚠ UNE SEULE PHOTO EST UN LOT VALIDE. Le garde etait << moins de 2 >>,
       alors que le panier propose << Traiter cette photo en lot... >> des UNE
       photo : le bouton existait et ne faisait rien. Un lot d une photo garde
       tout son sens — il part en arriere-plan et se suit comme les autres. */
    if (!ids.length) return;
    var nP = ids.length;
    var opts = (PH_META && PH_META.traitements) || [
      { cle: 'detourage', nom: 'Détourage' }, { cle: 'fantome', nom: 'Mannequin retiré' },
      { cle: 'humain', nom: 'Porté par un mannequin' }];
    voile('<h3>⚙ Traiter ' + nP + ' photo' + (nP > 1 ? 's' : '') + ' en lot</h3>'
      + '<div class="ch"><label for="lot-quoi">Traitement à appliquer</label>'
      + '<select id="lot-quoi">' + opts.map(function(t){
          return '<option value="' + esc(t.cle) + '">' + esc(t.nom) + '</option>'; }).join('')
      + '</select></div>'
      + '<div class="ch"><label for="lot-nom">Nom du lot (pour le retrouver dans le suivi)</label>'
      + '<input id="lot-nom" placeholder="Collection automne — détourage"></div>'
      + '<label class="rc"><input type="checkbox" id="lot-prio"> '
      + '<span><strong>Priorité haute</strong> — ce lot passe devant ceux qui attendent.</span></label>'
      + '<label class="rc"><input type="checkbox" id="lot-refaire"> '
      + '<span><strong>Refaire celles déjà traitées.</strong> Par défaut elles sont écartées : '
      + 'les repasser coûte un appel chacune pour un résultat identique.</span></label>'
      + '<p style="color:#8fa1b8">Chaque photo est un appel facturé. Le lot part en arrière-plan : '
      + 'vous pouvez fermer cette fenêtre, le traitement continue et se suit depuis n’importe quel écran.</p>'
      + '<div class="fin2"><button id="v-non">Annuler</button>'
      + '<button class="prim" id="v-oui">Lancer le lot</button></div>',
      function(fermer){
        document.getElementById('v-non').onclick = fermer;
        document.getElementById('v-oui').onclick = function(){
          this.disabled = true;
          var g = function(i){ var e = document.getElementById(i); return e ? e.value : ''; };
          var c = function(i){ var e = document.getElementById(i); return !!(e && e.checked); };
          appeler('lots:creer', [{ ids: ids, quoi: g('lot-quoi'), nom: g('lot-nom'),
            priorite: c('lot-prio') ? 1 : 0, refaire: c('lot-refaire'), options: {} }]).then(function(r){
            fermer();
            if (!r.ok) {
              dire(r.motif === 'toutes_deja_faites'
                ? ('Ces ' + (r.deja || ids.length) + ' photos ont déjà ce traitement. Cochez « Refaire » pour les repasser.')
                : expliquer(r), 'err');
              return;
            }
            SEL = {};
            dire(r.nom + ' — ' + r.total + ' photo' + (r.total > 1 ? 's' : '') + ' en traitement'
              + (r.ignorees ? ' (' + r.ignorees + ' déjà faite' + (r.ignorees > 1 ? 's' : '') + ', écartée' + (r.ignorees > 1 ? 's' : '') + ')' : '')
              + '. Suivez-le en bas de n’importe quel écran.', 'bon');
            PICKER = false;
            LOTS_VUE = true;
            chargerLots();
          });
        };
      });
  }
  function majPhInfo(txt){
    var el = document.getElementById('ph-info');
    if (!el) return;
    if (txt != null) { el.textContent = txt; return; }
    if (PH_TOTAL <= 0) { el.textContent = PH_Q ? '0 résultat' : ''; return; }
    el.textContent = PHOTHQ.length + ' sur ' + PH_TOTAL + (PH_FIN ? '' : ' — défilez pour en voir plus');
  }
  // Rafraichit UNIQUEMENT la grille + le compteur (garde le focus dans la recherche).
  function phMajGrille(){
    var g = document.getElementById('ph-grille');
    if (g) { g.innerHTML = phVignettesHtml(); phBrancherVignettes(g); }
    majPhInfo();
  }

  /* ⚠⚠ LES EN-TETES SE REPEIGNENT AUSSI, ET C EST TOUT LE DEFAUT CORRIGE ICI.
     A l ouverture, la fenetre se dessine AVANT que la reponse arrive : les
     filtres et le panier sont donc rendus avec PH_META encore vide — donc
     aucun jeton, et << Tout selectionner (0) >> grise. Quand la reponse
     arrivait, on ne repeignait que la GRILLE : les en-tetes restaient figes
     sur l etat vide, pour toujours. L explorateur paraissait mort.
     ⚠ On repeint les DEUX blocs sans redessiner la page, pour ne pas voler le
     focus de la recherche pendant qu on tape. */
  function phMajEntetes(){
    var f = corps.querySelector('.phfiltres');
    if (f) f.outerHTML = phFiltresHtml();
    else {
      // Premiere apparition : le bloc n existait pas encore, on l insere
      // juste avant le panier.
      var s0 = corps.querySelector('.phsel');
      if (s0 && phFiltresHtml()) s0.insertAdjacentHTML('beforebegin', phFiltresHtml());
    }
    var s = corps.querySelector('.phsel');
    if (s) s.outerHTML = phSelectionHtml();
    brancherExplorateur();
  }
  /* ⚠ DEUX GESTES SUR UNE MEME VIGNETTE, ET IL FAUT LES DEUX : la COCHE
     ajoute au panier (on en prepare plusieurs), le reste de la vignette
     OUVRE la photo tout de suite (le geste courant, une photo a la fois).
     Confondre les deux forcerait a cocher puis valider pour un seul clic. */
  function brancherExplorateur(){
    // ⚠ RIEN A BRANCHER SI LE SELECTEUR EST FERME. Sans cette garde, on allait
    // chercher des identifiants qui n existent pas dans cet ecran — et l on
    // risquait d en accrocher un qui appartient a un autre bouton.
    if (!PICKER) return;
    corps.querySelectorAll('[data-filtre]').forEach(function(el){
      el.onclick = function(){
        var c = el.getAttribute('data-filtre');
        var i = PH_FILTRES.indexOf(c);
        if (i >= 0) PH_FILTRES.splice(i, 1); else PH_FILTRES.push(c);
        phRelancer();
      };
    });
    var s = document.getElementById('ph-sans');
    if (s) s.onchange = function(){ PH_SANS = s.value; phRelancer(); };
    var l = document.getElementById('ph-lot');
    if (l) l.onchange = function(){ PH_LOT = l.value; phRelancer(); };
    var t = document.getElementById('ph-tri');
    if (t) t.onchange = function(){ PH_TRI = t.value; phRelancer(); };
    var v = document.getElementById('ph-vider');
    if (v) v.onclick = function(){
      PH_FILTRES = []; PH_SANS = ''; PH_LOT = ''; PH_Q = '';
      var q = document.getElementById('ph-q'); if (q) q.value = '';
      phRelancer();
    };
    var tt = document.getElementById('ph-tout');
    if (tt) tt.onclick = function(){
      ((PH_META && PH_META.tousLesIds) || []).forEach(function(id){ SEL[id] = true; });
      phMajSelection();
    };
    var iv = document.getElementById('ph-inv');
    if (iv) iv.onclick = function(){
      ((PH_META && PH_META.tousLesIds) || []).forEach(function(id){
        if (SEL[id]) delete SEL[id]; else SEL[id] = true; });
      phMajSelection();
    };
    var rn = document.getElementById('ph-rien');
    if (rn) rn.onclick = function(){ SEL = {}; phMajSelection(); };
    var ov = document.getElementById('ph-ouvrir-sel');
    if (ov) ov.onclick = function(){
      var ids = Object.keys(SEL);
      if (ids.length === 1) choisirPhoto(ids[0]);
    };
    var lt = document.getElementById('ph-lot');
    if (lt) lt.onclick = ouvrirLotVoile;
  }

  /* ⚠ AUCUN REDESSIN COMPLET ICI : il volerait le focus
     de la recherche pendant qu on tape. Les en-tetes sont repeints par
     phMajEntetes quand la reponse arrive — ce qui suffit, et ne clignote
     pas. On repeint tout de suite les jetons pour que le clic se voie. */
  function phRelancer(){
    PH_PAGE = 0; PH_FIN = false;
    var f = corps.querySelector('.phfiltres');
    if (f) { f.outerHTML = phFiltresHtml(); brancherExplorateur(); }
    phChargerPage(true);
  }

  // Repeint le panier ET les coches, sans recharger la page de photos.
  function phMajSelection(){
    var z = corps.querySelector('.phsel');
    if (z) { z.outerHTML = phSelectionHtml(); brancherExplorateur(); }
    var g = document.getElementById('ph-grille');
    if (g) { g.innerHTML = phVignettesHtml(); phBrancherVignettes(g); }
  }

  function phBrancherVignettes(g){
    g.querySelectorAll('[data-sel]').forEach(function(el){
      el.onclick = function(ev){
        ev.stopPropagation();
        if (OCCUPE) return;
        var id = el.getAttribute('data-sel');
        if (SEL[id]) delete SEL[id]; else SEL[id] = true;
        phMajSelection();
      };
    });
    g.querySelectorAll('[data-ph]').forEach(function(el){
      el.onclick = function(){ if (OCCUPE) return; choisirPhoto(el.getAttribute('data-ph')); };
    });
  }
  // Charge une page. reset=true : nouvelle recherche (remplace) ; sinon : ajoute la suivante.
  function phChargerPage(reset){
    if (PH_OCC || RO) return;
    if (!reset && PH_FIN) return;
    PH_OCC = true;
    var page = reset ? 0 : (PH_PAGE + 1);
    majPhInfo(reset ? 'Recherche…' : 'Chargement…');
    /* ⚠ studio:explorer D ABORD, studio:phototheque EN REPLI : sur un site
       plus ancien la nouvelle op n existe pas, et la fenetre doit continuer de
       marcher — sans filtres, mais elle marche. */
    var saisie = { q: PH_Q, page: page, taille: PH_TAILLE, tri: PH_TRI,
      filtres: PH_FILTRES, sansTraitement: PH_SANS, lot: PH_LOT };
    appeler('studio:explorer', [saisie]).then(function(r){
      if (r && !r.ok && r.motif === 'operation_inconnue') {
        return appeler('studio:phototheque', [{ q: PH_Q, page: page, taille: PH_TAILLE }]);
      }
      return r;
    }).then(function(r){
      PH_OCC = false;
      if (!PICKER) return;
      if (!r || !r.ok) { dire(expliquer(r), 'err'); majPhInfo(''); return; }
      var lot = r.photos || [];
      PH_CHARGE = (r.charge !== false);
      if (r.filtres) PH_META = r;   // l explorateur repond ; sinon on garde l ancien
      PHOTHQ = reset ? lot : PHOTHQ.concat(lot);
      PH_PAGE = (r.page != null) ? r.page : page;
      PH_TOTAL = (r.total != null) ? r.total : PHOTHQ.length;
      PH_FIN = (PHOTHQ.length >= PH_TOTAL) || (lot.length === 0);
      phMajGrille();
      phMajEntetes();
      dire('');
      // La page etait pleine mais la grille ne deborde pas encore : on tire la suivante.
      if (!PH_FIN && reset) phPeutEtreEncore();
    });
  }
  // Si la grille n'est pas encore assez remplie pour defiler, charge une page de plus.
  function phPeutEtreEncore(){
    var g = document.getElementById('ph-grille');
    if (g && !PH_FIN && !PH_OCC && g.scrollHeight <= g.clientHeight + 4) phChargerPage(false);
  }
  function ouvrirPicker(){
    if (RO || OCCUPE) return;
    PICKER = true; PHOTHQ = []; PH_Q = ''; PH_PAGE = 0; PH_TOTAL = 0; PH_FIN = false; PH_OCC = false;
    dessiner(); dire('Chargement de la photothèque…');
    phChargerPage(true);
    var q = document.getElementById('ph-q'); if (q) { try { q.focus(); } catch (e) {} }
  }
  function phRecherche(v){
    if (PH_DEB) clearTimeout(PH_DEB);
    PH_DEB = setTimeout(function(){
      PH_DEB = null;
      PH_Q = String(v || '').trim();
      PH_PAGE = 0; PH_FIN = false;
      phChargerPage(true);
    }, 250);
  }

  function choisirPhoto(id){
    var p = null;
    for (var i = 0; i < PHOTHQ.length; i++) { if (PHOTHQ[i].id === id) { p = PHOTHQ[i]; break; } }
    if (!p) return;
    PHOTO = null; PHOTO_ID = id; PHOTO_URL = p.apercu || ''; PICKER = false; RESULT = null; ENREG = false;
    dessiner(); dire('Photo choisie : ' + (p.nom || id) + '.', 'bon');
  }

  function occuper(o){
    OCCUPE = o;
    corps.querySelectorAll('button, [data-voie], [data-preset], [data-ph], .depot').forEach(function(b){
      if (b.tagName === 'BUTTON') b.disabled = o; });
    majBoutons();
    var pret = aUnePhoto() && !!PRESET && !RO;
    bApercu.disabled = o || !pret;
    bFinal.disabled = o || !pret;
  }

  function saisie(apercu){
    var s = { geste: VOIE, preset: PRESET, apercu: apercu };
    if (PHOTO_ID) { s.photoId = PHOTO_ID; } else { s.image = PHOTO; }
    if (VOIE === 'humain') {
      var sel = document.getElementById('modele-sel');
      if (sel) MODELE_SEL = sel.value;   // le menu déroulant reste la source si présent
      s.options = { modele: MODELE_SEL || 'sophia', pose: POSE_SEL };
    }
    return s;
  }

  function enregistrerResultat(){
    if (!RESULT || !RESULT.image || OCCUPE) return;
    if (ENREG) { dire('Déjà enregistrée dans la photothèque.', 'att'); return; }
    occuper(true); dire('Enregistrement dans la photothèque…');
    appeler('studio:enregistrer', [{ image: RESULT.image, nom: 'studio-' + VOIE + '-' + PRESET }]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = true;
        var sv = document.getElementById('b-save');
        if (sv) { sv.textContent = '✓ Dans la photothèque'; sv.disabled = true; }
        dire('Enregistrée dans la photothèque — vous pouvez l’attacher à un article de là.', 'bon');
      } else dire(expliquer(r), 'err');
    });
  }

  function lancer(apercu){
    if (RO || OCCUPE) return;
    if (!aUnePhoto()) { dire('Importez d’abord une photo.', 'err'); return; }
    if (!PRESET) { dire('Choisissez une ambiance.', 'err'); return; }
    occuper(true);
    dire(apercu ? 'Aperçu gratuit en cours…' : 'Génération en pleine qualité…');
    appeler('studio:traiter', [saisie(apercu)]).then(function(r){
      occuper(false);
      if (r && r.ok) {
        ENREG = false;
        RESULT = { image: r.image, essai: !!r.essai, decorErreur: r.decorErreur || '',
                   upNote: r.upNote || '', largeur: r.largeur || 0, hauteur: r.hauteur || 0 };
        var res = document.getElementById('res');
        if (res) {
          res.innerHTML = resultatHtml();
          var dl = document.getElementById('b-dl'); if (dl) dl.onclick = telecharger;
          var sv = document.getElementById('b-save'); if (sv) sv.onclick = enregistrerResultat;
        }
        dire(apercu ? 'Aperçu prêt (gratuit).' : 'Image générée.', 'bon');
        if (!apercu) chargerCredits();
      } else {
        dire(expliquer(r), 'err');
      }
    });
  }

  // Aperçu : gratuit, part directement.
  bApercu.onclick = function(){ lancer(true); };
  // Pleine qualité : consomme des crédits → armement en deux temps.
  bFinal.onclick = function(){
    if (RO || OCCUPE) return;
    if (!ARME) {
      ARME = true; bFinal.className = 'prim conf'; bFinal.textContent = 'Confirmer (consomme des crédits)';
      dire('Un clic de plus lance un vrai rendu payant.', 'att');
      return;
    }
    ARME = false; bFinal.className = 'prim'; bFinal.textContent = 'Générer en pleine qualité';
    lancer(false);
  };

  function telecharger(){
    if (!RESULT || !RESULT.image) return;
    try {
      var a = document.createElement('a');
      a.href = RESULT.image;
      a.download = 'studio-' + VOIE + '-' + PRESET + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      dire('Téléchargement lancé.', 'bon');
    } catch (e) { dire('Téléchargement impossible.', 'err'); }
  }

  function chargerCredits(){
    appeler('studio:compte').then(function(r){
      if (!r || !r.ok) { creditsEl.textContent = ''; return; }
      var dispo = r.compte && r.compte.available != null ? r.compte.available : null;
      var sb = r.sandbox || {};
      var t = '';
      if (dispo != null) t += 'Crédits : <b>' + dispo + '</b>';
      if (sb.utilise != null) t += (t ? ' · ' : '') + 'Aperçus ce mois : ' + sb.utilise + (sb.quotaMois ? ' / ' + sb.quotaMois : '');
      creditsEl.innerHTML = t;
    });
  }

  function charger(){
    dire('Chargement des ambiances…');
    appeler('studio:presets').then(function(r){
      if (!r || !r.ok) {
        corps.innerHTML = '<div class="carte large"><div class="vide">' + expliquer(r) + '</div></div>';
        dire(expliquer(r), 'err');
        return;
      }
      PRESETS = r.presets || [];
      dessiner();
      dire('');
      chargerCredits();
      chargerPortraits();
    });
  }

  /* Les portraits déjà fabriqués : de simples ADRESSES relues de la base. Aucun
     appel à Photoroom, aucun crédit — c'est exactement le but du rangement dans
     R2. Si la lecture échoue, la grille reste utilisable (on peut toujours
     choisir un mannequin par son nom) : on ne bloque pas l'écran pour ça. */
  function chargerPortraits(){
    appeler('studio:modeles').then(function(r){
      if (!r || !r.ok) return;
      PORTRAITS = r.vignettes || {};
      if (VOIE === 'humain') dessiner();
    });
  }

  charger();
  lotsSuivre();
  chargerPanier();
  setInterval(function(){ if (!document.hidden) chargerPanier(); }, 2000);
  if (${explo ? 'true' : 'false'}) ouvrirPicker();
  if (${lotsDep ? 'true' : 'false'}) { LOTS_VUE = true; chargerLots(); }
})();
</script></body></html>`;
}

module.exports = { pageStudio };
