//*****Script V:0.2 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// Code.js

/**
 * Initialisiert das Projekt, indem es die grundlegende Infrastruktur einrichtet.
 */
function initializeProject() {
  const folderId = ensureBewerbungenFolder();
  ensureTemplatesFolder();
  ensureTaskList();
  ensureBewerbungenSheet();

  Logger.log("Projekt erfolgreich initialisiert:");
  Logger.log(`Hauptordner ID: ${folderId}`);
  Logger.log(`Sheet ID: ${getConfigValue("SHEET_ID")}`);
  Logger.log(`Task-Liste ID: ${getConfigValue("TASK_LIST_ID")}`);
  Logger.log(`Templates-Ordner ID: ${getConfigValue("TEMPLATES_FOLDER_ID")}`);
}

/**
 * Hauptfunktion, die von einem Trigger gestartet wird.
 * Verarbeitet alle Bewerbungen basierend auf ihrem Status.
 */
function mainProcess() {
  const sheetId = getConfigValue("SHEET_ID");
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName("Bewerbungstracker");

  const data = sheet.getDataRange().getValues();
  data.forEach((row, index) => {
    if (index === 0) return; // Überspringe die Kopfzeile
    const status = row[STATUS_COLUMN_INDEX];
    handleStatus(row, index, sheet, status);
  });
}

/**
 * Handhabt den Status der Bewerbung.
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 * @param {number} status - Der Status der Bewerbung.
 */
function handleStatus(row, index, sheet, status) {
  const actions = {
    1: () => handleStatus1(row, index, sheet),
    2: () => handleStatus2(row, index, sheet),
    3: () => handleStatus3(row, index, sheet),
    4: () => handleStatus4(row, index, sheet),
    6: () => handleStatus6(row, index, sheet),
    7: () => handleStatus7(row, index, sheet),
  };
  if (actions[status]) actions[status]();
}
