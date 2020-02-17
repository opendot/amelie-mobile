import React from 'react';

// third party
import { Button, Text } from 'native-base';
import theme from '../../themes/base-theme';

/**  Show the basic informations about a patient */
export default function PatientButtonItem( props ){
    let fontColor = props.selected ? theme.brandInfo : theme.inverseTextColor;
    return(
        <Button block style={{backgroundColor: '#424242', margin: 8}}
            disabled={!props.onPatientPress}
            onPress={props.onPatientPress ? () => {props.onPatientPress(props.patient, props.index)} : null}
            >
            <Text style={{fontSize: 15, color: fontColor }}  numberOfLines={1} >{`${props.patient.name} ${props.patient.surname}`}</Text> 
        </Button>
    );
}