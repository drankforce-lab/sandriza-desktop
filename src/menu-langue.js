'use strict';

/*
 * LE MENU DE L'ÉCRAN DE CONNEXION, DANS LA LANGUE CHOISIE
 * =============================================================================
 * Sa demande du 2026-09-11 : « dans le changement de langue de la page de
 * connexion tu dois aussi traduire les menus, c'est important ».
 *
 * ⚠⚠ POURQUOI CE CODE A QUITTÉ `main.js` : il y vivait, et sa première version
 * ne traduisait QUE le premier niveau. Sa capture le montrait sans équivoque —
 * « View », « Help », et dessous « Recharger », « Plein écran », « Réduire ».
 * J'avais fait descendre la traduction dans les sous-groupes (`sub`) en oubliant
 * les ENTRÉES (`items`), qui sont pourtant le cas courant.
 * ⚠ TANT QUE C'ÉTAIT ENFOUI DANS `main.js`, AUCUN BANC NE POUVAIT L'ÉPROUVER :
 * il aurait fallu lancer Electron, ouvrir un panneau, et lire une autre fenêtre.
 * Sorti ici, il s'éprouve en trois lignes — et `tools/banc-menu-langue.js` lui
 * donne maintenant un modèle à trois niveaux et vérifie qu'AUCUN intitulé ne
 * reste en français.
 *
 * ➡ **UN MORCEAU DE LOGIQUE QU'ON NE PEUT PAS ÉPROUVER SANS LANCER TOUTE
 *   L'APPLICATION FINIT PAR N'ÊTRE ÉPROUVÉ PAR PERSONNE.** Le sortir n'est pas
 *   du rangement : c'est ce qui rend le contrôle possible.
 *
 * ⚠ LA TRADUCTION SE FAIT ICI ET PAS DANS LE SITE. Le menu appartient au site,
 * il est français partout ailleurs, et la traduction intégrale est le chantier
 * qu'il a demandé de garder pour la fin. Traduire à la source changerait le menu
 * de TOUTE l'application pour une demande qui ne porte que sur un écran.
 */

/* Les entrées LIBRES (celles qui paraissent avant toute session) et les trois
   menus qui les portent. `tools/banc-menu-langue.js` confronte cette table aux
   entrées que `appbar.js` marque `libre` — dans les deux sens. */
const MENU_EN = {
  'Fichier': 'File',
  'Affichage': 'View',
  'Aide': 'Help',
  'Quitter': 'Quit',
  'Recharger': 'Reload',
  'Recharger (vider le cache)': 'Reload (clear cache)',
  'Plein écran': 'Full screen',
  'Zoom avant': 'Zoom in',
  'Zoom arrière': 'Zoom out',
  'Zoom normal': 'Reset zoom',
  'Réduire': 'Minimize',
  'Vérifier les mises à jour…': 'Check for updates…',
  'À propos': 'About',
};

/* ══ ET TOUT LE RESTE DU MENU — CELUI QU'ON NE VOIT QU'UNE FOIS CONNECTÉ ═════
 * ⚠⚠ SA DEMANDE DU 2026-09-13, mot pour mot : « si je change la langue dans
 * l'affichage le menu doit aussi être en anglais ». Jusqu'ici la traduction du
 * menu s'arrêtait à l'écran de CONNEXION — quatorze intitulés — et la note
 * ci-dessus le disait comme une limite assumée : « la traduction intégrale est
 * le chantier qu'il a demandé de garder pour la fin ». Le chantier a eu lieu
 * (98 fenêtres, 2026-09-13) ; la limite laissait une barre ENTIÈREMENT
 * FRANÇAISE au-dessus d'écrans anglais, ce qui est exactement ce qu'il a
 * montré en capture.
 *
 * ⚠ POURQUOI DEUX TABLES ET PAS UNE. `banc-menu-langue` confronte MENU_EN aux
 * entrées que le site marque `libre`, DANS LES DEUX SENS : une clé qui n'est
 * plus libre y est refusée comme ligne morte. Fondre les deux listes ferait
 * sauter ce contrôle-là pour tout le monde. Séparées, chacune garde sa source :
 * MENU_EN ↔ les entrées libres, MENU_APP_EN ↔ tous les autres intitulés
 * d'`appbar.js`. Le banc tient les deux, dans les deux sens.
 *
 * ⚠ LES TROIS INTITULÉS DE MENU (Fichier, Affichage, Aide) RESTENT DANS
 * MENU_EN : ils paraissent AVANT la session comme après, et une clé en double
 * finit toujours par diverger.
 *
 * ⚠ LA TRADUCTION RESTE DANS LA COQUILLE. Le site est en français-canadien de
 * bout en bout (c'est écrit dans son CLAUDE.md) ; c'est l'APPLICATION qui est
 * bilingue. Traduire à la source changerait la langue du site en production
 * pour un réglage qui n'appartient qu'au poste de travail.
 *
 * ⚠ UNE VALEUR IDENTIQUE À SA CLÉ EST UNE DÉCISION, PAS UN OUBLI : « Photos »,
 * « Marketing », « Collections », « Configuration » et « Catalogue » s'écrivent
 * pareil, et « ? » est un signe. Elles sont écrites en toutes lettres plutôt
 * qu'omises, sinon le banc ne saurait pas les distinguer d'un trou. */
const MENU_APP_EN = {
  '?': '?',
  'Abonnés de l’infolettre': 'Newsletter subscribers',
  'Accès utilisateurs': 'User access',
  'Agrandir le menu': 'Enlarge the menu',
  'Ancrer en haut': 'Dock at the top',
  'Ancrer à droite': 'Dock at the right',
  'Ancrer à gauche': 'Dock at the left',
  'Apparence': 'Appearance',
  'Archives': 'Archives',
  'Attributs produits': 'Product attributes',
  'Automatisations': 'Automations',
  'Avis produits': 'Product reviews',
  /* ⚠ << Status bar >> est le terme CONVENU dans les logiciels de bureau ; c est
     ainsi qu on la cherche. Le rappel de sa place est garde entre parentheses
     des deux cotes, parce que c est ce qui la distingue de la barre de menus. */
  'Barre d’état (bas de l’écran)': 'Status bar (bottom of the screen)',
  'Base de données': 'Database',
  'Boutique': 'Shop',
  'Cadre de l’administration (aperçu)': 'Administration frame (preview)',
  'Cadre natif : allumer / éteindre (redémarre)': 'Native frame: on / off (restarts)',
  'Campagnes et chaînes': 'Campaigns and sequences',
  'Cartes-cadeaux': 'Gift cards',
  'Catalogue': 'Catalogue',
  'Centre d’impression': 'Print centre',
  'Changer le dossier des exports…': 'Change the exports folder…',
  'Chat en ligne': 'Live chat',
  'Clients': 'Customers',
  'Clés API': 'API keys',
  'Collections': 'Collections',
  'Commandes': 'Orders',
  /* ⚠ PAS D ENTREE << Corbeille des commandes >> ICI. Elle a paru une heure au
     menu le 2026-09-14 ; il a demande de l en retirer et de joindre l ecran par
     un bouton de la fenetre Commandes. Le titre de la fenetre, lui, est traduit
     dans src/langue/corbeille.js — cette table-ci ne sert qu aux INTITULES DE
     LA BARRE, et une cle que plus aucun intitule ne demande est refusee par
     `banc-menu-langue`, a juste titre. */
  'Communications': 'Communications',
  'Comptabilité': 'Accounting',
  'Configuration': 'Configuration',
  'Configuration de la livraison': 'Shipping configuration',
  'Configuration des paiements': 'Payment configuration',
  'Configuration des retours': 'Returns configuration',
  'Coupons': 'Coupons',
  'Dossier des exports': 'Exports folder',
  'Déconnexion': 'Sign out',
  'Démarrer avec Windows': 'Start with Windows',
  'Dépenses': 'Expenses',
  'Expéditions': 'Shipments',
  'Factures': 'Invoices',
  'Fenêtre séparée (autre écran)': 'Separate window (other screen)',
  'Fidélisation': 'Loyalty',
  'Fiscalité et impôt': 'Taxation and income tax',
  'Fournisseurs': 'Suppliers',
  'Gabarits courriel': 'Email templates',
  'Gestion des taxes': 'Tax management',
  'Heures d’ouverture': 'Opening hours',
  'Icônes personnalisées': 'Custom icons',
  'Images des produits': 'Product images',
  'Import / Export du catalogue': 'Catalogue import / export',
  'Impression codes-barres': 'Barcode printing',
  'Imprimantes': 'Printers',
  'Incidents de sécurité': 'Security incidents',
  'Infolettre': 'Newsletter',
  'Inventaire': 'Inventory',
  'Jeu de couleurs': 'Colour scheme',
  'Journaux': 'Logs',
  'Lien comptable': 'Accounting link',
  'Liquidation / Vente finale': 'Clearance / Final sale',
  'Liste noire': 'Blacklist',
  'Livraison': 'Shipping',
  'Logos et marque': 'Logos and branding',
  'Logothèque': 'Logo library',
  'Marketing': 'Marketing',
  'Messagerie clients': 'Customer messages',
  'Mode lancement': 'Launch mode',
  'Modèles par vue': 'Templates by view',
  'Mon profil': 'My profile',
  'Navigation (menu boutique)': 'Navigation (shop menu)',
  'Notes des mises à jour…': 'Release notes…',
  'Nouveau fournisseur': 'New supplier',
  'Nouveau produit': 'New product',
  'Nouvelle collection': 'New collection',
  'Offres et annonces': 'Offers and announcements',
  'Outils de développement': 'Developer tools',
  'Page d’accueil': 'Home page',
  'Pages du site': 'Site pages',
  'Paiement & taxes': 'Payment & taxes',
  'Paiements Square': 'Square payments',
  'Personnel connecté': 'Staff signed in',
  'Photos': 'Photos',
  'Pied de page': 'Footer',
  'Position du menu': 'Menu position',
  'Produits en vente': 'Products on sale',
  'Publicité ciblée et statistiques': 'Targeted advertising and statistics',
  'Ramassages et rapport': 'Pickups and report',
  'Recherches sans résultat': 'Searches with no result',
  'Recommandations': 'Recommendations',
  'Remboursements': 'Refunds',
  'Retours': 'Returns',
  'Réduire le menu': 'Shrink the menu',
  /* ⚠ PAS D ENTREE << Reglages >> TOUTE SEULE. Elle a existe quelques heures le
     2026-09-14, le temps d un menu de premier niveau du meme nom ; il a demande
     le soir meme de le replier dans << Configuration >>, et une cle que plus
     aucun intitule ne demande est refusee par `banc-menu-langue` — a juste
     titre : une table qui garde ses morts ne dit plus ce qui est traduit.
     ⚠ Ce qui suit est un ECRAN, pas un menu. */
  'Réglages de sécurité': 'Security settings',
  'Réseaux sociaux': 'Social networks',
  'Sauvegarde': 'Backup',
  'Statistiques': 'Statistics',
  'Statistiques (Google Analytics)': 'Statistics (Google Analytics)',
  'Studio virtuel': 'Virtual studio',
  'Sécurité': 'Security',
  'Tableau de bord': 'Dashboard',
  'Taille par défaut': 'Default size',
  'Thème et apparence': 'Theme and appearance',
  'Thème sombre': 'Dark theme',
  'Transferts de stock': 'Stock transfers',
  'Transporteurs': 'Carriers',
  'Téléphonie': 'Telephony',
  'Veille des commandes (icône)': 'Order watch (icon)',
  'Vente au comptoir': 'Counter sale',
  'Verrous (fiches en cours)': 'Locks (records in progress)',
  /* ⚠ LES SIX JEUX DE COULEURS viennent d'une TABLE d'`appbar.js`
     (`THEMES_COULEUR`) et non d'un `label:` écrit à la main — c'est pour ça que
     le banc les relève séparément. Sans ça ils seraient restés français dans un
     sous-menu anglais, invisibles à tout relevé qui ne lirait que `label:`. */
  'Doré (défaut)': 'Gold (default)',
  'Océan': 'Ocean',
  'Violet': 'Purple',
  'Ardoise': 'Slate',
  'Graphite': 'Graphite',
  'Émeraude': 'Emerald',
};

/** Un intitulé, traduit si la table le connaît. Sinon il reste tel quel : une
 *  entrée ajoutée demain s'affichera dans sa langue d'origine plutôt que de
 *  disparaître. C'est le banc qui refuse ce silence-là, pas le code. */
const trMenu = (x, langue) => {
  if (langue !== 'en') return x;
  if (Object.prototype.hasOwnProperty.call(MENU_EN, x)) return MENU_EN[x];
  /* ⚠ MENU_EN D'ABORD, TOUJOURS : les trois intitulés de menu y vivent, et une
     clé lue dans deux tables doit avoir un ordre écrit plutôt que subi. */
  return Object.prototype.hasOwnProperty.call(MENU_APP_EN, x) ? MENU_APP_EN[x] : x;
};

/** L'intitulé D'ORIGINE d'un intitulé traduit — ou lui-même s'il n'en est pas un.
 *
 *  ⚠⚠ SANS ÇA, LE MENU DEVIENT MUET, et c'est une panne déjà vécue (5.28.0) :
 *  la barre affiche « Shop », le clic renvoie « Shop » à la coquille, qui
 *  cherche un menu nommé « Shop » dans un modèle qui ne connaît que
 *  « Boutique » — elle ne trouve rien, et ne dit rien. Le menu ne s'ouvre pas,
 *  et la cause ne ressemble pas à l'effet.
 *
 *  ⚠ LA TABLE INVERSE SE CONSTRUIT UNE FOIS, PAS À CHAQUE CLIC : un parcours
 *  linéaire de 127 entrées à chaque survol de menu se paierait à l'écran.
 *  ⚠ MENU_EN D'ABORD, comme dans `trMenu` — même ordre, même raison. */
const _INVERSE = (() => {
  const inv = Object.create(null);
  for (const t of [MENU_APP_EN, MENU_EN]) {
    for (const k of Object.keys(t)) {
      /* ⚠ UNE VALEUR IDENTIQUE À SA CLÉ (« Photos », « ? ») NE S'INSCRIT PAS :
         elle se retrouverait toute seule, et elle masquerait une vraie entrée
         portant ce nom. */
      if (t[k] !== k) inv[t[k]] = k;
    }
  }
  return inv;
})();
const origineMenu = (x) => {
  const s = String(x == null ? '' : x);
  return Object.prototype.hasOwnProperty.call(_INVERSE, s) ? _INVERSE[s] : s;
};

/** L'intitulé tel que LE PANNEAU le connaît, quel que soit celui qu'on reçoit.
 *
 *  ⚠⚠⚠ CE PONT EXISTE PARCE QUE JE L'AI CASSÉ (2026-09-13). En traduisant le
 *  panneau, sa page s'est mise à ne connaître que « Shop », « Accounting »,
 *  « View » — tandis que la barre du site continuait d'envoyer « Boutique »,
 *  « Comptabilité », « Affichage ». On demandait donc à une page qui ne connaît
 *  que l'anglais de montrer un menu français : elle ne trouvait rien, et ne
 *  disait rien. Ses mots : « le menu ne marche pas en anglais, quand on clique
 *  rien ne se passe », puis « certains menus genre File, Accounting, Shop, View
 *  et Help » — exactement ceux dont l'intitulé CHANGE en traduction. Les autres
 *  (Marketing, Configuration, Catalogue) marchaient, ce qui rendait la panne
 *  partielle, donc plus difficile à nommer.
 *
 *  ➡ **TRADUIRE UN CÔTÉ D'UNE CORRESPONDANCE, C'EST LA ROMPRE.**
 *
 *  ⚠ DEUX TEMPS, ET LES DEUX SONT NÉCESSAIRES : on ramène d'abord à l'ORIGINE
 *  (la barre du site envoie le nom d'origine ; le cadre natif, lui, envoie ce
 *  qu'il AFFICHE), puis on traduit vers la langue du panneau. Ça tient donc
 *  quelle que soit l'entrée, et c'est ce qui fait qu'on n'a pas à savoir QUI
 *  appelle.
 *
 *  ⚠ ET C'EST ICI, PAS DANS `main.js` : enfoui là-bas, ce raccord ne pouvait
 *  être éprouvé qu'en lançant Electron et en cliquant un menu — c'est-à-dire
 *  par personne. C'est la leçon écrite en tête de ce fichier, et la panne qu'on
 *  vient de payer en est la démonstration. `banc-menu-langue` l'essaie
 *  maintenant dans les deux langues et sur les deux formes d'entrée. */
const pourLePanneau = (label, langue) => trMenu(origineMenu(label), langue);

/** Un modèle de menu, traduit à TOUS ses niveaux.
 *  ⚠⚠ `items` ET `sub` : c'est l'oubli de `items` qui a produit un menu à
 *  moitié traduit en 5.28.0. Un parcours d'arbre qui ne suit qu'une branche sur
 *  deux n'est pas un parcours d'arbre. */
const trItems = (items, langue) => (items || []).map((it) => {
  if (!it || it.sep) return it;
  const n = { ...it, label: trMenu(it.label, langue) };
  if (it.items) n.items = trItems(it.items, langue);
  if (it.sub) n.sub = trItems(it.sub, langue);
  return n;
});

/* ══ LE BASCULE FR / EN, GREFFÉ DANS LE MENU AFFICHAGE ══════════════════════
   Sa demande du 2026-09-12 : « il faut mettre un toggle FR/EN disponible dans
   l'application dans un endroit discret ». Son choix parmi trois : le menu
   Affichage — là où l'on cherche un réglage, sans rien prendre à l'écran.

   ⚠⚠ LA COQUILLE LE GREFFE ELLE-MÊME, LE SITE N'EN SAIT RIEN. Le modèle de menu
   vient de `appbar.js` ; y ajouter l'entrée aurait demandé de toucher le dépôt
   du SITE et de déployer en production pour un réglage qui n'appartient qu'à
   l'application. La barre visible est peinte par la coquille à partir de ce
   modèle : on greffe donc en copie, à l'affichage.

   ⚠⚠⚠ ET CE CODE VIT ICI, PAS DANS `main.js` — c'est la leçon écrite en tête de
   ce fichier, payée en 5.28.0 : « un morceau de logique qu'on ne peut pas
   éprouver sans lancer toute l'application finit par n'être éprouvé par
   personne ». La langue courante arrive donc en ARGUMENT plutôt que d'être lue
   ici : la fonction devient pure, et `banc-menu-langue` l'essaie en trois
   lignes, dans les deux langues et sur un menu absent. */
const LANGUES = [
  { cle: 'fr', label: 'Français' },
  { cle: 'en', label: 'English' },
];

/** Le modèle, avec « Langue / Language » ajouté au menu Affichage.
 *  ⚠ LA COCHE SE CALCULE À CHAQUE APPEL, jamais une fois pour toutes : le
 *  modèle est gardé en cache entre deux ouvertures du panneau, et une coche
 *  figée montrerait « Français » coché après être passé en anglais — un défaut
 *  qu'on ne voit qu'en changeant de langue APRÈS avoir ouvert un menu.
 *  ⚠ Le menu se reconnaît par son intitulé d'ORIGINE *ou* TRADUIT : l'écran de
 *  connexion affiche « View ». Même filet que `menu:panneau`.
 *  ⚠ SI AUCUN MENU AFFICHAGE N'EXISTE (modèle pas encore arrivé), on rend le
 *  modèle TEL QUEL — on n'invente pas un menu. Une entrée seule dans une barre
 *  vide serait pire que pas d'entrée du tout. */
/* ⚠⚠ LA LANGUE VIT DANS « AFFICHAGE », ET C'EST SA DÉCISION (2026-09-14, le
   soir) : « la langue doit rester dans le menu Affichage, et non
   Configuration ».
   Elle y était depuis le 2026-09-12. Elle a suivi les réglages du poste quand
   ils ont quitté « Affichage » le matin — d'abord dans un menu « Réglages »
   neuf, puis dans « Configuration » quand il a demandé de replier l'un dans
   l'autre. Il la ramène, et il a raison sur les deux plans :
   ⚠ LE SENS : changer de langue, ce n'est pas configurer la boutique, c'est
   changer CE QU'ON VOIT. C'est exactement la définition qu'il a donnée
   d'« Affichage » le matin même — « ce qui change la vue de l'instant ».
   ⚠ LA VISIBILITÉ, et c'est le plus fort : « Configuration » n'a AUCUNE entrée
   `libre`, donc le site le retire du modèle tant que personne n'est connecté.
   La langue s'y retrouvait enfermée derrière la session — sur l'écran même dont
   il avait demandé la traduction le 2026-09-11. Il avait fallu lui ajouter un
   repli sur « Affichage » pour réparer ça. « Affichage » étant là AVANT comme
   APRÈS, la cible unique suffit : le repli disparaît avec le problème qu'il
   rattrapait.
   ➡ Une commande qu'on range ailleurs hérite des conditions de VISIBILITÉ de
   son nouveau menu. C'est la leçon, et elle a coûté un aller-retour. */
const CIBLES_LANGUE = ['Affichage'];

/* Les intitulés sous lesquels un menu peut se présenter : son nom d'origine, et
   sa traduction s'il en a une. `MENU_EN` traduit ce qui paraît SANS session,
   `MENU_APP_EN` ce qui ne paraît qu'une fois connecté — « Configuration » vit
   dans la seconde, « Affichage » dans la première. Ne consulter qu'une des deux
   laissait la comparaison sur `undefined` : la greffe ne trouvait rien sur une
   barre déjà en anglais, et le retour au français devenait inatteignable. */
const _nomsMenu = (fr) => [fr, MENU_APP_EN[fr], MENU_EN[fr]].filter(Boolean);

const menusAvecLangue = (menus, langue) => {
  const cour = (String(langue || '') === 'en') ? 'en' : 'fr';
  const liste = menus || [];
  const porte = (noms) => liste.some((m) =>
    m && Array.isArray(m.items) && noms.indexOf(String(m.label || '')) >= 0);

  let cible = null;
  for (let i = 0; i < CIBLES_LANGUE.length && !cible; i += 1) {
    const noms = _nomsMenu(CIBLES_LANGUE[i]);
    if (porte(noms)) cible = noms;
  }
  if (!cible) return liste;

  let greffe = false;
  return liste.map((m) => {
    if (greffe || !m || !Array.isArray(m.items)) return m;
    if (cible.indexOf(String(m.label || '')) < 0) return m;
    greffe = true;
    return { ...m, items: m.items.concat([
      { sep: true },
      { label: 'Langue / Language', sub: LANGUES.map((l) => ({
        label: l.label, app: 'langue-' + l.cle, coche: cour === l.cle,
      })) },
    ]) };
  });
};

module.exports = {
  MENU_EN, MENU_APP_EN, trMenu, origineMenu, pourLePanneau, trItems,
  menusAvecLangue, LANGUES,
};
