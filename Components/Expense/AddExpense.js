import React from 'react'
import { View, Text} from 'react-native'
import { darkGreen } from "./Constants";
import Btn from "../Btn";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ScanBills from './ScanBills';
import RedirectToPaymentApps from './RedirectToPaymentApps';
import ManualAdditionOfExpense from './ManualAdditionOfExpense';

const Tab = createMaterialTopTabNavigator();

export default function AddExpense(props) {

    return (
        <Tab.Navigator>
          <Tab.Screen name="Scan Bills" component={ScanBills} />
          {/* <Tab.Screen name="Redirect To Payment Apps" component={RedirectToPaymentApps} /> */}
          <Tab.Screen name="Manual" component={ManualAdditionOfExpense} />
        </Tab.Navigator>
    )
}
