import * as R from 'ramda';

export const indexedReduce = R.addIndex(R.reduce);
export const indexedMap = R.addIndex(R.map);
export const indexedChain = R.addIndex(R.chain);
