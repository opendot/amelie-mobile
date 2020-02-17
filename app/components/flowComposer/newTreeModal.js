import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, Icon, Button, H3, Text } from 'native-base';

// components
import I18n from '../../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to create a new tree or import an existing tree
 */
export default function NewTreedModal(props) {
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
                        <H3 style={{marginBottom: 20,}} numberOfLines={2}>{I18n.t("insert")}...</H3>
                    
                        <ButtonRow text={I18n.t("page.create")}
                            icon={"md-image"}
                            onPress={() => {props.navigation.navigate("Compose"); props.closeModal();}}
                            />
                        <ButtonRow text={I18n.t("tree.existing")}
                            icon={"md-folder-open"}
                            onPress={() => {props.navigation.navigate("UserLibrary", {patient: props.currentPatient}); props.closeModal();}}
                            />
                        
                    </View>

                </Card>
            </Content>
        </Modal>
    );
}

function ButtonRow( props ){
    if( props.hide){ return null;}
    return (
        <Button full transparent dark style={{justifyContent: "flex-start"}} onPress={props.onPress}>
            <Icon style={{padding: 4}} name={props.icon} />
            <Text numberOfLines={1}>{props.text}</Text>
        </Button>
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