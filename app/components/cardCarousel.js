import React from 'react';
import {
    View,
    TouchableWithoutFeedback, Image, Text, Keyboard
} from 'react-native';
import { connect } from 'react-redux';

// Components
import PaginatedFlatList from '../utils/paginatedFlatList';
import VideoIcon from '../utils/videoIcon';
import I18n from '../i18n/i18n';

// third party
import { Icon } from "native-base";
import pageTheme from "../themes/page-theme";

/** Show the list of cards received from the server after a search */
class CardCarousel extends React.Component {

    onCardCreated = (card) => {
        this.props.onCardPress(card);
    }

    createQuery = ( page, searchFilter) => {
        return `cards?page=${page}${this.props.currentPatient ? `&patient_query=${this.props.currentPatient.id}` : ""}`+
        `${ this.props.searchText ? `&tag_query=${this.props.searchText}` : ""}` + 
        "&default_level=" + this.props.defaultLevel;
    }

    _renderItem = ({item, index}) => {
        //const {navigate} = this.props.navigation
        const margin = 2;
        const width = pageTheme.cardBaseWidth-margin*2;
        const height = pageTheme.cardBaseHeight-margin*2;
        const basicStyle = { width: width, height: height, margin: margin, backgroundColor: "white"};

        if( this.props.cardsFilter.filter( (c) => c.id === item.id).length > 0) {
            // Filter cards
            return null;
        }

        if( item.first ){
            // Allow to create a new page
            return (
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        this.props.navigation.navigate("cardBuilder", {onCardCreated: this.onCardCreated} );
                    }}
                >
                    <View style={[basicStyle, {justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "darkgray", backgroundColor: null}]} >
                        <Icon name={"md-add"} style={{fontSize: 48, color: "darkgray"}} />
                    </View>
                </TouchableWithoutFeedback>
            );
        }
        return (
            <TouchableWithoutFeedback
                disabled={!this.props.onCardPress}
                onPress={() => {this.props.onCardPress(item);}}
            >
                <View style={basicStyle}>
                    { item.content.type == "Text" ?
                    <Text style={{flex: 1, fontSize:14, backgroundColor: "white", color:"black",textAlign:'center', textAlignVertical:"center"}} numberOfLines={1}>{item.label.toUpperCase()}</Text>
                    :
                    <Image style={{width: width, height: width,resizeMode:'cover',alignSelf: 'center'}}
                        source={{uri:  item.content.content_thumbnail}}/>
                    }
                    <View style={{height:height-width,width:width}}>
                        <Text style={{fontSize:14,color:"#000",fontWeight:'bold',textAlign:'center'}} numberOfLines={1}>{item.label}</Text>
                    </View>
                    <VideoIcon type={item.content.type} totalScale={1} cardPadding={0} />
                </View>
            </TouchableWithoutFeedback>
        )
    }

    onDataAvailable = (cardList) => {
        return cardList.filter(this.filterCardList);
    }

    filterCardList = (card, index, list) => {
        // Hide cards defined in cardsFilter
        return this.props.cardsFilter.filter( (c) => c.id === card.id).length === 0;
    }

    render () {
        return (
            <View style={[{height: pageTheme.cardBaseHeight, maxHeight: pageTheme.cardBaseHeight, flexDirection: 'row'}, this.props.style]}>
                {this.props.allowCardCreation ? this._renderItem({item: {first: true}, index: -1}) : null}
                <PaginatedFlatList
                    ref={(list) => {this.props.onListRef ? (list ? this.props.onListRef(list) : null ): null;}}
                    keyboardShouldPersistTaps='always'
                    horizontal = {true}
                    renderItem={this._renderItem}
                    ItemSeparatorComponent={() => <View style={{width: 5, height:60}} />}
                    createQuery={this.props.createQuery || this.createQuery}
                    onDataAvailable={this.onDataAvailable}
                    emptyListMessage={I18n.t("empty_list")}
                    keyExtractor={ ( tree, index) => tree.id }
                />
            </View>
        )
    }
}

CardCarousel.defaultProps = {
    cardsFilter: [],    //  List of cards to not show in the carousel
};

const mapStateToProps = (state) => {
    return {
        ip: state.webSocketReducer.ip,
        currentPatient: state.authenticationReducer.currentPatient,
        defaultLevel: state.settingReducer.transparencyLevel
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CardCarousel);