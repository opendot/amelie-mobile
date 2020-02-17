import React from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { Content, Card, Button, Text } from 'native-base';


// components
import I18n from '../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to ask confirmation before exiting the app
 */
export default function ExitConfirmationModal(props) {
    return (
        <Modal
            style={styles.modal}
            backdropPressToClose={true}
            swipeToClose={false}
            backButtonClose={true}
            visible={props.visible}
            isOpen={props.isOpen}
            coverScreen={true}
            onClosed={props.closeModal}>
            <Content style={styles.modalContainer}>
                <Card>
                    <View style={styles.modalContentContainer}>
                        <Text style={{marginVertical: 2}} numberOfLines={5}>{I18n.t("exit_confirmation")}</Text>
                    </View>

                    <View style={styles.modalButtonsContainer} >
                        <Button transparent style={{marginRight: 8}} onPress={() => {props.closeModal();}} >
                            <Text>{I18n.t("undo").toUpperCase()}</Text>
                        </Button>
                        <Button transparent onPress={() => {
                            if( props.onClosePressed ) {props.onClosePressed();}
                            BackHandler.exitApp();
                        }}
                             >
                            <Text>{I18n.t("exit").toUpperCase()}</Text>
                        </Button>
                        
                    </View>

                </Card>
            </Content>
        </Modal>
    );
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
        flexDirection: "row",
        margin: 8,
        justifyContent: "flex-end"
    },

});