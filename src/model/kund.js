import { RegelFel } from './fel.js';

// K1: en kund har kundnummer, namn och hemort.
export class Kund {
  #kundnummer;
  #namn;
  #hemort;

  constructor(kundnummer, namn, hemort) {
    if (!Number.isInteger(kundnummer) || kundnummer < 1) {
      throw new RegelFel('Kundnumret ska vara ett positivt heltal.');
    }
    const n = String(namn ?? '').trim();
    const h = String(hemort ?? '').trim();
    if (n === '') throw new RegelFel('Kundens namn får inte vara tomt.');
    if (h === '') throw new RegelFel('Kundens hemort får inte vara tom.');
    this.#kundnummer = kundnummer;
    this.#namn = n;
    this.#hemort = h;
  }

  get kundnummer() { return this.#kundnummer; }
  get namn() { return this.#namn; }
  get hemort() { return this.#hemort; }
}
