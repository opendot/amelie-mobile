import { Platform } from 'react-native';
import _ from 'lodash';

import variable from './../variables/platform';

export default (variables = variable) => {
  const platform = variables.platform;

  const iconTheme = {
    fontSize: variables.iconFontSize,
    color: '#000',
    textAlign: "center",
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: (platform === 'ios') ? 3 : 0,// after update to react native 0.58.5 icons on ios are not centered
  };


  return iconTheme;
};
