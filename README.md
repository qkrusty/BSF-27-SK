# BIG SUMMER FEST 2027 – web

Statický, ľahký web (HTML + CSS + JS, bez knižníc a bez WordPressu).

## Nasadenie
Nahrajte **celý obsah** tohto priečinka na hosting tak, aby `index.html` bol v koreňovom adresári domény (napr. bigsummerfest.sk). Nič sa neinštaluje ani nekompiluje.

## Štruktúra
- `index.html` – hlavná stránka (úvod, line-up s bio interpretov, vstupenky, Zelená Voda s mapou, retro zóna s fotkami, videá 2026 + 2025, galéria 2025 + 2026, novinky, Napísali o nás, mini FAQ)
- `faq.html` – celé Info & FAQ s filtrom kategórií
- `partneri.html` – partneri ročníka 2026 a ponuka spolupráce
- `assets/css/style.css` – vzhľad a všetky animácie (farby sú na začiatku súboru v `:root`)
- `assets/css/fonts.css` + `assets/fonts/` – písma hostované lokálne (bez Google Fonts – GDPR)
- `assets/js/main.js` – odpočet, pop-up, menu, FAQ, čítačka článkov, videá, TV šum
- `assets/img/` – fotky a logá vo formáte WebP (optimalizované pre web)

## Čo kde upraviť
- **Odpočet** – v `index.html` atribút `data-target="2027-07-29T00:00:00+02:00"`.
- **Line-up** – sekcia `LINE-UP`, každý interpret je `<article class="artist">`. Pri odhalení nového mena nahraďte jednu kartu `artist--mystery` novou kartou (skopírujte napr. kartu LUNETIC a zmeňte meno, hit, fotku a odznak) a doplňte jeho bio do bloku `<div class="bios">` (`id="bio-…"` musí sedieť s `data-artist` na karte).
- **Ceny** – sekcia `VSTUPENKY`, horný pás (topbar), hero a pop-up (`#promo`).
- **Novinky** – karta v `.news-grid` + plné znenie v `<article id="post-…">`. Článok sa otvára v čítačke a má vlastný odkaz, napr. `bigsummerfest.sk/#clanok-checklist`.
- **FAQ** – bloky `.qa` v `faq.html`, kategória sa nastavuje atribútom `data-cat` (vstupenky, vstup, ubytovanie, parkovanie, doprava, lineup). Na úvode je výber 5 otázok.
- **Mapa** – `assets/img/mapa-2027.webp` (náhľad) a `mapa-2027-full.webp` (zväčšenie). Pri finálnej mape stačí prepísať tieto dva súbory.
- **Partneri** – dlaždice v `partneri.html` sú zatiaľ textové; logá partnerov môžete vložiť ako `<img>` do dlaždice `.partner`.
- **Pop-up** – zobrazí sa po 3,5 s, raz za návštevu (po zatvorení sa neukáže, kým návštevník nezavrie prehliadač).
- **Napísali o nás** – karty `.clip` v sekcii `#napisali`; nový článok pridáte skopírovaním jednej karty (médium, titulok, odkaz).
- **Výkon** – animácie v sekciách mimo obrazovky sa automaticky pozastavia a spodné sekcie sa vykresľujú až pri priblížení (`content-visibility`).
- **Plávajúca vstupenka** vpravo dole vedie priamo na Superticket; na úvode sa ukáže až po odscrollovaní z hero sekcie.

## Na overenie pred spustením
- Ceny na mieste (80 € / 160 €), časy otvorenia areálu a programu sú prevzaté z FAQ ročníka 2026 – dátumy sú prepísané na 29. – 31. 7. 2027.
- Článok o ubytovaní a parkovaní je z roku 2026 (má v sebe poznámku).
- Odkazy na obchodné podmienky a ochranu osobných údajov smerujú na existujúce stránky bigsummerfest.sk.
- Mapa areálu 2027 je predbežná verzia (tak je aj označená).
- Zoznam partnerov 2026 je prevzatý zo starej stránky – overte ho a doplňte logá.
- Bio interpretov je overené z verejných zdrojov (Wikipedia, oficiálna stránka Lunetic, české médiá).
