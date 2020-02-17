import React, {Component} from 'react';
import { View, StyleSheet } from 'react-native';
import { Content, Card, H3, Text, Spinner } from 'native-base';
import { connect } from 'react-redux';

// third party
import Modal from "react-native-modalbox";

/**
 * Modal used to show an loading dialog.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible.
 * @param {boolean} showLoadingModal show or hide the modal
 */
class SyncModal extends Component {

    render() {
        return (
            <Modal
                style={styles.modal}
                backdropPressToClose={false}
                swipeToClose={false}
                backButtonClose={false}
                visible={this.props.showLoadingModal}
                isOpen={this.props.showLoadingModal}
                coverScreen={true}>
                <Content style={styles.modalContainer}>
                    <Card>
                        <View style={styles.modalContentContainer}>
                            {this.props.title ? <H3 style={{marginBottom: 20,}} numberOfLines={2}>{this.props.title}</H3> : null}
                            <Spinner />
                            {this.props.text ? <Text style={{marginVertical: 2}} numberOfLines={5}>{this.props.text}</Text> : null}
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

  modalButtonsContainer: {
      margin: 8,
      alignSelf: "flex-end",
  },
});

function mapStateToProps (state) {
  return {
      showLoadingModal: state.modalReducer.showLoadingModal,
      modalTitle: state.modalReducer.loadingTitle,
      modalText: state.modalReducer.loadingText
  }   
}

export default connect(mapStateToProps, null)(SyncModal);