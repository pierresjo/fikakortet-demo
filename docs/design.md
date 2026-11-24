# Design – Fikakortet

Lab 2 del B. Version 1.1, 2026-11-23. Textversion av `docs/design.docx`, och den version kodagenten läser.

Språk: JavaScript (ES-moduler) på Node.js 20 eller senare. Testerna körs med `node:test`. Projektet har inga beroenden. Start: `npm start`. Test: `npm test`.

## 1. Modulindelning

| Modul | Filer | Ansvar | Får importera |
| --- | --- | --- | --- |
| `src/model/` | `kund.js`, `kort.js`, `kop.js`, `korttyp.js`, `register.js`, `fel.js`, `index.js` | Alla regler ur K1–K3 | Bara filer i `model/` |
| `src/logic/` | `rapport.js` (post #5) | Månadsrapporten K4 som en ren funktion | `model/index.js` |
| `src/storage/` | `fil.js` (post #6) | Filformatet K5 | `model/index.js` |
| `src/ui/` | `meny.js`, `main.js` | Menyn K6. Läser in, anropar och skriver ut | `model/index.js`, `logic/`, `storage/` |
| `tests/` | `k1.test.js` … `k6.test.js`, `lager.test.js`, `hjalp.js` | En testfil per krav | Allt |

`tests/lager.test.js` kontrollerar statiskt att `model/` bara importerar från `model/`, att `ui/` bara når modellen genom `model/index.js` och att `ui/` inte innehåller regelkonstanterna 10, 20 och 500 (AK6.3).

Menyn får sin inmatning och utskrift genom ett objekt med två funktioner, `fraga(text)` och `skriv(text)`. I programmet är det tangentbord och skärm (`main.js`), i testerna en lista med färdiga svar (`tests/hjalp.js`). Samma uppdelning gör att ett grafiskt gränssnitt, till exempel i React, kan läggas bredvid textmenyn utan att `model/` och `logic/` ändras. Det kräver ett beslut om beroenden och en ny version av `docs/design-extern.md`.

## 2. Klassdiagram (text)

| Klass | Attribut | Metoder | Relationer |
| --- | --- | --- | --- |
| `Kund` | kundnummer, namn, hemort | – | 1 kund har 0..* kort |
| `Kort` | kortnummer, kund, korttyp, tillstand, stamplar, poang | `registreraKop(lopnummer, datum, belopp)`, `sparra()`, `havSparr()` | 1 kort har 0..* köp, 1 kort har 1 korttyp |
| `Kop` | lopnummer, datum, belopp, kort | – | hör till 1 kort |
| `Korttyp` (basklass) | namn | `utdelning(belopp)`, `arFullt(stallning)` | – |
| `Stampelkort` | MINSTA_BELOPP = 20, FULLT_VID = 10 | ärver Korttyp | – |
| `Poangkort` | FULLT_VID = 500 | ärver Korttyp | – |
| `Register` | kunder, kort, kop, nästa kundnummer, kortnummer och löpnummer | `skapaKund`, `skapaKort`, `registreraKop`, `sparraKort`, `havSparr`, `kortFor`, `hittaKund`, `hittaKort`, `taBortKund`, `taBortKort` | rotobjekt som `ui/`, `logic/` och `storage/` arbetar mot |

Attributen är privata fält (`#tillstand`) med enbart läsmetoder. Tillstånd, stämplar, poäng och korttyp kan alltså bara ändras genom kortets egna metoder, och ingen annan modul kan gå förbi reglerna i K1.

`Tillstand` är ett fruset objekt med värdena `Aktivt`, `Spärrat` och `Inlöst`.

Tillåtna övergångar: Aktivt → Spärrat (`sparra`), Spärrat → Aktivt (`havSparr`), Aktivt → Inlöst (i `registreraKop` när kortet blir fullt). Alla andra nekas.

**Utökningspunkt för en ny korttyp (AK3.3).** En ny korttyp är en ny klass som ärver `Korttyp` och en rad i `KORTTYPER` i `src/model/korttyp.js`. `Kort`, `Register`, menyn och filinläsningen ändras inte, eftersom de slår upp korttypen i `KORTTYPER` via namnet. Testet för AK3.3 i `tests/k3.test.js` visar det med en påhittad tredje korttyp.

## 3. Modulkontrakt

1. `Kort.registreraKop(lopnummer, datum, belopp)` ger ett `Kop`. Förvillkor: tillståndet är Aktivt, datumet är ett riktigt datum skrivet ÅÅÅÅ-MM-DD, beloppet är ett heltal och minst 1 (se avsnitt 6). Eftervillkor: korttypens regel är tillämpad, köpet är tillagt och tillståndet är Inlöst om kortet blev fullt. Vid brott kastas `RegelFel` och kortet är oförändrat.
2. `Kort.sparra()` och `Kort.havSparr()`. Förvillkor: Aktivt respektive Spärrat. Vid brott kastas `RegelFel` och tillståndet är oförändrat.
3. `Register.taBortKund(kundnummer)`. Förvillkor: kunden har inga kort. Vid brott kastas `RegelFel`.
4. `Register.taBortKort(kortnummer)`. Förvillkor: kortet har inga köp. Vid brott kastas `RegelFel`.
5. `manadsrapport(register, manad)` i `src/logic/rapport.js` ger en lista med rader `{ kund, summa, antal }`. `manad` skrivs ÅÅÅÅ-MM. Funktionen läser bara och ändrar inget i registret. Den är deterministisk: samma köp ger samma rapport oavsett inmatningsordning. Reglerna 1–4 i K4 gäller. Svensk ordning via en egen nyckel, skiftlägesokänslig (BB1).
6. `oppna(sokvag)` i `src/storage/fil.js` ger ett nytt `Register`. Vid fel kastas `FilFel(rad, orsak)` och inget returneras, så anroparen behåller sitt register. `spara(register, sokvag)` skriver hela registret.

## 4. K4 – algoritm (pseudokod)

```
rader ← tom lista
för varje kund i registret:
    köp ← kundens köp på alla kundens kort där datumet börjar med månaden
    om antal(köp) > 0:
        lägg till (kund, summa av beloppen, antal(köp)) i rader
sortera rader efter: summa fallande, sedan antal fallande, sedan svenskNyckel(namn)
returnera rader

svenskNyckel(namn): gör om namnet till små bokstäver och byt varje tecken mot dess plats
i alfabetet a–z, å, ä, ö
```

Genomgång av direktivets räkneexempel (november): Anna 40 + 20 = 60 på 2 köp, Åsa 25 + 35 = 60 på 2 köp, Ängla 30 + 30 = 60 på 2 köp, Örjan 60 på 1 köp, Bo inga köp. Alla har summan 60. Örjan har färre köp och hamnar sist. Anna, Åsa och Ängla har lika antal och ordnas på namn: A före Å före Ä. Resultat: Anna, Åsa, Ängla, Örjan. Bo utelämnas. Det stämmer med tabellen i direktivet.

## 5. K5 – filformat

Första raden är `FIKAKORT 1`. Därefter tre sektioner i den här ordningen, med en post per rad och semikolon mellan fälten:

| Sektion | Radformat |
| --- | --- |
| `[KUNDER]` | kundnummer;namn;hemort |
| `[KORT]` | kortnummer;kundnummer;korttyp;tillstånd;stämplar;poäng |
| `[KOP]` | löpnummer;datum;belopp;kortnummer |

Rader räknas från 1, och formatraden är rad 1. Tolkningen sker i två steg: raderna blir poster med radnummer, och posterna blir objekt genom modellens metoder. Ett nytt register byggs och byts in först när hela filen är läst. Vid fel kastas `FilFel` med radnummer och orsak, och registret i minnet är oförändrat.

## 6. Beslut och öppna frågor

| # | Fråga | Läge |
| --- | --- | --- |
| BB1 | Gäller den svenska ordningen i K4 oavsett stor och liten bokstav? | Besvarad: ja, skiftlägesokänslig |
| BB2 | Får en kund med ett Inlöst kort skapa ett nytt kort? | Besvarad: ja |
| – | Ska ett köp på 0 kr godtas? | Ställd, inte besvarad. Tills vidare nekar modellen belopp under 1 kr |

Kund- och kortnummer delas ut av registret: kundnummer från 1, kortnummer från 101, löpnummer för köp från 1.
