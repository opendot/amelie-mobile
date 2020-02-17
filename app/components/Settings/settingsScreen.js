import React from 'react';
import { AppState, Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from "../../i18n/i18n";
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import PartnerSelector from './partnerSelector';
import SettingItem from './settingItem';

// third party
import { Container, Content } from "native-base";

// actions
import { connectSocketEyeTracker } from "../../actions/WSactions";
import { setTrackerCalibrationParams, createTrackerCalibrationParameter } from "../../actions/SettingActions";
import { createEvent } from "../../actions/SessionActions";

// styles
import theme from "../../themes/base-theme";

// constants definition
const MIN_FIXATION_TIME = 400;
const MAX_FIXATION_TIME = 1200;
const FIXATION_TIME_STEP = 50;

const MIN_FIXATION_RADIUS = 5;
const MAX_FIXATION_RADIUS = 15;
const FIXATION_RADIUS_STEP = 1;


class SettingsScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)

        this.isComponentMounted = false;

        // local settings used for render and to confirm new settings
        this.state = {
            fixingTime: this.props.trackerCalibration.fixing_time_ms,
            fixingRadius: Math.trunc(100 * this.props.trackerCalibration.fixing_radius)
        }
        /** Flag: if true it means that when this component was Mounted
         *  the socketEyeTracker was already active */
        this.socketWasOpen = false;
    }

    componentWillMount() {
        /* WARNING since the socketEyeTracker send a lot of data, it's managed by the component
        that needs it: every component open and close it based on its needs. There can be conflicts
        when 2 or more components try to use it at the same time */
        this.socketWasOpen = this.props.socketEyeTracker && !this.props.socketEyeTracker.isClosed();
        if( !this.socketWasOpen ) {
            this.props.connectSocketEyeTracker(this.getOnMessageListener(), false, null);
        }
    }

    componentDidMount(){
        this.isComponentMounted = true;
        AppState.addEventListener('change', this.handleSocketEyeTrackerAppState);
    }

    componentWillUnmount(){
        this.isComponentMounted = false;

        AppState.removeEventListener('change', this.props.handleSocketEyeTrackerAppState);

        if( !this.socketWasOpen ) {
            // Stop socket
            this.props.socketEyeTracker.close();
        }
    }

    handleSocketEyeTrackerAppState = (currentAppState) => {
        // console.log("SettingScreen currentAppState "+currentAppState, this)
        const {loggedIn, socketEyeTracker} = this.props;
        if (loggedIn === true) {
            // IN ANDROID: when in background, it goes -> background -> active
            // IN iOS it goes inactive -> background -> active
            if (currentAppState === "background")
            {
                // close socket
                if(socketEyeTracker) {
                    socketEyeTracker.close();
                    socketEyeTracker.logout();
                }
    
            }
            else if (currentAppState === "inactive") {
                // i should be here only when I get back from background
            
                // close socket
                if(socketEyeTracker) {
                    socketEyeTracker.close();
                    socketEyeTracker.logout();
                }
    
            }
            else if (currentAppState === "active") {
                // i should be here only when I get back from background
                // console.log("SettingScreen.handleSocketEyeTrackerAppState openWensocket props.currentServerSession",this.props.currentServerSession)
                if(socketEyeTracker) {
                    socketEyeTracker.createWebSocket();
                }
            }
        }
    }

    /**
     * Create the listener for the websocket,
     * the listener must be recreated to update the 'this' object
     * @returns {function} a listener for the eyetracker's messages
     */
    getOnMessageListener = () => {
        // I only need to send a message, so return null to keep the existing onMessageListener
        // inside the WSService object
        return null;
    }

    /** Function to call, when setting page is changed, in order to confirm new parameters */
    onSettingsConfirm = () => {
        // ???? Control if calibration settings has changed
        console.log(this.props.trackerCalibration);
        this.updateSettings();
        
        this.props.navigation.goBack()
    }

    /**
     * Send the event to the server, if exist a session, otherwhise set the defoult setting for the current patient
     */
    updateSettings = () => {
        
        // Divide by 100 the fixation radius, because it is shown as percentage of the screeen
        let targetSettings = { 
            ...this.props.trackerCalibration,
            fixing_time_ms: this.state.fixingTime,
            fixing_radius: (this.state.fixingRadius / 100.0)
        }

        // Notify server Rails
        if(this.props.currsession) {
            // Active TrainingSession
            this.props.createEvent( 
                "tracker_calibration_parameter_change_events",
                this.props.currsession,
                null,
                {
                    tracker_calibration_parameter: targetSettings
                },
                (createdEvent) => {
                    if(createdEvent){
                        this.eventCreationCallback(null);
                    }
                }
            );
        }
        else {
            // No TrainingSession, set default setting for current patient
            this.props.createTrackerCalibrationParameter(
                targetSettings,    
                this.props.currentPatient,
                (createdTrackerParam) => {
                    this.eventCreationCallback(createdTrackerParam);
                }
            );
        }
    }

    /** Send the new value of a setting on websocket and save on local store */
    eventCreationCallback = (createdTrackerParam) => {
        

        let _fixingTime = (createdTrackerParam) ? createdTrackerParam.fixing_time_ms : this.state.fixingTime
        // If there is a probleng sending new setting to the server, update local one with setting values into state
        let _fixingRadius = (createdTrackerParam) ? createdTrackerParam.fixing_radius : (this.state.fixingRadius / 100.0)

        // Notify server Node
        if( !this.props.socketEyeTracker.isClosed()){
            this.props.socketEyeTracker.send({
                type: "FIXATION_TIME", 
                data: _fixingTime
            });
            this.props.socketEyeTracker.send({
                type: "FIXATION_RADIUS", 
                data: _fixingRadius
            });
        }

        // Update local settings
        this.props.setTrackerCalibrationParams({
            fixing_time_ms: _fixingTime,
            fixing_radius: _fixingRadius
        });
    }

    /** Function used to update the local state of the component */
    updateFixingTime = (value) => { 
        this.setState({fixingTime: value})
    }

    updateFixingRadius = (value) => { 
        this.setState({fixingRadius: value})
    }

    changePartner = () => {
        this.props.navigation.navigate("PatientSelection")
    }
    render() {
        return (
            <Container>

                <AirettSimpleHeader title={I18n.t("settings")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={this.onSettingsConfirm} />

                <Content style={{backgroundColor: "grey"}}>
                    <PatientSection
                        hide={this.props.isGuest}
                        currentPatient={this.props.currentPatient}
                        changePartner={this.changePartner}
                        />

                    <View style={styles.settingsDivider}>
                        <Text style={styles.dividerText}>{I18n.t("fixation")}</Text>
                    </View>

                    <SettingItem
                        title={I18n.t("fixing_time_edit")}
                        value={this.state.fixingTime}
                        minValue={MIN_FIXATION_TIME}
                        maxValue={MAX_FIXATION_TIME}
                        step={FIXATION_TIME_STEP}
                        updateValueFunc={this.updateFixingTime}
                    />  
                    
                    <SettingItem
                        title={I18n.t("fixing_radius_edit")}
                        value={this.state.fixingRadius}
                        minValue={MIN_FIXATION_RADIUS}
                        maxValue={MAX_FIXATION_RADIUS}
                        step={FIXATION_RADIUS_STEP}
                        updateValueFunc={this.updateFixingRadius}
                    />

                </Content>
            </Container>

        );
    }
}

function PatientSection(props){
    if( props.hide ) { return null;}

    return(
        <View>
            <View style={styles.settingsDivider}>
                <Text style={styles.dividerText}>{I18n.t("partner")}</Text>
            </View>

            <PartnerSelector
                title={I18n.t("change")}
                currentPatient={props.currentPatient}
                changePartner={props.changePartner}
            />
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        currentPatient: state.authenticationReducer.currentPatient,
        isGuest: state.authenticationReducer.currentUser && state.authenticationReducer.currentUser.type == "GuestUser" ? true : false,
        loggedIn: state.authenticationReducer.loggedIn,
        setting: state.settingReducer,
        trackerCalibration: state.settingReducer.trackerCalibration,
        currsession: state.webSocketReducer.session.current,
        socketEyeTracker: state.webSocketReducer.socketEyeTracker,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        connectSocketEyeTracker: (onMessageListener, reconnectOnError, firstMessage) => {dispatch(connectSocketEyeTracker(onMessageListener, reconnectOnError, firstMessage))},
        createEvent: (eventType, session, page, body, callback) => {dispatch(createEvent(eventType, session, page, body, callback))},
        setTrackerCalibrationParams: (params) => {dispatch(setTrackerCalibrationParams(params))},
        createTrackerCalibrationParameter: (trackerCalibration, patient, callback) => {dispatch(createTrackerCalibrationParameter(trackerCalibration, patient, callback))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);

const styles = StyleSheet.create({
    settingsDivider: {
        backgroundColor: '#424242',
        height: 32,
        justifyContent: 'center'
    },
    dividerText: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase,
        marginHorizontal: 15
    },
    textStyle: {
        color: theme.inverseTextColor,
        fontSize: theme.fontSizeBase,
    },
    buttonText: {
        color: "white",
        marginHorizontal: 20,
        fontSize: theme.fontSizeBase
    },
});

