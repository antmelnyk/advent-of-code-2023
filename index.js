import { day1 } from "./1/solution.js";
import { day2 } from "./2/solution.js";
import { day3 } from "./3/solution.js";
import { day4 } from "./4/solution.js";

const days = [
  day1(),
  day2(),
  day3(),
  day4()
];

await Promise.all(days);