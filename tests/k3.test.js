// K3 Varianter med olika regler
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Register, RegelFel, Tillstand, Korttyp, KORTTYPER } from '../src/model/index.js';

function kortAvTyp(korttyp) {
  const register = new Register();
  const kund = register.skapaKund('Åsa', 'Forshaga');
  const kort = register.skapaKort(kund.kundnummer, korttyp);
  return { register, kort };
}

test('AK3.1: köp på 19 kr ger ingen stämpel på ett stämpelkort', () => {
  const { register, kort } = kortAvTyp('Stämpelkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 19);
  assert.equal(kort.stamplar, 0);
  assert.equal(kort.poang, 0);
});

test('AK3.1: köp på 20 kr ger en stämpel på ett stämpelkort', () => {
  const { register, kort } = kortAvTyp('Stämpelkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 20);
  assert.equal(kort.stamplar, 1);
});

test('AK3.1: köp på 19 kr ger 19 poäng på ett poängkort', () => {
  const { register, kort } = kortAvTyp('Poängkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 19);
  assert.equal(kort.poang, 19);
  assert.equal(kort.stamplar, 0);
});

test('K3: ett stämpelkort är fullt vid 10 stämplar', () => {
  const { register, kort } = kortAvTyp('Stämpelkort');
  for (let i = 1; i <= 9; i += 1) register.registreraKop(kort.kortnummer, '2026-11-03', 20);
  assert.equal(kort.stamplar, 9);
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
  register.registreraKop(kort.kortnummer, '2026-11-03', 20);
  assert.equal(kort.stamplar, 10);
  assert.equal(kort.tillstand, Tillstand.INLOST);
});

test('K3: ett poängkort är fullt vid 500 poäng', () => {
  const { register, kort } = kortAvTyp('Poängkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 499);
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
  register.registreraKop(kort.kortnummer, '2026-11-04', 1);
  assert.equal(kort.poang, 500);
  assert.equal(kort.tillstand, Tillstand.INLOST);
});

test('AK3.2: korttypen går inte att byta efter att kortet skapats', () => {
  const { kort } = kortAvTyp('Stämpelkort');
  assert.throws(() => { kort.korttyp = null; }, TypeError);
  assert.equal(kort.korttyp.namn, 'Stämpelkort');
});

test('K3: en korttyp som inte finns nekas', () => {
  const register = new Register();
  const kund = register.skapaKund('Åsa', 'Forshaga');
  assert.throws(() => register.skapaKort(kund.kundnummer, 'Guldkort'), RegelFel);
  assert.equal(register.kort.length, 0);
});

test('AK3.3: en tredje korttyp är en ny klass och en registrering', () => {
  // Påhittad korttyp som bara finns i testet: varje köp ger en stämpel, fullt vid 3.
  class Provkort extends Korttyp {
    get namn() { return 'Provkort'; }
    utdelning() { return { stamplar: 1, poang: 0 }; }
    arFullt({ stamplar }) { return stamplar >= 3; }
  }
  KORTTYPER.set('Provkort', Provkort);
  try {
    const { register, kort } = kortAvTyp('Provkort');
    assert.ok(register.korttyper.includes('Provkort'));
    register.registreraKop(kort.kortnummer, '2026-11-03', 5);
    register.registreraKop(kort.kortnummer, '2026-11-03', 5);
    assert.equal(kort.tillstand, Tillstand.AKTIVT);
    register.registreraKop(kort.kortnummer, '2026-11-03', 5);
    assert.equal(kort.stamplar, 3);
    assert.equal(kort.tillstand, Tillstand.INLOST);
  } finally {
    KORTTYPER.delete('Provkort');
  }
});
