import { CLIPBOARD } from "./ActionTypes";

/** 
 * Save an object in the clipboard
 * @param {string} source the type of object saved, it should be CLIPBOARD.TREE,
 *  CLIPBOARD.PAGE or CLIPBOARD.CARD
 * @param {any} data the object that needs to be copied, the object is duplicated
 *  by using JSON.parse(JSON.stringify(data))
 */
export function copy( source, data = null ){
    return {
        type: CLIPBOARD.COPY,
        payload: {
            source: source,
            data: JSON.parse(JSON.stringify(data)),
        },
    }
}

/** Copy a tree object into the clipboard */
export function copyTree( tree = null ){
    // Check if it's really a tree
    if( tree ){
        return copy( CLIPBOARD.TREE, tree);
    }
    else {
        console.log("Error on copy tree", tree);
        return {type: ""};
    }
}

/** Copy a page object into the clipboard */
export function copyPage( page = null ){
    // Check if it's really a page
    if( page && page.hasOwnProperty("id")
        && page.hasOwnProperty("cards") ){
        return copy( CLIPBOARD.PAGE, page);
    }
    else {
        console.log("Error on copy page", page);
        return {type: ""};
    }
}

/** Copy a card object into the clipboard */
export function copyCard( card = null ){
    // Check if it's really a card
    if( card && card.hasOwnProperty("id")
        && card.hasOwnProperty("label") && card.hasOwnProperty("card_tags")
        && card.hasOwnProperty("content") ){
        return copy( CLIPBOARD.CARD, card);
    }
    else {
        console.log("Error on copy card", card);
        return {type: ""};
    }
}