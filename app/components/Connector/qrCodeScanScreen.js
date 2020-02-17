import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

// component
import I18n from '../../i18n/i18n';
import AirettSimpleHeader from "../../utils/airettSimpleHeader";

// third party
import { Title, Button, Text, Item, Label, Input } from 'native-base';
import QRCodeScanner from 'react-native-qrcode-scanner';
import debounce from "lodash/debounce";// Prevent double clicks

// actions

// styles
import theme, { baseStyles } from '../../themes/base-theme'

/** Screen used to scan a QRCode */
class QRCodeScanScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            localip:"",
            port: "3001",
            checkAndroid6Permissions: ( Platform.OS == "android" && Platform.Version >= 23),
        };

        this.onQRCodeReadDebounce = debounce(this.onQRCodeRead, 1000, {leading: true, trailing: false});
    }

    componentDidMount() {
        if( Platform.OS == "android" && Platform.Version >= 23){
            // For Android 6+ we check the permission after the screen transition is ended
            // Hide the QRCodeScanner component while mounting the component
            setTimeout(
                () => this.setState({checkAndroid6Permissions: false}),
                400);
        }
    }

    /** Send the QRCode result to the screen that showed this screen */
    onQRCodeRead = (event) => {
        console.log(event);
        if( event && event.data ){
            // Close this screen and send the retrived code
            if(this.props.navigation.state.params.onQRCodeRead){
                    this.props.navigation.state.params.onQRCodeRead(event.data);
                    
            }
            // this.props.navigation.goBack();
        }

    }

    render(){
        // Use QR Code scan to find Desktop url
        return (
            <View style={baseStyles.fullPage} >
                <AirettSimpleHeader title={I18n.t("readerQRCode")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={() => this.props.navigation.goBack()}  />
                <View style={[baseStyles.signInStepContainer,{padding: 0}]}>
                    {!this.state.checkAndroid6Permissions ?
                        <QRCodeScanner
                            cameraType={"back"}
                            onRead={this.onQRCodeReadDebounce}
                            reactivateTimeout={3000}
                            checkAndroid6Permissions={ Platform.OS == "android" && Platform.Version >= 23}
                            showMarker={true}
                            customMarker={<QrCodeMask/>}
                            containerStyle={{flex: 1, margin: 0, padding: 0}}
                            cameraStyle={{flex: 1, margin: 0, padding: 0}}
                            />
                    : null }
                    <ServerConnection
                        hide={true}
                        ipValue={this.state.localip}
                        onChangeIPText={(newIP)=> this.setState({localip:newIP})}
                        portValue={this.state.port}
                        onChangePortText={(newPort)=> this.setState({port:newPort})}
                        onConnectPress={() => this.onQRCodeReadDebounce({data: `${this.state.localip}:${this.state.port}`})}
                        />
                </View>
            </View>
        );
    }
}

// Draws the mask the user uses to scan the qrCode.
function QrCodeMask(props){
    return(
        <View style={styles.maskContainer}>
            <View style={styles.maskContainerTop} />
            <View style={{flexDirection: 'row'}}>
                <View style={styles.maskContainerSide} />
                <View style={styles.maskContainerViewZone}>
                    <View style={[styles.squareAngleHorizontal,{top: 0, left: 0}]} />
                    <View style={[styles.squareAngleHorizontal,{top: 0, right: 0}]} />
                    <View style={[styles.squareAngleHorizontal,{bottom: 0, left: 0}]} />
                    <View style={[styles.squareAngleHorizontal,{bottom: 0, right: 0}]} />
                    <View style={[styles.squareAngleVertical,{top: 0, left: 0}]} />
                    <View style={[styles.squareAngleVertical,{top: 0, right: 0}]} />
                    <View style={[styles.squareAngleVertical,{bottom: 0, left: 0}]} />
                    <View style={[styles.squareAngleVertical,{bottom: 0, right: 0}]} />
                </View>
                <View style={styles.maskContainerSide} />
            </View>
            <View style={styles.maskContainerBottom} />
        </View>
    );
}

/** Fields to set the server IP and connect the Websocket */
function ServerConnection( props ){
    if(props.hide){return null;}
    const height = 36;
    return (
        <View style={styles.sectionContainer}>
            <Label style={styles.sectionLabel}>
                {I18n.t("computerip")}</Label>
            <View style={{height: height, flexDirection: "row", marginBottom: 12}} >
                <Item floatingLabel style={{flex: 4, marginRight: 6}}>
                    <Label style={{color: "lightgray"}}>{I18n.t("ip")}</Label>
                    <Input underline style={[baseStyles.signInStepText, {textAlign: "left"}]}
                        keyboardType = 'numeric'
                        onChangeText = {props.onChangeIPText}
                        value = {props.ipValue}/>
                </Item>
                <Item floatingLabel style={{flex: 1}}>
                    <Label style={{color: "lightgray"}}>{I18n.t("port")}</Label>
                    <Input underline style={[baseStyles.signInStepText, {textAlign: "left"}]}
                        keyboardType = 'numeric'
                        onChangeText = {props.onChangePortText}
                        value = {props.portValue} />
                </Item>
            </View>
            <Button bordered block light onPress={props.onConnectPress}>
                <Text>{I18n.t("connect")}</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        height: 160,
        marginVertical: 12,
    },
    sectionLabel: {
        fontWeight:'bold',
        fontSize:15,
        color: "white",
    },
    maskContainer: {
        position: 'absolute',
        left:0,
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: 'column'
    },
    maskContainerTop: {
        height: '15%',
        top: 0,
        backgroundColor: "#000000DA"
    },
    maskContainerSide: {
        width: '5%',
        backgroundColor: "#000000DA"
    },
    maskContainerViewZone: {
        position: 'relative',
        width: '90%',
        aspectRatio: 1,
        backgroundColor: 'transparent'
    },
    maskContainerBottom: {
        flex: 1,
        backgroundColor: "#000000DA"
    },
    squareAngleHorizontal: {
        position: 'absolute',
        width: 25,
        height: 4,
        backgroundColor: theme.brandPrimary,
    },
    squareAngleVertical: {
        position: 'absolute',
        width: 4,
        height: 25,
        backgroundColor: theme.brandPrimary,
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
        setServerUrl: (url) => {dispatch(setServerUrl(url))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(QRCodeScanScreen);