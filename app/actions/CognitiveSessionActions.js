/**
 * Contains all function, server request and redux actions related to Cognitive Session
 */

import { fetchFromServer, checkResponseError } from "../utils/utils";
import { showErrorModal } from "./ModalAction";

import I18n from "../i18n/i18n";

/**
 * get the result about a specified cognitive session
 */
export default function getCognitiveSessionResults(type, session, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `${type}/${session.id}/results`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then(checkResponseError(dispatch, getState, I18n.t("error.session.results")))
        .then((response) => {
            //console.log(`getCognitiveSessionresults ${type}/${session.id} response`, response, callback);
            if(callback){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log(`getCognitiveSessionResults ${session.id} error: `, error);
            dispatch(showErrorModal( I18n.t("error.session.results"), error.message || JSON.stringify(error)));
            if(callback){callback(null);}
        });
    }
}

