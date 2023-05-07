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
    Image,
    Pressable,
    Dimensions,
    ImageBackground
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
    deleteDoc
} from '../../Firebase/config';
import { useNavigation } from '@react-navigation/core';
import SetBudget from './SetBudget';
import MonthPicker from 'react-native-month-year-picker';
import { green } from '../Constants';
// import CircularProgress from 'react-native-circular-progress-indicator';
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function ViewBudget({ route, navigation }) {

    const [date, setDate] = React.useState(new Date());
    const [budget, setBudget] = React.useState({ "budget": [], "method": "", "monthlyInc": 0, "saving": 0, "totalBudget": 0 });
    const [show, setShow] = React.useState(false);


    const setHeaderOptions = () => {
        navigation.getParent().setOptions({
            headerRight: () => (
                <View style={{ marginRight: 10 }}>
                    <Pressable onPress={() => { deleteBudget() }} style={styles.deleteBudgetBtn}>
                        <Text style={styles.deleteBudgetBtnText}>Delete Budget</Text>
                        {/* <Image
				  source={require("../../Assets/Profile_edit.png")}
				  style={ { height: 25, width: 25}} 
				/> */}
                    </Pressable>
                </View>
            ),
        });
    };

    const setOutHeaderOptions = () => {
        navigation.getParent().setOptions({
            headerRight: () => null,
        });
    };

    const deleteBudget = () => {

        Alert.alert('Delete Budget', `Are you sure, do you want to delete budget for the month ${months[date.getMonth()]} ${date.getFullYear()} ?`, [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'Yes',
                onPress: () => deleteBudgetFromDB()
            },
        ]);
    }
    const deleteBudgetFromDB = async () => {

        try {
            const recordId = months[date.getMonth()] + "" + date.getFullYear();
            console.log(recordId, "delete")
            await deleteDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId));
            console.log("Deleted");
            fetchBudget();
        }
        catch (e) {
            console.log(e)
        }

    }

    const fetchBudget = async () => {

        try {
            const recordId = months[date.getMonth()] + "" + date.getFullYear();
            const budgetForCurrMonth = await getDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId));
            console.log(budgetForCurrMonth.data());
            if (budgetForCurrMonth.data() != null) {
                setBudget(budgetForCurrMonth.data());
            }
            else {
                setBudget({ "budget": [], "method": "", "monthlyInc": 0, "saving": 0, "totalBudget": 0 })
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBudget();
            navigation.addListener('focus', setHeaderOptions);
            navigation.addListener('blur', setOutHeaderOptions);
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    React.useEffect(() => {
        fetchBudget();
        navigation.addListener('focus', setHeaderOptions);
        navigation.addListener('blur', setOutHeaderOptions);
    }, [date]);

    React.useEffect(() => {
        console.log(budget, " budget");
        console.log(budget.budget)
    }, [budget]);

    const showPicker = React.useCallback((value) => setShow(value), []);

    const onValueChange = React.useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;
            showPicker(false);
            setDate(selectedDate);
        },
        [date, showPicker],
    );

    return (
        <SafeAreaView >
            <ImageBackground
                source={require("../../Assets/Background.jpg")}
                style={{
                    height: "100%",
                }}
            >
                    <View style={styles.time}>
                        <TouchableOpacity onPress={() => showPicker(true)} style={styles.monthYear}>
                            <Text style={styles.monthYearText}>{months[date.getMonth()] + " " + date.getFullYear()}</Text>
                            <Image source={require('../../Assets/calendar.png')} style={{ width: 18, height: 18, marginLeft:40, }} />
                        </TouchableOpacity>
                        {show && (
                            <MonthPicker
                                onChange={onValueChange}
                                value={date}
                                minimumDate={new Date(2020, 5)}
                                maximumDate={new Date(2025, 5)}
                                mode="short"
                            />
                        )}
                    </View>

                <View style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <View style={styles.monthlyInc}>
                        <View style={styles.IncMethod}>
                            <Text style={styles.headerText}>Budgeting Method : </Text>
                            <Text style={styles.monthlyIncText}>{budget.method}</Text>
                        </View>
                        <View style={styles.IncMethod}>
                            <Text style={styles.headerText}>Monthly Income : </Text>
                            <Text style={styles.monthlyIncText}>{budget.monthlyInc}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.categoryWiseBudget}>
                    {budget.method === '50-30-20' &&
                        <FlatList
                        data={[]}
                        renderItem={null}
                        ListHeaderComponent={() => (
                            <View>
                              <FlatList
                                data={budget.budget.needs}
                                ListHeaderComponent={
                                    <View style={styles.categoryWiseBudgetTitle}>
                                        <Text style={styles.categoryWiseBudgetTitleText}>Needs : </Text>
                                        {/* <TouchableOpacity style={styles.button}>
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
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
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
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
                                <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
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
                            </View>
                        )}
                        
                        />
                        
                    }

                    {(budget.method === 'Envelop Method' || budget.method === 'Zero Based Budgeting') &&
                        <FlatList
                            data={budget.budget}
                            ListHeaderComponent={
                                <View style={styles.categoryWiseBudgetTitle}>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Budget : </Text>
                                    {/* <TouchableOpacity style={styles.button}>
                                    <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
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
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        padding: 10,
    },
    headerText: {
        textAlign: "center",
        fontWeight: "bold",
        color: green,
        margin: 5,
        fontSize: 16,
        fontWeight: "bold",
    },
    monthlyInc: {     
       
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 5,
        padding: 5,
        shadowOpacity: 0.5,
        shadowColor: "white",
        shadowOffset: {
            height: 5,
            width: 5
        },
        elevation: 5,
        backgroundColor: '#D3D3D3',
        width:'70%',
        
    },
    monthlyIncText: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: "bold",
    },
    IncMethod:{
    //    flexDirection: "row",
    //    justifyContent: "space-around",
    //    paddingVertical: 5,
    },
    progressBarView: {
        backgroundColor: 'rgba(255,255,255,0.9)',
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
        height: "67%",
        paddingBottom: 10,
    },
    categoryWiseBudgetTitle: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'grey',
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
        color: "white"
    },
    budgetCategory: {
        height: 100,
        fontSize: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
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
    time: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    monthYear: {
        width: '40%',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 43,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    monthYearText: {
        textAlign: "center",
        fontWeight: 'bold'
    },
    deleteBudgetBtn: {
        backgroundColor: '#d0a800',
        borderRadius: 10,
        padding: 10,

    },
    deleteBudgetBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
});
