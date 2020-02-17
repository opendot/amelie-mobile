import React from 'react';
import { StyleSheet, View } from 'react-native';

// third part libraries
import { Footer, FooterTab, Text, Button, Icon } from 'native-base';

// import components
import I18n from '../../i18n/i18n';

// styles
import theme from "../../themes/base-theme";

const footerHeight = 110;

export default function ActivitySelectorFooter(props) {
    return (
        <Footer style={styles.footerStyle}>
            <View style={styles.topLine} />
            <View style={styles.buttonsContainer} >

                {props.isGuest ?
                    null
                    :
                    <View style={styles.buttonsContainer} >
                        <FooterTab>
                            <Button style={styles.verticalContainer} onPress={props.syncFunc}> 
                                <Icon style={styles.iconStyle} name="refresh" />
                                <Text style={styles.textStyle}>{I18n.t("synchronize")}</Text>
                            </Button>
                        </FooterTab>
                        <View style={styles.verticalLine}/>
                    </View>
                }
                <FooterTab>
                    <Button style={styles.verticalContainer} onPress={props.disconnectFunc} >
                        <Icon style={styles.iconStyle} name="md-square" />
                        <Text style={styles.textStyle}>{I18n.t("disconnect")}</Text>
                    </Button>
                </FooterTab>
            </View>
        </Footer>
    );
}

const styles = StyleSheet.create({
    footerStyle: {
        flexDirection: 'column',
        height: footerHeight,
        backgroundColor: theme.brandPrimary
    },
    topLine: {
        height: 1,
        marginHorizontal: 12,
        backgroundColor: "white"
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    verticalContainer: {
        flex: 1,
        flexDirection: "column",
        height: footerHeight - 1,
    },
    verticalLine: {
        width: 1,
        marginVertical: 10,
        backgroundColor: "white",
    },
    textStyle: {
        color: "white",
        fontSize: theme.fontSizeBase
    },
    iconStyle: {
        color: "white",
    }
});