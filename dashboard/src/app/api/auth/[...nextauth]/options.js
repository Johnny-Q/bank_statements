import GoogleProvider from "next-auth/providers/google"

const GOOGLE_ID = process.env.GOOGLE_ID;
if (!GOOGLE_ID) {
    throw new Error('Please define the GOOGLE_ID environment variable');
}
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
if (!GOOGLE_SECRET) {
    throw new Error('Please define the GOOGLE_SECRET environment variable');
}

export const options = {
    providers: [
        GoogleProvider({
            clientId: GOOGLE_ID,
            clientSecret: GOOGLE_SECRET,
            authorization: {
                params: {
                    scope: 'https://www.googleapis.com/auth/spreadsheets email openid',
                }
            }
        }),
    ], callbacks: {
        async session(params) {
            console.log("session", params);
            const { session, token } = params;
            session.access_token = token.access_token;
            return session;
        },
        async jwt(params) {
            console.log("jwt", params);
            const { token, account } = params;
            if (account) {
                token.access_token = account.access_token;
            }
            return token;
        },
        async signIn(params) {
            console.log("signIn", params);
            const { account, profile } = params
            //use could reject the option to allow google sheets, app needs to handle that
            return true;
        }
    }
}