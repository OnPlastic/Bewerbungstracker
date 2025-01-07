//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Testszenarien -
// Test.js

/**
 * Testet, ob die Google-Taskliste "Bewerbungen" existiert.
 * Gibt die ID der Taskliste über Logger.log aus.
 */
function testEnsureTaskList() {
  const taskLists = Tasks.Tasklists.list().items;

  if (taskLists) {
    const taskList = taskLists.find((list) => list.title === "Bewerbungen");
    if (taskList) {
      Logger.log(`Taskliste "Bewerbungen" existiert. ID: ${taskList.id}`);
    } else {
      Logger.log('Taskliste "Bewerbungen" existiert nicht.');
    }
  } else {
    Logger.log(
      'Taskliste "Bewerbungen" existiert nicht. Sie kann mit "ensureTaskList()" erstellt werden.'
    );
  }
}

/**
 * Erstellt einen Test-Task in der Google-Taskliste "Bewerbungen".
 * Gibt über Logger.log eine Erfolgsmeldung aus.
 */
function createTestTask() {
  const task = {
    title: "Testaufgabe für Bewerbungstracker",
    notes: "Dies ist eine Testaufgabe, um die Task-Integration zu prüfen",
    due: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Frist in 7 Tagen
  };

  try {
    const result = Tasks.Tasks.insert(task, TASK_LIST_ID);
    Logger.log(`Task erfolgreich erstellt: ${result.title}`);
  } catch (e) {
    Logger.log("Fehler beim Erstellen des Test-Tasks: " + e.message);
  }
}

/**
 * Testet, ob das Google Sheet "Bewerbungstracker" im Ordner "Bewerbungen" existiert.
 * Gibt das Ergebnis (Vorhanden oder erstellt) über Logger.log aus.
 */
function testEnsureBewerbungenSheet() {
  const folder = ensureBewerbungenFolder(); // Sicherstellen, dass der Ordner existiert
  const files = folder.getFilesByName("Bewerbungstracker");

  if (files.hasNext()) {
    const file = files.next();
    Logger.log(
      `Das Sheet "Bewerbungstracker" existiert bereits. ID: ${file.getId()}`
    );
  } else {
    Logger.log(
      'Das Sheet "Bewerbungstracker" existiert nicht. Es kann mit "ensureBewerbungenSheet()" erstellt werden.'
    );
  }
}

/**
 * Testet, ob der Google Drive-Ordner "Bewerbungen" existiert.
 * Gibt das Ergebnis (Vorhanden oder erstellt) über Logger.log aus.
 */
function testEnsureBewerbungenFolder() {
  const folder = ensureBewerbungenFolder();

  if (folder) {
    Logger.log(`Ordner "Bewerbungen" existiert. ID: ${folder.getId()}`);
  } else {
    Logger.log(
      'Ordner "Bewerbungen" konnte nicht gefunden oder erstellt werden.'
    );
  }
}

/**
 * Erstellt eine Test-E-Mail in Gmail basierend auf einem statischen Template.
 * In der finalen Implementierung werden die Werte aus der Tabelle gelesen.
 */
function testCreateEmailDraft() {
  // Beispiel-Template
  const emailTemplate = {
    subject: "Nachfrage: Eingangsbestätigung Ihrer Bewerbung",
    body: "Sehr geehrte/r {{ANSPRECHPARTNER}},\n\n" +
          "am {{BEWERBUNGSDATUM}} habe ich meine Bewerbung für die Stelle \"{{STELLE}}\" bei Ihrem Unternehmen, {{UNTERNEHMEN}}, eingereicht. Leider habe ich bisher keine Eingangsbestätigung erhalten und wollte höflich nachfragen, ob meine Unterlagen bei Ihnen eingegangen sind.\n\n" +
          "Für Rückfragen stehe ich Ihnen gerne zur Verfügung.\n\nMit freundlichen Grüßen,\n\n{{MEIN_NAME}}\n{{MEINE_KONTAKTDATEN}}"
  };

  // Statische Dummy-Daten für den Test
  const placeholderValues = {
    "{{ANSPRECHPARTNER}}": "Frau Schmidt", // In der Praxis: row[ANSPRECHPARTNER_COLUMN_INDEX]
    "{{BEWERBUNGSDATUM}}": "01.01.2025", // In der Praxis: row[BEWERBUNGSDATUM_COLUMN_INDEX]
    "{{STELLE}}": "Softwareentwickler", // In der Praxis: row[STELLE_COLUMN_INDEX]
    "{{UNTERNEHMEN}}": "Beispiel GmbH", // In der Praxis: row[UNTERNEHMEN_COLUMN_INDEX]
    "{{MEIN_NAME}}": "Max Mustermann", // In der Praxis: Eigenen Namen aus Konfiguration lesen
    "{{MEINE_KONTAKTDATEN}}": "max.mustermann@example.com\nTel.: 0123 456789" // In der Praxis: Eigenen Kontakt aus Konfiguration lesen
  };

  // Platzhalter im Template ersetzen
  const subject = replacePlaceholders(emailTemplate.subject, placeholderValues);
  const body = replacePlaceholders(emailTemplate.body, placeholderValues);

  // E-Mail-Entwurf erstellen
  GmailApp.createDraft("", subject, body);
  Logger.log("Test-E-Mail-Entwurf wurde erstellt.");
}

/**
 * Ersetzt Platzhalter in einem Text durch konkrete Werte.
 *
 * @param {string} template - Der Text mit Platzhaltern.
 * @param {Object} values - Ein Objekt mit Platzhalter-Wert-Paaren.
 * @returns {string} Der Text mit ersetzten Platzhaltern.
 */
function replacePlaceholders(template, values) {
  let result = template;
  for (const placeholder in values) {
    result = result.replace(new RegExp(placeholder, "g"), values[placeholder]);
  }
  return result;
}

