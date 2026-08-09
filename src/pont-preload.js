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
    const LONGUES = { 'produit:enregistrer': 90000, 'produit:photoIa': 120000,
      'commande:etiquette': 60000, 'expedition:etiquette': 60000,
      'remboursement:ecrire': 45000, 'commandes:supprimerEcrire': 45000,
      'commandes:fraisEcrire': 45000, 'retour:finaliser': 45000,
      'produit:detourer': 30000, 'produit:teinter': 30000, 'stock:etiquettes': 30000,
      'stock:endommagesRapport': 30000, 'facture:imprimer': 30000, 'commande:bon': 30000,
      'retours:liste': 20000, 'ramassages:annuler': 30000, 'ramassages:planifier': 45000,
      'paiements:charger': 65000,
      'etat:courriel': 35000, 'cartescadeaux:liste': 25000,
      'messagerie:liste': 20000, 'messagerie:repondre': 30000 };
    const limite = (LONGUES[nom] || 20000) + 5000;
    const plafond = new Promise((resoudre) => {
      setTimeout(() => { if (!fini) resoudre({ ok: false, motif: 'delai' }); }, limite);
    });
    return Promise.race([attente, plafond]);
  },

  // Fermer proprement — la fenêtre n'a pas de barre de menu à elle.
  fermer: () => ipcRenderer.send('pont:fermer'),

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
});
