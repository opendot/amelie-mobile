import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

// components
import ContentOverlayLabel from "../../utils/contentOverlayLabel";

// third party
import { ListItem, Left, Body, Icon, Text } from 'native-base';
import Dimensions from 'Dimensions';

// styles
import theme from '../../themes/base-theme'

const margin = 2;

/** Show an image as a square */
export default class AudioGalleryItem extends React.Component {

    constructor( props){
        super(props);
    }

    /** Get a valid Icon based on the mime of the file */
    getIconName(audioMime) {
        let ss = audioMime.split("/");
        let extension = ss.length == 2 ? ss[1].toLowerCase() : null;
        switch(extension) {
            case "mpeg":
                return "md-musical-note";
            case "mpeg3":
                return "md-musical-note";
            case "x-wav":
                return "md-musical-note";
            default:
                return "md-musical-note";
        }
    }

    render() {
        let size =  (Dimensions.get('window').width -12*2)/this.props.numColumns -margin*2;
        if( this.props.square ){
            return (
                <TouchableOpacity style={[styles.container, {width: size}]} onPress={ () => this.props.onAudioPress( this.props.audio, this.props.index)} >
                    <View style={{width: size, height: size, backgroundColor: "white", justifyContent: "center", alignItems: "center",}}>
                        <Icon 
                            name={this.getIconName(this.props.audio.getMime())}
                            />
                        <ContentOverlayLabel
                            content={null} fontSize={12} />
                    </View>
                    <Text style={{fontSize: theme.btnTextSizeSmall}} numberOfLines={1}>{this.props.audio.getName()}</Text>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <ListItem icon style={styles.container} onPress={ () => this.props.onAudioPress( this.props.audio, this.props.index)} >
                    <Left>
                        <Icon name={this.getIconName(this.props.audio.getMime())} />
                    </Left>
                    <Body>
                        <Text style={{flex: 1, backgroundColor: "white", height: size, padding: 2,}}>
                            {this.props.audio.getName()}
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
    },
});
