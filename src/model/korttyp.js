// K3: korttyperna. En korttyp svarar på två frågor:
//   utdelning(belopp) -> { stamplar, poang }   vad ett köp ger
//   arFullt({ stamplar, poang }) -> boolean     när kortet är fullt
// Kort frågar sin korttyp och innehåller inga egna regler om stämplar eller poäng.

export class Korttyp {
  get namn() { throw new Error('En korttyp måste ha ett namn.'); }
  utdelning(_belopp) { throw new Error('En korttyp måste implementera utdelning(belopp).'); }
  arFullt(_stallning) { throw new Error('En korttyp måste implementera arFullt(stallning).'); }
}

export class Stampelkort extends Korttyp {
  static MINSTA_BELOPP = 20;
  static FULLT_VID = 10;

  get namn() { return 'Stämpelkort'; }
  utdelning(belopp) {
    return { stamplar: belopp >= Stampelkort.MINSTA_BELOPP ? 1 : 0, poang: 0 };
  }
  arFullt({ stamplar }) { return stamplar >= Stampelkort.FULLT_VID; }
}

export class Poangkort extends Korttyp {
  static FULLT_VID = 500;

  get namn() { return 'Poängkort'; }
  utdelning(belopp) { return { stamplar: 0, poang: belopp }; }
  arFullt({ poang }) { return poang >= Poangkort.FULLT_VID; }
}

// Utökningspunkten (AK3.3): en ny korttyp är en ny klass och en rad här.
// Menyn och filinläsningen slår upp korttypen i registret via namnet.
export const KORTTYPER = new Map([
  ['Stämpelkort', Stampelkort],
  ['Poängkort', Poangkort],
]);

export function skapaKorttyp(namn) {
  const Klass = KORTTYPER.get(namn);
  if (!Klass) return null;
  return new Klass();
}
