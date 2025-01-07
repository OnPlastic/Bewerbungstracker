//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Einrichtungs-Script -
// InitializeProject.js

function initializeProject() {
  const folder = ensureBewerbungenFolder();
  const sheet = ensureBewerbungenSheet();
  const taskList = ensureTaskList();

  Logger.log("Projekt erfolgreich initialisiert. IDs wurden in Config.js gespeichert.");
}
