//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Zusatzfunktionen -

// Ruft die IDs aller Aufgaben in der Google Tasks-Liste "Bewerbungen" ab.
function getTaskListIDs() {
  const taskLists = Tasks.Tasklists.list();
  taskLists.items.forEach((taskList) => {
    Logger.log(`Name: ${taskList.title}, ID: ${taskList.id}`);
  });
}

// Erstellt einen Test-Task in der Google Tasks-Liste "Bewerbungen".
function createTestTask() {
  const task = {
    title: "Testaufgabe für Bewerbungstracker",
    notes: "Dies ist eine Testaufgabe, um die Task-Integration zu prüfen",
    due: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Frist in 7 Tagen
  };
  const result = Tasks.Tasks.insert(task, "Bewerbungen");
  Logger.log(`Task erfolgreich erstellt: ${result.title}`);
}

/**
 * Überprüft, ob ein Ordner mit dem Namen "Bewerbungen" im Google Drive existiert.
 * Falls nicht, wird der Ordner erstellt.
 *
 * @returns {GoogleAppsScript.Drive.Folder} Der existierende oder neu erstellte Ordner.
 */
function ensureBewerbungenFolder() {
  const folderName = "Bewerbungen";
  const folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    const folder = folders.next();
    Logger.log(
      `Ordner "${folderName}" existiert bereits. ID: ${folder.getId()}`
    );
    return folder;
  } else {
    const newFolder = DriveApp.createFolder(folderName);
    Logger.log(
      `Ordner "${folderName}" wurde erstellt. ID: ${newFolder.getId()}`
    );
    return newFolder;
  }
}
