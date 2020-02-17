import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default function PageColorSelector(props){
  return(
      <View style={[styles.pageColorsContainer, props.style]}>
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'red'}]} onPress={() => props.onColorSelected('red')}/>
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'yellow'}]} onPress={() => props.onColorSelected('yellow')} />
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'green'}]} onPress={() => props.onColorSelected('green')} />
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'skyblue'}]} onPress={() => props.onColorSelected('skyblue')} />
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'white'}]} onPress={() => props.onColorSelected('white')} />
          <TouchableOpacity style={[styles.colorBox, {backgroundColor: 'black'}]} onPress={() => props.onColorSelected('black')} />
      </View>
  );
}

const styles = StyleSheet.create({
    pageColorsContainer: {
        width: 25,
        maxWidth: 25,
        flexDirection: 'column',
        height: '100%',
        borderColor: 'grey',
        borderWidth: 1
    },
    colorBox: {
        flex: 1
    }
});