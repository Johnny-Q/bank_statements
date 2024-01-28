"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TransactionFormSchema } from "@/utils/TransactionsValidator"
import type { TransactionForm } from "@/utils/TransactionsValidator"

const AddTransactionForm = () => {
  const form = useForm<TransactionForm>({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      date: format(new Date, "yyyy-MM-dd"),
      amount: "",
      description: ""
    }
  });

  function onSubmit(values: TransactionForm) {
    // Do something with the form values.
    //show errors and 
    fetch("/api/transactions", {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify([values])
    }).then(resp => {
      //TODO: handle response
      form.reset();
    }).catch(resp => {
      //TODO: handle error
    });
  }
  return (
    <div className="w-5/6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    placeholder="YYYY-MM-DD"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Add "-" to amount if you've spent money (e.g. -1.00)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you spend your money on?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">Submit</Button>
        </form>
      </Form >
    </div >
  )
}
export default AddTransactionForm;