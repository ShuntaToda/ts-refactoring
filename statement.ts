import { Invoice, Performance, Play, Plays } from "./types";

type InvoiceResult = { play: Play; perf: Performance; amount: number };

type StatementResult = {
  invoice: Invoice;
  totalAmount: number;
  volumeCredits: number;
  invoiceArray: InvoiceResult[];
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

const calculateVolumeCredits = (volumeCredits: number, perf: Performance, plays: Plays): number => {
  const play = plays[perf.playID];
  volumeCredits += Math.max(perf.audience - 30, 0);
  // add extra credit for every ten comedy attendees
  if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);
  return volumeCredits;
};

const statementText = (props: StatementResult) => {
  const { invoice, totalAmount, volumeCredits, invoiceArray } = props;
  let result = `Statement for ${invoice.customer}\n`;
  invoiceArray.forEach((item) => {
    result += `  ${item.play.name}: ${formatUsdCurrency(item.amount / 100)} (${item.perf.audience} seats)\n`;
  });
  result += `Amount owed is ${formatUsdCurrency(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
};

const calcAmount = (invoice: Invoice, plays: Plays): StatementResult => {
  let totalAmount = 0;
  let volumeCredits = 0;
  let invoiceArray = [];

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const amount = getPlayAmount(plays, perf);
    volumeCredits = calculateVolumeCredits(volumeCredits, perf, plays);
    invoiceArray.push({ play, perf, amount });
    totalAmount += amount;
  }
  return { invoice, totalAmount, volumeCredits, invoiceArray };
};
export function statement(invoice: Invoice, plays: Plays): string {
  const result = calcAmount(invoice, plays);
  return statementText(result);
}
