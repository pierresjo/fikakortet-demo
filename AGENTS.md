# Projekt: Fikakortet (ISGB04, demo F7)

## Vad systemet gör
Ett program för ett kafés lojalitetskort: kunder, kort (stämpelkort eller poängkort) och köp, med månadsrapport och spara/öppna i ett eget textformat. Kraven står i `docs/direktiv.md` (K1–K7 med acceptanskriterier AK1.1–AK6.4). Räkneexemplet i K4 är facit. Räkna aldrig fram ett eget.

## Arkitektur
Moduler under `src/`:
- `model/` har Kund, Kort, Kop, korttyperna och registret. Alla regler ur K1–K3 ligger här. Övriga moduler importerar bara `model/index.js`.
- `logic/` har månadsrapporten (K4) som en ren funktion.
- `storage/` har filformatet (K5). Tolkningen sker i två steg: rader blir poster med radnummer, och posterna blir objekt via modellens metoder.
- `ui/` har menyn (K6) och ingen affärslogik.

Testerna ligger i `tests/`, en fil per krav: `k1.test.js` till `k6.test.js`, och `lager.test.js` som kontrollerar modulindelningen statiskt.

Designen med klassdiagram, modulkontrakt och filformat finns i `docs/design.md`. Gränssnittets vyer och texter finns i `docs/design-extern.md`. Följ dem. Föreslå ändringar i rapporten i stället för att avvika tyst.

## Språk och verktyg
JavaScript (ES-moduler) på Node.js 20 eller senare. Inga beroenden: bara Nodes standardbibliotek, med `node:test` och `node:assert/strict` för testerna. Start: `npm start`. Test: `npm test`. UTF-8 överallt. Namn sorteras i svensk ordning (A–Z, Å, Ä, Ö) med en egen nyckel, inte med `localeCompare` eller `Intl`, eftersom resultatet då beror på datorns installation.

Identifierare skrivs på svenska utan å, ä och ö (`registreraKop`, `havSparr`). Texter som användaren ser skrivs med å, ä och ö.

## Regler för ändringar
- Arbeta med en backloggpost (issue) i taget. Ändra inte filer utanför postens omfång.
- Tester för postens acceptanskriterier skrivs och committas före implementationen.
- Ändra aldrig ett befintligt test för att få det grönt. Rapportera i stället varför det är rött.
- Fråga i stället för att gissa när direktivet eller designen är oklar: lista frågan i rapporten under ”Frågor till beställaren” och stanna vid den punkten.
- Varje körning avslutas med en rapport: vad som gjorts (filer), vilka tester som körts och resultatet, antaganden som gjorts, frågor till beställaren.
- Commit-meddelande: `K<n>: <vad>, löser #<issue>`.

## Får inte
- Lägga till beroenden utan att fråga. Det gäller även React och andra ramverk för gränssnittet.
- Lägga regler ur K1–K4 i `src/ui/`, eller låta `src/model/` importera `ui/`, `logic/` eller `storage/`.
- Använda personuppgifter i exempeldata. Använd bara de fiktiva namnen i direktivet.
- Köra i helautomatiskt läge. Varje filändring och kommando ska godkännas.
