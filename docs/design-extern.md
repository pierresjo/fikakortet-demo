# Extern designspecifikation – Fikakortet

Lab 2 del C. Version 1.1, 2026-11-23. Godkänd av produktägaren 2026-11-23.

Gränssnittet är en textmeny i terminalen. Användaren är kassören i kaféet. Texterna nedan gäller ordagrant (AK6.4). Felmeddelanden börjar alltid med `Fel: ` och efter ett fel visas menyn igen.

## 1. Huvudmeny

```

FIKAKORTET
1. Skapa kund
2. Skapa kort
3. Registrera köp
4. Spärra kort
5. Häv spärr
6. Visa en kunds kort
7. Visa månadsrapport
8. Spara
9. Öppna
0. Avsluta
Välj: 
```

| Händelse | Text |
| --- | --- |
| Val som inte finns i menyn | `Fel: välj en siffra ur menyn.` |
| Val 0 | `Hej då!` och programmet avslutas |

## 2. Skapa kund (val 1)

Frågor i ordning: `Namn: `, `Hemort: `.

| Händelse | Text |
| --- | --- |
| Kunden skapad | `Kund 1 skapad: Anna, Karlstad.` |
| Tomt namn | `Fel: Kundens namn får inte vara tomt.` |
| Tom hemort | `Fel: Kundens hemort får inte vara tom.` |

## 3. Skapa kort (val 2)

Fråga: `Kundnummer: `. Därefter visas korttyperna numrerade (`1. Stämpelkort`, `2. Poängkort`) och frågan `Korttyp: `.

| Händelse | Text |
| --- | --- |
| Kortet skapat | `Kort 101 (Stämpelkort) skapat för Anna.` |
| Bokstäver i kundnumret | `Fel: Kundnumret ska skrivas med siffror.` |
| Kunden finns inte | `Fel: Kund 7 finns inte.` |
| Bokstäver i korttypen | `Fel: Korttypen ska skrivas med siffror.` |
| Nummer utanför listan | `Fel: välj en korttyp ur listan.` |

## 4. Registrera köp (val 3)

Frågor i ordning: `Kortnummer: `, `Datum (ÅÅÅÅ-MM-DD): `, `Belopp i hela kronor: `.

| Händelse | Text |
| --- | --- |
| Köpet registrerat | `Köp 1 registrerat: 40 kr på kort 101.` följt av kortraden (avsnitt 6) |
| Bokstäver i kortnumret | `Fel: Kortnumret ska skrivas med siffror.` |
| Kortet finns inte | `Fel: Kort 999 finns inte.` |
| Bokstäver eller decimaler i beloppet | `Fel: Beloppet ska skrivas med siffror.` |
| Datum som inte finns | `Fel: Datumet ska skrivas ÅÅÅÅ-MM-DD och vara ett riktigt datum.` |
| Kortet är Spärrat eller Inlöst | `Fel: Kort 101 är Spärrat och kan inte ta emot köp.` |

När ett kort blir fullt syns det på kortraden, där tillståndet är Inlöst.

## 5. Spärra kort (val 4) och häv spärr (val 5)

Fråga: `Kortnummer: `.

| Händelse | Text |
| --- | --- |
| Kortet spärrat | `Kort 101 är spärrat.` |
| Spärren hävd | `Kort 101 är aktivt igen.` |
| Spärra ett kort som inte är Aktivt | `Fel: Kort 101 är Inlöst och kan inte spärras.` |
| Häv spärr på ett kort som inte är Spärrat | `Fel: Kort 101 är Aktivt. Bara ett spärrat kort kan få spärren hävd.` |
| Bokstäver, eller kortet finns inte | Som i avsnitt 4 |

## 6. Visa en kunds kort (val 6)

Fråga: `Kundnummer: `. Först en rubrikrad, sedan en kortrad per kort:

```
Kort för Anna (kund 1):
Kort 101  Stämpelkort  Aktivt  stämplar: 3  poäng: 0
Kort 102  Poängkort  Aktivt  stämplar: 0  poäng: 120
```

| Händelse | Text |
| --- | --- |
| Kunden har inga kort | `Kunden har inga kort.` |
| Bokstäver, eller kunden finns inte | Som i avsnitt 3 |

## 7. Visa månadsrapport (val 7)

Inte byggd än (post #5). Tills dess svarar valet `Ej implementerad än.`

Fråga: `Månad (ÅÅÅÅ-MM): `. Rapporten har en rubrikrad, en kolumnrad och en rad per kund. Kolumnerna är vänsterställda och åtskilda med minst två blanksteg:

```
Månadsrapport 2026-11
Plats  Namn   Summa  Antal köp
1      Anna   60 kr  2
2      Åsa    60 kr  2
3      Ängla  60 kr  2
4      Örjan  60 kr  1
```

| Händelse | Text |
| --- | --- |
| Inga köp under månaden | `Inga köp under 2026-11.` |
| Månaden är fel skriven | `Fel: Månaden ska skrivas ÅÅÅÅ-MM.` |

## 8. Spara (val 8) och öppna (val 9)

Inte byggda än (post #6). Tills dess svarar valen `Ej implementerad än.`

Fråga: `Filnamn: `.

| Händelse | Text |
| --- | --- |
| Sparat | `Sparat i fika.txt.` |
| Öppnat | `Öppnade fika.txt: 5 kunder, 5 kort, 7 köp.` |
| Filen finns inte | `Fel: Filen fika.txt finns inte.` |
| Fel i filen | `Fel: Rad 4: fel antal fält` och uppgifterna i minnet är oförändrade |

## 9. Motivering mot gränssnittsprinciperna

| Princip | Hur gränssnittet följer den |
| --- | --- |
| Konsekvens | Alla frågor slutar med kolon och blanksteg, alla fel börjar med `Fel: `, och menyn visas alltid efter en operation |
| Återkoppling | Varje lyckad operation bekräftas med vad som hände och vilket nummer det gäller |
| Felhantering | Ett fel avbryter operationen utan att något ändras, och meddelandet säger vad kassören ska göra annorlunda |
| Minnesbelastning | Korttyperna väljs ur en numrerad lista, och formatet för datum och månad står i frågan |
| Användarens språk | Texterna använder kaféets ord: kund, kort, köp, stämplar, poäng |

## 10. Designrundor

| Version | Datum | Ändring |
| --- | --- | --- |
| 1.0 | 2026-11-19 | Första förslaget från designer-AI: meny, vyer och texter |
| 1.1 | 2026-11-23 | Korttypen väljs ur en numrerad lista i stället för att skrivas. Kortraden visas direkt efter ett köp |
