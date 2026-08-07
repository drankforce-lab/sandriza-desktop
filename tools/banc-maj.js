#!/usr/bin/env node
'use strict';

/*
 * BANC D'ESSAI — PROTECTION DU PROCESSUS PENDANT UNE MISE À JOUR
 * =============================================================================
 * Ce garde a deux façons de mal tourner, et la seconde est PIRE que le défaut
 * qu'il corrige :
 *
 *   1. Trop permissif : on ferme pendant le téléchargement, l'installation reste
 *      à moitié faite, l'application ne redémarre plus.
 *   2. Trop strict : le garde bloque le redémarrage qui INSTALLE la mise à jour,
 *      ou reste coincé après une panne réseau. L'application se télécharge en
 *      boucle sans jamais s'installer, ou ne se ferme plus du tout — et l'on
 *      finit par la tuer depuis le gestionnaire des tâches, c'est-à-dire
 *      exactement le geste qu'on voulait éviter.
 *
 * ⚠ CE BANC REPRODUIT LA DÉCISION, il ne l'importe pas : `main.js` a besoin du
 * processus principal d'Electron pour être chargé. La règle testée est donc
 * recopiée juste en dessous et doit rester d'accord avec `fermetureBloquee()`.
 * C'est un test de RAISONNEMENT sur la machine à états, et c'est là que sont les
 * erreurs — pas dans trois lignes de conditions.
 *
 *     node tools/banc-maj.js
 */

const MAJ_SANS_PROGRES_MS = 3 * 60 * 1000;

// ── La règle, recopiée de src/main.js ───────────────────────────────────────
const faire = (e) => {
  const majFigee = () => e.dernierOctet > 0 && (e.maintenant - e.dernierOctet) > MAJ_SANS_PROGRES_MS;
  return e.majCritique && !e.quitAutorise && !majFigee();
};

const T0 = 1_000_000_000_000;
const etat = (o) => Object.assign({
  majCritique: false, quitAutorise: false, dernierOctet: 0, maintenant: T0,
}, o);

let fautes = 0;
const exige = (nom, attenduBloque, e) => {
  const bloque = faire(e);
  const ok = bloque === attenduBloque;
  console.log('  ' + (ok ? 'OK  ' : 'NON ') + nom.padEnd(52)
    + (bloque ? 'fermeture BLOQUEE' : 'fermeture permise')
    + (ok ? '' : '   <-- on attendait ' + (attenduBloque ? 'BLOQUEE' : 'permise')));
  if (!ok) fautes++;
};

console.log('\n=== Mise à jour : quand la fermeture est-elle bloquée ? ===');

// 1. Rien en cours : on ferme quand on veut. C'est le cas de tous les jours, et
//    le rendre bloquant serait le pire des defauts.
exige('au repos, aucune verification', false, etat());

// 2. Une simple VERIFICATION ne bloque pas : elle dure une seconde et
//    l'interrompre ne coute rien. (`majCritique` n'est pose qu'au 1er octet.)
exige('verification en cours, aucun octet recu', false, etat({ majCritique: false }));

// 3. Le telechargement est parti : c'est LA zone a proteger.
exige('telechargement en cours', true, etat({ majCritique: true, dernierOctet: T0 - 2000 }));

// 4. PLAFOND DE SECURITE : plus de 3 minutes sans un octet. Un telechargement
//    fige (serveur muet, veille, reseau disparu) ne doit pas condamner le poste.
exige('telechargement fige depuis 3 min', false,
  etat({ majCritique: true, dernierOctet: T0 - (MAJ_SANS_PROGRES_MS + 1000) }));
exige('telechargement lent mais vivant (2 min)', true,
  etat({ majCritique: true, dernierOctet: T0 - 120000 }));

// 5. LE LAISSEZ-PASSER. `installerEtRelancer` doit pouvoir quitter, sinon la
//    mise a jour se telecharge indefiniment sans jamais s'installer.
exige('redemarrage pour installer (laissez-passer)', false,
  etat({ majCritique: true, quitAutorise: true, dernierOctet: T0 - 2000 }));

// 6. Paquet telecharge, l'usager repond << Plus tard >>. `majCritique` est
//    RELACHE a cet instant : fermer l'application est precisement ce qui installe
//    la mise a jour (autoInstallOnAppQuit). Bloquer la empecherait pour toujours
//    l'installation que le garde est cense proteger.
exige('paquet pret, reporte a plus tard', false,
  etat({ majCritique: false, dernierOctet: T0 - 2000 }));

// 7. Echec du telechargement : le verrou est relache, sinon une panne de reseau
//    laisse un poste qu'on ne peut plus fermer.
exige('echec du telechargement', false, etat({ majCritique: false, dernierOctet: T0 - 5000 }));

console.log(fautes
  ? '\n>>> ' + fautes + ' regle(s) violee(s) : le garde bloquerait ou laisserait passer a tort\n'
  : '\n>>> Le garde protege le telechargement, et rien d autre\n');
process.exit(fautes ? 1 : 0);
