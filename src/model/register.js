import { RegelFel } from './fel.js';
import { Kund } from './kund.js';
import { Kort } from './kort.js';
import { KORTTYPER, skapaKorttyp } from './korttyp.js';

// Rotobjektet som ui/, logic/ och storage/ arbetar mot.
// Reglerna i K2 som gäller flera objekt ligger här.
export class Register {
  #kunder = new Map();
  #kort = new Map();
  #kop = [];
  #nastaKundnummer = 1;
  #nastaKortnummer = 101;
  #nastaLopnummer = 1;

  get kunder() { return [...this.#kunder.values()]; }
  get kort() { return [...this.#kort.values()]; }
  get kop() { return [...this.#kop]; }
  get korttyper() { return [...KORTTYPER.keys()]; }

  skapaKund(namn, hemort) {
    const kund = new Kund(this.#nastaKundnummer, namn, hemort);
    this.#kunder.set(kund.kundnummer, kund);
    this.#nastaKundnummer += 1;
    return kund;
  }

  hittaKund(kundnummer) {
    const kund = this.#kunder.get(kundnummer);
    if (!kund) throw new RegelFel(`Kund ${kundnummer} finns inte.`);
    return kund;
  }

  // AK2.1: ett kort kan inte skapas utan en befintlig kund.
  skapaKort(kundnummer, korttypnamn) {
    const kund = this.hittaKund(kundnummer);
    const korttyp = skapaKorttyp(korttypnamn);
    if (!korttyp) throw new RegelFel(`Korttypen ${korttypnamn} finns inte.`);
    const kort = new Kort(this.#nastaKortnummer, kund, korttyp);
    this.#kort.set(kort.kortnummer, kort);
    this.#nastaKortnummer += 1;
    return kort;
  }

  hittaKort(kortnummer) {
    const kort = this.#kort.get(kortnummer);
    if (!kort) throw new RegelFel(`Kort ${kortnummer} finns inte.`);
    return kort;
  }

  kortFor(kundnummer) {
    const kund = this.hittaKund(kundnummer);
    return this.kort.filter((k) => k.kund === kund);
  }

  registreraKop(kortnummer, datum, belopp) {
    const kort = this.hittaKort(kortnummer);
    const kop = kort.registreraKop(this.#nastaLopnummer, datum, belopp);
    this.#kop.push(kop);
    this.#nastaLopnummer += 1;
    return kop;
  }

  sparraKort(kortnummer) { this.hittaKort(kortnummer).sparra(); }
  havSparr(kortnummer) { this.hittaKort(kortnummer).havSparr(); }

  // Kontrakt 3 (AK2.2): en kund som har kort får inte tas bort.
  taBortKund(kundnummer) {
    const kund = this.hittaKund(kundnummer);
    if (this.kort.some((k) => k.kund === kund)) {
      throw new RegelFel(`Kund ${kundnummer} har kort och kan inte tas bort.`);
    }
    this.#kunder.delete(kundnummer);
  }

  // Kontrakt 4 (AK2.3): ett kort som har köp får inte tas bort.
  taBortKort(kortnummer) {
    const kort = this.hittaKort(kortnummer);
    if (kort.kop.length > 0) {
      throw new RegelFel(`Kort ${kortnummer} har köp och kan inte tas bort.`);
    }
    this.#kort.delete(kortnummer);
  }
}
