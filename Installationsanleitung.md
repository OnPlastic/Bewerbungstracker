# Bewerbungstracker - Installation & Anleitung

## Voraussetzungen

1. **Google-Konto**: Erforderlich für die Nutzung von Google Drive, Google Sheets und Google Apps Script.
2. **GitHub**: Zugriff auf das Repository zum Herunterladen der Dateien.
3. **Grundkenntnisse**: Umgang mit Google Apps Script und Google Drive.

---

## Installation

### 1. Repository herunterladen

- Klone das Repository über GitHub oder lade es als ZIP-Datei herunter:

  ```bash
  git clone https://github.com/OnPlastic/Bewerbungstracker
  ```

- Entpacke das ZIP-Archiv, falls es heruntergeladen wurde.

---

### 2. Dateien überprüfen

Stelle sicher, dass folgende Dateien und Ordner im Repository enthalten sind:

- **Code.js** (Hauptlogik)
- **InitializeProject.js** (Einrichtungs-Skript)
- **Utils.js** (Hilfsfunktionen)
- **Test.js** (Testskripte)
- **forms.html** (HTML-Eingabemaske für Bewerbungen)
- Ordner **templates/** mit den Dateien:
  - `status1_first_request.txt`
  - `status1_second_request.txt`
  - `status2_first_request.txt`
  - `status2_second_request.txt`
  - `status3_last_request.txt`
  - `status4_followup_interview.txt`
- **Bewerbungsprozess Ablauf.md** (Zeitabläufe)
- **Installationsanleitung.md** (Projekteinrichtung)

---

### 3. Projekt in Google Apps Script einrichten

#### 3.1 Neues Projekt erstellen

1. Öffne [Google Apps Script](https://script.google.com/) und erstelle ein neues Projekt.
2. Benenne das Projekt, z. B. **"Bewerbungstracker"**.

#### 3.2 Skriptdateien erstellen -> hochladen

1. Erstelle leere Skriptdateien im Apps Script-Projekt und kopiere den Inhalt aus dem Repository:
   - **Code.js**
   - **InitializeProject.js**
   - **Utils.js**
   - **Test.js**

#### 3.3 HTML-Formular hinzufügen

1. Füge eine neue HTML-Datei hinzu und benenne sie **forms.html**.
2. Kopiere den Inhalt aus **forms.html** des Repositories in die Datei.

---

### 4. Projekt initialisieren

1. Rufe im Google Apps Script-Editor die Funktion **`initializeProject()`** auf:
   - Wähle im Dropdown-Menü neben dem Play-Button (▶) **`initializeProject()`** aus.
   - Führe die Funktion aus.
2. Überprüfe, ob folgende Elemente erstellt wurden:
   - Google Drive-Ordner **"Bewerbungen"**.
   - Google Sheet **"Bewerbungstracker"** mit den erforderlichen Spalten.
   - Spalten in **"Bewerbungstracker"** (TabellenblattBezeichnung: Bewerbungstracker).
     - `BewerbungsID`
     - `Unternehmen`
     - `Stelle`
     - `Art der Bewerbung`
     - `Job-Portal`
     - `Datum der Bewerbung`
     - `Status`
     - `Datum Rückmeldung`
     - `Datum der Nachfrage`
     - `Ansprechpartner`
     - `Email`
     - `Telefon`
     - `Login-Informationen`
     - `Bewerbungsgespräch Datum`
     - `Bewerbungsgespräch Ort`
     - `Stellenbeschreibung Link`
     - `Kommentar`
   - Google Tasks-Liste **"Bewerbungen"**.
3. Füge im Google Apps Script-Editor unter **Dienste** folgende hinzu:
   - `Drive`
   - `Gmail`
   - `Sheets`
   - `Tasks`

---

### 5. Templates in Google Drive einrichten

1. Öffne Google Drive und navigiere zum Ordner namens **./Bewerbungen/templates**.
2. Lade die Dateien aus dem Ordner **templates/** des Repositories in diesen Unterordner hoch.

---

### 6. Persönliche Daten aktualisieren

1. Öffne die Datei **Config.js** im Ordner **"Bewerbungen"**.
2. Ergänze die Platzhalter mit deinen persönlichen Informationen:
   - **MEIN_NAME**: Dein vollständiger Name.
   - **MEINE_KONTAKTDATEN**: Deine E-Mail-Adresse und Telefonnummer.

---

## Nutzung

### 1. Eingabemaske verwenden

1. **Website bereitstellen**:
   - Gehe im Apps Script-Editor zu "Veröffentlichen" > "Web-App bereitstellen".
   - Wähle bei "Wer hat Zugriff" die Option **"Nur ich slebst"**.  
     (Hinweis: _Wenn du nur dich selbst autorisierst musst du im Browser mit deinem Google-Konto angemeldet sein._)
   - Notiere dir die bereitgestellte URL.
2. **Daten eingeben**:
   - Rufe die Website auf und trage die Bewerbungsdaten in die Eingabemaske ein.
3. **Absenden**:
   - Klicke auf "Speichern", um die Daten im Google Sheet zu speichern und einen Firmenordner im Drive zu erstellen.

---

### 2. Automatische Nachverfolgung

1. **Trigger einrichten**:
   - Gehe zu "Bearbeiten" > "Trigger" im Apps Script-Projekt.
   - Lege einen Trigger für **`mainProcess()`** fest, z. B. **täglich**.
2. Das Script erstellt basierend auf dem Bewerbungsstatus automatisch Aufgaben und E-Mails.

---

### 3. Tests durchführen

1. Führe Test-Funktionen im Apps Script-Editor aus:
   - **`runAllTests()`**: Überprüft, ob alles erfolgreich initialisiert wurde.
2. Überprüfe die Konsolenausgabe (Logger), um sicherzustellen, dass alles wie erwartet funktioniert.

---

## Anpassungen

- **E-Mail-Templates**:
  - Bearbeite die Dateien im Ordner **"templates"**, um die Inhalte nach deinen Bedürfnissen anzupassen.
- **Trigger-Zeiten**:
  - Passe die zeitbasierten Trigger im Apps Script-Projekt an (z. B. wöchentlich statt täglich).

---

## Fehlerbehebung

1. **Fehlender Zugriff**:
   - Stelle sicher, dass die Web-App und das Script die erforderlichen Berechtigungen haben (Google Drive, Gmail, Tasks).
2. **Templates fehlen**:
   - Überprüfe, ob alle Template-Dateien im Ordner **"templates"** vorhanden sind.
3. **Logger nutzen**:
   - Verwende `Logger.log` im Apps Script-Editor für Debugging.

---

## Support

Falls es Probleme gibt, kontaktiere mich oder öffne ein GitHub-Issue im Repository.
