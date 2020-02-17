import React from 'react';
import { View } from 'react-native';

// component
import SwipeItemButton from "../../utils/swipeItemButton";

// third party
import debounce from "lodash/debounce";// Prevent double clicks

/** Buttons to show when the list item is swiped */
export default class BackgroundLayer extends React.Component{

    constructor( props ){
        super( props );
        this.state = {
            onLeftButtonPressFunction: props.debounceLeft && props.onLeftButtonPress ? debounce( props.onLeftButtonPress, 500, {leading: true, trailing: false}) : props.onLeftButtonPress,
            onCopyButtonPressFunction: props.debounceCopy && props.onCopyButtonPress ? debounce( props.onCopyButtonPress, 500, {leading: true, trailing: false}) : props.onCopyButtonPress,
            onRightButtonPressFunction: props.debounceRight && props.onRightButtonPress ? debounce( props.onRightButtonPress, 500, {leading: true, trailing: false}) : props.onRightButtonPress,
        };
    }

    render(){
        const itemHeight = this.props.height || 60;
        return (
            <View style={{flex: 1, height: itemHeight,
                flexDirection: "row", justifyContent: "space-between",}}>

                <SwipeItemButton name={"ios-bookmark"} backgroundColor={"green"}
                    onPress={() => this.state.onLeftButtonPressFunction(this.props.item, this.props.index)}
                    />

                <View style={{height: itemHeight, flexDirection: "row"}}>
                    <SwipeItemButton name={"copy"} backgroundColor={"white"} color={"black"}
                        hidden={this.props.onCopyButtonPress ? false : true}
                        onPress={() => this.state.onCopyButtonPressFunction(this.props.item, this.props.index)}
                        />
                    <SwipeItemButton name={"trash"} backgroundColor={"red"}
                        onPress={() => this.state.onRightButtonPressFunction(this.props.item, this.props.index)}
                        />
                </View>
            </View>
        );
    }
}