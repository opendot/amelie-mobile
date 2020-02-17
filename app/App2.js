import React, { Component } from 'react';
import { AppState, View } from 'react-native';
import { Provider } from 'react-redux';

import store, { persistor } from './store/configStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

import {
    StackNavigator,
} from 'react-navigation';

import Routes from "./routes/routes.js";
import {newRoute, clearHistory} from "./actions/WSactions";

import { StyleProvider, Root as NativeBaseRoot } from 'native-base';
import getTheme from '../native-base-theme/components';

import ErrorModal from "./utils/errorModal";
import LoginModal from "./utils/loginModal";
import SyncModal from "./utils/syncModal";
import ForceSyncModal from "./utils/forceSyncModal";
import KeepAwake from 'react-native-keep-awake';


import { Spinner } from 'native-base';
import theme, { baseStyles } from './themes/base-theme'
import NavigationService from "./components/navigationService";

const App = StackNavigator(Routes,{ headerMode: 'screen' });


export default class Root extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    handleAppStateChange = (currentAppState) => {
        const {authenticationReducer, webSocketReducer} = store.getState();
        if (authenticationReducer.loggedIn === true) {
          // IN ANDROID: when in background, it goes -> background -> active
          // IN iOS it goes inactive -> background -> active
          if (currentAppState === "background" /*&& this.props.webSocketSession.websocket.status !== "closed"*/)
          {
            // close socket
            if(webSocketReducer.socketServer) {
                webSocketReducer.socketServer.close();
                webSocketReducer.socketServer.logout();
            }

            if(webSocketReducer.session.current) {
                /* If a session is active, clear history.
                Since we cannot record the history while socket is closed, stop recording */
                store.dispatch(clearHistory());
            }
    
          }
          else if (currentAppState === "inactive" /*&& this.props.webSocketSession.websocket.status !== "closed"*/) {
            // i should be here only when I get back from background
            
            // close socket
            if(webSocketReducer.socketServer) {
                webSocketReducer.socketServer.close();
                webSocketReducer.socketServer.logout();
            }

            if(webSocketReducer.session.current) {
                /* If a session is active, clear history.
                Since we cannot record the history while socket is closed, stop recording */
                store.dispatch(clearHistory());
            }
    
          }
          else if (currentAppState === "active") {
            // i should be here only when I get back from background
            // console.log("App2.handleAppStateChange openWensocket props.currentServerSession",this.props.currentServerSession)
            if(webSocketReducer.socketServer) {
                webSocketReducer.socketServer.createWebSocket();
            }
          }
        }
      }

    _getCurrentRouteName(navState) {


        //console.log("navstate",navState);
        if (navState.hasOwnProperty('index')) {
            this._getCurrentRouteName(navState.routes[navState.index])
        } else {
          //  console.log("Current Route Name:", navState.key)
            // can then save this to the state (I used redux)
            store.dispatch(newRoute(navState.key))
        }

    }

    render () {
        return (
            <Provider store={store}>
            <StyleProvider style={getTheme(theme)} >
                <NativeBaseRoot>
                <PersistGate loading={<Spinner />} persistor={persistor}>
                <View style={baseStyles.fullPage}>
                    <App ref={navigatorRef => {
                        NavigationService.setTopLevelNavigator(navigatorRef);
                    }}
                         onNavigationStateChange={(prevState, newState) => {
                        this._getCurrentRouteName(newState)
                    }}/>
                    <SyncModal />
                    <ErrorModal />
                    <LoginModal />
                    <ForceSyncModal />
                    <KeepAwake />
                </View>
                </PersistGate>
                </NativeBaseRoot>
            </StyleProvider>
            </Provider>
        );
    }
}