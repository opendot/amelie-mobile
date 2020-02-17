import React, {Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Button, Text } from 'native-base';
import { connect } from 'react-redux';
import { debounce } from 'lodash'; // Prevent double clicks

// components
import I18n from '../../i18n/i18n';
import StepProgressBar from "../../utils/stepProgressBar";

// third party
import Modal from "react-native-modalbox";

// actions
import { startTrainingSession } from "../../actions/SessionActions";

// styles
import theme from "../../themes/base-theme";


/**
 * Modal used to show an Box Details dialog.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible.
 * @param {boolean} showBoxDetailsModal show or hide the modal
 * @param {function} onBoxDetailsDone called after a successful
 */
class BoxDetailsModal extends Component {
    constructor(props) {
        super(props);

        this.onNewSessionPressDebounce = debounce(this.onNewSessionPress, 2000, {leading: true, trailing: false});
        this.onCloseModalDebounce = debounce(this.props.closeModal, 100, {leading: true, trailing: false});    
    }

    onNewSessionPress = () => {
        
        this.props.startTrainingSession('cognitive_sessions', {id: this.props.box.current_exercise_tree_id},
            // Callback
            (response) => {
                //console.log("BoxDetailsModal.startCognitiveSession response", response)
                //TODO control on response
                this.props.closeModal();
                // Open cognitive session liveView
                setTimeout(() => this.props.navigation.navigate("CognitiveSessionMonitor",  {box: this.props.box}), 200);
            }
        ) 
    }

    render() {
        let repetitionValue = ""
        switch(this.props.box.current_exercise_tree_conclusions_count) {
            case 0: repetitionValue = I18n.t("first_time"); break;
            case 1: repetitionValue = I18n.t("second_time"); break;
            case 2: repetitionValue = I18n.t("third_time"); break;
            default: break;
        }
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
                            <Text style={styles.titleText}>{I18n.t("box_name")} {this.props.box.box_name}</Text>
                        </View>

                        <BoxDetail label={I18n.t("actual_target")} value={this.props.box.current_target_name} 
                                    completed={this.props.box.current_target_position} 
                                    count={this.props.box.targets_count} />
                        <BoxDetail label={I18n.t("actual_test")}
                                    value={this.props.box.current_exercise_tree_name}
                                    completed={this.props.box.target_exercise_tree_position}
                                    count={this.props.box.target_exercise_trees_count} />
                        <BoxDetail label={I18n.t("test_repetition")}
                                    value={repetitionValue}
                                    completed={this.props.box.current_exercise_tree_conclusions_count}
                                    count={this.props.box.current_exercise_tree_consecutive_conclusions_required} />

                        <View style={{height: 20}} />

                        <Button full transparent dark style={{borderTopWidth: 2, borderTopColor: '#424242'}} onPress={this.onNewSessionPressDebounce}>
                            <Text>{I18n.t("cognitive_session_confirm")}</Text>
                        </Button>
                        <Button full transparent dark style={{borderTopWidth: 2, borderTopColor: '#424242'}} onPress={this.onCloseModalDebounce}>
                            <Text>{I18n.t("undo")}</Text>
                        </Button>
                    </View>
                </Content>
            </Modal>
        );
    }
}

function BoxDetail(props) {
    return(
        <View style={styles.detailContainer}>
            <Text style={styles.labelText}>{props.label}</Text>
            <Text style={styles.valueText}>{`${props.value} (${props.completed} / ${props.count})`}</Text>
            <StepProgressBar completed={props.completed} notCompleted={props.count - props.completed} />
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
    titleText: {
        fontSize: theme.fontSizeBase,
    },
    labelText: {
        fontSize: theme.fontSizeBase - 2,
    },
    valueText: {
        fontSize: theme.fontSizeBase + 1,
        fontWeight: 'bold'
    },
    detailContainer: {
        marginBottom: 20,
        paddingHorizontal: 25
    },
    progressBar: {
        flexDirection: 'row',
        height: 10,
        borderWidth: 0.5,
        borderColor: "black",
        marginTop: 10
    }
});

function mapDispatchToProps(dispatch) {
  return {
      startTrainingSession: (type, tree, callback) => {dispatch(startTrainingSession(type, tree, callback))},
  }
}
export default connect(null, mapDispatchToProps)(BoxDetailsModal);