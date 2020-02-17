import React from "react";
import {View, StyleSheet} from "react-native";

// component
import I18n from "../../i18n/i18n";
import CalibrationVideoSelectionView from "./calibrationVideoSelectionView";
import CalibrationOngoingView from "./calibrationOngoingView";
import CalibrationEndedView from "./calibrationEndedView";
import CalibrationFailedView from "./calibrationFailedView";
import CalibrationInterruptedView from "./calibrationInterruptedView";

// third party
import { Button, Text } from "native-base";

// styles
import theme from "../../themes/base-theme";
import pageTheme from "../../themes/page-theme";

const PHASE = {
    START: "start_training",
    ONGOING: "ongoing_training",
    FAILED: "failed_training",
    ENDED: "ended_training",
    INTERRUPTED: "interrupted_training",
};

export default class AutomaticCalibrationView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            currentPhase: PHASE.START,
        }
    }

    /** Measure width and height of the Content component for the CardCarousel */
    onContentLayout = (evt) => {
        this.setState({
            contentWidth: evt.nativeEvent.layout.width,
            contentHeight: evt.nativeEvent.layout.height,
        });
    }

    /** For the calibration get only Video longer than 1 minute */
    createQuery = ( page, searchFilter) => {
        return `cards?page=${page}${this.props.currentPatient ? `&patient_query=${this.props.currentPatient.id}` : ""}`+
        `${ this.props.searchText ? `&tag_query=${this.props.searchText}` : ""}` +
        `&content=Video&content_longer_than=59`;
    }

    onStartTrainingPress = ( selectedCard ) => {
        if( !this.props.socketEyeTracker.isClosed()){
            this.startTraining(selectedCard);
        }
        else {
            this.props.showErrorModal( I18n.t("error.websocket.generic"), I18n.t("error.websocket.closed"));
        }
    }

    onStopTrainingPress = () => {
        if( !this.props.socketEyeTracker.isClosed()){
            this.props.interruptAutomaticCalibration((createdEndVideoEvent) => {
                if ( createdEndVideoEvent ) {
                    this.props.socketEyeTracker.send({
                        type: "INTERRUPT_TRAINING",
                    });
                    this.setState({currentPhase: PHASE.INTERRUPTED});
                }
            });
        }
        else {
            this.props.showErrorModal( I18n.t("error.websocket.generic"), I18n.t("error.websocket.closed"));
        }
    }

    onBackToMenuPress = () => {
        if( this.props.session.current && this.props.session.displayPage) {
            // Interrupt the video
            this.props.interruptAutomaticCalibration((createdEndVideoEvent) => {
                // Even if something went wrong, just exit
                this.props.onSettingsConfirm();
            });
        }
        else {
            // I can't interrupt the video, since there aren't the basic info about the session
            // the video already ended on his own
            this.props.onSettingsConfirm();
        }
    }

    /** Start the training session */
    startTraining = ( selectedCard = null ) => {
        if( !selectedCard ) {
            return null;
        }

        this.props.startAutomaticCalibration( selectedCard, (createdTransitionToPageEvent) => {
            // console.log("startTraining started", createdTransitionToPageEvent);
            if( !this.props.socketEyeTracker.isClosed()){
                this.props.socketEyeTracker.send({
                    type: "START_TRAINING",
                });
                this.setState({currentPhase: PHASE.ONGOING});
            }
            else {
                this.props.showErrorModal( I18n.t("error.websocket.generic"), I18n.t("error.websocket.closed"));
            }
        });
    }

    /** Callback called when the Training is completed */
    completedTraining = () => {
        // Download the results
        setTimeout( () => {
            // Wait for the desktop to update the values
            this.props.getTrackerCalibrationParameter(this.props.currentPatient.id, (trackerCalibrationParams) => {
                if ( trackerCalibrationParams ) {
                    // Update the values
                    this.props.setTrackerCalibrationParams(trackerCalibrationParams);

                    this.setState({currentPhase: PHASE.ENDED});
                }
            });
        }, 2000);
    }

    failedTraining = () => {
        this.setState({currentPhase: PHASE.FAILED});
    }

    render() {
        switch (this.state.currentPhase) {
            case PHASE.ONGOING:
            return (
                <CalibrationOngoingView
                    currentPatient={this.props.currentPatient}
                    onStopTrainingPress={this.onStopTrainingPress}
                    buttonStyle={styles.buttonStyle}
                    />
            );

            case PHASE.INTERRUPTED:
                return (
                    <CalibrationInterruptedView
                        currentPatient={this.props.currentPatient}
                        onBackToMenuPress={this.onBackToMenuPress}
                        buttonStyle={styles.buttonStyle}
                    />
                );

            case PHASE.ENDED:
            return (
                <CalibrationEndedView
                    currentPatient={this.props.currentPatient}
                    onBackToMenuPress={this.onBackToMenuPress}
                    buttonStyle={styles.buttonStyle}
                    />
            );

            case PHASE.FAILED:
                return (
                    <CalibrationFailedView
                        currentPatient={this.props.currentPatient}
                        onBackToMenuPress={this.onBackToMenuPress}
                        buttonStyle={styles.buttonStyle}
                    />
                );

            default:
            return (
                <CalibrationVideoSelectionView
                    currentPatient={this.props.currentPatient}
                    navigation={this.props.navigation}
                    onStartTrainingPress={this.onStartTrainingPress}
                    buttonStyle={styles.buttonStyle}
                    />
            );
        }

    }
}

const styles = StyleSheet.create({
    buttonStyle: {
        marginHorizontal: 48,
        marginBottom: 28,
    }
})
