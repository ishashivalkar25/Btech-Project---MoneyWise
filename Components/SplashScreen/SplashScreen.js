import React, {useRef, useEffect, Component} from 'react';
import { Animated, Platform, StyleSheet, View, Text, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { auth } from '../../Firebase/config'

const FadeInView = (props) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
        }).start(() => {
            auth.onAuthStateChanged(user => {
                if(user && user.emailVerified){
                  props.navigation.replace("Root");
                }
                else
                {
                    props.navigation.replace("Login");
                }
              });
        });
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

export default function SplashScreen({navigation}) {
    
        return (
            <View style={styles.container}>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                    }}>
                    <FadeInView navigation={navigation}>
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
                            ney<Image
                            source={require('../../Assets/W2.png')}
                            style={{width: 38, height: 38,position: 'relative'}}/>ise
                        </Text>
                    </FadeInView>
                </View>
                <LottieView
                    source={require('../../Assets/animation1.json')}
                    autoPlay
                    loop={false}
                    style={styles.animation2}></LottieView>
            </View>
        );
   
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },

    animation2: {
        height: '100%',
        position: 'absolute',
        zIndex: -1,

    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        padding: 10,
        paddingTop: 10,
        backgroundColor: "pink",
        position: 'absolute',
        zIndex: 1
    },
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
