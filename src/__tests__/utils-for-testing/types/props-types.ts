import { Rpc } from '@interfaces/rpc.interface';

export type PropsRequestBalance = {
  amount: number;
  currency: string;
  username?: string;
  rpc: Rpc;
};

export type PropsRequestItem = {
  title: string;
  content: string;
  pre?: boolean;
  red?: boolean;
};