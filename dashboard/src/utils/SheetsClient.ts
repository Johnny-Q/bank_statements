import { OAuth2Client } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";
import { extractDataFromQueryResponse, initGoogleAuth, initSheetsClient } from "./googleUtils";
export default class SheetsClient {
    private auth: OAuth2Client;
    private sheets: sheets_v4.Sheets;
    private spreadsheet_id: string;
    constructor(access_token: string, spreadsheet_id: string) {
        this.auth = initGoogleAuth(access_token);
        this.sheets = initSheetsClient(this.auth);
        this.spreadsheet_id = spreadsheet_id;
    }

    //add data filtering get methods
    //what other operations should it support?

    async getAllTransactions() {
        const res = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheet_id,
            range: 'Transactions!A2:Z',
        });
        //make them into objects
        if (!res.data.values) return []
        return res.data.values.map((row: any) => {
            return {
                date: row[0],
                bank_description: row[1],
                description: row[2],
                amount: row[3],
                category: row[4],
                account: row[5]
            }
        });
    }

    /* 
    compares given transactions with the ones already in the sheet
    */
    async compareTransactions(transactions: any[]): Promise<any[]> {

        //sort the transactions by date
        transactions.sort((a: any, b: any) => {
            if (a["date"] > b["date"]) return -1;
            if (a["date"] < b["date"]) return 1;
            return b.amount - a.amount;
        });
        const end_date = new Date(transactions[0]["date"]);
        const start_date = new Date(transactions[transactions.length - 1]["date"]);
        const sheet_transactions = await this.getTransactions({ start_date, end_date });

        //sort using the same algorithm
        sheet_transactions.sort((a: any, b: any) => {
            if (a["date"] > b["date"]) return -1;
            if (a["date"] < b["date"]) return 1;
            return b.amount - a.amount;
        });

        //compare the two
        let iter_a = 0, iter_b = 0;
        const new_transactions: any[] = [];
        while (iter_a < transactions.length && iter_b < sheet_transactions.length) {
            if (transactions[iter_a]["date"] === sheet_transactions[iter_b]["date"]) {
                if (Math.abs(transactions[iter_a]["amount"] - sheet_transactions[iter_b]["amount"]) < 0.001) {
                    iter_a++;
                    iter_b++;
                } else if (transactions[iter_a]["amount"] > sheet_transactions[iter_b]["amount"]) {
                    new_transactions.push(transactions[iter_a]);
                    iter_a++;
                } else {
                    iter_b++;
                }
            } else if (transactions[iter_a]["date"] > sheet_transactions[iter_b]["date"]) {
                new_transactions.push(transactions[iter_a]);
                iter_a++;
            } else {
                iter_b++;
            }
        }

        while (iter_a < transactions.length) {
            new_transactions.push(transactions[iter_a]);
            iter_a++;
        }

        return new_transactions;
    }

    async appendTransactions(transactions: any[]): Promise<void> {
        const res = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheet_id,
            range: "A1:Z",
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: transactions.map(transaction => [
                    transaction.date || "",
                    transaction.bank_description || "",
                    transaction.description || "",
                    transaction.amount || "",
                    transaction.category || "",
                    transaction.account || "",
                ])
            },
        })
    }

    async getTransactions(options?: { start_date?: Date, end_date?: Date, limit?: number }) {
        let query = "select *"
        if (options?.start_date && options?.end_date) {
            // Both dates are provided
            query += ` where date '${options.start_date.toISOString().substring(0, 10)}' <= A and A <= date '${options.end_date.toISOString().substring(0, 10)}'`;
        } else if (options?.start_date) {
            // Only start date is provided
            query += ` where date '${options.start_date.toISOString().substring(0, 10)}' <= A`;
        } else if (options?.end_date) {
            // Only end date is provided
            query += ` where A <= date '${options.end_date.toISOString().substring(0, 10)}'`;
        }

        query += " order by A desc";

        if (options?.limit) {
            query += ` limit ${options.limit}`;
        }
        const res = await this.query(query);

        //convert dates to date objects
        const transactions = res.map((entry: any) => {
            //parse the date
            //Date usually has the form "Date(year,month,date)" (if the user didn't change anything)
            let [year, month, day] = entry["DATE"].substring(5, entry["DATE"].length - 1).split(",");
            month = parseInt(month);
            month = month + 1;


            return {
                "date": `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
                "description": entry["DESCRIPTION"] || entry["BANK DESCRIPTION"],
                "amount": entry["AMOUNT"]
            }
        })
        return transactions;
    }

    async getTotalSpending(options?: { startDate?: Date, endDate?: Date }) {
        let query = "select sum(D)";

        if (options?.startDate && options?.endDate) {
            // Both dates are provided
            query += ` where date '${options.startDate.toISOString().substring(0, 10)}' <= A and A <= date '${options.endDate.toISOString().substring(0, 10)}'`;
        } else if (options?.startDate) {
            // Only start date is provided
            query += ` where date '${options.startDate.toISOString().substring(0, 10)}' <= A`;
        } else if (options?.endDate) {
            // Only end date is provided
            query += ` where A <= date '${options.endDate.toISOString().substring(0, 10)}'`;
        }

        const res = await this.query(query);
        if (res.length > 0) {
            return res[0]["sum AMOUNT"];
        } else {
            return 0;
        }
    }

    async getCategorySpending(options?: { startDate?: Date, endDate?: Date }): Promise<{ [category: string]: number }> {
        let query = "select E, sum(D)";
        if (options?.startDate && options?.endDate) {
            // Both dates are provided
            query += ` where date '${options.startDate.toISOString().substring(0, 10)}' <= A and A <= date '${options.endDate.toISOString().substring(0, 10)}'`;
        } else if (options?.startDate) {
            // Only start date is provided
            query += ` where date '${options.startDate.toISOString().substring(0, 10)}' <= A`;
        } else if (options?.endDate) {
            // Only end date is provided
            query += ` where A <= date '${options.endDate.toISOString().substring(0, 10)}'`;
        }
        query += "group by E";

        const res = await this.query(query);
        const spendingByCategory: { [category: string]: number } = {};
        res.forEach((entry: any) => {
            const category = entry["CATEGORY"] || "Uncategorized";
            const spending = entry["sum AMOUNT"];
            spendingByCategory[category] = spending;
        });
        if ("hidden" in spendingByCategory) {
            delete spendingByCategory["hidden"];
        }
        return spendingByCategory;
    }

    async query(query: string): Promise<any> {
        const url = "https://docs.google.com/spreadsheets" +
            `/d/${this.spreadsheet_id}/gviz/tq` +
            `?tq=${encodeURIComponent(query)}` +
            `&access_token=${encodeURIComponent((await this.auth.getAccessToken()).token as string)}`;

        const resp = await fetch(url);

        if (!resp.ok) {
            console.error("Query fetch not OK");
            throw "Query fetch not OK";
        }

        let jsonData = extractDataFromQueryResponse(await resp.text()); //could throw an error

        if (jsonData.status === "error") {
            console.log(`Query received error response: ${JSON.stringify(jsonData.errors)}`);
            throw `Query received error response`;
        }
        
        const tableData = jsonData.table;
        const columns = tableData.cols.map((col: any) => col.label);

        //if the column labels are empty, then there is only a single row of column titles in the sheet
        if (columns.some((label: string) => label === "")) {
            return []; //sheets had no transactions
        }

        const rows = tableData.rows.map((row: any) => {
            const ret: any = {};
            row.c.forEach((cell: any, i: number) => {
                ret[columns[i]] = cell?.v || null;
            });
            return ret;
        });

        return rows;
    }
}