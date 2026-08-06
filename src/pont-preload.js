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
  appeler: (op, ...args) => ipcRenderer.invoke('pont:appeler', String(op || ''), args)
    .catch(() => ({ ok: false, motif: 'pont_indisponible' })),

  // Fermer proprement — la fenêtre n'a pas de barre de menu à elle.
  fermer: () => ipcRenderer.send('pont:fermer'),

  // La fenêtre annonce la hauteur réelle de son contenu ; le principal ajuste.
  // Même raison que la palette : une hauteur devinée d'avance se fait démentir
  // par la moindre ligne ajoutée ou par une mise à l'échelle Windows autre
  // que 100 %.
  ajusterHauteur: (h) => ipcRenderer.send('fenetre:hauteur', Math.round(h) || 0),
});
