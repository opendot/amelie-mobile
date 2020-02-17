import React from 'react';
import { Platform } from 'react-native';
import {connect} from 'react-redux';

// components
import I18n from '../../i18n/i18n';
import File from "../../utils/File";
import AudioFile from "../../utils/AudioFile";
import ImageFile from "../../utils/ImageFile";
import VideoFile from "../../utils/VideoFile";
import AirettSimpleHeader from "../../utils/airettSimpleHeader";
import EditCardView from"../editCardView";
import SimpleButtonsRow from "../../utils/simpleButtonsRow"
import MissingPatientModal from "./missingPatientModal";
import LoadingModal from "../../utils/loadingModal"

// third party
import { Container, Content } from 'native-base';
import ObjectID from "bson-objectid";// Generate a unique Hex String of 24 characters (12 bytes https://docs.mongodb.com/manual/reference/bson-types/#objectid)
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import theme from '../../themes/base-theme'
import { send } from "../../actions/WSactions";
import { createCustomCard, createCustomCardFormData, updateCard, updateCardFormData } from "../../actions/CardActions";
import { convertFilePathToBase64, convertUrlToBase64, getBase64String } from '../../utils/utils'


/** Screen that allows to create a new card  */
class CardBuilderScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props)

        // Allow to edit a card if it's passed in the params of the page
        let cardToEdit = this.getCardToEdit(props);
        this.state = {
            waiting: false, // flag used to prevent multiple request to server
            id: cardToEdit ? cardToEdit.id : ObjectID.generate(),
            title: cardToEdit ? I18n.t("card.edit") : I18n.t("card.create"),
            label: cardToEdit ? cardToEdit.label : null,
            tags: cardToEdit ? cardToEdit.card_tags : [],
            level: cardToEdit ? (cardToEdit.level || 1) : 1,
            asset: cardToEdit ? this.createFileFromContent( cardToEdit.label, cardToEdit.content) : null,
            showMissingPatientModal: false,
            selectionAction: cardToEdit ? cardToEdit.selection_action : "synthesize_label",
            selectionSound: cardToEdit ? AudioFile.createFromCardSelectionAction(cardToEdit) : null,
        }

        // Apply edits
        this.onConfirmPressedDebounce = debounce(this.onConfirmPressed, 500);
    }

    /** Return the card received as params by the page, or undefined */
    getCardToEdit = ( props = this.props ) => {
        return props.navigation.state.params ? props.navigation.state.params.card : undefined;
    }

    /** Create a File from the content of an existing card */
    createFileFromContent ( cardName, cardContent ) {
        if( !cardContent ) { return null;}

        if( cardContent.type == "Video") {
            let videoThumbnail = new ImageFile( null, null, "image/jpeg", null, cardContent.content_thumbnail, null);
            let videoContent = new VideoFile( null, null, "video/mp4", null, null, cardContent.content, videoThumbnail);
            return videoContent;
        }
        else if( cardContent.type == "Text") {
            return new File( null, cardName);
        }
        else {
            // The content is an image
            let imageThumbnail = new ImageFile( null, null, "image/jpeg", null, cardContent.content_thumbnail, null);
            let imageContent = new ImageFile( null, null, "image/jpeg", null, cardContent.content, imageThumbnail);
            return imageContent;
        }
    }

    /** Generate a valid Content object for this card */
    getCardContent = () => {
        if( !this.state.asset ){
            return this.state.level === 5 ? {type: "Text"} : null ;
        }

        // If this is an edited card and the content didn't changed do nothing
        let cardToEdit = this.getCardToEdit();
        if( cardToEdit 
            && cardToEdit.content.content == this.state.asset.getUrl() ){
            // The content has not changed, don't overwrite it
            return null;
        }

        // Assign properties based on the asset imported
        let content = {};
        if( this.state.asset.mime.startsWith("image") ) {
            content.type = this.getContentTypeByLevel(this.state.level);
            content.mime = this.state.asset.getMime();
            content.content = this.state.asset.getPath();
        }
        else if( this.state.asset.mime.startsWith("video") ) {
            content.type = "Video";
            content.mime = this.state.asset.getMime();
            if( this.state.asset.id){
                // Image imported from Computer with ContentImporterScreen
                content.personal_file_id = this.state.asset.id;
            }
            else {
                content.content = this.state.asset.getPath();
            }
            let thumbnail = this.state.asset.getThumbnail();
            if( thumbnail && thumbnail.getType() == "image"){
                // Add a thumbnail to the video
                content.content_thumbnail = getBase64String({mime: thumbnail.getMime(), data: thumbnail.getBase64Data()});
            }
        }
        return content;
    }

    getContentTypeByLevel = (level) => {
        switch( level ){
            case 1:
                return "PersonalImage";
            case 2:
                return "GenericImage";
            case 3:
                return "DrawingImage";
            case 4:
                return "IconImage";
            case 5:
                return "Text";
            default:
                return null;
        }
    }

    getContentImageFromAsset = (asset) => {
        return asset.getBase64Data() ? getBase64String( {mime: asset.mime, data:  asset.getBase64Data()})
        : ( asset.url ? convertUrlToBase64( asset.url ) : undefined);
    }

    /** Send the card to the server */
    onConfirmPressed = () => {
        // Check if there is a patient
        if( !this.props.currentPatient ){
            // Show error modal
            this.setState({showMissingPatientModal: true});
            return;
        }
        
        // console.log("CardBuilder onConfirmPressed")

        if(this.state.tags.length == 0){return;}
        
        this.setState( {waiting: true, waitingMessage: I18n.t("card.generateContent")}, () => {
            this.generateCompleteCard()
            .then(this.sendCardToServer)
            .then( (cardFromServer) => {
                // Close this page
                this.props.navigation.goBack();
            })
            .catch((error) => {
                console.log("CardBuilder onConfirmPressError ", error);
            })
            .finally(() => this.setState( {waiting: false, waitingMessage: null}));
        });
        
    }

    /**
     * Generate a valid card object that can be sent to teh server
     * The card creation may be long, so we use a promise
     * @returns {Promise} a promise that returns the complete card
     */
    generateCompleteCard = () => {
        let card = {
            id: this.state.id,
            label: this.state.label,
            level: this.state.level,
            patient_id: this.props.currentPatient.id,
            card_tags: this.state.tags.filter( (cardTag) => cardTag.tag ? true : false).map( (cardTag, index) => cardTag.tag), // Filter empty strings, map to a String array
            selection_action: this.state.selectionAction,
            selection_sound: null,
            content: this.getCardContent(),
        };

        if( card.content && card.content.type == "Video" ) {
            // Cards with video doesn't have a selection action
            card.selection_action = "nothing";
        }

        return Promise.resolve(card)
        .then( cardWithContent => {
            // If necessary, do long operations about the selection action
            if( cardWithContent.selection_action == "play_sound") {
                // I need to upload the audio
                if( this.state.selectionSound ) {
                    if( this.state.selectionSound.source == File.SOURCE.COMPUTER) {
                        // The file is already in the server, just send the id
                        cardWithContent.selection_sound = this.state.selectionSound.getId();
                        return cardWithContent;
                    }
                    else if( this.state.selectionSound.source == File.SOURCE.GALLERY
                        || this.state.selectionSound.source == File.SOURCE.RECORDER ) {
                        // Convert the file into base64
                        return convertFilePathToBase64( this.state.selectionSound.getPath())
                        .then( (audioBase64) => {
                            cardWithContent.selection_sound = getBase64String( {mime: this.state.selectionSound.getMime(), data: audioBase64});
                            return card;
                        });
                    }
                    else {
                        return cardWithContent;
                    }
                }
            }
            else {
                return cardWithContent;
            }
        })
    }

    /**
     * Send the card to the server, if a card is given in the params
     * do an update, else do a create
     * @param {any} card complete card to send
     */
    sendCardToServer = (card) => {
        return new Promise((resolve, reject) => {
            // console.log("CardBuilder sendCardToServer", card);
            let cardToEdit = this.getCardToEdit();

            // Set the waiting flag to prevent actions while applying the edits
            this.setState( {waiting: true, waitingMessage: cardToEdit ? I18n.t("card.edit") : I18n.t("card.create")}, () => {
                if( cardToEdit ){
                    card.id = cardToEdit.id;
                    // Edit an existing card
                    // console.log("sendCardToServer edit", cardToEdit, card);
                    this.props.updateCardFormData( card, this.props.navigation.state.params.forceArchived, (updatedCard) => {
                        // console.log("updateCustomCard updatedCard", updatedCard);
                        this.setState( {waiting: false});
                        if( updatedCard ){
                            // If the card had a link, set the link
                            if( cardToEdit.next_page_id ){
                                updatedCard.next_page_id = cardToEdit.next_page_id;
                            }
                            
                            // Close this page
                            if(this.props.navigation.state.params.onCardEdited){
                                this.props.navigation.state.params.onCardEdited( updatedCard );
                            }
                        }
                        resolve(updatedCard);
                    });
                }
                else {
                    // Create a new card
                    // console.log("sendCardToServer create", card);
                    this.props.createCustomCardFormData( card, (createdCard) => {
                        // console.log("createCustomCard createdCard", createdCard);

                        // If needed, call the callback, then return the newly created card.
                        if(createdCard && this.props.navigation.state && this.props.navigation.state.params && this.props.navigation.state.params.onCardCreated){
                            this.props.navigation.state.params.onCardCreated( createdCard );
                        }
                        resolve(createdCard);
                    });
                }
            });
        });
        
    }

    /** Change the selection action */
    onSelectionActionChange = ( newSelectionAction, extra) => {
        switch( newSelectionAction ) {
            case "nothing":
                this.setState( {selectionAction: "nothing", selectionSound: null});
                break;
            case "play_sound":
                this.setState( {selectionAction: "play_sound", selectionSound: extra});
                break
            case "synthesize_label":
                this.setState( {selectionAction: "synthesize_label", selectionSound: null});
                break;;
            default:
                this.setState( {selectionAction: "synthesize_label", selectionSound: null});
                break;;
        }
    }

    render() {
        let me = this;


        //check that user inserted enough information to save the card
        const checkData = () => {
            if (me.state.level && me.state.level == 5) {
                if (me.state.label && me.state.tags) {
                    return true
                }
            }
            else if(me.state.level && me.state.level != 5){
                if (me.state.label && me.state.tags && me.state.asset) {
                    return true
                }
            }
            return false
        }

        return (

            <Container
                theme={theme}>
                <AirettSimpleHeader title={this.state.title}
                    leftIconName={"md-arrow-back"}
                    onLeftButtonPress={() => this.props.navigation.goBack()} />
                <Content contentContainerStyle={{padding: 20}}>

                    <EditCardView navigation={this.props.navigation}
                        label={this.state.label}
                        onChangeTextLabel={(label) => this.setState({label})}
                        imageAsset={this.state.asset ? this.state.asset : null}
                        imageUri={this.state.asset ? this.state.asset.path : null}
                        imageUrl={this.state.asset ? this.state.asset.url : null}
                        onImageImported={image => {
                            this.setState({asset: image})
                        }}
                        selectionAction={this.state.selectionAction}
                        selectionSound={this.state.selectionSound}
                        onSelectionActionChange={this.onSelectionActionChange}
                        tags={this.state.tags}
                        onChangeTextTags={(tags) => this.setState({tags})}
                        level={this.state.level}
                        onValueChangeLevel={(level) => this.setState({level})}
                        />
                    <SimpleButtonsRow 
                        confirmDisabled={this.state.waiting || !checkData()}
                        onConfirmPressed={this.onConfirmPressedDebounce}
                        debounceClose={true}
                        onClosePressed={() => this.props.navigation.goBack()}/>
                </Content>
                <MissingPatientModal
                    navigation={this.props.navigation}
                    visible={this.state.showMissingPatientModal}
                    isOpen={this.state.showMissingPatientModal}
                    closeModal={() => { this.setState({showMissingPatientModal: false});}}
                    />
                <LoadingModal
                    text={this.state.waitingMessage}
                    visible={this.state.waiting}
                    isOpen={this.state.waiting}
                    />
            </Container>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        ip: state.webSocketReducer.ip,
        currentPatient: state.authenticationReducer.currentPatient,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        send: (msg) => {
            dispatch(send(msg))
        },
        createCustomCard: (card, callback) => {dispatch(createCustomCard(card, callback))},
        createCustomCardFormData: (card, callback) => {dispatch(createCustomCardFormData(card, callback))},
        updateCard: (card, forceArchived, callback) => {dispatch(updateCard(card, forceArchived, callback))},
        updateCardFormData: (card, forceArchived, callback) => {dispatch(updateCardFormData(card, forceArchived, callback))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CardBuilderScreen);