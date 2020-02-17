import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from '../../i18n/i18n';
import PatientSelectionView from "./patientSelectionView";

// third party
import { Text, Button } from 'native-base';

// actions
import { navigateToMainScreen } from "../../utils/utils";
import { setCurrentPatient, getQueuedSynchronizables, startServerSync } from "../../actions/AuthenticationActions";
import { openForceSyncModal, closeForceSyncModal } from "../../actions/ModalAction";
import { getTrackerCalibrationParameter, setTrackerCalibrationParams } from "../../actions/SettingActions";
import { newTree, newSession } from "../../actions/WSactions";

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/**
 *  Screen used to select a Patient
 * The chosen patient is saved in the store as the current Patient
 */
class PatientSelectionScreen extends React.Component {

    static navigationOptions = ({ navigation }) => ({
        header: null,
    });

    /**
     * When clicking on a patient card set that patient as the current patient
     * @param patient the selected patient
     * @param {number} index index of the patient in the list of all patients
     */
    onPatientClick = ( patient, index ) => {
        // console.log("PatientSelectionScreen onPatientClick "+index, patient);
        // Get the patient Tracker Calibration Params
        this.props.getTrackerCalibrationParameter( patient.id, ( trackerCalibrationParams ) => {
            // Clear tree and session if patient changed
            if( !this.props.currentPatient || this.props.currentPatient.id != patient.id){
                this.props.newTree(null);
                this.props.newSession(null);
            }
            // Save the patient in the store
            this.props.setCurrentPatient( patient );
            if( trackerCalibrationParams) {
                this.props.setTrackerCalibrationParams(trackerCalibrationParams);
            }
            
            this.props.getQueuedSynchronizables( patient.id, (queuedSynchronizables) => {
                if( queuedSynchronizables ) {
                    if( queuedSynchronizables.length === 0 ) {
                        // Close this page and go to the MainScreen
                        if( this.props.screenProps && this.props.screenProps.onSigninComplete){
                            // I'm in the login phase
                            this.props.screenProps.onSigninComplete();
                        }
                        else {
                            navigateToMainScreen(this.props.navigation);
                        }
                    }
                    else {
                        // There are objects waiting for Synchronization
                        this.props.openForceSyncModal(null, null, this.onSyncPress);
                    }
                }
            });
        });
    }

    onSyncPress = () => {
        this.props.startServerSync( this.props.currentPatient, (updatedPatient) => {
            // Synchronization completed, but I don't know if it was successfull
            this.onPatientClick(updatedPatient);
        });
        this.props.closeForceSyncModal();
    }

    goBack = () => {
        this.props.navigation.goBack()
    }

    render() {
        return (
            <View style={[baseStyles.signInStepContainer, {alignItems: "stretch", paddingTop: 40}]}>
                <Text style={[baseStyles.signInStepText, {fontSize: theme.fontSizeBase, marginBottom: 30}]}>
                    {I18n.t("hello")} {this.props.currentUser.name}!{"\n"}{I18n.t("selectPatientQuestion")}
                </Text>

                <PatientSelectionView
                    currentUser={this.props.currentUser}
                    onPatientClick={this.onPatientClick}
                    selectedPatientId={ this.props.currentPatient ? this.props.currentPatient.id : null}
                    />
                <Button bordered block light style={{marginVertical: 12}}onPress={this.goBack}>
                    <Text>{I18n.t("undo")}</Text>
                </Button>
            </View>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        currentUser: state.authenticationReducer.currentUser,
        currentPatient: state.authenticationReducer.currentPatient,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        setCurrentPatient: (patient) => {dispatch(setCurrentPatient(patient))},
        openForceSyncModal: (forceSyncTitle, forceSyncText, onSyncPress) => {dispatch(openForceSyncModal(forceSyncTitle, forceSyncText, onSyncPress))},
        closeForceSyncModal: () => {dispatch(closeForceSyncModal())},
        getTrackerCalibrationParameter: (patientId, callback) => {dispatch(getTrackerCalibrationParameter(patientId, callback))},
        setTrackerCalibrationParams: (newSettings) => dispatch(setTrackerCalibrationParams(newSettings)),
        getQueuedSynchronizables: (patientId, callback) => {dispatch(getQueuedSynchronizables(patientId, callback))},
        startServerSync: (patient, callback) => {dispatch(startServerSync(patient, callback))},
        newTree: (tree) => {dispatch(newTree(tree))},
        newSession: (session) => {dispatch(newSession(session))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PatientSelectionScreen);