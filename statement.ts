import { Invoice, Performance, Plays } from "./types";

type StatementResult = {
  invoice: Invoice;
  totalAmount: number;
  volumeCredits: number;
  invoiceText: string;
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
  const { invoice, totalAmount, volumeCredits, invoiceText } = props;
  let result = `Statement for ${invoice.customer}\n`;
  result += invoiceText;
  result += `Amount owed is ${formatUsdCurrency(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
};

const statement2 = (invoice: Invoice, plays: Plays): StatementResult => {
  let totalAmount = 0;
  let volumeCredits = 0;
  let invoiceText = "";

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const thisAmount = getPlayAmount(plays, perf);
    volumeCredits = calculateVolumeCredits(volumeCredits, perf, plays);
    invoiceText += `  ${play.name}: ${formatUsdCurrency(thisAmount / 100)} (${perf.audience} seats)\n`;
    totalAmount += thisAmount;
  }
  return { invoice, totalAmount, volumeCredits, invoiceText };
};
export function statement(invoice: Invoice, plays: Plays): string {
  const result = statement2(invoice, plays);
  return statementText(result);
}
