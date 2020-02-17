import React from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from "../../i18n/i18n";
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import AutomaticCalibrationView from "./automaticCalibrationView";
import ManualCalibrationView from "./manualCalibrationView";

// third party
import { Container, Content } from "native-base";
import SwitchButton from "switch-button-react-native";

// actions
import { connectSocketEyeTracker, handleSocketEyeTrackerAppState } from "../../actions/WSactions";
import { getTrackerCalibrationParameter, setTrackerCalibrationParams, createTrackerCalibrationParameter, startAutomaticCalibration, interruptAutomaticCalibration } from "../../actions/SettingActions";
import { createEvent, createTrainingSession } from "../../actions/SessionActions";
import { showErrorModal } from "../../actions/ModalAction";

// styles
import theme, { baseStyles } from "../../themes/base-theme";

class EyetrackerCalibrationScreen extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)

        this.isComponentMounted = false;

        // local settings used for render and to confirm new settings
        this.state = {
            setting: this.props.trackerCalibration.setting == "automatic" ? 2 : 1,
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

        AppState.addEventListener('change', this.props.handleSocketEyeTrackerAppState);

        if( this.state.setting == 2 ){
            // Set SwitchButton on the correct value
            let {props, state} = this.switchButton;
            this.switchButton.setState({ activeSwitch: 2 });
            Animated.timing(
                state.offsetX,
                    {
                        toValue: (((props.switchWidth || state.sbWidth) / 2) - 6) * 1,
                        duration: props.switchSpeedChange || 100
                    }
            ).start();
        }
    }

    componentWillUnmount(){
        this.isComponentMounted = false;

        AppState.removeEventListener('change', this.props.handleSocketEyeTrackerAppState);

        if( !this.socketWasOpen ) {
            // Stop socket
            this.props.socketEyeTracker.close();
        }
    }

    onValueChangeCalibrationSetting = (newSetting) => {
        switch (newSetting) {
            case 1:
                // Manual training
                if( !this.props.socketEyeTracker.isClosed()){
                    this.props.socketEyeTracker.send({
                        type: "MANUAL_CLASSIFIER",
                    });
                }
                else {
                    this.props.showErrorModal( I18n.t("error.websocket.generic"), I18n.t("error.websocket.closed"));
                }
                break;

            case 2:
                // Automatic training
                if( !this.props.socketEyeTracker.isClosed()){
                    this.props.socketEyeTracker.send({
                        type: "TRAINED_CLASSIFIER",
                    });
                }
                else {
                    this.props.showErrorModal( I18n.t("error.websocket.generic"), I18n.t("error.websocket.closed"));
                }
                break;
            default:
                // Invalid value, this should never happen
                return;

        }
        this.setState({setting: newSetting});
    }

    /**
     * Create the listener for the websocket,
     * the listener must be recreated to update the 'this' object
     * @returns {function} a listener for the eyetracker's messages
     */
    getOnMessageListener = () => {
        return (e) => {
            if( this.props.socketEyeTracker && this.props.socketEyeTracker.ws
                && e.currentTarget._socketId != this.props.socketEyeTracker.ws._socketId) {
                console.log(`EyetrackerCalibrationScreen.getOnMessageListener: message from wrong socket ${e.currentTarget._socketId} != ${this.props.socketEyeTracker.ws._socketId}`)
                return;
            }

            const event = JSON.parse(e.data);
            switch (event.type) {
                case "TRAINING_END":
                    // Completed automatic training
                    if( this.autoCalibrationView ) {
                        this.autoCalibrationView.completedTraining();
                    }
                    break;

                case "TRAINING_FAILED":
                    // Completed automatic training
                    if( this.autoCalibrationView ) {
                        this.autoCalibrationView.failedTraining();
                    }
                    break;
            }
        }
    }

    /** Function to call, when setting page is changed, in order to confirm new parameters */
    onSettingsConfirm = () => {
        // TODO Control if calibration settings has changed
        // console.log(this.props.trackerCalibration);
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
            setting: this.state.setting,
            fixing_time_ms: this.state.fixingTime,
            fixing_radius: (this.state.fixingRadius / 100.0)
        }

        // Notify server Rails
        this.props.createTrackerCalibrationParameter(
            targetSettings,
            this.props.currentPatient,
            (createdTrackerParam) => {
                this.eventCreationCallback(createdTrackerParam);
            }
        );
    }

    /** Send the new value of a setting on websocket and save on local store */
    eventCreationCallback = (createdTrackerParam) => {


        let _fixingTime = (createdTrackerParam) ? createdTrackerParam.fixing_time_ms : this.state.fixingTime
        // If there is a probleng sending new setting to the server, update local one with setting values into state
        let _fixingRadius = (createdTrackerParam) ? createdTrackerParam.fixing_radius : (this.state.fixingRadius / 100.0)
        let _setting = (createdTrackerParam) ? createdTrackerParam.setting : ( this.state.setting == 1 ? "manual" : "automatic");
        let _trained_fixation_time = (createdTrackerParam) ? createdTrackerParam.trained_fixation_time : this.state.trained_fixation_time;
        let _transition_matrix = (createdTrackerParam) ? createdTrackerParam.transition_matrix : this.state.transition_matrix;

        // Update local settings
        this.props.setTrackerCalibrationParams({
            fixing_time_ms: _fixingTime,
            fixing_radius: _fixingRadius,
            setting: _setting,
            trained_fixation_time: _trained_fixation_time,
            transition_matrix: _transition_matrix,
        });
    }

    /** Function used to update the local state of the component */
    updateFixingTime = (value) => {
        this.setState({fixingTime: value})
    }

    updateFixingRadius = (value) => {
        this.setState({fixingRadius: value})
    }

    render() {
        return (
            <Container>

                <AirettSimpleHeader title={I18n.t("settings")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={this.onSettingsConfirm} />

                <Content style={styles.content} contentContainerStyle={baseStyles.fullPage}>

                    <View style={styles.settingsDivider}>
                        <Text style={styles.dividerText}>{I18n.t("fixation")}</Text>
                    </View>

                    <View style={styles.switchContainer}>
                        <SwitchButton
                            ref={(switchButton) => this.switchButton = switchButton}
                            onValueChange={this.onValueChangeCalibrationSetting}
                            text1={I18n.t("manual")}
                            text2={I18n.t("automatic")}
                            switchWidth = {280}
                            switchHeight = {44}
                            switchBorderRadius = {theme.borderRadiusBase}
                            switchSpeedChange = {200}
                            switchBorderColor="white"
                            switchBackgroundColor="transparent"
                            btnBorderColor="transparent"
                            btnBackgroundColor={theme.brandPrimary}
                            fontColor={theme.inverseTextColor}
                            activeFontColor={theme.inverseTextColor}
                            />
                    </View>

                    {this.state.setting == 1 ?
                        <ManualCalibrationView
                            fixingTime={this.state.fixingTime}
                            updateFixingTime={this.updateFixingTime}
                            fixingRadius={this.state.fixingRadius}
                            updateFixingRadius={this.updateFixingRadius}
                            />
                        :
                        <AutomaticCalibrationView navigation={this.props.navigation}
                            ref={(autoCalibrationView) => { this.autoCalibrationView = autoCalibrationView; }}
                            socketEyeTracker={this.props.socketEyeTracker}
                            currentPatient={this.props.currentPatient}
                            session={this.props.session}
                            getTrackerCalibrationParameter={this.props.getTrackerCalibrationParameter}
                            setTrackerCalibrationParams={this.props.setTrackerCalibrationParams}
                            startAutomaticCalibration={this.props.startAutomaticCalibration}
                            interruptAutomaticCalibration={this.props.interruptAutomaticCalibration}
                            onSettingsConfirm={this.onSettingsConfirm}
                            showErrorModal={this.props.showErrorModal}
                            />
                    }

                </Content>
            </Container>

        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: "grey",
    },
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
    switchContainer: {
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 28,
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

const mapStateToProps = (state) => {
    return {
        currentPatient: state.authenticationReducer.currentPatient,
        setting: state.settingReducer,
        trackerCalibration: state.settingReducer.trackerCalibration,
        session: state.webSocketReducer.session,
        currsession: state.webSocketReducer.session.current,
        socketEyeTracker: state.webSocketReducer.socketEyeTracker,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        connectSocketEyeTracker: (onMessageListener, reconnectOnError, firstMessage) => {dispatch(connectSocketEyeTracker(onMessageListener, reconnectOnError, firstMessage))},
        handleSocketEyeTrackerAppState: (currentAppState) => {dispatch(handleSocketEyeTrackerAppState(currentAppState))},
        createEvent: (eventType, session, page, body, callback) => {dispatch(createEvent(eventType, session, page, body, callback))},
        createTrainingSession: (type, session, callback) => {dispatch(createTrainingSession(type, session, callback))},
        getTrackerCalibrationParameter: (patientId, callback) => {dispatch(getTrackerCalibrationParameter(patientId, callback))},
        setTrackerCalibrationParams: (params) => {dispatch(setTrackerCalibrationParams(params))},
        createTrackerCalibrationParameter: (trackerCalibration, patient, callback) => {dispatch(createTrackerCalibrationParameter(trackerCalibration, patient, callback))},
        startAutomaticCalibration: (card, callback) => {dispatch(startAutomaticCalibration(card, callback))},
        interruptAutomaticCalibration: (callback) => {dispatch(interruptAutomaticCalibration(callback))},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EyetrackerCalibrationScreen);
