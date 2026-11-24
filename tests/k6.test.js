// K6 Gränssnitt: menyskelettet (backloggpost #4)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Register, Tillstand } from '../src/model/index.js';
import { korMeny, antalMenyvisningar } from './hjalp.js';

test('AK6.1: menyn visar alla operationer i K6', async () => {
  const ut = await korMeny(new Register(), ['0']);
  for (const rad of ['Skapa kund', 'Skapa kort', 'Registrera köp', 'Spärra kort', 'Häv spärr',
    'Visa en kunds kort', 'Visa månadsrapport', 'Spara', 'Öppna', 'Avsluta']) {
    assert.ok(ut.includes(rad), `menyn saknar ${rad}`);
  }
});

test('K6: skapa kund och skapa kort går via menyn', async () => {
  const register = new Register();
  const ut = await korMeny(register, ['1', 'Anna', 'Karlstad', '2', '1', '1', '0']);
  assert.equal(register.kunder.length, 1);
  assert.equal(register.kort.length, 1);
  assert.equal(register.kort[0].korttyp.namn, 'Stämpelkort');
  assert.ok(ut.includes('Kund 1 skapad: Anna, Karlstad.'));
  assert.ok(ut.includes('Kort 101 (Stämpelkort) skapat för Anna.'));
});

test('K6: registrera köp via menyn ger stämpel och visar kortet', async () => {
  const register = new Register();
  const ut = await korMeny(register,
    ['1', 'Anna', 'Karlstad', '2', '1', '1', '3', '101', '2026-11-03', '40', '0']);
  assert.equal(register.kop.length, 1);
  assert.equal(register.kort[0].stamplar, 1);
  assert.ok(ut.includes('Köp 1 registrerat: 40 kr på kort 101.'));
});

test('K6: spärra och häv spärr via menyn', async () => {
  const register = new Register();
  await korMeny(register, ['1', 'Anna', 'Karlstad', '2', '1', '1', '4', '101', '0']);
  assert.equal(register.kort[0].tillstand, Tillstand.SPARRAT);
  await korMeny(register, ['5', '101', '0']);
  assert.equal(register.kort[0].tillstand, Tillstand.AKTIVT);
});

test('K6: visa en kunds kort listar korten med tillstånd, stämplar och poäng', async () => {
  const register = new Register();
  const ut = await korMeny(register,
    ['1', 'Anna', 'Karlstad', '2', '1', '1', '2', '1', '2', '6', '1', '0']);
  assert.ok(ut.includes('Kort för Anna (kund 1):'));
  assert.ok(ut.includes('Kort 101  Stämpelkort  Aktivt  stämplar: 0  poäng: 0'));
  assert.ok(ut.includes('Kort 102  Poängkort  Aktivt  stämplar: 0  poäng: 0'));
});

test('AK6.2: bokstäver där ett tal väntas ger felmeddelande och åter till menyn', async () => {
  const register = new Register();
  const ut = await korMeny(register, ['2', 'abc', '0']);
  assert.ok(ut.includes('Fel: Kundnumret ska skrivas med siffror.'));
  assert.equal(antalMenyvisningar(ut), 2);
  assert.equal(register.kort.length, 0);
});

test('AK6.2: okänt kundnummer ger felmeddelande och åter till menyn', async () => {
  const register = new Register();
  const ut = await korMeny(register, ['2', '7', '0']);
  assert.ok(ut.includes('Fel: Kund 7 finns inte.'));
  assert.equal(antalMenyvisningar(ut), 2);
});

test('AK6.2: okänt kortnummer ger felmeddelande och åter till menyn', async () => {
  const register = new Register();
  const ut = await korMeny(register, ['3', '999', '0']);
  assert.ok(ut.includes('Fel: Kort 999 finns inte.'));
  assert.equal(antalMenyvisningar(ut), 2);
});

test('K6: ett regelbrott visas som felmeddelande och programmet fortsätter', async () => {
  const register = new Register();
  const ut = await korMeny(register,
    ['1', 'Anna', 'Karlstad', '2', '1', '1', '4', '101', '3', '101', '2026-11-03', '40', '0']);
  assert.ok(ut.includes('Fel: Kort 101 är Spärrat och kan inte ta emot köp.'));
  assert.equal(register.kop.length, 0);
});

test('K6: ett val utanför menyn ger felmeddelande', async () => {
  const ut = await korMeny(new Register(), ['x', '0']);
  assert.ok(ut.includes('Fel: välj en siffra ur menyn.'));
  assert.equal(antalMenyvisningar(ut), 2);
});

test('K6: månadsrapport, spara och öppna svarar att de inte är implementerade', async () => {
  const ut = await korMeny(new Register(), ['7', '8', '9', '0']);
  assert.equal(ut.split('Ej implementerad än.').length - 1, 3);
});

test('K6: avsluta stänger programmet', async () => {
  const ut = await korMeny(new Register(), ['0']);
  assert.ok(ut.endsWith('Hej då!'));
});
