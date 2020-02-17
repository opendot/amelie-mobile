import React from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from '../../i18n/i18n';

// third party
import { Button, Text, Item, Label, Input } from 'native-base';
import {debounce} from 'lodash'; // Prevent double clicks

// actions
import { authenticateUser, signinGuest } from "../../actions/AuthenticationActions";

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/** Fields to set the server IP and connect the Websocket */
class UserAuthenticationScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            email: "",
            password: "",
        };

        this.onSigninPressDebounce = debounce(this.onSigninPress, 1000, {leading: true, trailing: false});
        this.onSigninGuestPressDebounce = debounce(this.onSigninGuestPress, 1000, {leading: true, trailing: false});
    }

    // Try to login
    onSigninPress = () => {
        this.setState({loading: true}, () => {
            this.props.authenticateUser( this.state.email, this.state.password,
                ( loginCredentials) => {
                    this.setState({loading: false});
                    // console.log("onSigninPress loginCredentials", loginCredentials)
                    if( loginCredentials){
                        Keyboard.dismiss();
                        this.props.navigation.navigate("PatientSelectionScreen");
                    }
                });
        });
    }

    /** Login as guest */
    onSigninGuestPress = () => {
        this.setState({loading: true}, () => {
            this.props.signinGuest(
                ( patient) => {
                    // console.log("onSigninGuestPress patient", patient)
                    if( patient){
                        Keyboard.dismiss();
                        // Close this page and go to the MainScreen
                        if( this.props.screenProps && this.props.screenProps.onSigninComplete){
                            // I'm in the login phase
                            this.props.screenProps.onSigninComplete();
                        }
                        else {
                            navigateToMainScreen(this.props.navigation);
                        }
                    }
                });
        });
    }

    focusPasswordInput = () => {
      this._passwordInput._root.focus();
    }

    render(){
        return (
            <View style={baseStyles.signInStepContainer}>
                <Text style={[baseStyles.signInStepText, styles.text]} >{I18n.t("doSignin")}</Text>

                <Item floatingLabel style={[styles.inputField, {marginBottom: 12}]} >
                    <Label style={labelStyle} >{I18n.t("email")}</Label>
                    <Input style={styles.textInput}
                        keyboardType = 'email-address'
                        autoCapitalize = "none"
                        onFocus = {this.props.screenProps.hideFooter}
                        onBlur = {this.props.screenProps.showFooter}
                        onChangeText = {(newEmail) => this.setState({email: newEmail})}
                        onSubmitEditing={this.focusPasswordInput}
                        value = {this.state.email}/>
                </Item>
                <Item floatingLabel style={[styles.inputField, {marginBottom: 12}]} >
                    <Label style={labelStyle} >{I18n.t("password")}</Label>
                    <Input  style={styles.textInput}
                        getRef={component => this._passwordInput=component}
                        secureTextEntry={true}
                        keyboardType = 'default'
                        autoCapitalize = "none"
                        onFocus = {this.props.screenProps.hideFooter}
                        onBlur = {this.props.screenProps.showFooter}
                        onChangeText = {(newPassword) => this.setState({password: newPassword})}
                        onSubmitEditing={this.onSigninPressDebounce}
                        value = {this.state.password} />
                </Item>

                <Button bordered block light onPress={this.onSigninPressDebounce} style={styles.button}>
                    <Text>{I18n.t("signin")}</Text>
                </Button>
                <Text style={styles.textInput}>{I18n.t("or")}</Text>
                <Button bordered block light onPress={this.onSigninGuestPressDebounce} style={styles.button}>
                    <Text>{I18n.t("signin_no_account")}</Text>
                </Button>
            </View>
        );
    }
}

// This must be a separate object, it can't be inserted into Stylesheet
const labelStyle = {
    color: "lightgray",
};

const styles = StyleSheet.create({
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
      marginVertical: 30
    }
});

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        ip: state.webSocketReducer.ip
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        authenticateUser: (email, password, callback) => {dispatch(authenticateUser(email, password, null, false, callback))},
        signinGuest: (callback) => {dispatch(signinGuest(callback))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAuthenticationScreen);