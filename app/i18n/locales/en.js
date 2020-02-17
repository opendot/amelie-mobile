export default {
    app_name: "Amelie",
    greeting: "Welcome!",
    airett: "Airett",
    empty_list: "This list is empty",
    write_tag: "Write a tag to start",
    ok: "OK",
    save: "Save",
    undo: "Undo",
    exit: "Exit",
    skip: "Skip",
    other: "Other...",
    hello: "Hello",
    or: "or",
    synchronize: "Synchronize",
    disconnect: "Disconnect",
    back_to_menu: "Back to Menù",

    box: "Box:",
    target: "Target:",
    test: "Test:",

    comunicator: "Comunicator",
    games: "Games",
    cognitive_enhancement: "Cognitive Enhancement",
    cognitive_enhancement_initial_sentence: "choose a box to start",
    cognitive_session_confirm: "Open cognitive session",
    box_name: "Box:",
    exercice: "Exercice: ",
    calibration: "Calibration",
    actual_target: "Current target:",
    actual_test: "Current test:",
    test_repetition: "Current test state:",
    target_repetition: "Current target state:",
    first_time: "Zero times",
    second_time: "First time",
    third_time: "Second time",

    end_test: "End of the test",
    end_target: "End of the target",
    correct_answers: "Correct Answers:",
    wrong_answers: "Wrong Answers:",
    ok_message: "Test passed !",
    ok_message_target: "Target passed !",
    not_ok_message: "try again the box next time !",

    fixing_time_edit: "Fixation time (millisecond)",
    fixing_radius_edit: "Fixation radius\n(% monitor size)",
    fixation_edit: "Fixation time (millisecond)",
    partner: "Partner",

    home: "Home",
    connect: "Connect",
    connected: "Connected!",
    loading: "Loading...",
    ip: "IP",
    port: "Port",
    signin: "Sign In",
    signin_no_account: "Proceed without an account",
    signout: "Sign Out",
    email: "Email",
    password: "Password",
    insert: "Insert",
    preview: "Preview",

    exit_confirmation: "Do you want to close the application?",
    settings: "Settings",
    change: "Change",
    fixation: "Fixation",
    device: "Device",
    manual: "Manual",
    automatic: "Automatic",

    fixation_time: "Fixation time",
    fixation_radius: "Fixation radius",
    idle: "Idle",
    trigger_sound: "Sound trigger",
    eyes: "Eyes",
    setting_reset: "Reset model settings",

    error: {
        urlNotFound: "Address not found",
        invalidUrl: "Invalid address",
        repeatSignin: "Must repeat signin",
        shouldNever: "This should never happen",
        tree: {
            index: "Error on Tree index",
            create: "Error on Tree creation",
            get: "Error getting Tree",
            edit: "Error on Tree edit",
            delete: "Error on Tree delete",
            unreachablePages: "In the tree there are unreachable pages",
        },
        page: {
            create: "Error on Page creation",
            get: "Error getting Page",
            edit: "Error on Page edit",
            delete: "Error on Page delete",
        },
        card: {
            generic: "Card Error",
            index: "Error on Card index",
            create: "Error on Card creation",
            get: "Error getting Card",
            edit: "Error on Card edit",
            delete: "Error on Card delete",
            indexFiles: "Error on PC Files index",
            getFile: "Error on getting PC File",
            indexImages: "Error on PC Images index",
            getImage: "Error on getting PC Image",
            fileSize: "Content too big, choose a file with size less then 50 MB",
        },
        cardTag: {
            generic: "Error Card Tag",
            index: "Error on Card Tag index",
            create: "Error on Card Tag creation",
        },
        websocket: {
            generic: "Error on socket communication",
            closed: "Socket is closed",
        },
        server: {
            generic: "Server Error",
            communication: "Error on server communication",
            synch: "Error synchronization",
            synchUpload: "An error occurred during upload, if the error persists contact the support. Code {{code}}",
            synchDownload: "An error occurred during  download, if the error persists contact the support. Code {{code}}",
            synchPrevious: "An error occurred while retrieving the previous synchronization, if the error persists contact the support. Code {{code}}",
        },
        patient: {
            generic: "Partner Error",
            missing: "No partner selected",
        },
        session: {
            generic: "Session Error",
            create: "Error on Session creation",
            get: "Error getting Session",
            edit: "Error on Session edit",
            delete: "Error on Session delete",
            results: "Error getting cognitive session result",
            changeRoute: "Error changing route",
            align: "Errore Align Eyetracker",
        },
        event: {
            generic: "Event Error",
            create: "Error on Event creation",
            get: "Error getting Event",
            edit: "Error on Event edit",
            delete: "Error on Event delete",
        },
        trackerCalibrationParameter: {
            generic: "Tracker Parameter Error",
            create: "Error on Tracker Parameter creation",
            get: "Error getting Tracker Parameter",
            edit: "Error on Tracker Parameter edit",
            delete: "Error on Tracker Parameter delete",
        },
        synchRequired: {
            title: "Synchronization required",
            text: "A previous synchronization failed, you must complete it to continue using the app",
            synchUpload: "An error happened during upload, if persist contact assistence. Code {{code}}",
            synchDownload: "An error happened during download, if persist contact assistence. Code {{code}}",
            synchPrevious: "An error happened during previous session recovery, if persist contact assistence. Code {{code}}",
        },
        game: {
            generic: "Error Game",
            start: "Error Start Game",
            stop: "Error Stop Game",
        }
    },

    game: {
        start: "Start",
        bubbles: "The Bubbles",
        stars: "The Night",
        eggs: "The Henhouse",
        sheeps: "The Pasture",
        difficulty: {
            easy: "easy",
            medium: "medium",
            hard: "hard",
        },
        level: {
            l1: "Level 1",
            l2: "Level 2",
            l3: "Level 3",
            l4: "Level 4",
            l5: "Level 5",
        },
    },

    eyetrackerCalibration: {
        start_training: "Start training",
        stop_training: "Stop training",
        selectVideo: "select a video",
        ongoing: "Calibration ongoing",
        complete: "Calibration complete",
        failed: "Calibration failed",
        interrupted: "Calibration interrupted",
    },

    tree: {
        generic: "Tree",
        generics: "Trees",
        create: "Creation tree",
        edit: "Edit tree",
        existing: "Existing tree",
        saving: "Saving tree...",
        sending: "Sending tree...",
        insert: "Insert Tree",
    },

    page: {
        generic: "Page",
        generics: "Pages",
        create: "Creation page",
        edit: "Edit page",
    },

    card: {
        generic: "Card",
        generics: "Cards",
        create: "Creation card",
        edit: "Edit card",
        createLink: "Create link",
        deleteLink: "Delete link",
        labelAsImage: "Use label as image",
        insertAudio: "Insert audio",
        insertImage: "Insert image",
        insertImageVideo: "Insert image/video",
        insertVideo: "Insert video",
        selectVideoPoster: "Select video cover",
        transparency: "Transparency level",
        generateContent: "Creating content...",
        newCard: "New card"
    },

    user: {
        generic: "User",
        create: "Creation user",
        edit: "Edit user",
        birthdate: "Birthdate",
        library: "User library"
    },

    patient: {
        generic: "Partner",
        select: "Select partner",
    },

    session: {
        generic: "Session",
        create: "Creation session",
        edit: "Edit session",
        exitPreview: "Exit from Preview",
    },

    event: {
        generic: "Evento",
        create: "Creation event",
        edit: "Edit event",
    },


    computerip: "Computer IP",
    scanQRCodeToConnect: "To connect to device, take a picture of QR code",
    scanQRCode: "Scan QR code",
    readQRCode: "Read QR code",
    readerQRCode: "Reader QR code",

    doSignin: "Do login to proceed",
    selectPatientQuestion: "Who do you want to communicate with?",

    onlineUpdateDetected: "We have noticed that there are updates online",
    onlineUpToDate: "Your datas are up to date",
    synchroOnlineQuestion: "Do you want to synchronize files on the device?",

    label: "Label",
    image: "Image",
    gallery: "Gallery",
    camera: "Camera",
    computer: "Computer",
    computerFolder: "Computer folder",
    photo: "Photo",
    video: "Video",
    audio: "Audio",
    record: "Record",
    tags: "Tags",
    level: "Level",
    cardSelectionAction: {
        speechSynthesizer: "Speech Synthesizer",
    },
    cardLevel: {
        l1: "1 - personal photo",
        l2: "2 - generic photo",
        l3: "3 - Drawing",
        l4: "4 - Icon",
        l5: "5 - Text",
    }

};