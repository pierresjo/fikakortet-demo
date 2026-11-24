// Hjälp för testerna: en låtsaskassör som matar menyn med rader och samlar utskrifterna.
import { Meny } from '../src/ui/meny.js';

export async function korMeny(register, rader) {
  const ko = [...rader];
  const ut = [];
  const io = {
    async fraga(text) {
      ut.push(text);
      if (ko.length === 0) throw new Error('Testet har slut på inmatning.');
      return ko.shift();
    },
    skriv(text) {
      ut.push(text);
    },
  };
  await new Meny(register, io).kor();
  return ut.join('\n');
}

export function antalMenyvisningar(utskrift) {
  return utskrift.split('FIKAKORTET').length - 1;
}
