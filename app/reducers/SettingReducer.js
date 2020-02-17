import {
    SETTING
} from '../actions/ActionTypes';

const initialState = {
    idle: "red_dot",
    sound: "bell,honk,shout",
    trackerCalibration: {
        fixing_radius: 0.05,
        fixing_time_ms: 600,
        type: "TobiiCalibrationParameter",
    },
    transparencyLevel: 1
};

export default function (state = initialState, action = {}) {
    switch (action.type) {

        case SETTING.SETSETTING:
        return {
            ...state,
            idle:       action.payload.idle || state.idle,
            sound:      action.payload.sound || state.sound,
            trackerCalibration: action.payload.trackerCalibration || state.trackerCalibration,
            transparencyLevel: action.payload.transparencyLevel || state.transparencyLevel
        };

        case SETTING.SETTRACKERCALIBRATIONPARAM:
        return {
            ...state,
            trackerCalibration: {
                setting: action.payload.setting || state.trackerCalibration.setting,
                fixing_radius: action.payload.fixing_radius || state.trackerCalibration.fixing_radius,
                fixing_time_ms: action.payload.fixing_time_ms || state.trackerCalibration.fixing_time_ms,
                transition_matrix: action.payload.transition_matrix || state.trackerCalibration.transition_matrix,
                trained_fixation_time: action.payload.trained_fixation_time || state.trackerCalibration.trained_fixation_time,
                type:           action.payload.type || state.trackerCalibration.type,
            },
        };

        default:
        return state;
    }
}