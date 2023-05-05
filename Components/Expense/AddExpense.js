import React from 'react'
import { View, Text, Dimensions} from 'react-native'
import Btn from "../Btn";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ScanBills from './ScanBills';
import RedirectToPaymentApps from './RedirectToPaymentApps';
import ManualAdditionOfExpense from './ManualAdditionOfExpense';
const { height, width } = Dimensions.get('window');
const Tab = createMaterialTopTabNavigator();

export default function AddExpense(props) {

    return (
        <Tab.Navigator
            screenOptions={{
            tabBarLabelStyle: { 
                fontSize: 13,
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
          <Tab.Screen name="Scan Bills" component={ScanBills} />
          <Tab.Screen name="Redirect To Payment Apps" component={RedirectToPaymentApps} />
          <Tab.Screen name="Manual" component={ManualAdditionOfExpense} />
        </Tab.Navigator>
    )
}
