import React from "react";
import {View, Image, StyleSheet} from "react-native";

// component
import I18n from "../../i18n/i18n";
import CardCarousel from "../cardCarousel";

// third party
import { Button, Text } from "native-base";

// action
import { isCardImage } from "../../actions/CardActions";

// styles
import theme from "../../themes/base-theme";
import pageTheme from "../../themes/page-theme";

/** Screen used to select the video for the calibration */
export default class CalibrationVideoSelectionView extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            contentWidth: -1,
            contentHeight: -1,
            selectedCard: null,
        };
    }

    /** Measure width and height of the Content component for the CardCarousel */
    onContentLayout = (evt) => {
        this.setState({
            contentWidth: evt.nativeEvent.layout.width,
            contentHeight: evt.nativeEvent.layout.height,
        });
    }

    /** For the calibration get only Video longer than 1 minute */
    createQuery = ( page, searchFilter) => {
        return `cards?page=${page}${this.props.currentPatient ? `&patient_query=${this.props.currentPatient.id}` : ""}`+
        `${ this.props.searchText ? `&tag_query=${this.props.searchText}` : ""}` + 
        `&content=Video&content_longer_than=59`;
    }

    onCarouselCardPress = (card) => {
        if( card && card.content && card.content.type == "Video") {
            this.setState({selectedCard: card});
        }
    }

    onStartTrainingPress = () => {
        if( this.props.onStartTrainingPress ) {
            this.props.onStartTrainingPress(this.state.selectedCard);
        }
    }

    render() {
        return (
            <View style={styles.main} onLayout={this.onContentLayout} >

                <CardItem card={this.state.selectedCard} />

                <CardCarousel style={{width: this.state.contentWidth, backgroundColor: pageTheme.carouselBackground}}
                    allowCardCreation={false}
                    navigation={this.props.navigation}
                    createQuery={this.createQuery}
                    onCardPress={this.onCarouselCardPress}
                    />

                <Button block primary style={this.props.buttonStyle} onPress={this.onStartTrainingPress}>
                    <Text uppercase>{I18n.t("eyetrackerCalibration.start_training")}</Text>
                </Button>
            </View>
        );
    }
}

function CardItem(props) {
    if(props.card) {
        return (
            <View style={cardStyles.main}>
                { props.card.content.type == "Text" ?
                 <Text style={cardStyles.text}>{props.card.label.toUpperCase()}</Text>
                :
                <View style={cardStyles.imageContainer}>
                    <Image
                        style={cardStyles.image}
                        source={{uri: isCardImage(props.card.content.type) ? props.card.content.content : props.card.content.content_thumbnail}}
                    />
                    <Text style={cardStyles.text} numberOfLines={1}>{props.card.label.toUpperCase()}</Text>
                </View>
                }
            </View>
        );
    }
    else {
        return (
            <View style={cardStyles.main}>
                <Text style={cardStyles.text}>{I18n.t("eyetrackerCalibration.selectVideo")}</Text>
            </View>
        );
    }
    
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
});

const cardStyles = StyleSheet.create({
    main: {
        width: 192,
        height: 192,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },

    imageContainer: {
        flex: 1,
        backgroundColor: "white",
    },

    image: {
        flex: 1,
        resizeMode:'contain',
        alignSelf: 'center',
        backgroundColor:'white',
        width: 192,
    },

    text: {
        color:'#000',
        textAlign: 'center',
        padding:3,
        fontSize:16,
        fontWeight: 'bold',
    },
});