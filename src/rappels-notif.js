'use strict';

/*
 * LES NOTIFICATIONS DE RAPPELS — PROCESSUS PRINCIPAL (2026-10-02)
 * =============================================================================
 * Sa demande : « un module de rappel, par exemple pour les entrées des
 * dépenses ». Les rappels vivent dans le SITE (assets/js/rappels.js) ; ce module
 * demande au site, par la MÊME porte que les fenêtres (`executerOpSite` de
 * main.js, celle de `pont:appeler`), les rappels DUS (`rappels:etat`), et en
 * fait des notifications de bureau — un clic ouvre le module du rappel.
 *
 * QUAND : à l'ouverture d'une session (20 s après, le temps que le site ait
 * chargé ses listes), puis toutes les 15 minutes tant qu'elle est ouverte.
 *
 * ⚠ UNE NOTIFICATION PAR RAPPEL ET PAR JOUR. Le relevé des rappels déjà
 * annoncés vit dans `reglages` (`rappelsNotifies : { jour, ids }`) : relancer
 * l'application le même jour ne les ré-annonce pas. Le lendemain, la liste
 * repart à vide — un rappel encore en retard se rappelle, c'est voulu.
 * ⚠ AU-DELÀ DE TROIS NOUVEAUX D'UN COUP, UNE SEULE NOTIFICATION DE PLUS les
 * résume : dix bulles à l'ouverture d'une session ne se lisent pas.
 * ⚠ LE RÉGLAGE `notifRappels` (défaut : oui) les coupe ; il se change dans la
 * fenêtre Rappels (`rappels:notif`).
 *
 * ⚠ LES TEXTES PASSENT PAR `TR(...)` — dictionnaire `src/langue/rappelsnotif.js`,
 * gardé par `banc-langue-processus-principal` comme les autres surfaces du
 * processus principal. Les TITRES des rappels proposés arrivent en français du
 * site : ils passent par le vocabulaire du site (`vocabulaire-site.js`), comme à
 * l'affichage dans les fenêtres. Un titre écrit par quelqu'un reste tel quel.
 */

const LANGUE = require('./langue');
const TR = LANGUE.tr('rappelsnotif');
const VOCAB = require('./vocabulaire-site.js');

const QUINZE_MINUTES = 15 * 60 * 1000;
const APRES_CONNEXION = 20 * 1000;
const MAX_DETAIL = 3;

/* Le nom d'un module, dans la langue du poste. ⚠ Les clés sont celles des
   fenêtres (dock), les mêmes que `Rappels.MODULES` du site. */
const nomModule = (cle) => ({
  depenses: TR('Dépenses'),
  vehicules: TR('Véhicules et déplacements'),
  impot: TR('Fiscalité et impôt'),
  bankrec: TR('Conciliation bancaire'),
  livre: TR('Livre de comptes'),
  compta: TR('Rapports et budget'),
  factures: TR('Factures'),
  inventaire: TR('Inventaire'),
  commandes: TR('Commandes'),
})[cle] || TR('Rappels');

const titreLu = (t) => {
  const s = String(t || '');
  if (LANGUE.langueCourante() === 'en' && Object.prototype.hasOwnProperty.call(VOCAB, s)) return VOCAB[s];
  return s;
};

/* En dates de calendrier, comme le site : un changement d'heure ne décale rien. */
const jours = (de, a) => {
  const t = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  try { return Math.round((t(a) - t(de)) / 86400000); } catch (e) { return 0; }
};
const echeance = (r, auj) => {
  const n = jours(r.prochaine || auj, auj);
  if (n <= 0) return TR('À faire aujourd’hui');
  if (n === 1) return TR('En retard d’un jour');
  return TR('En retard de {0} jours', n);
};

/**
 * @param {object} o
 *   executerOp(nom, args) → Promise<réponse> — la porte du site (main.js)
 *   notifier(titre, corps, { aller }) — la fabrique de notifications (main.js)
 *   sessionOuverte() → bool
 *   reglages — get / set
 */
function creer(o) {
  let minuterie = null, premiere = null, enCours = false;

  const actif = () => { try { return o.reglages.get('notifRappels') !== false; } catch (e) { return true; } };

  const deja = (auj) => {
    let m = null;
    try { m = o.reglages.get('rappelsNotifies'); } catch (e) {}
    return (m && m.jour === auj && Array.isArray(m.ids)) ? m.ids.slice() : [];
  };

  const verifier = async () => {
    if (enCours || !actif() || !o.sessionOuverte()) return { ok: false, motif: 'hors' };
    enCours = true;
    try {
      const r = await o.executerOp('rappels:etat', []);
      if (!r || !r.ok || !Array.isArray(r.dus)) return r || { ok: false };
      const auj = String(r.aujourdhui || '');
      const vus = deja(auj);
      const neufs = r.dus.filter((x) => x && x.id && vus.indexOf(x.id) < 0);
      neufs.slice(0, neufs.length > MAX_DETAIL + 1 ? MAX_DETAIL : neufs.length).forEach((x) => {
        o.notifier(TR('Rappel : {0}', titreLu(x.titre)),
          TR('{0} — cliquez pour ouvrir {1}', echeance(x, auj), nomModule(x.module)),
          { aller: x.module || 'rappels' });
      });
      if (neufs.length > MAX_DETAIL + 1) {
        const reste = neufs.length - MAX_DETAIL;
        o.notifier(TR('{0} autres rappels à faire', reste), TR('Cliquez pour ouvrir les Rappels'), { aller: 'rappels' });
      }
      if (neufs.length) {
        try { o.reglages.set('rappelsNotifies', { jour: auj, ids: vus.concat(neufs.map((x) => x.id)).slice(-200) }); } catch (e) {}
      }
      return { ok: true, nouveaux: neufs.length, dus: r.dus.length };
    } catch (e) {
      return { ok: false, motif: 'echec' };
    } finally { enCours = false; }
  };

  /* Appelé à chaque modèle de menu reçu du site : on n'arme qu'au passage
     fermé → ouvert, on désarme à la fermeture. */
  let ouvert = false;
  const surSession = (connecte) => {
    if (connecte && !ouvert) {
      ouvert = true;
      clearTimeout(premiere);
      premiere = setTimeout(verifier, APRES_CONNEXION);
      clearInterval(minuterie);
      minuterie = setInterval(verifier, QUINZE_MINUTES);
    } else if (!connecte && ouvert) {
      ouvert = false;
      clearTimeout(premiere); clearInterval(minuterie);
      premiere = null; minuterie = null;
    }
  };

  return { surSession, verifier, actif };
}

module.exports = { creer, nomModule, echeance };
