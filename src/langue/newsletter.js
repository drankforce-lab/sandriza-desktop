'use strict';

/*
 * INFOLETTRE — les deux langues
 * =============================================================================
 * ⚠⚠ CET ECRAN DECIDE CE QUI PART CHEZ LA CLIENTE, et rien de plus. Il ne
 * redige aucun courriel : il configure la cle Resend, l identite de l expediteur
 * et les NEUF interrupteurs qui autorisent ou coupent chaque service d envoi.
 * La phrase qui dit « un service desactive ne consomme pas de quota Resend » est
 * la seule qui explique pourquoi on couperait quoi que ce soit.
 *
 * ⚠⚠ LES NEUF SERVICES SONT DES DESCRIPTIONS, PAS DES TITRES. « Envoye lors du
 * marquage Expediee », « Avis a support@ et reponse au client » : chacune dit
 * QUAND le courriel part. C est ce qu on lit avant de couper un interrupteur, et
 * une traduction vague ferait couper le mauvais.
 *
 * ⚠⚠⚠ L OFFRE DE BIENVENUE EST DU CONTENU DE BOUTIQUE, PAS DE L INTERFACE. Le
 * titre, le sous-titre, le texte du bouton et la mention legale sont TAPES ici
 * et LUS PAR LA VISITEUSE dans le popup. Ce sont des donnees : elles ne passent
 * pas par ce dictionnaire. Seul le texte de REPLI de l apercu (« JE M INSCRIS »)
 * est ecrit dans la fenetre — il est declare dans `SZ_DONNEES`, parce que
 * l apercu doit montrer ce que la visiteuse verra, et elle lit le francais.
 *
 * ⚠ « Resend » est un nom de produit, « resend.com/api-keys » une adresse : ni
 * l un ni l autre ne se traduit.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Infolettre — Administration Sandriza': 'Newsletter — Sandriza Administration',
  'Infolettre': 'Newsletter',
  'Infolettre indisponible': 'Newsletter unavailable',
  'Lecture seule': 'Read only',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle ne permet pas cette modification.': 'Your role does not allow this change.',
  'Format d’image invalide.': 'Invalid image format.',
  'Aucune réponse de la fenêtre principale.': 'No answer from the main window.',

  /* ── LES ONGLETS ────────────────────────────────────────────────────────── */
  'Tableau de bord': 'Dashboard',
  'Configuration': 'Configuration',
  '⚙ Configuration': '⚙ Configuration',
  'Offre bienvenue': 'Welcome offer',

  /* ── L ECRAN D AMORCE ───────────────────────────────────────────────────── */
  'Configurer Resend': 'Set up Resend',
  '📧 Configurer Resend': '📧 Set up Resend',
  'Configurez votre clé API Resend pour commencer à envoyer des infolettres.':
    'Set up your Resend API key to start sending newsletters.',
  'Configurer maintenant →': 'Set up now →',

  /* ── LE TABLEAU DE BORD ─────────────────────────────────────────────────── */
  'Abonnés actifs': 'Active subscribers',
  '👥 Abonnés actifs': '👥 Active subscribers',
  ' désabonné': ' unsubscribed',
  'Campagnes envoyées': 'Campaigns sent',
  '📣 Campagnes envoyées': '📣 Campaigns sent',
  ' en brouillon': ' in draft',
  'Courriels envoyés': 'Emails sent',
  '✉ Courriels envoyés': '✉ Emails sent',
  ' échoué': ' failed',
  'Chaînes actives': 'Active chains',
  '🔗 Chaînes actives': '🔗 Active chains',
  ' étape': ' step',
  ' en attente</div>': ' pending</div>',
  '⚙ Traiter les chaînes (': '⚙ Process the chains (',
  'Campagnes récentes': 'Recent campaigns',
  'Campagne': 'Campaign',
  'Envoyés': 'Sent',
  'Statut': 'Status',
  'Campagnes récentes Campagne Envoyés Statut': 'Recent campaigns Campaign Sent Status',
  'Envoyée': 'Sent',
  'En cours': 'In progress',
  'Brouillon': 'Draft',
  'Aucune campagne': 'No campaign',
  'Sources d’abonnés': 'Subscriber sources',
  'Aucun abonné encore.': 'No subscriber yet.',

  /* ══ LES NEUF SERVICES D ENVOI ══════════════════════════════════════════════
   * ⚠⚠ CHAQUE DESCRIPTION DIT *QUAND* LE COURRIEL PART. C est ce qu on lit
   * avant de couper un interrupteur : une traduction vague ferait couper le
   * mauvais service, et personne ne s en apercevrait avant qu une cliente se
   * plaigne de ne rien recevoir. */
  'Confirmation de commande': 'Order confirmation',
  'Envoyé au client après chaque commande réussie.':
    'Sent to the customer after every successful order.',
  'Expédition / suivi': 'Shipping / tracking',
  'Envoyé lors du marquage « Expédiée ».': 'Sent when the order is marked « Shipped ».',
  'Confirmation de livraison': 'Delivery confirmation',
  'Envoyé dès que le transporteur confirme la livraison.':
    'Sent as soon as the carrier confirms delivery.',
  'Offre de bienvenue': 'Welcome offer',
  'Code de réduction envoyé à l’inscription.': 'Discount code sent on sign-up.',
  'Carte-cadeau': 'Gift card',
  'Livraison par courriel lors de l’achat.': 'Delivered by email at purchase.',
  'Message hors-ligne (chat)': 'Offline message (chat)',
  'Avis admin quand un visiteur écrit hors-ligne.':
    'Admin notice when a visitor writes while offline.',
  'Réinitialisation de mot de passe': 'Password reset',
  'Avis de sécurité après un changement.': 'Security notice after a change.',
  'Séquences automatisées': 'Automated sequences',
  'Étapes des chaînes d’automation.': 'Steps of the automation chains.',
  'Demande de support client': 'Customer support request',
  'Avis à support@ et réponse au client.': 'Notice to support@ and reply to the customer.',

  /* ── LA CLE ET L IDENTITE DE L EXPEDITEUR ───────────────────────────────── */
  'API Resend': 'Resend API',
  '🔑 API Resend': '🔑 Resend API',
  'Clé API Resend *': 'Resend API key *',
  'Clé API Resend': 'Resend API key',
  'Créez votre clé sur ': 'Create your key at ',
  'Créez votre clé sur resend.com/api-keys': 'Create your key at resend.com/api-keys',
  'Courriel expéditeur *': 'Sender email *',
  'Le domaine doit être vérifié dans Resend': 'The domain must be verified in Resend',
  'Nom expéditeur': 'Sender name',
  'Répondre à (optionnel)': 'Reply to (optional)',
  'Nom de l’entreprise': 'Company name',
  'Adresse (pied de page)': 'Address (footer)',
  'Lien site web (pied de page)': 'Website link (footer)',
  'Courriel expéditeur — transactionnel': 'Sender email — transactional',
  'Expédition, cartes-cadeaux, alertes. Vide = courriel infolettre.':
    'Shipping, gift cards, alerts. Empty = newsletter email.',
  'Nom expéditeur — transactionnel': 'Sender name — transactional',
  'Mode test': 'Test mode',
  'Envoyer uniquement à l’adresse de test.': 'Send only to the test address.',
  'Mode test Envoyer uniquement à l’adresse de test.':
    'Test mode Send only to the test address.',
  'Courriel de test': 'Test email',
  'Enregistrer': 'Save',
  'Envoyer un courriel de test': 'Send a test email',
  'Enregistrer Envoyer un courriel de test': 'Save Send a test email',

  /* ── LES INTERRUPTEURS ──────────────────────────────────────────────────── */
  'Contrôle des envois par courriel': 'Control of the email sends',
  '🔕 Contrôle des envois par courriel': '🔕 Control of the email sends',
  /* ⚠ LA SEULE PHRASE QUI DIT POURQUOI ON COUPERAIT QUOI QUE CE SOIT. */
  'Un service désactivé ne consomme pas de quota Resend.':
    'A disabled service does not use any Resend quota.',
  'Enregistrer les contrôles': 'Save the controls',

  /* ── L OFFRE DE BIENVENUE ───────────────────────────────────────────────── */
  'Codes générés': 'Codes generated',
  'Codes utilisés': 'Codes used',
  'En attente': 'Pending',
  'Widget Offre de bienvenue': 'Welcome offer widget',
  'Bouton ': 'Button ',
  ' flottant + popup — suit le visiteur sur tout le site.':
    ' floating + popup — follows the visitor across the whole site.',
  'Widget Offre de bienvenue Bouton 🎁 flottant + popup — suit le visiteur sur tout le site.':
    'Welcome offer widget Button 🎁 floating + popup — follows the visitor across the whole site.',
  'Actif': 'Active',
  '✓ Un visiteur a déjà soumis ce widget. Utilisez « Réinitialiser » pour re-tester.':
    '✓ A visitor has already submitted this widget. Use « Reset » to test again.',
  'Titre (saut de ligne = ↵)': 'Title (line break = ↵)',
  'Image côté gauche': 'Image on the left',
  'Choisir une photo': 'Choose a photo',
  '📁 Choisir une photo': '📁 Choose a photo',
  '700 × 900 px recommandé (portrait). Max 600 Ko.':
    '700 × 900 px recommended (portrait). Max 600 KB.',
  'https://… ou coller une URL': 'https://… or paste a URL',
  'Aperçu': 'Preview',
  'Sous-titre': 'Subtitle',
  'Texte du bouton': 'Button text',
  'Valeur de réduction (%)': 'Discount value (%)',
  'Un code unique WB-XXXXXX par client, valide 1 commande, expire 30 j.':
    'A unique WB-XXXXXX code per customer, valid for 1 order, expires in 30 days.',
  'Mention légale': 'Legal notice',
  'Aperçu du popup': 'Preview the popup',
  '↺ Réinitialiser pour re-tester': '↺ Reset to test again',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Enregistrement…': 'Saving…',
  'Configuration enregistrée.': 'Configuration saved.',
  'Contrôles d’envoi enregistrés.': 'Send controls saved.',
  'Envoi du courriel de test…': 'Sending the test email…',
  'Courriel de test envoyé.': 'Test email sent.',
  'Image trop grande (max 600 Ko).': 'Image too large (max 600 KB).',
  'Lecture de l’image impossible.': 'Cannot read the image.',
  'Téléversement…': 'Uploading…',
  'Photo importée — cliquez Enregistrer.': 'Photo imported — click Save.',
  'Réinitialisé.': 'Reset.',
  'Traitement des chaînes…': 'Processing the chains…',
  'Aucune étape en attente.': 'No step pending.',
  ' envoyé': ' sent',
  ' échec': ' failure',

  /* ── LES FRAGMENTS EN MINUSCULES (2026-09-13) ───────────────────────────── */
  'en brouillon': 'draft',
  'en attente': 'waiting',
  // La refonte (2026-09-25) : deux formes entieres, plus de HTML dans une cle.
  'désabonnés': 'unsubscribed',
  'désabonné': 'unsubscribed',
  'échoués': 'failed',
  'échoué': 'failed',
  'étapes en attente': 'steps pending',
  'étape en attente': 'step pending',
};
