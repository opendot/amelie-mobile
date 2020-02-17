import { CLIPBOARD } from '../actions/ActionTypes';

/**
 * Actions used to copy/paste pages and cards
 */

const INITIAL_STATE = {
    copy: null,   // Temporary place where to save an object after a Copy command
};

export default function(state = INITIAL_STATE, action) {

    switch (action.type) {
        case CLIPBOARD.COPY:
            return {
                ...state,
                copy: {
                    source: action.payload.source,  //  The type of object hold inside data
                    data: action.payload.data,      //  The object to copy
                }
            };

        default:
            return state;
    }
}