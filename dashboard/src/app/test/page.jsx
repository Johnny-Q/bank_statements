'use client';
import { useState, useEffect } from "react";
import ApiButton from "../../components/ApiButton";
const TestPage = () => {
    const [txn, setTxn] = useState({});
    return (
        <div>
            <ApiButton text="Get Spreadsheet Data" apiFunc={async () => {
                const resp = await fetch("/api/transactions", {
                    method: "GET"
                });
                return await resp.json();
            }} />
            <div>
                <input type="text" placeholder="date" value={txn.date || ""} onChange={(e) => {
                    setTxn({ ...txn, date: e.target.value });
                }} />
                <input type="text" placeholder="bank_desc" value={txn.bank_desc || ""} onChange={(e) => {
                    setTxn({ ...txn, bank_desc: e.target.value });
                }} />
                <input type="text" placeholder="desc" value={txn.desc || ""} onChange={(e) => {
                    setTxn({ ...txn, desc: e.target.value });
                }} />
                <input type="text" placeholder="amount" value={txn.amount || ""} onChange={(e) => {
                    setTxn({ ...txn, amount: e.target.value });
                }} />
                <input type="text" placeholder="category" value={txn.category || ""} onChange={(e) => {
                    setTxn({ ...txn, category: e.target.value });
                }} />
                <input type="text" placeholder="account" value={txn.account || ""} onChange={(e) => {
                    setTxn({ ...txn, account: e.target.value });
                }} />
            </div>
            <ApiButton text="Submit Transaction" apiFunc={async () => {
                const resp = await fetch("/api/transactions", {
                    method: "post",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify([txn])
                })
                return await resp.json();
            }} />
        </div>
    )
}

export default TestPage