import React, {useRef, useEffect} from 'react';
import {Animated, Text, View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
const FadeInView = props => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        opacity: fadeAnim, // Bind opacity to animated value
      }}>
      {props.children}
    </Animated.View>
  );
};

// You can then use your `FadeInView` in place of a `View` in your components:
export default Fading = () => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
      <FadeInView>
        <Text
          style={{
            fontSize: 43,
            textAlign: 'center',
            margin: 10,
            padding: 10,
            color: 'white',
            position: 'relative',
            zIndex: 5,
            fontFamily: 'Cochin',
            fontWeight: 'bold',
          }}>
          M
          <View style={styles.coinContainer}>
            <LottieView
              source={require('../../Assets/animation3.json')}
              autoPlay
              
              style={styles.animation}
            />
          </View>
          neyWise
        </Text>
      </FadeInView>
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  // },
  coinContainer: {
    overflow: 'hidden',
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 55,
    height: 63,
    position: 'relative',
    bottom: -8,
   
  },
  
});
