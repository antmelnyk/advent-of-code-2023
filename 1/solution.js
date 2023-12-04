import * as R from 'ramda';
import { readString } from '../util/file';

// ====================
// Digits

const DIGITS = [
  '_',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
];

const isDigit = R.both(
  R.gte(R.__, '1'),
  R.lte(R.__, '9')
);

const getWordByNumber = R.pipe(
  parseInt,
  R.nth(R.__, DIGITS)
);

const getNumberByWord = R.flip(R.indexOf)(DIGITS);

// ====================
// Search

/**
 * `words` contains list of all string that currently
 * are forming as digit words at the index position.
 */
const newSearchAccumulator = () => ({ index: 0, words: [] });

const matchesDigitWord = string => R.any(R.startsWith(string), DIGITS);
const isDigitWord = string => R.any(R.equals(string), DIGITS);

/**
 * While we iterate over characters, we keep track of all digit words (`one`, `two`, etc.)
 * that started to form at previous iterations.
 * 
 * We keep adding next character to each forming word, and we keep storing it while
 * it matches possible digit: `f`, `fo`, `fou`, `four`.
 * 
 * When it doesn't match (e.g. instead `fou` we got `fox`), we drop the word.
 * 
 * Doing this we will eventually end up with a digit word inside the array.
 * If next char is a digit already, just add it to array as a new word.
*/
const reduceCharToDigitWordAccumulator = (accumulator, char, index) => R.cond([
  [isDigit, R.always({
    index,
    words: [getWordByNumber(char)]
  })],

  [R.T, R.always({
    index,
    words: R.pipe(
      R.map(word => word + char),
      R.filter(matchesDigitWord),
      R.append(char)
    )(accumulator.words)
  })]
])(char);

const isNotDigitWord = R.complement(
  R.pipe(
    R.prop('words'),
    R.any(isDigitWord)
  )
);

/**
 * Adding index to `reduceWhile` function requires calling `addIndex`
 * only after partially applying first argument.
 */
const searchUntilWordFound = R.addIndex(R.reduceWhile(isNotDigitWord));

/**
 * Reduce string to array of potential digit words
 * until at least one of them is actually a word.
 */
const searchDigitWord = searchUntilWordFound(
  reduceCharToDigitWordAccumulator,
  newSearchAccumulator()
);

const nextDigitString = index => R.pipe(
  R.splitAt(index + 1),
  R.last
);

/**
 * Recursive function that keeps iterating string until digit word is found.
 * Then it saves it to accumulator, splits the string to remove the part we already
 * checked, and calls itself again with the rest of the string.
 */
const getDigitsWordsFromString = (string, accumulatedWords = []) => R.cond([
  [R.isEmpty, () => accumulatedWords],

  [R.T, () => {
    const searchAccumulator = searchDigitWord(string);
    const newAccumulatedWords = R.concat(
      accumulatedWords,
      R.filter(isDigitWord, searchAccumulator.words)
    );

    const nextIndex = searchAccumulator.index === 0 ? 0 : searchAccumulator.index - 1;
    const secondPartOfString = nextDigitString(nextIndex)(string);

    return getDigitsWordsFromString(secondPartOfString, newAccumulatedWords);
  }]
])(string);

const getFirstAndLastDigitsAsNumber = R.pipe(
  R.juxt([
    R.pipe(R.head, getNumberByWord),
    R.pipe(R.last, getNumberByWord)
  ]),
  R.join(''),
  parseInt
);

const rowsSum = R.pipe(
  R.split('\n'),
  R.map(getDigitsWordsFromString),
  R.map(getFirstAndLastDigitsAsNumber),
  R.sum
);

// ======================================

/**
 * ### Part 1:
 * The newly-improved calibration document consists of lines of text; each line originally contained a specific calibration value that the Elves now need to recover. On each line, the calibration value can be found by combining the first digit and the last digit (in that order) to form a single two-digit number.
 * 
 * For example:
 * 
 * ```
 * 1abc2
 * pqr3stu8vwx
 * a1b2c3d4e5f
 * treb7uchet
 * ```
 * 
 * In this example, the calibration values of these four lines are 12, 38, 15, and 77. Adding these together produces 142.
 * Consider your entire calibration document.
 * What is the sum of all of the calibration values?
 * 
 * ### Part 2:
 * It looks like some of the digits are actually spelled out with letters: one, two, three, four, five, six, seven, eight, and nine also count as valid "digits".
 * 
 * Equipped with this new information, you now need to find the real first and last digit on each line. For example:
 * 
 * ```
 * two1nine
 * eightwothree
 * abcone2threexyz
 * xtwone3four
 * 4nineeightseven2
 * zoneight234
 * 7pqrstsixteen
 * ```
 * 
 * In this example, the calibration values are 29, 83, 13, 24, 42, 14, and 76. Adding these together produces 281.
 * What is the sum of all of the calibration values?
 */
export async function day1() {
  const calibrationDocument = await readString('1/input.txt');

  console.log(
    "Day 1 (same solution for both parts). Calibration sum:",
    rowsSum(calibrationDocument)
  );
}

