import { Invoice, Performance, Play, Plays } from "./types";

type InvoiceResult = { play: Play; perf: Performance; amount: number };

type StatementResult = {
  invoice: Invoice;
  totalAmount: number;
  volumeCredits: number;
  invoiceResults: InvoiceResult[];
};

const getTragedyAmount = (perf: Performance) => {
  const amount = 40000;
  if (30 < perf.audience) {
    return amount + 1000 * (perf.audience - 30);
  } else {
    return amount;
  }
};

const getComedyAmount = (perf: Performance) => {
  const amount = 30000 + 300 * perf.audience;
  if (20 < perf.audience) {
    return amount + 10000 + 500 * (perf.audience - 20);
  } else {
    return amount;
  }
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

const statementText = (props: StatementResult): string => {
  const { invoice, totalAmount, volumeCredits, invoiceResults } = props;
  const result: string[] = [];
  result.push(`Statement for ${invoice.customer}`);
  invoiceResults.forEach((item) => {
    result.push(`  ${item.play.name}: ${formatUsdCurrency(item.amount / 100)} (${item.perf.audience} seats)`);
  });
  result.push(`Amount owed is ${formatUsdCurrency(totalAmount / 100)}`);
  result.push(`You earned ${volumeCredits} credits`);
  result.push("");
  return result.join("\n");
};

const calcAmount = (invoice: Invoice, plays: Plays): StatementResult => {
  const result: StatementResult = { totalAmount: 0, volumeCredits: 0, invoiceResults: [], invoice };

  invoice.performances.forEach((perf) => {
    const play = plays[perf.playID];
    const amount = getPlayAmount(plays, perf);
    result.volumeCredits += calculateVolumeCredits(perf, plays);
    result.invoiceResults.push({ play, perf, amount });
    result.totalAmount += amount;
  });
  return result;
};
export function statement(invoice: Invoice, plays: Plays): string {
  const result = calcAmount(invoice, plays);
  return statementText(result);
}
