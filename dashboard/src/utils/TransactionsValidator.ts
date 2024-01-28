import { z } from "zod";

export const date_regex = /^\d\d\d\d-\d\d-\d\d$/
// export const amount_regex = /^-?\$?\d{1,3}([, ]\d{3})*\.\d\d?$/;
export const amount_regex = /^[-+]?\d+\.\d\d?$/;

export const TransactionFormSchema = z.object({
  date: z.string().regex(date_regex),
  bank_description: z.string().optional(),
  description: z.string(),
  amount: z.string().regex(amount_regex),
  category: z.string().optional(),
  account: z.string().optional()
});
export type TransactionForm = z.infer<typeof TransactionFormSchema>


export const TransactionSchema = z.object({
  date: z.string().regex(date_regex),
  bank_description: z.string().optional(),
  description: z.string(),
  amount: z.coerce.number(),
  category: z.string().optional(),
  account: z.string().optional()
});
export type Transaction = z.infer<typeof TransactionSchema>

export function validateTransactions(transactions: unknown) {
  return z.array(TransactionSchema).parse(transactions);
}