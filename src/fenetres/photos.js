'use strict';

/*
 * FENÊTRE « PHOTOS » — NATIVE (2.3.0)
 * =============================================================================
 * La médiathèque : importer, isoler le vêtement, choisir un fond, attacher la
 * photo à un article. C'est un écran d'IMPORT, pas de consultation — ce qui
 * entre par ici finit dans le stockage et parfois sur une fiche produit.
 *
 * ⚠ CE QUE CETTE FENÊTRE NE FAIT PAS, ET C'EST VOULU. Elle ne compresse pas,
 * ne dépose rien dans le stockage, ne numérote pas, n'écrit aucune fiche. Elle
 * lit un fichier, l'envoie au site, et affiche le verdict. Toute la règle vit
 * dans photos.js (cœurs sans DOM) : une seconde compression écrite ici aurait
 * fini par produire un autre format que celui de la boutique.
 *
 * ⚠ LES IMAGES NE VOYAGENT QUE DANS UN SENS. Vers le site : le fichier importé,
 * et le fond déposé à la main. Vers la fenêtre : des ADRESSES seulement — des
 * vignettes en base64 feraient passer plusieurs mégaoctets par le pont à chaque
 * rafraîchissement. Une photo dont le dépôt a échoué n'a donc pas d'aperçu, et
 * la fenêtre le DIT plutôt que de montrer un cadre vide.
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
input[type=search],select,button,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.3rem .55rem}
input[type=search]{min-width:200px}
select,button{cursor:pointer}
input:focus,select:focus,button:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.mini{padding:.12rem .42rem;font-size:.74rem}
button.actif{border-color:#c9a97e;background:rgba(201,169,126,.14)}
button.prim{background:#c9a97e;border-color:#c9a97e;color:#1a1208;font-weight:700}
button.prim:hover:not(:disabled){background:#d8bc95}
button.danger{border-color:rgba(239,68,68,.5);color:#f87171}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:11px;
  padding:.6rem .75rem}

/* Zone de depot : elle doit se voir SANS chercher — c est la porte principale. */
.depot{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:.3rem;border:2px dashed rgba(255,255,255,.2);
  border-radius:12px;padding:1.15rem 1rem;text-align:center;color:#8fa1b8;
  cursor:pointer;transition:border-color .13s,background .13s}
.depot:hover{border-color:#c9a97e}
.depot.survol{border-color:#c9a97e;background:rgba(201,169,126,.08)}
.depot .gros{font-size:.95rem;font-weight:600;color:#e8edf5}
.depot .pt{font-size:.76rem}

.stats{display:flex;gap:.5rem;flex-wrap:wrap}
.stats .s{flex:1 1 7rem;background:rgba(255,255,255,.04);border-radius:9px;padding:.4rem .6rem}
.stats .s .n{font:700 1.05rem/1.2 Georgia,serif;color:#c9a97e}
.stats .s .l{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}

table{width:100%;border-collapse:collapse;font-size:.84rem}
thead th{text-align:left;padding:.24rem .4rem;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.06em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(255,255,255,.04)}
tbody td{padding:.3rem .4rem;border-top:1px solid rgba(255,255,255,.055);vertical-align:middle}
tbody .num{font-weight:700;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}
tbody .dt{font-size:.72rem;color:#8fa1b8}
.vign{width:44px;height:44px;border-radius:7px;overflow:hidden;display:flex;
  align-items:center;justify-content:center;
  background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/12px 12px}
.vign img{max-width:100%;max-height:100%;object-fit:contain}
.vign .att{font-size:.6rem;color:#fbbf24;text-align:center;line-height:1.1}
.gain{font-size:.68rem;color:#4ade80;font-weight:700}
.pill{display:inline-block;font-size:.66rem;padding:.06rem .5rem;border-radius:99px;white-space:nowrap}
.pill.bon{background:rgba(34,197,94,.14);color:#4ade80}
.pill.att{background:rgba(245,158,11,.16);color:#fbbf24}
.pill.err{background:rgba(239,68,68,.14);color:#f87171}
.pill.neutre{background:rgba(148,163,184,.16);color:#8fa1b8}
.pagi{display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
  padding-top:.4rem;font-size:.74rem;color:#8fa1b8}
.vide{padding:1.2rem .6rem;text-align:center;color:#8fa1b8;font-size:.84rem}

/* ══════════════════════════════════════════════════════════════════════════
   L INSPECTEUR — a cote, plus par-dessus
   --------------------------------------------------------------------------
   ⚠⚠ UNE FENETRE MODALE CACHE CE QU ON COMPARE. On ouvre une photo pour la
   regarder AVEC les autres : verifier qu on isole la bonne, que le nom suit la
   serie, que le poids ressemble a ses voisines. Un voile noir sur toute la
   surface repond exactement le contraire — il isole la photo de son contexte,
   et il faut le fermer pour passer a la suivante.
   Le panneau se pose donc a DROITE, le tableau reste lisible, et l on passe
   d une ligne a l autre sans rien refermer.
   ⚠ LE TABLEAU SE DECALE, il ne passe pas dessous : un inspecteur qui recouvre
   la derniere colonne cache justement les boutons d action.
   ══════════════════════════════════════════════════════════════════════════ */
.voile{position:fixed;top:0;right:0;bottom:0;width:min(27rem,52vw);z-index:50;
  display:flex;background:#0b1220;border-left:1px solid rgba(255,255,255,.12);
  box-shadow:-16px 0 40px rgba(0,0,0,.45)}
.boite{background:#0b1220;border:0;border-radius:0;width:100%;
  overflow:auto;padding:.85rem .95rem}
body.insp .corps{padding-right:calc(min(27rem,52vw) + .6rem)}
body.insp .suivi{right:calc(min(27rem,52vw) + 1rem)}
@media (max-width:820px){
  /* Sous 820 px il n y a plus de place pour deux colonnes : l inspecteur
     reprend toute la largeur, et l on retombe sur le comportement d avant. */
  .voile{width:100%}
  body.insp .corps{padding-right:1.05rem}
  body.insp .suivi{right:1rem}
}
.boite h3{margin:0 0 .5rem;font:700 .98rem/1.3 Georgia,serif;display:flex;
  align-items:center;gap:.5rem;flex-wrap:wrap}
.boite .apercu{background:conic-gradient(#3a4354 25%,#2b3444 0 50%,#3a4354 0 75%,#2b3444 0) 0 0/14px 14px;
  border-radius:10px;min-height:14rem;max-height:24rem;display:flex;align-items:center;
  justify-content:center;margin-bottom:.7rem;overflow:hidden}
.boite .apercu img{max-width:100%;max-height:24rem;object-fit:contain}
.boite .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.5rem;
  padding:.55rem 0;border-top:1px solid rgba(255,255,255,.08);
  border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.6rem}
.boite .grille .l{font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.boite .grille .v{font-size:.84rem;font-weight:600;overflow-wrap:anywhere}
.jetons{display:flex;flex-wrap:wrap;gap:.3rem;margin:.15rem 0 .6rem}
.jetons button{font-size:.75rem;padding:.16rem .5rem}
.jetons button.on{border-color:#c9a97e;background:rgba(201,169,126,.16)}
.boite .pied-boite{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.75rem;justify-content:flex-end}
.choix{max-height:17rem;overflow:auto;margin-top:.5rem;display:flex;
  flex-direction:column;gap:.28rem}
.choix .p{display:flex;align-items:center;gap:.55rem;padding:.3rem .4rem;
  border:1px solid rgba(255,255,255,.09);border-radius:8px;cursor:pointer}
.choix .p:hover{border-color:#c9a97e;background:rgba(255,255,255,.04)}
.choix .p img{width:34px;height:34px;object-fit:cover;border-radius:6px;flex:0 0 auto}
.choix .p .creux{width:34px;height:34px;border-radius:6px;flex:0 0 auto;
  background:rgba(255,255,255,.06)}
.choix .p .nm{font-size:.84rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.choix .p .sk{font-size:.7rem;color:#8fa1b8}
.aide{font-size:.75rem;color:#8fa1b8;line-height:1.45}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;
  padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1 1 auto;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
/* Le SUIVI d import : une ligne par fichier, son etat, et ce qui lui arrive.
   ⚠ Un compteur << 3 / 12 >> dans le bandeau ne dit pas LESQUELLES ont echoue,
   ni pourquoi. Sur douze photos dont deux sont refusees, c est precisement ce
   qu on veut savoir. */
.suivi{position:fixed;right:1rem;bottom:3rem;width:min(26rem,calc(100vw - 2rem));
  max-height:60vh;display:flex;flex-direction:column;background:#16202f;
  border:1px solid rgba(201,169,126,.45);border-radius:11px;
  box-shadow:0 18px 44px rgba(0,0,0,.5);z-index:60}
.suivi .st{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;
  border-bottom:1px solid rgba(255,255,255,.08);font:700 .78rem/1.2 system-ui;
  text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8}
.suivi .st .n{margin-left:auto;font-weight:600;text-transform:none;letter-spacing:0}
.suivi .lst{flex:1 1 auto;overflow-y:auto;padding:.3rem .5rem .5rem}
.suivi .lg{display:flex;align-items:center;gap:.5rem;padding:.26rem .3rem;
  border-top:1px solid rgba(255,255,255,.05);font-size:.76rem}
.suivi .lg:first-child{border-top:0}
.suivi .lg{flex-wrap:wrap}
.suivi .lg .nm{flex:1 1 8rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Les etapes, sous le nom : ce que l import a REELLEMENT fait, avec ses
   chiffres. << 6,2 Mo vers 88 Ko >> se verifie ; << compression reussie >> non. */
.suivi .lg .ep{flex:1 0 100%;font-size:.68rem;color:#8fa1b8;padding-left:.1rem;
  display:flex;gap:.45rem;flex-wrap:wrap}
.suivi .lg .ep i{font-style:normal}
.suivi .lg .ep i.ok{color:#4ade80}
.suivi .lg .ep i.non{color:#fca5a5}
.suivi .lg .ep i.encours{color:#f0d6a0}
.suivi .lg .et{flex:0 0 auto;font-size:.68rem;font-weight:700;padding:.03rem .4rem;border-radius:99px}
.suivi .lg .et.attente{background:rgba(148,163,184,.16);color:#94a3b8}
.suivi .lg .et.cours{background:rgba(201,169,126,.2);color:#f0d6a0}
.suivi .lg .et.faite{background:rgba(34,197,94,.15);color:#4ade80}
.suivi .lg .et.double{background:rgba(234,179,8,.15);color:#facc15}
.suivi .lg .et.echec{background:rgba(248,113,113,.15);color:#fca5a5}
.suivi .pd{padding:.45rem .8rem;border-top:1px solid rgba(255,255,255,.08);
  display:flex;align-items:center;gap:.5rem;font-size:.74rem;color:#8fa1b8;flex-wrap:wrap}
.suivi .pd .bt{margin-left:auto;display:flex;gap:.4rem}
/* La barre de progression : elle avance par TACHE TERMINEE, jamais toute seule.
   Une barre qui glisse pendant qu il ne se passe rien est un mensonge poli. */
.suivi .jauge{flex:1 0 100%;height:5px;border-radius:99px;background:rgba(255,255,255,.1);
  overflow:hidden;margin:0 0 .1rem}
.suivi .jauge i{display:block;height:100%;background:linear-gradient(90deg,#c9a97e,#e0c9a6);
  border-radius:99px;transition:width .25s ease}
.suivi .pc{font-variant-numeric:tabular-nums;font-weight:700;color:#e8edf5}
.suivi.annule{border-color:rgba(248,113,113,.5)}
/* La barre de LOT : elle ne parait que s il y a un choix, et elle dit ce que
   les traitements engendrent — une image inventee n a pas la meme valeur qu une
   photo, et cela doit se lire avant de cliquer. */
.lot{position:sticky;bottom:0;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
  margin-top:.6rem;padding:.5rem .7rem;background:#16202f;
  border:1px solid rgba(201,169,126,.45);border-radius:11px}
.lot .cnt{font-weight:700;font-size:.8rem}
.lot .av{flex:1 0 100%;font-size:.7rem;color:#8fa1b8}
input.chx{width:auto;cursor:pointer;accent-color:#c9a97e}
/* ── LE CENTRE DE COMMANDE ─────────────────────────────────────────────── */
.cmd{display:flex;align-items:center;gap:.45rem;flex-wrap:wrap;
  padding:.5rem .6rem;background:#16202f;border:1px solid rgba(255,255,255,.07);
  border-radius:11px}
.cmd .droite{margin-left:auto;display:flex;gap:.4rem;align-items:center}
.cmd .sep{width:1px;height:1.3rem;background:rgba(255,255,255,.12);margin:0 .2rem}
.cmd input[type=search]{min-width:12rem}
.etat{font-size:.75rem;color:#8fa1b8;padding:0 .2rem}
.etat b{color:#e8edf5;font-variant-numeric:tabular-nums}
.etat .sp{opacity:.4;margin:0 .35rem}
/* ── LA GRILLE ─────────────────────────────────────────────────────────── */
table.grille tbody tr.on td{background:rgba(201,169,126,.1)}
table.grille tbody td{vertical-align:middle}
table.grille td.nom .txt{display:inline-block;max-width:18rem;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;cursor:text;border-bottom:1px dashed transparent}
table.grille td.nom .txt:hover{border-bottom-color:rgba(201,169,126,.6)}
table.grille input.ren{width:100%;min-width:10rem;font:inherit;padding:.15rem .35rem}
table.grille td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
/* Les actions : toujours visibles, jamais a chercher. Elles s eclairent au
   survol de la ligne pour ne pas crier en permanence. */
.act{display:flex;gap:.12rem;white-space:nowrap}
.act .ic{width:1.7rem;height:1.7rem;padding:0;font-size:.85rem;line-height:1;
  border-radius:6px;opacity:.55;transition:opacity .12s ease,background .12s ease}
tr:hover .act .ic{opacity:1}
.act .ic:hover{background:rgba(255,255,255,.14);opacity:1}
.act .ic.sup:hover{background:rgba(248,113,113,.2);border-color:rgba(248,113,113,.5)}
.act .ic.sup.arme{opacity:1;background:rgba(248,113,113,.25);border-color:#f87171;color:#fff}
/* ── L ASSISTANT ───────────────────────────────────────────────────────── */
.asst{position:fixed;inset:0;background:rgba(6,10,18,.78);z-index:70;display:flex;
  align-items:center;justify-content:center;padding:1rem}
.asst .bo{background:#141d2c;border:1px solid rgba(255,255,255,.14);border-radius:13px;
  width:min(62rem,100%);max-height:92vh;display:flex;flex-direction:column;overflow:hidden}
.asst .tt{display:flex;align-items:center;gap:.6rem;padding:.7rem .9rem;
  border-bottom:1px solid rgba(255,255,255,.08)}
.asst .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.asst .tt .pas{margin-left:auto;display:flex;gap:.3rem;align-items:center;font-size:.72rem;color:#8fa1b8}
.asst .tt .pas b{display:inline-flex;width:1.35rem;height:1.35rem;border-radius:50%;
  align-items:center;justify-content:center;background:rgba(255,255,255,.08);font-size:.7rem}
.asst .tt .pas b.on{background:#c9a97e;color:#1a1208}
.asst .co{flex:1 1 auto;min-height:0;overflow-y:auto;padding:.85rem .9rem}
/* Le choix de la mise en scene : des couples etiquette/valeur, alignes. */
.ch{display:flex;align-items:center;gap:.7rem;margin-bottom:.7rem}
.ch>label:first-child{min-width:7rem;color:#8fa1b8;font-size:.78rem}
.ch select{flex:1;background:#0f1724;color:#e8edf5;border:1px solid #2b3444;
  border-radius:.4rem;padding:.42rem .55rem;font:inherit}
.ch input[type=checkbox]{accent-color:#c9a97e;margin-right:.35rem}
.asst .pi{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;
  padding:.6rem .9rem;border-top:1px solid rgba(255,255,255,.08);background:#0f1725}
.asst .pi .dr{margin-left:auto;display:flex;gap:.5rem}
/* La planche de vignettes : c est l ecran ou l on CHOISIT, il doit montrer. */
.pl{display:grid;grid-template-columns:repeat(auto-fill,minmax(9rem,1fr));gap:.5rem}
.pl .v{position:relative;border:2px solid rgba(255,255,255,.1);border-radius:9px;
  overflow:hidden;cursor:pointer;background:#0b1220}
.pl .v.on{border-color:#c9a97e;box-shadow:0 0 0 3px rgba(201,169,126,.2)}
/* ⚠⚠ UNE ROTATION CSS NE CHANGE PAS LA BOITE. L image tournait bien, mais son
   encombrement restait celui d avant : elle debordait sur le titre de la case
   d a cote. La boite d apercu est donc CARREE (aspect-ratio:1) et l image y est
   centree en position absolue : dans un carre, une image qui tient avant la
   rotation tient encore apres, quel que soit le quart de tour. */
.pl .v .im{position:relative;aspect-ratio:1;overflow:hidden;background:#0b1220}
.pl .v .im img{position:absolute;top:50%;left:50%;max-width:100%;max-height:100%;
  display:block;transform:translate(-50%,-50%)}
/* ⚠ LA VIGNETTE SE REDRESSE A L AFFICHAGE. Les pixels ne sont pas pivotes : on
   applique l etiquette EXIF en CSS, ce qui est gratuit et exact. L import, lui,
   pivote pour de vrai — ici on ne fait que REGARDER. */
.pl .v .im img.o2{transform:translate(-50%,-50%) scaleX(-1)}
.pl .v .im img.o3{transform:translate(-50%,-50%) rotate(180deg)}
.pl .v .im img.o4{transform:translate(-50%,-50%) scaleY(-1)}
.pl .v .im img.o5{transform:translate(-50%,-50%) rotate(90deg) scaleX(-1)}
.pl .v .im img.o6{transform:translate(-50%,-50%) rotate(90deg)}
.pl .v .im img.o7{transform:translate(-50%,-50%) rotate(270deg) scaleX(-1)}
.pl .v .im img.o8{transform:translate(-50%,-50%) rotate(270deg)}
.pl .v .att{display:flex;align-items:center;justify-content:center;height:100%;
  color:#8fa1b8;font-size:.72rem}
.pl .v .lg{padding:.25rem .4rem;font-size:.68rem;color:#c3cede;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl .v .dt2{padding:0 .4rem .3rem;font-size:.63rem;color:#8fa1b8}
.pl .v .ck{position:absolute;top:.3rem;left:.3rem;width:1.1rem;height:1.1rem;
  border-radius:4px;background:rgba(11,18,32,.85);border:1px solid rgba(255,255,255,.3);
  display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#c9a97e}
.pl .v.on .ck{background:#c9a97e;color:#1a1208;border-color:#c9a97e}
/* Le chargement, au centre, avant la planche. */
.chargement{display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:.6rem;min-height:16rem;text-align:center}
.chargement .gros{font:700 1rem/1.3 Georgia,serif}
.chargement .cpt{font-variant-numeric:tabular-nums;font-size:1.3rem;color:#c9a97e;font-weight:800}
.chargement .aide{max-width:26rem}
.chargement .tourne{width:2.2rem;height:2.2rem;border-radius:50%;
  border:3px solid rgba(201,169,126,.25);border-top-color:#c9a97e;
  animation:vire 900ms linear infinite}
@keyframes vire{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.chargement .tourne{animation:none}}
.src{display:flex;flex-direction:column;gap:.4rem}
.src .l{display:flex;align-items:center;gap:.6rem;padding:.55rem .7rem;cursor:pointer;
  border:1px solid rgba(255,255,255,.12);border-radius:9px}
.src .l:hover{background:rgba(255,255,255,.04)}
.src .l.on{border-color:#c9a97e;background:rgba(201,169,126,.1)}
.src .l b{font-size:.9rem}
.but{display:flex;flex-direction:column;gap:.4rem;margin-top:.5rem}
.but label{display:flex;gap:.55rem;align-items:flex-start;padding:.5rem .65rem;
  border:1px solid rgba(255,255,255,.12);border-radius:9px;cursor:pointer;margin:0;color:#e8edf5;font-size:.84rem}
.but label.on{border-color:#c9a97e;background:rgba(201,169,126,.1)}
.but label input{width:auto;margin-top:.15rem}
.but label .d{display:block;font-size:.72rem;color:#8fa1b8;margin-top:.1rem}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** Page complète de la fenêtre native « Photos ». */
function pagePhotos() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Photos — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">▣️</span><h1>Photos</h1>
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

  var D = null;
  var Q = '';
  var TRI = 'recent';
  var PAGE = 0;
  var DETAIL = null;        // la ligne ouverte
  var ATTACHE = false;      // le selecteur d article est deploye
  var PRODUITS = null;      // sa derniere reponse
  var PQ = '';
  /* ⚠⚠ L'INSPECTEUR ET LA LIGNE DU TABLEAU ARMAIENT LA MÊME VARIABLE, et pas
     avec la même chose : la ligne y mettait l'IDENTIFIANT de la photo, le
     panneau un simple oui/non. Comme les deux « var » portaient le même nom, il
     n'y avait qu'UNE variable — armer la suppression d'une ligne du tableau
     armait donc AUSSI, en silence, le bouton « Retirer de la médiathèque » du
     panneau ouvert à côté. Le clic suivant y supprimait la photo sans jamais
     avoir demandé confirmation POUR ELLE.
     ⚠ UN AVERTISSEMENT QUI N'A PAS ÉTÉ MONTRÉ NE PROTÈGE PERSONNE — et c'est
     exactement ce qui se passait. Deux gestes, deux variables. */
  var SUPPR_ARME_INSP = false;   // le panneau : oui/non
  var VIDER_ARME = false;
  var OCCUPE = false;       // un travail long est en cours : on desarme les gestes
  var VEILLE = null;        // le chien de garde de ce travail
  /* Le CHOIX vit hors du dessin : il survit a un changement de page et de tri.
     ⚠ Sans cela, cocher douze photos puis trier par poids les decocherait
     toutes, et l on s en apercevrait apres avoir lance le traitement. */
  var CHOIX = {};
  var LOT_NOM = '';         // le nom donne au prochain lot importe
  var TAILLE = 24;          // photos par page
  var LOTS = null;          // l historique, quand il est ouvert
  /* ══════════════════════════════════════════════════════════════════════════
     L ASSISTANT DE TRAITEMENT EN LOT — trois etapes
       1. LA SOURCE : une cle branchee, ou les photos deja importees.
       2. LE CHOIX : ce que la source contient, avec vignettes, tri par date, et
          uniquement les formats que l on sait lire.
       3. LE TRAITEMENT : nommer le lot et choisir ce qu on veut en faire.
     ⚠ LIRE N EST PAS IMPORTER : rien n entre dans la photothèque avant l etape 3.
     ══════════════════════════════════════════════════════════════════════════ */
  var ASSIST = null;        // { etape, sources, lecteur, fichiers, choix, tri, nom, but }
  var VIGNETTES = {};       // chemin -> data URL, chargees a la demande
  var ORIENT = {};          // chemin -> orientation EXIF (1 a 8)
  var RENOMME = '';         // la photo dont le nom est en cours de modification
  var SUPPR_ARME = '';      // la photo dont la suppression est armee

  /* ⚠⚠ UN DRAPEAU QUI NE SE LEVE PAS BLOQUE LA FENETRE POUR TOUJOURS.
     Signale le 2026-08-09 : << Recherche de cles USB... >> restait a l ecran, et
     tout import suivant repondait << un import est deja en cours >> alors que
     rien ne tournait. La cause n est pas dans un appel precis : c est que
     OCCUPE etait pose a la main et rendu a la main, sur le seul chemin de
     succes. Une reponse perdue — quelle qu en soit la raison — laissait la
     fenetre morte jusqu a sa reouverture, sans un mot.

     Deux regles, ici, une fois pour toutes :
       ① ON POSE ET ON REND AU MEME ENDROIT (occuper / liberer) ;
       ② UN TRAVAIL QUI NE REPOND PAS FINIT PAR LE DIRE. Le chien de garde rend
          le drapeau et NOMME le silence. Mieux vaut une fenetre qui avoue
          n avoir pas eu de reponse qu une fenetre qui refuse tout sans raison. */
  var VEILLE_MS = 60000;
  function occuper(mot){
    OCCUPE = true;
    dire(mot);
    clearTimeout(VEILLE);
    VEILLE = setTimeout(function(){
      if (!OCCUPE) return;
      liberer();
      dire('Aucune réponse de la fenêtre principale pour cette opération. '
        + 'Elle a peut-être abouti quand même — rechargez la liste pour voir.', 'err');
    }, VEILLE_MS);
  }
  function liberer(){
    OCCUPE = false;
    clearTimeout(VEILLE);
    VEILLE = null;
  }
  /* ⚠ ON NE REFUSE JAMAIS EN SILENCE. Un bouton qui ne fait rien passe pour
     casse ; un bouton qui dit pourquoi il attend passe pour occupe. */
  function occupeDeja(quoi){
    if (!OCCUPE) return false;
    dire(quoi + ' — un travail est déjà en cours dans cette fenêtre. Patientez, '
      + 'ou rechargez la liste s’il ne se termine pas.', 'att');
    return true;
  }

  /* ⚠ UN PLAFOND PAR FICHIER, ET IL EST DIT. L image traverse le pont en clair :
     une photo de 40 Mo bloquerait le canal plusieurs dizaines de secondes pour
     finir en delai. Refuser en NOMMANT le fichier vaut mieux qu un ecran fige. */
  var MAX_OCTETS = 25 * 1024 * 1024;

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* Le bandeau de message : une seule regle, dans le socle (szDire) —
     tout verdict s efface seul apres cinq secondes, sauf ce qui se termine
     par des points de suspension, qui annonce un travail en cours. */
  function dire(t, cl){ szDire(t, cl); }

  var MOTIFS = {
    session:            'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:              'Votre rôle ne donne pas accès à la photothèque.',
    droit_produit:      'Attacher une photo modifie une fiche produit — votre rôle ne le permet pas.',
    indisponible:       'L’administration n’est pas encore chargée dans la fenêtre principale.',
    pont_indisponible:  'La fenêtre principale ne répond pas.',
    delai:              'La fenêtre principale n’a pas répondu à temps. Une photo très lourde peut en être la cause.',
    operation_inconnue: 'Cette version de l’application ne connaît pas cette opération.',
    module_photos:      'La photothèque n’a pas pu être chargée dans la fenêtre principale. Rechargez-la (Ctrl+R) ; si le message revient, la session du personnel a peut-être expiré.',
    introuvable:        'Cette photo n’existe plus.',
    produit_introuvable:'Cet article n’existe plus.',
    image_absente:      'Aucune image lisible dans ce fichier.',
    non_isolee:         'Isolez d’abord le vêtement : un fond se pose derrière un détourage.',
    isolation:          'L’isolation a échoué.',
    fond:               'Le fond n’a pas pu être appliqué.',
    attache:            'L’attache a échoué — rien n’a été écrit sur la fiche.',
    import:             'L’import a échoué.',
    nuage:              'Écriture dans le nuage refusée — rien n’a été retiré.',
    usb_hors_app:       'La détection de clé USB n’existe que dans l’application de bureau.',
    export_hors_app:    'L’enregistrement de fichier n’existe que dans l’application de bureau.',
    echec:              'L’opération a échoué.'
  };
  function expliquer(r){
    var m = r && r.motif;
    var t = MOTIFS[m] || ('Erreur inattendue (' + esc(m || '?') + ').');
    if (r && r.detail) t += ' (' + esc(String(r.detail).slice(0, 140)) + ')';
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
  function poids(n){
    if (!n) return '—';
    if (n < 1024) return n + ' o';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' Ko';
    return (n / 1048576).toFixed(2) + ' Mo';
  }

  /* ── LE DESSIN ─────────────────────────────────────────────────────────── */
  function dessiner(){
    if (!D) { corps.innerHTML = '<div class="vide">Chargement…</div>'; return; }
    var ro = !D.peutModifier;
    var h = '';

    if (ro) {
      h += '<div class="carte" style="border-color:rgba(180,120,10,.4)">'
        + '<span class="pill att">◉ Lecture seule</span> '
        + '<span class="aide">Votre rôle permet de consulter la photothèque, pas de la modifier.</span></div>';
    }

    /* ══════════════════════════════════════════════════════════════════════
       LA BARRE DE COMMANDE
       ⚠ TOUT SUR UNE LIGNE, ET LES COMPTEURS AVEC. Quatre grandes tuiles
       occupaient un tiers de l ecran pour quatre nombres qu on lit en une
       seconde : c est de la place prise a ce qu on vient VRAIMENT faire, le
       tableau. Les compteurs deviennent une ligne d etat.
       ⚠ LA ZONE DE DEPOT NE PARAIT QUE QUAND ELLE SERT — quand il n y a rien.
       Un rectangle en pointille de 150 px au-dessus d une liste garnie est un
       panneau publicitaire pour une action qu on peut faire d un bouton. Le
       glisser-deposer, lui, marche partout dans la fenetre. */
    h += '<div class="cmd">'
      + '<button class="prim" id="p-choisir"' + (ro ? ' disabled' : '') + '>＋ Importer</button>'
      /* ⚠ LE CHAMP << NOM DU LOT >> A QUITTE CETTE BARRE. Il n y servait a rien
         tant qu on n avait pas choisi de photos, et il encombrait la seule
         ligne qu on regarde tout le temps. Il vit maintenant a l etape ou il
         a un sens : quand le lot existe. */
      + (ro ? '' : '<button id="p-assistant"'
          + ' title="Choisir une source, sélectionner les photos, puis les traiter">'
          + '⚙ Traitement en lot</button>')
      + '<span class="sep"></span>'
      + '<input type="search" id="p-q" placeholder="Code, nom, article…" value="' + esc(Q) + '">'
      + '<select id="p-tri">'
      + opt('recent', 'Plus récentes') + opt('code', 'Par code') + opt('name', 'Par nom')
      + opt('linked', 'Liées d’abord') + opt('size', 'Plus lourdes')
      + '</select>'
      /* ⚠ JUSQU A 500 PAR PAGE. Le plafond de 24 obligeait a paginer pour cocher
         un lot de deux cents, et un choix qui se perd entre deux pages n en est
         pas un. */
      + '<select id="p-taille" title="Photos par page">'
      + [24, 50, 100, 200, 500].map(function(n){
          return '<option value="' + n + '"' + (TAILLE === n ? ' selected' : '') + '>' + n + ' / page</option>';
        }).join('')
      + '</select>'
      + '<span class="droite">'
      + (DERNIER_SUIVI && !SUIVI
          ? '<button class="mini" id="p-suivi" title="Revoir le compte rendu du dernier traitement">Dernier suivi</button>'
          : '')
      + '<button class="mini" id="p-lots"' + (D.total ? '' : ' disabled')
      + ' title="' + (D.total ? 'Historique des lots importés'
                             : 'Aucune photo : il n’y a pas encore de lot') + '">Lots</button>'
      + '<button class="mini" id="p-fal"' + (D.total ? '' : ' disabled')
      + ' title="' + (D.total ? 'Consommation et journal des traitements'
                             : 'Aucune photo : aucun traitement à suivre') + '">Traitements IA</button>'
      + (D.total && !ro
          ? '<button class="mini danger" id="p-vider">' + (VIDER_ARME ? 'Confirmer — vider les ' + D.total + ' ?' : 'Tout vider') + '</button>'
          : '')
      + '</span></div>';

    h += '<div class="etat">'
      + '<b>' + D.trouvees + '</b> affichée' + (D.trouvees > 1 ? 's' : '')
      + ' sur <b>' + D.total + '</b>'
      + '<span class="sp">·</span> <b>' + D.isolees + '</b> isolée' + (D.isolees > 1 ? 's' : '')
      + '<span class="sp">·</span> <b>' + D.liees + '</b> attachée' + (D.liees > 1 ? 's' : '')
      + '<span class="sp">·</span> ' + poids(D.poidsTotal) + ' rangés'
      /* ⚠⚠ DEUX CHIFFRES DIFFERENTS, ET C EST VOULU. << rangés >> additionne le
         poids inscrit sur chaque fiche ; << dans R2 >> est ce que le stockage
         contient VRAIMENT, mesure en l interrogeant. Les confondre ferait passer
         pour une mesure ce qui n est qu une somme : elle ignore les objets que
         plus aucune fiche ne cite, et c est justement ceux-la qu on paie sans
         les voir. L ecart entre les deux EST l information. */
      + '<span class="sp">·</span> <span id="p-r2">'
      + (ESPACE === null ? '<a href="#" id="p-mesurer">mesurer l’espace R2</a>'
         : ESPACE.ok === false ? '<span class="err">espace R2 : ' + esc(ESPACE.detail || 'illisible') + '</span>'
         : espaceTexte(ESPACE))
      + '</span>'
      + '</div>';

    if (!ro && !D.total) {
      h += '<div class="depot" id="p-depot">'
        + '<div class="gros">Glissez-déposez vos photos ici</div>'
        + '<div class="pt">ou cliquez pour choisir des fichiers'
        + (D.bureau ? ' · ou « Clé USB »' : '') + '</div></div>';
    }

    h += '<div class="carte">';
    var rows = D.lignes || [];
    if (!rows.length) {
      /* ⚠ TROIS ETATS, PAS DEUX. Dire << Aucune photo >> pendant la
         synchronisation ferait croire que la mediatheque a ete perdue. */
      h += '<div class="vide">' + (!D.charge
        ? 'Lecture de la photothèque…'
        : (D.total ? 'Aucune photo ne correspond à cette recherche.'
                   : 'Aucune photo. Déposez-en ci-dessus.')) + '</div>';
    } else {
      h += '<table class="grille"><thead><tr>'
        + '<th style="width:26px"><input type="checkbox" id="p-tout" title="Tout choisir sur cette page"></th>'
        + '<th style="width:46px"></th><th>Code</th><th>Nom</th>'
        + '<th>Article lié</th><th class="num">Poids</th><th>État</th>'
        + '<th style="width:1%">Actions</th></tr></thead><tbody>'
        + rows.map(ligne).join('') + '</tbody></table>';
      if ((D.pages || 1) > 1) {
        h += '<div class="pagi">'
          + '<button class="mini" id="p-prec"' + (D.page <= 0 ? ' disabled' : '') + '>◀</button>'
          + '<span>Page ' + (D.page + 1) + ' / ' + D.pages + '</span>'
          + '<button class="mini" id="p-suiv"' + (D.page >= D.pages - 1 ? ' disabled' : '') + '>▶</button>'
          + '</div>';
      }
    }
    h += '</div>';

    h += barreLot();
    if (DETAIL) h += boiteDetail();
    // ⚠ La classe se pose sur BODY et non sur le corps : c est elle qui decale
    // a la fois le tableau et le panneau de suivi, qui vit hors du corps.
    if (ASSIST) h += assistHtml();
    else if (SCENE_OUVERT) h += sceneHtml();
    else if (LOTS) h += lotsHtml();
    document.body.classList.toggle('insp', !!DETAIL && !ASSIST);
    corps.innerHTML = h;
    brancher();
  }

  function nbChoisies(){ return Object.keys(CHOIX).length; }

  /* ══════════════════════════════════════════════════════════════════════════
     L ASSISTANT — dessin et conduite
     ══════════════════════════════════════════════════════════════════════════ */
  var BUTS = [
    ['detourage', 'Retirer le fond', 'Isole le vêtement de son arrière-plan.'],
    ['fantome', 'Retirer le mannequin', 'Retire le fond PUIS le mannequin. Le col et les manches sont reconstruits.'],
    ['humain', 'Mannequin humain', 'Retire le fond, retire le mannequin, PUIS engendre une personne qui porte le vêtement.'],
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     L HISTORIQUE DES LOTS
     ⚠⚠ IL EXISTE PARCE QU ON N A PAS PU DEFAIRE. Le 2026-08-09, l ancien import
     automatique a verse 66 photos d une cle sans que personne n ait rien
     demande, et rien ne permettait de les retrouver ENSEMBLE pour les retirer.
     ⚠ ON COMPTE SUR LES PHOTOS, PAS SUR UN REGISTRE A PART : un registre
     deriverait au premier retrait fait a la main — il dirait << 66 >> alors
     qu il en reste douze.
     ══════════════════════════════════════════════════════════════════════════ */
  var LOT_ARME = '';
  var LOTS_VERSION = '';
  var SUP_LOT_ARME = false;

  /* ⚠⚠ LES LOTS SE COMPOSENT ICI, A PARTIR DE LA LISTE DES PHOTOS. L operation
     dediee rendait des objets qui arrivaient VIDES a ce bout du pont — mesure :
     la fenetre recevait des chaines de trois caracteres la ou elle attendait des
     fiches, d ou les << undefined >> et le << lot inconnu >> a la suppression.
     Le calcul cote site etait pourtant juste (banc d essai a l appui).
     Plutot que de poursuivre une serialisation qui se comporte mal sur une forme
     precise, on emprunte la MEME forme que le tableau des photos — un tableau
     d objets plats, eprouve depuis des mois. Une forme qui marche partout
     ailleurs vaut mieux qu une explication. */
  function lotsOuvrir(){
    dire('Lecture des lots…');
    appeler('photos:toutes', []).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      var par = {};
      (r.photos || []).forEach(function(x){
        var id = x.lotId || '@avant';
        if (!par[id]) {
          par[id] = { id: id, nom: x.lotNom || '', source: x.lotSource || '',
                      ts: x.lotTs || 0, nombre: 0, poids: 0, liees: 0, traitees: 0 };
        }
        var l = par[id];
        l.nombre++;
        l.poids += (x.poids || 0);
        if (x.lie) l.liees++;
        if (x.traite) l.traitees++;
        if ((x.lotTs || 0) > l.ts) l.ts = x.lotTs;
      });
      if (par['@avant']) {
        par['@avant'].nom = 'Avant le suivi des lots';
        par['@avant'].source = 'origine inconnue';
      }
      LOTS = Object.keys(par).map(function(k){ return par[k]; })
        .sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); });
      LOTS_VERSION = '';
      LOT_ARME = '';
      /* ⚠⚠ LA FENETRE ET LE SITE PEUVENT NE PAS ETRE DE LA MEME VERSION. La
         fenetre vit dans l application (mise a jour par installation) ; les
         coeurs vivent dans le site (mis a jour par le reseau, avec un cache).
         Quand le site est perime, le coeur rend des lots SANS leurs compteurs, et
         l ecran affichait << undefined >> partout — ce qui ressemble a un bogue
         alors que c est un decalage. On le NOMME, avec le geste qui repare. */
      /* ⚠⚠ QUAND LES COMPTEURS MANQUENT, ON DIT CE QU ON A RECU. Afficher
         << undefined >> laisse deviner ; nommer les champs REELLEMENT rendus par
         le coeur permet de trancher en un coup d oeil entre << module du site
         perime >> et << autre chose >>. Un diagnostic vaut mieux qu une
         supposition, et celui-ci tient sur une ligne. */
      if (LOTS.length && typeof LOTS[0].nombre !== 'number') {
        var champs = [];
        try { champs = Object.keys(LOTS[0]); } catch (e) { champs = []; }
        dire('Les lots arrivent sans leurs compteurs (champs reçus : '
          + esc(champs.join(', ') || 'aucun') + '). Rechargez avec '
          + '« Affichage ▸ Recharger (vider le cache) » ; si cela persiste, '
          + 'transmettez-moi cette ligne.', 'err');
      }
      dire('');
      dessiner();
    });
  }
  /* ══════════════════════════════════════════════════════════════════════════
     L ESPACE OCCUPE DANS R2
     ⚠ IL SE DEMANDE, IL NE SE CHARGE PAS TOUT SEUL : mesurer, c est enumerer
     tout le dossier du stockage, page par page. Le faire a chaque ouverture de
     l ecran ferait payer une enumeration complete pour une ligne que l on ne
     regarde pas toujours.
     ⚠ ET IL DIT CE QU IL NE SAIT PAS : une enumeration interrompue rend
     << au moins tant >>, jamais un total qui aurait l air complet.
     ══════════════════════════════════════════════════════════════════════════ */
  var ESPACE = null;

  function espaceTexte(e){
    var t = 'R2 : <b>' + poids(e.octets) + '</b>';
    if (!e.complet) t = 'R2 : <b>au moins ' + poids(e.octets) + '</b>';
    t += ' <span class="pt">(' + e.objets + ' objet' + (e.objets > 1 ? 's' : '');
    if (e.orphelins && e.orphelins.sur && e.orphelins.objets) {
      t += ', dont <b class="att">' + e.orphelins.objets + ' orphelin'
        + (e.orphelins.objets > 1 ? 's' : '') + ' — ' + poids(e.orphelins.octets) + '</b>';
    }
    t += ')</span>';
    return t;
  }

  function mesurerEspace(){
    var z = document.getElementById('p-r2');
    if (z) z.innerHTML = 'mesure de l’espace R2…';
    appeler('photos:espace', []).then(function(r){
      ESPACE = r;
      dessiner();
      if (r && r.ok && r.orphelins && r.orphelins.sur && r.orphelins.objets) {
        dire(r.orphelins.objets + ' objet(s) ne sont cités par aucune photo : '
          + poids(r.orphelins.octets) + ' payés pour rien. Le passage de nuit les retire.', 'att');
      }
    });
  }

  function lotsFermer(){ LOTS = null; LOT_ARME = ''; dessiner(); }

  function nb(v){ return (typeof v === 'number' && isFinite(v)) ? v : '—'; }

  function lotsHtml(){
    var h = '<div class="asst"><div class="bo">'
      + '<div class="tt"><h3>Lots importés</h3>'
      + '<span class="pas">' + LOTS.length + ' lot' + (LOTS.length > 1 ? 's' : '') + '</span></div>'
      + '<div class="co">';
    /* ⚠⚠ LE DIAGNOSTIC EST DANS LE PANNEAU, PAS DANS LE BANDEAU DU BAS. Un
       message qu on ne voit pas ne diagnostique rien — et le bandeau s efface au
       bout de cinq secondes, souvent avant qu on ait fini de lire le tableau.
       Il nomme les champs REELLEMENT recus et la version du module qui a
       repondu : de quoi trancher entre << module perime >> et << autre chose >>
       sans avoir a supposer. */
    if (LOTS.length && typeof LOTS[0].nombre !== 'number') {
      var champs = [];
      try { champs = Object.keys(LOTS[0]); } catch (e) { champs = []; }
      h += '<div class="franc" style="margin-bottom:.6rem">'
        + '<b>Les lots arrivent sans leurs compteurs.</b><br>'
        + 'Champs reçus : <code>' + esc(champs.join(', ') || '(aucun)') + '</code><br>'
        + 'Module du site : <code>' + esc(LOTS_VERSION || '(non annoncée)') + '</code><br>'
        + 'Rechargez avec « Affichage ▸ Recharger (vider le cache) ». Si cela '
        + 'persiste, transmettez ces deux lignes.</div>';
    }
    if (!LOTS.length) h += '<div class="vide">Aucune photo dans la photothèque.</div>';
    else {
      h += '<table><thead><tr><th>Lot</th><th>Entré</th><th class="num">Photos</th>'
        + '<th class="num">Traitées</th><th class="num">Attachées</th><th class="num">Poids</th>'
        + '<th></th></tr></thead><tbody>';
      LOTS.forEach(function(l){
        var arme = (LOT_ARME === l.id);
        h += '<tr>'
          + '<td><b>' + esc(l.nom || 'Sans nom') + '</b>'
          + (l.source ? '<div class="dt">' + esc(l.source) + '</div>' : '') + '</td>'
          + '<td class="dt">' + (l.ts ? dateFr(l.ts) : '—') + '</td>'
          /* ⚠ UN NOMBRE MANQUANT S ECRIT << — >>, JAMAIS << undefined >>. Le mot
             << undefined >> ne veut rien dire pour qui lit l ecran : il donne
             l impression d un produit casse la ou il n y a qu une donnee
             absente. */
          + '<td class="num">' + nb(l.nombre) + '</td>'
          + '<td class="num">' + nb(l.traitees) + '</td>'
          + '<td class="num">' + nb(l.liees) + '</td>'
          + '<td class="num">' + poids(l.poids) + '</td>'
          + '<td style="white-space:nowrap">'
          + '<button class="mini" data-lotsel="' + esc(l.id) + '">Tout cocher</button> '
          + (D.peutModifier
              ? '<button class="mini dgr" data-lotdel="' + esc(l.id) + '">'
                + (arme ? 'Confirmer ?' : 'Supprimer le lot') + '</button>'
              : '')
          + '</td></tr>'
          + (arme
              ? '<tr><td colspan="7" class="dt" style="color:#facc15">'
                + 'Les ' + Math.max(0, (l.nombre || 0) - (l.liees || 0)) + ' photo(s) non attachées seront retirées. '
                + (l.liees ? ('Les ' + l.liees + ' attachées à un article sont GARDÉES : '
                              + 'retirer la photothèque ne doit jamais dépouiller une fiche produit.')
                           : '')
                + '</td></tr>'
              : '');
      });
      h += '</tbody></table>';
    }
    h += '</div><div class="pi"><span class="aide">Un lot est un import. '
      + 'Le retirer défait cet import d’un geste.</span>'
      + '<span class="dr"><button class="prim" id="l-fermer">Fermer</button></span>'
      + '</div></div></div>';
    return h;
  }

  function lotsBrancher(){
    var f = document.getElementById('l-fermer');
    if (f) f.onclick = lotsFermer;
    Array.prototype.forEach.call(corps.querySelectorAll('[data-lotsel]'), function(b){
      b.onclick = function(){
        /* ⚠ COCHER UN LOT NE COCHE QUE CE QUI EST AFFICHE : les cases vivent sur
           les lignes, et une ligne d une autre page n existe pas encore. On le
           DIT plutot que de laisser croire a une selection complete. */
        var id = b.getAttribute('data-lotsel');
        var n = 0;
        (D.lignes || []).forEach(function(x){
          if ((x.lotId || '@avant') === id) { CHOIX[x.id] = { code: x.code, nom: x.nom }; n++; }
        });
        var lot = LOTS.filter(function(x){ return x.id === id; })[0];
        lotsFermer();
        dire(n
          ? (n + ' photo(s) cochée(s)'
             + (lot && lot.nombre > n
                 ? (' — le lot en compte ' + lot.nombre + ' ; augmentez « photos par page » pour toutes les voir.')
                 : '.'))
          : 'Aucune photo de ce lot sur cette page — augmentez « photos par page ».',
          n ? 'bon' : 'att');
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-lotdel]'), function(b){
      b.onclick = function(){
        var id = b.getAttribute('data-lotdel');
        if (LOT_ARME !== id) { LOT_ARME = id; dessiner(); return; }
        LOT_ARME = '';
        dire('Suppression du lot…');
        appeler('lot:jeter', [id]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          dire(r.retirees + ' photo(s) retirée(s)'
            + (r.gardees ? ' · ' + r.gardees + ' gardée(s) car attachée(s) à un article' : '')
            + (r.echecs ? ' · ' + r.echecs + ' en échec' : '') + '.',
            r.echecs ? 'att' : 'bon');
          LOTS = null;
          charger();
        });
      };
    });
  }

  function assistOuvrir(){
    ASSIST = { etape: 1, sources: null, lecteur: '', fichiers: [], choix: {},
               tri: 'date', nom: '', but: 'detourage' };
    dessiner();
    dire('Lecture des sources…');
    appeler('lot:sources', []).then(function(r){
      ASSIST.sources = (r && r.ok) ? (r.lecteurs || []) : [];
      ASSIST.erreurSource = (r && r.ok) ? '' : expliquer(r);
      dire('');
      dessiner();
    });
  }
  function assistFermer(){ ASSIST = null; VIGNETTES = {}; ORIENT = {}; dessiner(); }

  function dateFr(ms){
    if (!ms) return '—';
    var d = new Date(ms);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function assistHtml(){
    var A = ASSIST;
    var pas = function(n){ return '<b' + (A.etape === n ? ' class="on"' : '') + '>' + n + '</b>'; };
    var h = '<div class="asst"><div class="bo">'
      + '<div class="tt"><h3>Traitement en lot</h3>'
      + '<span class="pas">' + pas(1) + '<span>source</span>' + pas(2) + '<span>choix</span>'
      + pas(3) + '<span>traitement</span></span>'
      /* ⚠ VRAI PLEIN ECRAN DU SYSTEME, pas une classe CSS qui etire un panneau :
         on ouvre cet ecran pour VOIR les photos, et une planche de soixante-six
         vignettes gagne plus a la place qu a n importe quel reglage. */
      + '<button class="mini" id="a-plein" title="Plein écran">⛶</button>'
      + '</div><div class="co">';

    if (A.etape === 1) {
      h += '<p class="aide" style="margin:0 0 .5rem">D’où viennent les photos&nbsp;?</p><div class="src">';
      /* ⚠ LES PHOTOS DEJA IMPORTEES SONT UNE SOURCE COMME UNE AUTRE : le meme
         traitement doit s appliquer a ce qui est deja dans la photothèque, sans
         avoir a le reimporter. */
      h += '<div class="l' + (A.lecteur === '@lib' ? ' on' : '') + '" data-src="@lib">'
        + '<b>Photos déjà importées</b><span class="aide">'
        + (D.total || 0) + ' dans la photothèque</span></div>';
      if (!A.sources) h += '<div class="vide">Lecture des clés branchées…</div>';
      else if (!A.sources.length) {
        h += '<div class="vide">' + (A.erreurSource
          ? esc(A.erreurSource)
          : 'Aucune clé ou carte mémoire branchée avec des photos.') + '</div>';
      } else {
        A.sources.forEach(function(x){
          h += '<div class="l' + (A.lecteur === x.lecteur ? ' on' : '') + '" data-src="' + esc(x.lecteur) + '">'
            + '<b>Clé ' + esc(x.lecteur) + '</b>'
            + '<span class="aide">' + x.photos.length + ' photo' + (x.photos.length > 1 ? 's' : '')
            + ' lisible' + (x.photos.length > 1 ? 's' : '') + '</span></div>';
        });
      }
      h += '</div>';
      h += '<p class="aide">Rien n’est importé à cette étape : on lit seulement les noms, '
        + 'les tailles et les dates. Seuls les formats que nous savons lire (JPG, PNG, WebP) '
        + 'sont proposés.</p>';

    } else if (A.etape === 2 && A.chargement) {
      /* ⚠⚠ ON CHARGE AVANT DE MONTRER (demande du 2026-08-09). Afficher
         soixante-six cases vides qui se remplissent une a une pendant qu on
         essaie de choisir, c est offrir un ecran qui bouge sous les doigts. Un
         seul message au centre, un compte qui avance, et la planche parait
         d un coup — prete a servir. */
      h += '<div class="chargement">'
        + '<div class="tourne"></div>'
        + '<div class="gros">Chargement des aperçus…</div>'
        + '<div class="cpt"><b id="a-fait">' + A.fait + '</b> / ' + A.fichiers.length + '</div>'
        + '<div class="aide">Les photos sont seulement LUES : rien n’est importé '
        + 'tant que vous n’avez pas choisi.</div>'
        + '</div>';

    } else if (A.etape === 2) {
      var n = Object.keys(A.choix).length;
      h += '<div class="barreoutils" style="margin-bottom:.5rem">'
        + '<select id="a-tri" style="width:auto">'
        + '<option value="date"' + (A.tri === 'date' ? ' selected' : '') + '>Plus récentes d’abord</option>'
        + '<option value="date-vieux"' + (A.tri === 'date-vieux' ? ' selected' : '') + '>Plus anciennes d’abord</option>'
        + '<option value="nom"' + (A.tri === 'nom' ? ' selected' : '') + '>Par nom</option>'
        + '<option value="poids"' + (A.tri === 'poids' ? ' selected' : '') + '>Plus lourdes d’abord</option>'
        + '</select>'
        + '<button class="mini" id="a-tous">Tout choisir</button>'
        + '<button class="mini" id="a-rien">Tout décocher</button>'
        + '<span class="droite">'
        + '<span id="a-apercus" class="aide"></span>'
        + '<b id="a-nb">' + n + '</b> sur ' + A.fichiers.length + ' choisie'
        + (n > 1 ? 's' : '') + '</span></div>';
      if (!A.fichiers.length) h += '<div class="vide">Cette source ne contient aucune photo lisible.</div>';
      else {
        h += '<div class="pl">';
        assistTriees().forEach(function(f, i){
          var v = VIGNETTES[f.cle];
          /* ⚠⚠ LE RANG, PAS LE CHEMIN. La case portait son chemin de fichier en
             attribut, et l on retrouvait la case par un selecteur CSS. Or un
             chemin Windows contient des ANTISLASHS : le selecteur ne trouvait
             jamais rien, et aucune vignette ne se posait — le compteur avancait
             pendant que l ecran restait vide. Un identifiant d affichage ne doit
             rien devoir aux donnees. */
          h += '<div class="v' + (A.choix[f.cle] ? ' on' : '') + '" data-i="' + i + '">'
            + '<span class="ck">' + (A.choix[f.cle] ? '✓' : '') + '</span>'
            + '<div class="im">'
            + (v ? '<img class="o' + (ORIENT[f.cle] || 1) + '" src="' + esc(v) + '" alt="">'
                 : '<div class="att" data-charge="' + esc(f.cle) + '">…</div>')
            + '</div>'
            + '<div class="lg" title="' + esc(f.nom) + '">' + esc(f.nom) + '</div>'
            + '<div class="dt2">' + dateFr(f.modifie) + ' · ' + poids(f.octets) + '</div>'
            + '</div>';
        });
        h += '</div>';
      }

    } else {
      var m = Object.keys(A.choix).length;
      h += '<label for="a-nom">Nom du lot</label>'
        + '<input id="a-nom" type="text" value="' + esc(A.nom) + '" maxlength="80"'
        + ' placeholder="ex. Collection printemps">'
        + '<p class="aide">Les photos importées seront nommées « Nom 01 », « Nom 02 »… '
        + 'Laissé vide, on garde le nom d’origine.</p>'
        + '<label style="margin-top:.7rem">Que faut-il en faire&nbsp;?</label><div class="but">';
      BUTS.forEach(function(b){
        h += '<label class="' + (A.but === b[0] ? 'on' : '') + '">'
          + '<input type="radio" name="a-but" value="' + b[0] + '"' + (A.but === b[0] ? ' checked' : '') + '>'
          + '<span><strong>' + b[1] + '</strong><span class="d">' + b[2] + '</span></span></label>';
      });
      h += '</div>'
        + '<div class="franc" style="margin-top:.6rem"><b>L’ordre est imposé, et c’est voulu.</b> '
        + 'Demander un mannequin humain sur une photo brute donne un modèle qui porte le décor '
        + 'autant que le vêtement. Le fond part d’abord, puis le mannequin, et seulement ensuite '
        + 'la personne est engendrée.<br>'
        + '<b>Ce qui est déjà fait n’est pas refait</b> : une étape déjà présente est sautée, '
        + 'et la raison est inscrite au suivi et au journal.</div>'
        + '<p class="aide"><b>' + m + '</b> photo' + (m > 1 ? 's' : '') + ' à traiter.</p>';
    }

    h += '</div><div class="pi">'
      + '<button id="a-annuler">Annuler</button>'
      + '<span class="dr">'
      + (ASSIST.etape > 1 ? '<button id="a-prec">← Retour</button>' : '')
      + '<button class="prim" id="a-suiv">'
      + (ASSIST.etape === 3 ? 'Lancer le traitement' : 'Continuer →') + '</button>'
      + '</span></div></div></div>';
    return h;
  }

  function assistTriees(){
    var A = ASSIST;
    var l = A.fichiers.slice();
    if (A.tri === 'date') l.sort(function(a, b){ return (b.modifie || 0) - (a.modifie || 0); });
    else if (A.tri === 'date-vieux') l.sort(function(a, b){ return (a.modifie || 0) - (b.modifie || 0); });
    else if (A.tri === 'poids') l.sort(function(a, b){ return (b.octets || 0) - (a.octets || 0); });
    else l.sort(function(a, b){ return String(a.nom).localeCompare(String(b.nom), 'fr'); });
    return l;
  }

  function assistBrancher(){
    var A = ASSIST;
    Array.prototype.forEach.call(corps.querySelectorAll('[data-src]'), function(b){
      b.onclick = function(){ A.lecteur = b.getAttribute('data-src'); dessiner(); };
    });
    /* ⚠⚠ COCHER NE REDESSINE PLUS LA PLANCHE. Un redessin reconstruit tout le
       contenu : le defilement repartait EN HAUT a chaque photo cochee, et sur
       soixante-six vignettes il fallait redescendre a chaque fois. Un geste qui
       oblige a refaire le chemin qu on vient de parcourir n est pas un geste,
       c est une punition. On ne touche donc que la case cliquee et le compteur. */
    var vues = assistTriees();
    Array.prototype.forEach.call(corps.querySelectorAll('[data-i]'), function(b){
      b.onclick = function(){
        var f = vues[parseInt(b.getAttribute('data-i'), 10)];
        if (!f) return;
        var c = f.cle;
        if (A.choix[c]) { delete A.choix[c]; b.classList.remove('on'); }
        else { A.choix[c] = true; b.classList.add('on'); }
        var ck = b.querySelector('.ck');
        if (ck) ck.textContent = A.choix[c] ? '✓' : '';
        var nb = document.getElementById('a-nb');
        if (nb) nb.textContent = Object.keys(A.choix).length;
      };
    });
    var tri = document.getElementById('a-tri');
    if (tri) tri.onchange = function(){ A.tri = tri.value; dessiner(); };
    var majCases = function(){
      Array.prototype.forEach.call(corps.querySelectorAll('[data-i]'), function(b){
        var f = vues[parseInt(b.getAttribute('data-i'), 10)];
        if (!f) return;
        var on = !!A.choix[f.cle];
        b.classList.toggle('on', on);
        var ck = b.querySelector('.ck');
        if (ck) ck.textContent = on ? '✓' : '';
      });
      var nb = document.getElementById('a-nb');
      if (nb) nb.textContent = Object.keys(A.choix).length;
    };
    var tous = document.getElementById('a-tous');
    if (tous) tous.onclick = function(){
      A.fichiers.forEach(function(f){ A.choix[f.cle] = true; }); majCases();
    };
    var rien = document.getElementById('a-rien');
    if (rien) rien.onclick = function(){ A.choix = {}; majCases(); };
    var nom = document.getElementById('a-nom');
    if (nom) nom.oninput = function(){ A.nom = nom.value; };
    Array.prototype.forEach.call(corps.querySelectorAll('input[name="a-but"]'), function(r){
      r.onchange = function(){ A.but = r.value; dessiner(); };
    });
    var pe = document.getElementById('a-plein');
    if (pe) pe.onclick = function(){
      if (!P || !P.pleinEcran) { dire('Le plein écran n’existe que dans l’application.', 'att'); return; }
      P.pleinEcran().then(function(etat){
        // ⚠ Le bouton dit l ETAT REEL rendu par la fenetre, pas celui qu on
        // suppose : un plein ecran refuse par le systeme laisserait sinon un
        // bouton qui ment.
        pe.textContent = etat ? '⤡' : '⛶';
        pe.title = etat ? 'Quitter le plein écran' : 'Plein écran';
      });
    };

    var an = document.getElementById('a-annuler');
    if (an) an.onclick = assistFermer;
    var pr = document.getElementById('a-prec');
    if (pr) pr.onclick = function(){ A.etape = Math.max(1, A.etape - 1); dessiner(); };
    var sv = document.getElementById('a-suiv');
    if (sv) sv.onclick = assistSuivant;

    /* ══════════════════════════════════════════════════════════════════════
       LES APERÇUS SE CHARGENT EN FOND, ET SANS REDESSINER
       ⚠⚠ LA VERSION PRECEDENTE REDESSINAIT TOUT A CHAQUE VIGNETTE RECUE.
       Sur soixante-six photos, c est soixante-six reconstructions de la planche
       pendant qu on essaie de la parcourir : le defilement repartait en haut
       sans arret, et il devenait impossible d atteindre les dernieres. Une
       interface qui se derobe pendant qu on s en sert est pire qu une interface
       lente.
       On INJECTE donc chaque vignette dans sa case, et rien d autre ne bouge.
       ⚠ ET L ON DIT QUE CA CHARGE : << Aperçus 12 / 66 >>. Sans ce compte, les
       cases vides passent pour des photos illisibles.
       ⚠ TROIS A LA FOIS : en demander soixante-six d un coup ferait autant
       d allers-retours simultanes par le pont, qui sert aussi au reste de
       l application ; une a la fois serait inutilement lent.
       ══════════════════════════════════════════════════════════════════════ */
    if (ASSIST && ASSIST.etape === 2 && ASSIST.chargement) chargerApercus();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     L EXECUTION — import puis chaine de traitement, photo par photo
     ⚠ ON IMPORTE PUIS ON TRAITE, DANS LA MEME BOUCLE. Tout importer d abord
     laisserait, en cas d arret, une phototheque pleine de photos brutes qu on
     croit traitees. Chaque photo va au bout de son chemin avant qu on passe a la
     suivante.
     ══════════════════════════════════════════════════════════════════════════ */
  function assistLancer(){
    var A = ASSIST;
    var cles = Object.keys(A.choix);
    if (!cles.length) { dire('Choisissez au moins une photo.', 'att'); return; }
    if (occupeDeja('Traitement en lot')) return;

    var fichiers = assistTriees().filter(function(f){ return A.choix[f.cle]; });
    var nomLot = A.nom.trim();
    var but = A.but;
    var libelle = { detourage: 'Retrait du fond', fantome: 'Retrait du mannequin',
                    humain: 'Mannequin humain' }[but] || 'Traitement';
    var titres = fichiers.map(function(f, i){
      return nomLot ? (nomLot + ' ' + (i + 1 < 10 ? '0' : '') + (i + 1)) : f.nom;
    });

    var source = (A.lecteur === '@lib') ? 'photothèque' : ('clé ' + A.lecteur);
    ASSIST = null;
    VIGNETTES = {};
    occuper(libelle + ' · ' + fichiers.length + ' photo(s)…');
    suiviOuvrir(titres, libelle + ' · ' + fichiers.length + ' photo(s)');
    dessiner();

    /* ⚠⚠ LE LOT S OUVRE AVANT LA PREMIERE PHOTO ET SE CLOT APRES LA DERNIERE.
       C est ce qui fait qu un import est UN lot et non vingt — et donc ce qui
       permet de le DEFAIRE d un geste. Sans cette paire, chaque photo serait un
       lot d une photo, et l historique ne servirait a rien. */
    var lancerVraiment = function(){

    var faites = 0, sautees = 0, echecs = 0, abandon = 0;

    var suite = function(k){
      suiviCompte(k, fichiers.length);
      if (ANNULE && k < fichiers.length) {
        abandon = fichiers.length - k;
        for (var z = k; z < fichiers.length; z++) suiviLigne(z, 'echec', 'abandonnée');
        k = fichiers.length;
      }
      if (k >= fichiers.length) {
        appeler('lot:clore', []);
        liberer();
        var t = faites + ' traitée' + (faites > 1 ? 's' : '');
        if (sautees) t += ' · ' + sautees + ' déjà à jour';
        if (echecs) t += ' · ' + echecs + ' en échec';
        if (abandon) t += ' · ' + abandon + ' abandonnée' + (abandon > 1 ? 's' : '');
        suiviFin(t + '.', abandon ? (libelle + ' interrompu') : (libelle + ' terminé'));
        if (!echecs && !abandon) setTimeout(suiviFermer, 3000);
        dire(t + '.', echecs ? 'att' : 'bon');
        charger();
        return;
      }

      var f = fichiers[k];
      var nom = titres[k];
      suiviLigne(k, 'cours', 'en cours');

      var apresImport = function(id){
        suiviEtapes(k, [{ nom: 'import', ok: true },
                        { nom: libelle.toLowerCase(), etat: 'encours' }]);
        occuper(libelle + ' ' + (k + 1) + ' / ' + fichiers.length + '…');
        appeler('lot:traiter', [id, but, {}]).then(function(r){
          var eps = [{ nom: 'import', ok: true }];
          (r && r.etapes || []).forEach(function(e){
            eps.push({ nom: e.etape + (e.saute ? ' (sautée)' : ''), ok: e.ok,
                       chiffre: e.saute ? 'déjà fait'
                              : (e.ms ? (Math.round(e.ms / 100) / 10) + ' s' : (e.raison || '')) });
          });
          suiviEtapes(k, eps);
          if (r && r.ok) {
            var toutSaute = (r.etapes || []).every(function(e){ return e.saute; });
            if (toutSaute) { sautees++; suiviLigne(k, 'double', 'déjà à jour'); }
            else { faites++; suiviLigne(k, 'faite', 'traitée'); }
          } else {
            /* ⚠⚠ UN ECHEC SANS RAISON N EST PAS UN COMPTE RENDU. La ligne disait
               << echec >> et rien d autre quand la chaine s arretait AVANT sa
               premiere etape (droit refuse, photo introuvable, pont muet, delai
               depasse) : il ne restait qu a deviner. On rend donc TOUJOURS le
               motif, et le detail quand il y en a un — celui de Fal.ai le cas
               echeant, qui dit s il s agit d un credit epuise ou d une cle
               invalide. */
            echecs++;
            suiviLigne(k, 'echec', 'échec' + (r && r.arretA ? ' · ' + r.arretA : ''));
            if (!(r && r.etapes && r.etapes.length)) {
              suiviEtapes(k, [{ nom: 'import', ok: true },
                { nom: (r && r.motif) ? String(r.motif) : 'échec', ok: false,
                  chiffre: (r && r.detail) ? String(r.detail).slice(0, 120) : '' }]);
            }
            dire(expliquer(r), 'err');
          }
          suite(k + 1);
        });
      };

      if (f.id) {
        // Déjà dans la photothèque : rien à importer.
        suiviEtapes(k, [{ nom: 'déjà importée', ok: true }]);
        apresImport(f.id);
        return;
      }
      suiviEtapes(k, [{ nom: 'import', etat: 'encours' }]);
      occuper('Import ' + (k + 1) + ' / ' + fichiers.length + '…');
      appeler('lot:importer', [f.chemin, nom]).then(function(r){
        if (!r.ok) {
          echecs++;
          suiviLigne(k, 'echec', 'import refusé');
          suiviEtapes(k, [{ nom: 'import', ok: false, chiffre: (r.detail || r.motif || '') }]);
          suite(k + 1);
          return;
        }
        if (r.doublon) {
          /* ⚠ LE DOUBLON N EST PAS UN ECHEC : la photo est deja la, et on la
             TRAITE quand meme si son traitement manque. C est exactement le cas
             ou l on reimporte une carte pour rattraper ce qui n avait pas ete
             fait la premiere fois. */
          suiviEtapes(k, [{ nom: 'reconnue au contenu', ok: true, chiffre: r.code || '' }]);
          apresImport((r.photo && r.photo.id) || '');
          return;
        }
        apresImport((r.photo && r.photo.id) || '');
      });
    };
    suite(0);
    };
    /* Le lot est ouvert AVANT tout : la premiere photo doit deja le porter. */
    appeler('lot:ouvrir', [nomLot || (libelle + ' · ' + source), source]).then(lancerVraiment);
  }

  var APERCUS_EN_COURS = 0;

  /* ══════════════════════════════════════════════════════════════════════════
     LE PRE-CHARGEMENT DES APERCUS
     ⚠ TOUT EST LU AVANT QUE LA PLANCHE PARAISSE. Des cases qui se remplissent
     une a une pendant qu on choisit, c est un ecran qui bouge sous les doigts —
     et, avec le defilement, une planche qu on n arrive pas a parcourir.
     ⚠ QUATRE A LA FOIS : soixante-six d un coup feraient autant d allers-retours
     simultanes par le pont, qui sert aussi au reste de l application ; un a la
     fois serait inutilement lent.
     ⚠ ET LA LECTURE N IMPORTE RIEN : le message central le redit, parce que
     c est exactement le moment ou l on se demande ce qui est en train de se
     passer avec ses fichiers.
     ══════════════════════════════════════════════════════════════════════════ */
  function chargerApercus(){
    if (!ASSIST || ASSIST.etape !== 2 || !ASSIST.chargement) return;
    var A = ASSIST;
    var reste = A.fichiers.filter(function(f){
      return VIGNETTES[f.cle] === undefined && !f.enCours;
    });
    if (!reste.length && !APERCUS_EN_COURS) {
      A.chargement = false;
      dessiner();
      return;
    }
    var maj = document.getElementById('a-fait');
    if (maj) maj.textContent = A.fait;
    while (APERCUS_EN_COURS < 4 && reste.length) {
      var f = reste.shift();
      if (!f.chemin) {
        VIGNETTES[f.cle] = f.apercu || '';
        A.fait++;
        continue;
      }
      f.enCours = true;
      APERCUS_EN_COURS++;
      (function(fic){
        appeler('lot:vignette', [fic.chemin]).then(function(r){
          APERCUS_EN_COURS--;
          fic.enCours = false;
          VIGNETTES[fic.cle] = (r && r.ok) ? r.image : '';
          ORIENT[fic.cle] = (r && r.ok) ? (r.orientation || 1) : 1;
          if (ASSIST) ASSIST.fait++;
          chargerApercus();
        });
      })(f);
    }
    // ⚠ Le cas ou TOUT etait deja en memoire : sans ceci, la planche ne
    // paraitrait jamais faute d une reponse a attendre.
    if (!APERCUS_EN_COURS && !reste.length) { A.chargement = false; dessiner(); }
  }

  function assistSuivant(){
    var A = ASSIST;
    if (A.etape === 1) {
      if (!A.lecteur) { dire('Choisissez une source.', 'att'); return; }
      if (A.lecteur === '@lib') {
        // Les photos deja importees : la source, ce sont les lignes affichees.
        A.fichiers = (D.lignes || []).map(function(x){
          return { cle: x.id, id: x.id, nom: x.nom, octets: x.poids || 0,
                   modifie: 0, chemin: '', apercu: x.apercu || '' };
        });
        A.fichiers.forEach(function(f){ if (f.apercu) VIGNETTES[f.cle] = f.apercu; });
      } else {
        var src = null;
        (A.sources || []).forEach(function(x){ if (x.lecteur === A.lecteur) src = x; });
        A.fichiers = (src ? src.photos : []).map(function(f){
          return { cle: f.chemin, id: '', nom: f.nom, octets: f.octets,
                   modifie: f.modifie, chemin: f.chemin };
        });
      }
      A.choix = {};
      A.etape = 2;
      A.chargement = true;
      A.fait = 0;
      dessiner();
      return;
    }
    if (A.etape === 2) {
      if (!Object.keys(A.choix).length) { dire('Choisissez au moins une photo.', 'att'); return; }
      A.etape = 3;
      dessiner();
      return;
    }
    assistLancer();
  }



  /* ══════════════════════════════════════════════════════════════════════════
     LE TRAITEMENT EN LOT
     ⚠ LA FENETRE MENE LA SUITE, ELLE N ENVOIE PAS UN LOT EN BLOC. L operation
     photos:lot existe (c est la definition, et l ecran du site s en sert), mais
     l appeler d ici rendrait la main seulement a la fin : sur trente photos et
     deux echecs, on veut savoir LESQUELLES pendant que ca tourne. On boucle donc
     photo par photo et l on rend compte a chaque pas.
     ══════════════════════════════════════════════════════════════════════════ */
  /* ⚠⚠ CETTE LISTE S'APPELAIT « LOTS », COMME L'HISTORIQUE DES IMPORTS.
     Deux déclarations « var » du MÊME NOM dans un même fichier ne font qu'UNE
     variable : « var » est hissé, et la seconde écrase la première au
     chargement.
     L'écran des lots affichait donc CES TROIS TRAITEMENTS : « 3 lots », trois
     lignes « Sans nom », des compteurs vides, et un diagnostic qui annonçait
     « champs reçus : 0, 1, 2 » — les INDEX d'un tableau de trois chaînes, pas
     des noms de champs.
     ⚠ ET RIEN NE PROTESTAIT : c'est du JavaScript parfaitement légal. Le
     contrôle de syntaxe était vert, le garde-fou des fenêtres disait « tout est
     sain », et le défaut a été cherché dans la sérialisation du pont pendant
     deux versions. Le contrôle qui manquait est maintenant posé
     (tools/verifier-fenetres.js, § « un nom, une déclaration »). */
  var TRAITEMENTS_LOT = [
    ['detourage', 'Détourer', 'Isole le vêtement de son fond.'],
    ['fantome', 'Retirer le mannequin', 'Ne garde que le vêtement, col et manches reconstruits.'],
    ['humain', 'Mettre sur un mannequin', 'Fait porter le vêtement par une personne engendrée.'],
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     LE CHOIX DE LA MISE EN SCENE
     ⚠ LES NOMS PARTENT EN ANGLAIS PARCE QUE LE SERVICE LES ATTEND AINSI ; c est
     l ecran qui traduit, jamais la valeur envoyee. Traduire la valeur la ferait
     refuser, et le refus parlerait d un champ que personne n aurait ecrit.
     ⚠ ET LE SOURIRE EST COCHE PAR DEFAUT : sans consigne, le service rend un
     visage neutre, presque ferme — quelqu un qui a l air de subir la seance. Un
     vetement porte par une personne qui n a pas l air contente se vend moins
     bien. Ce n est pas un avis : les deux essais sont cote a cote.
     ══════════════════════════════════════════════════════════════════════════ */
  var SCENE = null;
  var SCENE_IDS = null;
  var MODELES_SC = [['sophia','Sophia'],['emma','Emma'],['ava','Ava'],['zoe','Zoé'],
    ['maya','Maya'],['lena','Lena'],['julia','Julia'],['fiona','Fiona'],
    ['avery','Avery'],['taylor','Taylor'],['kendall','Kendall'],['casey','Casey'],
    ['jordan','Jordan'],['sam','Sam'],['reece','Reece'],['jackson','Jackson']];
  var POSES_SC = [['34turn','Trois-quarts (met la coupe en valeur)'],
    ['standing','Debout, de face'],['adjustingclothing','Ajuste son vêtement'],
    ['handinpocket','Main dans la poche'],['crossedarms','Bras croisés'],
    ['walkingforward','En marche'],['powerstance','Posture assurée'],
    ['overtheshoulder','Regard par-dessus l’épaule'],['playfulspin','Tour sur soi'],
    ['seated','Assise'],['back','De dos'],['random','Au hasard']];
  var DECORS_SC = [['studio','Studio'],['street','Rue'],['beach','Bord de mer'],
    ['sunset','Coucher de soleil'],['forest','Forêt'],['bedroom','Chambre'],
    ['library','Bibliothèque'],['mountain','Montagne'],['pool','Piscine'],
    ['factory','Friche industrielle']];

  function sceneOuvrir(ids){ SCENE_IDS = ids; SCENE = null; SCENE_OUVERT = true; dessiner(); }
  function sceneFermer(){ SCENE_OUVERT = false; SCENE_IDS = null; dessiner(); }
  var SCENE_OUVERT = false;

  function liste_(id, options, choisi){
    return '<select id="' + id + '">' + options.map(function(o){
      return '<option value="' + esc(o[0]) + '"' + (o[0] === choisi ? ' selected' : '')
        + '>' + esc(o[1]) + '</option>';
    }).join('') + '</select>';
  }

  function sceneHtml(){
    var n = SCENE_IDS ? SCENE_IDS.length : 0;
    return '<div class="asst"><div class="bo">'
      + '<div class="tt"><h3>Mise en scène</h3>'
      + '<span class="pas">' + n + ' photo' + (n > 1 ? 's' : '') + '</span></div>'
      + '<div class="co">'
      + '<div class="ch"><label>Mannequin</label>' + liste_('sc-mod', MODELES_SC, 'sophia') + '</div>'
      + '<div class="ch"><label>Pose</label>' + liste_('sc-pose', POSES_SC, '34turn') + '</div>'
      + '<div class="ch"><label>Décor</label>' + liste_('sc-dec', DECORS_SC, 'studio') + '</div>'
      + '<div class="ch"><label><input type="checkbox" id="sc-sourire" checked> '
      + 'Sourire naturel, regard vers l’objectif</label></div>'
      + '<div class="aide">Cette image est ENGENDRÉE : la personne, la pose et le décor '
      + 'n’ont jamais existé. À réserver à la mise en scène — jamais pour montrer '
      + 'l’état réel d’un article.</div>'
      + '</div>'
      + '<div class="pied"><button id="sc-non">Annuler</button>'
      + '<button class="prim" id="sc-go">Lancer sur ' + n + ' photo' + (n > 1 ? 's' : '') + '</button>'
      + '</div></div></div>';
  }

  function barreLot(){
    var n = nbChoisies();
    if (!n || !D.peutModifier) return '';
    return '<div class="lot"><span class="cnt">' + n + ' photo' + (n > 1 ? 's' : '')
      + ' choisie' + (n > 1 ? 's' : '') + '</span>'
      + TRAITEMENTS_LOT.map(function(l){
          return '<button class="mini" data-lot="' + l[0] + '" title="' + esc(l[2]) + '">' + l[1] + '</button>';
        }).join('')
      + '<button class="mini" data-lot="pivot" title="Pivoter d’un quart de tour vers la droite">⟳ Pivoter</button>'
      + '<button class="mini dgr" id="p-lot-sup">'
      + (SUP_LOT_ARME ? 'Confirmer — supprimer ' + n + ' ?' : 'Supprimer') + '</button>'
      + '<button class="mini" id="p-rien">Tout décocher</button>'
      + '<span class="av">Les deux derniers traitements <strong>engendrent</strong> une image&nbsp;: '
      + 'l’original est conservé à côté.</span></div>';
  }

  function lancerLot(quoi){
    var ids = Object.keys(CHOIX);
    if (!ids.length) return;
    /* ⚠ LA ROTATION N EST PAS UN TRAITEMENT PAR MODELE : elle est locale,
       instantanee et gratuite. La faire passer par la meme porte donnerait des
       lignes de journal Fal.ai pour un geste qui n a rien coute. */
    if (quoi === 'pivot') { lancerPivot(ids); return; }
    /* ⚠⚠ LA MISE EN SCENE SE CHOISIT AVANT, PAS APRES. Un mannequin humain fixe
       une personne, une pose et un decor ; les subir puis recommencer, c est
       payer deux fois pour decouvrir qu on voulait autre chose. Les autres
       traitements, eux, n ont rien a choisir : leur demander un panneau serait
       un clic de plus pour rien. */
    if (quoi === 'humain' && !SCENE) { sceneOuvrir(ids); return; }
    if (occupeDeja('Traitement en lot')) return;
    /* ⚠ LES NOMS VIENNENT DU CHOIX, PAS DE LA PAGE : une photo cochee page 1 et
       traitee depuis la page 4 doit garder son nom dans le suivi. */
    var titres = ids.map(function(i){
      var c = CHOIX[i];
      return (c && c.code) ? (c.code + ' · ' + c.nom) : ((c && c.nom) || i);
    });
    var nomLot = { detourage: 'Détourage', fantome: 'Retrait du mannequin',
                   humain: 'Mise sur un mannequin' }[quoi] || 'Traitement';
    occuper(nomLot + ' de ' + ids.length + ' photo' + (ids.length > 1 ? 's' : '') + '…');
    suiviOuvrir(titres, nomLot + ' · ' + ids.length + ' photo(s)');
    var faites = 0, echecs = 0, replis = 0, abandon = 0;
    var suite = function(k){
      suiviCompte(k, ids.length);
      /* ⚠ ON S ARRETE ENTRE DEUX PHOTOS. L appel deja parti au modele va au
         bout : il est deja facture, l interrompre ne rendrait pas l argent,
         seulement le resultat. */
      if (ANNULE && k < ids.length) {
        abandon = ids.length - k;
        for (var z = k; z < ids.length; z++) suiviLigne(z, 'echec', 'abandonnée');
        k = ids.length;
      }
      if (k >= ids.length) {
        liberer();
        var t = faites + ' traitée' + (faites > 1 ? 's' : '');
        if (replis) t += ' · ' + replis + ' en repli local';
        if (echecs) t += ' · ' + echecs + ' en échec';
        if (abandon) t += ' · ' + abandon + ' abandonnée' + (abandon > 1 ? 's' : '');
        suiviFin(t + '.', abandon ? (nomLot + ' interrompu') : (nomLot + ' terminé'));
        if (!echecs && !replis && !abandon) setTimeout(suiviFermer, 2500);
        dire(t + '.', echecs ? 'att' : 'bon');
        CHOIX = {};
        charger();
        return;
      }
      suiviLigne(k, 'cours', 'en cours');
      suiviEtapes(k, [{ nom: 'envoi au modèle', etat: 'encours' }]);
      occuper('Traitement ' + (k + 1) + ' / ' + ids.length + '…');
      appeler('photos:traiter', [ids[k], quoi, (quoi === 'humain' && SCENE) ? SCENE : {}]).then(function(r){
        if (r && r.ok) {
          faites++;
          if (r.par === 'canevas') replis++;
          suiviLigne(k, r.par === 'canevas' ? 'double' : 'faite',
            r.par === 'canevas' ? 'repli local' : 'traitée');
          suiviEtapes(k, [
            { nom: (r.par === 'canevas' ? 'détourage local' : 'modèle'), ok: true,
              chiffre: r.ms ? (Math.round(r.ms / 100) / 10) + ' s' : '' },
            { nom: 'dépôt', ok: true },
          ]);
        } else {
          echecs++;
          suiviLigne(k, 'echec', 'refusée');
          suiviEtapes(k, [{ nom: 'modèle', ok: false,
                            chiffre: (r && (r.detail || r.motif)) || '' }]);
        }
        suite(k + 1);
      });
    };
    suite(0);
  }

  function lancerPivot(ids){
    if (occupeDeja('Rotation')) return;
    var titres = ids.map(function(i){
      var c = CHOIX[i];
      return (c && c.code) ? (c.code + ' · ' + c.nom) : ((c && c.nom) || i);
    });
    occuper('Rotation de ' + ids.length + ' photo(s)…');
    suiviOuvrir(titres, 'Rotation · ' + ids.length + ' photo(s)');
    var faits = 0, rates = 0, perdus = 0, abandon = 0;
    var pas = function(k){
      suiviCompte(k, ids.length);
      if (ANNULE && k < ids.length) {
        abandon = ids.length - k;
        for (var z = k; z < ids.length; z++) suiviLigne(z, 'echec', 'abandonnée');
        k = ids.length;
      }
      if (k >= ids.length) {
        liberer();
        var t = faits + ' pivotée' + (faits > 1 ? 's' : '');
        if (perdus) t += ' · ' + perdus + ' traitement(s) à refaire';
        if (rates) t += ' · ' + rates + ' en échec';
        if (abandon) t += ' · ' + abandon + ' abandonnée' + (abandon > 1 ? 's' : '');
        suiviFin(t + '.', abandon ? 'Rotation interrompue' : 'Rotation terminée');
        if (!rates && !abandon) setTimeout(suiviFermer, 2500);
        dire(t + '.', rates ? 'att' : 'bon');
        charger();
        return;
      }
      suiviLigne(k, 'cours', 'en cours');
      appeler('photos:pivoter', [ids[k], 90]).then(function(r){
        if (r && r.ok) {
          faits++;
          perdus += (r.perdus || 0);
          suiviLigne(k, 'faite', 'pivotée');
          suiviEtapes(k, [{ nom: 'rotation', ok: true },
            (r.perdus ? { nom: 'traitements écartés', ok: true, chiffre: r.perdus + ' à refaire' }
                      : { nom: 'dépôt', ok: true })]);
        } else {
          rates++;
          suiviLigne(k, 'echec', 'refusée');
          suiviEtapes(k, [{ nom: 'rotation', ok: false, chiffre: (r && (r.detail || r.motif)) || '' }]);
        }
        pas(k + 1);
      });
    };
    pas(0);
  }

  function opt(v, l){
    return '<option value="' + v + '"' + (TRI === v ? ' selected' : '') + '>' + l + '</option>';
  }
  function tuile(n, l){
    return '<div class="s"><div class="n">' + (n || 0) + '</div><div class="l">' + l + '</div></div>';
  }

  function vignette(r){
    if (r.apercu) return '<div class="vign"><img src="' + esc(r.apercu) + '" alt=""></div>';
    /* Pas d aperçu = l image n a pas atteint le stockage. On le DIT : un cadre
       vide passerait pour une photo perdue. */
    return '<div class="vign"><span class="att">non<br>rangée</span></div>';
  }
  /* ⚠ LE NOM DES TRAITEMENTS, TEL QU'ON L'A CLIQUÉ. La ligne annonçait
     « isolée » quel que soit le traitement subi : on retirait un mannequin et
     l'écran continuait de parler de détourage. Un verdict doit nommer ce qui a
     eu lieu, sinon il ne vaut rien comme verdict. */
  var NOM_TRAIT = { detourage: 'détourée', fantome: 'sans mannequin', humain: 'sur mannequin' };
  function traits(r){ return (r.faits || []).map(function(f){ return NOM_TRAIT[f] || f; }); }

  function etat(r){
    if (r.enAttente) return '<span class="pill err">non rangée</span>';
    var t = traits(r);
    var h = t.map(function(x){ return '<span class="pill att">' + esc(x) + '</span>'; }).join(' ');
    if (!h && r.isole) h = '<span class="pill att">détourée</span>';
    if (r.lieId) h = '<span class="pill bon">attachée</span>' + (h ? ' ' + h : '');
    return h || '<span class="pill neutre">' + esc(r.statut || 'importée') + '</span>';
  }
  function gain(r){
    var t = poids(r.poids);
    if (r.poidsSrc && r.poids && r.poids < r.poidsSrc * 0.95) {
      t += ' <span class="gain">−' + Math.round((1 - r.poids / r.poidsSrc) * 100) + ' %</span>';
    }
    return t;
  }
  /* ══════════════════════════════════════════════════════════════════════════
     UNE LIGNE = TOUTES LES ACTIONS DE CETTE PHOTO
     ⚠⚠ AVANT, IL FALLAIT OUVRIR LE PANNEAU POUR TOUT. Renommer, supprimer,
     detourer : trois clics chacun, et un panneau a refermer entre deux. Sur
     trente photos, c est quatre-vingt-dix clics pour un travail qui en vaut
     trente. Les gestes courants sont donc SUR la ligne.
     ⚠ LE NOM SE MODIFIE SUR PLACE : un champ, entree pour valider, echap pour
     renoncer. Ouvrir une fenetre pour changer un mot est disproportionne.
     ⚠ LA SUPPRESSION S ARME sur la ligne meme — le second clic est a l endroit
     ou l on vient de cliquer, pas dans une boite qui parait ailleurs.
     ══════════════════════════════════════════════════════════════════════════ */
  function ligne(r){
    var ro = !D.peutModifier;
    var arme = (SUPPR_ARME === r.id);
    var act = ro ? '' : ('<span class="act">'
      + '<button class="ic" data-ren="' + esc(r.id) + '" title="Renommer">✎</button>'
      + '<button class="ic" data-t1="' + esc(r.id) + '" title="Détourer le vêtement">✂</button>'
      + '<button class="ic" data-t2="' + esc(r.id) + '" title="Retirer le mannequin">◍</button>'
      + '<button class="ic" data-t3="' + esc(r.id) + '" title="Mettre sur un mannequin">☖</button>'
      + '<button class="ic" data-piv="' + esc(r.id) + '" title="Pivoter d’un quart de tour">⟳</button>'
      + '<button class="ic" data-ouvre="' + esc(r.id) + '" title="Ouvrir la fiche (fond, article, export)">⋯</button>'
      + '<button class="ic sup' + (arme ? ' arme' : '') + '" data-sup="' + esc(r.id) + '"'
      + ' title="' + (arme ? 'Cliquez encore pour supprimer' : 'Supprimer') + '">'
      + (arme ? '!' : '✕') + '</button>'
      + '</span>');
    return '<tr data-id="' + esc(r.id) + '"' + (CHOIX[r.id] ? ' class="on"' : '') + '>'
      + '<td><input type="checkbox" class="chx" data-chx="' + esc(r.id) + '"'
      + (CHOIX[r.id] ? ' checked' : '') + '></td>'
      + '<td>' + vignette(r) + '</td>'
      + '<td><span class="num">' + esc(r.code) + '</span></td>'
      + '<td class="nom">' + (RENOMME === r.id
          ? '<input class="ren" id="p-ren" type="text" value="' + esc(r.nom) + '" maxlength="120">'
          : '<span class="txt" data-ren2="' + esc(r.id) + '" title="Cliquez pour renommer">' + esc(r.nom) + '</span>')
      + '</td>'
      + '<td>' + (r.lieId
          ? esc(r.lieNom) + (r.lieSku ? ' <span class="dt">· ' + esc(r.lieSku) + '</span>' : '')
          : '<span class="dt">—</span>') + '</td>'
      + '<td class="num">' + gain(r) + '</td>'
      + '<td>' + etat(r) + '</td>'
      + '<td>' + act + '</td></tr>';
  }

  /* ── LE PANNEAU DE DETAIL ──────────────────────────────────────────────── */
  function boiteDetail(){
    var r = DETAIL;
    var ro = !D.peutModifier;
    /* ⚠ LE CODE RESTE, LE NOM SE CHANGE. << PH-000001 >> est ce qu on retrouve
       sur une fiche produit, dans un journal et sur une etiquette imprimee : le
       laisser bouger casserait la seule chose qui relie tout cela. */
    var h = '<div class="voile" id="p-voile"><div class="boite">'
      + '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.4rem">'
      + '<span class="dt" style="flex:1 1 auto">Inspecteur</span>'
      + '<button class="mini" id="p-fermer-insp" title="Fermer le panneau">✕</button></div>'
      + '<h3><span class="num">' + esc(r.code) + '</span> '
      + (ro ? esc(r.nom)
            : '<input id="p-nom" type="text" value="' + esc(r.nom) + '" maxlength="120"'
              + ' style="width:auto;min-width:14rem;font:inherit" title="Renommer cette photo">'
              + ' <button class="mini" id="p-nom-ok">Renommer</button>')
      + ' ' + etat(r) + '</h3>'
      + '<div class="apercu">'
      + (r.apercu ? '<img src="' + esc(r.apercu) + '" alt="">'
                  : '<span class="aide" style="padding:1rem;text-align:center">Cette photo n’a pas atteint le stockage.<br>'
                    + 'Elle reste ouverte dans la fenêtre principale ; réessayez l’import.</span>')
      + '</div>'
      + '<div class="grille">'
      + '<div><div class="l">Poids rangé</div><div class="v">' + gain(r) + '</div></div>'
      + (r.poidsSrc ? '<div><div class="l">Avant compression</div><div class="v">' + poids(r.poidsSrc) + '</div></div>' : '')
      + '<div><div class="l">Traitements</div><div class="v">'
      + (traits(r).join(' · ') || (r.isole ? 'détourée' : 'aucun')) + '</div></div>'
      + (r.lieId ? '<div><div class="l">Article</div><div class="v">' + esc(r.lieNom)
          + (r.lieSku ? ' · ' + esc(r.lieSku) : '') + '</div></div>' : '')
      + '</div>';

    if (!ro && r.isole && (D.fonds || []).length) {
      h += '<div class="l" style="font-size:.62rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8">Fond</div>'
        + '<div class="jetons">'
        + '<button data-fond="__transp" class="' + (!r.fond || r.fond === '__transp' ? 'on' : '') + '">Transparent</button>'
        + D.fonds.map(function(f){
            return '<button data-fond="' + esc(f.cle) + '" class="' + (r.fond === f.cle ? 'on' : '') + '">'
              + esc(f.libelle) + '</button>';
          }).join('')
        + '<button id="p-fondperso" class="' + (r.fond === '__custom' ? 'on' : '') + '">+ Mon fond…</button>'
        + '</div>';
    }

    if (ATTACHE) {
      h += '<div class="carte" style="margin-top:.4rem">'
        + '<input type="search" id="p-pq" placeholder="Chercher un article (nom ou SKU)…" '
        + 'value="' + esc(PQ) + '" style="width:100%">'
        + '<div class="choix" id="p-choix">' + listeProduits() + '</div></div>';
    }

    h += '<div class="pied-boite">'
      + (ro ? '' : '<button class="danger" id="p-suppr">'
          + (SUPPR_ARME_INSP ? 'Confirmer le retrait ?' : '✕ Retirer de la médiathèque') + '</button>')
      + (D.bureau ? '<button id="p-enreg">⤓ Enregistrer le fichier</button>' : '')
      + (ro || r.isole ? '' : '<button class="prim" id="p-isoler">✂ Isoler le vêtement</button>')
      + (ro ? '' : '<button class="' + (r.isole ? 'prim' : '') + '" id="p-attacher">'
          + (ATTACHE ? 'Annuler l’attache' : '⚭ Attacher à un article') + '</button>')
      + '<button id="p-fermer">Fermer</button>'
      + '</div>';

    if (SUPPR_ARME_INSP) {
      h += '<div class="aide" style="margin-top:.5rem">'
        + (r.lieId
            ? 'Cette photo est attachée à <strong>' + esc(r.lieNom) + '</strong>. La fiche de l’article '
              + 'garde son image : elle en possède sa propre copie. Seule l’entrée de la médiathèque disparaît.'
            : 'Le fichier devenu inutile est effacé du stockage par le ménage automatique, après sept jours.')
        + '</div>';
    }

    h += '</div></div>';
    return h;
  }

  function listeProduits(){
    if (!PRODUITS) return '<div class="aide" style="padding:.4rem">Lecture du catalogue…</div>';
    if (!PRODUITS.length) return '<div class="aide" style="padding:.4rem">Aucun article ne correspond.</div>';
    return PRODUITS.map(function(p){
      return '<div class="p" data-pid="' + esc(p.id) + '">'
        + (p.image ? '<img src="' + esc(p.image) + '" alt="">' : '<span class="creux"></span>')
        + '<div style="min-width:0"><div class="nm">' + esc(p.nom) + '</div>'
        + '<div class="sk">' + esc(p.sku || 'sans SKU') + (p.enVente ? '' : ' · hors vente') + '</div></div></div>';
    }).join('');
  }

  /* ── IMPORT ────────────────────────────────────────────────────────────── */
  /* ⚠ UNE PHOTO A LA FOIS, ET ON DIT LAQUELLE. En parallele, dix lectures de
     fichier et dix depots simultanes encombreraient le pont et l on ne saurait
     plus laquelle a echoue. La progression est ANNONCEE : un import muet de
     sept photos passe pour un ecran fige. */
  function lireFichier(f){
    return new Promise(function(res){
      var r = new FileReader();
      r.onload = function(){ res(String(r.result || '')); };
      r.onerror = function(){ res(''); };
      r.readAsDataURL(f);
    });
  }
  /* ══════════════════════════════════════════════════════════════════════════
     LE SUIVI D IMPORT
     ⚠ IL SURVIT A LA FIN DU TRAVAIL. Un suivi qui disparait au dernier fichier
     ne sert qu a celui qui regardait l ecran ; celui qui revient deux minutes
     plus tard n a aucun moyen de savoir laquelle des douze photos a ete refusee.
     Il se ferme a la main.
     ══════════════════════════════════════════════════════════════════════════ */
  var SUIVI = null;

  /* ══════════════════════════════════════════════════════════════════════════
     LE CONTROLE DE SUIVI — visible, chiffre, et ANNULABLE
     --------------------------------------------------------------------------
     ⚠ LA JAUGE AVANCE PAR TACHE TERMINEE, jamais toute seule. Une barre qui
     glisse pendant qu il ne se passe rien est un mensonge poli : on la regarde,
     on croit que ca avance, et l on decouvre l arret cinq minutes plus tard.

     ⚠⚠ CE QUE << ANNULER >> FAIT VRAIMENT, ET QUE L ECRAN DIT : la tache EN
     COURS va jusqu au bout — un appel deja parti au modele est deja facture, et
     l interrompre ne rendrait pas l argent, seulement le resultat. Ce sont les
     SUIVANTES qui sont abandonnees. Promettre un arret immediat serait plus
     agreable et faux.
     ══════════════════════════════════════════════════════════════════════════ */
  var ANNULE = false;

  function suiviOuvrir(noms, titre){
    if (SUIVI && SUIVI.parentNode) SUIVI.parentNode.removeChild(SUIVI);
    SUIVI = null;
    DERNIER_SUIVI = '';
    ANNULE = false;
    var d = document.createElement('div');
    d.className = 'suivi';
    d.innerHTML = '<div class="st"><span id="sv-t">' + esc(titre || 'Import en cours')
      + '</span><span class="n" id="sv-n">0 / ' + noms.length + '</span></div>'
      + '<div class="lst" id="sv-l">'
      + noms.map(function(n, i){
          return '<div class="lg" id="sv-' + i + '"><span class="nm">' + esc(n)
            + '</span><span class="et attente">en attente</span>'
            + '<span class="ep" id="sv-e-' + i + '"></span></div>';
        }).join('')
      + '</div><div class="pd" id="sv-p">'
      + '<div class="jauge"><i id="sv-j" style="width:0%"></i></div>'
      + '<span class="pc" id="sv-pc">0 %</span><span id="sv-r">Préparation…</span>'
      + '<span class="bt">'
      + '<button class="mini dgr" id="sv-a">Annuler</button>'
      + '<button class="mini" id="sv-x">Fermer</button></span></div>';
    document.body.appendChild(d);
    SUIVI = d;
    var x = document.getElementById('sv-x');
    if (x) x.onclick = suiviFermer;
    var a = document.getElementById('sv-a');
    if (a) a.onclick = function(){
      ANNULE = true;
      a.disabled = true;
      if (SUIVI) SUIVI.className = 'suivi annule';
      var r = document.getElementById('sv-r');
      if (r) r.textContent = 'Annulation… la tâche en cours se termine, les suivantes sont abandonnées.';
      dire('Annulation demandée — la tâche en cours va au bout, les suivantes sont abandonnées.', 'att');
    };
  }
  /* ⚠⚠ FERMER NE DOIT PAS VOULOIR DIRE PERDRE. Le compte rendu disparaissait
     pour de bon : on fermait le panneau, on voulait revoir LAQUELLE des trente
     photos avait echoue, et il n y avait plus rien. Un rapport qu on ne peut
     consulter qu une fois n est pas un rapport.
     On garde donc son contenu, et un bouton le rouvre — en LECTURE : le travail,
     lui, est fini. */
  var DERNIER_SUIVI = '';

  function suiviFermer(){
    if (SUIVI) {
      try { DERNIER_SUIVI = SUIVI.innerHTML; } catch (e) { DERNIER_SUIVI = ''; }
      if (SUIVI.parentNode) SUIVI.parentNode.removeChild(SUIVI);
    }
    SUIVI = null;
    dessiner();
  }

  function suiviRouvrir(){
    if (!DERNIER_SUIVI) return;
    if (SUIVI && SUIVI.parentNode) SUIVI.parentNode.removeChild(SUIVI);
    var d = document.createElement('div');
    d.className = 'suivi';
    d.innerHTML = DERNIER_SUIVI;
    document.body.appendChild(d);
    SUIVI = d;
    // ⚠ Le bouton d annulation d un travail TERMINE n a plus de sens : on le
    // retire plutot que de le laisser inerte.
    var a = document.getElementById('sv-a');
    if (a) a.remove();
    var x = document.getElementById('sv-x');
    if (x) x.onclick = suiviFermer;
  }
  function suiviLigne(i, etat, mot){
    if (!SUIVI) return;
    var l = document.getElementById('sv-' + i);
    if (!l) return;
    var e = l.querySelector('.et');
    if (e) { e.className = 'et ' + etat; e.textContent = mot; }
    if (etat === 'cours') l.scrollIntoView({ block: 'nearest' });
  }
  /* Les etapes d une ligne. L etat << encours >> marque celle qui tourne ; les autres
     portent leur verdict ET leur mesure. */
  function suiviEtapes(i, etapes){
    var z = document.getElementById('sv-e-' + i);
    if (!z) return;
    z.innerHTML = (etapes || []).map(function(e){
      var c = (e.etat === 'encours') ? 'encours' : (e.ok ? 'ok' : 'non');
      var m = (e.etat === 'encours') ? '…' : (e.ok ? '✓' : '✕');
      return '<i class="' + c + '">' + m + ' ' + esc(e.nom)
        + (e.chiffre ? ' ' + esc(e.chiffre) : '') + '</i>';
    }).join('');
  }
  function suiviCompte(fait, total){
    var n = document.getElementById('sv-n');
    if (n) n.textContent = fait + ' / ' + total;
    var pct = total ? Math.round(fait * 100 / total) : 0;
    var j = document.getElementById('sv-j');
    if (j) j.style.width = pct + '%';
    var p = document.getElementById('sv-pc');
    if (p) p.textContent = pct + ' %';
  }
  function suiviFin(mot, titre){
    var r = document.getElementById('sv-r');
    if (r) r.textContent = mot;
    var t = document.getElementById('sv-t');
    if (t) t.textContent = titre || 'Terminé';
    var a = document.getElementById('sv-a');
    if (a) a.remove();
  }

  function importer(fichiers){
    if (!D || !D.peutModifier) { dire(MOTIFS.droit, 'err'); return; }
    var liste = [];
    for (var i = 0; i < fichiers.length; i++) {
      if (/^image\\//.test(fichiers[i].type || '')) liste.push(fichiers[i]);
    }
    if (!liste.length) { dire('Aucune image dans ce dépôt (JPG, PNG ou WebP).', 'att'); return; }
    if (occupeDeja('Import')) return;
    var champLot = document.getElementById('p-lot-nom');
    if (champLot) LOT_NOM = champLot.value.trim();
    /* Le nom donne a chaque fichier : << Robe ete 01 >>, << Robe ete 02 >>…
       ⚠ LE SUFFIXE EST SUR DEUX CHIFFRES ET SUIT L ORDRE DU DEPOT : c est ce qui
       fait qu un tri alphabetique rend le meme ordre que celui qu on a choisi en
       glissant les fichiers. Sans zero devant, << 10 >> passerait avant << 2 >>. */
    var nommer = function(f, i){
      if (!LOT_NOM) return f.name;
      var n = String(i + 1);
      return LOT_NOM + ' ' + (n.length < 2 ? '0' + n : n);
    };
    occuper('Préparation de l’import…');
    /* ⚠ MEME UN GLISSER-DEPOSER EST UN LOT. Sans cela, l historique ne montrerait
       que les imports passes par l assistant, et l on ne pourrait pas defaire un
       depot fait a la main — c est-a-dire le plus courant. */
    appeler('lot:ouvrir', [LOT_NOM || ('Import du ' + new Date().toLocaleDateString('fr-CA')), 'fichiers']);
    suiviOuvrir(liste.map(function(f, i){ return nommer(f, i); }),
      (LOT_NOM ? ('Import · ' + LOT_NOM) : 'Import') + ' · ' + liste.length + ' photo(s)');
    var faites = 0, doubles = 0, refuses = 0, echoues = 0;
    var abandonnees = 0;
    var suite = function(k){
      suiviCompte(k, liste.length);
      /* ⚠ ON S ARRETE ENTRE DEUX FICHIERS, jamais au milieu d un : un fichier a
         moitie envoye laisserait une entree sans image. */
      if (ANNULE && k < liste.length) {
        abandonnees = liste.length - k;
        for (var z = k; z < liste.length; z++) suiviLigne(z, 'echec', 'abandonnée');
        k = liste.length;
      }
      if (k >= liste.length) {
        appeler('lot:clore', []);
        liberer();
        var t = faites + ' importée' + (faites > 1 ? 's' : '');
        if (doubles) t += ' · ' + doubles + ' déjà présente' + (doubles > 1 ? 's' : '');
        if (refuses) t += ' · ' + refuses + ' trop lourde' + (refuses > 1 ? 's' : '');
        if (echoues) t += ' · ' + echoues + ' en échec';
        if (abandonnees) t += ' · ' + abandonnees + ' abandonnée' + (abandonnees > 1 ? 's' : '');
        suiviFin(t + '.', abandonnees ? 'Import interrompu' : 'Import terminé');
        /* ⚠ IL SE FERME TOUT SEUL QUAND TOUT EST PASSE (demande du 2026-08-09) :
           il n y a rien a y lire, et un panneau qui reste apres coup encombre.
           ⚠ MAIS IL RESTE DES QU IL Y A QUELQUE CHOSE A VOIR — un echec, une
           trop lourde, un doublon. C est precisement le cas ou l on veut savoir
           LAQUELLE, et le faire disparaitre effacerait la seule reponse. */
        if (!echoues && !refuses && !doubles && !abandonnees) setTimeout(suiviFermer, 2500);
        dire(t + '.', (echoues || refuses) ? 'att' : 'bon');
        charger();
        return;
      }
      var f = liste[k];
      if (f.size > MAX_OCTETS) {
        refuses++;
        suiviLigne(k, 'echec', 'trop lourde');
        suite(k + 1); return;
      }
      suiviLigne(k, 'cours', 'en cours');
      suiviEtapes(k, [{ nom: 'lecture', etat: 'encours' }]);
      // Chaque fichier relance le chien de garde : c est le TRAVAIL qui doit
      // avancer, pas l ensemble qui doit tenir dans une minute.
      occuper('Import ' + (k + 1) + ' / ' + liste.length + ' · ' + f.name + '…');
      lireFichier(f).then(function(data){
        if (!data) {
          echoues++;
          suiviLigne(k, 'echec', 'illisible');
          suiviEtapes(k, [{ nom: 'lecture', ok: false }]);
          suite(k + 1); return;
        }
        suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) },
                        { nom: 'compression', etat: 'encours' }]);
        appeler('photos:importer', [nommer(f, k), data, f.size]).then(function(r){
          /* ⚠ LES ETAPES VIENNENT DU COEUR, pas d une supposition d ici : c est
             lui qui compresse et qui depose, et lui seul sait ce que ca a donne. */
          if (r && r.etapes) {
            suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) }].concat(
              r.etapes.map(function(e){
                return { nom: e.nom, ok: e.ok,
                  chiffre: (e.nom === 'compression' && e.avant)
                    ? (poids(e.avant) + ' → ' + poids(e.apres))
                    : (e.detail || '') };
              })));
          }
          if (r && r.ok && r.doublon) {
            suiviEtapes(k, [{ nom: 'lecture', ok: true, chiffre: poids(f.size) },
                            { nom: 'reconnue au contenu', ok: true, chiffre: r.code || '' }]);
            /* ⚠ RECONNUE A SON CONTENU, PAS A SON NOM — et l on donne le CODE de
               celle qui existe deja : << deja presente >> tout court n aide
               personne a la retrouver. */
            doubles++;
            suiviLigne(k, 'double', 'déjà là · ' + (r.code || ''));
          } else if (r && r.ok) {
            faites++;
            suiviLigne(k, r.rangee ? 'faite' : 'echec', r.rangee ? 'importée' : 'non rangée');
            if (!r.rangee) { echoues++; faites--; }
          } else {
            echoues++;
            suiviLigne(k, 'echec', 'refusée');
            dire(expliquer(r), 'err');
          }
          suite(k + 1);
        });
      });
    };
    suite(0);
  }

  function choisirFichiers(){
    var e = document.createElement('input');
    e.type = 'file'; e.accept = 'image/*'; e.multiple = true;
    e.onchange = function(){ if (e.files && e.files.length) importer(e.files); };
    e.click();
  }

  /* ── LES GESTES ────────────────────────────────────────────────────────── */
  function rouvrir(photo){
    /* Le panneau reste ouvert sur la MEME photo apres un geste : la refermer
       obligerait a la rechercher pour poser un fond apres l avoir isolee. */
    if (photo) DETAIL = photo;
    charger();
  }

  function isoler(){
    if (occupeDeja('Opération')) return;
    occuper('Isolation du vêtement… (quelques secondes)');
    appeler('photos:isoler', [DETAIL.id]).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      /* ⚠ ON DIT PAR QUOI. Le detourage local devine l arriere-plan a partir des
         pixels de bordure : sur une photo reelle il mange le vetement ou garde
         le mur. Laisser croire que le modele a travaille, c est mettre en ligne
         une photo qu on croit traitee correctement. */
      dire(r.deja ? 'Cette photo était déjà isolée.'
        : (r.par === 'canevas'
            ? ('Vêtement isolé LOCALEMENT — le modèle n’a pas répondu'
               + (r.repli ? ' (' + esc(r.repli) + ')' : '') + '. Le résultat est moins net.')
            : 'Vêtement isolé par le modèle. Choisissez un fond.'),
        r.par === 'canevas' ? 'att' : 'bon');
      rouvrir(r.photo);
    });
  }

  function fond(cle, image){
    if (occupeDeja('Opération')) return;
    occuper('Application du fond…');
    appeler('photos:fond', [DETAIL.id, cle, image || '']).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Fond appliqué.', 'bon');
      rouvrir(r.photo);
    });
  }

  function chercherProduits(){
    appeler('photos:produits', [PQ]).then(function(r){
      if (!r.ok) { dire(expliquer(r), 'err'); PRODUITS = []; }
      else PRODUITS = r.produits || [];
      var z = document.getElementById('p-choix');
      if (z) z.innerHTML = listeProduits();
    });
  }

  function attacher(pid){
    if (occupeDeja('Opération')) return;
    occuper('Attache et téléversement…');
    appeler('photos:attacher', [DETAIL.id, pid]).then(function(r){
      liberer();
      if (!r.ok) { dire(expliquer(r), 'err'); return; }
      dire('Photo ' + r.code + ' attachée à ' + r.produit + '.', 'bon');
      ATTACHE = false; PRODUITS = null; PQ = '';
      rouvrir(r.photo);
    });
  }

  /* ── BRANCHEMENTS ──────────────────────────────────────────────────────── */
  function brancher(){
    if (ASSIST) { assistBrancher(); return; }
    if (SCENE_OUVERT) {
      var non = document.getElementById('sc-non');
      if (non) non.onclick = sceneFermer;
      var go = document.getElementById('sc-go');
      if (go) go.onclick = function(){
        var v = function(id){ var e = document.getElementById(id); return e ? e.value : ''; };
        var sourire = document.getElementById('sc-sourire');
        SCENE = { modele: v('sc-mod'), pose: v('sc-pose'), decor: v('sc-dec') };
        /* ⚠ DECOCHER LE SOURIRE DEMANDE EXPLICITEMENT UN VISAGE NEUTRE : laisser
           la consigne vide rendrait la consigne PAR DEFAUT du relais, qui, elle,
           fait sourire. Un reglage decoche qui ne change rien serait pire que
           pas de reglage du tout. */
        if (!sourire || !sourire.checked) { SCENE.consigne = 'neutral expression'; }
        var ids = SCENE_IDS || [];
        SCENE_OUVERT = false;
        SCENE_IDS = null;
        lancerLot('humain');
        // ⚠ On repose le choix APRES le lancement : lancerLot le lit, et le
        // laisser trainer appliquerait la meme scene au prochain lot sans le dire.
        setTimeout(function(){ SCENE = null; }, 100);
        if (!ids.length) dessiner();
      };
      return;
    }
    if (LOTS) { lotsBrancher(); return; }
    var q = document.getElementById('p-q');
    if (q) q.oninput = function(){
      Q = q.value; PAGE = 0;
      clearTimeout(window._pq);
      window._pq = setTimeout(function(){ charger(true); }, 300);
    };
    var tri = document.getElementById('p-tri');
    if (tri) tri.onchange = function(){ TRI = tri.value; PAGE = 0; charger(); };
    var bp = document.getElementById('p-prec');
    if (bp) bp.onclick = function(){ PAGE = Math.max(0, (D.page || 0) - 1); charger(); };
    var bs = document.getElementById('p-suiv');
    if (bs) bs.onclick = function(){ PAGE = (D.page || 0) + 1; charger(); };

    var ch = document.getElementById('p-choisir');
    if (ch) ch.onclick = choisirFichiers;
    var dp = document.getElementById('p-depot');
    if (dp) dp.onclick = choisirFichiers;

    /* ── LES ACTIONS DE LIGNE ─────────────────────────────────────────────
       ⚠ CHAQUE BOUTON ARRETE LA PROPAGATION : la ligne ouvre la fiche, et sans
       ce garde, cliquer sur la corbeille ouvrirait la fiche par-dessus la
       confirmation qu on vient d armer. */
    var stop = function(ev){ ev.stopPropagation(); };

    // Renommer sur place : le champ remplace le texte, entree valide, echap renonce.
    Array.prototype.forEach.call(corps.querySelectorAll('[data-ren],[data-ren2]'), function(b){
      b.onclick = function(ev){
        stop(ev);
        RENOMME = b.getAttribute('data-ren') || b.getAttribute('data-ren2');
        SUPPR_ARME = '';
        dessiner();
        var c = document.getElementById('p-ren');
        if (c) { c.focus(); c.select(); }
      };
    });
    var champRen = document.getElementById('p-ren');
    if (champRen) {
      champRen.onclick = stop;
      champRen.onkeydown = function(ev){
        if (ev.key === 'Escape') { RENOMME = ''; dessiner(); return; }
        if (ev.key !== 'Enter') return;
        var n = champRen.value.trim();
        if (!n) { dire('Le nom ne peut pas être vide.', 'err'); return; }
        var id = RENOMME;
        RENOMME = '';
        dire('Renommage…');
        appeler('photos:renommer', [id, n]).then(function(r){
          dire(r.ok ? 'Photo renommée.' : expliquer(r), r.ok ? 'bon' : 'err');
          charger();
        });
      };
      // ⚠ PERDRE LE FOYER RENONCE, ET N ENREGISTRE PAS. Enregistrer sur un clic
      // ailleurs surprendrait : on ne sait jamais si l on a valide ou fui.
      champRen.onblur = function(){ if (RENOMME) { RENOMME = ''; dessiner(); } };
    }

    // Les trois traitements, directement sur la ligne.
    [['data-t1', 'detourage'], ['data-t2', 'fantome'], ['data-t3', 'humain']].forEach(function(x){
      Array.prototype.forEach.call(corps.querySelectorAll('[' + x[0] + ']'), function(b){
        b.onclick = function(ev){
          stop(ev);
          var id = b.getAttribute(x[0]);
          var l = null;
          (D.lignes || []).forEach(function(y){ if (y.id === id) l = y; });
          CHOIX = {};
          CHOIX[id] = l ? { code: l.code, nom: l.nom } : { code: '', nom: id };
          lancerLot(x[1]);
        };
      });
    });

    // La fiche complete (fond, article, export) reste derriere un bouton.
    Array.prototype.forEach.call(corps.querySelectorAll('[data-ouvre]'), function(b){
      b.onclick = function(ev){
        stop(ev);
        var id = b.getAttribute('data-ouvre');
        var t = (D.lignes || []).filter(function(x){ return x.id === id; })[0];
        if (t) { DETAIL = t; dessiner(); }
      };
    });

    /* ⚠ LA SUPPRESSION S ARME SUR LA LIGNE, et se desarme seule au bout de cinq
       secondes : une corbeille qui reste armee est une corbeille sur laquelle on
       reclique par reflexe. */
    Array.prototype.forEach.call(corps.querySelectorAll('[data-piv]'), function(b){
      b.onclick = function(ev){
        stop(ev);
        var id = b.getAttribute('data-piv');
        var l = null;
        (D.lignes || []).forEach(function(y){ if (y.id === id) l = y; });
        CHOIX = {};
        CHOIX[id] = l ? { code: l.code, nom: l.nom } : { code: '', nom: id };
        lancerPivot([id]);
      };
    });
    Array.prototype.forEach.call(corps.querySelectorAll('[data-sup]'), function(b){
      b.onclick = function(ev){
        stop(ev);
        var id = b.getAttribute('data-sup');
        if (SUPPR_ARME !== id) {
          SUPPR_ARME = id;
          dessiner();
          dire('Cliquez encore sur la corbeille pour supprimer — l’article lié, lui, garde son image.', 'att');
          setTimeout(function(){ if (SUPPR_ARME === id) { SUPPR_ARME = ''; dessiner(); } }, 5000);
          return;
        }
        SUPPR_ARME = '';
        dire('Suppression…');
        appeler('photos:supprimer', [id]).then(function(r){
          if (!r.ok) { dire(expliquer(r), 'err'); return; }
          delete CHOIX[id];
          dire('Photo retirée de la photothèque.', 'bon');
          charger();
        });
      };
    });

    var fal = document.getElementById('p-fal');
    if (fal) fal.onclick = function(){
      dire('Ouverture du suivi des traitements…');
      appeler('fal:ouvrir', []).then(function(r){
        dire(r && r.ok ? '' : expliquer(r), r && r.ok ? '' : 'err');
      });
    };

    /* ⚠ LA CASE NE DOIT PAS OUVRIR LA PHOTO : la ligne entiere est cliquable,
       et sans ce garde, cocher ouvrirait le panneau de detail par-dessus. */
    Array.prototype.forEach.call(corps.querySelectorAll('[data-chx]'), function(c){
      c.onclick = function(ev){ ev.stopPropagation(); };
      c.onchange = function(){
        var id = c.getAttribute('data-chx');
        if (!c.checked) { delete CHOIX[id]; dessiner(); return; }
        /* ⚠ ON RETIENT LE CODE ET LE NOM AU MOMENT DE COCHER. Une photo choisie
           sur la page 1 doit pouvoir etre NOMMEE dans le suivi alors qu on est
           rendu page 4 : sans cela, le panneau afficherait des identifiants
           bruts pour tout ce qui n est plus a l ecran. */
        var l = null;
        (D.lignes || []).forEach(function(x){ if (x.id === id) l = x; });
        CHOIX[id] = l ? { code: l.code, nom: l.nom } : { code: '', nom: id };
        dessiner();
      };
    });
    var tt = document.getElementById('p-tout');
    if (tt) tt.onchange = function(){
      (D.lignes || []).forEach(function(r){
        if (tt.checked) CHOIX[r.id] = { code: r.code, nom: r.nom };
        else delete CHOIX[r.id];
      });
      dessiner();
    };
    var rien = document.getElementById('p-rien');
    if (rien) rien.onclick = function(){ CHOIX = {}; SUP_LOT_ARME = false; dessiner(); };

    /* Supprimer les photos cochees.
       ⚠ ON SUPPRIME UNE A UNE ET L ON REND COMPTE : sur trente photos dont deux
       sont attachees a un article, un total muet ferait croire que tout est
       parti. Le panneau de suivi nomme chaque ligne. */
    var supLot = document.getElementById('p-lot-sup');
    if (supLot) supLot.onclick = function(){
      var ids = Object.keys(CHOIX);
      if (!ids.length) return;
      if (!SUP_LOT_ARME) {
        SUP_LOT_ARME = true;
        dessiner();
        dire('Cliquez encore pour supprimer les ' + ids.length + ' photo(s) cochée(s). '
          + 'Les articles liés gardent leur image.', 'att');
        setTimeout(function(){ if (SUP_LOT_ARME) { SUP_LOT_ARME = false; dessiner(); } }, 6000);
        return;
      }
      SUP_LOT_ARME = false;
      if (occupeDeja('Suppression')) return;
      var titres = ids.map(function(i){
        var c = CHOIX[i];
        return (c && c.code) ? (c.code + ' · ' + c.nom) : ((c && c.nom) || i);
      });
      occuper('Suppression de ' + ids.length + ' photo(s)…');
      suiviOuvrir(titres, 'Suppression · ' + ids.length + ' photo(s)');
      var faits = 0, rates = 0, abandon = 0;
      var pas = function(k){
        suiviCompte(k, ids.length);
        if (ANNULE && k < ids.length) {
          abandon = ids.length - k;
          for (var z = k; z < ids.length; z++) suiviLigne(z, 'echec', 'abandonnée');
          k = ids.length;
        }
        if (k >= ids.length) {
          liberer();
          var t = faits + ' retirée' + (faits > 1 ? 's' : '');
          if (rates) t += ' · ' + rates + ' refusée' + (rates > 1 ? 's' : '');
          if (abandon) t += ' · ' + abandon + ' abandonnée' + (abandon > 1 ? 's' : '');
          suiviFin(t + '.', abandon ? 'Suppression interrompue' : 'Suppression terminée');
          if (!rates && !abandon) setTimeout(suiviFermer, 2500);
          dire(t + '.', rates ? 'att' : 'bon');
          charger();
          return;
        }
        suiviLigne(k, 'cours', 'en cours');
        appeler('photos:supprimer', [ids[k]]).then(function(r){
          if (r && r.ok) { faits++; delete CHOIX[ids[k]]; suiviLigne(k, 'faite', 'retirée'); }
          else {
            rates++;
            suiviLigne(k, 'echec', 'refusée');
            suiviEtapes(k, [{ nom: 'retrait', ok: false, chiffre: (r && (r.detail || r.motif)) || '' }]);
          }
          pas(k + 1);
        });
      };
      pas(0);
    };
    Array.prototype.forEach.call(corps.querySelectorAll('[data-lot]'), function(b){
      b.onclick = function(){ lancerLot(b.getAttribute('data-lot')); };
    });

    var fx = document.getElementById('p-fermer-insp');
    if (fx) fx.onclick = fermerDetail;

    var nomOk = document.getElementById('p-nom-ok');
    if (nomOk) nomOk.onclick = function(){
      var c = document.getElementById('p-nom');
      if (!c || !c.value.trim()) { dire('Le nom ne peut pas être vide.', 'err'); return; }
      dire('Renommage…');
      appeler('photos:renommer', [DETAIL.id, c.value.trim()]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Photo renommée.', 'bon');
        rouvrir(r.photo);
      });
    };

    var tl = document.getElementById('p-taille');
    if (tl) tl.onchange = function(){ TAILLE = parseInt(tl.value, 10) || 24; PAGE = 0; charger(); };
    var bs = document.getElementById('p-suivi');
    if (bs) bs.onclick = suiviRouvrir;
    var bl = document.getElementById('p-lots');
    if (bl) bl.onclick = lotsOuvrir;

    var asst = document.getElementById('p-assistant');
    if (asst) asst.onclick = assistOuvrir;

    var usb = document.getElementById('p-usb');
    if (usb) usb.onclick = function(){
      if (occupeDeja('Détection de clé USB')) return;
      occuper('Recherche de clés USB…');
      appeler('photos:usb', []).then(function(r){
        liberer();
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        if (!r.trouvees) { dire('Aucune photo trouvée sur une clé USB.', 'att'); return; }
        var t = r.importees + ' photo' + (r.importees > 1 ? 's' : '') + ' importée'
          + (r.importees > 1 ? 's' : '') + ' depuis la clé ' + (r.lecteur || 'USB');
        if (r.doublons) t += ' · ' + r.doublons + ' déjà présente' + (r.doublons > 1 ? 's' : '');
        if (r.echecs) t += ' · ' + r.echecs + ' en échec';
        dire(t + '.', r.importees ? 'bon' : 'att');
        charger();
      });
    };

    var vd = document.getElementById('p-vider');
    if (vd) vd.onclick = function(){
      /* ⚠ ARME EN DEUX CLICS, et le second dit COMBIEN disparaissent. */
      if (!VIDER_ARME) {
        VIDER_ARME = true; dessiner();
        setTimeout(function(){ if (VIDER_ARME) { VIDER_ARME = false; dessiner(); } }, 5000);
        return;
      }
      VIDER_ARME = false;
      if (occupeDeja('Vidage de la photothèque')) return;
      /* ⚠⚠ LE VIDAGE MENE SA SUITE, LIGNE PAR LIGNE. Il n affichait qu un
         << Retrait des entrees... >> qui restait des minutes sans rien dire :
         ni combien, ni lesquelles, ni ou l on en etait — et rien pour arreter.
         Sur une phototheque de deux cents photos, c est un ecran mort.
         ⚠ Et chaque retrait efface AUSSI les images dans le stockage : la fiche
         seule partait, les objets restaient. << C est efface >> ne doit pas
         vouloir dire << ce le sera peut-etre demain >>. */
      occuper('Lecture de ce qu il y a à retirer…');
      appeler('photos:toutes', []).then(function(t){
        if (!t.ok) { liberer(); dire(expliquer(t), 'err'); return; }
        var l = t.photos || [];
        if (!l.length) { liberer(); dire('La photothèque est déjà vide.', 'att'); return; }
        var titres = l.map(function(x){ return x.code + ' · ' + x.nom; });
        suiviOuvrir(titres, 'Vidage · ' + l.length + ' photo(s)');
        var faits = 0, rates = 0, abandon = 0;
        var pas = function(k){
          suiviCompte(k, l.length);
          if (ANNULE && k < l.length) {
            abandon = l.length - k;
            for (var z = k; z < l.length; z++) suiviLigne(z, 'echec', 'abandonnée');
            k = l.length;
          }
          if (k >= l.length) {
            liberer();
            var m = faits + ' retirée' + (faits > 1 ? 's' : '');
            if (rates) m += ' · ' + rates + ' refusée' + (rates > 1 ? 's' : '');
            if (abandon) m += ' · ' + abandon + ' abandonnée' + (abandon > 1 ? 's' : '');
            suiviFin(m + '.', abandon ? 'Vidage interrompu' : 'Vidage terminé');
            if (!rates && !abandon) setTimeout(suiviFermer, 2500);
            dire(m + '. Les fiches produits gardent leurs images.', rates ? 'att' : 'bon');
            CHOIX = {};
            charger();
            return;
          }
          suiviLigne(k, 'cours', 'en cours');
          suiviEtapes(k, [{ nom: 'fiche', etat: 'encours' }]);
          occuper('Retrait ' + (k + 1) + ' / ' + l.length + '…');
          appeler('photos:supprimer', [l[k].id]).then(function(r){
            if (r && r.ok) {
              faits++;
              suiviLigne(k, 'faite', 'retirée');
              suiviEtapes(k, [{ nom: 'fiche', ok: true }, { nom: 'images du stockage', ok: true }]);
            } else {
              rates++;
              suiviLigne(k, 'echec', 'refusée');
              suiviEtapes(k, [{ nom: 'fiche', ok: false, chiffre: (r && (r.detail || r.motif)) || '' }]);
            }
            pas(k + 1);
          });
        };
        pas(0);
      });
      return;
      /* eslint-disable no-unreachable */
      appeler('photos:vider', []).then(function(r){
        liberer();
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.echecs
          ? (r.retirees + ' retirée(s), ' + r.echecs + ' refusée(s) par le nuage.')
          : 'Photothèque vidée — les fiches produits gardent leurs images.',
          r.echecs ? 'att' : 'bon');
        DETAIL = null;
        charger();
      });
    };

    if (!DETAIL) return;

    var f = document.getElementById('p-fermer');
    if (f) f.onclick = fermerDetail;
    rangerUneFois();
    var me = document.getElementById('p-mesurer');
    if (me) me.onclick = function(ev){ stop(ev); mesurerEspace(); };
    var iso = document.getElementById('p-isoler');
    if (iso) iso.onclick = isoler;

    var at = document.getElementById('p-attacher');
    if (at) at.onclick = function(){
      ATTACHE = !ATTACHE;
      if (ATTACHE) { PRODUITS = null; dessiner(); chercherProduits(); }
      else { PRODUITS = null; PQ = ''; dessiner(); }
    };
    var pq = document.getElementById('p-pq');
    if (pq) pq.oninput = function(){
      PQ = pq.value;
      clearTimeout(window._ppq);
      window._ppq = setTimeout(chercherProduits, 300);
    };

    var fp = document.getElementById('p-fondperso');
    if (fp) fp.onclick = function(){
      var e = document.createElement('input');
      e.type = 'file'; e.accept = 'image/*';
      e.onchange = function(){
        var fi = e.files && e.files[0];
        if (!fi) return;
        if (fi.size > MAX_OCTETS) { dire('Ce fond est trop lourd (25 Mo maximum).', 'att'); return; }
        lireFichier(fi).then(function(data){
          if (!data) { dire('Fond illisible.', 'err'); return; }
          fond('__custom', data);
        });
      };
      e.click();
    };

    var en = document.getElementById('p-enreg');
    if (en) en.onclick = function(){
      dire('Enregistrement…');
      appeler('photos:enregistrer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire('Enregistré dans le dossier des exports (' + r.fichier + ').', 'bon');
      });
    };

    var su = document.getElementById('p-suppr');
    if (su) su.onclick = function(){
      if (!SUPPR_ARME_INSP) {
        SUPPR_ARME_INSP = true; dessiner();
        setTimeout(function(){ if (SUPPR_ARME_INSP) { SUPPR_ARME_INSP = false; if (DETAIL) dessiner(); } }, 5000);
        return;
      }
      SUPPR_ARME_INSP = false;
      dire('Retrait…');
      appeler('photos:supprimer', [DETAIL.id]).then(function(r){
        if (!r.ok) { dire(expliquer(r), 'err'); return; }
        dire(r.code + ' retirée de la médiathèque'
          + (r.lie ? ' — la fiche de l’article garde son image.' : '.'), 'bon');
        DETAIL = null; ATTACHE = false; PRODUITS = null;
        charger();
      });
    };
  }

  function fermerDetail(){
    DETAIL = null; ATTACHE = false; PRODUITS = null; PQ = '';
    SUPPR_ARME = ''; SUPPR_ARME_INSP = false;
    dessiner();
  }

  /* ⚠ UN CLIC SUR UNE COMMANDE EST TRAITE PAR SA COMMANDE, jamais par ce
     gestionnaire general : sans cette garde, le clic qui vient d ARMER un bouton
     remonte jusqu ici et le desarme dans la meme foulee (le piege de 1.72.0). */
  corps.onclick = function(ev){
    var t = ev.target;
    if (!t || !t.closest) return;
    var jf = t.closest('[data-fond]');
    if (jf) { fond(jf.getAttribute('data-fond'), ''); return; }
    var pp = t.closest('[data-pid]');
    if (pp) { attacher(pp.getAttribute('data-pid')); return; }
    if (t.closest('.boite')) return;
    /* ⚠ ON NE FERME PLUS EN CLIQUANT A COTE. Le panneau ne recouvre plus rien :
       cliquer ailleurs, c est vouloir travailler ailleurs — souvent sur une
       AUTRE photo, qui prend simplement la place dans l inspecteur. Fermer se
       fait par le bouton, qui est toujours la. */
    if (t.closest('button') || t.closest('input') || t.closest('select')) return;
    var tr = t.closest('tr[data-id]');
    if (tr) {
      var id = tr.getAttribute('data-id');
      var r = (D.lignes || []).filter(function(x){ return x.id === id; })[0];
      if (r) { DETAIL = r; SUPPR_ARME = ''; SUPPR_ARME_INSP = false; ATTACHE = false; dessiner(); }
    }
  };

  /* ── GLISSER-DEPOSER ───────────────────────────────────────────────────────
     ⚠ SUR LE DOCUMENT ENTIER, ET preventDefault DANS LES DEUX. Sans cela, un
     fichier lache sur la fenetre fait NAVIGUER la page vers ce fichier : la
     fenetre native disparait, remplacee par l image. */
  document.addEventListener('dragover', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.add('survol');
  });
  document.addEventListener('dragleave', function(ev){
    if (ev.relatedTarget) return;
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
  });
  document.addEventListener('drop', function(ev){
    ev.preventDefault();
    var z = document.getElementById('p-depot');
    if (z) z.classList.remove('survol');
    if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) {
      importer(ev.dataTransfer.files);
    }
  });

  /* ── CHARGEMENT ────────────────────────────────────────────────────────── */
  var enCours = false, RELANCE = false;
  /* ⚠ UNE SEULE FOIS PAR SÉANCE. Replier les anciennes photos sur le modèle à
     une image efface des objets dans R2 : c'est un geste d'entretien, pas un
     geste d'affichage, et le refaire à chaque rafraîchissement de la table
     serait aussi inutile que bruyant. */
  var RANGE = false;
  function rangerUneFois(){
    if (RANGE) return;
    RANGE = true;
    appeler('photos:ranger', []).then(function(r){
      if (r && r.ok && r.repliees) {
        dire(r.repliees + ' photo(s) rangée(s) : une seule image conservée par photo.', 'bon');
        charger();
      }
    }).catch(function(){});
  }

  function charger(garderSaisie){
    if (enCours) { RELANCE = true; return; }
    enCours = true;
    appeler('photos:donnees', [{ q: Q, tri: TRI, taille: TAILLE, page: PAGE, taille: 24 }]).then(function(r){
      enCours = false;
      if (RELANCE) { RELANCE = false; charger(garderSaisie); return; }
      if (!r || !r.ok) { vide('Photothèque indisponible', expliquer(r)); return; }
      D = r;
      /* ⚠⚠ LE CHOIX SURVIT AU CHANGEMENT DE PAGE, ET C EST TOUT L INTERET.
         La version precedente le taillait sur les lignes de la PAGE COURANTE :
         cocher trente photos, tourner la page, et les trente
         disparaissaient du choix. Une selection qui ne franchit pas une page ne
         sert a rien des qu il y a plus d une page, donc precisement quand elle
         servirait.
         ⚠ ON NE VIDE QUE QUAND IL N Y A PLUS RIEN DU TOUT : c est le seul cas ou
         l on est SUR que les photos cochees n existent plus. Ailleurs, elles sont
         peut-etre simplement sur une autre page. (La barre annoncait
         << 1 photo choisie >> devant une phototheque vide — c etait cela, le
         defaut, et pas la persistance elle-meme.) */
      if (!r.total) CHOIX = {};
      /* La photo ouverte est RELUE dans la nouvelle liste : sans cela, le
         panneau afficherait encore l etat d avant le geste. */
      if (DETAIL) {
        var maj = (D.lignes || []).filter(function(x){ return x.id === DETAIL.id; })[0];
        if (maj) DETAIL = maj;
      }
      var s = document.getElementById('sous');
      if (s) s.textContent = D.total + ' photo' + (D.total > 1 ? 's' : '') + ' · ' + poids(D.poidsTotal);
      if (garderSaisie) redessinerSansPerdreLaSaisie();
      else dessiner();
    });
  }

  /* ⚠ NE JAMAIS REDESSINER LE CHAMP SOUS LES DOIGTS. */
  function redessinerSansPerdreLaSaisie(){
    var q = document.getElementById('p-q');
    var debut = q ? q.selectionStart : null;
    var fin = q ? q.selectionEnd : null;
    dessiner();
    var q2 = document.getElementById('p-q');
    if (q2) {
      q2.focus({ preventScroll: true });
      try { if (debut != null) q2.setSelectionRange(debut, fin); } catch (e) {}
    }
  }

  /* ⚠ ACTUALISATION POUSSEE — jamais pendant un import, pendant une saisie ni
     sous un panneau ouvert : on redessinerait sous les doigts. */
  window.szActualiser = function(){
    if (OCCUPE || DETAIL) return;
    var q = document.getElementById('p-q');
    if (q && document.activeElement === q && q.value) return;
    charger();
  };
  window.szRevenir = function(){ if (!OCCUPE && !DETAIL) charger(); };

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
      if (DETAIL) { fermerDetail(); return; }
      P.fermer();
    }
  });

  charger();
})();
</script>
</body></html>`;
}

module.exports = { pagePhotos };
