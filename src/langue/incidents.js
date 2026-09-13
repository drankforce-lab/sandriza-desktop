'use strict';

/*
 * INCIDENTS DE SECURITE — les deux langues
 * =============================================================================
 * ⚠⚠⚠ CE REGISTRE EST UNE OBLIGATION LEGALE, PAS UN OUTIL DE CONFORT. La phrase
 * de la Loi 25 porte quatre faits qu on ne resume pas : TOUT incident se
 * consigne — meme sans risque de prejudice serieux —, le registre se remet a la
 * COMMISSION D ACCES A L INFORMATION sur demande, chaque entree est conservee
 * CINQ ANS apres la prise de connaissance puis se retire d elle-meme, et ce
 * registre n est PAS PUBLIC. En perdre un seul change ce que la loi exige.
 *
 * ⚠⚠ LA DATE DE PRISE DE CONNAISSANCE FAIT COURIR LES DELAIS LEGAUX : c est la
 * raison donnee quand elle manque, et c est la seule chose qui explique pourquoi
 * elle est obligatoire alors que tout le reste est facultatif.
 *
 * ⚠⚠ LE REFUS DE SUPPRESSION DIT CE QU ON N EFFACE PAS : « Ne retirez qu’une
 * saisie erronée, JAMAIS UN INCIDENT REEL. » Un registre qu on nettoie n est
 * plus un registre.
 *
 * ⚠ LES ETAPES, LES CHAMPS ET LEURS LIBELLES VIENNENT DU COEUR (`D.etapes`) :
 * ils ne passent pas par ici. Le RECIT d un incident, son type, sa reference et
 * le nombre de personnes touchees sont des donnees — elles seront relues par la
 * Commission.
 * ⚠ « CAI » reste « CAI » : c est le sigle de la Commission d acces a
 * l information du Quebec.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Incidents de sécurité — Administration Sandriza':
    'Security incidents — Sandriza Administration',
  'Incidents de sécurité': 'Security incidents',
  'Lecture seule : vous pouvez consulter le registre, pas le modifier.':
    'Read only: you can view the register, not change it.',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne donne pas accès au registre des incidents.':
    'Your role does not give access to the incident register.',
  'Votre rôle est en lecture seule.': 'Your role is read only.',
  'Formulaire invalide.': 'Invalid form.',
  'Incident introuvable.': 'Incident not found.',
  'Action refusée par le serveur.': 'Action refused by the server.',
  /* ⚠ L apostrophe DROITE : la source ecrit celle-la entre guillemets doubles. */
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',
  'Échec : ': 'Failed: ',
  'Échec :': 'Failed:',

  /* ══ LA PHRASE DE LA LOI 25 — QUATRE FAITS, AUCUN NE SE RESUME ═════════════ */
  'La <b>Loi 25</b> impose de consigner <b>tout</b> incident de confidentialité — même sans risque de préjudice sérieux — et de pouvoir remettre ce registre à la <b>Commission d’accès à l’information</b> sur demande. Chaque entrée est conservée <b>cinq ans</b> après la prise de connaissance, puis retirée d’elle-même. Ce registre n’est pas public.':
    '<b>Law 25</b> requires every confidentiality incident to be recorded — even with no risk of serious harm — and this register to be handed to the <b>Commission d’accès à l’information</b> on request. Each entry is kept for <b>five years</b> after it became known, then removes itself. This register is not public.',
  'La Loi 25 impose de consigner tout incident de confidentialité — même sans risque de préjudice sérieux — et de pouvoir remettre ce registre à la Commission d’accès à l’information sur demande. Chaque entrée est conservée cinq ans après la prise de connaissance, puis retirée d’elle-même. Ce registre n’est pas public.':
    'Law 25 requires every confidentiality incident to be recorded — even with no risk of serious harm — and this register to be handed to the Commission d’accès à l’information on request. Each entry is kept for five years after it became known, then removes itself. This register is not public.',
  '＋ Consigner un incident': '＋ Record an incident',

  /* ── LES QUATRE COMPTEURS ───────────────────────────────────────────────── */
  'Au registre': 'In the register',
  'Dossiers ouverts': 'Open files',
  'Préjudice sérieux': 'Serious harm',
  'Avis CAI à faire': 'CAI notices to send',

  /* ── LE REGISTRE ────────────────────────────────────────────────────────── */
  'Aucun incident consigné.': 'No incident recorded.',
  'C’est la bonne nouvelle — le registre doit tout de même exister et être tenu à jour.':
    'That is the good news — the register must exist all the same, and be kept up to date.',
  'Aucun incident consigné. C’est la bonne nouvelle — le registre doit tout de même exister et être tenu à jour.':
    'No incident recorded. That is the good news — the register must exist all the same, and be kept up to date.',
  'Prise de connaissance': 'Became known',
  'Survenance': 'Occurred',
  'Type': 'Type',
  'Personnes': 'People',
  'Risque': 'Risk',
  'Avis CAI': 'CAI notice',
  'État': 'Status',
  'Prise de connaissance Survenance Type Personnes': 'Became known Occurred Type People',
  'Risque Avis CAI État': 'Risk CAI notice Status',
  /* ⚠ Les VALEURS (`oui`, `evaluation`, `clos`, `surveille`) restent nues. */
  'En évaluation': 'Being assessed',
  'Sans risque sérieux': 'No serious risk',
  'Clôturé': 'Closed',
  'Surveillé': 'Watched',
  'Ouvert': 'Open',
  'Voir le détail': 'See the detail',
  ' Détail': ' Detail',
  '👁 Détail': '👁 Detail',
  ' Modifier': ' Edit',
  '✏ Modifier': '✏ Edit',
  'Retirer': 'Remove',
  '✓ Confirmer': '✓ Confirm',
  /* ⚠⚠ CE QU ON N EFFACE PAS : un registre qu on nettoie n est plus un registre. */
  'Le registre se conserve CINQ ANS. Ne retirez qu’une saisie erronée, jamais un incident réel — cliquez encore pour confirmer.':
    'The register is kept for FIVE YEARS. Only remove a mistaken entry, never a real incident — click again to confirm.',
  '← Précédent': '← Previous',
  'Suivant →': 'Next →',

  /* ══ L ASSISTANT ═══════════════════════════════════════════════════════════ */
  'Consigner un incident': 'Record an incident',
  'Modifier l’incident': 'Edit the incident',
  /* ⚠ Le <b> coupe la phrase : la cle porte la balise, et la forme rendue suit. */
  'Registre des incidents de sécurité (Loi 25) — parcourez les étapes ; seule la <b>date de prise de connaissance</b> est obligatoire.':
    'Security incident register (Law 25) — walk through the steps; only the <b>date it became known</b> is required.',
  'Registre des incidents de sécurité (Loi 25) — parcourez les étapes ; seule la date de prise de connaissance est obligatoire.':
    'Security incident register (Law 25) — walk through the steps; only the date it became known is required.',
  'Un incident': 'An incident',
  'Enregistrer les modifications': 'Save the changes',
  /* ⚠⚠ POURQUOI CETTE DATE-LA EST OBLIGATOIRE. */
  'La date de prise de connaissance est obligatoire — elle fait courir les délais légaux.':
    'The date it became known is required — it starts the legal deadlines running.',

  /* ── LA FICHE ET LES VERDICTS ───────────────────────────────────────────── */
  'Incident — ': 'Incident — ',
  'Incident —': 'Incident —',
  'Aucun détail saisi.': 'No detail entered.',
  'Incident consigné au registre.': 'Incident recorded in the register.',
  'Incident mis à jour.': 'Incident updated.',
  'Retrait…': 'Removing…',
  'Entrée retirée du registre.': 'Entry removed from the register.'
};
