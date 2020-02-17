import React from 'react';
import {
    View
} from 'react-native';
import { connect } from 'react-redux';

class GazeCursor extends React.Component {

    /** Convert the normalized position into the actual screen position */
    calculateValue( normalizedPos, displaySize){
        let pos = normalizedPos >= 0 ? (normalizedPos <= 1? normalizedPos : 1) : 0;
        return pos*displaySize;
    }

    render() {
        // console.log("GazeCursorRender render "
        // +`[${this.calculateValue(this.props.gazeX, this.props.displayWidth)}, ${this.calculateValue(this.props.gazeY, this.props.displayHeight)}]`);

        const size = 10;
        return(
            <View
            style={{position:'absolute',
                left: this.calculateValue(this.props.gazeX, this.props.displayWidth)-size/2,
                top: this.calculateValue(this.props.gazeY, this.props.displayHeight)-size/2,
                width:size,
                height:size,
                backgroundColor: "red",
                borderRadius:size/2,
                }}>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        gaze: state.webSocketReducer.gaze
    };
};
const mapDispatchToProps = (dispatch) => {
    return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(GazeCursor);