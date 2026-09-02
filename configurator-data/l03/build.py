#!/usr/bin/env python3
"""
XPENG L03 — configurator data builder (BAI spec sheet edition, 2026-09-02).

Source of truth: BAI's Xpeng_L03_BG.xlsx ("Master_Specsheet L03"), dumped to
bai-specsheet.json by `node xlsx-to-json.mjs` (Python's XML parser is broken on this Mac).
XPENG's EU configurator payload (l03-xpeng-eu-raw.json) is used ONLY for what BAI's sheet
does not carry — prices, option prices and the few PowerX values BAI marks TBD. Every such
fallback and every judgement call is written down in DECISIONS.md next to this file.

Emits:
  sheet/*.tsv                → paste-ready rows for the 6 Google Sheet tabs
  spec-drawers-bg.html       → Bulgarian spec sheets, one per variant (all in one file)
  drawers/<variant_code>.html → the same, one fragment per Webflow drawer (h4 + ul only)

Usage:  node xlsx-to-json.mjs && python3 build.py
"""
import html
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
BAI = json.load(open(os.path.join(HERE, 'bai-specsheet.json')))
RAW = json.load(open(os.path.join(HERE, 'l03-xpeng-eu-raw.json')))['DE']
CDN_PATH = os.path.join(HERE, 'cdn-map.json')
CDN = json.load(open(CDN_PATH)) if os.path.exists(CDN_PATH) else {}

SLUG = 'l03'

# ------------------------------------------------------------------ line-up (BAI order)
# variant_code, display name, BAI column, price (EUR), XPENG DE version code (None = not sold in DE)
# Names use XPENG's casing ("Ultra"), BAI writes "ULTRA" — see DECISIONS.md.
VARIANTS = [
    ('rwd-sr',       'RWD Standard Range',    'B', 35600, 'DSAB'),
    ('rwd-lr',       'RWD Long Range',        'C', 38600, 'DSBB'),
    ('rwd-lr-ultra', 'RWD Long Range Ultra',  'D', 42600, None),   # price = pending decision
    ('awd-ultra',    'AWD Performance Ultra', 'E', 46600, 'DSUB'),
    ('powerx-lr',    'PowerX Long Range',     'F', 38600, 'DSFB'),
]
ULTRA = {'rwd-lr-ultra', 'awd-ultra'}   # 18" standard, 20" as option О2 (BAI rows 125-126, 204)

# Per-variant technical data as BAI states it. Power/torque are BAI's per-motor peak figures;
# AWD torque is rear 280 + front 171. PowerX range/consumption/fuel are XPENG DE values
# because BAI marks them TBD (DECISIONS.md, pending list).
VARIANT_SPECS = {
    'rwd-sr':       dict(range_km=445, power_kw=163, torque_nm=280, acceleration='7.5s', top_speed=180,
                         battery_kwh=58.3, battery_type='LFP', dc_kw=193, dc_time='20 min (10-80%)',
                         ac_time='6.8h (5-100%, 11 kW)', energy='15.3 kWh/100km', drivetrain='RWD',
                         power_type='BEV', co2=0, co2_class='A'),
    'rwd-lr':       dict(range_km=520, power_kw=183, torque_nm=280, acceleration='6.6s', top_speed=180,
                         battery_kwh=71.2, battery_type='LFP', dc_kw=236, dc_time='20 min (10-80%)',
                         ac_time='8.3h (5-100%, 11 kW)', energy='16.0 kWh/100km', drivetrain='RWD',
                         power_type='BEV', co2=0, co2_class='A'),
    'rwd-lr-ultra': dict(range_km=480, power_kw=183, torque_nm=280, acceleration='6.6s', top_speed=180,
                         battery_kwh=71.2, battery_type='LFP', dc_kw=236, dc_time='20 min (10-80%)',
                         ac_time='8.3h (5-100%, 11 kW)', energy='17.4 kWh/100km', drivetrain='RWD',
                         power_type='BEV', co2=0, co2_class='A'),
    'awd-ultra':    dict(range_km=440, power_kw=317, torque_nm=451, acceleration='4.5s', top_speed=180,
                         battery_kwh=71.2, battery_type='LFP', dc_kw=236, dc_time='20 min (10-80%)',
                         ac_time='8.3h (5-100%, 11 kW)', energy='18.4 kWh/100km', drivetrain='AWD',
                         power_type='BEV', co2=0, co2_class='A'),
    'powerx-lr':    dict(range_km=215, power_kw=183, torque_nm=280, acceleration='6.8s', top_speed=180,
                         battery_kwh=37.2, battery_type='LFP', dc_kw=123, dc_time='20 min (10-80%)',
                         ac_time='4.4h (5-100%, 11 kW)', energy='16.9 kWh/100km', drivetrain='RWD',
                         power_type='REEV', co2=24, co2_class='',
                         range_combined_km=1017, fuel_consumption='5.5 l/100km', fuel_tank_l=42),
}

# Exterior colours in BAI's row order (rows 209-213). BAI lists "Graphite Gray" in the slot
# where every XPENG market — and XPENG's own L03 launch kit — has "Phantom Purple"; no Graphite
# Gray render exists for the L03, so Phantom Purple stays until BAI confirms (pending decision).
COLORS = [  # code, name, hex (median of XPENG's swatch), price EUR (XPENG DE), sort
    ('midnight-black', 'Midnight Black', '#292D30', 950, 1),
    ('arctic-white',   'Arctic White',   '#EAEBEC',   0, 2),
    ('phantom-purple', 'Phantom Purple', '#7E6A9E', 950, 3),
    ('silver-frost',   'Silver Frost',   '#AAAFB9', 950, 4),
    ('rock-gray',      'Rock Gray',      '#9C999E', 950, 5),
]
DEFAULT_COLOR = 'arctic-white'

# Interiors in BAI's row order (rows 216-217); both on every version per BAI.
INTERIORS = [('dark-gray', 'Dark Gray', 'l03-interior-dark-gray.webp', 1),
             ('light-gray', 'Light Gray', 'l03-interior-light-grey.webp', 2)]
DEFAULT_INTERIOR = {'rwd-sr': 'dark-gray'}          # XPENG's defaults; others Light Gray
DEFAULT_INTERIOR_FALLBACK = 'light-gray'


def img(filename):
    """CDN URL for a local asset filename, or a loud placeholder."""
    return CDN.get(filename, 'TODO:' + filename)


def tsv(rows):
    return '\n'.join('\t'.join('' if c is None else str(c) for c in r) for r in rows) + '\n'


# ---------------------------------------------------------------- Sheet tabs

def build_models():
    header = ['model_slug', 'model_name', 'starting_price', 'hero_image']
    return [header, [SLUG, 'XPENG L03', VARIANTS[0][3], img('l03-arctic-white-front.webp')]]


def build_variants():
    header = ['model_slug', 'variant_code', 'variant_name', 'price', 'is_default', 'range_km',
              'power_kw', 'torque_nm', 'acceleration', 'top_speed', 'battery_kwh', 'battery_type',
              'dc_charge_power_kw', 'dc_charge_time', 'ac_charge_time', 'energy_consumption',
              'drivetrain', 'suspension', 'delivery_time', 'sort_order',
              'power_type', 'co2_emissions', 'co2_class',
              'range_combined_km', 'fuel_consumption', 'fuel_tank_l']
    rows = [header]
    for sort, (code, name, _, price, _) in enumerate(VARIANTS, 1):
        s = VARIANT_SPECS[code]
        rows.append([
            SLUG, code, name, price, 'TRUE' if sort == 1 else 'FALSE', s['range_km'],
            s['power_kw'], s['torque_nm'], s['acceleration'], s['top_speed'], s['battery_kwh'],
            s['battery_type'], s['dc_kw'], s['dc_time'], s['ac_time'], s['energy'],
            s['drivetrain'], '', '', sort,
            s['power_type'], s['co2'], s['co2_class'],
            s.get('range_combined_km', ''), s.get('fuel_consumption', ''), s.get('fuel_tank_l', ''),
        ])
    return rows


def build_colors():
    """One explicit row per variant × colour (main.js can add 'all' rows but never remove them).
    Ultra versions ride on 18" by default; the 20" render goes into image_front_21, which
    main.js swaps in when a wheel whose code contains 20/21 is selected."""
    header = ['model_slug', 'variant_code', 'color_code', 'color_name', 'color_hex', 'price',
              'is_default', 'image_front', 'image_side', 'image_rear', 'swatch_image',
              'image_front_21', 'sort_order']
    rows = [header]
    for code, _, _, _, _ in VARIANTS:
        for ccode, cname, chex, price, sort in COLORS:
            rows.append([
                SLUG, code, ccode, cname, chex, price,
                'TRUE' if ccode == DEFAULT_COLOR else 'FALSE',
                img(f'l03-{ccode}-front.webp'),
                img(f'l03-{ccode}-side.webp'),
                img(f'l03-{ccode}-rear.webp'),
                img(f'l03-swatch-{ccode}.webp'),
                img(f'l03-{ccode}-front-20.webp') if code in ULTRA else '',
                sort,
            ])
    return rows


def build_interiors():
    header = ['model_slug', 'variant_code', 'interior_code', 'interior_name', 'price',
              'is_default', 'image_thumb', 'image_full', 'sort_order']
    rows = [header]
    for code, _, _, _, _ in VARIANTS:
        default = DEFAULT_INTERIOR.get(code, DEFAULT_INTERIOR_FALLBACK)
        for icode, iname, fname, sort in INTERIORS:
            rows.append([SLUG, code, icode, iname, 0, 'TRUE' if icode == default else 'FALSE',
                         img(fname), img(fname), sort])
    return rows


def build_wheels():
    """BAI rows 125-126 + option О2 (row 204): 18" standard on every version, 20" wheels with
    yellow calipers as an option on both Ultra versions (price TBD at BAI → 0 for now),
    Black Edition wheels only via option О3 on AWD Performance Ultra."""
    header = ['model_slug', 'variant_code', 'wheel_code', 'wheel_name', 'price', 'is_default',
              'image_thumb', 'sort_order']
    rows = [header]
    for code, _, _, _, _ in VARIANTS:
        rows.append([SLUG, code, '18-standard', '18" алуминиеви джанти', 0, 'TRUE',
                     img('l03-wheel-18.webp'), 1])
        if code in ULTRA:
            rows.append([SLUG, code, '20-sport',
                         '20" джанти с гуми висок клас и жълти спирачни апарати', 0, 'FALSE',
                         img('l03-wheel-20.webp'), 2])
        if code == 'awd-ultra':
            rows.append([SLUG, code, '20-black-edition', '20" джанти Black Edition', 0, 'FALSE',
                         img('l03-wheel-20-black-edition.webp'), 3])
    return rows


def build_accessories():
    """Option prices come from XPENG DE (BAI: TBD). Descriptions are BAI's wording."""
    header = ['model_slug', 'variant_code', 'accessory_code', 'accessory_name', 'price',
              'description', 'image', 'sort_order']
    return [
        header,
        [SLUG, 'all', 'tow-hitch', 'Теглич с ръчно управление', 990,
         'Капацитет на теглича: 1500 кг (със спирачки) / 750 кг (без спирачки) | Опция за всички версии',
         img('l03-towbar.webp'), 1],
        [SLUG, 'awd-ultra', 'black-edition', 'Black Edition', 1200,
         'Елементи на екстериора в опушен черен цвят | Предни и задни спирачни апарати в черен цвят | '
         '20" джанти с гуми висок клас | При избор на Black Edition отпада опция О2 (20" джанти с жълти апарати)',
         img('l03-black-edition-front.webp'), 2],
    ]


# ---------------------------------------------------------------- spec drawers from BAI's sheet

COL_OF = {code: col for code, _, col, _, _ in VARIANTS}
VALUE_COLS = ['B', 'C', 'D', 'E', 'F']

# Row labels that open a section (h4). Anything else that has no values in B..F is an unmarked
# row in BAI's sheet (e.g. the sensor-count rows 55-66, seat-belt rows 190-193) and is skipped —
# the script prints them so nothing disappears silently.
SECTIONS = {
    'Размери', 'Ефективност', 'XPILOT 2.5 (Система за подпомагане на водача)', 'XOS',
    'Екстериор', 'Интериор', 'Аудио система', 'Климатик & Термопомпа', 'Първи ред седалки',
    'Втори ред седалки', 'Безопасност', 'Опционални пакети', 'Цветове екстериор', 'Цветове интериор',
    # sub-sections (rendered as the same h4 — the drawers keep one flat heading level)
    'Хардуерна система', 'XPILOT ASSIST Шофиране', 'XPILOT ASSIST Паркиране', 'XPILOT ASSIST Безопасност',
    'Система за предотвратяване на сблъсък отпред', 'Предотвратяване на странични сблъсъци',
    'Предотвратяване на сблъсък отзад', 'Хардуер', 'Софтуер',
    'Опция 1', 'Опция 2', 'Опция 3 (при избор на О3 при Ultra отпада О2)',
}
NO_OPTION_SUFFIX = {'Опционални пакети', 'Опция 1', 'Опция 2', 'Опция 3 (при избор на О3 при Ultra отпада О2)',
                    'Цветове екстериор', 'Цветове интериор'}
SKIP_LABELS = {'Версия', 'Цена'}

# Spelling / typing slips in BAI's sheet, fixed verbatim (documented in DECISIONS.md).
FIXES = [
    ('Аистент', 'Асистент'), ('занци', 'знаци'), ('мътва зона', 'мъртва зона'),
    ('Прдотвратяване', 'Предотвратяване'), ('вътрящ', 'въртящ'), ('Tочки', 'Точки'),
    ('Елктронна', 'Електронна'), ('Коефицент', 'Коефициент'), ('Предупреждени за', 'Предупреждение за'),
    ('Мултимедиен  екран', 'Мултимедиен екран'), ('R18с теглич', 'R18 с теглич'),
    ('( виж О2, ред 192 )', ''),   # the ○ mark already renders '(опция)'
    ('Опция 3 ( при избор на О3 при Ultra, отпада О2)', 'Опция 3 (при избор на О3 при Ultra отпада О2)'),
    ('Ускорение 0~100км/ч. (сек.)', 'Ускорение 0–100 км/ч (сек.)'),
    ('при 11kW（ч）', 'при 11 kW (ч)'), ('（', ' ('), ('）', ')'),
    ('OneBox спирачната система', 'Спирачна система OneBox'),
    ('Дължина x Широчина x Височина', 'Дължина × широчина × височина'),
    ('Кoлони', 'Колони'), ('euro 6e', 'Euro 6e'), ('1.5Т', '1,5 л турбо'),
    ('Graphite Gray', 'Phantom Purple'),   # see COLORS comment / DECISIONS.md
]
INTEGER_LABELS = {'Максимална мощност (к.с.)'}
# Cells in BAI's sheet that are evidently slips and are NOT rendered (listed in DECISIONS.md):
#   D21 — front-motor torque 171 N·m on RWD Long Range Ultra, a 2WD car.
SUPPRESS_CELLS = {(21, 'D')}


def norm(s):
    s = str(s).replace(' ', ' ')
    for a, b in FIXES:
        s = s.replace(a, b)
    s = re.sub(r'\(\s+', '(', s)
    s = re.sub(r'\s+\)', ')', s)
    s = re.sub(r'\s+([;:,])', r'\1', s)
    s = re.sub(r'\s+', ' ', s).strip().rstrip(';')
    s = re.sub(r'\s*/\s*$', '', s)      # trailing in-cell line break
    return s


def fmt_value(v, label):
    v = norm(v)
    if re.fullmatch(r'-?\d+(\.\d+)?', v):
        f = float(v)
        if label in INTEGER_LABELS:
            return str(round(f))
        s = f'{round(f, 2):g}'
        return s.replace('.', ',')
    v = re.sub(r'\s*\*\s*', ' × ', v)
    v = re.sub(r'(\d)\.(\d)', r'\1,\2', v)          # 0.228Cd → 0,228Cd
    v = re.sub(r'(\d),(\d+)Cd', r'\1,\2 Cd', v)
    v = re.sub(r'(\d)\(', r'\1 (', v)                 # 480(R20) → 480 (R20)
    v = re.sub(r'\)/\s*', ') / ', v)                  # (със спирачки)/ 750 → (със спирачки) / 750
    return v


def col_index(c):
    return ord(c) - ord('A')


def horizontal_merges():
    """{row: [(first_col, last_col), ...]} for merges that span columns on one row."""
    out = {}
    for m in BAI['merges']:
        a, b = m.split(':')
        c1, r1 = re.match(r'([A-Z]+)(\d+)', a).groups()
        c2, r2 = re.match(r'([A-Z]+)(\d+)', b).groups()
        if r1 == r2 and c1 != c2:
            out.setdefault(int(r1), []).append((c1, c2))
    return out


MERGES = horizontal_merges()


def row_values(row):
    """Values per B..F with horizontal merges filled in. Returns (is_header, values)."""
    r = row['r']
    vals = {c: row.get(c) for c in VALUE_COLS}
    header = False
    for c1, c2 in MERGES.get(r, []):
        if c1 == 'A':
            header = True
            continue
        v = row.get(c1)
        for c in VALUE_COLS:
            if col_index(c1) <= col_index(c) <= col_index(c2):
                vals[c] = v
    if all(vals[c] in (None, '') for c in VALUE_COLS):
        header = True
    return header, vals


def item_for(label, value, section):
    v = norm(value) if value is not None else ''
    if v in ('', '—', '-', '–', 'TBD'):
        return None
    if v == '●':
        return label
    if v == '○':
        return label if section in NO_OPTION_SUFFIX else f'{label} (опция)'
    return f'{label}: {fmt_value(value, label)}'


def build_drawer_items(code):
    """[(section_title, [items])] for one variant, in BAI's row order; empty sections dropped."""
    col = COL_OF[code]
    comments = BAI.get('comments', {})
    sections, current, skipped = [], None, []
    for row in BAI['rows']:
        if row['r'] <= 3 or 'A' not in row:
            continue
        label = norm(row['A'])
        if label in SKIP_LABELS:
            continue
        is_header, vals = row_values(row)
        if is_header:
            if label in SECTIONS:
                current = (label, [])
                sections.append(current)
            else:
                skipped.append((row['r'], label))
            continue
        if current is None:
            current = ('Основни данни', [])
            sections.append(current)
        if (row['r'], col) in SUPPRESS_CELLS:
            continue
        item = item_for(label, vals.get(col), current[0])
        if item is None:
            continue
        note = comments.get(f"A{row['r']}")
        if note:
            note = re.sub(r'^\s*(?:Admin\s*:?\s*)+', '', note).strip().rstrip('.')
            item += f' ({note})'
        current[1].append(item)
    if code == VARIANTS[0][0] and skipped:
        print('rows without marks in BAI sheet, skipped:',
              ', '.join(f'{r}:{l[:30]}' for r, l in skipped))
    return [(t, items) for t, items in sections if items]


def drawer_fragment(code):
    out = []
    for title, items in build_drawer_items(code):
        out.append(f'  <h4>{html.escape(title)}</h4>')
        out.append('  <ul>')
        out.extend(f'    <li>{html.escape(i)}</li>' for i in items)
        out.append('  </ul>')
    return '\n'.join(out)


def build_drawers_html():
    parts = ['<!-- XPENG L03 — Bulgarian spec sheets, one per variant, generated by build.py from',
             '     BAI\'s Xpeng_L03_BG.xlsx (bai-specsheet.json). Do not edit by hand: change the',
             '     sheet / build.py and regenerate. Webflow drawer: [data-drawer-name="specs-<code>"]',
             '     → h2.drawer__h2 (variant name) + div.drawer__text (the h4/ul below). -->']
    for code, name, _, _, _ in VARIANTS:
        parts.append(f'\n<!-- ================= specs-{code} — {name} ================= -->')
        parts.append(f'<div data-drawer-name="specs-{code}" data-drawer-status="not-active">')
        parts.append(f'  <h2>{html.escape(name)}</h2>')
        parts.append(drawer_fragment(code))
        parts.append('</div>')
    return '\n'.join(parts) + '\n'


# ---------------------------------------------------------------- main

def main():
    sheet_dir = os.path.join(HERE, 'sheet')
    drawers_dir = os.path.join(HERE, 'drawers')
    os.makedirs(sheet_dir, exist_ok=True)
    os.makedirs(drawers_dir, exist_ok=True)
    tabs = {
        'models': build_models(), 'variants': build_variants(), 'colors': build_colors(),
        'interiors': build_interiors(), 'wheels': build_wheels(), 'accessories': build_accessories(),
    }
    for name, rows in tabs.items():
        with open(os.path.join(sheet_dir, f'{name}.tsv'), 'w') as f:
            f.write(tsv(rows))
        print(f'sheet/{name}.tsv: {len(rows) - 1} rows')
    with open(os.path.join(HERE, 'spec-drawers-bg.html'), 'w') as f:
        f.write(build_drawers_html())
    for code, _, _, _, _ in VARIANTS:
        frag = drawer_fragment(code)
        with open(os.path.join(drawers_dir, f'{code}.html'), 'w') as f:
            f.write(frag + '\n')
        print(f'drawers/{code}.html: {frag.count("<li>")} items, {frag.count("<h4>")} sections')
    todo = sum(r.count('TODO:') for rows in tabs.values() for r in map(str, rows))
    print('TODO placeholders:', todo)


if __name__ == '__main__':
    main()
