//*****Script V:5.0 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// Code.gs

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
const SECOND_FOLLOWUP_COLUMN_INDEX = 8; // Datum der Nachfrage
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
    if (index === 0) return;

    processApplication(row, index, sheet);
  });
}

/**
 * Liefert die HTML-Seite für die Web-App zurück.
 * @param {Object} e - Das Event-Objekt (optional).
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Die HTML-Seite.
 */
function doGet(e) {
  Logger.log("[INFO] Seite wurde neu geladen durch doGet().");
  // Simuliertes Datum aus dem Testmode falls, gesetzt
  const testDate = getToday().toISOString().split("T")[0];
  return HtmlService.createHtmlOutputFromFile("forms.html")
    .addMetaTag(`viewport`, `width=device-width, initial-scale=1.0`) // Viewport Einstellungen
    .append(`<script>var simulatedDate = "${testDate}";</script>`)
    .setTitle("Bewerbungstracker");
  /**
    .setWidth(700)
    .setHeight(900);
    */
}

/**
 * Verarbeitet eine einzelne Bewerbung basierend auf ihrem Status.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */
function processApplication(row, index, sheet) {
  const status = row[STATUS_COLUMN_INDEX];
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
  const today = getToday();
  const dateResponse = row[DATE_RESPONSE_COLUMN_INDEX]
    ? new Date(row[DATE_RESPONSE_COLUMN_INDEX])
    : null;

  const daysSinceSubmission = dateResponse
    ? Math.floor((today - dateResponse) / (1000 * 60 * 60 * 24))
    : Math.floor((today - dateSubmitted) / (1000 * 60 * 60 * 24));

  const placeholderValues = {
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX],
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateSubmitted,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    DATUM_DER_NACHFRAGE: row[SECOND_FOLLOWUP_COLUMN_INDEX]
      ? Utilities.formatDate(
          new Date(row[SECOND_FOLLOWUP_COLUMN_INDEX]),
          Session.getScriptTimeZone(),
          "dd.MM.yyyy"
        )
      : "kein Datum",
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail =
    row[EMAIL_COLUMN_INDEX] || "ACHTUNG.ERSETZEN@exampel.com";

  const actions = {
    // Nach 14 Tagen Eingangsbestätigung nachfragen
    14: () => {
      createEmailFromTemplate(
        "status1_first_request.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Eingangsbestätigung nachfragen",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
    // Nach weiteren 10 Tagen erneut Eingangsbestätigung nachfragen
    24: () => {
      createEmailFromTemplate(
        "status1_second_request.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Erneut Eingangsbestätigung nachfragen",
        row,
        sheet,
        index,
        SECOND_FOLLOWUP_COLUMN_INDEX
      );
    },
    38: () => {
      // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6);
      createTask(
        "Auf Status 6: gesetzt",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
  };

  if (actions[daysSinceSubmission]) {
    actions[daysSinceSubmission]();
  }
}

// Status 2: Eingang bestätigt
function handleStatus2(row, index, sheet) {
  // Validierung für Status 2, Rohwert aus Tabelle
  const rawDateResponse = row[DATE_RESPONSE_COLUMN_INDEX];
  const parsedDateResponse = rawDateResponse ? new Date(rawDateResponse) : null;

  if (!parsedDateResponse || isNaN(parsedDateResponse.getTime())) {
    Logger.log(
      `Fehler in Zeile ${
        index + 1
      }: Ungültiges Datum oder falsches Format in Spalte "Datum Rückmeldung". Erwartet wird das Format YYYY-MM-DD.`
    );
    return;
  }

  const today = getToday();

  const daysSinceResponse = Math.floor(
    (today - parsedDateResponse) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    DATUM_RÜCKMELDUNG: Utilities.formatDate(
      parsedDateResponse,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    BEWERBUNGSDATUM: Utilities.formatDate(
      new Date(row[DATE_SUBMITTED_COLUMN_INDEX]),
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    DATUM_DER_NACHFRAGE: row[SECOND_FOLLOWUP_COLUMN_INDEX]
      ? Utilities.formatDate(
          new Date(row[SECOND_FOLLOWUP_COLUMN_INDEX]),
          Session.getScriptTimeZone(),
          "dd.MM.yyyy"
        )
      : "kein Datum",
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX],
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail =
    row[EMAIL_COLUMN_INDEX] || "ACHTUNG.ERSETZEN@example.com";

  const actions = {
    25: () => {
      createEmailFromTemplate(
        "status2_first_request.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Bearbeitungsstand nachfragen",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
    35: () => {
      createEmailFromTemplate(
        "status2_second_request.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Erneut Bearbeitungsstand nachfragen",
        row,
        sheet,
        index,
        SECOND_FOLLOWUP_COLUMN_INDEX
      );
    },
    49: () => {
      // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6);
      createTask(
        "Auf Status 6: gesetzt",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
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
    : new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = getToday();

  const daysSinceResponse = Math.floor(
    (today - dateResponse) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    DATUM_RÜCKMELDUNG: Utilities.formatDate(
      dateResponse,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    BEWERBUNGSDATUM: Utilities.formatDate(
      new Date(row[DATE_SUBMITTED_COLUMN_INDEX]),
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    DATUM_DER_NACHFRAGE: row[SECOND_FOLLOWUP_COLUMN_INDEX]
      ? Utilities.formatDate(
          new Date(row[SECOND_FOLLOWUP_COLUMN_INDEX]),
          Session.getScriptTimeZone(),
          "dd.MM.yyyy"
        )
      : "kein Datum",
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX],
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail =
    row[EMAIL_COLUMN_INDEX] || "ACHTUNG.ERSETZEN@example.com";

  const actions = {
    25: () => {
      createEmailFromTemplate(
        "status3_last_request.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Erneut Bearbeitungsstand nachfragen",
        row,
        sheet,
        index,
        SECOND_FOLLOWUP_COLUMN_INDEX
      );
    },
    39: () => {
      // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6);
      createTask(
        "Auf Status 6: gesetzt",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
  };

  if (actions[daysSinceResponse]) {
    actions[daysSinceResponse]();
  }
}

// Status 4: Einladung Bewerbungsgespräch
function handleStatus4(row, index, sheet) {
  const interviewDate = new Date(row[INTERVIEW_DATE_COLUMN_INDEX]);
  const today = getToday();

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
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX],
    MEIN_NAME: getConfigValue("MEIN_NAME"),
    MEINE_KONTAKTDATEN: getConfigValue("MEINE_KONTAKTDATEN"),
  };

  const recipientEmail =
    row[EMAIL_COLUMN_INDEX] || "ACHTUNG.ERSETZEN@example.com";

  const actions = {
    20: () => {
      createEmailFromTemplate(
        "status4_followup_interview.txt",
        placeholderValues,
        recipientEmail,
        row
      );
      createTask(
        "Nachfassen nach Gespräch",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
    34: () => {
      // Status auf "Keine Reaktion" setzen
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6);
      createTask(
        "Auf Status 6: gesetzt",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
    },
  };

  if (actions[daysSinceInterview]) {
    actions[daysSinceInterview]();
  }
}

// Status 6: Keine Reaktion
function handleStatus6(row, index, sheet) {
  const dateFollowUp = new Date(row[FIRST_FOLLOWUP_COLUMN_INDEX]);
  const today = getToday();
  const daysSinceFollowUp = Math.floor(
    (today - dateFollowUp) / (1000 * 60 * 60 * 24)
  );

  const actions = {
    90: () => {
      // Erstelle einen Task Bewerbung auf "Status 7: - erfolglos", gesetzt
      createTask(
        "Bewerbung erfolglos",
        row,
        sheet,
        index,
        FIRST_FOLLOWUP_COLUMN_INDEX
      );
      // Auf "Status 7: - erfolglos" setzen
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(7);
    },
  };

  if (actions[daysSinceFollowUp]) {
    actions[daysSinceFollowUp]();
  }
}

// Status 7: Abgelehnt
function handleStatus7(row, index, sheet) {
  // Status 7: Abgelehnt (keine weiteren Aktionen erforderlich)
}

/**
 * Speichert oder aktualisiert die Bewerbung in der Tabelle.
 * Erstellt einen Ordner nur für neue Bewerbungen.
 *
 * @param {Object} formData - Die übermittelten Formulardaten.
 */
function saveApplication(formData) {
  const sheetId = getConfigValue("SHEET_ID");
  const sheet =
    SpreadsheetApp.openById(sheetId).getSheetByName("Bewerbungstracker");
  const data = sheet.getDataRange().getValues();

  // Log Formulardaten
  Logger.log("[DEBUG] Erhaltene Formulardaten: " + JSON.stringify(formData));

  // Überprüfen, ob die Bewerbung bereits existiert (via BewerbungsID)
  const existingRowIndex = data
    .slice(1)
    .findIndex((row) => row[0] === formData.applicationId);

  const newRow = [
    formData.applicationId || Utilities.getUuid(), // BewerbungsID
    formData.unternehmen.trim(), // Unternehmen
    formData.stelle.trim(), // Stelle
    formData.bewerbungsart, // Bewerbungsart
    formData.jobPortal || "", // Optionales Feld
    formData.datum || "", // Datum der Bewerbung
    formData.status || 1, // Status aus formData übernehmen, Standardwert "1"
    formData.datumRueckmeldung || "", // Datum Rückmeldung
    "", // Datum der Nachfrage
    formData.kontakt || "", // Kontakt
    formData.email || "", // E-Mail
    formData.telefon || "", // Telefon
    formData.loginInfo || "", // Login-Information
    formData.datumGespräch || "", // Bewerbungsgespräch Datum
    "", // Bewerbungsgespräch Ort
    formData.link || "", // Link Stellenbeschreibung
    formData.kommentar || "", // Kommentar
  ];

  if (existingRowIndex >= 0) {
    // Aktualisiere bestehende Zeile
    Logger.log(
      `[INFO] Aktualisiere bestehende Bewerbung in Zeile ${
        existingRowIndex + 2
      }.`
    );
    sheet
      .getRange(existingRowIndex + 2, 1, 1, newRow.length)
      .setValues([newRow]);
    Logger.log("[DEBUG] Aktualisierte Daten: " + JSON.stringify(newRow));
  } else {
    // Füge neue Zeile hinzu und erstelle einen Ordner
    Logger.log(
      "[INFO] Neue Bewerbung wird hinzugefügt und ein Ordner erstellt."
    );
    sheet.appendRow(newRow);
    // Ordner für das Unternehmen erstellen
    const folderId = getConfigValue("FOLDER_ID");
    const mainFolder = DriveApp.getFolderById(folderId);
    const companyName = formData.unternehmen.trim();
    let companyFolder = mainFolder.getFoldersByName(companyName);

    if (companyFolder.hasNext()) {
      companyFolder = companyFolder.next();
    } else {
      companyFolder = mainFolder.createFolder(companyName);
      Logger.log(
        `[INFO] Neuer Ordner für Unternehmen "${companyName}" wurde erstellt.`
      );
    }
  }
}

// Dummy_Data für die saveApplication
function testSaveApplication() {
  const dummyData = {
    unternehmen: "Testunternehmen",
    stelle: "Softwareentwickler",
    bewerbungsart: "Online",
    jobPortal: "LinkedIn",
    datum: Utilities.formatDate(
      getToday(),
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
