import React from 'react';
import { Platform } from 'react-native';

// components
import AudioRecorderRNAudio from './audioRecorderRNAudio';
import AudioRecorderRNAudioToolkit from './audioRecorderRNAudioToolkit';

/**
 * Screen that allows to record an audio.
 * I have 2 libraries:
 * - react-native-audio: doesn't record in ios
 * - react-native-audio-toolkit: record in both OS, but the audio created
 *  in android can't be reproduced in Google Chrome. Unknown reason, maybe related to Codec profile HE-AACv2
 */
export default class AudioRecorderScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    render() {
        if( Platform.OS == "android") {
            return <AudioRecorderRNAudio navigation={this.props.navigation} />
        }
        else {
            return <AudioRecorderRNAudioToolkit navigation={this.props.navigation} />
        }
    }
}
