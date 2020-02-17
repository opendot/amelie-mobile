import { GAME } from '../actions/ActionTypes';

/**
 * Actions used to handle the games
 */

const INITIAL_STATE = {
    game: null,   // Temporary place where to save an object after a Copy command
};

export default function(state = INITIAL_STATE, action) {

    switch (action.type) {
        case GAME.START:
            return {
                ...state,
                game: action.payload,  //  The game object with name and level
            };

        case GAME.STOP:
            return {
                ...state,
                game: null,
            };

        default:
            return state;
    }
}