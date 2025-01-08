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
 * Überprüft, ob der Ordner "templates" im Bewerbungen-Hauptordner existiert.
 * Falls nicht, wird der Ordner erstellt und die ID in der Config.js gespeichert.
 *
 * @returns {GoogleAppsScript.Drive.Folder} - Der existierende oder neu erstellte Templates-Ordner.
 */
function ensureTemplatesFolder() {
  const mainFolderId = getConfigValue("FOLDER_ID");
  const mainFolder = DriveApp.getFolderById(mainFolderId);
  const templatesFolderName = "templates";

  let templatesFolder = mainFolder.getFoldersByName(templatesFolderName);

  if (templatesFolder.hasNext()) {
    templatesFolder = templatesFolder.next();
    Logger.log(
      `Der Ordner "${templatesFolderName}" existiert bereits. ID: ${templatesFolder.getId()}`
    );
  } else {
    templatesFolder = mainFolder.createFolder(templatesFolderName);
    Logger.log(
      `Der Ordner "${templatesFolderName}" wurde neu erstellt. ID: ${templatesFolder.getId()}`
    );
  }

  // Speichere die ID in der Config.js
  setConfigValue("TEMPLATES_FOLDER_ID", templatesFolder.getId());

  return templatesFolder;
}

/**
 * Überprüft, ob das Google Sheet "Bewerbungstracker" im Ordner "Bewerbungen" existiert.
 * Falls nicht, wird es erstellt. Überprüft auch die Struktur des Sheets
 * und passt sie bei Bedarf an. Speichert die Sheet-ID in der Konfigurationsdatei.
 */
function ensureBewerbungenSheet() {
  const folderID = getConfigValue("FOLDER_ID");
  const folder = DriveApp.getFolderById(folderID);
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
  const folder = ensureBewerbungenFolder();
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

/**
 * Erstellt eine E-Mail basierend auf einer Template-Datei.
 *
 * @param {string} templateFileName - Der Name der Template-Datei (z. B. 'status1_first_request.txt').
 * @param {Object} placeholderValues - Ein Objekt mit den Platzhaltern und ihren Werten.
 */
function createEmailFromTemplate(templateFileName, placeholderValues) {
  const folderId = getConfigValue("TEMPLATES_FOLDER_ID");
  const templatesFolder = DriveApp.getFolderById(folderId);
  const file = templatesFolder.getFilesByName(templateFileName);

  if (!file.hasNext()) {
    throw new Error(
      `Die Template-Datei '${templateFileName}' wurde im Ordner 'templates' nicht gefunden.`
    );
  }

  const templateContent = file.next().getBlob().getDataAsString();

  // Platzhalter im Template ersetzen
  const filledTemplate = replacePlaceholders(
    templateContent,
    placeholderValues
  );

  // Betreff und Body aufteilen
  const [subjectLine, ...bodyLines] = filledTemplate.split("\n");
  const subject = subjectLine.replace("Betreff: ", "").trim();
  const body = bodyLines.join("\n").trim();

  if (!recipientEmail) {
    Logger.log("Warnung: Keine Empfängeradresse angegeben.");
    recipientEmail = ""; // Standardmäßig leer lassen
  }

  // E-Mail im Entwürfe-Ordner erstellen
  GmailApp.createDraft(recipientEmail, subject, body); // `recipientEmail` als Empfänger für Entwurf
  Logger.log(
    `E-Mail mit Betreff "${subject}" wurde an "${recipientEmail} im Entwürfe-Ordner erstellt.`
  );
}

/**
 * Ersetzt Platzhalter im Text durch die entsprechenden Werte.
 *
 * @param {string} text - Der Text mit Platzhaltern.
 * @param {Object} placeholderValues - Ein Objekt mit den Platzhaltern und ihren Werten.
 * @returns {string} - Der Text mit ersetzten Platzhaltern.
 */
function replacePlaceholders(text, placeholderValues) {
  return text.replace(/{{(.*?)}}/g, (match, key) => {
    const value = placeholderValues[key.trim()];
    if (!value) {
      Logger.log(
        `Warnung: Kein Wert für Platzhalter "${key.trim()}" gefunden.`
      );
    }
    return value || match;
  });
}
