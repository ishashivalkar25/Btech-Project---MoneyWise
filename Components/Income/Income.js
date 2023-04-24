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
import { auth, db, collection, getDocs, doc,updateDoc,  getDoc, deleteDoc} from "../../Firebase/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import SmsAndroid from 'react-native-get-sms-android';
import Background from '../Background';
import MyPieChart from "../Visualisation/MyPieChart.js"
import { darkGreen } from "../Constants"

const { height, width } = Dimensions.get('window');
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var filter = {
	box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

	/**
	 *  the next 3 filters can work together, they are AND-ed
	 *  
	 *  minDate, maxDate filters work like this:
	 *    - If and only if you set a maxDate, it's like executing this SQL query:
	 *    "SELECT * from messages WHERE (other filters) AND date <= maxDate"
	 *    - Same for minDate but with "date >= minDate"
	 */
	minDate: 0, // timestamp (in milliseconds since UNIX epoch)
	maxDate: 0, // timestamp (in milliseconds since UNIX epoch)1679211532291000
	bodyRegex: "(.*)(?=.*[Aa]ccount.*|.*[Aa]/[Cc].*|.*[Aa][Cc][Cc][Tt].*|.*[Cc][Aa][Rr][Dd].*)(?=.*[Cc]redit.*)(?=.*[Ii][Nn][Rr].*|.*[Rr][Ss].*)(.*)", // content regex to match
	//(?=.*[Aa]ccount.*|.*[Aa]/[Cc].*|.*[Aa][Cc][Cc][Tt].*|.*[Cc][Aa][Rr][Dd].*)(?=.*[Cc]redit.*|.*[Dd]ebit.*)(?=.*[Ii][Nn][Rr].*|.*[Rr][Ss].*)
	/** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
	// read: 0, // 0 for unread SMS, 1 for SMS already read
	// _id: 1234, // specify the msg id
	// thread_id: 12 // specify the conversation thread_id
	// address: '+1888------', // sender's phone number
	// body: 'How are you', // content to match
	/** the next 2 filters can be used for pagination **/
	indexFrom: 0, // start from index 0
	maxCount: 10, // count of SMS to return each time
};

function Income({navigation, route}) {

    const [recordsFilter, setRecordsFilter] = React.useState("Day");
    const [datePicker, setDatePicker] = React.useState(false);
    const [date, setDate] = React.useState(new Date());
    const [month, setMonth] = React.useState(new Date().getMonth());
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [period, setPeriod] = React.useState("");
    const [totalIncome, setTotalIncome] = React.useState(0.0);
    const [incomeRecords, setIncomeRecords] = React.useState([]);
    const [incomeRecordsDateWise, setIncomeRecordsDateWise] = React.useState([]);
    const [incomeRecordsMonthWise, setIncomeRecordsMonthWise] = React.useState([]);
    const [incomeRecordsYearWise, setIncomeRecordsYearWise] = React.useState([]);
    const [categoryWiseInc, setCategoryWiseInc] = React.useState([]);
    const [messageList, setMessageList] = React.useState([]);
    const [transactionList, setTransactionList] = React.useState([]);
    
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
        if (recordsFilter == "Day") {
            console.log("\n\Date\n\n", incomeRecords);
            filterRecordsDateWise();
        }
        else if (recordsFilter == "Month") {
            console.log("\n\nMonth\n\n", incomeRecords)
            filterRecordsMonthWise();
        }
        else {
            console.log("\n\YYear\n\n")
            filterRecordsYearWise();
        }

    }, [recordsFilter, date, month, year, incomeRecords]);

    React.useEffect(() => {
        // fetchRecords();
        console.log("In usestate");
		console.log("MS : ", new Date().getTime())

		if (checkPermisson()) {
			console.log("Permission Granted");
			AppState.addEventListener('change', state => {
				if (state === 'active') {
					console.log("THIS IS ACTIVE");
					fetchLastFetchedMsgTS();
				}
			});
		}
    }, []);

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
    }, [incomeRecordsDateWise, incomeRecordsMonthWise, incomeRecordsYearWise]);

    const getDateFormat = (timestamp) => {
        const tempDate = new Date(timestamp * 1000);
        // console.log(tempDate, "Templ Date");
        return tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear();
    }
    const fetchRecords = async () => {
        try {
            const tempRecords = [];
            // console.log(auth.currentUser.uid, "auth.currentUser.uid***********************")
            const querySnapshot = await getDocs(collection(doc(db, "User", auth.currentUser.uid), "Income"));
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const record = {
                    "key": doc.id,
                    "incAmount": data.incAmount,
                    "incDescription": data.incDescription,
                    "incCategory": data.incCategory,
                    "incDate": data.incDate
                };
                if(data.incImage) {
                    record.incImage=data.incImage;
                }
                tempRecords.push(record);
            });
            setIncomeRecords(tempRecords);
            filterRecordsDateWise();
            // console.log(incomeRecords, "data");
        }
        catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    const filterRecordsDateWise = () => {
        const tempRecords = [];
        // console.log(incomeRecords, "Datewise *-----------");
        incomeRecords.forEach((incomeRecord) => {
            const recordDate = getDateFormat(incomeRecord.incDate.seconds);
            const desiredDate = date.getDate() + ' / ' + (date.getMonth() + 1) + ' / ' + date.getFullYear();
            if (recordDate == desiredDate) {
                tempRecords.push(incomeRecord);
                // console.log(incomeRecord, "Datewise");
            }
        })
        setIncomeRecordsDateWise(tempRecords);
        // console.log(incomeRecordsDateWise, "Filtered Records")
    }
    const filterRecordsMonthWise = () => {
        const tempRecords = [];
        incomeRecords.forEach((incomeRecord) => {
            const recordMonth = new Date(incomeRecord.incDate.seconds * 1000).getMonth();
            if (recordMonth == month) {
                tempRecords.push(incomeRecord);
                // console.log(incomeRecord, "MonthWise");
            }
        })
        setIncomeRecordsMonthWise(tempRecords);
        // console.log(incomeRecordsMonthWise, "Filtered Records")
    }
    const filterRecordsYearWise = () => {
        const tempRecords = [];

        incomeRecords.forEach((incomeRecord) => {
            const recordYear = new Date(incomeRecord.incDate.seconds * 1000).getFullYear();
            if (recordYear == year) {
                tempRecords.push(incomeRecord);
                // console.log(incomeRecord, "YearWise");
            }
        })
        setIncomeRecordsYearWise(tempRecords);
        // console.log(incomeRecordsYearWise, "Filtered Records")
    }

    const filterRecordsCategotyWise = () => {
        const categoryWiseAmt = [];
        const category = [];
        if (recordsFilter == "Day") {
            incomeRecordsDateWise.forEach((incomeRecord) => {
                // console.log(incomeRecord.incCategory, "Category Income");
                // const recordYear = new Date(incomeRecord.incDate.seconds*1000).getMonth();
                if (!category.includes(incomeRecord.incCategory)) {
                    category.push(incomeRecord.incCategory);
                    const data = { "name": incomeRecord.incCategory, "amount": Number(incomeRecord.incAmount) };
                    categoryWiseAmt.push(data);
                    // console.log(incomeRecord, "YearWise");
                }
                else {
                    // console.log("Amount***");
                    categoryWiseAmt.forEach((item) => {
                        if (item.name == incomeRecord.incCategory) {
                            item.amount += Number(incomeRecord.incAmount);
                        }
                        // console.log((item.name == incomeRecord.incCategory), "Amount***");
                    })
                }
            })
        }
        else if (recordsFilter == "Month") {
            incomeRecordsMonthWise.forEach((incomeRecord) => {
                // console.log(incomeRecord.incCategory, "Category Income");
                // const recordYear = new Date(incomeRecord.incDate.seconds*1000).getMonth();

                if (!category.includes(incomeRecord.incCategory)) {
                    category.push(incomeRecord.incCategory);
                    const data = { "name": incomeRecord.incCategory, "amount": Number(incomeRecord.incAmount) };
                    categoryWiseAmt.push(data);
                    // console.log(incomeRecord, "YearWise");
                }
                else {
                    categoryWiseAmt.forEach((item) => {
                        if (item.name == incomeRecord.incCategory) {
                            item.amount += Number(incomeRecord.incAmount);
                        }
                        // console.log((item.name == incomeRecord.incCategory), "Amount***");
                    })
                }
            })
        }
        else {
            incomeRecordsYearWise.forEach((incomeRecord) => {
                // console.log(incomeRecord.incCategory, "Category Income");

                if (!category.includes(incomeRecord.incCategory)) {
                    category.push(incomeRecord.incCategory);
                    const data = { "name": incomeRecord.incCategory, "amount": Number(incomeRecord.incAmount) };
                    categoryWiseAmt.push(data);
                }
                else {
                    categoryWiseAmt.forEach((item) => {
                        if (item.name == incomeRecord.incCategory) {
                            item.amount += Number(incomeRecord.incAmount);
                        }
                        // console.log(item.name, incomeRecord.incCategory, "Amount***")
                    })
                }

            })
        }

        setCategoryWiseInc(categoryWiseAmt);
        // console.log(category);
        // console.log(categoryWiseAmt, "Category------------------------------**********************************");
    }

    const fetchLastFetchedMsgTS = async () => {
		try {
			const user = await getDoc(doc(db, "User", "LCssg7nKyeWotOlCXOov5iVlQwO2"));
			// console.log(user.data());

			filter.minDate = user.data().lastViewTS;
			filter.maxDate = new Date().getTime();
			// console.log("Mindb : ", user.data().lastViewTS);
			// console.log("Maxdb : ", new Date().getTime());
			// console.log("min : ", filter.minDate);
			// console.log("Max : ", filter.maxDate);

			SmsAndroid.list(
				JSON.stringify(filter),
				(fail) => {
					console.log('Failed with this error: ' + fail);
				},
				(count, smsList) => {
					// console.log('Count: ', count);
					// console.log('List: ', smsList);
					var arr = JSON.parse(smsList);
                    const tempList = [];
					arr.forEach(function (object) {
						// console.log('-->' + object.date);
						// console.log('-->' + object.address);
						const transactionDetails = getTransactionInfo(object.body);
						// console.log("Message :" + JSON.stringify(transactionDetails));

						if (!(transactionDetails.account.no == "" || transactionDetails.money == "" || transactionDetails.typeOfTransaction == "")) {
							const tempTransaction = {
								accountNo: transactionDetails.account.no,
								balance: transactionDetails.balance,
								amount: transactionDetails.money,
								typeOfTransaction: transactionDetails.typeOfTransaction,
								date: object.date
							}
                            tempList.push(tempTransaction);
                            
						}

					});
                    // console.log(messageList, "messageList2");
                    setMessageList([...messageList, ...tempList]);
					// console.log(messageList, "messageList1");
				},
			);


			updateLastViewTS(filter.maxDate);

			// filter.minDate = user.data().lastViewTS;
			// setLastFetchedMsgTS(user.data().lastViewTS);
		// /	console.log(filter.maxDate, "lastFetchedMsgTS");
		}
		catch (e) {
			console.error("Error adding document: ", e);
		}
	}

    
	const checkPermisson = async () => {

        try{
            const permissions = [
                PermissionsAndroid.PERMISSIONS.READ_SMS, 
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
              ];
    
            var granted = await PermissionsAndroid.requestMultiple(permissions);
            if (
                granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.SEND_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
              ) 
              {
                console.log('All permissions granted');
                return true;
              } else {
                console.log('Some permissions not granted');
                return false;
              }
        } catch (err) {
            console.warn(err);
        }
	}
    const updateLastViewTS = async (lastViewTS) => {
        console.log("updateLastViewTS")
		const user = await updateDoc(doc(db, "User", "LCssg7nKyeWotOlCXOov5iVlQwO2"), {
			"lastViewTS": lastViewTS
		});
	}
    const showUntrackedTransactions = () => {
		navigation.navigate("ConfirmUntrackedIncTrans", {
            messageList : messageList
        });
	}

    const deleteRecord = async(item) => {
        const docRef = await deleteDoc(doc(db, 'User', auth.currentUser.uid, 'Income', item.key));
        console.log("document deleted")
        const filterData = incomeRecords.filter(curr => curr !== item);
        console.log(filterData);
        console.log(filterData.length);
        setIncomeRecords(filterData);
    }

    React.useEffect(() => {

        if(route.params!=null && route.params.transactionList!=null){
            const filterData = messageList.filter(curr => !route.params.transactionList.includes(curr));
            // console.log(filterData);
            // console.log(filterData.length);
            setMessageList(filterData);
            // console.log("Route Params : ", route.params.transactionList);
        }
        else{
            // console.log("Route Params Empty ");
        }
        
    }, [route.params]);


    React.useEffect(() => {
       console.log(messageList, "************************************MessageList", messageList.length);
    }, [messageList]);

    return (
            <KeyboardAvoidingView style={{ width: "100%"}}>
                <ImageBackground
                    source={require("../../Assets/Background.jpeg")}
                    style={{
                        height: "100%",
                    }}
                >
                    <View style={styles.container}>
                        <View style={styles.records_filter}>
                            <TouchableOpacity onPress={() => { setRecordsFilter("Day") }}>
                                <Text style={styles.choose_filter_text}>Day</Text>
                            </TouchableOpacity >
                            <TouchableOpacity onPress={() => { setRecordsFilter("Month") }}>
                                <Text style={styles.choose_filter_text}>Month</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setRecordsFilter("Year") }}>
                                <Text style={styles.choose_filter_text}>Year</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ backgroundColor: "rgb(211, 211, 211)", borderRadius: 5 }}>
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
                        {((incomeRecordsDateWise.length == 0 && recordsFilter == "Day") || (incomeRecordsMonthWise.length == 0 && recordsFilter == "Month") || (incomeRecordsYearWise.length == 0 && recordsFilter == "Year")) && (
                            <View style={styles.no_records}>
                                <Text style={{ fontWeight: "bold", fontSize: 18 }}>No Transactions Found!</Text>
                            </View>
                        )}
                        <View style={styles.PieChart}>
                            <MyPieChart data={categoryWiseInc} />
                        </View>

                    </View>
                    
                    {messageList.length> 0 && (<View><TouchableOpacity style={styles.smsNotification} onPress={() => showUntrackedTransactions()}>
                        <Text style={styles.smsNotificationText}>You have some untracked Income Transactions... Click Here</Text>
                    </TouchableOpacity></View>)
                    } 

                    {recordsFilter == "Day" && (<View style={styles.record_container}>

                        {incomeRecordsDateWise.length > 0 && (<FlatList
                            data={incomeRecordsDateWise}
                            renderItem={({ item }) =>
                               <View style={styles.alignRecord}>
                                 <TouchableOpacity style={styles.record} onPress={()=>{
                                    console.log("show income details",item.incPath,item);
                                    navigation.navigate("ShowIncomeDetails",{incomeRecId:item.key,incomeRec:item});
                                }}>
                                    <View >
                                        <Text style={styles.cat}>{item.incCategory}</Text>
                                        <Text style={styles.amt}>+{item.incAmount}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.dt}>{getDateFormat(item.incDate.seconds)}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
                               </View>
                            }
                            enableEmptySections={true}
                            
                        />)}
                    </View>)}
                    {recordsFilter == "Month" && (<View style={styles.record_container}>
                        {incomeRecordsMonthWise.length > 0 && (<FlatList
                            data={incomeRecordsMonthWise}
                            renderItem={({ item }) =>
                           <View style={styles.alignRecord}>
                             <TouchableOpacity style={styles.record} onPress={()=>{
                                console.log("show income details",item.incPath,item);
                                navigation.navigate("ShowIncomeDetails",{incomeRecId:item.key,incomeRec:item});
                            }}>
                                    <View >
                                        <Text style={styles.cat}>{item.incCategory}</Text>
                                        <Text style={styles.amt}>+{item.incAmount}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.dt}>{getDateFormat(item.incDate.seconds)}</Text>
                                    </View>
                                    {/* <View>
                                    <TouchableOpacity  style={styles.details}>                               
                                     <Text style={{color: "white", fontSize: 15, fontWeight: 'bold'}}> Details </Text>
                                    </TouchableOpacity>
                                </View> */}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
                           </View>
                            }
                            enableEmptySections={true}
                        />)}
                    </View>)}
                    {recordsFilter == "Year" && (<View style={styles.record_container}>

                        {incomeRecordsYearWise.length > 0 && (<FlatList
                            data={incomeRecordsYearWise}
                            renderItem={({ item }) =>
                            <View style={styles.alignRecord}>
                                <TouchableOpacity style={styles.record} onPress={()=>{
                                    console.log("show income details",item.incPath,item);
                                    navigation.navigate("ShowIncomeDetails",{incomeRecId:item.key,incomeRec:item});
                            }}>
                                    <View >
                                        <Text style={styles.cat}>{item.incCategory}</Text>
                                        <Text style={styles.amt}>+{item.incAmount}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.dt}>{getDateFormat(item.incDate.seconds)}</Text>
                                    </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteRecord(item)}>
                                 <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                               </TouchableOpacity>
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
                                backgroundColor: "#006A42",
                                justifyContent: "center",
                                alignItems: "center",
                                alignSelf: "center",
                                marginTop: 5,
                                marginBottom: 5,
                            }}
                            onStartShouldSetResponder={() => {
                                navigation.navigate("AddIncome");
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
            </KeyboardAvoidingView>
      
    );
}

export default Income;

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
        backgroundColor: darkGreen,
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
    record: {
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems : "center",
        backgroundColor: 'white',
        height: 70,
        borderRadius: 15,
        marginBottom: 10,
        padding: 15
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
