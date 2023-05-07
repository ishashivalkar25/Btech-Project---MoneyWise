import React from "react";
import { View, ImageBackground, ScrollView } from "react-native";

import {useSafeAreaInsets} from 'react-native-safe-area-context'; 

const Background = ({children}) => {

  // const insets = useSafeAreaInsets();
  return (
    
    // <View style={{marginTop:insets.top}}>
    <View>
      <ImageBackground
        source={require('../Assets/Background.jpg')}
        style={{width: '100%', height: '100%'}}
      >
        <ScrollView contentContainerStyle={{paddingBottom: 50}}>
          <View >{children}</View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Background;
