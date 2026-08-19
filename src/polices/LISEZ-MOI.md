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

`pinyon-script.woff2` — **Pinyon Script**, sous-ensemble *latin* de Google Fonts
(il couvre U+00C0-00FF, donc tous les accents francais, et U+2000-206F, donc
l'apostrophe typographique et les tirets). 39 Ko, 51 Ko encodes.
**Licence : SIL Open Font License 1.1** — redistribuable dans une application.

Choisie le 2026-08-19. Son histoire, en trois temps, parce qu'elle explique la
regle `.tete h1` :

1. **Segoe UI Variable Display** (3.53.0), sur sa demande « plus visible et
   moderne ». Ecartee : trop neutre.
2. **Ironclad** — sa demande suivante. Display geometrique Art deco, capitales
   seulement, **commerciale et absente du poste**. League Spartan (ATF Spartan,
   1939) avait ete posee a sa place, en capitales espacees. Non livree : il a
   change d'avis avant la publication.
3. **Verandah Reverie**, qu'il a installee lui-meme. C'est de la que vient le
   script — mais voir juste en dessous.

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
4. ⚠ **Regarder le rendu a la taille reelle du bandeau**, sur les deux fonds. La
   taille de `.tete h1` a ete MESUREE, pas devinee : 1.5rem est le point ou un
   script se lit sans que les hampes se coupent ni que la barre enfle.

⚠ **Si la nouvelle police n'est pas un script**, revoir `.tete h1` : `letter-spacing`
et `text-transform` y sont poses explicitement a `0`/`none` **parce qu'un script
se casse si on les touche**. Une geometrique en capitales espacees voudrait
l'inverse.

⚠ **Ne pas recopier la regle dans les 91 fenetres.** Elle vit dans `CSS_SOCLE`,
une seule fois, et `CSS_JOUR` est appende APRES le CSS local — donc il commande.
C'est la lecon deja payee avec les pictogrammes gris et les 86 `.tete h1`.

⚠⚠ **Les commentaires de `socle.js` sont en style ASCII, sans apostrophes ni
accents graves.** Son CSS vit dans un **litteral de gabarit** : un seul accent
grave dans un commentaire referme le gabarit et les 91 fenetres tombent d'un
coup. Ca m'est arrive DEUX fois en posant ce bloc.
