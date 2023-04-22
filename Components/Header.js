import React from 'react'
import { View, Text } from 'react-native'
import { darkGreen } from "./Constants"

export default function Header(props) {
    return (
        <View style={{marginLeft:15}}>
            <Text style={{fontWeight:"bold", fontSize:18, color:darkGreen}}>MoneyWise</Text>
        </View>
    )
}
