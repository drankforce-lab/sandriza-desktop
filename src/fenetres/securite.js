'use strict';

/*
 * FENÊTRE « ACCÈS UTILISATEURS » — NATIVE
 * =============================================================================
 * LA GESTION DES COMPTES DU PERSONNEL, ET RIEN D'AUTRE : liste, création,
 * modification, permissions, questions de sécurité, MFA, invitation, suppression.
 *
 * ══ REFONTE DU 2026-09-13 (sa demande #103) ════════════════════════════════
 * Ses mots : « refait l'interface de cela […] une belle liste d'usager avec des
 * filtres […] pour la création des comptes un bel assistant étape par étape et
 * avec infobulle pour la description des différentes sécurités […] le plus
 * granulaire possible […] avec à la limite un mode simple et avancé ».
 *
 * ⚠⚠⚠ CE QUI A CHANGÉ DANS LE MODÈLE, ET POURQUOI L'ÉCRAN EN DÉPEND. Le même
 * jour, `config` a été découpé en cinq droits (clés de paiement et base de
 * données passent au super-administrateur) et les modules portent désormais une
 * DESCRIPTION et un drapeau SENSIBLE. Sans eux, cet écran ne pourrait afficher
 * qu'un nom de module et une rangée de cases — et une case qu'on coche sans
 * savoir ce qu'elle ouvre est la façon la plus ordinaire d'accorder trop.
 *
 * ⚠⚠ LE MODE SIMPLE N'EST PAS UNE VERSION AMOINDRIE. Il pose la seule question
 * qui compte neuf fois sur dix — « quel métier fait cette personne ? » — et
 * laisse le rôle répondre pour les cent quarante-trois droits. Le mode avancé
 * ajoute la matrice, pour le dixième cas. Mettre la matrice devant tout le monde
 * ne rend personne plus prudent : ça fait cliquer « Administrateur » pour en
 * finir, ce qui est exactement la faute qu'on essaie d'éviter.
 *
 * ⚠⚠ L'ASSISTANT NE SERT QU'À LA CRÉATION. Modifier, c'est revenir sur UN point
 * précis ; imposer cinq étapes pour changer une case serait une punition. La
 * modification garde donc ses onglets, enrichis des mêmes descriptions.
 *
 * ⚠ LES RÉGLAGES DE SÉCURITÉ SONT PARTIS (2026-08-14, à sa demande) dans leur
 * propre fenêtre — `reglages-securite.js`, entrée de menu séparée. Ils vivaient
 * ici en onglet : d'un côté la GESTION (un geste quotidien, sur une personne
 * précise), de l'autre des RÉGLAGES qui valent pour toute l'entreprise et qu'on
 * touche deux fois par an.
 *
 * ⚠ AUCUN CŒUR N'A BOUGÉ : mêmes opérations `securite:*`. Ce qui protège est
 * DERRIÈRE (voir #79 — le rôle se relit dans `staff_users`) ; cet écran ne fait
 * que rendre lisible ce qu'on accorde.
 *
 * ⚠ LE RÔLE N'EST PAS COLORÉ EN LISTE (sa demande) : une couleur y faisait
 * croire à une alerte alors qu'un rôle est un simple fait. Seuls l'état du
 * compte et le MFA gardent une couleur — eux appellent une décision. Dans
 * l'ASSISTANT, en revanche, la pastille du rôle est colorée : on y CHOISIT, et
 * la couleur aide à distinguer neuf cartes d'un coup d'oeil.
 *
 * ⚠ ANCRÉE = PLEINE PAGE. ⚠ Aucun accent grave dans la portion de script.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR, ICO, TETE, LIEU } = require('./socle.js');
/* ⚠ LES DEUX LANGUES. Résolu À LA GÉNÉRATION : la page naît dans la
   langue du poste. ⚠⚠ On ne traduit QUE ce qui se lit — jamais une valeur
   enregistrable (voir src/langue/index.js). */
const T = require('../langue').tr('securite');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--f-page);color:var(--tx);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.55rem 1.1rem;
  border-bottom:1px solid var(--v08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.ro{flex:0 0 auto;margin:.55rem 1.05rem 0;border:1px solid rgba(240,180,80,.35);
  background:rgba(200,140,40,.1);color:var(--tx-or2);border-radius:9px;padding:.45rem .7rem;font-size:.78rem}
.corps{flex:1 1 auto;min-height:0;padding:1rem 1.1rem;overflow-y:auto}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}
.prim{font:inherit;font-size:.84rem;font-weight:700;border:0;border-radius:8px;padding:.5rem 1rem;background:#c9a97e;color:#1a1408;cursor:pointer}
.prim:disabled{opacity:.5;cursor:default}
.b{font:inherit;font-size:.8rem;border:1px solid var(--v16);border-radius:8px;padding:.42rem .8rem;background:var(--v05);color:var(--tx);cursor:pointer}
.b:hover:not(:disabled){background:var(--v09)}
.b:disabled{opacity:.45;cursor:default}
.b.dgr{color:var(--tx-f6a6a6);border-color:rgba(248,113,113,.35)}
.b.dgr:hover:not(:disabled){background:rgba(248,113,113,.16)}
.mini{font:inherit;font-size:.74rem;padding:.14rem .5rem;border:1px solid var(--v16);border-radius:7px;background:var(--v05);color:var(--tx);cursor:pointer;-webkit-user-select:none;user-select:none}

/* ══ LA BARRE DE FILTRES ════════════════════════════════════════════════════
   ⚠ ELLE EST AU-DESSUS DES COMPTEURS, ET C'EST VOULU : les compteurs suivent le
   filtre. Les mettre avant laisserait croire qu'ils comptent tout le parc alors
   qu'ils comptent ce qui est montré — un chiffre qui ment par sa place. */
.entete{display:flex;justify-content:space-between;align-items:center;gap:.8rem;margin-bottom:.7rem;flex-wrap:wrap}
.entete h2{margin:0;font:700 1.02rem/1.2 Georgia,serif}
.outils{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}
.filtres{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin:0 0 .9rem;
  background:var(--v03);border:1px solid var(--v08);border-radius:11px;padding:.6rem .7rem}
.recherche{flex:1 1 15rem;min-width:11rem;max-width:26rem;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;
  color:var(--tx);font:inherit;font-size:.84rem;padding:.45rem .7rem}
.recherche:focus{outline:none;border-color:#c9a97e}
.filtres select{font:inherit;font-size:.79rem;background:var(--f-champ);border:1px solid var(--v12);
  border-radius:8px;color:var(--tx);padding:.4rem .55rem;max-width:14rem}
.filtres select:focus{outline:none;border-color:#c9a97e}
.fgr{display:flex;gap:.25rem;align-items:center}
.fgr .lbl{font-size:.72rem;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;margin-right:.15rem}
.jeton{font:inherit;font-size:.75rem;border:1px solid var(--v14);border-radius:99px;padding:.25rem .65rem;
  background:var(--v04);color:var(--tx2);cursor:pointer;white-space:nowrap}
.jeton:hover{background:var(--v08);color:var(--tx)}
.jeton.on{background:rgba(201,169,126,.18);border-color:rgba(201,169,126,.55);color:var(--tx-or);font-weight:700}
.vues{display:flex;gap:.2rem;border:1px solid var(--v14);border-radius:8px;padding:2px;background:var(--v04)}
.vues button{font:inherit;font-size:.75rem;border:0;border-radius:6px;padding:.26rem .6rem;background:none;color:var(--tx2);cursor:pointer}
.vues button.on{background:var(--v12);color:var(--tx);font-weight:700}

/* ⚠ Les regles de la bande de compteurs (stat-grid, stat) sont parties avec elle
   le 2026-09-14, a sa demande. Une feuille qui garde le dessin d un bloc retire
   fait croire, a la relecture, que le bloc existe encore quelque part. */

/* La pastille a point de la refonte (2026-09-25) : meme forme que rf-pill.
   Un compte DESACTIVE est gris, plus rouge : ce n est pas une erreur, c est
   un etat voulu. Une couleur = un sens. */
.pill{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:600;padding:.22rem .65rem;
  border-radius:99px;white-space:nowrap}
.pill::before{content:"";width:6px;height:6px;border-radius:99px;background:currentColor;flex:0 0 auto}
.pill.on{background:rgba(22,163,74,.2);color:var(--tx-ok2)}
.pill.off{background:rgba(148,163,184,.16);color:var(--tx-gris2)}
.pill.mfa{background:rgba(99,102,241,.18);color:var(--tx-bleu)}
.pill.warn{background:rgba(234,179,8,.18);color:var(--tx-att)}
.pill.moi{background:rgba(59,130,246,.18);color:var(--tx-bleu)}
/* ⚠ LE RÔLE EN PASTILLE NEUTRE DANS LA LISTE — jamais coloré. */
.pill.role{background:rgba(148,163,184,.16);color:var(--tx-c3cfdd);font-weight:600}

/* ── LES COMPTES EN FICHES ────────────────────────────────────────────────
   Le tableau dense convenait à des transactions ; ici chaque ligne est une
   PERSONNE — un nom, un rôle, un état, des choses qu'on lit, pas qu'on compare
   colonne par colonne. La fiche laisse respirer l'essentiel et met les actions
   à portée sans les entasser au bout d'une rangée.
   ⚠ LA VUE COMPACTE EXISTE QUAND MÊME (2026-09-13) : à vingt comptes, la fiche
   devient un mur et l'on cherche un nom. Les deux vues lisent les MÊMES données
   filtrées — c'est la présentation qui change, jamais le contenu. */
.fiches{display:grid;grid-template-columns:repeat(auto-fill,minmax(24rem,1fr));gap:.8rem}
.fiche{background:var(--v03);border:1px solid var(--v09);border-radius:13px;
  padding:.9rem 1rem;display:flex;flex-direction:column;gap:.65rem;transition:border-color .13s}
.fiche:hover{border-color:rgba(201,169,126,.45)}
.fiche.inactif{opacity:.72}
.fiche .haut{display:flex;align-items:center;gap:.75rem;min-width:0}
.init{flex:0 0 auto;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font:700 .95rem/1 Georgia,serif;background:rgba(201,169,126,.16);
  color:#e2c79b;border:1px solid rgba(201,169,126,.3);text-transform:uppercase}
.fiche .qui{min-width:0;flex:1 1 auto}
.fiche .nom{font-weight:700;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fiche .coord{font-size:.75rem;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fiche .etats{display:flex;gap:.32rem;flex-wrap:wrap;align-items:center}
.fiche .quand{font-size:.74rem;color:var(--tx-gris)}
/* ⚠ Meme geste dans la vue en fiches : .35rem serrait trop, et c est la meme
   barre d actions avec le meme bouton rouge au bout. */
.fiche .barre{display:flex;gap:.5rem;flex-wrap:wrap;border-top:1px solid var(--v07);padding-top:.65rem;margin-top:auto}
.fiche .barre .b{font-size:.76rem;padding:.3rem .62rem}

/* La liste en CARTES du socle (refonte du 2026-09-25) : plus de collapse ni
   de trait sous chaque cellule. ⚠ Plus d opacite sur un compte desactive :
   elle rendait ses pastilles illisibles (vu a Remboursements) — la pastille
   grise << Desactive >> le dit. */
.tbl{width:100%;font-size:.84rem}
.tbl th{font-weight:700;text-transform:uppercase;text-align:left;white-space:nowrap}
.tbl td{vertical-align:middle}
.tbl tr.inactif .nm b{color:var(--tx2)}
.tbl .init{width:28px;height:28px;font-size:.74rem}
.tbl .nm{display:flex;align-items:center;gap:.55rem;min-width:0}
.tbl .nm b{font-weight:700}
.tbl .dt{color:var(--tx2);font-size:.78rem;white-space:nowrap}
/* ══ LE MENU DU CLIC DROIT (#110, 2026-09-14) ══════════════════════════════
   Sa demande : agir sur un compte sans traverser la ligne jusqu au bout. Il est
   POSE EN ABSOLU dans la page — pas dans la ligne — pour ne pas etre rogne par
   le debordement du tableau, qui est la faute classique de ce genre de menu.
   ⚠ Il se ferme au clic ailleurs, a la molette et a Echap : un menu qui reste
   ouvert pendant qu on fait autre chose finit par recevoir un clic qu on ne lui
   destinait pas — et une de ses entrees SUPPRIME. */
.ctx{position:fixed;z-index:60;min-width:13rem;background:var(--f-carte);
  border:1px solid var(--v16);border-radius:10px;padding:.3rem;
  box-shadow:0 10px 28px rgba(0,0,0,.45)}
.ctx .tt{font-size:.7rem;color:var(--tx2);padding:.3rem .55rem .35rem;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ctx button{display:block;width:100%;text-align:left;font:inherit;font-size:.82rem;
  border:0;border-radius:7px;padding:.4rem .55rem;background:none;color:var(--tx);cursor:pointer}
.ctx button:hover{background:var(--v09)}
.ctx button.dgr{color:var(--tx-f6a6a6)}
.ctx button.dgr:hover{background:rgba(248,113,113,.16)}
.ctx .trait{height:1px;background:var(--v08);margin:.25rem .3rem}
.tbl .act{text-align:right;white-space:nowrap}
.tbl .act .mini{margin-left:.2rem}
/* ⚠ LES BOUTONS DE LA LIGNE SE TOUCHAIENT — sa demande du 2026-09-14. Seul
   la classe mini portait un ecart ; les boutons d action sont des b, donc ils
   n en avaient AUCUN et se collaient les uns aux autres. Trois cibles
   cliquables sans separation, dont une qui SUPPRIME, c est une erreur de clic
   qui attend. L ecart se pose ENTRE eux (selecteur de fratrie) et non sur
   chacun, pour ne pas decaler la colonne vers la gauche. */
.tbl .act .b + .b{margin-left:.45rem}

.vide{padding:2.2rem 1rem;text-align:center;color:var(--tx2);font-size:.84rem;line-height:1.7}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid var(--v08);background:var(--f-pied)}
.msg{font-size:.79rem;color:var(--tx2);flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:var(--tx-err)}.msg.bon{color:var(--tx-ok)}.msg.att{color:var(--tx-jaune)}

/* ── Surcouche (assistant et éditeur) ─────────────────────────────── */
.sur{position:fixed;inset:0;background:rgba(4,8,15,.72);display:flex;align-items:center;justify-content:center;z-index:60;padding:1.4rem}
.sur .boite{background:var(--f-131c2b);border:1px solid var(--v12);border-radius:14px;max-width:900px;width:100%;max-height:92vh;display:flex;flex-direction:column}
.sur .boite.large{max-width:1060px}
.sur .tt{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-bottom:1px solid var(--v08)}
.sur .tt h3{margin:0;font:700 1rem/1.2 Georgia,serif}
.sur .liste{padding:1rem 1.1rem;overflow-y:auto}
.sur .liste::-webkit-scrollbar{width:8px}
.sur .liste::-webkit-scrollbar-thumb{background:var(--v12);border-radius:8px}

/* ══ LE CHEMIN DE L'ASSISTANT ═══════════════════════════════════════════════
   ⚠ IL MONTRE OÙ L'ON EN EST *ET* CE QUI RESTE. Un assistant qui n'annonce pas
   sa longueur fait abandonner à la deuxième étape : on ne sait pas si l'on
   signe pour deux minutes ou pour vingt. */
.chemin{display:flex;align-items:center;gap:.1rem;padding:.7rem 1.1rem;border-bottom:1px solid var(--v08);
  flex-wrap:wrap;background:var(--v02)}
.chemin .pas{display:flex;align-items:center;gap:.4rem;padding:.2rem .5rem;border-radius:8px}
.chemin .pas .n{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font:700 .72rem/1 system-ui;background:var(--v10);color:var(--tx2);flex:0 0 auto}
.chemin .pas .t{font-size:.78rem;color:var(--tx2);white-space:nowrap}
.chemin .pas.on .n{background:#c9a97e;color:#1a1408}
.chemin .pas.on .t{color:var(--tx);font-weight:700}
.chemin .pas.faite .n{background:rgba(22,163,74,.25);color:var(--tx-ok2)}
.chemin .fleche{color:var(--tx3);font-size:.8rem;margin:0 .1rem}

/* ══ LE SÉLECTEUR SIMPLE / AVANCÉ ═══════════════════════════════════════════
   ⚠ IL EST DANS L'EN-TÊTE, PAS DANS UNE ÉTAPE : changer de mode change le
   NOMBRE d'étapes. Le poser au milieu du chemin ferait bouger le chemin sous
   les pieds de celui qui le parcourt. */
/* ── LES ONGLETS DE L'ÉDITEUR (sa demande, 2026-08-14) ────────────────────
   Modifier un accès, ce sont QUATRE questions distinctes — qui est cette
   personne, avec quel accès, quelles réponses de secours, quels droits — et
   les empiler sur une même colonne obligeait à faire défiler un formulaire
   pour trouver la case cherchée. Chacune a son onglet, et l'onglet courant se
   voit d'un coup d'oeil.
   ⚠ LA CRÉATION, ELLE, PASSE PAR L'ASSISTANT depuis le 2026-09-13 : quatre
   onglets conviennent à qui revient sur un point précis, pas à qui découvre
   l'écran et doit répondre à tout. */
.ongEd{display:flex;gap:.15rem;flex-wrap:wrap;padding:0 1.1rem;border-bottom:1px solid var(--v08)}
.ongEd button{font:inherit;font-size:.82rem;white-space:nowrap;background:none;border:none;
  color:var(--tx2);padding:.55rem .9rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.ongEd button:hover{color:var(--tx)}
.ongEd button.on{color:var(--tx-or);border-bottom-color:#c9a97e;font-weight:700}

.mode{display:flex;gap:.2rem;border:1px solid var(--v14);border-radius:8px;padding:2px;background:var(--v04)}
.mode button{font:inherit;font-size:.75rem;border:0;border-radius:6px;padding:.26rem .66rem;background:none;color:var(--tx2);cursor:pointer}
.mode button.on{background:var(--v12);color:var(--tx);font-weight:700}

.vol{display:none}
.vol.on{display:block}
.aideOng{font-size:.78rem;color:var(--tx2);line-height:1.55;margin:0 0 1rem}
.cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
@media(max-width:760px){.cols2{grid-template-columns:1fr}}
label.champ{display:block;margin:0 0 .9rem}
label.champ .lbl{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;color:var(--tx2);margin:0 0 .25rem}
label.champ .sub{display:block;font-size:.72rem;color:var(--tx-gris);margin:.25rem 0 0;line-height:1.5}
label.champ .req{color:var(--tx-err2)}
input.t,select.t,textarea.t{width:100%;background:var(--f-champ);border:1px solid var(--v12);border-radius:8px;color:var(--tx);font:inherit;padding:.5rem .65rem}
input.t:focus,select.t:focus,textarea.t:focus{outline:none;border-color:#c9a97e}
label.case{display:flex;align-items:flex-start;gap:.5rem;font-size:.84rem;cursor:pointer;margin:0 0 .55rem;line-height:1.45}
label.case input{width:16px;height:16px;accent-color:#c9a97e;margin-top:.15rem;flex:0 0 auto}
label.case .quoi{color:var(--tx2);font-size:.75rem;display:block}
.note{background:var(--v04);border:1px solid var(--v10);border-radius:9px;padding:.8rem .95rem;font-size:.81rem;color:var(--tx2);line-height:1.6;margin:0 0 1rem}
.note b{color:var(--tx)}
.note.att{background:rgba(200,140,40,.1);border-color:rgba(240,180,80,.35);color:var(--tx-or2)}
.ferr{display:none;color:var(--tx-err2);font-size:.82rem;padding:.5rem .7rem;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);border-radius:8px;margin:0 0 .8rem}

/* ══ LES CARTES DE RÔLE ═════════════════════════════════════════════════════
   ⚠ CHACUNE PORTE SA DESCRIPTION EN ENTIER, PAS UNE INFOBULLE. Choisir un rôle
   est le geste qui décide de tout le reste : cacher ce qu'il accorde derrière un
   survol, c'est demander de choisir à l'aveugle et espérer que la personne
   survole. Les descriptions du modèle disent aussi ce que le rôle NE PEUT PAS —
   c'est cette moitié-là qui évite d'accorder trop par précaution. */
.roles{display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:.7rem}
.rcarte{text-align:left;background:var(--v03);border:1px solid var(--v10);border-radius:12px;padding:.8rem .9rem;
  cursor:pointer;font:inherit;color:var(--tx);display:flex;flex-direction:column;gap:.4rem;transition:border-color .13s,background .13s}
.rcarte:hover{background:var(--v06);border-color:var(--v16)}
.rcarte.on{border-color:#c9a97e;background:rgba(201,169,126,.09)}
.rcarte .rh{display:flex;align-items:center;gap:.5rem}
.rcarte .rico{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex:0 0 auto}
.rcarte .rnom{font-weight:700;font-size:.88rem;line-height:1.25}
.rcarte .rdesc{font-size:.76rem;color:var(--tx2);line-height:1.55}
.rcarte .rdesc b{color:var(--tx)}
.rcarte .rn{font-size:.71rem;color:var(--tx-gris);margin-top:auto}
/* ⚠ LA COCHE PREND LE JETON, PAS UNE COULEUR CRUE. Un hexadecimal ecrit ici
   echappe a la palette du mode jour — c est exactement ce que
   banc-contraste-jour refuse, et il l a refuse sur cette ligne. */
.rcarte .coche{margin-left:auto;color:var(--tx-or);font-weight:700;opacity:0}
.rcarte.on .coche{opacity:1}

/* ══ LA MATRICE DES DROITS ══════════════════════════════════════════════════ */
.permtb{width:100%;border-collapse:collapse}
.permtb th{font-size:.68rem;color:var(--tx2);font-weight:600;padding:.3rem .5rem;text-align:center;white-space:nowrap}
.permtb th.mod{text-align:left}
.permtb td{padding:.24rem .5rem;text-align:center;font-size:.8rem}
.permtb td.mod{text-align:left}
.permtb tr.grp td{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--tx-or);background:var(--v03);padding:.5rem .5rem .3rem;border-top:1px solid var(--v10);text-align:left}
.permtb tbody tr:not(.grp):hover{background:var(--v03)}
.permtb input{accent-color:#c9a97e}
.permtb .mnom{display:flex;align-items:center;gap:.4rem}
/* ⚠ LE POINT D'INTERROGATION EST UN BOUTON, PAS UN attribut title. Une infobulle du
   système n'apparaît qu'au survol, disparaît au clavier, et ne tient pas trois
   lignes de texte. Ici on DÉPLIE : ça se lit, ça se relit, et ça marche à la
   tabulation comme à la souris. */
.expl{font:inherit;font-size:.7rem;width:17px;height:17px;line-height:1;border-radius:50%;
  border:1px solid var(--v16);background:var(--v05);color:var(--tx2);cursor:pointer;flex:0 0 auto;padding:0}
.expl:hover{background:var(--v12);color:var(--tx)}
.expl.on{background:rgba(201,169,126,.25);border-color:rgba(201,169,126,.5);color:var(--tx-or)}
.permtb tr.aide td{padding:.1rem .5rem .6rem 1.4rem;text-align:left;font-size:.75rem;color:var(--tx2);line-height:1.6}
.permtb tr.aide b{color:var(--tx)}
.chaud{color:var(--tx-or2);font-size:.72rem;margin-left:.15rem}

/* ══ LE RÉCAPITULATIF ═══════════════════════════════════════════════════════
   ⚠ IL EXISTE PARCE QUE LA DERNIÈRE ÉTAPE EST LA SEULE OÙ L'ON RELIT. Un
   assistant sans récapitulatif fait créer un compte dont personne ne sait ce
   qu'il ouvre — on se souvient d'avoir cliqué, pas de ce qu'on a coché. */
.recap{display:grid;grid-template-columns:auto 1fr;gap:.4rem .9rem;font-size:.84rem;align-items:baseline}
.recap dt{color:var(--tx2);font-size:.74rem;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.recap dd{margin:0}
.sens{margin:.9rem 0 0;padding:.7rem .85rem;border-radius:9px;font-size:.79rem;line-height:1.6;
  background:rgba(200,140,40,.1);border:1px solid rgba(240,180,80,.35);color:var(--tx-or2)}
.sens ul{margin:.35rem 0 0;padding-left:1.1rem}

/* ══ LA REPRISE DU MODE JOUR ════════════════════════════════════════════════
 * ⚠⚠ QUATRE COUPLES SONT PASSES SOUS 4.5 EN MODE JOUR, et c est
 * banc-texte-sur-fond qui les a nommes, pas l oeil : sur mon ecran sombre
 * tout allait bien. Les fonds de ces quatre pastilles restent clairs dans les
 * deux modes (ils portent une couleur d accent, pas une surface), donc leur
 * TEXTE doit s assombrir quand la page s eclaircit.
 * ⚠ LA TEINTE EST CONSERVEE, seule la clarte descend — le minimum necessaire.
 * Changer la teinte ferait un ecran qui ne se ressemble plus d un mode a
 * l autre, et l on ne saurait plus lequel est le bon. */
html.jour .init{color:#5c4620}
/* ⚠ 2026-09-14 : #3f4855 donnait 4.17 sur l or #c9a97e de l etape EN COURS, sous
   le seuil de 4.5. Le banc au rendu le disait depuis la premiere construction du
   2026-09-12 (#103) — et CINQ versions sont parties par-dessus ce rouge, parce
   que -SansRendu ne regarde pas ce terrain et que personne n a ouvert le travail
   des contrastes. Teinte conservee, clarte descendue : 5.02. */
html.jour .chemin .pas .n{color:#343c47}
html.jour .chemin .pas.faite .n{color:#25563a}
html.jour .expl.on{color:#5c4620}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ⚠ Identifiant d'ouverture pour le banc (son DOM est factice, un clic n'y
   navigue nulle part) : 'user-new', 'user-<id>', 'mfa-<id>'.
   ⚠ 'securite' est encore ACCEPTÉ et mène à la liste : une coquille récente
   pourrait le passer par habitude, et tomber sur un écran vide serait pire que
   d'arriver sur la gestion. */
function pageSecurite(onglet) {
  var brut = String(onglet || '');
  var UOUV0 = '', MOUV0 = '';
  if (brut.indexOf('user-') === 0) UOUV0 = brut.slice(5).replace(/[^A-Za-z0-9_-]/g, '');
  else if (brut.indexOf('mfa-') === 0) MOUV0 = brut.slice(4).replace(/[^A-Za-z0-9_-]/g, '');
  return `${TETE()}
<title>${T("Accès Utilisateurs — Administration Sandriza")}</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ico">${ICO.acces}</span><h1>${T("Accès Utilisateurs")}</h1></div>
<div class="ro" id="ro" hidden>${T("Lecture seule : vous pouvez consulter les comptes, pas les modifier.")}</div>
<div class="corps"><div id="corps"><div class="sz-squel" role="status" aria-label="${T("Chargement en cours")}"><i></i><i></i><i></i></div></div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;

  window.szModeAncre = function(actif){
    var t = document.querySelector('.tete'); if (!t) return;
    var b = document.getElementById('sz-detacher');
    if (!b) { b = document.createElement('button'); b.id='sz-detacher'; b.type='button'; b.className='mini'; b.style.marginLeft='auto'; t.appendChild(b); }
    if (actif) { b.textContent='${T("⧉ Détacher")}'; b.title='${T("Ouvrir cet écran dans sa propre fenêtre")}'; b.onclick=function(){ if(P&&P.detacher)P.detacher(); }; }
    else { b.textContent='${T("⚓ Ancrer")}'; b.title='${T("Ramener cet écran dans la fenêtre principale")}'; b.onclick=function(){ if(P&&P.ancrer)P.ancrer(); }; }
  };
${JS_ACTIVITE()}${JS_DIRE()}
  var corps = document.getElementById('corps');
  var D = null, RO = false, OCCUPE = false;
  var UOUV = '${UOUV0}';   // ouverture directe de l editeur (banc) : 'new' ou '<id>'
  var MOUV = '${MOUV0}';   // ouverture directe de la modale MFA (banc) : '<id>'
  var DELU = '';           // compte en attente de confirmation de suppression (2 clics)
  var ONGED = 'identite';  // onglet courant de l editeur

  /* ── L ETAT DE LA LISTE ────────────────────────────────────────────────
     ⚠ IL VIT HORS DU DESSIN : redessiner ne doit pas reinitialiser un filtre.
     C est la faute qui rend une liste inutilisable — on tape trois lettres, la
     liste se rafraichit, et le filtre est parti. */
  var F = { q: '', role: '', etat: '', mfa: '', tri: 'nom' };
  var VUE = 'fiches';      // 'fiches' | 'table'

  /* ⚠ LE MODE SIMPLE EST LE DEFAUT, et il le reste entre deux ouvertures :
     quelqu un qui a besoin du mode avance le sait, quelqu un qui ne l a jamais
     demande n a aucune raison de voir cent quarante-trois cases. */
  var MODE = 'simple';     // 'simple' | 'avance'

  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* ⚠⚠ LES DESCRIPTIONS PORTENT DU GRAS, ET RIEN D AUTRE. Elles sont ecrites
     dans le modele (assets/js/staff.js), pas saisies par quelqu un — mais elles
     traversent le pont, et poser sans echapper ce qui vient d ailleurs est la
     facon dont ce genre de trou s ouvre. On echappe donc TOUT, puis on rend
     leurs chevrons aux SEULES balises de gras. Un modele qui essaierait de
     poser autre chose s afficherait en clair, visible, au lieu de s executer. */
  function riche(s){
    return esc(s).replace(/&lt;b&gt;/g, '<b>').replace(/&lt;\\/b&gt;/g, '</b>');
  }
  function dire(t, cl){ szDire(t, cl); }
  function chkv(id){ var e=document.getElementById(id); return !!(e&&e.checked); }
  function txv(id){ var e=document.getElementById(id); return e?String(e.value||''):''; }

  var MOTIFS = {
    session:'${T("Aucune session ouverte. Connectez-vous dans la fenêtre principale.")}',
    droit:'${T("Votre rôle ne donne pas accès aux comptes du personnel.")}',
    lecture_seule:'${T("Votre rôle est en lecture seule.")}',
    invalide:'${T("Formulaire invalide.")}',
    introuvable:'${T("Compte introuvable.")}',
    refus:'${T("Action refusée par le serveur.")}',
    pont_indisponible:'${T("La fenêtre principale ne répond pas.")}',
    delai:"${T('La fenêtre principale n\'a pas répondu à temps.')}",
    operation_inconnue:'${T("Cette version de l’application ne connaît pas cette opération.")}',
    echec:'${T("L’opération a échoué.")}'
  };
  function expliquer(r){ var m=r&&r.motif; return (MOTIFS[m]||('${T("Erreur inattendue (")}'+esc(m||'?')+').'))+(r&&r.detail?' — '+esc(r.detail):''); }
  function appeler(op, args){
    var p; try { p = P.appeler.apply(P, [op].concat(args||[])); } catch(e){ return Promise.resolve({ok:false,motif:'pont_indisponible'}); }
    if (!p || typeof p.then !== 'function') return Promise.resolve({ok:false,motif:'pont_indisponible'});
    return p.then(function(r){ return r||{ok:false,motif:'echec'}; }).catch(function(e){ return {ok:false,motif:'echec',detail:(e&&e.message)||e}; });
  }

  function fmtTs(iso){ if (!iso) return '${T("Jamais connecté")}'; try { return new Date(iso).toLocaleString('${LIEU()}'); } catch(e){ return '—'; } }
  // Les initiales : deux lettres au plus, prises sur le nom, sinon le courriel.
  function initiales(s){
    var src = String(s.nom || s.email || '?').trim();
    var m = src.split(/[\\s._-]+/).filter(Boolean);
    if (m.length >= 2) return (m[0].charAt(0) + m[1].charAt(0));
    return src.slice(0, 2);
  }

  /* ══ LE FILTRE ════════════════════════════════════════════════════════════
     ⚠ LES QUATRE CRITERES SE CUMULENT (ET). Un filtre absent ne restreint rien :
     c est ce qui permet de partir du parc entier et de le reduire question par
     question, au lieu de deviner la bonne combinaison du premier coup. */
  function filtrer(){
    var q = F.q.trim().toLowerCase();
    return (D.comptes||[]).filter(function(s){
      if (q && [s.nom, s.email, s.username, s.roleLabel, s.role].join(' ').toLowerCase().indexOf(q) < 0) return false;
      if (F.role && s.role !== F.role) return false;
      if (F.etat === 'actif' && !s.active) return false;
      if (F.etat === 'inactif' && s.active) return false;
      if (F.mfa === 'on' && !s.mfaEnabled) return false;
      if (F.mfa === 'off' && s.mfaEnabled) return false;
      if (F.mfa === 'exempt' && !s.mfaExempt) return false;
      return true;
    }).sort(function(a,b){
      if (F.tri === 'recent') return String(b.derniereConnexion||'').localeCompare(String(a.derniereConnexion||''));
      if (F.tri === 'connexions') return (b.nbConnexions||0) - (a.nbConnexions||0);
      if (F.tri === 'role') return String(a.roleLabel||a.role||'').localeCompare(String(b.roleLabel||b.role||''));
      return String(a.nom||a.email||'').localeCompare(String(b.nom||b.email||''));
    });
  }
  function filtreActif(){ return !!(F.q.trim() || F.role || F.etat || F.mfa); }

  /* ⚠⚠ UN COMPTE DÉSACTIVÉ NE PARLE PLUS DE CONNEXION — sa demande du
     2026-09-14, capture à l'appui : « si un compte est désactivé les options MFA
     ne doivent plus vivre... et les boutons aussi ».
     Il a raison, et c'est plus qu'une question d'encombrement : un compte
     désactivé NE PEUT PAS SE CONNECTER. Tout ce qui décrit ou règle sa façon de
     se connecter décrit donc quelque chose qui n'arrivera pas.
       · « MFA ✓ » sur un compte éteint fait croire qu'il est protégé — il n'est
         pas protégé, il est ABSENT, et ce sont deux états très différents ;
       · « MFA exempté » annonce une dérogation à une porte qui ne s'ouvre pas ;
       · le bouton MFA règle une authentification qui ne sera jamais demandée ;
       · « Renvoyer » envoie un mot de passe temporaire à quelqu'un qui ne pourra
         pas s'en servir. Celui-là n'est pas seulement inutile : il fait partir un
         vrai courriel, avec un vrai secret dedans, vers un compte fermé.
     ⚠ CE QUI RESTE : « Modifier » (c'est par là qu'on le réactive) et
     « Supprimer ». Ce sont les deux seuls gestes qui aient un sens sur un compte
     éteint — et les retirer enfermerait le compte dans son état. */
  function etatsDe(s){
    return '<span class="pill role">'+esc(s.roleLabel||s.role||'—')+'</span>'
      + (s.active ? '<span class="pill on">${T("Actif")}</span>' : '<span class="pill off">${T("Désactivé")}</span>')
      + (!s.active ? ''
         : (s.mfaEnabled ? '<span class="pill mfa">MFA ✓</span>'
         : (s.requireMfaSetup ? '<span class="pill warn">${T("MFA à configurer")}</span>'
         : (s.mfaExempt ? '<span class="pill warn">${T("MFA exempté")}</span>' : ''))))
      + (s.estMoi ? '<span class="pill moi">${T("vous")}</span>' : '');
  }

  /* ══ BASCULER L'ÉTAT D'UN COMPTE (#110) ═══════════════════════════════════
     ⚠ IL PASSE PAR UN CŒUR DÉDIÉ, securite:compte:actif, et surtout PAS par
     l'écriture de compte : celle-ci reconstruit la fiche depuis sa charge utile,
     et la ligne de la liste ne porte ni les noms séparés ni les permissions —
     un « Désactiver » câblé dessus aurait effacé les droits personnalisés.
     ⚠ LES REFUS SONT TRADUITS ICI, pas au cœur : le cœur rend un motif nommé
     (soi, dernier_super) justement pour que la phrase naisse du côté qui
     connaît la langue de la page. */
  function basculerActif(id, vise){
    if (OCCUPE) return;
    OCCUPE = true;
    dire(vise ? '${T("Activation…")}' : '${T("Désactivation…")}');
    appeler('securite:compte:actif', [id, !!vise]).then(function(r){
      OCCUPE = false;
      if (r && r.ok) { recharger(vise ? '${T("Compte activé.")}' : '${T("Compte désactivé.")}', 'bon'); return; }
      var m = r && r.motif;
      if (m === 'soi') { dire('${T("Vous ne pouvez pas désactiver votre propre compte.")}', 'err'); return; }
      if (m === 'dernier_super') { dire('${T("Impossible de désactiver le dernier super-administrateur actif.")}', 'err'); return; }
      dire('${T("Échec : ")}' + expliquer(r), 'err');
    });
  }

  function gestesDe(s, superActifs){
    var peutSuppr = !s.estMoi && (!s.estSuper || superActifs > 1);
    return '<button class="b" data-edit="'+esc(s.id)+'"><span class="ic">✏</span> ${T("Modifier")}</button>'
      + (s.active ? '<button class="b" data-mfa="'+esc(s.id)+'" title="${T("Gérer l’authentification à deux facteurs")}"><span class="ic">🔐</span> MFA</button>' : '')
      + (s.active && !s.estSuper ? '<button class="b" data-invite="'+esc(s.id)+'" title="${T("Renvoyer un mot de passe temporaire par courriel")}"><span class="ic">📧</span> ${T("Renvoyer")}</button>' : '')
      + (peutSuppr ? '<button class="b dgr" data-del="'+esc(s.id)+'">'+(DELU===s.id?'${T("✓ Confirmer")}':'${T("Supprimer")}')+'</button>' : '');
  }

  // ── LA LISTE ─────────────────────────────────────────────────────
  function vueUsers(){
    var comptes = D.comptes||[], roles = D.roles||[];
    var superActifs = 0; for (var k=0;k<comptes.length;k++) if (comptes[k].estSuper && comptes[k].active) superActifs++;
    var vus = filtrer();

    var roleOpts = '<option value="">${T("Tous les rôles")}</option>';
    for (var r=0;r<roles.length;r++) roleOpts += '<option value="'+esc(roles[r].key)+'"'+(F.role===roles[r].key?' selected':'')+'>'
      + esc(roles[r].icon||'')+' '+esc(roles[r].label)+'</option>';

    var h = '<div class="entete"><h2>${T("Comptes du personnel")}</h2><div class="outils">'
      + '<div class="vues">'
      + '<button data-vue="fiches" class="'+(VUE==='fiches'?'on':'')+'">${T("Fiches")}</button>'
      + '<button data-vue="table" class="'+(VUE==='table'?'on':'')+'">${T("Liste")}</button></div>'
      + (D.peutModifier ? '<button class="prim" id="u-nouveau">${T("＋ Créer un accès")}</button>' : '')
      + '</div></div>';

    h += '<div class="filtres">'
      + '<input aria-label="${T("Rechercher un nom, un courriel, un rôle")}" class="recherche" id="u-q" placeholder="${T("Rechercher un nom, un courriel, un rôle…")}" value="'+esc(F.q)+'">'
      + '<select id="f-role" aria-label="${T("Filtrer par rôle")}">'+roleOpts+'</select>'
      + '<span class="fgr"><span class="lbl">${T("État")}</span>'
      + '<button class="jeton'+(F.etat==='actif'?' on':'')+'" data-etat="actif">${T("Actifs")}</button>'
      + '<button class="jeton'+(F.etat==='inactif'?' on':'')+'" data-etat="inactif">${T("Désactivés")}</button></span>'
      + '<span class="fgr"><span class="lbl">MFA</span>'
      + '<button class="jeton'+(F.mfa==='on'?' on':'')+'" data-mfa-f="on">${T("Activé")}</button>'
      + '<button class="jeton'+(F.mfa==='off'?' on':'')+'" data-mfa-f="off">${T("Absent")}</button>'
      + '<button class="jeton'+(F.mfa==='exempt'?' on':'')+'" data-mfa-f="exempt">${T("Exempté")}</button></span>'
      + '<select id="f-tri" aria-label="${T("Ordre de tri")}">'
      + '<option value="nom"'+(F.tri==='nom'?' selected':'')+'>${T("Par nom")}</option>'
      + '<option value="role"'+(F.tri==='role'?' selected':'')+'>${T("Par rôle")}</option>'
      + '<option value="recent"'+(F.tri==='recent'?' selected':'')+'>${T("Connexion la plus récente")}</option>'
      + '<option value="connexions"'+(F.tri==='connexions'?' selected':'')+'>${T("Nombre de connexions")}</option>'
      + '</select>'
      + (filtreActif() ? '<button class="jeton" id="f-vider">${T("✕ Tout effacer")}</button>' : '')
      + '</div>';

    /* ⚠ LA BANDE DE COMPTEURS EST RETIREE — SA DEMANDE DU 2026-09-14, capture a
       l appui (<< retire ca ici dans acces utilisateur >>). Elle affichait
       Comptes affiches / Actifs / MFA active / Super-administrateurs.
       ⚠ CE QU ELLE PORTAIT ET QUI N EST PAS PERDU : l avertissement
       << un seul actif — aucune marge >>. Le garde-fou ne tenait PAS a ce texte
       mais au bouton lui-meme — gestesDe() n affiche << Supprimer >> sur un
       super-administrateur que si superActifs > 1. Retirer la bande ne retire
       donc aucune protection ; elle ne faisait que la commenter.
       ⚠ superActifs reste calcule plus haut : il sert a gestesDe(). */

    if (!comptes.length) {
      h += '<div class="vide">${T("Aucun compte du personnel.")}</div>';
    } else if (!vus.length) {
      h += '<div class="vide">${T("Aucun compte ne correspond à ces filtres.")}</div>';
    } else if (VUE === 'table') {
      h += '<table class="tbl"><thead><tr>'
        + '<th>${T("Personne")}</th><th>${T("Rôle")}</th><th>${T("État")}</th>'
        + '<th>${T("Dernière connexion")}</th><th></th></tr></thead><tbody>';
      for (var t=0;t<vus.length;t++){ var u=vus[t];
        h += '<tr class="'+(u.active?'':'inactif')+'" data-ligne="'+esc(u.id)+'">'
          + '<td><div class="nm"><span class="init">'+esc(initiales(u))+'</span>'
          + '<span style="min-width:0"><b>'+esc(u.nom||'—')+'</b>'
          + '<div class="dt">'+(u.username?'@'+esc(u.username)+' · ':'')+esc(u.email||'')+'</div></span></div></td>'
          + '<td><span class="pill role">'+esc(u.roleLabel||u.role||'—')+'</span></td>'
          + '<td>'+(u.active ? '<span class="pill on">${T("Actif")}</span>' : '<span class="pill off">${T("Désactivé")}</span>')
          + (u.mfaEnabled ? ' <span class="pill mfa">MFA ✓</span>' : (u.mfaExempt ? ' <span class="pill warn">${T("MFA exempté")}</span>' : ''))
          + (u.estMoi ? ' <span class="pill moi">${T("vous")}</span>' : '') + '</td>'
          + '<td class="dt">'+esc(fmtTs(u.derniereConnexion))+'</td>'
          + '<td class="act">'+(D.peutModifier ? gestesDe(u, superActifs) : '')+'</td></tr>';
      }
      h += '</tbody></table>';
    } else {
      h += '<div class="fiches">';
      for (var i=0;i<vus.length;i++){ var s=vus[i];
        h += '<div class="fiche'+(s.active?'':' inactif')+'" data-ligne="'+esc(s.id)+'">'
          + '<div class="haut"><div class="init">'+esc(initiales(s))+'</div>'
          + '<div class="qui"><div class="nom">'+esc(s.nom||'—')+'</div>'
          + '<div class="coord">'+(s.username?'@'+esc(s.username)+' · ':'')+esc(s.email||'')+'</div></div></div>'
          + '<div class="etats">'+etatsDe(s)+'</div>'
          /* ⚠ Le singulier et le pluriel, chacun entier : coupe en << connexion >>
             + << s >>, le compte ne laissait qu un morceau a traduire. */
          + '<div class="quand">'+esc(fmtTs(s.derniereConnexion))+' · '+(s.nbConnexions||0)
          + ((s.nbConnexions||0)>1?'${T(" connexions")}':'${T(" connexion")}')+'</div>'
          + (D.peutModifier ? '<div class="barre">'+gestesDe(s, superActifs)+'</div>' : '')
          + '</div>';
      }
      h += '</div>';
    }

    corps.innerHTML = h;

    /* ⚠ LE CHAMP GARDE LE CURSEUR. Redessiner la liste a chaque frappe remet le
       curseur au debut : on tape << marie >> et l on obtient << eiram >>. */
    var q2=document.getElementById('u-q');
    if (q2) {
      q2.oninput=function(){ F.q=this.value; var pos=this.selectionStart; vueUsers();
        var n=document.getElementById('u-q'); if (n){ n.focus(); try { n.setSelectionRange(pos,pos); } catch(e){} } };
    }
    var fr=document.getElementById('f-role'); if (fr) fr.onchange=function(){ F.role=this.value; vueUsers(); };
    var ft=document.getElementById('f-tri'); if (ft) ft.onchange=function(){ F.tri=this.value; vueUsers(); };
    var fv=document.getElementById('f-vider'); if (fv) fv.onclick=function(){ F.q=''; F.role=''; F.etat=''; F.mfa=''; vueUsers(); };
    /* ⚠ UN JETON DEJA ACTIF SE RETIRE EN LE RECLIQUANT — sinon il n y a aucun
       moyen de revenir au parc entier sans vider tous les filtres. */
    var je=corps.querySelectorAll('[data-etat]');
    for (var e1=0;e1<je.length;e1++) je[e1].onclick=function(){ var v=this.getAttribute('data-etat'); F.etat=(F.etat===v?'':v); vueUsers(); };
    var jm=corps.querySelectorAll('[data-mfa-f]');
    for (var m1=0;m1<jm.length;m1++) jm[m1].onclick=function(){ var v=this.getAttribute('data-mfa-f'); F.mfa=(F.mfa===v?'':v); vueUsers(); };
    var jv=corps.querySelectorAll('[data-vue]');
    for (var v1=0;v1<jv.length;v1++) jv[v1].onclick=function(){ VUE=this.getAttribute('data-vue'); vueUsers(); };

    var nv=document.getElementById('u-nouveau'); if (nv) nv.onclick=function(){ ouvrirAssistant(); };
    var eds=corps.querySelectorAll('[data-edit]'); for (var e=0;e<eds.length;e++) eds[e].onclick=function(){ ouvrirEditeurCompte(this.getAttribute('data-edit')); };
    var mfas=corps.querySelectorAll('[data-mfa]'); for (var mm=0;mm<mfas.length;mm++) mfas[mm].onclick=function(){ ouvrirMfa(this.getAttribute('data-mfa')); };
    var invs=corps.querySelectorAll('[data-invite]'); for (var v=0;v<invs.length;v++) invs[v].onclick=function(){ inviterCompte(this.getAttribute('data-invite')); };
    var dels=corps.querySelectorAll('[data-del]'); for (var d=0;d<dels.length;d++) dels[d].onclick=function(){ var id=this.getAttribute('data-del');
      if (DELU===id){ DELU=''; supprimerCompte(id); } else { DELU=id; vueUsers(); dire('${T("Cliquez encore pour supprimer ce compte.")}', 'att'); } };

    /* ══ LE CLIC DROIT SUR UNE LIGNE (#110) ═══════════════════════════════════
       ⚠ IL N OFFRE QUE CE QUE LA LIGNE OFFRE DEJA, aux memes conditions : un
       menu contextuel qui pourrait faire ce que les boutons refusent serait une
       porte derobee. Un compte eteint n y montre donc ni MFA ni invitation, et
       << Supprimer >> n y parait que si le bouton parait — memes gardes, meme
       calcul du nombre de super-administrateurs actifs.
       ⚠ IL NE SE POSE QUE SI L ON PEUT MODIFIER : sans ce droit, la liste est en
       lecture, et un menu d actions sur une lecture ne promet que des refus. */
    if (D.peutModifier) {
      var lignes = corps.querySelectorAll('[data-ligne]');
      for (var L=0; L<lignes.length; L++) {
        lignes[L].addEventListener('contextmenu', function(ev){
          ev.preventDefault();
          ouvrirCtx(this.getAttribute('data-ligne'), ev.clientX, ev.clientY);
        });
      }
    }
  }

  /* Le menu du clic droit. Un seul a la fois — on retire le precedent avant d en
     poser un autre, sinon deux menus se superposent sur deux clics rapides. */
  function fermerCtx(){
    var v = document.getElementById('sz-ctx');
    if (v && v.parentNode) v.parentNode.removeChild(v);
  }

  function ouvrirCtx(id, x, y){
    fermerCtx();
    var comptes = (D && D.comptes) || [];
    var s = null;
    for (var i=0;i<comptes.length;i++) if (comptes[i].id === id) { s = comptes[i]; break; }
    if (!s) return;
    var superActifs = 0;
    for (var k=0;k<comptes.length;k++) if (comptes[k].estSuper && comptes[k].active) superActifs++;
    var peutSuppr = !s.estMoi && (!s.estSuper || superActifs > 1);
    /* ⚠ MEME REGLE QUE LE COEUR, pour ne pas proposer un geste qu il refusera :
       on ne s eteint pas soi-meme, et pas le dernier super-administrateur actif.
       Une entree qui promet puis se dedit est pire qu une entree absente. */
    var peutEteindre = s.active && !s.estMoi && (!s.estSuper || superActifs > 1);

    var h = '<div class="tt">' + esc(s.nom || s.email || '') + '</div>'
      + '<button data-c="edit">${T("Modifier le compte…")}</button>'
      + '<button data-c="perms">${T("Gérer ses accès…")}</button>';
    if (s.active) {
      h += '<button data-c="mfa">${T("Gérer le MFA…")}</button>';
      if (!s.estSuper) h += '<button data-c="invite">${T("Renvoyer l’invitation")}</button>';
    }
    h += '<div class="trait"></div>';
    if (s.active) {
      h += '<button data-c="off"' + (peutEteindre ? '' : ' disabled style="opacity:.45;cursor:default"')
        + '>${T("Désactiver le compte")}</button>';
    } else {
      h += '<button data-c="on">${T("Activer le compte")}</button>';
    }
    if (peutSuppr) h += '<button class="dgr" data-c="del">${T("Supprimer le compte…")}</button>';

    var m = document.createElement('div');
    m.className = 'ctx'; m.id = 'sz-ctx'; m.innerHTML = h;
    document.body.appendChild(m);

    /* ⚠ ON LE REPLIE DANS L ECRAN APRES L AVOIR POSE : sa hauteur depend de ses
       entrees, qui dependent du compte. Calculer avant de mesurer donnerait un
       menu a moitie hors de la fenetre sur la derniere ligne de la liste. */
    var r = m.getBoundingClientRect();
    var gx = Math.min(x, window.innerWidth  - r.width  - 8);
    var gy = Math.min(y, window.innerHeight - r.height - 8);
    m.style.left = Math.max(8, gx) + 'px';
    m.style.top  = Math.max(8, gy) + 'px';

    var bs = m.querySelectorAll('button');
    for (var b=0;b<bs.length;b++) bs[b].onclick = function(){
      if (this.disabled) return;
      var quoi = this.getAttribute('data-c');
      fermerCtx();
      if (quoi === 'edit')   { ouvrirEditeurCompte(id); return; }
      if (quoi === 'perms')  { ouvrirEditeurCompte(id, 'droits'); return; }
      if (quoi === 'mfa')    { ouvrirMfa(id); return; }
      if (quoi === 'invite') { inviterCompte(id); return; }
      if (quoi === 'on')     { basculerActif(id, true); return; }
      if (quoi === 'off')    { basculerActif(id, false); return; }
      /* ⚠ LA SUPPRESSION GARDE SA CONFIRMATION EN DEUX TEMPS, celle du bouton :
         un menu contextuel rend le geste plus rapide, pas plus definitif. */
      if (quoi === 'del')    { DELU = id; vueUsers(); dire('${T("Cliquez « Supprimer » encore une fois pour confirmer.")}', 'att'); }
    };
  }

  /* ⚠ TROIS FACONS DE LE REFERMER, et c est deliberé : un menu qui reste ouvert
     pendant qu on fait autre chose finit par recevoir un clic qu on ne lui
     destinait pas — et une de ses entrees supprime un compte. */
  document.addEventListener('click', function(e){
    var v = document.getElementById('sz-ctx');
    if (v && !v.contains(e.target)) fermerCtx();
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') fermerCtx(); });
  window.addEventListener('wheel', fermerCtx, { passive: true });

  /* ══ LA MATRICE DES DROITS, AVEC SES EXPLICATIONS ══════════════════════════
     ⚠⚠ CHAQUE MODULE PORTE UN BOUTON QUI DEPLIE SA DESCRIPTION. Le modele la
     fournit dans permModel, et banc-permissions refuse un module qui n en
     aurait pas : une case a cocher sans rien qui dise ce qu elle ouvre est la
     facon la plus ordinaire d accorder trop.
     ⚠ LES MODULES SENSIBLES PORTENT UN SIGNE. Ce n est pas une garde — c est un
     avertissement, et il est a cote de la case, pas dans une note en bas. */
  function permMatrice(F2, cochees){
    var acts = F2.actions||[], lbls = F2.actionLabels||{}, model = F2.permModel||[];
    var eff = cochees || [];
    var h = '<table class="permtb"><thead><tr><th class="mod">${T("Module")}</th>';
    for (var a=0;a<acts.length;a++) h += '<th>'+esc(lbls[acts[a]]||acts[a])+'</th>';
    h += '</tr></thead><tbody>';
    for (var g=0;g<model.length;g++){ var grp=model[g];
      h += '<tr class="grp"><td colspan="'+(acts.length+1)+'">'+esc(grp.label)+'</td></tr>';
      for (var m=0;m<grp.modules.length;m++){ var mod=grp.modules[m];
        h += '<tr><td class="mod"><span class="mnom">'
          + (mod.desc ? '<button type="button" class="expl" data-expl="'+esc(mod.key)+'" aria-expanded="false" title="${T("Ce que ce droit ouvre")}">?</button>' : '')
          /* ⚠ LE SIGNE PASSE PAR LA CLASSE ic — la regle du depot : un
             pictogramme nu reste sombre sur fond sombre et blanc sur fond
             clair. La classe chaud ne porte que la teinte ; ic porte la
             correction de luminosite. */
          + '<span>'+esc(mod.label)+(mod.sensible?'<span class="chaud" title="${T("Droit sensible")}"><span class="ic">⚠</span></span>':'')+'</span></span></td>';
        for (var a2=0;a2<acts.length;a2++){ var act=acts[a2];
          if (mod.actions.indexOf(act)<0){ h += '<td style="color:var(--tx3)">—</td>'; continue; }
          var key = mod.key+':'+act;
          /* ⚠ LA MATRICE DES DROITS EST LE PIRE ENDROIT POUR UNE CASE SANS NOM.
             Le module est dans la premiere cellule, l action dans l en-tete de
             colonne : a l oeil, tout est dit. En tabulant, le lecteur d ecran
             annonce << case a cocher, cochee >> et rien d autre — on accorde ou
             on retire un droit SANS SAVOIR LEQUEL. Le nom se compose des deux. */
          h += '<td><input type="checkbox" data-perm="'+esc(key)+'" '
            + 'aria-label="'+esc((mod.label||mod.key)+' — '+(lbls[act]||act))+'" '
            + (eff.indexOf(key)>=0?'checked':'')+'></td>';
        }
        h += '</tr>';
        if (mod.desc) h += '<tr class="aide" data-aide="'+esc(mod.key)+'" hidden><td colspan="'+(acts.length+1)+'">'+riche(mod.desc)+'</td></tr>';
      }
    }
    return h + '</tbody></table>';
  }

  function cablerExpl(racine){
    var bs = racine.querySelectorAll('[data-expl]');
    for (var i=0;i<bs.length;i++) bs[i].onclick=function(){
      var k=this.getAttribute('data-expl');
      var l=racine.querySelector('[data-aide="'+k+'"]');
      if (!l) return;
      var ouvert = !l.hidden;
      l.hidden = ouvert;
      this.className = 'expl' + (ouvert?'':' on');
      this.setAttribute('aria-expanded', ouvert?'false':'true');
    };
  }

  /* ══ LES CARTES DE ROLE ═══════════════════════════════════════════════════ */
  function cartesRoles(roles, choisi){
    var h = '<div class="roles">';
    for (var i=0;i<roles.length;i++){ var r=roles[i];
      var n = (r.permissions||[]).length;
      h += '<button type="button" class="rcarte'+(choisi===r.key?' on':'')+'" data-role="'+esc(r.key)+'">'
        + '<span class="rh"><span class="rico" style="background:'+esc(r.color||'#334155')+'22;color:'+esc(r.color||'#94a3b8')+'">'+esc(r.icon||'•')+'</span>'
        + '<span class="rnom">'+esc(r.label)+'</span><span class="coche">✓</span></span>'
        + '<span class="rdesc">'+riche(r.desc||'')+'</span>'
        + '<span class="rn">'+n+'${T(" droits accordés par défaut")}</span>'
        + '</button>';
    }
    return h + '</div>';
  }

  /* ══════════════════════════════════════════════════════════════════════════
   * L ASSISTANT DE CREATION (2026-09-13)
   * ══════════════════════════════════════════════════════════════════════════
   * ⚠⚠ IL NE SERT QU A LA CREATION. Modifier, c est revenir sur UN point precis :
   * imposer cinq etapes pour changer une case serait une punition. La
   * modification garde ses onglets.
   * ⚠ L ETAT DE LA SAISIE VIT DANS UNE VARIABLE, PAS DANS LE DOM. On passe d une etape a
   * l autre en redessinant ; si la saisie vivait dans les champs, chaque pas en
   * arriere effacerait ce qu on vient d ecrire.
   */
  var A = null;

  function etapesAssistant(){
    /* ⚠ LE MODE SIMPLE SAUTE L ETAPE DES DROITS — pas parce qu elle serait trop
       difficile, mais parce que le ROLE y a deja repondu. La montrer quand meme,
       vide de decision, apprendrait a la survoler. */
    var e = [
      ['qui',   '${T("Identité")}'],
      ['role',  '${T("Rôle")}'],
      ['acces', '${T("Sécurité")}']
    ];
    if (MODE === 'avance') e.push(['droits', '${T("Droits")}']);
    e.push(['fin', '${T("Récapitulatif")}']);
    return e;
  }

  function ouvrirAssistant(){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Ouverture…")}');
    appeler('securite:form',['']).then(function(r){ OCCUPE=false;
      if (!r||!r.ok){ dire('${T("Échec : ")}'+expliquer(r), 'err'); return; }
      dire('');
      var roles = r.roles||[];
      var defaut = 'admin';
      for (var i=0;i<roles.length;i++) if (roles[i].key==='lecture') defaut = 'lecture';
      /* ⚠⚠ LE ROLE PROPOSE EST LE PLUS ETROIT DISPONIBLE, jamais << Administrateur >>.
         Un assistant qui pre-coche le role le plus puissant fait passer tout le
         monde par la : on clique << Suivant >> trois fois et l on vient d ouvrir
         la boutique entiere a un stagiaire. Le defaut doit couter a elargir, pas
         a restreindre. */
      A = { F: r, etape: 0, role: defaut, perms: null,
            first:'', last:'', username:'', email:'', pw:'',
            active:true, reqmfa:true, exempt:false, q1:'', a1:'', q2:'', a2:'' };
      dessinerAssistant();
    });
  }
  function fermerAssistant(){ szPleinReinit(); A=null; var s=document.getElementById('sur-a'); if (s) s.remove(); }

  function permsDuRole(cle){
    var roles = (A.F.roles)||[];
    for (var i=0;i<roles.length;i++) if (roles[i].key===cle) return (roles[i].permissions||[]).slice();
    return [];
  }
  function permsCourantes(){ return A.perms ? A.perms.slice() : permsDuRole(A.role); }
  function roleCourant(){
    var roles=(A.F.roles)||[];
    for (var i=0;i<roles.length;i++) if (roles[i].key===A.role) return roles[i];
    return null;
  }

  /* ⚠ LES DROITS SENSIBLES SE COMPTENT ET SE NOMMENT AU RECAPITULATIF. C est la
     seule etape ou l on relit, et la seule occasion de voir qu un << Commis >>
     vient d heriter des cles de paiement. */
  function sensiblesDe(perms){
    var out=[], model=(A.F.permModel)||[];
    for (var g=0;g<model.length;g++) for (var m=0;m<model[g].modules.length;m++){
      var mod=model[g].modules[m];
      if (!mod.sensible) continue;
      for (var p=0;p<perms.length;p++) if (perms[p].indexOf(mod.key+':')===0){ out.push(mod.label); break; }
    }
    return out;
  }

  function dessinerAssistant(){
    var etapes = etapesAssistant();
    if (A.etape >= etapes.length) A.etape = etapes.length-1;
    var cle = etapes[A.etape][0];
    var perms = permsCourantes();

    var chemin = '';
    for (var i=0;i<etapes.length;i++){
      if (i) chemin += '<span class="fleche"><span class="ic">›</span></span>';
      chemin += '<span class="pas'+(i===A.etape?' on':(i<A.etape?' faite':''))+'">'
        + '<span class="n">'+(i<A.etape?'✓':(i+1))+'</span><span class="t">'+esc(etapes[i][1])+'</span></span>';
    }

    var vol = '';
    if (cle === 'qui') {
      vol = '<p class="aideOng">${T("Qui est cette personne. Le <b>nom d’utilisateur</b> lui sert à se connecter ; le courriel reçoit l’invitation et les avis de sécurité.")}</p>'
        + '<div class="cols2">'
        + '<label class="champ"><span class="lbl">${T("Prénom")}</span><input class="t" id="a-first" value="'+esc(A.first)+'"></label>'
        + '<label class="champ"><span class="lbl">${T("Nom")}</span><input class="t" id="a-last" value="'+esc(A.last)+'"></label>'
        + '<label class="champ"><span class="lbl">${T("Nom d’utilisateur")}</span><input class="t" id="a-username" value="'+esc(A.username)+'" placeholder="${T("ex : marie_b")}">'
        + '<span class="sub">${T("Minuscules, chiffres, tiret et soulignement.")}</span></label>'
        + '<label class="champ"><span class="lbl">${T("Courriel")} <span class="req">*</span></span>'
        + '<input class="t" type="email" id="a-email" value="'+esc(A.email)+'">'
        + '<span class="sub">${T("Il ne pourra plus être modifié après la création.")}</span></label>'
        + '</div>';
    } else if (cle === 'role') {
      var rc = roleCourant();
      vol = '<p class="aideOng">${T("Le rôle décrit le <b>métier</b> de la personne et coche les droits qui vont avec. C’est la seule question à laquelle il faut répondre neuf fois sur dix.")}</p>'
        + cartesRoles(A.F.roles||[], A.role)
        + (rc ? '<div class="note" style="margin-top:1rem"><b>'+esc(rc.label)+'</b> — '+riche(rc.desc||'')+'</div>' : '')
        + (MODE==='simple'
            ? '<div class="note">${T("En mode <b>simple</b>, le rôle décide seul. Passez en <b>avancé</b> (en haut à droite) pour ajouter ou retirer un droit précis.")}</div>'
            : '');
    } else if (cle === 'acces') {
      vol = '<p class="aideOng">${T("Comment cette personne prouve son identité, et si son compte est utilisable dès maintenant.")}</p>'
        + '<label class="champ"><span class="lbl">${T("Mot de passe")}</span>'
        + '<input class="t" type="password" id="a-pw" autocomplete="new-password" value="'+esc(A.pw)+'" placeholder="${T("laisser vide = généré et envoyé par courriel")}">'
        + '<span class="sub">${T("Vide : un mot de passe temporaire est créé et envoyé au courriel indiqué.")}</span></label>'
        + '<label class="case"><input type="checkbox" id="a-active" '+(A.active?'checked':'')+'>'
        + '<span>${T("Compte actif")}<span class="quoi">${T("Décoché, la personne ne peut plus se connecter — sans que le compte ni son historique soient supprimés.")}</span></span></label>'
        + '<label class="case"><input type="checkbox" id="a-reqmfa" '+(A.reqmfa?'checked':'')+'>'
        + '<span>${T("Exiger la configuration MFA à la 1<sup>re</sup> connexion")}<span class="quoi">${T("Elle devra lier une application d’authentification avant d’accéder à l’administration.")}</span></span></label>'
        + '<label class="case"><input type="checkbox" id="a-exempt" '+(A.exempt?'checked':'')+'>'
        + '<span>${T("Exempté de MFA")}<span class="quoi">${T("À réserver aux cas où le second facteur est impossible : c’est un rempart en moins.")}</span></span></label>'
        + (MODE==='avance' ? questionsHtml('a') : '');
    } else if (cle === 'droits') {
      var rc2 = roleCourant();
      vol = '<p class="aideOng">${T("Les droits cochés par le rôle, et ce que vous en changez. Le <b>?</b> devant un module explique ce qu’il ouvre.")}</p>'
        + '<div class="note"><b>'+esc(rc2?rc2.label:'')+'</b> — '
        + perms.length+'${T(" droits cochés")}'
        + ' <button type="button" class="mini" id="a-replacer">${T("Replacer sur le rôle")}</button></div>'
        + '<div id="a-perms">'+permMatrice(A.F, perms)+'</div>';
    } else {
      var rc3 = roleCourant();
      var sens = sensiblesDe(perms);
      var nomComplet = ((A.first||'')+' '+(A.last||'')).trim();
      vol = '<p class="aideOng">${T("Relisez avant de créer. C’est la seule étape où l’on voit d’un coup ce que ce compte pourra faire.")}</p>'
        + '<dl class="recap">'
        + '<dt>${T("Personne")}</dt><dd>'+esc(nomComplet||'—')+(A.username?' <span class="pill role">@'+esc(A.username)+'</span>':'')+'</dd>'
        + '<dt>${T("Courriel")}</dt><dd>'+esc(A.email||'—')+'</dd>'
        + '<dt>${T("Rôle")}</dt><dd>'+esc(rc3?((rc3.icon||'')+' '+rc3.label):'—')+'</dd>'
        + '<dt>${T("Droits")}</dt><dd>'+perms.length+'${T(" droits")}'
        + (A.perms ? '${T(" (modifiés à la main)")}' : '${T(" (ceux du rôle)")}')+'</dd>'
        + '<dt>${T("Mot de passe")}</dt><dd>'+(A.pw?'${T("Choisi ici")}':'${T("Généré et envoyé par courriel")}')+'</dd>'
        + '<dt>${T("État")}</dt><dd>'+(A.active?'${T("Actif dès la création")}':'${T("Créé désactivé")}')+'</dd>'
        + '<dt>MFA</dt><dd>'+(A.exempt?'${T("Exempté — un rempart en moins")}':(A.reqmfa?'${T("Exigé à la 1re connexion")}':'${T("Facultatif")}'))+'</dd>'
        + '</dl>'
        + (sens.length ? '<div class="sens"><b>${T("Ce compte recevra des droits sensibles :")}</b><ul><li>'
            + sens.map(esc).join('</li><li>')+'</li></ul></div>' : '');
    }

    var dernier = (A.etape === etapes.length-1);
    var sur=document.getElementById('sur-a');
    var neuf = !sur;
    if (neuf){ sur=document.createElement('div'); sur.className='sur'; sur.id='sur-a'; }
    sur.innerHTML = '<div class="boite'+(cle==='droits'?' large':'')+'">'
      + '<div class="tt"><h3>${T("＋ Créer un accès")}</h3>'
      + '<div style="display:flex;gap:.5rem;align-items:center">'
      + '<div class="mode">'
      + '<button data-mode="simple" class="'+(MODE==='simple'?'on':'')+'" title="${T("Le rôle décide seul")}">${T("Simple")}</button>'
      + '<button data-mode="avance" class="'+(MODE==='avance'?'on':'')+'" title="${T("Ajouter la matrice des droits et les questions de secours")}">${T("Avancé")}</button></div>'
      + '<button class="sz-btnplein" id="a-plein" title="${T("Occuper toute la fenêtre")}">${T("⛶ Plein écran")}</button>'
      + '<button class="mini" id="a-x">${T("Fermer")}</button></div></div>'
      + '<div class="chemin">'+chemin+'</div>'
      + '<div class="liste"><div class="ferr" id="a-err"></div>'+vol+'</div>'
      + '<div class="tt" style="justify-content:space-between;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="a-prec"'+(A.etape===0?' disabled':'')+'>${T("← Précédent")}</button>'
      + '<div style="display:flex;gap:.5rem">'
      + '<button class="b" id="a-annuler">${T("Annuler")}</button>'
      + '<button class="prim" id="a-suiv">'+(dernier?'${T("Créer le compte")}':'${T("Suivant →")}')+'</button>'
      + '</div></div></div>';
    if (neuf) document.body.appendChild(sur);

    document.getElementById('a-x').onclick=fermerAssistant;
    document.getElementById('a-annuler').onclick=fermerAssistant;
    var bp=document.getElementById('a-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };

    var bm=sur.querySelectorAll('[data-mode]');
    for (var m2=0;m2<bm.length;m2++) bm[m2].onclick=function(){
      lireEtape(cle); MODE=this.getAttribute('data-mode');
      /* ⚠ REVENIR EN MODE SIMPLE NE JETTE PAS LES DROITS MODIFIES A LA MAIN.
         Ils restent, et le recapitulatif le dit (<< modifiés à la main >>).
         Les effacer en silence ferait perdre un reglage fin par un simple clic
         sur un bouton d affichage. */
      dessinerAssistant();
    };

    document.getElementById('a-prec').onclick=function(){ lireEtape(cle); if (A.etape>0){ A.etape--; dessinerAssistant(); } };
    document.getElementById('a-suiv').onclick=function(){
      lireEtape(cle);
      var err = validerEtape(cle);
      if (err){ aerr(err); return; }
      aerr('');
      if (dernier) creerDepuisAssistant();
      else { A.etape++; dessinerAssistant(); }
    };

    if (cle === 'qui'){
      var un=document.getElementById('a-username');
      if (un) un.oninput=function(){ un.value=un.value.toLowerCase().replace(/[^a-z0-9_-]/g,''); };
    }
    if (cle === 'role'){
      var rcs=sur.querySelectorAll('[data-role]');
      for (var r2=0;r2<rcs.length;r2++) rcs[r2].onclick=function(){
        A.role=this.getAttribute('data-role');
        /* ⚠⚠ CHANGER DE ROLE REPLACE LES DROITS SUR CEUX DU ROLE. Garder des
           cases cochees pour l ancien role donnerait un compte qui ne
           ressemble a aucun metier — et personne ne saurait plus pourquoi il a
           ce droit-la. Le mode avance permet ensuite de s en ecarter. */
        A.perms=null;
        dessinerAssistant();
      };
    }
    if (cle === 'droits'){
      cablerExpl(sur);
      var rp=document.getElementById('a-replacer');
      if (rp) rp.onclick=function(){ A.perms=null; dessinerAssistant(); dire('${T("Droits replacés sur ceux du rôle.")}', 'att'); };
    }
  }

  function questionsHtml(p){
    var qs = (A ? A.F.questions : []) || [];
    var opts=function(sel){ var o='<option value="">${T("— Choisir —")}</option>';
      for (var i=0;i<qs.length;i++) o+='<option value="'+esc(qs[i])+'"'+(sel===qs[i]?' selected':'')+'>'+esc(qs[i])+'</option>'; return o; };
    return '<div class="note" style="margin-top:1.1rem">${T("<b>Questions de secours</b> — elles servent à rouvrir le compte si le mot de passe est perdu. Facultatives, mais sans elles la seule issue est de recréer le compte.")}</div>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">${T("Question 1")}</span><select class="t" id="'+p+'-q1">'+opts(A.q1)+'</select></label>'
      + '<label class="champ"><span class="lbl">${T("Réponse 1")}</span><input class="t" id="'+p+'-a1" autocomplete="off" value="'+esc(A.a1)+'"></label>'
      + '<label class="champ"><span class="lbl">${T("Question 2")}</span><select class="t" id="'+p+'-q2">'+opts(A.q2)+'</select></label>'
      + '<label class="champ"><span class="lbl">${T("Réponse 2")}</span><input class="t" id="'+p+'-a2" autocomplete="off" value="'+esc(A.a2)+'"></label>'
      + '</div>';
  }

  /* ⚠ ON LIT LES CHAMPS AVANT CHAQUE PAS, dans les DEUX sens. Ne lire qu en
     avancant perdrait la saisie de celui qui recule pour corriger une faute de
     frappe — c est le geste le plus frequent d un assistant. */
  function lireEtape(cle){
    if (!A) return;
    if (cle === 'qui'){
      A.first=txv('a-first'); A.last=txv('a-last');
      A.username=txv('a-username'); A.email=txv('a-email');
    } else if (cle === 'acces'){
      A.pw=txv('a-pw'); A.active=chkv('a-active');
      A.reqmfa=chkv('a-reqmfa'); A.exempt=chkv('a-exempt');
      if (document.getElementById('a-q1')){ A.q1=txv('a-q1'); A.a1=txv('a-a1'); A.q2=txv('a-q2'); A.a2=txv('a-a2'); }
    } else if (cle === 'droits'){
      var p=[], cbs=document.querySelectorAll('#a-perms [data-perm]');
      for (var i=0;i<cbs.length;i++) if (cbs[i].checked) p.push(cbs[i].getAttribute('data-perm'));
      /* ⚠ ON NE RETIENT << MODIFIE A LA MAIN >> QUE SI CA DIFFERE VRAIMENT du
         role. Sinon le recapitulatif annoncerait une personnalisation a
         quelqu un qui n a fait que regarder la matrice. */
      var base = permsDuRole(A.role);
      var pareil = (p.length === base.length);
      if (pareil) for (var j=0;j<p.length;j++) if (base.indexOf(p[j])<0){ pareil=false; break; }
      A.perms = pareil ? null : p;
    }
  }

  function validerEtape(cle){
    if (cle === 'qui'){
      if (!A.email.trim()) return '${T("Le courriel est obligatoire.")}';
      if (A.email.indexOf('@') < 1) return '${T("Ce courriel ne ressemble pas à une adresse.")}';
    }
    if (cle === 'role' && !A.role) return '${T("Choisissez un rôle.")}';
    return '';
  }
  function aerr(msg){
    var e=document.getElementById('a-err');
    if (e){ e.textContent=msg||''; e.style.display=msg?'block':'none'; }
    if (msg) dire('');
  }

  function creerDepuisAssistant(){
    if (OCCUPE) return;
    var d = {
      firstName: A.first.trim(), lastName: A.last.trim(),
      username: A.username.trim(), email: A.email.trim(),
      password: A.pw, role: A.role,
      active: A.active, requireMfaSetup: A.reqmfa, mfaExempt: A.exempt,
      perms: permsCourantes(),
      securityQ1: A.q1.trim(), securityA1: A.a1.trim(),
      securityQ2: A.q2.trim(), securityA2: A.a2.trim()
    };
    OCCUPE=true; dire('${T("Création du compte…")}');
    appeler('securite:compte:ecrire',['', d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerAssistant();
        var msg = '${T("Compte créé.")}' + (r.courrielEnvoye
          ? '${T(" Courriel d’accueil envoyé à ")}'+(r.courriel||'')+'.'
          : (r.tempPassword ? '${T(" Mot de passe temporaire : ")}'+r.tempPassword+'${T(" (courriel non envoyé).")}' : '${T(" (courriel non envoyé).")}'));
        recharger(msg, 'bon');
      } else aerr(expliquer(r));
    });
  }

  // ── ÉDITEUR DE COMPTE (à onglets) ────────────────────────────────
  /* ⚠ UN SECOND ARGUMENT, AJOUTE LE 2026-09-14 (#110) : le clic droit propose << Gerer ses
     acces >>, qui doit ouvrir l editeur DIRECTEMENT sur les droits — sinon
     l entree ne fait pas ce qu elle annonce, elle ouvre juste une fiche.
     ⚠ ON REPLIE SUR L IDENTITE SI L ONGLET N EXISTE PAS. << Droits >> ne parait
     qu en mode AVANCE (voir la barre d onglets) : demande en mode simple, il
     laisserait un editeur sans onglet actif, donc un corps vide. Un repli vaut
     mieux qu un ecran blanc. */
  function ouvrirEditeurCompte(id, onglet){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Ouverture…")}');
    appeler('securite:form',[id||'']).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ dire('');
        ONGED = (onglet === 'droits' && MODE === 'avance') ? 'droits' : 'identite';
        dessinerEditeurCompte(r); } else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function fermerEditeurCompte(){ szPleinReinit(); var s=document.getElementById('sur-u'); if (s) s.remove(); }

  function dessinerEditeurCompte(F2){
    var nouv = (F2.mode!=='edit');
    var c = F2.compte||{};
    var roles = F2.roles||[];
    var roleOpts=''; for (var i=0;i<roles.length;i++) roleOpts += '<option value="'+esc(roles[i].key)+'"'+((c.role||'admin')===roles[i].key?' selected':'')+'>'+esc(roles[i].icon||'')+' '+esc(roles[i].label)+'</option>';
    var qs = F2.questions||[];
    var qOpts=function(sel){ var o='<option value="">${T("— Choisir —")}</option>'; for (var i=0;i<qs.length;i++) o+='<option value="'+esc(qs[i])+'"'+(sel===qs[i]?' selected':'')+'>'+esc(qs[i])+'</option>'; return o; };
    var ansSet = !!c.securityAnswersSet;
    var roleAct=null; for (var ra=0;ra<roles.length;ra++) if (roles[ra].key===(c.role||'admin')) roleAct=roles[ra];

    var ONG = [
      ['identite', '${T("Identité")}'],
      ['acces', '${T("Accès")}'],
      ['questions', '${T("Questions")}' + (nouv ? '' : (ansSet ? ' ✓' : ''))],
      ['perms', '${T("⚙ Permissions")}']
    ];
    var tabs = '';
    for (var t=0;t<ONG.length;t++) tabs += '<button data-ong="'+ONG[t][0]+'" class="'+(ONGED===ONG[t][0]?'on':'')+'">'+esc(ONG[t][1])+'</button>';

    var volIdentite = '<p class="aideOng">${T("Qui est cette personne. Le <b>nom d’utilisateur</b> lui sert à se connecter ; le courriel reçoit l’invitation et les avis de sécurité.")}</p>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">${T("Prénom")}</span><input class="t" id="u-first" value="'+esc(c.firstName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">${T("Nom")}</span><input class="t" id="u-last" value="'+esc(c.lastName||'')+'"></label>'
      + '<label class="champ"><span class="lbl">${T("Nom d’utilisateur")}</span><input class="t" id="u-username" value="'+esc(c.username||'')+'" placeholder="${T("ex : marie_b")}">'
      + '<span class="sub">${T("Minuscules, chiffres, tiret et soulignement.")}</span></label>'
      + '<label class="champ"><span class="lbl">${T("Courriel")}'+(nouv?' <span class="req">*</span>':'${T(" (non modifiable)")}')+'</span>'
      + '<input class="t" type="email" id="u-email" value="'+esc(c.email||'')+'"'+(nouv?'':' readonly style="opacity:.7"')+'></label>'
      + '</div>';

    var volAcces = '<p class="aideOng">${T("Ce que cette personne peut faire, et comment elle prouve son identité.")}</p>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">${T("Rôle")}</span><select class="t" id="u-role">'+roleOpts+'</select>'
      + '<span class="sub">${T("Le rôle coche les permissions par défaut. L’onglet <b>Permissions</b> permet de s’en écarter.")}</span></label>'
      + '<label class="champ"><span class="lbl">'+(nouv?'${T("Mot de passe")}':'${T("Nouveau mot de passe")}')+'</span>'
      + '<input class="t" type="password" id="u-pw" autocomplete="new-password" placeholder="'+(nouv?'${T("laisser vide = généré et envoyé par courriel")}':'${T("laisser vide = inchangé")}')+'">'
      + '<span class="sub">'+(nouv?'${T("Vide : un mot de passe temporaire est créé et envoyé.")}':'${T("Vide : le mot de passe actuel est conservé.")}')+'</span></label>'
      + '</div>'
      /* ⚠ LA DESCRIPTION DU ROLE EST SOUS LE SELECTEUR, ET ELLE SUIT LE CHOIX.
         Un nom de role ne dit pas ce qu il ouvre — c est toute la lecon du
         decoupage du 2026-09-13. */
      + '<div class="note" id="u-roledesc">'+(roleAct?('<b>'+esc(roleAct.label)+'</b> — '+riche(roleAct.desc||'')):'')+'</div>'
      + '<label class="case"><input type="checkbox" id="u-active" '+(c.active!==false?'checked':'')+'>'
      + '<span>${T("Compte actif")}<span class="quoi">${T("Décoché, la personne ne peut plus se connecter — sans que le compte ni son historique soient supprimés.")}</span></span></label>'
      + '<label class="case"><input type="checkbox" id="u-reqmfa" '+(c.requireMfaSetup&&!c.mfaEnabled?'checked':'')+'>'
      + '<span>${T("Exiger la configuration MFA à la 1<sup>re</sup> connexion")}<span class="quoi">${T("Elle devra lier une application d’authentification avant d’accéder à l’administration.")}</span></span></label>'
      + '<label class="case"><input type="checkbox" id="u-exempt" '+(c.mfaExempt?'checked':'')+'>'
      + '<span>${T("Exempté de MFA")}<span class="quoi">${T("À réserver aux cas où le second facteur est impossible : c’est un rempart en moins.")}</span></span></label>';

    var volQuestions = '<div class="note">${T("<b>Questions de secours</b> — elles servent à rouvrir le compte si le mot de passe est perdu. Facultatives, mais sans elles la seule issue est de recréer le compte.")}</div>'
      + '<div class="cols2">'
      + '<label class="champ"><span class="lbl">${T("Question 1")}</span><select class="t" id="u-q1">'+qOpts(c.securityQ1||'')+'</select></label>'
      + '<label class="champ"><span class="lbl">${T("Réponse 1")}</span><input class="t" id="u-a1" autocomplete="off" placeholder="'+(ansSet?'${T("Inchangée")}':'${T("Réponse")}')+'"></label>'
      + '<label class="champ"><span class="lbl">${T("Question 2")}</span><select class="t" id="u-q2">'+qOpts(c.securityQ2||'')+'</select></label>'
      + '<label class="champ"><span class="lbl">${T("Réponse 2")}</span><input class="t" id="u-a2" autocomplete="off" placeholder="'+(ansSet?'${T("Inchangée")}':'${T("Réponse")}')+'"></label>'
      + '</div>';

    /* ⚠ LE SIGNE EST POSE DANS UN TROU, pas ecrit dans la phrase. Il doit
       passer par la classe ic (sans quoi il reste sombre sur fond sombre), et
       la phrase doit rester ENTIERE pour la traduction — la couper en deux
       fragments donnerait deux morceaux qui ne veulent rien dire seuls. */
    var volPerms = '<p class="aideOng">'
      + '${T("Le <b>?</b> devant un module explique ce que le droit ouvre. Le signe {0} marque ce qui coûte cher si on se trompe.")}'
        .split('{0}').join('<span class="ic">⚠</span>') + '</p>'
      + '<div id="u-perms">'+permMatrice(F2, (c&&c.effectivePerms)||[])+'</div>';

    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-u';
    sur.innerHTML = '<div class="boite large">'
      + '<div class="tt"><h3>'+(nouv?'${T("＋ Créer un accès")}':esc(((c.firstName||'')+' '+(c.lastName||'')).trim()||c.email||'${T("Compte")}'))+'</h3>'
      + '<div><button class="sz-btnplein" id="u-plein" title="${T("Occuper toute la fenêtre")}">${T("⛶ Plein écran")}</button>'
      + '<button class="mini" id="u-x">${T("Fermer")}</button></div></div>'
      + '<div class="ongEd" id="u-ong">'+tabs+'</div>'
      + '<div class="liste">'
      + '<div class="ferr" id="u-err"></div>'
      + '<div class="vol'+(ONGED==='identite'?' on':'')+'" data-vol="identite">'+volIdentite+'</div>'
      + '<div class="vol'+(ONGED==='acces'?' on':'')+'" data-vol="acces">'+volAcces+'</div>'
      + '<div class="vol'+(ONGED==='questions'?' on':'')+'" data-vol="questions">'+volQuestions+'</div>'
      + '<div class="vol'+(ONGED==='perms'?' on':'')+'" data-vol="perms">'+volPerms+'</div>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="u-annuler">${T("Annuler")}</button>'
      + '<button class="prim" id="u-enr">'+(nouv?'${T("Créer le compte")}':'${T("Enregistrer")}')+'</button></div></div>';
    document.body.appendChild(sur);

    document.getElementById('u-x').onclick=fermerEditeurCompte;
    document.getElementById('u-annuler').onclick=fermerEditeurCompte;
    document.getElementById('u-enr').onclick=function(){ enregistrerCompte(nouv?'':(c.id||'')); };
    var bp=document.getElementById('u-plein');
    if (bp) bp.onclick=function(){ szPleinBasculer(sur.querySelector('.boite'), bp); };
    cablerExpl(sur);

    /* ⚠ ON NE REDESSINE PAS L EDITEUR EN CHANGEANT D ONGLET : on montre et on
       cache. Le redessiner perdrait tout ce qui est saisi et non encore
       enregistre — quatre onglets, donc quatre occasions de tout perdre. */
    var bs=sur.querySelectorAll('#u-ong button');
    for (var b2=0;b2<bs.length;b2++) bs[b2].onclick=function(){
      ONGED=this.getAttribute('data-ong');
      var tous=sur.querySelectorAll('#u-ong button');
      for (var i2=0;i2<tous.length;i2++) tous[i2].className = (tous[i2].getAttribute('data-ong')===ONGED)?'on':'';
      var vols=sur.querySelectorAll('[data-vol]');
      for (var j2=0;j2<vols.length;j2++) vols[j2].className = 'vol' + (vols[j2].getAttribute('data-vol')===ONGED?' on':'');
    };

    var un=document.getElementById('u-username'); if (un) un.oninput=function(){ un.value=un.value.toLowerCase().replace(/[^a-z0-9_-]/g,''); };
    var rs=document.getElementById('u-role'); if (rs) rs.onchange=function(){
      var role=rs.value, def=null; for (var i3=0;i3<roles.length;i3++) if (roles[i3].key===role) def=roles[i3];
      var perms=(def&&def.permissions)||[];
      var cbs=document.querySelectorAll('#u-perms [data-perm]');
      for (var j3=0;j3<cbs.length;j3++) cbs[j3].checked = perms.indexOf(cbs[j3].getAttribute('data-perm'))>=0;
      var zd=document.getElementById('u-roledesc');
      if (zd) zd.innerHTML = def ? ('<b>'+esc(def.label)+'</b> — '+riche(def.desc||'')) : '';
      dire('${T("Permissions replacées sur celles du rôle.")}', 'att');
    };
  }

  /* ⚠ L ERREUR RAMENE SUR L ONGLET CONCERNE. Afficher « courriel invalide »
     pendant que l on regarde les permissions laisse chercher le champ fautif. */
  /* ⚠ ET L ENCADRE EFFACE LA LIGNE DU PIED — voir profil.js, meme defaut :
     le meme texte etait ecrit dans l encadre ET dans le pied, donc lu deux
     fois. Ici il paraissait meme TROIS fois : l editeur est une surcouche, et
     szDire y recopie aussi son message. */
  function ferr(msg, ong){
    var e=document.getElementById('u-err');
    if (e){ e.textContent=msg||''; e.style.display=msg?'block':'none'; }
    if (msg) dire('');
    if (!ong) return;
    var b=document.querySelector('#u-ong button[data-ong="'+ong+'"]'); if (b) b.click();
  }

  function enregistrerCompte(id){
    if (OCCUPE) return;
    var perms=[]; var cbs=document.querySelectorAll('#u-perms [data-perm]');
    for (var i=0;i<cbs.length;i++) if (cbs[i].checked) perms.push(cbs[i].getAttribute('data-perm'));
    var d = {
      firstName: txv('u-first').trim(), lastName: txv('u-last').trim(),
      username: txv('u-username').trim(), email: txv('u-email').trim(),
      password: txv('u-pw'), role: txv('u-role'),
      active: chkv('u-active'), requireMfaSetup: chkv('u-reqmfa'), mfaExempt: chkv('u-exempt'),
      perms: perms,
      securityQ1: txv('u-q1').trim(), securityA1: txv('u-a1').trim(),
      securityQ2: txv('u-q2').trim(), securityA2: txv('u-a2').trim()
    };
    if (!d.email) { ferr('${T("Le courriel est obligatoire.")}', 'identite'); return; }
    OCCUPE=true; dire('${T("Enregistrement…")}');
    appeler('securite:compte:ecrire',[id||'', d]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){
        fermerEditeurCompte();
        var msg = (r.mode==='create')
          ? ('${T("Compte créé.")}' + (r.courrielEnvoye ? '${T(" Courriel d’accueil envoyé à ")}'+(r.courriel||'')+'.' : (r.tempPassword ? '${T(" Mot de passe temporaire : ")}'+r.tempPassword+'${T(" (courriel non envoyé).")}' : '${T(" (courriel non envoyé).")}')))
          : '${T("Compte modifié.")}';
        recharger(msg, 'bon');
      } else ferr(expliquer(r), 'identite');
    });
  }
  function supprimerCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Suppression…")}');
    appeler('securite:compte:supprimer',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) recharger('${T("Compte supprimé.")}', 'bon'); else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function inviterCompte(id){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Envoi de l’invitation…")}');
    appeler('securite:compte:invitation',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok) dire('${T("Invitation renvoyée à ")}'+(r.email||'')+'.', 'bon'); else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }

  // ── MFA — activation TOTP / exemption / désactivation ────────────
  function ouvrirMfa(id){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Lecture MFA…")}');
    appeler('securite:mfa:etat',[id]).then(function(r){ OCCUPE=false;
      if (!r||!r.ok){ dire('${T("Échec : ")}'+expliquer(r), 'err'); return; }
      if (r.mfaEnabled){ dire(''); dessinerMfaGerer(id, r); }
      else { OCCUPE=true; dire('${T("Préparation de la liaison…")}');
        appeler('securite:mfa:init',[id]).then(function(r2){ OCCUPE=false;
          if (r2&&r2.ok){ dire(''); dessinerMfaSetup(id, r2); } else dire('${T("Échec : ")}'+expliquer(r2), 'err'); }); }
    });
  }
  function fermerMfa(){ szPleinReinit(); var s=document.getElementById('sur-mfa'); if (s) s.remove(); }
  function dessinerMfaGerer(id, e){
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-mfa';
    sur.innerHTML='<div class="boite" style="max-width:520px"><div class="tt"><h3><span class="ic">🔐</span> MFA — '+esc(e.nom||'')+'</h3><button class="mini" id="m-x">${T("Fermer")}</button></div>'
      + '<div class="liste">'
      + '<div class="note" style="background:rgba(22,163,74,.12);border-color:rgba(22,163,74,.3);color:var(--tx-ok2)"><span class="ic">✅</span> ${T("Authentification à deux facteurs activée pour ce compte.")}</div>'
      + '<label class="case"><input type="checkbox" id="m-exempt" '+(e.mfaExempt?'checked':'')+'> <span><b>${T("Exempter ce compte")}</b><span class="quoi">${T("Connexion autorisée sans code — un rempart en moins.")}</span></span></label>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="m-annuler">${T("Annuler")}</button><button class="b dgr" id="m-off">${T("Désactiver MFA")}</button><button class="prim" id="m-save">${T("Enregistrer")}</button></div></div>';
    document.body.appendChild(sur);
    document.getElementById('m-x').onclick=fermerMfa;
    document.getElementById('m-annuler').onclick=fermerMfa;
    document.getElementById('m-save').onclick=function(){ mfaExempter(id, chkv('m-exempt')); };
    document.getElementById('m-off').onclick=function(){ mfaDesactiver(id); };
  }
  function dessinerMfaSetup(id, s){
    var sur=document.createElement('div'); sur.className='sur'; sur.id='sur-mfa';
    sur.innerHTML='<div class="boite" style="max-width:520px"><div class="tt"><h3><span class="ic">🔐</span> ${T("Activer MFA — ")}'+esc(s.nom||'')+'</h3><button class="mini" id="m-x">${T("Fermer")}</button></div>'
      + '<div class="liste">'
      + '<p class="aideOng">${T("<b>Étape 1</b> — Scannez le QR avec Google Authenticator, Authy ou une application TOTP compatible, ou entrez la clé manuellement.")}</p>'
      + '<div style="text-align:center;background:var(--f-pied);padding:1rem;border-radius:9px;margin:.6rem 0">'
      /* ⚠⚠ LE DESSIN, PLUS L ADRESSE (2026-09-11). Cette image venait de
         api.qrserver.com avec l URI otpauth COMPLETE dans son adresse — donc le
         secret TOTP en clair chez un tiers, a chaque configuration. Il est
         maintenant encode sur le poste (assets/js/qr.js) et arrive tout dessine.
         ⚠ PAS d esc() sur du SVG : esc echapperait les chevrons et afficherait le
         code source au lieu du dessin. Ce SVG n est pas une saisie — il est
         ENGENDRE chez nous a partir d une URI que nous construisons. */
      + '<div id="m-qr" style="width:190px;height:190px;border-radius:8px;background:#fff;overflow:hidden">'
      + (s.qrSvg || '') + '</div></div>'
      + '<div style="text-align:center;background:var(--f-champ);border:1px solid var(--v12);border-radius:9px;padding:.6rem">'
      + '<div class="sub" style="color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;font-size:.72rem">${T("Clé secrète (saisie manuelle)")}</div>'
      + '<code style="font-size:.9rem;letter-spacing:.12em;word-break:break-all;color:var(--tx)">'+esc(s.secretGroupe||s.secret||'')+'</code>'
      + '<div style="font-size:.72rem;color:var(--tx-gris)">${T("Base32 · SHA-1 · 6 chiffres · 30 s")}</div></div>'
      + '<label class="champ" style="margin-top:.9rem"><span class="lbl">${T("Étape 2 — Code à 6 chiffres")}</span>'
      + '<input class="t" id="m-code" inputmode="numeric" maxlength="6" placeholder="000000" style="font-family:monospace;letter-spacing:.3em;text-align:center;font-size:1.2rem"></label>'
      + '<div class="ferr" id="m-err"></div>'
      + '<label class="case"><input type="checkbox" id="m-exempt" '+(s.mfaExempt?'checked':'')+'> <span>${T("Exempter ce compte")}<span class="quoi">${T("Activer sans l’exiger à la connexion.")}</span></span></label>'
      + '</div>'
      + '<div class="tt" style="justify-content:flex-end;gap:.5rem;border-bottom:0;border-top:1px solid var(--v08)">'
      + '<button class="b" id="m-annuler">${T("Annuler")}</button><button class="prim" id="m-activer">${T("✓ Activer MFA")}</button></div></div>';
    document.body.appendChild(sur);
    document.getElementById('m-x').onclick=fermerMfa;
    document.getElementById('m-annuler').onclick=fermerMfa;
    document.getElementById('m-activer').onclick=function(){ mfaConfirmer(id); };
    var cc=document.getElementById('m-code'); if (cc) cc.oninput=function(){ cc.value=cc.value.replace(/[^0-9]/g,''); };
    // Repli du QR câblé en JS : un guillemet imbriqué dans un attribut serait
    // avalé par le littéral de gabarit de cette fenêtre (piège vécu, Lot B2).
    /* ⚠ PLUS RIEN A GUETTER : il n y a plus d image distante, donc plus d echec
       de chargement. Si la case est vide, la cle a recopier reste au-dessus —
       c est elle la voie sure, et elle ne sort pas du poste. */
  }
  function mfaExempter(id, exempt){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Enregistrement…")}');
    appeler('securite:mfa:exempter',[id, exempt]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger(exempt?'${T("Compte exempté de MFA.")}':'${T("Exemption retirée.")}', 'bon'); } else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function mfaDesactiver(id){
    if (OCCUPE) return; OCCUPE=true; dire('${T("Désactivation…")}');
    appeler('securite:mfa:desactiver',[id]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger('${T("MFA désactivé.")}', 'bon'); } else dire('${T("Échec : ")}'+expliquer(r), 'err'); });
  }
  function mfaConfirmer(id){
    if (OCCUPE) return;
    var code=txv('m-code'), exempt=chkv('m-exempt');
    OCCUPE=true; dire('${T("Vérification du code…")}');
    appeler('securite:mfa:confirmer',[id, code, exempt]).then(function(r){ OCCUPE=false;
      if (r&&r.ok){ fermerMfa(); recharger('${T("MFA activé.")}', 'bon'); }
      else { var e=document.getElementById('m-err'); if (e){ e.textContent=expliquer(r); e.style.display='block'; } dire('${T("Échec : ")}'+expliquer(r), 'err'); } });
  }

  function recharger(msg, cl){
    appeler('securite:donnees',[]).then(function(r){
      if (r&&r.ok){ D=r; RO=!r.peutModifier; DELU=''; rendre(); if (msg) dire(msg, cl); }
      else if (msg) dire(msg, cl); });
  }

  function rendre(){
    var av=document.getElementById('ro'); if (av) av.hidden=!RO;
    vueUsers();
  }

  function charger(){
    dire('${T("Chargement…")}');
    appeler('securite:donnees',[]).then(function(r){
      if (!r||!r.ok){ corps.innerHTML='<div class="vide m-'+((r&&r.motif)||'echec')+'">'+expliquer(r)+'</div>'; dire(expliquer(r), 'err'); return; }
      D=r; RO=!r.peutModifier; rendre(); dire('');
      if (UOUV){ var u=UOUV; UOUV=''; if (u==='new') ouvrirAssistant(); else ouvrirEditeurCompte(u); }
      else if (MOUV){ var m=MOUV; MOUV=''; ouvrirMfa(m); }
    });
  }

  charger();
})();
</script></body></html>`;
}

module.exports = { pageSecurite };
