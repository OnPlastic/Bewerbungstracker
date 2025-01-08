
# Bewerbungstracker - Installation & Anleitung

## Voraussetzungen

1. **Google-Konto**: Du benötigst ein Google-Konto, um Google Drive, Google Sheets und Google Apps Script nutzen zu können.
2. **GitHub**: Stelle sicher, dass du Zugriff auf das Repository hast und es auf deinen Rechner klonen oder herunterladen kannst.

---

## Installation

### 1. Repository herunterladen

- Lade das Repository über GitHub herunter oder klone es:
  
  ```bash
  git clone <repository-url>
  ```

- Alternativ kannst du die ZIP-Datei herunterladen und entpacken.

---

### 2. Dateien überprüfen

Im Repository sollten die folgenden Dateien und Ordner enthalten sein:

- **Code.js** (Hauptlogik)
- **InitializeProject.js** (Einrichtungs-Script)
- **Utils.js** (Hilfsfunktionen)
- **Test.js** (Test-Scripts)
- **forms.html** (HTML-Eingabemaske für Bewerbungen)
- Ordner **templates/** mit den folgenden Dateien:
  - `status1_first_request.txt`
  - `status1_second_request.txt`
  - `status2_first_request.txt`
  - `status2_second_request.txt`
  - `status3_request_update.txt`
  - `status4_followup_interview.txt`

---

### 3. Projekt initialisieren

#### 3.1 Google Apps Script erstellen

1. Öffne [Google Apps Script](https://script.google.com/) und erstelle ein neues Projekt.
2. Benenne das Projekt, z. B. "Bewerbungstracker".

#### 3.2 Dateien hochladen

1. Kopiere den Inhalt der folgenden Dateien aus dem Repository in Google Apps Script: (Dateien leer erstellen und Inahlte reinkopieren!)
   - **Code.js**
   - **InitializeProject.js**
   - **Utils.js**
   - **Test.js**
2. Stelle sicher, dass jede Datei im Apps Script-Projekt in einer eigenen Datei mit demselben Namen angelegt wird.

#### 3.3 HTML-Formular hinzufügen

1. Füge im Apps Script-Projekt eine neue HTML-Datei hinzu.
2. Kopiere den Inhalt von **forms.html** in diese Datei.

---

### 4. Templates in Google Drive einrichten

1. Öffne Google Drive und erstelle einen Ordner namens **"Bewerbungen"**.
2. Erstelle darin einen Unterordner namens **"templates"**.
3. Lade die Dateien aus dem **templates/**-Ordner des Repositories in diesen Unterordner hoch.

---

### 5. Projekt initialisieren

1. Rufe im Google Apps Script-Editor die Funktion **`initializeProject`** auf.
   - Klicke auf das Dropdown-Menü neben dem Play-Button (▶) und wähle **`initializeProject`** aus.
   - Führe die Funktion aus.
2. Das Script erstellt automatisch:
   - Den Hauptordner "Bewerbungen" (falls noch nicht vorhanden).
   - Ein Google Sheet namens "Bewerbungstracker" mit den erforderlichen Spalten.
   - Eine Google Tasks-Liste namens "Bewerbungen".
   - Den Ordner "templates", falls er nicht existiert.

---

## Nutzung

### 1. Eingabemaske verwenden

1. **Website aufrufen**: Öffne die HTML-Seite in deinem Google Apps Script-Projekt über "Veröffentlichen" > "Web-App bereitstellen".
   - Achte darauf, dass die Web-App Zugriff auf dein Google Drive hat.
2. **Daten eingeben**: Trage die Bewerbungsdaten in die Eingabemaske ein.
3. **Absenden**: Klicke auf "Speichern", um die Daten im Google Sheet zu speichern und einen Firmenordner im Drive zu erstellen.

---

### 2. Automatische Nachverfolgung

1. **Trigger einrichten**: Setze einen Trigger, um die Funktion **`mainProcess`** automatisch auszuführen:
   - Gehe zu "Bearbeiten" > "Trigger".
   - Lege einen Trigger für **`mainProcess`** fest, z. B. täglich.
2. **E-Mail- und Task-Erstellung**: Das Script erstellt automatisch Aufgaben und E-Mails basierend auf dem Bewerbungsstatus.

---

### 3. Tests durchführen

1. Rufe die Test-Funktionen im Apps Script-Editor auf, z. B.:
   - **`testEnsureTaskList`**
   - **`testEnsureBewerbungenSheet`**
   - **`testCreateEmailDraft`**
2. Überprüfe die Konsolenausgabe (Logger), um sicherzustellen, dass alles funktioniert.

---

## Anpassungen

- Passe die Templates im **"templates"**-Ordner an, um die E-Mails nach deinen Bedürfnissen zu gestalten.
- Aktualisiere die Platzhalterwerte in den Funktionen (z. B. `MEIN_NAME` und `MEINE_KONTAKTDATEN`).

---

## Fehlerbehebung

- **Fehlender Zugriff**: Stelle sicher, dass die Web-App und das Script die erforderlichen Berechtigungen haben (Google Drive, Google Tasks, Gmail).
- **Logger prüfen**: Verwende `Logger.log` im Google Apps Script-Editor, um Debugging-Informationen zu erhalten.
- **Templates fehlen**: Überprüfe, ob alle Template-Dateien im "templates"-Ordner vorhanden sind.

---

## Support

Falls es Probleme gibt, kontaktiere Mich (sIn) oder öffne ein GitHub-Issue im Repository.
