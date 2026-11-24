import { RegelFel } from './fel.js';
import { Kop } from './kop.js';

// K1: ett kort är alltid i exakt ett av tre tillstånd.
export const Tillstand = Object.freeze({
  AKTIVT: 'Aktivt',
  SPARRAT: 'Spärrat',
  INLOST: 'Inlöst',
});

const DATUM = /^(\d{4})-(\d{2})-(\d{2})$/;

export function arGiltigtDatum(text) {
  const m = DATUM.exec(String(text));
  if (!m) return false;
  const [ar, manad, dag] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(ar, manad - 1, dag));
  return d.getUTCFullYear() === ar && d.getUTCMonth() === manad - 1 && d.getUTCDate() === dag;
}

export class Kort {
  #kortnummer;
  #kund;
  #korttyp;
  #tillstand = Tillstand.AKTIVT;
  #stamplar = 0;
  #poang = 0;
  #kop = [];

  constructor(kortnummer, kund, korttyp) {
    if (!Number.isInteger(kortnummer) || kortnummer < 1) {
      throw new RegelFel('Kortnumret ska vara ett positivt heltal.');
    }
    this.#kortnummer = kortnummer;
    this.#kund = kund;
    this.#korttyp = korttyp;
  }

  get kortnummer() { return this.#kortnummer; }
  get kund() { return this.#kund; }
  // Korttypen har ingen setter: den väljs när kortet skapas och kan inte ändras (AK3.2).
  get korttyp() { return this.#korttyp; }
  get tillstand() { return this.#tillstand; }
  get stamplar() { return this.#stamplar; }
  get poang() { return this.#poang; }
  get kop() { return [...this.#kop]; }

  // Kontrakt 1. Förvillkor: Aktivt kort, giltigt datum, belopp i hela kronor, minst 1.
  // Eftervillkor: korttypens regel är tillämpad, köpet är tillagt och kortet är Inlöst
  // om det blev fullt (AK1.3). Vid regelbrott kastas RegelFel och kortet är oförändrat (AK1.2).
  registreraKop(lopnummer, datum, belopp) {
    if (this.#tillstand !== Tillstand.AKTIVT) {
      throw new RegelFel(`Kort ${this.#kortnummer} är ${this.#tillstand} och kan inte ta emot köp.`);
    }
    if (!arGiltigtDatum(datum)) {
      throw new RegelFel('Datumet ska skrivas ÅÅÅÅ-MM-DD och vara ett riktigt datum.');
    }
    if (!Number.isInteger(belopp) || belopp < 1) {
      throw new RegelFel('Beloppet ska vara ett heltal i kronor, minst 1.');
    }
    const utdelning = this.#korttyp.utdelning(belopp);
    const kop = new Kop(lopnummer, datum, belopp, this);
    this.#stamplar += utdelning.stamplar;
    this.#poang += utdelning.poang;
    this.#kop.push(kop);
    if (this.#korttyp.arFullt({ stamplar: this.#stamplar, poang: this.#poang })) {
      this.#tillstand = Tillstand.INLOST;
    }
    return kop;
  }

  // Kontrakt 2. Aktivt -> Spärrat. Alla andra utgångslägen nekas (AK1.4).
  sparra() {
    if (this.#tillstand !== Tillstand.AKTIVT) {
      throw new RegelFel(`Kort ${this.#kortnummer} är ${this.#tillstand} och kan inte spärras.`);
    }
    this.#tillstand = Tillstand.SPARRAT;
  }

  // Kontrakt 2. Spärrat -> Aktivt. Alla andra utgångslägen nekas (AK1.4).
  havSparr() {
    if (this.#tillstand !== Tillstand.SPARRAT) {
      throw new RegelFel(`Kort ${this.#kortnummer} är ${this.#tillstand}. Bara ett spärrat kort kan få spärren hävd.`);
    }
    this.#tillstand = Tillstand.AKTIVT;
  }
}
