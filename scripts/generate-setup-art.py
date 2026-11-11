from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math, random
ROOT=Path(r'D:\FoundryV14\StarWarsFFG-v14-Mitos')
OUT=ROOT/'assets'/'setup'
OUT.mkdir(parents=True,exist_ok=True)
W,H=1920,1080
rng=random.Random(41827)
img=Image.new('RGB',(W,H))
px=img.load()
# Midnight blue to deep purple nebula glow, original generated procedural artwork.
for y in range(H):
    for x in range(W):
        k=x/W; t=y/H
        nebul=math.exp(-((k-.64)**2/.13 + (t-.50)**2/.12))
        rim=math.exp(-((k-.18)**2/.09 + (t-.85)**2/.28))
        px[x,y]=(int(5+17*nebul+13*rim),int(8+16*nebul+9*rim),int(23+36*nebul+17*rim))
g=Image.new('RGBA',(W,H),(0,0,0,0));gd=ImageDraw.Draw(g)
for i in range(42):
    x=rng.randrange(W); y=rng.randrange(H);rr=rng.randint(50,280)
    color=rng.choice([(24,91,166,13),(92,53,167,12),(223,108,40,11)])
    gd.ellipse((x-rr,y-rr,x+rr,y+rr),fill=color)
g=g.filter(ImageFilter.GaussianBlur(75))
img=Image.alpha_composite(img.convert('RGBA'),g)
d=ImageDraw.Draw(img,'RGBA')
# Stellar backdrop and muted parallax trails
for i in range(670):
    x=rng.randrange(W);y=rng.randrange(H);r=rng.choice([1,1,1,1,2,2,3])
    lum=rng.randint(100,250)
    d.ellipse((x-r,y-r,x+r,y+r), fill=(196,223,255,lum))
    if r==3 and i%3==0:
        d.line((x-11,y,x+11,y),fill=(167,190,244,60),width=1)
for i in range(22):
    x=rng.randrange(W);y=rng.randrange(H)
    d.line((x-3,y+2,x+11,y-3),fill=(98,170,238,rng.randint(22,80)),width=1)
# far orbital planet with offscreen edge
d.ellipse((-480,160,490,1140),fill=(8,21,39,245),outline=(65,99,154,110),width=6)
for t in range(0,65):
    d.arc((-480-t,160-t,490+t,1140+t),263,346,fill=(61,114,186,max(3,30-int(t*.43))),width=2)
# luminous star in distance
x,y=1330,330
for rr,a in [(160,7),(100,13),(53,25),(23,41)]:
    d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(98,179,255,a))
d.ellipse((x-7,y-7,x+7,y+7),fill=(222,241,255,220))
d.line((x-75,y,x+75,y),fill=(155,202,255,63),width=3)
# angular fictional escort ship silhouettes (original shapes, not franchise spacecraft)
def poly(points,fill,outline=None):
    d.polygon(points,fill=fill)
    if outline: d.line(points+[points[0]],fill=outline,width=2,joint='curve')
ship=[(965,608),(1130,568),(1430,584),(1620,516),(1681,524),(1530,625),(1781,741),(1609,764),(1380,664),(1212,695),(1050,642)]
poly(ship,(12,22,41,248),(67,126,179,110))
poly([(1103,608),(1422,598),(1602,559),(1487,627),(1598,709),(1402,638)],(21,41,61,250),(49,128,171,100))
d.line([(1160,614),(1433,611),(1569,566)],fill=(114,195,238,75),width=4)
for bx,by in [(1152,621),(1162,633),(1172,646)]:
    d.line((bx,by,bx-180,by+63),fill=(94,179,254,64),width=4)
# supporting escort silhouettes
for xx,yy,size in [(1308,850,.48),(1665,358,.29)]:
    p=[(xx-170*size,yy),(xx+38*size,yy-17*size),(xx+135*size,yy-45*size),
       (xx+95*size,yy+6*size),(xx+151*size,yy+70*size),(xx+35*size,yy+24*size)]
    poly(p,(13,28,51,236),(82,132,178,82))
# Text block and subdued separator
d.rounded_rectangle((130,160,880,586),radius=20,fill=(6,12,27,172),outline=(106,151,207,62),width=3)
fonts=Path(r'C:\Windows\Fonts')
heading=str(fonts/'bahnschrift.ttf') if (fonts/'bahnschrift.ttf').exists() else str(fonts/'arialbd.ttf')
subtitle=str(fonts/'arial.ttf')
font=ImageFont.truetype(heading,135)
font2=ImageFont.truetype(heading,67)
font3=ImageFont.truetype(subtitle,28)
d.text((192,228),'STAR WARS',font=font,fill=(240,218,157,255),stroke_width=2,stroke_fill=(50,39,25,220))
d.text((198,381),'FFG SYSTEM',font=font2,fill=(220,230,247,255))
d.line((198,470,745,470),fill=(223,181,107,180),width=3)
d.text((198,494),'FOUNDRY VTT   /   MITOS COMMUNITY EDITION',font=font3,fill=(154,191,230,217))
# deliberate original non-copyrighted cover art, no product imagery or audio assets.
full=OUT/'starwars-ffg-cover.webp'
thumb=OUT/'starwars-ffg-thumbnail.webp'
img.convert('RGB').save(full,'WEBP',quality=88,method=6)
img.resize((800,450),Image.Resampling.LANCZOS).convert('RGB').save(thumb,'WEBP',quality=88,method=6)
print('CREATED:',full,full.stat().st_size,'bytes')
print('CREATED:',thumb,thumb.stat().st_size,'bytes')

