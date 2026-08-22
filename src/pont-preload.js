'use strict';

/*
 * PONT DES FENÊTRES NATIVES
 * =============================================================================
 * Une fenêtre native est un document LOCAL : elle n'a ni session, ni cookies du
 * portail, ni accès au site. Elle ne peut donc RIEN demander au serveur — et
 * c'est le point de départ du dessin, pas une limite qu'on contourne. Une
 * deuxième porte vers les données serait une deuxième porte à surveiller.
 *
 * Ce pont n'expose qu'UNE chose : « fais cette opération-là ». Le nom part au
 * processus principal, qui le fait exécuter par la fenêtre PRINCIPALE — celle
 * qui porte la session — via `SzPont` du site. Les droits s'y vérifient, pas
 * ici : une fenêtre locale pourrait affirmer n'importe quoi sur qui elle est.
 *
 * ⚠ AUCUN `ipcRenderer` BRUT N'EST EXPOSÉ. Sans quoi la page pourrait émettre
 * n'importe quel message vers le processus principal, y compris ceux prévus pour
 * la fenêtre principale.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Rempli a la premiere operation, depuis le processus principal (voir plus bas).
let LONGUES = null;

contextBridge.exposeInMainWorld('szPont', {
  // ANCRAGE : la page demande a etre emportee dans sa propre fenetre. Inerte
  // quand la page vit deja dans une fenetre (le principal l ignore alors).
  detacher: () => ipcRenderer.invoke('dock:detacher').catch(() => false),
  // ANCRAGE : la vue detachee demande a REVENIR dans la fenetre principale.
  // Inerte pour une page qui vit ancree ou dans une fenetre ordinaire.
  ancrer: () => ipcRenderer.invoke('dock:ancrer').catch(() => false),
  // Rend toujours un objet : { ok:true, … } ou { ok:false, motif:'…' }.
  // ⚠ Jamais d'exception vers la page : une fenêtre qui plante sur un refus de
  // droit est plus difficile à comprendre qu'une fenêtre qui l'affiche.
  // ⚠⚠ UN DÉLAI MAXIMUM, ET C'EST LA CORRECTION LA PLUS IMPORTANTE DE CE FICHIER.
  // Il n'y en avait AUCUN. Le `.catch` ne se déclenche que sur un REJET ; une
  // opération qui ne se termine jamais ne rejette pas — elle reste en suspens. La
  // promesse ne se règle donc jamais, et la fenêtre native attend indéfiniment,
  // sans message et sans moyen de savoir pourquoi. Vécu le 2026-08-07 : la fenêtre
  // Imprimantes restait sur « Lecture de l'état… » pour toujours, et j'ai d'abord
  // cherché le défaut dans l'opération plutôt que dans l'absence de délai.
  //
  // ⚠ ET C'EST STRUCTUREL, pas propre à une fenêtre : chaque fenêtre devait sinon
  // poser son propre garde, sur chaque appel. En oublier un — ce que j'ai fait —
  // suffit à figer l'écran.
  //
  // 25 secondes, parce que certaines opérations sont LÉGITIMEMENT longues : une
  // étiquette demandée à un transporteur, un test d'impression, une rédaction par
  // le service d'IA. Trop court abandonnerait un travail en cours ; l'important
  // n'est pas d'être rapide, c'est de finir par répondre.
  appeler: (op, ...args) => {
    let fini = false;
    const nom = String(op || '');
    const attente = ipcRenderer.invoke('pont:appeler', nom, args)
      .then((r) => { fini = true; return r; })
      .catch(() => { fini = true; return { ok: false, motif: 'pont_indisponible' }; });
    // ⚠ L'ENREGISTREMENT D'UN PRODUIT DEPOSE SES PHOTOS DANS LE STOCKAGE : sur
    // une connexion de boutique, 25 s ne suffisent pas toujours. Le plafond
    // sonnait, la fenetre affichait << n'a pas repondu a temps >>... et la fiche
    // s'enregistrait quand meme derriere — une invitation au doublon
    // (2026-08-08). 90 s pour cette operation-la, 25 s pour tout le reste :
    // l'important n'est pas d'etre rapide, c'est de finir par repondre VRAI.
    // Liste JUMELLE de LIMITES_PONT (main.js) : ici +5 s, pour que le
    // principal reponde toujours en premier et que son verdict arrive entier.
    /* ══════════════════════════════════════════════════════════════════════
       LES PLAFONDS VIENNENT DU PROCESSUS PRINCIPAL — ILS NE SONT PLUS RECOPIES
       ⚠⚠ IL Y AVAIT DEUX TABLES JUMELLES, TENUES A LA MAIN. Celle-ci ignorait
       << photos:traiter >> : le plafond applique etait donc le defaut, VINGT-CINQ
       SECONDES, pendant que l autre table annoncait trois minutes. Le retrait de
       mannequin, qui enchaine trois modeles, se faisait donc refuser a chaque
       fois — et le travail CONTINUAIT derriere, jusqu a aboutir et se facturer,
       sur un ecran qui affichait << modele delai >>. Deux jours a chercher
       ailleurs.
       ⚠ ET LE GARDE-FOU NE VOYAIT RIEN : il verifie que les deux listes
       d OPERATIONS concordent, jamais leurs DELAIS. Une operation absente d une
       table n est pas une operation manquante — c est une operation muette.
       ⚠ POURQUOI PAS UN MODULE PARTAGE : ce prechargement tourne en BAC A SABLE,
       ou << require >> ne sait pas lire un fichier voisin. On demande donc la
       table au processus principal, une fois, a la premiere operation. Un
       aller-retour synchrone, et plus jamais de recopie.
       ══════════════════════════════════════════════════════════════════════ */
    if (!LONGUES) {
      try { LONGUES = ipcRenderer.sendSync('pont:limites') || {}; }
      catch (e) { LONGUES = {}; }
    }
    /* ⚠ LE PLAFOND DU PRECHARGEMENT EST PLUS LARGE QUE CELUI DU PRINCIPAL : il est
       le filet du filet. S il sonnait le premier, il masquerait le verdict
       precis du principal par un << delai >> sans detail. */
    const limite = (LONGUES[nom] || 20000) + 5000;
    const plafond = new Promise((resoudre) => {
      setTimeout(() => { if (!fini) resoudre({ ok: false, motif: 'delai' }); }, limite);
    });
    return Promise.race([attente, plafond]);
  },

  // Fermer proprement — la fenêtre n'a pas de barre de menu à elle.
  fermer: () => ipcRenderer.send('pont:fermer'),
  /* ⚠ << J'AI UNE SAISIE EN COURS >>. Le bouton de fermeture DESSINÉ dans la page
     passe par `fermer` ci-dessus, donc la page peut demander avant de partir.
     Mais le bouton X du CADRE DE WINDOWS, lui, ne traverse pas la page : le
     principal ferme la fenêtre et personne n'a rien demandé. La page lève donc ce
     drapeau dès qu'il y a quelque chose à perdre, et le principal s'en sert pour
     poser la question à SA place, avant de laisser partir.
     ⚠ Un canal ÉTROIT, un booléen : le préchargement n'expose toujours aucun
     `ipcRenderer` brut (une page pourrait sinon émettre n'importe quel message
     vers le principal, y compris ceux de la fenêtre principale). */
  brouillonSale: (on) => ipcRenderer.send('pont:brouillonSale', !!on),

  // ⚠ LE PLEIN ÉCRAN EST UNE ACTION DE FENÊTRE, PAS UNE DONNÉE. Il ne passe donc
  // pas par `appeler` : cette voie-là mène aux données du site et à sa session,
  // et y mêler le pilotage de la fenêtre brouillerait ce qu'elle protège.
  // ⚠ Et c'est un VRAI plein écran du système, pas une classe CSS qui étire un
  // bloc dans une page — l'éditeur du site n'a que la seconde solution parce
  // qu'il vit dans un onglet ; ici la fenêtre existe pour de bon.
  // Rend le nouvel état (true = plein écran) pour que le bouton dise la vérité.
  pleinEcran: () => ipcRenderer.invoke('fenetre:pleinecran').catch(() => null),

  // ⚠ LE SEUL FLUX POUSSÉ VERS UNE FENÊTRE NATIVE, et il existe pour une raison
  // précise. L'affichage client de la caisse doit suivre le scan à l'instant : le
  // faire demander l'état en boucle serait un sondage permanent pour une
  // information que la caisse connaît déjà. Elle la POUSSE donc.
  // ⚠ Et c'est indispensable, pas un confort : la caisse et l'afficheur se
  // parlaient par `BroadcastChannel` et l'événement `storage`, qui exigent tous
  // deux une ORIGINE COMMUNE. Une fenêtre native est chargée en `data:`, son
  // origine est `null` : aucun des deux ne peut l'atteindre.
  // ⚠ ÉCOUTE SEULEMENT. Cette fenêtre ne peut RIEN émettre vers la caisse — elle
  // affiche, elle ne décide de rien, et on doit pouvoir la poser devant une
  // cliente sans y penser à deux fois.
  surEtatCaisse: (cb) => {
    const h = (e, etat) => { try { cb(etat); } catch {} };
    ipcRenderer.on('pos:etat', h);
    return () => ipcRenderer.removeListener('pos:etat', h);
  },

  // La fenêtre annonce la hauteur réelle de son contenu ; le principal ajuste.
  // Même raison que la palette : une hauteur devinée d'avance se fait démentir
  // par la moindre ligne ajoutée ou par une mise à l'échelle Windows autre
  // que 100 %.
  // `garder` = true : la fenêtre reste où elle est (juste ramenée dans l'écran
  // si le bas déborde) au lieu d'être recentrée — pour l'assistant Produit, qui
  // se recale à CHAQUE étape.
  ajusterHauteur: (h, garder) => ipcRenderer.send('fenetre:hauteur', Math.round(h) || 0, !!garder),

  // Ouvre le module Journaux depuis une AUTRE fenêtre (lien de retour, #7 7b-2c) —
  // sur l'onglet voulu si la fenêtre s'ouvre à neuf, sinon on lui dit d'y aller.
  // Les fenêtres ancrées n'avaient aucun moyen d'ouvrir une autre section.
  ouvrirJournaux: (onglet) => ipcRenderer.invoke('journaux:ouvrir', String(onglet || '')).catch(() => false),

  /* Ouvre un AUTRE module depuis une fenêtre (#35 : le bouton « Verrous » des
     Journaux, qui pointe vers l'écran sorti de là). Le nom est filtré côté
     principal contre une liste blanche — une fenêtre ne choisit pas ce qu'elle
     ouvre dans l'application, elle le demande. */
  ouvrirModule: (nom) => ipcRenderer.invoke('module:ouvrir', String(nom || '')).catch(() => false),

  /* ══ ÉCRIRE UN FICHIER D EXPORT — DEPUIS LA FENÊTRE QUI L A DEMANDÉ ════════
     ⚠⚠ POURQUOI CE CANAL EXISTE (2026-08-20, signalé : « ça apparaît dans les
     Import mais rien ne se télécharge »). Une fenêtre native qui demandait un
     fichier faisait partir le téléchargement dans la fenêtre PRINCIPALE, la
     seule qui porte la session. Là, le site le RETIENT volontairement et
     l affiche dans un panneau de la barre latérale — un panneau qui se trouve
     DERRIÈRE la fenêtre native. Message vert, et rien à voir nulle part.
     ⚠ Ce n est PAS une porte vers le disque : le principal impose le dossier
     (Documents\SANDRIZA\Exports, celui du menu « Exports ») et assainit le nom.
     Une fenêtre ne choisit ni où elle écrit, ni comment le fichier s appelle
     vraiment — elle demande, et on lui dit où c est allé.
     ⚠ Le canal existait déjà pour la fenêtre principale (`export:save`) : on
     l ouvre ici, on n en invente pas un second qui divergerait. */
  enregistrerExport: (nom, contenu) => ipcRenderer
    .invoke('export:save', String(nom || ''), String(contenu == null ? '' : contenu))
    .catch((e) => ({ ok: false, error: String((e && e.message) || e) })),
  ouvrirDossierExports: () => ipcRenderer.invoke('export:openFolder').catch(() => false),

  /* ══ OU LES EXPORTS ATTERRISSENT — LE LIRE ET LE CHANGER ═══════════════════
     ⚠ La fenetre ne choisit toujours PAS le chemin elle-meme : elle demande
     l ouverture du selecteur, et c est le principal qui montre la boite,
     eprouve l ecriture et enregistre. Le canal reste donc aussi etroit
     qu avant — trois verbes, aucun chemin qui entre depuis la fenetre.
     ⚠ En cas d echec on rend `info:null` plutot que rien : la fenetre doit
     pouvoir dire << je ne sais pas ou c est >> au lieu d afficher un chemin
     vide qui se lirait comme la racine du disque. */
  dossierExports: () => ipcRenderer.invoke('export:dossier').catch(() => null),
  dossierExportsChoisir: () => ipcRenderer.invoke('export:dossierChoisir')
    .catch((e) => ({ ok: false, motif: 'echec', detail: String((e && e.message) || e), info: null })),
  dossierExportsDefaut: () => ipcRenderer.invoke('export:dossierDefaut')
    .catch((e) => ({ ok: false, motif: 'echec', detail: String((e && e.message) || e), info: null })),
});
