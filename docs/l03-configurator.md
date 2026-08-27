# XPENG L03 — конфигуратор

Пълна подготовка за добавяне на L03 към българския конфигуратор. Всички данни и
изображения са взети от официалните европейски конфигуратори на XPENG.

## Източник на данните

XPENG обслужва конфигураторите си от `store.xpeng.com` с вътрешно REST API. Пазарът се
избира със заглавка `country:` — без нея API-то връща 500.

```
POST https://store.xpeng.com/api/carVersion/list            {"carSeriesCode":"L03"}
POST https://store.xpeng.com/api/carSpecificationGroup/list {"carVersionId":"8886","configId":""}
POST https://store.xpeng.com/api/carInfo/list               {"carVersionId":"8886","configId":""}
POST https://store.xpeng.com/api/carSparePart/list          {"carVersionId":"8886","configId":""}

Headers: Content-Type: application/json
         country: DE          ← задължителна
```

Пазари с жив L03 конфигуратор към 2026-08-27: **DE, AT, BE, LU, NL, FR, DK, SE, NO**.
Пълната гама (5 версии, вкл. REEV) е налична само в DE, AT, BE и SE. Германия е
референтният пазар за проекта, затова всички данни идват от `country: DE`.

Суровият payload за всичките 9 пазара е запазен в
`configurator-data/l03/l03-xpeng-eu-raw.json` (2,6 MB) — може да се сравняват цени и
гама между пазарите без ново извличане.

## Гама (германски цени, приети 1:1)

| # | variant_code | Име | Цена | Задвижване | Пробег WLTP | 0–100 | Цветове | Интериори | Джанти |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `rwd-sr` | RWD Standard Range | 35 600 € | BEV, RWD | 445 км | 7,5 с | 3 | 1 | 18" |
| 2 | `powerx-lr` | PowerX Long Range | 38 600 € | REEV, RWD | 215 км ел. / 1017 км общо | 6,8 с | 5 | 2 | 18" |
| 3 | `rwd-lr` | RWD Long Range | 38 600 € | BEV, RWD | 520 км | 6,6 с | 5 | 2 | 18" |
| 4 | `awd` | AWD Performance | 41 600 € | BEV, AWD | 440 км | 4,5 с | 5 | 2 | 18" |
| 5 | `awd-ultra` | AWD Performance Ultra | 46 600 € | BEV, AWD | 440 км | 4,5 с | 5 | 2 | 20" |

Редът повтаря германския конфигуратор. `RWD Standard Range` предлага само
Arctic White / Rock Gray / Midnight Black и единствен интериор Dark Gray — затова
таблицата Colors и Interiors има изричен ред за всяка версия, а не общи `all` редове
(логиката в `main.js` може да *добави* `all` ред към версия, но не и да го премахне).

Опции: **Ръчен теглич 990 €** (всички версии), **Black Edition 1200 €** (само Ultra).

## Разлики спрямо G9/G6/P7+

1. **Три ъгъла на цвят.** L03 има front ¾ ляво / профил / front ¾ дясно вместо един
   рендър. Попълнени са в `image_front` / `image_side` / `image_rear`. Галерията в
   `main.js` показва само `image_front` — трите ъгъла са налични, ако решим да
   включим галерията с 3 кадъра.
2. **REEV версия.** Не е нула-емисионна. Затова са добавени колони `co2_emissions`,
   `co2_class`, `range_combined_km`, `fuel_consumption`, `fuel_tank_l`, `power_type`
   и редът за CO₂ на картата вече се чете от Sheet-а, а не е закован на «0 г/км, клас A».
3. **Black Edition без закован URL.** `beGallery` в `main.js` вече пада обратно към
   `image` на самия accessory ред, така че за L03 не се пипа код.
4. **Няма срок за доставка.** XPENG не публикува такъв за L03 в нито един пазар —
   `delivery_time` е празно, докато BAI не даде срок.
5. **Няма данни за окачването.** Спецификацията на L03 не съдържа ред за окачване,
   за разлика от G9. `suspension` остава празно.

## Изображения

50 файла в `assets/images/configurator/l03/` (общо 4,9 MB), конвертирани към webp. 44 от тях са качени в Webflow Assets → **Configurator/l03** и се ползват от Sheet-а; останалите 6 (360° панорамите и двата допълнителни ъгъла на Black Edition) стоят само локално до фаза 2, както е и при G9.

| Група | Брой | Формат |
|---|---|---|
| Екстериор 18" (5 цвята × 3 ъгъла) | 15 | 2048×1536 |
| Екстериор 20" / Ultra (5 цвята × 3 ъгъла) | 15 | 2048×1536 |
| Екстериор Black Edition (3 ъгъла) | 3 | 2048×1536 |
| Swatch-ове екстериор | 5 | 72×72 |
| Интериор — снимка | 2 | 1920×1080 |
| Интериор — swatch | 2 | 72×72 |
| Интериор — 360° панорами (front/back) | 4 | 3500×1750 |
| Джанти | 3 | 192×192 |
| Теглич | 1 | 1200×1200 |
| Общо | **50** (44 качени в Webflow) | |

360° панорамите не се ползват във фаза 1 — стоят готови за панорамния визуализатор
(фаза 2), както при G9.

## Регенериране

```bash
cd configurator-data/l03
python3 build.py
```

Чете `l03-xpeng-eu-raw.json` + `spec-translations.json` (+ по избор `cdn-map.json`) и
пише `sheet/*.tsv` и `spec-drawers-bg.html`. Докато `cdn-map.json` липсва, колоните с
изображения носят `TODO:<файл>.webp`, за да не тръгне нищо празно незабелязано.

---

## Какво е изпълнено

Всичко по-долу е направено и проверено на staging (`xpengg.webflow.io/configurator/l03`).

### Webflow

- Асет папка **Configurator/l03** (`6a8ffb7db2161d500dc35a44`), 44 файла качени.
- Страница **L03 Configurator** — `/configurator/l03`, page ID `6a8ffc00590bbe27505d4853`,
  дублирана от G9 конфигуратора, `data-configurator="l03"`, BG SEO/OG.
- **5 spec drawer-а**: `specs-rwd-sr`, `specs-powerx-lr`, `specs-rwd-lr`, `specs-awd`,
  `specs-awd-ultra`. Трите наследени от G9 са с изчистено съдържание и попълнени наново;
  `powerx-lr` и `awd-ultra` са създадени от нула със същите класове.

Асетите се качват през Data API-то (`create_asset` → presigned S3 POST), не през Designer-а —
`asset_tool > upload_image_by_url` виси без отговор. Presigned policy-то е фиксиран темплейт,
в който се мени само `key`, така че `configurator-data/l03/cdn-map.json` се попълва скриптово.

### Google Sheet

Таб Variants е разширен с `power_type`, `co2_emissions`, `co2_class`, `range_combined_km`,
`fuel_consumption`, `fuel_tank_l` (колони U–Z). Редовете на G9/G6/P7+ са празни там и `main.js`
ги третира като BEV — изходът им е непроменен.

| Таб | Добавени редове |
|---|---|
| Models | 1 |
| Variants | 5 |
| Colors | 23 |
| Interiors | 9 |
| Wheels | 6 |
| Accessories | 2 |

### Проверено на staging

- RWD Standard Range: 3 цвята, 1 интериор, 18" джанти, 35.600 €
- Ultra: 20" джанти, рендерите се сменят на `-20` вариантите
- Black Edition: цветът се заключва, джантите стават Black Edition, галерията показва
  изцяло черния рендер, общо **47.800 €** — точно колкото е SKU-то `DSUB014WND2` в Германия
- PowerX: «Разход на енергия 16.9 kWh/100км + 5.5 л/100 км, CO₂ емисии: 24 г/км», без CO₂ клас
- G9 остава непроменен

---

## Оставащо

1. **Публикуване на живо.** Сайтът е публикуван само на `xpengg.webflow.io`.
   `xpengauto.bg` още не съдържа L03 страницата.
2. **Няма продуктова страница за L03** (`/model/l03`) и L03 не е в навигацията —
   конфигураторът е достъпен само на директен адрес.
3. **Оставащо от BAI:** българска ценова листа, потвърждение дали PowerX се внася,
   срок за доставка, CO₂ клас на PowerX.
