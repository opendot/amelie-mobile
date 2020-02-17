import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from '../../i18n/i18n';
import UDPBroadcast from '../../utils/UDPBroadcast';

// third party
import { H1, Button, Text, Icon, Item, Label, Input } from 'native-base';
import { NavigationActions } from "react-navigation";
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { setServerUrl, authenticateUserWithStoredCredentials, getQueuedSynchronizables, startServerSync } from "../../actions/AuthenticationActions";
import { fetchFromServer } from "../../utils/utils";
import { showErrorModal, openForceSyncModal, closeForceSyncModal } from "../../actions/ModalAction";

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/** Fields to set the server IP and connect the Websocket */
class ServerConnectionScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: null,
    });

    constructor(props) {
        super(props);

        this.state = {
            hasStoredCredentials: props.signinCredentials ? true : false,
        }
        this.onQRCodeReadDebounce = debounce(this.onQRCodeRead, 1000, {leading: true, trailing: false});
    }

    onLocalServerFound = (rinfo) => {
        console.log("ServerConnectionScreen onLocalServerFound", rinfo);
        this.userOnNetwork(`http://${rinfo.address}:3001`).then(( response ) => {
            console.log("onLocalServerFound userOnNetwork response", response);
        });
    }

    userOnNetwork = (url)=> {
        return fetchFromServer( url, "users/on_network", "POST")
        .then( (response) => {
            // console.log("userOnNetwork response", response);
            if( response && response.status == 200){
                return response;
            }
            else {
                this.props.showErrorModal( I18n.t("error.urlNotFound") ,
                    response && response.data && response.data.errors ? 
                        response.data.errors.length > 0 ? response.data.errors[0] : JSON.stringify(response.data.errors)
                        : JSON.stringify(response)
                );
                return null;
            }
        } ).catch( (error) => {
            this.props.showErrorModal( I18n.t("error.urlNotFound"), error.message || JSON.stringify(error));
        });
    }

    /** If there are credentials in the store, try to signin using those */
    checkSigninCredentials = (callback = null) => {
        if( this.props.signinCredentials ){
            // Check if credentials are still valid
            this.props.authenticateUserWithStoredCredentials( this.props.signinCredentials,
                ( newSigninCredentials) => {
                    // console.log("checkSigninCredentials response", newSigninCredentials, this.props)
                    if( newSigninCredentials ) {
                        // I'm successfully signed with the previously stored credentials
                        if( this.props.currentPatient ) {
                            // I already have all the informations of the signin
                            this.checkPatientQueuedSync( this.props.currentPatient, callback);
                        }
                        else {
                            // I'm still missing the patient, select the patient
                            this.props.navigation.navigate("PatientSelectionScreen");
                            if( callback){callback(true);}
                        }
                    }
                    else {
                        // Previous credentials are not valid, I need to login
                        this.setState({hasStoredCredentials: false});
                        if( callback){callback(false);}
                    }
                }
            );
        }
        else {
            // No credentials stored, follow with the login
            this.setState({hasStoredCredentials: false});
            if( callback){callback(false);}
        }
    }

    checkPatientQueuedSync = (patient, callback = null) => {
        if( patient.id === "guestPatient") {
            // Guest can't synchronize, skip the check
            this.props.screenProps.onSigninComplete();
            if( callback){callback(true);}
            return;
        }
        this.props.getQueuedSynchronizables( patient.id, (queuedSynchronizables) => {
            if( queuedSynchronizables ) {
                if( queuedSynchronizables.length === 0 ) {
                    this.props.screenProps.onSigninComplete();
                    if( callback){callback(true);}
                    return;
                }
                else {
                    // There are objects waiting for Synchronization
                    this.props.openForceSyncModal(this.props.forceSyncTitle, this.props.forceSyncText, (updatedPatient) => {
                        this.props.startServerSync( this.props.currentPatient, (updatedPatient) => {
                            // Synchronization completed, but I don't know if it was successfull
                            this.checkPatientQueuedSync(updatedPatient, callback);
                        });
                        this.props.closeForceSyncModal();
                    });
                }
            }
        });
    }

    /** IP Address retrieved from QR code, set the current url */
    onQRCodeRead = (data) => {
        // Convert the event received from the QRCode scanner
        let url = null;
        if( data && typeof data == "string"){
            let ss = data.split(":");
            if( ss.length == 2){
                // It's a valid ip address
                url = `http://${data}`;
            }
            else {
                console.log("ServerConnectionScreen onQRCodeRead invalid url", data);
                return 
            }
        }
        else {
            console.log("ServerConnectionScreen onQRCodeRead empty data", data);
            return;
        }
        let urlChanged = (this.props.serverUrl != url);
        // Save server url
        this.props.setServerUrl(url);

        // Test if valid url
        /* I also need to wait some time before I can open a new Screen with the navigator */
        this.testValidUrl(url).then(response => {
            if( response){
                if( this.state.hasStoredCredentials) {
                    this.checkSigninCredentials( (success) => {
                        if( !success ) {
                            // Invalid credential, repeat signin
                            console.log("ServerConnectionScreen testValidUrl ERROR: Invalid credential, repeat signin");
                            // this.props.showErrorModal(I18n.t("error.server.generic"), I18n.t("error.repeatSignin"));
                            // Close the QRScannerScreen and go to signin screen
                            this.goToSigninScreen();
                        }
                    });
                }
                else {
                    // Close the QRScannerScreen and go to signin screen
                    this.goToSigninScreen();
                }
            }
            else {
               // Close the QRScannerScreen
               this.props.navigation.dispatch( NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: "ServerConnectionScreen"}),
                ]
            })); 
            }

        });
        
    }

    /**
     * Send a GET request to the url to see if connection is available
     * @return response if the url returned a 200 OK, null elsewhere
     */
    testValidUrl = (url)=> {
        return fetchFromServer( url, "", "GET", undefined, undefined, undefined, 5000)
        .then( (response) => {
            console.log("onQRCodeRead test response", response);
            if( response && response.status == 200){
                return response;
            }
            else {
                this.props.showErrorModal( I18n.t("error.urlNotFound") ,
                    response && response.data && response.data.errors ? 
                        response.data.errors.length > 0 ? response.data.errors[0] : JSON.stringify(response.data.errors)
                        : JSON.stringify(response)
                );
                return null;
            }
        } ).catch( (error) => {
            this.props.showErrorModal( I18n.t("error.urlNotFound"), error.message || JSON.stringify(error));
        });
    }

    /** Close the QRScannerScreen and go to signin screen */
    goToSigninScreen = () => {
        this.props.navigation.dispatch( NavigationActions.reset({
            index: 1,
            actions: [
                NavigationActions.navigate({ routeName: "ServerConnectionScreen"}),
                NavigationActions.navigate({ routeName: "UserAuthenticationScreen"})
            ]
        }));
    }

    render(){
        return (
            <View style={baseStyles.signInStepContainer}>
                <H1 style={styles.title}>{I18n.t("greeting")}</H1>

                <Image style={styles.image} resizeMode={"contain"}
                    source={require("../../../images/qrscanning.png")} />

                <Text style={baseStyles.signInStepText} >{I18n.t("scanQRCodeToConnect")}</Text>
                <Button bordered block light onPress={debounce(() => {
                    this.props.navigation.navigate("QRCodeScanScreen", {
                        onQRCodeRead: this.onQRCodeReadDebounce,
                    })
                }, 1000, {leading: true, trailing: false})}>
                    <Text>{I18n.t("scanQRCode")}</Text>
                </Button>
                <SkipButton
                    text={I18n.t("skip").toUpperCase()}
                    hide={!this.props.serverUrl || !this.state.hasStoredCredentials}
                    onPress={debounce(() => {
                        this.checkSigninCredentials( (success) => {
                            if( !success ) {
                                this.props.showErrorModal(I18n.t("error.server.generic"), I18n.t("error.repeatSignin"));
                            }
                        });
                    }, 1000, {leading: true, trailing: false})}
                />
            </View>
        );
    }
}

function SkipButton( props ) {
    if( props.hide) {return null;}
    return (
        <Button transparent light style={styles.skipButton} onPress={props.onPress} >
            <Text>{props.text}</Text>
        </Button>
    );
}

const styles = StyleSheet.create({
    title:{
        marginTop: 26,
        color: "white",
        fontSize: 36,  
        lineHeight: 36,
    },
    image: {
        flex: 1,
        maxHeight: 256,
        margin: 12,
    },

    skipButton: {
        alignSelf: "flex-end",
        marginVertical: 2,
    },
});

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        signinCredentials: state.authenticationReducer.signinCredentials,
        currentPatient: state.authenticationReducer.currentPatient,
        forceSyncTitle: state.modalReducer.forceSyncTitle,
        forceSyncText: state.modalReducer.forceSyncText,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        authenticateUserWithStoredCredentials: (signinCredentials, callback) => {dispatch(authenticateUserWithStoredCredentials(signinCredentials, callback))},
        getQueuedSynchronizables: (patientId, callback) => {dispatch(getQueuedSynchronizables(patientId, callback))},
        startServerSync: (patient, callback) => {dispatch(startServerSync(patient, callback))},
        setServerUrl: (url) => {dispatch(setServerUrl(url))},
        openForceSyncModal: (forceSyncTitle, forceSyncText, onSyncPress) => {dispatch(openForceSyncModal(forceSyncTitle, forceSyncText, onSyncPress))},
        closeForceSyncModal: () => {dispatch(closeForceSyncModal())},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ServerConnectionScreen);