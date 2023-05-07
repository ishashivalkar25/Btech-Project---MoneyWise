import React from 'react'
import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import Background from "./Background";
import Btn from "./Btn";
import { green} from "./Constants";
import { useNavigation } from '@react-navigation/core';
import { auth } from '../Firebase/config' 
import {useSafeAreaInsets} from 'react-native-safe-area-context'; 

const Index = (props) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
        if(user && user.emailVerified){
            navigation.replace("Root");
            // console.log(user);
        }
        });
        return unsubscribe;
    }, []);
  
    return (
        <View style={{marginTop:insets.top}}>
        <ImageBackground
          source={require('../Assets/Background.jpg')}
          style={{width: '100%', height: '100%'}}
        >
           <View style={{marginTop:40}}></View>
            <View style={{ marginHorizontal: 50, marginVertical: 50 ,alignItems: 'center'}}>
                <Text style={{ color: "white", fontSize: 40, fontWeight: "bold" ,}}>
                Money<Text style={{ color: "orange", fontSize: 50, fontWeight: "bold" ,}}>W</Text>ise 
                </Text>
                <Text
                style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 40,
                }}
                >
               (Income & Expense Tracker)
                </Text>
                {/* <Lottie animationData={animation1} /> */}
            </View>
            
            <View
                style={{
                backgroundColor: "white",
                // marginTop: "700",
                height: 700,
                width: 420,
                borderTopLeftRadius: 140,
                borderTopEndRadius: 140,
                paddingTop: 80,
                marginTop:40
                }}
            >
                <View
                    style={{
                        backgroundColor: "lightgrey",
                        alignItems: "center",
                        // marginTop: "700",
                        height: 400,
                        width: 420,
                        borderTopLeftRadius: 140,
                        borderTopEndRadius: 140,
                        paddingTop: 80,
                    }}
                    >
                    <View
                        style={{
                        backgroundColor: "grey",
                        alignItems: "center",
                        // marginTop: "700",
                        height: 400,
                        width: 420,
                        borderTopLeftRadius: 140,
                        borderTopEndRadius: 140,
                        paddingTop: 80,
                        }}
                    >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                            }}
                            > 
                            <Btn
                                bgColor={green}
                                textColor="white"
                                btnLabel="Login"
                                Press={() => props.navigation.navigate("Login")}
                            />
                            <Btn
                                bgColor="white"
                                textColor={green}
                                btnLabel="Signup"
                                Press={() => props.navigation.navigate("Sign Up")}
                            />
                        </View>
                    </View>
                </View>
            </View>  
           
        </ImageBackground>
        </View>
    )
}

export default Index;

const styles = StyleSheet.create({})
