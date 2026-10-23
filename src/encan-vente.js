'use strict';

/*
 * ENCAN EN DIRECT — LA VENTE (2026-10-23, lot 2)
 * =============================================================================
 * Le moteur (src/encan.js) déclare une gagnante ; ce module en fait une VENTE au serveur du site
 * (turso-proxy, ops encan_* — lib-encan.php) et la suit jusqu au paiement :
 *   · adjugé            → `encan:vendre` : l article est réservé, un lien PERSONNEL est rendu
 *                         (et envoyé par courriel si le pseudo est déjà rattaché : la vente vaut alors « GAGNÉ ») ;
 *   · « GAGNÉ » reçu    → `encan:gagne`  : le délai passe à 24 h pour payer ;
 *   · remis en vente / annulé → `encan:annuler` : l article revient en stock, le lien est désactivé ;
 *   · toutes les 10 s   → `encan:etat`   : payée → le moteur la note VENDUE, sans geste de la console.
 * ⚠ Ni réseau ni fenêtre ici : `appeler(op, ...args)` est injecté (le pont du site dans main.js, une
 *   imitation dans tools/banc-encan.js). L objet `gagnant` du moteur porte la vente (`gagnant.vente`) :
 *   l état poussé aux fenêtres la montre sans rien recopier.
 */

class VentesEncan {
  constructor(opts) {
    this.moteur = opts.moteur;
    this.appeler = opts.appeler;
    this.avertir = opts.avertir || (() => {});
    this.maintenant = opts.maintenant || (() => Date.now());
    this.suivies = new Map();   // id de la vente → objet gagnant du moteur
  }

  /* Après chaque changement d état du moteur : une gagnante sans vente en reçoit une. */
  observer() {
    const m = this.moteur;
    if (m.phase === 'adjuge' && m.gagnant && !m.gagnant.vente) this._creer(m.gagnant, m.article);
  }

  async _creer(g, article) {
    const m = this.moteur;
    g.vente = { etat: 'creation' };   // posé AVANT l attente : un second observer() ne crée pas de doublon
    let r = null;
    try {
      r = await this.appeler('encan:vendre', { article: article || {}, montant: g.montant, pseudo: g.pseudo, essai: !!m.essai,
        delaiGagne: m.reglages && m.reglages.delaiGagne });
    } catch (e) { r = null; }
    const issue = g.vente.issue;   // remis en vente / annulé / GAGNÉ pendant la création : appliqué maintenant
    if (!r || !r.ok) {
      g.vente = { etat: 'erreur', motif: (r && r.motif) || 'echec' };
      this.avertir();
      return;
    }
    g.vente = { etat: 'attente', id: String(r.id), url: String(r.url || ''), expire: Number(r.expire) || 0, essai: !!r.essai,
      reserve: !!r.reserve, courriel: String(r.courriel || '') };
    this.suivies.set(g.vente.id, g);
    if (issue) this.surIssue(g, issue);
    else if (g.vente.courriel) this._confirmer(g);   // lien parti par courriel : la gagnante a son lien, pas besoin de « GAGNÉ »
    this.avertir();
  }

  /* Le moteur tranche le sort d une gagnante : 'gagne' (message reçu), 'remis' (remise en vente), 'annule'. */
  surIssue(g, issue) {
    const v = g && g.vente;
    if (!v) return;
    if (v.etat === 'creation') { v.issue = issue; return; }
    if (!v.id || v.etat !== 'attente') return;
    if (issue === 'gagne') {
      if (v.gagne) return;
      v.gagne = this.maintenant();
      Promise.resolve(this.appeler('encan:gagne', v.id)).then((r) => {
        if (r && r.ok && r.expire) v.expire = Number(r.expire);
        this.avertir();
      }).catch(() => {});
      return;
    }
    v.etat = 'fermeture';
    Promise.resolve(this.appeler('encan:annuler', v.id, issue === 'remis' ? 'remise en vente' : 'encan annulé')).then((r) => {
      // Refus « payee » : l argent est arrivé entre-temps — le suivi le dira au prochain tour.
      v.etat = (r && r.ok) ? 'annulee' : 'attente';
      if (r && r.ok) this.suivies.delete(v.id);
      this.avertir();
    }).catch(() => { v.etat = 'attente'; });
  }

  /* La vente est payée (ou son lien est parti par courriel) : le moteur la note vendue. */
  _confirmer(g) {
    const m = this.moteur;
    if (m.phase === 'adjuge' && m.gagnant === g) { m.confirmerGagne(); return; }
    const a = (m.attentes || []).find((x) => x.gagnant === g);
    if (a) m.confirmerAttente(a.cle);
  }

  /* Le suivi : l état des ventes ouvertes, au serveur. */
  async suivre() {
    const ids = [...this.suivies].filter(([, g]) => g.vente && g.vente.etat === 'attente').map(([id]) => id);
    if (!ids.length) return 0;
    let r = null;
    try { r = await this.appeler('encan:etat', ids); } catch (e) { r = null; }
    if (!r || !r.ok || !r.ventes) return 0;
    let n = 0;
    for (const id of ids) {
      const s = r.ventes[id], g = this.suivies.get(id);
      if (!s || !g || !g.vente) continue;
      const v = g.vente, avant = v.etat + '|' + v.adresse + '|' + v.paiementOuvert;
      v.adresse = !!s.adresse; v.paiementOuvert = !!s.paiementOuvert;
      if (s.expire) v.expire = Number(s.expire);
      if (s.statut === 'payee') {
        v.etat = 'payee'; v.commande = String(s.commande || ''); v.payeeLe = this.maintenant();
        this.suivies.delete(id);
        this._confirmer(g);
      } else if (s.statut === 'expiree' || s.statut === 'annulee') {
        v.etat = s.statut;
        this.suivies.delete(id);
      }
      if (avant !== v.etat + '|' + v.adresse + '|' + v.paiementOuvert) n++;
    }
    if (n) this.avertir();
    return n;
  }
}

module.exports = { VentesEncan };
