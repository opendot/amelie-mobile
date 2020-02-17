import { AUTH } from "./ActionTypes";

import { fetchFromServer, checkResponseError } from "../utils/utils";
import { showErrorModal, openLoginModal, openLoadingModal, closeLoadingModal, openForceSyncModal, closeForceSyncModal } from "./ModalAction";

import {setSocketServer, setDisplayPage, removeTreeFromStack, setCardVideoPlaying, gazeOn, gazeOff, setSession, newSession, newTree, setDisplayPageWithoutLabel} from "./WSactions";
import { getTrackerCalibrationParameter, setTrackerCalibrationParams } from "./SettingActions";
import { createEvent } from "./SessionActions";
import WSService from "../components/wsService";
import { setOpen, setClose } from "./LiveViewActions";
import { NavigationActions } from 'react-navigation';
import NavigationService from "../components/navigationService"

import I18n from "../i18n/i18n";


export function getLoginCredentials(getState) {
    return getState().authenticationReducer.signinCredentials;
}

/** 
 * Define the url of the server
 * @param {string} newUrl url of the server, including both https, ip and port
 */
export function setServerUrl( newUrl ){
    return {
        type: AUTH.SERVERURL,
        payload: newUrl,
    }
}

/** 
 * Define the authentication token of the user
 * @param {string} newSigninCredentials all the credentails: access-token, client, expiry,
 *      token-type and uid
 */
export function setSigninCredentials( newSigninCredentials ){
    return {
        type: AUTH.SIGNINCREDENTIALS,
        payload: newSigninCredentials,
    }
}

/**
 * Log the user to the server
 * @param {string} email 
 * @param {string} password 
 */
export function authenticateUser(email, password, routeOverride = null, keepPatient=false, callback = null){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            routeOverride || `sign_in`,
            'POST',
            null,
            {
                'email': email,
                'password': password,
                'server_ip': getState().authenticationReducer.serverUrl,
            },
            null, 10000)
            .then( (response) => {
                if(response.status == 303) {
                    dispatch(authenticateUser(email, password, "auth/sign_in", keepPatient, callback))
                    return null;
                }
                return response;
            })
            .then( onSigninResponse(dispatch, getState, callback, email, null, keepPatient))
            .catch(error => {
                console.log("Authentication error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
            })
    }
}

/** Enter as a Guest */
export function authenticateGuest(keepPatient=false, callback = null){
    return authenticateUser( "guest@mail.it", "fkhkwy6hcs", "auth/sign_in", false, callback);
}

/**
 * Log the user to the server using the stored credentials
 * @param {any} signinCredentials all the credentails: access-token, client, expiry,
 *      token-type and uid
 */
export function authenticateUserWithStoredCredentials( signinCredentials, callback = null) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `sign_in`,
            'POST',
            signinCredentials,
            {
                'server_ip': getState().authenticationReducer.serverUrl,
            },
            null, 10000)
            .then( (response) => {
                // console.log("authenticateUser "+email, response);
                if(response.status >= 300) {
                    // Credentials are no longer valid, do logout
                    dispatch(doSignout());
                    if( callback ){callback(null);}
                }
                else {
                    // Act as if it was a normal signin, but preserve the patient
                    const storedPatient = JSON.parse(JSON.stringify(getState().authenticationReducer.currentPatient));
                    onSigninResponse(dispatch, getState, (response) => {
                        if( response ){
                            if(storedPatient && storedPatient.id ){
                                dispatch( setCurrentPatient(storedPatient));
                                dispatch(getTrackerCalibrationParameter( storedPatient.id, ( trackerCalibrationParams ) => {

                                    if( trackerCalibrationParams) {
                                        dispatch(setTrackerCalibrationParams(trackerCalibrationParams));
                                    }
                                    
                                    if( callback ){
                                        callback(response);
                                    }
                                }));
                            }
                            else {
                                // Missing patient
                                if( callback ){
                                    callback(response);
                                }
                            }
                        }
                    }
                    , null, signinCredentials)(response);
                }
            })
            .catch(error => {
                console.log("Authentication with stored credentials error: ", error);
                dispatch(showErrorModal( I18n.t("error.server.communication"), error.message || JSON.stringify(error)));
                if( callback ){callback(null);}
            })
    }
}

/** Signin as guest and select the patient */
export function signinGuest( callback = null ) {
    return function( dispatch, getState) {
        dispatch(
            authenticateGuest(false, (loginCredentials) => {
                // Get patient for guest
                fetchFromServer(
                    getState().authenticationReducer.serverUrl,
                    `patients`,
                    'GET',
                    null,
                    null,
                    getState().authenticationReducer.signinCredentials,
                    10000
                )
                .then( checkResponseError(dispatch, getState, I18n.t("error.patient.generic")) )
                .then( (response) => {
                    // console.log("signinGuest get Guest Patients response", response, callback);
                    if( response ){
                        const patientsArray = response.data;
                        // Guest users have only 1 patient
                        const patient = patientsArray[0];
                        dispatch(getTrackerCalibrationParameter( patient.id, ( trackerCalibrationParams ) => {

                            const currentPatient = getState().authenticationReducer.currentPatient;
                            // Clear tree and session if patient changed
                            if( !currentPatient || currentPatient.id != patient.id){
                                dispatch(newTree(null));
                                dispatch(newSession(null));
                            }
                            // Save the patient in the store
                            dispatch(setCurrentPatient( patient ));
                            if( trackerCalibrationParams) {
                                dispatch(setTrackerCalibrationParams(trackerCalibrationParams));
                            }
                            
                            if( callback ){
                                callback(patient);
                            }
                        }));
                    }
                    else {
                        if( callback ){
                            callback(null);
                        }
                    }
                })
            })  // END authenticateGuest(false, (loginCredentials) => {
        );
    }
}

function onSigninResponse(dispatch, getState, callback = null, email = null, signinCredentials = null, keepPatient = false) {
    return (response) => {
        if (!response) return;
        // console.log("authenticateUser "+email, response);
        if(response.status >= 300) {
            // Error on login
            dispatch(showErrorModal( I18n.t("error.server.generic"), response.data.errors[0]));
            if( callback ){callback(null);}
            return;
        }
        
        // Save authentication tokens received from server
        let loginCredentials = {
            'access-token':response.headers['access-token'],
            'client':response.headers['client'],
            'expiry':response.headers['expiry'],
            'token-type':response.headers['token-type'],
            'uid':response.headers['uid']
        };
        dispatch(setSigninCredentials(loginCredentials));

        // Save user informations on redux store
        let details = null;
        details = getUserDetails(response);
        dispatch({
            type: AUTH.SIGNIN,
            payload: details,
            keepPatient: keepPatient
        })

        // Connect websockets
        let ip = getState().authenticationReducer.serverUrl.split("//")[1].split(":")[0];
        dispatch( connectWebsocket( ip, callback) )

    };
}

/** Given a response from the server create a json with the informations about the user */
function getUserDetails(response) {
    switch (response.data.type){
        case "Researcher":
        return {
            id: response.data.id,
            name: response.data.name,
            surname: response.data.surname,
            email: response.data.email,
            bithdate: response.data.bithdate,
            type: response.data.type,
        };

        default:
        return {
            id: response.data.id,
            name: response.data.name,
            surname: response.data.surname,
            email: response.data.email,
            bithdate: response.data.bithdate,
            type: response.data.type,
        };
    }
}

/** Signout from server and clear data on current device */
export function doSignout(callback = null) {
    return function(dispatch, getState) {
        fetchFromServer(getState().authenticationReducer.serverUrl,'auth/sign_out',"DELETE",{},{}, getLoginCredentials(getState), 10000).then(response => {
            dispatch ({
                type: AUTH.SIGNOUT,
                payload: null
            });
            // Diconnect sockets
            if( getState().webSocketReducer.socketServer ){
                getState().webSocketReducer.socketServer.close();
                getState().webSocketReducer.socketServer.logout();
            }
            if( getState().webSocketReducer.socketEyeTracker ){
                getState().webSocketReducer.socketServer.close();
                getState().webSocketReducer.socketEyeTracker.logout();
            }

            // Call callback
            if( callback){callback();}
        }).catch(error => {
            console.log("Error performing logout. User has been looget out only on client side.", error);
            dispatch ({
                type: AUTH.SIGNOUT,
                payload: null
            });

            // Call callback
            if( callback){callback();}
        })
    }
}

/** Connect to websocket and save them in the store */
export function connectWebsocket( ip, callback = null ){
    return function(dispatch, getState) {
        let loginCredentials = getState().authenticationReducer.signinCredentials;
        // Connect to websocket with server
        let socketServer = new WSService(`${getState().authenticationReducer.serverUrl.split("//")[1]}/cable`// Remove http:// from servertUrl
        +`?uid=${loginCredentials.uid}&access-token=${loginCredentials["access-token"]}&client=${loginCredentials.client}`,
        {
            "command":"subscribe",
            "identifier":"{\"channel\":\"CableChannel\",\"direction\":\"server_to_mobile\"}",
        },
        (e) => {
            if(getState().webSocketReducer.socketServer && getState().webSocketReducer.socketServer.ws
                && e.currentTarget._socketId != getState().webSocketReducer.socketServer.ws._socketId) {
                // console.log(`AuthenticationActions.connectWebsocket: message from wrong socket ${e.currentTarget._socketId} != ${getState().webSocketReducer.socketServer.ws._socketId}`)
                return; 
            }
            
            const event = JSON.parse(e.data);
            console.log(event);
            const session = getState().webSocketReducer.session;
            if( !session.current ) {
                // console.log("AuthenticationActions.connectWebsocket No Active session", session);
            }

            // console.log("WSService Server onMessage", event);

            if( event.message ){

                if(event.message == '{"type":"LAST_CLIENT"}'){
                    event.message = JSON.parse(event.message);
                }

                switch (event.message.type) {

                    case 'queryres':
                        dispatch(setCards(event.data));
                        break;

                    case 'SHOW_PAGE':
                        // Page can be null, if it is it won't be added to the pageHistory
                        // Avoid to display Cards label if the current session is cognitive
                        if(session.current && session.current.type === "CognitiveSession")
                            dispatch(setDisplayPageWithoutLabel(event.message.page));
                        else
                            dispatch(setDisplayPage(event.message.page));
                        break;

                    case 'CURRENT_PAGE':
                        // Message received when the app went in background during a session,
                        // used to realign with desktp app
                        if( event.message.session ) {
                            if( !session.current || session.current.id !== event.message.session ) {
                                // If I lost session data or they're outdated, set them
                                dispatch(setSession({id: event.message.session, patient_id: event.message.patient}));
                            }
                            if(session.current && session.current.type === "CognitiveSession"){
                                dispatch(setDisplayPageWithoutLabel(event.message.page));
                            }
                            else {
                                dispatch(setDisplayPage(event.message.page));
                            }
                            
                            dispatch(setOpen());
                        }
                        else {
                            // Close active sessions if any
                            if( session.current ) {
                                dispatch(newSession(null));
                            }
                        }
                        break;

                    case 'SHOW_END':
                        // End of TrainingSession
                        dispatch(setDisplayPage(null));
                        break;

                    case 'NO_MORE_PAGES':
                        // No more pages in the tree
                        if( session.treeStack.length > 1){
                            // Close the current tree and show the next tree in the stack
                            let nextVisibleTree = session.treeStack[session.treeStack.length-2];
                            
                            // Remove the tree from stack
                            dispatch(removeTreeFromStack());
                            // Go to the previously open page of the next visible tree
                            dispatch(createEvent(
                                "/jump_to_page_events",
                                session.current, session.displayPage,
                                {
                                    next_page_id: nextVisibleTree.currentPageId,
                                },
                            ));
                        }
                        else if( session.treeStack.length <= 1) {
                            // This was the last tree, close the session
                            // Remove the tree from stack
                            dispatch(removeTreeFromStack());

                            if( session.current ) {
                                // Close session
                                dispatch(createEvent(
                                    "/transition_to_end_events",
                                    session.current, session.displayPage,
                                ));
                            }
                        }
                        break;

                    case 'SYNCHRONIZATION_RESULT':
                        if (event.message.code == "401") {
                            dispatch(openLoginModal(() => dispatch(startServerSync())));
                            break;
                        }
                        // For every synch I will receive 2 messages: the results of upload and download
                        dispatch( handleSynchronizationResponse(event.message) );
                        break;

                    case 'gazeOn':
                        dispatch(gazeOn());
                        break;

                    case 'gazeOff':
                        dispatch(gazeOff());
                        break;

                    case 'cardlistres':
                        dispatch(updateCardList(event.data));
                        break;

                    case "PLAY_VIDEO":
                        // Set a flag that a video is Playing, set the card id
                        dispatch(setCardVideoPlaying(event.message.data.card_id));
                        break;

                    case "LAST_CLIENT":

                        // Navigate back to initial screen
                        const nav = NavigationActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: 'Home'}),
                            ]
                        });

                        NavigationService.dispatcher(nav);
                        break;

                    case "END_VIDEO":
                        // Set a flag that no video is Playing
                        dispatch(setCardVideoPlaying(null));
                        break;

                    case 'END_SESSION':
                        dispatch(newSession(null));
                        dispatch(setClose());
                        break;

                }
            }
        }, true);

        // Close previous server if exist
        const {webSocketReducer} = getState();
        if( webSocketReducer.socketServer ) {
            webSocketReducer.socketServer.close();
            webSocketReducer.socketServer.logout();
        }

        dispatch(setSocketServer(socketServer));

        // Connection to eyetracker is done by the LiveView component
        /* WARNING since the socketEyeTracker send a lot of data, it's managed by the component
        that needs it: every component open and close it based on its needs. There can be conflicts
        when 2 or more components try to use it at the same time */

        // Pass credentials to callback
        if( callback ){callback(getLoginCredentials(getState));}
    }
}

/** Start the synchronization between the offline adn online servers 
 * The conclusion of the syncronization will be received in a socket message */
export function startServerSync( patient = null, onSynchronizationComplete = null) {
    return function(dispatch, getState) {
        // Block the application until synch is completed
        dispatch(openLoadingModal(null,"Sync"));
        dispatch( setIsSynchronizing({upCompleted: false, downCompleted: false}) );
        dispatch( setOnSynchComplete(onSynchronizationComplete));
        let patientId = patient ? patient.id 
            : ( getState().authenticationReducer.currentPatient ? getState().authenticationReducer.currentPatient.id : null);
        fetchFromServer(
            getState().authenticationReducer.serverUrl,'synchronizations',
            "POST",
            {},
            { patient_id: patientId },
            getLoginCredentials(getState),
            0).then(response => {console.log("Response: ", response); return response})
        .then( checkResponseError(dispatch, getState, I18n.t("error.server.synch")) )
        .then(response => {
            if( !response) {
                // Synchronization failed
                dispatch( closeLoadingModal() );
                dispatch( setIsSynchronizing(null) );
            }

            // Completed, check synch result
            dispatch(getSynchronizations( patientId, (synchronizations) => {
                if( !synchronizations ) {
                    dispatch(showErrorModal( I18n.t("error.server.synch"), "No synchronizations"));
                }
                const { currentPatient, onSynchronizationComplete } = getState().authenticationReducer;

                const lastUpload = synchronizations.filter( s => s.direction === "up")[0];
                const lastDownload = synchronizations.filter( s => s.direction === "down")[0];
                
                // console.log("synchInterval lastUpload", lastUpload);
                // console.log("synchInterval lastDownload", lastDownload);
                
                // Firts we have an upload then a download
                if( lastUpload && !lastUpload.ongoing && lastUpload.success 
                    && lastDownload && !lastDownload.ongoing && lastDownload.success ) {
                    // Success
                    dispatch( closeLoadingModal() );
                    dispatch( setIsSynchronizing(null) );
                    if( onSynchronizationComplete ) {
                        onSynchronizationComplete(currentPatient);
                    }
                }
                else {
                    // Failure
                    const onNewSynchRequiredPress = () => {
                        dispatch(startServerSync(currentPatient, onSynchronizationComplete));
                        dispatch(closeForceSyncModal());
                    };
                    if( !lastUpload || lastUpload.ongoing || !lastUpload.success ) {
                        dispatch(openForceSyncModal( I18n.t("error.server.synch"), I18n.t("error.server.synchUpload", {code: 500}), onNewSynchRequiredPress));
                    }
                    else if( !lastDownload || lastDownload.ongoing || !lastDownload.success ) {
                        dispatch(openForceSyncModal( I18n.t("error.server.synch"), I18n.t("error.server.synchDownload", {code: 500}), onNewSynchRequiredPress));
                    }
                }
            }));

        })
        .catch(error => {
            console.log("startServerSync error: ", error.response);
            const hasErrors = (error.response && error.response.data && error.response.data.errors);
            dispatch(showErrorModal( I18n.t("error.server.synch"), hasErrors ?  error.response.data.errors.toString() : JSON.stringify(error.response) ));
            const { currentPatient, onSynchronizationComplete } = getState().authenticationReducer;
            dispatch( closeLoadingModal() );
            dispatch( setIsSynchronizing(null) );
            if( onSynchronizationComplete ) {
                onSynchronizationComplete(currentPatient);
            }
        });
    }
}

export function handleSynchronizationResponse( message ) {
    return function(dispatch, getState) {
        // {type: "SYNCHRONIZATION_RESULT", direction: "down", success: true}
        // console.log("handleSynchronizationResponse message", message);
        let newIsSynch = {...getState().authenticationReducer.isSynchronizing};
        const onNewSynchRequiredPress = () => {
            const { currentPatient, onSynchronizationComplete } = getState().authenticationReducer;
            dispatch(startServerSync(currentPatient, onSynchronizationComplete));
            dispatch(closeForceSyncModal());
        };
        switch( message.direction ) {
            case "up":
                if( !message.success ) {
                    // The operation failed
                    dispatch(openForceSyncModal( I18n.t("error.server.synch"), I18n.t("error.server.synchUpload", {code: message.code}), onNewSynchRequiredPress));
                    // The sync will stop, so set the sync as completed
                    newIsSynch.downCompleted = true;
                }
                // I don't care about the result, I set that I received a response
                newIsSynch.upCompleted = true;
                break;
            case "down":
                if( !message.success ) {
                    // The operation failed
                    dispatch(openForceSyncModal( I18n.t("error.server.synch"), I18n.t("error.server.synchDownload", {code: message.code}), onNewSynchRequiredPress));
                    // The sync will stop, so set the sync as completed
                    newIsSynch.upCompleted = true;
                }
                // I don't care about the result, I set that I received a response
                newIsSynch.downCompleted = true;
                break;
            case "previous":
                if( !message.success ) {
                    // The operation failed
                    dispatch(openForceSyncModal( I18n.t("error.server.synch"), I18n.t("error.server.synchPrevious", {code: message.code}), onNewSynchRequiredPress));
                    // The sync will stop, so set the sync as completed
                    newIsSynch.upCompleted = true;
                    newIsSynch.downCompleted = true;
                }
                break;
        }

        if( newIsSynch.upCompleted && newIsSynch.downCompleted) {

            // Update patient informations
            const currentPatient = getState().authenticationReducer.currentPatient;
            const onSynchronizationComplete = getState().authenticationReducer.onSynchronizationComplete;
            dispatch( updatePatientInfo( currentPatient.id, (patient) => {
                // Synchronization complete
                if( onSynchronizationComplete ) {
                    onSynchronizationComplete(patient);
                }
                dispatch( closeLoadingModal() );
                dispatch( setIsSynchronizing(null) );
            } ) );
        }
        else {
            // Still working
            dispatch( setIsSynchronizing(newIsSynch) );
        }
    }
}

/** Retrieve from the server the informations about the patient */
export function updatePatientInfo( patientId, callback = null ) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `patients/${patientId}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials,
            10000
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.patient.generic")) )
        .then( (response) => {
            // console.log("updatePatientInfo patient response", response, callback);
            if( response ){
                const patient = response.data;

                // Update tracker calibration parameters
                dispatch(getTrackerCalibrationParameter( patient.id, ( trackerCalibrationParams ) => {

                    // Save the patient in the store
                    dispatch(setCurrentPatient( patient ));
                    if( trackerCalibrationParams) {
                        dispatch(setTrackerCalibrationParams(trackerCalibrationParams));
                    }
                    
                    if( callback ){
                        callback(patient);
                    }
                }));
            }
            else {
                if( callback ){
                    callback(null);
                }
            }
        });
    };
}

/** Retrieve the list of ongoing synchtronizations of the patient */
export function getSynchronizations( patientId, callback = null ) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `synchronizations?patient_id=${patientId}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.server.synch")) )
        .then( (response) => {
            // console.log("getSynchronizations patient response", response);
            if( response ){
                const ongoing = response.data;
                    
                if( callback ){
                    callback(ongoing);
                }

            }
            else {
                if( callback ){
                    callback(null);
                }
            }
        });
    };
}

/** Retrieve the list of queued synchronizable objects of the patient */
export function getQueuedSynchronizables( patientId, callback = null ) {
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `patients/${patientId}/queued_synchronizables`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.patient.generic")) )
        .then( (response) => {
            // console.log("getQueuedSynchronizables patient response", response, callback);
            if( response ){
                const queuedSynchronizables = response.data;
                    
                if( callback ){
                    callback(queuedSynchronizables);
                }

            }
            else {
                if( callback ){
                    callback(null);
                }
            }
        });
    };
}

/**
 * Define the patient we are currently working with
 * @param {any} patient 
 */
export function setCurrentPatient( patient ){
    return {
        type: AUTH.SETCURRENTPATIENT,
        payload: patient,
    };
}

export function setIsSynchronizing( isSynchronizing ){
    return {
        type: AUTH.SETISSYNCHRONIZING,
        payload: isSynchronizing,
    };
}

/** Callback for when the sync is complete */
export function setOnSynchComplete( onSynchronizationComplete = null ){
    return {
        type: AUTH.SETONSYNCCOMPLETE,
        payload: onSynchronizationComplete,
    };
}