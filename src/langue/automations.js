'use strict';

/*
 * AUTOMATISATIONS — les deux langues
 * =============================================================================
 * ⚠⚠⚠ L URL A CONFIGURER EST UNE ADRESSE, PAS UN TEXTE. Elle se copie d ici et
 * se colle chez le service qui appelle la tache a l heure dite. La traduire, la
 * couper ou la reecrire casserait la tache — et rien ne le dirait : elle
 * cesserait simplement de s executer. Seule l etiquette autour se lit.
 *
 * ⚠⚠ « À CHAQUE MEMBRE CONCERNÉ », « AU CLIENT CONCERNÉ » ET « AUCUN COURRIEL »
 * DISENT QUI RECOIT. Ce sont trois choses differentes, et la troisieme veut dire
 * que personne ne recevra rien. Les rapprocher fait croire qu un rapport part
 * alors qu il ne part pas, ou l inverse — envoyer a des clients ce qui etait
 * destine a l equipe.
 *
 * ⚠⚠ UN COURRIEL DESTINATAIRE VIDE N EST PAS UNE ERREUR : le texte d attente dit
 * ce qui arrive alors (« Vide = courriel professionnel »). Sans lui, on remplit
 * le champ par prudence et le rapport part au mauvais endroit.
 *
 * ⚠ LE NOM D UNE TACHE, SA DESCRIPTION, SA FREQUENCE, SA RECOMMANDATION, SON
 * PICTOGRAMME ET LE LIBELLE DE CHAQUE METRIQUE VIENNENT DU COEUR : ils ne sont
 * pas ecrits dans cette fenetre et ne peuvent pas etre atteints d ici.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Automatisations — Administration Sandriza':
    'Automations — Sandriza Administration',
  'Automatisations': 'Automations',
  'Lecture seule : vous pouvez consulter, pas modifier.':
    'Read only: you can look, not change.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Cette tâche n’existe plus.': 'This task no longer exists.',
  'Aucune tâche.': 'No task.',

  /* ══ QUI RECOIT ════════════════════════════════════════════════════════════
   * ⚠⚠ Trois destinataires differents — dont « personne ». Voir l en-tete. */
  'à chaque membre concerné': 'to each staff member concerned',
  'au client concerné': 'to the customer concerned',
  'aucun courriel': 'no email',

  /* ── LA FREQUENCE ───────────────────────────────────────────────────────── */
  ' Fréquence recommandée : ': ' Recommended frequency: ',
  '💡 Fréquence recommandée :': '💡 Recommended frequency:',

  /* ══ LE COURRIEL DESTINATAIRE ══════════════════════════════════════════════
   * ⚠⚠ VIDE N EST PAS UNE ERREUR : le texte d attente dit ou cela part. */
  'Courriel destinataire': 'Recipient email',
  'Vide = courriel professionnel': 'Empty = business email',
  'Courriel enregistré.': 'Email saved.',

  /* ══ LES METRIQUES ═════════════════════════════════════════════════════════
   * ⚠ Le libelle de chaque metrique vient du coeur. */
  ' Métriques du courriel': ' Metrics of the email',
  '📋 Métriques du courriel': '📋 Metrics of the email',
  'Cochez ce que vous voulez recevoir (données de la veille).':
    'Tick what you want to receive (yesterday’s data).',
  'Enregistrer les métriques': 'Save the metrics',
  'Métriques enregistrées.': 'Metrics saved.',

  /* ══ L ADRESSE DE RAPPEL ═══════════════════════════════════════════════════
   * ⚠⚠⚠ L URL elle-meme ne se traduit PAS. Voir l en-tete. */
  'URL à configurer (': 'URL to set up (',
  'Adresse de rappel à copier': 'Callback address to copy',
  ' Copier': ' Copy',
  '📋 Copier': '📋 Copy',
  'URL copiée.': 'URL copied.',
  'Copie impossible — sélectionnez et copiez à la main.':
    'Copy failed — select it and copy by hand.',
  'Sélectionnez le champ et copiez à la main.':
    'Select the field and copy by hand.',
  'Copie impossible.': 'Copy failed.'
};
