import React from 'react';

// third party
import {
    Header, Icon, Left, Right, Button, Text, Body
} from 'native-base';
import debounce from "lodash/debounce";// Prevent double clicks

// styles
import theme from "../../themes/base-theme";

/** Header of the page */
export default class AirettHeader extends React.Component{

    constructor( props ){
        super( props );
        this.state = {
            onLeftButtonPressFunction: props.onLeftButtonPress ? debounce( props.onLeftButtonPress, 200, {leading: true, trailing: false}) : props.onLeftButtonPress,
            onRightButtonPressFunction: props.onRightButtonPress ? debounce( props.onRightButtonPress, 200, {leading: true, trailing: false}) : props.onRightButtonPress,
        };
    }

    render(){
        return (
            <Header hasTabs={this.props.hasTabs} >
                <Left>
                    <Button
                        transparent
                        onPress={this.state.onLeftButtonPressFunction}>
                        <Icon name={"md-menu"} style={{color:theme.toolbarTextColor}}/>

                    </Button>
                </Left>
                <Body><Text style={{color:theme.toolbarTextColor}}>{this.props.title}</Text></Body>
                <Right>
                    <Button
                        transparent
                        onPress={this.state.onRightButtonPressFunction}>
                        <Icon name={this.props.iconName} style={{color:theme.toolbarTextColor}}/>

                    </Button>
                </Right>
            </Header>
        );
    }
}