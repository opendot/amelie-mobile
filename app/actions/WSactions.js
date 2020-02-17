import { WS } from './ActionTypes';

import WSService from "../components/wsService";

export function sendQueryText( text ) {
    return (dispatch, getState) => {
        getState().webSocketReducer.socketServer.send({type:"querylist",data:text});
    };
}

export function send( msg ) {
    return (dispatch, getState) => {
        // console.log("WSActions sending", msg);
        getState().webSocketReducer.socketServer.send(msg);
    };
}


//ACTIONS TO REDUCERS

/**
 * Set the socket used to contact the server
 * @param {WSService} newSocket 
 */
export function setSocketServer(newSocket) {
    return {
        type: WS.SETSOCKETSERVER,
        payload: newSocket,
    };
}

/**
 * Set the socket used to receive data from the EyeTracker
 * @param {WSService} newSocket 
 */
export function setSocketEyeTracker(newSocket) {
    return {
        type: WS.SETSOCKETEYETRACKER,
        payload: newSocket,
    };
}

export function setCards(payload) {
    return {
        type: WS.SETCARDS,
        payload,
    };
}

/** Create a new tree and clear existing pages and/or cards */
export function newTree() {
    return {
        type: WS.NEWTREE,
    };
}

export function setCardAt(payload) {
    return {
        type: WS.SETCARDAT,
        payload,
    };
}

export function newRoute(payload) {
    return {
        type: WS.NEWROUTE,
        payload,
    };
}

export function gazeOn() {
    return {
        type: WS.GAZEON
    };
}

export function gazeOff() {
    return {
        type: WS.GAZEOFF
    };
}

export function alignEyetracker( show ) {
    return {
        type: WS.ALIGNEYETRACKER,
        payload: show,
    };
}

export function updateCardList(payload) {
    return {
        type: WS.UPDATECARDLIST,
        payload,
    };
}

export function setTree(newTree) {
    return {
        type: WS.SETTREE,
        payload: { tree: newTree },
    };
}

export function newPage(payload) {
    return {
        type: WS.NEWPAGE,
        payload,
    };
}

export function addPageToCurrentTree() {
    return {
        type: WS.ADDPAGETOCURRENTTREE
    }
}

export function setPage(page) {
    return {
        type: WS.SETPAGE,
        page
    };
}

/** Set the given page at given index into webSocketReducer.tree
 * If index is not valid the page will be add at the end of the tree */
export function setPageAt( page, index = -1) {
    return {
        type: WS.SETPAGEAT,
        payload: {page, index},
    };
}

/** Set the current active TrainingSession, or null if no session is active */
export function setSession( newSession = null ) {
    return {
        type: WS.SETSESSION,
        payload: newSession,
    };
}

/** Set the current active TrainingSession and reset all sessions info */
export function newSession( newSession = null ) {
    return {
        type: WS.NEWSESSION,
        payload: newSession,
    };
}


export function setDisplayPage(payload) {
    return {
        type: WS.SETDISPLAYPAGE,
        payload,
    };
}

export function setDisplayPageWithoutLabel(payload) {
    payload.cards.map((card) => card.label = "")
    return {
        type: WS.SETDISPLAYPAGE,
        payload,
    };
}

/** Remove pages from the session history
 * @param {?number} [amount=1] number of pages to remove from history, default is 1
 */
export function goBackHistory(amount = 1) {
    return {
        type: WS.GOBACKHISTORY,
        payload: amount,
    };
}

/** Remove all pages from history */
export function clearHistory() {
    return {
        type: WS.CLEARHISTORY,
    };
}

/** Remove a tree from the session's tree stack
 * The tree stack is an array of tree, the tree on top of the stack is the currently displayed,
 * once it's completed the tree is removed from the stack and the tree below is shown
 * @param {any} tree tree to add on top of the stack
 * @param {?any} [currentPage=null] the current visible page of the current visible tree, the page
 *  that will be shown when the current visible tree will be visible again
 */
export function addTreeToStack( tree, prevTreeCurrentPage = null) {
    return {
        type: WS.ADDTREETOSTACK,
        payload: {
            tree: tree,
            prevTreeCurrentPage: prevTreeCurrentPage,
        },
    };
}

/** Remove a tree from the session's tree stack
 * The tree stack is an array of tree, the tree on top of the stack is the currently displayed,
 * once it's completed the tree is removed from the stack and the tree below is shown
 * @param {?number} [amount=1] number of pages to remove from history, default is 1
 */
export function removeTreeFromStack(amount = 1) {
    return {
        type: WS.REMOVETREEFROMSTACK,
        payload: amount,
    };
}

/**
 * Set if a card video is playing
 * @param {string|any} card the id of the card which video content is paying, or the card itself
 */
export function setCardVideoPlaying( card ) {
    return {
        type: WS.SETCARDVIDEOPLAYING,
        payload: card,
    };
}

/**
 * Set the flag used to create a Back Shuffle event
 * If true, it means that a Back event has been generated, when the 
 * page is changed generate a shuffle event
 */
export function setFlagBackShuffleEvent(flagBackShuffleEvent) {
    return {
        type: WS.SETFLAGBACKSHUFFLEEVENT,
        payload: flagBackShuffleEvent,
    };
}

export function changeIp(payload) {
    return {
        type: WS.CHANGEIP,
        payload,
    };
}

export function connected(payload) {
    return {
        type: WS.CONNECTED,
        payload,
    };
}

export function selectedCard(payload) {
    return {
        type: WS.SELECTEDCARD,
        payload,
    };
}

export function updateGaze(payload) {
    return {
        type: WS.UPDATEGAZE,
        payload,
    };
}

/** Create a new socket */
export function initSocketEyeTracker( onMessageListener, reconnectOnError = false, firstMessage = null) {
    return (dispatch, getState) => {
        // Connect to eyetracker
        const ip = getState().authenticationReducer.serverUrl.split("//")[1].split(":")[0];
        let socketEyeTracker = new WSService(`${ip}:4000`
            , firstMessage, onMessageListener, reconnectOnError);
        dispatch(setSocketEyeTracker(socketEyeTracker));
    }
}

/** Start the websocket, create a new one if needed */
export function connectSocketEyeTracker( onMessageListener, reconnectOnError = false, firstMessage = null) {
    return (dispatch, getState) => {
        if( getState().webSocketReducer.socketEyeTracker){
            // Restart socket, update the onMessageListener with this component
            getState().webSocketReducer.socketEyeTracker.createWebSocket( onMessageListener );
        }
        else {
            // Create the socket object
            dispatch(initSocketEyeTracker(onMessageListener, reconnectOnError, firstMessage));
        }
    }
}

export function handleSocketEyeTrackerAppState(currentAppState) {
    return (dispatch, getState) => {
        const {authenticationReducer, webSocketReducer} = getState();
        if (authenticationReducer.loggedIn === true) {
          // IN ANDROID: when in background, it goes -> background -> active
          // IN iOS it goes inactive -> background -> active
          if (currentAppState === "background")
          {
            // close socket
            if(webSocketReducer.socketEyeTracker) {
                webSocketReducer.socketEyeTracker.close();
                webSocketReducer.socketEyeTracker.logout();
            }
    
          }
          else if (currentAppState === "inactive") {
            // i should be here only when I get back from background
            
            // close socket
            if(webSocketReducer.socketEyeTracker) {
                webSocketReducer.socketEyeTracker.close();
                webSocketReducer.socketEyeTracker.logout();
            }
    
          }
          else if (currentAppState === "active") {
            // i should be here only when I get back from background
            // console.log("WSActions.handleSocketEyeTrackerAppState openWensocket props.currentServerSession",this.props.currentServerSession)
            if(webSocketReducer.socketEyeTracker) {
                webSocketReducer.socketEyeTracker.createWebSocket();
            }
          }
        }
    }
}

/* Page functions */

/**
 * Delete a page from webSocketReducer.tree
 * @param currentTree this.props.webSocketReducer.tree
 * @param page a page that exist inside currentTree
 */
export function deletePageFromTree( currentTree, page) {
    let tempTree = JSON.parse(JSON.stringify(currentTree));
    let index = currentTree.pages.indexOf(page);
    if (index !== -1) {
        tempTree.pages.splice( index, 1);
        // Delete links to the deleted page
        tempTree.pages.forEach( (p, index) => {
            if( p.cards ){
                p.cards = p.cards.map((card) => {
                    if( card.next_page_id == page.id){
                        card.next_page_id = null;
                        return card;
                    }
                    else {
                        return card;
                    }
                });
            }
        });
        return setTree( tempTree );
    }
    return null;
}

/* Card functions */

/** Edit the card at the given index in the index page
 * @returns a copy of the page with the applyed edits
 */
export function editCardFromPage( card, indexCard, page){
    let tempPage = JSON.parse(JSON.stringify(page));
    if( indexCard < 0 || indexCard >= page.cards.length){
        tempPage.cards[indexCard] = card;
    }
    return tempPage
}

/** Delete the card at the given index in the index page
 * @returns a copy of the page with the applyed edits
 */
export function deleteCardFromPage( card, indexCard, page){
    let tempPage = JSON.parse(JSON.stringify(page));
    tempPage.cards.splice( indexCard, 1);
    return tempPage
}