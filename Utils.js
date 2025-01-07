//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Zusatzfunktionen -
// Utils.js

/**
 * Überprüft, ob die Google-Taskliste "Bewerbungen" existiert, und erstellt sie, falls nicht.
 * Speichert die ID der Liste in der Konfigurationsdatei.
 */
function ensureTaskList() {
  const taskLists = Tasks.Tasklists.list().items;
  let taskListId = null;

  // Suche nach der Taskliste "Bewerbungen"
  if (taskLists) {
    taskLists.forEach((taskList) => {
      if (taskList.title === "Bewerbungen") {
        taskListId = taskList.id;
      }
    });
  }

  // Falls die Liste nicht existiert, erstelle sie
  if (!taskListId) {
    const newTaskList = Tasks.Tasklists.insert({ title: "Bewerbungen" });
    taskListId = newTaskList.id;
    Logger.log(`Taskliste "Bewerbungen" wurde erstellt. ID: ${taskListId}`);
  } else {
    Logger.log(`Taskliste "Bewerbungen" existiert bereits. ID: ${taskListId}`);
  }

  // Speichere die ID in der Konfigurationsdatei
  setConfigValue("TASK_LIST_ID", taskListId);
}

/**
 * Überprüft, ob ein Ordner mit dem Namen "Bewerbungen" im Google Drive existiert,
 * und erstellt ihn, falls nicht. Speichert die ID des Ordners in der Konfigurationsdatei.
 *
 * @returns {GoogleAppsScript.Drive.Folder} Der existierende oder neu erstellte Ordner.
 */
function ensureBewerbungenFolder() {
  const folderName = "Bewerbungen";
  const folders = DriveApp.getFoldersByName(folderName);
  let folder;

  if (folders.hasNext()) {
    folder = folders.next();
    Logger.log(
      `Ordner "${folderName}" existiert bereits. ID: ${folder.getId()}`
    );
  } else {
    folder = DriveApp.createFolder(folderName);
    Logger.log(`Ordner "${folderName}" wurde erstellt. ID: ${folder.getId()}`);
  }

  // Speichere die ID in der Konfigurationsdatei
  setConfigValue("FOLDER_ID", folder.getId());

  return folder;
}

/**
 * Überprüft, ob das Google Sheet "Bewerbungstracker" im Ordner "Bewerbungen" existiert.
 * Falls nicht, wird es erstellt. Überprüft auch die Struktur des Sheets
 * und passt sie bei Bedarf an. Speichert die Sheet-ID in der Konfigurationsdatei.
 */
function ensureBewerbungenSheet() {
  const folderID = getConfigValue("FOLDER_ID");
  const folder = DriveApp.getFoldersByName(folderID);
  const sheetName = "Bewerbungstracker";
  const requiredColumns = [
    "BewerbungsID",
    "Unternehmen",
    "Stelle",
    "Art der Bewerbung",
    "Job-Portal",
    "Datum der Bewerbung",
    "Status",
    "Eingang bestätigt",
    "Datum der Nachfrage",
    "Ansprechpartner",
    "Email",
    "Telefon",
    "Login-Informationen",
    "Bewerbungsgespräch Datum",
    "Bewerbungsgespräch Ort",
    "Stellenbeschreibung Link",
    "Kommentar",
  ];

  // Suche nach dem Sheet im Ordner
  const files = folder.getFilesByName(sheetName);
  let spreadsheet;

  if (files.hasNext()) {
    const file = files.next();
    spreadsheet = SpreadsheetApp.open(file);
    Logger.log(`Das Sheet "${sheetName}" existiert bereits.`);
  } else {
    // Neues Sheet erstellen
    spreadsheet = SpreadsheetApp.create(sheetName);
    const file = DriveApp.getFileById(spreadsheet.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file); // Aus dem Standard-Drive entfernen
    Logger.log(`Das Sheet "${sheetName}" wurde neu erstellt.`);
  }

  const sheet = spreadsheet.getSheets()[0];

  // Überprüfen und Hinzufügen der Spalten
  const existingColumns = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
  requiredColumns.forEach((column, index) => {
    if (!existingColumns.includes(column)) {
      if (index >= existingColumns.length) {
        sheet.getRange(1, index + 1).setValue(column);
      } else {
        sheet.insertColumnAfter(index + 1);
        sheet.getRange(1, index + 1).setValue(column);
      }
    }
  });

  // Speichere die ID in der Konfigurationsdatei
  setConfigValue("SHEET_ID", spreadsheet.getId());
}

/**
 * Speichert eine Schlüssel-Wert-Konfiguration in der Datei Config.js im Ordner "Bewerbungen".
 *
 * @param {string} key - Der Name des Konfigurationsschlüssels.
 * @param {string} value - Der zu speichernde Wert.
 */
function setConfigValue(key, value) {
  const folder = ensureBewerbungenFolder(); // Stellt sicher, dass der Ordner existiert
  const fileName = "Config.js";
  let file = folder.getFilesByName(fileName);

  if (!file.hasNext()) {
    // Erstelle die Config.js, falls sie nicht existiert
    file = folder.createFile(fileName, `// Bewerbungstracker Konfiguration\n`);
    Logger.log(`Config-Datei "${fileName}" wurde erstellt.`);
  } else {
    file = file.next();
  }

  const existingContent = file.getBlob().getDataAsString();
  const newContent = existingContent.includes(`const ${key} =`)
    ? existingContent.replace(
        new RegExp(`const ${key} = ".*?";`),
        `const ${key} = "${value}";`
      )
    : existingContent + `const ${key} = "${value}";\n`;

  file.setContent(newContent);
}

/**
 * Liest einen Konfigurationswert aus der Datei Config.js im Ordner "Bewerbungen".
 */
function getConfigValue(key) {
  const folder = ensureBewerbungenFolder();
  const fileName = "Config.js";
  const file = folder.getFilesByName(fileName);

  if (!file.hasNext()) {
    Logger.log(`Config-Datei "${fileName}" wurde nicht gefunden.`);
    return null;
  }

  const content = file.next().getBlob().getDataAsString();
  const match = new RegExp(`const ${key} = "(.*?)";`).exec(content);
  return match ? match[1] : null;
}
