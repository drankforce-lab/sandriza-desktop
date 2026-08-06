# SANDRIZA Admin — coquille de bureau

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
