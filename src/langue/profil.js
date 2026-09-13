'use strict';

/*
 * MON PROFIL — les deux langues
 * =============================================================================
 * ⚠⚠⚠ LES QUESTIONS DE SECURITE NE SE TRADUISENT PAS, ET LA RAISON EST LA MEME
 * QUE DANS `securite` : la liste vient du coeur, la question CHOISIE est ECRITE
 * dans le compte, et RELUE telle quelle le jour ou l on a perdu son mot de
 * passe. Une question traduite ici ne correspondrait plus a celle qui est
 * enregistree — compte irrecuperable, et rien ne le dirait avant ce jour-la.
 * Seul « — Choisir — », qui ne vaut rien, se traduit. ⚠ LES REPONSES non plus :
 * elles sont comparees caractere par caractere.
 *
 * ⚠⚠ CE QUE CETTE FENETRE NE DECIDE PAS, ET QU ELLE DIT DEUX FOIS : « Le mot de
 * passe actuel est vérifié PAR LE SERVEUR, pas par cette fenêtre », et
 * l indication de robustesse est « une indication, LE SERVEUR DECIDE ». Perdre
 * ces deux-la ferait croire a un refus local qu on pourrait contourner.
 *
 * ⚠⚠ SANS QUESTIONS DE SECURITE, LE COMPTE NE SE RECUPERE PAS PAR CETTE VOIE.
 * La phrase le dit en toutes lettres ; c est la seule chose qui donne envie de
 * les remplir avant d en avoir besoin.
 *
 * ⚠ Le nom, le courriel et le role du compte viennent du serveur.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Mon profil — Administration Sandriza': 'My profile — Sandriza Administration',
  'Mon profil': 'My profile',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Saisie invalide.': 'Invalid entry.',
  'Le serveur a refusé la modification.': 'The server refused the change.',
  /* ⚠ L apostrophe DROITE : la source ecrit celle-la entre guillemets doubles. */
  "La fenêtre principale n'a pas répondu à temps.": 'The main window did not answer in time.',

  /* ── LE COMPTE ──────────────────────────────────────────────────────────── */
  'Votre compte': 'Your account',
  /* ⚠ Le role VIENT DU SERVEUR : seule l etiquette se lit, jamais la valeur. */
  'Rôle': 'Role',
  'Dernière connexion': 'Last sign-in',

  /* ══ CE QUI PROTEGE LE COMPTE ══════════════════════════════════════════════ */
  'Ce qui protège votre compte': 'What protects your account',
  'Mot de passe': 'Password',
  /* ⚠ Le <b> coupe la phrase : la cle porte la balise, la forme rendue suit. */
  '<b>Mot de passe</b><span>Vérifié par le serveur à chaque connexion.</span>':
    '<b>Password</b><span>Checked by the server at every sign-in.</span>',
  'Mot de passe Vérifié par le serveur à chaque connexion.':
    'Password Checked by the server at every sign-in.',
  'Vérifié par le serveur à chaque connexion.': 'Checked by the server at every sign-in.',
  'Questions de sécurité': 'Security questions',
  /* ⚠⚠ SANS ELLES, LE COMPTE NE SE RECUPERE PAS PAR CETTE VOIE. */
  'Elles permettront de retrouver votre accès si vous perdez votre mot de passe.':
    'They will let you get your access back if you lose your password.',
  'Sans elles, votre compte ne pourra pas être récupéré par cette voie.':
    'Without them, your account cannot be recovered this way.',
  'À faire': 'To do',
  /* La pastille des questions : remplies, ou pas encore. */
  'Prêtes': 'Ready',
  'Absentes': 'Missing',

  /* ── LE CHANGEMENT DE MOT DE PASSE ──────────────────────────────────────── */
  'Changer le mot de passe': 'Change the password',
  /* ⚠⚠ CE N EST PAS CETTE FENETRE QUI VERIFIE.
     Le <b> coupe la phrase : la cle POSEE porte la balise, la forme RENDUE suit
     pour le banc residuel. */
  'Le mot de passe <b>actuel</b> est vérifié par le serveur, pas par cette fenêtre.':
    'The <b>current</b> password is checked by the server, not by this window.',
  'Le mot de passe actuel est vérifié par le serveur, pas par cette fenêtre.':
    'The current password is checked by the server, not by this window.',
  'Mot de passe actuel': 'Current password',
  'Nouveau mot de passe': 'New password',
  'Huit caractères au moins. Un mot de passe déjà utilisé sera refusé.':
    'Eight characters at least. A password already used will be refused.',
  'Masquer le mot de passe': 'Hide the password',
  'Afficher le mot de passe': 'Show the password',
  /* ⚠⚠ UNE INDICATION, PAS UN VERDICT. */
  'Indication de robustesse': 'Strength hint',
  'Court': 'Short',
  'Correct': 'Fair',
  'Bon': 'Good',
  'Excellent': 'Excellent',
  ' — indication, le serveur décide': ' — a hint; the server decides',
  '— indication, le serveur décide': '— a hint; the server decides',
  'Vérification…': 'Checking…',
  'Enregistrer le nouveau mot de passe': 'Save the new password',

  /* ══ LES QUESTIONS DE SECURITE ═════════════════════════════════════════════
   * ⚠⚠ Voir l en-tete : ni les questions ni les reponses ne passent par ici. */
  '— Choisir —': '— Choose —',
  'Question 1': 'Question 1',
  'Réponse 1': 'Answer 1',
  'Question 2': 'Question 2',
  'Réponse 2': 'Answer 2',
  'Enregistrer les questions': 'Save the questions',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Mot de passe modifié.': 'Password changed.',
  'Questions de sécurité enregistrées.': 'Security questions saved.',

  /* ── LES MOTS SEULS (2026-09-13) ─────────────────────────────────────────── */
  'Courriel': 'Email',
  'Identifiant': 'Username',
  'Actif': 'Active'
};
