from pathlib import Path
from PIL import Image
from base64 import b64encode
import subprocess, tempfile, html

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"assets"/"setup"
LOGO=ASSETS/"star-wars-original-logo.svg"
CHROME=Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
if not LOGO.is_file() or not CHROME.is_file():
    raise RuntimeError("Original logo or browser renderer missing")
# The original logo is unchanged. The black border is only letterboxing
# to accommodate Foundry's fixed 16:9 thumbnail cropping behavior.
encoded=b64encode(LOGO.read_bytes()).decode("ascii")
page=f'''<!doctype html><html><head><meta charset="UTF-8"><style>
html,body{{width:100%;height:100%;margin:0;background:#000;overflow:hidden}}
main{{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center}}
img{{width:76vw;height:65vh;object-fit:contain}}
</style></head><body><main><img src="data:image/svg+xml;base64,{encoded}"></main></body></html>'''
with tempfile.TemporaryDirectory() as folder:
    folder=Path(folder)
    htmlfile=folder/"index.html"
    png=folder/"screen.png"
    htmlfile.write_text(page,encoding="utf-8")
    cmd=[str(CHROME),"--headless=new","--disable-gpu","--hide-scrollbars",
         "--no-first-run","--no-default-browser-check","--window-size=1600,900",
         "--screenshot="+str(png),htmlfile.as_uri()]
    result=subprocess.run(cmd,capture_output=True,text=True,timeout=35)
    if not png.is_file():
        raise RuntimeError("Failed to render original SVG: "+result.stderr[-700:])
    screenshot=Image.open(png).convert("RGB")
    print("Browser render",screenshot.size)
    for width,height,name in [(1600,900,"star-wars-original-cover.webp"),(800,450,"star-wars-original-thumbnail.webp")]:
        image=screenshot.resize((width,height),Image.Resampling.LANCZOS)
        out=ASSETS/name
        image.save(out,"WEBP",quality=94,method=6)
        print("Wrote",name,out.stat().st_size)
