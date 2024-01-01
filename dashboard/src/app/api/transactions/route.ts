import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import SheetsClient from "@/util/SheetsClient";
/* body format
{
    source: "user" | "bank",
    data: [
        {
            ""
        }
    ]
}
*/
export async function POST(req: Request) {
    const session = await getServerSession(options);
    if (!session) {
        //handle not logged in 
        return Response.json("Not Authorized", { status: 401 });
    }
    const { access_token, spreadsheet_id } = session;

    const transactions = await req.json();

    //validate the transactions

    const sheets_client = new SheetsClient(access_token as string, spreadsheet_id as string);
    try {
        await sheets_client.appendTransactions(transactions);
        return Response.json("done");
    } catch (err) {
        console.log(err);
        return Response.json("server error", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(options);
    if (!session) {
        //handle not logged in 
        return Response.json("Not Authorized", { status: 401 });
    }
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

function validateTranscations(transactions: any[]) {
    transactions.forEach(transaction => {
        validateTransaction(transaction);
    });
}
function validateTransaction(transaction: any) {
    if (transaction.length != 6) return false;
    //check date is valid format

    //check bank_description is a string

    //check description is a string

    //check amount is a valid number format

    //check category is a string

    //check account is a string
}