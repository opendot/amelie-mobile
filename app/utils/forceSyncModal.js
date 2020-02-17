import React, {Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, Button, H3, Text } from 'native-base';
import { connect } from 'react-redux';

// components
import I18n from '../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

// actions
import { closeForceSyncModal } from "../actions/ModalAction";

/**
 * Modal used to force user to synchronize.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible.
 * The graphic is created by following the Material Design guidelines.
 * @param {boolean} showSynchModal show or hide the modal
 * @param {Function} onSyncPress function called when the button for synch is pressed
 */
class ForceSyncModal extends Component {

    render() {
        return (
            <Modal
                style={styles.modal}
                backdropPressToClose={false}
                swipeToClose={false}
                backButtonClose={false}
                visible={this.props.showForceSyncModal}
                isOpen={this.props.showForceSyncModal}
                coverScreen={true}
                onClosed={this.props.closeForceSyncModal}>
                <Content style={styles.modalContainer}>
                    <Card>
                        <View style={styles.modalContentContainer}>
                            <H3 style={{marginBottom: 20,}} numberOfLines={2}>{this.props.forceSyncTitle || I18n.t("error.synchRequired.title")}</H3>
                        
                            <Text style={{marginVertical: 2}} numberOfLines={5}>{this.props.forceSyncText || I18n.t("error.synchRequired.text")}</Text>
                            
                        </View>

                        <View style={styles.modalButtonsContentContainer}>
                            <Button transparent primary 
                                style={styles.modalButtonsContainer}
                                onPress={this.props.onSyncPress}>
                                <Text uppercase>{I18n.t("synchronize")}</Text>
                            </Button>
                        </View>
                    </Card>
                </Content>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    
    modal: {
        maxHeight: 400,
        backgroundColor: "transparent",
    },

    modalContainer : {
        margin: 40,
        backgroundColor: "transparent",
    },

    modalContentContainer: {
        margin: 24,
    },

    modalButtonsContentContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    modalButtonsContainer: {
        margin: 8,
    },
});

function mapStateToProps (state) {
    return {
        showForceSyncModal: state.modalReducer.showForceSyncModal,
        forceSyncTitle: state.modalReducer.forceSyncTitle,
        forceSyncText: state.modalReducer.forceSyncText,
        onSyncPress: state.modalReducer.onSyncPress,
    }   
}

function mapDispatchToProps(dispatch) {
    return {
        closeForceSyncModal: () => dispatch(closeForceSyncModal()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ForceSyncModal);