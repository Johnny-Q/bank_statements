import { findSpreadsheet, initGoogleAuth, initSheetsClient, initDriveClient, findOrCreateSpreadsheet } from "@/utils/googleUtils";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
const { GOOGLE_ID, GOOGLE_SECRET } = process.env;

const scopes = [
    "email",
    "openid",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

export const options: NextAuthOptions = {
    session: {
        maxAge: 60 * 60 //match the time of the tokens from google
    },
    providers: [
        GoogleProvider({
            clientId: GOOGLE_ID as string,
            clientSecret: GOOGLE_SECRET as string,
            authorization: {
                params: {
                    scope: scopes.join(" "),
                    prompt: "consent",
                }
            }
        }),
    ], callbacks: {
        async session(params) {
            const { session, token } = params;
            const newSession: any = { ...session };
            newSession.access_token = token.access_token;
            newSession.spreadsheet_id = token.spreadsheet_id;
            return newSession;
        },
        async jwt(params) {
            console.log("jwt", params);
            const { token, account } = params;
            if (account && account.access_token) {
                //token.expire_at = account.expire_at; //handle token refresh
                const auth = initGoogleAuth(account.access_token);
                const drive = initDriveClient(auth);

                //put these on the token so we can put it onto session afterwards
                token.spreadsheet_id = await findSpreadsheet(drive);
                token.access_token = account.access_token;
            }
            return token;
        },
        async signIn(params) {
            console.log("signIn", params);
            const { account, profile } = params
            //next-auth handles rejection of oauth

            //initialize app
            if (account && account.access_token) {
                try {
                    const auth = initGoogleAuth(account.access_token);
                    await findOrCreateSpreadsheet(auth);
                    return true;
                } catch (err) {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
}