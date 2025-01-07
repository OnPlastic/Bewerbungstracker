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
