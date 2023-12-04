import * as R from 'ramda';
import { RC } from '../util/ramda_cookbook';
import { readString } from '../util/file';

// ====================
// Parsing

const parseWinningNumbers = gameString => R.pipe(
  R.indexOf(':'),
  R.inc,
  R.splitAt(R.__, gameString),
  R.last,
  R.takeWhile(R.complement(R.equals('|'))),
  R.split(' '),
  R.reject(R.isEmpty),
  R.map(parseInt),
)(gameString);


const parsePlayingNumbers = gameString => R.pipe(
  R.indexOf('|'),
  R.inc,
  R.splitAt(R.__, gameString),
  R.last,
  R.split(' '),
  R.reject(R.isEmpty),
  R.map(parseInt),
)(gameString);

// ====================
// Solving

const parseAmountOfWon = R.pipe(
  R.converge(R.pair, [parseWinningNumbers, parsePlayingNumbers]),
  R.apply(R.intersection),
  R.length,
);

const cardPoints = R.ifElse(
  R.equals(-1),
  R.always(0),
  x => RC.pow(2)(x)
);

/**
 * There is a LOT of copies to make, so for perfomance we might just
 * use good old `for` loops. Also functions won't make it read easier here.
 */
const produceCopies = (amountOfWon) => {
  const allCards = Array(amountOfWon.length).fill(0);

  // As many times as we win for this card
  for (let index = 0; index < amountOfWon.length; index++) {

    // For each already created copy of this card
    for (let copy = 0; copy <= allCards[index]; copy++) {

      // For each card in range from next card after this one and to the amount of won
      for (let i = index + 1; i < index + 1 + amountOfWon[index]; i++) {

        // Increase copy counter
        allCards[i] += 1;
      }
    }
  }

  return allCards;
}

const getSumOfPointsWon = R.pipe(
  R.split('\n'),
  R.map(R.pipe(
    parseAmountOfWon,
    R.dec,
    cardPoints
  )),
  R.sum,
);

const getSumOfPiledUpCards = R.pipe(
  R.split('\n'),
  R.map(parseAmountOfWon),
  produceCopies,
  R.sum
);

export async function day4() {
  const engine = await readString('4/input.txt');

  console.log(
    "Day 4. Part 1. Points won from scratch cards:",
    getSumOfPointsWon(engine)
  );

  console.log(
    "Day 4. Part 2. Scratch cards piled up (wtf elves):",
    getSumOfPiledUpCards(engine)
  );

}