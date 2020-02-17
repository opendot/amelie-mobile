import React, {Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, Button, H3, Text } from 'native-base';
import { connect } from 'react-redux';

// components
import I18n from '../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

// actions
import { closeErrorModal, resetErrorModal } from "../actions/ModalAction";

/**
 * Modal used to show an error message.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible with a custom test to notify the user
 * about a generic error, by setting some properties in the redux store.
 * The graphic is created by following the Material Design guidelines.
 * @param {boolean} showErrorModal show or hide the modal
 * @param {string} errorText the text of the modal
 * @param {string} errorTitle optional, the title of the modal,
 *      use title bar alerts only for high-risk situations,
 *      such as the potential loss of connectivity. Users should be able 
 *      to understand the choices based on the title and button text alone
 */
class ErrorModal extends Component {

    render() {
        return (
            <Modal
                style={styles.modal}
                backdropPressToClose={true}
                swipeToClose={false}
                backButtonClose={true}
                visible={this.props.showErrorModal}
                isOpen={this.props.showErrorModal}
                coverScreen={true}
                onClosed={this.props.resetErrorModal}>
                <Content style={styles.modalContainer}>
                    <Card>
                        <View style={styles.modalContentContainer}>
                            {this.props.errorTitle ? <H3 style={{marginBottom: 20,}} numberOfLines={2}>{this.props.errorTitle}</H3> : null}
                        
                            <Text style={{marginVertical: 2}} numberOfLines={5}>{this.props.errorText}</Text>
                            
                        </View>

                        <Button block primary 
                            style={styles.modalButtonsContainer}
                            onPress={this.props.closeErrorModal}>
                            <Text>{I18n.t("ok")}</Text>
                        </Button>
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

    modalButtonsContainer: {
        margin: 8,
    },
});

function mapStateToProps (state) {
    return {
        showErrorModal: state.modalReducer.showErrorModal,
        errorTitle: state.modalReducer.errorTitle,
        errorText: state.modalReducer.errorText,
    }   
}

function mapDispatchToProps(dispatch) {
    return {
        closeErrorModal: () => dispatch(closeErrorModal()),
        resetErrorModal: () => dispatch(resetErrorModal()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal);