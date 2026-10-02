'use strict';

/*
 * CLES API — les deux langues
 * =============================================================================
 * ⚠⚠⚠ UNE CLE EST UN SECRET, PAS UN TEXTE. Rien de ce qui est TAPE ici ne passe
 * par ce dictionnaire, et le coeur ne rend jamais la cle elle-meme : seulement
 * son EXISTENCE et ses derniers caracteres. Conséquence visible a l ecran, et
 * qu il faut garder aussi nette en anglais : UN CHAMP LAISSE VIDE VEUT DIRE
 * « garde la cle enregistree », jamais « efface-la ». C est la phrase
 * « Laissez le champ vide pour la conserver » qui le dit.
 *
 * ⚠⚠ LES FORMATS NE SE TRADUISENT PAS : `gsk_…`, `re_…`, `hf_…`,
 * `sk-ant-…`, `sandbox_…`, `xxxxxxxx:xxxx…` decrivent a quoi ressemble la cle du
 * service. Les traduire ferait chercher un prefixe qui n existe pas. Seuls les
 * mots francais qui les accompagnent (« clé de production (sans préfixe) »,
 * « (facultatif) ») se lisent.
 *
 * ⚠⚠ LES NOMS DE SERVICES ET LEURS ECRANS RESTENT TELS QUELS : Fal.ai,
 * Photoroom, Groq, Anthropic, Resend, Hugging Face, et les chemins qu on suit
 * chez eux (« Dashboard puis API Keys », « Settings, Access Tokens, New token »)
 * — ces menus-la sont en anglais chez le fournisseur, meme pour un poste
 * francais. Les traduire enverrait chercher un bouton qui n existe pas.
 * Le modele `llama-3.3-70b-versatile` et `segformer_b2_clothes` sont des
 * identifiants.
 */

module.exports = {
  /* ── LA FENETRE ─────────────────────────────────────────────────────────── */
  'Clés API — Administration Sandriza': 'API keys — Sandriza Administration',
  'Clés API': 'API keys',
  'Lecture seule : vous pouvez consulter les clés, pas les modifier.':
    'Read only: you can view the keys, not change them.',
  'Enregistrer les clés': 'Save the keys',

  /* ── LES MOTIFS DE REFUS ────────────────────────────────────────────────── */
  'Votre rôle est en lecture seule : les clés ne peuvent pas être modifiées.':
    'Your role is read only: the keys cannot be changed.',
  'Cette clé est inconnue.': 'This key is unknown.',
  'Aucun changement à enregistrer.': 'No change to save.',
  'L’enregistrement dans le nuage a échoué. Réessayez.':
    'Saving to the cloud failed. Try again.',

  /* ══ LES SERVICES ══════════════════════════════════════════════════════════
   * ⚠ Les noms des services et les chemins de leurs ecrans restent tels quels —
   * voir l en-tete. */
  'Fal.ai — Génération photo IA': 'Fal.ai — AI photo generation',
  'Habillage mannequin virtuel (IDM-VTON) sur les vues produit.':
    'Virtual model try-on (IDM-VTON) on the product views.',
  'Clé API': 'API key',
  'Gratuit à l’inscription — Dashboard puis API Keys sur fal.ai.':
    'Free on sign-up — Dashboard then API Keys on fal.ai.',

  'Photoroom — Retrait du mannequin': 'Photoroom — Mannequin removal',
  'Le « mannequin fantôme ». Sans clé, la photothèque se rabat sur un détourage par masque.':
    'The « ghost mannequin ». Without a key, the media library falls back on a mask cutout.',
  'Clé de PRODUCTION': 'PRODUCTION key',
  'clé de production (sans préfixe)': 'production key (no prefix)',
  'Vrais traitements, pleine qualité, sans filigrane. Exige le plan Plus.':
    'Real treatments, full quality, no watermark. Requires the Plus plan.',
  'Clé SANDBOX (aperçus)': 'SANDBOX key (previews)',
  'sandbox_… (facultatif)': 'sandbox_… (optional)',
  'Aperçus gratuits (filigranés, aucun crédit). Vide : dérivée de la clé de production.':
    'Free previews (watermarked, no credit). Empty: derived from the production key.',

  'Groq — Description IA': 'Groq — AI description',
  'Génération de descriptions de produits à partir de la photo.':
    'Generates product descriptions from the photo.',
  'Gratuit — modèle llama-3.3-70b-versatile.':
    'Free — llama-3.3-70b-versatile model.',

  /* ⚠ « La clé reste au serveur » n est pas une formule de politesse ici : c est
     la seule cle de la maison qui ne descend JAMAIS dans l application. La phrase
     anglaise doit dire la meme chose aussi platement. */
  'Anthropic — Écriture publicitaire IA': 'Anthropic — AI ad writing',
  'Rédige les courriels et les publications à partir du contenu du site. Facturé au texte produit : le plafond mensuel ci-dessous est la seule limite de dépense.':
    'Writes the emails and the posts from the site content. Billed by the text produced: the monthly ceiling below is the only spending limit.',
  'Payant à l’usage. La clé reste au serveur : elle n’est jamais recopiée dans l’application.':
    'Paid per use. The key stays on the server: it is never copied into the application.',

  'Resend — Courriel transactionnel': 'Resend — Transactional email',
  'Infolettres, confirmations de commande, cartes-cadeaux.':
    'Newsletters, order confirmations, gift cards.',
  'Les paramètres d’expéditeur se règlent dans Newsletter puis Configuration.':
    'The sender settings are set in Newsletter then Configuration.',

  'Hugging Face — Segmentation vêtement': 'Hugging Face — Garment segmentation',
  'Isole le vêtement avant correction de couleur (exclut peau, visage, cheveux).':
    'Isolates the garment before colour correction (leaves out skin, face, hair).',
  'Token d’accès': 'Access token',
  'Gratuit — Settings, Access Tokens, New token (Read). Modèle segformer_b2_clothes.':
    'Free — Settings, Access Tokens, New token (Read). segformer_b2_clothes model.',

  /* ── LE SOLDE FAL.AI, SAISI A LA MAIN ───────────────────────────────────── */
  'Solde du compte (saisi à la main)': 'Account balance (entered by hand)',
  'ex. 25.00': 'e.g. 25.00',
  'fal.ai n’expose aucun solde par API. La fenêtre Traitements d’image affiche ':
    'fal.ai exposes no balance through its API. The Image treatments window shows ',
  'fal.ai n’expose aucun solde par API. La fenêtre Traitements d’image affiche':
    'fal.ai exposes no balance through its API. The Image treatments window shows',
  'ce montant et la consommation mesurée depuis': 'this amount and the usage measured since',

  /* ── LE PLAFOND MENSUEL DE L ECRITURE IA ────────────────────────────────── */
  /* ⚠ Ce n est PAS un solde a tenir a jour comme celui de fal.ai juste au-dessus :
     c est une borne que la passerelle lit AVANT chaque appel. « Plafond » et non
     « budget », dans les deux langues : un budget se depasse, un plafond arrete. */
  'Plafond de dépense par mois ($ US)': 'Spending ceiling per month (US$)',
  'ex. 25': 'e.g. 25',
  'Vérifié avant chaque appel : une fois le plafond atteint, l’écriture IA s’arrête ':
    'Checked before every call: once the ceiling is reached, AI writing stops ',
  'Vérifié avant chaque appel : une fois le plafond atteint, l’écriture IA s’arrête':
    'Checked before every call: once the ceiling is reached, AI writing stops',
  'd’elle-même jusqu’au mois suivant. 0 lève la limite.':
    'on its own until the next month. 0 lifts the limit.',
  ' — saisi le ': ' — entered on ',
  '— saisi le': '— entered on',
  '. À tenir à jour.': '. To be kept up to date.',

  /* ══ L ETAT D UNE CLE ══════════════════════════════════════════════════════
   * ⚠⚠ « Laissez le champ vide pour la conserver » : sans cette phrase, ouvrir
   * la fenetre et enregistrer effacerait une cle. Le <b> coupe les deux
   * phrases : les cles portent la balise. */
  'Aucune clé <b>enregistrée</b>.': 'No key <b>saved</b>.',
  'Aucune clé enregistrée .': 'No key saved .',
  'Clé <b>enregistrée</b> (se termine par ': 'Key <b>saved</b> (ends with ',
  'Clé enregistrée (se termine par': 'Key saved (ends with',
  '). Laissez le champ vide pour la conserver.':
    '). Leave the field empty to keep it.',
  'inchangé': 'unchanged',
  'Retirer': 'Remove',
  'Retirer la clé enregistrée ?': 'Remove the saved key?',
  'Confirmer le retrait': 'Confirm the removal',
  'Retrait…': 'Removing…',

  /* ── LES VERDICTS ───────────────────────────────────────────────────────── */
  'Aucun changement.': 'No change.',
  'Clés enregistrées.': 'Keys saved.',
  'Clé retirée.': 'Key removed.',

  /* ── REFONTE FINE (2026-09-26) : l etat des secrets en pastille ── */
  'Aucune clé enregistrée': 'No key saved',
  'Clé enregistrée': 'Key saved'
};
