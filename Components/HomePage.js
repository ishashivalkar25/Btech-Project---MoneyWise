import * as React from "react";
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableOpacity,
    Dimensions,
    FlatList,

} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db, collection, getDocs, doc } from "../Firebase/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from '@react-navigation/core';
import Background from './Background';
import MyPieChart from "./Visualisation/MyPieChart.js"
import { darkGreen } from "./Constants"
import Income from './Income/Income'
import Expense from './Expense/Expense'

const Tab = createMaterialTopTabNavigator();
const { height, width } = Dimensions.get('window');
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


function MyTabs({ navigation }) {

    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { 
                    fontSize: 15,
                    fontWeight : 'bold'
                },
                tabBarStyle: {
                    fontSize: 20,
                },
                tabBarActiveTintColor: "green",
                tabBarInactiveTintColor: "grey",
                tabBarAndroidRipple: { borderless: false },
                tabBarPressColor : "green",
            }}
            initialLayout = {{
                width : width
            }}
            
        >
            <Tab.Screen name="Income" component={Income} />

            <Tab.Screen
                name="Expense"
                component={Expense}
                options={{ tabBarLabel: "Expense" }}
            />
        </Tab.Navigator>
    );
}


export default function HompePage(props) {
    const navigation = useNavigation();
    React.useEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <View style={styles.header_right}>
                    <TouchableOpacity onPress={() => { navigation.navigate("Visualisation"); }}>
                        <Image
                            source={require("../Assets/visualization.png")}
                            style={{ width: 25, height: 25, alignSelf: "center" }}
                        />
                    </TouchableOpacity>
                    {/* <TouchableOpacity onPress={signOutFromAcc}>
                        <Image
                            source={require("../Assets/log-out.png")}
                            style={{ width: 25, height: 25, alignSelf: "center" }}
                        />
                    </TouchableOpacity> */}
                </View>
            ),
        });
    }, [props.navigation]);

    // const signOutFromAcc = () => {
    //     auth
    //         .signOut()
    //         .then(() => {
    //             navigation.replace("Login");
    //             console.log("Sign out");
    //         })
    //         .catch((error) => alert("Cannot signout from the application!!"));
    // };
    return (
        // <NavigationContainer independent={true}>
        <View style={{ flex: 1, flexDirection: "column" }}>
            <MyTabs navigation={props.navigation} />
            {/* <Background></Background> */}
        </View>
        // </NavigationContainer>
    );
}
const styles = StyleSheet.create({
    header_right: {
        flexDirection: 'row',
        justifyContent: "space-between",
        width: 50,
        marginRight : 10,
    },
    container: {
        backgroundColor: "white",
        margin: 10,
        padding: 10,
        borderRadius: 20,
        height: "40%",
    },
    records_filter: {
        flexDirection: 'row',
        justifyContent: "space-around",
        textAlign: "center",
        height: "15%",
        padding: 5,
        color:"black",
        backgroundColor: darkGreen,
        borderRadius:5,

    },
    choose_filter: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    choose_filter_date: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    total_amt: {
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
    },
    no_records :{
        alignItems: "center",
        padding : 10,
        fontWeight:"bold"
    },
    amt_circle: {
        width: 150,
        height: 150,

        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: 100,
        backgroundColor: 'skyblue',
        shadowColor: 'black',
        shadowOffset: {
            width: 5,
            height: 5,
        },
        shadowOpacity: 0.5,
        elevation: 10,

    },
    amt_circle_text: {
        color: "green",
        fontWeight: "bold",
        fontSize: 20
    },
    amt_heading: {
        color: "green",
        fontWeight: "bold",
        fontSize: 23,
        width: 100,
        textAlign: "center"
    },
    record_container:{
        marginLeft: 10,
        marginRight: 10,
        padding: 0,
        borderRadius: 20,
        height:350,
        flexDirection:'row',
        justifyContent:'space-between',
    },
    record:{
        flexDirection: 'row',
        justifyContent: "space-around",
        backgroundColor: 'white',
        height:75,
        borderRadius:15,
        marginBottom:10,
        padding:15
    },
    cat: {
        color:'grey',
        fontSize:18
       },
       amt : {
        fontSize :22,
        fontWeight:'bold'
       },
       dt :{
        fontSize :15,
        marginTop:10,
        fontWeight:'bold'
       }
});
