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
    Container, Icon, Content, Button } from 'native-base';
import { Player, Recorder } from "react-native-audio-toolkit"; //  Audio recording and player

// styles
import theme from '../themes/base-theme'

const DEFAULT_NAME = "audioRecorder.mp4";

/**
 * Screen that allows to record an audio.
 * Based on example project of react-native-audio-toolkit.
 * The recorded file in Android is saved in "/data/user/0/it.opendot.airett/files/audioRecorder.mp4",
 * in ios is saved in "/var/mobile/Containers/Data/Application/AD81AF5B-6230-4E21-8AA0-8E223A551FF2/Documents/audioRecorder.mp4" 
 */
export default class AudioRecorderRNAudioToolkit extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor( props) {
        super(props);
        
        this.state = {
            audioPath: null,// This is null until something is recorded
            androidAudioPermission: true,
            isRecording: false,
            sampleRate: 44100,
            audioQuality: "high",
            audioEncoding: "mp4",
            audioEncodingBitrate: 32000,

            playPauseButton: I18n.t("loading"),
            recordButton: I18n.t("loading"),
            stopButtonDisabled: true,
            playButtonDisabled: true,
            recordButtonDisabled: true,
            loopButtonStatus: false,
            progress: 0,
            error: null,
        };

        this.isComponentMounted = false;

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
                // console.log("AudioRecorderRNAudioToolkit checkAndroidPermission RECORD_AUDIO", granted);
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
                console.log("AudioRecorderRNAudioToolkit ERROR checking audio permission", error);
                this.setState({androidAudioPermission: false});
            });
        }
    }

    onContentSelected = (data) => {
        // console.log("AudioRecorderRNAudioToolkit onContentSelected", data);
        if( this.props.navigation.state.params.onContentSelected ) {
            this.props.navigation.state.params.onContentSelected(data);
        }
        this.props.navigation.goBack();
    }

    onConfirmPressed = () => {
        // console.log("AudioRecorderRNAudioToolkit onConfirmPressed", this.state);
        let recordedAudio = null;
        if( this.state.audioPath) {
            recordedAudio = new AudioFile(DEFAULT_NAME, DEFAULT_NAME, "audio/mpeg", null,
            this.state.audioPath, null, null);
            recordedAudio.setSource(File.SOURCE.RECORDER);
            recordedAudio.setDuration(this.player._duration);// Set duration in millis
        }
        this.onContentSelected(recordedAudio);
    }

    /** Interrupt recording, clear cache and close screen */
    closeScreen = () => {
        return Promise.resolve()
        .then( () => {
            // Stop recording
            if( this.state.isRecording) {
                /* Never delete the existing file, it could be the file that must be sent to the server */
                return this._toggleRecord();
            }
            else {
                return;
            }
        })
        .catch((error) => {
            console.log("AudioRecorderRNAudioToolkit closeScreen ERROR", error);
        })
        .finally(() => {
            // Close screen
            this.props.navigation.goBack();
        });
    }

    componentWillMount() {
        this._initAudio();
    }

    componentDidMount() {
        this.isComponentMounted = true;
    }
    
    componentWillUnmount() {
        // Delete Interval that constatly update audio progression
        // clearInterval(this._progressInterval);

        this.isComponentMounted = false;
    }

    _initAudio = () => {
        this.player = null;
        this.recorder = null;
        this.lastSeek = 0;
    
        this._reloadPlayer();
        this._reloadRecorder();
    
        /* Update audio player progression every 100 millis,
        use _shouldUpdateProgressBar to update every 200 millis */
        // this._progressInterval = setInterval(() => {
        //   if (this.player && this._shouldUpdateProgressBar()) {// && !this._dragging) {
        //     this.setState({progress: Math.max(0, this.player.currentTime) / this.player.duration});
        //   }
        // }, 100);
    }

    _shouldUpdateProgressBar = () => {
        // Debounce progress bar update by 200 ms
        return this.lastSeek > 0 && Date.now() - this.lastSeek > 200;
    }

    _updateState = (err) => {
        if( !this.isComponentMounted ) {return;}
        this.setState({
            isRecording: this.recorder && this.recorder.isRecording,
            playPauseButton: this.player && this.player.isPlaying
                ? 'Pause' : 'Play',
            recordButton: this.recorder && this.recorder.isRecording
                ? 'Stop' : 'Record',

            stopButtonDisabled: !this.player || !this.player.canStop,
            playButtonDisabled: !this.state.audioPath || !this.player || !this.player.canPlay || this.recorder.isRecording,
            recordButtonDisabled: !this.recorder || (this.player && !this.player.isStopped)
        });
    }

    _playPause = () => {
        this.player.playPause((err, playing) => {
                if (err) {
                    this.setState({error: err.message});
                }
                this._updateState();
            });
    }

    _stop = () => {
        this.player.stop(() => {
                this._updateState();
            });
    }

    /** Allow to play the audio to a certain position */
    _seek = (percentage) => {
        if (!this.player) {
            return;
        }

        this.lastSeek = Date.now();

        let position = percentage * this.player.duration;

        this.player.seek(position, () => {
                this._updateState();
            });
    }

    /** Destroy previous Player object and create a new one */
    _reloadPlayer = () => {
        if (this.player) {
            this.player.destroy();
        }

        this.player = new Player(DEFAULT_NAME, {autoDestroy: false}).prepare((err) => {
            if (err) {
                console.log("AudioRecorderRNAudioToolkit error at _reloadPlayer():", err);
            } else {
                this.player.looping = this.state.loopButtonStatus;
            }

            this._updateState();
        });

        this._updateState();

        this.player.on("ended", () => {
                this._updateState();
            });
        this.player.on("pause", () => {
                this._updateState();
            });
    }

    /** Destroy previous Recorder object and create a new one */
    _reloadRecorder = () => {
        if (this.recorder) {
            this.recorder.destroy();
        }

        this.recorder = new Recorder(DEFAULT_NAME, {
            bitrate: this.state.audioEncodingBitrate,
            channels: 1,
            sampleRate: this.state.sampleRate,
            quality: this.state.audioQuality, // ios only Possible values: 'min', 'low', 'medium', 'high', 'max'
            encoder: this.state.audioEncoding,
            //format: 'ac3', // default: based on filename extension)
        });

        this._updateState();
    }

    /** Start/stop the recording of the audio */
    _toggleRecord = () => {
        if (this.player) {
            this.player.destroy();
        }

        this.recorder.toggleRecord((err, stopped) => {
                if (err) {
                    console.log("AudioRecorderRNAudioToolkit _toggleRecord ERROR", err);
                    this.setState({error: err.message});
                }
                if (stopped) {
                    // console.log(" stopped "+this.recorder._fsPath);
                    this.setState({audioPath: this.recorder._fsPath});
                    this._reloadPlayer();
                    this._reloadRecorder();
                }

                this._updateState();
            });
    }

    /** Enable Audio Player loop */
    _toggleLooping = (value) => {
        this.setState({loopButtonStatus: value});
        if (this.player) {
            this.player.looping = value;
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
                            onPress={this._toggleRecord}
                            >
                            <Icon style={{fontSize: buttonSize}} name={this.state.isRecording ? "md-square" : "md-mic"}/>
                        </Button>
                    </View>

                    <View style={styles.playerButtonsContainer} >
                        <Button rounded dark disabled={this.state.playButtonDisabled}
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