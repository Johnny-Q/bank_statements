import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import { google } from "googleapis";
import { initGoogleAuth, initSheetsClient } from "@/util/googleUtils";

const clientId = process.env.GOOGLE_ID;
const clientSecret = process.env.GOOGLE_SECRET;

export async function POST(req) {
    const { access_token, spreadsheet_id } = await getServerSession(options);
    console.log(req.data);
    const auth = initGoogleAuth(access_token);
    const sheets = initSheetsClient(auth);
    const transactions = await req.json();
    const resp = await addTransactions(sheets, spreadsheet_id, transactions);
    return Response.json(resp);
}
export async function GET(req) {
    const session = await getServerSession(options);
    const { access_token, spreadsheet_id } = session;
    console.log(session);
    const auth = initGoogleAuth(access_token);
    const sheets = initSheetsClient(auth);
    const txns = await getTransactions(sheets, spreadsheet_id);

    return Response.json(txns);
}

async function getSpreadsheetObj(sheets) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: true
    });
    return res.data;
}
async function getTransactions(sheets, spreadsheetId) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Transactions!A1:Z',
    });
    return res.data;
}

async function addTransactions(sheets, spreadsheetId, transactions) {
    const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "A1:Z",
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: transactions.map(transaction => Object.values(transaction))
        },
    })
    return res;
}