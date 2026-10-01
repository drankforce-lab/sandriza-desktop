'use strict';

/*
 * FENÊTRE « PHOTO EN GRAND » — NATIVE (2026-10-01)
 * =============================================================================
 * Sa demande : « si on double clic sur une photo on devrait l'avoir en plus
 * grand mais dans une fenêtre séparée ». La photo s'ouvrait dans un VOILE posé
 * sur l'explorateur : il couvrait la liste qu'on était en train de parcourir,
 * et il ne se déplaçait pas sur l'autre écran.
 *
 * ⚠ AUCUNE OPÉRATION NOUVELLE. La fenêtre reçoit l'IDENTIFIANT de la photo (et
 * ceux de la page de l'explorateur, pour les flèches), puis demande l'image
 * ENTIÈRE par `studio:vignettes` — exactement ce que faisait le voile. Rien de
 * lourd ne transite par la coquille : une data: URL de plusieurs Mo dans
 * l'adresse de la page aurait été tronquée.
 *
 * ⚠ L'IMAGE S'AJUSTE À LA FENÊTRE À L'OUVERTURE. Le voile l'affichait à sa
 * taille réelle (1200 × 1600 pour une photo de studio) : on n'en voyait que le
 * milieu, et « Ajuster » ramenait… à cette même taille réelle.
 *
 * ⚠ AUCUN CARACTÈRE ` (accent grave) dans la portion de script, COMMENTAIRES
 * COMPRIS : le script vit dans un littéral de gabarit.
 */

const { CSS_SOCLE, CSS_JOUR, JS_SOCLE, ICO, TETE } = require('./socle');
const T = require('../langue').tr('visionneuse');

const CSS_PROPRE = `
body{overflow:hidden}
#corps{padding:0}
.vt{flex:0 0 auto;display:flex;align-items:center;gap:.45rem;padding:.5rem .9rem;
  border-bottom:1px solid var(--v08);background:var(--f-carte)}
.vt .nm{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;line-height:1.2}
.vt .nm b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vt .nm span{font:600 .7rem/1.2 ui-monospace,Consolas,monospace;color:var(--tx-or)}
.vt button{padding:.3rem .6rem;font-size:.8rem;min-width:2.1rem}
.vt .pct{font-variant-numeric:tabular-nums;font-size:.78rem;color:var(--tx2);min-width:3.3rem;text-align:center}
.vt .rang{font-size:.76rem;color:var(--tx2);font-variant-numeric:tabular-nums;min-width:3.6rem;text-align:center}
.vt .sep{width:1px;align-self:stretch;margin:.15rem .2rem;background:var(--v10)}
/* overflow:hidden et non auto : on se deplace a la souris, par transform. Une
   barre de defilement se disputerait le glisser. */
.cadre{flex:1 1 auto;min-height:0;overflow:hidden;position:relative;display:flex;
  align-items:center;justify-content:center;background:var(--f-pied);cursor:grab}
.cadre.tire{cursor:grabbing}
.cadre img{max-width:none;max-height:none;transform-origin:center center;
  user-select:none;-webkit-user-drag:none;box-shadow:0 10px 40px rgba(0,0,0,.35)}
.cadre .attente{color:var(--tx2);font-size:.85rem}
.aide{flex:0 0 auto;padding:.35rem .9rem;font-size:.7rem;color:var(--tx3);
  border-top:1px solid var(--v06);text-align:center}
.aide kbd{font:600 .66rem/1 system-ui;padding:.1rem .32rem;border-radius:4px;
  border:1px solid var(--v16);background:var(--v05);color:var(--tx2)}
`;

/**
 * Page complète. `liste` = [{ id, nom, code }] (la page de l'explorateur),
 * `id` = la photo ouverte.
 */
function pageVisionneuse(id, liste) {
  const l = Array.isArray(liste) ? liste.slice(0, 200).map((p) => ({
    id: String((p && p.id) || ''), nom: String((p && p.nom) || ''), code: String((p && p.code) || ''),
  })).filter((p) => p.id) : [];
  if (id && !l.some((p) => p.id === String(id))) l.unshift({ id: String(id), nom: '', code: '' });
  // ⚠ Le JSON entre dans la balise de script de la page : « < » echappe, sinon
  // un nom de photo qui contiendrait une balise fermante la couperait.
  const donnees = JSON.stringify({ id: String(id || ''), liste: l }).replace(/</g, '\\u003c');
  return `${TETE()}
<title>${T("Photo — Administration Sandriza")}</title>
<style>${CSS_SOCLE}${CSS_PROPRE}${CSS_JOUR}</style></head><body>
<div class="vt"><span class="ico">${ICO.image}</span>
  <span class="nm"><b id="nm"></b><span id="cd"></span></span>
  <button id="b-prec" title="${T("Photo précédente")}" aria-label="${T("Photo précédente")}">‹</button>
  <span class="rang" id="rang"></span>
  <button id="b-suiv" title="${T("Photo suivante")}" aria-label="${T("Photo suivante")}">›</button>
  <span class="sep"></span>
  <button id="b-moins" title="${T("Réduire")}" aria-label="${T("Réduire")}">−</button>
  <span class="pct" id="pct">—</span>
  <button id="b-plus" title="${T("Agrandir")}" aria-label="${T("Agrandir")}">+</button>
  <button id="b-ajuster">${T("Ajuster")}</button>
  <button id="b-reel">100 %</button>
</div>
<div class="corps" id="corps"><div class="cadre" id="cadre"><div class="attente" id="attente">${T("Chargement de l’image…")}</div></div></div>
<div class="aide"><span class="msg" id="msg"></span><kbd>←</kbd> <kbd>→</kbd> ${T("photo précédente ou suivante")} · ${T("molette : zoom")} · ${T("glisser : déplacer")} · <kbd>0</kbd> ${T("ajuster")} · <kbd>${T("Échap")}</kbd> ${T("fermer")}</div>
<script>
(function(){
  'use strict';
  ${JS_SOCLE()}
  var D = ${donnees};
  var LISTE = D.liste, I = 0;
  for (var k = 0; k < LISTE.length; k++) if (LISTE[k].id === D.id) I = k;
  var PLEIN = {};
  var Z = 1, X = 0, Y = 0, FIT = 1;
  var cadre = document.getElementById('cadre');

  function img(){ return document.getElementById('v-img'); }
  function appliquer(){
    var im = img();
    if (im) im.style.transform = 'translate(' + X + 'px,' + Y + 'px) scale(' + Z + ')';
    document.getElementById('pct').textContent = im ? Math.round(Z * 100) + ' %' : '—';
  }
  /* Ajuster = la photo ENTIERE dans le cadre, sans jamais l agrandir au-dela
     de sa taille reelle (une petite image grossie ne montre que du flou). */
  function ajuster(){
    var im = img(); if (!im || !im.naturalWidth) return;
    var r = cadre.getBoundingClientRect();
    FIT = Math.min(1, (r.width - 32) / im.naturalWidth, (r.height - 32) / im.naturalHeight);
    if (!(FIT > 0)) FIT = 1;
    Z = FIT; X = 0; Y = 0; appliquer();
  }
  /* Borne des deux cotes : sans plancher, une image de zero pixel qu on ne
     retrouve plus ; sans plafond, un coup de molette appuye fige la fenetre. */
  function zoomer(f){
    var av = Z;
    Z = Math.max(FIT * 0.5, Math.min(8, Z * f));
    X = X * (Z / av); Y = Y * (Z / av);
    appliquer();
  }

  function montrer(i){
    if (!LISTE.length) return;
    I = (i + LISTE.length) % LISTE.length;
    var p = LISTE[I];
    document.getElementById('nm').textContent = p.nom || p.code || '${T("Photo")}';
    document.getElementById('cd').textContent = (p.nom && p.code) ? p.code : '';
    document.title = (p.nom || p.code || '${T("Photo")}') + ' — Sandriza';
    document.getElementById('rang').textContent = LISTE.length > 1 ? (I + 1) + ' / ' + LISTE.length : '';
    document.getElementById('b-prec').disabled = LISTE.length < 2;
    document.getElementById('b-suiv').disabled = LISTE.length < 2;
    var id = p.id;
    var poser = function(src){
      if (LISTE[I].id !== id) return;   // on a change de photo entre-temps
      if (!src) { cadre.innerHTML = '<div class="attente">${T("Cette photo n’a pas pu être lue.")}</div>'; appliquer(); return; }
      cadre.innerHTML = '<img id="v-img" alt="">';
      var im = img();
      im.onload = ajuster;
      im.src = src;
    };
    if (PLEIN[id] !== undefined) { poser(PLEIN[id]); return; }
    cadre.innerHTML = '<div class="attente">${T("Chargement de l’image…")}</div>';
    appliquer();
    var pr;
    try { pr = P.appeler('studio:vignettes', { ids: [id], plein: true }); } catch (e) { pr = null; }
    if (!pr || typeof pr.then !== 'function') { poser(''); return; }
    pr.then(function(r){
      var src = (r && r.ok && r.vignettes && r.vignettes[id]) || '';
      PLEIN[id] = src;
      poser(src);
    }, function(){ poser(''); });
  }
  /* L explorateur rouvre CETTE fenetre sur une autre photo plutot que d en
     empiler une seconde : la coquille appelle cette fonction. */
  window.szVoir = function(d){
    if (!d || !d.id) return;
    if (d.liste && d.liste.length) LISTE = d.liste;
    var j = 0;
    for (var k = 0; k < LISTE.length; k++) if (LISTE[k].id === d.id) j = k;
    montrer(j);
  };

  document.getElementById('b-prec').onclick = function(){ montrer(I - 1); };
  document.getElementById('b-suiv').onclick = function(){ montrer(I + 1); };
  document.getElementById('b-plus').onclick = function(){ zoomer(1.25); };
  document.getElementById('b-moins').onclick = function(){ zoomer(0.8); };
  document.getElementById('b-ajuster').onclick = ajuster;
  document.getElementById('b-reel').onclick = function(){ Z = 1; X = 0; Y = 0; appliquer(); };
  cadre.onwheel = function(ev){ ev.preventDefault(); zoomer(ev.deltaY < 0 ? 1.12 : 0.89); };
  cadre.ondblclick = function(){ if (Math.abs(Z - FIT) < 0.01) { Z = 1; X = 0; Y = 0; appliquer(); } else ajuster(); };
  var tire = false, x0 = 0, y0 = 0;
  cadre.onmousedown = function(ev){
    if (!img()) return;
    tire = true; x0 = ev.clientX - X; y0 = ev.clientY - Y;
    cadre.classList.add('tire'); ev.preventDefault();
  };
  // Sur la fenetre, pas sur le cadre : relacher hors du cadre laisserait sinon
  // l image collee au curseur.
  window.addEventListener('mousemove', function(ev){
    if (!tire) return;
    X = ev.clientX - x0; Y = ev.clientY - y0; appliquer();
  });
  window.addEventListener('mouseup', function(){ tire = false; cadre.classList.remove('tire'); });
  // La fenetre change de taille : une photo ajustee le reste.
  window.addEventListener('resize', function(){ if (Math.abs(Z - FIT) < 0.01) ajuster(); });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); montrer(I - 1); }
    else if (ev.key === 'ArrowRight') { ev.preventDefault(); montrer(I + 1); }
    else if (ev.key === '+' || ev.key === '=') zoomer(1.25);
    else if (ev.key === '-') zoomer(0.8);
    else if (ev.key === '0') ajuster();
    else if (ev.key === 'Escape') { ev.preventDefault(); P.fermer(); }
  });
  montrer(I);
})();
</script></body></html>`;
}

module.exports = { pageVisionneuse };
