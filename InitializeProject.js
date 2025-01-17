//*****Script V:5.0 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Einrichtungs-Script -
// InitializeProject.gs

function initializeProject() {
  Logger.log("[INFO] Starte Initialisierung...");
  try {
    // Phase 1: Ressourcen erstellen oder finden
    Logger.log("[INFO] Phase 1: Erstellen oder Überprüfen von Ressourcen...");

    const folder = ensureBewerbungenFolder(); // Hauptordner
    Logger.log(
      `[INFO] Hauptordner erstellt oder gefunden. ID: ${folder.getId()}`
    );

    const templatesFolder = ensureTemplatesFolder(folder); // Templates-Ordner
    Logger.log(
      `[INFO] Templates-Ordner erstellt oder gefunden. ID: ${templatesFolder.getId()}`
    );

    const sheet = ensureBewerbungenSheet(folder); // Google Sheet
    Logger.log(
      `[INFO] Google Sheet erstellt oder gefunden. ID: ${sheet.getId()}`
    );

    const taskListId = ensureTaskList(); // Google Tasks-Liste
    Logger.log(
      `[INFO] Google Tasks-Liste erstellt oder gefunden. ID: ${taskListId}`
    );

    // Phase 2: IDs und persönliche Daten in Config.txt speichern
    Logger.log("[INFO] Phase 2: Speichern der Konfiguration...");
    const configData = {
      FOLDER_ID: folder.getId(),
      TEMPLATES_FOLDER_ID: templatesFolder.getId(),
      SHEET_ID: sheet.getId(),
      TASK_LIST_ID: taskListId,
      MEIN_NAME: "Dein Name",
      MEINE_KONTAKTDATEN: "Deine Kontaktdaten",
    };

    for (const [key, value] of Object.entries(configData)) {
      saveToConfig(key, value);
      Logger.log(`[DEBUG] Gespeichert: ${key} = ${value}`);
    }

    Logger.log(
      "[INFO] Initialisierung abgeschlossen. Alle Ressourcen wurden erstellt und die IDs gespeichert."
    );
  } catch (error) {
    Logger.log(`[ERROR] Initialisierung fehlgeschlagen: ${error.message}`);
    throw error;
  }
}
