'use strict';

/*
 * L'ÉCRAN DE CONNEXION — EN NATIF (#57)
 * =============================================================================
 * Sa demande du 2026-09-10 : « fait la page native de connexion, et je veux que
 * tu gardes le plus possible notre interface actuelle mais en natif ».
 *
 * ⚠⚠ LE CSS N'A PAS ÉTÉ RETAPÉ, IL A ÉTÉ EXTRAIT. Les 7 500 caractères de
 * CSS_WEB sortent tels quels de _loginCSS dans assets/js/staff.js, lus par
 * un script qui a évalué la concaténation. Retaper 71 blocs de règles à la main
 * aurait donné une ressemblance, pas l'écran — et sa demande dit « garder LE PLUS
 * POSSIBLE notre interface actuelle ». Halos violets animés, plaque de logo en
 * verre dépoli qui flotte, filet doré de l'eyebrow, panneau beige #faf8f5,
 * animation d'entrée : tout vient de là, au pixel.
 *
 * ⚠ CE QUI EST AJOUTÉ PAR-DESSUS (et pourquoi, sinon on ne saurait pas quoi
 * remettre le jour où le web change) : un rétablissement html/body pour une
 * fenêtre (le web vit dans une page qui défile, ici la fenêtre EST le cadre), et
 * le casse-tête à glissière, qui dans le web est dessiné par des styles en ligne
 * plutôt que par cette feuille.
 *
 * ⚠⚠ ELLE NE DÉCIDE RIEN — même discipline que inactivite.js, et elle compte
 * double ici. La limitation de débit, le verrou de quinze minutes, le TOTP,
 * l'ouverture de session, le contrôle géographique et le journal restent dans la
 * page, derrière les cœurs Staff.connexion*. Cette fenêtre saisit deux champs,
 * peint un message qu'on lui donne, et rend la main. Une seconde
 * implémentation de l'authentification dans la coquille serait une seconde
 * surface à tenir à jour, et celle qu'on oublierait serait celle qui garde la
 * porte.
 *
 * ⚠ MÊME LE TEXTE DU REFUS VIENT DE LA PAGE. « Il vous reste 2 tentatives avant
 * un verrouillage de 15 minutes » se calcule depuis RateLimit ; le composer ici
 * obligerait cette fenêtre à connaître LOCK_MAX et l'état du verrou. On reçoit le
 * texte ET le ton (rouge / orange / sombre), et on peint.
 *
 * ⚠ SIX ÉCRANS, ET AUCUN NE SE RAFRAÎCHIT SOUS LES DOIGTS : connexion, code à
 * six chiffres, mot de passe oublié. C'est la leçon de la 5.3.0 — un formulaire
 * dans un écran qui se redessine perd la frappe en cours. Seule la BANNIÈRE de
 * maintenance se relit (20 s), et elle est hors du formulaire.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit, et un accent grave égaré
 * referme la chaîne. Payé cinq fois sur ce projet.
 */

const { JS_DIRE } = require('./socle.js');

let SZ_VERSION = '';
try { SZ_VERSION = String(require('../../package.json').version || ''); }
catch (e) { SZ_VERSION = ''; }

/* Extrait de _loginCSS (assets/js/staff.js) — ne pas modifier à la main : si
   l'écran web change, réextraire. */
const CSS_WEB = `
.admlogin-root{min-height:100vh;background:var(--al-bg);-webkit-font-smoothing:antialiased}.admlogin-split{display:flex;min-height:100vh;align-items:stretch}.admlogin-brand{position:relative;flex:1 1 46%;display:flex;flex-direction:column;justify-content:center;padding:3.5rem 3.2rem;overflow:hidden;color:var(--al-title)}.admlogin-orb{position:absolute;border-radius:50%;filter:blur(60px);opacity:0.5;z-index:0;pointer-events:none;will-change:transform}.admlogin-orb.o1{width:360px;height:360px;background:var(--al-logoG);top:-80px;left:-60px;animation:al-f1 17s ease-in-out infinite}.admlogin-orb.o2{width:300px;height:300px;opacity:0.42;background:linear-gradient(135deg,#7c5cff,#4338ca);bottom:-70px;right:6%;animation:al-f2 21s ease-in-out infinite}.admlogin-orb.o3{width:220px;height:220px;opacity:0.4;background:linear-gradient(135deg,#a855f7,#6d28d9);top:40%;right:-50px;animation:al-f3 25s ease-in-out infinite}.admlogin-brand::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(115deg,rgba(6,4,16,0.55) 0%,rgba(6,4,16,0.34) 46%,rgba(6,4,16,0.14) 100%);pointer-events:none}.admlogin-brand::after{content:'';position:absolute;inset:0;z-index:1;background:radial-gradient(85% 62% at 16% 12%,rgba(255,255,255,0.10),transparent 55%);pointer-events:none}.admlogin-brand-inner{position:relative;z-index:2;max-width:460px}.admlogin-logo-badge{width:74px;height:74px;border-radius:19px;display:inline-flex;align-items:center;justify-content:center;font:800 2rem/1 Georgia,serif;color:#fff;margin:0 0 1.5rem;box-shadow:0 14px 34px rgba(0,0,0,0.34)}.admlogin-logo-plate{position:relative;display:inline-block;padding:1.8rem 2.4rem;margin:0 0 1.9rem;animation:al-logofloat 7s ease-in-out infinite}.admlogin-logo-plate::before{content:'';position:absolute;inset:0;z-index:0;background:radial-gradient(118% 135% at 50% 48%,rgba(248,242,233,0.55) 0%,rgba(233,219,200,0.32) 42%,rgba(233,219,200,0) 76%);filter:blur(13px)}.admlogin-logo-img{position:relative;z-index:1;display:block;margin:0 auto}.admlogin-brand h1{font-family:Georgia,serif;font-size:2.15rem;font-weight:800;margin:0 0 0.9rem;line-height:1.12;letter-spacing:0.01em}.admlogin-eyebrow{display:flex;align-items:center;gap:0.9rem;margin:0 0 2.4rem;text-transform:uppercase;letter-spacing:0.26em;font-size:0.8rem;font-weight:600;color:var(--al-sub)}.admlogin-eyebrow .al-line{flex:0 0 auto;height:2px;width:42px;border-radius:2px;background:linear-gradient(90deg,#C49A6C,rgba(196,154,108,0.08))}.admlogin-eyebrow span:last-child{white-space:nowrap}.admlogin-feats{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1.05rem}.admlogin-feat{display:flex;align-items:center;gap:0.9rem;font-size:0.9rem;line-height:1.4;font-weight:500;color:rgba(243,237,227,0.95)}.admlogin-feat .al-ic{flex:0 0 auto;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.28)}.admlogin-form-panel{flex:1 1 54%;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#faf8f5;padding:2.75rem 2rem;overflow-y:auto}.admlogin-formwrap{width:100%;max-width:400px;animation:al-rise 0.6s cubic-bezier(0.16,0.84,0.44,1) both}.admlogin-formwrap input,.admlogin-formwrap select{transition:border-color 0.18s ease,box-shadow 0.18s ease}.admlogin-formwrap button[type=submit]{transition:transform 0.14s ease,box-shadow 0.24s ease,filter 0.2s ease}.admlogin-formwrap button[type=submit]:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(26,18,7,0.26);filter:brightness(1.06)}.admlogin-formwrap button[type=submit]:active{transform:translateY(0);filter:brightness(0.98)}.admlogin-back{display:inline-flex;align-items:center;gap:0.45rem;padding:0.5rem 1.1rem;border-radius:99px;background:rgba(196,154,108,0.09);border:1px solid rgba(196,154,108,0.3);color:#7d5f3c;font-family:inherit;font-size:0.8rem;font-weight:600;text-decoration:none;cursor:pointer;transition:background 0.18s ease,border-color 0.18s ease,transform 0.18s ease,box-shadow 0.18s ease}.admlogin-back:hover{background:rgba(196,154,108,0.17);border-color:rgba(196,154,108,0.5);transform:translateX(-3px);box-shadow:0 4px 14px rgba(196,154,108,0.2)}.admlogin-back:active{transform:translateX(0)}.admlogin-forgot{display:inline-flex;align-items:center;gap:0.4rem;padding:0.5rem 1.1rem;border-radius:99px;background:rgba(196,154,108,0.09);border:1px solid rgba(196,154,108,0.3);color:#7d5f3c;font-family:inherit;font-size:0.8rem;font-weight:600;text-decoration:none;cursor:pointer;transition:background 0.18s ease,border-color 0.18s ease,transform 0.18s ease,box-shadow 0.18s ease}.admlogin-forgot:hover{background:rgba(196,154,108,0.17);border-color:rgba(196,154,108,0.5);transform:translateY(-2px);box-shadow:0 6px 16px rgba(196,154,108,0.22)}.admlogin-forgot:active{transform:translateY(0)}@keyframes al-f1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(36px,46px) scale(1.08)}}@keyframes al-f2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-34px) scale(1.06)}}@keyframes al-f3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,-30px) scale(1.1)}}@keyframes al-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes al-logofloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@media (max-width:860px){.admlogin-split{flex-direction:column}.admlogin-brand{flex:0 0 auto;padding:2.5rem 1.5rem 2.1rem;text-align:center;align-items:center}.admlogin-brand-inner{max-width:none;display:flex;flex-direction:column;align-items:center}.admlogin-brand h1{font-size:1.7rem}.admlogin-eyebrow{justify-content:center;margin-bottom:0.4rem}.admlogin-logo-plate{padding:1.2rem 1.5rem}.admlogin-feats{gap:0.65rem;margin-top:0.3rem;align-items:flex-start;text-align:left}.admlogin-feat{font-size:0.82rem}.admlogin-feat .al-ic{width:34px;height:34px;border-radius:10px}.admlogin-form-panel{flex:1 1 auto;padding:2.1rem 1.3rem 2.8rem}}@media (prefers-reduced-motion:reduce){.admlogin-orb,.admlogin-formwrap,.admlogin-logo-plate{animation:none}}.admlogin-maint{width:100%;max-width:400px;margin:0 auto 1.35rem;padding:0.85rem 1rem;border-radius:12px;background:#fdf4e3;border:1px solid rgba(180,120,20,0.3);box-shadow:0 6px 18px rgba(120,80,10,0.1);animation:al-rise 0.5s cubic-bezier(0.16,0.84,0.44,1) both}.admlogin-maint .amt{display:flex;align-items:center;gap:0.5rem;font-size:0.82rem;font-weight:700;color:#6b4a06;margin:0 0 0.3rem}.admlogin-maint .amd{font-size:0.8rem;line-height:1.5;color:#5b4a33}.admlogin-nipbox{width:100%;max-width:400px;margin:0 auto 1.35rem;padding:0.9rem 1rem;border-radius:12px;background:#f3f0ea;border:1px solid rgba(196,154,108,0.4)}.admlogin-nipbox .npt{font-size:0.82rem;font-weight:700;color:#4a3a20;margin:0 0 0.5rem}.admlogin-nipbox .npm{font-size:0.76rem;line-height:1.45;color:#8a5a2a;margin:0.45rem 0 0;min-height:1.05rem}.admlogin-nipbox input{width:100%;padding:0.6rem 0.75rem;border-radius:8px;border:1px solid rgba(196,154,108,0.45);background:#fff;color:#2a2216;font:600 1.05rem/1 ui-monospace,Consolas,monospace;letter-spacing:0.35em;text-align:center}.admlogin-nipbox .npr{display:flex;gap:0.5rem;margin-top:0.6rem}.admlogin-nipbox .npr button{flex:1 1 0;padding:0.5rem 0.7rem;border-radius:8px;border:1px solid rgba(196,154,108,0.4);background:rgba(196,154,108,0.12);color:#6b4a20;font:600 0.78rem/1.2 inherit;cursor:pointer}.admlogin-nipbox .npr button:disabled{opacity:0.5;cursor:default}
`;

/* Ce que la FENÊTRE ajoute au décor du web. */
const CSS_FEN = `
:root{--al-bg:linear-gradient(135deg,#191238 0%,#2b2262 50%,#191238 100%);
  --al-logoG:linear-gradient(135deg,#4f46e5,#7c3aed);
  --al-title:#f5e6d0;--al-sub:rgba(236,229,217,0.92)}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{overflow:hidden;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
html,body,#corps{height:100%}
.admlogin-root{height:100%;min-height:0;overflow:hidden}
.admlogin-split{height:100%;min-height:0}
.admlogin-brand{min-height:0}
.admlogin-form-panel{min-height:0;overflow-y:auto}
.admlogin-form-panel{justify-content:flex-start}
.admlogin-formwrap{margin:auto 0}
/* Le casse-tete a glissiere. Dans le web il est habille de styles en ligne ;
   ici il a ses regles, et elles disent la meme chose. */
#sl-captcha{margin-bottom:1.25rem}
#cap-stage{position:relative;margin:0 auto;border-radius:8px;overflow:hidden;
  border:1px solid rgba(196,154,108,0.35);touch-action:none;user-select:none}
#cap-bg{display:block}
#cap-piece{position:absolute;top:0;left:0;pointer-events:none}
#cap-flash{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 0.25s}
#cap-track{position:relative;height:40px;margin:0.6rem auto 0;
  background:rgba(196,154,108,0.14);border:1px solid rgba(196,154,108,0.3);
  border-radius:8px;overflow:hidden;touch-action:none;user-select:none}
#cap-fill{position:absolute;top:0;left:0;height:100%;width:0;background:rgba(196,154,108,0.28)}
#cap-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:0.74rem;color:#776654;pointer-events:none}
#cap-handle{position:absolute;top:0;left:0;width:44px;height:100%;
  background:linear-gradient(135deg,#1a1207,#3d2810);border-radius:8px;cursor:grab;
  display:flex;align-items:center;justify-content:center;color:#f5e6d0;font-size:1rem;
  box-shadow:0 2px 8px rgba(0,0,0,0.25)}
/* Les champs et les etiquettes : memes valeurs que les styles en ligne du web
   (_inputStyle, _labelStyle, _fpErrStyle, _hTitle, _hSub), rassembles en
   regles parce qu ici on n a pas de raison de les repeter sur chaque balise. */
.cx-lbl{display:block;font-size:0.69rem;font-weight:600;color:#836850;
  margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.08em}
.cx-champ{position:relative}
.cx-champ .cx-ic{position:absolute;left:0.95rem;top:50%;transform:translateY(-50%);
  pointer-events:none;opacity:0.5;display:flex}
input[type=text],input[type=password],input[type=email]{width:100%;box-sizing:border-box;
  padding:0.7rem 1rem;background:rgba(255,255,255,0.82);
  border:1.5px solid rgba(196,154,108,0.35);border-radius:8px;color:#1a1207;
  font:0.9rem/1.5 inherit;outline:none;transition:border-color 0.18s,box-shadow 0.18s}
input.pad{padding-left:2.7rem}
input.padd{padding-right:2.6rem}
input:focus{border-color:#C49A6C;box-shadow:0 0 0 3px rgba(196,154,108,0.18)}
.cx-oeil{position:absolute;right:0.55rem;top:50%;transform:translateY(-50%);
  background:none;border:none;padding:0.2rem;cursor:pointer;display:inline-flex;
  align-items:center;color:#776654;opacity:0.75}
.cx-titre{font-size:1.5rem;font-weight:800;color:#1a1207;font-family:Georgia,serif;
  letter-spacing:0.01em;line-height:1.2}
.cx-sous{font-size:0.8rem;color:#7a6652;line-height:1.5;margin-top:0.35rem}
.cx-err{display:none;background:rgba(254,226,226,0.92);border:1px solid #fca5a5;
  border-radius:8px;padding:0.55rem 0.8rem;font-size:0.8rem;color:#b91c1c;
  margin-bottom:0.75rem;line-height:1.5}
.cx-err.on{display:block}
/* Les trois tons que la page peut demander. L orange previent PENDANT qu on
   peut encore agir ; le sombre annonce un courriel parti, pas un refus. */
.cx-err.orange{background:#fff7ed;border-color:#fdba74;color:#9a3412}
.cx-err.sombre{background:#172033;border-color:#C49A6C;color:#f5e6d0}
.cx-btn{width:100%;min-height:46px;padding:0.78rem 1rem;border-radius:12px;
  display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;
  font:600 0.92rem/1.2 inherit;cursor:pointer;letter-spacing:0.01em;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.16);
  transition:background-color .16s cubic-bezier(.2,.8,.2,1),
    box-shadow .16s cubic-bezier(.2,.8,.2,1),transform .11s cubic-bezier(.2,.8,.2,1)}
.cx-btn:hover:not(:disabled){box-shadow:inset 0 1px 0 rgba(255,255,255,0.16),
  0 4px 16px var(--cx-lueur,rgba(196,154,108,0.30))}
.cx-btn:active:not(:disabled){transform:scale(.985);
  box-shadow:inset 0 2px 6px rgba(0,0,0,0.30)}
.cx-btn:disabled{opacity:0.5;cursor:default;box-shadow:none;transform:none}
.cx-btn:focus-visible{outline:2px solid #C49A6C;outline-offset:3px}
.cx-spin{width:16px;height:16px;border-radius:50%;flex:0 0 auto;
  border:2px solid currentColor;border-right-color:transparent;
  animation:cx-tourne .7s linear infinite;opacity:.9}
@keyframes cx-tourne{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.cx-spin{animation-duration:2.4s}
  .cx-btn{transition:none}.cx-btn:active:not(:disabled){transform:none}}
.admlogin-formwrap button[type=submit],
.admlogin-formwrap button[type=submit]:hover{transform:none;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.14);filter:none}
.admlogin-formwrap button[type=submit]:active{transform:none;filter:none;
  box-shadow:inset 0 2px 5px rgba(0,0,0,0.32)}
.cx-souvenir{margin:-0.25rem 0 1rem;display:flex;align-items:center;gap:0.45rem}
.cx-souvenir input{width:15px;height:15px;cursor:pointer;accent-color:#C49A6C;color-scheme:light}
.cx-souvenir label{font-size:0.76rem;color:#7a6652;cursor:pointer;user-select:none}
.admlogin-forgot,.admlogin-back{border:none;border-radius:10px;
  padding:0.55rem 1rem;background:rgba(196,154,108,0.13);color:#5a4527;
  font:600 0.8rem/1.2 inherit;box-shadow:none;
  transition:background-color .16s cubic-bezier(.2,.8,.2,1),
    transform .11s cubic-bezier(.2,.8,.2,1)}
.admlogin-forgot:hover,.admlogin-back:hover{background:rgba(196,154,108,0.22);
  transform:none;box-shadow:none}
.admlogin-forgot:active,.admlogin-back:active{transform:scale(.97);
  background:rgba(196,154,108,0.30);box-shadow:none}
.admlogin-forgot:focus-visible,.admlogin-back:focus-visible{
  outline:2px solid #C49A6C;outline-offset:3px}
input[type=text],input[type=password],input[type=email]{border-radius:10px;
  min-height:46px;border-width:1px;background:#fff}
input:focus{border-color:#C49A6C;box-shadow:0 0 0 2px rgba(196,154,108,0.28)}
.cx-souvenir input{appearance:none;-webkit-appearance:none;width:18px;height:18px;
  border-radius:5px;border:1.5px solid rgba(131,104,80,0.45);background:#fff;
  cursor:pointer;position:relative;flex:0 0 auto;margin:0;
  transition:background-color .14s cubic-bezier(.2,.8,.2,1),
    border-color .14s cubic-bezier(.2,.8,.2,1)}
.cx-souvenir input:hover{border-color:rgba(196,154,108,0.85)}
.cx-souvenir input:checked{background:#8a6a44;border-color:#8a6a44}
.cx-souvenir input:checked::after{content:'';position:absolute;left:5px;top:1.5px;
  width:5px;height:9px;border:solid #fff;border-width:0 2px 2px 0;
  transform:rotate(42deg)}
.cx-souvenir input:focus-visible{outline:2px solid #C49A6C;outline-offset:3px}
.cx-barre{position:fixed;top:0;left:0;right:0;height:32px;display:flex;
  align-items:center;gap:2px;padding:0 6px;z-index:50;
  background:var(--cxb-fond,#2a2118);backdrop-filter:blur(6px);
  border-bottom:1px solid var(--cxb-trait,rgba(255,255,255,0.08))}
.cx-barre button{border:0;background:none;color:var(--cxb-txt,#f3ede3);
  font:500 0.78rem/1 inherit;padding:0.42rem 0.7rem;border-radius:7px;
  cursor:pointer;transition:background-color .13s ease,color .13s ease}
.cx-barre button:hover{background:var(--cxb-surv,rgba(255,255,255,0.12))}
.cx-barre button.on{background:var(--cxb-surv,rgba(255,255,255,0.12))}
.cx-barre button:focus-visible{outline:2px solid rgba(196,154,108,0.85);
  outline-offset:2px}
body.cx-abarre #corps{padding-top:32px;box-sizing:border-box}
.cx-centre{text-align:center;margin-top:0.85rem}
.cx-recours{transition:opacity .32s cubic-bezier(.2,.8,.2,1),
  max-height .32s cubic-bezier(.2,.8,.2,1),margin-top .32s cubic-bezier(.2,.8,.2,1);
  max-height:120px}
.cx-recours.cx-voile{opacity:0;visibility:hidden;margin-top:0;
  max-height:0;overflow:hidden;pointer-events:none}
@media (prefers-reduced-motion:reduce){.cx-recours{transition:none}}
.cx-chrono{font-size:0.72rem;color:#776654;margin-top:0.5rem}
.cx-chrono strong{color:#b45309}
.cx-chrono strong.presse{color:#dc2626}
#sl-mfa-code{font-size:1.8rem;font-family:monospace;letter-spacing:0.35em;text-align:center}
/* La verite sur << mot de passe oublie >> : une liste de ce qui MARCHE. */
.cx-voies{list-style:none;padding:0;margin:0.9rem 0 0;display:flex;
  flex-direction:column;gap:0.75rem}
.cx-voie{display:flex;gap:0.7rem;align-items:flex-start;padding:0.8rem 0.9rem;
  border-radius:10px;background:rgba(196,154,108,0.08);
  border:1px solid rgba(196,154,108,0.22)}
.cx-voie b{display:block;font-size:0.82rem;color:#6b4a20;margin-bottom:0.15rem}
.cx-voie span{font-size:0.78rem;color:#7a6652;line-height:1.5}
.cx-voie .n{flex:0 0 auto;width:22px;height:22px;border-radius:50%;
  background:#C49A6C;color:#fff;font:700 0.72rem/22px inherit;text-align:center}
.cx-ver{margin-top:1.6rem;font-size:0.72rem;letter-spacing:0.06em;
  color:rgba(243,237,227,0.62)}
.cx-msg{width:100%;max-width:400px;margin:0.9rem auto 0;min-height:1.1rem;text-align:center}
.cx-msg .msg{font-size:0.76rem;color:#7a6652;line-height:1.4}
.cx-msg .msg.err{color:#b91c1c}.cx-msg .msg.bon{color:#166534}.cx-msg .msg.att{color:#9a3412}
/* Les trois ecrans de la SUITE : code a six chiffres, mot de passe impose,
   questions de securite. */
.cx-etape{background:#faf6f0;border:1px solid rgba(196,154,108,0.25);
  border-radius:10px;padding:1rem;margin-bottom:1rem}
.cx-etl{font-size:0.7rem;font-weight:700;text-transform:uppercase;
  letter-spacing:0.08em;color:#836850;margin-bottom:0.5rem}
.cx-etc{font-size:0.8rem;color:#5a4a3a;line-height:1.6}
.cx-qr{text-align:center;margin:0.5rem 0 0.4rem}
.cx-qr img{width:164px;height:164px;border-radius:8px;
  border:2px solid rgba(196,154,108,0.35)}
.cx-cle{background:rgba(196,154,108,0.08);border:1px solid rgba(196,154,108,0.3);
  border-radius:6px;padding:0.6rem;text-align:center}
.cx-cle code{font:0.88rem/1.4 ui-monospace,Consolas,monospace;letter-spacing:0.15em;
  color:#3d2810;word-break:break-all}
.cx-cle .fine{font-size:0.68rem;color:#6b5a48;margin-top:0.25rem;line-height:1.4}
.cx-cle button{margin-top:0.5rem;padding:0.35rem 0.8rem;border-radius:99px;
  border:1px solid rgba(196,154,108,0.45);background:rgba(196,154,108,0.14);
  color:#6b4a20;font:600 0.74rem/1.2 inherit;cursor:pointer}
.cx-exig{list-style:none;padding:0;margin:0.5rem 0 0;display:flex;
  flex-wrap:wrap;gap:0.35rem}
.cx-exig li{font-size:0.7rem;color:#6b5a48;background:rgba(196,154,108,0.1);
  border:1px solid rgba(196,154,108,0.25);border-radius:99px;padding:0.15rem 0.55rem}
select{width:100%;box-sizing:border-box;padding:0.7rem 1rem;
  background:rgba(255,255,255,0.82);border:1.5px solid rgba(196,154,108,0.35);
  border-radius:8px;color:#1a1207;font:0.9rem/1.5 inherit;outline:none;cursor:pointer}
select:focus{border-color:#C49A6C;box-shadow:0 0 0 3px rgba(196,154,108,0.18)}
.cx-bloc{margin-bottom:1rem}
.admlogin-formwrap.large{max-width:460px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function pageConnexion(depart) {
  var _dep = String(depart || '').replace(/[^a-zA-Z]/g, '');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Connexion</title>
<style>${CSS_WEB}${CSS_FEN}</style></head><body>
<div id="corps"></div>
<script>
(function(){
  'use strict';
  var P = window.szPont;
${JS_DIRE}

  var CTX = null;          // le contexte de dessin, lu UNE fois
  var ECRAN = 'login';     // login | mfa | oubli
  var CAPTCHA_OK = false;
  /* ⚠ UN ÉTAT DE MODULE, PAS UN ÉTAT DU DOM : dessiner('login') refait
     l écran entier (retour d une étape, échec d un chargement), et tout ce
     qui vivait dans le HTML disparaît avec lui. C est exactement le défaut
     du sélecteur de date de la 5.3.0 — un état posé dans un écran qui se
     redessine n est pas un état. */
  var DEJA_RATE = false;
  var MAINT = null;        // dernier etat de maintenance connu
  var MAINT_T = null;
  var MFA_T = null, MFA_FIN = 0;
  var CTX_Q = null;        // les questions de securite, pour les listes croisees
  var DEPART = '${_dep}';
  var VERSION = '${SZ_VERSION}';

  function esc(v){
    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function el(id){ return document.getElementById(id); }

  /* ⚠ UN APPEL QUI N EST PAS UNE PROMESSE N EST PAS UN APPEL. Si la fenetre
     principale ne repond pas, P.appeler peut rendre autre chose ; on le
     transforme en refus nomme plutot que de laisser un .then exploser sans
     que personne ne voie rien. */
  function appeler(op, args){
    var pr;
    try { pr = P.appeler.apply(P, [op].concat(args || [])); }
    catch (e) { pr = null; }
    if (!pr || typeof pr.then !== 'function') {
      return Promise.resolve({ ok: false, motif: 'muet',
        message: 'La fenetre principale ne repond pas.' });
    }
    return pr.then(function(r){ return r || { ok: false, motif: 'vide' }; })
      .catch(function(e){ return { ok: false, motif: 'echec',
        message: String((e && e.message) || e) }; });
  }

  var IC = {
    personne: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a6652" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
    cadenas:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a6652" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    oeil:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    oeilBarre:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></svg>',
    verrouSm: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
    bouclier: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
    epingle:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  /* ══ LE PANNEAU DE MARQUE — la moitie gauche, identique au web ═══════════
     ⚠ IL NE SE REDESSINE JAMAIS. Les trois halos portent des animations de 17,
     21 et 25 secondes ; les redessiner a chaque changement d ecran les
     RELANCERAIT depuis zero, et le fond sauterait a chaque fois qu on passe au
     code a six chiffres. */
  function marquePanneau(){
    var m = CTX.marque, t = CTX.theme;
    var logo = m.logo
      ? '<div class="admlogin-logo-plate"><img src="' + esc(m.logo) + '" alt="' + esc(m.nom)
        + '" class="admlogin-logo-img" style="width:min(340px,70vw);height:auto"></div>'
      : '<div class="admlogin-logo-badge" style="background:linear-gradient(135deg,'
        + t.logoFrom + ',' + t.logoTo + ')">' + esc(m.lettre) + '</div>';
    var nom = m.logo ? '' : '<h1>' + esc(m.nom) + '</h1>';
    var f = function(ic, txt){
      return '<li class="admlogin-feat"><span class="al-ic">' + ic + '</span><span>' + txt + '</span></li>';
    };
    return '<aside class="admlogin-brand">'
      + '<span class="admlogin-orb o1"></span><span class="admlogin-orb o2"></span>'
      + '<span class="admlogin-orb o3"></span>'
      + '<div class="admlogin-brand-inner">' + logo + nom
      + '<div class="admlogin-eyebrow"><span class="al-line"></span><span>'
      + esc(t.sousTexte) + '</span></div>'
      + '<ul class="admlogin-feats">'
      + f(IC.verrouSm, 'Connexion chiffrée de bout en bout (HTTPS)')
      + f(IC.bouclier, 'Accès renforcé par mot de passe et authentification MFA')
      + f(IC.epingle,  'Chaque tentative journalisée (adresse IP et pays)')
      + '</ul>'
      + (VERSION ? ('<div class="cx-ver">Version ' + esc(VERSION) + '</div>') : '')
      + '</div></aside>';
  }

  /* ⚠ LES ETATS SE CALCULENT, ils ne sont pas choisis : ecrits en dur, ils
     cesseraient de suivre le theme des la premiere fois qu il change de
     couleur. k positif eclaircit, negatif assombrit. */
  function melanger(hex, k){
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return '#' + c.map(function(x){
      var y = k >= 0 ? x + (255 - x) * k : x * (1 + k);
      y = Math.max(0, Math.min(255, Math.round(y)));
      return (y < 16 ? '0' : '') + y.toString(16);
    }).join('');
  }
  function lumi(hex){
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return 0.5;
    var n = parseInt(m[1], 16);
    return (((n >> 16) & 255) * 0.2126 + ((n >> 8) & 255) * 0.7152
      + (n & 255) * 0.0722) / 255;
  }
  /* ⚠⚠ UN APLAT PRIS SUR CELLE DES DEUX COULEURS DU THEME QUI CONTRASTE LE
     MIEUX avec le texte du bouton — pas la premiere, pas la seconde : celle
     qui rend le texte lisible. Son theme rend noir → creme, et le texte clair
     devenait invisible sur la moitie droite (sa capture du 2026-09-10). C est
     le CONTRASTE qui decide, pas l ordre dans lequel elles arrivent. */
  /* ⚠ LE CONTRASTE SE CALCULE, il ne s estime pas. Trois lignes de plus, et
     plus jamais un bouton dont le texte se devine. */
  function contraste(x, y){
    var f = function(h){
      var m = /^#?([0-9a-f]{6})$/i.exec(String(h || ''));
      if (!m) return 0.5;
      var n = parseInt(m[1], 16);
      var v = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function(c){
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    };
    var A = f(x), B = f(y);
    return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
  }
  /* La part de COULEUR d une teinte : 0 pour un gris, un noir ou un blanc. */
  function couleur(hex){
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
    if (!m) return 0;
    var n = parseInt(m[1], 16);
    var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    var mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]);
    return mx === 0 ? 0 : (mx - mn) / mx;
  }
  /* ══ LA COULEUR DU BOUTON — ET POURQUOI CE N EST PLUS << LA PLUS SOMBRE >>
     ⚠⚠ SES MOTS DU 2026-09-11 : << le bouton noir de connexion est affreux >>.
     Il avait raison. Ma regle prenait la plus SOMBRE des deux couleurs du
     theme pour garantir le contraste avec le texte clair ; son degrade va du
     NOIR au creme, donc j obtenais un rectangle noir pur. Un contraste de
     16:1, parfaitement lisible, et parfaitement laid.
     ⚠ LA LECON : une regle qui n optimise qu UN critere (ici la lisibilite)
     produit des resultats corrects et indefendables. Il fallait un second
     critere — que la couleur en SOIT une.
     ⚠ ON PREND DONC LA PLUS COLOREE DES DEUX, pas la plus sombre. Et si le
     theme n en offre aucune (deux tons quasi neutres, comme le noir et le
     creme de son degrade), on retombe sur le BRONZE DE LA MARQUE — celui de
     la case a cocher et des pastilles, deja present partout sur cet ecran.
     Un degrade a deux extremes n a pas de couleur de bouton : ses bouts n ont
     jamais ete choisis pour etre vus en aplat.
     ⚠ PUIS ON AJUSTE JUSQU AU CONTRASTE, par pas de 6 % : on ne choisit pas
     une valeur en esperant qu elle passe, on l amene la ou elle doit etre. */
  function btnFond(){
    var t = CTX.theme;
    var a = t.btnFrom, b = t.btnTo;
    var ca = couleur(a), cb = couleur(b);
    var fond = (ca >= cb) ? a : b;
    if (Math.max(ca, cb) < 0.30) fond = '#7d5f3c';   // le bronze de la marque
    var clair = lumi(t.btnTexte) > 0.5;
    var n = 0;
    while (contraste(t.btnTexte, fond) < 4.6 && n < 24) {
      fond = melanger(fond, clair ? -0.06 : 0.06);
      n++;
    }
    return fond;
  }
  function btnStyle(){
    var t = CTX.theme;
    var fond = btnFond();
    var clair = lumi(t.btnTexte) > 0.5;
    /* ⚠ LA LUEUR DU SURVOL EST CELLE DU BOUTON, à faible opacité — pas un
       gris, pas un noir. Une ombre noire sous un bouton coloré est la
       signature de 2015 ; une lueur de sa PROPRE couleur donne l impression
       qu il éclaire ce qu il touche, et c est ce qui date 2026.
       ⚠ Elle passe par une variable CSS parce que la règle :hover ne peut
          pas connaître le thème : on la pose sur l élément, la feuille s en
          sert. --cx-lueur a un repli dans le CSS, donc un bouton sans style
          en ligne reste correct. */
    var rv = parseInt(fond.slice(1, 3), 16), gv = parseInt(fond.slice(3, 5), 16);
    var bv = parseInt(fond.slice(5, 7), 16);
    var lueur = isNaN(rv) ? 'rgba(196,154,108,0.30)'
      : ('rgba(' + rv + ',' + gv + ',' + bv + ',0.34)');
    return 'background-color:' + fond
      + ';border:1px solid ' + melanger(fond, clair ? 0.12 : -0.14)
      + ';--cx-lueur:' + lueur
      + ';color:' + t.btnTexte;
  }
  /* Le survol eclaircit un fond sombre et assombrit un fond clair. En JS et
     non en CSS parce que la couleur vient du theme : une regle :hover ne
     saurait pas quelle valeur viser sans la recopier. */
  function btnSurvol(z){
    if (!z) return;
    var fond = btnFond();
    var clair = lumi(CTX.theme.btnTexte) > 0.5;
    var haut = melanger(fond, clair ? 0.10 : -0.08);
    z.addEventListener('mouseenter', function(){
      if (!z.disabled) z.style.backgroundColor = haut;
    });
    z.addEventListener('mouseleave', function(){ z.style.backgroundColor = fond; });
  }

  /* ══ L ECRAN DE CONNEXION ════════════════════════════════════════════════ */
  function ecranLogin(){
    return '<div>'
      + '<div style="margin-bottom:1.75rem">'
      + '<div class="cx-titre">Connexion sécurisée</div>'
      + '<div class="cx-sous">Réservé au personnel autorisé uniquement</div>'
      + '</div>'
      + '<form id="cx-form" novalidate>'
      + '<div style="margin-bottom:1rem">'
      + '<label class="cx-lbl" for="sl-email">Nom d’utilisateur</label>'
      + '<div class="cx-champ"><span class="cx-ic">' + IC.personne + '</span>'
      + '<input type="text" id="sl-email" class="pad" autocomplete="username" value="'
      + esc(CTX.prefill) + '"></div>'
      + '</div>'
      + '<div class="cx-souvenir">'
      + '<input type="checkbox" id="sl-remember"' + (CTX.souvenir ? ' checked' : '') + '>'
      + '<label for="sl-remember">Se souvenir de mon nom d’utilisateur</label>'
      + '</div>'
      + '<div style="margin-bottom:1.25rem">'
      + '<label class="cx-lbl" for="sl-password">Mot de passe</label>'
      + '<div class="cx-champ"><span class="cx-ic">' + IC.cadenas + '</span>'
      + '<input type="password" id="sl-password" class="pad padd" autocomplete="current-password">'
      + '<button type="button" class="cx-oeil" id="sl-oeil" aria-label="Afficher le mot de passe">'
      + IC.oeil + '</button></div>'
      + '</div>'
      + '<div class="cx-err" id="sl-error"></div>'
      + '<div id="cap-zone"></div>'
      + '<button type="submit" class="cx-btn" id="sl-btn" style="' + btnStyle() + '">Se connecter</button>'
      + '</form>'
      + '<div class="cx-centre cx-recours' + (DEJA_RATE ? '' : ' cx-voile') + '">'
      + '<button type="button" class="admlogin-forgot" id="sl-oubli">Mot de passe oublié ?</button>'
      + '</div></div>';
  }

  /* ══ LE CODE A SIX CHIFFRES ══════════════════════════════════════════════ */
  function ecranMfa(sec){
    return '<div>'
      + '<div style="margin-bottom:1.75rem">'
      + '<div class="cx-titre">Vérification en deux étapes</div>'
      + '<div class="cx-sous">Entrez le code de votre application d’authentification</div>'
      + '<div class="cx-chrono">⏱ Temps restant : <strong id="sl-mfa-timer">' + sec + ' s</strong></div>'
      + '</div>'
      + '<form id="cx-form-mfa" novalidate>'
      + '<div style="margin-bottom:1.25rem">'
      + '<label class="cx-lbl" for="sl-mfa-code">Code à 6 chiffres</label>'
      + '<input type="text" id="sl-mfa-code" inputmode="numeric" maxlength="6"'
      + ' autocomplete="one-time-code" placeholder="000000">'
      + '</div>'
      + '<div class="cx-err" id="sl-mfa-error"></div>'
      + '<button type="submit" class="cx-btn" id="sl-mfa-btn" style="' + btnStyle() + '">Vérifier</button>'
      + '</form>'
      + '<div class="cx-centre">'
      + '<button type="button" class="admlogin-back" id="sl-mfa-retour">← Retour à la connexion</button>'
      + '</div></div>';
  }

  /* ══ MOT DE PASSE OUBLIE — CE QUI MARCHE VRAIMENT ════════════════════════
     ⚠⚠ CE N EST PAS LE PARCOURS WEB, ET C EST DELIBERE. Le web pose deux
     questions de securite puis un nouveau mot de passe. Ce parcours NE
     FONCTIONNE PAS : il tourne sur l ecran de connexion, donc sans session ; les
     reponses sont hachees cote serveur, et toute ecriture de staff_users exige
     une session. Les commentaires de submitForgotStep2 et submitForgotStep3
     le disent depuis des semaines - l etape 2 refuse tout le monde, et l etape 3
     n ecrivait que dans le cache du poste en annoncant << Mot de passe
     reinitialise >>. Porter trois ecrans pour arriver a un mur aurait ete porter
     le mur. On rend ce qui marche, en un ecran. */
  function ecranOubli(d){
    var contact = (d && d.contact)
      ? ('<a href="mailto:' + esc(d.contact) + '" style="color:#8a6a44">' + esc(d.contact) + '</a>')
      : 'un super-administrateur';
    return '<div>'
      + '<div style="margin-bottom:1.2rem">'
      + '<div class="cx-titre">Mot de passe oublié</div>'
      + '<div class="cx-sous">Deux chemins fonctionnent, et les voici. La récupération '
      + 'par questions de sécurité n’est pas disponible : les réponses sont chiffrées '
      + 'côté serveur et cet écran n’a pas de session pour les vérifier.</div>'
      + '</div>'
      + '<ul class="cx-voies">'
      + '<li class="cx-voie"><span class="n">1</span><div>'
      + '<b>Le lien de renouvellement</b>'
      + '<span>Si votre mot de passe a expiré, un courriel part automatiquement à '
      + 'votre adresse à la prochaine tentative. Le lien vaut 24 heures.</span>'
      + '</div></li>'
      + '<li class="cx-voie"><span class="n">2</span><div>'
      + '<b>Un accès réémis</b>'
      + '<span>Demandez à ' + contact + ' de vous réémettre un mot de passe '
      + 'temporaire depuis la fiche du personnel. Il vous sera demandé de le '
      + 'changer à la première connexion.</span>'
      + '</div></li>'
      + '</ul>'
      + '<div class="cx-centre" style="margin-top:1.4rem">'
      + '<button type="button" class="admlogin-back" id="sl-oubli-retour">← Retour à la connexion</button>'
      + '</div></div>';
  }

  /* ══ ① LA CONFIGURATION DU CODE A SIX CHIFFRES ═════════════════════════════
     ⚠⚠ LA CLE MANUELLE EST MISE EN AVANT, PAS EN REPLI, ET C EST DELIBERE. Le QR
     est construit par un service TIERS (api.qrserver.com) avec l URI otpauth
     COMPLETE dans l URL — donc le secret TOTP en clair, chez quelqu un d autre.
     C est le comportement de l ecran web depuis toujours, et le porter ne
     l aggrave pas ; mais la cle tapee a la main NE SORT PAS DU POSTE, alors on la
     montre comme une voie normale et non comme un dernier recours.
     ⚠ Le vrai remede — dessiner le QR sur place, sans reseau — est un chantier a
     part, et il est signale : un QR subtilement faux ne se voit pas, et il
     enfermerait dehors le compte qu on essaie justement de configurer. */
  function ecranMfaConfig(d){
    return '<div>'
      + '<div style="margin-bottom:1.3rem">'
      + '<div class="cx-titre">Authentification à deux facteurs</div>'
      + '<div class="cx-sous">Bonjour ' + esc(d.prenom) + ' — votre administrateur exige '
      + 'cette configuration avant l’accès au panneau.</div>'
      + '</div>'
      + '<div class="cx-etape">'
      + '<div class="cx-etl">Étape 1 — une application TOTP</div>'
      + '<div class="cx-etc">Installez <strong>Google Authenticator</strong>, '
      + '<strong>Authy</strong> ou toute application TOTP sur votre téléphone.</div>'
      + '</div>'
      + '<div class="cx-etape">'
      + '<div class="cx-etl">Étape 2 — la clé</div>'
      + '<div class="cx-cle"><code id="wz-cle">' + esc(d.secretGroupe) + '</code>'
      + '<div class="fine">SHA-1 · 6 chiffres · 30 s — cette clé ne quitte pas ce poste.</div>'
      + '<button type="button" id="wz-copier">Copier la clé</button></div>'
      + '<div class="cx-etc" style="margin-top:0.7rem">Ou scannez le code ci-dessous, '
      + 'produit par un service externe.</div>'
      + '<div class="cx-qr"><img id="wz-qr" src="' + esc(d.qrUrl) + '" alt="Code QR"></div>'
      + '<div class="cx-err" id="wz-qr-err">Code QR indisponible — utilisez la clé ci-dessus.</div>'
      + '</div>'
      + '<div class="cx-etape">'
      + '<div class="cx-etl">Étape 3 — confirmez</div>'
      + '<form id="cx-form-wz" novalidate>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="wz-code">Code à 6 chiffres</label>'
      + '<input type="text" id="wz-code" inputmode="numeric" maxlength="6" '
      + 'autocomplete="one-time-code" placeholder="000000">'
      + '</div>'
      + '<div class="cx-err" id="wz-err"></div>'
      + '<button type="submit" class="cx-btn" id="wz-btn" style="' + btnStyle() + '">'
      + 'Activer et accéder au panneau</button>'
      + '</form></div>'
      + '<div class="cx-centre">'
      + '<button type="button" class="admlogin-back" id="wz-annuler">← Annuler</button>'
      + '</div></div>';
  }

  /* ══ ② LE CHANGEMENT DE MOT DE PASSE IMPOSE ════════════════════════════════
     ⚠ LES EXIGENCES VIENNENT DE LA POLITIQUE, pas d un texte fige : elle est
     configurable, et une liste ecrite en dur mentirait des qu on la change. */
  function ecranMdp(d){
    var ex = (d.exigences || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    return '<div>'
      + '<div style="margin-bottom:1.5rem">'
      + '<div class="cx-titre">Changement de mot de passe requis</div>'
      + '<div class="cx-sous">Bienvenue ' + esc(d.prenom) + ' — définissez votre mot de '
      + 'passe avant d’accéder au panneau.</div>'
      + (ex ? ('<ul class="cx-exig">' + ex + '</ul>') : '')
      + '</div>'
      + '<form id="cx-form-mdp" novalidate>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="pc-pw1">Nouveau mot de passe</label>'
      + '<input type="password" id="pc-pw1" class="padd" autocomplete="new-password">'
      + '</div>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="pc-pw2">Confirmer le mot de passe</label>'
      + '<input type="password" id="pc-pw2" autocomplete="new-password">'
      + '</div>'
      + '<div class="cx-err" id="pc-err"></div>'
      + '<button type="submit" class="cx-btn" id="pc-btn" style="' + btnStyle() + '">'
      + 'Enregistrer et accéder</button>'
      + '</form>'
      + '<div class="cx-centre">'
      + '<button type="button" class="admlogin-back" id="pc-annuler">← Retour à la connexion</button>'
      + '</div></div>';
  }

  /* ══ ③ LES QUESTIONS DE SECURITE ═══════════════════════════════════════════
     ⚠ LES DEUX LISTES S EXCLUENT L UNE L AUTRE, ET SE LIBERENT. La question
     choisie d un cote disparait de l autre, et REAPPARAIT des qu on la relache.
     Sans ce second temps, changer d avis laisserait une question introuvable. */
  function ecranQuestions(d){
    var qs = d.questions || [];
    var opts = function(exclu, sel){
      var o = '<option value="">— Choisir une question —</option>';
      for (var i = 0; i < qs.length; i++) {
        if (exclu && qs[i] === exclu) continue;
        o += '<option value="' + esc(qs[i]) + '"'
          + (qs[i] === sel ? ' selected' : '') + '>' + esc(qs[i]) + '</option>';
      }
      return o;
    };
    return '<div>'
      + '<div style="margin-bottom:1.4rem">'
      + '<div class="cx-titre">Questions de sécurité</div>'
      + '<div class="cx-sous">' + esc(d.prenom) + ', choisissez deux questions. Elles servent '
      + 'à confirmer votre identité auprès d’un administrateur si vous perdez votre accès.</div>'
      + '</div>'
      + '<form id="cx-form-q" novalidate>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="sq-q1">Question 1</label>'
      + '<select id="sq-q1">' + opts('', '') + '</select>'
      + '</div>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="sq-a1">Réponse 1</label>'
      + '<input type="text" id="sq-a1" autocomplete="off">'
      + '</div>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="sq-q2">Question 2</label>'
      + '<select id="sq-q2">' + opts('', '') + '</select>'
      + '</div>'
      + '<div class="cx-bloc">'
      + '<label class="cx-lbl" for="sq-a2">Réponse 2</label>'
      + '<input type="text" id="sq-a2" autocomplete="off">'
      + '</div>'
      + '<div class="cx-err" id="sq-err"></div>'
      + '<button type="submit" class="cx-btn" id="sq-btn" style="' + btnStyle() + '">'
      + 'Enregistrer et accéder</button>'
      + '</form>'
      + '<div class="cx-centre">'
      + '<button type="button" class="admlogin-back" id="sq-annuler">← Retour à la connexion</button>'
      + '</div></div>';
  }

  /* Les listes s excluent : appele a chaque changement, dans les deux sens. */
  function questionsAccorder(){
    var s1 = el('sq-q1'), s2 = el('sq-q2');
    if (!s1 || !s2) return;
    var refaire = function(cible, autre){
      var garde = cible.value;
      var exclu = autre.value;
      var o = '<option value="">— Choisir une question —</option>';
      var qs = (CTX_Q && CTX_Q.questions) || [];
      for (var i = 0; i < qs.length; i++) {
        if (exclu && qs[i] === exclu) continue;
        o += '<option value="' + esc(qs[i]) + '"'
          + (qs[i] === garde ? ' selected' : '') + '>' + esc(qs[i]) + '</option>';
      }
      cible.innerHTML = o;
      cible.value = garde;
    };
    refaire(s1, s2);
    refaire(s2, s1);
  }

  /* ══ LES TROIS ENVOIS ══════════════════════════════════════════════════════
     ⚠ CHACUN REND UN suite NOMME, et c est ce qui permet d enchainer les trois
     ecrans SANS quitter cette fenetre — sa demande du 2026-09-10 : << il faut
     integrer ca dans la meme fenetre >>. Le mot de passe peut mener aux
     questions, les questions aux deux facteurs, et n importe lequel au panneau :
     un seul aiguillage, suivre, plutot que trois enchainements ecrits a la
     main qui finiraient par diverger. */
  function suivre(r){
    if (r.suite === 'questions')  { chargerQuestions(); return; }
    if (r.suite === 'mfaConfig')  { chargerMfaConfig(); return; }
    if (r.suite === 'motdepasse') { chargerMdp(); return; }
    reussi(r.prenom);
  }

  function chargerMfaConfig(){
    appeler('connexion:mfaConfig').then(function(r){
      if (!r || !r.ok) { dessiner('login'); apresLogin(); faute('sl-error', r); return; }
      dessiner('mfaConfig', r);
    });
  }
  function chargerMdp(){
    appeler('connexion:mdpDonnees').then(function(r){
      if (!r || !r.ok) { dessiner('login'); apresLogin(); faute('sl-error', r); return; }
      dessiner('mdp', r);
    });
  }
  function chargerQuestions(){
    appeler('connexion:questionsDonnees').then(function(r){
      if (!r || !r.ok) { dessiner('login'); apresLogin(); faute('sl-error', r); return; }
      CTX_Q = r;
      dessiner('questions', r);
    });
  }

  function mfaConfigEnvoyer(){
    var c = el('wz-code'), b = el('wz-btn');
    if (!c || !b) return;
    fauteEffacer('wz-err');
    if (manque(['wz-code'])) {
      faute('wz-err', { message: 'Entrez le code à six chiffres affiché par votre application.' });
      return;
    }
    b.disabled = true;
    b.innerHTML = '<span class="cx-spin"></span><span>Vérification…</span>';
    c.disabled = true;
    appeler('connexion:mfaConfigConfirmer', [c.value]).then(function(r){
      if (r.ok) { suivre(r); return; }
      var c2 = el('wz-code'), b2 = el('wz-btn');
      if (b2) { b2.disabled = false; b2.textContent = 'Activer et accéder au panneau'; }
      if (c2) { c2.disabled = false; c2.value = ''; c2.focus(); }
      faute('wz-err', r);
    });
  }

  function mdpEnvoyer(){
    var a = el('pc-pw1'), b = el('pc-pw2'), bt = el('pc-btn');
    if (!a || !b || !bt) return;
    fauteEffacer('pc-err');
    if (manque(['pc-pw1', 'pc-pw2'])) {
      faute('pc-err', { message: 'Remplissez les deux champs.' });
      return;
    }
    bt.disabled = true;
    bt.innerHTML = '<span class="cx-spin"></span><span>Enregistrement…</span>';
    appeler('connexion:mdpEcrire', [a.value, b.value]).then(function(r){
      if (r.ok) { suivre(r); return; }
      var bt2 = el('pc-btn');
      if (bt2) { bt2.disabled = false; bt2.textContent = 'Enregistrer et accéder'; }
      faute('pc-err', r);
      /* ⚠ ON NE VIDE QUE LA CONFIRMATION sur une discordance : effacer les deux
         obligerait a retaper un mot de passe peut-etre bon. Sur un refus de
         politique, on ne vide RIEN — la personne doit voir ce qu elle a ecrit
         pour le corriger. */
      if (r.motif === 'discordance') { var b3 = el('pc-pw2'); if (b3) { b3.value = ''; b3.focus(); } }
    });
  }

  function questionsEnvoyer(){
    var q1 = el('sq-q1'), a1 = el('sq-a1'), q2 = el('sq-q2'), a2 = el('sq-a2'), b = el('sq-btn');
    if (!q1 || !a1 || !q2 || !a2 || !b) return;
    fauteEffacer('sq-err');
    if (manque(['sq-q1', 'sq-a1', 'sq-q2', 'sq-a2'])) {
      faute('sq-err', { message: 'Choisissez les deux questions et écrivez leurs réponses.' });
      return;
    }
    b.disabled = true;
    b.innerHTML = '<span class="cx-spin"></span><span>Enregistrement…</span>';
    appeler('connexion:questionsEcrire', [q1.value, a1.value, q2.value, a2.value])
      .then(function(r){
        if (r.ok) { suivre(r); return; }
        var b2 = el('sq-btn');
        if (b2) { b2.disabled = false; b2.textContent = 'Enregistrer et accéder'; }
        faute('sq-err', r);
      });
  }


  /* ══ LE DESSIN ═══════════════════════════════════════════════════════════
     ⚠ SEUL LE PANNEAU DE DROITE CHANGE. La racine et le panneau de marque sont
     ecrits UNE fois (voir marquePanneau) ; ensuite on ne remplace que
     #cx-corps. C est ce qui garde les halos en mouvement continu et evite
     qu un changement d ecran fasse clignoter la moitie de la fenetre. */
  function socle(){
    var t = CTX.theme;
    var bg = 'linear-gradient(135deg,' + t.bgFrom + ' 0%,' + t.bgMid + ' 50%,' + t.bgFrom + ' 100%)';
    var lg = 'linear-gradient(135deg,' + t.logoFrom + ',' + t.logoTo + ')';
    el('corps').innerHTML =
      '<div class="admlogin-root" style="--al-bg:' + bg + ';--al-logoG:' + lg
      + ';--al-title:' + t.titre + ';--al-sub:' + t.sous + '">'
      + '<div class="admlogin-split">' + marquePanneau()
      + '<main class="admlogin-form-panel">'
      + '<div id="al-maint"></div><div id="al-nipbox"></div>'
      + '<div class="admlogin-formwrap" id="cx-corps"></div>'
      + '<div class="cx-msg"><span class="msg" id="msg"></span></div>'
      + '</main></div></div>';
  }

  function dessiner(quoi, donnee){
    ECRAN = quoi;
    var z = el('cx-corps');
    if (!z) { socle(); z = el('cx-corps'); }
    /* ⚠ LA LARGEUR SUIT L ECRAN : les trois assistants sont plus hauts et
       plus denses que la connexion. */
    var large = (quoi === 'mfaConfig' || quoi === 'questions');
    z.className = 'admlogin-formwrap' + (large ? ' large' : '');
    if (quoi === 'mfa')            z.innerHTML = ecranMfa(donnee || 60);
    else if (quoi === 'oubli')     z.innerHTML = ecranOubli(donnee);
    else if (quoi === 'mfaConfig') z.innerHTML = ecranMfaConfig(donnee || {});
    else if (quoi === 'mdp')       z.innerHTML = ecranMdp(donnee || {});
    else if (quoi === 'questions') z.innerHTML = ecranQuestions(donnee || {});
    else                           z.innerHTML = ecranLogin();
    brancher();
  }

  /* ══ LE CASSE-TETE A GLISSIERE ═══════════════════════════════════════════
     ⚠ IL NE GARDE PAS LA PORTE, ET IL FAUT LE SAVOIR POUR NE PAS SUR-INVESTIR.
     Ce qui garde la porte, c est le verrou de quinze minutes apres cinq echecs,
     cote RateLimit, dans la page. Le casse-tete ralentit un bourrage a la
     main. Dans le web il tient dans une variable de module de la page ; ici dans
     une variable de la fenetre - aussi peu verifiable dans les deux cas, donc le
     deplacer ne retire aucune garantie parce qu il n en apportait aucune. */
  function captchaPoser(){
    var z = el('cap-zone');
    if (!z) return;
    CAPTCHA_OK = false;
    z.innerHTML = '<div id="sl-captcha">'
      + '<label class="cx-lbl">Vérification de sécurité</label>'
      + '<div style="font-size:0.72rem;color:#7a6652;margin:-0.1rem 0 0.5rem">'
      + 'Faites glisser la pièce pour compléter l’image.</div>'
      + '<div id="cap-stage"><canvas id="cap-bg"></canvas>'
      + '<canvas id="cap-piece"></canvas><div id="cap-flash"></div></div>'
      + '<div id="cap-track"><div id="cap-fill"></div>'
      + '<div id="cap-hint">Glissez vers la droite →</div>'
      + '<div id="cap-handle">⇢</div></div></div>';
    captchaArmer();
  }

  function captchaRetirer(){
    var z = el('cap-zone');
    if (z) z.innerHTML = '';
    CAPTCHA_OK = false;
  }

  function captchaArmer(){
    var stage = el('cap-stage'), bg = el('cap-bg'), pc = el('cap-piece');
    var track = el('cap-track'), handle = el('cap-handle');
    var fill = el('cap-fill'), hint = el('cap-hint'), flash = el('cap-flash');
    if (!stage || !bg || !pc || !track || !handle) return;
    var W = Math.max(240, Math.min(360, stage.clientWidth || 320));
    var H = 96, T = 42;                        // taille de la piece
    bg.width = W; bg.height = H; pc.width = W; pc.height = H;
    stage.style.height = H + 'px';
    /* La cible reste loin des deux bords : collee au bord, la piece serait
       trouvee sans chercher, et hors du cadre elle serait introuvable. */
    var cx = Math.round(W * 0.45 + Math.random() * W * 0.3);
    var cy = Math.round((H - T) / 2);
    var c = null, q = null;
    try { c = bg.getContext('2d'); q = pc.getContext('2d'); } catch (e) {}
    if (!c || !q) {
      var zc = el('cap-zone');
      if (zc) zc.innerHTML = '';
      CAPTCHA_OK = true;          // sinon la tentative serait refusee sans recours
      szDire('Vérification visuelle indisponible sur ce poste — le verrou de sécurité reste actif.', 'att');
      return;
    }
    /* Un fond DESSINE, pas une image telechargee : une fenetre native ne doit
       rien aller chercher sur le reseau pour afficher sa propre porte. */
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2b2262'); g.addColorStop(0.5, '#4f46e5'); g.addColorStop(1, '#191238');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var i = 0; i < 26; i++) {
      c.beginPath();
      c.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 26, 0, 6.284);
      c.fillStyle = 'rgba(255,255,255,' + (0.02 + Math.random() * 0.07) + ')';
      c.fill();
    }
    var img = c.getImageData(cx, cy, T, T);
    q.putImageData(img, 0, cy);                 // la piece part a gauche
    q.strokeStyle = 'rgba(255,255,255,0.8)'; q.lineWidth = 2;
    q.strokeRect(1, cy + 1, T - 2, T - 2);
    c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(cx, cy, T, T);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
    c.strokeRect(cx + 1, cy + 1, T - 2, T - 2);

    var max = track.clientWidth - handle.offsetWidth;
    var pris = false, x0 = 0, dx = 0;
    var poser = function(v){
      dx = Math.max(0, Math.min(max, v));
      handle.style.left = dx + 'px';
      fill.style.width = (dx + handle.offsetWidth) + 'px';
      q.clearRect(0, 0, W, H);
      var px = Math.round(dx / Math.max(1, max) * (W - T));
      q.putImageData(img, px, cy);
      q.strokeStyle = 'rgba(255,255,255,0.8)'; q.lineWidth = 2;
      q.strokeRect(px + 1, cy + 1, T - 2, T - 2);
    };
    var relacher = function(){
      if (!pris) return;
      pris = false; handle.style.cursor = 'grab';
      var px = Math.round(dx / Math.max(1, max) * (W - T));
      /* Six pixels de tolerance : au pixel pres, la souris ne suffirait pas et
         un ecran tactile serait impossible. */
      if (Math.abs(px - cx) <= 6) {
        CAPTCHA_OK = true;
        if (hint) hint.textContent = 'Vérifié';
        if (flash) { flash.style.background = 'rgba(74,222,128,0.28)'; flash.style.opacity = '1'; }
        handle.textContent = 'OK';
        handle.style.pointerEvents = 'none';
        var mp = el('sl-password'); if (mp) mp.focus();
      } else {
        CAPTCHA_OK = false;
        if (flash) { flash.style.background = 'rgba(248,113,113,0.3)'; flash.style.opacity = '1'; }
        setTimeout(function(){
          if (flash) flash.style.opacity = '0';
          poser(0);
          if (hint) hint.textContent = 'Glissez vers la droite →';
        }, 350);
      }
    };
    handle.addEventListener('pointerdown', function(e){
      pris = true; x0 = e.clientX - dx; handle.style.cursor = 'grabbing';
      try { handle.setPointerCapture(e.pointerId); } catch (er) {}
    });
    handle.addEventListener('pointermove', function(e){ if (pris) poser(e.clientX - x0); });
    handle.addEventListener('pointerup', relacher);
    handle.addEventListener('pointercancel', relacher);
    poser(0);
  }

  /* ══ LES MESSAGES D ERREUR — LE TEXTE ET LE TON VIENNENT DE LA PAGE ══════ */
  function faute(id, r){
    var z = el(id);
    if (!z) return;
    z.className = 'cx-err on' + (r && r.ton === 'orange' ? ' orange' : (r && r.ton === 'sombre' ? ' sombre' : ''));
    var txt = esc((r && r.message) || 'L’opération a échoué.');
    if (r && typeof r.restant === 'number' && r.restant > 0) {
      txt += '<br><span style="font-size:0.78rem">Attention — il vous reste <strong>' + r.restant
        + '</strong> tentative' + (r.restant > 1 ? 's' : '')
        + ' avant un verrouillage de 15 minutes.</span>';
    }
    z.innerHTML = txt;
  }
  /* ⚠ ON NE TOUCHE À RIEN SI C EST DÉJÀ FAIT : la fonction est appelée à
     chaque échec, et réécrire la classe à chaque fois relancerait la
     transition — le bouton clignoterait à la troisième tentative. */
  function devoilerOubli(){
    if (DEJA_RATE) return;
    DEJA_RATE = true;
    var z = document.querySelector('.cx-recours.cx-voile');
    if (z) z.className = 'cx-centre cx-recours';
  }
  /* ══ CE QUI REMPLACE LA BULLE DU NAVIGATEUR ═════════════════════════
     ⚠⚠ SA DEMANDE DU 2026-09-11 : << retire le texte de survol au-dessus du
     champ de mot de passe, ça ne sert à rien >>. C était la bulle native de
     Chromium, celle que << required >> fait apparaître à la soumission. Il a
     raison : dans une fenêtre qui cherche à ne plus avoir l air d une page
     web, une info-bulle grise du moteur est exactement ce qui trahit — elle
     ne suit ni le thème, ni la police, ni la langue de l application.
     ⚠ MAIS ON NE RETIRE PAS LA VÉRIFICATION, ON LA RAPATRIE. Sans elle, un
     formulaire vide partirait au réseau pour revenir avec un refus — un
     aller-retour, une attente, et un message venu d ailleurs. Ici : premier
     champ vide, on le met au foyer et on écrit dans la MÊME zone que tous
     les autres refus de cet écran. Une seule voix.
     ⚠ ET LE BOUTON RESTE CLIQUABLE. Le griser tant que les champs sont vides
     serait plus net — et le jour où cette règle a un trou, plus personne ne
     peut se connecter. Sur l écran qui OUVRE l application, on ne pose pas un
     verrou dont la panne se solde par une porte fermée.
     ⚠ << novalidate >> EN PLUS de retirer << required >> : les deux disent la même
     chose, et c est voulu. Un champ auquel on rendrait << required >> demain
     ferait revenir la bulle sans que personne ne comprenne d où elle sort ;
     l attribut sur le formulaire, lui, la tient fermée quoi qu il arrive. */
  function manque(ids){
    for (var i = 0; i < ids.length; i++) {
      var c = el(ids[i]);
      if (c && !String(c.value == null ? '' : c.value).trim()) { try { c.focus(); } catch (e) {} return true; }
    }
    return false;
  }
  function fauteEffacer(id){
    var z = el(id);
    if (z) { z.className = 'cx-err'; z.innerHTML = ''; }
  }

  /* ══ LA TENTATIVE ════════════════════════════════════════════════════════ */
  function entrer(){
    var idc = el('sl-email'), pwc = el('sl-password'), b = el('sl-btn');
    if (!idc || !pwc || !b) return;
    fauteEffacer('sl-error');
    if (manque(['sl-email', 'sl-password'])) {
      faute('sl-error', { message: 'Entrez votre nom d’utilisateur et votre mot de passe.' });
      return;
    }
    /* ⚠ LE DISQUE REMPLACE LE TEXTE SANS CHANGER LA TAILLE DU BOUTON : sa
       hauteur est fixée (min-height) et son contenu est centré. Un bouton qui
       rétrécit pendant qu on attend fait sauter tout le formulaire — c est la
       chose la plus datée qu une commande puisse faire. */
    b.disabled = true;
    b.innerHTML = '<span class="cx-spin"></span><span>Connexion…</span>';
    var sv = el('sl-remember');
    appeler('connexion:entrer', [idc.value.trim(), pwc.value, !!(sv && sv.checked), CAPTCHA_OK])
      .then(function(r){
        var b2 = el('sl-btn');
        if (!r.ok) {
          if (b2) { b2.disabled = false; b2.textContent = 'Se connecter'; }
          faute('sl-error', r);
          /* ⚠ ICI ET NULLE PART AILLEURS. Les autres échecs de cet écran —
             un code à six chiffres refusé, un chargement d étape qui rate —
             ne sont PAS des mots de passe oubliés, et offrir le recours à ce
             moment-là enverrait quelqu un réinitialiser un mot de passe qui
             était bon. Un compte verrouillé, lui, compte : c est justement là
             qu on a besoin de la porte de sortie. */
          devoilerOubli();
          /* Un echec peut FAIRE APPARAITRE le casse-tete (seuil atteint) ou le
             rendre inutile (compte verrouille : il n y a plus rien a ralentir). */
          if (r.captchaRequis) captchaPoser(); else if (r.motif === 'verrou') captchaRetirer();
          var pw = el('sl-password'); if (pw) { pw.value = ''; pw.focus(); }
          return;
        }
        if (r.suite === 'mfa')   { mfaDemarrer(r.secondes || 60); return; }
        if (r.suite === 'expire') {
          if (b2) { b2.disabled = false; b2.textContent = 'Se connecter'; }
          faute('sl-error', { message: r.message, ton: 'sombre' });
          return;
        }
        /* ⚠⚠ TOUT SE PASSE DANS CETTE FENETRE — sa demande du 2026-09-10 :
           << il faut integrer ca dans la meme fenetre >>. En 5.9.0 ces deux
           suites partaient vers la fenetre principale, et j avais ecrit qu un
           assistant a moitie porte s arreterait au milieu. C etait le cas : on
           entrait ici et on ressortait ailleurs.
           ⚠ ET IL Y EN AVAIT TROIS, pas deux : le mot de passe impose peut
           mener aux questions de securite. suivre est le seul aiguillage.
           ⚠ ON NE FERME PAS LA FENETRE ICI : partir() n arrive plus qu a la
           reussite finale, dans reussi. La fermer entre deux etapes aurait
           laisse l assistant sans ecran. */
        suivre(r);
      });
  }

  /* ══ LE CODE A SIX CHIFFRES ══════════════════════════════════════════════
     ⚠ LE DECOMPTE EST DESSINE ICI, MAIS L ECHEANCE RESTE CELLE DE LA PAGE.
     _mfaTimeout y revoque le jeton en attente et purge le sessionStorage. Si
     ce chrono arrive a zero avant, il ne ferme rien lui-meme : il appelle
     connexion:mfaAbandon et laisse la page faire le menage. Deux horloges qui
     decident, c est une qui se trompe. */
  function mfaDemarrer(sec){
    dessiner('mfa', sec);
    MFA_FIN = Date.now() + sec * 1000;
    if (MFA_T) clearInterval(MFA_T);
    MFA_T = setInterval(function(){
      var reste = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));
      var z = el('sl-mfa-timer');
      if (z) { z.textContent = reste + ' s'; if (reste <= 5) z.className = 'presse'; }
      if (reste <= 0) { clearInterval(MFA_T); MFA_T = null; mfaExpire(); }
    }, 250);
    var c = el('sl-mfa-code'); if (c) c.focus();
  }
  function mfaExpire(){
    appeler('connexion:mfaAbandon').then(function(){
      dessiner('login');
      faute('sl-error', { message: 'Délai de vérification dépassé — veuillez vous reconnecter.' });
    });
  }
  function mfaEnvoyer(){
    var c = el('sl-mfa-code'), b = el('sl-mfa-btn');
    if (!c || !b) return;
    fauteEffacer('sl-mfa-error');
    if (manque(['sl-mfa-code'])) {
      faute('sl-mfa-error', { message: 'Entrez le code à six chiffres.' });
      return;
    }
    /* On arrete le chrono PENDANT la verification : sinon un << delai depasse >>
       tomberait au milieu de l attente reseau, et le bouton resterait cliquable
       pour un second envoi. */
    if (MFA_T) { clearInterval(MFA_T); MFA_T = null; }
    var ch = el('sl-mfa-timer');
    if (ch && ch.parentElement) ch.parentElement.style.display = 'none';
    b.disabled = true;
    b.innerHTML = '<span class="cx-spin"></span><span>Vérification…</span>';
    c.disabled = true;
    appeler('connexion:mfa', [c.value]).then(function(r){
      if (r.ok) { reussi(r.prenom); return; }
      var c2 = el('sl-mfa-code'), b2 = el('sl-mfa-btn');
      if (b2) { b2.disabled = false; b2.textContent = 'Vérifier'; }
      if (c2) { c2.disabled = false; c2.value = ''; c2.focus(); }
      var ch2 = el('sl-mfa-timer');
      if (ch2 && ch2.parentElement) ch2.parentElement.style.display = '';
      faute('sl-mfa-error', r);
      /* Le chrono reprend la ou il en etait : le remettre a soixante offrirait
         du temps que la page n accorde pas, et le laisser mort ferait attendre
         un delai qui ne viendrait jamais. */
      var reste = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));
      if (reste <= 0) { mfaExpire(); return; }
      MFA_T = setInterval(function(){
        var x = Math.max(0, Math.ceil((MFA_FIN - Date.now()) / 1000));
        var zz = el('sl-mfa-timer');
        if (zz) { zz.textContent = x + ' s'; if (x <= 5) zz.className = 'presse'; }
        if (x <= 0) { clearInterval(MFA_T); MFA_T = null; mfaExpire(); }
      }, 250);
    });
  }

  /* ══ LA REUSSITE ═════════════════════════════════════════════════════════
     ⚠ L ORDRE EST LE SUJET. connexion:ouvrir leve le voile de chargement dans
     la page AVANT App.render(), puis dessine le tableau de bord. On ne ferme
     cette fenetre QU APRES : la fermer d abord laisserait voir l ecran de
     connexion web une fraction de seconde, juste avant le panneau - exactement
     le clignotement du #38, mais a l entree. */
  function reussi(prenom){
    szDire('Bienvenue' + (prenom ? ', ' + prenom : '') + '.', 'bon');
    appeler('connexion:ouvrir').then(function(){ setTimeout(partir, 220); });
  }
  function partir(){
    if (MAINT_T) { clearInterval(MAINT_T); MAINT_T = null; }
    if (MFA_T) { clearInterval(MFA_T); MFA_T = null; }
    try { window.close(); } catch (e) {}
  }

  /* ══ LA BANNIERE DE MAINTENANCE ══════════════════════════════════════════
     ⚠ ELLE SE RELIT, ET C EST LE DEFAUT CORRIGE EN 5.7.0 : lue une fois, elle
     restait apres la levee, et la boite du NIP avec. Un ecran qui annonce un
     blocage deja leve empeche de se connecter alors que plus rien n empeche.
     ⚠ UN APPEL QUI ECHOUE NE CHANGE RIEN : effacer la banniere sur une coupure
     reseau ferait croire la maintenance levee alors qu on n en sait rien.
     ⚠ ON NE REECRIT QUE SI LA PHRASE A CHANGE : sinon elle clignote sous les
     doigts toutes les vingt secondes. */
  function maintLire(){
    appeler('connexion:maintenance').then(function(r){
      if (!r || !r.ok) return;
      var avant = MAINT;
      MAINT = { actif: !!r.actif, phrase: r.phrase || '' };
      if (avant && avant.actif === MAINT.actif && avant.phrase === MAINT.phrase) return;
      maintPeindre();
    });
  }
  function maintPeindre(){
    var z = el('al-maint'), n = el('al-nipbox');
    if (!z) return;
    if (!MAINT || !MAINT.actif) {
      z.innerHTML = '';
      /* La boite du NIP part AVEC la banniere : une porte devant un mur se
         retire, et c est la seule surface qu un inconnu peut marteler. */
      if (n) n.innerHTML = '';
      return;
    }
    z.innerHTML = '<div class="admlogin-maint"><strong>Maintenance en cours</strong>'
      + '<div>' + esc(MAINT.phrase) + '</div></div>';
  }

  /* ══ LE NIP D URGENCE — Ctrl + Maj + 0 ═══════════════════════════════════
     ⚠ IL N EXISTE QUE PENDANT UNE MAINTENANCE ACTIVE. Hors maintenance, le
     raccourci ne dessine rien : le serveur refusait deja, donc rien ne cassait,
     mais offrir une porte devant un mur RETIRE des tentatives possibles au lieu
     d en compter. */
  function nipOuvrir(){
    if (!MAINT || !MAINT.actif) return;
    var n = el('al-nipbox');
    if (!n || n.firstChild) return;
    n.innerHTML = '<div class="admlogin-nipbox">'
      + '<strong>Désactivation d’urgence</strong>'
      + '<div style="font-size:0.76rem;margin:0.3rem 0 0.5rem">Entrez le NIP posé à '
      + 'l’activation du mode exclusif.</div>'
      + '<label class="cx-lbl" for="nip-champ">NIP de désactivation</label>'
      + '<input type="password" id="nip-champ" inputmode="numeric" maxlength="12" '
      + 'autocomplete="off" placeholder="NIP">'
      + '<div class="cx-err" id="nip-err"></div>'
      + '<div class="npr"><button type="button" id="nip-ok">Lever la maintenance</button>'
      + '<button type="button" id="nip-non">Annuler</button></div></div>';
    var c = el('nip-champ'); if (c) c.focus();
    var ok = el('nip-ok'); if (ok) ok.onclick = nipEnvoyer;
    var no = el('nip-non');
    if (no) no.onclick = function(){ var b = el('al-nipbox'); if (b) b.innerHTML = ''; };
    if (c) c.onkeydown = function(e){ if (e.key === 'Enter') nipEnvoyer(); };
  }
  function nipEnvoyer(){
    var c = el('nip-champ'), b = el('nip-ok');
    if (!c || !b) return;
    fauteEffacer('nip-err');
    b.disabled = true;
    appeler('connexion:nip', [c.value]).then(function(r){
      var b2 = el('nip-ok');
      if (b2) b2.disabled = false;
      if (!r.ok) { faute('nip-err', r); var cc = el('nip-champ'); if (cc) { cc.value = ''; cc.focus(); } return; }
      szDire(r.message || 'Maintenance levée.', 'bon');
      MAINT = { actif: false, phrase: '' };
      maintPeindre();
    });
  }

  /* ══ LE BRANCHEMENT ══════════════════════════════════════════════════════
     ⚠ APPELE APRES CHAQUE DESSIN, et il ne suppose rien : chaque element est
     cherche, et son absence est normale (l ecran du code n a pas de case << se
     souvenir >>). C est le banc verifier-appels-fenetres qui garantit que les
     fonctions citees ici existent - une fenetre dont un bouton appelle un nom
     absent << ne fait rien >> au clic, et rien d autre ne l attrape. */
  function brancher(){
    /* ⚠ LE SURVOL DES BOUTONS PRINCIPAUX SE BRANCHE ICI, apres chaque dessin.
       La couleur du survol se calcule depuis le theme, donc elle ne peut pas
       vivre dans une regle CSS : une regle :hover ne saurait pas quelle valeur
       viser sans la recopier — et une couleur recopiee cesse de suivre le
       theme des la premiere fois qu il change.
       ⚠ TOUS les boutons principaux de TOUS les ecrans : la liste est un
       selecteur, pas une enumeration, sinon un ecran ajoute demain aurait un
       bouton qui ne reagit plus au survol sans que rien ne le dise. */
    var prims = document.querySelectorAll('.cx-btn');
    for (var pi = 0; pi < prims.length; pi++) btnSurvol(prims[pi]);
    var f = el('cx-form');
    if (f) f.onsubmit = function(e){ e.preventDefault(); entrer(); };
    var fm = el('cx-form-mfa');
    if (fm) fm.onsubmit = function(e){ e.preventDefault(); mfaEnvoyer(); };
    var oeil = el('sl-oeil');
    if (oeil) oeil.onclick = function(){
      var p2 = el('sl-password');
      if (!p2) return;
      var cache = p2.type === 'password';
      p2.type = cache ? 'text' : 'password';
      oeil.innerHTML = cache ? IC.oeilBarre : IC.oeil;
      oeil.setAttribute('aria-label', cache ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      p2.focus();
    };
    var ou = el('sl-oubli');
    if (ou) ou.onclick = function(){
      appeler('connexion:oubli').then(function(r){ dessiner('oubli', r); });
    };
    var our = el('sl-oubli-retour');
    if (our) our.onclick = function(){ dessiner('login'); apresLogin(); };
    var mr = el('sl-mfa-retour');
    if (mr) mr.onclick = function(){ mfaExpire(); };
    var code = el('sl-mfa-code');
    if (code) code.oninput = function(){ code.value = code.value.replace(/\D/g, '').slice(0, 6); };
    /* Le seuil du casse-tete depend du NOM D UTILISATEUR : deux comptes sur le
       meme poste n ont pas le meme compte d echecs, et exiger le casse-tete a
       l un parce que l autre s est trompe serait faux dans les deux sens. */
    /* Les trois assistants de la suite. Chaque element est cherche, et son
       absence est normale : brancher est appele apres CHAQUE dessin. */
    var fw = el('cx-form-wz');
    if (fw) fw.onsubmit = function(e){ e.preventDefault(); mfaConfigEnvoyer(); };
    var wc = el('wz-code');
    if (wc) wc.oninput = function(){ wc.value = wc.value.replace(/\D/g, '').slice(0, 6); };
    var wcp = el('wz-copier');
    if (wcp) wcp.onclick = function(){
      var z = el('wz-cle');
      if (!z) return;
      /* ⚠ LA CLE SE COPIE SANS LES ESPACES : ils sont la pour la LIRE (groupes
         de quatre), et les applications TOTP refusent la plupart du temps une
         cle qui en contient. Copier ce qu on voit aurait fait echouer le
         collage sans dire pourquoi. */
      var v = String(z.textContent || '').replace(/\s+/g, '');
      try { navigator.clipboard.writeText(v); szDire('Clé copiée (sans les espaces).', 'bon'); }
      catch (e) { szDire('La copie a échoué — recopiez la clé à la main.', 'att'); }
    };
    var wq = el('wz-qr');
    if (wq) wq.onerror = function(){
      /* Le QR vient d un service externe : sans reseau, ou si le service est
         indisponible, on le retire et on renvoie a la cle — qui, elle, est la. */
      wq.style.display = 'none';
      var z = el('wz-qr-err');
      if (z) z.className = 'cx-err on';
    };
    var wa = el('wz-annuler');
    if (wa) wa.onclick = function(){ dessiner('login'); apresLogin(); };

    var fmdp = el('cx-form-mdp');
    if (fmdp) fmdp.onsubmit = function(e){ e.preventDefault(); mdpEnvoyer(); };
    var pca = el('pc-annuler');
    if (pca) pca.onclick = function(){ dessiner('login'); apresLogin(); };

    var fq = el('cx-form-q');
    if (fq) fq.onsubmit = function(e){ e.preventDefault(); questionsEnvoyer(); };
    var sq1 = el('sq-q1'), sq2 = el('sq-q2');
    if (sq1) sq1.onchange = questionsAccorder;
    if (sq2) sq2.onchange = questionsAccorder;
    var sqa = el('sq-annuler');
    if (sqa) sqa.onclick = function(){ dessiner('login'); apresLogin(); };

    var idc = el('sl-email');
    if (idc) idc.onchange = function(){
      appeler('connexion:captcha', [idc.value.trim()]).then(function(r){
        if (!r || !r.ok) return;
        if (r.requis && !r.verrouille) captchaPoser(); else captchaRetirer();
      });
    };
  }

  /* Le curseur va DIRECTEMENT au mot de passe quand le nom est deja connu :
     l y renvoyer serait lui faire retaper ce que le poste a retenu. */
  function apresLogin(){
    if (CTX.captchaRequis && !CTX.verrouille) captchaPoser();
    var z = el(CTX.prefill ? 'sl-password' : 'sl-email');
    if (z) z.focus();
  }

  /* ══ LE RACCOURCI ════════════════════════════════════════════════════════ */
  window.addEventListener('keydown', function(e){
    if (e.ctrlKey && e.shiftKey && (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0')) {
      e.preventDefault();
      nipOuvrir();
    }
  });

  /* ══ LE CHARGEMENT ═══════════════════════════════════════════════════════
     ⚠ SI LE CONTEXTE NE VIENT PAS, ON DESSINE QUAND MEME. Un ecran de connexion
     qui refuserait de s afficher parce qu il n a pas pu lire la couleur d un
     halo serait une panne bien pire que celle qu il evite - et il n y aurait
     plus aucun moyen d entrer. D ou les valeurs de repli. */
  var REPLI = {
    ok: true,
    theme: { bgFrom: '#191238', bgMid: '#2b2262', logoFrom: '#4f46e5', logoTo: '#7c3aed',
      titre: '#f5e6d0', sous: 'rgba(236,229,217,0.92)', sousTexte: 'Panneau d’administration',
      btnFrom: '#1a1207', btnTo: '#3d2810', btnTexte: '#f5e6d0' },
    marque: { nom: 'SANDRIZA', lettre: 'É', logo: '' },
    prefill: '', souvenir: false, captchaRequis: false, verrouille: false
  };

  /* ══ LES INTITULÉS ARRIVENT DE LA COQUILLE, LE POPUP AUSSI ══════════════
     ⚠ SI LA COQUILLE N EN DONNE AUCUN, ON NE DESSINE RIEN. Une barre vide,
     c est une bande sombre de trente pixels qui ne sert à rien et qui mange
     le haut de l écran — pire que pas de barre. Le modèle peut aussi arriver
     en retard (il vient de la page principale) : on redemande une fois à
     deux secondes, et une seule — un sondage permanent pour une barre de
     menus serait hors de proportion.
     ⚠ ET ON N EN FAIT PAS UN PRÉALABLE : la barre se pose quand elle peut,
     l écran de connexion n attend jamais après elle. */
  var BARRE_FAITE = false;
  /* ⚠ LE FOND PART DU HAUT DU DÉGRADÉ — c est ce qu on recouvre — puis on le
     POUSSE franchement dans son propre sens : une barre doit se détacher du
     panneau, pas s y fondre. Ensuite le texte prend le clair ou le foncé selon
     ce fond-là, et on l amène au seuil par pas de 6 %. Le même calcul que le
     bouton principal, et pour la même raison : on ne CHOISIT pas une couleur en
     espérant qu elle passe, on l amène où elle doit être. */
  function barreTeindre(z){
    var t = (CTX && CTX.theme) ? CTX.theme : {};
    var base = t.bgFrom || '#2a2118';
    var sombre = lumi(base) <= 0.5;
    var fond = melanger(base, sombre ? -0.22 : 0.22);
    var txt = sombre ? '#f3ede3' : '#2a2118';
    var n = 0;
    while (contraste(txt, fond) < 4.6 && n < 24) {
      fond = melanger(fond, sombre ? -0.06 : 0.06);
      n++;
    }
    z.style.setProperty('--cxb-fond', fond);
    z.style.setProperty('--cxb-txt', txt);
    z.style.setProperty('--cxb-surv', sombre ? 'rgba(255,255,255,0.13)'
      : 'rgba(0,0,0,0.10)');
    z.style.setProperty('--cxb-trait', sombre ? 'rgba(255,255,255,0.09)'
      : 'rgba(0,0,0,0.10)');
  }
  function barrePoser(){
    if (BARRE_FAITE || !P || !P.menuLabels) return;
    P.menuLabels().then(function(noms){
      if (BARRE_FAITE || !noms || !noms.length) return;
      BARRE_FAITE = true;
      var z = document.createElement('div');
      z.className = 'cx-barre';
      z.setAttribute('role', 'menubar');
      barreTeindre(z);
      for (var i = 0; i < noms.length; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = noms[i];
        b.setAttribute('data-i', String(i));
        b.onclick = function(){
          var self = this;
          var r = self.getBoundingClientRect();
          /* ⚠ LE POPUP SORT SOUS LE BOUTON, pas sous le pointeur : un menu
             qui s ouvre à deux pixels près de là où on a cliqué est un menu
             qui a l air de flotter. << bottom >> et << left >> sont exactement ce
             qu une barre de menus promet. */
          self.className = 'on';
          P.menuOuvrir(parseInt(self.getAttribute('data-i'), 10) || 0,
            Math.round(r.left), Math.round(r.bottom));
          /* Le menu contextuel est modal côté système : on ne saura pas
             quand il se referme. On rend donc son air normal au bouton
             après un court instant — la surbrillance a joué son rôle
             (dire quel menu on a ouvert), elle n a pas à durer. */
          setTimeout(function(){ self.className = ''; }, 400);
        };
        z.appendChild(b);
      }
      document.body.appendChild(z);
      document.body.className = (document.body.className + ' cx-abarre').replace(/^ /, '');
    }).catch(function(){});
  }

  function charger(){
    appeler('connexion:contexte').then(function(r){
      CTX = (r && r.ok && r.theme && r.marque) ? r : REPLI;
      if (CTX === REPLI) szDire('Décor par défaut — la fenêtre principale n’a pas répondu.', 'att');
      socle();
      /* ⚠ LE DEPART EST HONORE APRES LE SOCLE, PAS AVANT : les assistants ont
         besoin du panneau de marque et de la zone de message deja en place. */
      if (DEPART === 'mfa')            { mfaDemarrer(60); }
      else if (DEPART === 'mfaConfig') { chargerMfaConfig(); }
      else if (DEPART === 'mdp')       { chargerMdp(); }
      else if (DEPART === 'questions') { chargerQuestions(); }
      else if (DEPART === 'oubli')     {
        appeler('connexion:oubli').then(function(x){ dessiner('oubli', x); });
      } else {
        dessiner('login');
        apresLogin();
      }
      /* La banniere se lit tout de suite, puis toutes les vingt secondes :
         assez pour qu une levee se voie dans le temps qu on met a retaper un mot
         de passe, assez lent pour ne peser sur rien. */
      barrePoser();
      setTimeout(barrePoser, 2000);
      maintLire();
      MAINT_T = setInterval(maintLire, 20000);
    });
  }

  window.addEventListener('beforeunload', function(){
    if (MAINT_T) clearInterval(MAINT_T);
    if (MFA_T) clearInterval(MFA_T);
  });

  charger();
})();
</script></body></html>`;
}

module.exports = { pageConnexion };
