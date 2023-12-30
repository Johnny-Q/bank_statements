import { google } from "googleapis"
const { GOOGLE_ID, GOOGLE_SECRET } = process.env;
export function initGoogleAuth(access_token) {
    const auth = new google.auth.OAuth2({
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
    });
    auth.setCredentials({
        access_token: access_token,
    });
    return auth;
}
export function initDriveClient(auth) {
    return google.drive({
        version: "v3",
        auth: auth
    });
}

export function initSheetsClient(auth) {
    return google.sheets({
        version: "v4",
        auth: auth
    });
}

//could fail due to auth error
export async function findOrCreateSpreadsheet(auth) {
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
export async function findSpreadsheet(drive) {
    const response = await drive.files.list();
    //find and return the spreadsheet id
    const files = response.data.files;
    if(files.length == 0) return null;
    const spreadsheets = files.filter((file)=>{
        return file["mimeType"] == "application/vnd.google-apps.spreadsheet";
    });

    return spreadsheets[0].id;
}

export async function createSpreadsheet(sheets) {
    const response = await sheets.spreadsheets.create({
        resource: {
            properties: {
                title: "Personal Budget Tracker"
            }, 
            sheets: [{
                properties:{
                    title: "Transactions"
                },
                data: {
                    startRow: 0,
                    startColumn: 0,
                    rowData: [
                         {
                            values: [
                                { userEnteredValue: { stringValue: "DATE"} },
                                { userEnteredValue: { stringValue: "BANK DESCRIPTION"} },
                                { userEnteredValue: { stringValue: "DESCRIPTION"} },
                                { userEnteredValue: { stringValue: "AMOUNT"} },
                                { userEnteredValue: { stringValue: "CATEGORY"} },
                                { userEnteredValue: { stringValue: "ACCOUNT"} },
                            ]
                         }
                    ]
                }
            }, {
                properties:{
                    title: "Categories"
                }
            }],
        }
    });
    return response.data.spreadsheetId;
}