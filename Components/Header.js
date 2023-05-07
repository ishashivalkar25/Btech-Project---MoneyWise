import React from 'react'
import { View, Text } from 'react-native'
import { green } from "./Constants"

export default function Header(props) {
    return (
        <View style={{marginLeft:5}}>
            <Text style={{fontWeight:"bold", fontSize:18, color:green}}>MoneyWise</Text>
        </View>
    )
}
