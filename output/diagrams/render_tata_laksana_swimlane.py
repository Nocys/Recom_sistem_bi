from pathlib import Path
from math import atan2, cos, sin, pi

from PIL import Image, ImageDraw, ImageFont


BASE_W, BASE_H = 1800, 3550
SCALE = 1.5
W, H = int(BASE_W * SCALE), int(BASE_H * SCALE)

OUT = Path(__file__).with_name("tata-laksana-sistem-berjalan-bi-design-interior-v2.png")


def sc(value):
    return int(round(value * SCALE))


def font_path(bold=False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"


def font(size, bold=False):
    return ImageFont.truetype(font_path(bold), sc(size))


F_HEADER = font(24, True)
F_TITLE = font(19, True)
F_SMALL = font(15, False)
F_LABEL = font(16, True)
F_CONNECTOR = font(16, True)


img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)


def pbox(box):
    x, y, w, h = box
    return (sc(x), sc(y), sc(x + w), sc(y + h))


def wrap_text(text, fnt, max_width):
    words = text.split()
    if not words:
        return [""]
    lines, current = [], words[0]
    for word in words[1:]:
        trial = current + " " + word
        width = draw.textbbox((0, 0), trial, font=fnt)[2]
        if width <= sc(max_width):
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def text_height(lines, fnt, spacing=5):
    heights = [draw.textbbox((0, 0), line, font=fnt)[3] for line in lines]
    return sum(heights) + sc(spacing) * max(0, len(lines) - 1)


def draw_center_lines(lines, fnt, cx, top, fill="#111", spacing=5):
    y = sc(top)
    for line in lines:
        bounds = draw.textbbox((0, 0), line, font=fnt)
        tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
        draw.text((sc(cx) - tw / 2, y - bounds[1]), line, font=fnt, fill=fill)
        y += th + sc(spacing)


def draw_node(box, title, small=None, shape="process", issue=False):
    x, y, w, h = box
    fill = "#f6b7ba" if issue else "#ffffff"
    outline = "#a9474d" if issue else "#171717"
    width = sc(3)
    coords = pbox(box)

    if shape == "terminal":
        draw.ellipse(coords, fill=fill, outline=outline, width=width)
    elif shape == "parallelogram":
        inset = sc(22)
        points = [
            (coords[0] + inset, coords[1]),
            (coords[2], coords[1]),
            (coords[2] - inset, coords[3]),
            (coords[0], coords[3]),
        ]
        draw.polygon(points, fill=fill)
        draw.line(points + [points[0]], fill=outline, width=width, joint="curve")
    else:
        draw.rounded_rectangle(coords, radius=sc(4), fill=fill, outline=outline, width=width)

    title_lines = wrap_text(title, F_TITLE, w - 34)
    small_lines = []
    if small:
        for item in small:
            small_lines.extend(wrap_text(item, F_SMALL, w - 38))

    total = text_height(title_lines, F_TITLE, 4)
    if small_lines:
        total += sc(9) + text_height(small_lines, F_SMALL, 4)
    top = y + (h - total / SCALE) / 2
    draw_center_lines(title_lines, F_TITLE, x + w / 2, top, spacing=4)
    top += text_height(title_lines, F_TITLE, 4) / SCALE
    if small_lines:
        top += 9
        draw_center_lines(small_lines, F_SMALL, x + w / 2, top, spacing=4)


def draw_decision(left, top, size, text):
    cx, cy = left + size / 2, top + size / 2
    pts = [(cx, top), (left + size, cy), (cx, top + size), (left, cy)]
    pts_s = [(sc(x), sc(y)) for x, y in pts]
    draw.polygon(pts_s, fill="white")
    draw.line(pts_s + [pts_s[0]], fill="#171717", width=sc(3), joint="curve")
    lines = wrap_text(text, F_TITLE, size * 0.72)
    total = text_height(lines, F_TITLE, 4) / SCALE
    draw_center_lines(lines, F_TITLE, cx, cy - total / 2, spacing=4)


def draw_connector(cx, cy, label):
    r = 26
    draw.ellipse((sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)), fill="white", outline="#171717", width=sc(3))
    bounds = draw.textbbox((0, 0), label, font=F_CONNECTOR)
    tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
    draw.text((sc(cx) - tw / 2, sc(cy) - th / 2 - bounds[1]), label, font=F_CONNECTOR, fill="#111")


def arrow(points, label=None, label_pos=None):
    pts = [(sc(x), sc(y)) for x, y in points]
    draw.line(pts, fill="#222", width=sc(4), joint="curve")
    x1, y1 = pts[-2]
    x2, y2 = pts[-1]
    angle = atan2(y2 - y1, x2 - x1)
    length, wing = sc(15), sc(9)
    base_x = x2 - length * cos(angle)
    base_y = y2 - length * sin(angle)
    left = (base_x + wing * cos(angle + pi / 2), base_y + wing * sin(angle + pi / 2))
    right = (base_x + wing * cos(angle - pi / 2), base_y + wing * sin(angle - pi / 2))
    draw.polygon([(x2, y2), left, right], fill="#222")
    if label and label_pos:
        lx, ly = label_pos
        bounds = draw.textbbox((0, 0), label, font=F_LABEL)
        pad = sc(5)
        draw.rounded_rectangle((sc(lx) - pad, sc(ly) - pad, sc(lx) + bounds[2] + pad, sc(ly) + bounds[3] + pad), radius=sc(3), fill="white")
        draw.text((sc(lx), sc(ly) - bounds[1]), label, font=F_LABEL, fill="#111")


# Swimlane backgrounds and headers.
headers = ["Konsumen", "Admin", "Owner/Desainer", "Tim Produksi"]
for index, header in enumerate(headers):
    x = index * 450
    draw.rectangle((sc(x), 0, sc(x + 450), sc(72)), fill="#e9e9e9", outline="#8d8d8d", width=sc(2))
    bounds = draw.textbbox((0, 0), header, font=F_HEADER)
    tw, th = bounds[2] - bounds[0], bounds[3] - bounds[1]
    draw.text((sc(x + 225) - tw / 2, sc(36) - th / 2 - bounds[1]), header, font=F_HEADER, fill="#111")
    if index:
        draw.line((sc(x), 0, sc(x), H), fill="#b8b8b8", width=sc(2))


# Arrows are drawn first so node fills keep connector endpoints clean.
arrow([(225, 172), (225, 230)])
arrow([(225, 314), (225, 365)])
arrow([(225, 449), (225, 500)])
arrow([(225, 598), (225, 655)])
arrow([(225, 739), (225, 790)])
arrow([(390, 838), (510, 838)])

arrow([(675, 886), (675, 940)])
arrow([(675, 1052), (675, 1105)])
arrow([(675, 1195), (675, 1245)])
arrow([(675, 1361), (675, 1415)])
arrow([(675, 1513), (675, 1565)])
arrow([(840, 1611), (868, 1611)])

# Matching recommendation connectors A1/A2/A3 merge above consumer recommendation receipt.
for cx in (139, 225, 311):
    draw.line((sc(cx), sc(1261), sc(cx), sc(1306)), fill="#222", width=sc(4))
draw.line((sc(139), sc(1306), sc(311), sc(1306)), fill="#222", width=sc(4))
arrow([(225, 1306), (225, 1325)])
arrow([(225, 1421), (225, 1490)])

# Consumer decision: no to consultation, yes to approval.
arrow([(317, 1582), (430, 1582), (430, 1751), (510, 1751)], "Tidak", (352, 1548))
arrow([(225, 1674), (225, 1845)], "Ya", (240, 1725))

# Admin revision branch and connector.
arrow([(675, 1797), (675, 1845)])
arrow([(840, 1896), (868, 1896)])

# Approval and custom decision are linked with paired B1 connector nodes.
arrow([(225, 1929), (225, 1954)])
arrow([(566, 2082), (583, 2082)])

# Custom decision: yes goes directly to Owner; no uses paired C1 nodes.
arrow([(767, 2082), (960, 2082)], "Ya", (835, 2046))
arrow([(675, 2174), (675, 2204)], "Tidak", (695, 2178))
arrow([(675, 2721), (675, 2750)])

# Owner design process and return to admin.
arrow([(1125, 2110), (1125, 2160)])
arrow([(1125, 2268), (1125, 2320)])
arrow([(1125, 2414), (1125, 2465)])
arrow([(960, 2510), (840, 2510)])

# Admin receives and conveys design result.
arrow([(675, 2504), (675, 2550)])
arrow([(840, 2598), (868, 2598)])

# Order detail enters paired D1 nodes before continuing in Tim Produksi.
arrow([(675, 2840), (675, 2869)])
arrow([(1575, 2721), (1575, 2750)])

# Production sequence.
arrow([(1575, 2840), (1575, 2895)])
arrow([(1575, 2989), (1575, 3040)])
arrow([(1575, 3130), (1575, 3185)])
arrow([(1575, 3275), (1575, 3330)])
arrow([(1575, 3420), (1575, 3468)])

# Product handoff connector F1 to consumer, then finish.
arrow([(225, 3181), (225, 3250)])
arrow([(225, 3342), (225, 3440)])


# Nodes: Konsumen.
draw_node((145, 110, 160, 62), "Mulai", shape="terminal")
draw_node((60, 230, 330, 84), "Mencari referensi furnitur", shape="parallelogram")
draw_node((60, 365, 330, 84), "Melihat katalog / contoh produk", shape="parallelogram")
draw_node((60, 500, 330, 98), "Membandingkan produk secara manual", issue=True)
draw_node((60, 655, 330, 84), "Menghubungi admin")
draw_node((60, 790, 330, 96), "Menyampaikan kebutuhan ruangan dan produk")
draw_connector(139, 1261, "A1")
draw_connector(225, 1261, "A2")
draw_connector(311, 1261, "A3")
draw_node((60, 1325, 330, 96), "Menerima rekomendasi / penawaran")
draw_decision(133, 1490, 184, "Apakah produk / desain sesuai kebutuhan?")
draw_node((60, 1845, 330, 84), "Menyetujui pesanan")
draw_connector(225, 1980, "B1")
draw_connector(225, 3181, "F1")
draw_node((60, 3250, 330, 92), "Menerima produk")
draw_node((145, 3440, 160, 62), "Selesai", shape="terminal")

# Nodes: Admin.
draw_node((510, 790, 330, 96), "Menerima pertanyaan dari konsumen")
draw_node((510, 940, 330, 112), "Menggali kebutuhan produk, ukuran, material, dan tema desain")
draw_node((510, 1105, 330, 90), "Mengecek katalog dan data produk")
draw_node((495, 1245, 360, 116), "Informasi produk belum tersusun berdasarkan atribut rekomendasi", issue=True)
draw_node((510, 1415, 330, 98), "Rekomendasi masih diberikan secara manual", issue=True)
draw_node((510, 1565, 330, 92), "Memberikan rekomendasi / penawaran kepada konsumen")
draw_connector(868, 1611, "A1")
draw_node((510, 1705, 330, 92), "Menerima revisi / konsultasi ulang")
draw_node((510, 1845, 330, 102), "Menyesuaikan kembali rekomendasi / penawaran")
draw_connector(868, 1896, "A2")
draw_connector(540, 2082, "B1")
draw_decision(583, 1990, 184, "Apakah produk memerlukan desain custom?")
draw_connector(675, 2230, "C1")
draw_node((510, 2410, 330, 94), "Menerima hasil desain dan estimasi harga")
draw_node((510, 2550, 330, 96), "Menyampaikan hasil desain kepada konsumen")
draw_connector(868, 2598, "A3")
draw_connector(675, 2695, "C1")
draw_node((510, 2750, 330, 90), "Menyusun detail pesanan")
draw_connector(675, 2895, "D1")

# Nodes: Owner/Desainer.
draw_node((960, 2018, 330, 92), "Menerima kebutuhan desain custom")
draw_node((960, 2160, 330, 108), "Menganalisis ukuran ruangan, konsep, dan material")
draw_node((960, 2320, 330, 94), "Membuat desain dan estimasi harga")
draw_node((960, 2465, 330, 90), "Mengirim hasil desain ke admin")

# Nodes: Tim Produksi.
draw_connector(1575, 2695, "D1")
draw_node((1410, 2750, 330, 90), "Menerima detail pesanan")
draw_node((1410, 2895, 330, 94), "Menyiapkan bahan dan jadwal produksi")
draw_node((1410, 3040, 330, 90), "Proses pembuatan furnitur")
draw_node((1410, 3185, 330, 90), "Finishing dan quality control")
draw_node((1410, 3330, 330, 90), "Produk siap diserahkan")
draw_connector(1575, 3468, "F1")


img.save(OUT, optimize=True)
print(OUT)
