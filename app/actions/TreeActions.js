/**
 * Contains all function, server request and redux actions related to trees
 */

import moment from "moment";
import { fetchFromServer, checkResponseError } from "../utils/utils";
import { showErrorModal } from "./ModalAction";

import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)

import I18n from "../i18n/i18n";

export function createDefaultName( currentUser, currentPatient ){
    if( !currentPatient ){
        return I18n.t("error.patient.missing");
    }
    const now = new Date();
    return `${currentPatient.name}_${moment(now).format('DD-MM-YYYY_kk:mm')}`;
}

/**
 * Get a tree from the server
 * @param {string} treeId the id of an existing tree on the server
 * @param {function} [callback = null] called after the response from the server, it receive the retrieved tree
 *  as a parameter, or null if something went wrong
 */
export function getTree( treeId, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_trees/${treeId}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.get")) )
        .then( (response) => {
            // console.log("getTree response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getTree error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.get"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Add a new tree to the server
 * @param {any} tree the created tree that we send to the server
 * @param {function} [callback = null] called after the response from the server, it receive the created tree
 *  as a parameter, or null if the creation failed
 */
export function createTree( tree, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_trees`,
            'POST',
            null,
            tree,
            getState().authenticationReducer.signinCredentials,
            60000,
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.create")) )
        .then( (response) => {
            // console.log("createTree response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("createTree error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.create"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Update an existing tree in the server
 * @param {any} tree the edited tree that we send to the server
 * @param {!number} tree.id used to match the tree on the server
 * @param {function} [callback = null] called after the response from the server, it receive the created tree
 *  as a parameter, or null if the creation failed
 */
export function updateTree( tree, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_trees/${tree.id}`,
            'PUT',
            null,
            tree,
            getState().authenticationReducer.signinCredentials,
            60000
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.edit")) )
        .then( (response) => {
            // console.log("updateTree response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("updateTree error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.edit"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Delete an existing tree in the server
 * @param {any} tree the tree that we want to delete
 * @param {!number} tree.id used to match the tree on the server
 * @param {function} [callback = null] called after the response from the server, an object containing
 * the result of the operation {success: true} as a parameter, or null if the delete failed
 */
export function deleteTree( tree, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_trees/${tree.id}`,
            'DELETE',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.delete")) )
        .then( (response) => {
            // console.log("deleteTree response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("deleteTree error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.delete"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Delete all existing preview tree in the server
 * @param {function} [callback = null] called after the response from the server, an object containing
 * the result of the operation {success: true} as a parameter, or null if the delete failed
 */
export function deleteAllPreviewTrees( patient = null, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `preview_trees/any?all=true${patient ? `&patient_id=${patient.id}` : ""}`,
            'DELETE',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.delete")) )
        .then( (response) => {
            // console.log("deleteAllPreviewTrees response", response, callback);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("deleteAllPreviewTrees error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.delete"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Get the list of all trees marked as favourites
 * @param {any} [patient = null]
 * @param {string} [searchText = null] text used to get only a subset of trees
 * @param {function} [callback = null] called after the response from the server, it receive the list
 *  of trees as a parameter, or null if the request failed
 */
export function getFavouriteTrees( patient = null, searchText = null, callback = null ){
    return function( dispatch, getState) {
        return fetchFromServer(
            getState().authenticationReducer.serverUrl,
            `custom_trees?only_favourites=true${patient ? `&patient_id=${patient.id}` : ""}`,
            'GET',
            null,
            null,
            getState().authenticationReducer.signinCredentials
        )
        .then( checkResponseError(dispatch, getState, I18n.t("error.tree.index")) )
        .then( (response) => {
            // console.log("getFavouriteTrees search:"+searchText+" response", response);
            if( callback ){
                callback( response ? response.data : null);
            }
        })
        .catch(error => {
            console.log("getFavouriteTrees search:"+searchText+" error: ", error);
            dispatch(showErrorModal( I18n.t("error.tree.index"), error.message || JSON.stringify(error)));
            if( callback ){ callback( null); }
        });
    }
}

/**
 * Change all the ids of pages and card of an array, preserving the links
 * between pages
 * @param {array} pages 
 */
export function changeAllIds( pages ){
    if( !pages ){return pages}
    let tempPages = JSON.parse(JSON.stringify(pages));

    // Save a reference of all the cards into an array
    let tempCards = [];
    tempPages.forEach( (p, index) => {
        p.cards.forEach( c => {
            tempCards.push(c);
        })
    });

    // Change the ids of the pages while updating the links
    tempPages.forEach( (p, index) => {
        let oldId = p.id;
        let newId = ObjectID.generate();
        
        p.id = newId;

        // Update cards
        tempCards.forEach( ( card, index) => {
            if( card.next_page_id == oldId){
                card.next_page_id = newId;
            }
        })
    });

    /* Don't change the cards ids, to save a page the card must be 
    already on the server */

    return tempPages;
}

/** Given a set of pages and a card, get the page that the card link */
export function getLinkedPageFromCard( pages = null, card = null){
    if( !pages || pages.length <= 0){
        // No pages
        return null;
    }
    if( !card || card.next_page_id == null || card.next_page_id == undefined ){
        // No given card or card without a link
        return null;
    }
    let filter = pages.filter((page, index) => {
        return page.id == card.next_page_id;
    })
    // There should be only one result
    if( filter.length > 0){
        return filter[0];
    }
    else {
        return null;
    }
}

/** 
 * Given a set of pages and a page, get the page with the card that links
 * to the given page
 * @return {any} an object holding the page and the card, or null if none was found
*/
export function getLinkedPageFromPage( pages = null, page = null){
    if( !pages || pages.length <= 0){
        // No pages
        return null;
    }
    if( !page || page.level <= 0 ){
        // No given page or page is rott of the tree
        return null;
    }
    let cardIndex = -1;
    let filter = pages.filter((p, index) => {
        return p.cards.filter((card, i) => {
            if(card.next_page_id && card.next_page_id == page.id){
                cardIndex = i;
                return true;
            }
            else {
                return false;
            }
        }).length > 0;
    })

    // There should be only one result
    if( filter.length > 0){
        return { page: filter[0], card: filter[0].cards[cardIndex]};
    }
    else {
        return null;
    }
}

/**
 * Check if I can create a link between the originCard and the destPage
 * @param {*} pages 
 * @param {*} originCard 
 * @param {*} destPage 
 */
export function canCreateLink( pages = null, originPage = null, originCard = null, destPage = null){
    if( !pages || pages.length <= 0 || !originPage || !originCard || ! destPage){
        // Missing values
        console.log("canCreateLink error: missing values");
        return false;
    }

    if( destPage.level <= 0){
        console.log("canCreateLink error: link to root");
        return false;
    }

    if( checkLinkLoop(pages, originPage, originCard, destPage)){
        console.log("canCreateLink error: LOOP");
        return false;
    }

    let linkedPage = getLinkedPageFromPage(pages, destPage);
    if( linkedPage){
        console.log("canCreateLink error: destPage is already linked", linkedPage);
        return false;
    }

    // Check if card has a valid level
    // if( originPage.level >= destPage.level){
    //     console.log("canCreateLink error: destPage must have an higher level "+`${originPage.level} >= ${destPage.level}`, originCardPage);
    //     return false;
    // }

    return true;
}

function checkLinkLoop( pages, originPage, originCard, destPage){
    let pagesObj = {};
    pages.forEach( (page, index) => {
        pagesObj[page.id] = page;
    })
    
    // Recursive function to check for loops
    let checkCards = (page) => {
        if( !page){ return false;}
        for( let i = 0; i < page.cards.length; i++){
            let c = page.cards[i];
            if( c.next_page_id == originPage.id){
                // Loop in this page
                return true;
            }
            else if( checkCards( pagesObj[c.next_page_id])){
                // Loop in a children
                return true;
            }
        }
        return false;
    }

    // Check if there is a linked loop
    return checkCards(destPage);
}

/**
 * Create a link between a card and a page
 * Update all the levels of the pages
 * @param {*} tree 
 * @param {*} originCard 
 * @param {*} destPage 
 */
export function createLink( tree, originPage, originCard, destPage){
    if( !tree || !tree.pages || tree.pages.length <= 0 || !originPage || !originCard || ! destPage){
        // Missing values
        console.log("createLink error: missing values");
        return null;
    }

    let tempTree = JSON.parse(JSON.stringify(tree));

    // For simplicity create a key-value map of the pages
    let pagesObj = {};
    tempTree.pages.forEach( (page, index) => {
        pagesObj[page.id] = page;
    })
    
    // Get the origin of the link, both page and card
    let originCardIndex = -1;
    let originCardPage = pagesObj[originPage.id];
    originCardPage.cards.forEach((c, index) => {
        if( c.id == originCard.id && c.x_pos == originCard.x_pos && c.y_pos == originCard.y_pos && c.scale == originCard.scale ){
            originCardIndex = index;
        }
    });

    // console.log("createLink "+originCardIndex, originCardPage);

    // Create the link
    pagesObj[originCardPage.id].cards[originCardIndex].next_page_id = destPage.id;

    // Change the level of the linked pages and the children
    let levelDifference = destPage.level - originCardPage.level;

    if( levelDifference != 1){
        increseLevel( originCardPage.cards[originCardIndex], pagesObj, 1 -levelDifference);
    }

    // console.log("Created link", tempTree, pagesObj);
    return tempTree;
}

/** 
 * Increase the level of the page linked by the card, also
 * increase the level of the children pages
 * @param pagesObj object containing all the pages, it's a key-value map
 *  that use the page id as key
 */
function increseLevel( card, pagesObj, increment){
    let nextPage = pagesObj[card.next_page_id];

    if( nextPage) {
        nextPage.level += increment;
        nextPage.cards.forEach( (card, index) => {
            increseLevel( card, pagesObj, increment);
        });
    }
}

/**
 * Check if the given array of pages has more than one root page, that is 
 * a page without a parent.
 * A valid tree should only have one root page at level 0
 * @param {any} pages 
 */
export function checkIfTreeHasMoreRoots( pages, dispatch = null ) {
    // Count the number of pages without a parent
    let orphanPages = pages.filter((page, index, array) => {
        return getLinkedPageFromPage(array, page) == null;
    });
    // console.log("checkIfTreeHasMoreRoots orphanPages", orphanPages);
    
    if( orphanPages.length > 1){
        // More pages without a parent
        if( dispatch ){ dispatch(showErrorModal( null, I18n.t("error.tree.unreachablePages")));}
        return true;
    }
    else if( orphanPages.length == 1 ) {
        // Root page should have level 0
        return orphanPages[0].level != 0;
    }
    else {
        // This should never happen, all the pages have a parent
        console.log("checkIfTreeHasMoreParents Error: all the pages have a parent", pages);
        return true;
    }
}