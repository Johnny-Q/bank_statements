import { OAuth2Client } from "google-auth-library";
import { google, sheets_v4 } from "googleapis"
import { initGoogleAuth, initSheetsClient } from "./googleUtils"
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
            range: 'Transactions!A1:Z',
        });
        return res.data;
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
}