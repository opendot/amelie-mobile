import React from 'react';
import { StyleSheet } from 'react-native';

// third party
import { Header, Icon, Left, Right, Button, Text, Body } from 'native-base';

// styles
import theme from "../themes/base-theme";

/** Simple Header of the page */
export default function AirettSimpleHeader(props){
    return (
        <Header hasTabs={props.hasTabs} >
            {props.leftIconName ?
            <Left style={{flex:1}}>
                <Button
                    transparent
                    onPress={props.onLeftButtonPress}>
                    <Icon name={props.leftIconName} style={styles.iconStyle}/>
                </Button>
            </Left>
            : <Left/> }
            <Body style={{flex: 3}}><Text style={styles.textStyle}> {props.title} </Text></Body>
            {props.rightIconName ?
                <Right style={{flex:1}}>
                    <Button 
                        transparent
                        onPress={props.onRightButtonPress}>
                        <Icon name={props.rightIconName} style={styles.iconStyle}/>

                    </Button>
                </Right>
            : <Right />}
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