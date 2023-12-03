import * as R from 'ramda';
import { readString } from '../util/file';

const CUBE_LIMITS = {
  red: 12,
  green: 13,
  blue: 14
};

const isRoundValid = round => round.count <= R.prop(round.color, CUBE_LIMITS);

const isDigit = R.both(
  R.gte(R.__, '0'),
  R.lte(R.__, '9')
);

const parseGameID = gameString => R.pipe(
  R.indexOf(':'),
  R.splitAt(R.__, gameString),
  R.head,
  R.takeLastWhile(isDigit),
)(gameString);

const parseCount = R.pipe(
  R.takeWhile(isDigit),
  parseInt
);

const parseColor = R.pipe(
  R.takeLastWhile(R.complement(isDigit)),
  R.trim
);

const parseCubes = R.pipe(
  R.split(','),
  R.map(R.trim),
  R.map(x => ({
    count: parseCount(x),
    color: parseColor(x)
  }))
);

const parseGame = gameStr => {
  const gameID = parseGameID(gameStr);

  const rgbs = R.pipe(
    R.indexOf(':'),
    R.inc,
    R.splitAt(R.__, gameStr),
    R.last,
    R.split(';'),
    R.map(parseCubes)
  )(gameStr);

  const gameAttemptValid = R.pipe(
    R.map(R.all(isRoundValid)),
    R.all(R.equals(true))
  )(rgbs);

  return gameAttemptValid ? gameID : null;
};

const calculateSumOfGameIDs = R.pipe(
  R.split('\n'),
  R.map(parseGame),
  R.reject(R.isNil),
  R.sum
);

// ======================================

/**
 * ### Part 1
 * 
 * As you walk, the Elf shows you a small bag and some cubes which are either red, green, or blue. 
 * Each time you play this game, he will hide a secret number of cubes of each color in the bag, 
 * and your goal is to figure out information about the number of cubes.
 * 
 * To get information, once a bag has been loaded with cubes, the Elf will reach into the bag, 
 * grab a handful of random cubes, show them to you, and then put them back in the bag. 
 * He'll do this a few times per game.
 * 
 * You play several games and record the information from each game (your puzzle input). 
 * Each game is listed with its ID number (like the 11 in Game 11: ...) followed by a semicolon-separated 
 * list of subsets of cubes that were revealed from the bag (like 3 red, 5 green, 4 blue).
 * 
 * For example, the record of a few games might look like this:
 * 
 * ```
 * Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
 * Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
 * Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
 * Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
 * Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
 * ```
 * 
 * In game 1, three sets of cubes are revealed from the bag (and then put back again). 
 * The first set is 3 blue cubes and 4 red cubes; the second set is 1 red cube, 2 green cubes, 
 * and 6 blue cubes; the third set is only 2 green cubes.
 * 
 * The Elf would first like to know which games would have been possible if the bag contained 
 * only 12 red cubes, 13 green cubes, and 14 blue cubes?
 * 
 * In the example above, games 1, 2, and 5 would have been possible if the bag had been loaded 
 * with that configuration. However, game 3 would have been impossible because at one point the 
 * Elf showed you 20 red cubes at once; similarly, game 4 would also have been impossible because 
 * the Elf showed you 15 blue cubes at once. If you add up the IDs of the games that would have 
 * been possible, you get 8.
 * 
 * Determine which games would have been possible if the bag had been loaded with only 12 red cubes, 
 * 13 green cubes, and 14 blue cubes. What is the sum of the IDs of those games?
 */
export async function sumOfIdsOfPossibleGames() {
  const gamesResults = await readString('2/input.txt');

  console.log(
    "Day 2. Part 1. Sum of IDs of possible games:",
    calculateSumOfGameIDs(gamesResults)
  );
}