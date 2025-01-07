//*****Script V:0.1 A:sIn*****
// Bewerbungstracker
// - App für den Bewerbungsprozess -
// - Testszenarien -

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
 * Testet die Funktion `ensureBewerbungenSheet`.
 * Stellt sicher, dass der Ordner "Bewerbungen" und das Google Sheet "Bewerbungstracker" existieren
 * und die notwendigen Spalten korrekt eingerichtet sind.
 */
function testEnsureBewerbungenSheet() {
  ensureBewerbungenSheet();
}

/**
 * Funktion zur Überprüfung ob der Ordner Bewerbungen existiert, erstellt ihn
 */
function testEnsureBewerbungenFolder() {
  const folder = ensureBewerbungenFolder();
  Logger.log(
    `Gefundener oder erstellter Ordner: ${folder.getName()}, ID: ${folder.getId()}`
  );
}
