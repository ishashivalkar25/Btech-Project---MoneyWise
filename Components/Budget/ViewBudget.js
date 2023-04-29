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

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function ViewBudget({route}) {

    const [date, setDate] = React.useState(new Date());
    const [budget, setBudget] = React.useState({"budget": [], "method": "", "monthlyInc": 0, "saving": 0,  "totalBudget": 0});
    

    const fetchBudget = async() => {

        try{
            const recordId = months[date.getMonth()] + ""+ date.getFullYear();
            const budgetForCurrMonth = await getDoc(doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1", "Budget", recordId));
            console.log(budgetForCurrMonth.data());
            if(budgetForCurrMonth.data()!=null)
            {
                setBudget(budgetForCurrMonth.data());
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }

    React.useEffect(() => {
        fetchBudget();
    }, [route.params]);

    React.useEffect(() => {
        console.log(budget, " budget");
        console.log(budget.budget)
    }, [budget]);

    return (
        <SafeAreaView>
           <View style={styles.header}>
                <Text style={styles.headerText}>{months[date.getMonth()] + " " + date.getFullYear()}</Text>
                <Text style={styles.headerText}>Budgeting Method : {budget.method}</Text>
            </View>

            <View style={styles.monthlyInc}>
                <Text style={styles.monthlyIncText}>Monthly Income : {budget.monthlyInc}</Text>
            </View>
            <View style={styles.categoryWiseBudget}>
                {budget.method==='50-30-20' && 
                <View>
                    <FlatList
                data={budget.budget.needs}
                ListHeaderComponent={
                    <View style={styles.categoryWiseBudgetTitle}>
                        <Text style={styles.categoryWiseBudgetTitleText}>Needs : </Text>
                        {/* <TouchableOpacity style={styles.button}>
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: "green" }} />
                            </TouchableOpacity> */}
                    </View>
                }
                renderItem={({ item }) =>
                //     {budget.method==="50-30-20" && 
                    <View>
                        <View style={styles.budgetCategory}>
                        <View style={styles.budgetCategoryName}>
                            <Text style={styles.budgetCategoryNameText}>{item.category}</Text>
                        </View>
                        <View style={styles.budgetCategoryAmount}>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget spent</Text>
                                <Text>{item.budgetSpent}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget Planned</Text>
                                <Text>{item.budgetPlanned}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Remaining</Text>
                                <Text>{item.budgetPlanned - item.budgetSpent}</Text>
                            </View>
                        </View>
                        </View>
                </View>
                // }

                }
                ListEmptyComponent={
                    <View style={styles.noBudget}>
                        <Image source={require('../../Assets/no-data.png')} style={{ width: 100, height: 100 }} />
                        <Text style={styles.noBudgetText}>You haven't set budget for the Month!</Text>
                    </View>
                }
            // extraData={isBudgetChanged}
            />

        <FlatList
                data={budget.budget.wants}
                ListHeaderComponent={
                    <View style={styles.categoryWiseBudgetTitle}>
                        <Text style={styles.categoryWiseBudgetTitleText}>Wants : </Text>
                        {/* <TouchableOpacity style={styles.button}>
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: "green" }} />
                            </TouchableOpacity> */}
                    </View>
                }
                renderItem={({ item }) =>
                //     {budget.method==="50-30-20" && 
                    <View>
                        <View style={styles.budgetCategory}>
                        <View style={styles.budgetCategoryName}>
                            <Text style={styles.budgetCategoryNameText}>{item.category}</Text>
                        </View>
                        <View style={styles.budgetCategoryAmount}>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget spent</Text>
                                <Text>{item.budgetSpent}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget Planned</Text>
                                <Text>{item.budgetPlanned}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Remaining</Text>
                                <Text>{item.budgetPlanned - item.budgetSpent}</Text>
                            </View>
                        </View>
                        </View>
                </View>
                // }

                }
                ListEmptyComponent={
                    <View style={styles.noBudget}>
                        <Image source={require('../../Assets/no-data.png')} style={{ width: 100, height: 100 }} />
                        <Text style={styles.noBudgetText}>You haven't set budget for the Month!</Text>
                    </View>
                }
            // extraData={isBudgetChanged}
            />

            <FlatList
                data={budget.budget.savings}
                ListHeaderComponent={
                    <View style={styles.categoryWiseBudgetTitle}>
                        <Text style={styles.categoryWiseBudgetTitleText}>Savings : </Text>
                        {/* <TouchableOpacity style={styles.button}>
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: "green" }} />
                            </TouchableOpacity> */}
                    </View>
                }
                renderItem={({ item }) =>
                //     {budget.method==="50-30-20" && 
                    <View>
                        <Text style={styles.categoryWiseBudgetTitleText}>Needs : </Text>
                        <View style={styles.budgetCategory}>
                        <View style={styles.budgetCategoryName}>
                            <Text style={styles.budgetCategoryNameText}>{item.category}</Text>
                        </View>
                        <View style={styles.budgetCategoryAmount}>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget spent</Text>
                                <Text>{item.budgetSpent}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Budget Planned</Text>
                                <Text>{item.budgetPlanned}</Text>
                            </View>
                            <View style={styles.budgetCategoryAmountCenter}>
                                <Text>Remaining</Text>
                                <Text>{item.budgetPlanned - item.budgetSpent}</Text>
                            </View>
                        </View>
                        </View>
                </View>
                // }

                }
                ListEmptyComponent={
                    <View style={styles.noBudget}>
                        <Image source={require('../../Assets/no-data.png')} style={{ width: 100, height: 100 }} />
                        <Text style={styles.noBudgetText}>You haven't set budget for the Month!</Text>
                    </View>
                }
            // extraData={isBudgetChanged}
            />
                </View>
                }

                {(budget.method==='Envelop Method' || budget.method==='Zero Based Budgeting')  &&
                <FlatList
                    data={budget.budget}
                    ListHeaderComponent={
                        <View style={styles.categoryWiseBudgetTitle}>
                            <Text style={styles.categoryWiseBudgetTitleText}>Budget : </Text>
                            {/* <TouchableOpacity style={styles.button}>
                                    <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: "green" }} />
                                </TouchableOpacity> */}
                        </View>
                    }
                    renderItem={({ item }) =>
                        <View style={styles.budgetCategory}>
                            <View style={styles.budgetCategoryName}>
                                <Text style={styles.budgetCategoryNameText}>{item.category}</Text>
                                {/* <TouchableOpacity style={styles.button}>
                                        <Image source={require('../../Assets/remove.png')} style={{ width: 25, height: 25, tintColor: "#cc1d10" }} />
                                    </TouchableOpacity> */}
                            </View>
                            <View style={styles.budgetCategoryAmount}>
                                <View style={styles.budgetCategoryAmountCenter}>
                                    <Text>Budget spent</Text>
                                    <Text>{item.budgetSpent}</Text>
                                </View>
                                <View style={styles.budgetCategoryAmountCenter}>
                                    <Text>Budget Planned</Text>
                                    <Text>{item.budgetPlanned}</Text>
                                </View>
                                <View style={styles.budgetCategoryAmountCenter}>
                                    <Text>Remaining</Text>
                                    <Text>{item.budgetPlanned - item.budgetSpent}</Text>
                                </View>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.noBudget}>
                            <Image source={require('../../Assets/no-data.png')} style={{ width: 100, height: 100 }} />
                            <Text style={styles.noBudgetText}>You haven't set budget for the Month!</Text>
                        </View>
                    }
                // extraData={isBudgetChanged}
                />}
            </View>
        </SafeAreaView>
    );
}

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
        height: "100%",
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
