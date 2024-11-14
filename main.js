// main.js

Hooks.on("ready", () => {
    console.log("Modulo Attiva Macro all'Utilizzo di un Oggetto caricato.");
});

// Hook sull'utilizzo di un oggetto
Hooks.on("useItem", async (item, actor) => {
    // Recupera l'ID della macro associata
    const macroId = item.getFlag("trigger-macro-on-use", "macroId");

    if (!macroId) return; // Esci se non è stata assegnata alcuna macro

    // Verifica se la macro esiste
    const macro = game.macros?.get(macroId);
    if (!macro) {
        ui.notifications?.warn(`Macro associata non trovata.`);
        return;
    }

    // Esegui la macro
    console.log(`Esecuzione della macro "${macro.name}" per l'oggetto "${item.name}".`);
    await macro.execute();
});

// Aggiungi l'area di drag-and-drop alla scheda dell'oggetto per collegare una macro
Hooks.on("renderItemSheet", (app, html, data) => {
    if (!game.user?.isGM) return; // Solo i GM possono impostare le macro

    const item = app.object;

    // Crea un'area di drop per la macro
    const macroDropArea = `
    <div class="form-group macro-drop-area">
      <label>Macro da Attivare all'Utilizzo (Trascina qui una macro):</label>
      <div class="macro-drop-zone" style="border: 2px dashed #888; padding: 8px; text-align: center;">
        Trascina una macro qui
      </div>
    </div>`;

    // Aggiungi l'area di drop alla scheda dell'oggetto
    html.find(".tab[data-tab='details']").append(macroDropArea);

    // Recupera e mostra il nome della macro, se è già collegata
    const macroId = item.getFlag("trigger-macro-on-use", "macroId");
    if (macroId) {
        const macro = game.macros?.get(macroId);
        if (macro) {
            html.find(".macro-drop-zone").text(`Macro attualmente collegata: ${macro.name}`);
        }
    }

    // Gestione del drop
    html.find(".macro-drop-zone").on("drop", async (event) => {
        event.preventDefault();

        // Ottieni i dati dall'elemento trascinato
        const dataTransfer = event.originalEvent?.dataTransfer?.getData("text/plain");
        if (!dataTransfer) return;

        const data = JSON.parse(dataTransfer);

        // Verifica che l'elemento trascinato sia una macro
        if (data.type === "Macro") {
            const macroId = data.id;
            const macro = game.macros?.get(macroId);

            if (macro) {
                // Salva l'ID della macro nell'oggetto
                await item.setFlag("trigger-macro-on-use", "macroId", macroId);

                // Aggiorna il testo dell'area di drop per mostrare la macro collegata
                html.find(".macro-drop-zone").text(`Macro collegata: ${macro.name}`);
                ui.notifications?.info(`Macro "${macro.name}" collegata all'oggetto "${item.name}".`);
            }
        } else {
            ui.notifications?.warn("Trascina solo macro su questa area.");
        }
    });

    // Gestione del trascinamento (dragover) per consentire il drop
    html.find(".macro-drop-zone").on("dragover", (event) => {
        event.preventDefault();
    });
});
