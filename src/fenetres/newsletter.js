'use strict';

/*
 * FENÊTRE « INFOLETTRE » — NATIVE (3.15.0, #30)
 * =============================================================================
 * Les TROIS onglets qui n'existaient encore qu'en version web : Tableau de bord,
 * Configuration (Resend + interrupteurs de courriels), Offre de bienvenue. Les
 * quatre autres (Abonnés, Campagnes, Chaînes, Journal) ont DÉJÀ leur fenêtre et
 * leur propre entrée de menu.
 *
 * ⚠ La fenêtre est un pilote : les cœurs `_nl*Coeur` (newsletter.js) font toute
 * la lecture/écriture sur la page (Resend, Turso, R2). La clé Resend n'est
 * envoyée qu'à un rôle qui peut écrire. L'image de l'offre se lit DANS la
 * fenêtre et le SERVEUR la copie dans R2 (data URL → `newsletter:offerImage`).
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, commentaires
 * compris : tout ce script vit dans un littéral de gabarit.
 */

const { JS_ACTIVITE, JS_DIRE, CSS_JOUR } = require('./socle.js');

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:#0e1522;color:#e8edf5;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  display:flex;flex-direction:column;overflow:hidden}
.tete{flex:0 0 auto;display:flex;align-items:center;gap:.7rem;padding:.6rem 1.1rem;
  border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,#131c2b,#0e1522)}
.tete .ic{font-size:1.05rem;filter:grayscale(1) brightness(1.7);opacity:.9}
.tete h1{margin:0;font:700 .98rem/1.2 Georgia,serif}
.tete .sous{font-size:.73rem;color:#8fa1b8;margin-left:auto}
.onglets{flex:0 0 auto;display:flex;gap:.3rem;padding:.5rem 1.05rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.onglets button{background:transparent;border:none;border-bottom:2px solid transparent;color:#8fa1b8;
  padding:.4rem .7rem;font-weight:600;font-size:.85rem;border-radius:6px 6px 0 0}
.onglets button:hover{background:rgba(255,255,255,.05);color:#e8edf5}
.onglets button.actif{color:#e8dcc6;border-bottom-color:#c9a97e}
.corps{flex:1 1 auto;min-height:0;padding:.9rem 1.05rem;overflow-y:auto;display:flex;flex-direction:column;gap:.8rem}
.corps::-webkit-scrollbar{width:8px}
.corps::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:8px}
input,button,select,textarea{font:inherit;color:#e8edf5;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.16);border-radius:8px;padding:.4rem .55rem}
textarea{resize:vertical;min-height:56px;width:100%}
button{cursor:pointer;-webkit-user-select:none;user-select:none}
input:focus,button:focus,textarea:focus{outline:none;border-color:#c9a97e}
button:hover:not(:disabled){background:rgba(255,255,255,.1)}
button:disabled{opacity:.4;cursor:default}
button.prim{background:#8f6f42;border-color:#a3824f;color:#f7efe2;font-weight:600;padding:.42rem .8rem}
button.prim:hover:not(:disabled){background:#a3824f}
button.ghost{background:transparent}
button.mini{padding:.16rem .5rem;font-size:.76rem}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:.6rem}
.tuile{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.6rem .8rem}
.tuile .k{font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8}
.tuile .v{font-size:1.5rem;font-weight:800;margin-top:.15rem}
.tuile .z{font-size:.68rem;color:#8fa1b8;margin-top:.1rem}
.carte{background:#16202f;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:.75rem .85rem}
.carte h2{margin:0 0 .6rem;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:#8fa1b8;font-weight:700}
.deux{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}
@media(max-width:720px){.deux{grid-template-columns:1fr}}
table{width:100%;border-collapse:collapse;font-size:.83rem}
thead th{text-align:left;padding:.28rem .4rem;font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:#8fa1b8;font-weight:700;border-bottom:1px solid rgba(255,255,255,.1)}
tbody td{padding:.34rem .4rem;border-top:1px solid rgba(255,255,255,.055)}
.champ{margin-bottom:.7rem}
.champ label{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:#8fa1b8;margin:0 0 .25rem}
.champ input,.champ textarea{width:100%}
.hint{font-size:.72rem;color:#8fa1b8;margin:.25rem 0 0;line-height:1.5}
.sep{border:none;border-top:1px solid rgba(255,255,255,.09);margin:.9rem 0}
.badge{display:inline-block;font-size:.66rem;font-weight:700;padding:.06rem .5rem;border-radius:99px}
.badge.ok{background:rgba(22,163,74,.2);color:#86efac}
.badge.draft{background:rgba(148,163,184,.18);color:#cbd5e1}
.badge.warn{background:rgba(217,119,6,.2);color:#fcd34d}
.src{margin-bottom:.6rem}
.src .l{display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:.25rem}
.src .bar{height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden}
.src .bar>div{height:100%;background:#c9a97e}
.ctrl{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.ctrl .t{font-weight:500;font-size:.86rem}
.ctrl .d{font-size:.74rem;color:#8fa1b8;margin-top:.1rem}
.bascule{position:relative;width:42px;height:23px;flex:0 0 auto}
.bascule input{opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer;z-index:2;margin:0}
.bascule .piste{position:absolute;inset:0;border-radius:12px;background:#4a5568;transition:background .2s}
.bascule .pouce{position:absolute;top:2px;left:2px;width:19px;height:19px;border-radius:50%;background:#fff;transition:left .2s}
.bascule input:checked ~ .piste{background:#c9a97e}
.bascule input:checked ~ .pouce{left:21px}
.setup{max-width:34rem;margin:2rem auto;text-align:center;color:#cbd8e6}
.setup .em{font-size:2.6rem;margin-bottom:.8rem}
.apercu-img{max-height:80px;max-width:100%;border-radius:6px;border:1px solid rgba(255,255,255,.15);display:block;margin-bottom:.4rem}
.voile{position:fixed;inset:0;background:rgba(6,10,18,.78);display:flex;align-items:center;justify-content:center;z-index:50;padding:1rem}
.pop{background:#fff;color:#222;border-radius:14px;max-width:40rem;width:100%;display:flex;overflow:hidden;min-height:16rem;position:relative}
.pop .g{flex:1 1 45%;background:#e8dcc6 center/cover no-repeat;min-height:16rem}
.pop .d{flex:1 1 55%;padding:1.4rem 1.5rem;display:flex;flex-direction:column;justify-content:center;gap:.6rem}
.pop .titre{font:800 1.5rem/1.15 Georgia,serif;white-space:pre-line;color:#3a2f22}
.pop .st{font-size:.9rem;color:#6b5b45;line-height:1.5}
.pop .cta{background:#8f6f42;color:#fff;border:none;border-radius:8px;padding:.6rem;font-weight:700;margin-top:.4rem}
.pop .lg{font-size:.66rem;color:#9a8f7d}
.pop .x{position:absolute;top:.5rem;right:.7rem;background:rgba(0,0,0,.15);color:#fff;border:none;border-radius:50%;width:26px;height:26px}
.pied{flex:0 0 auto;display:flex;align-items:center;gap:.6rem;padding:.5rem 1.05rem;border-top:1px solid rgba(255,255,255,.08);background:#0b1220}
.msg{font-size:.79rem;color:#8fa1b8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.msg.err{color:#f87171}.msg.bon{color:#4ade80}.msg.att{color:#fbbf24}
.vide{padding:1.4rem;text-align:center;color:#8fa1b8;font-size:.84rem}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/**
 * Page complète de la fenêtre « Infolettre ».
 * `ouverture` : '' (Tableau de bord) · 'config' · 'offer' · 'apercu' (offre, avec
 * l'aperçu du popup ouvert — le banc ne clique pas).
 */
function pageNewsletter(ouverture) {
  const ouv = String(ouverture || '');
  const tabDepart = (ouv === 'config' || ouv === 'offer') ? ouv : (ouv === 'apercu' ? 'offer' : 'dashboard');
  const ouvreApercu = (ouv === 'apercu');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Infolettre — Administration Sandriza</title>
<style>${CSS}${CSS_JOUR}</style></head><body>
<div class="tete"><span class="ic">✉️</span><h1>Infolettre</h1><span class="sous" id="sous"></span></div>
<div class="onglets" id="onglets"></div>
<div class="corps" id="corps"><div class="vide">Chargement…</div></div>
<div class="pied"><span class="msg" id="msg"></span></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_ACTIVITE}${JS_DIRE}
  var corps = document.getElementById('corps');
  var sous = document.getElementById('sous');
  var ongletsEl = document.getElementById('onglets');

  var TAB = '${tabDepart}';
  var D = null;          // donnees de l onglet courant
  var PEUT = { vue:true, edit:false };
  var APERCU = false;    // surcouche apercu du popup

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function dire(t, cl){ szDire(t, cl); }
  function plur(n){ return n === 1 ? '' : 's'; }
  function val(id){ var e = document.getElementById(id); return e ? e.value : ''; }
  function chk(id){ var e = document.getElementById(id); return e ? e.checked : false; }

  var MOTIFS = {
    session:'Aucune session ouverte dans l’application. Connectez-vous dans la fenêtre principale.',
    droit:'Votre rôle ne permet pas cette modification.',
    indisponible:'L’administration n’est pas encore chargée dans la fenêtre principale.',
    format:'Format d’image invalide.', echec:'L’opération a échoué.'
  };
  function expliquer(r){ if (!r) return 'Aucune réponse de la fenêtre principale.'; if (r.detail) return String(r.detail); return MOTIFS[r.motif] || MOTIFS.echec; }
  function appeler(op, arg){ if (!P || !P.appeler) return Promise.resolve({ ok:false, motif:'indisponible' }); return P.appeler(op, arg).catch(function(){ return { ok:false, motif:'echec' }; }); }

  var OPTAB = { dashboard:'newsletter:dash', config:'newsletter:cfgDonnees', offer:'newsletter:offerDonnees' };
  function charger(){
    return appeler(OPTAB[TAB], {}).then(function(r){
      if (!r || !r.ok) { vide('Infolettre indisponible', expliquer(r)); return false; }
      D = r; if (r.peut) PEUT = r.peut; return true;
    });
  }
  function vide(titre, detail){
    ongletsEl.innerHTML = '';
    corps.innerHTML = '<div class="vide"><div style="font:700 1.3rem/1 Georgia,serif;color:#e8dcc6">' + esc(titre) + '</div><div style="margin-top:.35rem">' + esc(detail || '') + '</div></div>';
  }
  function relire(){ return charger().then(function(ok){ if (ok) dessiner(); return ok; }); }

  function dessinerOnglets(){
    ongletsEl.innerHTML = [['dashboard','📊 Tableau de bord'],['config','⚙ Configuration'],['offer','🎁 Offre bienvenue']]
      .map(function(t){ return '<button data-tab="' + t[0] + '" class="' + (TAB === t[0] ? 'actif' : '') + '">' + t[1] + '</button>'; }).join('');
  }

  /* ══ TABLEAU DE BORD ═══════════════════════════════════════════════════════ */
  function vueDash(){
    if (!D.hasKey) {
      return '<div class="setup"><div class="em">📧</div><h2 style="margin:0 0 .5rem">Configurer Resend</h2>'
        + '<p style="margin:0 0 1rem">Configurez votre clé API Resend pour commencer à envoyer des infolettres.</p>'
        + '<button class="prim" data-tab="config">Configurer maintenant →</button></div>';
    }
    var recents = D.recents.length ? D.recents.map(function(c){
      var st = c.status === 'sent' ? '<span class="badge ok">Envoyée</span>' : c.status === 'sending' ? '<span class="badge warn">En cours</span>' : '<span class="badge draft">Brouillon</span>';
      return '<tr><td><strong>' + esc(c.name) + '</strong><div style="font-size:.72rem;color:#8fa1b8">' + esc(c.sentAt || '—') + '</div></td>'
        + '<td>' + c.sent + (c.failed ? ' / <span style="color:#f87171">' + c.failed + '</span>' : '') + '</td><td>' + st + '</td></tr>';
    }).join('') : '<tr><td colspan="3" class="vide">Aucune campagne</td></tr>';
    var srcs = D.sources.length ? D.sources.map(function(s){
      return '<div class="src"><div class="l"><span>' + esc(s.label) + '</span><span style="font-weight:600">' + s.count + '</span></div>'
        + '<div class="bar"><div style="width:' + s.pct + '%"></div></div></div>';
    }).join('') : '<p style="color:#8fa1b8;font-size:.85rem">Aucun abonné encore.</p>';
    return '<div class="tuiles">'
      + '<div class="tuile"><div class="k">👥 Abonnés actifs</div><div class="v">' + D.active + '</div><div class="z">' + D.unsub + ' désabonné' + plur(D.unsub) + '</div></div>'
      + '<div class="tuile"><div class="k">📣 Campagnes envoyées</div><div class="v">' + D.sentCamps + '</div><div class="z">' + D.draftCamps + ' en brouillon</div></div>'
      + '<div class="tuile"><div class="k">✉️ Courriels envoyés</div><div class="v">' + D.totalSent + '</div><div class="z">' + D.failedSent + ' échoué' + plur(D.failedSent) + '</div></div>'
      + '<div class="tuile"><div class="k">🔗 Chaînes actives</div><div class="v">' + D.activeChains + '</div><div class="z">' + D.pendingSteps + ' étape' + plur(D.pendingSteps) + ' en attente</div></div>'
      + '</div>'
      + (PEUT.edit ? '<div><button class="ghost mini" data-act="chains">⚙ Traiter les chaînes (' + D.pendingSteps + ')</button></div>' : '')
      + '<div class="deux">'
      +   '<div class="carte"><h2>Campagnes récentes</h2><table><thead><tr><th>Campagne</th><th>Envoyés</th><th>Statut</th></tr></thead><tbody>' + recents + '</tbody></table></div>'
      +   '<div class="carte"><h2>Sources d’abonnés</h2>' + srcs + '</div>'
      + '</div>';
  }

  /* ══ CONFIGURATION ═════════════════════════════════════════════════════════ */
  var SERVICES = [
    { key:'orderConfirmation', label:'🛒 Confirmation de commande', desc:'Envoyé au client après chaque commande réussie.' },
    { key:'shipping', label:'🚚 Expédition / suivi', desc:'Envoyé lors du marquage « Expédiée ».' },
    { key:'delivery', label:'📬 Confirmation de livraison', desc:'Envoyé dès que le transporteur confirme la livraison.' },
    { key:'welcomeOffer', label:'🎁 Offre de bienvenue', desc:'Code de réduction envoyé à l’inscription.' },
    { key:'giftCard', label:'🎀 Carte-cadeau', desc:'Livraison par courriel lors de l’achat.' },
    { key:'chatOffline', label:'💬 Message hors-ligne (chat)', desc:'Avis admin quand un visiteur écrit hors-ligne.' },
    { key:'passwordReset', label:'🔑 Réinitialisation de mot de passe', desc:'Avis de sécurité après un changement.' },
    { key:'chains', label:'🔗 Séquences automatisées', desc:'Étapes des chaînes d’automation.' },
    { key:'supportTicket', label:'💬 Demande de support client', desc:'Avis à support@ et réponse au client.' },
  ];
  function bascule(id, on){
    return '<label class="bascule"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (PEUT.edit ? '' : ' disabled') + '><span class="piste"></span><span class="pouce"></span></label>';
  }
  function ligneChamp(lbl, id, v, type, hint){
    return '<div class="champ"><label>' + esc(lbl) + '</label><input id="' + id + '" type="' + (type || 'text') + '" value="' + esc(v || '') + '"' + (PEUT.edit ? '' : ' readonly') + '>' + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>';
  }
  function vueConfig(){
    var c = D.cfg;
    var ctrls = SERVICES.map(function(s){
      return '<div class="ctrl"><div><div class="t">' + esc(s.label) + '</div><div class="d">' + esc(s.desc) + '</div></div>' + bascule('nl-ctrl-' + s.key, D.controls[s.key] !== false) + '</div>';
    }).join('');
    var cleField = PEUT.edit
      ? ligneChamp('Clé API Resend *', 'nl-key', c.apiKey, 'password', 'Créez votre clé sur <strong>resend.com/api-keys</strong>')
      : '<div class="champ"><label>Clé API Resend</label><input value="' + (c.hasKey ? '••••••••••••' : '') + '" readonly></div>';
    return '<div class="deux">'
      + '<div class="carte"><h2>🔑 API Resend</h2>'
      +   cleField
      +   ligneChamp('Courriel expéditeur *', 'nl-from-e', c.fromEmail, 'email', 'Le domaine doit être vérifié dans Resend')
      +   ligneChamp('Nom expéditeur', 'nl-from-n', c.fromName)
      +   ligneChamp('Répondre à (optionnel)', 'nl-reply', c.replyTo, 'email')
      +   '<hr class="sep">'
      +   ligneChamp('Nom de l’entreprise', 'nl-co-name', c.companyName)
      +   ligneChamp('Adresse (pied de page)', 'nl-co-addr', c.companyAddress)
      +   ligneChamp('Lien site web (pied de page)', 'nl-website-url', c.websiteUrl, 'url')
      +   '<hr class="sep">'
      +   ligneChamp('Courriel expéditeur — transactionnel', 'nl-trans-from-e', c.fromEmailTransactional, 'email', 'Expédition, cartes-cadeaux, alertes. Vide = courriel infolettre.')
      +   ligneChamp('Nom expéditeur — transactionnel', 'nl-trans-from-n', c.fromNameTransactional)
      +   '<hr class="sep">'
      +   '<div class="ctrl" style="border:none;padding:.2rem 0"><div><div class="t">Mode test</div><div class="d">Envoyer uniquement à l’adresse de test.</div></div>' + bascule('nl-testmode', c.testMode) + '</div>'
      +   ligneChamp('Courriel de test', 'nl-test-e', c.testEmail, 'email')
      +   (PEUT.edit ? '<div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem"><button class="prim" data-act="cfgsave">Enregistrer</button><button class="ghost" data-act="testconn">Envoyer un courriel de test</button></div>' : '')
      + '</div>'
      + '<div class="carte"><h2>🔕 Contrôle des envois par courriel</h2>'
      +   '<p class="hint" style="margin:0 0 .6rem">Un service désactivé ne consomme pas de quota Resend.</p>'
      +   ctrls
      +   (PEUT.edit ? '<div style="margin-top:.7rem"><button class="prim" data-act="ctrlsave">Enregistrer les contrôles</button></div>' : '')
      + '</div>'
      + '</div>';
  }

  /* ══ OFFRE DE BIENVENUE ════════════════════════════════════════════════════ */
  function vueOffer(){
    var c = D.cfg;
    var stats = D.stats ? '<div class="tuiles" style="margin-bottom:.8rem">'
      + '<div class="tuile"><div class="k">Codes générés</div><div class="v">' + D.stats.total + '</div></div>'
      + '<div class="tuile"><div class="k">Codes utilisés</div><div class="v" style="color:#4ade80">' + D.stats.used + '</div></div>'
      + '<div class="tuile"><div class="k">En attente</div><div class="v" style="color:#fbbf24">' + D.stats.active + '</div></div>'
      + '</div>' : '';
    var img = c.imageUrl ? '<img class="apercu-img" src="' + esc(c.imageUrl) + '" alt="Aperçu">' : '';
    var ro = PEUT.edit ? '' : ' readonly';
    return '<div class="carte">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">'
      +   '<div><h2 style="margin:0 0 .2rem">Widget Offre de bienvenue</h2><div class="hint" style="margin:0">Bouton 🎁 flottant + popup — suit le visiteur sur tout le site.</div></div>'
      +   '<div style="display:flex;align-items:center;gap:.5rem"><span class="hint" style="margin:0">Actif</span>' + bascule('offer-enabled', c.enabled) + '</div>'
      + '</div>'
      + (D.done ? '<div class="hint" style="color:#86efac;margin:0 0 .8rem">✓ Un visiteur a déjà soumis ce widget. Utilisez « Réinitialiser » pour re-tester.</div>' : '')
      + stats
      + '<div class="deux">'
      +   '<div class="champ"><label>Titre (saut de ligne = ↵)</label><textarea id="offer-title" rows="2"' + ro + '>' + esc(c.title) + '</textarea></div>'
      +   '<div class="champ"><label>Image côté gauche</label>' + img
      +     (PEUT.edit ? '<label style="display:inline-block;margin-bottom:.4rem"><span class="ghost mini" style="display:inline-block;padding:.16rem .5rem;border:1px solid rgba(255,255,255,.16);border-radius:8px">📁 Choisir une photo</span><input type="file" accept="image/*" id="offer-file" style="display:none"></label>' : '')
      +     '<input id="offer-img" value="' + esc(c.imageUrl) + '" placeholder="https://… ou coller une URL"' + ro + '>'
      +     '<div class="hint">700 × 900 px recommandé (portrait). Max 600 Ko.</div></div>'
      + '</div>'
      + '<div class="champ"><label>Sous-titre</label><input id="offer-sub" value="' + esc(c.subtitle) + '"' + ro + '></div>'
      + '<div class="deux">'
      +   '<div class="champ"><label>Texte du bouton</label><input id="offer-cta" value="' + esc(c.cta) + '"' + ro + '></div>'
      +   '<div class="champ"><label>Valeur de réduction (%)</label><input id="offer-discount" type="number" min="1" max="100" value="' + (c.discountValue || 10) + '"' + ro + '><div class="hint">Un code unique WB-XXXXXX par client, valide 1 commande, expire 30 j.</div></div>'
      + '</div>'
      + '<div class="champ"><label>Mention légale</label><input id="offer-legal" value="' + esc(c.legal) + '"' + ro + '></div>'
      + '<div style="display:flex;gap:.6rem;flex-wrap:wrap">'
      +   (PEUT.edit ? '<button class="prim" data-act="offersave">Enregistrer</button>' : '')
      +   '<button class="ghost" data-act="apercu">Aperçu du popup</button>'
      +   (PEUT.edit ? '<button class="ghost mini" data-act="offerreset" style="color:#e0b47a">↺ Réinitialiser pour re-tester</button>' : '')
      + '</div>'
      + '</div>';
  }
  function vueApercu(){
    var c = D.cfg;
    var bg = c.imageUrl ? 'background-image:url(' + esc(c.imageUrl) + ')' : '';
    return '<div class="voile" id="ap-voile"><div class="pop">'
      + '<button class="x" data-act="apclose">×</button>'
      + '<div class="g" style="' + bg + '"></div>'
      + '<div class="d"><div class="titre">' + esc(c.title || '') + '</div>'
      +   '<div class="st">' + esc(c.subtitle || '') + '</div>'
      +   '<button class="cta">' + esc(c.cta || 'JE M’INSCRIS') + '</button>'
      +   '<div class="lg">' + esc(c.legal || '') + '</div></div>'
      + '</div></div>';
  }

  /* ══ DESSIN ════════════════════════════════════════════════════════════════ */
  function dessiner(){
    if (!D) return;
    dessinerOnglets();
    sous.textContent = PEUT.edit ? '' : 'Lecture seule';
    var h = TAB === 'config' ? vueConfig() : TAB === 'offer' ? vueOffer() : vueDash();
    if (APERCU && TAB === 'offer') h += vueApercu();
    corps.innerHTML = h;
    var f = document.getElementById('offer-file');
    if (f) f.onchange = function(){ if (f.files && f.files[0]) televerserImage(f.files[0]); };
  }

  /* ══ GESTES ════════════════════════════════════════════════════════════════ */
  function saveCfg(){
    var d = {
      apiKey: PEUT.edit ? val('nl-key') : undefined,
      fromEmail: val('nl-from-e'), fromName: val('nl-from-n'), replyTo: val('nl-reply'),
      companyName: val('nl-co-name'), companyAddress: val('nl-co-addr'), websiteUrl: val('nl-website-url'),
      fromEmailTransactional: val('nl-trans-from-e'), fromNameTransactional: val('nl-trans-from-n'),
      testMode: chk('nl-testmode'), testEmail: val('nl-test-e'),
    };
    dire('Enregistrement…');
    appeler('newsletter:cfgEcrire', d).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      relire().then(function(){ dire('Configuration enregistrée.', 'bon'); });
    });
  }
  function saveCtrls(){
    var ctrl = {};
    SERVICES.forEach(function(s){ ctrl[s.key] = chk('nl-ctrl-' + s.key); });
    dire('Enregistrement…');
    appeler('newsletter:controls', { controls: ctrl }).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      dire('Contrôles d’envoi enregistrés.', 'bon');
    });
  }
  function testConn(){
    dire('Envoi du courriel de test…');
    appeler('newsletter:testConn', {}).then(function(r){
      if (r && r.ok) dire('Courriel de test envoyé.', 'bon');
      else dire('⚠ ' + expliquer(r), 'err');
    });
  }
  function saveOffer(){
    var d = {
      enabled: chk('offer-enabled'), title: val('offer-title'), subtitle: val('offer-sub'),
      cta: val('offer-cta'), legal: val('offer-legal'), imageUrl: val('offer-img'), discountValue: val('offer-discount'),
    };
    dire('Enregistrement…');
    appeler('newsletter:offerEcrire', d).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      relire().then(function(){ dire('Configuration enregistrée.', 'bon'); });
    });
  }
  function televerserImage(file){
    if (file.size > 600000) { dire('Image trop grande (max 600 Ko).', 'err'); return; }
    var fr = new FileReader();
    fr.onerror = function(){ dire('Lecture de l’image impossible.', 'err'); };
    fr.onload = function(){
      dire('Téléversement…');
      appeler('newsletter:offerImage', { dataUrl: fr.result }).then(function(r){
        if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
        var inp = document.getElementById('offer-img'); if (inp) inp.value = r.url;
        var prev = document.querySelector('.apercu-img');
        if (!prev) { var box = inp && inp.parentNode; if (box) box.insertAdjacentHTML('afterbegin', '<img class="apercu-img" src="' + r.url.replace(/"/g, '&quot;') + '" alt="Aperçu">'); }
        else prev.src = r.url;
        dire('Photo importée — cliquez Enregistrer.', 'bon');
      });
    };
    fr.readAsDataURL(file);
  }
  function resetOffer(){
    appeler('newsletter:offerReset', {}).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      relire().then(function(){ dire('Réinitialisé.', 'bon'); });
    });
  }
  function traiterChaines(){
    dire('Traitement des chaînes…');
    appeler('newsletter:processChains', {}).then(function(r){
      if (!r || !r.ok) { dire('⚠ ' + expliquer(r), 'err'); return; }
      if (r.rien) { dire('Aucune étape en attente.', 'att'); return; }
      relire().then(function(){ dire(r.sent + ' envoyé' + plur(r.sent) + (r.failed ? ', ' + r.failed + ' échec' + plur(r.failed) : '') + '.', 'bon'); });
    });
  }

  /* ══ ÉCOUTEURS ═════════════════════════════════════════════════════════════ */
  document.addEventListener('click', function(e){
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('button'); if (!b) return;
    var g = function(n){ return b.getAttribute(n); };
    if (APERCU) { if (g('data-act') === 'apclose') { APERCU = false; dessiner(); return; } if (g('data-act') !== 'apercu') return; }
    if (g('data-tab')) { TAB = g('data-tab'); APERCU = false; charger().then(function(ok){ if (ok) dessiner(); }); return; }
    var act = g('data-act');
    if (act === 'cfgsave') saveCfg();
    else if (act === 'ctrlsave') saveCtrls();
    else if (act === 'testconn') testConn();
    else if (act === 'offersave') saveOffer();
    else if (act === 'offerreset') resetOffer();
    else if (act === 'chains') traiterChaines();
    else if (act === 'apercu') { APERCU = true; dessiner(); }
    else if (act === 'apclose') { APERCU = false; dessiner(); }
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (APERCU) { APERCU = false; dessiner(); return; }
    if (P && P.fermer) P.fermer();
  });

  window.szModeAncre = function(actif){ document.documentElement.classList.toggle('ancre', !!actif); };

  charger().then(function(ok){
    if (!ok) return;
    dessiner();
    ${ouvreApercu ? 'APERCU = true; dessiner();' : ''}
  });
})();
</script></body></html>`;
}

module.exports = { pageNewsletter };
