export const doGet = () => {
  const title = 'Google Apps Script';
  const fileName = 'index.html';
  return HtmlService.createHtmlOutputFromFile(fileName)
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
};

export function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  //setupSheet(); // Ensure sheet has headers

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),                    // Timestamp
    data.name || '',               // User Name
    data.date || '',               // Date of Completion
    data.chintamani || ''          // Path Title (e.g., "Monday Path")
  ]);

  // return ContentService.createTextOutput(
  //   JSON.stringify({ success: true })
  // ).setMimeType(ContentService.MimeType.JSON);

  var result = {
      ok: true,
      message: 'Thank You... Your Message has been recorded..',
    }
    return ContentService
    .createTextOutput(JSON.stringify(result))

}

function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const expectedHeaders = ["Timestamp", "Name", "Date", "Chintamani"];

  // Add headers if first row is empty or different
  if (headers.join("") === "" || headers.length < expectedHeaders.length) {
    sheet.clear(); // Clear existing content
    sheet.appendRow(expectedHeaders);
  }
}
