// Quick implementation of Knuth shuffle. SeededRNG is a Linear Congruential Generator (LCG)
// with values extracted from Numerical Recipes. This is not a cryptographically secure RNG,
// but it is fast and good enough for our purposes.

class SeededRNG {
  constructor(private seed: number) {}

  private m = Math.pow(2, 32);
  private a = 1664525;
  private c = 1013904223;

  nextFloat(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }
}

const sortBySeed = <T extends any>(array: T[], seed: number): T[] => {
  let rng = new SeededRNG(seed);
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle

  while (0 !== currentIndex) {
    // Pick a remaining element
    randomIndex = Math.floor(rng.nextFloat() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current one
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export default sortBySeed;
