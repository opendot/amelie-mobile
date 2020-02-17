import React from 'react';
import { View, StyleSheet} from 'react-native';

// third party
import { Icon, Button, Body } from 'native-base';
import debounce from "lodash/debounce";// Prevent double clicks

// styles
import { baseStyles } from '../themes/base-theme'

/** A simple row with 2 buttons to confirm or undo */
export default class SimpleButtonsRow extends React.Component{

    constructor( props ){
        super( props );

        this.state = {
            onConfirmPressedFunction: props.debounceOpen && props.onConfirmPressed ? debounce( props.onConfirmPressed, 1000, {leading: true, trailing: false}) : props.onConfirmPressed,
            onClosePressedFunction: props.debounceClose && props.onClosePressed ? debounce( props.onClosePressed, 1000, {leading: true, trailing: false}) : props.onClosePressed,
        };
    }

    render(){
        if( this.props.hide){
            return null;
        }
        return (
            <View style={baseStyles.buttonRow}>
                <Button block
                    disabled={this.props.confirmDisabled}
                    style={styles.button}
                    onPress={this.state.onConfirmPressedFunction}
                >
                    <Body><Icon name={"ios-checkmark"} style={[baseStyles.buttonIcon, {opacity: this.props.confirmDisabled ? 0.2 : 1}]} /></Body>
                </Button>

                <Button block
                    disabled={this.props.closeDisabled}
                    style={styles.button}
                    onPress={this.state.onClosePressedFunction}
                >
                    <Body><Icon name={"ios-close"} style={[baseStyles.buttonIcon, {opacity: this.props.closeDisabled ? 0.2 : 1}]} /></Body>
                </Button>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        marginHorizontal: 12,
        backgroundColor: "white",
    }
});