/**
 * Contains all function, server request and redux actions related to Games
 */
import { GAME } from '../actions/ActionTypes';
import { sendTrackerParams } from "./SessionActions";

import { fetchFromServer, checkResponseError } from "../utils/utils";
import { showErrorModal } from "./ModalAction";

import I18n from "../i18n/i18n";

/**
 * Start a game
 * @param {any} game to start
 * @param {number} level selected, it can be null for some games
 * @param {function} callback 
 */
export function startGame( game, level = null, fixingTime = null, callback = null) {
    return function( dispatch, getState) {
        let game_event = {
            name: game.name,
            level: level,
            fixingtime: fixingTime
        };
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `games`,
            'POST',
            null,
            game_event,
            getState().authenticationReducer.signinCredentials,
            10000
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.game.start")) )
        .then( (response) => {
            // Save locally that the game started
            dispatch(startedGame(game, level, fixingTime));
            // Send tracker parameters to eyetracker
            dispatch(sendTrackerParams(getState().settingReducer.trackerCalibration));
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`startGame error: `, error);
            dispatch(showErrorModal( I18n.t("error.game.start"), error.message || JSON.stringify(error)));
            if( callback ){ callback(null);}
        });
    }
}

/**
 * Stop the current game
 * @param {any} game to stop
 * @param {function} callback 
 */
export function stopGame( game, callback = null) {
    return function( dispatch, getState) {
        let game_event = {
            name: game.name,
        };
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `games/${game.name}`,
            'DELETE',
            null,
            game_event,
            getState().authenticationReducer.signinCredentials,
            10000
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.game.stop")) )
        .then( (response) => {
            // Save locally that the game stopped
            dispatch(stoppedGame());
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`stopGame error: `, error);
            dispatch(showErrorModal( I18n.t("error.game.stop"), error.message || JSON.stringify(error)));
            if( callback ){ callback(null);}
        });
    }
}

/** Store the currently started game */
export function startedGame(game, level = null, fixingTime = null){
    return {
        type: GAME.START,
        payload: {
            name: game.name,
            level: level,
            fixingTime: fixingTime
        }
    };
}

/** Store the currently started game */
export function stoppedGame(){
    return {
        type: GAME.STOP,
    };
}