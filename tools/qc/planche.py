# Planches de contrôle visuel : assemble les captures de tools/qc/toutes.sh, 6 par planche (2 colonnes, nom au-dessus).
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; par = int(sys.argv[2]) if len(sys.argv) > 2 else 6
imgs = sorted(f for f in glob.glob(os.path.join(d, '*.png')) if not os.path.basename(f).startswith('planche'))
W, H = 1160, 780; s = 0.5; cw, ch = int(W*s), int(H*s); col = 2
try: font = ImageFont.truetype('arial.ttf', 22)
except Exception: font = ImageFont.load_default()
for n in range(0, len(imgs), par):
    lot = imgs[n:n+par]; rows = (len(lot)+col-1)//col
    sheet = Image.new('RGB', (col*cw + (col+1)*10, rows*(ch+34) + 10), (255, 0, 255))
    dr = ImageDraw.Draw(sheet)
    for i, f in enumerate(lot):
        x = 10 + (i % col)*(cw+10); y = 10 + (i//col)*(ch+34)
        im = Image.open(f).convert('RGB').resize((cw, ch))
        sheet.paste(im, (x, y+28)); dr.text((x, y), os.path.basename(f)[:-4], fill=(0,0,0), font=font)
    sheet.save(os.path.join(d, 'planche-%02d.png' % (n//par)))
print(len(imgs), 'images')
