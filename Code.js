//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// Code.js

// Globale Konstanten
const APPLICATION_ID_COLUMN_INDEX = 0; // BewerbungsID
const COMPANY_COLUMN_INDEX = 1; // Unternehmen
const JOB_DESCRIPTION_COLUMN_INDEX = 2; // Stelle
const APPLICATION_TYPE_COLUMN_INDEX = 3; // Bewerbungsart
const JOB_PORTAL_COLUMN_INDEX = 4; // Jobportal
const DATE_SUBMITTED_COLUMN_INDEX = 5; // Datum der Bewerbung
const STATUS_COLUMN_INDEX = 6; // Status
const DATE_RESPONSE_COLUMN_INDEX = 7; // Datum Rückmeldung
const FIRST_FOLLOWUP_COLUMN_INDEX = 8; // Datum der Nachfrage
const CONTACT_PERSON_COLUMN_INDEX = 9; // Kontakt
const EMAIL_COLUMN_INDEX = 10; // E-Mail
const PHONE_COLUMN_INDEX = 11; // Telefon
const LOGIN_INFO_COLUMN_INDEX = 12; // Login-Info
const INTERVIEW_DATE_COLUMN_INDEX = 13; // Bewerbungsgespräch Datum
const INTERVIEW_LOCATION_COLUMN_INDEX = 14; // Bewerbungsgespräch Ort
const LINK_COLUMN_INDEX = 15; // Link
const COMMENTS_COLUMN_INDEX = 16; // Kommentar

/**
 * Hauptfunktion, die von einem Trigger gestartet wird.
 * Sie durchläuft alle Bewerbungen in der Tabelle und delegiert die Verarbeitung
 * an die entsprechende Status-Handler-Funktion.
 */
function mainProcess() {
  const sheetId = getConfigValue("SHEET_ID");
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName("Bewerbungstracker");

  const data = sheet.getDataRange().getValues();
  data.forEach((row, index) => {
    if (index === 0) return; // Überspringe die Kopfzeile
    processApplication(row, index, sheet);
  });
}

/**
 * Liefert die HTML-Seite für die Web-App zurück.
 * @param {Object} e - Das Event-Objekt (optional).
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Die HTML-Seite.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("forms.html")
    .setTitle("Bewerbungstracker")
    .setWidth(700)
    .setHeight(900);
}

/**
 * Verarbeitet eine einzelne Bewerbung basierend auf ihrem Status.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */
function processApplication(row, index, sheet) {
  const status = row[STATUS_COLUMN_INDEX]; // Spalte mit dem Status
  const statusHandlers = {
    1: handleStatus1,
    2: handleStatus2,
    3: handleStatus3,
    4: handleStatus4,
    6: handleStatus6,
    7: handleStatus7,
  };

  if (statusHandlers[status]) {
    statusHandlers[status](row, index, sheet);
  }
}

/**
 * Erstellt Tasks für Nachfassaktionen, generiert E-Mails, Tasks, und aktualisiert den Status, wenn nötig.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */

// Status 1: Beworben
function handleStatus1(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = new Date();
  const dateResponse = row[DATE_RESPONSE_COLUMN_INDEX]
    ? new Date(row[DATE_RESPONSE_COLUMN_INDEX])
    : null;

  const daysSinceSubmission = dateResponse
    ? Math.floor((today - dateResponse) / (1000 * 60 * 60 * 24))
    : Math.floor((today - dateSubmitted) / (1000 * 60 * 60 * 24));

  const placeholderValues = {
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateSubmitted,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX];

  const actions = {
    // Nach 14 Tagen Eingangsbestätigung nachfragen
    14: () => {
      createTask(
        "Eingangsbestätigung nachfragen",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status1_first_request.txt",
        placeholderValues,
        recipientEmail
      );
    },
    // Nach weiteren 10 Tagen erneut Eingangsbestätigung nachfragen
    24: () => {
      createTask(
        "Erneut Eingangsbestätigung nachfragen",
        row,
        sheet,
        index,
        SECOND_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status1_second_request.txt",
        placeholderValues,
        recipientEmail
      );
    },
    // Nach insgesamt 38 Tagen ohne Antwort Status auf "6 - Keine Reaktion" setzen
    38: () => {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, DATE_RESPONSE_COLUMN_INDEX + 1).setValue(today); // Setze Datum Rückmeldung
    },
  };

  if (actions[daysSinceSubmission]) {
    actions[daysSinceSubmission]();
  }
}

// Status 2: Eingang bestätigt
function handleStatus2(row, index, sheet) {
  // Prüfe, ob "Datum Rückmeldung" gesetzt ist, andernfalls Fehler werfen
  if (!row[DATE_RESPONSE_COLUMN_INDEX]) {
    throw new Error(
      `Datum Rückmeldung fehlt in Zeile ${
        index + 1
      }. Kann Status 2 nicht verarbeiten.`
    );
  }

  const dateResponse = new Date(row[DATE_RESPONSE_COLUMN_INDEX]);
  const today = new Date();

  const daysSinceResponse = Math.floor(
    (today - dateResponse) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    DATUM_RÜCKMELDUNG: Utilities.formatDate(
      dateResponse,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX] || "Ansprechpartner",
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX];

  const actions = {
    25: () => {
      createTask(
        "Bearbeitungsstand nachfragen",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status2_first_request.txt",
        placeholderValues,
        recipientEmail
      );
    },
    35: () => {
      createTask(
        "Erneut Bearbeitungsstand nachfragen",
        row,
        sheet,
        index,
        SECOND_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status2_second_request.txt",
        placeholderValues,
        recipientEmail
      );
    },
    49: () => {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, DATE_RESPONSE_COLUMN_INDEX + 1).setValue(today); // Setze Datum Rückmeldung
    },
  };

  if (actions[daysSinceResponse]) {
    actions[daysSinceResponse]();
  }
}

// Status 3: Bearbeitung
function handleStatus3(row, index, sheet) {
  const dateResponse = row[DATE_RESPONSE_COLUMN_INDEX]
    ? new Date(row[DATE_RESPONSE_COLUMN_INDEX])
    : new Date(row[DATE_SUBMITTED_COLUMN_INDEX]); // Fallback auf Bewerbungseingang
  const today = new Date();

  const daysSinceResponse = Math.floor(
    (today - dateResponse) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateResponse,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX] || "Ansprechpartner",
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX];

  const actions = {
    25: () => {
      createTask(
        "Bearbeitungsstand prüfen",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status3_request_update.txt",
        placeholderValues,
        recipientEmail
      );
    },
    39: () => {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, DATE_RESPONSE_COLUMN_INDEX + 1).setValue(today); // Setze Datum Rückmeldung
    },
  };

  if (actions[daysSinceResponse]) {
    actions[daysSinceResponse]();
  }
}

// Status 4: Einladung Bewerbungsgespräch
function handleStatus4(row, index, sheet) {
  const interviewDate = row[INTERVIEW_DATE_COLUMN_INDEX]
    ? new Date(row[INTERVIEW_DATE_COLUMN_INDEX])
    : null; // Kein Fallback, Interviewdatum muss gesetzt sein
  const today = new Date();

  if (!interviewDate) {
    Logger.log(
      `Fehler: Kein Bewerbungsgespräch-Datum für Zeile ${index + 1} gesetzt.`
    );
    return;
  }

  const daysSinceInterview = Math.floor(
    (today - interviewDate) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    GESPRÄCHSDATUM: Utilities.formatDate(
      interviewDate,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX] || "Ansprechpartner",
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX];

  const actions = {
    20: () => {
      createTask(
        "Nachfassen nach Gespräch",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
      createEmailFromTemplate(
        "status4_followup_interview.txt",
        placeholderValues,
        recipientEmail
      );
    },
    34: () => {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, DATE_RESPONSE_COLUMN_INDEX + 1).setValue(today); // Setze Datum Rückmeldung
    },
  };

  if (actions[daysSinceInterview]) {
    actions[daysSinceInterview]();
  }
}

// Status 6: Keine Reaktion
function handleStatus6(row, index, sheet) {
  const dateNoResponse = new Date(row[DATE_RESPONSE_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceNoResponse = Math.floor(
    (today - dateNoResponse) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceNoResponse >= 90) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(7); // Status auf "Abgelehnt" setzen
    sheet.getRange(index + 1, DATE_RESPONSE_COLUMN_INDEX + 1).setValue(today); // Aktualisiere Datum Rückmeldung
  }
}

// Status 7: Abgelehnt
function handleStatus7(row, index, sheet) {
  // Bewerbung ist endgültig abgelehnt, keine weiteren Schritte erforderlich.
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
    due: new Date().toISOString(), // Fälligkeitsdatum ist heute
  };

  Tasks.Tasks.insert(task, taskListId);

  // Aktualisiere die Tabelle mit dem aktuellen Datum
  const today = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd.MM.yyyy"
  );
  sheet.getRange(index + 1, columnIndex + 1).setValue(today);
}

/**
 * Speichert die Bewerbung und erstellt einen Ordner.
 *
 * @param {Object} formData - Die übermittelten Formulardaten.
 */
function saveApplication(formData) {
  const folderId = getConfigValue("FOLDER_ID");
  const mainFolder = DriveApp.getFolderById(folderId);

  // Ordner für das Unternehmen erstellen oder abrufen
  const companyName = formData.unternehmen.trim();
  let companyFolder = mainFolder.getFoldersByName(companyName);

  if (companyFolder.hasNext()) {
    companyFolder = companyFolder.next();
  } else {
    companyFolder = mainFolder.createFolder(companyName);
  }

  // Bewerbung in die Tabelle einfügen
  const sheetId = getConfigValue("SHEET_ID");
  const sheet =
    SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");

  const newRow = [
    Utilities.getUuid(), // BewerbungsID
    formData.unternehmen.trim(),
    formData.stelle.trim(),
    formData.bewerbungsart,
    formData.jobPortal || "", // Optionales Feld
    formData.datum,
    1, // Status: Standardmäßig "1" (Beworben)
    "", // Eingang bestätigt
    "", // Datum der Nachfrage
    formData.kontakt || "",
    formData.email || "",
    formData.telefon || "",
    formData.loginInfo || "",
    "", // Bewerbungsgespräch Datum
    "", // Bewerbungsgespräch Ort
    formData.link || "",
    formData.kommentar || "",
  ];

  sheet.appendRow(newRow);
}

// Dummy_Data für die saveApplication
function testSaveApplication() {
  const dummyData = {
    unternehmen: "Testunternehmen",
    stelle: "Softwareentwickler",
    bewerbungsart: "Online",
    jobPortal: "LinkedIn",
    datum: Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    ), // Aktuelles Datum
    kontakt: "Herr Mustermann",
    email: "test@example.com",
    telefon: "123456789",
    loginInfo: "Benutzername: test, Passwort: geheim",
    link: "https://example.com",
    kommentar: "Dies ist ein Testkommentar.",
  };

  saveApplication(dummyData);
}
