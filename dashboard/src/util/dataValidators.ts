import { z } from "zod";

const transactionValidator = z.object({
  date: z.string().pipe(z.coerce.date()),
  description: z.string(),
  amount: z.string().regex(/-?\$(\d{1,3}([, ]\d{3})*\.\d\d)/)
});
export type Transaction = z.infer<typeof transactionValidator>
export function validateTransactions(transactions: unknown) {
  return z.array(transactionValidator).parse(transactions);
}