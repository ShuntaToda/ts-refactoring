import { Invoice, Performance, Play, Plays } from "./types";

type InvoiceResult = { play: Play; perf: Performance; amount: number };

type StatementResult = {
  invoice: Invoice;
  totalAmount: number;
  volumeCredits: number;
  invoiceResults: InvoiceResult[];
};

const getTragedyAmount = (perf: Performance) => {
  let thisAmount = 40000;
  if (perf.audience > 30) {
    thisAmount += 1000 * (perf.audience - 30);
  }
  return thisAmount;
};

const getComedyAmount = (perf: Performance) => {
  let thisAmount2 = 30000;
  if (perf.audience > 20) {
    thisAmount2 += 10000 + 500 * (perf.audience - 20);
  }
  thisAmount2 += 300 * perf.audience;
  return thisAmount2;
};
const getAmountLogics: {
  [key: string]: (perf: Performance) => number;
} = {};
getAmountLogics["tragedy"] = getTragedyAmount;
getAmountLogics["comedy"] = getComedyAmount;

const getPlayAmount = (plays: Plays, perf: Performance): number => {
  const play = plays[perf.playID];
  const getAmount = getAmountLogics[play.type];
  if (getAmount === undefined) throw new Error(`unknown type: ${play.type}`);
  return getAmount(perf);
};

const formatUsdCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
}).format;

const calculateVolumeCredits = (perf: Performance, plays: Plays): number => {
  const play = plays[perf.playID];
  const volumeCredits = Math.max(perf.audience - 30, 0);
  if ("comedy" === play.type) {
    // add extra credit for every ten comedy attendees
    return volumeCredits + Math.floor(perf.audience / 5);
  } else {
    // other attendees
    return volumeCredits;
  }
};

const statementText = (props: StatementResult) => {
  const { invoice, totalAmount, volumeCredits, invoiceResults } = props;
  let result = `Statement for ${invoice.customer}\n`;
  invoiceResults.forEach((item) => {
    result += `  ${item.play.name}: ${formatUsdCurrency(item.amount / 100)} (${item.perf.audience} seats)\n`;
  });
  result += `Amount owed is ${formatUsdCurrency(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
};

const calcAmount = (invoice: Invoice, plays: Plays): StatementResult => {
  const result: StatementResult = { totalAmount: 0, volumeCredits: 0, invoiceResults: [], invoice };

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const amount = getPlayAmount(plays, perf);
    result.volumeCredits += calculateVolumeCredits(perf, plays);
    result.invoiceResults.push({ play, perf, amount });
    result.totalAmount += amount;
  }
  return result;
};
export function statement(invoice: Invoice, plays: Plays): string {
  const result = calcAmount(invoice, plays);
  return statementText(result);
}
