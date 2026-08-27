#!/usr/bin/env python3
"""
XPENG L03 — configurator data builder.

Reads the raw XPENG EU configurator payload (l03-xpeng-eu-raw.json, harvested from
store.xpeng.com's internal API) and emits:

  sheet/*.tsv                 → paste-ready rows for the 6 Google Sheet tabs
  spec-drawers-bg.html        → Bulgarian spec sheets for the 5 Webflow drawers

Image URLs come from cdn-map.json ({"l03-arctic-white-front.webp": "https://cdn.prod..."}).
While that file is empty the TSVs carry TODO: placeholders so nothing silently ships blank.

Usage:  python3 build.py
"""
import json, os, re, html

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = json.load(open(os.path.join(HERE, 'l03-xpeng-eu-raw.json')))['DE']
TR = json.load(open(os.path.join(HERE, 'spec-translations.json')))
CDN_PATH = os.path.join(HERE, 'cdn-map.json')
CDN = json.load(open(CDN_PATH)) if os.path.exists(CDN_PATH) else {}

SLUG = 'l03'

# XPENG version code → our variant_code. Order mirrors the German configurator.
VARIANTS = [
    ('DSAB', 'rwd-sr',    'RWD Standard Range',    1),
    ('DSFB', 'powerx-lr', 'PowerX Long Range',     2),
    ('DSBB', 'rwd-lr',    'RWD Long Range',        3),
    ('DSHB', 'awd',       'AWD Performance',       4),
    ('DSUB', 'awd-ultra', 'AWD Performance Ultra', 5),
]
VID = {v['carVersionCode']: v['id'] for v in RAW['versions']}

COLORS = [  # code, name, hex (median of XPENG's own swatch), sort
    ('arctic-white',   'Arctic White',   '#EAEBEC', 1),
    ('phantom-purple', 'Phantom Purple', '#7E6A9E', 2),
    ('silver-frost',   'Silver Frost',   '#AAAFB9', 3),
    ('rock-gray',      'Rock Gray',      '#9C999E', 4),
    ('midnight-black', 'Midnight Black', '#292D30', 5),
]
XP_COLOR = {'1B': 'arctic-white', 'ZP': 'phantom-purple', 'WG': 'silver-frost',
            'ZQ': 'rock-gray', 'WN': 'midnight-black'}
XP_INT = {'D2': 'dark-gray', 'H4': 'light-grey'}
INT_NAME = {'dark-gray': 'Dark Gray', 'light-grey': 'Light Grey'}


def img(filename):
    """CDN URL for a local asset filename, or a loud placeholder."""
    return CDN.get(filename, 'TODO:' + filename)


def specs(version_code):
    """{group_type: [spec, ...]} for one version, straight from XPENG."""
    out = {}
    for g in RAW['groups'][VID[version_code]]:
        out.setdefault(g['carSpecificationGroupType'], []).extend(g['carSpecificationVoList'] or [])
    return out


def tsv(rows):
    return '\n'.join('\t'.join('' if c is None else str(c) for c in r) for r in rows) + '\n'


# ---------------------------------------------------------------- Sheet tabs

def build_models():
    header = ['model_slug', 'model_name', 'starting_price', 'hero_image']
    return [header, [SLUG, 'XPENG L03', 35600, img('l03-arctic-white-front.webp')]]


# Per-variant technical data, read off the German spec sheets.
VARIANT_SPECS = {
    'rwd-sr':    dict(price=35600, range_km=445, power_kw=180, torque_nm=264, acceleration='7.5s',
                      top_speed=180, battery_kwh=58.3, battery_type='LFP', dc_kw=193,
                      dc_time='20 min (10-80%)', ac_time='6.8h (5-100%, 11 kW)',
                      energy='15.3 kWh/100km', drivetrain='RWD', co2=0, co2_class='A'),
    'powerx-lr': dict(price=38600, range_km=215, power_kw=180, torque_nm=264, acceleration='6.8s',
                      top_speed=180, battery_kwh=37.25, battery_type='', dc_kw=123,
                      dc_time='20 min (10-80%)', ac_time='6.5h (5-100%, 6,6 kW)',
                      energy='16.9 kWh/100km', drivetrain='RWD', co2=24, co2_class='',
                      range_combined_km=1017, fuel_consumption='5.5 l/100km', fuel_tank_l=42),
    'rwd-lr':    dict(price=38600, range_km=520, power_kw=180, torque_nm=264, acceleration='6.6s',
                      top_speed=180, battery_kwh=71.2, battery_type='LFP', dc_kw=236,
                      dc_time='20 min (10-80%)', ac_time='8.3h (5-100%, 11 kW)',
                      energy='16.0 kWh/100km', drivetrain='RWD', co2=0, co2_class='A'),
    'awd':       dict(price=41600, range_km=440, power_kw=285, torque_nm=431, acceleration='4.5s',
                      top_speed=180, battery_kwh=71.2, battery_type='LFP', dc_kw=236,
                      dc_time='20 min (10-80%)', ac_time='8.3h (5-100%, 11 kW)',
                      energy='18.4 kWh/100km', drivetrain='AWD', co2=0, co2_class='A'),
    'awd-ultra': dict(price=46600, range_km=440, power_kw=285, torque_nm=431, acceleration='4.5s',
                      top_speed=180, battery_kwh=71.2, battery_type='LFP', dc_kw=236,
                      dc_time='20 min (10-80%)', ac_time='8.3h (5-100%, 11 kW)',
                      energy='18.4 kWh/100km', drivetrain='AWD', co2=0, co2_class='A'),
}


def build_variants():
    header = ['model_slug', 'variant_code', 'variant_name', 'price', 'is_default', 'range_km',
              'power_kw', 'torque_nm', 'acceleration', 'top_speed', 'battery_kwh', 'battery_type',
              'dc_charge_power_kw', 'dc_charge_time', 'ac_charge_time', 'energy_consumption',
              'drivetrain', 'suspension', 'delivery_time', 'sort_order',
              'power_type', 'co2_emissions', 'co2_class',
              'range_combined_km', 'fuel_consumption', 'fuel_tank_l']
    rows = [header]
    for xp, code, name, sort in VARIANTS:
        s = VARIANT_SPECS[code]
        power_type = next(v['powerType'] for v in RAW['versions'] if v['carVersionCode'] == xp)
        rows.append([
            SLUG, code, name, s['price'], 'TRUE' if sort == 1 else 'FALSE', s['range_km'],
            s['power_kw'], s['torque_nm'], s['acceleration'], s['top_speed'], s['battery_kwh'],
            s['battery_type'], s['dc_kw'], s['dc_time'], s['ac_time'], s['energy'],
            s['drivetrain'], '', '', sort,
            power_type, s['co2'], s['co2_class'],
            s.get('range_combined_km', ''), s.get('fuel_consumption', ''), s.get('fuel_tank_l', ''),
        ])
    return rows


def build_colors():
    """One explicit row per variant × colour — the merge logic in main.js can add
    'all' rows to a variant but never remove them, and RWD SR offers only 3 colours."""
    header = ['model_slug', 'variant_code', 'color_code', 'color_name', 'color_hex', 'price',
              'is_default', 'image_front', 'image_side', 'image_rear', 'swatch_image',
              'image_front_21', 'sort_order']
    rows = [header]
    for xp, code, _, _ in VARIANTS:
        available = {}
        for s in specs(xp).get(2, []):
            if s['carSpecificationCode'].endswith('Black Edition_WN'):
                continue  # Black Edition colour is applied by the accessory, not the picker
            available[XP_COLOR[s['parentAttributeCode']]] = s['carSpecificationPrice']
        big = code == 'awd-ultra'          # Ultra ships on 20" wheels
        suffix = '-20' if big else ''
        for ccode, cname, chex, sort in COLORS:
            if ccode not in available:
                continue
            rows.append([
                SLUG, code, ccode, cname, chex, available[ccode],
                'TRUE' if ccode == 'arctic-white' else 'FALSE',
                img(f'l03-{ccode}-front{suffix}.webp'),
                img(f'l03-{ccode}-side{suffix}.webp'),
                img(f'l03-{ccode}-rear{suffix}.webp'),
                img(f'l03-swatch-{ccode}.webp'),
                '',  # no 20" wheel option on this variant → no alternate render needed
                sort,
            ])
    return rows


def build_interiors():
    header = ['model_slug', 'variant_code', 'interior_code', 'interior_name', 'price',
              'is_default', 'image_thumb', 'image_full', 'sort_order']
    rows = [header]
    for xp, code, _, _ in VARIANTS:
        for i, s in enumerate(sorted(specs(xp).get(3, []), key=lambda x: x['sort']), 1):
            k = XP_INT[s['parentAttributeCode']]
            rows.append([
                SLUG, code, k, INT_NAME[k], s['carSpecificationPrice'],
                'TRUE' if s['isDefault'] else 'FALSE',
                # Thumb = the real cabin shot, same as every other model. The fabric
                # swatches XPENG ships read as grey blobs at card size.
                img(f'l03-interior-{k}.webp'),
                img(f'l03-interior-{k}.webp'),
                i,
            ])
    return rows


WHEEL_NAME = {
    '18': ('18-standard', '18" джанти'),
    '20': ('20-sport', '20" джанти (Goodyear) и жълти спирачни апарати'),
    '20be': ('20-black-edition', '20" джанти Black Edition (Goodyear)'),
}
WHEEL_IMG = {'18-standard': 'l03-wheel-18.webp', '20-sport': 'l03-wheel-20.webp',
             '20-black-edition': 'l03-wheel-20-black-edition.webp'}


def build_wheels():
    header = ['model_slug', 'variant_code', 'wheel_code', 'wheel_name', 'price', 'is_default',
              'image_thumb', 'sort_order']
    rows = [header]
    for xp, code, _, _ in VARIANTS:
        for i, s in enumerate(sorted(specs(xp).get(4, []), key=lambda x: x['sort']), 1):
            raw = s['carSpecificationCode']
            key = '20be' if 'Black Edition' in raw else ('20' if '20-inch' in raw else '18')
            wcode, wname = WHEEL_NAME[key]
            rows.append([
                SLUG, code, wcode, wname, s['carSpecificationPrice'],
                'TRUE' if s['isDefault'] else 'FALSE', img(WHEEL_IMG[wcode]), i,
            ])
    return rows


TOWBAR_DESC = ('Максимална маса на ремарке 1500 кг със спирачки / 750 кг без спирачки | '
               'Вертикално натоварване на топката 75 кг | Стандартно за цялата гама')
BE_DESC = ('Каросерия Midnight Black | 20" изцяло черни джанти (Goodyear) | '
           'Черни спирачни апарати | Черни огледала и рамки на стъклата | Черно предно лого')


def build_accessories():
    header = ['model_slug', 'variant_code', 'accessory_code', 'accessory_name', 'price',
              'description', 'image', 'sort_order']
    rows = [header]
    towbar = next(s for s in specs('DSAB')[1] if 'Towbar' in s['carSpecificationCode'])
    rows.append([SLUG, 'all', 'tow-hitch', 'Ръчен теглич', towbar['carSpecificationPrice'],
                 TOWBAR_DESC, img('l03-towbar.webp'), 1])
    be = next(s for s in specs('DSUB')[1] if 'Black Edition' in s['carSpecificationCode'])
    rows.append([SLUG, 'awd-ultra', 'black-edition', 'Black Edition', be['carSpecificationPrice'],
                 BE_DESC, img('l03-black-edition-front.webp'), 2])
    return rows


# ------------------------------------------------------------- spec drawers

def outline(version_code):
    """XPENG's tagText HTML → [(kind, text)] where kind is 'h' or 'li'."""
    v = next(v for v in RAW['versions'] if v['carVersionCode'] == version_code)
    t = html.unescape(v['tagText'] or '')
    t = re.sub(r'<p[^>]*>', '\n@', t)
    t = re.sub(r'<li[^>]*>', '\n- ', t)
    t = re.sub(r'<[^>]+>', '', t)
    out = []
    for line in t.split('\n'):
        line = line.replace('\xa0', ' ').strip()
        if not line or line in ('@', '-'):
            continue
        out.append(('h', line[1:].strip()) if line.startswith('@') else ('li', line[1:].strip()))
    return out


def translate(kind, text):
    key = ('@' + text) if kind == 'h' else text
    return TR.get(key)


def build_drawers():
    missing = set()
    parts = ['<!-- XPENG L03 — Bulgarian spec sheets, one per variant.',
             '     Paste each block into the matching Webflow drawer',
             '     ([data-drawer-name="specs-<variant_code>"]) as a Rich Text / HTML embed.',
             '     Source: store.xpeng.com/de/configurator/L03 (carVersion tagText), translated. -->', '']
    for xp, code, name, _ in VARIANTS:
        parts.append(f'<!-- ================= specs-{code} — {name} ================= -->')
        parts.append(f'<div data-drawer-name="specs-{code}" data-drawer-status="not-active">')
        parts.append(f'  <h3>XPENG L03 — {name}</h3>')
        open_ul = False
        for kind, text in outline(xp):
            bg = translate(kind, text)
            if bg is None:
                missing.add((kind, text))
                bg = text
            if kind == 'h':
                if open_ul:
                    parts.append('  </ul>')
                    open_ul = False
                parts.append(f'  <h4>{html.escape(bg)}</h4>')
            else:
                if not open_ul:
                    parts.append('  <ul>')
                    open_ul = True
                parts.append(f'    <li>{html.escape(bg)}</li>')
        if open_ul:
            parts.append('  </ul>')
        parts.append('</div>')
        parts.append('')
    return '\n'.join(parts), missing


def main():
    out = os.path.join(HERE, 'sheet')
    os.makedirs(out, exist_ok=True)
    tabs = {'Models': build_models(), 'Variants': build_variants(), 'Colors': build_colors(),
            'Interiors': build_interiors(), 'Wheels': build_wheels(),
            'Accessories': build_accessories()}
    for tab, rows in tabs.items():
        open(os.path.join(out, tab.lower() + '.tsv'), 'w').write(tsv(rows))
        print(f'{tab:<12} {len(rows) - 1:>3} rows')

    drawers, missing = build_drawers()
    open(os.path.join(HERE, 'spec-drawers-bg.html'), 'w').write(drawers)
    print(f'\nspec-drawers-bg.html  5 drawers')
    if missing:
        print(f'\n!! {len(missing)} untranslated lines (left in German):')
        for k, t in sorted(missing):
            print(f'   [{k}] {t}')
    if not CDN:
        print('\n!! cdn-map.json missing — image columns carry TODO: placeholders.')


if __name__ == '__main__':
    main()
