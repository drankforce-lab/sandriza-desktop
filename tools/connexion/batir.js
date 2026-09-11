'use strict';
/* #57 — BÂTIR `src/fenetres/connexion.js`.
   ⚠ Le CSS n'est pas retapé : il est EXTRAIT de staff.js (login.css), pour que
   l'interface native parte identique à celle qu'il veut garder. */
const fs = require('fs');
/* ══ OÙ VIT CE GÉNÉRATEUR, ET POURQUOI IL A DÉMÉNAGÉ ═══════════════════
   ⚠⚠ IL A VÉCU DANS UN DOSSIER TEMPORAIRE DE SESSION, et `connexion.js` (1273
   lignes) est un fichier GÉNÉRÉ. Le jour où ce dossier disparaît, il ne reste
   qu'un fichier qu'on n'ose plus regarder — trop gros pour être retapé, et sans
   la source qui explique sa forme. ⚠ UN FICHIER GÉNÉRÉ DONT LE GÉNÉRATEUR N'EST
   PAS VERSIONNÉ EST UN FICHIER ÉCRIT À LA MAIN QUI S'IGNORE.

   `login.css` est un INSTANTANÉ de `_loginCSS` de `staff.js` (7 539 caractères),
   extrait le 2026-09-10 pour que l'écran natif parte identique à l'écran web
   qu'il remplace. C'est volontairement une COPIE FIGÉE : l'écran web n'existe
   plus, il n'y a donc plus rien à suivre.

   Pour rejouer :  node tools/connexion/batir.js   */
const SCR = __dirname + '/';
const CSS_WEB = fs.readFileSync(SCR + 'login.css', 'utf8');
if (CSS_WEB.indexOf(String.fromCharCode(96)) >= 0) { console.error('REFUS - accent grave dans le CSS extrait'); process.exit(1); }
const AG = String.fromCharCode(96);   // l'accent grave, pour ouvrir/fermer les gabarits

const L = [];
const p = (x) => L.push(x);
/* Insere un fichier de script VERBATIM. ⚠ Il refuse un accent grave : le
   fragment part dans le gabarit, et un accent grave le refermerait — c est le
   piege qui a mordu six fois sur ce projet. */
/* Decoupe en lignes SANS expression reguliere : les echappements d un motif
   ecrit dans un script qui ecrit un script fondent en route (paye ici meme). */
const LIGNES = (t) => String(t).split(String.fromCharCode(10))
  .map((l) => l.replace(new RegExp(String.fromCharCode(13) + '$'), ''));
const FRAGMENT = (chemin) => {
  const t = fs.readFileSync(chemin, 'utf8');
  if (t.indexOf(AG) >= 0) {
    console.error('REFUS - accent grave dans ' + chemin);
    LIGNES(t).forEach((l, i) => {
      if (l.indexOf(AG) >= 0) console.error('   ligne ' + (i + 1) + ' : ' + l.trim().slice(0, 90));
    });
    process.exit(1);
  }
  if (t.indexOf('${') >= 0) { console.error('REFUS - substitution ${ dans ' + chemin); process.exit(1); }
  LIGNES(t).forEach((l) => p(l));
};

p("'use strict';");
p("");
p("/*");
p(" * L'ÉCRAN DE CONNEXION — EN NATIF (#57)");
p(" * =============================================================================");
p(" * Sa demande du 2026-09-10 : « fait la page native de connexion, et je veux que");
p(" * tu gardes le plus possible notre interface actuelle mais en natif ».");
p(" *");
p(" * ⚠⚠ LE CSS N'A PAS ÉTÉ RETAPÉ, IL A ÉTÉ EXTRAIT. Les 7 500 caractères de");
p(" * CSS_WEB sortent tels quels de _loginCSS dans assets/js/staff.js, lus par");
p(" * un script qui a évalué la concaténation. Retaper 71 blocs de règles à la main");
p(" * aurait donné une ressemblance, pas l'écran — et sa demande dit « garder LE PLUS");
p(" * POSSIBLE notre interface actuelle ». Halos violets animés, plaque de logo en");
p(" * verre dépoli qui flotte, filet doré de l'eyebrow, panneau beige #faf8f5,");
p(" * animation d'entrée : tout vient de là, au pixel.");
p(" *");
p(" * ⚠ CE QUI EST AJOUTÉ PAR-DESSUS (et pourquoi, sinon on ne saurait pas quoi");
p(" * remettre le jour où le web change) : un rétablissement html/body pour une");
p(" * fenêtre (le web vit dans une page qui défile, ici la fenêtre EST le cadre), et");
p(" * le casse-tête à glissière, qui dans le web est dessiné par des styles en ligne");
p(" * plutôt que par cette feuille.");
p(" *");
p(" * ⚠⚠ ELLE NE DÉCIDE RIEN — même discipline que inactivite.js, et elle compte");
p(" * double ici. La limitation de débit, le verrou de quinze minutes, le TOTP,");
p(" * l'ouverture de session, le contrôle géographique et le journal restent dans la");
p(" * page, derrière les cœurs Staff.connexion*. Cette fenêtre saisit deux champs,");
p(" * peint un message qu'on lui donne, et rend la main. Une seconde");
p(" * implémentation de l'authentification dans la coquille serait une seconde");
p(" * surface à tenir à jour, et celle qu'on oublierait serait celle qui garde la");
p(" * porte.");
p(" *");
p(" * ⚠ MÊME LE TEXTE DU REFUS VIENT DE LA PAGE. « Il vous reste 2 tentatives avant");
p(" * un verrouillage de 15 minutes » se calcule depuis RateLimit ; le composer ici");
p(" * obligerait cette fenêtre à connaître LOCK_MAX et l'état du verrou. On reçoit le");
p(" * texte ET le ton (rouge / orange / sombre), et on peint.");
p(" *");
p(" * ⚠ SIX ÉCRANS, ET AUCUN NE SE RAFRAÎCHIT SOUS LES DOIGTS : connexion, code à");
p(" * six chiffres, mot de passe oublié. C'est la leçon de la 5.3.0 — un formulaire");
p(" * dans un écran qui se redessine perd la frappe en cours. Seule la BANNIÈRE de");
p(" * maintenance se relit (20 s), et elle est hors du formulaire.");
p(" *");
p(" * ⚠ AUCUN CARACTÈRE " + AG + " (accent grave) dans la portion de script, COMMENTAIRES");
p(" * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré");
p(" * referme la chaîne. Payé cinq fois sur ce projet.");
p(" */");
p("");
p("const { JS_DIRE } = require('./socle.js');");
p("");
/* ⚠⚠ LA VERSION S AFFICHE SUR L ECRAN DE CONNEXION — et ce n est pas un detail
   de confort. Le 2026-09-11 il a envoye une capture en disant << je ne vois pas
   vraiment de changement >>, et il m a fallu comparer une case a cocher au pixel
   pres pour etablir que l ecran photographie ne pouvait venir d AUCUNE des deux
   dernieres versions. Une ligne de six caracteres aurait tranche en une seconde.
   ⚠ C EST L ECRAN OU CETTE QUESTION SE POSE LE PLUS : avant la connexion, aucun
   menu << A propos >> n est atteignable, et c est justement la qu on regarde
   quand quelque chose parait anormal.
   ⚠ Lue depuis package.json, pas ecrite a la main : une version recopiee ment au
   premier oubli de bump — et elle mentirait exactement quand on la consulte. */
p("let SZ_VERSION = '';");
p("try { SZ_VERSION = String(require('../../package.json').version || ''); }");
p("catch (e) { SZ_VERSION = ''; }");
p("");
p("/* Extrait de _loginCSS (assets/js/staff.js) — ne pas modifier à la main : si");
p("   l'écran web change, réextraire. */");
p("const CSS_WEB = " + AG);
p(CSS_WEB);
p(AG + ";");
p("");
p("/* Ce que la FENÊTRE ajoute au décor du web. */");
p("const CSS_FEN = " + AG);
/* ⚠⚠ LES QUATRE JETONS --al-* ONT UN REPLI, ET C EST LE BANC QUI L A EXIGE.
   Ils sont poses en style EN LIGNE sur `.admlogin-root` par le script (comme
   dans le web), donc `banc-jetons` les voyait << employes mais definis nulle
   part >> — il ne lit que le CSS. Sa lecon reste juste : si ce style en ligne
   manquait un jour, chaque var() deviendrait une valeur INVALIDE et le panneau
   de marque passerait transparent, halos et logo compris. Ces valeurs sont
   celles du theme par defaut ; le style en ligne les remplace quand il est la. */
p(":root{--al-bg:linear-gradient(135deg,#191238 0%,#2b2262 50%,#191238 100%);");
p("  --al-logoG:linear-gradient(135deg,#4f46e5,#7c3aed);");
p("  --al-title:#f5e6d0;--al-sub:rgba(236,229,217,0.92)}");
p("*{box-sizing:border-box}");
p("html,body{margin:0;height:100%}");
p("body{overflow:hidden;font:14px/1.5 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif}");
/* ⚠⚠ LE CADRE PLAFONNE A LA FENETRE — SON SIGNALEMENT DU 2026-09-10 :
   << le cadrage est trop serre >>, capture a l appui : le bas du casse-tete ET
   la troisieme ligne du panneau de marque coupes net.
   LA CAUSE, ET ELLE N ETAIT PAS OU JE LA CHERCHAIS. Le CSS extrait du web porte
   `min-height:100vh` sur `.admlogin-root` ET sur `.admlogin-split`. Dans une PAGE
   c est juste : le document grandit, on defile. Dans une FENETRE, `body` est en
   `overflow:hidden` (une fenetre ne defile pas) : le split grandissait au-dela de
   la hauteur visible, poussé par le contenu du formulaire, et tout ce qui
   depassait etait COUPE - des DEUX cotes. Le panneau de marque, centre dans un
   split plus haut que la fenetre, se retrouvait pousse vers le bas et ampute.
   ⚠ `height:100%` seul ne suffisait pas : `min-height` GAGNE contre `height`.
   Il faut le remettre a zero explicitement, sinon la regle du web continue de
   dire << au moins 100vh >>.
   ⚠ ET LE DEFILEMENT VA AU PANNEAU DU FORMULAIRE, PAS A LA FENETRE : c est lui
   qui peut grandir (message d erreur, casse-tete, assistant). Le panneau de
   marque, lui, se contente de ce qu il a. */
/* ⚠⚠ L ANCRE DU SOCLE DOIT AVOIR UNE HAUTEUR — SON DEFAUT DU 2026-09-11, et
   c est MOI qui l ai cree. Le CSS extrait du web portait `min-height:100vh` ;
   je l ai remis a zero en 5.10.0 (<< le cadre plafonne a la fenetre >>) parce
   qu il faisait deborder la vue. Juste — mais je n ai rien mis a la place sur
   `#corps`, qui est un simple <div> sans regle de hauteur.
   ⚠ UN `height:100%` NE RESOUT PAS SI LE PARENT EST EN AUTO : la chaine
   html → body → #corps → .admlogin-root se rompait au troisieme maillon, et la
   racine retombait sur la hauteur de son CONTENU.
   MESURE dans une fenetre de 1400x900 (la sienne) : body 865, **#corps 517**,
   et tout ce qui suit heritait de 517 — d ou la bande noire sur 40 % de la
   hauteur. Une seule ligne manquait.
   ⚠ Et ca ne se voyait pas chez moi : ma fenetre d essai faisait 759 de haut,
   assez proche du contenu naturel pour que la bande soit invisible. Un defaut
   de hauteur ne se voit QUE sur une fenetre plus grande que son contenu. */
p("html,body,#corps{height:100%}");
p(".admlogin-root{height:100%;min-height:0;overflow:hidden}");
p(".admlogin-split{height:100%;min-height:0}");
p(".admlogin-brand{min-height:0}");
p(".admlogin-form-panel{min-height:0;overflow-y:auto}");
/* ⚠ `margin:auto` PLUTOT QUE `justify-content:center`, ET C EST UN PIEGE CONNU :
   un contenu plus haut que son conteneur centre par `justify-content` voit son
   HAUT devenir inatteignable - le defilement ne remonte pas jusqu a lui. Avec
   `margin:auto`, on est centre quand il y a de la place et on defile en entier
   quand il n y en a plus. */
p(".admlogin-form-panel{justify-content:flex-start}");
p(".admlogin-formwrap{margin:auto 0}");
p("/* Le casse-tete a glissiere. Dans le web il est habille de styles en ligne ;");
p("   ici il a ses regles, et elles disent la meme chose. */");
p("#sl-captcha{margin-bottom:1.25rem}");
p("#cap-stage{position:relative;margin:0 auto;border-radius:8px;overflow:hidden;");
p("  border:1px solid rgba(196,154,108,0.35);touch-action:none;user-select:none}");
p("#cap-bg{display:block}");
p("#cap-piece{position:absolute;top:0;left:0;pointer-events:none}");
p("#cap-flash{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 0.25s}");
p("#cap-track{position:relative;height:40px;margin:0.6rem auto 0;");
p("  background:rgba(196,154,108,0.14);border:1px solid rgba(196,154,108,0.3);");
p("  border-radius:8px;overflow:hidden;touch-action:none;user-select:none}");
p("#cap-fill{position:absolute;top:0;left:0;height:100%;width:0;background:rgba(196,154,108,0.28)}");
p("#cap-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;");
p("  font-size:0.74rem;color:#776654;pointer-events:none}");
p("#cap-handle{position:absolute;top:0;left:0;width:44px;height:100%;");
p("  background:linear-gradient(135deg,#1a1207,#3d2810);border-radius:8px;cursor:grab;");
p("  display:flex;align-items:center;justify-content:center;color:#f5e6d0;font-size:1rem;");
p("  box-shadow:0 2px 8px rgba(0,0,0,0.25)}");
p("/* Les champs et les etiquettes : memes valeurs que les styles en ligne du web");
p("   (_inputStyle, _labelStyle, _fpErrStyle, _hTitle, _hSub), rassembles en");
p("   regles parce qu ici on n a pas de raison de les repeter sur chaque balise. */");
p(".cx-lbl{display:block;font-size:0.69rem;font-weight:600;color:#836850;");
p("  margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.08em}");
p(".cx-champ{position:relative}");
p(".cx-champ .cx-ic{position:absolute;left:0.95rem;top:50%;transform:translateY(-50%);");
p("  pointer-events:none;opacity:0.5;display:flex}");
p("input[type=text],input[type=password],input[type=email]{width:100%;box-sizing:border-box;");
p("  padding:0.7rem 1rem;background:rgba(255,255,255,0.82);");
p("  border:1.5px solid rgba(196,154,108,0.35);border-radius:8px;color:#1a1207;");
p("  font:0.9rem/1.5 inherit;outline:none;transition:border-color 0.18s,box-shadow 0.18s}");
p("input.pad{padding-left:2.7rem}");
p("input.padd{padding-right:2.6rem}");
p("input:focus{border-color:#C49A6C;box-shadow:0 0 0 3px rgba(196,154,108,0.18)}");
p(".cx-oeil{position:absolute;right:0.55rem;top:50%;transform:translateY(-50%);");
p("  background:none;border:none;padding:0.2rem;cursor:pointer;display:inline-flex;");
p("  align-items:center;color:#776654;opacity:0.75}");
p(".cx-titre{font-size:1.5rem;font-weight:800;color:#1a1207;font-family:Georgia,serif;");
p("  letter-spacing:0.01em;line-height:1.2}");
p(".cx-sous{font-size:0.8rem;color:#7a6652;line-height:1.5;margin-top:0.35rem}");
p(".cx-err{display:none;background:rgba(254,226,226,0.92);border:1px solid #fca5a5;");
p("  border-radius:8px;padding:0.55rem 0.8rem;font-size:0.8rem;color:#b91c1c;");
p("  margin-bottom:0.75rem;line-height:1.5}");
p(".cx-err.on{display:block}");
p("/* Les trois tons que la page peut demander. L orange previent PENDANT qu on");
p("   peut encore agir ; le sombre annonce un courriel parti, pas un refus. */");
p(".cx-err.orange{background:#fff7ed;border-color:#fdba74;color:#9a3412}");
p(".cx-err.sombre{background:#172033;border-color:#C49A6C;color:#f5e6d0}");
/* ══ LES BOUTONS SONT DES COMMANDES D APPLICATION, PAS DES BOUTONS DE SITE ══
   Sa demande du 2026-09-10 : << tu pourrais me faire des boutons en mode natif
   plus beau comme une application, on dirait que c est toujours du web >>.
   Il a raison, et ce qui trahissait le web etait precis :
     · un DEGRADE en diagonale (135deg) plutot qu un aplat ;
     · un SOULEVEMENT au survol (translateY -1px) ;
     · une OMBRE PORTEE de 28 px, teintee.
   Ces trois-la sont le vocabulaire du bouton d appel a l action d une page de
   vente. Une commande d application est PLATE : un aplat, un lisere un ton plus
   sombre, un reflet interieur de un pixel en haut, et surtout un ETAT ENFONCE
   reel au clic. Rien ne bouge de place ; c est la lumiere qui change.

   ⚠⚠ ET L APLAT CORRIGE AUSSI UNE LISIBILITE. Sur sa capture, son theme rend un
   degrade noir → creme : le texte clair devient presque invisible sur la moitie
   droite du bouton. Un aplat pris sur celle des deux couleurs qui contraste le
   mieux avec le texte garde sa marque ET reste lisible partout. Voir btnStyle.

   ⚠ `:focus-visible` ET NON `:focus` : un lisere de mise au point qui apparait
   au CLIC de souris fait << sale >> et n aide personne ; au clavier il est
   indispensable. Les deux ne se distinguent que par ce suffixe. */
/* ══ UN COUP DE 2026, ET IL FAUT DIRE EN QUOI ÇA DIFFÈRE ══════════════════
   Sa remarque : << on dirait que tu as gardé exactement la forme web dans la
   fenêtre native… j aimerais un petit coup de 2026 dans le design des boutons >>.
   Il a raison, et mon tour précédent n avait fait que DÉSAMORCER le 2015 —
   retirer le dégradé, le soulèvement, l ombre portée. Retirer n est pas dessiner.

   CE QUI DATE UNE COMMANDE, ET CE QUI LA MET À L HEURE :
     2015 : dégradé diagonal · soulèvement au survol · ombre portée noire · un
            rayon timide (4-6 px) · un halo de mise au point diffus.
     2026 : RAYON GÉNÉREUX sur une hauteur généreuse (12 px pour 46 px de haut) ·
            HIÉRARCHIE TONALE — le secondaire est l accent à 10 % d opacité, pas
            un cadre gris · MICRO-MOUVEMENT AU CLIC (une échelle de 0,985, pas un
            déplacement) avec une détente élastique · une LUEUR TEINTÉE DE
            L ACCENT au survol, jamais une ombre noire · un ANNEAU DE MISE AU
            POINT DOUBLE qui se lit sur n importe quel fond · et un ÉTAT
            D ATTENTE intégré, à largeur constante.

   ⚠⚠ LE CLIC RÉDUIT, IL NE DÉPLACE PAS. C est la nuance qui sépare les deux
   époques : `translateY` fait glisser une carte (métaphore de page), `scale`
   fait céder une touche sous le doigt (métaphore d objet). Un seul pour cent et
   demi suffit — au-delà, ça fait jouet.

   ⚠ LA DÉTENTE EST ÉLASTIQUE, PAS LINÉAIRE : `cubic-bezier(.2,.8,.2,1)` part
   vite et s installe doucement. Une transition linéaire, à 2026, se remarque
   comme une transition — donc elle a raté.

   ⚠ ET LA HAUTEUR EST FIXE (`min-height`), pour que le passage à << Connexion… >>
   ne fasse pas SAUTER le formulaire. Un bouton qui change de taille pendant
   qu on attend est la chose la plus datée de toutes. */
p(".cx-btn{width:100%;min-height:46px;padding:0.78rem 1rem;border-radius:12px;");
p("  display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;");
p("  font:600 0.92rem/1.2 inherit;cursor:pointer;letter-spacing:0.01em;");
p("  box-shadow:inset 0 1px 0 rgba(255,255,255,0.16);");
p("  transition:background-color .16s cubic-bezier(.2,.8,.2,1),");
p("    box-shadow .16s cubic-bezier(.2,.8,.2,1),transform .11s cubic-bezier(.2,.8,.2,1)}");
p(".cx-btn:hover:not(:disabled){box-shadow:inset 0 1px 0 rgba(255,255,255,0.16),");
p("  0 4px 16px var(--cx-lueur,rgba(196,154,108,0.30))}");
p(".cx-btn:active:not(:disabled){transform:scale(.985);");
p("  box-shadow:inset 0 2px 6px rgba(0,0,0,0.30)}");
p(".cx-btn:disabled{opacity:0.5;cursor:default;box-shadow:none;transform:none}");
/* ⚠ L ANNEAU DOUBLE : un trait de 2 px détaché de 3 px du bouton. Sur un fond
   clair comme sur un fond sombre, il reste visible — un anneau collé au bord se
   confond avec le liseré du bouton lui-même. */
p(".cx-btn:focus-visible{outline:2px solid #C49A6C;outline-offset:3px}");
/* L ATTENTE : un disque qui tourne, à la place du texte, sans changer la taille
   du bouton. `currentColor` pour qu il suive la couleur du texte quel que soit
   le thème. */
p(".cx-spin{width:16px;height:16px;border-radius:50%;flex:0 0 auto;");
p("  border:2px solid currentColor;border-right-color:transparent;");
p("  animation:cx-tourne .7s linear infinite;opacity:.9}");
p("@keyframes cx-tourne{to{transform:rotate(360deg)}}");
p("@media (prefers-reduced-motion:reduce){.cx-spin{animation-duration:2.4s}");
p("  .cx-btn{transition:none}.cx-btn:active:not(:disabled){transform:none}}");
/* ⚠ ON ANNULE EXPLICITEMENT ce que le CSS extrait du web impose aux boutons de
   soumission (`.admlogin-formwrap button[type=submit]`) : sans ces lignes, le
   soulevement et l ombre reviennent par la porte de derriere et le bouton
   redevient un bouton de site. */
p(".admlogin-formwrap button[type=submit],");
p(".admlogin-formwrap button[type=submit]:hover{transform:none;");
p("  box-shadow:inset 0 1px 0 rgba(255,255,255,0.14);filter:none}");
p(".admlogin-formwrap button[type=submit]:active{transform:none;filter:none;");
p("  box-shadow:inset 0 2px 5px rgba(0,0,0,0.32)}");
p(".cx-souvenir{margin:-0.25rem 0 1rem;display:flex;align-items:center;gap:0.45rem}");
p(".cx-souvenir input{width:15px;height:15px;cursor:pointer;accent-color:#C49A6C;color-scheme:light}");
p(".cx-souvenir label{font-size:0.76rem;color:#7a6652;cursor:pointer;user-select:none}");
/* Les boutons SECONDAIRES (mot de passe oublie, retour). C etaient des
   pastilles arrondies a 99 px qui se soulevent au survol — le meme vocabulaire
   de site. Meme rayon que le bouton principal, un lisere, un aplat neutre :
   ils se lisent comme la commande secondaire d une boite de dialogue. */
/* ══ LE SECONDAIRE EST TONAL, PAS UN CADRE GRIS ═══════════════════════════
   C est la hiérarchie de 2026 : le principal est plein, le secondaire est la
   MÊME couleur d accent à faible opacité, le tertiaire est du texte. Un cadre
   gris autour d un fond beige — ce que j avais fait — est la convention de 2015 :
   elle dit << bouton >> mais ne dit pas << de la même famille que celui du
   dessus >>.
   ⚠ PAS DE LISERÉ DU TOUT : la teinte suffit à détacher le bouton du panneau, et
   un liseré par-dessus une teinte fait deux traits pour une seule frontière.
   ⚠ LE TEXTE RESTE FONCÉ (#5a4527) : sur un fond à 10 % d accent, un texte de la
   couleur d accent tomberait sous le seuil de lisibilité — c est exactement la
   dette de 4,15:1 corrigée en 5.9.0, et elle reviendrait par ce chemin. */
p(".admlogin-forgot,.admlogin-back{border:none;border-radius:10px;");
p("  padding:0.55rem 1rem;background:rgba(196,154,108,0.13);color:#5a4527;");
p("  font:600 0.8rem/1.2 inherit;box-shadow:none;");
p("  transition:background-color .16s cubic-bezier(.2,.8,.2,1),");
p("    transform .11s cubic-bezier(.2,.8,.2,1)}");
p(".admlogin-forgot:hover,.admlogin-back:hover{background:rgba(196,154,108,0.22);");
p("  transform:none;box-shadow:none}");
p(".admlogin-forgot:active,.admlogin-back:active{transform:scale(.97);");
p("  background:rgba(196,154,108,0.30);box-shadow:none}");
p(".admlogin-forgot:focus-visible,.admlogin-back:focus-visible{");
p("  outline:2px solid #C49A6C;outline-offset:3px}");
/* Le champ : un anneau de mise au point d un pixel et demi, pas un halo de
   trois. Un halo diffus est une convention de formulaire web ; une zone de
   saisie d application se cerne. */
/* Le champ prend le rayon de la famille (10 px contre 12 pour le bouton : un
   contenant est toujours un peu moins arrondi que la commande qu il accompagne)
   et un anneau de mise au point de 2 px, net. */
p("input[type=text],input[type=password],input[type=email]{border-radius:10px;");
p("  min-height:46px;border-width:1px;background:#fff}");
p("input:focus{border-color:#C49A6C;box-shadow:0 0 0 2px rgba(196,154,108,0.28)}");
/* ══ LA CASE À COCHER, DESSINÉE ═══════════════════════════════════════════
   `accent-color` repeint la case du SYSTÈME : carrée, rayon nul, et son crochet
   n est pas le nôtre. C est le dernier élément qui criait << formulaire web >>.
   Celle-ci est un carré de 18 px à coins arrondis qui se remplit d accent, avec
   un crochet tracé en CSS.
   ⚠ ON GARDE UN VRAI `input[type=checkbox]` dessous, rendu invisible mais
   FOCALISABLE : remplacer la case par un `<div>` retirerait la barre d espace, la
   tabulation et l annonce aux lecteurs d écran. On habille, on ne remplace pas. */
p(".cx-souvenir input{appearance:none;-webkit-appearance:none;width:18px;height:18px;");
p("  border-radius:5px;border:1.5px solid rgba(131,104,80,0.45);background:#fff;");
p("  cursor:pointer;position:relative;flex:0 0 auto;margin:0;");
p("  transition:background-color .14s cubic-bezier(.2,.8,.2,1),");
p("    border-color .14s cubic-bezier(.2,.8,.2,1)}");
p(".cx-souvenir input:hover{border-color:rgba(196,154,108,0.85)}");
p(".cx-souvenir input:checked{background:#8a6a44;border-color:#8a6a44}");
p(".cx-souvenir input:checked::after{content:'';position:absolute;left:5px;top:1.5px;");
p("  width:5px;height:9px;border:solid #fff;border-width:0 2px 2px 0;");
p("  transform:rotate(42deg)}");
p(".cx-souvenir input:focus-visible{outline:2px solid #C49A6C;outline-offset:3px}");
/* ══ LA BARRE DE MENUS DE L ÉCRAN ════════════════════════════════════════
   ⚠⚠ TROISIÈME TENTATIVE, ET LES DEUX PREMIÈRES ONT ÉCHOUÉ POUR LA MÊME
   RAISON DE FOND : une vue native recouvre TOUT ce que la page dessine.
     · 5.20.0 — la vue descend sous la barre de la page : elle se voit, et ses
       panneaux s ouvrent dessous. Visible, morte.
     · 5.22.0 — on montre la barre native d Electron : elle ne se dessine pas,
       la fenêtre ayant sa barre de titre masquée. Plus de menu du tout.
   ⚠ ICI : l écran dessine LUI-MÊME les intitulés, et la coquille fait sortir le
   sous-menu en menu contextuel — une fenêtre du système, la seule chose qui
   passe au-dessus d une vue native.
   ⚠ ELLE RESSEMBLE À LA BARRE DE L APPLICATION, elle ne la copie pas : ce sont
   les intitulés qui voyagent, pas les entrées. Le contenu du menu ne quitte
   jamais la coquille. */
/* ⚠⚠ ET SES COULEURS VIENNENT DU THÈME, PAS D UN VOILE NOIR SUPPOSÉ. Premier
   jet : fond `rgba(0,0,0,0.22)` et texte crème — j avais supposé un fond sombre.
   Le banc de contraste AU RENDU a mesuré **1,38:1** (#EDE8DF sur #C7C7C7), vingt-
   sept fois : sur un thème clair, ce voile donne un gris pâle et le texte crème
   disparaît. ⚠ Une couleur écrite en dur dans une barre qui flotte au-dessus d un
   dégradé variable est un pari sur le dégradé — et il se perd au premier thème
   clair. Le fond et le texte se CALCULENT (voir `barreTeindre`), et le contraste
   est amené au seuil, comme pour le bouton principal. */
p(".cx-barre{position:fixed;top:0;left:0;right:0;height:32px;display:flex;");
p("  align-items:center;gap:2px;padding:0 6px;z-index:50;");
p("  background:var(--cxb-fond,#2a2118);backdrop-filter:blur(6px);");
p("  border-bottom:1px solid var(--cxb-trait,rgba(255,255,255,0.08))}");
p(".cx-barre button{border:0;background:none;color:var(--cxb-txt,#f3ede3);");
p("  font:500 0.78rem/1 inherit;padding:0.42rem 0.7rem;border-radius:7px;");
p("  cursor:pointer;transition:background-color .13s ease,color .13s ease}");
p(".cx-barre button:hover{background:var(--cxb-surv,rgba(255,255,255,0.12))}");
p(".cx-barre button.on{background:var(--cxb-surv,rgba(255,255,255,0.12))}");
p(".cx-barre button:focus-visible{outline:2px solid rgba(196,154,108,0.85);");
p("  outline-offset:2px}");
/* ⚠ LA BARRE EST `fixed`, DONC HORS FLUX : sans cette réserve en haut du corps,
   elle recouvrirait le panneau de marque. Et elle ne vaut QUE si la barre
   existe — d où la classe sur le corps plutôt qu une marge inconditionnelle. */
p("body.cx-abarre #corps{padding-top:32px;box-sizing:border-box}");
/* ══ LE SÉLECTEUR DE LANGUE ═══════════════════════════════════════════════
   ⚠⚠ SA DEMANDE DU 2026-09-11 : « un switcheur de langue français et anglais
   (EN/FR) dans la page de connexion », la traduction du reste de
   l application venant plus tard. Le réglage est donc rangé dans la COQUILLE,
   pas dans cette fenêtre : le jour où le reste suivra, il n y aura pas un
   second endroit où la langue est décidée.
   ⚠ UN INTERRUPTEUR À DEUX ÉTATS VISIBLES, pas une bascule : on voit du
   premier coup d œil quelle langue est active ET qu une autre existe. Une
   bascule qui afficherait « EN » laisse toujours la question « est-ce la
   langue actuelle, ou celle vers laquelle je vais ? ».
   ⚠ EN HAUT DU PANNEAU DE DROITE, pas dans la barre de menus : cette barre
   n existe que si le modèle est arrivé, et un réglage qui disparaît parfois
   n est pas un réglage. */
p(".cx-langue{display:flex;justify-content:flex-end;gap:0;margin:0 0 1.1rem;");
p("  align-self:stretch}");
p(".cx-langue .grp{display:inline-flex;border-radius:9px;overflow:hidden;");
p("  background:rgba(120,95,66,0.10)}");
p(".cx-langue button{border:0;background:none;color:#6b5842;cursor:pointer;");
p("  font:600 0.72rem/1 inherit;letter-spacing:0.05em;padding:0.4rem 0.72rem;");
p("  transition:background-color .14s ease,color .14s ease}");
p(".cx-langue button:hover{background:rgba(120,95,66,0.10)}");
p(".cx-langue button.on{background:#7d5f3c;color:#f6f1e9}");
p(".cx-langue button:focus-visible{outline:2px solid rgba(196,154,108,0.9);");
p("  outline-offset:-2px}");
p(".cx-centre{text-align:center;margin-top:0.85rem}");
/* ══ LE RECOURS NE S OFFRE QU A CELUI QUI EN A BESOIN ═════════════════════
   ⚠⚠ SA DEMANDE DU 2026-09-11 : << ne l affiche pas si la personne ne s est
   pas trompée de mot de passe ; après la première erreur tu peux l afficher >>.
   Il a raison sur le fond : quelqu un qui connaît son mot de passe ne lit
   jamais ce bouton, et un écran de connexion n a que trois choses à montrer.
   ⚠ UNE CLASSE À LUI, PAS `.cx-centre` : cette classe-là habille AUSSI les deux
   boutons << Retour à la connexion >>, qui doivent rester visibles en tout
   temps. Accrocher la règle au conteneur commun aurait caché trois boutons pour
   en cacher un — et le générateur me l a refusé, deux occurrences sur trois.
   ⚠ ON CACHE PAR OPACITÉ ET HAUTEUR, PAS PAR `display:none` : la transition
   existe alors vraiment, et le bouton se DÉPLIE au lieu de surgir. Juste après
   un message d erreur, un élément qui apparaît d un coup déplace ce que la
   personne est en train de lire.
   ⚠ ET `visibility:hidden` LE RETIRE DU PARCOURS AU CLAVIER ET DE LA LECTURE
   D ÉCRAN sans le retirer du document : le gestionnaire de clic se pose une
   seule fois, à la construction, et n a pas à être reposé au dévoilement. */
p(".cx-recours{transition:opacity .32s cubic-bezier(.2,.8,.2,1),");
p("  max-height .32s cubic-bezier(.2,.8,.2,1),margin-top .32s cubic-bezier(.2,.8,.2,1);");
p("  max-height:120px}");
p(".cx-recours.cx-voile{opacity:0;visibility:hidden;margin-top:0;");
p("  max-height:0;overflow:hidden;pointer-events:none}");
p("@media (prefers-reduced-motion:reduce){.cx-recours{transition:none}}");
p(".cx-chrono{font-size:0.72rem;color:#776654;margin-top:0.5rem}");
p(".cx-chrono strong{color:#b45309}");
p(".cx-chrono strong.presse{color:#dc2626}");
p("#sl-mfa-code{font-size:1.8rem;font-family:monospace;letter-spacing:0.35em;text-align:center}");
p("/* La verite sur << mot de passe oublie >> : une liste de ce qui MARCHE. */");
p(".cx-voies{list-style:none;padding:0;margin:0.9rem 0 0;display:flex;");
p("  flex-direction:column;gap:0.75rem}");
p(".cx-voie{display:flex;gap:0.7rem;align-items:flex-start;padding:0.8rem 0.9rem;");
p("  border-radius:10px;background:rgba(196,154,108,0.08);");
p("  border:1px solid rgba(196,154,108,0.22)}");
p(".cx-voie b{display:block;font-size:0.82rem;color:#6b4a20;margin-bottom:0.15rem}");
p(".cx-voie span{font-size:0.78rem;color:#7a6652;line-height:1.5}");
p(".cx-voie .n{flex:0 0 auto;width:22px;height:22px;border-radius:50%;");
p("  background:#C49A6C;color:#fff;font:700 0.72rem/22px inherit;text-align:center}");
p(".cx-ver{margin-top:1.6rem;font-size:0.72rem;letter-spacing:0.06em;");
p("  color:rgba(243,237,227,0.62)}");
p(".cx-msg{width:100%;max-width:400px;margin:0.9rem auto 0;min-height:1.1rem;text-align:center}");
p(".cx-msg .msg{font-size:0.76rem;color:#7a6652;line-height:1.4}");
p(".cx-msg .msg.err{color:#b91c1c}.cx-msg .msg.bon{color:#166534}.cx-msg .msg.att{color:#9a3412}");
p("/* Les trois ecrans de la SUITE : code a six chiffres, mot de passe impose,");
p("   questions de securite. */");
p(".cx-etape{background:#faf6f0;border:1px solid rgba(196,154,108,0.25);");
p("  border-radius:10px;padding:1rem;margin-bottom:1rem}");
p(".cx-etl{font-size:0.7rem;font-weight:700;text-transform:uppercase;");
p("  letter-spacing:0.08em;color:#836850;margin-bottom:0.5rem}");
p(".cx-etc{font-size:0.8rem;color:#5a4a3a;line-height:1.6}");
p(".cx-qr{text-align:center;margin:0.5rem 0 0.4rem}");
p(".cx-qr img{width:164px;height:164px;border-radius:8px;");
p("  border:2px solid rgba(196,154,108,0.35)}");
p(".cx-cle{background:rgba(196,154,108,0.08);border:1px solid rgba(196,154,108,0.3);");
p("  border-radius:6px;padding:0.6rem;text-align:center}");
p(".cx-cle code{font:0.88rem/1.4 ui-monospace,Consolas,monospace;letter-spacing:0.15em;");
p("  color:#3d2810;word-break:break-all}");
p(".cx-cle .fine{font-size:0.68rem;color:#6b5a48;margin-top:0.25rem;line-height:1.4}");
p(".cx-cle button{margin-top:0.5rem;padding:0.35rem 0.8rem;border-radius:99px;");
p("  border:1px solid rgba(196,154,108,0.45);background:rgba(196,154,108,0.14);");
p("  color:#6b4a20;font:600 0.74rem/1.2 inherit;cursor:pointer}");
p(".cx-exig{list-style:none;padding:0;margin:0.5rem 0 0;display:flex;");
p("  flex-wrap:wrap;gap:0.35rem}");
p(".cx-exig li{font-size:0.7rem;color:#6b5a48;background:rgba(196,154,108,0.1);");
p("  border:1px solid rgba(196,154,108,0.25);border-radius:99px;padding:0.15rem 0.55rem}");
p("select{width:100%;box-sizing:border-box;padding:0.7rem 1rem;");
p("  background:rgba(255,255,255,0.82);border:1.5px solid rgba(196,154,108,0.35);");
p("  border-radius:8px;color:#1a1207;font:0.9rem/1.5 inherit;outline:none;cursor:pointer}");
p("select:focus{border-color:#C49A6C;box-shadow:0 0 0 3px rgba(196,154,108,0.18)}");
p(".cx-bloc{margin-bottom:1rem}");
/* ⚠ Ces trois ecrans sont PLUS HAUTS que la connexion : le panneau du
   formulaire s elargit un peu pour eux, sinon les etapes se serrent en
   colonne de 400 px et l assistant devient illisible. */
p(".admlogin-formwrap.large{max-width:460px}");
p("@media (prefers-reduced-motion:reduce){*{transition:none!important}}");
p(AG + ";");
p("");
/* ⚠⚠ UN ECRAN DE DEPART, ET CE N EST PAS QU UN SIEGE D EPREUVE. Sans lui, les
   cas du banc ne dessinaient QUE la connexion : le harnais charge la page, il ne
   clique pas. Les quatre autres ecrans - code a six chiffres, sa configuration,
   mot de passe impose, questions de securite - etaient donc compiles et JAMAIS
   executes, exactement le trou qui a laisse passer un `dire()` inexistant dans
   la fenetre du mode exclusif.
   ⚠ Et la coquille en a un usage reel : si la fenetre se ferme au milieu d un
   assistant, elle peut la rouvrir SUR CET ECRAN plutot que de renvoyer a la
   connexion - les amorces vivent dans sessionStorage cote page, donc l assistant
   est reprenable.
   ⚠ Un depart inconnu retombe sur la connexion : une valeur fautive ne doit pas
   rendre une fenetre vide. */
p("function pageConnexion(depart) {");
/* ⚠ Le nettoyage se fait DANS LE CONSTRUCTEUR, et sous un autre nom : deux
   `DEPART` au premier niveau du fichier et c est le second qui gagne. Le banc
   des fenetres refuse cette collision, et il a raison — elle est muette. */
p("  var _dep = String(depart || '').replace(/[^a-zA-Z]/g, '');");
p("  return " + AG + "<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\">");
p("<title>Connexion</title>");
p("<style>${CSS_WEB}${CSS_FEN}</style></head><body>");
p("<div id=\"corps\"></div>");
p("<script>");
p("(function(){");
p("  'use strict';");
p("  var P = window.szPont;");
p(JS_DIRE_PLACEHOLDER());
p("");
p("  var CTX = null;          // le contexte de dessin, lu UNE fois");
p("  var ECRAN = 'login';     // login | mfa | oubli");
p("  var CAPTCHA_OK = false;");
p("  /* ⚠ UN ÉTAT DE MODULE, PAS UN ÉTAT DU DOM : dessiner('login') refait");
p("     l écran entier (retour d une étape, échec d un chargement), et tout ce");
p("     qui vivait dans le HTML disparaît avec lui. C est exactement le défaut");
p("     du sélecteur de date de la 5.3.0 — un état posé dans un écran qui se");
p("     redessine n est pas un état. */");
p("  var DEJA_RATE = false;");
p("  var ECRAN_DONNEE = null;");
p("  var LANGUE = 'fr';");
p("");
p("  /* ══ LES DEUX LANGUES DE CET ÉCRAN ═══════════════════════════════════");
p("     ⚠ UN DICTIONNAIRE PLAT, PAS DES PHRASES DÉCOUPÉES. La tentation est de");
p("     traduire morceau par morceau pour réutiliser les bouts ; en anglais");
p("     l ordre des mots change, et on obtient des phrases qui n en sont pas.");
p("     Chaque phrase entière porte sa clé, et les valeurs variables passent");
p("     par {0}.");
p("     ⚠ CE QUI N EST PAS TRADUIT, ET IL FAUT LE DIRE : le sous-titre du");
p("     panneau de marque vient de VOS réglages (c est votre texte, pas le");
p("     nôtre), les intitulés du menu viennent du site, et les refus renvoyés");
p("     par le serveur sont traduits PAR MOTIF quand le motif est connu — le");
p("     texte du serveur reste sinon, en français. Un écran à moitié traduit");
p("     qui le CACHE serait pire qu un écran qui l assume. */");
p("  var DICT = {");
p("    en: {");
p("      \"Connexion sécurisée\": \"Secure sign-in\",");
p("      \"Réservé au personnel autorisé uniquement\": \"Authorized staff only\",");
p("      \"Nom d’utilisateur\": \"Username\",");
p("      \"Se souvenir de mon nom d’utilisateur\": \"Remember my username\",");
p("      \"Mot de passe\": \"Password\",");
p("      \"Afficher le mot de passe\": \"Show password\",");
p("      \"Masquer le mot de passe\": \"Hide password\",");
p("      \"Se connecter\": \"Sign in\",");
p("      \"Connexion…\": \"Signing in…\",");
p("      \"Mot de passe oublié ?\": \"Forgot your password?\",");
p("      \"Connexion chiffrée de bout en bout (HTTPS)\": \"End-to-end encrypted connection (HTTPS)\",");
p("      \"Accès renforcé par mot de passe et authentification MFA\": \"Password and multi-factor authentication\",");
p("      \"Chaque tentative journalisée (adresse IP et pays)\": \"Every attempt logged (IP address and country)\",");
p("      \"Version \": \"Version \",");
p("      \"Vérification en deux étapes\": \"Two-step verification\",");
p("      \"Entrez le code de votre application d’authentification\": \"Enter the code from your authenticator app\",");
p("      \"⏱ Temps restant : \": \"⏱ Time remaining: \",");
p("      \"Code à 6 chiffres\": \"6-digit code\",");
p("      \"Vérifier\": \"Verify\",");
p("      \"Vérification…\": \"Verifying…\",");
p("      \"Mot de passe oublié\": \"Forgot password\",");
p("      \"← Retour à la connexion\": \"← Back to sign-in\",");
p("      \"un super-administrateur\": \"a super-administrator\",");
p("      \"Vérification de sécurité\": \"Security check\",");
p("      \"Faites glisser la pièce pour compléter l’image.\": \"Drag the piece to complete the image.\",");
p("      \"Glissez vers la droite →\": \"Slide to the right →\",");
p("      \"Vérifié\": \"Verified\",");
p("      \"Maintenance en cours\": \"Maintenance in progress\",");
p("      \"Désactivation d’urgence\": \"Emergency override\",");
p("      \"NIP de désactivation\": \"Override PIN\",");
p("      \"Lever la maintenance\": \"Lift maintenance\",");
p("      \"Annuler\": \"Cancel\",");
p("      \"Authentification à deux facteurs\": \"Two-factor authentication\",");
p("      \"Copier la clé\": \"Copy the key\",");
p("      \"Code QR indisponible — utilisez la clé ci-dessus.\": \"QR code unavailable — use the key above.\",");
p("      \"← Annuler\": \"← Cancel\",");
p("      \"Activer et accéder au panneau\": \"Enable and continue\",");
p("      \"Changement de mot de passe requis\": \"Password change required\",");
p("      \"Nouveau mot de passe\": \"New password\",");
p("      \"Confirmer le mot de passe\": \"Confirm password\",");
p("      \"Enregistrer et accéder\": \"Save and continue\",");
p("      \"Enregistrement…\": \"Saving…\",");
p("      \"Questions de sécurité\": \"Security questions\",");
p("      \"Question 1\": \"Question 1\",");
p("      \"Question 2\": \"Question 2\",");
p("      \"Réponse 1\": \"Answer 1\",");
p("      \"Réponse 2\": \"Answer 2\",");
p("      \"— Choisir une question —\": \"— Choose a question —\",");
p("      \"Entrez votre nom d’utilisateur et votre mot de passe.\": \"Enter your username and your password.\",");
p("      \"Entrez le code à six chiffres.\": \"Enter the six-digit code.\",");
p("      \"Entrez le code à six chiffres affiché par votre application.\": \"Enter the six-digit code shown by your app.\",");
p("      \"Remplissez les deux champs.\": \"Fill in both fields.\",");
p("      \"Choisissez les deux questions et écrivez leurs réponses.\": \"Choose both questions and write their answers.\",");
p("      \"Délai de vérification dépassé — veuillez vous reconnecter.\": \"Verification timed out — please sign in again.\",");
p("      \"Décor par défaut — la fenêtre principale n’a pas répondu.\": \"Default appearance — the main window did not answer.\",");
p("      \"La fenetre principale ne repond pas.\": \"The main window is not answering.\",");
p("      \"Clé copiée (sans les espaces).\": \"Key copied (without the spaces).\",");
p("      \"La copie a échoué — recopiez la clé à la main.\": \"Copy failed — type the key by hand.\",");
p("      \"L’opération a échoué.\": \"The operation failed.\",");
p("      \"motif.vide\": \"Username and password are required.\",");
p("      \"motif.captcha\": \"Please complete the security check.\",");
p("      \"motif.verrou\": \"Account locked — try again in a few minutes.\",");
p("      \"motif.refus\": \"Incorrect username or password.\",");
p("      \"motif.forme\": \"Enter the 6-digit code.\",");
p("      \"motif.panne\": \"Verification failed. Please try again.\",");
p("      \"motif.expire\": \"Session expired — please sign in again.\",");
p("      \"motif.echec\": \"The operation could not be completed.\",");
p("      \"motif.inconnu\": \"Unknown screen.\",");
p("      \"motif.discordance\": \"The passwords do not match.\",");
p("      \"motif.memeq\": \"The two questions must be different.\",");
p("      \"motif.memea\": \"The two answers must be different.\",");
p("      \"motif.q1\": \"Please choose question 1.\",");
p("      \"motif.q2\": \"Please choose question 2.\",");
p("      \"motif.a1\": \"Answer 1 must be at least 3 characters long.\",");
p("      \"motif.a2\": \"Answer 2 must be at least 3 characters long.\",");
p("      \"motif.a1nom\": \"Answer 1: cannot contain your name or username.\",");
p("      \"motif.a2nom\": \"Answer 2: cannot contain your name or username.\",");
p("    }");
p("  };");
p("  function T(k, a){");
p("    var d = (LANGUE !== 'fr' && DICT[LANGUE]) ? DICT[LANGUE] : null;");
p("    var v = (d && Object.prototype.hasOwnProperty.call(d, k)) ? d[k] : k;");
p("    return (a === undefined) ? v : String(v).split('{0}').join(String(a));");
p("  }");
p("  /* ⚠ LES REFUS DU SERVEUR SE TRADUISENT PAR LEUR MOTIF, pas par leur");
p("     texte : comparer des phrases françaises pour retrouver leur sens est");
p("     un piège qui casse au premier mot changé côté serveur. Motif inconnu");
p("     = on garde la phrase du serveur, telle quelle. */");
p("  function TM(r){");
p("    var m = r && r.motif ? ('motif.' + r.motif) : '';");
p("    if (LANGUE === 'fr' || !m) return (r && r.message) || '';");
p("    var d = DICT[LANGUE] || {};");
p("    return Object.prototype.hasOwnProperty.call(d, m)");
p("      ? d[m] : ((r && r.message) || '');");
p("  }");
p("  var MAINT = null;        // dernier etat de maintenance connu");
p("  var MAINT_T = null;");
p("  var MFA_T = null, MFA_FIN = 0;");
p("  var CTX_Q = null;        // les questions de securite, pour les listes croisees");
/* ⚠ LA VALEUR EST INTERPOLEE, PAS PARTAGEE. `var DEPART` declaré au-dessus vit
   dans le CONSTRUCTEUR (Node) ; le script de la fenetre tourne dans Chromium et
   n en sait rien. Premier jet : << DEPART is not defined >>, attrape par le
   premier cas du banc. La valeur doit donc traverser par le gabarit. */
p("  var DEPART = '${_dep}';");
p("  var VERSION = '${SZ_VERSION}';");
p("");
p("  function esc(v){");
p("    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;')");
p("      .replace(/>/g,'&gt;').replace(/\"/g,'&quot;');");
p("  }");
p("  function el(id){ return document.getElementById(id); }");
p("");
p("  /* ⚠ UN APPEL QUI N EST PAS UNE PROMESSE N EST PAS UN APPEL. Si la fenetre");
p("     principale ne repond pas, P.appeler peut rendre autre chose ; on le");
p("     transforme en refus nomme plutot que de laisser un .then exploser sans");
p("     que personne ne voie rien. */");
p("  function appeler(op, args){");
p("    var pr;");
p("    try { pr = P.appeler.apply(P, [op].concat(args || [])); }");
p("    catch (e) { pr = null; }");
p("    if (!pr || typeof pr.then !== 'function') {");
p("      return Promise.resolve({ ok: false, motif: 'muet',");
p("        message: T('La fenetre principale ne repond pas.') });");
p("    }");
p("    return pr.then(function(r){ return r || { ok: false, motif: 'vide' }; })");
p("      .catch(function(e){ return { ok: false, motif: 'echec',");
p("        message: String((e && e.message) || e) }; });");
p("  }");
p("");
p("  var IC = {");
p("    personne: '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7a6652\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 21a8 8 0 0 0-16 0\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg>',");
p("    cadenas:  '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7a6652\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>',");
p("    oeil:     '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>',");
p("    oeilBarre:'<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24\"/><path d=\"m2 2 20 20\"/></svg>',");
p("    verrouSm: '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0110 0v4\"/></svg>',");
p("    bouclier: '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z\"/><path d=\"m9 12 2 2 4-4\"/></svg>',");
p("    epingle:  '<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/></svg>'");
p("  };");
p("");
p("  /* ══ LE PANNEAU DE MARQUE — la moitie gauche, identique au web ═══════════");
p("     ⚠ IL NE SE REDESSINE JAMAIS. Les trois halos portent des animations de 17,");
p("     21 et 25 secondes ; les redessiner a chaque changement d ecran les");
p("     RELANCERAIT depuis zero, et le fond sauterait a chaque fois qu on passe au");
p("     code a six chiffres. */");
p("  function marquePanneau(){");
p("    var m = CTX.marque, t = CTX.theme;");
p("    var logo = m.logo");
p("      ? '<div class=\"admlogin-logo-plate\"><img src=\"' + esc(m.logo) + '\" alt=\"' + esc(m.nom)");
p("        + '\" class=\"admlogin-logo-img\" style=\"width:min(340px,70vw);height:auto\"></div>'");
p("      : '<div class=\"admlogin-logo-badge\" style=\"background:linear-gradient(135deg,'");
p("        + t.logoFrom + ',' + t.logoTo + ')\">' + esc(m.lettre) + '</div>';");
p("    var nom = m.logo ? '' : '<h1>' + esc(m.nom) + '</h1>';");
p("    var f = function(ic, txt){");
p("      return '<li class=\"admlogin-feat\"><span class=\"al-ic\">' + ic + '</span><span>' + txt + '</span></li>';");
p("    };");
p("    return '<aside class=\"admlogin-brand\">'");
p("      + '<span class=\"admlogin-orb o1\"></span><span class=\"admlogin-orb o2\"></span>'");
p("      + '<span class=\"admlogin-orb o3\"></span>'");
p("      + '<div class=\"admlogin-brand-inner\">' + logo + nom");
p("      + '<div class=\"admlogin-eyebrow\"><span class=\"al-line\"></span><span>'");
p("      + esc(t.sousTexte) + '</span></div>'");
p("      + '<ul class=\"admlogin-feats\">'");
p("      + f(IC.verrouSm, T('Connexion chiffrée de bout en bout (HTTPS)'))");
p("      + f(IC.bouclier, T('Accès renforcé par mot de passe et authentification MFA'))");
p("      + f(IC.epingle,  T('Chaque tentative journalisée (adresse IP et pays)'))");
p("      + '</ul>'");
/* ⚠ EN PIED DU PANNEAU DE MARQUE, pas dans le formulaire : elle doit etre",
   lisible sans etre dans le chemin de la personne qui se connecte. */
p("      + (VERSION ? ('<div class=\"cx-ver\">' + T('Version ') + esc(VERSION) + '</div>') : '')");
p("      + '</div></aside>';");
p("  }");
p("");
p("  /* ⚠ LES ETATS SE CALCULENT, ils ne sont pas choisis : ecrits en dur, ils");
p("     cesseraient de suivre le theme des la premiere fois qu il change de");
p("     couleur. k positif eclaircit, negatif assombrit. */");
p("  function melanger(hex, k){");
p("    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));");
p("    if (!m) return hex;");
p("    var n = parseInt(m[1], 16);");
p("    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];");
p("    return '#' + c.map(function(x){");
p("      var y = k >= 0 ? x + (255 - x) * k : x * (1 + k);");
p("      y = Math.max(0, Math.min(255, Math.round(y)));");
p("      return (y < 16 ? '0' : '') + y.toString(16);");
p("    }).join('');");
p("  }");
p("  function lumi(hex){");
p("    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));");
p("    if (!m) return 0.5;");
p("    var n = parseInt(m[1], 16);");
p("    return (((n >> 16) & 255) * 0.2126 + ((n >> 8) & 255) * 0.7152");
p("      + (n & 255) * 0.0722) / 255;");
p("  }");
p("  /* ⚠⚠ UN APLAT PRIS SUR CELLE DES DEUX COULEURS DU THEME QUI CONTRASTE LE");
p("     MIEUX avec le texte du bouton — pas la premiere, pas la seconde : celle");
p("     qui rend le texte lisible. Son theme rend noir → creme, et le texte clair");
p("     devenait invisible sur la moitie droite (sa capture du 2026-09-10). C est");
p("     le CONTRASTE qui decide, pas l ordre dans lequel elles arrivent. */");
p("  /* ⚠ LE CONTRASTE SE CALCULE, il ne s estime pas. Trois lignes de plus, et");
p("     plus jamais un bouton dont le texte se devine. */");
p("  function contraste(x, y){");
p("    var f = function(h){");
p("      var m = /^#?([0-9a-f]{6})$/i.exec(String(h || ''));");
p("      if (!m) return 0.5;");
p("      var n = parseInt(m[1], 16);");
p("      var v = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function(c){");
p("        c = c / 255;");
p("        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);");
p("      });");
p("      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];");
p("    };");
p("    var A = f(x), B = f(y);");
p("    return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);");
p("  }");
p("  /* La part de COULEUR d une teinte : 0 pour un gris, un noir ou un blanc. */");
p("  function couleur(hex){");
p("    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));");
p("    if (!m) return 0;");
p("    var n = parseInt(m[1], 16);");
p("    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];");
p("    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);");
p("    return mx === 0 ? 0 : (mx - mn) / mx;");
p("  }");
p("  /* ══ LA COULEUR DU BOUTON — ET POURQUOI CE N EST PLUS << LA PLUS SOMBRE >>");
p("     ⚠⚠ SES MOTS DU 2026-09-11 : << le bouton noir de connexion est affreux >>.");
p("     Il avait raison. Ma regle prenait la plus SOMBRE des deux couleurs du");
p("     theme pour garantir le contraste avec le texte clair ; son degrade va du");
p("     NOIR au creme, donc j obtenais un rectangle noir pur. Un contraste de");
p("     16:1, parfaitement lisible, et parfaitement laid.");
p("     ⚠ LA LECON : une regle qui n optimise qu UN critere (ici la lisibilite)");
p("     produit des resultats corrects et indefendables. Il fallait un second");
p("     critere — que la couleur en SOIT une.");
p("     ⚠ ON PREND DONC LA PLUS COLOREE DES DEUX, pas la plus sombre. Et si le");
p("     theme n en offre aucune (deux tons quasi neutres, comme le noir et le");
p("     creme de son degrade), on retombe sur le BRONZE DE LA MARQUE — celui de");
p("     la case a cocher et des pastilles, deja present partout sur cet ecran.");
p("     Un degrade a deux extremes n a pas de couleur de bouton : ses bouts n ont");
p("     jamais ete choisis pour etre vus en aplat.");
p("     ⚠ PUIS ON AJUSTE JUSQU AU CONTRASTE, par pas de 6 % : on ne choisit pas");
p("     une valeur en esperant qu elle passe, on l amene la ou elle doit etre. */");
p("  function btnFond(){");
p("    var t = CTX.theme;");
p("    var a = t.btnFrom, b = t.btnTo;");
p("    var ca = couleur(a), cb = couleur(b);");
p("    var fond = (ca >= cb) ? a : b;");
p("    if (Math.max(ca, cb) < 0.30) fond = '#7d5f3c';   // le bronze de la marque");
p("    var clair = lumi(t.btnTexte) > 0.5;");
p("    var n = 0;");
p("    while (contraste(t.btnTexte, fond) < 4.6 && n < 24) {");
p("      fond = melanger(fond, clair ? -0.06 : 0.06);");
p("      n++;");
p("    }");
p("    return fond;");
p("  }");
p("  function btnStyle(){");
p("    var t = CTX.theme;");
p("    var fond = btnFond();");
p("    var clair = lumi(t.btnTexte) > 0.5;");
p("    /* ⚠ LA LUEUR DU SURVOL EST CELLE DU BOUTON, à faible opacité — pas un");
p("       gris, pas un noir. Une ombre noire sous un bouton coloré est la");
p("       signature de 2015 ; une lueur de sa PROPRE couleur donne l impression");
p("       qu il éclaire ce qu il touche, et c est ce qui date 2026.");
p("       ⚠ Elle passe par une variable CSS parce que la règle :hover ne peut");
p("          pas connaître le thème : on la pose sur l élément, la feuille s en");
p("          sert. --cx-lueur a un repli dans le CSS, donc un bouton sans style");
p("          en ligne reste correct. */");
p("    var rv = parseInt(fond.slice(1, 3), 16), gv = parseInt(fond.slice(3, 5), 16);");
p("    var bv = parseInt(fond.slice(5, 7), 16);");
p("    var lueur = isNaN(rv) ? 'rgba(196,154,108,0.30)'");
p("      : ('rgba(' + rv + ',' + gv + ',' + bv + ',0.34)');");
p("    return 'background-color:' + fond");
p("      + ';border:1px solid ' + melanger(fond, clair ? 0.12 : -0.14)");
p("      + ';--cx-lueur:' + lueur");
p("      + ';color:' + t.btnTexte;");
p("  }");
p("  /* Le survol eclaircit un fond sombre et assombrit un fond clair. En JS et");
p("     non en CSS parce que la couleur vient du theme : une regle :hover ne");
p("     saurait pas quelle valeur viser sans la recopier. */");
p("  function btnSurvol(z){");
p("    if (!z) return;");
p("    var fond = btnFond();");
p("    var clair = lumi(CTX.theme.btnTexte) > 0.5;");
p("    var haut = melanger(fond, clair ? 0.10 : -0.08);");
p("    z.addEventListener('mouseenter', function(){");
p("      if (!z.disabled) z.style.backgroundColor = haut;");
p("    });");
p("    z.addEventListener('mouseleave', function(){ z.style.backgroundColor = fond; });");
p("  }");
p("");
p("  /* ══ L ECRAN DE CONNEXION ════════════════════════════════════════════════ */");
p("  function ecranLogin(){");
p("    return '<div>'");
p("      + '<div style=\"margin-bottom:1.75rem\">'");
p("      + '<div class=\"cx-titre\">' + T('Connexion sécurisée') + '</div>'");
p("      + '<div class=\"cx-sous\">' + T('Réservé au personnel autorisé uniquement') + '</div>'");
p("      + '</div>'");
p("      + '<form id=\"cx-form\" novalidate>'");
p("      + '<div style=\"margin-bottom:1rem\">'");
p("      + '<label class=\"cx-lbl\" for=\"sl-email\">' + T('Nom d’utilisateur') + '</label>'");
p("      + '<div class=\"cx-champ\"><span class=\"cx-ic\">' + IC.personne + '</span>'");
p("      + '<input type=\"text\" id=\"sl-email\" class=\"pad\" autocomplete=\"username\" value=\"'");
p("      + esc(CTX.prefill) + '\"></div>'");
p("      + '</div>'");
p("      + '<div class=\"cx-souvenir\">'");
p("      + '<input type=\"checkbox\" id=\"sl-remember\"' + (CTX.souvenir ? ' checked' : '') + '>'");
p("      + '<label for=\"sl-remember\">' + T('Se souvenir de mon nom d’utilisateur') + '</label>'");
p("      + '</div>'");
p("      + '<div style=\"margin-bottom:1.25rem\">'");
p("      + '<label class=\"cx-lbl\" for=\"sl-password\">' + T('Mot de passe') + '</label>'");
p("      + '<div class=\"cx-champ\"><span class=\"cx-ic\">' + IC.cadenas + '</span>'");
p("      + '<input type=\"password\" id=\"sl-password\" class=\"pad padd\" autocomplete=\"current-password\">'");
p("      + '<button type=\"button\" class=\"cx-oeil\" id=\"sl-oeil\" aria-label=\"' + T('Afficher le mot de passe') + '\">'");
p("      + IC.oeil + '</button></div>'");
p("      + '</div>'");
p("      + '<div class=\"cx-err\" id=\"sl-error\"></div>'");
p("      + '<div id=\"cap-zone\"></div>'");
p("      + '<button type=\"submit\" class=\"cx-btn\" id=\"sl-btn\" style=\"' + btnStyle() + '\">' + T('Se connecter') + '</button>'");
p("      + '</form>'");
p("      + '<div class=\"cx-centre cx-recours' + (DEJA_RATE ? '' : ' cx-voile') + '\">'");
p("      + '<button type=\"button\" class=\"admlogin-forgot\" id=\"sl-oubli\">' + T('Mot de passe oublié ?') + '</button>'");
p("      + '</div></div>';");
p("  }");
p("");
p("  /* ══ LE CODE A SIX CHIFFRES ══════════════════════════════════════════════ */");
p("  function ecranMfa(sec){");
p("    return '<div>'");
p("      + '<div style=\"margin-bottom:1.75rem\">'");
p("      + '<div class=\"cx-titre\">' + T('Vérification en deux étapes') + '</div>'");
p("      + '<div class=\"cx-sous\">' + T('Entrez le code de votre application d’authentification') + '</div>'");
p("      + '<div class=\"cx-chrono\">' + T('⏱ Temps restant : ') + '<strong id=\"sl-mfa-timer\">' + sec + ' s</strong></div>'");
p("      + '</div>'");
p("      + '<form id=\"cx-form-mfa\" novalidate>'");
p("      + '<div style=\"margin-bottom:1.25rem\">'");
p("      + '<label class=\"cx-lbl\" for=\"sl-mfa-code\">' + T('Code à 6 chiffres') + '</label>'");
p("      + '<input type=\"text\" id=\"sl-mfa-code\" inputmode=\"numeric\" maxlength=\"6\"'");
p("      + ' autocomplete=\"one-time-code\" placeholder=\"000000\">'");
p("      + '</div>'");
p("      + '<div class=\"cx-err\" id=\"sl-mfa-error\"></div>'");
p("      + '<button type=\"submit\" class=\"cx-btn\" id=\"sl-mfa-btn\" style=\"' + btnStyle() + '\">' + T('Vérifier') + '</button>'");
p("      + '</form>'");
/* ══ PAS DE << RETOUR À LA CONNEXION >> ICI ═══════════════════════════════
   ⚠⚠ SA DEMANDE DU 2026-09-11 : << dans le mfa on va retirer ce bouton inutile >>.
   Il a raison, et pour une raison précise : à cet instant, le mot de passe est
   DÉJÀ accepté et le jeton en attente vit côté serveur. Le seul geste utile est
   de taper les six chiffres. << Retour >> ne ramenait pas en arrière — il
   ABANDONNAIT la vérification, ce que le décompte fait déjà tout seul.
   ⚠ UN BOUTON QUI RÉPÈTE CE QUE LE TEMPS FAIT DÉJÀ N EST PAS UNE SORTIE, c est
   une troisième chose à lire sur un écran qui n en demande qu une.
   ⚠ CE QU ON PERD, ET C EST ASSUMÉ : qui se rend compte de s être trompé de
   compte doit attendre la fin du décompte (une minute, affichée). Le chemin
   existe toujours — `mfaExpire` est appelée par le chrono — il n est plus
   déclenchable à la main. */
p("      + '</div>';");
p("  }");
p("");
p("  /* ══ MOT DE PASSE OUBLIE — CE QUI MARCHE VRAIMENT ════════════════════════");
p("     ⚠⚠ CE N EST PAS LE PARCOURS WEB, ET C EST DELIBERE. Le web pose deux");
p("     questions de securite puis un nouveau mot de passe. Ce parcours NE");
p("     FONCTIONNE PAS : il tourne sur l ecran de connexion, donc sans session ; les");
p("     reponses sont hachees cote serveur, et toute ecriture de staff_users exige");
p("     une session. Les commentaires de submitForgotStep2 et submitForgotStep3");
p("     le disent depuis des semaines - l etape 2 refuse tout le monde, et l etape 3");
p("     n ecrivait que dans le cache du poste en annoncant << Mot de passe");
p("     reinitialise >>. Porter trois ecrans pour arriver a un mur aurait ete porter");
p("     le mur. On rend ce qui marche, en un ecran. */");
p("  function ecranOubli(d){");
p("    var contact = (d && d.contact)");
p("      ? ('<a href=\"mailto:' + esc(d.contact) + '\" style=\"color:#8a6a44\">' + esc(d.contact) + '</a>')");
p("      : T('un super-administrateur');");
p("    return '<div>'");
p("      + '<div style=\"margin-bottom:1.2rem\">'");
p("      + '<div class=\"cx-titre\">' + T('Mot de passe oublié') + '</div>'");
p("      + '<div class=\"cx-sous\">Deux chemins fonctionnent, et les voici. La récupération '");
p("      + 'par questions de sécurité n’est pas disponible : les réponses sont chiffrées '");
p("      + 'côté serveur et cet écran n’a pas de session pour les vérifier.</div>'");
p("      + '</div>'");
p("      + '<ul class=\"cx-voies\">'");
p("      + '<li class=\"cx-voie\"><span class=\"n\">1</span><div>'");
p("      + '<b>Le lien de renouvellement</b>'");
p("      + '<span>Si votre mot de passe a expiré, un courriel part automatiquement à '");
p("      + 'votre adresse à la prochaine tentative. Le lien vaut 24 heures.</span>'");
p("      + '</div></li>'");
p("      + '<li class=\"cx-voie\"><span class=\"n\">2</span><div>'");
p("      + '<b>Un accès réémis</b>'");
p("      + '<span>Demandez à ' + contact + ' de vous réémettre un mot de passe '");
p("      + 'temporaire depuis la fiche du personnel. Il vous sera demandé de le '");
p("      + 'changer à la première connexion.</span>'");
p("      + '</div></li>'");
p("      + '</ul>'");
p("      + '<div class=\"cx-centre\" style=\"margin-top:1.4rem\">'");
p("      + '<button type=\"button\" class=\"admlogin-back\" id=\"sl-oubli-retour\">' + T('← Retour à la connexion') + '</button>'");
p("      + '</div></div>';");
p("  }");
p("");
/* ⚠ LES TROIS ECRANS DE LA SUITE VIENNENT D UN FRAGMENT, LU VERBATIM. Ecrits
   en `p("...")` ils auraient traverse QUATRE niveaux d echappement (python →
   chaine JS du generateur → chaine JS de la fenetre → HTML), et le premier jet
   est mort dessus. Le fragment est du script de fenetre TEL QUEL : un seul
   niveau, celui du gabarit. */
FRAGMENT(SCR + "ecrans-suite.txt");
p("  /* ══ LE DESSIN ═══════════════════════════════════════════════════════════");
p("     ⚠ SEUL LE PANNEAU DE DROITE CHANGE. La racine et le panneau de marque sont");
p("     ecrits UNE fois (voir marquePanneau) ; ensuite on ne remplace que");
p("     #cx-corps. C est ce qui garde les halos en mouvement continu et evite");
p("     qu un changement d ecran fasse clignoter la moitie de la fenetre. */");
p("  function socle(){");
p("    var t = CTX.theme;");
p("    var bg = 'linear-gradient(135deg,' + t.bgFrom + ' 0%,' + t.bgMid + ' 50%,' + t.bgFrom + ' 100%)';");
p("    var lg = 'linear-gradient(135deg,' + t.logoFrom + ',' + t.logoTo + ')';");
p("    el('corps').innerHTML =");
p("      '<div class=\"admlogin-root\" style=\"--al-bg:' + bg + ';--al-logoG:' + lg");
p("      + ';--al-title:' + t.titre + ';--al-sub:' + t.sous + '\">'");
p("      + '<div class=\"admlogin-split\">' + marquePanneau()");
p("      + '<main class=\"admlogin-form-panel\">'");
p("      + '<div class=\"cx-langue\"><div class=\"grp\">'");
p("      + '<button type=\"button\" id=\"lg-fr\" class=\"' + (LANGUE === 'fr' ? 'on' : '')");
p("      + '\" aria-pressed=\"' + (LANGUE === 'fr') + '\">FR</button>'");
p("      + '<button type=\"button\" id=\"lg-en\" class=\"' + (LANGUE === 'en' ? 'on' : '')");
p("      + '\" aria-pressed=\"' + (LANGUE === 'en') + '\">EN</button>'");
p("      + '</div></div>'");
p("      + '<div id=\"al-maint\"></div><div id=\"al-nipbox\"></div>'");
p("      + '<div class=\"admlogin-formwrap\" id=\"cx-corps\"></div>'");
/* ⚠⚠ LA LIGNE DE MESSAGE, ET LE BANC L A EXIGEE AVANT MOI. `szDire` du socle
   ecrit dans `#msg` ; sans cet element, TOUS les szDire de cette fenetre
   auraient ecrit dans le vide - << Bienvenue >>, << Maintenance levee >>,
   << Decor par defaut >>. Aucune erreur, aucune trace : une fenetre muette.
   C est `verifier-fenetres` qui l a dit, en refusant les ancres manquantes. */
p("      + '<div class=\"cx-msg\"><span class=\"msg\" id=\"msg\"></span></div>'");

p("      + '</main></div></div>';");
p("  }");
p("");
p("  function dessiner(quoi, donnee){");
p("    ECRAN = quoi;");
p("    /* ⚠ ON RETIENT LA DONNÉE : changer de langue redessine l écran COURANT,");
p("       et sans elle l assistant repartirait vide — questions de sécurité sans");
p("       questions, clé TOTP sans clé. */");
p("    ECRAN_DONNEE = donnee;");
p("    var z = el('cx-corps');");
p("    if (!z) { socle(); z = el('cx-corps'); }");
p("    /* ⚠ LA LARGEUR SUIT L ECRAN : les trois assistants sont plus hauts et");
p("       plus denses que la connexion. */");
p("    var large = (quoi === 'mfaConfig' || quoi === 'questions');");
p("    z.className = 'admlogin-formwrap' + (large ? ' large' : '');");
p("    if (quoi === 'mfa')            z.innerHTML = ecranMfa(donnee || 60);");
p("    else if (quoi === 'oubli')     z.innerHTML = ecranOubli(donnee);");
p("    else if (quoi === 'mfaConfig') z.innerHTML = ecranMfaConfig(donnee || {});");
p("    else if (quoi === 'mdp')       z.innerHTML = ecranMdp(donnee || {});");
p("    else if (quoi === 'questions') z.innerHTML = ecranQuestions(donnee || {});");
p("    else                           z.innerHTML = ecranLogin();");
p("    brancher();");
p("  }");
p("");
p("  /* ══ LE CASSE-TETE A GLISSIERE ═══════════════════════════════════════════");
p("     ⚠ IL NE GARDE PAS LA PORTE, ET IL FAUT LE SAVOIR POUR NE PAS SUR-INVESTIR.");
p("     Ce qui garde la porte, c est le verrou de quinze minutes apres cinq echecs,");
p("     cote RateLimit, dans la page. Le casse-tete ralentit un bourrage a la");
p("     main. Dans le web il tient dans une variable de module de la page ; ici dans");
p("     une variable de la fenetre - aussi peu verifiable dans les deux cas, donc le");
p("     deplacer ne retire aucune garantie parce qu il n en apportait aucune. */");
p("  function captchaPoser(){");
p("    var z = el('cap-zone');");
p("    if (!z) return;");
p("    CAPTCHA_OK = false;");
p("    z.innerHTML = '<div id=\"sl-captcha\">'");
p("      + '<label class=\"cx-lbl\">' + T('Vérification de sécurité') + '</label>'");
p("      + '<div style=\"font-size:0.72rem;color:#7a6652;margin:-0.1rem 0 0.5rem\">'");
p("      + T('Faites glisser la pièce pour compléter l’image.') + '</div>'");
p("      + '<div id=\"cap-stage\"><canvas id=\"cap-bg\"></canvas>'");
p("      + '<canvas id=\"cap-piece\"></canvas><div id=\"cap-flash\"></div></div>'");
p("      + '<div id=\"cap-track\"><div id=\"cap-fill\"></div>'");
p("      + '<div id=\"cap-hint\">' + T('Glissez vers la droite →') + '</div>'");
p("      + '<div id=\"cap-handle\">⇢</div></div></div>';");
p("    captchaArmer();");
p("  }");
p("");
p("  function captchaRetirer(){");
p("    var z = el('cap-zone');");
p("    if (z) z.innerHTML = '';");
p("    CAPTCHA_OK = false;");
p("  }");
p("");
p("  function captchaArmer(){");
p("    var stage = el('cap-stage'), bg = el('cap-bg'), pc = el('cap-piece');");
p("    var track = el('cap-track'), handle = el('cap-handle');");
p("    var fill = el('cap-fill'), hint = el('cap-hint'), flash = el('cap-flash');");
p("    if (!stage || !bg || !pc || !track || !handle) return;");
p("    var W = Math.max(240, Math.min(360, stage.clientWidth || 320));");
/* ⚠ 96 px et non 120 : vingt-quatre pixels que le formulaire n a plus a trouver,
   pour un casse-tete qui reste large et lisible. La piece garde sa taille (42) -
   la rapetisser aurait rendu la cible difficile a la souris. */
p("    var H = 96, T = 42;                        // taille de la piece");
p("    bg.width = W; bg.height = H; pc.width = W; pc.height = H;");
p("    stage.style.height = H + 'px';");
p("    /* La cible reste loin des deux bords : collee au bord, la piece serait");
p("       trouvee sans chercher, et hors du cadre elle serait introuvable. */");
p("    var cx = Math.round(W * 0.45 + Math.random() * W * 0.3);");
p("    var cy = Math.round((H - T) / 2);");
/* ⚠⚠ SI LA TOILE MANQUE, ON RETIRE LE CASSE-TETE — ON NE CASSE PAS LA PORTE.
   `captchaArmer` est appelee depuis `captchaPoser`, elle-meme appelee dans le
   `.then` d une tentative refusee. Une exception ici laisserait le bouton
   << Connexion... >> DESACTIVE pour toujours : on ne pourrait plus entrer, et
   le seul symptome serait un bouton gris. Le casse-tete ne garde pas la porte
   (c est le verrou de quinze minutes qui la garde) : le perdre coute un
   ralentisseur, pas une protection. */
p("    var c = null, q = null;");
p("    try { c = bg.getContext('2d'); q = pc.getContext('2d'); } catch (e) {}");
p("    if (!c || !q) {");
p("      var zc = el('cap-zone');");
p("      if (zc) zc.innerHTML = '';");
p("      CAPTCHA_OK = true;          // sinon la tentative serait refusee sans recours");
p("      szDire('Vérification visuelle indisponible sur ce poste — le verrou de sécurité reste actif.', 'att');");
p("      return;");
p("    }");
p("    /* Un fond DESSINE, pas une image telechargee : une fenetre native ne doit");
p("       rien aller chercher sur le reseau pour afficher sa propre porte. */");
p("    var g = c.createLinearGradient(0, 0, W, H);");
p("    g.addColorStop(0, '#2b2262'); g.addColorStop(0.5, '#4f46e5'); g.addColorStop(1, '#191238');");
p("    c.fillStyle = g; c.fillRect(0, 0, W, H);");
p("    for (var i = 0; i < 26; i++) {");
p("      c.beginPath();");
p("      c.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 26, 0, 6.284);");
p("      c.fillStyle = 'rgba(255,255,255,' + (0.02 + Math.random() * 0.07) + ')';");
p("      c.fill();");
p("    }");
p("    var img = c.getImageData(cx, cy, T, T);");
p("    q.putImageData(img, 0, cy);                 // la piece part a gauche");
p("    q.strokeStyle = 'rgba(255,255,255,0.8)'; q.lineWidth = 2;");
p("    q.strokeRect(1, cy + 1, T - 2, T - 2);");
p("    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(cx, cy, T, T);");
p("    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;");
p("    c.strokeRect(cx + 1, cy + 1, T - 2, T - 2);");
p("");
p("    var max = track.clientWidth - handle.offsetWidth;");
p("    var pris = false, x0 = 0, dx = 0;");
p("    var poser = function(v){");
p("      dx = Math.max(0, Math.min(max, v));");
p("      handle.style.left = dx + 'px';");
p("      fill.style.width = (dx + handle.offsetWidth) + 'px';");
p("      q.clearRect(0, 0, W, H);");
p("      var px = Math.round(dx / Math.max(1, max) * (W - T));");
p("      q.putImageData(img, px, cy);");
p("      q.strokeStyle = 'rgba(255,255,255,0.8)'; q.lineWidth = 2;");
p("      q.strokeRect(px + 1, cy + 1, T - 2, T - 2);");
p("    };");
p("    var relacher = function(){");
p("      if (!pris) return;");
p("      pris = false; handle.style.cursor = 'grab';");
p("      var px = Math.round(dx / Math.max(1, max) * (W - T));");
p("      /* Six pixels de tolerance : au pixel pres, la souris ne suffirait pas et");
p("         un ecran tactile serait impossible. */");
p("      if (Math.abs(px - cx) <= 6) {");
p("        CAPTCHA_OK = true;");
p("        if (hint) hint.textContent = T('Vérifié');");
p("        if (flash) { flash.style.background = 'rgba(74,222,128,0.28)'; flash.style.opacity = '1'; }");
p("        handle.textContent = 'OK';");
p("        handle.style.pointerEvents = 'none';");
p("        var mp = el('sl-password'); if (mp) mp.focus();");
p("      } else {");
p("        CAPTCHA_OK = false;");
p("        if (flash) { flash.style.background = 'rgba(248,113,113,0.3)'; flash.style.opacity = '1'; }");
p("        setTimeout(function(){");
p("          if (flash) flash.style.opacity = '0';");
p("          poser(0);");
p("          if (hint) hint.textContent = T('Glissez vers la droite →');");
p("        }, 350);");
p("      }");
p("    };");
p("    handle.addEventListener('pointerdown', function(e){");
p("      pris = true; x0 = e.clientX - dx; handle.style.cursor = 'grabbing';");
p("      try { handle.setPointerCapture(e.pointerId); } catch (er) {}");
p("    });");
p("    handle.addEventListener('pointermove', function(e){ if (pris) poser(e.clientX - x0); });");
p("    handle.addEventListener('pointerup', relacher);");
p("    handle.addEventListener('pointercancel', relacher);");
p("    poser(0);");
p("  }");
p("");
p("  /* ══ LES MESSAGES D ERREUR — LE TEXTE ET LE TON VIENNENT DE LA PAGE ══════ */");
p("  function faute(id, r){");
p("    var z = el(id);");
p("    if (!z) return;");
p("    z.className = 'cx-err on' + (r && r.ton === 'orange' ? ' orange' : (r && r.ton === 'sombre' ? ' sombre' : ''));");
p("    var txt = esc(TM(r) || T('L’opération a échoué.'));");
p("    if (r && typeof r.restant === 'number' && r.restant > 0) {");
p("      txt += '<br><span style=\"font-size:0.78rem\">Attention — il vous reste <strong>' + r.restant");
p("        + '</strong> tentative' + (r.restant > 1 ? 's' : '')");
p("        + ' avant un verrouillage de 15 minutes.</span>';");
p("    }");
p("    z.innerHTML = txt;");
p("  }");
p("  /* ⚠ ON NE TOUCHE À RIEN SI C EST DÉJÀ FAIT : la fonction est appelée à");
p("     chaque échec, et réécrire la classe à chaque fois relancerait la");
p("     transition — le bouton clignoterait à la troisième tentative. */");
p("  function devoilerOubli(){");
p("    if (DEJA_RATE) return;");
p("    DEJA_RATE = true;");
p("    var z = document.querySelector('.cx-recours.cx-voile');");
p("    if (z) z.className = 'cx-centre cx-recours';");
p("  }");
p("  /* ══ CE QUI REMPLACE LA BULLE DU NAVIGATEUR ═════════════════════════");
p("     ⚠⚠ SA DEMANDE DU 2026-09-11 : << retire le texte de survol au-dessus du");
p("     champ de mot de passe, ça ne sert à rien >>. C était la bulle native de");
p("     Chromium, celle que << required >> fait apparaître à la soumission. Il a");
p("     raison : dans une fenêtre qui cherche à ne plus avoir l air d une page");
p("     web, une info-bulle grise du moteur est exactement ce qui trahit — elle");
p("     ne suit ni le thème, ni la police, ni la langue de l application.");
p("     ⚠ MAIS ON NE RETIRE PAS LA VÉRIFICATION, ON LA RAPATRIE. Sans elle, un");
p("     formulaire vide partirait au réseau pour revenir avec un refus — un");
p("     aller-retour, une attente, et un message venu d ailleurs. Ici : premier");
p("     champ vide, on le met au foyer et on écrit dans la MÊME zone que tous");
p("     les autres refus de cet écran. Une seule voix.");
p("     ⚠ ET LE BOUTON RESTE CLIQUABLE. Le griser tant que les champs sont vides");
p("     serait plus net — et le jour où cette règle a un trou, plus personne ne");
p("     peut se connecter. Sur l écran qui OUVRE l application, on ne pose pas un");
p("     verrou dont la panne se solde par une porte fermée.");
p("     ⚠ << novalidate >> EN PLUS de retirer << required >> : les deux disent la même");
p("     chose, et c est voulu. Un champ auquel on rendrait << required >> demain");
p("     ferait revenir la bulle sans que personne ne comprenne d où elle sort ;");
p("     l attribut sur le formulaire, lui, la tient fermée quoi qu il arrive. */");
p("  function manque(ids){");
p("    for (var i = 0; i < ids.length; i++) {");
p("      var c = el(ids[i]);");
p("      if (c && !String(c.value == null ? '' : c.value).trim()) { try { c.focus(); } catch (e) {} return true; }");
p("    }");
p("    return false;");
p("  }");
p("  function fauteEffacer(id){");
p("    var z = el(id);");
p("    if (z) { z.className = 'cx-err'; z.innerHTML = ''; }");
p("  }");
p("");
p("  /* ══ LA TENTATIVE ════════════════════════════════════════════════════════ */");
p("  function entrer(){");
p("    var idc = el('sl-email'), pwc = el('sl-password'), b = el('sl-btn');");
p("    if (!idc || !pwc || !b) return;");
p("    fauteEffacer('sl-error');");
p("    if (manque(['sl-email', 'sl-password'])) {");
p("      faute('sl-error', { message: T('Entrez votre nom d’utilisateur et votre mot de passe.') });");
p("      return;");
p("    }");
p("    /* ⚠ LE DISQUE REMPLACE LE TEXTE SANS CHANGER LA TAILLE DU BOUTON : sa");
p("       hauteur est fixée (min-height) et son contenu est centré. Un bouton qui");
p("       rétrécit pendant qu on attend fait sauter tout le formulaire — c est la");
p("       chose la plus datée qu une commande puisse faire. */");
p("    b.disabled = true;");
p("    b.innerHTML = '<span class=\"cx-spin\"></span><span>' + T('Connexion…') + '</span>';");
p("    var sv = el('sl-remember');");
p("    appeler('connexion:entrer', [idc.value.trim(), pwc.value, !!(sv && sv.checked), CAPTCHA_OK])");
p("      .then(function(r){");
p("        var b2 = el('sl-btn');");
p("        if (!r.ok) {");
p("          if (b2) { b2.disabled = false; b2.textContent = T('Se connecter'); }");
p("          faute('sl-error', r);");
p("          /* ⚠ ICI ET NULLE PART AILLEURS. Les autres échecs de cet écran —");
p("             un code à six chiffres refusé, un chargement d étape qui rate —");
p("             ne sont PAS des mots de passe oubliés, et offrir le recours à ce");
p("             moment-là enverrait quelqu un réinitialiser un mot de passe qui");
p("             était bon. Un compte verrouillé, lui, compte : c est justement là");
p("             qu on a besoin de la porte de sortie. */");
p("          devoilerOubli();");
p("          /* Un echec peut FAIRE APPARAITRE le casse-tete (seuil atteint) ou le");
p("             rendre inutile (compte verrouille : il n y a plus rien a ralentir). */");
p("          if (r.captchaRequis) captchaPoser(); else if (r.motif === 'verrou') captchaRetirer();");
p("          var pw = el('sl-password'); if (pw) { pw.value = ''; pw.focus(); }");
p("          return;");
p("        }");
p("        if (r.suite === 'mfa')   { mfaDemarrer(r.secondes || 60); return; }");
p("        if (r.suite === 'expire') {");
p("          if (b2) { b2.disabled = false; b2.textContent = T('Se connecter'); }");
p("          faute('sl-error', { message: r.message, ton: 'sombre' });");
p("          return;");
p("        }");
p("        /* ⚠⚠ TOUT SE PASSE DANS CETTE FENETRE — sa demande du 2026-09-10 :");
p("           << il faut integrer ca dans la meme fenetre >>. En 5.9.0 ces deux");
p("           suites partaient vers la fenetre principale, et j avais ecrit qu un");
p("           assistant a moitie porte s arreterait au milieu. C etait le cas : on");
p("           entrait ici et on ressortait ailleurs.");
p("           ⚠ ET IL Y EN AVAIT TROIS, pas deux : le mot de passe impose peut");
p("           mener aux questions de securite. suivre est le seul aiguillage.");
p("           ⚠ ON NE FERME PAS LA FENETRE ICI : partir() n arrive plus qu a la");
p("           reussite finale, dans reussi. La fermer entre deux etapes aurait");
p("           laisse l assistant sans ecran. */");
p("        suivre(r);");
p("      });");
p("  }");
p("");
p("  /* ══ LE CODE A SIX CHIFFRES ══════════════════════════════════════════════");
p("     ⚠ LE DECOMPTE EST DESSINE ICI, MAIS L ECHEANCE RESTE CELLE DE LA PAGE.");
p("     _mfaTimeout y revoque le jeton en attente et purge le sessionStorage. Si");
p("     ce chrono arrive a zero avant, il ne ferme rien lui-meme : il appelle");
p("     connexion:mfaAbandon et laisse la page faire le menage. Deux horloges qui");
p("     decident, c est une qui se trompe. */");
p("  function mfaDemarrer(sec){");
p("    dessiner('mfa', sec);");
p("    MFA_FIN = Date.now() + sec * 1000;");
p("    if (MFA_T) clearInterval(MFA_T);");
p("    MFA_T = setInterval(function(){");
p("      var reste = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));");
p("      var z = el('sl-mfa-timer');");
p("      if (z) { z.textContent = reste + ' s'; if (reste <= 5) z.className = 'presse'; }");
p("      if (reste <= 0) { clearInterval(MFA_T); MFA_T = null; mfaExpire(); }");
p("    }, 250);");
p("    var c = el('sl-mfa-code'); if (c) c.focus();");
p("  }");
p("  function mfaExpire(){");
p("    appeler('connexion:mfaAbandon').then(function(){");
p("      dessiner('login');");
p("      faute('sl-error', { message: T('Délai de vérification dépassé — veuillez vous reconnecter.') });");
p("    });");
p("  }");
p("  function mfaEnvoyer(){");
p("    var c = el('sl-mfa-code'), b = el('sl-mfa-btn');");
p("    if (!c || !b) return;");
p("    fauteEffacer('sl-mfa-error');");
p("    if (manque(['sl-mfa-code'])) {");
p("      faute('sl-mfa-error', { message: T('Entrez le code à six chiffres.') });");
p("      return;");
p("    }");
p("    /* On arrete le chrono PENDANT la verification : sinon un << delai depasse >>");
p("       tomberait au milieu de l attente reseau, et le bouton resterait cliquable");
p("       pour un second envoi. */");
p("    if (MFA_T) { clearInterval(MFA_T); MFA_T = null; }");
p("    var ch = el('sl-mfa-timer');");
p("    if (ch && ch.parentElement) ch.parentElement.style.display = 'none';");
p("    b.disabled = true;");
p("    b.innerHTML = '<span class=\"cx-spin\"></span><span>' + T('Vérification…') + '</span>';");
p("    c.disabled = true;");
p("    appeler('connexion:mfa', [c.value]).then(function(r){");
p("      if (r.ok) { reussi(r.prenom); return; }");
p("      var c2 = el('sl-mfa-code'), b2 = el('sl-mfa-btn');");
p("      if (b2) { b2.disabled = false; b2.textContent = T('Vérifier'); }");
p("      if (c2) { c2.disabled = false; c2.value = ''; c2.focus(); }");
p("      var ch2 = el('sl-mfa-timer');");
p("      if (ch2 && ch2.parentElement) ch2.parentElement.style.display = '';");
p("      faute('sl-mfa-error', r);");
p("      /* Le chrono reprend la ou il en etait : le remettre a soixante offrirait");
p("         du temps que la page n accorde pas, et le laisser mort ferait attendre");
p("         un delai qui ne viendrait jamais. */");
p("      var reste = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));");
p("      if (reste <= 0) { mfaExpire(); return; }");
p("      MFA_T = setInterval(function(){");
p("        var x = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));");
p("        var zz = el('sl-mfa-timer');");
p("        if (zz) { zz.textContent = x + ' s'; if (x <= 5) zz.className = 'presse'; }");
p("        if (x <= 0) { clearInterval(MFA_T); MFA_T = null; mfaExpire(); }");
p("      }, 250);");
p("    });");
p("  }");
p("");
p("  /* ══ LA REUSSITE ═════════════════════════════════════════════════════════");
p("     ⚠ L ORDRE EST LE SUJET. connexion:ouvrir leve le voile de chargement dans");
p("     la page AVANT App.render(), puis dessine le tableau de bord. On ne ferme");
p("     cette fenetre QU APRES : la fermer d abord laisserait voir l ecran de");
p("     connexion web une fraction de seconde, juste avant le panneau - exactement");
p("     le clignotement du #38, mais a l entree. */");
p("  function reussi(prenom){");
p("    szDire('Bienvenue' + (prenom ? ', ' + prenom : '') + '.', 'bon');");
p("    appeler('connexion:ouvrir').then(function(){ setTimeout(partir, 220); });");
p("  }");
p("  function partir(){");
p("    if (MAINT_T) { clearInterval(MAINT_T); MAINT_T = null; }");
p("    if (MFA_T) { clearInterval(MFA_T); MFA_T = null; }");
p("    try { window.close(); } catch (e) {}");
p("  }");
p("");
p("  /* ══ LA BANNIERE DE MAINTENANCE ══════════════════════════════════════════");
p("     ⚠ ELLE SE RELIT, ET C EST LE DEFAUT CORRIGE EN 5.7.0 : lue une fois, elle");
p("     restait apres la levee, et la boite du NIP avec. Un ecran qui annonce un");
p("     blocage deja leve empeche de se connecter alors que plus rien n empeche.");
p("     ⚠ UN APPEL QUI ECHOUE NE CHANGE RIEN : effacer la banniere sur une coupure");
p("     reseau ferait croire la maintenance levee alors qu on n en sait rien.");
p("     ⚠ ON NE REECRIT QUE SI LA PHRASE A CHANGE : sinon elle clignote sous les");
p("     doigts toutes les vingt secondes. */");
p("  function maintLire(){");
p("    appeler('connexion:maintenance').then(function(r){");
p("      if (!r || !r.ok) return;");
p("      var avant = MAINT;");
p("      MAINT = { actif: !!r.actif, phrase: r.phrase || '' };");
p("      if (avant && avant.actif === MAINT.actif && avant.phrase === MAINT.phrase) return;");
p("      maintPeindre();");
p("    });");
p("  }");
p("  function maintPeindre(){");
p("    var z = el('al-maint'), n = el('al-nipbox');");
p("    if (!z) return;");
p("    if (!MAINT || !MAINT.actif) {");
p("      z.innerHTML = '';");
p("      /* La boite du NIP part AVEC la banniere : une porte devant un mur se");
p("         retire, et c est la seule surface qu un inconnu peut marteler. */");
p("      if (n) n.innerHTML = '';");
p("      return;");
p("    }");
p("    z.innerHTML = '<div class=\"admlogin-maint\"><strong>' + T('Maintenance en cours') + '</strong>'");
p("      + '<div>' + esc(MAINT.phrase) + '</div></div>';");
p("  }");
p("");
p("  /* ══ LE NIP D URGENCE — Ctrl + Maj + 0 ═══════════════════════════════════");
p("     ⚠ IL N EXISTE QUE PENDANT UNE MAINTENANCE ACTIVE. Hors maintenance, le");
p("     raccourci ne dessine rien : le serveur refusait deja, donc rien ne cassait,");
p("     mais offrir une porte devant un mur RETIRE des tentatives possibles au lieu");
p("     d en compter. */");
p("  function nipOuvrir(){");
p("    if (!MAINT || !MAINT.actif) return;");
p("    var n = el('al-nipbox');");
p("    if (!n || n.firstChild) return;");
p("    n.innerHTML = '<div class=\"admlogin-nipbox\">'");
p("      + '<strong>' + T('Désactivation d’urgence') + '</strong>'");
p("      + '<div style=\"font-size:0.76rem;margin:0.3rem 0 0.5rem\">Entrez le NIP posé à '");
p("      + 'l’activation du mode exclusif.</div>'");
/* ⚠ UNE ETIQUETTE, PAS SEULEMENT UN PLACEHOLDER. `verifier-mise-en-page` l a
   refuse, et il a raison : un placeholder DISPARAIT des que l on tape, donc un
   lecteur d ecran comme un oeil qui revient sur le champ n ont plus rien pour
   savoir ce qu on y met. Sur un champ de NIP saisi sous pression, dans une
   maintenance, c est le pire moment pour deviner. */
p("      + '<label class=\"cx-lbl\" for=\"nip-champ\">' + T('NIP de désactivation') + '</label>'");
p("      + '<input type=\"password\" id=\"nip-champ\" inputmode=\"numeric\" maxlength=\"12\" '");
p("      + 'autocomplete=\"off\" placeholder=\"NIP\">'");
p("      + '<div class=\"cx-err\" id=\"nip-err\"></div>'");
p("      + '<div class=\"npr\"><button type=\"button\" id=\"nip-ok\">' + T('Lever la maintenance') + '</button>'");
p("      + '<button type=\"button\" id=\"nip-non\">' + T('Annuler') + '</button></div></div>';");
p("    var c = el('nip-champ'); if (c) c.focus();");
p("    var ok = el('nip-ok'); if (ok) ok.onclick = nipEnvoyer;");
p("    var no = el('nip-non');");
p("    if (no) no.onclick = function(){ var b = el('al-nipbox'); if (b) b.innerHTML = ''; };");
p("    if (c) c.onkeydown = function(e){ if (e.key === 'Enter') nipEnvoyer(); };");
p("  }");
p("  function nipEnvoyer(){");
p("    var c = el('nip-champ'), b = el('nip-ok');");
p("    if (!c || !b) return;");
p("    fauteEffacer('nip-err');");
p("    b.disabled = true;");
p("    appeler('connexion:nip', [c.value]).then(function(r){");
p("      var b2 = el('nip-ok');");
p("      if (b2) b2.disabled = false;");
p("      if (!r.ok) { faute('nip-err', r); var cc = el('nip-champ'); if (cc) { cc.value = ''; cc.focus(); } return; }");
p("      szDire(r.message || 'Maintenance levée.', 'bon');");
p("      MAINT = { actif: false, phrase: '' };");
p("      maintPeindre();");
p("    });");
p("  }");
p("");
p("  /* ══ LE BRANCHEMENT ══════════════════════════════════════════════════════");
p("     ⚠ APPELE APRES CHAQUE DESSIN, et il ne suppose rien : chaque element est");
p("     cherche, et son absence est normale (l ecran du code n a pas de case << se");
p("     souvenir >>). C est le banc verifier-appels-fenetres qui garantit que les");
p("     fonctions citees ici existent - une fenetre dont un bouton appelle un nom");
p("     absent << ne fait rien >> au clic, et rien d autre ne l attrape. */");
p("  function brancher(){");
p("    /* ⚠ LE SURVOL DES BOUTONS PRINCIPAUX SE BRANCHE ICI, apres chaque dessin.");
p("       La couleur du survol se calcule depuis le theme, donc elle ne peut pas");
p("       vivre dans une regle CSS : une regle :hover ne saurait pas quelle valeur");
p("       viser sans la recopier — et une couleur recopiee cesse de suivre le");
p("       theme des la premiere fois qu il change.");
p("       ⚠ TOUS les boutons principaux de TOUS les ecrans : la liste est un");
p("       selecteur, pas une enumeration, sinon un ecran ajoute demain aurait un");
p("       bouton qui ne reagit plus au survol sans que rien ne le dise. */");
p("    var prims = document.querySelectorAll('.cx-btn');");
p("    for (var pi = 0; pi < prims.length; pi++) btnSurvol(prims[pi]);");
p("    var f = el('cx-form');");
p("    if (f) f.onsubmit = function(e){ e.preventDefault(); entrer(); };");
p("    var fm = el('cx-form-mfa');");
p("    if (fm) fm.onsubmit = function(e){ e.preventDefault(); mfaEnvoyer(); };");
p("    var oeil = el('sl-oeil');");
p("    if (oeil) oeil.onclick = function(){");
p("      var p2 = el('sl-password');");
p("      if (!p2) return;");
p("      var cache = p2.type === 'password';");
p("      p2.type = cache ? 'text' : 'password';");
p("      oeil.innerHTML = cache ? IC.oeilBarre : IC.oeil;");
p("      /* ⚠ LES DEUX ÉTIQUETTES PASSENT PAR T(). Un lecteur d écran lit CETTE");
p("         phrase-là et rien d autre ; la laisser en dur, c est un écran anglais");
p("         qui parle français à la seule personne qui ne voit pas l écran. Trou");
p("         trouvé par << banc-langue-connexion >> — pas par la relecture. */");
p("      oeil.setAttribute('aria-label',");
p("        cache ? T('Masquer le mot de passe') : T('Afficher le mot de passe'));");
p("      p2.focus();");
p("    };");
p("    var lgf = el('lg-fr'); if (lgf) lgf.onclick = function(){ langueMettre('fr'); };");
p("    var lge = el('lg-en'); if (lge) lge.onclick = function(){ langueMettre('en'); };");
p("    var ou = el('sl-oubli');");
p("    if (ou) ou.onclick = function(){");
p("      appeler('connexion:oubli').then(function(r){ dessiner('oubli', r); });");
p("    };");
p("    var our = el('sl-oubli-retour');");
p("    if (our) our.onclick = function(){ dessiner('login'); apresLogin(); };");

p("    var code = el('sl-mfa-code');");
p("    if (code) code.oninput = function(){ code.value = code.value.replace(/\\D/g, '').slice(0, 6); };");
p("    /* Le seuil du casse-tete depend du NOM D UTILISATEUR : deux comptes sur le");
p("       meme poste n ont pas le meme compte d echecs, et exiger le casse-tete a");
p("       l un parce que l autre s est trompe serait faux dans les deux sens. */");
p("    /* Les trois assistants de la suite. Chaque element est cherche, et son");
p("       absence est normale : brancher est appele apres CHAQUE dessin. */");
p("    var fw = el('cx-form-wz');");
p("    if (fw) fw.onsubmit = function(e){ e.preventDefault(); mfaConfigEnvoyer(); };");
p("    var wc = el('wz-code');");
p("    if (wc) wc.oninput = function(){ wc.value = wc.value.replace(/\\D/g, '').slice(0, 6); };");
p("    var wcp = el('wz-copier');");
p("    if (wcp) wcp.onclick = function(){");
p("      var z = el('wz-cle');");
p("      if (!z) return;");
p("      /* ⚠ LA CLE SE COPIE SANS LES ESPACES : ils sont la pour la LIRE (groupes");
p("         de quatre), et les applications TOTP refusent la plupart du temps une");
p("         cle qui en contient. Copier ce qu on voit aurait fait echouer le");
p("         collage sans dire pourquoi. */");
p("      var v = String(z.textContent || '').replace(/\\s+/g, '');");
p("      try { navigator.clipboard.writeText(v); szDire(T('Clé copiée (sans les espaces).'), 'bon'); }");
p("      catch (e) { szDire(T('La copie a échoué — recopiez la clé à la main.'), 'att'); }");
p("    };");
p("    var wq = el('wz-qr');");
p("    if (wq) wq.onerror = function(){");
p("      /* Le QR vient d un service externe : sans reseau, ou si le service est");
p("         indisponible, on le retire et on renvoie a la cle — qui, elle, est la. */");
p("      wq.style.display = 'none';");
p("      var z = el('wz-qr-err');");
p("      if (z) z.className = 'cx-err on';");
p("    };");
p("    var wa = el('wz-annuler');");
p("    if (wa) wa.onclick = function(){ dessiner('login'); apresLogin(); };");
p("");
p("    var fmdp = el('cx-form-mdp');");
p("    if (fmdp) fmdp.onsubmit = function(e){ e.preventDefault(); mdpEnvoyer(); };");
p("    var pca = el('pc-annuler');");
p("    if (pca) pca.onclick = function(){ dessiner('login'); apresLogin(); };");
p("");
p("    var fq = el('cx-form-q');");
p("    if (fq) fq.onsubmit = function(e){ e.preventDefault(); questionsEnvoyer(); };");
p("    var sq1 = el('sq-q1'), sq2 = el('sq-q2');");
p("    if (sq1) sq1.onchange = questionsAccorder;");
p("    if (sq2) sq2.onchange = questionsAccorder;");
p("    var sqa = el('sq-annuler');");
p("    if (sqa) sqa.onclick = function(){ dessiner('login'); apresLogin(); };");
p("");
p("    var idc = el('sl-email');");
p("    if (idc) idc.onchange = function(){");
p("      appeler('connexion:captcha', [idc.value.trim()]).then(function(r){");
p("        if (!r || !r.ok) return;");
p("        if (r.requis && !r.verrouille) captchaPoser(); else captchaRetirer();");
p("      });");
p("    };");
p("  }");
p("");
p("  /* Le curseur va DIRECTEMENT au mot de passe quand le nom est deja connu :");
p("     l y renvoyer serait lui faire retaper ce que le poste a retenu. */");
p("  /* ══ CHANGER DE LANGUE ════════════════════════════════════════════════");
p("     ⚠ ON REDESSINE TOUT, panneau de marque compris : ses trois lignes de");
p("     sécurité sont du texte, elles aussi. Les halos repartent de zéro — c est");
p("     le seul endroit du parcours où on l accepte, parce que c est un geste");
p("     DEMANDÉ, une fois, et qu il vaut mieux qu une moitié d écran reste dans");
p("     l autre langue.");
p("     ⚠ LE NOM D UTILISATEUR DÉJÀ TAPÉ EST RENDU. Perdre une saisie parce");
p("     qu on a cliqué sur EN serait une punition pour avoir lu l écran.");
p("     ⚠ LE MOT DE PASSE, LUI, N EST PAS REPORTÉ : le remettre dans le document");
p("     n apporte rien qu un aller-retour de plus pour une valeur secrète, et le");
p("     curseur revient dessus. */");
p("  function langueMettre(l){");
p("    l = (l === 'en') ? 'en' : 'fr';");
p("    if (l === LANGUE) return;");
p("    LANGUE = l;");
p("    try { if (P && P.langueEcrire) P.langueEcrire(l); } catch (e) {}");
p("    var idc = el('sl-email');");
p("    var garde = idc ? idc.value : null;");
p("    var reste = (ECRAN === 'mfa' && MFA_FIN)");
p("      ? Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000)) : null;");
p("    socle();");
p("    dessiner(ECRAN, (reste === null) ? ECRAN_DONNEE : reste);");
p("    if (ECRAN === 'login') {");
p("      var n = el('sl-email');");
p("      if (n && garde !== null) n.value = garde;");
p("      apresLogin();");
p("    }");
p("    try { document.documentElement.lang = LANGUE; } catch (e) {}");
p("    maintLire();");
p("  }");
p("");
p("  function apresLogin(){");
p("    if (CTX.captchaRequis && !CTX.verrouille) captchaPoser();");
p("    var z = el(CTX.prefill ? 'sl-password' : 'sl-email');");
p("    if (z) z.focus();");
p("  }");
p("");
p("  /* ══ LE RACCOURCI ════════════════════════════════════════════════════════ */");
p("  window.addEventListener('keydown', function(e){");
p("    if (e.ctrlKey && e.shiftKey && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) {");
p("      e.preventDefault();");
p("      nipOuvrir();");
p("    }");
p("  });");
p("");
p("  /* ══ LE CHARGEMENT ═══════════════════════════════════════════════════════");
p("     ⚠ SI LE CONTEXTE NE VIENT PAS, ON DESSINE QUAND MEME. Un ecran de connexion");
p("     qui refuserait de s afficher parce qu il n a pas pu lire la couleur d un");
p("     halo serait une panne bien pire que celle qu il evite - et il n y aurait");
p("     plus aucun moyen d entrer. D ou les valeurs de repli. */");
p("  var REPLI = {");
p("    ok: true,");
p("    theme: { bgFrom: '#191238', bgMid: '#2b2262', logoFrom: '#4f46e5', logoTo: '#7c3aed',");
p("      titre: '#f5e6d0', sous: 'rgba(236,229,217,0.92)', sousTexte: 'Panneau d’administration',");
p("      btnFrom: '#1a1207', btnTo: '#3d2810', btnTexte: '#f5e6d0' },");
p("    marque: { nom: 'SANDRIZA', lettre: 'É', logo: '' },");
p("    prefill: '', souvenir: false, captchaRequis: false, verrouille: false");
p("  };");
p("");
p("  /* ══ LES INTITULÉS ARRIVENT DE LA COQUILLE, LE POPUP AUSSI ══════════════");
p("     ⚠ SI LA COQUILLE N EN DONNE AUCUN, ON NE DESSINE RIEN. Une barre vide,");
p("     c est une bande sombre de trente pixels qui ne sert à rien et qui mange");
p("     le haut de l écran — pire que pas de barre. Le modèle peut aussi arriver");
p("     en retard (il vient de la page principale) : on redemande une fois à");
p("     deux secondes, et une seule — un sondage permanent pour une barre de");
p("     menus serait hors de proportion.");
p("     ⚠ ET ON N EN FAIT PAS UN PRÉALABLE : la barre se pose quand elle peut,");
p("     l écran de connexion n attend jamais après elle. */");
p("  var BARRE_FAITE = false;");
p("  var BARRE_OUVERT = null;");
p("  function barreMontrer(b){");
p("    if (!b || !P || !P.menuPanneau) return;");
p("    if (BARRE_OUVERT === b) return;");
p("    barreEteindre();");
p("    BARRE_OUVERT = b;");
p("    b.className = 'on';");
p("    /* ⚠ SOUS LE BOUTON, pas sous le pointeur : un panneau qui s ouvre à deux");
p("       pixels près de là où on a cliqué a l air de flotter. */");
p("    var r = b.getBoundingClientRect();");
p("    P.menuPanneau(b.textContent, Math.round(r.left), Math.round(r.bottom));");
p("  }");
p("  function barreEteindre(){");
p("    if (BARRE_OUVERT) { BARRE_OUVERT.className = ''; BARRE_OUVERT = null; }");
p("  }");
p("  /* ⚠ LA COQUILLE APPELLE CECI quand le panneau se referme — après un clic");
p("     dedans, ou parce que la souris est partie. Sans ce retour, l intitulé");
p("     resterait allumé au-dessus d un menu fermé. */");
p("  window.szBarreFermee = function(){ barreEteindre(); };");
p("  /* ⚠ LE FOND PART DU HAUT DU DÉGRADÉ — c est ce qu on recouvre — puis on le");
p("     POUSSE franchement dans son propre sens : une barre doit se détacher du");
p("     panneau, pas s y fondre. Ensuite le texte prend le clair ou le foncé selon");
p("     ce fond-là, et on l amène au seuil par pas de 6 %. Le même calcul que le");
p("     bouton principal, et pour la même raison : on ne CHOISIT pas une couleur en");
p("     espérant qu elle passe, on l amène où elle doit être. */");
p("  function barreTeindre(z){");
p("    var t = (CTX && CTX.theme) ? CTX.theme : {};");
p("    var base = t.bgFrom || '#2a2118';");
p("    var sombre = lumi(base) <= 0.5;");
p("    var fond = melanger(base, sombre ? -0.22 : 0.22);");
p("    var txt = sombre ? '#f3ede3' : '#2a2118';");
p("    var n = 0;");
p("    while (contraste(txt, fond) < 4.6 && n < 24) {");
p("      fond = melanger(fond, sombre ? -0.06 : 0.06);");
p("      n++;");
p("    }");
p("    z.style.setProperty('--cxb-fond', fond);");
p("    z.style.setProperty('--cxb-txt', txt);");
p("    z.style.setProperty('--cxb-surv', sombre ? 'rgba(255,255,255,0.13)'");
p("      : 'rgba(0,0,0,0.10)');");
p("    z.style.setProperty('--cxb-trait', sombre ? 'rgba(255,255,255,0.09)'");
p("      : 'rgba(0,0,0,0.10)');");
p("  }");
p("  function barrePoser(){");
p("    if (BARRE_FAITE || !P || !P.menuLabels) return;");
p("    P.menuLabels().then(function(noms){");
p("      if (BARRE_FAITE || !noms || !noms.length) return;");
p("      BARRE_FAITE = true;");
p("      var z = document.createElement('div');");
p("      z.className = 'cx-barre';");
p("      z.setAttribute('role', 'menubar');");
p("      barreTeindre(z);");
p("      for (var i = 0; i < noms.length; i++) {");
p("        var b = document.createElement('button');");
p("        b.type = 'button';");
p("        b.textContent = noms[i];");
p("        b.setAttribute('data-i', String(i));");
p("        /* ══ CLIC POUR OUVRIR, SURVOL POUR CHANGER ═══════════════════════");
p("           ⚠⚠ SES MOTS DU 2026-09-11 : << si je glisse la souris sur un autre");
p("           menu, le menu ne se déroule pas >>. C est le comportement que TOUTE");
p("           barre de menus promet, et il manquait parce que la 5.23.0 passait");
p("           par le menu du SYSTÈME — qui prend la souris et ne la rend qu à la");
p("           fermeture.");
p("           ⚠ LE PANNEAU FLOTTANT, LUI, S AFFICHE SANS PRENDRE LE FOYER : le");
p("           survol continue d arriver ici. Il ne reste qu à ne réagir QUE si un");
p("           menu est déjà ouvert — sinon un simple passage de souris au-dessus");
p("           de la barre ferait déplier des menus qu on ne demandait pas.");
p("           ⚠ ET LE BOUTON ALLUMÉ EST L ÉTAT, pas une décoration : c est lui qui");
p("           dit quel menu est ouvert, et << szBarreFermee >> (appelée par la");
p("           coquille) l éteint quand le panneau se referme. */");
p("        b.onclick = function(){ barreMontrer(this); };");
p("        b.onmouseenter = function(){ if (BARRE_OUVERT) barreMontrer(this); };");
p("        z.appendChild(b);");
p("      }");
p("      /* ⚠ SORTIR DE LA BARRE REFERME — mais la coquille attend un court");
p("         instant avant de retirer le panneau (elle sait si la souris est");
p("         passée DEDANS). Sans ce délai de son côté, descendre du bouton vers");
p("         le panneau le ferait disparaître en chemin. */");
p("      z.onmouseleave = function(){");
p("        if (P && P.menuPanneauFermer) P.menuPanneauFermer();");
p("        barreEteindre();");
p("      };");
p("      document.body.appendChild(z);");
p("      document.body.className = (document.body.className + ' cx-abarre').replace(/^ /, '');");
p("    }).catch(function(){});");
p("  }");
p("");
p("  /* ══ LA LANGUE SE LIT AVANT LE PREMIER DESSIN ═════════════════════");
p("     ⚠ ET SON ÉCHEC NE BLOQUE RIEN : sans réponse on reste en français, et");
p("     l écran s ouvre. Un écran de CONNEXION qui attendrait après un réglage");
p("     d affichage serait un écran qui ne s ouvre pas le jour où ce réglage");
p("     manque : on troquerait un confort contre la porte d entrée.");
p("     ⚠ << charger >> NE FAIT QUE ÇA, et passe la main à << chargerSuite >>. Insérer");
p("     cette attente AU MILIEU de l ancien corps aurait mêlé deux suites de");
p("     promesses, et c est l empilement qui fait qu un jour l une avale");
p("     l erreur de l autre. */");
p("  function charger(){");
p("    var fini = function(){ chargerSuite(); };");
p("    var pl = null;");
p("    try { pl = (P && P.langue) ? P.langue() : null; } catch (e) { pl = null; }");
p("    if (pl && typeof pl.then === 'function') {");
p("      pl.then(function(l){ LANGUE = (l === 'en') ? 'en' : 'fr'; })");
p("        .catch(function(){})");
p("        .then(fini, fini);");
p("    } else { fini(); }");
p("  }");
p("");
p("  function chargerSuite(){");
p("    appeler('connexion:contexte').then(function(r){");
p("      CTX = (r && r.ok && r.theme && r.marque) ? r : REPLI;");
p("      if (CTX === REPLI) szDire(T('Décor par défaut — la fenêtre principale n’a pas répondu.'), 'att');");
p("      socle();");
p("      /* ⚠ LE DEPART EST HONORE APRES LE SOCLE, PAS AVANT : les assistants ont");
p("         besoin du panneau de marque et de la zone de message deja en place. */");
p("      if (DEPART === 'mfa')            { mfaDemarrer(60); }");
p("      else if (DEPART === 'mfaConfig') { chargerMfaConfig(); }");
p("      else if (DEPART === 'mdp')       { chargerMdp(); }");
p("      else if (DEPART === 'questions') { chargerQuestions(); }");
p("      else if (DEPART === 'oubli')     {");
p("        appeler('connexion:oubli').then(function(x){ dessiner('oubli', x); });");
p("      } else {");
p("        dessiner('login');");
p("        apresLogin();");
p("      }");
p("      /* La banniere se lit tout de suite, puis toutes les vingt secondes :");
p("         assez pour qu une levee se voie dans le temps qu on met a retaper un mot");
p("         de passe, assez lent pour ne peser sur rien. */");
p("      /* ⚠ SIX TENTATIVES ESPACÉES, PAS DEUX. Les intitulés viennent du");
p("         modèle que la PAGE PRINCIPALE envoie à la coquille, et rien ne");
p("         garantit qu il soit arrivé quand cet écran s ouvre — c est tout le");
p("         sujet du défaut #38, << le menu apparaît trois secondes après le");
p("         tableau de bord >>. Mon premier jet réessayait UNE fois à deux");
p("         secondes : un démarrage un peu lent et la barre ne venait jamais,");
p("         sans que rien ne le dise.");
p("         ⚠ ON S ARRÊTE DÈS QU ON A LA RÉPONSE (barrePoser sort sur");
p("         BARRE_FAITE), donc le cas normal ne coûte qu un appel. Et on");
p("         s arrête TOUT COURT au bout de dix secondes : une barre de menus ne");
p("         vaut pas un sondage perpétuel. */");
p("      barrePoser();");
p("      var _bT = [600, 1500, 3000, 6000, 10000];");
p("      for (var _bi = 0; _bi < _bT.length; _bi++) setTimeout(barrePoser, _bT[_bi]);");
p("      maintLire();");
p("      MAINT_T = setInterval(maintLire, 20000);");
p("    });");
p("  }");
p("");
p("  window.addEventListener('beforeunload', function(){");
p("    if (MAINT_T) clearInterval(MAINT_T);");
p("    if (MFA_T) clearInterval(MFA_T);");
p("  });");
p("");
p("  charger();");
p("})();");
p("</" + "script></body></html>" + AG + ";");
p("}");
p("");
p("module.exports = { pageConnexion };");

function JS_DIRE_PLACEHOLDER() { return '${JS_DIRE}'; }

/* ⚠⚠ LE GARDE QUI M A MANQUE SEPT FOIS, ET IL COMPTE AU LIEU DE FAIRE
   CONFIANCE. Un accent grave dans la portion de script referme le gabarit, et
   le message d erreur pointe alors une ligne qui n a rien a se reprocher
   (<< Unexpected identifier 'suivre' >>, ligne 786, dans un COMMENTAIRE). Dans
   cette portion un accent grave n est JAMAIS legitime : aucun gabarit imbrique.
   Le gabarit lui-meme en pose exactement DEUX - celui qui l ouvre et celui qui
   le ferme. Tout ecart est nomme, avec sa ligne, et refuse.
   ⚠ Le fragment a son propre garde (voir FRAGMENT) ; celui-ci attrape les
   lignes p(...) du generateur, que le premier ne voyait pas. */
{
  const srcG = L.join(String.fromCharCode(10));
  const iDeb = srcG.indexOf('function pageConnexion(');
  if (iDeb < 0) { console.error('REFUS - gabarit introuvable'); process.exit(1); }
  const corps = srcG.slice(iDeb);
  const AGc = String.fromCharCode(96);
  const combien = corps.split(AGc).length - 1;
  if (combien !== 2) {
    console.error('REFUS - ' + combien + ' accent(s) grave(s) dans le gabarit, il en faut 2 :');
    corps.split(String.fromCharCode(10)).forEach((l, k) => {
      if (l.indexOf(AGc) < 0) return;
      const nu = l.trim();
      if (nu === AGc + ';' || nu.indexOf('doctype') >= 0) return;   // les deux legitimes
      console.error('   ligne ~' + (k + 1) + ' du gabarit : ' + nu.slice(0, 95));
    });
    process.exit(1);
  }
}
fs.writeFileSync('C:/Temp/sandriza-desktop/src/fenetres/connexion.js', L.join('\r\n') + '\r\n', 'utf8');
console.log('OK - connexion.js ecrit,', L.length, 'lignes.');
