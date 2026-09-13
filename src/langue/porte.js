'use strict';

/*
 * LES ECRANS DE CHARGEMENT (la « porte ») — les deux langues
 * =============================================================================
 * Sa demande du 2026-09-12 : « les ecrans de chargement aussi devront etre
 * traduits ».
 *
 * ⚠⚠ CE SONT LES SEULS ECRANS QUE LA COQUILLE DESSINE ELLE-MEME, AVANT QUE LE
 * SITE N EXISTE. Ils paraissent au demarrage, pendant la verification des mises
 * a jour, pendant le telechargement et pendant l installation — c est-a-dire
 * exactement aux moments ou l on ne peut RIEN faire d autre que les lire.
 * Les laisser en francais aurait rendu l anglais faux des la premiere seconde.
 *
 * ⚠⚠⚠ TROIS PHRASES DISENT QU IL NE FAUT PAS COUPER LE COURANT, et elles gardent
 * leur fermete :
 *   · « le paquet est en cours d ecriture, et l interrompre laisserait une
 *     installation incomplete » ;
 *   · « l application redemarre, puis reprend ou vous en etiez » ;
 *   · « l application redemarrera a la fin » (pendant le telechargement).
 * Sans elles, on tue le processus par le gestionnaire des taches.
 *
 * ⚠ LE SEPARATEUR DECIMAL CHANGE AVEC LA LANGUE : « 43,0 Mo » en francais,
 * « 43.0 MB » en anglais. Ce n est pas une coquetterie — un chiffre ecrit a la
 * francaise se lit mal dans une phrase anglaise, et « Mo » n est pas « MB ».
 * C est `porte-progression.js` qui s en sert.
 *
 * ⚠ « SANDRIZA » est le nom du produit, et le sous-titre peut venir de la
 * marque (`th.subtitleText`) : seul le DEFAUT est traduit ici.
 */

module.exports = {
  /* ── LE GABARIT ─────────────────────────────────────────────────────────── */
  'Panneau d’administration': 'Administration panel',
  'Mise à jour': 'Update',
  'Administration {0} · version {1}': '{0} Administration · version {1}',

  /* ── LE DEMARRAGE ───────────────────────────────────────────────────────── */
  'Démarrage': 'Starting up',
  'Préparation de l’application…': 'Preparing the application…',
  'Ouverture de l’administration': 'Opening the administration',
  'Chargement des écrans…': 'Loading the screens…',

  /* ── LA VERIFICATION ────────────────────────────────────────────────────── */
  'Vérification des mises à jour': 'Checking for updates',
  'Quelques secondes, le temps d’interroger le serveur.':
    'A few seconds, while the server is queried.',
  'Vérification impossible': 'Check failed',
  'Le serveur de mise à jour n’a pas répondu.': 'The update server did not answer.',
  'Ouverture de l’administration dans un instant.':
    'Opening the administration in a moment.',
  'Impossible de joindre le serveur de mise à jour. Ouverture de l’administration…':
    'Cannot reach the update server. Opening the administration…',

  /* ── LA NOUVELLE VERSION ────────────────────────────────────────────────── */
  'Nouvelle version disponible': 'New version available',
  'Une version plus récente existe. Sur macOS, la mise à jour se fait à la main tant que l’application n’est pas signée.':
    'A newer version exists. On macOS the update is done by hand as long as the application is not signed.',
  'L’application redémarrera dès qu’elle sera prête.':
    'The application will restart as soon as it is ready.',
  'Continuer': 'Continue',
  'Mise à jour disponible': 'Update available',
  'Une version plus récente d’Administration Sandriza est disponible.':
    'A newer version of Sandriza Administration is available.',
  'Sur macOS, téléchargez-la et réinstallez-la manuellement. L’installation automatique exige une application signée.':
    'On macOS, download it and reinstall it by hand. Automatic installation requires a signed application.',

  /* ── LE TELECHARGEMENT ──────────────────────────────────────────────────── */
  /* ⚠⚠ « L APPLICATION REDEMARRERA A LA FIN » : c est ce qui empeche de tuer le
     processus en croyant l application figee. */
  'Téléchargement en cours': 'Downloading',
  'L’application redémarrera à la fin.': 'The application will restart when it is done.',
  '{0} Mo restants': '{0} MB remaining',
  'sur {0} Mo': 'of {0} MB',
  '{0} Mo/s': '{0} MB/s',
  'environ {0} s': 'about {0} s',
  'environ {0} min': 'about {0} min',
  'plus d’une heure': 'more than an hour',

  /* ── L INSTALLATION ─────────────────────────────────────────────────────── */
  /* ⚠⚠⚠ INTERROMPRE ICI LAISSE UNE INSTALLATION INCOMPLETE. La phrase le dit,
     et elle ne se resume pas. */
  'Installation': 'Installing',
  'La version {0} est prête.': 'Version {0} is ready.',
  'L’application redémarre, puis reprend où vous en étiez.':
    'The application restarts, then picks up where you left off.',
  'Mise à jour en cours': 'Update in progress',
  'L’application ne peut pas être fermée pendant l’installation d’une mise à jour : le paquet est en cours d’écriture, et l’interrompre laisserait une installation incomplète.':
    'The application cannot be closed while an update is installing: the package is being written, and interrupting it would leave an incomplete installation.',
  'Elle redémarrera toute seule dès que ce sera terminé.':
    'It will restart on its own as soon as this is finished.',
  /* ⚠ Le bouton de cette boite — trouve par `banc-langue-porte` des sa premiere
     execution, pas par la relecture. Un bouton reste le dernier mot qu on lit. */
  'Compris': 'Understood',

};
