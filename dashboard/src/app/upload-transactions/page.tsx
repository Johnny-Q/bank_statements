'use client';
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { validateTransactions } from "@/utils/transactionValidator";
import TransactionsTable from "@/components/TransactionsTable";
import { Button } from "@/components/ui/button";

const UploadCsv = () => {
  const [transactions, setTranasactions] = useState<any[]>();

  const parseCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Papa.parse(files[0], {
        header: true,
        complete: (results: any) => {
          validateTransactions(results.data);
          setTranasactions(results.data);
        }
      });
    }
  }

  const uploadData = () => {
    fetch("/api/transactions", {
      method: "post",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(transactions)
    })
  }

  useEffect(() => {
    console.log(transactions);
  }, transactions)

  return (
    <>
      <Input type="file" onChange={parseCsv} />
      {transactions && (
        <>
          <TransactionsTable transactions={transactions} />
          <Button className="w-full" onClick={uploadData}>Upload</Button>
        </>
      )}
    </>
  )
}

export default UploadCsv;