import React from 'react';
import {
    View, Keyboard, StyleSheet, TouchableOpacity, TextInput
} from 'react-native';
import { connect } from 'react-redux';

// components
import I18n from '../i18n/i18n';
import ContentThumbnail from "../utils/contentThumbnail";
import ContentOverlayLabel from "../utils/contentOverlayLabel";
import { renderIf } from "../utils/utils"

// third party
import {
    Body, Label, Icon, Text, Item, CheckBox, Button, ActionSheet, Right
} from 'native-base';
import Autocomplete from "react-native-autocomplete-input";
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { getAllCardTags } from "../actions/CardActions";
import { showErrorModal } from "../actions/ModalAction";

// styles
import theme from "../themes/base-theme";

const CARD_AUDIO_ACTIONSHEET = {
    BUTTONS: [ I18n.t("cardSelectionAction.speechSynthesizer"), I18n.t("other"), I18n.t("undo")],
    DESTRUCTIVE_INDEX: -1,
    CANCEL_INDEX: 2,
};

const CARD_LEVEL_ACTIONSHEET = {
    BUTTONS: [ I18n.t("cardLevel.l1"), I18n.t("cardLevel.l2"), I18n.t("cardLevel.l3"), I18n.t("cardLevel.l4"), I18n.t("cardLevel.l5"), I18n.t("undo")],
    DESTRUCTIVE_INDEX: -1,
    CANCEL_INDEX: 5,
};

/** View used to edit the card properties */
class EditCardView extends React.Component {
    constructor(props) {
        super(props);
    }

    onContentSelected = (asset) => {
        console.log("EditCardView onContentSelected", asset);
        if( asset.mime.startsWith("image")){
            this.props.onImageImported(asset);
        }
        else if( asset.mime.startsWith("video")){
            this.props.onImageImported(asset);
        }
        if( this.props.level == 5) {
            // The image was a Text, change the level to make the new image visible
            this.props.onValueChangeLevel(1);
        }
    }

    /**
     * Open the page used to select a file from the computer
     */
    openContentSelection = () => {
        Keyboard.dismiss();
        this.props.navigation.navigate("ContentImporter", 
            {type: "image/video", onContentSelected: this.onContentSelected});
    }

    /** Clear the current image */
    deleteImage = () => {
        this.props.onImageImported(null);
        if( this.props.level == 5) {
            // The image is a Text, just change the level
            this.props.onValueChangeLevel(1);
        }
    }

    /** Generate the list of possible selection actions */
    getSelectionActionList = () => {
        switch( this.props.selectionAction) {
            case "nothing":
                return CARD_AUDIO_ACTIONSHEET.BUTTONS;
            case "play_sound":
                let playSoundButtons = CARD_AUDIO_ACTIONSHEET.BUTTONS.slice(0);
                console.log("getSelectionActionList "+this.props.selectionAction, playSoundButtons)
                playSoundButtons.unshift(this.props.selectionSound.getName());
                return playSoundButtons;
            case "synthesize_label":
                return CARD_AUDIO_ACTIONSHEET.BUTTONS;
        }
    }

    /** Change card selection action */
    onSelectionActionChange = ( buttonIndex ) => {
        let currentList = this.getSelectionActionList();
        switch( currentList[buttonIndex] ) {
            case I18n.t("cardSelectionAction.speechSynthesizer"):
                // Just say the name of the card
                this.props.onSelectionActionChange("synthesize_label");
                break;
            case I18n.t("other"):
                // Load an audio
                this.props.navigation.navigate("ContentImporter", 
                    {type: "audio", onContentSelected: this.onContentAudioSelected});
                break;
        }
    }

    onContentAudioSelected = ( audio ) => {
        // console.log("EditCardView onContentAudioSelected ", audio);
        if( audio ){
            this.props.onSelectionActionChange( "play_sound", audio);
        }
    }

    onCheckboxChecked = () => {this.props.onValueChangeLevel(this.props.level == 5 ? 1 : 5);}

    onAudioButtonPressed = () =>{
        let selectionActionList = this.getSelectionActionList();
        ActionSheet.show(
        {
            options: selectionActionList,
            cancelButtonIndex: selectionActionList.length-1,
            destructiveButtonIndex: CARD_AUDIO_ACTIONSHEET.DESTRUCTIVE_INDEX,
            title: I18n.t("audio"),
        },
        this.onSelectionActionChange)
    }

    onLevelButtonPressed = () =>{
        ActionSheet.show(
        {
            options: CARD_LEVEL_ACTIONSHEET.BUTTONS,
            cancelButtonIndex: CARD_LEVEL_ACTIONSHEET.CANCEL_INDEX,
            destructiveButtonIndex: CARD_LEVEL_ACTIONSHEET.DESTRUCTIVE_INDEX,
            title: I18n.t("level"),
        },
        buttonIndex => {
            if( buttonIndex>= 0 && buttonIndex < 5) {
                this.props.onValueChangeLevel(buttonIndex+1);
            }
        })
    }

    onChangeTextLabel = (newLabel) => {
        if( this.props.onChangeTextLabel ) {
            this.props.onChangeTextLabel(newLabel);
        }

        if( this.props.onChangeTextTags ) {
            // If there aren't tags, set the label as tag
            if( this.props.tags.length == 0
                || (this.props.tags.length == 1 && this.props.tags[0].tag == this.props.label) ) {
                this.props.onChangeTextTags([{tag: newLabel}]);
            }
        }
    }

    render() {
        const audioDisabled = this.props.imageAsset && this.props.imageAsset.getType() == "video";
        return (
            <View style={styles.mainContainer}>

                <Item stackedLabel style={styles.inputRow}>
                    <Label>{I18n.t("label")}</Label>
                    <View style={{backgroundColor: 'white', flex: 1, alignSelf: 'stretch'}}>
                        <TextInput
                            style={styles.inputText}
                            onChangeText={this.onChangeTextLabel}
                            value={this.props.label}
                        />
                    </View>
                </Item>

                <Item stackedLabel style={[styles.inputRow, {flexDirection: "row", height: 32}]}>
                    <CheckBox checked={this.props.level == 5}
                        onPress={ this.onCheckboxChecked }
                    />
                    <Body style={{flex: 1, alignItems: "flex-start", marginLeft: 16}}>
                    <Text>{I18n.t("card.labelAsImage")}</Text>
                    </Body>
                </Item>

                <View style={styles.imageRow}>
                    <Label>{I18n.t("image")}</Label>
                    <ImageImporter 
                        content={this.props.imageAsset}
                        imageLabel={this.props.level == 5 ? this.props.label : null}
                        onImportPress={this.openContentSelection}
                        onDeletePress={this.deleteImage}
                        />
                </View>

                <View style={styles.pickerRow}>
                    <Label>{I18n.t("audio")}</Label>
                    <Button transparent full dark 
                        disabled={audioDisabled}
                        style={{backgroundColor: "white", justifyContent: "flex-start"}}
                        onPress={this.onAudioButtonPressed}
                    >
                        <Text style={{color: audioDisabled ? "gray" : "black"}} numberOfLines={1}>{this.getSelectionActionList()[0]}</Text>
                        <Right><Icon style={{fontSize: theme.iconSizeSmall, color: audioDisabled ? "gray" : "black"}} name={"ios-arrow-down"} /></Right>
                    </Button>
                </View>

                <TagsView
                    tags={this.props.tags}
                    onChangeTextTags={this.props.onChangeTextTags}
                    getAllCardTags={this.props.getAllCardTags}
                    />

                <View style={styles.pickerRow}>
                    <Label>{I18n.t("level")}</Label>
                    <Button transparent full dark style={{backgroundColor: "white", justifyContent: "flex-start"}}
                        onPress={this.onLevelButtonPressed}
                    >
                        <Text>{CARD_LEVEL_ACTIONSHEET.BUTTONS[this.props.level-1]}</Text>
                        <Right><Icon style={{fontSize: theme.iconSizeSmall}} name={"ios-arrow-down"} /></Right>
                    </Button>
                </View>

            </View>
        );
    }
}

/**
 * Allow to import an Image from gallery or camera or user PC, and show the loaded image.
 * Images are squared, they're always cropped, while video kepps they're ratio.
 * @param {File} content contains the base64 { mime: string, data: string}
 */
function ImageImporter( props ){
    let hasImage = props.content || props.imageLabel;
    let iconSize = hasImage ? 22 : 28;

    // Show the image and the buttons to import image,
    // if there is an image the buttons are small without text

    return (
        <View style={{flex: 1, flexDirection: "row", justifyContent: "center", paddingTop: 18}} >
            <TouchableOpacity style={{justifyContent: "center"}}
                    onPress={props.onImportPress}
                >
                <ContentThumbnail
                    content={props.content}
                    imageLabel={props.imageLabel}
                    emptyIconName={"md-create"}
                    />
                <ContentOverlayLabel content={props.content} style={{marginHorizontal: 8, marginBottom: 7}} fontSize={theme.fontSizeBase}/>
                {renderIf( hasImage, 
                    <Button light rounded small disabled style={{position: "absolute", alignSelf: "center", backgroundColor: "white", opacity: 0.84,}} ><Icon style={{color: "darkgray"}} name={"md-create"} /></Button>)}
            </TouchableOpacity>
            <Button icon dark rounded small disabled={!hasImage}
                style={{alignSelf: "flex-end"}}
                onPress={props.onDeletePress}
                >
                <Icon name={"ios-trash"} />
            </Button>
        </View>
    );
}

/** Show an array of Tag objects */
class TagsView extends React.Component {

    state = {
        suggestedTags: [],
        hideSuggestions: false,// Prevent the suggestions from staying alwais open with a timeout
        lastChangeText: Date.now(),
    };

    /** Map the comma-separated string into an array  */
    onChangeTags = ( tagsString ) => {
        let tags = tagsString.split(",");
        let cardTags = tags.map( (tag, index) => { return {tag: tag.trim()}});
        if( this.props.onChangeTextTags ){
            this.props.onChangeTextTags( cardTags );
        }
        this.updateSuggestedTagsDebounce(cardTags[cardTags.length-1].tag);
        
        this.hideSuggestions();
    }

    onTagPress = (newTag) => {
        if( this.props.onChangeTextTags ){
            let tempTags = JSON.parse(JSON.stringify(this.props.tags));
            tempTags[tempTags.length -1].tag = newTag
            this.props.onChangeTextTags(tempTags);

            this.updateSuggestedTags(newTag);
        }
    }

    updateSuggestedTags = ( searchText ) => {
        this.props.getAllCardTags(searchText, 1, (cardTagsList) => {
            if( cardTagsList ) {
                this.setState({suggestedTags: cardTagsList.map((cardTag) => cardTag.tag)});
            }
        });
    }

    updateSuggestedTagsDebounce = debounce(this.updateSuggestedTags, 250, {leading: false, trailing: true});

    /** Hide suggestions if nothing happens for 3 seconds */
    hideSuggestions = () => {
        this.setState({hideSuggestions: false, lastChangeText: Date.now()}, () => {
            const time = 3000;
            setTimeout(() => {
                if( Date.now() - this.state.lastChangeText > time) {
                    this.setState({hideSuggestions: true});
                }
            }, time+500);
        })
    }

    renderSuggestedTag = (item) => {
        return (
            <TouchableOpacity style={styles.suggestedTagContainer} onPress={() => this.onTagPress(item)}>
                <Text numberOfLines={1}>{item}</Text>
            </TouchableOpacity>
        );
    }

    render(){
        // Map the array into a string
        let tagsString = null;
        this.props.tags.forEach( (tag, index) => {
            if( index == 0){ tagsString = tag.tag}
            else { tagsString += `,${tag.tag}`}
        });

        return (
            <View style={[styles.inputRow, styles.tagsViewContainer]}>
                <Label>{I18n.t("tags")}</Label>
                <View style={styles.autocompleteContainer}>
                    <Autocomplete invertList
                        inputContainerStyle={styles.autocompleteInputContainer}
                        listStyle={styles.autocompleteList}
                        data={this.state.suggestedTags}
                        hideResults={ this.state.hideSuggestions }
                        value={tagsString}
                        onChangeText={this.onChangeTags}
                        renderItem={this.renderSuggestedTag}
                        />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        zIndex: 5,
    },
    inputRow: {
        minHeight: 60,
        marginBottom: 20,
    },
    imageRow: {
        height: 156,
        marginBottom: 20,
    },
    assetContainer: {
        width: "80%",
        marginLeft: "10%",
        paddingTop: 12,
        flexDirection: "row",
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    pickerRow: {
        height: 60,
        marginBottom: 40,
    },
    pickerIcon: {
        alignSelf: "center",
        fontSize: 28,
        color: '#444'
    },
    pickerText: {
        alignSelf: "center",
    },
    tagsViewContainer: {
        height: 64,
        zIndex: 5,
        elevation: 5,
    },
    autocompleteContainer: {// Necessary for react-native-autocomplete-input with Android
        flex: 1,
        left: 0,
        position: "absolute",
        right: 0,
        bottom: 0,
        zIndex: 5,
        elevation: 5,
    },
    autocompleteInputContainer: {
        borderWidth: null,
    },
    autocompleteList: {
        margin: null,
        elevation: 5,
    },
    inputText: {
        backgroundColor: "white",
        fontSize: 12,
        flex: 1,
        alignSelf: 'stretch',
        marginLeft: 12,
        marginRight: 12
    },
    suggestedTagContainer: {
        padding: 4,
    },
});

const mapStateToProps = (state) => {
    return {
        ip: state.webSocketReducer.ip,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllCardTags: ( searchText, page, callback) => {dispatch(getAllCardTags(searchText, page, callback))},
        showErrorModal: ( title, text) => {dispatch(showErrorModal(title, text))},
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditCardView);