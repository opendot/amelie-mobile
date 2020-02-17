import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, H3, Spinner, Text } from 'native-base';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to show a loading and prevent user from clicking anything.
 * This modal can't be closed by the user.
 */
export default function LoadingModal(props) {

    if(!props.visible){return null;}
    return (
        <Modal
            style={styles.modal}
            backdropPressToClose={false}
            swipeToClose={false}
            backButtonClose={false}
            visible={props.visible}
            isOpen={props.isOpen}
            coverScreen={true}
            onClosed={props.closeModal}>
            <Content style={styles.modalContainer}>
                <Card>
                    <View style={styles.modalContentContainer}>
                        {props.title ? <H3 style={{marginBottom: 20,}} numberOfLines={2}>{props.title}</H3> : null}
                        <Spinner />
                        {props.text ? <Text style={{marginVertical: 2}} numberOfLines={5}>{props.text}</Text> : null}
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
        margin: 8,
        alignSelf: "flex-end",
    },
});