import {
    LIVEWIEW
} from '../actions/ActionTypes';

const initialState = {
    open:false
};

export default function (state = initialState, action = {}) {
    switch (action.type) {
        case LIVEWIEW.OPEN:
            return {
                ...state,
                open: true
            };

        case LIVEWIEW.CLOSE:
            return {
                ...state,
                open: false
            };

        default:
            return state;
    }
}