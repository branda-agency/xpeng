# XPENG G9L – страница на модела (/model/g9l)

Автор: Георги · Създадена 2026-10-12 от HQ guideline-а „G9L Teaser&Launch Page Guideline“
(Feishu wiki `Rm8pwThkQiqI7DkBxhacsrvVn9d`, лист „G9L Launch Page“; пълният текст е в
`docs/g9l-launch-guideline.tsv`). Материалите са в Feishu Drive папка `PN1wffUTKlwDEOdHyYpcw6KBndc`
(19 подпапки по секции); визиите са взети от публичните CDN линкове на HQ в колоната
„Visual Link in CMS“ (`s-cdn.uat.xpeng.com`), които са вече кадрирани за PC/мобилен.

## Webflow
- Страница `6acc9b6afa704fbd87115922`, slug `g9l`, папка `/model` (`6a05c0528d12ace13a84e533`),
  дубликат на L03 (`6a97e69ad2cbd18a4aaaebd0`) през `create_page` + `duplicateOf`.
  Element ID-тата се запазват при дублиране (сменя се само `component`).
- Асети: папка **G9L** `6acc9c2c855ddd69f5a1a31c`, 56 AVIF файла `g9l-*.avif` (качени през
  `create_asset` + S3 POST; API-то показва `size: 0` за API-качени файлове, байтовете са налични).
- Публикувано само на `xpengg.webflow.io` (customDomains: []). Продукционен publish НЕ е правен.
- `main.js`: `g9l` добавен в `PRODUCT_SLUGS` (commit 4dc2e5e), иначе каруселите/цветовете не се
  инициализират.

## Структура (ред по guideline-а → наши секции)
| # | HQ модул | Наша секция |
|---|---|---|
| 1 | Page Banner | `model-hero` – `<video>` елементите са без `<source>`, само `poster` (PC/мобилен KV); бутон „Конфигуратор“ скрит, „Заявете тестдрайв“ → `/test-drive?model=g9l` |
| 2 | Rotate Car | **пропуснат** (sprite 36×900×420 px е нискорезолюционен; за Home 360 трябват 1600×1200 кадри от Drive папка „2 Rotate Car“) |
| 3 | Title + Carousel Banner (4) | fullscreen „Флагмански екстериор“ + tabbed-carousel (3) |
| 4 | Triple Desc DLP | featured-spec |
| 5–6 | Color selection ext/int | color-picker ×2 (4 цвята: Waving Green, Mirror Gray, Arctic White, Diamond Black; интериор Meteorite Black, Tangerine); воден знак G9L (Poppins Black Italic, viewBox 0 0 429 181) |
| 7–8 | Intelligent Drive + Carousel (3) | fullscreen + tabbed-carousel |
| 9 | Flash Card Cockpit (5) | featured-spec (AR-HUD) + tabbed-carousel (3) + feature-card (мултисценарии) |
| 10 | Title + Carousel Pic seats (3) | fullscreen + 3 feature cards (AI seat = кадър от видеото) |
| 11 | Carousel Grid (4) | featured-spec (таванен екран) + tabbed-carousel (3) |
| 12 | Darth Vader space | fullscreen + 3 feature cards |
| 13 | General Banner silence | fullscreen |
| 14–16 | Two energies + 800V (2) + Range extender | fullscreen (двете енергии + 3-те точки) + tabbed-carousel (2 таба) |
| 17 | Chassis carousel (3) | tabbed-carousel |
| 18 | MultiVideo RWS | fullscreen (кадър от видеото) |
| 19 | Flash card confidence (3) | featured-spec (газене) + 2 feature cards |
| 20 | Safety carousel (4) | fullscreen (краш тестове) + 3 feature cards |
| 21 | Specs | **премахнат** (няма нива на оборудване/цени) |
| 22–23 | Form, App & Disclaimer | contact-form, app-promo, Subscribe, disclaimer (5 бележки ¹–⁵ от HQ), Footer |

Каруселите на шаблона са native Webflow Tabs с по 3 таба; през API не могат да се добавят табове,
затова 4–5-елементните HQ модули са разбити на fullscreen/featured-spec + 3 таба.
`insert_component_instance` не приема компонент-инстанция като котва → append към `.main`
и после подреждане с `move_element` append в желания ред.

## Решения на Георги (2026-10-12, следобед)
- Тест драйв: бутонът в hero е **скрит** (формата няма радио G9L). Конфигураторът също скрит.
- Nav + Footer: G9L добавен (desktop линк `data-mega-trigger="g9l"` + mega панел `data-mega-panel="g9l"`
  с картинка g9l-exterior, мобилен drawer група, footer линк). CSS правилата за mega в motion.css
  (commit 67106cf).
- Home карусел: 5-и слайд `data-360="g9l"` (36 кадъра в Bunny `360/g9l/`, upscale ×1.97 от HQ sprite-а;
  кадър k = sprite кадър (27−k) mod 36, за да започва от фронт и да върти като G9), статично
  `g9l_product_side_home.avif` (от рендера Waving Green, 2660×1010, кола 1949 px) asset
  `6accaa7d62c56ce95d0d429f`, компонент `G9L-mark` `311f5eda-54d3-7101-b24f-c1a721694fd6`, info item
  `d9891cca-…6b5c`, таб `1e8c3db2-…069b`, слайд `902bdd95-…0588`. motion.css: g9l в изключението за
  scale(1) (commit 877e160). Rotate-frame/cursor са DOM `<i>`→`img` (WHTML `<img>` губи data-атрибутите).
- Видеа: остават кадри (AI Seat, RWS); mp4 файловете са в scratchpad, не са качени в Bunny.
- Текстове: първо ги преглежда колежката за copy (Алето) по таблицата EN/BG
  https://claude.ai/artifact/LthiTDRZfqmNzDH3qFe9zU, после BAI; **продукционен publish след одобрение**.

## Отворени точки
- Конфигуратор G9L: HQ линк „G9L Configuration Content-EU“ (wiki `WUlYw76QHi4UTbkGWpzcui14nNd`) — чака нива/цени.
- Радио G9L в тест драйв формата, когато BAI потвърди тест автомобили.
- Мобилен преглед на страницата не е правен в браузър (resize на прозореца не смени viewport-а).
