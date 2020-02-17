import React from 'react';
import { StyleSheet } from 'react-native';

// component
import I18n from "../../i18n/i18n";

// third party
import { Header, Icon, Left, Right, Button, Text, Body } from 'native-base';

// styles
import theme from "../../themes/base-theme";

/** Simple Header of the page */
export default function activitySelectorHeader(props){
    return (
        <Header style={{height:theme.toolbarHeight}}>
            <Left>
                <Text style={styles.textStyle}>{I18n.t("app_name")}</Text>
            </Left>
            <Body>
                <Text style={styles.textStyle}></Text>
            </Body>
            <Right>
                <Button
                    transparent
                    onPress={props.navigateToSettings}>
                    <Icon name="settings" style={styles.iconStyle}/>
                </Button>
            </Right>
        </Header>
    );
}

const styles = StyleSheet.create({
    textStyle: {
        color: theme.toolbarTextColor,
        fontSize: theme.fontSizeBase
    },
    iconStyle: {
        color: theme.toolbarTextColor,
    }
});