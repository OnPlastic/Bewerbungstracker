//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Einrichtungs-Script -
// InitializeProject.js

function initializeProject() {
  const folder = ensureBewerbungenFolder();
  const sheet = ensureBewerbungenSheet();
  const taskList = ensureTaskList();
  const templatesFolder = ensureTemplatesFolder();

  Logger.log(
    "Projekt erfolgreich initialisiert. IDs in Config.js gespeichert."
  );
  Logger.log(`Ordner ID: ${folder.getId()}`);
  Logger.log(`Sheet ID: ${getConfigValue("SHEET_ID")}`);
  Logger.log(`Task-Liste ID: ${getConfigValue("TASK_LIST_ID")}`);
  Logger.log(`Templates-Ordner ID: ${getConfigValue("TEMPLATES_FOLDER_ID")}`);
}
