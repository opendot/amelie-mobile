import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

//third party
import { Col, Row, Icon, Text } from "native-base";
import debounce from "lodash/debounce";// Prevent double clicks

import theme from "../../themes/base-theme";

/** Size of the estra buttons shown */
const expandedButtonSize = 32;

/**
 * Button used in the liveView, it's a Button to have an action with multiple options.
 * It's a Button with an Icon, it can receive a list of subButtons
 * By long pressing the button the list o subbuttons are shown, by clicking
 * a subbutton it becomes the selected one.
 */
export default class IconExpandableButton extends React.Component {
    
    constructor(props) {
        super(props)

        this.state = {
            active: false,
            selectedIndex: 0,
        };

        this.onPressFunction = props.debounce ? debounce( props.onPress, 700, {leading: true, trailing: false}) : props.onPress;
    }

    onLongPress = () => {
        if( this.props.subButtons ) {
            this.setState({active: !this.state.active});
        }
    }

    onItemSelected = (button, index) => {
        if( this.props.onButtonSelected) {
            this.props.onButtonSelected(button, index);
        }
        this.setState({selectedIndex: index, active: false});
    }

    render() {
        if( this.props.hide ) { return null; }

        let selectedIndex =  this.props.selectedIndex != undefined && this.props.selectedIndex != null ? this.props.selectedIndex : this.state.selectedIndex;
        let selectedBtn = this.props.subButtons ? this.props.subButtons[selectedIndex] : null;
        const isNameBelow = selectedBtn && !this.props.hideSelectedButtonText && this.props.nameBelow;
        return (
            <Col >
                <Row style={{ height: 40, backgroundColor: "black"}}>
                    <TouchableOpacity
                        disabled={this.props.disabled}
                        style={styles.mainButtonContainer}
                        onPress={this.onPressFunction}
                        onLongPress={this.onLongPress}>

                        <Icon style={{color: this.props.disabled?"grey":"white", fontSize: ( isNameBelow ? 14 : theme.iconFontSize)}} name={this.props.iconName}/>
                        { selectedBtn && !this.props.hideSelectedButtonText ?
                            <View style={this.props.nameBelow ? styles.belowTextWrapper : styles.overlayTextWrapper}>
                                <Text style={[styles.overlayText, {marginLeft: this.props.overlayOffsetX, marginTop: this.props.overlayOffsetY, color: this.props.disabled?"grey":(isNameBelow ? "white":"black")}]}
                                    numberOfLines={1} >
                                    {selectedBtn.showLabel ? this.props.subButtons[selectedIndex].label : (selectedIndex+1)}
                                </Text>
                            </View>
                            : null
                        }

                    </TouchableOpacity>
                </Row>
                <ExpandableRow 
                    active={this.state.active && !this.props.disabled}
                    subButtons={this.props.subButtons}
                    onPress={this.onItemSelected}
                    />
            </Col>
        );
    }

}

/** Row holding the array of sub buttons to show,
 * it is shown only if active is true */
function ExpandableRow( props ){
    if( !props.active || !props.subButtons) {
         return null;
    }
    return (
        <Row style={styles.expandableRowContainer}>
            { props.subButtons.map( (button, index) => {
                let fontSize = button.label.length > 3 ?  (button.label.length > 5 ? 6 : 10): undefined;
                return (
                    <TouchableOpacity key={index}
                        style={styles.expandedButton}
                        onPress={() => {
                            props.onPress(button, index);
                        }}
                        >

                        <Text style={[styles.expandedButtonText, {fontSize: fontSize}]} numberOfLines={1}>{button.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </Row>
    );
}

const styles = StyleSheet.create({
    
    mainButtonContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    overlayTextWrapper: {
        flex: 1,
        position: "absolute",
    },

    overlayText: {
        fontSize: 12,
        textAlign: "center",
    },

    expandableRowContainer: {
        flexDirection: "column",
        alignItems: "center",
    },
    
    expandedButton: {
        width: expandedButtonSize,
        height: expandedButtonSize,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 2,
        backgroundColor: "black",
        borderRadius: expandedButtonSize/2,
    },

    expandedButtonText: {
        color: "white",
        fontSize: 15,
    },
});