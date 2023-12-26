import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
export const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            authorization: {
                params: {
                    scope: 'https://www.googleapis.com/auth/spreadsheets email openid',
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ], callbacks: {
        async session(params) {
            console.log("session", params);
            const {session} = params;
            return session;
        },
        async jwt(params) {
            console.log("jwt", params);
            const {token} = params;
            return token;
        },
        async signIn(params) {
            console.log("signIn", params);
            const {account} = params
            //use could reject the option to allow google sheets, app needs to handle that
            return true;
        }
    }
})
export { handler as GET, handler as POST }