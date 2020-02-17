import { MODAL } from '../actions/ActionTypes';

/**
 * Show the error modal with the given message
 * @param {string} title 
 * @param {string} text 
 */
export function showErrorModal( title = null, text = null){
    return {
        type: MODAL.OPENERROR,
        payload: {
            errorTitle: title,
            errorText: text,
        },
    };
}

/** Hide the modal, don't reset the given values */
export function closeErrorModal(){
    return {
        type: MODAL.CLOSEERROR,
    };
}

/** Hide the modal and reset it's values */
export function resetErrorModal(){
    return {
        type: MODAL.RESETERROR,
    };
}

export function openLoginModal(onLoginDone = null) {
    return {
        type: MODAL.OPENLOGIN,
        onLoginDone
    }
}

export function closeLoginModal() {
    return {
        type: MODAL.CLOSELOGIN,
    }
}

export function openLoadingModal(modalTitle, modalText) {
    return {
        type: MODAL.OPENLOADING,
        modalTitle, modalText
    }
}

export function closeLoadingModal() {
    return {
        type: MODAL.CLOSELOADING
    }
}

export function openForceSyncModal(forceSyncTitle = null, forceSyncText = null, onSyncPress = null) {
    return {
        type: MODAL.OPENFORCESYNC,
        payload: {forceSyncTitle, forceSyncText, onSyncPress},
    }
}

export function closeForceSyncModal() {
    return {
        type: MODAL.CLOSEFORCESYNC,
    }
}