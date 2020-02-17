import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

// component
import I18n from '../i18n/i18n';
import Dimensions from 'Dimensions';

// third party
import { Text } from 'native-base';

/** Show the list of cards selected by the user */
export default function CardList( props ){
    if( !props.cards || props.cards.length == 0){
        return (
            <View style={styles.cardListContainer}>
                <Text
                style={{textAlign:'center',marginTop:40,fontSize:40,color:'#ddd',marginLeft:10,marginRight:10,}}
                >
                    {I18n.t("write_tag")}
                </Text>
            </View>
        );
    }

    let gwidth = Dimensions.get('window').width;
    let cardWidth = 100 -props.cards.length*4;
    return (
        <View style={styles.cardListContainer}>
            {props.cards.map(function(card, i){
                return(
                    <TouchableOpacity
                        key={i}
                        onPress={() => {if( props.onCardPress){props.onCardPress(card, i)}}}
                        onLongPress={() => {if( props.onCardLongPress){props.onCardLongPress(card, i)}}}
                        style={{
                            width:cardWidth,
                            height:cardWidth+20,
                            }}>
                        <Image
                            style={{ resizeMode:'contain',
                                alignSelf: 'center',
                                backgroundColor:'white',
                                width:cardWidth,height:cardWidth}}
                            source={{uri: card.content.content_thumbnail}}
                        />
                        <Text style={{flex: 1, backgroundColor: "white", color:'black', textAlign: 'center', textAlignVertical: "center", padding:3, fontSize:10}}>{card.label.toUpperCase()}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({

    cardListContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#bbb',
    }
});