// K1 Entiteter och tillstånd
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Register, RegelFel, Tillstand } from '../src/model/index.js';

function registerMedKort(korttyp = 'Stämpelkort') {
  const register = new Register();
  const kund = register.skapaKund('Anna', 'Karlstad');
  const kort = register.skapaKort(kund.kundnummer, korttyp);
  return { register, kund, kort };
}

test('K1: en kund har kundnummer, namn och hemort', () => {
  const register = new Register();
  const kund = register.skapaKund('Anna', 'Karlstad');
  assert.equal(kund.kundnummer, 1);
  assert.equal(kund.namn, 'Anna');
  assert.equal(kund.hemort, 'Karlstad');
});

test('K1: en kund utan namn eller hemort nekas', () => {
  const register = new Register();
  assert.throws(() => register.skapaKund('', 'Karlstad'), RegelFel);
  assert.throws(() => register.skapaKund('Anna', '  '), RegelFel);
  assert.equal(register.kunder.length, 0);
});

test('AK1.1: ett nytt kort är Aktivt med 0 stämplar och 0 poäng', () => {
  const { kort } = registerMedKort();
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
  assert.equal(kort.stamplar, 0);
  assert.equal(kort.poang, 0);
});

test('K1: ett köp har löpnummer, datum, belopp och sitt kort', () => {
  const { register, kort } = registerMedKort();
  const kop = register.registreraKop(kort.kortnummer, '2026-11-03', 40);
  assert.equal(kop.lopnummer, 1);
  assert.equal(kop.datum, '2026-11-03');
  assert.equal(kop.belopp, 40);
  assert.equal(kop.kort, kort);
  const nasta = register.registreraKop(kort.kortnummer, '2026-11-04', 25);
  assert.equal(nasta.lopnummer, 2);
});

test('K1: Aktivt kort kan spärras och spärren kan hävas', () => {
  const { kort } = registerMedKort();
  kort.sparra();
  assert.equal(kort.tillstand, Tillstand.SPARRAT);
  kort.havSparr();
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
});

test('AK1.2: köp på Spärrat kort nekas och kortet är oförändrat', () => {
  const { register, kort } = registerMedKort();
  register.registreraKop(kort.kortnummer, '2026-11-03', 40);
  kort.sparra();
  assert.throws(() => register.registreraKop(kort.kortnummer, '2026-11-04', 40), RegelFel);
  assert.equal(kort.tillstand, Tillstand.SPARRAT);
  assert.equal(kort.stamplar, 1);
  assert.equal(kort.kop.length, 1);
  assert.equal(register.kop.length, 1);
});

test('AK1.2: köp på Inlöst kort nekas och kortet är oförändrat', () => {
  const { register, kort } = registerMedKort('Poängkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 500);
  assert.equal(kort.tillstand, Tillstand.INLOST);
  assert.throws(() => register.registreraKop(kort.kortnummer, '2026-11-04', 40), RegelFel);
  assert.equal(kort.tillstand, Tillstand.INLOST);
  assert.equal(kort.poang, 500);
  assert.equal(kort.kop.length, 1);
});

test('AK1.3: kortet blir Inlöst i samma operation som det blir fullt', () => {
  const { register, kort } = registerMedKort();
  for (let i = 1; i <= 9; i += 1) {
    register.registreraKop(kort.kortnummer, '2026-11-03', 40);
  }
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
  register.registreraKop(kort.kortnummer, '2026-11-04', 40);
  assert.equal(kort.tillstand, Tillstand.INLOST);
});

test('AK1.4: Inlöst kort kan varken spärras eller bli Aktivt', () => {
  const { register, kort } = registerMedKort('Poängkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 500);
  assert.throws(() => kort.sparra(), RegelFel);
  assert.throws(() => kort.havSparr(), RegelFel);
  assert.equal(kort.tillstand, Tillstand.INLOST);
});

test('K1: övriga otillåtna övergångar nekas', () => {
  const { kort } = registerMedKort();
  assert.throws(() => kort.havSparr(), RegelFel, 'Aktivt kort har ingen spärr att häva');
  kort.sparra();
  assert.throws(() => kort.sparra(), RegelFel, 'Spärrat kort kan inte spärras igen');
  assert.equal(kort.tillstand, Tillstand.SPARRAT);
});

test('K1: tillståndet går inte att sätta utifrån', () => {
  const { kort } = registerMedKort();
  assert.throws(() => { kort.tillstand = Tillstand.INLOST; }, TypeError);
  assert.equal(kort.tillstand, Tillstand.AKTIVT);
});

test('K1: belopp som inte är hela kronor nekas och kortet är oförändrat', () => {
  const { register, kort } = registerMedKort('Poängkort');
  assert.throws(() => register.registreraKop(kort.kortnummer, '2026-11-03', 19.5), RegelFel);
  assert.throws(() => register.registreraKop(kort.kortnummer, '2026-11-03', -20), RegelFel);
  assert.equal(kort.poang, 0);
  assert.equal(register.kop.length, 0);
});

test('K1: ett datum som inte finns nekas', () => {
  const { register, kort } = registerMedKort();
  assert.throws(() => register.registreraKop(kort.kortnummer, '2026-11-31', 40), RegelFel);
  assert.throws(() => register.registreraKop(kort.kortnummer, '3 november', 40), RegelFel);
  assert.equal(kort.kop.length, 0);
});
