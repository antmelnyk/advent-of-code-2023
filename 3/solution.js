import * as R from 'ramda';

import { readString } from '../util/file';
import { indexedReduce, indexedMap, indexedChain } from '../util/ramda';

// ====================
// Filters

const isDigit = R.both(
  R.gte(R.__, '0'),
  R.lte(R.__, '9')
);

const isSymbol = R.allPass([
  R.complement(isDigit),
  R.complement(R.equals('.')),
  R.complement(R.is(Object))
]);

const isGear = R.equals('*');

const onlyNumberNeighbours = R.filter(R.is(Object));

const onlyUniqueNeighbours = R.uniqBy(R.prop('id'));

const newSearchAccumulator = () => ({ value: '', numbers: [] });

// ====================
// Cell

const getCell = (dx, dy) => (x, y) => engine => {
  const newX = R.add(dx, x);
  const newY = R.add(dy, y);
  return R.path([newY, newX], engine);
};

const left = getCell(-1, 0);
const right = getCell(1, 0);
const top = getCell(0, -1);
const bottom = getCell(0, 1);
const leftTop = getCell(-1, -1);
const rightTop = getCell(1, -1);
const leftBottom = getCell(-1, 1);
const rightBottom = getCell(1, 1);

const getNeighbours = R.juxt([
  leftTop, top, rightTop,
  right, rightBottom, bottom,
  leftBottom, left
]);

// ====================
// Symbols in cells

const processCell = (cellPredicate, processNeighbours) => (y, engine) => (cell, x) =>
  R.ifElse(
    () => cellPredicate(cell),
    () => {
      const neighbours = R.juxt(getNeighbours(x, y))(engine);
      return processNeighbours ? processNeighbours(neighbours) : neighbours;
    },
    R.always([])
  )();

const processGearNeighbours = R.pipe(
  onlyNumberNeighbours,
  onlyUniqueNeighbours,
  R.ifElse(
    R.pipe(R.length, R.equals(2)),
    R.identity,
    R.always([])
  )
);

const processGearCell = R.pipe(
  onlyNumberNeighbours,
  R.pluck('value'),
  R.ifElse(
    R.isEmpty,
    R.always(0),
    R.reduce(R.multiply, 1)
  )
);

const findSymbolNeighbours = (engine) =>
  indexedChain((row, y) =>
    indexedMap(processCell(isSymbol, R.identity)(y, engine), row),
    engine
  );

const findGears = (engine) =>
  indexedChain((row, y) =>
    indexedMap(processCell(isGear, processGearNeighbours)(y, engine), row),
    engine
  );

// ====================
// Engine

const searchNumbers = indexedReduce((acc, char, index, arr) => {
  return R.cond([
    // Character is not a digit, flush number in accumulator
    [() => !isDigit(char) && acc.value, () => {
      acc.numbers.push({ index, value: acc.value });
      acc.value = '';
      return acc;
    }],

    // Character is a digit, add it to accumulator
    [() => isDigit(char), () => {
      acc.value += char;

      // If it's the last character in the string, flush number in accumulator
      // since there will be no next character to check
      if (index === arr.length - 1) {
        acc.numbers.push({ index: index + 1, value: acc.value });
        acc.value = '';
      }

      return acc;
    }],

    [R.T, () => acc]
  ])(char);
});

const numerizeEngineLine = (engineLine, lineIndex) => {
  const numbersStr = searchNumbers(newSearchAccumulator(), engineLine);
  let numerizedLine = [...engineLine];

  R.forEach(numberStr => {
    const number = parseInt(numberStr.value);
    const id = `${lineIndex}-${numberStr.index}`;
    const startIndex = numberStr.index - numberStr.value.length;

    R.forEach(i => {
      numerizedLine[i] = { id, value: number };
    }, R.range(startIndex, numberStr.index));
  }, numbersStr.numbers);

  return numerizedLine;
}

const parseEngine = R.pipe(
  R.split('\n'),
  indexedMap(numerizeEngineLine),
);

const getSymbolNeighboursSum = R.pipe(
  findSymbolNeighbours,
  R.flatten,
  onlyNumberNeighbours,
  onlyUniqueNeighbours,
  R.pluck('value'),
  R.sum
);

const getGearRationsSum = R.pipe(
  findGears,
  R.map(processGearCell),
  R.sum
);

// ======================================

const sumOfSymbolNeighbours = R.pipe(
  parseEngine,
  getSymbolNeighboursSum
);

const sumOfGearRatios = R.pipe(
  parseEngine,
  getGearRationsSum
);

/**
 * ### Part 1
 * 
 * The engineer explains that an engine part seems to be missing from the engine, 
 * but nobody can figure out which one. If you can add up all the part numbers in 
 * the engine schematic, it should be easy to work out which part is missing.
 *
 * The engine schematic (your puzzle input) consists of a visual representation 
 * of the engine. There are lots of numbers and symbols you don't really understand, 
 * but apparently any number adjacent to a symbol, even diagonally, is a "part number" 
 * and should be included in your sum. (Periods (.) do not count as a symbol.)
 *
 * Here is an example engine schematic:
 *
 * ```
 * 467..114..
 * ...*......
 * ..35..633.
 * ......#...
 * 617*......
 * .....+.58.
 * ..592.....
 * ......755.
 * ...$.*....
 * .664.598..
 * ```
 * 
 * In this schematic, two numbers are not part numbers because they are not adjacent 
 * to a symbol: 114 (top right) and 58 (middle right). Every other number is adjacent 
 * to a symbol and so is a part number; their sum is 4361.
 *
 * Of course, the actual engine schematic is much larger. What is the sum of all of 
 * the part numbers in the engine schematic?
 *
 * ### Part 2
 *
 * The engineer finds the missing part and installs it in the engine! As the engine 
 * springs to life, you jump in the closest gondola, finally ready to ascend to the 
 * water source.
 *
 * You don't seem to be going very fast, though. Maybe something is still wrong? 
 * Fortunately, the gondola has a phone labeled "help", so you pick it up and the 
 * engineer answers.
 *
 * Before you can explain the situation, she suggests that you look out the window. 
 * There stands the engineer, holding a phone in one hand and waving with the other. 
 * You're going so slowly that you haven't even left the station. You exit the gondola.
 *
 * The missing part wasn't the only issue - one of the gears in the engine is wrong. 
 * A gear is any * symbol that is adjacent to exactly two part numbers. Its gear ratio 
 * is the result of multiplying those two numbers together.
 *
 * This time, you need to find the gear ratio of every gear and add them all up so 
 * that the engineer can figure out which gear needs to be replaced.
 *
 * Consider the same engine schematic again:
 *
 * ```
 * 467..114..
 * ...*......
 * ..35..633.
 * ......#...
 * 617*......
 * .....+.58.
 * ..592.....
 * ......755.
 * ...$.*....
 * .664.598..
 * ```
 * 
 * In this schematic, there are two gears. The first is in the top left; it has part 
 * numbers 467 and 35, so its gear ratio is 16345. The second gear is in the lower 
 * right; its gear ratio is 451490. (The * adjacent to 617 is not a gear because it 
 * is only adjacent to one part number.) Adding up all of the gear ratios produces 467835.
 *
 * What is the sum of all of the gear ratios in your engine schematic?
 */
export async function sumOfAdjacentNumbersInEngine() {
  const engine = await readString('3/input.txt');

  console.log(
    "Day 3. Part 1. Sum of adjacent to symbols numbers in engine:",
    sumOfSymbolNeighbours(engine)
  );

  console.log(
    "Day 3. Part 2. Sum of gear ratios:",
    sumOfGearRatios(engine)
  );
}