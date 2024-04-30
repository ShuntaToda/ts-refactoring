import { Invoice, Performance, Plays } from "./types";

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

const getPlayAmount = (plays: Plays, perf: Performance): number => {
  const play = plays[perf.playID];
  switch (play.type) {
    case "tragedy":
      return getTragedyAmount(perf);
    case "comedy":
      return getComedyAmount(perf);
    default:
      throw new Error(`unknown type: ${play.type}`);
  }
};

export function statement(invoice: Invoice, plays: Plays): string {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `Statement for ${invoice.customer}\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    const thisAmount = getPlayAmount(plays, perf);
    // add volume credits
    volumeCredits += Math.max(perf.audience - 30, 0);
    // add extra credit for every ten comedy attendees
    if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

    // print line for this order
    result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`;
    totalAmount += thisAmount;
  }
  result += `Amount owed is ${format(totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits\n`;
  return result;
}
