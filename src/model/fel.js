// Fel som modellen kastar när en regel ur K1–K3 bryts.
// Gränssnittet fångar felet och visar meddelandet; det tolkar inte regeln.
export class RegelFel extends Error {
  constructor(meddelande) {
    super(meddelande);
    this.name = 'RegelFel';
  }
}
