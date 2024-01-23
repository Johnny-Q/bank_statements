import { Session, getServerSession } from "next-auth";
import SheetsClient from "./SheetsClient";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function useSheetsClient() {
    const session = await getServerSession(options) as Session;
    const { access_token, spreadsheet_id } = session;
    return new SheetsClient(access_token as string, spreadsheet_id as string);
}