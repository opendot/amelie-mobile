export default {
    app_name: "Amelie",
    greeting: "Benvenuti!",
    airett: "Airett",
    empty_list: "Questa lista è vuota",
    write_tag: "Scrivi un tag per iniziare",
    ok: "OK",
    save: "Salva",
    undo: "Annulla",
    exit: "Esci",
    skip: "Salta",
    other: "Altro...",
    hello: "Ciao",
    or: "oppure",
    synchronize: "Sincronizza",
    disconnect: "Disconnettiti",
    back_to_menu: "Torna al Menù",

    box: "Box:",
    target: "Target:",
    test: "Test:",

    comunicator: "Comunicatore",
    games: "Giochi",
    cognitive_enhancement: "Potenziamento Cognitivo",
    cognitive_enhancement_initial_sentence: "Scegli un box per cominciare",
    cognitive_session_confirm: "Conferma e avvia",
    box_name: "Box:",
    exercice: "Esercizio: ",
    calibration: "Calibrazione",
    actual_target: "Target attuale:",
    actual_test: "Test attuale:",
    test_repetition: "Stato test attuale:",
    target_repetition: "Stato target attuale:",
    first_time: "Nessuna volta",
    second_time: "Prima volta",
    third_time: "Seconda volta",

    end_test: "Fine test",
    end_target: "Fine target",
    correct_answers: "Risposte Corrette:",
    wrong_answers: "Risposte Errate:",
    ok_message: "Test superato !",
    ok_message_target: "Target superato !",
    not_ok_message: "Riprova il box la prossima volta !",

    fixing_time_edit: "Tempo di fissazione (millisecondo)",
    fixing_radius_edit: "Raggio di fissazione\n(% grandezza monitor)",

    home: "Home",
    connect: "Connettiti",
    connected: "Connesso !",
    loading: "Caricamento...",
    ip: "IP",
    port: "Porta",
    signin: "Accedi",
    signin_no_account: "Procedi senza account",
    signout: "Esci",
    email: "Email",
    password: "Password",
    insert: "Inserisci",
    preview: "Anteprima",

    exit_confirmation: "Vuoi uscire dall'applicazione ?",
    settings: "Impostazioni",
    partner: "Partner",
    change: "Cambia",
    fixation: "Fissazione",
    device: "Dispositivo",
    manual: "Manuale",
    automatic: "Automatica",

    fixation_time: "Tempo di fissazione",
    fixation_radius: "Raggio di fissazione",
    idle: "Idle",
    trigger_sound: "Trigger sonoro",
    eyes: "Occhi",
    setting_reset: "Reset impostazioni modello",

    error: {
        urlNotFound: "Indirizzo non trovato",
        invalidUrl: "Indirizzo non valido",
        repeatSignin: "Bisogna rifare l'accesso",
        shouldNever: "Questo non dovrebbe mai accadere",
        tree: {
            index: "Errore lista Alberi",
            create: "Errore creazione Albero",
            get: "Errore ricerca Albero",
            edit: "Errore modifica Albero",
            delete: "Errore cancellazione Albero",
            unreachablePages: "Nell'albero ci sono delle pagine irraggiugibili",
        },
        page: {
            create: "Errore creazione Pagina",
            get: "Errore ricerca Pagina",
            edit: "Errore modifica Pagina",
            delete: "Errore cancellazione Pagina",
        },
        card: {
            generic: "Errore Carta",
            index: "Errore lista Carte",
            create: "Errore creazione Carta",
            get: "Errore ricerca Carta",
            edit: "Errore modifica Carta",
            delete: "Errore cancellazione Carta",
            indexFiles: "Errore lista File PC",
            getFile: "Errore ricerca File PC",
            indexImages: "Errore lista Immagini PC",
            getImage: "Errore ricerca Immagine PC",
            fileSize: "Contenuto troppo grande, scegliere un file di dimensioni inferiori a 50 MB",
        },
        cardTag: {
            generic: "Errore Tag della Carta",
            index: "Errore lista Tag delle Carte",
            get: "Errore ricerca Tag della Carta",
        },
        websocket: {
            generic: "Errore di comunicazione socket",
            closed: "Il puntatore oculare non è connesso al computer",
        },
        server: {
            generic: "Errore server",
            communication: "Errore di comunicazione server",
            synch: "Errore sincronizzazione",
            synchUpload: "Si è verificato un errore in fase di upload, se l'errore persiste contatta l'assistenza. Codice {{code}}",
            synchDownload: "Si è verificato un errore in fase di download, se l'errore persiste contatta l'assistenza. Codice {{code}}",
            synchPrevious: "Si è verificato un errore in fase di recupero della sincronizzazione precedente, se l'errore persiste contatta l'assistenza. Codice {{code}}",
        },
        patient: {
            generic: "Errore partner",
            missing: "Nessun partner selezionato",
        },
        session: {
            generic: "Errore Sessione",
            create: "Errore creazione Sessione",
            get: "Errore ricerca Sessione",
            edit: "Errore modifica Sessione",
            delete: "Errore cancellazione Sessione",
            results: "Errore risultati sessione cognitiva",
            changeRoute: "Errore cambiamento della route",
            align: "Errore Allineamento Eyetracker",
        },
        event: {
            generic: "Errore Evento",
            create: "Errore creazione Evento",
            get: "Errore ricerca Evento",
            edit: "Errore modifica Evento",
            delete: "Errore cancellazione Evento",
        },
        trackerCalibrationParameter: {
            generic: "Errore Parametro Tracker",
            create: "Errore creazione Parametro Tracker",
            get: "Errore ricerca Parametro Tracker",
            edit: "Errore modifica Parametro Tracker",
            delete: "Errore cancellazione Parametro Tracker",
        },
        synchRequired: {
            title: "Sincronizzazione necessaria",
            text: "La sincronizzazione precedente è fallita, è necessario completarla prima di poter usare l'app",
        },
        game: {
            generic: "Errore Gioco",
            start: "Errore Avvio Gioco",
            stop: "Errore Interruzione Gioco",
        }
    },

    game: {
        start: "Avvia",
        bubbles: "Le Bollicine",
        stars: "La Notte",
        eggs: "Il Pollaio",
        sheeps: "Il Pascolo",
        difficulty: {
            easy: "facile",
            medium: "medio",
            hard: "difficile",
        },
        level: {
            l1: "Livello 1",
            l2: "Livello 2",
            l3: "Livello 3",
            l4: "Livello 4",
            l5: "Livello 5",
        },
    },

    eyetrackerCalibration: {
        start_training: "Avvia training",
        stop_training: "Interrompi",
        selectVideo: "seleziona un video",
        ongoing: "Calibrazione in corso",
        complete: "Calibrazione completata",
        failed: "Calibrazione fallita",
        interrupted: "Calibrazione interrotta",
    },

    tree: {
        generic: "Albero",
        generics: "Alberi",
        create: "Creazione albero",
        edit: "Modifica albero",
        existing: "Flusso esistente",
        sending: "Invio albero...",
        saving: "Salvataggio albero...",
        insert: "Inserire Flusso",
    },

    page: {
        generic: "Scheda",
        generics: "Schede",
        create: "Creazione scheda",
        edit: "Modifica scheda",
    },

    card: {
        generic: "Carta",
        generics: "Carte",
        create: "Creazione carta",
        edit: "Modifica carta",
        createLink: "Crea collegamento",
        deleteLink: "Cancella collegamento",
        labelAsImage: "Usa label come immagine",
        insertAudio: "Inserisci audio",
        insertImage: "Inserisci immagine",
        insertImageVideo: "Inserisci immagine/video",
        insertVideo: "Inserisci video",
        selectVideoPoster: "Scegli cover video",
        transparency: "Livello di trasparenza",
        generateContent: "Creazione contenuto...",
        newCard: "Nuova card"
    },

    user: {
        generic: "Utente",
        create: "Creazione utente",
        edit: "Modifica utente",
        birthdate: "Data di nascita",
        library: "Libreria utente",
    },

    patient: {
        generic: "Partner",
        select: "Seleziona partner",
    },

    session: {
        generic: "Sessione",
        create: "Creazione sessione",
        edit: "Modifica sessione",
        exitPreview: "Esci da Preview",
    },

    event: {
        generic: "Evento",
        create: "Creazione evento",
        edit: "Modifica evento",
    },


    computerip: "IP computer",
    scanQRCodeToConnect: "Per connetterti al dispositivo, scatta una foto del QR code",
    scanQRCode: "Scatta QR code",
    readQRCode: "Lettura QR code",
    readerQRCode: "Lettore QR code",

    doSignin: "Fai login per procedere",
    selectPatientQuestion: "Con chi vuoi comunicare ?",

    onlineUpdateDetected: "Abbiamo notato che ci sono aggiornamenti online",
    onlineUpToDate: "I tuoi dati sono aggiornati",
    synchroOnlineQuestion: "Vuoi sincronizzare i file su dispositivo ?",

    label: "Label",
    image: "Immagine",
    gallery: "Galleria",
    camera: "Fotocamera",
    computer: "Computer",
    computerFolder: "Cartella computer",
    photo: "Foto",
    video: "Video",
    audio: "Audio",
    record: "Registra",
    tags: "Tags",
    level: "Livello",
    cardSelectionAction: {
        speechSynthesizer: "Sintesi vocale",
    },
    cardLevel: {
        l1: "1 - fotografia personale",
        l2: "2 - fotografia generica",
        l3: "3 - Disegno",
        l4: "4 - Icona",
        l5: "5 - Testo",
    }

};
