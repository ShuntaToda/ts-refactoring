export type Invoice = {
  customer: string;
  performances: {
    playID: string;
    audience: number;
  }[];
};
