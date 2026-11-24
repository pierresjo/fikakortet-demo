// K1: ett köp har löpnummer, datum (ÅÅÅÅ-MM-DD), belopp i hela kronor och sitt kort.
// Köp skapas bara av Kort.registreraKop, som har kontrollerat reglerna.
export class Kop {
  #lopnummer;
  #datum;
  #belopp;
  #kort;

  constructor(lopnummer, datum, belopp, kort) {
    this.#lopnummer = lopnummer;
    this.#datum = datum;
    this.#belopp = belopp;
    this.#kort = kort;
  }

  get lopnummer() { return this.#lopnummer; }
  get datum() { return this.#datum; }
  get belopp() { return this.#belopp; }
  get kort() { return this.#kort; }
}
