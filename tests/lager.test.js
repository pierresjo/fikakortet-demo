// Statiska tester av modulindelningen (AK6.3 och designens avsnitt om moduler).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function filer(katalog) {
  return readdirSync(join(SRC, katalog))
    .filter((namn) => namn.endsWith('.js'))
    .map((namn) => ({ namn: `${katalog}/${namn}`, text: readFileSync(join(SRC, katalog, namn), 'utf8') }));
}

function importer(text) {
  return [...text.matchAll(/^\s*(?:import|export)\b[^'"\n]*from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
}

function utanKommentarerOchStrangar(text) {
  return text
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

test('model/ importerar bara från model/', () => {
  for (const fil of filer('model')) {
    for (const mal of importer(fil.text)) {
      assert.match(mal, /^\.\/[a-z]+\.js$/, `${fil.namn} importerar ${mal}`);
    }
  }
});

test('AK6.3: ui/ importerar inte modellens inre filer, bara model/index.js', () => {
  for (const fil of filer('ui')) {
    for (const mal of importer(fil.text)) {
      const tillaten = mal.startsWith('node:') || mal.startsWith('./') ||
        mal === '../model/index.js' || mal.startsWith('../logic/') || mal.startsWith('../storage/');
      assert.ok(tillaten, `${fil.namn} importerar ${mal}`);
    }
  }
});

test('AK6.3: ui/ innehåller inga regelkonstanter ur K3 (10, 20, 500)', () => {
  for (const fil of filer('ui')) {
    const kod = utanKommentarerOchStrangar(fil.text);
    for (const tal of ['10', '20', '500']) {
      assert.doesNotMatch(kod, new RegExp(`(?<![\\w.])${tal}(?![\\w.])`), `${fil.namn} innehåller talet ${tal}`);
    }
  }
});

test('AK6.3: ui/ jämför inte tillstånd och ändrar inte stämplar eller poäng', () => {
  for (const fil of filer('ui')) {
    const kod = utanKommentarerOchStrangar(fil.text);
    assert.doesNotMatch(kod, /Tillstand\b/, `${fil.namn} använder Tillstand`);
    assert.doesNotMatch(kod, /\.(stamplar|poang|tillstand)\s*(=[^=]|\+=|-=)/, `${fil.namn} ändrar kortets ställning`);
  }
});
