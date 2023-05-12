import React from 'react'
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
    SafeAreaView,
    KeyboardAvoidingView, 
    PermissionsAndroid,
	AppState,
    
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTransactionInfo } from "trny";
import { auth, db, collection, getDocs, doc,updateDoc,  getDoc, deleteDoc, setDoc} from "../../Firebase/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import SmsAndroid from 'react-native-get-sms-android';
import Background from '../Background';
import MyPieChart from "../Visualisation/MyPieChart.js"
import { green } from "../Constants"

const { height, width } = Dimensions.get('window');
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


function Expense({navigation}) {
    const [recordsFilter, setRecordsFilter] = React.useState("Day");
    const [datePicker, setDatePicker] = React.useState(false);
    const [date, setDate] = React.useState(new Date());
    const [month, setMonth] = React.useState(new Date().getMonth());
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [period, setPeriod] = React.useState("");
    const [totalExpense, setTotalExpense] = React.useState(0.0);
    const [expenseRecords, setExpenseRecords] = React.useState([]);
    const [expenseRecordsDateWise, setExpenseRecordsDateWise] = React.useState([]);
    const [expenseRecordsMonthWise, setExpenseRecordsMonthWise] = React.useState([]);
    const [expenseRecordsYearWise, setExpenseRecordsYearWise] = React.useState([]);
    const [categoryWiseExp, setCategoryWiseExp] = React.useState([]);


    function onDateSelected(event, value) {
        const tempDate = new Date();
        if (value.getTime() > tempDate.getTime()) {
            alert("Please select valid date!!")
            setDate(tempDate);
        }
        setDate(value);
        setDatePicker(false);
    }

    React.useEffect(() => {
        console.log("\n\nInside Record Filter\n\n", recordsFilter);
        if (recordsFilter == "Day") 
        {
            console.log("\n\Date\n\n", expenseRecords);
            filterRecordsDateWise();
        }
        else if (recordsFilter == "Month") {
            console.log("\n\nMonth\n\n", expenseRecords)
            filterRecordsMonthWise();
        }
        else {
            console.log("\n\YYear\n\n")
            filterRecordsYearWise();
        }
        
    }, [recordsFilter,date, month, year, expenseRecords]); 

    React.useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchRecords();
            // if (checkPermisson()) {
            //     fetchLastFetchedMsgTS();
            // }
		});

		// Return the function to unsubscribe from the event so it gets removed on unmount
		return unsubscribe;
	}, [navigation]);

    React.useEffect(() => {
        filterRecordsCategotyWise();
    }, [expenseRecordsDateWise, expenseRecordsMonthWise, expenseRecordsYearWise]);

    const getDateFormat = (timestamp) =>{
        const tempDate = new Date(timestamp*1000);
        // console.log(tempDate, "Templ Date");
        return tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear();
    }
    const fetchRecords = async() => {
        try {
            const tempRecords = [];
            const querySnapshot = await getDocs(collection(doc(db,"User",auth.currentUser.uid), "Expense"));
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const record = { 
                    "key":doc.id,
                    "expAmount": data.expAmount, 
                    "expDescription": data.expDescription, 
                    "expCategory": data.expCategory, 
                    "expDate": data.expDate ,
                    "expImage":data.expImage,
                    'groupExp' : data.groupExp,
                };

                if(data.groupExp)
                {
                    record.grpMembersList = data.grpMembersList;
                }
                
                tempRecords.push(record); 
            });
            setExpenseRecords(tempRecords);
            filterRecordsDateWise();
            console.log(expenseRecords, "data");
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const filterRecordsDateWise = () => {
        const tempRecords = [];
        console.log(expenseRecords, "Datewise *-----------");
        expenseRecords.forEach((expenseRecord) => {
            const recordDate = getDateFormat(expenseRecord.expDate.seconds);
            const desiredDate = date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear();
            if(recordDate==desiredDate)
            {
                tempRecords.push(expenseRecord);
                console.log(expenseRecord, "Datewise");
            }
        })
        setExpenseRecordsDateWise(tempRecords);
        console.log(expenseRecordsDateWise, "Filtered Records")
    }

    const filterRecordsMonthWise = () => {
        const tempRecords = [];
        expenseRecords.forEach((expenseRecord) => {
            const recordMonth = new Date(expenseRecord.expDate.seconds*1000).getMonth();
            if(recordMonth==month)
            {
                tempRecords.push(expenseRecord);
                console.log(expenseRecord, "MonthWise");
            }
        })
        setExpenseRecordsMonthWise(tempRecords);
        console.log(expenseRecordsMonthWise, "Filtered Records")
    }

    const filterRecordsYearWise = () => {
        const tempRecords = [];
        
        expenseRecords.forEach((expenseRecord) => {
            const recordYear = new Date(expenseRecord.expDate.seconds*1000).getFullYear();
            if(recordYear==year)
            {
                tempRecords.push(expenseRecord);
                console.log(expenseRecord, "YearWise");
            }
        })
        setExpenseRecordsYearWise(tempRecords);
        console.log(expenseRecordsYearWise, "Filtered Records")
    }

    const filterRecordsCategotyWise = () => {
        const categoryWiseAmt = [];
        const category = [];
        if (recordsFilter == "Day") 
        {
            expenseRecordsDateWise.forEach((expenseRecord) => {
                console.log(expenseRecord.expCategory, "Category Expense");
                // const recordYear = new Date(expomeRecord.expDate.seconds*1000).getMonth();
                if(!category.includes(expenseRecord.expCategory))
                {
                    category.push(expenseRecord.expCategory);
                    const data = { "name" : expenseRecord.expCategory , "amount" : Number(expenseRecord.expAmount) };
                    categoryWiseAmt.push(data);
                    // console.log(expomeRecord, "YearWise");
                }
                else
                {
                    console.log("Amount***");
                    categoryWiseAmt.forEach((item)=>{
                        if(item.name==expenseRecord.expCategory )
                        {
                            item.amount += Number(expenseRecord.expAmount);
                        }
                        console.log((item.name==expenseRecord.expCategory), "Amount***");
                    })
                }
            })
        }
        else if (recordsFilter == "Month") {
            expenseRecordsMonthWise.forEach((expenseRecord) => {
                console.log(expenseRecord.expCategory, "Category Expense");
                // const recordYear = new Date(expomeRecord.expDate.seconds*1000).getMonth();
              
                if(!category.includes(expenseRecord.expCategory))
                {
                    category.push(expenseRecord.expCategory);
                    const data = { "name" : expenseRecord.expCategory , "amount" : Number(expenseRecord.expAmount) };
                    categoryWiseAmt.push(data);
                    // console.log(expomeRecord, "YearWise");
                }
                else
                {
                    categoryWiseAmt.forEach((item)=>{
                        if(item.name==expenseRecord.expCategory )
                        {
                            item.amount += Number(expenseRecord.expAmount);
                        }
                        console.log((item.name==expenseRecord.expCategory), "Amount***");
                    })
                }
            })
        }
        else 
        {
            expenseRecordsYearWise.forEach((expenseRecord) => {
                console.log(expenseRecord.expCategory, "Category Expense");
                
                if(!category.includes(expenseRecord.expCategory))
                {
                    category.push(expenseRecord.expCategory);
                    const data = { "name" : expenseRecord.expCategory , "amount" : Number(expenseRecord.expAmount) };
                    categoryWiseAmt.push(data);
                }
                else
                {
                    categoryWiseAmt.forEach((item)=>{
                        if(item.name==expenseRecord.expCategory )
                        {
                            item.amount += Number(expenseRecord.expAmount);
                        }
                        console.log(item.name,expenseRecord.expCategory, "Amount***")
                    })
                }
                
            })
        }
        
        setCategoryWiseExp(categoryWiseAmt);
        console.log(category);
        console.log(categoryWiseAmt, "Category------------------------------**********************************");
    }

    const deleteRecord = async(record) => {
        const docRef = await deleteDoc(doc(db, 'User', auth.currentUser.uid, 'Expense', record.key));
        console.log("document deleted")
        const filterData = expenseRecords.filter(curr => curr !== record);
        console.log(filterData);
        console.log(filterData.length);
        setExpenseRecords(filterData);
        updateBalOnRecDelete(record.expAmount);

         //Update budget
        const recordId = months[date.getMonth()] + "" + date.getFullYear();
        console.log(recordId);
        const document = await getDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId));

        if (document.data()) {
            const categoryWiseBudget = document.data()
            var isCategoryBudgetSet = false;
            var otherExpIdx = -1;
            var savingsIdx = -1;
            var done = false;

            if (categoryWiseBudget.method === 'Envelop Method') {
                console.log('Inside : ', categoryWiseBudget.method)

                categoryWiseBudget.budget.forEach((item, idx) => {
                    if (item.category == record.expCategory) {
                        item.budgetSpent = item.budgetSpent - parseFloat(record.expAmount) ;
                        isCategoryBudgetSet = true;
                    }

                    if (item.category == "Additional Expenses") {
                        otherExpIdx = idx;
                    }
                });

                if (!isCategoryBudgetSet && otherExpIdx > -1) {
                    categoryWiseBudget.budget[otherExpIdx].budgetSpent = categoryWiseBudget.budget[otherExpIdx].budgetSpent - parseFloat(record.expAmount) ;
                }
            }
            else if (categoryWiseBudget.method === 'Zero Based Budgeting') {

                console.log('Inside : ', categoryWiseBudget.method)
                categoryWiseBudget.budget.forEach((item, idx) => {
                    if (item.category == record.expCategory) {
                        item.budgetSpent = item.budgetSpent - parseFloat(record.expAmount);
                        isCategoryBudgetSet = true;
                    }

                    if (item.category == "Savings") {
                        savingsIdx = idx;
                    }
                });

                if (!isCategoryBudgetSet && savingsIdx > -1) {
                    categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetSpent - parseFloat(record.expAmount);
                    categoryWiseBudget.budget[savingsIdx].budgetSpent = categoryWiseBudget.budget[savingsIdx].budgetPlanned + parseFloat(record.expAmount) ;
                    console.log('Added to savings', categoryWiseBudget.budget[savingsIdx].budgetSpent)
                }

            }
            else {
                console.log('Inside : ', categoryWiseBudget)
                categoryWiseBudget.budget.needs.forEach((item, idx) => {
                    if (item.category == record.expCategory) {
                        item.budgetSpent = item.budgetSpent - parseFloat(record.expAmount) ;
                        isCategoryBudgetSet = true;
                        done = true;
                    }
                });

                if (!done) {
                    categoryWiseBudget.budget.wants.forEach((item, idx) => {
                        if (item.category == record.expCategory) {
                            item.budgetSpent = item.budgetSpent - parseFloat(record.expAmount);
                            isCategoryBudgetSet = true;
                            done = true;
                        }
                    });

                }

                if (!done) {
                    categoryWiseBudget.budget.savings.forEach((item, idx) => {
                        if (item.category == record.expCategory) {
                            item.budgetSpent = item.budgetSpent - parseFloat(record.expAmount);
                            isCategoryBudgetSet = true;
                            done = true;
                        }

                        if (item.category == "Other Savings") {
                            otherExpIdx = idx;
                        }
                    });

                    if (!isCategoryBudgetSet && otherExpIdx > -1) {
                        categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent = categoryWiseBudget.budget.savings[otherExpIdx].budgetSpent - parseFloat(record.expAmount) ;
                        done = true;
                    }
                }
            }

            await setDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId), categoryWiseBudget);

        }

    }

    const updateBalOnRecDelete = async(amount) => {
        try{
            const user = await getDoc(doc(db, "User", auth.currentUser.uid));

            console.log(amount , 'amount');
			  //update account balance
			  await updateDoc(doc(db,"User",auth.currentUser.uid), {
                accBalance :parseFloat(user.data().accBalance) + parseFloat(amount) +""
              });

		}
		catch(e)
		{
			console.log(e);
		}
    }
    return (
        <>
            <View  style={{ width: "100%" }}>
                <ImageBackground
                    source={require("../../Assets/Background.jpg")}
                    style={{
                        height: "100%",
                    }}
                >
                    <View style={styles.container}>
                        <View style={styles.records_filter}>
                            <TouchableOpacity onPress={() => { setRecordsFilter("Day") }}>
                                <Text style={{fontSize :17, fontWeight:'bold', color:'white'}}>Day</Text>
                            </TouchableOpacity >
                            <TouchableOpacity onPress={() => { setRecordsFilter("Month") }}>
                                <Text style={{fontSize :17, fontWeight:'bold', color:'white'}}>Month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setRecordsFilter("Year") }}>
                                <Text style={{fontSize :17, fontWeight:'bold', color:'white'}}>Year</Text>
                            </TouchableOpacity>
                            {/* <TouchableOpacity>
                                <Text>Period</Text>
                            </TouchableOpacity> */}
                        </View>
                        <View style={{ backgroundColor: "rgb(211, 211, 211)", borderRadius:5}}>
                            {(recordsFilter == "Day") && (<View style={styles.choose_filter_date}>
                                <TouchableOpacity onPress={() => setDatePicker(true)}>
                                    <Text>{date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear()}</Text>
                                </TouchableOpacity>
                            </View>)}
                            {(recordsFilter == "Month") && (<View style={styles.choose_filter}>
                                <TouchableOpacity disabled={month == 0 ? true : false} onPress={() => { setMonth(month - 1) }}>
                                    <Image
                                        source={require("../../Assets/previous.png")}
                                        style={{ width: 15, height: 15 }}
                                        onPress={() => console.log("image pressed")}
                                    />
                                </TouchableOpacity>
                                <Text>{months[month]}</Text>
                                <TouchableOpacity disabled={month == 11 ? true : false} onPress={() => { setMonth(month + 1) }}>
                                    <Image
                                        source={require("../../Assets/next.png")}
                                        style={{ width: 15, height: 15 }}
                                        onPress={() => console.log("image pressed")}
                                    />
                                </TouchableOpacity>
                            </View>)}
                            {(recordsFilter == "Year") && (<View style={styles.choose_filter}>
                                <TouchableOpacity disabled={year == 1 ? true : false} onPress={() => { setYear(year - 1) }}>
                                    <Image
                                        source={require("../../Assets/previous.png")}
                                        style={{ width: 15, height: 15 }}
                                        onPress={() => console.log("image pressed")}
                                    />
                                </TouchableOpacity>
                                <TextInput style={styles.choose_filter_textInput} keyboardType="numeric" onChangeText={(text) => {
                                    const tempYear = new Date().getFullYear();
                                    if (Number(text) && Number(text) <= tempYear) {
                                        setYear(Number(text))
                                    }
                                    else {
                                        alert("Enter valid year!!");
                                        setYear(tempYear);
                                        console.log(year)
                                    }
                                }}>{year}</TextInput>

                                <TouchableOpacity disabled={year == (new Date().getFullYear()) ? true : false} onPress={() => { setYear(year + 1) }}>
                                    <Image
                                        source={require("../../Assets/next.png")}
                                        style={{ width: 15, height: 15 }}
                                        onPress={() => console.log("image pressed")}
                                    />
                                </TouchableOpacity>
                            </View>)}

                            {datePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode={"date"}
                                    is24Hour={true}
                                    onChange={onDateSelected}
                                />
                            )}
                        </View>
                        {((expenseRecordsDateWise.length == 0 && recordsFilter=="Day") || (expenseRecordsMonthWise.length == 0 && recordsFilter=="Month") || (expenseRecordsYearWise.length == 0 && recordsFilter=="Year")) && (
                            <View style={styles.no_records}>
                                <Text style={{fontWeight:"bold", fontSize:18}}>No Transactions Found!</Text>
                            </View>
                        )}
                        <View style={styles.Piechart}>
                                 <MyPieChart data={categoryWiseExp}/>
                        </View>
                    </View>

                    {recordsFilter=="Day" && (<View style={styles.record_container}>

                        {expenseRecordsDateWise.length > 0 && (<FlatList
                            data={expenseRecordsDateWise}
                            renderItem={({ item }) =>
                                <View style={styles.alignRecord}>
                                <TouchableOpacity style={styles.record} onPress={()=>{
                                    console.log("show income details",item.incPath,item);
                                    navigation.navigate("ShowExpenseDetails",{expenseRecId:item.key,expenseRec:item});
                                }}>
                                     <View >
                                    <Text style = {styles.cat}>{item.expCategory}</Text>
                                    <Text style = {styles.amt}>-{item.expAmount}</Text>
                                </View>
                                <View>
                                    <Text style = {styles.dt}>{getDateFormat(item.expDate.seconds)}</Text>
                                </View>
                                
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
                               
                                {/* <View>
                                    <TouchableOpacity  style={styles.details}>                               
                                     <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Details </Text>
                                    </TouchableOpacity>
                                </View> */}
                                
                                </View>
                            }
                            enableEmptySections={true}
                        />)}
                    </View>)}
                    {recordsFilter=="Month" && (<View style={styles.record_container}>

                        {expenseRecordsMonthWise.length > 0 && (<FlatList
                            data={expenseRecordsMonthWise}
                            renderItem={({ item }) =>
                                <View style={styles.alignRecord}>
                                    <TouchableOpacity style={styles.record} onPress={()=>{
                                    console.log("show income details",item.incPath,item);
                                    navigation.navigate("ShowExpenseDetails",{expenseRecId:item.key,expenseRec:item});
                                }}>
                                    <View >
                                    <Text style = {styles.cat}>{item.expCategory}</Text>
                                    <Text style = {styles.amt}>-{item.expAmount}</Text>
                                </View>
                                <View>
                                    <Text style = {styles.dt}>{getDateFormat(item.expDate.seconds)}</Text>
                                </View>
                                
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
                                    
                                {/* <View>
                                    <TouchableOpacity  style={styles.details}>                               
                                     <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Details </Text>
                                    </TouchableOpacity>
                                </View> */}
                                </View>
                            }
                            enableEmptySections={true}
                        />)}
                    </View>)}
                    {recordsFilter=="Year" && (<View style={styles.record_container}>

                        {expenseRecordsYearWise.length > 0 && (<FlatList
                            data={expenseRecordsYearWise}
                            renderItem={({ item }) =>
                                <View style={styles.alignRecord}>
                                    <TouchableOpacity style={styles.record} onPress={()=>{
                                    console.log("show income details",item.incPath,item);
                                    navigation.navigate("ShowExpenseDetails",{expenseRecId:item.key,expenseRec:item});
                                }}>
                                    <View >
                                    <Text style = {styles.cat}>{item.expCategory}</Text>
                                    <Text style = {styles.amt}>-{item.expAmount}</Text>
                                </View>
                                <View>
                                    <Text style = {styles.dt}>{getDateFormat(item.expDate.seconds)}</Text>
                                </View>
                                
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
                                    
                                {/* <View>
                                    <TouchableOpacity  style={styles.details}>                               
                                     <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Details </Text>
                                    </TouchableOpacity>
                                </View> */}
                                </View>
                            }
                            enableEmptySections={true}
                        />)}
                    </View>)}
                    <View
                        style={{
                            position: "absolute",
                            justifyContent: "center",
                            alignItems: "center",
                            right: 20,
                            bottom: 20
                        }}
                    >
                        <View
                            style={{
                                width: 70,
                                height: 70,
                                borderRadius: 35,
                                backgroundColor: green,
                                justifyContent: "center",
                                alignItems: "center",
                                alignSelf: "center",
                                marginTop: 5,
                                marginBottom: 5,
                            }}
                            onStartShouldSetResponder={() => {
                                navigation.navigate("AddExpense");
                            }}
                        >
                            <Image
                                source={require("../../Assets/add.png")}
                                style={{ width: 30, height: 30 }}
                                onPress={() => console.log("image pressed")}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </>
    );
}


export default Expense

const styles = StyleSheet.create({
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
        color: "black",
        backgroundColor: green,
        borderRadius: 5,
    },
    choose_filter: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    choose_filter_text : { 
        fontSize: 17, 
        fontWeight: 'bold', 
        color: 'white' 
    },
    choose_filter_textInput : { 
        padding : 0,
        height : 20

    },
    choose_filter_date: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    PieChart: {
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems: "center",
    },
    no_records: {
        alignItems: "center",
        padding: 10,
        fontWeight: "bold"
    },
    smsNotification : {
        backgroundColor : 'white',
        padding : 10,
        borderRadius : 10,
        marginHorizontal : 10,
        marginBottom : 10,
    },
    smsNotificationText : {
        fontSize : 13, 
        fontWeight : 'bold'
    },
    record_container: {
        marginLeft: 10,
        marginRight: 10,
        padding: 0,
        borderRadius: 20,
        height: 310,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetCategoryCenter: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    alignRecord:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: 'white',
        height: 70,
        borderRadius: 15,
        marginBottom: 10,
        padding: 15,
    },
    buttonImg: {
        width: 25,
        height: 25,
        tintColor: "#cc1d10"
    },
    record: {
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems : "center",
        width: "85%",
    },
    cat: {
        color: 'grey',
        fontSize: 18
    },
    amt: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    dt: {
        fontSize: 15,
        fontWeight: 'bold'
    }
});
