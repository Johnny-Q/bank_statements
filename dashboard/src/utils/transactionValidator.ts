import { z } from "zod";

export const date_regex = /^\d\d\d\d\/\d\d\/\d\d$/
export const amount_regex = /^-?\$?\d{1,3}([, ]\d{3})*\.\d\d$/;

export const transactionSchema = z.object({
  date: z.string().regex(date_regex),
  description: z.string(),
  amount: z.string().regex(amount_regex)
});

export type Transaction = z.infer<typeof transactionSchema>
export function validateTransactions(transactions: unknown) {
  return z.array(transactionSchema).parse(transactions);
}