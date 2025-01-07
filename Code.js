//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -

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
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bewerbungen");
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

  if (daysSinceSubmission == 14) {
    createTask(
      "Eingangsbestätigung nachfragen",
      row,
      sheet,
      index,
      FIRST_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 24) {
    createTask(
      "Erneut Eingangsbestätigung nachfragen",
      row,
      sheet,
      index,
      SECOND_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 38) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 2: Eingang bestätigt
function handleStatus2(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceSubmission = Math.floor(
    (today - dateSubmitted) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSubmission == 25) {
    createTask(
      "Bearbeitungsstand nachfragen",
      row,
      sheet,
      index,
      FIRST_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 35) {
    createTask(
      "Erneut Bearbeitungsstand nachfragen",
      row,
      sheet,
      index,
      SECOND_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 49) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 3: Bearbeitung
function handleStatus3(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceSubmission = Math.floor(
    (today - dateSubmitted) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSubmission == 25) {
    createTask(
      "Bearbeitungsstand prüfen",
      row,
      sheet,
      index,
      FIRST_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 39) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 4: Einladung Bewerbungsgespräch
function handleStatus4(row, index, sheet) {
  const dateSubmitted = new Date(row[DATE_SUBMITTED_COLUMN_INDEX]);
  const today = new Date();
  const daysSinceSubmission = Math.floor(
    (today - dateSubmitted) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSubmission == 20) {
    createTask(
      "Nachfassen nach Gespräch",
      row,
      sheet,
      index,
      FIRST_FOLLOWUP_COLUMN_INDEX
    );
  } else if (daysSinceSubmission == 34) {
    sheet.getRange(index + 1, STATUS_COLUMN_INDEX + 1).setValue(6); // Status auf "Keine Reaktion" setzen
  }
}

// Status 5: Erfolgreich
function handleStatus5(row, index, sheet) {
  Logger.log(
    `Bewerbung bei ${row[COMPANY_COLUMN_INDEX]} erfolgreich abgeschlossen.`
  );
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
  const task = {
    title: `${taskTitle} für ${row[COMPANY_COLUMN_INDEX]}`,
    notes: `Details zur Bewerbung: ${row[JOB_DESCRIPTION_COLUMN_INDEX]}`,
    due: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Frist in 7 Tagen
  };
  Tasks.Tasks.insert(task, "Bewerbungen");

  // Aktualisiere die Tabelle mit dem Datum der Nachfassaktion
  const today = new Date();
  sheet.getRange(index + 1, columnIndex + 1).setValue(today);
}
