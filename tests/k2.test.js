// K2 Relationer och integritet
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Register, RegelFel } from '../src/model/index.js';

test('K2: ett kort tillhör exakt en kund', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  const kort = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  assert.equal(kort.kund, anna);
});

test('AK2.1: kort för en kund som inte finns nekas', () => {
  const register = new Register();
  assert.throws(() => register.skapaKort(7, 'Stämpelkort'), RegelFel);
  assert.equal(register.kort.length, 0);
});

test('K2: en kund kan ha flera kort och bara sina egna visas', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  const bo = register.skapaKund('Bo', 'Kil');
  const a1 = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  const a2 = register.skapaKort(anna.kundnummer, 'Poängkort');
  register.skapaKort(bo.kundnummer, 'Stämpelkort');
  assert.deepEqual(register.kortFor(anna.kundnummer), [a1, a2]);
});

test('K2: kortnummer är unika', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  const a1 = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  const a2 = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  assert.notEqual(a1.kortnummer, a2.kortnummer);
});

test('AK2.2: en kund som har kort kan inte tas bort', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  register.skapaKort(anna.kundnummer, 'Stämpelkort');
  assert.throws(() => register.taBortKund(anna.kundnummer), RegelFel);
  assert.equal(register.kunder.length, 1);
});

test('K2: en kund utan kort kan tas bort', () => {
  const register = new Register();
  const bo = register.skapaKund('Bo', 'Kil');
  register.taBortKund(bo.kundnummer);
  assert.equal(register.kunder.length, 0);
});

test('AK2.3: ett kort som har köp kan inte tas bort', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  const kort = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  register.registreraKop(kort.kortnummer, '2026-11-03', 40);
  assert.throws(() => register.taBortKort(kort.kortnummer), RegelFel);
  assert.equal(register.kort.length, 1);
});

test('K2: ett kort utan köp kan tas bort, och sedan kunden', () => {
  const register = new Register();
  const anna = register.skapaKund('Anna', 'Karlstad');
  const kort = register.skapaKort(anna.kundnummer, 'Stämpelkort');
  register.taBortKort(kort.kortnummer);
  register.taBortKund(anna.kundnummer);
  assert.equal(register.kort.length, 0);
  assert.equal(register.kunder.length, 0);
});

test('K2: ett köp hör till ett kort som finns', () => {
  const register = new Register();
  assert.throws(() => register.registreraKop(999, '2026-11-03', 40), RegelFel);
  assert.equal(register.kop.length, 0);
});
