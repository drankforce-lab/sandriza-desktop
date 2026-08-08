'use strict';

/*
 * Pont de la FENÊTRE DE MENU DÉTACHÉE.
 *
 * Volontairement minuscule : cette fenêtre n'affiche qu'un menu, elle n'a aucune
 * raison de voir les imprimantes, les clés USB ou les exports. Lui donner le
 * pont complet (preload.js) élargirait la surface exposée sans aucun gain.
 *
 * Le clic ne fait qu'ANNONCER l'intention ; c'est le processus principal qui
 * l'exécute dans la page d'administration de la fenêtre principale — donc le
 * même code que les boutons du site, gardes de permission comprises.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('szPalette', {
  action: (payload) => ipcRenderer.send('palette:action', payload || {}),

  // La fenetre annonce la hauteur REELLE de son contenu, et le processus
  // principal l ajuste. C est la seule facon fiable de n avoir jamais de barre
  // de defilement : une hauteur fixe devinee a l avance se fait dementir par la
  // moindre ligne ajoutee, par un chemin plus long, ou par un poste dont la
  // mise a l echelle de Windows n est pas 100 %.
  ajusterHauteur: (h) => ipcRenderer.send('fenetre:hauteur', Math.round(h) || 0),

  // PANNEAU FLOTTANT D UN MENU (1.56.1) — il annonce sa taille reelle (la
  // fenetre s ajuste, position gardee) et son survol (le quitter le referme).
  taille: (w, h) => ipcRenderer.send('panneau:taille', Math.round(w) || 0, Math.round(h) || 0),
  survol: (dedans) => ipcRenderer.send('panneau:survol', !!dedans),
});
