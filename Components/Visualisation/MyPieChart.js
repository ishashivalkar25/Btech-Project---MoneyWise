import React from 'react'
import { StyleSheet, Text, View, Dimensions} from 'react-native'
import { PieChart } from 'react-native-chart-kit';

export default function MyPieChart(props) {

    const [data, setData] = React.useState([]);
    const [color, setColors] = React.useState([]);

    React.useEffect(()=>{
        var pieData = [];
        console.log(props.data, "*******************123456***************" );

        const r = 100;
        const g = 87;
        const b = 0;
        var i = 11;
        var l = props.data.length;
        props.data.forEach((item)=>{

            const tempData = {
                name : item.name ,       
                amount: item.amount ,  
                color :  'rgb(' + (i*r/l) + ',' + (i*g/l) + ',' + (i*b/l)+ ')',
                legendFontColor: '#7F7F7F',
                legendFontSize: 15,
            }
            pieData.push(tempData);
            i = i+1;
        })


        // setColors(colors);
        setData(pieData);
        // console.log(pieData, "Data");     
    }, [props.data])

    return (
      
            <PieChart
                data={data}
                width={350}
                height={150}
                chartConfig={{
                    backgroundColor: '#1cc910',
                    backgroundGradientFrom: '#eff3ff',
                    backgroundGradientTo: '#efefef',
                    decimalPlaces: 4,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="2"
                absolute //for the absolute number remove if you want percentage
            />
    )
}

const styles = StyleSheet.create({})
