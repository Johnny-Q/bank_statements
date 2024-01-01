import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";
import SheetsClient from "@/util/SheetsClient";
import { validateTransactions } from "@/util/dataValidators";
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

    const transactions = validateTransactions(await req.json()); //update this to include options for the api call (i.e. source)

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