'use strict';

/*
 * LE MODÈLE DES PERMISSIONS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CES TEXTES NE SONT DANS AUCUN FICHIER DE FENÊTRE. Ils vivent dans le SITE
 * (`assets/js/staff.js`, `PERMISSION_DEFS` et `ROLES`) et arrivent par le pont,
 * déjà écrits en français. C'est la classe de défaut qui s'est payée cinq fois
 * le 2026-09-13 : un texte qui arrive AVEC la donnée n'est dans aucun relevé de
 * source, et aucun banc qui lit `src/fenetres/` ne peut le voir.
 *
 * ⚠⚠ CE QUI EST TRADUIT ET CE QUI NE L'EST PAS. Les CLÉS — `products:edit`,
 * `comptable` — partent dans la base et n'y touchent jamais. Seuls le LIBELLÉ
 * et la DESCRIPTION se lisent, et ce sont eux seuls qui passent ici. Voir la
 * règle du couple code + texte dans `_traduireLibelles` (src/main.js).
 *
 * ⚠⚠⚠ LA DESCRIPTION EST LA PARTIE QUI COMPTE LE PLUS, et c'est contre-intuitif.
 * Sa demande : « avec infobulle pour la description des différentes sécurités ».
 * Un nom de module ne prévient de rien — « Clés API » est neutre ; « changer une
 * clé change où l'argent est encaissé » prévient. Laisser ces phrases en
 * français sur une page anglaise rendrait l'infobulle inutile À LA PERSONNE À
 * QUI ELLE EST DESTINÉE.
 *
 * ⚠ LE GRAS EST CONSERVÉ des deux côtés : la fenêtre ne rend leurs chevrons
 * qu'aux balises de gras, tout le reste est échappé. Un gras qui disparaîtrait
 * en anglais ferait perdre l'accent de la phrase — c'est toujours la partie qui
 * coûte cher qui est en gras.
 *
 * ⚠ TRADUIT LE 2026-09-13 avec la refonte #103. Si un module est ajouté au
 * modèle sans passer ici, il s'affichera en français : `banc-langue-libelles`
 * ne le réclame pas encore (son relevé ne reconnaît pas la forme `desc:`) —
 * c'est une dette connue, écrite ici pour qu'elle ne soit pas une surprise.
 */

const PERMISSIONS_EN = {
  /* ══ LES GROUPES DE LA MATRICE ═══════════════════════════════════════════ */
  '🛍 Boutique': '🛍 Shop',
  '👥 Gestion': '👥 Management',
  '📣 Marketing': '📣 Marketing',
  '💰 Comptabilité': '💰 Accounting',
  '⚙ Configuration': '⚙ Configuration',
  '🔐 Système': '🔐 System',

  /* ══ LES ACTIONS ═════════════════════════════════════════════════════════ */
  'Voir': 'View',
  'Ajouter': 'Add',
  'Modifier': 'Edit',
  'Supprimer': 'Delete',

  /* ══ LES MODULES — LIBELLÉ PUIS DESCRIPTION ══════════════════════════════ */
  'Tableau de bord': 'Dashboard',
  'La page d’accueil de l’administration : chiffre du jour, commandes récentes, alertes de stock. Ne donne accès à rien d’autre — c’est le minimum pour que quelqu’un puisse entrer et voir où en est la boutique.':
    'The administration home page: today’s figure, recent orders, stock alerts. Gives access to nothing else — it is the minimum for someone to get in and see where the shop stands.',

  'Produits en vente': 'Products for sale',
  'La fiche des articles : nom, prix, description, photos, catégorie. <b>Modifier</b> change le prix affiché au client. <b>Supprimer</b> retire l’article de la boutique.':
    'The item record: name, price, description, photos, category. <b>Edit</b> changes the price shown to the customer. <b>Delete</b> removes the item from the shop.',

  'Avis produits': 'Product reviews',
  'Les avis laissés par la clientèle. <b>Modifier</b> permet de publier ou de masquer un avis ; <b>Supprimer</b> l’efface définitivement.':
    'The reviews left by customers. <b>Edit</b> publishes or hides a review; <b>Delete</b> erases it for good.',

  'Inventaire': 'Inventory',
  'Les quantités en stock, par taille et par couleur, et les entrepôts. C’est ce qui décide si un article peut être vendu — une quantité fausse fait vendre ce qui n’existe plus.':
    'Stock quantities, by size and colour, and the warehouses. This is what decides whether an item can be sold — a wrong quantity sells what no longer exists.',

  'Photos': 'Photos',
  'La photothèque et le Studio virtuel. ⚠ Les traitements du Studio (détourage, mannequin) <b>coûtent un crédit par photo</b> : ce droit engage de l’argent.':
    'The photo library and the Virtual Studio. ⚠ Studio processing (cut-out, model) <b>costs one credit per photo</b>: this permission commits money.',

  'Collections': 'Collections',
  'Les regroupements d’articles mis en avant dans la boutique (nouveautés, saison, thème).':
    'The item groupings featured in the shop (new arrivals, season, theme).',

  'Commandes': 'Orders',
  'Les commandes reçues : contenu, montants, coordonnées du client, changement de statut. <b>Voir</b> donne accès à des renseignements personnels — adresse, téléphone, historique d’achat.':
    'The orders received: contents, amounts, customer details, status changes. <b>View</b> gives access to personal information — address, phone, purchase history.',

  'Expéditions': 'Shipments',
  'La préparation, les étiquettes de transport et les ramassages. ⚠ <b>Acheter une étiquette engage des frais réels</b> chez le transporteur.':
    'Preparation, shipping labels and pickups. ⚠ <b>Buying a label commits real charges</b> with the carrier.',

  'Liquidation / Vente finale': 'Clearance / Final sale',
  'Le passage d’articles en vente finale. ⚠ Un article en vente finale <b>n’est plus remboursable</b> : la décision se répercute sur les droits du client.':
    'Moving items to final sale. ⚠ An item on final sale <b>can no longer be refunded</b>: the decision carries over to the customer’s rights.',

  'Clients': 'Customers',
  'Les comptes de la clientèle : coordonnées, adresses, historique. ⚠ <b>Renseignements personnels</b> — la Loi 25 s’applique. <b>Supprimer</b> efface un compte et son histoire.':
    'Customer accounts: contact details, addresses, history. ⚠ <b>Personal information</b> — Law 25 applies. <b>Delete</b> erases an account and its history.',

  'Liste noire': 'Blocklist',
  'Les adresses bloquées à la commande. Y inscrire quelqu’un l’empêche d’acheter.':
    'The addresses blocked from ordering. Adding someone stops them from buying.',

  'Fournisseurs': 'Suppliers',
  'Le carnet des fournisseurs : personne-ressource, courriel, adresse, conditions.':
    'The supplier book: contact person, email, address, terms.',

  'Pages du site': 'Site pages',
  'Le contenu public : FAQ, contact, guide des tailles, politiques. ⚠ Les <b>politiques</b> (retours, vie privée) sont des engagements juridiques envers la clientèle.':
    'The public content: FAQ, contact, size guide, policies. ⚠ The <b>policies</b> (returns, privacy) are legal commitments to customers.',

  'Gestion des retours': 'Returns management',
  'Les demandes de retour : accepter, refuser, suivre le colis de retour. Ne permet pas de rembourser — c’est le module <b>Remboursements</b> qui sort l’argent.':
    'Return requests: accept, refuse, track the returning parcel. Does not allow refunding — the <b>Refunds</b> module is what releases the money.',

  'Messagerie clients': 'Customer messages',
  'Les messages reçus par le formulaire de contact et le suivi des demandes.':
    'The messages received through the contact form, and the follow-up of requests.',

  'Promotions et coupons': 'Promotions and coupons',
  'Les rabais, codes promo et bannières. ⚠ <b>Un coupon mal réglé coûte une marge sur chaque commande</b>, et il s’applique immédiatement.':
    'Discounts, promo codes and banners. ⚠ <b>A badly set coupon costs margin on every order</b>, and it applies immediately.',

  'Cartes-cadeaux': 'Gift cards',
  'L’émission et le suivi des cartes-cadeaux. ⚠ <b>Créer une carte crée de l’argent</b> utilisable dans la boutique.':
    'Issuing and tracking gift cards. ⚠ <b>Creating a card creates money</b> that can be spent in the shop.',

  'Infolettre': 'Newsletter',
  'Les abonnés, les campagnes et les chaînes automatisées. ⚠ <b>Un envoi part pour de vrai et ne se rappelle pas</b> — il atteint toute la liste.':
    'Subscribers, campaigns and automated sequences. ⚠ <b>A send goes out for real and cannot be recalled</b> — it reaches the whole list.',

  'Chat en ligne': 'Live chat',
  'Les conversations en direct avec les visiteurs et le réglage du widget.':
    'Live conversations with visitors, and the widget settings.',

  'Recommandations': 'Recommendations',
  'Les suggestions d’articles affichées au client (« vous aimerez aussi »).':
    'The item suggestions shown to the customer (“you may also like”).',

  'Réseaux sociaux': 'Social networks',
  'Les publications vers les réseaux. ⚠ <b>Une publication est publique dès qu’elle part</b>, au nom de la boutique.':
    'Posts to the networks. ⚠ <b>A post is public the moment it leaves</b>, in the shop’s name.',

  'Publicité ciblée et statistiques': 'Targeted advertising and statistics',
  'Les chiffres de fréquentation et les étiquettes publicitaires. ⚠ Modifier touche au <b>suivi des visiteurs</b> — un domaine encadré par la loi.':
    'Traffic figures and advertising tags. ⚠ Editing touches <b>visitor tracking</b> — an area governed by law.',

  'Fidélisation': 'Loyalty',
  'Le programme de points et les récompenses. ⚠ <b>Les points valent de l’argent</b> à l’encaissement.':
    'The points programme and rewards. ⚠ <b>Points are worth money</b> at checkout.',

  'Facturation': 'Billing',
  'Les factures et les états de compte. ⚠ Une facture est une <b>pièce comptable</b> : la modifier après émission se justifie devant un vérificateur.':
    'Invoices and account statements. ⚠ An invoice is an <b>accounting record</b>: changing it after issue must be justified to an auditor.',

  'Paiements Square': 'Square payments',
  'Les encaissements et le terminal. <b>Voir</b> montre les montants reçus ; <b>Modifier</b> touche au réglage de l’encaissement.':
    'Takings and the terminal. <b>View</b> shows the amounts received; <b>Edit</b> touches the takings settings.',

  'Remboursements': 'Refunds',
  '⚠⚠ <b>Ce droit rend de l’argent à un client, et un remboursement ne s’annule pas d’un clic.</b> <b>Ajouter</b> = émettre un remboursement. À n’accorder qu’à qui a le droit de décider d’un geste commercial.':
    '⚠⚠ <b>This permission gives money back to a customer, and a refund cannot be undone with one click.</b> <b>Add</b> = issue a refund. Grant it only to someone allowed to decide on a goodwill gesture.',

  'Fiscalité et impôt': 'Tax and income tax',
  'Les rapports de taxes (TPS/TVQ), les revenus et les documents fiscaux de fin d’année.':
    'Sales tax reports (GST/QST), revenue, and the year-end tax documents.',

  'Dépenses': 'Expenses',
  'La saisie des dépenses déductibles et de leurs reçus. Ce qui est inscrit ici se retrouve dans la déclaration.':
    'Entering deductible expenses and their receipts. What is recorded here ends up in the tax return.',

  'Conciliation bancaire': 'Bank reconciliation',
  '⚠⚠ Le rapprochement des encaissements avec le compte bancaire. <b>Une conciliation verrouillée ne se rouvre jamais.</b> Réservé au super-administrateur.':
    '⚠⚠ Matching the takings with the bank account. <b>A locked reconciliation never reopens.</b> Reserved for the super administrator.',

  'Sauvegardes et lien comptable': 'Backups and accountant link',
  '⚠⚠⚠ Les sauvegardes et leur RESTAURATION. <b>Restaurer remplace les données actuelles par celles d’un autre jour</b> — tout ce qui a été fait depuis disparaît. Réservé au super-administrateur.':
    '⚠⚠⚠ Backups and their RESTORATION. <b>Restoring replaces today’s data with another day’s</b> — everything done since disappears. Reserved for the super administrator.',

  'Apparence et contenu de la boutique': 'Shop appearance and content',
  'Le thème et les couleurs, la page d’accueil, le logo et la marque, les icônes, le menu de la boutique, le pied de page, les heures d’ouverture, les modèles d’affichage et la logothèque. <b>Tout se voit, rien ne coûte</b> — c’est la partie de la configuration qu’on peut confier sans crainte.':
    'The theme and colours, the home page, the logo and brand, the icons, the shop menu, the footer, the opening hours, the display templates and the logo library. <b>Everything shows, nothing costs</b> — this is the part of the configuration that can be handed over without worry.',

  'Clés de paiement et taxes': 'Payment keys and taxes',
  '⚠⚠⚠ <b>Les clés d’interface (Square, Stripe, Resend…) et les taux de taxe.</b> Changer une clé change <b>où l’argent est encaissé</b> ; changer un taux change ce que le client paie et ce qu’on remet au gouvernement. À réserver à qui répond de l’argent de la boutique.':
    '⚠⚠⚠ <b>The interface keys (Square, Stripe, Resend…) and the tax rates.</b> Changing a key changes <b>where the money lands</b>; changing a rate changes what the customer pays and what is remitted to the government. Reserve it for whoever answers for the shop’s money.',

  'Livraison, retours et transporteurs': 'Shipping, returns and carriers',
  'Les frais et zones de livraison, les pays desservis, les règles de retour, les comptes de transporteur et les imprimantes d’étiquettes. ⚠ Les frais réglés ici sont <b>facturés au client à chaque commande</b>.':
    'Shipping fees and zones, the countries served, the return rules, the carrier accounts and the label printers. ⚠ The fees set here are <b>charged to the customer on every order</b>.',

  'Communications et automatisations': 'Communications and automations',
  'La téléphonie, les gabarits de courriel, les automatisations et le branchement des statistiques. ⚠ Une automatisation mal réglée <b>envoie toute seule</b>, sans que personne relise.':
    'Telephony, email templates, automations and the statistics hook-up. ⚠ A badly set automation <b>sends on its own</b>, with no one reading it over.',

  'Base de données et mode lancement': 'Database and launch mode',
  '⚠⚠⚠ <b>La base de données et l’ouverture de la boutique au public.</b> Restaurer, migrer ou basculer le mode lancement touche <b>toute la boutique d’un coup</b>. Réservé au super-administrateur.':
    '⚠⚠⚠ <b>The database and opening the shop to the public.</b> Restoring, migrating or switching the launch mode touches <b>the whole shop at once</b>. Reserved for the super administrator.',

  'Incidents de sécurité (Loi 25)': 'Security incidents (Law 25)',
  'Le registre des incidents de confidentialité exigé par la Loi 25. ⚠ C’est un <b>registre légal</b> : il se tient, il ne se nettoie pas.':
    'The register of privacy incidents required by Law 25. ⚠ It is a <b>legal register</b>: it is kept, not tidied up.',

  'Personnel et journaux': 'Staff and logs',
  '⚠⚠⚠ <b>Ce droit donne le droit de donner des droits.</b> Qui peut créer un accès peut s’en créer un plus puissant, ou retirer celui des autres. C’est la clé de toutes les autres — à n’accorder qu’à qui dirige.':
    '⚠⚠⚠ <b>This permission grants the right to grant rights.</b> Whoever can create an access can create a stronger one for themselves, or remove someone else’s. It is the key to all the others — grant it only to whoever leads.',

  /* ══ LES RÔLES — LIBELLÉ PUIS DESCRIPTION ════════════════════════════════ */
  'Super-administrateur': 'Super administrator',
  'Tout, sans exception — y compris les clés de paiement, la base de données, la conciliation bancaire, les sauvegardes et la gestion des accès. <b>Il en faut au moins un actif en tout temps</b> : le serveur refuse la dernière suppression.':
    'Everything, without exception — including the payment keys, the database, the bank reconciliation, the backups and access management. <b>At least one must be active at all times</b>: the server refuses the last deletion.',

  'Administrateur': 'Administrator',
  'Dirige la boutique au quotidien : produits, commandes, clients, marketing, comptabilité courante, apparence du site. <b>Ne touche pas</b> aux accès du personnel, à la conciliation bancaire, aux sauvegardes, aux clés de paiement ni à la base de données.':
    'Runs the shop day to day: products, orders, customers, marketing, everyday accounting, site appearance. <b>Does not touch</b> staff access, bank reconciliation, backups, payment keys or the database.',

  'Gérant de boutique': 'Shop manager',
  'Mène les opérations : catalogue, inventaire, commandes, expéditions, clientèle, retours, promotions et apparence du site. <b>Ne voit ni la comptabilité, ni les accès, ni aucun réglage d’argent.</b> Le rôle à donner à qui fait tourner la boutique sans en tenir les comptes.':
    'Leads operations: catalogue, inventory, orders, shipments, customers, returns, promotions and site appearance. <b>Sees neither the accounting, nor the accesses, nor any money setting.</b> The role for whoever runs the shop without keeping its books.',

  'Comptable': 'Accountant',
  'Tient les livres : facturation, dépenses, taxes et impôt, encaissements, remboursements. <b>Voit les commandes sans pouvoir les modifier</b> ; ne touche ni au catalogue, ni aux clients, ni aux réglages. La conciliation bancaire reste au super-administrateur.':
    'Keeps the books: billing, expenses, sales tax and income tax, takings, refunds. <b>Sees orders without being able to change them</b>; touches neither the catalogue, nor the customers, nor the settings. Bank reconciliation stays with the super administrator.',

  'Commis à la livraison': 'Shipping clerk',
  'Expédie ce qui est prêt : étiquettes de transport, ramassages, suivi, retours reçus. <b>Voit les commandes et le stock sans pouvoir changer un prix.</b> ⚠ Acheter une étiquette engage des frais réels chez le transporteur.':
    'Ships what is ready: shipping labels, pickups, tracking, returns received. <b>Sees the orders and the stock without being able to change a price.</b> ⚠ Buying a label commits real charges with the carrier.',

  'Commis à la préparation de commandes': 'Order preparation clerk',
  'Prépare et emballe : liste de cueillette, bordereau, passage d’une commande à « prête ». <b>Ne voit ni les montants encaissés, ni les clients hors de la commande en cours</b>, et ne peut rien expédier — c’est le commis à la livraison qui achète l’étiquette.':
    'Picks and packs: picking list, packing slip, moving an order to “ready”. <b>Sees neither the amounts taken, nor customers outside the order in hand</b>, and can ship nothing — the shipping clerk buys the label.',

  'Commis à l’inventaire': 'Inventory clerk',
  'Compte, range et réapprovisionne : quantités, entrepôts, transferts, articles endommagés, étiquettes code-barres, carnet des fournisseurs. <b>Ne vend rien et ne voit aucune commande.</b>':
    'Counts, stores and restocks: quantities, warehouses, transfers, damaged items, barcode labels, supplier book. <b>Sells nothing and sees no order.</b>',

  'Service à la clientèle': 'Customer service',
  'Répond à la clientèle : messagerie, chat en direct, retours, mise à jour d’une fiche client, suivi d’une commande. <b>Peut accepter un retour mais PAS rembourser</b> — l’argent reste une décision à part.':
    'Answers customers: messages, live chat, returns, updating a customer record, tracking an order. <b>Can accept a return but NOT refund</b> — money stays a separate decision.',

  'Marketing': 'Marketing',
  'Fait connaître la boutique : promotions, cartes-cadeaux, infolettre, réseaux sociaux, recommandations, fidélisation, pages du site. ⚠ <b>Un envoi d’infolettre et une publication sociale partent pour de vrai</b> et ne se rappellent pas.':
    'Makes the shop known: promotions, gift cards, newsletter, social networks, recommendations, loyalty, site pages. ⚠ <b>A newsletter send and a social post go out for real</b> and cannot be recalled.',

  'Consultation seulement': 'View only',
  'Regarde sans rien changer — aucune action d’écriture, nulle part. Le rôle à donner à un comptable externe, à un stagiaire ou le temps d’une formation. <b>Les sections sensibles (accès, clés, sauvegardes, conciliation) restent invisibles</b> même en lecture.':
    'Looks without changing anything — no write action, anywhere. The role for an outside accountant, a trainee, or the length of a training session. <b>The sensitive sections (access, keys, backups, reconciliation) stay invisible</b> even for reading.'
};

module.exports = { PERMISSIONS_EN };
