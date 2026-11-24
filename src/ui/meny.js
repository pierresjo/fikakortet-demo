import { RegelFel } from '../model/index.js';

// Textmenyn (K6). Menyn läser in, anropar registret och skriver ut.
// Den innehåller inga regler ur K1–K4 (AK6.3): reglerna ligger i model/ och logic/.
// Texterna följer docs/design-extern.md (AK6.4).

const MENY = [
  '',
  'FIKAKORTET',
  '1. Skapa kund',
  '2. Skapa kort',
  '3. Registrera köp',
  '4. Spärra kort',
  '5. Häv spärr',
  '6. Visa en kunds kort',
  '7. Visa månadsrapport',
  '8. Spara',
  '9. Öppna',
  '0. Avsluta',
];

const EJ_IMPLEMENTERAD = 'Ej implementerad än.';

// Kastas när kassören skriver något som inte går att tolka (AK6.2).
class InmatningsFel extends Error {}

export class Meny {
  #register;
  #io;

  // io har två funktioner: fraga(text) -> Promise<string> och skriv(text).
  constructor(register, io) {
    this.#register = register;
    this.#io = io;
  }

  get register() { return this.#register; }

  async kor() {
    for (;;) {
      for (const rad of MENY) this.#io.skriv(rad);
      const val = (await this.#io.fraga('Välj: ')).trim();
      if (val === '0') {
        this.#io.skriv('Hej då!');
        return;
      }
      await this.#utfor(val);
    }
  }

  async #utfor(val) {
    const operationer = {
      1: () => this.#skapaKund(),
      2: () => this.#skapaKort(),
      3: () => this.#registreraKop(),
      4: () => this.#sparraKort(),
      5: () => this.#havSparr(),
      6: () => this.#visaKundensKort(),
      7: () => this.#visaManadsrapport(),
      8: () => this.#spara(),
      9: () => this.#oppna(),
    };
    const operation = operationer[val];
    if (!operation) {
      this.#io.skriv('Fel: välj en siffra ur menyn.');
      return;
    }
    try {
      await operation();
    } catch (fel) {
      // Ett fel avbryter operationen och menyn visas igen (AK6.2).
      if (fel instanceof RegelFel || fel instanceof InmatningsFel) {
        this.#io.skriv(`Fel: ${fel.message}`);
      } else {
        throw fel;
      }
    }
  }

  async #fragaHeltal(text, vad) {
    const svar = (await this.#io.fraga(text)).trim();
    if (!/^\d+$/.test(svar)) {
      throw new InmatningsFel(`${vad} ska skrivas med siffror.`);
    }
    return Number(svar);
  }

  async #skapaKund() {
    const namn = await this.#io.fraga('Namn: ');
    const hemort = await this.#io.fraga('Hemort: ');
    const kund = this.#register.skapaKund(namn, hemort);
    this.#io.skriv(`Kund ${kund.kundnummer} skapad: ${kund.namn}, ${kund.hemort}.`);
  }

  async #skapaKort() {
    const kundnummer = await this.#fragaHeltal('Kundnummer: ', 'Kundnumret');
    const kund = this.#register.hittaKund(kundnummer);
    const korttyper = this.#register.korttyper;
    korttyper.forEach((namn, i) => this.#io.skriv(`${i + 1}. ${namn}`));
    const nummer = await this.#fragaHeltal('Korttyp: ', 'Korttypen');
    const korttyp = korttyper[nummer - 1];
    if (!korttyp) throw new InmatningsFel('välj en korttyp ur listan.');
    const kort = this.#register.skapaKort(kund.kundnummer, korttyp);
    this.#io.skriv(`Kort ${kort.kortnummer} (${kort.korttyp.namn}) skapat för ${kund.namn}.`);
  }

  async #registreraKop() {
    const kortnummer = await this.#fragaHeltal('Kortnummer: ', 'Kortnumret');
    this.#register.hittaKort(kortnummer);
    const datum = (await this.#io.fraga('Datum (ÅÅÅÅ-MM-DD): ')).trim();
    const belopp = await this.#fragaHeltal('Belopp i hela kronor: ', 'Beloppet');
    const kop = this.#register.registreraKop(kortnummer, datum, belopp);
    this.#io.skriv(`Köp ${kop.lopnummer} registrerat: ${kop.belopp} kr på kort ${kortnummer}.`);
    this.#io.skriv(this.#kortrad(kop.kort));
  }

  async #sparraKort() {
    const kortnummer = await this.#fragaHeltal('Kortnummer: ', 'Kortnumret');
    this.#register.sparraKort(kortnummer);
    this.#io.skriv(`Kort ${kortnummer} är spärrat.`);
  }

  async #havSparr() {
    const kortnummer = await this.#fragaHeltal('Kortnummer: ', 'Kortnumret');
    this.#register.havSparr(kortnummer);
    this.#io.skriv(`Kort ${kortnummer} är aktivt igen.`);
  }

  async #visaKundensKort() {
    const kundnummer = await this.#fragaHeltal('Kundnummer: ', 'Kundnumret');
    const kund = this.#register.hittaKund(kundnummer);
    const kort = this.#register.kortFor(kundnummer);
    this.#io.skriv(`Kort för ${kund.namn} (kund ${kund.kundnummer}):`);
    if (kort.length === 0) {
      this.#io.skriv('Kunden har inga kort.');
      return;
    }
    for (const k of kort) this.#io.skriv(this.#kortrad(k));
  }

  #kortrad(kort) {
    return `Kort ${kort.kortnummer}  ${kort.korttyp.namn}  ${kort.tillstand}  ` +
      `stämplar: ${kort.stamplar}  poäng: ${kort.poang}`;
  }

  // Backloggpost #5 (K4).
  async #visaManadsrapport() {
    this.#io.skriv(EJ_IMPLEMENTERAD);
  }

  // Backloggpost #6 (K5).
  async #spara() {
    this.#io.skriv(EJ_IMPLEMENTERAD);
  }

  // Backloggpost #6 (K5).
  async #oppna() {
    this.#io.skriv(EJ_IMPLEMENTERAD);
  }
}
