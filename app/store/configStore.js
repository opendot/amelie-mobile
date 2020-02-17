import {
    applyMiddleware,
    createStore,
    combineReducers,
    compose,
} from 'redux';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers/index';
import thunkMiddleware from 'redux-thunk';

import { persistStore } from 'redux-persist';

let middleware = [thunkMiddleware];

if (__DEV__) {
    middleware = [
        ...middleware,
        createLogger({predicate: (getState, action) => action.type !== "UPDATEGAZE"}),
    ];
}


const createStoreWithMiddleware = compose(
    applyMiddleware(...middleware),
)(createStore);

const reducer = combineReducers(rootReducer);
const store = createStoreWithMiddleware(reducer);

export const persistor = persistStore(store);

export default store;