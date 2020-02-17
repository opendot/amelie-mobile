import {
    MODAL
} from '../actions/ActionTypes';

const initialState = {
    showErrorModal: false,
    errorTitle: null,
    errorText: null,
    showLoginModal: false,
    showLoadingModal: false,
    loadingTitle: null,
    LoadingText: null,
    onLoginDone: null,
    showForceSyncModal: false,
    forceSyncTitle: null,
    forceSyncText: null,
    onSyncPress: null,
};

export default function (state = initialState, action = {}) {
    switch (action.type) {

        case MODAL.OPENERROR:
        return {
            ...state,
            showErrorModal: true,
            errorTitle: action.payload.errorTitle,
            errorText: action.payload.errorText,
        };

        case MODAL.CLOSEERROR:
        return {
            ...state,
            showErrorModal: false,
        };

        case MODAL.RESETERROR:
        return {
            ...state,
            showErrorModal: false,
            errorTitle: null,
            errorText: null,
        };

        case MODAL.OPENLOGIN:
        return {
            ...state,
            showLoginModal: true,
            onLoginDone: action.onLoginDone
        }

        case MODAL.CLOSELOGIN:
        return {
            ...state,
            showLoginModal: false,
        }

        case MODAL.OPENLOADING:
        return {
            ...state,
            showLoadingModal: true,
            loadingTitle: action.modalTitle,
            loadingText: action.modalText
        }

        case MODAL.CLOSELOADING:
        return {
            ...state,
            showLoadingModal: false
        }

        case MODAL.OPENFORCESYNC:
        return {
            ...state,
            showForceSyncModal: true,
            forceSyncTitle: action.payload.forceSyncTitle,
            forceSyncText: action.payload.forceSyncText,
            onSyncPress: action.payload.onSyncPress,
        }

        case MODAL.CLOSEFORCESYNC:
        return {
            ...state,
            showForceSyncModal: false,
            onSyncPress: null,
        }

        default:
        return state;
    }
}