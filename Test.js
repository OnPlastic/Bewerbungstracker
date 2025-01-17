//*****Script V:5.0-final A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Testszenarien -
// Test.gs

/**
 * Testmodus zur Simulation des Bewerbungsablaufs - Zeitraffer
 */

// Testmodus: Hier aktivieren oder deaktivieren
const TEST_MODE = false; // false/true

// Testdatum: Hier das simulierte Datum festlegen
const TEST_DATE = new Date("2025-02-07");

/**
 * Liefert das heutige Datum oder das simulierte Testdatum, falls der Testmodus aktiv ist.
 * @returns {Date} Das aktuelle oder simulierte Datum.
 */
function getToday() {
  return TEST_MODE ? TEST_DATE : new Date();
}

/**
 * Überprüft, ob eine Ressource existiert, und gibt entsprechende Logs aus.
 * @param {string} resourceId - Die ID der Ressource.
 * @param {string} resourceName - Der Name der Ressource.
 * @param {string} resourceType - Der Typ der Ressource (z. B. "Ordner", "Sheet").
 * @returns {boolean} True, wenn die Ressource existiert, sonst False.
 */
function checkResourceExists(resourceId, resourceName, resourceType) {
  try {
    switch (resourceType) {
      case "Folder":
        const folder = DriveApp.getFolderById(resourceId);
        Logger.log(
          `[INFO] ${resourceType} "${resourceName}" existiert. ID: ${resourceId}`
        );
        return true;
      case "Sheet":
        const sheet = SpreadsheetApp.openById(resourceId);
        Logger.log(
          `[INFO] ${resourceType} "${resourceName}" existiert. ID: ${resourceId}`
        );
        return true;
      case "TaskList":
        const taskLists = Tasks.Tasklists.list().items || [];
        if (taskLists.find((list) => list.id === resourceId)) {
          Logger.log(
            `[INFO] ${resourceType} "${resourceName}" existiert. ID: ${resourceId}`
          );
          return true;
        }
        break;
      default:
        Logger.log(`[ERROR] Unbekannter Ressourcentyp: ${resourceType}`);
        return false;
    }
  } catch (error) {
    Logger.log(
      `[ERROR] ${resourceType} "${resourceName}" existiert nicht oder konnte nicht überprüft werden: ${error.message}`
    );
    return false;
  }
}

/**
 * Testet, ob der Ordner "Bewerbungen" korrekt erstellt wurde.
 */
function testBewerbungenFolder() {
  const folderId = getConfigValue("FOLDER_ID");
  checkResourceExists(folderId, "Bewerbungen", "Folder");
}

/**
 * Testet, ob das Google Sheet korrekt erstellt wurde
 * und überprüft, ob die notwendigen Spalten vorhanden sind.
 */
function testBewerbungenSheet() {
  const sheetId = getConfigValue("SHEET_ID");
  if (!checkResourceExists(sheetId, "Bewerbungstracker", "Sheet")) return;

  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheets()[0];
  const columns = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

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
      `[ERROR] Fehlende Spalten im Google Sheet: ${missingColumns.join(", ")}`
    );
  } else {
    Logger.log(
      `[INFO] Google Sheet enthält alle notwendigen Spalten. ID: ${sheetId}`
    );
  }
}

/**
 * Testet, ob die Task-Liste korrekt erstellt wurde.
 */
function testTaskList() {
  const taskListId = getConfigValue("TASK_LIST_ID");
  checkResourceExists(taskListId, "Bewerbungen", "TaskList");
}

/**
 * Testet, ob der Templates-Ordner korrekt erstellt wurde.
 */
function testTemplatesFolder() {
  const templatesFolderId = getConfigValue("TEMPLATES_FOLDER_ID");
  checkResourceExists(templatesFolderId, "Templates", "Folder");
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
      Logger.log(`[INFO] Template-Datei "${fileName}" existiert.`);
    } else {
      Logger.log(`[ERROR] Template-Datei "${fileName}" fehlt.`);
    }
  });
}

/**
 * Testet das Erstellen einer Test-Aufgabe in Google Tasks.
 */
function testCreateTask() {
  const taskListId = getConfigValue("TASK_LIST_ID");
  if (!taskListId) {
    Logger.log("[ERROR] Task-Liste wurde nicht gefunden.");
    return;
  }

  const task = {
    title: "Test-Aufgabe für Bewerbungstracker",
    notes: "Dies ist eine automatisch erstellte Test-Aufgabe.",
    due: new Date().toISOString(),
  };

  try {
    const createdTask = Tasks.Tasks.insert(task, taskListId);
    Logger.log(`[INFO] Test-Aufgabe erstellt. ID: ${createdTask.id}`);
  } catch (e) {
    Logger.log(`[ERROR] Fehler beim Erstellen der Test-Aufgabe: ${e.message}`);
  }
}

/**
 * Testet das Erstellen einer Test-E-Mail.
 */
function testCreateEmail() {
  const templateFileName = "status1_first_request.txt";

  try {
    createTestEmailFromTemplate(templateFileName);
    Logger.log(`[INFO] Test-E-Mail erfolgreich im Entwürfe-Ordner erstellt.`);
  } catch (e) {
    Logger.log(`[ERROR] Fehler beim Erstellen der Test-E-Mail: ${e.message}`);
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
      `[ERROR] Die Template-Datei "${templateFileName}" wurde im Ordner "templates" nicht gefunden.`
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
    `[INFO] Test-E-Mail mit Betreff "${subject}" wurde an "${recipientEmail}" im Entwürfe-Ordner erstellt.`
  );
}

/**
 * Führt alle Tests aus.
 */
function runAllTests() {
  Logger.log("[INFO] Starte Tests...");
  testBewerbungenFolder();
  testBewerbungenSheet();
  testTaskList();
  testTemplatesFolder();
  testTemplateFiles();
  testCreateTask();
  testCreateEmail();
  Logger.log("[INFO] Tests abgeschlossen.");
}
