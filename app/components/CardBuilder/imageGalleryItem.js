import React from 'react';
import {
    View, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import {connect} from 'react-redux';

// components
import I18n from '../../i18n/i18n';
import ContentOverlayLabel from "../../utils/contentOverlayLabel";

// third party
import { ListItem, Left, Body, Icon, Text } from 'native-base';
import Dimensions from 'Dimensions';
import debounce from "lodash/debounce";// Prevent double clicks

// actions
import { renderIf, getBase64String } from '../../utils/utils'

// styles
import theme, {baseStyles} from '../../themes/base-theme'

const margin = 2;

/** 
 * Show an image as a square
 * @param {ImageFile|VideoFile} image
 */
class ImageGalleryItem extends React.Component {

    constructor( props){
        super(props);

        this.state = {
            image: true,
        };

    }

    /** Get a valid Icon based on the extension of the file */
    getIconName(imageName) {
        let ss = imageName.split(".");
        let extension = ss[ss.length-1].toLowerCase();
        switch(extension) {
            case "jpg":
                return "md-image";
            case "jpeg":
                return "md-image";
            case "png":
                return "md-image";
            case "gif":
                return "md-image";
            case "bmp":
                return "md-image";
            case "mp3":
                return "md-musical-note";
            case "mp4":
                return "md-videocam";
            default:
                return "md-image";
        }
    }

    render() {
        let size =  (Dimensions.get('window').width -12*2)/this.props.numColumns -margin*2;
        let thumb = this.props.image.getThumbnail();
        if( this.state.image ){
            return (
                <TouchableOpacity style={styles.container} onPress={ () => this.props.onImagePress( this.props.image, this.props.index)} >
                    <Image style={{flex: 1, width: size, height: size,}}
                        source={ {uri: getBase64String( {mime: thumb.getMime(), data: thumb.getBase64Data()})} }
                        />
                    <ContentOverlayLabel
                        content={this.props.image} fontSize={12} />
                </TouchableOpacity>
            );
        }
        else {
            return (
                <ListItem icon style={styles.container} onPress={ () => this.props.onImagePress( this.props.image, this.props.index)} >
                    <Left>
                        <Icon name={this.getIconName(this.props.image.getName())} />
                    </Left>
                    <Body>
                        <Text style={{flex: 1, backgroundColor: "white", height: size, padding: 2,}}>
                            {this.props.image.getName()}
                        </Text>
                    </Body>
                </ListItem>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        margin: margin,
    }
});

const mapStateToProps = (state) => {
    return {
        serverUrl: state.authenticationReducer.serverUrl,
        currentPatient: state.authenticationReducer.currentPatient,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ImageGalleryItem);