//*****Script V:2.1-final A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Einrichtungs-Script -
// InitializeProject.gs

function initializeProject() {
  Logger.log("Starte Initialisierung...");

  // Phase 1: Ressourcen erstellen oder finden
  const folder = ensureBewerbungenFolder(); // Hauptordner
  Logger.log(`Hauptordner erstellt oder gefunden. ID: ${folder.getId()}`);

  const templatesFolder = ensureTemplatesFolder(folder); // Templates-Ordner
  Logger.log(
    `Templates-Ordner erstellt oder gefunden. ID: ${templatesFolder.getId()}`
  );

  const sheet = ensureBewerbungenSheet(folder); // Google Sheet
  Logger.log(`Google Sheet erstellt oder gefunden. ID: ${sheet.getId()}`);

  const taskListId = ensureTaskList(); // Google Tasks-Liste
  Logger.log(`Google Tasks-Liste erstellt oder gefunden. ID: ${taskListId}`);

  // Phase 2: IDs und persönliche Daten in Config.js speichern
  saveToConfig("FOLDER_ID", folder.getId());
  saveToConfig("TEMPLATES_FOLDER_ID", templatesFolder.getId());
  saveToConfig("SHEET_ID", sheet.getId());
  saveToConfig("TASK_LIST_ID", taskListId);

  // Zusätzliche persönliche Daten speichern
  saveToConfig("MEIN_NAME", "Dein Name");
  saveToConfig("MEINE_KONTAKTDATEN", "Deine Kontaktdaten");

  Logger.log(
    "Initialisierung abgeschlossen. Alle Ressourcen wurden erstellt und die IDs gespeichert."
  );
}
