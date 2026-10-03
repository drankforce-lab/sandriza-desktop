'use strict';

/*
 * VÉHICULES ET DÉPLACEMENTS — les deux langues (2026-10-02)
 * =============================================================================
 * ⚠ LE VOCABULAIRE FISCAL EST CELUI DE L'ARC ET DE REVENU QUÉBEC, pas une
 * traduction libre — cet écran sera relu par un comptable :
 *
 *   frais de véhicule à moteur   = motor vehicle expenses   (T2125, ligne 9281)
 *   registre des déplacements    = logbook / trip log        (guide T4002)
 *   km d'affaires                = business kilometres
 *   part d'affaires              = business-use percentage
 *   odomètre                     = odometer
 *   CTI (crédit de taxe sur les intrants)          = ITC (input tax credit)
 *   RTI (remboursement de la taxe sur les intrants) = ITR (input tax refund)
 *
 * ⚠ « kilometres » à la canadienne (et non « kilometers ») : l'application parle
 * l'anglais du Canada, comme ses montants (en-CA).
 *
 * ⚠ LES NOMS DES TYPES DE FRAIS ET DES RAISONS NE SONT PAS ICI : ils arrivent du
 * site avec les données ({ cle, nom }) et se traduisent à l'affichage par
 * `szTd` (src/vocabulaire-site.js). Ce qui repart au site est TOUJOURS la clé.
 *
 * ⚠ AUCUNE APOSTROPHE DROITE dans une valeur : chaque phrase est posée dans une
 * chaîne entre apostrophes du script de la page. L'apostrophe typographique (’)
 * ne referme rien.
 */

module.exports = {
  /* ── Titre et cadre ─────────────────────────────────────────────────────── */
  'Véhicules et déplacements — Administration Sandriza': 'Vehicles and mileage — Sandriza Administration',
  'Véhicules et déplacements': 'Vehicles and mileage',
  'Registre indisponible': 'Logbook unavailable',
  'Registre des déplacements': 'Trip log',
  'Véhicules': 'Vehicles',
  'Changements de véhicule': 'Vehicle changes',
  'Dépenses du véhicule': 'Vehicle expenses',
  'Bilan fiscal': 'Tax summary',
  'Des renseignements manquent': 'Information is missing',
  'Année': 'Year',
  '+ Inscrire un véhicule': '+ Add a vehicle',
  'Ouvrir les Dépenses': 'Open Expenses',
  'Un changement relie deux véhicules du registre : inscrivez d’abord le véhicule entrant (et le sortant, s’il roulait déjà pour l’entreprise).':
    'A change links two vehicles of the logbook: first add the incoming vehicle (and the outgoing one, if it was already used for the business).',
  'La saisie en cours est gardée : elle reste dans le formulaire.': 'Your entry in progress is kept: it stays in the form.',
  'Lecture seule.': 'Read-only.',
  'Votre rôle permet de consulter le registre et le bilan, pas de les modifier.':
    'Your role lets you view the logbook and the summary, not change them.',
  'Page': 'Page',

  /* ── Les refus du site ──────────────────────────────────────────────────── */
  'Votre rôle ne permet pas cette opération sur le registre des véhicules.':
    'Your role does not allow this operation on the vehicle logbook.',
  'Le module des dépenses n’a pas pu être chargé dans la fenêtre principale. Rechargez-la (Ctrl+R).':
    'The expenses module could not be loaded in the main window. Reload it (Ctrl+R).',
  'Donnez un nom au véhicule (par exemple « Civic 2021 »).': 'Give the vehicle a name (for example “Civic 2021”).',
  'La date de retrait précède la date d’acquisition.': 'The retirement date is before the acquisition date.',
  'L’odomètre de fin doit dépasser celui du début : un compteur ne recule pas.':
    'The ending odometer must be higher than the starting one: an odometer does not run backwards.',
  'Cette fiche n’existe plus — elle a peut-être été retirée depuis un autre poste. Le registre a été relu.':
    'This record no longer exists — it may have been removed from another workstation. The logbook was reloaded.',
  'Année invalide.': 'Invalid year.',
  'Date invalide.': 'Invalid date.',
  'Choisissez un véhicule.': 'Choose a vehicle.',
  'Ce véhicule n’était pas en service à cette date (avant son acquisition ou après son retrait).':
    'This vehicle was not in service on that date (before it was acquired or after it was retired).',
  'Indiquez la destination du déplacement.': 'Enter the trip destination.',
  'Choisissez la raison d’affaires du déplacement.': 'Choose the business purpose of the trip.',
  '« Autre raison d’affaires » exige une précision : dites ce qui a motivé le déplacement.':
    '“Other business purpose” needs details: say what the trip was for.',
  'Indiquez les kilomètres parcourus, ou l’odomètre au départ et à l’arrivée.':
    'Enter the kilometres driven, or the odometer at departure and arrival.',
  'Plus de 2 000 km pour un seul déplacement : vérifiez la saisie (un zéro de trop ?).':
    'More than 2,000 km for a single trip: check your entry (an extra zero?).',
  'Le véhicule sortant et le véhicule entrant sont le même.': 'The outgoing and incoming vehicles are the same.',
  'Indiquez l’odomètre du véhicule sortant au jour du changement.': 'Enter the outgoing vehicle’s odometer on the day of the change.',
  'Indiquez l’odomètre du véhicule entrant au jour du changement.': 'Enter the incoming vehicle’s odometer on the day of the change.',
  'Le nuage a refusé l’écriture : elle n’existe que sur ce poste et sera perdue ailleurs. Vérifiez la connexion, puis refaites la saisie.':
    'The cloud refused the write: it exists only on this workstation and will be lost elsewhere. Check the connection, then enter it again.',
  'Ce véhicule porte': 'This vehicle has',
  'déplacement': 'trip',
  'déplacements': 'trips',
  'et': 'and',
  'dépense': 'expense',
  'dépenses': 'expenses',
  ': ils justifient des déductions, on ne le supprime pas. Donnez-lui plutôt une date de retrait (bouton Modifier).':
    ': they support deductions, so it is not deleted. Give it a retirement date instead (Edit button).',
  'Choisissez au moins un véhicule : le sortant, l’entrant, ou les deux.':
    'Choose at least one vehicle: the outgoing one, the incoming one, or both.',
  'L’odomètre au retrait doit dépasser celui de l’acquisition.': 'The odometer at retirement must be higher than at acquisition.',
  'Véhicule retiré du registre': 'Vehicle removed from the logbook',

  /* ── D'où vient un odomètre ─────────────────────────────────────────────── */
  'saisi': 'entered',
  'repris de la fin': 'carried over from the end of',
  'relevé à l’acquisition': 'read at acquisition',
  'relevé au retrait': 'read at retirement',
  'repris du début': 'carried over from the start of',

  /* ── Registre ───────────────────────────────────────────────────────────── */
  'Odomètre illisible : des chiffres seulement.': 'Unreadable odometer: digits only.',
  'L’odomètre d’arrivée doit dépasser celui du départ.': 'The arrival odometer must be higher than the departure one.',
  'Kilomètres retenus :': 'Kilometres counted:',
  '(lus à l’odomètre, ils l’emportent)': '(read on the odometer, they take precedence)',
  'Kilomètres illisibles : un nombre plus grand que zéro.': 'Unreadable kilometres: a number greater than zero.',
  'aller-retour': 'round trip',
  'Kilomètres retenus : —': 'Kilometres counted: —',
  'Km d’affaires': 'Business km',
  'la somme du registre': 'the logbook total',
  'Km totaux': 'Total km',
  'lus à l’odomètre': 'read on the odometer',
  'odomètre à compléter': 'odometer to complete',
  'Part d’affaires': 'Business use',
  'À établir': 'To be established',
  'km d’affaires ÷ km totaux': 'business km ÷ total km',
  'Déplacements': 'Trips',
  'inscrits en': 'logged in',
  'Déductible': 'Deductible',
  'dépenses de véhicule, part appliquée': 'vehicle expenses, business share applied',
  'Aucun véhicule inscrit': 'No vehicle registered',
  'Le registre compte les kilomètres d’un véhicule précis : inscrivez d’abord votre véhicule et son odomètre de départ. La part d’affaires de ses dépenses (essence, entretien, assurance…) en découlera, et le bilan fiscal se remplira tout seul.':
    'The logbook counts the kilometres of a specific vehicle: first add your vehicle and its starting odometer. The business share of its expenses (fuel, maintenance, insurance…) will follow, and the tax summary will fill itself in.',
  'Votre rôle ne permet pas d’inscrire un véhicule : demandez-le à un administrateur.':
    'Your role does not allow adding a vehicle: ask an administrator.',
  'Filtrer par véhicule': 'Filter by vehicle',
  'Tous les véhicules': 'All vehicles',
  'Aucun déplacement inscrit': 'No trip logged',
  'pour ce véhicule en': 'for this vehicle in',
  'en': 'in',
  'Chaque sortie pour affaires s’inscrit à droite : la date, la destination, la raison et les kilomètres.':
    'Log each business trip on the right: the date, the destination, the purpose and the kilometres.',
  'Date': 'Date',
  'Véhicule': 'Vehicle',
  'Trajet et raison': 'Route and purpose',
  'Km': 'Km',
  'commande': 'order',
  'Double-cliquez pour modifier': 'Double-click to edit',
  'Lus à l’odomètre': 'Read on the odometer',
  'Supprimer ce déplacement': 'Delete this trip',
  'Total': 'Total',
  'Inscrire un déplacement': 'Log a trip',
  'Votre rôle permet de consulter le registre, pas d’y inscrire des déplacements.':
    'Your role lets you view the logbook, not log trips in it.',
  'Aucun véhicule n’est en service en': 'No vehicle is in service in',
  ' : inscrivez le véhicule utilisé, ou corrigez ses dates d’acquisition et de retrait (onglet Véhicules).':
    ': add the vehicle used, or correct its acquisition and retirement dates (Vehicles tab).',
  'Modifier le déplacement': 'Edit the trip',
  'Ajouter un déplacement': 'Add a trip',
  '— choisir —': '— choose —',
  'Départ': 'From',
  'La boutique, le bureau…': 'The store, the office…',
  'Destination': 'Destination',
  'Ville, adresse ou lieu': 'City, address or place',
  'Raison d’affaires': 'Business purpose',
  'Précision (obligatoire)': 'Details (required)',
  'Précision (facultative)': 'Details (optional)',
  'Fournisseur visité, client, objet…': 'Supplier visited, client, subject…',
  'Kilomètres parcourus': 'Kilometres driven',
  'Aller-retour (× 2)': 'Round trip (× 2)',
  'N° de commande (facultatif)': 'Order no. (optional)',
  'pour une livraison': 'for a delivery',
  'ou odomètre au départ': 'or odometer at departure',
  'odomètre à l’arrivée': 'odometer at arrival',
  'Annuler la modification': 'Cancel the edit',
  'Vider': 'Clear',
  '+ Ajouter le déplacement': '+ Add the trip',
  'Seuls les déplacements d’affaires s’inscrivent ici. L’aller simple de la maison au lieu d’affaires habituel est personnel aux yeux du fisc.':
    'Log business trips only. Driving from home to your usual place of business is personal use in the eyes of the tax authorities.',

  /* ── Véhicules ──────────────────────────────────────────────────────────── */
  'Retiré le': 'Retired on',
  'Pas en service en': 'Not in service in',
  'En service': 'In service',
  'retrait prévu le': 'retirement planned on',
  'Début': 'Start',
  'Fin': 'End',
  'à saisir : le compteur au 1er janvier': 'to enter: the odometer on January 1',
  'à saisir : le compteur au 31 décembre': 'to enter: the odometer on December 31',
  'Double-cliquez pour modifier la fiche': 'Double-click to edit the record',
  'Marque et modèle non précisés': 'Make and model not specified',
  'plaque': 'plate',
  'Acquis le': 'Acquired on',
  'Odomètre': 'Odometer',
  'Km de l’année': 'Km for the year',
  'd’affaires': 'business',
  'part': 'share',
  'La fin est inférieure au début : corrigez l’un des deux.': 'The end is lower than the start: correct one of them.',
  'Enregistrer l’odomètre': 'Save the odometer',
  'Ce véhicule n’était pas en service en': 'This vehicle was not in service in',
  ' : aucun odomètre à relever cette année-là.': ': no odometer to record that year.',
  'L’odomètre de début d’une année se reprend tout seul de la fin de l’année précédente : relevez le compteur au 31 décembre et saisissez-le en « Fin » — l’année suivante démarre d’elle-même. Une valeur en gris est déduite ; tapez par-dessus pour la remplacer.':
    'Each year’s starting odometer carries over automatically from the previous year’s end: read the odometer on December 31 and enter it as “End” — the next year starts by itself. A greyed value is inferred; type over it to replace it.',
  'Modifier le véhicule': 'Edit the vehicle',
  'Inscrire un véhicule': 'Add a vehicle',
  'Nom (obligatoire)': 'Name (required)',
  'Ex. : Civic grise': 'E.g.: grey Civic',
  /* « Make » et non « Brand » (le mot du socle) : pour un véhicule, l anglais
     dit make and model — c est le libelle des formulaires d immatriculation. */
  'Marque': 'Make',
  'Modèle': 'Model',
  'Année du modèle': 'Model year',
  'Plaque': 'Licence plate',
  'Odomètre à l’acquisition': 'Odometer at acquisition',
  'Retiré le (vendu, remplacé)': 'Retired on (sold, replaced)',
  'Odomètre au retrait': 'Odometer at retirement',
  'Notes': 'Notes',
  'L’odomètre à l’acquisition sert de début d’année l’année où le véhicule entre au registre. Le retrait ne supprime rien : le véhicule reste au registre avec ses kilomètres et ses dépenses, qui justifient les déductions passées.':
    'The odometer at acquisition is used as the year’s start in the year the vehicle enters the logbook. Retiring deletes nothing: the vehicle stays in the logbook with its kilometres and expenses, which support past deductions.',
  '+ Inscrire le véhicule': '+ Add the vehicle',

  /* ── Changements ────────────────────────────────────────────────────────── */
  'Historique des changements': 'Change history',
  'Aucun changement inscrit': 'No change recorded',
  'Un changement de véhicule (vente, fin de location, remplacement) se note ici, avec l’odomètre des deux véhicules ce jour-là.':
    'A change of vehicle (sale, end of lease, replacement) is recorded here, with both vehicles’ odometers on that day.',
  'Véhicule sortant': 'Outgoing vehicle',
  'Véhicule entrant': 'Incoming vehicle',
  'Motif': 'Reason',
  'aucun': 'none',
  'Enregistrer un changement': 'Record a change',
  'Votre rôle permet de consulter l’historique, pas d’y inscrire un changement.':
    'Your role lets you view the history, not record a change.',
  'Date du changement': 'Date of the change',
  '— aucun (premier véhicule) —': '— none (first vehicle) —',
  'Son odomètre ce jour-là': 'Its odometer that day',
  '— aucun (non remplacé) —': '— none (not replaced) —',
  'Motif (facultatif)': 'Reason (optional)',
  'Vente, fin de location, accident…': 'Sale, end of lease, accident…',
  '+ Inscrire le nouveau véhicule': '+ Add the new vehicle',
  'Enregistrer le changement': 'Record the change',
  'Le véhicule entrant doit être inscrit d’abord. À l’enregistrement, le sortant reçoit cette date comme date de retrait, avec son odomètre ; l’entrant la reçoit comme date d’acquisition, avec le sien. C’est ce qui borne les kilomètres de chacun pour l’année du changement.':
    'The incoming vehicle must be added first. When saved, the outgoing vehicle gets this date as its retirement date, with its odometer; the incoming one gets it as its acquisition date, with its own. This is what bounds each vehicle’s kilometres for the year of the change.',

  /* ── Dépenses ───────────────────────────────────────────────────────────── */
  'Les dépenses de véhicule se saisissent dans la fenêtre Dépenses, catégorie « Frais de véhicule à moteur » (ligne 9281) : on y choisit le véhicule et le type de frais. Ce registre en établit la part d’affaires ; la comptabilité, elle, garde la dépense entière.':
    'Vehicle expenses are entered in the Expenses window, category “Motor vehicle expenses” (line 9281): choose the vehicle and the expense type there. This logbook sets their business share; the books keep the full expense.',
  'Aucune dépense de véhicule en': 'No vehicle expense in',
  'Essence, entretien, assurance, immatriculation, intérêts du prêt, stationnement d’affaires… Chaque reçu saisi dans les Dépenses avec la catégorie « Frais de véhicule à moteur » paraîtra ici.':
    'Fuel, maintenance, insurance, registration, loan interest, business parking… Every receipt entered in Expenses with the “Motor vehicle expenses” category will appear here.',
  'dépense sans part établie': 'expense without an established share',
  'dépenses sans part établie': 'expenses without an established share',
  'Faute d’odomètre complet pour l’année, elles se déclarent en entier. Complétez l’odomètre (onglet Véhicules) : la part s’appliquera d’elle-même.':
    'Without a complete odometer for the year, they are claimed in full. Complete the odometer (Vehicles tab): the share will apply by itself.',
  'dépense non rattachée': 'expense not linked to a vehicle',
  'dépenses non rattachées': 'expenses not linked to a vehicle',
  'Sans véhicule, elles prennent la part globale de l’année. Rattachez-les dans les Dépenses (fiche, Modifier) pour une part exacte.':
    'Without a vehicle, they take the overall share for the year. Link them in Expenses (record, Edit) for an exact share.',
  'Dépenses de véhicule': 'Vehicle expenses',
  'Type de frais': 'Expense type',
  'Fournisseur / description': 'Supplier / description',
  'Montant (hors taxes)': 'Amount (before tax)',
  'Part': 'Share',
  'Odomètre de l’année incomplet : la dépense se déclare en entier.': 'The year’s odometer is incomplete: the expense is claimed in full.',
  'non établie': 'not established',
  'toujours 100 %': 'always 100%',
  'non rattachée': 'not linked',
  'non précisé': 'not specified',
  'Total de l’année': 'Total for the year',

  /* ── Bilan ──────────────────────────────────────────────────────────────── */
  'Odomètre du début d’année manquant. Saisissez-le dans l’onglet Véhicules — ou la fin de l’année précédente, qui le reprend tout seul.':
    'Start-of-year odometer missing. Enter it in the Vehicles tab — or the previous year’s end, which carries over by itself.',
  'Odomètre de fin d’année manquant. Relevez le compteur au 31 décembre (ou le jour de la vente) et saisissez-le dans l’onglet Véhicules.':
    'End-of-year odometer missing. Read the odometer on December 31 (or on the day of sale) and enter it in the Vehicles tab.',
  'L’odomètre de fin est inférieur à celui du début : l’un des deux est faux. Corrigez-le dans l’onglet Véhicules.':
    'The ending odometer is lower than the starting one: one of them is wrong. Correct it in the Vehicles tab.',
  'Les km d’affaires du registre dépassent les km totaux à l’odomètre : un déplacement est sans doute mal saisi (un zéro de trop ?), ou l’odomètre est faux. La part est plafonnée à 100 % en attendant.':
    'The logbook’s business km exceed the total km on the odometer: a trip is probably mistyped (an extra zero?), or the odometer is wrong. The share is capped at 100% meanwhile.',
  'Des dépenses sont rattachées à ce véhicule, mais aucun déplacement n’est inscrit : sans registre, la part d’affaires ne se défend pas. Inscrivez les déplacements de l’année.':
    'Expenses are linked to this vehicle, but no trip is logged: without a logbook, the business share cannot be supported. Log the year’s trips.',
  'Des dépenses de véhicule ne sont rattachées à aucun véhicule : elles prennent la part globale de l’année (ou 100 % si elle n’est pas établie). Rattachez-les dans la fenêtre Dépenses.':
    'Some vehicle expenses are not linked to any vehicle: they take the overall share for the year (or 100% if it is not established). Link them in the Expenses window.',
  'Non rattachées': 'Not linked',
  'Rien à déclarer pour': 'Nothing to claim for',
  'Aucun véhicule en service cette année-là et aucune dépense de véhicule. Inscrivez un véhicule pour tenir le registre : le bilan se remplira de lui-même.':
    'No vehicle in service that year and no vehicle expense. Add a vehicle to keep the logbook: the summary will fill itself in.',
  'manquant': 'missing',
  'Bilan': 'Summary',
  'Kilométrage': 'Mileage',
  'Odomètre au début': 'Odometer at start',
  'Odomètre à la fin': 'Odometer at end',
  'à établir': 'to establish',
  'Km d’affaires (registre)': 'Business km (logbook)',
  'Km personnels': 'Personal km',
  'Dépenses payées (hors taxes)': 'Expenses paid (before tax)',
  'Total des dépenses': 'Total expenses',
  'À déclarer': 'To claim',
  'Déductible — T2125 ligne 9281 / TP-80': 'Deductible — T2125 line 9281 / TP-80',
  'TPS payée': 'GST paid',
  'CTI admissibles — ligne 106': 'Eligible ITCs — line 106',
  'TVQ payée': 'QST paid',
  'RTI admissibles — ligne 206': 'Eligible ITRs — line 206',
  'À compléter avant de déclarer': 'To complete before filing',
  'point': 'item',
  'points': 'items',
  'Tant qu’une part n’est pas établie, les dépenses de ce véhicule se déclarent en entier : on ne fabrique ni une part de 0 % qui ferait disparaître une déduction, ni une part inventée.':
    'Until a share is established, this vehicle’s expenses are claimed in full: no 0% share that would erase a deduction, and no made-up share either.',
  'Bilan complet.': 'Summary complete.',
  'Chaque part d’affaires est appuyée par l’odomètre et par le registre des déplacements.':
    'Every business share is supported by the odometer and by the trip log.',
  'Où reporter ces chiffres': 'Where to report these figures',
  'Fédéral — formulaire T2125, ligne 9281 « Frais de véhicule à moteur » : le déductible.':
    'Federal — form T2125, line 9281 “Motor vehicle expenses”: the deductible amount.',
  'Québec — formulaire TP-80, frais de véhicule à moteur : le même déductible.':
    'Quebec — form TP-80, motor vehicle expenses: the same deductible amount.',
  'Déclaration de TPS — ligne 106 : les CTI admissibles.': 'GST return — line 106: the eligible ITCs.',
  'Déclaration de TVQ — ligne 206 : les RTI admissibles.': 'QST return — line 206: the eligible ITRs.',
  'La règle': 'The rule',
  'Part d’affaires = km d’affaires de l’année ÷ km totaux à l’odomètre (ARC, guide T4002 ; Revenu Québec). Elle s’applique aux dépenses ET aux taxes récupérables.':
    'Business use = the year’s business km ÷ total km on the odometer (CRA guide T4002; Revenu Québec). It applies to the expenses AND to the recoverable taxes.',
  'Stationnement et péages d’affaires : 100 %': 'Business parking and tolls: 100%',
  ', hors de la répartition.': ', outside the allocation.',
  'La comptabilité garde la dépense entière ; seule la déclaration applique la part.':
    'The books keep the full expense; only the tax return applies the share.',

  /* ── Messages des gestes ────────────────────────────────────────────────── */
  'Kilomètres ou odomètre illisibles : des chiffres seulement.': 'Unreadable kilometres or odometer: digits only.',
  'Déplacement modifié.': 'Trip updated.',
  'Déplacement inscrit.': 'Trip logged.',
  'Il est daté d’une autre année : choisissez-la en haut pour le voir.': 'It is dated in another year: choose that year at the top to see it.',
  'Fiche du véhicule enregistrée.': 'Vehicle record saved.',
  'Véhicule inscrit. Saisissez maintenant son odomètre de l’année.': 'Vehicle added. Now enter its odometer for the year.',
  'Odomètre enregistré pour': 'Odometer saved for',
  'Changement enregistré : les dates et les odomètres des deux véhicules sont à jour.':
    'Change recorded: both vehicles’ dates and odometers are up to date.',
  'Déplacement retiré du registre.': 'Trip removed from the logbook.',
  'Véhicule retiré du registre.': 'Vehicle removed from the logbook.',
  'Les Dépenses s’ouvrent…': 'Opening Expenses…',
  'Modification abandonnée.': 'Edit cancelled.',
  'Déplacement ouvert en modification.': 'Trip opened for editing.',
  'Appuyez de nouveau sur Échap pour fermer sans enregistrer.': 'Press Esc again to close without saving.',
  'Une saisie est en cours : enregistrez-la ou videz le formulaire avant de fermer.':
    'An entry is in progress: save it or clear the form before closing.',

  /* ── La DPA (2026-10-02) ────────────────────────────────────────────────────
     DPA = CCA (capital cost allowance) ; FNACC = UCC (undepreciated capital
     cost) ; récupération = recapture ; perte finale = terminal loss ; IIA =
     AII (Accelerated Investment Incentive) — les termes du guide T4002. */
  'La DPA demandée dépasse le maximum permis pour l’année :': 'The CCA claimed exceeds the maximum allowed for the year:',
  'Montant de DPA illisible : des chiffres seulement.': 'Unreadable CCA amount: digits only.',
  'catégorie': 'class',
  'plafond inconnu': 'unknown limit',
  'saisi sur la fiche': 'entered on the record',
  'plafond de l’ARC': 'CRA limit',
  'dernier plafond connu, à confirmer': 'last known limit, to be confirmed',
  'Amortissement (DPA)': 'Capital cost allowance (CCA)',
  'Véhicule loué : pas de DPA. Les loyers se déclarent en frais de véhicule (type « Location »).':
    'Leased vehicle: no CCA. Lease payments are claimed as vehicle expenses (type “Leasing”).',
  'Coût d’achat manquant : saisissez le prix avant taxes et la date de mise en service (Modifier) pour calculer la DPA.':
    'Purchase cost missing: enter the price before tax and the date available for use (Edit) to calculate CCA.',
  'Coût en capital': 'Capital cost',
  'plafonné': 'capped',
  'plafond à confirmer': 'limit to confirm',
  'Aucune DPA en': 'No CCA in',
  'mise en service le': 'available for use on',
  'FNACC': 'UCC',
  'max.': 'max.',
  'Vendu : récupération de': 'Sold: recapture of',
  '(un revenu, ligne 8230)': '(income, line 8230)',
  'Vendu : perte finale de': 'Sold: terminal loss of',
  '(une déduction, ligne 9270)': '(a deduction, line 9270)',
  'DPA demandée': 'CCA claimed',
  'Laissez vide pour demander le maximum. On peut demander moins et garder la FNACC pour plus tard.':
    'Leave empty to claim the maximum. You may claim less and keep the UCC for later years.',
  'Appliquer': 'Apply',
  'Maximum': 'Maximum',
  'DPA déductible': 'Deductible CCA',
  'réduite': 'reduced',
  'Tableau de DPA': 'CCA schedule',
  'Plafond': 'Limit',
  'Mise en service': 'Available for use',
  'FNACC début': 'Opening UCC',
  'Ajout': 'Addition',
  'DPA max.': 'Max. CCA',
  'Règle': 'Rule',
  'Récupération / perte': 'Recapture / loss',
  'FNACC fin': 'Closing UCC',
  'La FNACC baisse de la DPA entière ; seule la part d’affaires se déduit. Une part non établie vaut 100 % en attendant l’odomètre.':
    'The UCC drops by the full CCA; only the business share is deducted. A share not yet established counts as 100% until the odometer is complete.',
  'Fermer': 'Close',
  'Tableau DPA': 'CCA schedule',
  'Automatique': 'Automatic',
  'Mode d’acquisition': 'Acquisition',
  'Achat': 'Purchase',
  'Location (crédit-bail)': 'Lease',
  'Un véhicule loué n’a pas de DPA : les loyers se déclarent comme frais de véhicule, dans les Dépenses, avec le type « Location (crédit-bail) ». Ils suivent la part d’affaires comme les autres frais.':
    'A leased vehicle has no CCA: lease payments are claimed as vehicle expenses, in Expenses, with the “Leasing” type. They follow the business share like the other expenses.',
  'Prix avant taxes': 'Price before tax',
  'Taxes non récupérées': 'Unrecovered taxes',
  'La TPS et la TVQ payées à l’achat qui n’ont PAS été demandées en CTI / RTI. Elles s’ajoutent au coût en capital.':
    'The GST and QST paid on purchase that were NOT claimed as ITCs / ITRs. They are added to the capital cost.',
  'Vide : la date d’acquisition. Elle décide de la règle de première année.':
    'Empty: the acquisition date. It decides the first-year rule.',
  'Catégorie': 'Class',
  'Voiture de tourisme': 'Passenger vehicle',
  'Zéro émission (catégorie 54)': 'Zero-emission (class 54)',
  'Plafond (facultatif)': 'Limit (optional)',
  'Le plafond de coût des catégories 10.1 et 54 pour l’année de mise en service. À saisir quand il est marqué « à confirmer ».':
    'The cost limit of classes 10.1 and 54 for the year the vehicle became available for use. Enter it when it is marked “to confirm”.',
  'Prix de vente': 'Sale price',
  'Plafond à confirmer.': 'Limit to confirm.',
  'Voiture de tourisme au-dessus du plafond : catégorie 10.1, coût ramené au plafond. Camionnette ou véhicule de travail : catégorie 10.':
    'Passenger vehicle above the limit: class 10.1, cost brought down to the limit. Van or work vehicle: class 10.',
  'Coût d’achat manquant : la DPA ne peut pas se calculer. Saisissez le prix avant taxes et la date de mise en service sur la fiche du véhicule (onglet Véhicules, Modifier).':
    'Purchase cost missing: CCA cannot be calculated. Enter the price before tax and the date available for use on the vehicle record (Vehicles tab, Edit).',
  'Le plafond de coût (catégorie 10.1 ou 54) de l’année de mise en service n’est pas connu avec certitude : le dernier plafond connu sert en attendant. Vérifiez-le auprès de l’ARC et saisissez-le sur la fiche du véhicule (champ « Plafond »).':
    'The cost limit (class 10.1 or 54) for the year the vehicle became available for use is not known for certain: the last known limit is used meanwhile. Check it with the CRA and enter it on the vehicle record (“Limit” field).',
  'Vue du bilan': 'Summary view',
  'Dépenses et kilométrage': 'Expenses and mileage',
  'DPA déductible — ligne 9936': 'Deductible CCA — line 9936',
  'location — sans DPA': 'lease — no CCA',
  'coût manquant': 'cost missing',
  'à confirmer': 'to confirm',
  'FNACC au début': 'Opening UCC',
  'Ajout de l’année': 'Addition for the year',
  'DPA maximale': 'Maximum CCA',
  'DPA déductible — T2125 ligne 9936 / TP-80': 'Deductible CCA — T2125 line 9936 / TP-80',
  'Récupération — un revenu, ligne 8230': 'Recapture — income, line 8230',
  'Perte finale — ligne 9270': 'Terminal loss — line 9270',
  'FNACC à la fin (reportée)': 'Closing UCC (carried forward)',
  'T2125, ligne 9936 « Déduction pour amortissement » : la DPA déductible (le détail va à la partie de la DPA du formulaire).':
    'T2125, line 9936 “Capital cost allowance”: the deductible CCA (the details go in the CCA part of the form).',
  'T2125, ligne 8230 « Autres revenus » : la récupération d’amortissement.': 'T2125, line 8230 “Other income”: the recapture of CCA.',
  'T2125, ligne 9270 « Autres dépenses » : la perte finale.': 'T2125, line 9270 “Other expenses”: the terminal loss.',
  'Les règles de la DPA': 'CCA rules',
  'Taux de 30 % dégressif sur la FNACC (catégories 10, 10.1 et 54).': '30% declining balance on the UCC (classes 10, 10.1 and 54).',
  'Première année selon la mise en service : demi-année avant le 21 nov. 2018 et dès 2028 ; × 1,5 de 2019 à 2023 ; sans demi-année de 2024 à 2027 (catégorie 54 : 100 %, 75 %, puis 55 %).':
    'First year depends on when it became available for use: half-year rule before Nov. 21, 2018 and from 2028; × 1.5 from 2019 to 2023; no half-year rule from 2024 to 2027 (class 54: 100%, 75%, then 55%).',
  'Catégorie 10.1 : voiture de tourisme au-dessus du plafond — coût ramené au plafond, une catégorie par véhicule, ni récupération ni perte finale ; la moitié de la DPA l’année de la vente.':
    'Class 10.1: passenger vehicle above the limit — cost brought down to the limit, one class per vehicle, no recapture and no terminal loss; half the CCA in the year of sale.',
  'Seule la part d’affaires se déduit ; la FNACC baisse de la DPA entière. Un véhicule loué n’a pas de DPA : ses loyers sont des frais de véhicule.':
    'Only the business share is deducted; the UCC drops by the full CCA. A leased vehicle has no CCA: its lease payments are vehicle expenses.',
  'Montant illisible : des chiffres seulement.': 'Unreadable amount: digits only.',
  'DPA ramenée au maximum pour': 'CCA set back to the maximum for',
  'DPA demandée enregistrée pour': 'CCA claimed saved for',
};
