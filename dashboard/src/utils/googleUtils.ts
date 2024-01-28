import type { OAuth2Client } from "google-auth-library";
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

    const header_format = {
        backgroundColorStyle: {
            rgbColor: {
                red: 60 / 255,
                green: 120 / 255,
                blue: 216 / 255
            }
        },
        textFormat: {
            foregroundColorStyle: {
                rgbColor: {
                    red: 1,
                    green: 1,
                    blue: 1
                },
            }
        },
        horizontalAlignment: "CENTER",
        verticalAlignment: "MIDDLE",
    }
    const response = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: "Personal Budget Tracker"
            },
            sheets: [{
                properties: {
                    title: "Transactions",
                    gridProperties: {
                        frozenRowCount: 1
                    }
                },
                data: [{
                    startRow: 0,
                    startColumn: 0,
                    rowData: [
                        {
                            values: [
                                { userEnteredValue: { stringValue: "DATE" }, userEnteredFormat: header_format },
                                { userEnteredValue: { stringValue: "BANK DESCRIPTION" }, userEnteredFormat: header_format },
                                { userEnteredValue: { stringValue: "DESCRIPTION" }, userEnteredFormat: header_format },
                                { userEnteredValue: { stringValue: "AMOUNT" }, userEnteredFormat: header_format },
                                { userEnteredValue: { stringValue: "CATEGORY" }, userEnteredFormat: header_format },
                                { userEnteredValue: { stringValue: "ACCOUNT" }, userEnteredFormat: header_format },
                            ]
                        }
                    ],
                    rowMetadata: [{ pixelSize: 35 }]
                }, {
                    startRow: 0,
                    startColumn: 1,
                    columnMetadata: [{ pixelSize: 7 }]
                }],
            }, {
                properties: {
                    title: "Categories"
                }
            }],
        }
    });
    console.log(response.data);
    return response.data.spreadsheetId;
}

export function extractDataFromQueryResponse(text: string): any {
    // Find the JSON object in the text
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);

    if (!jsonMatch || jsonMatch.length < 2) {
        throw new Error("No valid JSON data found in the text");
    }

    // Parse the JSON data
    const jsonData = JSON.parse(jsonMatch[1]);
    return jsonData;
}