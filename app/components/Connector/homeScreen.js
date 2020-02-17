import React from 'react';
import { View, StyleSheet, Animated, Easing, Keyboard } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from '../../i18n/i18n';
import ServerConnectionScreen from "./serverConnectionScreen";
import QRCodeScanScreen from "./qrCodeScanScreen";
import UserAuthenticationScreen from "./userAuthenticationScreen";
import PatientSelectionScreen from "../PatientSelectionScreen/patientSelectionScreen";
import ProgressBar from '../../utils/progressBar';

// third party
import { StackNavigator } from 'react-navigation';
import { Container, Content, Button, Text, Item, Label, Input, Footer } from 'native-base';

// actions
import { setServerUrl } from "../../actions/AuthenticationActions";
import { navigateToMainScreen } from "../../utils/utils";

// styles
import theme from '../../themes/base-theme'

class HomeScreen extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        header: null,
    });

    constructor(props) {
        super(props);
        this.state={
            currentRoute: "ServerConnectionScreen",
            keyboardVisible: false
        }
    }

    // Keyboard management
    componentWillMount () {
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._showFooter);
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._hideFooter);
    }

    componentWillUnmount () {
      this.keyboardDidHideListener.remove();
      this.keyboardDidShowListener.remove();
    }

    _hideFooter = () => {
      this.setState({keyboardVisible: true});
    }
  
    _showFooter = () => {
      this.setState({keyboardVisible: false});
    }

    /** Set ip and port for connect to server and websocket */
    connectToServer = () => {
        // Save server url
        this.props.setServerUrl(`http://${this.state.localip}:${this.state.port}`);
    }

    /** When all datas are sets go to main screen */
    onSigninComplete = () => {
        // console.log("HomeScreen onSigninComplete", this.props);
        navigateToMainScreen(this.props.navigation);
    }

    _getCurrentRouteName(navState) {
        this.setState({currentRoute: navState.routes[navState.routes.length - 1].routeName})
    }

    render() {
        let progress = 10;
        switch(this.state.currentRoute){
            case "UserAuthenticationScreen":
                progress = 50;
            break;

            case "PatientSelectionScreen":
                progress = 90;
            break;
        }
        return (
            <Container theme={theme}>
                <Content contentContainerStyle={styles.mainContainer}>
                    <SigninNavigator screenProps={{onSigninComplete: this.onSigninComplete, showFooter: this._showFooter, hideFooter: this._hideFooter, currentRoute: this.state.currentRoute}} onNavigationStateChange={(prevState, newState) => {
                        this._getCurrentRouteName(newState)
                    }}/>

                </Content>
                {this.state.currentRoute !== "QRCodeScanScreen" && !this.state.keyboardVisible?
                    <Footer style={{backgroundColor: "gray"}}>
                        <View style={{flex: 1}}>
                        <ProgressBar 
                            backgroundStyle={{backgroundColor: 'black'}}
                            progress={progress}
                        />
                        </View>
                    </Footer>
                :null}
            </Container>
        );
    }
}

/** A small navigator used only for Signin. This screens are unreachable from other part of the app */
const SigninNavigator = StackNavigator(
    {
        ServerConnectionScreen: { screen: ServerConnectionScreen },
        UserAuthenticationScreen: { screen: UserAuthenticationScreen },
        PatientSelectionScreen: { screen: PatientSelectionScreen },
        // ServerSynchroScreen: { screen: ServerSynchroScreen },
        QRCodeScanScreen: { screen: QRCodeScanScreen},
    },
    {
      headerMode: 'none',
      mode: 'modal',
      navigationOptions: {
        gesturesEnabled: false,
      },
      transitionConfig: () => ({
        transitionSpec: {
            duration: 300,
            easing: Easing.out(Easing.poly(4)),
            timing: Animated.timing,
        },
        screenInterpolator: sceneProps => {
            const { layout, position, scene } = sceneProps;
            const { index } = scene;

            // Enter the new screen from right to left
            const width = layout.initWidth;
            const translateX = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [width, 0, 0],
            });
    
            const opacity = position.interpolate({
                inputRange: [index - 1, index - 0.99, index],
                outputRange: [0, 1, 1],
            });
    
            return { opacity, transform: [{ translateX }] };
        },
      }),
    }
);

/** Fields to set the server IP and connect the Websocket */
function ServerConnection( props ){
    return (
        <View style={styles.sectionContainer}>
            <Label style={styles.sectionLabel}>
                {I18n.t("computerip")}</Label>
            <View style={{flexDirection: "row", marginBottom: 12}} >
                <Item floatingLabel style={{flex: 4, marginRight: 6}}>
                    <Label>{I18n.t("ip")}</Label>
                    <Input underline
                        keyboardType = 'numeric'
                        onChangeText = {props.onChangeIPText}
                        value = {props.ipValue}/>
                </Item>
                <Item floatingLabel style={{flex: 1}}>
                    <Label>{I18n.t("port")}</Label>
                    <Input underline
                        keyboardType = 'numeric'
                        onChangeText = {props.onChangePortText}
                        value = {props.portValue} />
                </Item>
            </View>
            <Button block onPress={props.onConnectPress}>
                <Text>{I18n.t("connect")}</Text>
            </Button>
        </View>
    );
}

/** Fields used for user Sign In */
function UserAuthentication( props ){
    return (
        <View style={styles.sectionContainer}>
            <Label style={styles.sectionLabel}>
                {I18n.t("user.generic")}</Label>

            <Item floatingLabel disabled={props.disabled} style={{marginBottom: 12}} >
                <Label>{I18n.t("email")}</Label>
                <Input
                    disabled={props.disabled}
                    keyboardType = 'email-address'
                    autoCapitalize = "none"
                    onChangeText = {props.onChangeEmailText}
                    value = {props.emailValue}/>
            </Item>
            <Item floatingLabel disabled={props.disabled} style={{marginBottom: 12}} >
                <Label>{I18n.t("password")}</Label>
                <Input
                    disabled={props.disabled}
                    keyboardType = 'default'
                    autoCapitalize = "none"
                    onChangeText = {props.onChangePasswordText}
                    value = {props.passwordValue} />
            </Item>

            <Button block disabled={props.disabled} onPress={props.onPress}>
                <Text>{I18n.t("signin")}</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "gray",
    },
    sectionContainer: {
        marginVertical: 12,
    },
    sectionLabel: {
        fontWeight:'bold',
        fontSize:15,
    },
});

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        setServerUrl: (url) => {dispatch(setServerUrl(url))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);