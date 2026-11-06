# 🎮 Spielanleitung: Option B (Reines Online-Cloud-Hosting für die Klasse)

Diese Anleitung zeigt dir Schritt für Schritt, wie du **Class Party** komplett kostenlos ins Internet bringst, sodass deine Mitschüler von jedem beliebigen Ort und Gerät (PC, Laptop, Tablet, Smartphone) ohne Download oder Installation per Link mitspielen können.

---

## 🌟 Warum Option B (Cloud-Hosting über Render.com)?
* **100 % Kostenlos:** Es wird keine Kreditkarte benötigt.
* **Weltweit erreichbar:** Funktioniert über jedes Netzwerk (WLAN, mobile Daten, verschiedene Haushalte).
* **Zero-Friction für Mitschüler:** Deine Klassenkameraden müssen nur auf den Einladungs-Link klicken, ihren Namen eingeben und sind direkt im Spiel!
* **Automatischer Wiederbeitritt (Session-Recovery):** Wer aus Versehen die Seite neu lädt (F5), landet sofort wieder in seiner Spielfigur mit allen Münzen und Sternen.

---

## 📋 Schnell-Übersicht der Schritte
1. **GitHub:** Das vorbereitete Projekt auf deinen GitHub-Account hochladen.
2. **Render.com:** Mit GitHub verbinden und den kostenlosen Web-Service starten.
3. **Spielen:** Deinen persönlichen Online-Link öffnen, Lobby erstellen und Link an die Klasse schicken!

---

## 🛠️ Schritt 1: Projekt auf GitHub hochladen

### 1.1 Neues Repository auf GitHub erstellen
1. Öffne im Browser [https://github.com](https://github.com) und logge dich in deinen Account ein (falls du noch keinen hast: klicke auf *Sign up* und erstelle einen kostenlosen Account).
2. Klicke oben rechts auf das **`+`**-Symbol und wähle **`New repository`**.
3. Gib unter **Repository name** einen Namen ein, z. B.:
   ```text
   class-party-spiel
   ```
4. Wähle **Public** (Öffentlich) aus.
5. Lasse alle Häkchen bei *"Add a README file"*, *"Add .gitignore"* und *"Choose a license"* **LEER** (da wir diese Dateien bereits perfekt vorbereitet haben).
6. Klicke unten auf den grünen Button **`Create repository`**.

### 1.2 Projekt hochladen (Terminal-Befehle)
Öffne die PowerShell oder Eingabeaufforderung in deinem Spiel-Ordner (`C:\Users\User\Desktop\Spiel_Idee`) und führe folgende drei Zeilen aus (ersetze `DEIN_GITHUB_BENUTZERNAME` durch deinen echten GitHub-Namen):

```bash
git remote add origin https://github.com/DEIN_GITHUB_BENUTZERNAME/class-party-spiel.git
git branch -M main
git push -u origin main
```

> **Woran erkenne ich, dass es geklappt hat?**  
> Aktualisiere deine GitHub-Seite im Browser. Du siehst nun alle Dateien (`server.js`, `index.html`, `render.yaml` etc.) in deinem Repository.

---

## 🚀 Schritt 2: Auf Render.com kostenlos online schalten

### 2.1 Kostenlos bei Render registrieren
1. Öffne im Browser [https://render.com](https://render.com).
2. Klicke oben rechts auf **`Get Started`** oder **`Sign In`**.
3. Wähle **`Sign in with GitHub`**. Damit verknüpfst du Render direkt mit deinem GitHub-Konto (sehr einfach, kein extra Passwort nötig).

### 2.2 Web Service erstellen (1-Klick mit Blueprint)
Render erkennt dank unserer fertigen `render.yaml`-Datei automatisch alle Einstellungen!

**Weg A: Über Blueprint (Am schnellsten):**
1. Klicke im Render-Dashboard oben rechts auf **`New +`** und wähle **`Blueprint`**.
2. Wähle dein Repository `class-party-spiel` aus und klicke auf **`Connect`**.
3. Render liest automatisch die Datei `render.yaml` ein.
4. Klicke unten auf **`Apply`**. Fertig!

**Weg B: Manuell als Web Service:**
Falls du keinen Blueprint wählen möchtest:
1. Klicke oben rechts auf **`New +`** -> **`Web Service`**.
2. Wähle `Build and deploy from a Git repository` und klicke auf dein Repository `class-party-spiel`.
3. Gib dem Service einen Namen (z. B. `class-party-spiel`).
4. Prüfe die Einstellungen:
   * **Language / Environment:** `Node`
   * **Region:** `Frankfurt (EU)` (für geringste Latenz in Deutschland)
   * **Branch:** `main`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free` (0 $ / Monat)
5. Klicke ganz unten auf den blauen Button **`Create Web Service`**.

### 2.3 Bereitstellung abwarten (ca. 1-2 Minuten)
* Render installiert nun alle Pakete (`npm install`) und startet den Server (`node server.js`).
* Im Log-Fenster erscheint nach kurzer Zeit:
  ```text
  [STARTUP 1/4] server.js (Class Party Cloud Server) wird initialisiert...
  [SERVER BEREIT] Das Spiel laeuft einwandfrei!
  ==> Your service is live 🎉
  ```

> **Woran erkenne ich, dass der Server online ist?**  
> Oben links unter dem Servicenamen leuchtet ein grüner Punkt mit dem Wort **`Live`**.  
> Direkt darunter findest du deine persönliche Online-Adresse, z. B.:  
> `https://class-party-spiel.onrender.com`

---

## 🎮 Schritt 3: Spiel starten und Mitschüler einladen

### 3.1 Spiel als Host öffnen
1. Klicke auf deine Render-URL (z. B. `https://class-party-spiel.onrender.com`).
2. Die Spieloberfläche öffnet sich direkt im Browser!
3. Wähle deine Spielfigur (z. B. *Der PC-Schrauber* oder *Die Sportskanone*) und gib deinen Namen ein.
4. Stelle im Kärtchen **Online-Raum erstellen** deine gewünschten Runden und Optionen ein:
   * **Max. Spieler:** z. B. 4, 6 oder 8 Spieler.
   * **KI-Gegner:** Aus (wenn ihr nur als Menschen spielen wollt) oder Ein (um freie Plätze mit Bots aufzufüllen).
   * **Spielbrett:** Wähle *Vier Welten (Spielbrett 1)* für das Schlangenlinien-Brett mit 4 Biomen!
5. Klicke auf den großen Button **`Online-Raum erstellen`**.

### 3.2 Einladungs-Link an die Klasse senden
* In der Lobby siehst du deinen 4-stelligen Raum-Code (z. B. `A7B2`) sowie den fertigen Internet-Link:
  ```text
  https://class-party-spiel.onrender.com/?room=A7B2
  ```
* Klicke auf **`Link kopieren`** oder **`Teams-Text kopieren`**.
* Füge den Link in eure **WhatsApp-Gruppe**, in **Microsoft Teams** oder im **Discord** ein:
  > *"Hey Leute! Kommt in unsere Class-Party-Runde! Klickt einfach auf den Link: https://class-party-spiel.onrender.com/?room=A7B2"*

### 3.3 Wie deine Mitschüler beitreten:
1. Deine Mitschüler klicken einfach auf den Link (am PC, Tablet oder Handy).
2. Sie geben nur ihren Spielernamen ein, wählen einen Avatar und klicken auf **`Raum beitreten`**.
3. Sie sind sofort in deiner Lobby und werden live auf den Bildschirmen aller Spieler angezeigt!
4. Sobald alle da sind, klickt der Host auf **`Spiel starten`** – und der Party-Spaß beginnt! 🎉

---

## 💡 Häufige Fragen & Tipps für den Schulunterricht

### Warum dauert das Laden der Seite beim allerersten Mal ca. 30–50 Sekunden?
* **Render Free-Tier Spin-Down:** Wenn 15 Minuten lang niemand auf dem Server war, schaltet Render den Server in den Ruhezustand, um Strom zu sparen. Sobald jemand die URL aufruft, wacht der Server automatisch auf (dauert einmalig ca. 30 Sekunden). Danach läuft alles blitzschnell und in Echtzeit!
* **Tipp:** Öffne deine Render-URL einfach 1–2 Minuten vor der Schulstunde einmal kurz selbst, damit der Server bereits hellwach ist, wenn deine Mitschüler beitreten.

### Was passiert, wenn jemand aus Versehen die Seite neu lädt (F5)?
* Kein Problem! Das Spiel speichert eine temporäre Sitzungs-ID im Browser (`sessionId`). Der Spieler wird beim Neuladen automatisch wieder in seinen Slot mit all seinen Münzen, Sternen, Items und seiner aktuellen Position auf dem Spielbrett eingeloggt.

### Können fremde Personen während des Spiels stören?
* Nein! Sobald das Spiel gestartet wurde, ist der Raum gesperrt (*Visitor Lock*). Nur bereits beigetretene Spieler können sich wiederverbinden.
