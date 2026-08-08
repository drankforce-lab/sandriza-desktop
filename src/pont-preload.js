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
    const attente = ipcRenderer.invoke('pont:appeler', String(op || ''), args)
      .then((r) => { fini = true; return r; })
      .catch(() => { fini = true; return { ok: false, motif: 'pont_indisponible' }; });
    const plafond = new Promise((resoudre) => {
      setTimeout(() => { if (!fini) resoudre({ ok: false, motif: 'delai' }); }, 25000);
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
