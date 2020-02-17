import { AUTH } from '../actions/ActionTypes';

const INITIAL_STATE = {
    loggedIn: false,
    currentUser:{
        email: "",
        type: "",
    },
    signinCredentials: null,    // The authentication token of the current user
    currentPatient: null,   // The current patient the currentUser is working with
    serverUrl: null,    // The url of the local server, defined by the user
    isSynchronizing: false, // { upCompleted: boolean, downCompleted: boolean} Flag used to notify if I'm synchronizing the offline server with the online server
    onSynchronizationComplete: null,    // Callback called when the synchronization is complete
};

export default function(state = INITIAL_STATE, action) {

    switch (action.type) {
        case AUTH.SIGNIN:
            return {
                ...state,
                loggedIn: true,
                currentUser: action.payload,
                currentPatient: action.keepPatient ? state.currentPatient : null,
            };

        case AUTH.SIGNOUT:
            return {
                ...state,
                loggedIn: false,
                currentUser: null,
                currentPatient: null,
                signinCredentials: null,
            };

        case AUTH.SIGNINCREDENTIALS:
            return {
                ...state,
                signinCredentials: action.payload,
            };

        case AUTH.SETCURRENTPATIENT:
            return {
                ...state,
                currentPatient: action.payload,
            };

        case AUTH.SERVERURL:
            return {
                ...state,
                serverUrl: action.payload,
            };
        
        case AUTH.SETISSYNCHRONIZING:
            return {
                ...state,
                isSynchronizing: action.payload,
                onSynchronizationComplete: action.payload === null ? null : state.onSynchronizationComplete,
            };

        case AUTH.SETONSYNCCOMPLETE:
            return {
                ...state,
                onSynchronizationComplete: action.payload,
            };

        default:
            return state;
    }
}