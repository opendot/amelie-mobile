
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

// third party
import { ListItem } from 'native-base';

// styles
import theme from "../../themes/base-theme";

export default function BoxItem(props) {
    // if exercise already executed, get ththis date withou taking into account hours and minutes
    let availableDate = new Date((props.box.last_completed_exercise_tree_at) ? (props.box.last_completed_exercise_tree_at.substr(0, 10)) : "1970-01-01");
    // increment the date to set the available date as the beginning of the next day
    availableDate.setDate(availableDate.getDate() + 1)
    let currentDate = new Date();
    let completed = Math.ceil(100 * props.box.progress)
    let available = props.box.status === "available" && (currentDate >= availableDate)
    return (
        <ListItem button={false} onPress={(available) ? () => props.onItemPress(props.box) : null} style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0}}>
            <View style={(available) ? styles.boxContainer : [styles.boxContainer, {opacity: 0.6}]}>
                <View style={styles.boxText}>
                    <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.boxTitle}>
                        {props.box.box_name}
                    </Text>
                </View>
                <View style={styles.boxData}>
                    <View style={styles.boxProgressBar}>
                        <View style={{flex: completed, backgroundColor: '#424242'}} />
                        <View style={{flex: (100 - completed), backgroundColor: 'white'}} />
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <Text style={styles.boxCompleted}>{completed} %</Text>
                    </View>
                </View>
            </View>
        </ListItem>
    );
}

const styles = StyleSheet.create({
    boxContainer: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: theme.brandPrimary,
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.inverseTextColor,
    },
    boxTitle: {fontSize: theme.fontSizeBase + 1,
        color: theme.inverseTextColor,
        fontWeight: 'bold',
        justifyContent: 'flex-start',
        marginLeft: 25
    },
    boxText: {
        flex: 1,
        paddingRight: 30
    },
    boxData: {
        justifyContent: 'flex-end',
        width: 90, 
        marginRight: 25
    }, 
    boxCompleted: {
        color: theme.inverseTextColor,
        fontWeight: 'bold'
    },
    boxProgressBar: {
        flexDirection: 'row',
        height: 8
    }
});