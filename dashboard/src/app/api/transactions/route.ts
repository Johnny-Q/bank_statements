import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import SheetsClient from "@/utils/SheetsClient";
import { validateUserTransactions } from "@/utils/TransactionsValidator";
import { Session } from "next-auth";

export async function POST(req: Request) {
    const session = await getServerSession(options) as Session;
    const { access_token, spreadsheet_id } = session;
    const transactions = validateUserTransactions(await req.json());
    const sheets_client = new SheetsClient(access_token as string, spreadsheet_id as string);
    try {
        // await sheets_client.appendTransactions(transactions);
        const new_transctions = await sheets_client.compareTransactions(transactions);
        await sheets_client.appendTransactions(new_transctions);
        return Response.json("done");
    } catch (err) {
        console.log(err);
        return Response.json("server error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(options) as Session;
    const { access_token, spreadsheet_id } = session;
    const sheets_client = new SheetsClient(access_token as string, spreadsheet_id as string);
    try {
        const transactions = await sheets_client.getAllTransactions();
        return Response.json(transactions);
    } catch (err) {
        console.log(err);
        return Response.json("server error", { status: 500 });
    }
}