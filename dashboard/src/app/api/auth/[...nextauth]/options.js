import { findSpreadsheet, initGoogleAuth, initSheetsClient, initDriveClient, findOrCreateSpreadsheet } from "@/util/googleUtils";
import GoogleProvider from "next-auth/providers/google"
const {GOOGLE_ID, GOOGLE_SECRET} = process.env;

const scopes = [
    "email",
    "openid",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

export const options = {
    providers: [
        GoogleProvider({
            clientId: GOOGLE_ID,
            clientSecret: GOOGLE_SECRET,
            authorization: {
                params: {
                    scope: scopes.join(" "),
                    prompt: "consent",
                    // access_type: "offline",
                    // response_type: "code",
                }
            }
        }),
    ], callbacks: {
        async session(params) {
            // console.log("session", params);
            const { session, token } = params;
            session.access_token = token.access_token;
            session.spreadsheet_id = token.spreadsheet_id;
            // session.refresh_token = token.refresh_token;
            return session;
        },
        async jwt(params) {
            // console.log("jwt", params);
            const { token, account } = params;
            if (account) {
                token.access_token = account.access_token;
                const auth = initGoogleAuth(account.access_token);
                const drive = initDriveClient(auth);
                token.spreadsheet_id = await findSpreadsheet(drive);
            }
            return token;
        },
        async signIn(params) {
            // console.log("signIn", params);
            const { account, profile } = params
            //next-auth handles rejection of oauth

            //initialize app
            try{
                const auth = initGoogleAuth(account.access_token);
                await findOrCreateSpreadsheet(auth);
                return true;
            }catch(err){
                return false;
            }
        }
    }
}