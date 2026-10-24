import pathlib
import pymupdf

doc = pymupdf.open("/root/posta-revive/design-system/posta/POSTA-STYLE-GUIDE.pdf")
out = pathlib.Path("/root/posta-revive/design-system/posta/preview")
out.mkdir(exist_ok=True)
for i in (0, 1, 3, 4):
    page = doc[i]
    image = page.get_pixmap(dpi=110)
    target = out / f"page{i + 1}.png"
    image.save(target)
    print(f"  page {i + 1}: {image.width}x{image.height} -> {target}")
