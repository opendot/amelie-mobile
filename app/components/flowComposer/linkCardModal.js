import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, Button, H3, Text, Icon } from 'native-base';

// components
import I18n from '../../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to select to what a card is linked.
 * A card can be linked at only 1 page, a page can be linked with only 1 card
 */
export default function LinkCardModal(props) {
    if( !props.link){ return null;}

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
                        <H3 style={{marginBottom: 20,}} numberOfLines={2}>{I18n.t("card.createLink")}</H3>

                        <ButtonRow text={I18n.t("page.create")}
                            hide={props.link.originCard && props.link.originCard.next_page_id != null}
                            icon={"md-image"}
                            onPress={props.onLinkNewPage ? 
                                () => {props.onLinkNewPage();}
                                : null}
                            />
                        <ButtonRow text={I18n.t("tree.existing")}
                            hide={props.link.originCard && props.link.originCard.next_page_id != null}
                            icon={"md-folder-open"}
                            onPress={props.navigation && !props.destPage ? 
                                () => {
                                    props.navigation.navigate("TreeSelection", {patient: props.currentPatient, 
                                        onTreeSelected: (selectedTree) => {
                                            // console.log("LinkCardModal selectedTree", selectedTree);
                                            if( props.onLinkTree){
                                                props.onLinkTree(props.link.originPage, props.link.originCard, selectedTree);
                                            }
                                            props.closeModal();
                                        }
                                    });
                                    props.closeModal();
                                }
                                : null}
                            />
                        <ButtonRow text={I18n.t("card.createLink")}
                            hide={props.link.exist || !props.link.destPage}
                            icon={"md-link"}
                            onPress={props.onCreatePress ? 
                                () => props.onCreatePress( props.link.originPage, props.link.originCard, props.link.destPage) 
                                : null}
                            />
                        <ButtonRow text={I18n.t("card.deleteLink")}
                            hide={!props.link.exist}
                            icon={"ios-trash"}
                            onPress={props.onDeletePress && props.link.originCard && props.link.destPage ? 
                                () => props.onDeletePress( props.link.originPage, props.link.originCard, props.link.destPage) 
                                : null}
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
        <Button full transparent dark style={{ justifyContent: "flex-start"}} onPress={props.onPress}>
            <Icon style={{padding: 4}} name={props.icon} />
            <Text style={{marginVertical: 2}} numberOfLines={1}>{props.text}</Text>
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