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
});
