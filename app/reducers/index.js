import webSocketReducer from './WebSocketReducer';
import authenticationReducer from './AuthenticationReducer';
import clipboardReducer from './ClipboardReducer';
import gameReducer from './GameReducer';
import liveViewReducer from './LiveViewReducer';
import modalReducer from './ModalReducer';
import settingReducer from './SettingReducer';

import storage from 'redux-persist/lib/storage';// for React Native return the AsyncStorage
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';// Allow to safely add new variables with new versions of the app
import { persistReducer } from 'redux-persist';// Allow to persist only a part of the store

/** Select the valus to persist insideauthenticationReducer */
const authenticationPersistConfig = {
    key: "authentication",// the key for the persist
    storage: storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ["signinCredentials", "loggedIn", "serverUrl", "currentUser", "currentPatient"],
};

const settingsPersistConfig = {
    key: "setting",
    storage: storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ["transparencyLevel"],
}

export default {
    liveViewReducer,
    authenticationReducer: persistReducer(authenticationPersistConfig, authenticationReducer),
    gameReducer,
    clipboardReducer,
    webSocketReducer,
    modalReducer,
    settingReducer: persistReducer(settingsPersistConfig, settingReducer),
};