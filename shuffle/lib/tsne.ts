// https://gist.github.com/LeonErath/687a4d2ede10b6b702c02cab9a05322f

interface Options {
  perplexity?: number;
  epsilon?: number;
  dim?: number;
}

export class TSNE {
  private perplexity: number;
  private epsilon: number;
  private dim: number;
  private iter: number = 0;

  constructor({ perplexity = 30, epsilon = 10, dim = 2 }: Options) {
    this.perplexity = perplexity;
    this.epsilon = epsilon;
    this.dim = dim;
  }

  private assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw message || "Assertion failed";
    }
  };

  private alreadyRunGaussRandom = false;
  private previousValue = 0.0;

  private gaussRandom = (): number => {
    if (this.alreadyRunGaussRandom) {
      this.alreadyRunGaussRandom = false;
      return this.previousValue;
    }
    let u = 2 * Math.random() - 1;
    let v = 2 * Math.random() - 1;
    let r = u * u + v * v;
    if (r == 0 || r > 1) return this.gaussRandom();
    let c = Math.sqrt((-2 * Math.log(r)) / r);
    this.previousValue = v * c; // cache this for next function call for efficiency
    this.alreadyRunGaussRandom = true;
    return u * c;
  };

  // return random normal number
  private randn = (mu: number, std: number) => {
    return mu + this.gaussRandom() * std;
  };

  // utilitity that creates contiguous vector of zeros of size n
  private zeros = (n: number): number[] => {
    if (typeof n === "undefined" || isNaN(n)) {
      return [];
    }

    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = 0;
    }
    return arr;
  };

  // utility that returns 2d array filled with random numbers
  // or with value s, if provided
  private randn2d = (n: number, d: number, s?: number): number[][] => {
    const isNotUndefined = typeof s !== "undefined";
    const x: number[][] = [];
    for (let i = 0; i < n; i++) {
      const xhere: number[] = [];
      for (let j = 0; j < d; j++) {
        if (isNotUndefined) {
          xhere.push(s);
        } else {
          xhere.push(this.randn(0.0, 1e-4));
        }
      }
      x.push(xhere);
    }
    return x;
  };

  // compute L2 distance between two vectors
  private L2 = (x1: number[], x2: number[]) => {
    let D = x1.length;
    let d = 0;
    for (let i = 0; i < D; i++) {
      let x1i = x1[i];
      let x2i = x2[i];
      d += (x1i - x2i) * (x1i - x2i);
    }
    return d;
  };

  // compute pairwise distance in all vectors in X
  private xtod = (X: number[][]) => {
    let N = X.length;
    let dist = this.zeros(N * N); // allocate contiguous array
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        let d = this.L2(X[i], X[j]);
        dist[i * N + j] = d;
        dist[j * N + i] = d;
      }
    }
    return dist;
  };

  // compute (p_{i|j} + p_{j|i})/(2n)
  private d2p = (D: number[], perplexity: number, tol: number) => {
    let Nf = Math.sqrt(D.length); // this better be an integer
    let N = Math.floor(Nf);
    this.assert(N === Nf, "D should have square number of elements.");
    let Htarget = Math.log(perplexity); // target entropy of distribution
    let P = this.zeros(N * N); // temporary probability matrix

    let prow = this.zeros(N); // a temporary storage compartment
    for (let i = 0; i < N; i++) {
      let betamin = -Infinity;
      let betamax = Infinity;
      let beta = 1; // initial value of precision
      let done = false;
      let maxtries = 50;

      // perform binary search to find a suitable precision beta
      // so that the entropy of the distribution is appropriate
      let num = 0;
      while (!done) {
        //debugger;

        // compute entropy and kernel row with beta precision
        let psum = 0.0;
        for (let j = 0; j < N; j++) {
          let pj = Math.exp(-D[i * N + j] * beta);
          if (i === j) {
            pj = 0;
          } // we dont care about diagonals
          prow[j] = pj;
          psum += pj;
        }
        // normalize p and compute entropy
        let Hhere = 0.0;
        let pj = 0;
        for (let j = 0; j < N; j++) {
          if (psum == 0) {
            pj = 0;
          } else {
            pj = prow[j] / psum;
          }
          prow[j] = pj;
          if (pj > 1e-7) Hhere -= pj * Math.log(pj);
        }

        // adjust beta based on result
        if (Hhere > Htarget) {
          // entropy was too high (distribution too diffuse)
          // so we need to increase the precision for more peaky distribution
          betamin = beta; // move up the bounds
          if (betamax === Infinity) {
            beta = beta * 2;
          } else {
            beta = (beta + betamax) / 2;
          }
        } else {
          // converse case. make distrubtion less peaky
          betamax = beta;
          if (betamin === -Infinity) {
            beta = beta / 2;
          } else {
            beta = (beta + betamin) / 2;
          }
        }

        // stopping conditions: too many tries or got a good precision
        num++;
        if (Math.abs(Hhere - Htarget) < tol) {
          done = true;
        }
        if (num >= maxtries) {
          done = true;
        }
      }

      // console.log('data point ' + i + ' gets precision ' + beta + ' after ' + num + ' binary search steps.');
      // copy over the final prow to P at row i
      for (let j = 0; j < N; j++) {
        P[i * N + j] = prow[j];
      }
    } // end loop over examples i

    // symmetrize P and normalize it to sum to 1 over all ij
    let Pout = this.zeros(N * N);
    let N2 = N * 2;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        Pout[i * N + j] = Math.max((P[i * N + j] + P[j * N + i]) / N2, 1e-100);
      }
    }

    return Pout;
  };

  // helper function
  private sign = (x: number) => {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  };

  private N: number = 0;
  private P: number[] = [];
  private Y: number[][] = [];
  private gains: number[][] = [];
  private ystep: number[][] = [];

  public initDataRaw = (X: number[][]) => {
    let N = X.length;
    let D = X[0].length;
    this.assert(N > 0, " X is empty? You must have some data!");
    this.assert(D > 0, " X[0] is empty? Where is the data?");
    let dists = this.xtod(X); // convert X to distances using gaussian kernel
    this.P = this.d2p(dists, this.perplexity, 1e-4); // attach to object
    this.N = N; // back up the size of the dataset
    this.initSolution(); // refresh this
  };

  // this function takes a given distance matrix and creates
  // matrix P from them.
  // D is assumed to be provided as a list of lists, and should be symmetric
  public initDataDist = (D: number[][]) => {
    let N = D.length;
    this.assert(N > 0, " X is empty? You must have some data!");
    // convert D to a (fast) typed array version
    let dists = this.zeros(N * N); // allocate contiguous array
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        let d = D[i][j];
        dists[i * N + j] = d;
        dists[j * N + i] = d;
      }
    }
    this.P = this.d2p(dists, this.perplexity, 1e-4);
    this.N = N;
    this.initSolution(); // refresh this
  };

  // (re)initializes the solution to random
  public initSolution = () => {
    // generate random solution to t-SNE
    this.Y = this.randn2d(this.N, this.dim); // the solution
    this.gains = this.randn2d(this.N, this.dim, 1.0); // step gains to accelerate progress in unchanging directions
    this.ystep = this.randn2d(this.N, this.dim, 0.0); // momentum accumulator
    this.iter = 0;
  };

  public getSolution = () => {
    return this.Y;
  };

  // perform a single step of optimization to improve the embedding
  public step = () => {
    this.iter += 1;
    let N = this.N;

    let cg = this.costGrad(this.Y); // evaluate gradient
    let cost = cg.cost;
    let grad = cg.grad;

    // perform gradient step
    let ymean = this.zeros(this.dim);
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        let gid = grad[i][d];
        let sid = this.ystep[i][d];
        let gainid = this.gains[i][d];

        // compute gain update
        let newgain =
          this.sign(gid) === this.sign(sid) ? gainid * 0.8 : gainid + 0.2;
        if (newgain < 0.01) newgain = 0.01; // clamp
        this.gains[i][d] = newgain; // store for next turn

        // compute momentum step direction
        let momval = this.iter < 250 ? 0.5 : 0.8;
        let newsid = momval * sid - this.epsilon * newgain * grad[i][d];
        this.ystep[i][d] = newsid; // remember the step we took

        // step!
        this.Y[i][d] += newsid;

        ymean[d] += this.Y[i][d]; // accumulate mean so that we can center later
      }
    }

    // reproject Y to be zero mean
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        this.Y[i][d] -= ymean[d] / N;
      }
    }

    //if(this.iter%100===0) console.log('iter ' + this.iter + ', cost: ' + cost);
    return cost; // return current cost
  };

  public debugGrad = () => {
    let N = this.N;

    let cg = this.costGrad(this.Y); // evaluate gradient
    let cost = cg.cost;
    let grad = cg.grad;

    let e = 1e-5;
    for (let i = 0; i < N; i++) {
      for (let d = 0; d < this.dim; d++) {
        let yold = this.Y[i][d];

        this.Y[i][d] = yold + e;
        let cg0 = this.costGrad(this.Y);

        this.Y[i][d] = yold - e;
        let cg1 = this.costGrad(this.Y);

        let analytic = grad[i][d];
        let numerical = (cg0.cost - cg1.cost) / (2 * e);
        console.log(
          i +
            "," +
            d +
            ": gradcheck analytic: " +
            analytic +
            " vs. numerical: " +
            numerical,
        );

        this.Y[i][d] = yold;
      }
    }
  };

  // return cost and gradient, given an arrangement
  public costGrad = (Y: number[][]) => {
    let N = this.N;
    let dim = this.dim; // dim of output space
    let P = this.P;

    let pmul = this.iter < 100 ? 4 : 1; // trick that helps with local optima

    // compute current Q distribution, unnormalized first
    let Qu = this.zeros(N * N);
    let qsum = 0.0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        let dsum = 0.0;
        for (let d = 0; d < dim; d++) {
          let dhere = Y[i][d] - Y[j][d];
          dsum += dhere * dhere;
        }
        let qu = 1.0 / (1.0 + dsum); // Student t-distribution
        Qu[i * N + j] = qu;
        Qu[j * N + i] = qu;
        qsum += 2 * qu;
      }
    }
    // normalize Q distribution to sum to 1
    let NN = N * N;
    let Q = this.zeros(NN);
    for (let q = 0; q < NN; q++) {
      Q[q] = Math.max(Qu[q] / qsum, 1e-100);
    }

    let cost = 0.0;
    let grad = [];
    for (let i = 0; i < N; i++) {
      let gsum = new Array(dim); // init grad for point i
      for (let d = 0; d < dim; d++) {
        gsum[d] = 0.0;
      }
      for (let j = 0; j < N; j++) {
        cost += -P[i * N + j] * Math.log(Q[i * N + j]); // accumulate cost (the non-constant portion at least...)
        let premult = 4 * (pmul * P[i * N + j] - Q[i * N + j]) * Qu[i * N + j];
        for (let d = 0; d < dim; d++) {
          gsum[d] += premult * (Y[i][d] - Y[j][d]);
        }
      }
      grad.push(gsum);
    }

    return { cost: cost, grad: grad };
  };
}
