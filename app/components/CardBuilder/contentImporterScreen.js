import React from 'react';
import { BackHandler, View, StyleSheet } from 'react-native';
import {connect} from 'react-redux';

// components
import I18n from '../../i18n/i18n';
import File from '../../utils/File';
import AudioFile from '../../utils/AudioFile';
import ImageFile from '../../utils/ImageFile';
import VideoFile from '../../utils/VideoFile';
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import LiveView from "../liveView/liveView";
import PaginatedFlatList from "../../utils/paginatedFlatList";
import ImageGalleryItem from "./imageGalleryItem";
import AudioGalleryItem from "./audioGalleryItem";
import IconButton from "../../utils/iconButton";
import ContentThumbnail from "../../utils/contentThumbnail";
import MissingPatientModal from "./missingPatientModal";
import LoadingModal from "../../utils/loadingModal";

// third party
import { Container, Icon, Content, Text, } from 'native-base';
import debounce from "lodash/debounce";// Prevent double clicks
import RNFS from "react-native-fs";// Allow to save file into storage
import ImagePicker from 'react-native-image-crop-picker';// Crop image after saving it into storage
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

// actions
import { getPcPersonalFile } from "../../actions/CardActions";
import {setOpen, setClose} from '../../actions/LiveViewActions';
import { showErrorModal } from "../../actions/ModalAction";
import { setSocketServer } from "../../actions/WSactions";
import { renderIf } from '../../utils/utils'

// styles
import theme from '../../themes/base-theme'
import pageTheme from "../../themes/page-theme";

const TYPES = {
    AUDIO: "audio",
    IMAGE: "image",
    IMAGE_VIDEO: "image/video",
    VIDEO: "video",
    ANY: "any",
}

/** Screen that allows to select a content to add to a card */
class ContentImporterScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)

        this.state = {
            numColumns: 5,
            waiting: false, // flag used to prevent multiple request to server
            showMissingPatientModal: false,
            selectedImage: null,
        }
        /* selectedImage: {
                asset: {
                    data: "/9j/4WpJRXh..."  // Full size image
                    id: "IMG_20171109_154650904.jpg"
                    mime: "image/jpeg"
                    path: "http://10.131.184.151:3001/images/IMG_20171109_154650904.jpg"
                    url: "http://10.131.184.151:3001/images/IMG_20171109_154650904.jpg"
                }
                data: "/9j/4AAQSkZJ..."     // Thumbnail
                id: "IMG_20171109_154650904.jpg"
                mime: "image/jpeg"
                name: "IMG_20171109_154650904.jpg"
                url: "http://10.131.184.151:3001/images/IMG_20171109_154650904.jpg"
            }
        */

        this.socketServer= null;
        // Apply edits
        this.onConfirmPressedDebounce = debounce(this.onConfirmPressed, 500);
        this.onBackPressedDebounce = debounce(this.onBackPressed, 100);
    }

    componentWillMount() {
        // console.log("ContentImporter willMount "+this.getTitle());
        this.closeSocketToImportFile();
    }

    /** Manage the hardware back button, if it is pressed in this page show confirmation modal to exit from the application */
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressedDebounce);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressedDebounce);
    }

    getTitle = () => {
        if( this.props.navigation.state.params.title) {
            return this.props.navigation.state.params.title;
        }
        switch( this.props.navigation.state.params.type ) {
            case "audio": return I18n.t("card.insertAudio");

            case "image": return I18n.t("card.insertImage");

            case "image/video": return I18n.t("card.insertImageVideo");

            case "video": return I18n.t("card.insertVideo");

            default: return I18n.t("insert");
        }
    }

    onBackPressed = () => {
        this.openSocketAfterImport();
        this.props.navigation.goBack();
    }

    closeSocketToImportFile = () => {
        // While importing a file the socket is not closed properly, so I do it manually
        if( this.props.socketServer && this.socketServer === null && !this.props.navigation.state.params.ignoreSocket) {
            this.props.socketServer.close();
            this.props.socketServer.logout();
            this.socketServer = this.props.socketServer;
            this.props.setSocketServer(null);
        }
    }

    openSocketAfterImport = () => {
        if( this.socketServer && !this.props.navigation.state.params.ignoreSocket) {
            this.socketServer.createWebSocket();
            this.props.setSocketServer(this.socketServer);
            this.socketServer = null;
        }
    }

    /** Set the given image and automatically return it */
    setSelectedImage = ( file ) => {
        this.setState({selectedImage: file}, this.onConfirmPressed);
    }

    /** Return the selected content */
    onConfirmPressed = () => {
        // Check if there is a patient
        if( !this.props.currentPatient ){
            // Show error modal
            this.setState({showMissingPatientModal: true});
            return;
        }

        // Send the selected content to the callback
        if( this.props.navigation.state.params && this.props.navigation.state.params.onContentSelected
            && this.state.selectedImage ){
            if( this.state.selectedImage.mime.startsWith("audio")) {
                this.openSocketAfterImport();
                this.props.navigation.state.params.onContentSelected( this.state.selectedImage);
                // Close this screen
                this.props.navigation.goBack();
            }
            else if( this.state.selectedImage.mime.startsWith("image")) {
                this.setState( {waiting: true},
                    () => {
                        if(this.state.selectedImage.cropRect) {
                            this.openSocketAfterImport();
                            // Image already cropped
                            this.props.navigation.state.params.onContentSelected( this.state.selectedImage);
                            // Close this screen
                            this.props.navigation.goBack();
                        }
                        else {
                            // Crop the image and return the cropped image
                            this.handleCropImage( this.state.selectedImage);
                        }
                    }
                );
            }
            else if( this.state.selectedImage.mime.startsWith("video")) {
                this.openSocketAfterImport();
                this.props.navigation.state.params.onContentSelected( this.state.selectedImage);
                // Close this screen
                this.props.navigation.goBack();
            }

        }
        else {
            this.openSocketAfterImport();
            // Close this screen
            this.props.navigation.goBack();
        }

    }

    /********************************
     *  Content from Computer
     */

    /**
     * Starting from the base64 allow to crop the image.
     * Save the image locally, crop the image, then delete the temporary images.
     * Also close this screen if everything went well
     */
    handleCropImage = (image) => {
        /* To crop I need to save the image locally */

        // create a path you want to write to
        const path = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;

        // write the file
        return RNFS.writeFile(path, image.getBase64Data(), "base64")
        .then((success) => {
            // console.log("RNFS.writeFile "+path, success );
            return ImagePicker.openCropper({
                path: `file://${path}`,
                width: 1024,
                height: 1024,
                cropping: true,
                includeBase64: true,
            });
        })
        .then((croppedImageAsset) => {
            let croppedImageFile = ImageFile.createFromImageCropPicker(croppedImageAsset);
            // Set original values
            croppedImageFile.setId(image.getId());
            croppedImageFile.setName(image.getName());
            croppedImageFile.setUrl(image.getUrl());
            croppedImageFile.setSource(image.getSource());
            return croppedImageFile;
        })
        .then((croppedImageFile) => {
            // console.log("cropImage croppedImageFile", croppedImageFile);
            this.openSocketAfterImport();
            this.props.navigation.state.params.onContentSelected( croppedImageFile);
            // Now delete image from cache
            return RNFS.unlink(path)
        })
        .then(() => {
            // console.log("RNFS.unlink file deleted "+path);
            // Close this screen
            this.props.navigation.goBack();
        })
        .catch((err) => {
            console.log("cropImage Error", err.message);
            this.setState({waiting: false});
        });
    }

    /** Change the data from a string to an object */
    onDataAvailable = ( files ) => {
        return files.map((file, index) => {
            if( file instanceof File) {
                return file;
            }
            else if( file.mime && file.mime.startsWith("audio") ){
                return AudioFile.createFromComputer(file, this.props.serverUrl);
            }
            else if( file.mime && file.mime.startsWith("image") ) {
                return ImageFile.createFromComputer(file, this.props.serverUrl);
            }
            else if( file.mime && file.mime.startsWith("video") ) {
                return VideoFile.createFromComputer(file, this.props.serverUrl);
            }
            else {
                return file.url? file : {...file, url: `${this.props.serverUrl}/personal_files/${file.id}`};
            }
        });
    }

    renderFileItem = ( { item, index, separators} ) => {
        // console.log("Image: ", item);
        if( item.mime.startsWith("audio")) {
            return (
                <AudioGalleryItem square audio={item} index={index}
                    numColumns={this.state.numColumns}
                    onAudioPress={this.onAudioPress} />
            );
        }
        else if( item.mime.startsWith("image")) {
            return (
                <ImageGalleryItem image={item} index={index}
                    numColumns={this.state.numColumns}
                    onImagePress={this.onImagePress} />
            );
        }
        else if( item.mime.startsWith("video")) {
            // Change the onPress behaviour
            return (
                <ImageGalleryItem image={item} index={index}
                    numColumns={this.state.numColumns}
                    onImagePress={this.onVideoPress} />
            );
        }
    }

    /** On audio press return the selected audio */
    onAudioPress = ( audio, index ) => {
        // For audio on the computer I only need the id
        this.setSelectedImage(audio);
    }

    /** On image press return the selected image */
    onImagePress = ( image, index ) => {
        this.setState( {waiting: true},
            () => {
                this.props.getPcPersonalFile(image.id, ( asset) => {
                    // console.log("onConfirmPressed imageBase64", asset);
                    if( asset ){
                        let tempImage = image.clone();
                        tempImage.mime = asset.mime;
                        tempImage.setBase64Data( asset.data);

                        this.setState({waiting: false});
                        this.setSelectedImage(tempImage);
                    }
                    else {
                        this.setState({waiting: false})
                    }
                });
            }
        );
    }

    /** On video press return the thumbnail */
    onVideoPress = ( video, index ) => {
        let selectedVideoThumbnail = video.clone();

        /* A video needs a poster, open another ContentImporterScreen
        to let the user select an image to use as a poster */
        this.setState({ selectedImage: selectedVideoThumbnail}, () => {
            // Let user choose a poster for the video
            setTimeout( () => {
                this.props.navigation.navigate("ContentImporter",
                    {type: "image", title: I18n.t("card.selectVideoPoster"), ignoreSocket: true, onContentSelected: this.onVideoPosterSelected});
            }, 100);
        });
    }

    /********************************
     *  Content from Gallery
     */

    onAudioImported = ( file ) => {
        this.setSelectedImage(file);
    }

    onImageImported = ( file ) => {
        this.setSelectedImage(file);
    }

    onVideoImported = ( file ) => {
        /* A video needs a poster, open another ContentImporterScreen
        to let the user select an image to use as a poster */
        this.setState({
            selectedImage: file,
        }, () => {
            // Let user choose a poster for the video
            setTimeout( () => {
                this.props.navigation.navigate("ContentImporter",
                    {type: "image", title: I18n.t("card.selectVideoPoster"), ignoreSocket: true, onContentSelected: this.onVideoPosterSelected});
            }, 100);
        });
    }

    onVideoPosterSelected = (posterAsset) => {
        // Add a poster to the selected video
        let tempSelectedVideo = this.state.selectedImage.clone();
        tempSelectedVideo.setThumbnail(posterAsset.clone());

        this.setSelectedImage(tempSelectedVideo);
    }

    /**
     * Open the page used to select a file from the device gallery
     */
    openGallerySelection = () => {
        let type = this.props.navigation.state.params.type;
        if( type == TYPES.IMAGE) { type = "photo";}

        // Allow to import an image or a video
        ImagePicker.openPicker({
            mediaType: type &&  type != TYPES.IMAGE_VIDEO ? type : "any",
            cropping: false,
            includeBase64: false,
        }).then( localFile => {
            // console.log("EditCardView open localfile ", localFile);
            // Limit file size
            if( localFile.size < pageTheme.contentMaxSize) {
                if( localFile.mime.startsWith("image") ) {
                    return ImagePicker.openCropper({
                        path: localFile.path,
                        width: 1024,
                        height: 1024,
                        cropping: true,
                        includeBase64: true,
                    })
                    .then(ImageFile.createFromImageCropPicker)
                    .then(this.onImageImported);
                }
                else if( localFile.mime.startsWith("video") ) {
                    this.onVideoImported(VideoFile.createFromImageCropPicker(localFile));
                }
            }
            else {
                // Error: File too big
                this.props.showErrorModal(I18n.t("error.card.generic"), I18n.t("error.card.fileSize"));
            }
        })
        .catch(error => {
            console.log("EditCard Importfrom Gallery ERROR: ", error);
            if( error.message != "User cancelled image selection") {
                this.props.showErrorModal( I18n.t("error.card.getFile"), error.message || JSON.stringify(error));
            }
        });
    }

    /**
     * Open the page used to select a file from the device gallery.
     * This use the library react-native-document-picker, which is intergrated with
     * ios iCloud
     */
    openDocumentPicker = () => {
        let filetypes = null;
        switch( this.props.navigation.state.params.type ) {
            case TYPES.ANY:
                filetypes = [DocumentPickerUtil.allFiles()]
                break;
            case TYPES.AUDIO:
                filetypes = [DocumentPickerUtil.audio()]
                break;
            case TYPES.IMAGE:
                filetypes = [DocumentPickerUtil.images()]
                break;
            default:
                filetypes = [DocumentPickerUtil.allFiles()]
                break;
        }
        DocumentPicker.show({
            filetype: filetypes,
        },(error, file) => {
            // console.log( "openDocumentPicker response", file);
            if( !file ){
                // No file is returned if user interrupted the operation
                console.log("ContentImporter openDocumentPicker File null ", error);
                if( error ) {
                    this.props.showErrorModal( I18n.t("error.card.generic", error.message));
                }
            }
            else if( file.type.startsWith("audio")) {
                let audio = AudioFile.createFromDocumentPicker(file);
                // console.log( "imported audio ", audio);
                this.onAudioImported(audio);
            }

        });
    }

    /********************************
     *  Content creation
     */

    /**
     * Open the camera to take a picture or record a video
     */
    openCamera = ( type = (this.props.navigation.state.params.type || "image") ) => {
        this.props.navigation.navigate("Camera", {
            onContentSelected: type == "video" ? this.onVideoImported : this.onImageImported,
            type: type,
            width: 1024,
            height: 1024,
            cropping: true,
            includeBase64: true,
        })
    }

    /** Open the screen to record an audio */
    openAudioRecorder = () => {
        this.props.navigation.navigate("AudioRecorder", {
            onContentSelected: this.onAudioImported,
        });
    }

    render() {
        let patient = this.props.currentPatient;
        let iconname = this.props.liveView ? 'ios-arrow-up' : 'ios-arrow-down';
        const params = this.props.navigation.state.params;
        return (
            <Container >
                <AirettSimpleHeader title={this.getTitle()}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={this.onBackPressedDebounce}
                    rightIconName={iconname}
                    onRightButtonPress={() => {
                        if(this.props.liveView){
                            this.props.closeLiveView();
                        }
                        else{
                            this.props.openLiveView();
                        }
                    }} />
                <Content contentContainerStyle={styles.mainContainer}>

                    <Text style={styles.computerText}>{I18n.t("computerFolder")}</Text>
                    <PaginatedFlatList
                        ref={(list) => {this.treeList = list;}}
                        createQuery={( page, searchFilter) => {
                            return `personal_files?page=${page}${params.type && params.type != TYPES.IMAGE_VIDEO ? `&file_type=${params.type}` : ''}`;
                        }}
                        numColumns={this.state.numColumns}
                        keyExtractor={ ( image, index) => index }
                        renderItem={this.renderFileItem }
                        onDataAvailable={this.onDataAvailable}
                        emptyListMessage={I18n.t("empty_list")}
                        />

                    <ImportButtonsRow type={params.type}
                        onGalleryPress={this.openGallerySelection}
                        onDocumentPickerPress={this.openDocumentPicker}
                        onCameraPress={this.openCamera}
                        onMicrophonePress={this.openAudioRecorder}
                        />
                    {renderIf(this.props.liveView,<LiveView/>)}
                </Content>
                <MissingPatientModal
                    navigation={this.props.navigation}
                    visible={this.state.showMissingPatientModal}
                    isOpen={this.state.showMissingPatientModal}
                    closeModal={() => { this.setState({showMissingPatientModal: false});}}
                    />
                <LoadingModal
                    text={I18n.t("loading")}
                    visible={this.state.waiting}
                    isOpen={this.state.waiting}
                    />
            </Container>

        )
    }
}

function SelectedImage( props){
    let height = 150;
    if( props.image ){
        return (
            <View style={{ margin: 8}}>
                <ContentThumbnail
                    content={props.image}
                    emptyIconName={"md-photos"}
                    />
            </View>
        );
    }
    else {
        return (
            <View style={{ width: height, height: height, margin: 8, alignSelf: "center", justifyContent: "center", alignItems: "center",
                borderWidth: theme.borderWidth, borderColor: theme.borderColor}}>
                <Icon name={"md-photos"} />
            </View>
        );
    }
}

function ImportButtonsRow( props ){
    switch( props.type ) {
        case TYPES.AUDIO:
        return (
            <View style={styles.importButtonsContainer}>
                <IconButton iconName={"md-photos"}
                    label={I18n.t("gallery")}
                    onPress={props.onDocumentPickerPress} />
                <IconButton iconName={"md-mic"}
                    label={I18n.t("record")}
                    onPress={props.onMicrophonePress} />
            </View>
        );

        case TYPES.IMAGE:
        return (
            <View style={styles.importButtonsContainer}>
                <IconButton iconName={"md-photos"}
                    label={I18n.t("gallery")}
                    onPress={props.onGalleryPress} />
                <IconButton iconName={"md-camera"}
                    label={I18n.t("photo")}
                    onPress={() => props.onCameraPress("image")} />
            </View>
        );

        case TYPES.IMAGE_VIDEO:
        return (
            <View style={styles.importButtonsContainer}>
                <IconButton iconName={"md-photos"}
                    label={I18n.t("gallery")}
                    onPress={props.onGalleryPress} />
                <IconButton iconName={"md-camera"}
                    label={I18n.t("photo")}
                    onPress={() => props.onCameraPress("image")} />
                <IconButton iconName={"md-videocam"}
                    label={I18n.t("video")}
                    onPress={() => props.onCameraPress("video")} />
            </View>
        );

        case TYPES.VIDEO:
        return (
            <View style={styles.importButtonsContainer}>
                <IconButton iconName={"md-photos"}
                    label={I18n.t("gallery")}
                    onPress={props.onGalleryPress} />
                <IconButton iconName={"md-videocam"}
                    label={I18n.t("video")}
                    onPress={() => props.onCameraPress("video")} />
            </View>
        );

        default:
        // Any file
        return (
            <View style={styles.importButtonsContainer}>
                <IconButton iconName={"md-photos"}
                    label={I18n.t("gallery")}
                    onPress={props.onGalleryPress} />
                <IconButton iconName={"md-camera"}
                    label={I18n.t("photo")}
                    onPress={() => props.onCameraPress("image")} />
                <IconButton iconName={"md-videocam"}
                    label={I18n.t("video")}
                    onPress={() => props.onCameraPress("video")} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        alignItems: "stretch",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },

    computerText: {
        alignSelf: "center",
        marginVertical: 8,
    },

    importButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 28,
        paddingBottom: 12,
    }
});

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        currentPatient: state.authenticationReducer.currentPatient,
        socketServer: state.webSocketReducer.socketServer,
        liveView: state.liveViewReducer.open,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getPcPersonalFile: (imageId, callback) => {dispatch(getPcPersonalFile(imageId, callback))},
        setSocketServer: (newSocket) => {dispatch(setSocketServer(newSocket))},
        openLiveView: () => {dispatch(setOpen())},
        closeLiveView: () => {dispatch(setClose())},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentImporterScreen);