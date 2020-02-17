import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, Button, H3, Text } from 'native-base';


// components
import I18n from '../../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to notify that authenticationReducer.currentPatient is not defined
 * Allows to open the page to select a patient
 */
export default function MissingPatientModal(props) {

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
                        <H3 style={{marginBottom: 20,}} numberOfLines={2}>{I18n.t("error.card.create")}</H3>
                    
                        <Text style={{marginVertical: 2}} numberOfLines={5}>{I18n.t("error.patient.missing")}</Text>
                        
                    </View>

                    <Button transparent primary 
                        style={styles.modalButtonsContainer}
                        onPress={() => {props.closeModal();props.navigation.navigate("PatientSelection");}}>
                        <Text>{I18n.t("patient.select")}</Text>
                    </Button>
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
        margin: 8,
        alignSelf: "flex-end",
    },
});