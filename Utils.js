//*****Script V:0.2 A:sIn*****
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
  const fileName = "Config.js";
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
 *
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
