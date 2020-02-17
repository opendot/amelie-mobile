import React, {Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Button, Text } from 'native-base';
import { debounce } from 'lodash'; // Prevent double clicks

// components
import I18n from '../../i18n/i18n';
import { navigateToCognitiveEnhancementScreen } from "../../utils/utils";
import StepProgressBar from "../../utils/stepProgressBar";

// third party
import Modal from "react-native-modalbox";

// styles
import theme from "../../themes/base-theme";

/**
 * Modal used to show The result of a cognitive session.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible.
 * @param {boolean} showSessionresultModal show or hide the modal
 * @param {function} onBoxDetailsDone called after a successful
 */
export default class SessionResultModal extends Component {
    
    constructor(props) {
        super(props);
        this.onConfirmPressDebounce = debounce(this.onConfirmPress, 1000, {leading: true, trailing: false});    
    }

    onConfirmPress = () => {
        navigateToCognitiveEnhancementScreen(this.props.navigation)
    }

    render() {
        let endTarget = (this.props.sessionResults.target_completed_exercise_trees_count === this.props.sessionResults.target_exercise_trees_count)
        let endTitle = (endTarget) ? I18n.t("end_target") : I18n.t("end_test")
        return (
            <Modal
                position={'center'} 
                style={styles.modal}
                backdropPressToClose={true}
                swipeToClose={false}
                backButtonClose={true}
                visible={this.props.visible}
                isOpen={this.props.isOpen}
                coverScreen={true}
                onClosed={this.props.closeModal}>
                <Content style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalTitle}>
                            <Text style={styles.infoText}>{endTitle}</Text>
                        </View>
                        <View style={styles.detailContainer}>
                            <Text style={styles.infoText}>{I18n.t("box")} {this.props.sessionResults.box_name || null}</Text>
                            <Text style={styles.infoText}>{I18n.t("target")} {this.props.sessionResults.target_name || null}</Text>  
                            <Text style={styles.infoText}>{I18n.t("test")} {this.props.sessionResults.exercise_tree_name || null}</Text>  
                        </View>
                        <View style={styles.detailContainer}>
                            <Text style={styles.reportText}>{I18n.t("correct_answers")} {this.props.sessionResults.correct_answers}</Text>
                            <Text style={styles.reportText}>{I18n.t("wrong_answers")} {this.props.sessionResults.wrong_answers}</Text>  
                        </View>

                        <SessionResult  correctAnswers={(endTarget) ? this.props.sessionResults.target_exercise_trees_count : this.props.sessionResults.correct_answers}
                                        wrongAnswers={(endTarget) ? 0 : this.props.sessionResults.wrong_answers}
                                        endTarget={endTarget}
                        />
                        <Button full transparent dark style={styles.confirmButton} onPress={this.onConfirmPressDebounce}>
                            <Text>{I18n.t("ok")}</Text>
                        </Button>
                    </View>
                </Content>
            </Modal>
        );
    }
}

function SessionResult(props) {
    let resultText = (props.wrongAnswers === 0) ? I18n.t("ok_message") : I18n.t("not_ok_message");
    if(props.wrongAnswers > 0)
        return(
            <View style={styles.detailContainer}>
                <Text style={styles.infoText}>
                    {resultText}
                </Text>
            </View>
        );
    else
        return(
            <View style={[styles.detailContainer, {paddingTop: 10}]}>
                <Text style={styles.smallText}>
                    {(props.endTarget) ? I18n.t("target_repetition") : I18n.t("test_repetition")}
                </Text>
                <Text style={styles.reportText}>
                    {(props.endTarget) ? I18n.t("ok_message_target") : resultText}
                </Text>
                <StepProgressBar completed={props.correctAnswers} notCompleted={props.wrongAnswers} />
            </View>
        );
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: "transparent",
    },
    modalContainer : {
        marginHorizontal: 20,
        marginTop: 50,
        backgroundColor: "transparent",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#424242'
    },
    modalTitle: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center'
    },
    smallText: {
        color: "black",
        fontSize: theme.fontSizeBase - 2,
    },
    infoText: {
        color: "black",
        fontSize: theme.fontSizeBase,
    },
    reportText: {
        color: "black",
        fontSize: theme.fontSizeBase + 2,
        fontWeight: 'bold'
    },
    detailContainer: {
        marginBottom: 20,
        paddingHorizontal: 25
    },
    confirmButton: {
        marginTop: 20,
        borderTopWidth: 2,
        borderTopColor: '#424242'
    }
});
