//*****Script V:5.0 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Zusatzfunktionen -
// Utils.gs

// 1.Konfigurationsfunktionen

/**
 * Ruft einen Wert aus der Config.js ab.
 * @param {string} key - Der Name des Schlüssels, der abgerufen werden soll.
 * @returns {string|null} - Der Wert des Schlüssels oder null, wenn er nicht gefunden wird.
 * @throws {Error} Wenn die Config-Datei nicht gefunden oder fehlerhaft ist.
 */
function getConfigValue(key) {
  try {
    const configFile = getConfigFile(); // Holt die Config-Datei
    const content = configFile.getBlob().getDataAsString();
    const match = new RegExp(`const ${key} = "(.*?)";`).exec(content);

    if (match) {
      return match[1];
    } else {
      Logger.log(
        `[WARNING] Schlüssel "${key}" in der Config-Datei nicht gefunden.`
      );
      return null;
    }
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler bei der Leseoperation der Config-Datei: "${key}": ${error.message}`
    );
    throw error;
  }
}

/**
 * Speichert einen Schlüssel-Wert-Paar in der Config.js.
 * @param {string} key - Der Name des Schlüssels.
 * @param {string} value - Der zu speichernde Wert.
 * @param {Error} Wenn die Config-Datei nicht gefunden oder fehlerhaft ist.
 */
function saveToConfig(key, value) {
  try {
    const configFile = getConfigFile();
    let content = configFile.getBlob().getDataAsString();

    const regex = new RegExp(`const ${key} = "(.*?)";`);
    if (content.match(regex)) {
      content = content.replace(regex, `const ${key} = "${value}";`);
      Logger.log(`[INFO] Schlüssel "${key}" wurde in der Config aktualisiert.`);
    } else {
      content += `const ${key} = "${value}";\n`;
      Logger.log(
        `[INFO] Schlüssel "${key}" wurde in der Config.txt hinzugefügt.`
      );
    }

    configFile.setContent(content);
    Logger.log(`[DEBUG] Neuer Inhalt der Config-Datei: \n${content}`);
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Speichern des Schlüssels "${key}" in der Config-Datei: ${error.message}`
    );
    throw error;
  }
}

/**
 * Holt die Config-Datei oder erstellt sie, falls sie fehlt.
 * @returns {GoogleAppsScript.Drive.File} - Die Config-Datei.
 * @throws {Error} Wenn der Hauptordner nicht gefunden oder die Config-Datei nicht erstellt werden kann.
 */
function getConfigFile() {
  try {
    const folder = DriveApp.getFolderById(getMainFolderId());
    const fileName = "Config.txt";
    const files = folder.getFilesByName(fileName);

    if (files.hasNext()) {
      const configFile = files.next();
      Logger.log(
        `[INFO] Config-Datei "${fileName}" gefunden. ID: ${configFile.getId()}`
      );
      return configFile;
    } else {
      Logger.log(
        `[INFO] Config-Datei "${fileName}" nicht gefunden. Erstelle neue Datei...`
      );
      const newConfigFile = folder.createFile(
        fileName,
        "// Bewerbungstracker Konfiguration\n"
      );
      Logger.log(
        `[INFO] Neue Config-Datei erstellt. ID: ${newConfigFile.getId()}`
      );
      return newConfigFile;
    }
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Laden oder Erstellen der Config-Datei: ${error.message}`
    );
    throw error;
  }
}

// 2. Ordner- und Datei-Management

/**
 * Überprüft, ob der Hauptordner existiert, und erstellt ihn, falls nicht.
 * @returns {GoogleAppsScript.Drive.Folder} - Der existierende oder neu erstellte Ordner.
 * @throws {Error} Wenn der Ordner nicht erstellt oder gefunden werden kann.
 */
function ensureBewerbungenFolder() {
  try {
    const folderName = "Bewerbungen";
    const folders = DriveApp.getFoldersByName(folderName);

    // Lösche vorhandene Ordner
    while (folders.hasNext()) {
      const folder = folders.next();
      folder.setTrashed(true); // Verschiebe den Ordner in den Papierkorb
      Logger.log(
        `[INFO] alte Ordner "${folderName}" in den Papierkorb verschoben. ID: ${duplicateFolder.getId()}`
      );
    }

    // Erstelle den Ordner neu
    const folder = DriveApp.createFolder(folderName);
    Logger.log(
      `[INFO] Ordner "${folderName}" wurde neu erstellt. ID: ${folder.getId()}`
    );
    return folder;
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Erstellen des Ordners "${folderName}": ${error.message}`
    );
    throw error;
  }
}

/**
 * Überprüft, ob der Hauptordner existiert, und gibt die ID zurück.
 * Falls der Ordner nicht existiert, wird er erstellt.
 * @returns {string} - Die ID des Hauptordners.
 * @throws {Error} Wenn der Ordner nicht erstellt werden kann.
 */
function getMainFolderId() {
  const folderName = "Bewerbungen";
  try {
    const folders = DriveApp.getFoldersByName(folderName);

    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log(
        `[INFO] Hauptordner "${folderName}" existiert bereits. ID: ${folder.getId()}`
      );
      return folder.getId();
    } else {
      const newFolder = DriveApp.createFolder(folderName);
      Logger.log(
        `[INFO] Hauptordner "${folderName}" wurde erstellt. ID: ${newFolder.getId()}`
      );
      return newFolder.getId();
    }
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Erstellen des Hauptordners "${folderName}": ${error.message}`
    );
    throw error;
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

  try {
    // Lösche vorhandene Templates-Ordner
    const folders = mainFolder.getFoldersByName(folderName);
    while (folders.hasNext()) {
      const folder = folders.next();
      folder.setTrashed(true); // Verschiebe den Ordner in den Papierkorb
      Logger.log(
        `[INFO] Vorhandener Templates-Ordner "${folderName}" wurde gelöscht.`
      );
    }

    // Erstelle den Templates-Ordner neu
    const folder = mainFolder.createFolder(folderName);
    Logger.log(
      `[INFO] Templates-Ordner "${folderName}" wurde neu erstellt. ID: ${folder.getId()}`
    );
    return folder;
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Erstellen des Templates-Ordners "${error.message}`
    );
  }
}

// 3. Sheet-Management

/**
 * Überprüft, ob das Google Sheet "Bewerbungstracker" im Ordner "Bewerbungen" existiert.
 * Falls nicht, wird es erstellt. Setzt die erforderlichen Spalten bei Bedarf.
 * @param {GoogleAppsScript.Drive.Folder} folder Der Ordner, in dem das Sheet erstellt werden soll.
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Das erstellte oder gefundene Spreadsheet.
 * @throws {Error} - Wenn ein Fehler beim Erstellen oder Überprüfen des Sheets auftritt.
 */
function ensureBewerbungenSheet(folder) {
  try {
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
      Logger.log(
        `[INFO] Das Sheet "${sheetName}" existiert bereits. ID: ${spreadsheet.getId()}`
      );
    } else {
      // Neues Sheet erstellen
      spreadsheet = SpreadsheetApp.create(sheetName);
      const file = DriveApp.getFileById(spreadsheet.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file); // Entferne aus dem Root-Ordner
      Logger.log(
        `[INFO] Neues Sheet "${sheetName}" wurde erstellt. ID: ${spreadsheet.getId()}`
      );

      // Initialisiere die Spalten
      const sheet = spreadsheet.getSheets()[0];
      sheet.setName(sheetName); // Tabellenblatt umbenennen
      sheet
        .getRange(1, 1, 1, requiredColumns.length)
        .setValues([requiredColumns]);
      Logger.log(
        `[INFO] Spalten wurden in das neue Sheet "${sheetName}" eingefügt.`
      );
    }

    return spreadsheet;
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Erstellen oder überprüfen des Sheets: ${error.message}`
    );
    throw error;
  }
}

/**
 * Ruft alle Bewerbungen aus der Tabelle ab und bereitet sie für die Verwendung in einem Dropdown vor.
 * @returns {Array<Object>} Eine Liste von Bewerbungen, jede Bewerbung als Objekt mit den Schlüsseln:
 * - `id` (string): Die Bewerbungs-ID.
 * - `firma` (string): Der Firmenname.
 * - `stelle` (string): Die Stellenbezeichnung.
 * - `ansprechpartner` (string): Der Ansprechpartner.
 *
 * @throws {Error} Wenn das Google Sheet nicht gefunden werden kann oder ein anderer Fehler auftritt.
 */
function getAllApplications() {
  try {
    const sheetId = getConfigValue("SHEET_ID");
    const sheet =
      SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");
    const data = sheet.getDataRange().getValues();

    // Überspringe die Kopfzeile und erstelle ein Array für die Dropdown-Optionen
    const applications = data.slice(1).map((row) => ({
      id: row[0], // BewerbungsID
      firma: row[1] || "Firma",
      stelle: row[2] || "Stelle",
      ansprechpartner: row[9] || "Ansprechpartner",
    }));

    Logger.log(`
      [INFO] ${applications.length} Bewerbungen erfolgreich geladen.`);
    return applications; // Gibt die Daten für das Dropdown zurück
  } catch (error) {
    Logger.log(`[ERROR] Fehler beim Laden der Bewerbungen: ${error.message}`);
    throw error;
  }
}

/**
 * Ruft die Details einer bestimmten Bewerbung basierend auf der Bewerbungs-ID ab.
 * @param {string} applicationId - Die ID der gesuchten Bewerbung.
 * @returns {string|null} - Ein JSON-String mit den Bewerbungsdetails oder `null`, wenn keine Bewerbung gefunden wurde.
 * @throws {Error} - Wenn das Google Sheet nicht gefunden werden kann oder ein anderer Fehler auftritt.
 */
function getApplicationDetailsById(applicationId) {
  try {
    const sheetId = getConfigValue("SHEET_ID");
    const sheet =
      SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");
    const data = sheet.getDataRange().getValues();

    Logger.log(
      `[INFO] Suche Bewerbung mit ID: "${applicationId}" im Sheet mit ID: "${sheetId}"`
    );

    // Suche die Zeile mit der entsprechenden ID
    const application = data
      .slice(1)
      .find((row) => String(row[0]).trim() === applicationId.trim());

    if (!application) {
      Logger.log(
        `[WARNING] Keine Bewerbung mit der ID "${applicationId}" gefunden.`
      );
      return null;
    }

    Logger.log(`[INFO] Bewerbung mit der ID "${applicationId}" gefunden.`);

    // Erstelle ein JSON-Objekt mit den Bewerbungsdetails
    const applicationDetails = {
      id: application[0],
      firma: application[1],
      stelle: application[2],
      status: application[6],
      bewerbungsart: application[3],
      jobPortal: application[4],
      datum: formatDate(application[5]), // Formatierung für Datum der Bewerbung
      datumRueckmeldung: formatDate(application[7]), // Formatierung für Datum Rückmeldung
      datumGespräch: formatDate(application[13]), // Formatierung für Bewerbungsgespräch
      ansprechpartner: application[9],
      email: application[10],
      telefon: application[11],
      loginInfo: application[12],
      link: application[15],
      kommentar: application[16],
    };

    Logger.log(
      `[DEBUG] Bewerbungsdetails: ${JSON.stringify(applicationDetails)}`
    );
    return JSON.stringify(applicationDetails);
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Abrufen der Bewerbungsdetails: ${error.message}`
    );
    throw error;
  }
}

// 4. Google Tasks und E-Mailintegration

/**
 * Überprüft, ob die Google-Taskliste "Bewerbungen" existiert, und erstellt sie, falls nicht.
 * @returns {string} - Die ID der Taskliste.
 * @throws {Error} - Wenn die Google Tasks-API nicht verfügbar ist oder ein Fehler auftritt.
 */
function ensureTaskList() {
  try {
    const taskListName = "Bewerbungen";
    const taskLists = Tasks.Tasklists.list().items || [];

    Logger.log(
      `[INFO] Überprüfe, ob die Taskliste "${taskListName}" existiert...`
    );

    const existingTaskList = taskLists.find(
      (taskList) => taskList.title === taskListName
    );

    if (existingTaskList) {
      Logger.log(
        `[INFO] Taskliste "${taskListName}" existiert bereits. ID: ${existingTaskList.id}`
      );
      return existingTaskList.id;
    }

    Logger.log(
      `[INFO] Taskliste "${taskListName}" existiert nicht. Erstelle neue Taskliste...`
    );
    const newTaskList = Tasks.Tasklists.insert({ title: taskListName });
    Logger.log(
      `[INFO] Neue Taskliste "${taskListName}" wurde erstellt. ID: ${newTaskList.id}`
    );
    return newTaskList.id;
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Überprüfen oder Erstellen der Taskliste: ${error.message}`
    );
    throw error;
  }
}

/**
 * Erstellt eine neue Aufgabe in Google Tasks und aktualisiert das Datum der Aktion in der Tabelle.
 * @param {string} taskTitle - Der Titel der zu erstellenden Aufgabe.
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {number} columnIndex - Die Spaltennummer, die aktualisiert werden soll.
 * @throws {Error} Wenn ein Fehler bei der Erstellung der Aufgabe auftritt.
 */
function createTask(taskTitle, row, sheet, index, columnIndex) {
  try {
    Logger.log(
      `[INFO] Erstelle Task: "${taskTitle}" für Bewerbung in Zeile ${
        index + 1
      }...`
    );

    const taskListId = getConfigValue("TASK_LIST_ID");
    if (!taskListId) {
      throw new Error(
        "Task-Liste nicht gefunden. Überprüfen Sie die Konfiguration."
      );
    }

    const task = {
      title: `${taskTitle} für ${row[COMPANY_COLUMN_INDEX]}`,
      notes: `Details zur Bewerbung: ${row[JOB_DESCRIPTION_COLUMN_INDEX]}`,
      due: getToday().toISOString(), // Fälligkeitsdatum ist heute
    };

    const createdTask = Tasks.Tasks.insert(task, taskListId);
    Logger.log(`[INFO] Task "${createdTask.title}" erfolgreich erstellt.`);

    // Aktualisiere die Tabelle mit dem aktuellen Datum
    const today = Utilities.formatDate(
      getToday(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );
    sheet.getRange(index + 1, columnIndex + 1).setValue(today);
    Logger.log(`[INFO] Datum in der Tabelle aktualisiert: ${today}`);
  } catch (error) {
    Logger.log(`[ERROR] Fehler beim Erstellen der Task: ${error.message}`);
    throw error;
  }
}

/**
 * Erstellt eine E-Mail aus einer Vorlage und sendet sie an die angegebene Adresse.
 * @param {string} templateName - Der Name der E-Mail-Vorlage.
 * @param {Object} placeholderValues - Platzhalterwerte, die in der Vorlage ersetzt werden sollen.
 * @param {string} recipient - Die E-Mail-Adresse des Empfängers.
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @throws {Error} Wenn die Vorlage nicht gefunden wird oder ein Fehler beim Erstellen der E-Mail auftritt.
 */
function createEmailFromTemplate(
  templateName,
  placeholderValues,
  recipient,
  row
) {
  try {
    Logger.log(
      `[INFO] Erstelle E-Mail aus Vorlage "${templateName}" für Empfänger "${recipient}"...`
    );

    const folderId = getConfigValue("TEMPLATES_FOLDER_ID");
    if (!folderId) {
      throw new Error(
        "Templates-Ordner nicht gefunden. Überprüfen Sie die Konfiguration."
      );
    }

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
    const emailSubject = replacePlaceholders(
      subjectTemplate,
      placeholderValues,
      row
    );
    const emailBody = replacePlaceholders(
      emailBodyTemplate,
      placeholderValues,
      row
    );

    // Sende die E-Mail
    const draft = GmailApp.createDraft(recipient, emailSubject, emailBody);
    Logger.log(
      `[INFO] E-Mail-Entwurf erfolgreich erstellt: Betreff = "${emailSubject}"`
    );

    return draft; // Optional: Gibt den erstellten Entwurf zurück
  } catch (error) {
    Logger.log(`[ERROR] Fehler beim Erstellen der E-Mail: ${error.message}`);
    throw error;
  }
}

// 5. Utility-Funktionen

/**
 * Ersetzt Platzhalter im Text durch die entsprechenden Werte.
 * @param {string} text - Der Text mit Platzhaltern.
 * @param {Object} placeholderValues - Ein Objekt mit den Platzhaltern und ihren Werten.
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @returns {string} - Der Text mit ersetzten Platzhaltern.
 */
function replacePlaceholders(text, placeholderValues, row) {
  try {
    Logger.log(`[INFO] Ersetze Platzhalter im Text...`);
    return text.replace(/{{(.*?)}}/g, (match, key) => {
      const value = placeholderValues[key.trim()];
      if (!value) {
        const applicationId = row[APPLICATION_ID_COLUMN_INDEX];
        const companyName =
          row[COMPANY_COLUMN_INDEX] || "Unbekanntes Unternehmen";
        Logger.log(
          `[WARN] Platzhalter "${key.trim()}" nicht gefunden. (Bewerbung ID: ${applicationId}, Firma: ${companyName})`
        );
      }
      return value || match; // Behalte den Platzhalter, wenn kein Wert gefunden wird
    });
  } catch (error) {
    Logger.log(
      `[ERROR] Fehler beim Ersetzen der Platzhalter: ${error.message}`
    );
    throw error;
  }
}

/**
 * Formatiert ein Datum im Format "YYYY-MM-DD".
 * @param {Date|string} date - Das Datum im JavaScript-Datumsformat oder als String.
 * @returns {string} - Das formatierte Datum oder ein leerer String, wenn das Datum ungültig ist.
 */
function formatDate(date) {
  try {
    if (!date) {
      Logger.log("[INFO] Kein Datum übergeben. Rückgabe: Leer");
      return ""; // Kein Datum vorhanden
    }

    Logger.log(`[INFO] Originaler Wert aus dem Sheet: ${date}`);

    // Konvertiere das Datum in ein JavaScript-Datum
    const jsDate = new Date(date);
    if (isNaN(jsDate.getTime())) {
      Logger.log(`[ERROR] Ungültiges Datum: ${date}`);
      return ""; // Ungültiges Datum
    }

    Logger.log(`[INFO] Konvertierter JavaScript-Datum-Wert: ${jsDate}`);

    // Extrahiere Jahr, Monat und Tag
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, "0"); // Monate sind 0-basiert
    const day = String(jsDate.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    Logger.log(`[INFO] Formatiertes Datum (Lokal): ${formattedDate}`);

    return formattedDate;
  } catch (error) {
    Logger.log(`[ERROR] Fehler beim Formatieren des Datums: ${error.message}`);
    throw error;
  }
}
