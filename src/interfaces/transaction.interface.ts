export interface Transfer {
  key: string;
  amount: string;
  from: string;
  memo: string;
  timestamp: string;
  to: string;
  type: string;
  last?: boolean;
}

export interface Transactions {
  loading: boolean;
  list: Transaction[];
}

export type Transaction = Transfer;