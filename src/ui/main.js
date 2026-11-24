import { createInterface } from 'node:readline';
import { Register } from '../model/index.js';
import { Meny } from './meny.js';

// Startpunkten: kopplar menyn till tangentbord och skärm.
const rl = createInterface({ input: process.stdin });
const rader = rl[Symbol.asyncIterator]();

const io = {
  async fraga(text) {
    process.stdout.write(text);
    const { value, done } = await rader.next();
    if (done) {
      const fel = new Error('Inmatningen tog slut.');
      fel.code = 'SLUT';
      throw fel;
    }
    return value;
  },
  skriv(text) {
    console.log(text);
  },
};

try {
  await new Meny(new Register(), io).kor();
} catch (fel) {
  if (fel.code !== 'SLUT') throw fel;
} finally {
  rl.close();
}
