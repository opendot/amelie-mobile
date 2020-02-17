/**
 * Contains all function, server request and redux actions related to Setting.
 * Settings contains informations about the tracker calibration parameters,
 * that are used to start a TrainingSession
 */

import { SETTING } from "./ActionTypes";

import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)

import { fetchFromServer, checkResponseError } from "../utils/utils";
import { createEvent, createTrainingSession, startPreviewSession, resetPreviousSession, sendTrackerParams } from "./SessionActions";
import { newSession } from "./WSactions";
import { showErrorModal } from "./ModalAction";

import I18n from "../i18n/i18n";

/**
 * Edit settings
 * @param {any} newSettings the object containing the updated params
 */
export function setSetting( newSettings ){
    return {
        type: SETTING.SETSETTING,
        payload: newSettings,
    };
}

/**
 * Edit settings about Tracker Calibration Parameters
 * @param {any} newSettings the object containing the updated params
 */
export function setTrackerCalibrationParams(newSettings ){
    return {
        type: SETTING.SETTRACKERCALIBRATIONPARAM,
        payload: newSettings,
    };
}

/**
 * Get the Tracker Calibration Parameters of a patient
 * @param {string} patientId the id of the patient related to the params
 * @param {function} [callback = null] called after the response from the server, it receive the retrieved params
 *  as a parameter, or null if something went wrong
 */
export function getTrackerCalibrationParameter( patientId, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `patients/${patientId}/tracker_calibration_parameters/current`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.trackerCalibrationParameter.get")) )
        .then( (response) => {
            // console.log("getTrackerCalibrationParameter response", response, callback);
            if( callback ){
                // convert fixing radius to integer

                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getTrackerCalibrationParameter error: ", error);
            dispatch(showErrorModal( I18n.t("error.trackerCalibrationParameter.get"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Add a new Tracker Calibration Parameter to the server, this set the default value
 * of an EyeTracker's parameter for the patient
 * @param {any} trackerCalibration the created Tracker Calibration Parameter that we send to the server
 * @param {function} [callback = null] called after the response from the server, it receive the created param
 *  as a parameter, or null if the creation failed
 */
export function createTrackerCalibrationParameter( trackerCalibration, patient = null, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `tracker_calibration_parameters`,
            'POST',
            null,
            {
                ...trackerCalibration,
                patient_id: patient ? patient.id : null,
            },
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.trackerCalibrationParameter.create")) )
        .then( (response) => {
            // console.log("createTrackerCalibrationParameter response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("createTrackerCalibrationParameter error: ", error);
            dispatch(showErrorModal( I18n.t("error.trackerCalibrationParameter.create"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Do all the operations to start an automatic calibration
 * @param {any} selectedCard video card used for the calibration
 */
export function startAutomaticCalibration( selectedCard, callback = null) {
    return function( dispatch, getState) {
        const patient = getState().authenticationReducer.currentPatient;
        if( !patient ){ 
            dispatch(showErrorModal(null, I18n.t("error.patient.missing")));
            if( callback){callback(null);}
            return null;
        }

        // Close existing sessions
        dispatch( resetPreviousSession(getState().webSocketReducer.session) );

        let tree = {
            name: "calibration",
            patient_id: patient.id,
            pages: [
                {
                    id: ObjectID.generate(),
                    level: 0,
                    cards: [{
                        id: selectedCard.id,
                        scale: 1,
                    }]
                }
            ]
        }

        // Create a preview session to show the video
        dispatch(startPreviewSession( "communication_sessions", tree, ( createdLoadTreeEvent ) => {
            // console.log("startPreviewSession response", createdLoadTreeEvent)
            if( createdLoadTreeEvent ){
                // Wait some time to allow the desktop to download the page
                setTimeout( () => {
                    const s = getState().webSocketReducer.session
                    const session = s.current;
                    const currentPage = s.treeList[s.treeStack[0].id].pages[0]
                    
                    // Start the video for the training
                    dispatch( createEvent( "play_video_events", session, currentPage, {card_id: selectedCard.id}, ( createdEvent) => {
                        if( callback){callback(createdEvent);}
                    }) );
                }, 1000);
            }
            else {
                if( callback){callback(null);}
            }

        }));
    }
}

/**
 * Do all the operations to interrupt an automatic calibration
 * Send an event to stop the video
 * @param {any} selectedCard video card used for the calibration
 */
export function interruptAutomaticCalibration( callback = null ) {
    return function( dispatch, getState) {
        const patient = getState().authenticationReducer.currentPatient;
        if( !patient ){ 
            dispatch(showErrorModal(null, I18n.t("error.patient.missing")));
            if( callback){callback(null);}
            return null;
        }

        const s = getState().webSocketReducer.session
        const session = s.current;
        const currentPage = s.displayPage
        
        // Stop the video for the training
        dispatch( createEvent( "end_video_events", session, currentPage, {card_id: currentPage.cards[0].id}, ( createdEvent) => {
            if( callback){callback(createdEvent);}
        }) );

    }
}
