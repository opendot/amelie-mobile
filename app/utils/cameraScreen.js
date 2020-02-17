import React from 'react';
import {
     StyleSheet, PermissionsAndroid, Platform
} from 'react-native';

// components
import File from "./File";
import ImageFile from "./ImageFile";
import VideoFile from "./VideoFile";

// third party
import {
    Container, Icon, Content, Footer, Button } from 'native-base';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-crop-picker';// Crop image after saving it into storage

// styles
import pageTheme from '../themes/page-theme'


/**
 * Screen that allows to select a content to add to a card.
 * For images we can crop the image and obtain the base64.
 */
export default class CameraScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor( props) {
        super(props);

        this.state ={
            cameraReady: false,
            isRecording: false,
            recordAudio: true,
            cameraType: RNCamera.Constants.Type.back,
            imageQuality: 0.5,
            flashMode: RNCamera.Constants.FlashMode.auto,
            videoQuality: RNCamera.Constants.VideoQuality["480p"],
        };

        // Save ImagePicker.openCamera to prevent opening multiple instances
        this.imageCropPickerPromise = null;

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
                // console.log("checkAndroidPermission RECORD_AUDIO", granted);
                switch( granted) {
                    case "granted":
                        this.setState({recordAudio: true});
                        break;
                    case "denied":
                        this.setState({recordAudio: false});
                        break;
                    default:
                        this.setState({recordAudio: false});
                        break;
                }
            })
            .catch((error) => {
                console.log("CameraScreen ERROR checking audio permission", error);
                this.setState({recordAudio: false});
            });
        }
    }

    onContentSelected = (data) => {
        data.setSource(File.SOURCE.RECORDER);
        // console.log("CameraScreen onContentSelected", data);
        if( this.props.navigation.state.params.onContentSelected ) {
            this.props.navigation.state.params.onContentSelected(data);
        }
        this.props.navigation.goBack();
    }

    /** Open screen to crop image */
    cropImage = ( data ) => {
        // console.log("CameraScreen cropImage", data);
        return new Promise((resolve, reject) => {
            if( this.props.navigation.state.params.cropping ) {
                ImagePicker.openCropper({
                    path: data.getPath(),
                    width: this.props.navigation.state.params.width,
                    height: this.props.navigation.state.params.height,
                    cropping: true,
                    includeBase64: this.props.navigation.state.params.includeBase64,
                }).then((croppedImageData) => {
                    resolve(ImageFile.createFromImageCropPicker(croppedImageData));
                }).catch((error) => {
                    if( error.message == "User cancelled image selection") {
                        // User didn't crop the image, it's ok
                    }
                    else {
                        console.log("Error takePicture cropImage ", error);
                        reject(error);
                    }
                });
            }
            else {
                // TODO Add base64 conversion if required
                resolve( data );
            }
        })
    }

    takePicture = () => {
        // console.log("takePicture START", this.camera)
        if (this.camera) {
            const options = { quality: this.state.imageQuality, base64: false };
            this.camera.takePictureAsync(options).then((data) => {
                // console.log("takePictureAsync data:", data, data.uri);
                this.cropImage(new ImageFile( null, null, "image/jpeg", data.uri, null, null))
                .then(this.onContentSelected);
            });
          
        }
    };

    recordVideo = () => {
        // console.log("CameraScreen Start Recording", this.camera);
        if (this.camera && !this.state.isRecording) {
            this.setState({isRecording: true}, ()=> {
                const options = { 
                    quality: this.state.videoQuality,
                    maxFileSize: pageTheme.maxFileSize,
                };
                if( !this.state.recordAudio) {
                    // WARNING: if mute is defined, even if its false, audio will not be recorded
                    options.mute = true;
                }
                this.camera.recordAsync(options).then((data) => {
                    // console.log("recordAsync data:", data, data.uri);
                    this.setState({isRecording: false});
                    // Add missing params
                    this.onContentSelected(
                        new VideoFile( null, null, "video/mp4", null, data.uri, null, null)
                    );
                    this.props.navigation.goBack();
                });
            });
        }
    }

    stopRecording = () => {
        // console.log("CameraScreen Stop Recording", this.camera);
        if( this.camera && this.state.isRecording ) {
            this.camera.stopRecording();
        }
    }

    render() {
        let params = this.props.navigation.state.params;

        // if( params.type == "image" && Platform.OS != "ios") {
        //     if( this.imageCropPickerPromise ){return null;}
        //     // Use react-native-image-crop-picker to handle images
        //     // Note: this screen can take pictures and videos by himself
        //     this.imageCropPickerPromise = ImagePicker.openCamera({
        //         width: params.width,
        //         height: params.height,
        //         cropping: params.cropping,
        //         includeBase64: params.includeBase64,
        //     })
        //     .then(ImageFile.createFromImageCropPicker)
        //     .then(this.onContentSelected)
        //     .catch((error) => {this.props.navigation.goBack()});
        //     // Don't show nothing let ImagePicker handle everything
        //     return null;
        // }

        return (
            <Container>
                <Content style={styles.container} contentContainerStyle={styles.container} >
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style = {styles.preview}
                        type={this.state.cameraType}
                        captureAudio={this.state.recordAudio}
                        flashMode={this.state.flashMode}
                        onCameraReady={() => this.setState({cameraReady: true})}
                        permissionDialogTitle={'Permission to use camera'}
                        permissionDialogMessage={'We need your permission to use your camera phone'}
                    />
                    
                </Content>
                <Footer style={{ height: 128, justifyContent: 'center', paddingTop: 8, backgroundColor: "black"}}>
                    <RecordingButtons type={params.type} isRecording={this.state.isRecording}
                        recordVideo={this.recordVideo} stopRecording={this.stopRecording}
                        takePicture={this.takePicture}
                        />
                </Footer>
            </Container>
        );
    }
}

function RecordingButtons( props ) {
    const recordButtonIcon = "md-aperture";
    switch( props.type) {
        case "video":
        return (
            <Button light rounded large bordered
                style={styles.recordButton}
                onPress={props.isRecording ? props.stopRecording : props.recordVideo}
            >
                <Icon style={{color: "white"}} name={props.isRecording ? "md-square" : "md-videocam"} />
            </Button>
        );
    
        default:
        // Default is photo
        return (
            <Button dark rounded large
                style={[styles.recordButton, {width: null, height: 80}]}
                onPress={props.takePicture}
            >
                <Icon style={{fontSize: 64}} name={"md-aperture"} />
            </Button>
        );
    }
}

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
    },

    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },

    recordButton: {
        width: 60,
        height: 60,
        justifyContent: "center",
    }

});