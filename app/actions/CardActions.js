/**
 * Contains all function, server request and redux actions related to cards
 */

import { Platform } from "react-native";
import RNFetchBlob from "rn-fetch-blob";

import { MOBILE_APP_VERSION, fetchFromServer, checkResponseError } from "../utils/utils";
import { showErrorModal } from "./ModalAction";

import { changeAllIds } from "./TreeActions";

import I18n from "../i18n/i18n";

/**
 * Get a list of cards from the server, you can also search based on the label field
 * @param {any} [patient = null]
 * @param {string} [searchText = null] text used to get only a subset of cards
 * @param {number} [page = 1]
 * @param {function} [callback = null] called after the response from the server, it receive the created card
 *  as a parameter, or null if the creation failed
 */
export function getAllCards( patient = null, searchText = null, page = 1, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `cards?page=${page}${patient ? `&patient_query=${patient.id}` : ""}`+
            `${ searchText ? `&tag_query=${searchText}` : ""}` + 
            "&default_level=" + getState().settingReducer.transparencyLevel,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.index")) )
        .then( (response) => {
            // console.log("getAllCards search:"+searchText+" response", response);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getAllCards search:"+searchText+" error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.index"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Add a new card to the server
 * @param {any} card the created card that we send to the server
 * @param {function} [callback = null] called after the response from the server, it receive the created card
 *  as a parameter, or null if the creation failed
 */
export function createCustomCard( card, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_cards`,
            'POST',
            null,
            card,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.create")) )
        .then( (response) => {
            // console.log("createCustomCard response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("createCustomCard error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.create"), error.message || JSON.stringify(error)));
        });
    }
}

export function createCustomCardFormData( card, callback = null ){
    return function( dispatch, getState) {

        const content = JSON.parse(JSON.stringify(card.content));
        card.content.content = undefined;
        card.content.mime = undefined;

        // Now content.content contains the path to the file to upload
        let contentPath = null;
        if( content.content ) {
            contentPath = Platform.OS == "ios" ? content.content.replace('file://', '') : content.content;
        }

        let body = [
            // elements without property `filename` will be sent as plain text
            {name: "card", data: JSON.stringify(card)},
        ];
        if( contentPath ){
            // part file from storage
            body.push( {name : "content_file", filename : `${card.id}.jpg`, type: content.mime, data: RNFetchBlob.wrap(contentPath)});
        }

        return RNFetchBlob.fetch(
            'POST',
            `${getState().authenticationReducer.serverUrl}/custom_cards_form_data`,
            Object.assign({},
                {
                    'Accept': 'application/airett.v1',
                    'Content-Type': 'multipart/form-data',
                    'pragma': 'no-cache',
                    'cache-control': 'no-store',
                    'app-version': `${MOBILE_APP_VERSION}`,
                },
                getState().authenticationReducer.signinCredentials,
            ),
            body)
            .then( (response) => {
                if( response.respInfo && response.respInfo.status && response.respInfo.status < 300){
                    // Valid response, forward it
                    return response;
                }
                else {
                    // console.log("createCustomCardFormData error", response.data);
                    let error = response.data ? JSON.parse(response.data) : JSON.parse(response);
                    //  Error, show a modal and return null
                    dispatch(showErrorModal( I18n.t("error.card.create"), 
                        error.exception ? error.exception : JSON.stringify(error)
                    ));
                    return null;
                }
            })
            .then( (response) => {
                // console.log("createCustomCardFormData response", response, callback);
                if( callback ){
                    callback( response ? JSON.parse(response.data) : null);
                }
            })
            .catch(error => {
                console.log("createCustomCardFormData error: ", error);
                dispatch(showErrorModal( I18n.t("error.card.create"), error.message || JSON.stringify(error)));
            });
    }
}

/**
 * Update an existing card in the server
 * @param {any} card the edited card that we send to the server
 * @param {!number} card.id used to match the card on the server
 * @param {function} [callback = null] called after the response from the server, it receive the created card
 *  as a parameter, or null if the creation failed
 */
export function updateCardFormData( card, forceArchived = false, callback = null ){
    return function( dispatch, getState) {

        const content = JSON.parse(JSON.stringify(card.content));
        if( card.content ) {
            card.content.content = undefined;
            card.content.mime = undefined;
        }

        // Now content.content contains the path to the file to upload
        let contentPath = null;
        if( content && content.content ) {
            contentPath = Platform.OS == "ios" ? content.content.replace('file://', '') : content.content;
        }

        let body = [
            // elements without property `filename` will be sent as plain text
            {name: "card", data: JSON.stringify(card)},
        ];
        if( contentPath ){
            // part file from storage
            body.push( {name : "content_file", filename : `${card.id}.jpg`, type: content.mime, data: RNFetchBlob.wrap(contentPath)});
        }

        return RNFetchBlob.fetch(
            'PUT',
            `${getState().authenticationReducer.serverUrl}/custom_cards_form_data/${card.id}?force_archived=${forceArchived}`,
            Object.assign({},
                {
                    'Accept': 'application/airett.v1',
                    'Content-Type': 'multipart/form-data',
                    'pragma': 'no-cache',
                    'cache-control': 'no-store',
                    'app-version': `${MOBILE_APP_VERSION}`,
                },
                getState().authenticationReducer.signinCredentials,
            ),
            body)
            .then( (response) => {
                if( response.respInfo && response.respInfo.status && response.respInfo.status < 300){
                    // Valid response, forward it
                    return response;
                }
                else {
                    // console.log("updateCardFormData error", response.data);
                    let error = response.data ? JSON.parse(response.data) : JSON.parse(response);
                    //  Error, show a modal and return null
                    dispatch(showErrorModal( I18n.t("error.card.create"), 
                        error.exception ? error.exception : JSON.stringify(error)
                    ));
                    return null;
                }
            })
            .then( (response) => {
                // console.log("updateCardFormData response", response, callback);
                if( callback ){
                    callback( response ? JSON.parse(response.data) : null);
                }
            })
            .catch(error => {
                console.log("updateCardFormData error: ", error);
                dispatch(showErrorModal( I18n.t("error.card.edit"), error.message || JSON.stringify(error)));
            });
    }
}

export function updateCard( card, forceArchived = false, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_cards/${card.id}?force_archived=${forceArchived}`,
            'PUT',
            null,
            card,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.edit")) )
        .then( (response) => {
            // console.log("updateCard response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("updateCard error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.edit"), error.message || JSON.stringify(error)));
        });
    }
}

/** Clone the given card */
export function cloneCard( card, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_cards/${card.id}?force_archived=true`,
            'PUT',
            null,
            {patient_id: getState().authenticationReducer.currentPatient.id || card.patient_id},
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.edit")) )
        .then( (response) => {
            // console.log("cloneCard response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("cloneCard error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.edit"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Delete an existing card in the server
 * @param {any} card the card that we want to delete
 * @param {!number} card.id used to match the card on the server
 * @param {function} [callback = null] called after the response from the server, an object containing
 * the result of the operation {success: true} as a parameter, or null if the delete failed
 */
export function deleteCard( card, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_cards/${card.id}`,
            'DELETE',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.delete")) )
        .then( (response) => {
            // console.log("deleteCard response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("deleteCard error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.delete"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Get the list of card tags, you can also search based on the label field
 * @param {string} [searchText = null] text used to get only tags with that search text
 * @param {number} [page = 1]
 * @param {function} [callback = null] called after the response from the server, it receive the created card
 *  as a parameter, or null if the creation failed
 */
export function getAllCardTags( searchText = null, page = 1, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `card_tags?page=${page}`+
            `${ searchText ? `&query=${searchText}` : ""}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.cardTag.index")) )
        .then( (response) => {
            // console.log("getAllCardTags search:"+searchText+" response", response);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getAllCardTags search:"+searchText+" error: ", error);
            dispatch(showErrorModal( I18n.t("error.cardTag.index"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Get a list of images, videos and other files in the shared folder of the computer
 * @param {string} [searchText = null] text used to get only a subset of cards
 * @param {number} [page = null]
 * @param {function} [callback = null] called after the response from the server, it receive the created card
 *  as a parameter, or null if the creation failed
 */
export function getPcPersonalFiles( searchText = null, page = null, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `personal_files${page != null? `?page=${page}` : ""}`+
            `${ searchText ? `&tag_query=${searchText}` : ""}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.indexFiles")) )
        .then( (response) => {
            // console.log("getPcPersonalFiles search:"+searchText+" response", response);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getPcPersonalFiles search:"+searchText+" error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.indexFiles"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Get an image from the pc
 * @param {string} fileId the id of an existing file on the pc
 * @param {function} [callback = null] called after the response from the server, it receive the retrieved image
 *  as a parameter, or null if something went wrong
 */
export function getPcPersonalFile( fileId, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `personal_files/${fileId}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.card.getFile")) )
        .then( (response) => {
            // console.log("getPcPersonalFile response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getPcPersonalFile error: ", error);
            dispatch(showErrorModal( I18n.t("error.card.getFile"), error.message || JSON.stringify(error)));
        });
    }
}

/**
 * Link a list of pages to a tree
 * @param {any} originPage the page holding the original card
 * @param {any} originCard the card that will link to the origin page of newTree
 * @param {any} originalTree tree containing the card, the newPages will be added to this tree
 * @param {[Page]} newPages array to add to the card
 */
export function linkCardToTree( originPage, originCard, originalTree, newPages){
    if( !newPages || newPages.length <= 0){ return originalTree;}
    let tempPages = changeAllIds(newPages);
    
    // Find the card in the tree
    let card = null;
    let cardLevel = -1;
    for( let i = 0; i < originalTree.pages.length && card == null; i++){
        let p = originalTree.pages[i];
        if( p.id == originPage.id) {
            for( let j = 0; j < p.cards.length; j++){
                if( p.cards[j].id == originCard.id && p.cards[j].x_pos == originCard.x_pos && p.cards[j].y_pos == originCard.y_pos && p.cards[j].scale == originCard.scale ){
                    card = p.cards[j];
                    cardLevel = p.level
                    break;
                }
            }
        }
    }

    if( card == null){ return originalTree;}

    // Link the card to the origin page
    let destPage = tempPages[0];
    tempPages.forEach( (page, index) => {
        if( page.level < destPage.level){ destPage = page;}
    });
    card.next_page_id = destPage.id;
    
    // Change all the levels
    let increment = cardLevel+1;
    tempPages.forEach((page, index) => {
        page.level += increment;
    });

    // Add the new pages
    Array.prototype.push.apply(originalTree.pages, tempPages);

    return originalTree;
}

/** @returns IMAGE_TYPES.includes(contentType) */
export function isCardImage( contentType ) {
    const IMAGE_TYPES = ["PersonalImage", "GenericImage", "DrawingImage", "IconImage", "Text"];
    return IMAGE_TYPES.includes(contentType);
}