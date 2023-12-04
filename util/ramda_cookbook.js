import * as R from 'ramda';

export const RC = {
  indexedReduce: R.addIndex(R.reduce),
  indexedMap: R.addIndex(R.map),
  indexedChain: R.addIndex(R.chain),

  power: R.reduce(R.multiply, 1),
  pow: R.curry((a, b) => Math.pow(a, b)),
}

