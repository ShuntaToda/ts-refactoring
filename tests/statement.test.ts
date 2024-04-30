import { statement } from "../statement";
import * as fs from "fs";

function readJSONSync(filePath: any) {
  return JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }));
}

const invoices = readJSONSync("./invoices.json");
const plays = readJSONSync("./plays.json");

describe("statement", () => {
  test("正常系", () => {
    const actual = statement(invoices[0], plays);
    const expected = `Statement for BigCo\n  Hamlet: $650.00 (55 seats)\n  As You Like It: $580.00 (35 seats)\n  Othello: $500.00 (40 seats)\nAmount owed is $1,730.00\nYou earned 47 credits\n`;

    expect(actual).toBe(expected);
  });
});
