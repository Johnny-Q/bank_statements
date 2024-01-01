'use client';
import { useEffect, useState } from "react";
import Papa from "papaparse";

const CsvParser = () => {
    const [transactions, setTranasactions] = useState<any[]>([]);

    const parseCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Papa.parse(files[0], {
                header: true,
                complete: (results) => {
                    console.log(results);
                    setTranasactions(results.data);
                }
            });
        }
    }

    useEffect(() => {
        console.log(transactions);
    }, transactions)

    return (
        <>
            <input type="file" onChange={parseCsv} />
            {
                transactions.length > 0 && (
                    <table>
                        <thead>
                            <th>
                                date
                            </th>
                            <th>
                                description
                            </th>
                            <th>
                                amount
                            </th>
                            <th>
                                accout
                            </th>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => {
                                return (
                                    <tr>
                                        <td>{transaction["date"]}</td>
                                        <td>{transaction["description"]}</td>
                                        <td>{transaction["amount"]}</td>
                                        <td>{transaction["account"]}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )
            }
        </>
    )
}

export default CsvParser;