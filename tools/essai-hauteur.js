'use strict';
/* ⚠ SON JOURNAL DIT : vue posee 1400x900, exactement le cadre. Et sa capture
   montre une bande noire sur 37 % de la hauteur. Donc la VUE fait la bonne
   taille et c est SON CONTENU qui ne la remplit pas. On mesure, dans une
   fenetre de SA taille (1400x900), ce que chaque niveau occupe vraiment. */
const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');
const dire = (x) => process.stdout.write('ELG| ' + x + '\n');

app.whenReady().then(async () => {
  const H = parseInt(process.env.SZ_H || '900', 10);
  const ECRAN = process.env.SZ_ECRAN || '';
  const f = new BrowserWindow({ width: 1400, height: H, show: false, backgroundColor: '#000' });
  await f.loadURL('data:text/html,<body>hote</body>');
  const [w, h] = f.getContentSize();
  dire('cadre de contenu : ' + w + 'x' + h + '   (le sien : 1400x900)');

  const vue = new WebContentsView({ webPreferences: {
    contextIsolation: true, nodeIntegration: false, sandbox: true } });
  f.contentView.addChildView(vue);
  vue.setBounds({ x: 0, y: 0, width: w, height: h });
  const page = require('../src/fenetres/connexion.js').pageConnexion(ECRAN);
  await new Promise((r) => {
    vue.webContents.once('did-finish-load', r);
    vue.webContents.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(page));
  });
  await new Promise((r) => setTimeout(r, 600));

  const m = await vue.webContents.executeJavaScript(`(function(){
    var q = function(s){ var e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().height) : -1; };
    return JSON.stringify({
      innerHeight: window.innerHeight,
      html: q('html'), body: q('body'), corps: q('#corps'),
      root: q('.admlogin-root'), split: q('.admlogin-split'),
      brand: q('.admlogin-brand'), panneau: q('.admlogin-form-panel')
    });
  })()`, true);
  const d = JSON.parse(m);
  dire('');
  dire('  innerHeight de la vue ........ ' + d.innerHeight);
  dire('  <html> ....................... ' + d.html);
  dire('  <body> ....................... ' + d.body);
  dire('  #corps (l ancre du socle) .... ' + d.corps);
  dire('  .admlogin-root ............... ' + d.root);
  dire('  .admlogin-split .............. ' + d.split);
  dire('  .admlogin-brand (gauche) ..... ' + d.brand);
  dire('  .admlogin-form-panel (droite)  ' + d.panneau);
  dire('  depassement du panneau ....... ' + d.panneauScroll + ' px (doit pouvoir defiler)');
  dire('');
  const manque = d.innerHeight - d.root;
  dire(manque > 4
    ? ('>>> IL MANQUE ' + manque + ' px : le contenu ne remplit PAS la vue.')
    : '>>> le contenu remplit la vue.');
  setTimeout(() => app.quit(), 200);
});
app.on('window-all-closed', () => app.quit());
