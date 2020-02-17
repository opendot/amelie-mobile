import React from "react";
import {View} from "react-native";

// component
import I18n from "../../i18n/i18n";
import SettingItem from "../Settings/settingItem";

// constants definition
const MIN_FIXATION_TIME = 400;
const MAX_FIXATION_TIME = 1200;
const FIXATION_TIME_STEP = 50;

const MIN_FIXATION_RADIUS = 5;
const MAX_FIXATION_RADIUS = 15;
const FIXATION_RADIUS_STEP = 1;

/**
 * Edit the params of the manual calibratio: fixation time an fixation radius
 */
export default function ManualCalibrationView(props) {
    return (
        <View style={props.style}>
            <SettingItem
                title={I18n.t("fixing_time_edit")}
                value={props.fixingTime}
                minValue={MIN_FIXATION_TIME}
                maxValue={MAX_FIXATION_TIME}
                step={FIXATION_TIME_STEP}
                updateValueFunc={props.updateFixingTime}
            />  
            
            <SettingItem
                title={I18n.t("fixing_radius_edit")}
                value={props.fixingRadius}
                minValue={MIN_FIXATION_RADIUS}
                maxValue={MAX_FIXATION_RADIUS}
                step={FIXATION_RADIUS_STEP}
                updateValueFunc={props.updateFixingRadius}
            />
        </View>
    );
}