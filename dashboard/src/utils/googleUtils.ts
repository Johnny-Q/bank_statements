import { OAuth2Client } from "google-auth-library";
import type { drive_v3, sheets_v4 } from "googleapis";
import { google } from "googleapis"
const { GOOGLE_ID, GOOGLE_SECRET } = process.env;
export function initGoogleAuth(access_token: string) {
    const auth = new google.auth.OAuth2({
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
    });
    auth.setCredentials({
        access_token: access_token,
    });
    return auth;
}
export function initDriveClient(auth: OAuth2Client) {
    return google.drive({
        version: "v3",
        auth: auth
    });
}

export function initSheetsClient(auth: OAuth2Client) {
    return google.sheets({
        version: "v4",
        auth: auth
    });
}

//could fail due to auth error
export async function findOrCreateSpreadsheet(auth: OAuth2Client) {
    //find the sheet if it exists
    const drive = initDriveClient(auth);
    let sheetId = await findSpreadsheet(drive);
    if (sheetId != null) {
        return sheetId;
    }

    //create a sheet if it doesn't
    const sheets = initSheetsClient(auth);
    return await createSpreadsheet(sheets);
}

//could fail due to auth error
/*
test cases
- auth error
- files length == 0
- files lenght == 1, but none of them are spreadsheets (this shouldn't happen but should still test)
- multiple files
 */
export async function findSpreadsheet(drive: drive_v3.Drive): Promise<string | null> {
    const response = await drive.files.list();
    //find and return the spreadsheet id
    const files = response.data.files;
    if (!files || files.length == 0) return null;
    const spreadsheets = files.filter((file) => {
        return file["mimeType"] == "application/vnd.google-apps.spreadsheet";
    });

    if (spreadsheets.length == 0) return null;
    if (spreadsheets[0].id) return spreadsheets[0].id;
    else return null;
}

export async function createSpreadsheet(sheets: sheets_v4.Sheets) {
    const response = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: "Personal Budget Tracker"
            },
            sheets: [{
                properties: {
                    title: "Transactions"
                },
                data: [{
                    startRow: 0,
                    startColumn: 0,
                    rowData: [
                        {
                            values: [
                                { userEnteredValue: { stringValue: "DATE" } },
                                { userEnteredValue: { stringValue: "BANK DESCRIPTION" } },
                                { userEnteredValue: { stringValue: "DESCRIPTION" } },
                                { userEnteredValue: { stringValue: "AMOUNT" } },
                                { userEnteredValue: { stringValue: "CATEGORY" } },
                                { userEnteredValue: { stringValue: "ACCOUNT" } },
                            ]
                        }
                    ]
                }]
            }, {
                properties: {
                    title: "Categories"
                }
            }],
        }
    });
    return response.data.spreadsheetId;
}