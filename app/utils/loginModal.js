import React, {Component} from 'react';
import { StyleSheet, Platform, Keyboard } from 'react-native';
import { Content, Card, Button, Text, Item, Label, Input } from 'native-base';
import { connect } from 'react-redux';
import {debounce} from 'lodash'; // Prevent double clicks

// components
import I18n from '../i18n/i18n';

// third party
import Modal from "react-native-modalbox";

// actions
import { closeLoginModal } from "../actions/ModalAction";
import { authenticateUser } from "../actions/AuthenticationActions";

// styles
import theme, { baseStyles } from '../themes/base-theme'

/**
 * Modal used to show an login dialog.
 * It's inserted in the Root component, and any screen in the app
 * can make this visible.
 * @param {boolean} showLoginModal show or hide the modal
 * @param {function} onLoginDone called after a successful login
 */
class LoginModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            loading: false
        }

        this.onSigninPressDebounce = debounce(this.onSigninPress, 2000, {leading: true, trailing: false});
    }

    // Try to login
    onSigninPress = () => {
        this.setState({loading: true}, () => {
            this.props.authenticateUser( this.state.email, this.state.password,
                ( loginCredentials) => {
                    this.setState({loading: false});
                    // console.log("onSigninPress loginCredentials", loginCredentials)
                    if( loginCredentials ){
                        Keyboard.dismiss();
                        this.props.closeLoginModal();
                        if (this.props.onLoginDone) {
                            this.props.onLoginDone();
                        }
                    }
                });
        });
    }

    focusPasswordInput = () => {
        this._passwordInput._root.focus();
    }

    render() {
        return (
            <Modal
                style={styles.modal}
                backdropPressToClose={true}
                swipeToClose={false}
                backButtonClose={true}
                visible={this.props.showLoginModal}
                isOpen={this.props.showLoginModal}
                coverScreen={true}
                onClosed={this.props.closeLoginModal}>
                <Content style={styles.modalContainer}>
                    <Card style = {{backgroundColor: theme.tabDefaultBg}}>
                        <Text style={[baseStyles.signInStepText, styles.text, {color: theme.topTabBarTextColor}]} >{I18n.t("doSignin")}</Text>

                        <Item floatingLabel style={[styles.inputField, {marginBottom: 12}]} >
                            <Label style={labelStyle} >{I18n.t("email")}</Label>
                            <Input style={{color: theme.topTabBarTextColor}}
                                keyboardType = 'email-address'
                                autoCapitalize = "none"
                                onChangeText = {(newEmail) => this.setState({email: newEmail})}
                                onSubmitEditing={this.focusPasswordInput}
                                value = {this.state.email}/>
                        </Item>
                        <Item floatingLabel style={[styles.inputField, {marginBottom: 12}]} >
                            <Label style={labelStyle} >{I18n.t("password")}</Label>
                            <Input  style={{color: theme.topTabBarTextColor}}
                                getRef={component => this._passwordInput=component}
                                secureTextEntry={true}
                                keyboardType = 'default'
                                autoCapitalize = "none"
                                onChangeText = {(newPassword) => this.setState({password: newPassword})}
                                onSubmitEditing={this.onSigninPressDebounce}
                                value = {this.state.password} />
                        </Item>

                        <Button bordered block light={Platform.OS == "android"} dark={Platform.OS == "ios"} onPress={this.onSigninPressDebounce} style={styles.button}>
                            <Text>{I18n.t("signin")}</Text>
                        </Button>

                    </Card>
                </Content>
            </Modal>
        );
    }
}

const labelStyle = {
    color: "lightgray",
};

const styles = StyleSheet.create({
    
    modal: {
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

    text: {
        marginVertical: 36,
    },
    textInput: {
        color: "white",
    },
    inputField: {
      marginLeft: 40,
      marginRight: 40
    },
    button: {
      marginLeft: 25,
      marginRight: 25,
      marginTop: 60,
      marginBottom: 40 
    }
});

function mapStateToProps (state) {
  return {
      showLoginModal: state.modalReducer.showLoginModal,
      onLoginDone: state.modalReducer.onLoginDone
  }   
}

function mapDispatchToProps(dispatch) {
  return {
      closeLoginModal: () => dispatch(closeLoginModal()),
      authenticateUser: (email, password, callback) => {dispatch(authenticateUser(email, password, null, true, callback))},
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);