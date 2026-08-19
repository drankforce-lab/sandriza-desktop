# Les polices embarquees

## Pourquoi un fichier ici, et du base64 dans `socle.js`

⚠⚠ **Un `@font-face` avec un chemin ne marchera JAMAIS dans ces fenetres.**
Les 91 fenetres natives sont chargees par
`win.loadURL("data:text/html;charset=utf-8," + ...)` (voir `ouvrirNative`). Un
document `data:` a une **origine opaque** : il n'y a pas d'URL de base, donc
`url("polices/x.woff2")` ne resout rien, et une adresse `file://` depuis un
document `data:` est **bloquee** par Chromium. Les fenetres sont en plus en
`sandbox: true`.

La seule voie qui marche : **la police inlinee en base64 dans le CSS**,
`src: url(data:font/woff2;base64,...)`. C'est ce que fait `CSS_SOCLE`.

⚠ **L'application tourne HORS LIGNE.** Pas de Google Fonts, pas de CDN : une
police servie par un tiers ne serait pas la au lancement suivant sans reseau, et
le titre retomberait sur un repli que personne n'aurait regarde.

⚠ **Le cout, qu'il faut connaitre** : la chaine est recopiee dans le CSS de
**chaque** fenetre ouverte. On prend donc le sous-ensemble `latin` et rien de
plus. `police-en-base64.js` previent au-dela de 80 Ko encodes.

## Le fichier present

`patrick-hand.woff2` — **Patrick Hand**, sous-ensemble *latin* de Google Fonts
(il couvre U+00C0-00FF, donc tous les accents francais, et U+2000-206F, donc
l apostrophe typographique et les tirets). 24 Ko, 31 Ko encodes.
**Licence : SIL Open Font License 1.1** — redistribuable dans une application.

Choisie le 2026-08-19, en QUATRIEME passe. Les quatre demandes du meme jour :

1. **Segoe UI Variable Display** (3.53.0), sur << plus visible et moderne >>.
   Ecartee : trop neutre.
2. **Ironclad** — display geometrique Art deco, capitales seulement. Commerciale
   et absente du poste. League Spartan avait ete posee a sa place, non livree.
3. **Verandah Reverie**, qu il a installee. Sa version est la DEMO, et elle
   remplace chacun de ses chiffres par un encart publicitaire. Livre a la place :
   Pinyon Script (3.59.0).
4. **Sweet Cucumber Mocktail**, qu il a installee aussi. Elle FONCTIONNE — les
   chiffres passent, les accents aussi, aucun tatouage : verifie. Mais Misti s
   Fonts la donne gratuite pour l usage PERSONNEL seulement.

Patrick Hand est la plus proche de Sweet Cucumber Mocktail des six manuscrites
libres comparees sur de vrais titres : meme allure droite, memes proportions,
meme nettete. C est une **ressemblance**, pas une copie.

⚠ **Elle se lit des 1.18rem** — c est un feutre, pas une anglaise. La regle
`.tete h1` est donc a **1.3rem** et le bandeau retrouve presque sa hauteur
d origine : Pinyon Script exigeait 1.5rem pour la meme lisibilite.

## ⚠⚠ Sweet Cucumber Mocktail : pourquoi elle n'est PAS ici

Elle MARCHE, contrairement a Verandah Reverie : les chiffres se composent, les
accents sont tous la, le fichier ne cache aucun encart. Verifie avant de le dire.
Son nom de famille interne est propre (`Sweet Cucumber Mocktail`) et la table
`name` ne porte aucun champ de licence.

**Mais l'absence de champ de licence n'est pas une permission.** Misti's Fonts
ecrit, sur https://mistifonts.com/sweet-cucumber-mocktail/ :

> This font is free for personal use. If you make money from using this font, you
> must purchase a license.

Sandriza est une entreprise. Une licence commerciale d'une seule police se prend
chez Creative Fabrica, ou directement aupres de la dessinatrice. **S'il la prend,
poser le `.ttf` ici et relancer l'outil suffit** — il convertira, et le controle
refusera le fichier s'il n'est pas un vrai woff2.

⚠ **LA LECON, ET ELLE EST DIFFERENTE DE CELLE DE VERANDAH REVERIE** : une police
peut etre techniquement irreprochable et juridiquement fermee. Ne pas conclure
d'un rendu propre qu'elle est utilisable — **il faut aller lire les termes du
site**, la table `name` ne les porte pas toujours.

## ⚠⚠ Verandah Reverie : pourquoi elle n'est PAS ici

Le fichier du poste (`VerandahReverie_PERSONAL_USE_ONLY.otf`) est la version de
**demonstration**, et elle ne se contente pas d'etre bridee juridiquement :
**elle remplace chacun de ses chiffres par un encart publicitaire**.
« Commande 1042 » se compose en « Commande » suivi de quatre reclames. Les titres
de fenetre sont pleins de chiffres — numero de commande, heure, montant.

Et la licence l'interdit deux fois : le `READ_BEFORE_ANY_USE.txt` du zip, et le
champ de licence **inscrit dans la police elle-meme** (table `name`, id 13) :
« Please visit www.mansgreback.com to obtain a commercial license. »

S'il achete la licence (https://www.mansgreback.com/product/verandah-reverie),
la version complete n'a pas le tatouage : poser le fichier ici et relancer
l'outil, c'est tout.

⚠ **La lecon vaut pour toute police gratuite** : une version « personal use »
peut etre **sabotee expres**, et le sabotage se cache la ou on ne regarde pas.
**Composer une ligne AVEC CHIFFRES, accents et ponctuation avant de croire qu'une
police convient.**

## ⚠ Lire le VRAI nom de famille avant de juger

Chrome ne connait que le nom **interne** d'une police, pas son nom de fichier. Ne
trouvant pas « Verandah Reverie » il est retombe **silencieusement** sur
`cursive` : j'ai failli juger une police en regardant Comic Sans. Le vrai nom
etait `Verandah Reverie PERSONAL USE PERSONAL USE ONLY`.

Un lecteur de table `name` (Famille, Nom complet, Nom PostScript, **Licence**)
tient en 40 lignes de Node. A refaire pour toute police fournie.

## Pour la remplacer

1. poser le nouveau `.woff2` ici (sous-ensemble *latin* suffit) ;
2. `node tools/police-en-base64.js` — il reecrit le bloc `@font-face` de
   `src/fenetres/socle.js` entre ses deux marqueurs, et **refuse** un fichier qui
   n'est pas un vrai woff2 (signature `wOF2`) ;
3. `node tools/verifier-fenetres.js` — il refuse un `@font-face` absent, tronque
   (< 4096 caracteres) ou qui ne decode pas en woff2.
4. ⚠ **Composer une ligne AVEC CHIFFRES, accents et ponctuation** avant de croire
   que la police convient. C'est ce qui a demasque la demo de Verandah Reverie.
5. ⚠ **Aller lire les termes de licence du SITE de la fonderie.** La table `name`
   ne les porte pas toujours : celle de Sweet Cucumber Mocktail est muette, et sa
   licence gratuite exclut pourtant l'usage professionnel.
6. ⚠ **Regarder le rendu a la taille reelle du bandeau**, sur les deux fonds, et
   **remesurer** : la taille de `.tete h1` depend de la POLICE, pas d'un reglage a
   recopier. Une anglaise (Pinyon Script) exigeait 1.5rem ; une manuscrite au
   feutre (Patrick Hand) se lit des 1.18rem et tient a 1.3rem.

⚠ **Si la nouvelle police change de NATURE, revoir `.tete h1`** : `letter-spacing`
et `text-transform` y sont poses explicitement a `0`/`none` parce qu'une anglaise
se casse si on les touche — ses liaisons vivent dans les minuscules. Une
geometrique en capitales espacees voudrait l'inverse. C'est un choix a REFAIRE,
pas un reglage a heriter.

⚠ **Ne pas recopier la regle dans les 91 fenetres.** Elle vit dans `CSS_SOCLE`,
une seule fois, et `CSS_JOUR` est appende APRES le CSS local — donc il commande.
C'est la lecon deja payee avec les pictogrammes gris et les 86 `.tete h1`.

⚠⚠ **Les commentaires de `socle.js` sont en style ASCII, sans apostrophes ni
accents graves.** Son CSS vit dans un **litteral de gabarit** : un seul accent
grave dans un commentaire referme le gabarit et les 91 fenetres tombent d'un
coup. Ca m'est arrive DEUX fois en posant ce bloc.
