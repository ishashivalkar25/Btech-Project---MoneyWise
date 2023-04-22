import React from 'react';
import {TextInput} from 'react-native';
import {darkGreen} from './Constants';

const Field = props => {
  return (
    <TextInput
      {...props}
      style={{borderRadius: 25, color: darkGreen, paddingHorizontal: 10, width: '70%', height:40, backgroundColor: 'rgb(220,220, 220)', marginVertical: 10}}
      placeholderTextColor={darkGreen}></TextInput>
  );
};

export default Field;

