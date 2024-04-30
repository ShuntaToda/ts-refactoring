import * as fs from "fs";
import { statement } from "./statement";
import { Invoice } from "./types";

function readJSONSync(filePath: any) {
  return JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }));
}

const invoices = readJSONSync("./invoices.json");
const plays = readJSONSync("./plays.json");

invoices.forEach((invoice: Invoice) => {
  console.log(statement(invoice, plays));
});
