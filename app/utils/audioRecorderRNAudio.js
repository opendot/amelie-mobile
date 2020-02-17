import React from 'react';
import {
    View, StyleSheet, PermissionsAndroid, Platform
} from 'react-native';


// components
import I18n from '../i18n/i18n';
import File from './File';
import AudioFile from './AudioFile';
import AirettSimpleHeader from "./airettSimpleHeader";
import SimpleButtonsRow from "./simpleButtonsRow";

// third party
import {
    Container, Icon, Content, Button, 
} from 'native-base';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

// styles
import theme from '../themes/base-theme'


const DEFAULT_NAME = "audioRecorder.mp3";

/**
 * Screen that allows to select a content to add to a card.
 * For images we can crop the image and obtain the base64.
 */
export default class AudioRecorderRNAudio extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor( props) {
        super(props);
        
        this.state ={
            audioPath: null,
            androidAudioPermission: true,
            isRecording: false,
            sampleRate: 44100,
            audioQuality: "Low",
            audioEncoding: "aac",
            audioEncodingBitrate: 32000,

            playButtonDisabled: true,
        };

        // Request permissions for Camera
        this.checkAndroidPermissions();
    }

    /**
     * Check permissions for android
     * The camera permission is given during signin for scanning the QR code,
     * but we need to check the audio permission.
     */
    checkAndroidPermissions = () => {
        if( Platform.OS == "android" && Platform.Version >= 23 ){
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
            .then((granted) => {
                // console.log("AudioRecorder checkAndroidPermission RECORD_AUDIO", granted);
                switch( granted) {
                    case "granted":
                        this.setState({androidAudioPermission: true});
                        break;
                    case "denied":
                        this.setState({androidAudioPermission: false});
                        break;
                    default:
                        this.setState({androidAudioPermission: false});
                        break;
                }
            })
            .catch((error) => {
                console.log("AudioRecorderRNAudio ERROR checking audio permission", error);
                this.setState({androidAudioPermission: false});
            });
        }
    }

    onContentSelected = (data) => {
        // console.log("AudioRecorderRNAudio onContentSelected", data);
        if( this.props.navigation.state.params.onContentSelected ) {
            this.props.navigation.state.params.onContentSelected(data);
        }
        this.props.navigation.goBack();
    }

    onConfirmPressed = () => {
        // console.log("AudioRecorderRNAudio onConfirmPressed", this.state);
        let recordedAudio = new AudioFile(DEFAULT_NAME, DEFAULT_NAME, "audio/mpeg", null,
             this.state.audioPath, null, null);
        recordedAudio.setSource(File.SOURCE.RECORDER);
        this.onContentSelected(recordedAudio);
    }

    /** Interrupt recording, clear cache and close screen */
    closeScreen = () => {
        return Promise.resolve()
        .then( () => {
            // Stop recording
            if( this.state.isRecording) {
                // TODO should I delete audio recorded previously?
                return this.stop()
            }
            else {
                return;
            }
        })
        .catch((error) => {
            console.log("AudioRecorderRNAudio closeScreen ERROR", error);
        })
        .finally(() => {
            // Close screen
            this.props.navigation.goBack();
        });
    }

    prepareRecordingPath = (audioPath) => {
        AudioRecorder.onFinished = (data) => {
            // Android callback comes in the form of a promise instead.
            console.log("AudioRecorderRNAudio onFinished", data)
            if (Platform.OS === 'ios' && data.status === "OK") {
                this.setState({audioPath: data.audioFileURL});
            }
        };

        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: this.state.sampleRate,
            Channels: 1,
            AudioQuality: this.state.audioQuality,
            AudioEncoding: this.state.audioEncoding,
            AudioEncodingBitRate: this.state.audioEncodingBitrate, // Android Only
        });

        
    }

    record = () => {
        if (this.state.isRecording) {
            // console.log('Already recording!');
            return;
        }
  
        if (!this.state.androidAudioPermission) {
            // console.log('Can\'t record, no permission granted!');
            return;
        }
  
        
        this.prepareRecordingPath(`${AudioUtils.CachesDirectoryPath}/${DEFAULT_NAME}`);
  
        this.setState({isRecording: true, paused: false});
  
        if( Platform.OS == "ios") {
            // In ios this is not a Promise
            AudioRecorder.startRecording();
        }
        else {
            return AudioRecorder.startRecording()
            .catch( (error) => {
                console.log("AudioRecorderRNAudio record ERROR", error);
            });
        }
    }
  
    stop = () => {
        if (!this.state.isRecording) {
        //   console.log('Can\'t stop, not recording!');
          return;
        }
  
        this.setState({stoppedRecording: true, isRecording: false, paused: false});
  
        if( Platform.OS == "ios") {
            // In ios this is not a Promise
            console.log("[] audio stop",AudioRecorder.stopRecording());
        }
        else {
            return AudioRecorder.stopRecording()
            .then( (filePath) => {
                this.setState({audioPath: filePath, playButtonDisabled: false});
                return filePath;
            })
            .catch( (error) => {
                console.log("AudioRecorderRNAudio stop ERROR", error);
            });
        }
    }
  
    deleteAudio = () => {
        this.setState({audioPath: null, playButtonDisabled: true});
    }

    render() {
        let params = this.props.navigation.state.params;
        const buttonSize = 64;
        return (
            <Container>
                <AirettSimpleHeader title={I18n.t("card.insertAudio")}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={this.closeScreen} />
                <Content padder contentContainerStyle={styles.container} >
                    <View style={styles.recordButtonContainer}>
                        <Button rounded style={{alignSelf: "center", justifyContent: "center", width: buttonSize+7*theme.buttonPadding, height: buttonSize+7*theme.buttonPadding}}
                            onPress={this.state.isRecording ? this.stop: this.record}
                            >
                            <Icon style={{fontSize: buttonSize}} name={this.state.isRecording ? "md-square" : "md-mic"}/>
                        </Button>
                    </View>
                    
                    <View style={styles.playerButtonsContainer} >
                        <Button rounded dark disabled={true}
                            style={styles.playerButton} onPress={this._playPause}
                            >
                            <Icon name={this.state.playPauseButton == "Pause" ? "ios-pause" : "ios-play"}/>
                        </Button>
                        <Button rounded dark disabled={this.state.playButtonDisabled}
                            style={styles.playerButton} onPress={this.deleteAudio}
                            >
                            <Icon name={"ios-trash"}/>
                        </Button>
                    </View>

                    <SimpleButtonsRow 
                        debounceOpen={true}
                        confirmDisabled={ !this.state.audioPath}
                        onConfirmPressed={this.onConfirmPressed}
                        debounceClose={true}
                        onClosePressed={this.closeScreen}/>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        alignItems: "stretch",
    },

    recordButtonContainer: {
        flex: 1,
        marginTop: 32,
    },

    playerButtonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        padding: 12,
        borderColor: "lightgray",
        borderTopWidth: 2,
    },

    playerButton: {
        width: 45,
        justifyContent: "center",
        marginHorizontal: 8,
    },

});