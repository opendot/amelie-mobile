import React from 'react';
import { TouchableOpacity } from 'react-native';

// component
import I18n from '../../i18n/i18n';

// third party
import { Text } from 'native-base';
import theme, { baseStyles } from '../../themes/base-theme';

/**  Show the basic informations about a patient */
export default function PatientSimpleItem( props ){
    let fontColor = props.selected ? theme.brandInfo : theme.textColor;
    return(
        <TouchableOpacity style={baseStyles.listItem}
            disabled={!props.onPatientPress && !props.onPatientLongPress}
            onPress={props.onPatientPress ? () => {props.onPatientPress(props.patient, props.index)} : null}
            onLongPress={props.onPatientLongPress? () => {props.onPatientLongPress(props.patient, props.index)} : null}
            >
            <Text style={{fontSize: 20, color: fontColor }}  numberOfLines={1} >{`${props.patient.name} ${props.patient.surname}`}</Text> 
            <Text style={{color: fontColor }} >{I18n.t("user.birthdate")+": "+props.patient.birthdate}</Text>
        </TouchableOpacity>
    );
}