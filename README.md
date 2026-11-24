# Fikakortet

Demoprojekt i ISGB04 Programutveckling HT26, F7 Workshop. Ett program för ett kafés lojalitetskort: kunder, kort (stämpelkort eller poängkort) och köp. Kraven står i `docs/direktiv.md`.

Repot visar läget efter Lab 2 och de fyra första backloggposterna. Modellen (K1–K3) och menyskelettet (K6) är byggda och testade. Månadsrapporten (K4) och filformatet (K5) är inte byggda: menyvalen finns men svarar ”Ej implementerad än.”

## Förutsättningar

Node.js 20 eller senare. Projektet har inga beroenden, så `npm install` behövs inte.

## Starta

```
npm start
```

## Testa

```
npm test
```

Testerna ska vara gröna innan du börjar: 46 tester, 0 fel.

## Hämta en egen kopia

```
git clone <repots adress>
cd fikakortet-demo
npm test
```

## Innehåll

| Sökväg | Innehåll |
| --- | --- |
| `docs/direktiv.md` | Beställarens projektdirektiv med krav K1–K7 och acceptanskriterier |
| `docs/kravanalys.docx` | Annoterad kravspec och frågor till beställaren (Lab 2 del A) |
| `docs/design.md`, `docs/design.docx` | Modulindelning, klassdiagram, modulkontrakt, algoritm och filformat (Lab 2 del B) |
| `docs/design-extern.md` | Gränssnittets vyer, texter och felmeddelanden (Lab 2 del C) |
| `docs/projektspecifikation.docx` | Projektspecifikation med backlogg och sprintplan (Lab 2 del D) |
| `docs/bestallarbeslut.docx` | Frågor till beställaren och svaren |
| `docs/backlog.md` | Backloggposterna #1–#7 och deras status |
| `docs/tpl-brief.md` | Kort lägesbeskrivning till TPL |
| `startprompter/` | Startprompter med projektläget inbyggt: TPL, kodagent och designer-AI |
| `docs/ai-logg.docx` | AI-logg enligt kursens mall, en rad per runda |
| `AGENTS.md`, `CLAUDE.md` | Kontextfil för kodagenten |
| `src/model/` | Kund, Kort, Köp, korttyperna och registret. Alla regler ur K1–K3 |
| `src/logic/` | Månadsrapporten (K4). Tom, byggs i post #5 |
| `src/storage/` | Filformatet (K5). Tom, byggs i post #6 |
| `src/ui/` | Textmenyn (K6) |
| `tests/` | En testfil per krav och ett statiskt test av modulindelningen |

## Workshopens runda

Post #5, K4 Månadsrapport. Gör så här:

1. Starta en TPL-tråd i ditt AI-verktyg med `startprompter/startprompt-tpl.md`.
2. Starta kodagenten i repots rotmapp med `startprompter/startprompt-kodagent.md`.
3. Be TPL om uppdraget för post #5 och ge det ordagrant till kodagenten. Testerna mot räkneexemplet i K4 ska skrivas och committas före koden.
4. Klistra in agentens rapport och diff hos TPL och granska mot AK4.1–AK4.4. Kör `npm test` själv.
5. Besluta: acceptera, begär ändring eller skriv om. För in rundan i `docs/ai-logg.docx`.

Designer-AI:n behövs inte för post #5 om du inte vill ändra rapportens utseende. Startprompten finns i `startprompter/startprompt-designer.md`.
