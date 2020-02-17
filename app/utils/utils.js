import axios from 'axios';
import { NavigationActions } from 'react-navigation';

// third party
import RNFetchBlob from "rn-fetch-blob";// Convert file into base64
import RNFS from "react-native-fs";// Allow to save file into storage

// actions
import { showErrorModal } from "../actions/ModalAction";

// Current version of the application
export const MOBILE_APP_VERSION = "0.6.0";

export function renderIf(condition, content) {
    if (condition) {
        return content;
    } else {
        return null;
    }
}


/**
 * Wrapper for the fetch function that automatically handle the tokens for authentication
 * @param {string} serverUrl
 * @param {string} relativePath 
 * @param {string} method GET, PUT, DELETE, ...
 * @param {any} header extra headers
 * @param {any} body 
 * @param {any} signinCredentials conteins the authentication token and all the data of the logged user
 * @param {number} timeout millis
 */
export function fetchFromServer(serverUrl, relativePath, method, header, body, signinCredentials = null, timeout = 10000) {
    return axios.request({
        url: `${serverUrl}/${relativePath}`,
        method: method,
        timeout: timeout,
        headers: Object.assign({},{
                    'Accept': 'application/airett.v1',
                    'Content-Type': 'application/json',
                    'pragma': 'no-cache',
                    'cache-control': 'no-store',
                    'app-version': `${MOBILE_APP_VERSION}`
                },
                signinCredentials,
                header),
        data: body,
        validateStatus: function (status) {
            return status < 500; // Reject only if the status code is greater than or equal to 500
        }
    })
}


/**
 * Return a function that checks if the server returned a valid response,
 * also show the error message returned by the server.
 * The function must be used inside a .then(checkResponseError( dispatch, getState, errorTitle))
 * @param {!function} dispatch used to show the error modal
 * @param {!function} getState used to access redux store
 * @param {?string} errorTitle optional title of the error modal
 */
export function checkResponseError( dispatch, getState, errorTitle){
    return (response) => {
        if( response.status && response.status < 300){
            // Valid response, forward it
            return response;
        }
        else {
            //  Error, show a modal and return null
            dispatch(showErrorModal( errorTitle, 
                response.data && response.data.errors ? 
                    response.data.errors.length > 0 ? response.data.errors[0] : JSON.stringify(response.data.errors)
                    : JSON.stringify(response)
            ));
            return null;
        }
    }
}

/**
 * Go to the MainScreen of the application, reset the navigation tree
 * @param {any} navigation this.props.navigation
 */
export function navigateToMainScreen(navigation){
    navigation.dispatch( NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName: 'ActivitySelector'})
        ]
    }));
}

/**
 * Go to the FlowComposerScreen, reset the navigation tree
 * @param {any} navigation this.props.navigation
 */
export function navigateToFlowComposerScreen(navigation){
    navigation.dispatch( NavigationActions.reset({
        index: 1,
        actions: [
            NavigationActions.navigate({ routeName: 'ActivitySelector'}),
            NavigationActions.navigate({ routeName: 'flowComposer'})
        ]
    }));
}

/**
 * Go to the CognitiveEnhancementScreen, reset the navigation tree
 * @param {any} navigation this.props.navigation
 */
export function navigateToCognitiveEnhancementScreen(navigation){
    navigation.dispatch( NavigationActions.reset({
        index: 1,
        actions: [
            NavigationActions.navigate({ routeName: 'ActivitySelector'}),
            NavigationActions.navigate({ routeName: 'CognitiveEnhancement'})
        ]
    }));
}

/** Given the filePath of an file, convert the file into a base64 string.
 * The base64 string is temparary saved in a file in the cache.
 * @param {string} filePath a file path in the form "file:///storage/emulated/0/DCIM/Camera/myVideo.mp4"
 * @return {Promise} a Promise that return the base64 string of the file
 */
export function convertFilePathToBase64( filePath ){
    // react-native-image-crop-picker automatically return the base64 for images
    // Buffer size: if too small, the convertion is slow, if too big it have problems with wrinting in  the txt
    const bufferSize = 24*1024;
    return new Promise((resolve, reject) => {
        let writeStream
        let tempFile = `${RNFS.CachesDirectoryPath}/convertFilePathToBase64.txt`;
        // create empty file for write
        RNFetchBlob.fs.writeFile(tempFile, '')
        .then(() => {
            // Open file
            return RNFetchBlob.fs.readStream(filePath, 'base64', bufferSize)
        })
        .then((readStream) => {
            // console.log("convertFilePathToBase64 open read stream", readStream)
            readStream.onData((chunk) => {
                console.log("convertFilePathToBase64 chunk", chunk.length);
                // write chunks into file
                writeStream.write(chunk)
            });
            readStream.onError(reject);
            readStream.onEnd(() => {
                writeStream.close()
                // Get string from file
                RNFetchBlob.fs.readFile(tempFile, 'utf8')
                .then((dataBase64) => {
                    // console.log("RNFetchBlob Read base64 data:",dataBase64.length)
                    // Delete temp file
                    RNFetchBlob.fs.unlink(tempFile)
                    .catch((err) => { console.log("Error delete file "+tempFile, err) })
                    .finally(() => {
                        // Return the base64 string
                        // console.log("RNFetchBlob Read base64 finally resolve", dataBase64.length)
                        resolve(dataBase64);
                    });
                    
                })
            });
            
            // open write stream
            RNFetchBlob.fs.writeStream(tempFile, 'utf8').then((stream) => {
                console.log("convertFilePathToBase64 open write stream", stream)
                writeStream = stream
                readStream.open()
            })
        })
    })
}

/** Given the url of an image, convert the image into a base64 string
 * @return {string} base64 string of the image
 */
export function convertUrlToBase64( url ){
    // TODO Delayed until server is ready
    return url;
}

export function getBase64String(asset) {
    return `data:${asset.mime};base64,${asset.data}`
}