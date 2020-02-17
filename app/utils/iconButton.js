import React from 'react';
import { View, StyleSheet } from 'react-native';

// third party
import { Icon, Button, Text } from 'native-base';
import debounce from "lodash/debounce";// Prevent double clicks

/** A simple Button with an Icon and no text */
export default class IconButton extends React.Component {

    constructor( props ){
        super( props );

        this.state = {
            onPressFunction: props.debounce ? debounce( props.onPress, 200, {leading: true, trailing: false}) : props.onPress,
        };
    }

    componentWillReceiveProps(nextProps) {
        // TODO update the state if prop.debounce or props.onPress change
    }

    render() {
        if( this.props.hide ) { return null; }
        return (
            <View style={styles.container}>
                <Button disabled={this.props.disabled}
                    style={styles.iconButton}
                    onPress = {this.state.onPressFunction}
                >
                    <Icon style={{ color: this.props.disabled ? "#aaa" : "#444", fontSize:28}} name={this.props.iconName} />
                </Button>
                <Text numberOfLines={1}>{this.props.label}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 82,
        alignItems: "center",
    },

    iconButton: {
        width: 72,
        justifyContent: "center",
        backgroundColor:"white",
        marginHorizontal: 5,
    },
});