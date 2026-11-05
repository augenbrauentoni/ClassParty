// questionBank.js - Fundierte Multiple-Choice-Fragen (IT-Technik, Wirtschaft, Recht & PM)
// Für Fachinformatiker (Anwendungsentwicklung & Systemintegration) & IT-Systemelektroniker

(function() {
  const QUESTIONS = [
    // =========================================================================
    // 1. WIRTSCHAFT, RECHT & PROJEKTMANAGEMENT (44 Fragen)
    // =========================================================================

    // --- Qualität & Qualitätsmanagement (ISO 9001, PDCA, TQM, Six Sigma, KVP) ---
    {
      id: 1,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Wofür steht der PDCA-Zyklus im kontinuierlichen Verbesserungsprozess (KVP)?',
      options: ['Plan - Do - Check - Act', 'Prepare - Deliver - Control - Assess', 'Project - Design - Code - Approve', 'Perform - Define - Calculate - Apply'],
      correct: 0,
      explanation: 'Der PDCA-Zyklus nach Deming beschreibt die vier Phasen: Plan (Planen), Do (Umsetzen), Check (Überprüfen) und Act (Handeln/Standardisieren).'
    },
    {
      id: 2,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Welche internationale Normenreihe legt Anforderungen an ein Qualitätsmanagementsystem (QMS) fest?',
      options: ['ISO/IEC 27001', 'ISO 9001', 'IEEE 802.3', 'ITIL v4'],
      correct: 1,
      explanation: 'ISO 9001 ist der weltweite Standard für Qualitätsmanagementsysteme. ISO 27001 behandelt Informationssicherheit.'
    },
    {
      id: 3,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Welches Kernziel verfolgt die Six-Sigma-Methodik in der Produktion und Entwicklung?',
      options: ['Reduzierung der Fehlerrate auf unter 3,4 Fehler pro 1 Million Möglichkeiten', 'Verdopplung der Produktionsgeschwindigkeit alle 6 Monate', 'Abschaffung aller schriftlichen Dokumentationen', 'Erhöhung der Mitarbeiterzufriedenheit um mindestens 60%'],
      correct: 0,
      explanation: 'Six Sigma zielt auf statistische Prozessverbesserung ab: Ein 6-Sigma-Niveau entspricht höchstens 3,4 Fehlern pro Million Fehlermöglichkeiten (DPMO).'
    },
    {
      id: 4,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Was versteht man im Qualitätsmanagement unter dem Begriff KVP?',
      options: ['Komplexe Verfahrensprüfung', 'Kontinuierlicher Verbesserungsprozess', 'Kosten- und Vertriebs-Prognose', 'Kunden-Vertrags-Portal'],
      correct: 1,
      explanation: 'KVP (Kontinuierlicher Verbesserungsprozess, im Japanischen Kaizen) bezeichnet die stetige Perfektionierung von Prozessen in kleinen Schritten.'
    },
    {
      id: 5,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Was unterscheidet Total Quality Management (TQM) von herkömmlicher Qualitätskontrolle?',
      options: ['TQM bezieht alle Mitarbeiter, Abteilungen und Kundenanforderungen ganzheitlich ein', 'TQM wird ausschließlich von der Geschäftsführung ohne Mitarbeiter durchgeführt', 'TQM verzichtet vollständig auf Qualitätsprüfungen', 'TQM testet nur Endprodukte kurz vor der Auslieferung'],
      correct: 0,
      explanation: 'TQM ist ein unternehmensweites Führungskonzept, bei dem Qualität als zentrale Führungsaufgabe alle Bereiche und Mitarbeiter umfasst.'
    },

    // --- Sach-/Rechtsmängel & Gewährleistung (BGB §§ 434 ff.) ---
    {
      id: 6,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Wann liegt beim Kauf eines IT-Systems ein sogenannter "Rechtsmangel" (§ 435 BGB) vor?',
      options: ['Das Gehäuse des Servers hat einen sichtbaren Kratzer', 'Ein Dritter besitzt Urheber- oder Patentrechte an der Software und untersagt die Nutzung', 'Die Festplatte liest Daten um 20% langsamer als beworben', 'Der Lieferant hat das Netzkabel vergessen beizulegen'],
      correct: 1,
      explanation: 'Ein Rechtsmangel liegt vor, wenn Dritte in Bezug auf die Kaufsache Rechte geltend machen können, die der Käufer nicht im Kaufvertrag übernommen hat.'
    },
    {
      id: 7,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Welches Recht hat der Käufer bei einem Sachmangel im Rahmen der gesetzlichen Gewährleistung VORRANGIG geltend zu machen?',
      options: ['Sofortiger Rücktritt vom Kaufvertrag', 'Nacherfüllung (Beseitigung des Mangels oder Neulieferung)', 'Sofortige Minderung des Kaufpreises um mindestens 50%', 'Sofortige Anzeige wegen Betrugs'],
      correct: 1,
      explanation: 'Nach § 439 BGB hat der Käufer zunächst das Recht auf Nacherfüllung (Wahl zwischen Nachbesserung oder Ersatzlieferung), bevor nachrangige Rechte greifen.'
    },
    {
      id: 8,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Wie lang ist die gesetzliche Verjährungsfrist für Mängelansprüche (Gewährleistung) beim Kauf neuer beweglicher Sachen nach § 438 BGB?',
      options: ['6 Monate', '1 Jahr', '2 Jahre', '5 Jahre'],
      correct: 2,
      explanation: 'Die regelmäßige Verjährungsfrist für Mängelansprüche bei neuen beweglichen Sachen beträgt 2 Jahre ab Ablieferung der Sache.'
    },
    {
      id: 9,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Welche gesetzliche Regelung gilt beim Verbrauchsgüterkauf (§ 477 BGB) hinsichtlich der Beweislastumkehr?',
      options: ['Zeigt sich ein Mangel innerhalb von 12 Monaten, wird vermutet, dass er bereits bei Gefahrübergang vorlag', 'Der Verkäufer muss niemals die Fehlerfreiheit beweisen', 'Der Käufer muss ab dem ersten Tag nachweisen, dass der Mangel ab Werk bestand', 'Die Beweislastumkehr gilt nur für gebrauchte Kraftfahrzeuge'],
      correct: 0,
      explanation: 'Seit der Reform 2022 gilt beim Verbrauchsgüterkauf eine 12-monatige Vermutung (Beweislastumkehr), dass der Mangel bereits bei Übergabe vorlag.'
    },
    {
      id: 10,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Was unterscheidet eine freiwillige Hersteller-Garantie von der gesetzlichen Gewährleistung?',
      options: ['Garantie ist gesetzlich verpflichtend, Gewährleistung immer freiwillig', 'Garantie ist eine freiwillige vertragliche Zusicherung des Herstellers/Händlers, Gewährleistung ist gesetzliche Pflicht', 'Beide Begriffe sind rechtlich absolut identisch', 'Garantie gilt immer genau 10 Jahre'],
      correct: 1,
      explanation: 'Gewährleistung (Mängelhaftung des Verkäufers) ist gesetzlich vorgeschrieben (2 Jahre). Garantie ist eine zusätzliche freiwillige Zusage (z. B. 3 Jahre Garantie auf Durchrostung).'
    },

    // --- Kaufvertrag (Zustandekommen, Pflichten, Nichtigkeit) ---
    {
      id: 11,
      category: 'wirtschaft',
      topic: 'Kaufvertrag',
      question: 'Wie kommt ein Kaufvertrag nach deutschem Zivilrecht (§ 433 BGB) rechtsgültig zustande?',
      options: ['Durch zwei übereinstimmende Willenserklärungen (Antrag/Angebot und Annahme)', 'Erst mit der Bezahlung der Rechnung auf dem Bankkonto', 'Ausschließlich durch notarielle Beglaubigung bei der IHK', 'Durch das bloße Ausstellen von Waren in einem Schaufenster'],
      correct: 0,
      explanation: 'Ein Kaufvertrag entsteht durch zwei übereinstimmende Willenserklärungen: das Angebot (Antrag) und die Annahme.'
    },
    {
      id: 12,
      category: 'wirtschaft',
      topic: 'Kaufvertrag',
      question: 'Was versteht man unter dem Begriff "invitatio ad offerendum"?',
      options: ['Ein verbindliches Angebot des Verkäufers an eine bestimmte Person', 'Eine unverbindliche Aufforderung zur Abgabe eines Angebots (z. B. Werbung im Prospekt oder Webshop)', 'Ein bindender Vorvertrag beim Notar', 'Ein Lieferverzug mit Vertragsstrafe'],
      correct: 1,
      explanation: 'Eine invitatio ad offerendum ist eine unverbindliche Einladung zur Abgabe eines Kaufangebots durch den Kunden (z. B. Kataloge, Schaufenster, Webshops).'
    },
    {
      id: 13,
      category: 'wirtschaft',
      topic: 'Kaufvertrag',
      question: 'Welche Hauptpflicht trifft den Verkäufer gemäß § 433 Abs. 1 BGB?',
      options: ['Dem Käufer das Eigentum an der mangelfreien Sache zu verschaffen und sie zu übergeben', 'Dem Käufer den Kaufpreis in bar auszuzahlen', 'Dem Käufer eine 5-jährige Garantie zu schenken', 'Den Käufer kostenlos mit Lebensmitteln zu versorgen'],
      correct: 0,
      explanation: 'Die Hauptpflicht des Verkäufers ist die Übergabe und Eigentumsverschaffung der Sache frei von Sach- und Rechtsmängeln.'
    },
    {
      id: 14,
      category: 'wirtschaft',
      topic: 'Kaufvertrag',
      question: 'Wann ist ein Rechtsgeschäft von vornherein "nichtig" (§§ 105, 134, 138 BGB)?',
      options: ['Wenn es von einer geschäftsunfähigen Person (z. B. Kind unter 7 Jahren) abgeschlossen wurde oder gegen ein gesetzliches Verbot verstößt', 'Wenn der Käufer nach 14 Tagen seine Meinung ändert', 'Wenn der Rechnungsbetrag per Überweisung statt PayPal gezahlt wird', 'Wenn der Vertrag nicht in lateinischer Sprache verfasst ist'],
      correct: 0,
      explanation: 'Nichtige Rechtsgeschäfte sind rechtlich unwirksam (z. B. Willenserklärungen von Kindern unter 7 Jahren, Sittenwidrigkeit, Gesetzesverstöße, Scheingeschäfte).'
    },
    {
      id: 15,
      category: 'wirtschaft',
      topic: 'Kaufvertrag',
      question: 'Was ist die Rechtsfolge einer erfolgreichen Anfechtung wegen arglistiger Täuschung (§ 123 BGB)?',
      options: ['Das Rechtsgeschäft gilt als von Anfang an nichtig (ex tunc)', 'Der Kaufpreis verdoppelt sich automatisch', 'Der Vertrag bleibt unverändert 10 Jahre bestehen', 'Nur die Verpackung muss zurückgegeben werden'],
      correct: 0,
      explanation: 'Wird ein Vertrag wirksam angefochten (§ 142 BGB), gilt er als von Anfang an (ex tunc) nichtig.'
    },

    // --- Projektmanagement (Phasen, Scrum, SMART, Netzplan) ---
    {
      id: 16,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'In welcher Reihenfolge laufen die klassischen 5 Phasen des Projektmanagements nach DIN 69901 ab?',
      options: ['Initialisierung -> Definition/Planung -> Durchführung/Steuerung -> Abschluss', 'Abschluss -> Planung -> Coding -> Testen -> Kaffee', 'Durchführung -> Initialisierung -> Planung -> Controlling', 'Testing -> Verkauf -> Planung -> Release'],
      correct: 0,
      explanation: 'Die klassischen PM-Phasen sind: 1. Initialisierung, 2. Definition, 3. Planung, 4. Durchführung & Steuerung, 5. Projektabschluss.'
    },
    {
      id: 17,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Wofür steht das Akronym SMART bei der Definition von Projektzielen?',
      options: ['Spezifisch, Messbar, Akzeptiert/Attraktiv, Realistisch, Terminiert', 'Schnell, Moderiert, Automatisiert, Rational, Transparent', 'Sicher, Modular, Agil, Robust, Typisiert', 'Standardisiert, Maximal, Analytisch, Redundant, Technisch'],
      correct: 0,
      explanation: 'SMART: Spezifisch (präzise formuliert), Messbar (Qualitätskriterien), Akzeptiert (attraktiv für Beteiligte), Realistisch (machbar), Terminiert (feste Frist).'
    },
    {
      id: 18,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Welche drei Kernrollen definiert das Scrum-Framework?',
      options: ['Product Owner, Scrum Master, Entwicklungsteam (Developers)', 'Projektleiter, Abteilungsleiter, Werkstudent', 'Administrator, Tester, Geschäftsführer', 'Architekt, Programmierer, Kunde'],
      correct: 0,
      explanation: 'Die drei Scrum-Rollen sind: Product Owner (verantwortet Produktwert & Backlog), Scrum Master (Führung & Beseitigung von Hindernissen) und Developers (Umsetzung).'
    },
    {
      id: 19,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Was kennzeichnet den "Kritischen Pfad" in einem Netzplan (z. B. nach CPM)?',
      options: ['Er besteht aus allen Vorgängen ohne Pufferzeit (Gesamtpuffer = 0); Verzögerungen hier verzögern das gesamte Projekt', 'Er enthält die billigsten Vorgänge des Projekts', 'Er markiert alle Aktivitäten, die ins Ausland ausgelagert werden', 'Er bezeichnet die fehlerhaften Code-Zeilen im Git-Repository'],
      correct: 0,
      explanation: 'Der kritische Pfad verbindet Vorgänge, deren Gesamtpuffer null ist. Jede Verzögerung auf diesem Pfad verschiebt den Projektendtermin.'
    },
    {
      id: 20,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Was ist das "Magische Dreieck" des Projektmanagements?',
      options: ['Die Zielkonkurrenz zwischen Zeit (Termintreue), Kosten (Budget) und Qualität/Leistungsumfang', 'Die Zusammenarbeit von Entwickler, Tester und Kunde', 'Ein Modell zur Berechnung der Serverkühlung', 'Die drei Scrum-Artefakte'],
      correct: 0,
      explanation: 'Das Magische Dreieck beschreibt die wechselseitigen Abhängigkeiten zwischen den Parametern Zeit, Kosten und Qualität/Inhalt.'
    },
    {
      id: 21,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Was versteht man in Scrum unter einem "Sprint Retrospective"?',
      options: ['Ein Meeting am Ende des Sprints zur Reflexion der Zusammenarbeit, Prozesse und Teamdynamik', 'Die Vorführung des fertigen Produkt-Inkrements vor den Stakeholdern', 'Die tägliche 15-minütige Standup-Besprechung', 'Die finanzielle Abrechnung der Entwicklergehälter'],
      correct: 0,
      explanation: 'Die Retrospektive dient der internen Prozessverbesserung des Scrum-Teams (Inspect & Adapt für Teamprozesse), während im Sprint Review das Inkrement begutachtet wird.'
    },
    {
      id: 22,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Wie berechnet sich der Gesamtpuffer (GP) eines Vorgangs im Netzplan?',
      options: ['GP = Spätester Endzeitpunkt (SEZ) - Frühester Endzeitpunkt (FEZ)', 'GP = FAZ + Dauer', 'GP = Projektgesamtdauer / 2', 'GP = FEZ - SAZ'],
      correct: 0,
      explanation: 'Gesamtpuffer ist: SEZ - FEZ (oder SAZ - FAZ). Er gibt an, um wie viel ein Vorgang verschoben werden kann, ohne das Projektende zu gefährden.'
    },

    // --- Anforderungsanalyse (Lastenheft vs. Pflichtenheft) ---
    {
      id: 23,
      category: 'wirtschaft',
      topic: 'Anforderungsanalyse',
      question: 'Wer erstellt üblicherweise das "Lastenheft" (DIN 69901-5) und was beschreibt es?',
      options: ['Der Auftraggeber (Kunde); es beschreibt WAS und WOFÜR das System leisten soll (Gesamtheit der Forderungen)', 'Der Auftragnehmer; es beschreibt die technische Umsetzung mit Klassen- und ER-Diagrammen', 'Der Gesetzgeber; es listet alle Bußgelder auf', 'Der Hardware-Hersteller; es ist das Handbuch des Prozessors'],
      correct: 0,
      explanation: 'Das Lastenheft wird vom Auftraggeber erstellt und beschreibt das "Was und Wofür". Das Pflichtenheft erstellt der Auftragnehmer und beschreibt das "Wie und Womit".'
    },
    {
      id: 24,
      category: 'wirtschaft',
      topic: 'Anforderungsanalyse',
      question: 'Was ist der primäre Inhalt eines "Pflichtenhefts"?',
      options: ['Die detaillierte Beschreibung der Realisierungsvorschläge (WIE und WOMIT die Anforderungen des Lastenhefts umgesetzt werden)', 'Die persönliche Biografie des Unternehmensgründers', 'Eine Sammlung von Gesetzestexten des BGB', 'Die Kündigungsschreiben aller Projektmitarbeiter'],
      correct: 0,
      explanation: 'Das Pflichtenheft ist die Antwort des Auftragnehmers auf das Lastenheft und definiert die konkrete Realisierung (Architektur, Technologien, Datenmodelle).'
    },
    {
      id: 25,
      category: 'wirtschaft',
      topic: 'Anforderungsanalyse',
      question: 'Welches ist ein typisches Beispiel für eine "nicht-funktionale Anforderung"?',
      options: ['Das System muss mindestens 5.000 parallele Anfragen mit einer Antwortzeit unter 200 ms verarbeiten (Performance/Skalierbarkeit)', 'Der Nutzer kann auf einen Button klicken, um ein PDF herunterzuladen', 'Bei Passworteingabe wird eine Bestätigungsmail verschickt', 'Die Datenbank speichert Kundenvor- und -nachnamen'],
      correct: 0,
      explanation: 'Nicht-funktionale Anforderungen beschreiben Qualitätsattribute wie Performance, Zuverlässigkeit, Sicherheit, Usability oder Wartbarkeit.'
    },

    // --- Kalkulation & Angebote (Handelskalkulation, Preise) ---
    {
      id: 26,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Wie lautet die richtige Formel zur Ermittlung des "Bezugspreises" (Einstandspreises)?',
      options: ['Listeneinkaufspreis - Lieferantenrabatt - Lieferantenskonto + Bezugskosten', 'Selbstkostenpreis + Gewinnzuschlag', 'Umsatzsteuer + Gewerbesteuer', 'Listenverkaufspreis + Skonto'],
      correct: 0,
      explanation: 'Listeneinkaufspreis - Rabatt = Zieleinkaufspreis - Skonto = Bareinkaufspreis + Bezugskosten (Fracht/Zoll) = Bezugspreis.'
    },
    {
      id: 27,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Wie berechnen sich die "Selbstkosten" eines Handels- oder IT-Betriebs?',
      options: ['Bezugspreis (Einstandspreis) + Handlungskostenzuschlag (Gemeinkosten)', 'Verkaufspreis minus 19% Mehrwertsteuer', 'Gewinn plus Kundenskonto', 'Summe aller bezahlten Rechnungen'],
      correct: 0,
      explanation: 'Selbstkosten decken alle Kosten des Betriebs: Bezugspreis der Ware plus Handlungskostenzuschlag (Lager, Verwaltung, Miete, Gehälter).'
    },
    {
      id: 28,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Ein Server kostet netto 1.000 €. Der Lieferant gewährt 20% Rabatt und 2% Skonto. Wie hoch ist der Bareinkaufspreis?',
      options: ['784,00 €', '800,00 €', '820,00 €', '980,00 €'],
      correct: 0,
      explanation: '1.000 € - 20% Rabatt (200 €) = 800 € Zieleinkaufspreis. 800 € - 2% Skonto (16 €) = 784 € Bareinkaufspreis.'
    },
    {
      id: 29,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Was ist der Unterschied zwischen Vorsteuer und Umsatzsteuer?',
      options: ['Vorsteuer zahlt das Unternehmen beim Einkauf an Vorlieferanten; Umsatzsteuer nimmt es vom Kunden ein (Differenz = Zahllast)', 'Vorsteuer gibt es nur für Vereine, Umsatzsteuer für Privatpersonen', 'Vorsteuer beträgt 25%, Umsatzsteuer immer 19%', 'Die Begriffe bezeichnen dasselbe ohne Unterschied'],
      correct: 0,
      explanation: 'Vorsteuer ist die beim Einkauf an Lieferanten gezahlte Steuer. Umsatzsteuer wird Kunden in Rechnung gestellt. Das Finanzamt erhält die Zahllast (USt - VSt).'
    },

    // --- DSGVO (Grundsätze, Betroffenenrechte, TOM) ---
    {
      id: 30,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Welcher zentrale Grundsatz nach Art. 5 DSGVO besagt, dass nur so viele Daten erhoben werden dürfen, wie für den Zweck zwingend nötig sind?',
      options: ['Datenminimierung (Grundsatz der Verhältnismäßigkeit)', 'Integrität und Vertraulichkeit', 'Richtigkeit der Datenverarbeitung', 'Transparenzgebot'],
      correct: 0,
      explanation: 'Datenminimierung (Art. 5 Abs. 1 lit. c DSGVO): Personenbezogene Daten müssen dem Zweck angemessen und auf das notwendige Maß beschränkt sein.'
    },
    {
      id: 31,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Welches Recht steht einer betroffenen Person gemäß Art. 17 DSGVO zu?',
      options: ['Recht auf Löschung ("Recht auf Vergessenwerden")', 'Recht auf kostenlose Bereitstellung eines neuen Laptops', 'Recht auf Einsicht in private Chats des Arbeitgebers', 'Recht auf lebenslange Immunität'],
      correct: 0,
      explanation: 'Art. 17 DSGVO garantiert das Recht auf Löschung personenbezogener Daten, sobald der Verarbeitungszweck entfällt oder die Einwilligung widerrufen wird.'
    },
    {
      id: 32,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Was verbirgt sich hinter dem Begriff "TOM" im Sinne von Art. 32 DSGVO?',
      options: ['Technisch-organisatorische Maßnahmen (z. B. Zutrittskontrolle, Verschlüsselung, Backups)', 'Transnationale Online-Monopole', 'Total Operational Management', 'Tarifliche Organisations-Muster'],
      correct: 0,
      explanation: 'TOMs sind technische und organisatorische Maßnahmen zur Gewährleistung der Sicherheit der Datenverarbeitung (Vertraulichkeit, Integrität, Verfügbarkeit).'
    },
    {
      id: 33,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Wann liegt eine meldepflichtige Datenschutzverletzung ("Data Breach") nach Art. 33 DSGVO vor und binnen welcher Frist muss gemeldet werden?',
      options: ['Bei Verletzung des Schutzes personenbezogener Daten mit Risiko für Betroffene; Meldung binnen 72 Stunden an die Aufsichtsbehörde', 'Nur bei Diebstahl von über 100.000 € Bargeld; Frist 14 Tage', 'Wenn ein Server neugestartet wird; Frist 24 Stunden', 'Ausschließlich bei vorsätzlichen Hackerangriffen aus Übersee; Frist 1 Monat'],
      correct: 0,
      explanation: 'Sicherheitsvorfälle mit personenbezogenen Daten müssen unverzüglich und möglichst binnen 72 Stunden der zuständigen Datenschutzaufsicht gemeldet werden.'
    },
    {
      id: 34,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Was unterscheidet "Pseudonymisierung" von "Anonymisierung"?',
      options: ['Bei Pseudonymisierung können Daten mit Zusatzwissen rückgeführt werden; bei Anonymisierung ist kein Personenbezug mehr herstellbar', 'Anonymisierung ist illegal, Pseudonymisierung erlaubt', 'Pseudonymisierung löscht alle Daten dauerhaft', 'Es gibt keinen Unterschied'],
      correct: 0,
      explanation: 'Bei Pseudonymisierung wird der Name z.B. durch eine ID ersetzt (Rückführung möglich). Bei Anonymisierung ist die Zuordnung unwiederbringlich ausgeschlossen.'
    },
    {
      id: 35,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Was ist das Ziel eines Minimum Viable Product (MVP) in der agilen Produktentwicklung?',
      options: ['Die früheste Version eines Produkts, die mit minimalem Aufwand echten Nutzwert liefert, um Feedback zu sammeln', 'Ein fehlerhaftes Alpha-Produkt ohne jede Funktion', 'Das vollständige Produkt mit allen denkbaren Luxus-Features', 'Ein reines Powerpoint-Konzept ohne Code'],
      correct: 0,
      explanation: 'Ein MVP besitzt die minimal nötigen Kernfunktionen, um schnell am Markt validiertes Kunden- und Nutzerfeedback zu generieren.'
    },
    {
      id: 36,
      category: 'wirtschaft',
      topic: 'Wirtschaft & Recht',
      question: 'Was versteht man unter dem Begriff "Compliance" in einem Unternehmen?',
      options: ['Die Einhaltung aller gesetzlichen Vorschriften, Richtlinien und unternehmensinternen Regelwerke', 'Die maximale Reduzierung der IT-Kosten', 'Das automatische Generieren von Rechnungen', 'Das Verbot von Heimarbeit'],
      correct: 0,
      explanation: 'Compliance steht für die Regeltreue eines Unternehmens gegenüber Gesetzen, Verordnungen und internen Verhaltenskodizes.'
    },
    {
      id: 37,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Welches Diagramm eignet sich am besten zur grafischen Darstellung zeitlicher Vorgangsabfolgen und Meilensteine?',
      options: ['Gantt-Diagramm (Balkendiagramm)', 'Kuchendiagramm (Pie Chart)', 'Entity-Relationship-Diagramm (ERD)', 'UML-Klassendiagramm'],
      correct: 0,
      explanation: 'Gantt-Diagramme stellen Vorgänge als horizontale Balken auf einer Zeitachse dar und zeigen Dauer, Puffer und Überschneidungen.'
    },
    {
      id: 38,
      category: 'wirtschaft',
      topic: 'Mängel & Gewährleistung',
      question: 'Welche Rügepflicht gilt für Kaufleute beim Handelskauf gemäß § 377 HGB?',
      options: ['Die Ware ist unverzüglich nach Ablieferung zu untersuchen und offene Mängel sind unverzüglich anzuzeigen', 'Kaufleute müssen Mängel erst nach 2 Jahren melden', 'Es gibt keine Rügepflicht unter Kaufleuten', 'Mängel müssen innerhalb von 10 Jahren per Einschreiben gemeldet werden'],
      correct: 0,
      explanation: 'Nach § 377 HGB muss der kaufmännische Käufer die Ware unverzüglich untersuchen und Mängel rügen, andernfalls gilt die Ware als genehmigt.'
    },
    {
      id: 39,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Was drückt der "Deckungsbeitrag" in der Kosten- und Leistungsrechnung aus?',
      options: ['Deckungsbeitrag = Umsatzerlöse abzüglich der variablen Kosten (Beitrag zur Deckung der Fixkosten)', 'Der Gewinn nach Abzug aller Steuern', 'Der Rabatt, den der Großkunde erhält', 'Die Summe aller Löhne und Gehälter'],
      correct: 0,
      explanation: 'Der Deckungsbeitrag (DB = Erlös - variable Kosten) zeigt, welcher Betrag eines Produkts zur Deckung der fixen Gesamtkosten beiträgt.'
    },
    {
      id: 40,
      category: 'wirtschaft',
      topic: 'Wirtschaft & Recht',
      question: 'Welche Rechtsform erfordert ein Mindeststammkapital von 25.000 € und haftet auf das Gesellschaftsvermögen beschränkt?',
      options: ['GmbH (Gesellschaft mit beschränkter Haftung)', 'Einzelunternehmen', 'GbR (Gesellschaft bürgerlichen Rechts)', 'OHG (Offene Handelsgesellschaft)'],
      correct: 0,
      explanation: 'Die GmbH ist eine juristische Person mit mind. 25.000 € Stammkapital, bei der Gesellschafter nicht mit ihrem Privatvermögen haften.'
    },
    {
      id: 41,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Wozu dient ein "Burndown-Chart" in Scrum?',
      options: ['Zur Visualisierung der verbleibenden Restarbeit (Story Points) über den Zeitverlauf eines Sprints', 'Zur Erfassung von Serverüberhitzungen im Rechenzentrum', 'Zur Auflistung von Entlassungen im Team', 'Zur Ermittlung der Raumtemperatur'],
      correct: 0,
      explanation: 'Das Burndown-Chart zeigt den täglichen Fortschritt: Auf der Y-Achse die verbleibenden Story Points, auf der X-Achse die Sprint-Tage.'
    },
    {
      id: 42,
      category: 'wirtschaft',
      topic: 'DSGVO & Datenschutz',
      question: 'Welche Rechtsgrundlage nach Art. 6 DSGVO ermöglicht die Verarbeitung von Mitarbeiterdaten für die Gehaltsabrechnung?',
      options: ['Erfüllung eines Vertrags (Arbeitsvertrag) sowie rechtliche Verpflichtungen', 'Ausschließlich eine jederzeit widerrufbare Werbeeinwilligung', 'Schutz lebenswichtiger Interessen der Vereinten Nationen', 'Es ist nach DSGVO grundsätzlich strengstens verboten'],
      correct: 0,
      explanation: 'Art. 6 Abs. 1 lit. b & c DSGVO erlaubt die Verarbeitung zur Vertragserfüllung (Arbeitsvertrag) sowie Erfüllung gesetzlicher Pflichten (Steuer, Sozialversicherung).'
    },
    {
      id: 43,
      category: 'wirtschaft',
      topic: 'Qualitätsmanagement',
      question: 'Was ist das Hauptziel eines "Code Reviews" im Software-Qualitätsmanagement?',
      options: ['Frühzeitiges Erkennen von Bugs, Sicherheitslücken und Sicherung von Code-Standards durch Kollegen', 'Die Bestrafung von Entwicklern mit Schreibfehlern', 'Das automatische Löschen veralteter Git-Branches', 'Das Umwandeln von Java in Python'],
      correct: 0,
      explanation: 'Code Reviews durch Peer-Reviewer verbessern Softwarequalität, Wissensaustausch im Team und decken Logikfehler frühzeitig auf (Vier-Augen-Prinzip).'
    },
    {
      id: 44,
      category: 'wirtschaft',
      topic: 'Handelskalkulation',
      question: 'Was versteht man unter dem "Break-Even-Point" (Gewinnschwelle)?',
      options: ['Der Punkt, an dem Erlöse und Gesamtkosten genau gleich hoch sind (Gewinn = 0)', 'Der Zeitpunkt, an dem ein Unternehmen bankrottgeht', 'Der maximale Rabattsatz für Neukunden', 'Der Tag, an dem die Umsatzsteuererklärung fällig ist'],
      correct: 0,
      explanation: 'Am Break-Even-Point (Gewinnschwelle) decken die Umsatzerlöse exakt die Fixkosten und variablen Kosten; ab hier wird Gewinn erwirtschaftet.'
    },

    // =========================================================================
    // 2. NETZWERKTECHNIK & IT-INFRASTRUKTUR (44 Fragen)
    // =========================================================================

    // --- Netzbereiche & Topologien (LAN, WAN, VLAN, DMZ) ---
    {
      id: 45,
      category: 'netzwerk',
      topic: 'Netzbereiche',
      question: 'Welcher Standard definiert VLAN-Tagging auf Layer 2 zur Trennung logischer Netze auf einem physischen Switch?',
      options: ['IEEE 802.1Q', 'IEEE 802.11ax', 'RFC 1918', 'IEEE 802.3af (PoE)'],
      correct: 0,
      explanation: 'IEEE 802.1Q fügt dem Ethernet-Frame einen 4-Byte VLAN-Tag hinzu (VLAN-ID von 1 bis 4094).'
    },
    {
      id: 46,
      category: 'netzwerk',
      topic: 'Netzbereiche',
      question: 'Was ist die Funktion einer DMZ (Demilitarized Zone) im Unternehmensnetzwerk?',
      options: ['Ein separates, isoliertes Netzwerksegment für öffentlich erreichbare Server (z. B. Web, Mail) zwischen zwei Firewalls', 'Der Raum, in dem Waffen gelagert werden', 'Ein unverschlüsseltes Gäste-WLAN ohne Passwort', 'Das interne Speichernetzwerk (SAN) der Buchhaltung'],
      correct: 0,
      explanation: 'Die DMZ trennt öffentlich zugängliche Dienste vom geschützten internen Intranet, sodass ein kompromittierter Webserver nicht direkt Zugriff aufs interne Netz hat.'
    },
    {
      id: 47,
      category: 'netzwerk',
      topic: 'Topologien',
      question: 'Welche Netzwerktopologie weist bei vollständiger Vermaschung (Full Mesh) die höchste Ausfallsicherheit auf?',
      options: ['Vollvermaschtes Netz (Mesh)', 'Bus-Topologie', 'Einfacher Ring', 'Klassische Baumstruktur'],
      correct: 0,
      explanation: 'In einem vollvermaschten Netz ist jeder Knoten mit jedem anderen direkt verbunden; der Ausfall einzelner Leitungen beeinträchtigt die Kommunikation nicht.'
    },
    {
      id: 48,
      category: 'netzwerk',
      topic: 'Netzbereiche',
      question: 'Welche typische Ausdehnung deckt ein Metropolitan Area Network (MAN) ab?',
      options: ['Eine Stadt oder Ballungsregion (ca. 5 bis 50 km)', 'Einen einzelnen Schreibtisch (Bluetooth/PAN)', 'Ein einzelnes Bürogebäude (LAN)', 'Den gesamten Globus (GAN/Internet)'],
      correct: 0,
      explanation: 'MAN (Metropolitan Area Network) verbindet mehrere LANs innerhalb einer Stadt oder Ballungsgebiets (z. B. Stadtwerke-Glasfasernetz).'
    },

    // --- Netzwerksicherheit & Verfügbarkeit (Firewalls, IDS/IPS, RAID, USV) ---
    {
      id: 49,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Was unterscheidet ein Intrusion Detection System (IDS) von einem Intrusion Prevention System (IPS)?',
      options: ['IDS erkennt Angriffe und schlägt Alarm; IPS greift aktiv in den Datenverkehr ein und blockiert Angriffe sofort', 'IDS blockiert Angriffe, IPS schaltet den Router aus', 'IDS funktioniert nur mit IPv6, IPS nur mit IPv4', 'Es gibt keinen Unterschied zwischen beiden'],
      correct: 0,
      explanation: 'IDS (Detection) arbeitet passiv (Alarmierung, Logging). IPS (Prevention) sitzt inline im Datenstrom und blockiert verdächtige Pakete in Echtzeit.'
    },
    {
      id: 50,
      category: 'netzwerk',
      topic: 'Verfügbarkeit & Speicher',
      question: 'Wie viele Festplatten dürfen in einem RAID-5-Verbund aus 4 Festplatten gleichzeitig maximal ausfallen, ohne dass Daten verloren gehen?',
      options: ['Genau 1 Festplatte', '2 Festplatten', '3 Festplatten', 'Keine einzige (sofortiger Datenverlust)'],
      correct: 0,
      explanation: 'RAID 5 verteilt Daten und Paritätsinformationen über alle Platten. Es toleriert genau den Ausfall von 1 Festplatte. RAID 6 toleriert 2 Ausfälle.'
    },
    {
      id: 51,
      category: 'netzwerk',
      topic: 'Verfügbarkeit & Speicher',
      question: 'Was kennzeichnet ein RAID 1 (Spiegelung)?',
      options: ['Volle Redundanz durch identische Spiegelung der Daten auf mindestens 2 Platten; Kapazität entspricht der kleinsten Platte', 'Streifung (Striping) ohne jegliche Redundanz für maximale Geschwindigkeit', 'Kombination aus 5 Festplatten mit doppelter Parität', 'Automatisches Backup in die Microsoft Cloud'],
      correct: 0,
      explanation: 'RAID 1 spiegelt sämtliche Daten 1:1 auf zwei oder mehr Laufwerke. Bei Ausfall einer Platte läuft das System unterbrechungsfrei weiter.'
    },
    {
      id: 52,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Welche Verschlüsselungsart verwendet das AES-Verfahren (Advanced Encryption Standard)?',
      options: ['Symmetrische Blockchiffre (gleicher Schlüssel für Ver- und Entschlüsselung)', 'Asymmetrisches Verfahren mit Public- und Private-Key', 'Einweg-Hashfunktion ohne Entschlüsselungsmöglichkeit', 'Mechanische Walzenverschlüsselung'],
      correct: 0,
      explanation: 'AES ist ein symmetrisches Verschlüsselungsverfahren mit Schlüssellängen von 128, 192 oder 256 Bit (extrem schnell und sicher).'
    },
    {
      id: 53,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Welche Aufgabe übernimmt eine Stateful-Inspection-Firewall im Vergleich zu einfachen Paketfiltern?',
      options: ['Sie analysiert den Verbindungsstatus und Kontext (Zustandstabelle) bestehender TCP/UDP-Sitzungen', 'Sie überprüft lediglich statisch Port- und IP-Nummern ohne Sitzungskontext', 'Sie sperrt pauschal das gesamte Internet', 'Sie reinigt den Server physisch von Staub'],
      correct: 0,
      explanation: 'Stateful-Inspection merkt sich aktive Verbindungen in einer Zustandstabelle (State Table) und lässt Antwortpakete nur zu, wenn eine autorisierte Sitzung existiert.'
    },
    {
      id: 54,
      category: 'netzwerk',
      topic: 'Verfügbarkeit & Strom',
      question: 'Welcher USV-Typ (Unterbrechungsfreie Stromversorgung) bietet die höchste Schutzklasse ohne jegliche Umschaltzeit bei Stromausfall?',
      options: ['Online-USV (Dauerwandler / VFI)', 'Offline-USV (Standby / VFD)', 'Line-Interactive-USV (VI)', 'Einfache Mehrfachsteckdosenleiste mit Schalter'],
      correct: 0,
      explanation: 'Online-USVs (VFI: Voltage and Frequency Independent) wandeln Netzspannung permanent in Gleichstrom und wieder in Wechselstrom um (Umschaltzeit = 0 ms).'
    },

    // --- IPv4 vs. IPv6 & Subnetting ---
    {
      id: 55,
      category: 'netzwerk',
      topic: 'IPv4 vs. IPv6',
      question: 'Wie viele Bits umfasst eine IPv6-Adresse im Vergleich zu einer IPv4-Adresse?',
      options: ['IPv6: 128 Bit (hexadezimal) vs. IPv4: 32 Bit (dezimal)', 'IPv6: 64 Bit vs. IPv4: 16 Bit', 'IPv6: 256 Bit vs. IPv4: 64 Bit', 'Beide haben exakt 32 Bit'],
      correct: 0,
      explanation: 'IPv4 hat 32 Bit (~4,29 Mrd. Adressen). IPv6 hat 128 Bit (~3,4 x 10^38 Adressen), aufgeteilt in 8 Blöcke zu je 4 Hex-Ziffern.'
    },
    {
      id: 56,
      category: 'netzwerk',
      topic: 'IPv4 vs. IPv6',
      question: 'Welche Adressierungsart gibt es in IPv6 im Gegensatz zu IPv4 NICHT mehr?',
      options: ['Broadcast (Rundruf an alle im Netz)', 'Unicast (Punkt-zu-Punkt)', 'Multicast (Gruppe von Empfängern)', 'Anycast (nächstgelegener Empfänger)'],
      correct: 0,
      explanation: 'IPv6 ersetzt Broadcasts vollständig durch gezielte Multicasts, um unnötige Netzlast auf unbeteiligten Stationen zu vermeiden.'
    },
    {
      id: 57,
      category: 'netzwerk',
      topic: 'Subnetting',
      question: 'Wie viele NUTZBARE Host-Adressen bietet ein IPv4-Subnetz mit der Maske 255.255.255.0 (/24)?',
      options: ['254 nutzbare Hosts', '256 nutzbare Hosts', '128 nutzbare Hosts', '255 nutzbare Hosts'],
      correct: 0,
      explanation: '2^(32-24) = 256 Gesamtadressen minus Netzadresse (.0) minus Broadcast-Adresse (.255) = 254 nutzbare Host-IPs.'
    },
    {
      id: 58,
      category: 'netzwerk',
      topic: 'Subnetting',
      question: 'Wie lautet die Broadcast-Adresse für die IP 192.168.10.50 mit der Subnetzmaske 255.255.255.192 (/26)?',
      options: ['192.168.10.63', '192.168.10.255', '192.168.10.64', '192.168.10.127'],
      correct: 0,
      explanation: 'Schrittweite bei /26 ist 256 - 192 = 64. Subnetze: 0–63, 64–127... 50 liegt im Netz 0–63. Netz-ID ist .0, Broadcast ist .63.'
    },
    {
      id: 59,
      category: 'netzwerk',
      topic: 'Subnetting',
      question: 'Welches ist der private IPv4-Adressbereich der Klasse B nach RFC 1918?',
      options: ['172.16.0.0 bis 172.31.255.255 (/12)', '10.0.0.0 bis 10.255.255.255 (/8)', '192.168.0.0 bis 192.168.255.255 (/16)', '127.0.0.0 bis 127.255.255.255 (Loopback)'],
      correct: 0,
      explanation: 'RFC 1918 reserviert: 10.0.0.0/8 (Klasse A), 172.16.0.0/12 (Klasse B, 16 Netze bis 172.31.x.x) und 192.168.0.0/16 (Klasse C).'
    },
    {
      id: 60,
      category: 'netzwerk',
      topic: 'IPv4 vs. IPv6',
      question: 'Was ist die IPv6-Loopback-Adresse (entsprechend 127.0.0.1 in IPv4)?',
      options: ['::1', 'fe80::1', 'ff02::1', '2001:db8::1'],
      correct: 0,
      explanation: 'Die IPv6-Loopback-Adresse lautet ::1 (0000:0000:0000:0000:0000:0000:0000:0001).'
    },

    // --- Routing (Statisch, Dynamisch, OSPF, BGP) ---
    {
      id: 61,
      category: 'netzwerk',
      topic: 'Routing',
      question: 'Auf welcher OSI-Schicht (Layer) arbeiten klassische IP-Router?',
      options: ['Schicht 3 (Vermittlungsschicht / Network Layer)', 'Schicht 2 (Sicherungsschicht / Data Link Layer)', 'Schicht 4 (Transportschicht)', 'Schicht 7 (Anwendungsschicht)'],
      correct: 0,
      explanation: 'Router arbeiten auf OSI-Layer 3 und leiten Datenpakete anhand von logischen IP-Zieladressen weiter.'
    },
    {
      id: 62,
      category: 'netzwerk',
      topic: 'Routing',
      question: 'Welches Routing-Protokoll ist ein Link-State-Protokoll und nutzt den Dijkstra-Algorithmus (SPF)?',
      options: ['OSPF (Open Shortest Path First)', 'RIP (Routing Information Protocol)', 'BGP (Border Gateway Protocol)', 'ARP (Address Resolution Protocol)'],
      correct: 0,
      explanation: 'OSPF ist ein modernes Link-State-Interior-Gateway-Protokoll, das mit dem Dijkstra-Algorithmus (Shortest Path First) den besten Pfad berechnet.'
    },
    {
      id: 63,
      category: 'netzwerk',
      topic: 'Routing',
      question: 'Welches Routing-Protokoll steuert als Path-Vector-Protokoll den Datenverkehr zwischen Autonomen Systemen (AS) im weltweiten Internet?',
      options: ['BGP (Border Gateway Protocol)', 'EIGRP', 'RIPv2', 'DHCP'],
      correct: 0,
      explanation: 'BGP (aktuell BGP-4) ist das fundamentale Exterior-Gateway-Protokoll (EGP) des Internets zur Kopplung autonomer Systeme.'
    },
    {
      id: 64,
      category: 'netzwerk',
      topic: 'Routing',
      question: 'Was kennzeichnet die Route mit Ziel 0.0.0.0/0 in einer Routing-Tabelle?',
      options: ['Standard-Route (Default Gateway) für alle Ziele, die keinem spezifischeren Subnetz entsprechen', 'Einen Loopback-Test auf Port 0', 'Eine automatische Sperrung aller eingehenden Verbindungen', 'Die Broadcast-Adresse des gesamten Internets'],
      correct: 0,
      explanation: '0.0.0.0/0 (Default Route) fängt alle Pakete ab, für die kein genauerer Eintrag (Longest Prefix Match) in der Routing-Tabelle existiert.'
    },

    // --- Netzwerkprotokolle (OSI, TCP, UDP, DNS, DHCP, HTTP/S, ARP, ICMP) ---
    {
      id: 65,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Welche Reihenfolge der 7 Schichten des OSI-Referenzmodells von Schicht 1 bis 7 ist korrekt?',
      options: ['Physical -> Data Link -> Network -> Transport -> Session -> Presentation -> Application', 'Application -> Presentation -> Session -> Network -> Transport -> Link -> Physical', 'Bit -> Byte -> Frame -> Packet -> Segment -> Data -> User', 'Kabel -> Switch -> Router -> Port -> IP -> MAC -> Web'],
      correct: 0,
      explanation: 'Merkhilfe: "Please Do Not Throw Sausage Pizza Away" (Physical, Data Link, Network, Transport, Session, Presentation, Application).'
    },
    {
      id: 66,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Was unterscheidet TCP von UDP auf der Transportschicht (Layer 4)?',
      options: ['TCP ist verbindungsorientiert mit Handshake und Fehlerkorrektur; UDP ist verbindungslos und minimiert Latenz', 'UDP garantiert den fehlerfreien Empfang jedes Pakets, TCP nicht', 'TCP kann nur im LAN verwendet werden, UDP nur im Internet', 'TCP transportiert nur Audio, UDP nur Webseiten'],
      correct: 0,
      explanation: 'TCP bietet verlässlichen Datenstrom durch Three-Way-Handshake (SYN, SYN-ACK, ACK), Sequenznummern und Quittungen. UDP ist unbestätigt, aber schneller (Gaming, Streaming).'
    },
    {
      id: 67,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Wie lauten die vier Phasen des DHCP-Lease-Vorgangs (DORA-Prinzip)?',
      options: ['Discover -> Offer -> Request -> Acknowledge', 'Demand -> Order -> Receive -> Accept', 'Dial -> Open -> Read -> Close', 'Detect -> Operate -> Route -> Apply'],
      correct: 0,
      explanation: 'DORA: Client sendet DHCP-Discover (Broadcast), Server antwortet mit DHCP-Offer, Client sendet DHCP-Request, Server bestätigt mit DHCP-ACK.'
    },
    {
      id: 68,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Welche Aufgabe übernimmt das Address Resolution Protocol (ARP)?',
      options: ['Auflösung einer bekannten IPv4-Adresse in die zugehörige physikalische MAC-Adresse auf Layer 2', 'Umwandlung von Domainnamen in IP-Adressen', 'Zuweisung automatischer Subnetzmasken', 'Verschlüsselung von WLAN-Paketen'],
      correct: 0,
      explanation: 'ARP (Layer 2/3) ermittelt per Broadcast "Wer hat IP X.X.X.X? Bitte melde deine MAC-Adresse an mich!".'
    },
    {
      id: 69,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Auf welchem Standard-Port lauscht das unverschlüsselte DNS-Protokoll (Domain Name System)?',
      options: ['Port 53 (überwiegend UDP)', 'Port 80 (TCP)', 'Port 443 (TCP)', 'Port 22 (TCP)'],
      correct: 0,
      explanation: 'DNS nutzt Port 53 (standardmäßig UDP für Anfragen; TCP für Zonentransfers oder Antworten über 512 Byte).'
    },
    {
      id: 70,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Welches Protokoll nutzt das Diagnose-Werkzeug "ping" zur Prüfung der Erreichbarkeit?',
      options: ['ICMP (Internet Control Message Protocol)', 'IGMP', 'SNMP', 'SMTP'],
      correct: 0,
      explanation: 'Ping sendet ICMP Echo Request Pakete (Type 8) und erwartet ICMP Echo Reply (Type 0).'
    },
    {
      id: 71,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Auf welchen TCP-Ports laufen standardmäßig SSH (Secure Shell) und HTTPS?',
      options: ['SSH auf Port 22, HTTPS auf Port 443', 'SSH auf Port 21, HTTPS auf Port 80', 'SSH auf Port 25, HTTPS auf Port 110', 'SSH auf Port 53, HTTPS auf Port 8080'],
      correct: 0,
      explanation: 'Well-Known-Ports: SSH = Port 22, HTTP = Port 80, HTTPS = Port 443, FTP = Port 20/21.'
    },

    // --- Netzwerkkomponenten (Switch, Router, Hub, AP) ---
    {
      id: 72,
      category: 'netzwerk',
      topic: 'Netzwerkkomponenten',
      question: 'Was ist der fundamentale Unterschied zwischen einem Netzwerk-Hub und einem Switch?',
      options: ['Ein Hub leitet Daten blind an alle Ports weiter (Layer 1); ein Switch lernt MAC-Adressen und schaltet Pakete gezielt (Layer 2)', 'Ein Hub verschlüsselt Pakete, ein Switch nicht', 'Ein Switch funktioniert nur mit Koaxialkabeln', 'Ein Hub verbindet verschiedene Subnetze über IP'],
      correct: 0,
      explanation: 'Hubs arbeiten auf Schicht 1 (Multiport-Repeater, Kollisionsdomäne für alle). Switches arbeiten auf Schicht 2 mit CAM-Tabelle (eigene Kollisionsdomäne je Port).'
    },
    {
      id: 73,
      category: 'netzwerk',
      topic: 'Netzwerkkomponenten',
      question: 'Was versteht man unter der "MAC-Adresstabelle" (CAM-Tabelle) eines Switches?',
      options: ['Eine Zuordnungstabelle, die speichert, an welchem physischen Switch-Port welche Quell-MAC-Adresse gesehen wurde', 'Eine Liste aller erlaubten Passwörter', 'Eine Tabelle der weltweiten IP-Routen', 'Eine Telefonliste aller Administratoren'],
      correct: 0,
      explanation: 'Der Switch lernt anhand der Absender-MAC eingehender Frames, an welchem Port welches Gerät hängt, um zukünftige Frames gezielt weiterzuleiten (Unicast).'
    },
    {
      id: 74,
      category: 'netzwerk',
      topic: 'Netzwerkkomponenten',
      question: 'Auf welcher OSI-Schicht arbeitet ein WLAN Access Point im reinen Bridge-Modus?',
      options: ['Schicht 2 (Sicherungsschicht / Data Link Layer)', 'Schicht 3 (Vermittlungsschicht)', 'Schicht 7 (Anwendungsschicht)', 'Schicht 1 (nur physikalisch)'],
      correct: 0,
      explanation: 'Ein Access Point überbrückt als Media Converter Funk-Frames (IEEE 802.11) und Ethernet-Frames (IEEE 802.3) auf Layer 2.'
    },

    // --- Netzwerkstandards & Verkabelung (Cat, IEEE 802.3, WLAN) ---
    {
      id: 75,
      category: 'netzwerk',
      topic: 'Netzwerkstandards',
      question: 'Welche Spezifikation beschreibt ein Twisted-Pair-Kabel der Kategorie Cat 6a?',
      options: ['Übertragungsfrequenzen bis 500 MHz und 10 Gigabit Ethernet (10GBASE-T) bis 100 m', 'Maximale Geschwindigkeit von nur 10 Mbit/s', 'Reines Glasfaserkabel ohne Kupferadern', 'Nur für Gleichstrom-Übertragung geeignet'],
      correct: 0,
      explanation: 'Cat 6a (Augmented) ist für 500 MHz spezifiziert und ermöglicht 10 Gbit/s über die volle Standarddistanz von 100 Metern.'
    },
    {
      id: 76,
      category: 'netzwerk',
      topic: 'Netzwerkstandards',
      question: 'Wofür steht die Kabelbezeichnung "S/FTP" bei Netzwerkkabeln?',
      options: ['Gesamtschirmung aus Geflecht (Screened) und Adernpaare einzeln mit Folie geschirmt (Foil Shielded Pairs)', 'Vollkommen ungeschirmtes Kabel (Simple Flexible Twisted Pair)', 'Kabel mit integriertem Stahlseil für Außenaufhängung', 'Spezialkabel für Fernsehempfang'],
      correct: 0,
      explanation: 'S/FTP (nach ISO/IEC 11801): S = Screen (Geflecht um Gesamtkabel), FTP = Foiled Twisted Pair (jedes Adernpaar einzeln foliert).'
    },
    {
      id: 77,
      category: 'netzwerk',
      topic: 'Netzwerkstandards',
      question: 'Welcher Standard beschreibt Power over Ethernet Plus (PoE+ nach IEEE 802.3at) bezüglich der maximalen Leistung am Port?',
      options: ['Bis zu 30 Watt am Port (ca. 25,5 W am Endgerät)', 'Maximal 5 Watt', 'Über 2.000 Watt (Drehstrom)', 'Genau 15,4 Watt (das war altes PoE 802.3af)'],
      correct: 0,
      explanation: 'PoE (802.3af) liefert 15,4 W; PoE+ (802.3at) liefert bis zu 30 W; 4PPoE / PoE++ (802.3bt) bis zu 90 W.'
    },
    {
      id: 78,
      category: 'netzwerk',
      topic: 'Netzwerkstandards',
      question: 'Auf welchen Frequenzbändern funkt der moderne WLAN-Standard Wi-Fi 6E (IEEE 802.11ax)?',
      options: ['2,4 GHz, 5 GHz und 6 GHz', 'Ausschließlich im Langwellenbereich bei 100 kHz', 'Nur bei 60 GHz (WiGig)', 'Nur im 5-GHz-Band'],
      correct: 0,
      explanation: 'Wi-Fi 6E erweitert Wi-Fi 6 um das zusätzliche, störungsarme 6-GHz-Frequenzband (5.925 bis 7.125 MHz).'
    },
    {
      id: 79,
      category: 'netzwerk',
      topic: 'Netzwerkstandards',
      question: 'Welche maximale Leitungslänge (Permanent Link) gilt für strukturierte Kupferverkabelung nach EN 50173?',
      options: ['90 Meter Verlegekabel + max. 10 Meter Patchkabel (Gesamt: 100 m)', 'Genau 500 Meter', 'Beliebig lang ohne Dämpfung', 'Maximal 25 Meter'],
      correct: 0,
      explanation: 'Der Channel-Link nach ISO/IEC 11801 / EN 50173 ist auf 100 Meter begrenzt (typisch: 90 m Installationskabel + 2x 5 m Patchkabel).'
    },
    {
      id: 80,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Was ist der Vorteil von WPA3-Enterprise gegenüber WPA2-Personal (PSK)?',
      options: ['Individuelle Benutzer-Authentifizierung über 802.1X/RADIUS-Server und 192-Bit-Sicherheits-Suite statt gemeinsamem Passwort', 'Verzicht auf jede Verschlüsselung zur Steigerung der Bandbreite', 'Es funktioniert ohne Funkwellen', 'Passwörter müssen täglich manuell am Router eingetippt werden'],
      correct: 0,
      explanation: 'WPA3-Enterprise nutzt EAP/RADIUS für persönliche Zugangsdaten, verhindert Mithören anderer Netzteilnehmer und nutzt modernste Krypto-Suites.'
    },
    {
      id: 81,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Welches Protokoll ermöglicht sicheres Dateiübertragen über eine verschlüsselte SSH-Verbindung?',
      options: ['SFTP (SSH File Transfer Protocol)', 'Unverschlüsseltes FTP', 'TFTP (Trivial File Transfer Protocol)', 'Telnet'],
      correct: 0,
      explanation: 'SFTP nutzt den verschlüsselten SSH-Kanal (Port 22). FTPS hingegen nutzt FTP über TLS/SSL.'
    },
    {
      id: 82,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Wozu dient NAT (Network Address Translation) in IPv4-Routern?',
      options: ['Übersetzung privater IP-Adressen des internen LANs in eine öffentliche IP-Adresse für den Internetzugang', 'Messung der Stromstärke des Routers', 'Verschlüsselung von E-Mail-Anhängen', 'Formatierung von USB-Festplatten'],
      correct: 0,
      explanation: 'NAT (bzw. NAPT / PAT) ermöglicht vielen Geräten mit privaten IPs (RFC 1918), über eine einzige öffentliche IP im Internet zu kommunizieren.'
    },
    {
      id: 83,
      category: 'netzwerk',
      topic: 'Netzwerkprotokolle',
      question: 'Welche Information liefert der DNS-Eintragstyp "MX" (Mail Exchange)?',
      options: ['Den zuständigen Mailserver für den Empfang von E-Mails zu einem Domainnamen', 'Die IPv6-Adresse eines Webservers (das ist AAAA)', 'Den kanonischen Aliasnamen einer Domain (CNAME)', 'Den Reverse-Pointer einer IP-Adresse (PTR)'],
      correct: 0,
      explanation: 'MX-Records legen fest, an welche Mailserver E-Mails für die jeweilige Domain zugestellt werden müssen (inkl. Prioritätswert).'
    },
    {
      id: 84,
      category: 'netzwerk',
      topic: 'Netzwerkkomponenten',
      question: 'Was versteht man unter dem Begriff "Kollisionsdomäne"?',
      options: ['Der Netzwerkbereich, in dem Datenpakete kollidieren können, wenn zwei Stationen gleichzeitig senden (z. B. an einem Hub)', 'Ein Hacker-Angriff auf eine Firmen-Website', 'Ein Absturz zweier Satelliten im Weltraum', 'Die maximale Anzahl an Festplatten in einem Server'],
      correct: 0,
      explanation: 'In einer Kollisionsdomäne teilen sich Stationen das Übertragungsmedium (Halbduplex). Ein Switch bricht Kollisionsdomänen an jedem Port auf.'
    },
    {
      id: 85,
      category: 'netzwerk',
      topic: 'Subnetting',
      question: 'Welche Subnetzmaske entspricht der CIDR-Notation /28?',
      options: ['255.255.255.240', '255.255.255.128', '255.255.255.192', '255.255.255.224'],
      correct: 0,
      explanation: '/28 bedeutet 28 gesetzte Bits: 24 Bits (255.255.255) + 4 Bits im letzten Oktett (128+64+32+16 = 240). 16 IPs, 14 Hosts.'
    },
    {
      id: 86,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Was ist der Unterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?',
      options: ['Symmetrisch nutzt denselben Schlüssel für Ver- und Entschlüsselung; Asymmetrisch nutzt ein Schlüsselpaar (Public Key & Private Key)', 'Asymmetrisch ist 1000-mal schneller als symmetrische Chiffren', 'Symmetrisch funktioniert nur mit USB-Sticks', 'Asymmetrische Verschlüsselung wurde 2020 verboten'],
      correct: 0,
      explanation: 'Symmetrisch (z. B. AES): 1 geheimer Schlüssel für beide Richtungen. Asymmetrisch (z. B. RSA, ECC): Öffentlicher Schlüssel verschlüsselt, privater entschlüsselt.'
    },
    {
      id: 87,
      category: 'wirtschaft',
      topic: 'Projektmanagement',
      question: 'Was versteht man im Projektmanagement unter "Scope Creep"?',
      options: ['Das unkontrollierte Anwachsen des Projektumfangs ohne Anpassung von Zeit, Budget und Ressourcen', 'Ein Computervirus auf dem Entwicklungsrechner', 'Die pünktliche Fertigstellung aller Aufgaben vor dem Zeitplan', 'Die Reduzierung der Projektkosten um 50%'],
      correct: 0,
      explanation: 'Scope Creep bezeichnet das schleichende, unkontrollierte Hinzufügen neuer Anforderungen während der Projektrealisierung ohne Budgeterhöhung.'
    },
    {
      id: 88,
      category: 'netzwerk',
      topic: 'Netzwerksicherheit',
      question: 'Was bezweckt ein DoS- bzw. DDoS-Angriff (Distributed Denial of Service)?',
      options: ['Die Überlastung von Servern oder Netzdiensten durch massive Fluten an Anfragen, sodass reguläre Nutzer keinen Zugriff mehr haben', 'Das heimliche Ausspähen von Passwörtern über die Webcam', 'Das physische Stehlen von Server-Hardware aus dem Rechenzentrum', 'Die automatische Reparatur von defekten Festplatten'],
      correct: 0,
      explanation: 'DDoS zielt darauf ab, die Verfügbarkeit eines IT-Dienstes durch Überlastung der Bandbreite oder Systemressourcen mit einem Botnetz lahmzulegen.'
    }
  ];

  class QuestionBank {
    static get questions() {
      return QUESTIONS;
    }

    static getAll() {
      return QUESTIONS;
    }

    static getCount() {
      return QUESTIONS.length;
    }

    static getRandom(count = 5, category = null) {
      let pool = QUESTIONS;
      if (category) {
        pool = QUESTIONS.filter(q => q.category === category);
      }
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    static getById(id) {
      return QUESTIONS.find(q => q.id === id);
    }
  }

  window.QuestionBank = QuestionBank;
})();
