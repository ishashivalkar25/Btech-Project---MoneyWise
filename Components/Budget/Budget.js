import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    Image
} from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Dropdown } from 'react-native-element-dropdown';
import {
    auth,
    db,
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
} from '../../Firebase/config';
import { useNavigation } from '@react-navigation/core';
import SetBudget from './SetBudget';
// import CircularProgress from 'react-native-circular-progress-indicator';
import ViewBudget  from './ViewBudget';

const Tab = createBottomTabNavigator();

const Budget = ({ navigation }) => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: 'green',
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    elevation: 0,
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: 15,
                    borderTopRightRadius: 15,
                    height: 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "bold",
                    color: 'green',
                    paddingBottom: 10,
                },
                headerShown: false,
            }}>

            <Tab.Screen
                name="Your Budget"
                component={ViewBudget}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Image source={require('../../Assets/money-bag.png')} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }} 
                />
            <Tab.Screen
                name="Set Budget"
                component={SetBudget}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Image source={require('../../Assets/money-bag.png')} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }} />

        </Tab.Navigator>
    );
};
const styles = StyleSheet.create({
    header: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 10,
    },
    headerText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "bold"
    },
    monthlyInc: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 5,
        padding: 10,
    },
    monthlyIncText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "bold"
    },
    progressBarView: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 20,
        marginBottom: 5,
        marginHorizontal: 10,
        borderRadius: 10
    },
    categoryWiseBudget: {
        marginBottom: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        height: "52%",
        paddingBottom: 10,
    },
    categoryWiseBudgetTitle: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderBottomColor: 'grey',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: "100%",
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        height: 50,
        alignItems: "center"
    },
    categoryWiseBudgetTitleText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "green"
    },
    budgetCategory: {
        height: 100,
        fontSize: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.11)',
        marginBottom: 2
    },
    budgetCategoryName: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    budgetCategoryNameText: {
        fontWeight: "bold"
    },
    budgetCategoryText: {
        textAlignVertical: "center",
        fontWeight: "bold",
        fontSize: 15,
    },
    budgetCategoryAmount: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
    },
    budgetCategoryAmountCenter: {
        alignItems: "center"
    },
    noBudget: {
        padding: 10,
        fontSize: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    noBudgetText: {
        fontSize: 15,
        fontWeight: "bold",
        width: "50%"
    },
});
export default Budget;

