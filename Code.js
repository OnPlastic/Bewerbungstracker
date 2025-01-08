//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// Code.js

/**
 * Initialisiert das Projekt, indem es sicherstellt, dass der Ordner "Bewerbungen"
 * und das zugehörige Google Sheet korrekt eingerichtet sind.
 *
 * Diese Funktion kann verwendet werden, um die grundlegende Infrastruktur des Bewerbungstrackers
 * vor der ersten Ausführung einzurichten.
 */
function initializeProject() {
  ensureBewerbungenSheet();
}

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
 * Verarbeitet eine einzelne Bewerbung basierend auf ihrem Status.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */
function processApplication(row, index, sheet) {
  const status = row[STATUS_COLUMN_INDEX]; // Spalte mit dem Status
  switch (status) {
    case 1:
      handleStatus1(row, index, sheet);
      break;
    case 2:
      handleStatus2(row, index, sheet);
      break;
    case 3:
      handleStatus3(row, index, sheet);
      break;
    case 4:
      handleStatus4(row, index, sheet);
      break;
    case 5:
      handleStatus5(row, index, sheet);
      break;
    case 6:
      handleStatus6(row, index, sheet);
      break;
    case 7:
      handleStatus7(row, index, sheet);
      break;
  }
}

/**
 * Behandelt Bewerbungen mit Status 1 (Beworben).
 * Erstellt Tasks für Nachfassaktionen und aktualisiert den Status, wenn nötig.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */
function handleStatus1(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceSubmission = Math.floor(
    (today - dateSubmitted) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateSubmitted,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    MEIN_NAME: "Dein Name", // Dynamisch anpassen, falls in Tabelle vorhanden
    MEINE_KONTAKTDATEN: "Deine Kontaktdaten", // Dynamisch anpassen, falls in Tabelle vorhanden
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX]; // Spalte für die Firmen E-Mail-Adresse

  if (daysSinceSubmission == 14) {
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
  } else if (daysSinceSubmission == 24) {
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
  } else if (daysSinceSubmission == 38) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 2: Eingang bestätigt
function handleStatus2(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const lastFollowUpDate = new Date(
    row[FIRST_FOLLOWUP_COLUMN_INDEX] || dateSubmitted
  );
  const today = new Date();
  const daysSinceLastFollowUp = Math.floor(
    (today - lastFollowUpDate) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateSubmitted,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX] || "Ansprechpartner",
    MEIN_NAME: "Dein Name",
    MEINE_KONTAKTDATEN: "Deine Kontaktdaten",
    DATUM_DER_NACHFRAGE: Utilities.formatDate(
      lastFollowUpDate,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX]; // Spalte für die Firmen E-Mail-Adresse

  if (daysSinceLastFollowUp === 25) {
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
  } else if (daysSinceLastFollowUp === 35) {
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
  } else if (daysSinceLastFollowUp === 49) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 3: Bearbeitung
function handleStatus3(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const lastFollowUpDate = new Date(
    row[FIRST_FOLLOWUP_COLUMN_INDEX] || dateSubmitted
  );
  const today = new Date();
  const daysSinceLastFollowUp = Math.floor(
    (today - lastFollowUpDate) / (1000 * 60 * 60 * 24)
  );

  const placeholderValues = {
    BEWERBUNGSDATUM: Utilities.formatDate(
      dateSubmitted,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
    STELLE: row[JOB_DESCRIPTION_COLUMN_INDEX],
    UNTERNEHMEN: row[COMPANY_COLUMN_INDEX],
    ANSPRECHPARTNER: row[CONTACT_PERSON_COLUMN_INDEX] || "Ansprechpartner",
    MEIN_NAME: "Dein Name",
    MEINE_KONTAKTDATEN: "Deine Kontaktdaten",
    DATUM_DER_NACHFRAGE: Utilities.formatDate(
      lastFollowUpDate,
      Session.getScriptTimeZone(),
      "dd.MM.yyyy"
    ),
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX]; // Spalte für die Firmen E-Mail-Adresse

  if (daysSinceLastFollowUp === 25) {
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
  } else if (daysSinceLastFollowUp === 39) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }

  // Zusätzliche Rückmeldungsprüfung
  const response = row[RESPONSE_COLUMN_INDEX] || ""; // Hier sollte der Rückmeldungsstatus aus der Tabelle gelesen werden

  if (response.toLowerCase().includes("absage")) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(7); // Status auf "Abgelehnt" setzen
  } else if (response.toLowerCase().includes("einladung")) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(4); // Status auf "Einladung Bewerbungsgespräch" setzen
  } else if (response.toLowerCase().includes("noch in bearbeitung")) {
    const daysSinceResponse = Math.floor(
      (today - new Date(row[RESPONSE_DATE_COLUMN_INDEX])) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceResponse >= 14) {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
    } else if (daysSinceResponse >= 90) {
      sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(7); // Status auf "Abgelehnt" setzen
    }
  }
}

// Status 4: Einladung Bewerbungsgespräch
function handleStatus4(row, index, sheet) {
  const interviewDate = new Date(row[INTERVIEW_DATE_COLUMN_INDEX]);
  const today = new Date();
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
    MEIN_NAME: "Dein Name",
    MEINE_KONTAKTDATEN: "Deine Kontaktdaten",
  };

  const recipientEmail = row[EMAIL_COLUMN_INDEX]; // Spalte für die Firmen E-Mail-Adresse

  if (daysSinceInterview === 20) {
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
  } else if (daysSinceInterview === 34) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 6: Keine Reaktion
function handleStatus6(row, index, sheet) {
  const dateNoResponse = new Date(row[NO_RESPONSE_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceNoResponse = Math.floor(
    (today - dateNoResponse) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceNoResponse == 90) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(7); // Status auf "Abgelehnt" setzen
  }
}

/**
 * Behandelt Bewerbungen mit Status 7 (Abgelehnt).
 * Diese Funktion markiert die Bewerbung als endgültig abgeschlossen.
 *
 * @param {Array} row - Die Zeile der Tabelle, die die Bewerbung darstellt.
 * @param {number} index - Der Index der Zeile in der Tabelle.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Das Google Sheet-Objekt.
 */
function handleStatus7(row, index, sheet) {
  Logger.log(
    `Bewerbung bei ${row[COMPANY_COLUMN_INDEX]} ist endgültig abgelehnt.`
  );
  // Keine weiteren Aktionen erforderlich
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
    due: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  Tasks.Tasks.insert(task, taskListId);

  // Aktualisiere die Tabelle mit dem Datum der Nachfassaktion
  const today = new Date();
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

  // Ordner für das Unternehmen erstellen
  const companyName = formData.unternehmen;
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
    formData.unternehmen,
    formData.stelle,
    formData.bewerbungsart,
    formData.jobPortal,
    formData.datum,
    1, // Status
    "", // Eingang bestätigt
    "", // Datum der Nachfrage
    formData.kontakt,
    formData.email,
    formData.telefon,
    formData.loginInfo,
    "", // Bewerbungsgespräch Datum
    "", // Bewerbungsgespräch Ort
    formData.link,
    formData.kommentar,
  ];

  sheet.appendRow(newRow);
}
