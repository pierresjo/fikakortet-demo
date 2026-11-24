# Projektdirektiv: Fikakortet – kaféets lojalitetskort

ISGB04 HT26. Demoinstans för F7 (workshop) – **inte** tilldelad någon grupp. Version 0.1, 2026-10-22. Följer kravspec-mallen v1.3 i förkortad form: K1–K6 med acceptanskriterier, K7 enligt mallen, inga K8–K10. Beställare: kursansvarig.

## 1. Bakgrund och syfte

Kaféet Fikastunden har ett lojalitetskort på papper: tio stämplar ger en gratis fika. Pappret tappas bort, stämplarna fuskas och ingen vet vilka kunder som faktiskt handlar. Kaféet vill ha ett enkelt program som håller reda på kunder, kort och köp, spärrar kort vid behov och tar fram en månadsrapport över de mest trogna kunderna.

## 2. Intressenter

Beställare: kursansvarig. Brukare: kaféets personal vid kassan. Intern mottagare: kursansvarig. Testgrupp: ingen (demoinstans).

## 3. Avgränsningar

Ingen betalning, ingen kassakoppling, ingen fleranvändarhantering, ingen webb. Ett kafé, en dator. Exempeldata använder fiktiva namn.

## 4. Krav

### K1 Entiteter och tillstånd — Must

Systemet ska hantera **kunder**, **kort** och **köp**. Varje kund har kundnummer, namn och hemort. Varje kort har kortnummer, korttyp (K3), tillstånd, antal stämplar och antal poäng. Varje köp har löpnummer, datum, belopp i hela kronor och det kort köpet gjordes på. Ett kort befinner sig alltid i exakt ett av tillstånden **Aktivt**, **Spärrat** eller **Inlöst**. Tillåtna övergångar: Aktivt → Spärrat (spärra), Spärrat → Aktivt (häv spärr), Aktivt → Inlöst när kortet blir fullt enligt sin korttyp. Övriga övergångar ska nekas.

- AK1.1 Ett nyskapat kort är Aktivt med 0 stämplar och 0 poäng.
- AK1.2 Ett köp på ett Spärrat eller Inlöst kort nekas med ett felmeddelande, och kortet är oförändrat efteråt.
- AK1.3 När kortet blir fullt övergår det automatiskt till Inlöst i samma operation som det sista köpet registreras.
- AK1.4 Övergången Inlöst → Spärrat och Inlöst → Aktivt nekas med felmeddelande.

### K2 Relationer och integritet — Must

Varje kort tillhör exakt en kund; en kund kan ha noll eller flera kort. Varje köp tillhör exakt ett kort. En kund som har kort får inte tas bort. Ett kort som har köp får inte tas bort.

- AK2.1 Ett kort kan inte skapas utan en befintlig kund.
- AK2.2 Borttagning av en kund med kort nekas med felmeddelande; kunden finns kvar.
- AK2.3 Borttagning av ett kort med köp nekas med felmeddelande; kortet finns kvar.

### K3 Varianter med olika regler — Must

Det finns två korttyper. **Stämpelkort**: varje köp på minst 20 kronor ger en stämpel; kortet är fullt vid 10 stämplar. **Poängkort**: varje köp ger lika många poäng som beloppet; kortet är fullt vid 500 poäng. Korttypen väljs när kortet skapas och kan inte ändras. Nya korttyper ska kunna läggas till utan att befintliga korttypers kod ändras.

- AK3.1 Ett köp på 19 kronor ger ingen stämpel på ett stämpelkort men 19 poäng på ett poängkort; ett köp på 20 kronor ger en stämpel.
- AK3.2 Försök att ändra korttyp på ett befintligt kort nekas.
- AK3.3 En tredje korttyp kan läggas till som ny klass (eller motsvarande) och en registrering, utan ändring i Stämpelkortets eller Poängkortets kod; gruppen visar detta med ett test.

### K4 Algoritm — Must

Systemet ska beräkna en **månadsrapport** utifrån alla köp under en given månad enligt följande regler, i denna ordning: (1) summera beloppen per kund (över kundens alla kort) och räkna antalet köp; (2) sortera kunderna fallande på summa; (3) vid lika summa fallande på antal köp, vid lika antal i svensk alfabetisk ordning på namn (A–Z, Å, Ä, Ö); (4) kunder utan köp under månaden utelämnas. Beräkningen ska vara deterministisk.

**Räkneexempel (november).** Kunder: Anna, Bo, Åsa, Ängla, Örjan, ett kort var. Köp i ordning: Anna 40 · Ängla 30 · Åsa 25 · Anna 20 · Ängla 30 · Örjan 60 · Åsa 35.

| # | Kund | Summa | Antal köp |
| --- | --- | --- | --- |
| 1 | Anna | 60 | 2 |
| 2 | Åsa | 60 | 2 |
| 3 | Ängla | 60 | 2 |
| 4 | Örjan | 60 | 1 |

Bo utelämnas.

- AK4.1 Räkneexemplet ger exakt tabellen ovan, i den ordningen.
- AK4.2 Samma köp i annan inmatningsordning ger samma rapport.
- AK4.3 Gruppens eget räkneexempel med minst sex kunder, där regel 3 avgör minst två placeringar, ger det handräknade facit som gruppen kontrollräknat.
- AK4.4 En kund utan köp under månaden finns inte med i rapporten.

### K5 Filformat — Must

Systemet ska spara och öppna all data i ett eget radbaserat textformat (UTF-8). Filen börjar med en versionsrad `FIKAKORT 1`, följd av sektionerna `[KUNDER]`, `[KORT]` och `[KOP]` i den ordningen, med en post per rad och fälten åtskilda av `;`. Vid fel i filen ska programmet ange radnummer och orsak, och inget i minnet ska ändras.

Exempel:
```
FIKAKORT 1
[KUNDER]
1;Anna;Karlstad
2;Bo;Kil
[KORT]
101;1;Stämpelkort;Aktivt;2;0
102;2;Poängkort;Spärrat;0;120
[KOP]
1;2026-11-03;40;101
2;2026-11-05;20;101
```

- AK5.1 Spara följt av öppna ger samma kunder, kort (inklusive tillstånd, stämplar, poäng) och köp.
- AK5.2 En fil med annan versionsrad än `FIKAKORT 1` nekas med meddelandet "Rad 1: okänd formatversion".
- AK5.3 En rad med fel antal fält nekas med "Rad N: fel antal fält", och det som fanns i minnet före öppnandet är oförändrat.
- AK5.4 En fil som bryter mot K1–K3 (t.ex. ett köp på 19 kronor registrerat som stämpel, eller ett kort som pekar på en kund som inte finns) nekas med "Rad N: …" och orsak.

### K6 Gränssnitt — Must

Systemet ska ha ett textbaserat eller grafiskt gränssnitt med minst operationerna: skapa kund, skapa kort, registrera köp, spärra/häv spärr, visa en kunds kort, visa månadsrapport, spara, öppna, avsluta. Felaktig inmatning ska ge ett felmeddelande och återföra användaren till menyn. Gränssnittet ska följa den externa designspecifikationen i `docs/design-extern.md`.

- AK6.1 Alla operationer är nåbara från menyn.
- AK6.2 Bokstäver där ett tal väntas, okänt kundnummer och okänt kortnummer ger var sitt felmeddelande och åter till menyn utan krasch.
- AK6.3 Gränssnittet innehåller ingen affärslogik: inga regler ur K1–K4 i `ui/`, och `ui/` importerar inga regler direkt ur modellens interna detaljer. Gruppen visar detta med ett statiskt test.
- AK6.4 Vyerna, texterna och felmeddelandena stämmer med `docs/design-extern.md`.

### K7 Kvalitet och leverans — Must

Enligt kravspec-mallen v1.3 K7 (a)–(g): tester committade före kod för K4 och K5; README med exakt ett startkommando och ett testkommando; spårbarhetsmatris krav → fil → test; moduler modell/logik/lagring/gränssnitt/tester; AI-logg; PR per post; beställarbeslut.

## 5. Handlingsfrihet

Språk, testramverk, CLI eller GUI, verktyg för TPL, designer-AI och kodagent är gruppens val. Datum lagras som text `ÅÅÅÅ-MM-DD`.

## 6. Leveranser och tidplan

Demoinstans: ingen inlämning. I workshopen byggs K4 (en runda) och K1 (gruppernas övning).

## 7. Acceptansprocedur

Enligt mallen: ren dator, README:s två kommandon, räkneexemplen är facit.

