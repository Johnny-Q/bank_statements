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

    async getTransactions(options?: { startDate?: Date, endDate?: Date, limit?: number }) {
        let query = "select * "

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

        query += "order by A desc";

        if (options?.limit) {
            query += ` limit ${options.limit}`;
        }

        //convert dates to date objects

        const res = await this.query(query);
        // console.log(res);
        const transactions = res.map((entry: any) => {
            return {
                "DESCRIPTION": entry["DESCRIPTION"] || entry["BANK DESCRIPTION"],
                "AMOUNT": entry["AMOUNT"]
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
        // console.log(res);
        return res[0]["sum AMOUNT"];
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
        // console.log(res);
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
        if (resp.status != 200) {
            console.log(resp.status);
            return []
        }
        const jsonData = extractDataFromQueryResponse(await resp.text());
        // return jsonData.table;

        // Extract the table data
        const tableData = jsonData.table;

        const columns = tableData.cols.map((col: any) => col.label);

        // Extract rows
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