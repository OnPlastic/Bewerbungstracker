//*****Script V:1.2 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Zusatzfunktionen -
// Utils.js

/**
 * Ruft einen Wert aus der Config.js ab.
 * @param {string} key - Der Name des Schlüssels, der abgerufen werden soll.
 * @returns {string|null} - Der Wert des Schlüssels oder null, wenn er nicht gefunden wird.
 */
function getConfigValue(key) {
  const configFile = getConfigFile(); // Holt die Config-Datei
  const content = configFile.getBlob().getDataAsString();
  const match = new RegExp(`const ${key} = "(.*?)";`).exec(content);

  if (match) {
    return match[1];
  } else {
    Logger.log(`Schlüssel "${key}" in der Config-Datei nicht gefunden.`);
    return null;
  }
}

/**
 * Überprüft, ob der Hauptordner existiert, und erstellt ihn, falls nicht.
 * @returns {GoogleAppsScript.Drive.Folder} - Der existierende oder neu erstellte Ordner.
 */
function ensureBewerbungenFolder() {
  const folderName = "Bewerbungen";
  const folders = DriveApp.getFoldersByName(folderName);

  // Lösche vorhandene Ordner
  while (folders.hasNext()) {
    const folder = folders.next();
    folder.setTrashed(true); // Verschiebe den Ordner in den Papierkorb
  }

  // Erstelle den Ordner neu
  const folder = DriveApp.createFolder(folderName);
  Logger.log(
    `Ordner "${folderName}" wurde neu erstellt. ID: ${folder.getId()}`
  );
  return folder;
}

/**
 * Speichert einen Schlüssel-Wert-Paar in der Config.js.
 * @param {string} key - Der Name des Schlüssels.
 * @param {string} value - Der zu speichernde Wert.
 */
function saveToConfig(key, value) {
  const configFile = getConfigFile();
  let content = configFile.getBlob().getDataAsString();

  const regex = new RegExp(`const ${key} = "(.*?)";`);
  if (content.match(regex)) {
    content = content.replace(regex, `const ${key} = "${value}";`);
    Logger.log(`Schlüssel "${key}" wurde in der Config aktualisiert.`);
  } else {
    content += `const ${key} = "${value}";\n`;
    Logger.log(`Schlüssel "${key}" wurde in der Config hinzugefügt.`);
  }

  configFile.setContent(content);
}

/**
 * Holt die Config-Datei oder erstellt sie, falls sie fehlt.
 * @returns {GoogleAppsScript.Drive.File} - Die Config-Datei.
 */
function getConfigFile() {
  const folder = DriveApp.getFolderById(getMainFolderId());
  const fileName = "Config.txt";
  const files = folder.getFilesByName(fileName);

  if (files.hasNext()) {
    return files.next();
  } else {
    Logger.log(`Config-Datei "${fileName}" wird erstellt.`);
    return folder.createFile(fileName, "// Bewerbungstracker Konfiguration\n");
  }
}

/**
 * Überprüft, ob der Hauptordner existiert, und gibt die ID zurück.
 * @returns {string} - Die ID des Hauptordners.
 */
function getMainFolderId() {
  const folderName = "Bewerbungen";
  const folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next().getId();
  } else {
    const folder = DriveApp.createFolder(folderName);
    Logger.log(
      `Hauptordner "${folderName}" wurde erstellt. ID: ${folder.getId()}`
    );
    return folder.getId();
  }
}

/**
 * Überprüft, ob der Templates-Ordner existiert, und erstellt ihn, falls nicht.
 * @param {GoogleAppsScript.Drive.Folder} mainFolder - Der Hauptordner.
 * @returns {GoogleAppsScript.Drive.Folder} - Der Templates-Ordner.
 */
function ensureTemplatesFolder(mainFolder) {
  const folderName = "templates";
  const folders = mainFolder.getFoldersByName(folderName);

  // Lösche vorhandene Templates-Ordner
  while (folders.hasNext()) {
    const folder = folders.next();
    folder.setTrashed(true); // Verschiebe den Ordner in den Papierkorb
  }

  // Erstelle den Templates-Ordner neu
  const folder = mainFolder.createFolder(folderName);
  Logger.log(
    `Templates-Ordner "${folderName}" wurde neu erstellt. ID: ${folder.getId()}`
  );
  return folder;
}

/**
 * Überprüft, ob das Google Sheet "Bewerbungstracker" im Ordner "Bewerbungen" existiert.
 * Falls nicht, wird es erstellt. Setzt die erforderlichen Spalten bei Bedarf.
 * @param {GoogleAppsScript.Drive.Folder} folder Der Ordner, in dem das Sheet erstellt werden soll.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Das erstellte oder gefundene Spreadsheet.
 */
function ensureBewerbungenSheet(folder) {
  const sheetName = "Bewerbungstracker";
  const requiredColumns = [
    "BewerbungsID",
    "Unternehmen",
    "Stelle",
    "Art der Bewerbung",
    "Job-Portal",
    "Datum der Bewerbung",
    "Status",
    "Datum Rückmeldung",
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

  // Suche nach einem existierenden Sheet
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
    DriveApp.getRootFolder().removeFile(file); // Entferne aus dem Root-Ordner
    Logger.log(`Das Sheet "${sheetName}" wurde erstellt.`);

    // Initialisiere die Spalten
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName(sheetName); // Tabellenblatt umbenennen
    sheet
      .getRange(1, 1, 1, requiredColumns.length)
      .setValues([requiredColumns]);
    Logger.log(`Spalten wurden in das neue Sheet "${sheetName}" eingefügt.`);
  }

  return spreadsheet;
}

/**
 * Überprüft, ob die Google-Taskliste "Bewerbungen" existiert, und erstellt sie, falls nicht.
 * @returns {string} - Die ID der Taskliste.
 */
function ensureTaskList() {
  const taskListName = "Bewerbungen";
  const taskLists = Tasks.Tasklists.list().items;

  if (taskLists) {
    for (const taskList of taskLists) {
      if (taskList.title === taskListName) {
        Logger.log(
          `Tasks-Liste "${taskListName}" existiert bereits. ID: ${taskList.id}`
        );
        return taskList.id;
      }
    }
  }

  const newTaskList = Tasks.Tasklists.insert({ title: taskListName });
  Logger.log(
    `Tasks-Liste "${taskListName}" wurde erstellt. ID: ${newTaskList.id}`
  );
  return newTaskList.id;
}

/**
 * Ersetzt Platzhalter im Text durch die entsprechenden Werte.
 *
 * @param {string} text - Der Text mit Platzhaltern.
 * @param {Object} placeholderValues - Ein Objekt mit den Platzhaltern und ihren Werten.
 * @returns {string} - Der Text mit ersetzten Platzhaltern.
 */
function replacePlaceholders(text, placeholderValues, row) {
  return text.replace(/{{(.*?)}}/g, (match, key) => {
    const value = placeholderValues[key.trim()];
    if (!value) {
      const applicationId = row[APPLICATION_ID_COLUMN_INDEX];
      const companyName = row[COMPANY_COLUMN_INDEX] || "Unbekanntes Unternehmen";
      Logger.log(
        `Warnung! (Bewerbung ID: ${applicationId}, Firma: ${companyName}): Kein Wert für Platzhalter "${key.trim()}" gefunden.`
  );
    }
    
    return value || match;
  });
}

/**
 * Erstellt eine neue Aufgabe in Google Tasks und aktualisiert das Datum der Aktion in der Tabelle.
 *
 * @param {string} taskTitle - Der Titel der zu erstellenden Aufgabe.
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {number} columnIndex - Die Spaltennummer, die aktualisiert werden soll.
 */
function createTask(taskTitle, row, sheet, index, columnIndex) {
  const taskListId = getConfigValue("TASK_LIST_ID");
  const task = {
    title: `${taskTitle} für ${row[COMPANY_COLUMN_INDEX]}`,
    notes: `Details zur Bewerbung: ${row[JOB_DESCRIPTION_COLUMN_INDEX]}`,
    due: getToday().toISOString(), // Fälligkeitsdatum ist heute
  };

  Tasks.Tasks.insert(task, taskListId);

  // Aktualisiere die Tabelle mit dem aktuellen Datum
  const today = Utilities.formatDate(
    getToday(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
  sheet.getRange(index + 1, columnIndex + 1).setValue(today);
}

/**
 * Erstellt eine E-Mail aus einer Vorlage und sendet sie an die angegebene Adresse.
 *
 * @param {string} templateName - Der Name der E-Mail-Vorlage.
 * @param {Object} placeholderValues - Platzhalterwerte, die in der Vorlage ersetzt werden sollen.
 * @param {string} recipient - Die E-Mail-Adresse des Empfängers.
 */
function createEmailFromTemplate(templateName, placeholderValues, recipient, row) {
  const folderId = getConfigValue("TEMPLATES_FOLDER_ID"); // ID des Ordners mit den E-Mail-Vorlagen
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(templateName);

  if (!files.hasNext()) {
    throw new Error(`Vorlage "${templateName}" nicht gefunden.`);
  }

  const file = files.next();
  const template = file.getBlob().getDataAsString();

  // Extrahiere den Betreff und den E-Mail-Body
  const [subjectTemplate, ...bodyTemplateLines] = template.split("\n");
  const emailBodyTemplate = bodyTemplateLines.join("\n");

  // Ersetze die Platzhalter
  const emailSubject = replacePlaceholders(subjectTemplate, placeholderValues, row);
  const emailBody = replacePlaceholders(emailBodyTemplate, placeholderValues, row);

  // Sende die E-Mail
  GmailApp.createDraft(recipient, emailSubject, emailBody);
}

/**
 * Funktionen die dynamisch Inhalte aus dem Sheet laden und im Forms anzeigen
 */

function getAllApplications() {
  const sheetId = getConfigValue("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");
  const data = sheet.getDataRange().getValues();

  // Überspringe die Kopfzeile und erstelle ein Array für die Dropdown-Optionen
  const applications = data.slice(1).map(row => ({
    id: row[0], // BewerbungsID
    firma: row[1] || "Unbekannte Firma",
    stelle: row[2] || "Keine Stelle",
    ansprechpartner: row[9] || "Kein Ansprechpartner"
  }));

  return applications; // Gibt die Daten für das Dropdown zurück
}

function getApplicationDetailsById(applicationId) {
  const sheetId = getConfigValue("SHEET_ID");
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");
  const data = sheet.getDataRange().getValues();

  Logger.log("Gesuchte ID: " + applicationId + " | Länge: " + applicationId.trim().length);
  Logger.log("Gesamte Datenanzahl: " + data.length);

  // Logge alle IDs mit ihrer Länge
  data.forEach(function(row, index) {
    Logger.log("Zeile " + index + ": Vorhandene ID: " + row[0] + " | Länge: " + String(row[0]).trim().length);
  });

  // Suche die Zeile mit der entsprechenden ID
  const application = data.slice(1).find(row => String(row[0]).trim() === applicationId.trim());

  if (!application) {
    Logger.log("Keine Bewerbung mit der ID " + applicationId + " gefunden.");
    return null; // Rückgabe null, wenn keine Bewerbung gefunden wurde
  }

  Logger.log("Bewerbung gefunden: " + application.join(", "));
  
  return JSON.stringify({
    id: application[0],
    firma: application[1],
    stelle: application[2],
    status: application[6],
    bewerbungsart: application[3],
    jobPortal: application[4],
    datum: application[5],
    datumRueckmeldung: application[7],
    datumGespräch: application[13],
    ansprechpartner: application[9],
    email: application[10],
    telefon: application[11],
    loginInfo: application[12],
    link: application[15],
    kommentar: application[16],
  });
}
