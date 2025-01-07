# Bewerbungstracker by (sIn)

Ein Tool, das den Bewerbungsprozess automatisiert und strukturiert. Es überwacht Bewerbungen, erstellt Erinnerungen, protokolliert Fristen und kann bei Bedarf E-Mail-Templates oder Tasks für Nachfassaktionen generieren.

---

## Funktionen

- **Automatisierte Task-Erstellung:** Erinnerungen für Nachfragen werden automatisch in Google Tasks erstellt.
- **Google Drive Integration:** Überprüft, ob ein Ordner „Bewerbungen“ existiert, und erstellt ihn bei Bedarf.
- **Google Sheet Verwaltung:** Überprüft und erstellt das benötigte Google Sheet mit den richtigen Spalten.
- **Statusüberwachung:** Verarbeitet Bewerbungen basierend auf verschiedenen Status und Fristen.
- **Einfache Tests:** Testfunktionen zur Überprüfung einzelner Komponenten.

---

## Projektstruktur

| **Datei**                 | **Beschreibung**                                                                                   |
|---------------------------|---------------------------------------------------------------------------------------------------|
| **InitializeProject.js**  | Einrichtungs-Script, um die Grundstruktur des Projekts zu erstellen (Ordner, Sheets, etc.).       |
| **Code.js**               | Hauptlogik für die Verarbeitung der Bewerbungen und den Status-Handler.                          |
| **Test.js**               | Enthält Funktionen für Tests (z. B. Erstellen von Test-Tasks oder Prüfen der Ordnerstruktur).    |
| **Utils.js**              | Zusatzfunktionen für Google Drive, Google Sheets und Tasks.                                      |
| **Bewerbungsprozess Ablauf.md** | Dokumentation des Workflows für die verschiedenen Status der Bewerbungen.                          |
| **.eslintrc.json**        | Konfigurationsdatei für den ESLint Code-Checker.                                                 |
| **.gitignore**            | Liste von Dateien/Ordnern, die nicht ins Repository aufgenommen werden sollen.                   |
| **License**               | MIT-Lizenz für das Projekt.                                                                      |

---

## Einrichtung

1. **Ordner erstellen und Projekt initialisieren:**

   - Stelle sicher, dass Google Drive einen Ordner `Bewerbungen` enthält.
   - Führe die Funktion `initializeProject()` aus, um das Google Sheet und die grundlegende Struktur einzurichten.

2. **Trigger aktivieren:**

   - Richte in Google Apps Script einen Trigger für die `mainProcess()`-Funktion ein (z. B. täglicher Trigger um 7:00 Uhr).

3. **Tests ausführen:**

   - Verwende die Testfunktionen in `Test.js`, um einzelne Module zu prüfen:
     - **`createTestTask()`**: Erstellt einen Test-Task in Google Tasks.
     - **`testEnsureBewerbungenSheet()`**: Überprüft die Google Sheets-Struktur.

---

## Verwendung

1. **Neue Bewerbung hinzufügen:**

   - Trage die Details in das Google Sheet `Bewerbungstracker` ein (z. B. Unternehmen, Position, Datum, Status).

2. **Automatische Überwachung:**

   - Die `mainProcess()`-Funktion prüft täglich den Status der Bewerbungen und erstellt Erinnerungen oder aktualisiert den Status entsprechend.

3. **Status-Updates:**

   - Überwache den Status der Bewerbungen im Sheet:
     - **1:** Beworben.
     - **2:** Eingang bestätigt.
     - **3:** Bearbeitung.
     - **4:** Einladung Bewerbungsgespräch.
     - **5:** Erfolgreich.
     - **6:** Keine Reaktion.
     - **7:** Abgelehnt.

---

## Lizenz

Dieses Projekt steht unter der **MIT-Lizenz**. Siehe die Datei **License** für weitere Details.

---

## Verbesserungsvorschläge

- Feedback und Vorschläge sind willkommen! Bitte öffne ein Issue oder erstelle einen Pull Request.
