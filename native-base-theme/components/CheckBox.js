import { Platform } from 'react-native';
import _ from 'lodash';

import variable from './../variables/platform';


export default (variables = variable) => {
  const checkBoxTheme = {
      '.checked': {
        'NativeBase.Icon': {
          color: variables.checkboxTickColor,
        },
        'NativeBase.IconNB': {
          color: variables.checkboxTickColor,
        },
      },
      'NativeBase.Icon': {
        color: 'transparent',
        lineHeight: variables.CheckboxIconSize,
        marginTop: variables.CheckboxIconMarginTop,
        fontSize: variables.CheckboxFontSize,
      },
      'NativeBase.IconNB': {
        color: 'transparent',
        lineHeight: variables.CheckboxIconSize,
        marginTop: variables.CheckboxIconMarginTop,
        fontSize: variables.CheckboxFontSize,
      },
      borderRadius: variables.CheckboxRadius,
      borderColor: variables.checkboxBgColor,
      overflow: 'hidden',
      justifyContent: "center",
      alignItems: "center",
      width: variables.checkboxSize,
      height: variables.checkboxSize,
      borderWidth: variables.CheckboxBorderWidth,
      paddingLeft: variables.CheckboxPaddingLeft - 1,
      paddingTop: variables.CheckboxPaddingTop,
      paddingBottom: variables.CheckboxPaddingBottom,
      left: 10,
  };


  return checkBoxTheme;
};
