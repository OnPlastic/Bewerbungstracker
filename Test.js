//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Testszenarien -
// Test.js

/**
 * Testet, ob der Ordner "Bewerbungen" korrekt erstellt wurde.
 */
function testBewerbungenFolder() {
  const folderId = getConfigValue("FOLDER_ID");
  if (!folderId) {
    Logger.log("Fehler: Ordner 'Bewerbungen' wurde nicht erstellt.");
    return;
  }

  const folder = DriveApp.getFolderById(folderId);
  if (folder) {
    Logger.log(`Ordner 'Bewerbungen' existiert. ID: ${folderId}`);
  } else {
    Logger.log("Fehler: Ordner 'Bewerbungen' konnte nicht gefunden werden.");
  }
}

/**
 * Testet, ob das Google Sheet korrekt erstellt wurde.
 */
function testBewerbungenSheet() {
  const sheetId = getConfigValue("SHEET_ID");
  if (!sheetId) {
    Logger.log("Fehler: Google Sheet wurde nicht erstellt.");
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(sheetId);
  if (spreadsheet) {
    Logger.log(`Google Sheet existiert. ID: ${sheetId}`);
  } else {
    Logger.log("Fehler: Google Sheet konnte nicht gefunden werden.");
  }
}

/**
 * Testet, ob die Task-Liste korrekt erstellt wurde.
 */
function testTaskList() {
  const taskListId = getConfigValue("TASK_LIST_ID");
  if (!taskListId) {
    Logger.log("Fehler: Task-Liste wurde nicht erstellt.");
    return;
  }

  const taskLists = Tasks.Tasklists.list().items;
  const taskList = taskLists.find((list) => list.id === taskListId);
  if (taskList) {
    Logger.log(`Task-Liste existiert. ID: ${taskListId}`);
  } else {
    Logger.log("Fehler: Task-Liste konnte nicht gefunden werden.");
  }
}

/**
 * Testet, ob der Templates-Ordner korrekt erstellt wurde.
 */
function testTemplatesFolder() {
  const templatesFolderId = getConfigValue("TEMPLATES_FOLDER_ID");
  if (!templatesFolderId) {
    Logger.log("Fehler: Templates-Ordner wurde nicht erstellt.");
    return;
  }

  const folder = DriveApp.getFolderById(templatesFolderId);
  if (folder) {
    Logger.log(`Templates-Ordner existiert. ID: ${templatesFolderId}`);
  } else {
    Logger.log("Fehler: Templates-Ordner konnte nicht gefunden werden.");
  }
}

/**
 * Testet, ob eine Template-Datei im Templates-Ordner vorhanden ist.
 */
function testTemplateFile() {
  const templatesFolderId = getConfigValue("TEMPLATES_FOLDER_ID");
  const folder = DriveApp.getFolderById(templatesFolderId);
  const fileName = "status1_first_request.txt";

  const file = folder.getFilesByName(fileName);
  if (file.hasNext()) {
    Logger.log(`Template-Datei '${fileName}' existiert.`);
  } else {
    Logger.log(
      `Fehler: Template-Datei '${fileName}' konnte nicht gefunden werden.`
    );
  }
}

/**
 * Führt alle Tests aus.
 */
function runAllTests() {
  Logger.log("Starte Tests...");
  testBewerbungenFolder();
  testBewerbungenSheet();
  testTaskList();
  testTemplatesFolder();
  testTemplateFile();
  Logger.log("Tests abgeschlossen.");
}
