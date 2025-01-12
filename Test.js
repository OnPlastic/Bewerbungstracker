//*****Script V:0.2 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Testszenarien -
// Test.gs


/**
 * Testmodus zur Simulation des Bewerbungsablauf - Zeitraffer
 */

// Testmodus: Hier aktivieren oder deaktivieren
const TEST_MODE = false; // flase/true

// Testdatum: Hier das simulierte Datum festlegen
const TEST_DATE = new Date("2025-03-03");

/**
 * Liefert das heutige Datum oder das simulierte Testdatum, falls der Testmodus aktiv ist.
 * @returns {Date} Das aktuelle oder simulierte Datum.
 */
function getToday() {
  return TEST_MODE ? TEST_DATE : new Date();
}


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
 * Testet, ob das Google Sheet korrekt erstellt wurde
 * und überprüft, ob die notwendigen Spalten vorhanden sind.
 */
function testBewerbungenSheet() {
  const sheetId = getConfigValue("SHEET_ID");
  if (!sheetId) {
    Logger.log("Fehler: Google Sheet wurde nicht erstellt.");
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(sheetId);
  if (spreadsheet) {
    const sheet = spreadsheet.getSheets()[0];
    const columns = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

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

    const missingColumns = requiredColumns.filter(
      (col) => !columns.includes(col)
    );
    if (missingColumns.length > 0) {
      Logger.log(
        `Fehler: Fehlende Spalten im Google Sheet: ${missingColumns.join(", ")}`
      );
    } else {
      Logger.log(
        `Google Sheet existiert und enthält alle notwendigen Spalten. ID: ${sheetId}`
      );
    }
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
 * Testet, ob die erforderlichen Template-Dateien im Templates-Ordner vorhanden sind.
 */
function testTemplateFiles() {
  const templatesFolderId = getConfigValue("TEMPLATES_FOLDER_ID");
  const folder = DriveApp.getFolderById(templatesFolderId);
  const requiredFiles = [
    "status1_first_request.txt",
    "status1_second_request.txt",
  ];

  requiredFiles.forEach((fileName) => {
    const file = folder.getFilesByName(fileName);
    if (file.hasNext()) {
      Logger.log(`Template-Datei '${fileName}' existiert.`);
    } else {
      Logger.log(
        `Fehler: Template-Datei '${fileName}' konnte nicht gefunden werden.`
      );
    }
  });
}

/**
 * Testet, ob die Config.js Datei korrekt erstellt wurde
 * und die erwarteten Schlüssel-Wert-Paare enthält.
 */
function testConfigFile() {
  const folderId = getConfigValue("FOLDER_ID");
  const folder = DriveApp.getFolderById(folderId);
  const configFile = folder.getFilesByName("Config.js");

  if (!configFile.hasNext()) {
    Logger.log("Fehler: Config.js Datei wurde nicht erstellt.");
    return;
  }

  const content = configFile.next().getBlob().getDataAsString();
  const requiredKeys = [
    "FOLDER_ID",
    "TEMPLATES_FOLDER_ID",
    "SHEET_ID",
    "TASK_LIST_ID",
    "MEIN_NAME",
    "MEINE_KONTAKTDATEN",
  ];

  requiredKeys.forEach((key) => {
    if (!content.includes(`const ${key} =`)) {
      Logger.log(`Fehler: Schlüssel '${key}' fehlt in der Config.js.`);
    } else {
      Logger.log(`Schlüssel '${key}' ist in der Config.js vorhanden.`);
    }
  });
}

/**
 * Testet das Erstellen einer Test-Aufgabe in Google Tasks.
 */
function testCreateTask() {
  const taskListId = getConfigValue("TASK_LIST_ID");
  if (!taskListId) {
    Logger.log("Fehler: Task-Liste wurde nicht gefunden.");
    return;
  }

  const task = {
    title: "Test-Aufgabe für Bewerbungstracker",
    notes: "Dies ist eine automatisch erstellte Test-Aufgabe.",
    due: new Date().toISOString(), // Setze das Fälligkeitsdatum auf heute
  };

  try {
    const createdTask = Tasks.Tasks.insert(task, taskListId);
    Logger.log(`Test-Aufgabe erstellt. ID: ${createdTask.id}`);
  } catch (e) {
    Logger.log(`Fehler beim Erstellen der Test-Aufgabe: ${e.message}`);
  }
}

/**
 * Testet das Erstellen einer Test-E-Mail.
 */
function testCreateEmail() {
  const templateFileName = "status1_first_request.txt";
  const placeholderValues = {
    BEWERBUNGSDATUM: "01.01.2025",
    STELLE: "Teststelle",
    UNTERNEHMEN: "Testunternehmen",
    ANSPRECHPARTNER: "Herr Mustermann",
    MEIN_NAME: "Max Mustermann",
    MEINE_KONTAKTDATEN: "max.mustermann@example.com",
  };

  try {
    createTestEmailFromTemplate(templateFileName, placeholderValues);
    Logger.log(`Test-E-Mail erfolgreich im Entwürfe-Ordner erstellt.`);
  } catch (e) {
    Logger.log(`Fehler beim Erstellen der Test-E-Mail: ${e.message}`);
  }
}

/**
 * Erstellt eine Test-E-Mail basierend auf einer Template-Datei.
 *
 * Diese Funktion nutzt die Platzhalter aus der angegebenen Datei und ersetzt sie durch Beispielwerte.
 * Die E-Mail wird an "test@example.com" im Entwurfsordner gesendet.
 *
 * @param {string} templateFileName - Der Name der Template-Datei (z. B. 'status1_first_request.txt').
 */
function createTestEmailFromTemplate(templateFileName) {
  const folderId = getConfigValue("TEMPLATES_FOLDER_ID");
  const templatesFolder = DriveApp.getFolderById(folderId);
  const file = templatesFolder.getFilesByName(templateFileName);

  if (!file.hasNext()) {
    Logger.log(
      `Fehler: Die Template-Datei '${templateFileName}' wurde im Ordner 'templates' nicht gefunden.`
    );
    return;
  }

  const templateContent = file.next().getBlob().getDataAsString();

  // Beispielwerte für die Platzhalter
  const placeholderValues = {
    BEWERBUNGSDATUM: "01.01.2025",
    STELLE: "Softwareentwickler",
    UNTERNEHMEN: "Beispiel GmbH",
    ANSPRECHPARTNER: "Herr Muster",
    MEIN_NAME: "Max Mustermann",
    MEINE_KONTAKTDATEN: "max.mustermann@example.com",
  };

  // Platzhalter im Template ersetzen
  const filledTemplate = replacePlaceholders(
    templateContent,
    placeholderValues
  );

  // Betreff und Body aufteilen
  const [subjectLine, ...bodyLines] = filledTemplate.split("\n");
  const subject = subjectLine.replace("Betreff: ", "").trim();
  const body = bodyLines.join("\n").trim();

  // Festlegen einer Test-Empfängeradresse
  const recipientEmail = "test@example.com";

  // E-Mail im Entwürfe-Ordner erstellen
  GmailApp.createDraft(recipientEmail, subject, body);
  Logger.log(
    `Test-E-Mail mit Betreff "${subject}" wurde an "${recipientEmail}" im Entwürfe-Ordner erstellt.`
  );
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
  testTemplateFiles();
  testCreateTask();
  testCreateEmail();
  Logger.log("Tests abgeschlossen.");
}



// off Topic, Problem der Datums Zellen

function testDateFormat(rowIndex, columnIndex) {
  const sheetId = getConfigValue("SHEET_ID"); // Holt die ID aus der Konfiguration
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName("Bewerbungstracker"); // Genaues Tabellenblatt

  if (!sheet) {
    throw new Error(`Das Tabellenblatt "Bewerbungstracker" existiert nicht.`);
  }

  const cell = sheet.getRange(rowIndex, columnIndex);

  const rawValue = cell.getValue(); // Rohwert der Zelle
  const displayedValue = cell.getDisplayValue(); // Angezeigter Wert der Zelle

  Logger.log(`Rohwert: ${rawValue} (${typeof rawValue})`);
  Logger.log(`Angezeigter Wert: ${displayedValue}`);

  if (rawValue instanceof Date && !isNaN(rawValue.getTime())) {
    Logger.log(`Google Sheets hat ein gültiges Datum erkannt: ${rawValue}`);
  } else {
    Logger.log("Google Sheets hat KEIN Datum erkannt.");
  }
}
// Kommentar entfernen zum ausfürhren
// testDateFormat(2, 8); // Zelle in Zeile 2, Spalte 8 prüfen
