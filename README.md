# Administration Sandriza — coquille de bureau

Application Electron qui ouvre le portail d'administration **en ligne**
(`adm.sandriza.com`) dans une fenêtre de bureau, avec l'impression native des
imprimantes du poste et la mise à jour automatique.

## ⚠ Ce dépôt est PUBLIC — ce qu'il contient, et ce qu'il ne contient pas

**Il contient** une coquille : une fenêtre, un menu, l'impression, la mise à
jour. Rien de plus.

**Il ne contient pas**, et ne doit jamais contenir :

- aucun code de la boutique ni de l'administration — ils vivent en ligne et sont
  chargés à l'exécution ;
- aucun accès à la base de données, aucun identifiant de paiement, de
  transporteur ou de messagerie ;
- **aucun identifiant Cloudflare R2** — la publication des paquets se fait
  depuis le dépôt privé, qui seul les détient. Le bucket ne porte pas que des
  installateurs : il contient aussi les sauvegardes, les photos produit et les
  exports comptables ;
- **aucune clé de verrou en clair** : `ELG_APP_KEY` est un secret du dépôt,
  écrit dans `src/cle.js` au moment de la construction, jamais commité.

### Sur la clé du verrou

Le serveur ne sert `adm.sandriza.com` qu'aux clients présentant l'en-tête
`X-Sandriza-App`. **Ce n'est pas de l'authentification et il ne faut jamais le
présenter comme tel** : l'`app.asar` d'une application Electron n'est pas
chiffré, donc quiconque possède un installateur peut en extraire la clé. Le
verrou fait disparaître le portail des navigateurs, des robots, des scanners et
de l'hameçonnage — il n'arrête pas quelqu'un de déterminé et outillé.

**Le vrai rempart reste la session personnel + MFA.** Sortir la clé de ce dépôt
évite seulement qu'elle soit trouvable par un scanner qui parcourt le web, ce
qui est très différent d'avoir à obtenir un installateur distribué sous mot de
passe temporaire.

## Comment on publie une version

1. Monter la version dans `package.json`.
2. **Ici** → Actions → **Construire** → version, et `avec_mac` seulement si un
   Mac est réellement en service. Noter le numéro d'exécution.
3. **Dépôt privé Sandriza** → Actions → **Publier l'application de bureau** →
   coller ce numéro et la version. C'est ce workflow-là qui dépose dans R2 et
   qui écrit le manifeste.

Les postes reçoivent la mise à jour au lancement suivant : l'application vérifie
sa version avant d'ouvrir l'administration, et refuse de l'ouvrir sur une
version périmée.

## Pièges connus

- **`${arch}` est obligatoire** dans `artifactName` (electron-builder.yml) :
  sans lui, les constructions x64 / ia32 / arm64 écrivent le **même** fichier et
  s'écrasent l'une l'autre, en silence.
- **Un dossier par architecture.** Un flux `latest.yml` commun ferait proposer
  un paquet x64 à un poste ARM.
- **macOS ne se bâtit que sur macOS** (bundle `.app`, liens symboliques,
  `hdiutil`), et sa mise à jour automatique est **impossible sans signature
  Apple** — Squirrel.Mac refuse un paquet non signé.
- **Aucun accent grave dans les commentaires CSS de `src/menubar.js`** : cette
  feuille de style vit dans un gabarit JS, un accent grave y termine la chaîne
  et casse le fichier entier.

## Développement local

```sh
npm install
npm start          # ELG_APP_KEY dans l'environnement, sinon le portail répond 403
```

## Les contrastes des fenêtres, mesurés dans un vrai navigateur

```sh
node tools/banc-contraste-rendu.js            les 2 modes, 92 fenêtres (~2 min)
node tools/banc-contraste-rendu.js --themes   + les 6 thèmes (~30 min)
node tools/banc-contraste-rendu.js accueil    une fenêtre en particulier
node tools/banc-contraste-rendu.js --reste    le relevé, prêt à déclarer
```

`banc-texte-sur-fond.js` lit le CSS et apparie des couleurs **écrites** : il ne
peut pas savoir ce que vaut `var(--tx2)` dans une fenêtre donnée, ni ce que
donne un voile sur un dégradé. Celui-ci **ouvre les 92 fenêtres dans Chrome**,
avec leur faux pont et leurs vraies données, et demande au navigateur la couleur
qu'il a **peinte**. Il tourne dans la construction (travail `contrastes`), sur
une seule machine et **sans bloquer** : refuser de construire pour une couleur,
c'est se retrouver à désactiver le contrôle le jour où ça presse.

**La dette vit dans `contraste-rendu-declare.js`** — 102 couples au premier
relevé du 2026-09-05, chacun avec son nombre d'endroits. Ce nombre est un
**plafond** : le banc refuse qu'une couleur gagne du terrain, et **dit** quand
elle en perd pour qu'on resserre.

### ⚠ Ce qu'il a coûté avant d'être utilisable — à ne pas refaire

- 🔴🔴🔴 **Il a mis le poste à genoux.** Il lançait un Chrome par lot et n'en
  fermait **aucun** : la seule sortie prévue était un `window.close()` de la page
  pilote, qui ne part jamais quand le moteur de rendu est tombé — c'est-à-dire
  précisément quand il faudrait ranger. Des centaines de processus, la mémoire
  épuisée, et des fenêtres « chrome.exe — Application Error » sur le bureau.
  → **Un outil qui démarre un processus doit le tuer lui-même, dans TOUS les cas.**
  → **On ne tue que les siens** : le dossier temporaire de l'exécution sert de
  signe distinctif, sinon on ferme le navigateur de la personne et ses onglets.
- 🔴 **Le premier ménage ne marchait pas, en silence** : j'avais doublé les
  antislashs du chemin « par prudence », or `-like` de PowerShell ne connaît pas
  l'antislash comme échappement. Motif impossible, zéro processus trouvé, aucun
  message. Le nom du dossier (sans antislash) est le repère qui ne se trompe pas.
- 🔴🔴 **138 « fautes » dont les deux pires n'existaient pas.** « Confirmer le
  remboursement » à 1.33, « Expédier » à 1.36 : une **capture d'écran** a montré
  des boutons **désactivés**, **derrière une modale ouverte**. Les deux cas sont
  exemptés **par la norme** (WCAG 1.4.3 : un contrôle inactif n'a aucune exigence
  de contraste) et comptés à part. ⚠ L'opacité, elle, reste **composée** et jugée.
- 🔴 **Le premier `</body>` était dans les DONNÉES.** L'épilogue s'insérait au
  premier `</body>` du fichier — celui d'un **courriel d'essai** rangé dans une
  chaîne JSON. La page mourait sur « Invalid or unexpected token » et deux écrans
  n'étaient jamais mesurés. → chercher le **dernier**, pas le premier.
- 🔴 **Une page qui tue le moteur emporte les 19 autres de son lot**, toutes
  innocentes. Les perdus sont **rejoués un par un** : le coupable est isolé et
  **nommé**. C'est ainsi qu'`inventaire` a été trouvé — et le banc, en refusant
  de se taire dessus, a fait remonter **un vrai défaut de l'application** (voir
  plus bas). Il se mesure depuis : **184 rendus sur 184**.
- 🔴🔴 **ET LA PREUVE QUE J'AVAIS ÉCRITE POUR `inventaire` ÉTAIT FAUSSE.** J'avais
  noté « vérifié sans le banc, page brute en `--dump-dom` : 0 octet » — or
  **`--dump-dom` n'écrit rien en `--headless=new`** : un témoin trivial
  (`<h1>bonjour</h1>`) sortait lui aussi à 0 octet. Puis, en relançant un Chrome
  par variante, un profil **neuf** rend une capture vide (le premier lancement
  passe son budget à s'installer) et un profil **partagé** est refusé (code 21).
  Trois harnais, trois « muet », **une seule conclusion possible et fausse**.
  → **UNE DÉCLARATION D'ANGLE MORT DOIT PORTER UNE PREUVE ÉPROUVÉE SUR UN
  TÉMOIN.** Sans témoin, un outil cassé transforme un doute en fait acquis.
- 🔴 **Le verdict s'attribuait « les six thèmes compris »** alors qu'ils étaient
  devenus optionnels. Une phrase de succès qui annonce une couverture qu'elle n'a
  pas est pire qu'un banc absent : elle clôt la question.

### Le défaut que ce banc a fait remonter — Inventaire tournait sans fin

La fenêtre **Inventaire** calculait combien de lignes tiennent dans sa hauteur,
puis **redemandait la liste au site avec cette cadence**. Le site, lui, répond
avec **sa propre cadence** (« Le site borne page et cadence : on reprend SES
valeurs », dit le code). Si les deux ne tombent pas d'accord — parce que le site
borne, ou renvoie une valeur fixe — la fenêtre recalcule, redemande, et **les
deux nombres se renvoient la balle indéfiniment**, avec un aller-retour au pont
à chaque tour.

⚠ **Ce n'était pas un problème de banc.** Chez une cliente dont le catalogue
ferait borner la cadence, l'onglet Produits martèlerait le pont sans jamais se
poser. Le banc n'a fait que le rendre visible, en refusant de se taire sur la
seule fenêtre qu'il ne pouvait pas mesurer.

**Le remède n'est pas un compteur de tours, c'est la bonne question :** une
cadence que le site a **déjà refusée** ne se redemande pas. On garde la dernière
demandée ; si la réponse diffère, c'est la décision du site et on s'y tient.
La même récursion dormait dans la vue « fiche produit » (`dessiner()` →
`grilleAutoAjuste()` → `dessiner()`), sans rien pour la borner : un verrou de
ré-entrance l'en empêche désormais.

### Ce que les six thèmes ont fait remonter (2026-09-05)

118 couples sous le seuil, **et aucun n'était propre aux thèmes** : c'étaient
**huit endroits** déjà en dette dans le thème par défaut, que les six thèmes
multipliaient. Deux causes de fond, et une leçon :

- **Deux JETONS trop pâles**, `--tx3` (#6d7f96 → **#8e9cad**) et `--tx-gris`
  (#6f8098 → **#8b9cb4**). `--tx3` échouait **même à pleine opacité** (4.00 sur
  la carte de nuit) : c'était la plus grosse entrée de dette, 125 endroits.
- **Estomper n'est pas effacer.** Une ligne de pays non desservi à `.42`, un
  ramassage annulé à `.55`, un bloc de bannière éteint à `.5` : le texte tombait
  entre 1.7 et 2.9, c'est-à-dire illisible — alors qu'on ouvre ces écrans
  **précisément pour lire ce qui est éteint**. Les opacités sont maintenant
  MESURÉES (.9, .95, .9), pas choisies à l'œil.
- 🔴 **En corrigeant `--tx3`, j'ai EMPIRÉ un endroit** : la vignette d'`icones`
  garde un fond crème en dur dans les deux modes, et son texte prenait un jeton
  qui, lui, suit le mode. → **un fond qui ne suit pas le thème ne peut pas porter
  un texte qui le suit** ; les deux vont ensemble, ou aucun des deux.

**La décoration se déclare, elle ne s'excuse pas.** Les séparateurs « · » et les
pictogrammes accolés à leur libellé sortaient sous le seuil dans les douze
combinaisons : douze clés de couleur pour un point qui ne veut rien dire. Ils
portent désormais `aria-hidden="true"` — ce qui est vrai pour un lecteur d'écran
aussi. Le banc les compte et les annonce (« déclarés décoratifs »).
⚠ **Un pictogramme SEUL dans son élément n'est pas décoratif** : le maillon
« produit lié » de l'explorateur porte son sens dans son `title`, donc il a été
rendu lisible, pas caché.

**Reste 16 couples**, tous entre **4.0 et 4.4** (le seuil est 4.5), concentrés
sur les pastilles du thème **ardoise**, dont les fonds de carte sont les plus
clairs des six. Ce sont des cheveux, pas des trous — mais ils sont nommés à
chaque passage de `--themes`, pas cachés.

### Et les 16 derniers (2026-09-05, 4.40.0) — une règle écrite 30 fois

Il restait seize couples entre 4.0 et 4.4, sur les **pastilles** du thème
*ardoise*. La cause n'était pas le thème : c'était **la même règle CSS recopiée
trente fois, à l'octet près** —
`.pill.neutre{background:rgba(148,163,184,.16);color:var(--tx2)}` — dans trente
fenêtres. Une pastille pose un voile clair sur la carte ; sur les thèmes dont la
carte est déjà la plus claire, `--tx2` tombait juste sous le seuil.

⚠ **On n'a pas touché aux jetons.** `--tx-gris2` et `--tx-err2` existaient déjà
et passent largement (7.33 et 5.74 au pire) : il suffisait de prendre le bon
jeton au bon endroit. Éclaircir `--tx2` aurait rejoué exactement le piège de
`--tx3` sur la vignette des icônes.

⚠ **Remplacement à l'IDENTIQUE, jamais par sélecteur.** Deux fenêtres ont une
`.pill.neutre` volontairement différente (une variante dorée) : une règle
d'écrasement posée dans le socle les aurait écrasées aussi. On remplace la chaîne
exacte, les variantes restent intactes. 30 + 2 + 23 occurrences.

⚠ **Une pastille sur un panneau teinté n'est pas une pastille sur une carte** :
celle du panneau d'avis d'`impôt` est sur du bleu clair, où tous les gris de la
charte tombent entre 3.8 et 4.2. Elle prend le texte principal.

**Résultat : 16 → 0.** Le balayage des six thèmes est propre, donc il entre dans
la construction (`--themes`, ~6 min, sans bloquer) : il n'y a plus de jeu de
couleurs sans garde.

🔴 **Et un défaut de comptage trouvé au passage** : sur un petit lot le rapport
annonçait « **24 rendus mesurés sur 12** » — un compte de couverture qui dépasse
son total. C'est absurde, et surtout dangereux : la même addition qui gonfle peut
compenser un rendu manquant, et la ligne « ⚠ N MANQUANT(S) » — la seule qui
protège du « je n'ai pas regardé » — s'éteindrait toute seule. On compte
désormais des **contextes distincts**, pas des lignes de relevé.

### 🔴🔴🔴 Le banc ne mesurait qu'un écran par fenêtre (2026-09-05, 4.41.0)

Il prenait `brut[0]` du jeu de réponses et s'arrêtait là. Or les 92 fenêtres
déclarent **339 scénarios** : la liste des produits ET la fiche d'un produit,
l'onglet Accès ET l'onglet Impressions, la vue normale ET la vue en lecture
seule. **247 écrans — les trois quarts — n'étaient jamais mesurés, et le rapport
n'en disait pas un mot** : il annonçait « 92 fenêtres » comme si une fenêtre
n'avait qu'un visage.

C'est aussi ce qui expliquait les « 72 rendus où presque rien n'a été jugé » : le
premier scénario de `commande` ouvre une **modale** au démarrage, donc le seul
écran mesuré de cette fenêtre était son voile — 8 textes jugés, 98 derrière la
modale. Les cinq autres scénarios, eux, montrent l'écran.

⚠ **« Fenêtre » et « scénario » ne sont pas la même chose**, et les confondre est
exactement ce qui a caché ces 247 écrans. Le rapport dit maintenant les deux :
« 339 scénario(s) de 92 fenêtre(s) ».

**678 rendus, 19 324 couples mesurés** (contre 184 et 6 700). Cela a rendu
visibles **118 fautes qui existaient depuis toujours** : elles sont figées dans
`contraste-rendu-declare.js` avec leur nombre d'endroits — le cliquet les empêche
d'empirer, et elles restent à corriger.

⚠ **Un budget, un choix.** Croiser 339 scénarios × 6 thèmes ferait ~1 600
affichages et un quart d'heure. Un **thème** ne déplace que des fonds (les 118
« fautes de thèmes » se ramenaient à 8 endroits) ; un **scénario** montre un
contenu différent. La construction garde donc les 339 scénarios en 2 modes, et
`--themes` reste à la main sur le premier cas.

### 🔴🔴🔴 Le banc jugeait la couleur ÉCRITE, pas la couleur PEINTE (4.42.0)

Un **tiers de toute la dette** — 146 endroits sur 467 — venait d'une seule règle
du socle : `.ic{filter:grayscale(1) brightness(1.6)}` (et `.42` en mode jour).
Le banc lisait `color` et jugeait dessus. Or `color` n'est que la matière
première : **le filtre la désature puis la multiplie avant de la peindre.** Cent
quarante-six endroits étaient jugés sur une couleur que personne ne voit.

⚠⚠ **ET J'AI FAILLI CORRIGER ÇA À L'ENVERS.** J'avais conclu que ces
pictogrammes étaient des emoji **en couleur**, donc insensibles à `color`, et
j'allais écrire une règle de banc qui les aurait tous **excusés** — 146 fautes
réelles rendues muettes d'un trait. **Une capture d'écran a montré le contraire
en une seconde** : ⚠ 🔗 🗑 👁 ☁ deviennent rouges quand on met `color:red` ; seul
📝 reste peint par la police. Les fautes étaient réelles ; c'est leur **mesure**
qui était fausse. Troisième fois de la journée que regarder bat déduire.

Le banc compose maintenant `grayscale()`, `brightness()` et `opacity()` — les
seuls filtres employés ici, et les seuls qui se calculent exactement. **Tout
autre filtre rend la couleur indécidable** : il renonce, et il le compte.

**Et les vraies fautes, une fois bien mesurées, tenaient en deux familles :**

- **Le filtre EFFACE le pictogramme posé sur une surface d'accent.** Sur un
  bouton doré, violet ou rouge, le glyphe hérite du blanc du bouton ; `grayscale`
  le laisse blanc, puis `brightness(.42)` le ramène à un gris moyen — et un gris
  moyen sur de l'or, c'est **1.44**. Le pictogramme d'un bouton **principal**
  était donc là où il se voyait le moins. Ces surfaces gardent leur pictogramme
  tel quel.
  ⚠ **Un filtre se propage au sous-arbre** : quand la pastille porte elle-même la
  classe (`class="pt ic"`), c'est ELLE qui reçoit le filtre, et un `filter:none`
  posé sur le glyphe à l'intérieur n'annule pas celui du parent. **Il faut nommer
  le porteur, pas seulement le porté.**
  ⚠ Et la spécificité : `html.jour .ic` vaut (0,2,1), donc une règle en
  `.prim .ic` (0,2,0) **ne gagnerait pas**. Les deux modes sont écrits.
- **Estomper un signe qui est SEUL revient à le retirer.** Le cadenas des entrées
  verrouillées (`config-navigation`) était à `.5` : on voyait un gris, on ne
  lisait pas un cadenas — et il n'a aucun libellé à côté.

**Dette : 145 → 89 entrées.** La table précédente avait été relevée sur les
couleurs d'avant les filtres ; la moitié de ses clés désignaient des couleurs qui
n'existent nulle part.

### 🔴🔴🔴 Du texte à 1.00 de contraste — invisible (4.43.0)

Un contraste de **1.00**, c'est du texte **exactement de la couleur de son fond**.
« Rien à déplacer. » n'existait pas à l'écran. Les panneaux (`.info`, `.bien`,
`.avis`) ont bien leur reprise de mode jour — mais le **gras à l'intérieur**
porte sa PROPRE couleur en dur (`#dbe7fb`, `#d3f6e4` : des pâles conçus pour un
fond sombre), et il est **plus spécifique que le panneau**. En mode jour, le fond
devient clair et le gras restait pâle.

⚠ **On ne lui invente pas une couleur : on lui fait HÉRITER celle du panneau**,
qui est déjà juste dans les deux modes. Une reprise qui ne choisit rien ne peut
pas se tromper, et elle suivra les changements à venir.

⚠ Ce défaut avait survécu à `banc-contraste-jour.js` et à `banc-texte-sur-fond.js`
— tous deux verts — parce qu'ils lisent le CSS et n'ont jamais vu ce `b` **dans**
son panneau, sur son fond composé. Il a fallu que le banc au rendu mesure les
339 scénarios pour qu'il apparaisse.

**Ce qui reste : 47 clés sous 3.0, 102 endroits**, presque toutes du même
travers — une couleur de la palette de nuit employée telle quelle sur un fond de
jour. Elles sont relevées et plafonnées ; elles demandent un examen un par un.

### 🔴🔴 Une couleur EN LIGNE échappe à tout (4.44.0)

Les étiquettes des journaux — « ✗ Échec », « ✓ Connexion », « ⚠ MFA échoué » —
sortaient jusqu'à **1.43 de contraste** en mode clair. Leur couleur ne venait pas
de la feuille de style : elle était posée **en `style=` sur chaque étiquette**,
depuis une table JavaScript.

⚠⚠ **Un style en ligne bat TOUTE règle CSS**, y compris les reprises
`html.jour` juste à côté. Ces pastilles **ne pouvaient pas** suivre le thème.
⚠⚠ **Et aucun banc qui LIT le CSS ne pouvait les voir** — la couleur vit dans une
chaîne JavaScript. `banc-texte-sur-fond` et `banc-contraste-jour` étaient verts.

→ **La table porte désormais une CLASSE, pas une couleur** : la pastille dit ce
qu'elle **est** (`bon`, `att`, `err`, `info`), et le socle choisit la couleur
pour les deux modes. C'est aussi ce qui rend la correction définitive : la
prochaine palette suivra toute seule.

**45 couleurs échappent ainsi à la feuille de style, dans 20 fenêtres** (`style=`
ou table JS). Les 29 qui faisaient défaut sont rattachées à un jeton de leur
famille ; les autres sont recensées.

**État : 678 affichages au vert.** Reste 40 clés sous 3.0 (80 endroits),
plafonnées, à examiner une par une.
