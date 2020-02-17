/**
 * Contains all function, server request and redux actions related to Sessions and Events
 */

import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)

import { fetchFromServer, checkResponseError } from "../utils/utils";
import { newSession, addTreeToStack, removeTreeFromStack, connectSocketEyeTracker, goBackHistory, setFlagBackShuffleEvent } from "./WSactions";
import { showErrorModal } from "./ModalAction";
import { deleteAllPreviewTrees } from "./TreeActions";

import I18n from "../i18n/i18n";

import pageTheme from "../themes/page-theme";

/**
 * Add a new session to the server
 * @param {string} type the type of training session:
 *      communication_sessions, cognitive_sessions, learning_sessions, calibration_sessions
 * @param {any} session the created session that we send to the server
 * @param {function} [callback = null] called after the response from the server, it receive the created session
 *  as a parameter, or null if the creation failed
 */
export function createTrainingSession( type, session, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `${type}`,
            'POST',
            null,
            session,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.session.create")) )
        .then( (response) => {
            console.log(`createTrainingSession ${type} response`, response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`createTrainingSession ${type} error: `, error);
            dispatch(showErrorModal( I18n.t("error.session.create"), error.message || JSON.stringify(error)));
            if( callback ){ callback(null);}
        });
    }
}

export function createEvent( eventType, session, page = null, body = null, callback = null ){
    return function( dispatch, getState) {
        let event = {
            training_session_id: session.id,
            page_id: page ? page.id : null,
            ...body,
        };
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `${eventType}`,
            'POST',
            null,
            event,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.event.create")) )
        .then( (response) => {
            // console.log(`createEvent response`, response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`createEvent error: `, error);
            dispatch(showErrorModal( I18n.t("error.event.create"), error.message || JSON.stringify(error)));
            if( callback ){ callback(null);}
        });
    }
}

export function createLoadTreeEvent( session, tree, callback = null ){
    return function( dispatch, getState) {
        let event = {
            training_session_id: session.id,
            tree: tree,
        };
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `load_tree_events`,
            'POST',
            null,
            event,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.event.create")) )
        .then( (response) => {
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`createLoadTreeEvent error: `, error);
            dispatch(showErrorModal( I18n.t("error.event.create"), error.message || JSON.stringify(error)));
            if( callback ){ callback(null);}
        });
    }
}

export function createBackEvent( session, displayPage, pageHistory, treeStack, treeList, callback = null) {
    return function( dispatch, getState) {
        console.log("onback",displayPage,pageHistory.length,session)
        if( 
            (displayPage && pageHistory.length == 1)   //  It's the first element of the history
            || pageHistory.length <= 0   //  History is empty
            || !session //  Session is over
        ){
            // We can't go back, stop here
            return;
        }

        // Go to previous page, and send that page into the backevent
        /* WARNING to go back of N pages I need to go back of N+1 pages
        The BackEvent will cause an event SHOW_PAGE, this will change the displayPage
        and will add a new page to the history.
        So I have to remove also the page that will be shown, since the SHOW_PAGE event will
        add it in the history */
        let tempPageHistory = null;
        if( displayPage ) {
            tempPageHistory = pageHistory.slice(0, -1);// Copy all but the last page
            // Update store
            dispatch(goBackHistory(2));
        }
        else {
            // The current page is null, so it's not in the history
            // Show the last page in the history
            tempPageHistory = pageHistory.slice(0);
            // Update store
            dispatch(goBackHistory(1));
        }

        let nextPage = tempPageHistory[tempPageHistory.length-1];
        /*if( !nextPage.treeId ) {
            // This happens when selecting the last page and then immediately press shuffle
            // the previous dispatch(goBackHistory(1)) fix the problem
            console.log("ERROR createBackEvent - Missing treeId in nextPage", nextPage);
            return;
        }*/

        // Also update the tree stack, since the back event could send to another tree
        if( treeStack.length == 0    // Handle case of "session is over, go back to the last page of the session"
            || treeStack[treeStack.length-1].uid != nextPage.treeUID    // Handle base case, the next page is in a different tree
            || (displayPage && displayPage.level == 0 && treeStack.length > 1 )    // Handle case "go back until exiting the tree", this is necessary if more tree with the same id are open
        ){
            // I'm changing tree
            if( treeStack.length > 1 
                && treeStack[treeStack.length-2].id == nextPage.treeId ) {
                // Go to the tree below the current one
                dispatch(removeTreeFromStack());
            }
            else {
                // Go back to a tree that was removed, add it again
                let tempTree = JSON.parse(JSON.stringify(treeList[nextPage.treeId]));
                tempTree.uid = nextPage.treeUID;// Assign the same unique identifier
                dispatch(addTreeToStack( tempTree, displayPage));
            }
        }

        dispatch(createEvent( 
            "back_events",
            session,
            displayPage,
            {next_page_id: nextPage.id},
            callback,
        ));
    }
}

export function createShuffleEvent( session, displayPage, callback = null) {
    return function( dispatch, getState) {
        if( !displayPage && session
            && getState().webSocketReducer.session.pageHistory.length > 0) {
            // If session is ended, go to last page and then send the shuffle
            // Set a flag, when receiving the event SHOW_PAGE it will automatically create a Shuffle Event
            let fullSession = getState().webSocketReducer.session;
            dispatch(setFlagBackShuffleEvent(true));
            dispatch(createBackEvent(session, displayPage, fullSession.pageHistory, fullSession.treeStack, fullSession.treeList, callback))
            return;
        }

        // console.log("Original cards", this.props.displayPage.cards);
        let shuffledCards = JSON.parse(JSON.stringify(displayPage.cards));

        let horizontalRatio = pageTheme.cardBaseWidth / pageTheme.width;
        let verticalRatio = pageTheme.cardBaseHeight / pageTheme.height;
        // Now switch the x_pos, y_pos and scale
        displayPage.cards.forEach( (card, index) => {
            shuffledCards[index].x_pos = 1 - card.x_pos - horizontalRatio * card.scale;
            shuffledCards[index].y_pos = 1 - card.y_pos - verticalRatio * card.scale; 
        });

        // Send event to websocket
        dispatch(createEvent( 
            "shuffle_events",
            session,
            displayPage,
            {cards: shuffledCards},
            callback,
        ));
    }
}

/**
 * Do all the operations to start a session with a tree
 * @param {string} type of session to start
 * @param {any} tree object to show in the session, a complete tree with all the pages
 */
export function startTrainingSession( type, tree, callback = null) {
    return function( dispatch, getState) {
        const patient = getState().authenticationReducer.currentPatient;
        if( !patient ){ 
            dispatch(showErrorModal(null, I18n.t("error.patient.missing")));
            if( callback){callback(null);}
            return null;
        }

        // Close existing sessions
        dispatch( resetPreviousSession(getState().webSocketReducer.session) );

        // Get tracker_calibration_parameter from Settings
        let trainingSession ={
            id: ObjectID.generate(),
            patient_id: patient.id,
            tracker_calibration_parameter: Object.assign({
                id: ObjectID.generate(),
            },
            getState().settingReducer.trackerCalibration),
        };
        dispatch( openSocketEyetracker());

        // Create the training session
        dispatch(createTrainingSession( type, trainingSession, ( createdSession ) => {
            if( createdSession ){
                // Send new params to Node Server
                dispatch(sendTrackerParams(trainingSession.tracker_calibration_parameter));

                // Save new active sessione in the store
                dispatch( newSession(createdSession) );
                
                // Load the current tree
                const treeId = tree.id;
                
                // Switch on session type
                switch(type) { 
                    case 'communication_sessions': { 
                       // I don't send the tree id, use only the objects I'm sending
                       tree.id = null;
                       break; 
                    } 
                    case 'cognitive_sessions': { 
                       // Tree only contains the id, do nothing
                       break; 
                    } 
                    default: { 
                       // communication_sessions as default
                       tree.id = null;
                       break; 
                    } 
                }
                
                // Add the tree to the tree stack of the session
                // Do it before create the event, since the SHOW_PAGE message from the communicator may arrive sooner
                // than the response
                tree.id = treeId;
                dispatch( addTreeToStack(tree) );
                dispatch( createLoadTreeEvent( createdSession, tree, ( createdEvent) => {
                    if( !createdEvent ) {
                        // Something went wrong, remove the inserted tree
                        dispatch( removeTreeFromStack() );
                    }
                    if( callback){callback(createdEvent);}
                }) );
            }
            else {
                if( callback){callback(null);}
            }

            // Don't close the socketEyeTracker, it's used by the LiveView component
        }));
    }
}

/**
 * Do all the operations to start a preview with a tree
 * @param {string} type of session to start
 * @param {any} tree object to show in the session, a complete tree with all the pages
 */
export function startPreviewSession( type, tree, callback = null) {
    return function( dispatch, getState) {
        const patient = getState().authenticationReducer.currentPatient;

        if( !patient ){ 
            dispatch(showErrorModal(null, I18n.t("error.patient.missing")));
            if( callback){callback(null);}
            return null;
        }

        // Close existing sessions
        dispatch( resetPreviousSession(getState().webSocketReducer.session) );
        // Delete all preview trees
        dispatch( deleteAllPreviewTrees(getState().authenticationReducer.currentPatient, (response) => {
            // I don't care about the response, start the preview anyway

            // In a preview the training session will have a custom id
            const previewId = "preview_"+getState().authenticationReducer.currentUser.id;

            // Get tracker_calibration_parameter from Settings
            let trainingSession ={
                id: previewId,
                patient_id: patient.id,
                tracker_calibration_parameter: Object.assign({
                    id: ObjectID.generate(),
                },
                getState().settingReducer.trackerCalibration),
            };
            // console.log("startPreviewSession ", trainingSession);
            dispatch( openSocketEyetracker());

            // Create the training session
            dispatch(createTrainingSession( type, trainingSession, ( createdSession ) => {
                if( createdSession ){
                    // Send new params to Node Server
                    dispatch(sendTrackerParams(trainingSession.tracker_calibration_parameter));

                    // Save new active sessione in the store
                    dispatch( newSession(createdSession) );

                    // Add the tree to the tree stack of the session
                    // Do it before create the event, since the SHOW_PAGE message from the communicator may arrive sooner
                    // than the response
                    const cloneTree = JSON.parse(JSON.stringify(tree));
                    dispatch( addTreeToStack(cloneTree) );

                    tree.id = null;// I don't send the tree id, use only the objects I'm sending
                    dispatch( createLoadTreeEvent( createdSession, tree, ( createdEvent) => {
                        if( !createdEvent ) {
                            // Something went wrong, remove the inserted tree
                            dispatch( removeTreeFromStack() );
                        }
                        if( callback){callback(createdEvent);}
                    }) );
                }
                else {
                    if( callback){callback(null);}
                }

                // Don't close the socketEyeTracker, it's used by the LiveView component
            }));
        }) );
        
    }
}

/**
 * Advise the server about a route changing, from training_session to @name
 * @param {string} name of the target route
 */
export function changeRoute(targetRoute, callback = null) {
    return function(dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            'training_sessions/change_route',
            'POST',
            null,
            {name: targetRoute},
            getState().authenticationReducer.signinCredentials
        )
        .then(checkResponseError(dispatch, getState, I18n.t("error.session.changeRoute")))
        .then((response) => {
            console.log('POST training_sessions/change_route Response: ', response);
            if(callback){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log('changeRoute error: ', error);
            dispatch(showErrorModal( I18n.t("error.session.changeRoute"), error.message || JSON.stringify(error)));
            if(callback){callback(null);}
        });
    }
}

/**
 * Show or hide the align line for the Eyetracker
 * @param {boolean} show 
 * @param {function} callback 
 */
export function showAlignEyetrackerLine( show, callback = null) {
    return function(dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            'training_sessions/align_eyetracker',
            'POST',
            null,
            {show: show},
            getState().authenticationReducer.signinCredentials
        )
        .then(checkResponseError(dispatch, getState, I18n.t("error.session.align")))
        .then((response) => {
            // console.log('POST training_sessions/align Response: ', response);
            if(callback){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log('align error: ', error);
            dispatch(showErrorModal( I18n.t("error.session.align"), error.message || JSON.stringify(error)));
            if(callback){callback(null);}
        });
    }
}

/** Check if there are open sessions, and close them */
export function resetPreviousSession( session ) {
    return function( dispatch, getState) {
        if( session.current ){
            // Close the existing session
            dispatch(createEvent(
                "/transition_to_end_events",
                session.current, session.displayPage,
            ));
        }
    }
}

function isSocketOpen( socket ) {
    return socket != null 
        && !socket.isClosed();
}

/** In a Training session I need to notify the Node Server about the params
 * Open the socket if it's closed
 */
function openSocketEyetracker() {
    return function( dispatch, getState) {
        let socket = getState().webSocketReducer.socketEyeTracker;
        if( !isSocketOpen( socket) ) {
            dispatch( connectSocketEyeTracker( null, false, null));
        }
    }
}

/** Send all the tracker calibration parameters to Node Server */
export function sendTrackerParams(trackerCalibrationParameter) {
    return function( dispatch, getState) {
        let socket = getState().webSocketReducer.socketEyeTracker;
        if( !socket.isClosed() ){
            if( trackerCalibrationParameter.setting == "automatic") {
                // Automatic/trained calibration
                socket.send({ type: "SET_TRAINED_PARAMS",
                    data: {
                        transition_matrix: trackerCalibrationParameter.transition_matrix,
                        trained_fixation_time: trackerCalibrationParameter.trained_fixation_time,
                    },
                });
            }
            else {
                // Manual/untrained calibration
                socket.send({ type: "SET_UNTRAINED_PARAMS",
                    data: {
                        fixation_time: trackerCalibrationParameter.fixing_time_ms,
                        fixation_radius: trackerCalibrationParameter.fixing_radius,
                    },
                });
            }
        }
    }
}