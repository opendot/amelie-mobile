// NavigationService.js

import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
}

function dispatcher(action) {
    _navigator.dispatch(action);
}

// add other navigation functions that you need and export them

export default {
    dispatcher,
    setTopLevelNavigator,
};