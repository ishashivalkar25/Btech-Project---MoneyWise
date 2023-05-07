import { AuthErrorCodes } from 'firebase/auth';
import React from 'react';
import { SafeAreaView, ImageBackground, StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MonthPicker from 'react-native-month-year-picker';
import { auth, db, collection, getDocs, getDoc, doc, updateDoc, setDoc, addDoc } from "../../Firebase/config";
import FiftyThirtyTwenty from './FiftyThirtyTwenty';
import Envelope from './Envelope';
import ZeroBased from './ZeroBased';
import  Background from '../Background';
import { green } from "../Constants";

const budgetMethods = [
    { label: 'Envelop Method', value: 'Envelop Method' },
    { label: 'Zero Based Budgeting', value: 'Zero Based Budgeting' },
    { label: '50-30-20', value: '50-30-20' },
]

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const SetBudget = ({ navigation }) => {
    const [date, setDate] = React.useState(new Date());
    const [show, setShow] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [editCatBudgetModalVisible, setEditCatBudgetModalVisible] = React.useState(false);
    const [monthlyInc, setMonthlyInc] = React.useState();
    const [categories, setCategories] = React.useState([]);
    const [selectedCategories, updateSelectedCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState();
    const [categoryBudget, setCategoryBudget] = React.useState();
    const [categoryBudgetEdit, setCategoryBudgetEdit] = React.useState()
    const [editIdx, setEditIdx] = React.useState(-1);
    const [categoryWiseBudget, setCategoryWiseBudget] = React.useState([]);
    const [isCategoryWiseBudgetChanged, updateIsCategoryWiseBudgetChanged] = React.useState(false);
    const [selectedBudgetingMethod, setSelectedBudgetingMethod] = React.useState();

    const showPicker = React.useCallback((value) => setShow(value), []);

    const onValueChange = React.useCallback(
        (event, newDate) => {
            const selectedDate = newDate || date;
            showPicker(false);
            setDate(selectedDate);
        },
        [date, showPicker],
    );

    React.useEffect(() => {
        console.log(months[date.getMonth()] + " ", date.getFullYear());
    }, [date]);


    React.useEffect(() => {
        fetchExpCategories();
    }, []);

    // React.useEffect(() => {
	// 	const unsubscribe = navigation.addListener('focus', () => {
	// 		clearFields();
	// 	});

	// 	// Return the function to unsubscribe from the event so it gets removed on unmount
	// 	return unsubscribe;
	// }, [navigation]);

    const fetchExpCategories = async () => {

        try {
            // const querySnapshot = await getDocs(collection(db, "ExpCategory"));
            // const tempCategories = [];
            // querySnapshot.forEach((doc) => {
            //     const tempCategory = doc.data();
            //     tempCategories.push({ label: tempCategory.ExpCatName, value: tempCategory.ExpCatName });
            // });
            const docRef = doc(db, "User", auth.currentUser.uid);
            const user = await getDoc(docRef);
            setCategories(user.data().expCategories);
            // setCategories(tempCategories);
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }

    React.useEffect(() => {
        console.log(categories);
    }, [categories]);


    const calculateTotalIncome = () => {

        var totalAmount = 0;

        categoryWiseBudget.forEach((item) => {
            totalAmount = totalAmount + item.budgetPlanned;
        })
        console.log("Total", totalAmount);
        return totalAmount;
    }


    const clearFields = () => {
        setDate(new Date());
        setMonthlyInc(null);
        setSelectedBudgetingMethod(null);
    }

    return (
        <SafeAreaView>
            <ImageBackground
                source={require("../../Assets/Background.jpg")}
                style={{
                height: "100%",
                }}
            >
                <View style={styles.setBudgetContainer}>
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

                    <View style={styles.monthlyIncContainer}>
                        <Text style={styles.monthlyInc}>Monthly Income</Text>
                        <TextInput
                            style={styles.monthlyIncInput}
                            onChangeText={text => setMonthlyInc(text)}
                            value={monthlyInc}
                            placeholder="Enter Monthly Income here..."
                            keyboardType="numeric"
                        />
                    </View>
                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        itemTextStyle={{ color: 'black' }}
                        data={budgetMethods}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Budgeting Method"
                        searchPlaceholder="Search..."
                        value={selectedBudgetingMethod}
                        onChange={(item) => {
                            setSelectedBudgetingMethod(item.value);
                        }}
                    />
                </View>
                <View style={styles.categoryWiseBudget}>
                    
                    {(selectedBudgetingMethod === "Envelop Method") && <Envelope monthlyInc={monthlyInc} selectedBudgetingMethod={selectedBudgetingMethod} navigation={navigation} date={date} />}
                    {(selectedBudgetingMethod === "Zero Based Budgeting") && <ZeroBased monthlyInc={monthlyInc} selectedBudgetingMethod={selectedBudgetingMethod} navigation={navigation} date={date} />}
                    {(selectedBudgetingMethod === "50-30-20") && <FiftyThirtyTwenty monthlyInc={monthlyInc} selectedBudgetingMethod={selectedBudgetingMethod} navigation={navigation} date={date} />}

                </View>

                <TouchableOpacity style={styles.addMembersBtn} onPress={()=>{ navigation.navigate('Help')}}>
                    <Image source={require('../../Assets/question-mark.png')} style={{ width: 30, height: 30, tintColor: "white" }} />
                </TouchableOpacity>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default SetBudget;

const styles = StyleSheet.create({
    setBudgetContainer: {
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        margin: 5,
    },
    time: {
        padding: 4,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    monthYear: {
        width: '50%',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 43,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    monthYearText: {
        textAlign: "center",
    },
    monthlyIncContainer: {
        padding: 5,
        alignItems: "center",
    },
    monthlyInc: {
        margin: 5,
        fontSize: 18,
        fontWeight: "bold",
    },
    monthlyIncInput: {
        // backgroundColor: 'rgba(0,0,0,0.2)',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        textAlign: "center",
        padding: 2
    },
    dropdown: {
        margin: 10,
        width: '90%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 5,
        alignSelf: 'center',
        borderRadius: 6,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropDownStyle: {
        width: '85%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 5,
        alignSelf: 'center',
        borderRadius: 6,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeholderStyle: {
        fontSize: 14,
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: 'black',
    },
    categoryWiseBudget: {
        marginBottom: 5,
        borderRadius: 10,
        height: "60%",
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
        color: green
    },
    budgetCategory: {
        height: 70,
        fontSize: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.11)',
        marginBottom: 2,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    budgetCategoryEdit: {
        flexDirection: "row",
        width: "90%",
        justifyContent: "space-around",
    },
    budgetCategoryText: {
        fontWeight: "bold"
    },
    budgetCategoryCenter: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
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
    buttonImg: {
        width: 25,
        height: 25,
        tintColor: "#cc1d10"
    },
    buttonContainer: {
        alignItems: "center",
    },
    button: {
        backgroundColor: green,
        height: 45,
        width: "30%",
        padding: 10,
        alignItems: "center",
        borderRadius: 15,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
        textAlign: "center"
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    budgetAmountInput: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 5,
        padding: 8,
        marginBottom: 5,
    },
    buttonModal: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: green,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 15
    },
    disabled: {
        opacity: 0.7
    },
    enabled: {
        opacity: 1
    },
    addMembersBtn: {
        backgroundColor: "#d0a800",
        width: 60,
        height: 60,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        right: 15,
        bottom: 80,
        zIndex: 1
    },
});
