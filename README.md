# Class Party - 2D Party-Brettspiel (100% Reine Web-Anwendung)

Ein 2D-Party-Brettspiel im Mario-Party-Stil für Schulklassen (bis zu 8 Spieler bzw. 16 Schüler in 2er-Teams).

Die gesamte Spiellogik läuft **vollständig im Browser**. Das Projekt ist als **reine statische HTML/CSS/JS-Anwendung** konzipiert und kann ohne Server-Setup dauerhaft und kostenlos im Internet gehostet werden!

---

## 🚀 Dauerhaft online hosten (Kostenlos)

Das Spiel kann auf allen gängigen statischen Hosting-Plattformen bereitgestellt werden:

### 1. GitHub Pages (Empfohlen für Schulen)
1. Repository auf GitHub erstellen und diesen gesamten Ordner hochladen (`git push`).
2. Im GitHub-Repository auf **Settings** -> **Pages** gehen.
3. Unter **Build and deployment** -> Source: **Deploy from a branch** auswählen.
4. Branch `main` und Ordner `/ (root)` auswählen und auf **Save** klicken.
5. Nach ca. 1 Minute ist das Spiel unter deiner dauerhaften GitHub-Pages-URL (`https://<username>.github.io/<reponame>/`) erreichbar!

### 2. Netlify (1-Klick Drag & Drop)
1. Besuche [app.netlify.com/drop](https://app.netlify.com/drop).
2. Ziehe diesen gesamten Projektordner per Drag & Drop in das Browserfenster.
3. Du erhältst sofort eine dauerhafte, kostenlose HTTPS-Domain (z. B. `https://class-party.netlify.app`).
4. Die Konfiguration [netlify.toml](file:///c:/Users/User/Desktop/Spiel_Idee/netlify.toml) ist bereits im Projekt enthalten.

### 3. Vercel
- Verbinde das Repository mit [vercel.com](https://vercel.com) oder nutze die Vercel CLI.
- Die Konfiguration [vercel.json](file:///c:/Users/User/Desktop/Spiel_Idee/vercel.json) ist bereits im Projekt enthalten.

### 4. Lokal starten (Optional)
- Doppelklick auf `PartySpiel.bat` (oder starte einen beliebigen lokalen Webserver wie `npx serve`).

---

## 🌐 Online-Multiplayer & Raum-System (WebRTC P2P)

- **100% Serverless:** Verwendet PeerJS WebRTC DataChannels mit kostenlosem Cloud-Signaling (`0.peerjs.com`) und Google STUN-Servern.
- **Raum-Erstellung:** Der Spielleiter (Host) klickt auf **"Neues Spiel hosten"** -> **"Raum erstellen"** und erhält einen 4-stelligen Raum-Code (z. B. `7K9A`) sowie den fertigen Einladungs-Link (`?room=7K9A`).
- **1-Klick Microsoft Teams Einladung:** Mit einem Klick auf **„Teams-Text kopieren“** wird der vorbereitete Einladungstext samt Link und Code in die Zwischenablage kopiert.
- **Schnellbeitritt per Link:** Mitschüler öffnen den Link auf Smartphone, Tablet, Laptop oder PC, wählen ihren Namen und Avatar und stoßen direkt zur Lobby dazu.

---

## 🎭 Avatar-Auswahl (9 Klassen-Helden)
- Vor dem Spielstart und live in der Raum-Lobby wählbar:
  1. **Der PC-Schrauber** (`char1_pc_schrauber.png`)
  2. **Der Feuerwehrmann** (`char2_feuerwehr.png`)
  3. **Der Chill-Cap-Guy** (`char3_chill_cap.png`)
  4. **Der Goldketten-Flexer** (`char4_goldkette.png`)
  5. **Die Drachen-Königin** (`char5_drachen_koenigin.png`)
  6. **Der Schoko-Coder** (`char6_schoko_coder.png`)
  7. **Der Doritos- & Energy-Gamer** (`char7_doritos_gamer.png`)
  8. **Der entspannte Langhaar-Dude** (`char8_langhaar_dude.png`)
  9. **Ultra Instinct Kämpfer** (`char9_ultra_goku.jpg`)
- Die gewählte Figur wird in Echtzeit per P2P an alle Mitschüler übertragen und auf dem Spielbrett, im HUD sowie in allen 13 Minispielen gerendert.

---

## 🛒 Item-Shop & Gag-Items
- **Hilfreiche Items:** Doppelwürfel, Schutzschild gegen Punkteklau, goldener Wunschwürfel, Warp-Rohr, Verfluchter Würfel.
- **Lustige Gag-Items:** Konfetti-Regen über den gesamten Bildschirm, Party-Hupe / Tröte, temporärer Riesenkopf-Effekt, Disco-Tanz-Animation.
- Alle visuellen und akustischen Effekte werden über das P2P-Netzwerk für alle Mitspieler im Raum synchronisiert.

---

## 🕹️ Minispiel-Tutorials (Pre-Game Erklärung)
- Vor jedem der **13 Minispiele** (inkl. Antigravitation Arena, Bomb Tag, Meteor Dodge, Coin Shower, etc.) öffnet sich automatisch ein übersichtlicher Erklärungsbildschirm.
- Zeigt Spieltitel, Spielziel, verständliche Regeln, Profi-Tipps sowie eine visuelle 3D-Tastaturbelegung.

---

## 🛡️ Stabiler Abbruch (Disconnect-Sicherheit)
- Wenn ein Mitschüler den Tab schließt oder die Verbindung verliert:
  - Sein Slot wird automatisch von einer intelligenten Bot-KI übernommen.
  - Münzen, Sterne, Items und Position bleiben vollständig erhalten.
  - Falls der Spieler gerade am Zug war, führt der Bot den Zug automatisch aus.
  - Das Spiel friert niemals ein und die verbleibenden Spieler können die Runde ungestört zu Ende spielen.
