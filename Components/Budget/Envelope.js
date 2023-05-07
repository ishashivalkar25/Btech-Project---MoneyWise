import { AuthErrorCodes } from 'firebase/auth';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TextInput, FlatList, Image, TouchableOpacity, Modal, Alert} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import MonthPicker from 'react-native-month-year-picker';
import { auth, db, collection, getDocs, getDoc, doc, updateDoc, setDoc, addDoc} from "../../Firebase/config";
import { green } from "../Constants";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const Envelope = (props) => {

    const [modalVisible, setModalVisible] = React.useState(false);
    const [editCatBudgetModalVisible, setEditCatBudgetModalVisible] = React.useState(false);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategories, updateSelectedCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState();
    const [categoryBudget, setCategoryBudget] = React.useState();
    const [categoryBudgetEdit, setCategoryBudgetEdit] = React.useState()
    const [editIdx, setEditIdx] = React.useState(-1);
    const [categoryWiseBudget, setCategoryWiseBudget] = React.useState([]);
    const [isCategoryWiseBudgetChanged, updateIsCategoryWiseBudgetChanged] = React.useState(false);

    React.useEffect(() => {
        fetchExpCategories();
    }, []);

    const fetchExpCategories = async () => {

        try {
          const docRef = doc(db, "User", auth.currentUser.uid);
          const user = await getDoc(docRef);
          console.log(user.data().expCategories, " Categories **");
          const tempCategories = [];
          user.data().expCategories.forEach((item)=> {
              tempCategories.push({ label: item, value: item });
          })
          setCategories(tempCategories);
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }

    React.useEffect(() => {
        console.log(categories);
    }, [categories]);


    const addCategory = () => {

        if (!props.monthlyInc) {
            console.log("Please enter Monthly Income!")
            alert("Please enter Monthly Income!")
        }
        else if (props.monthlyInc <= 0) {
            alert("Please enter valid Monthly Income!")
        }
        else if (!props.selectedBudgetingMethod) {
            alert("Please enter Budgeting Method!");
        }
        else {
            setModalVisible(true);
        }
    }

    const deleteCategory = (index) => {
        const rm = categoryWiseBudget.splice(index, 1);
        const rms = selectedCategories.splice(index, 1);
        console.log(rm, "rm");
        console.log(rms, "rms");
        updateIsCategoryWiseBudgetChanged(true);
    }

    const editCategoryWiseBudget = (index) => {
        setEditCatBudgetModalVisible(!editCatBudgetModalVisible)
        console.log (index);
        setEditIdx(index);
    }

    const setEditedCategoryWiseBudget = () => {

        setEditCatBudgetModalVisible(!editCatBudgetModalVisible);
        console.log(editIdx, " ", categoryBudgetEdit);
        
        if(categoryBudgetEdit == null)
        {
            alert("Please enter budget amount!")
        }
        else if(categoryBudgetEdit<=0)
        {
            alert("Please enter valid budget amount!")
        }
        else if(editIdx>-1 && categoryWiseBudget.length>editIdx && categoryWiseBudget[editIdx]!=null)
        {
            console.log(categoryWiseBudget[editIdx], "****");
            console.log(categoryWiseBudget[editIdx].budgetPlanned, "**");
            categoryWiseBudget[editIdx].budgetPlanned = parseFloat(categoryBudgetEdit);
            console.log(categoryWiseBudget[editIdx]);
            setCategoryBudgetEdit(null);
            setEditIdx(-1);
        }
    

    }

    const addCategoryWiseBudget = () => {

        setModalVisible(!modalVisible);
        if (selectedCategory == null) {
            alert("Please select category!");
        }
        else if (selectedCategories.includes(selectedCategory)) {
            alert(`You have already added ${selectedCategory} category in Budget!`);
        }
        else if (categoryBudget <= 0) {
            alert("Please enter valid budget amount!");
        }
        else {
            selectedCategories.push(selectedCategory);
            categoryWiseBudget.push({ category: selectedCategory, budgetPlanned: parseFloat(categoryBudget), budgetSpent : 0});
            console.log("categoryWiseBudget", categoryWiseBudget);
            updateIsCategoryWiseBudgetChanged(true);
            console.log(isCategoryWiseBudgetChanged);
            setSelectedCategory(null);
            setCategoryBudget(null);
        }

        updateIsCategoryWiseBudgetChanged(false);
    }

    const calculateTotalIncome = () => {

        var totalAmount = 0;

        categoryWiseBudget.forEach((item) => {
            totalAmount = totalAmount + item.budgetPlanned;
        })
        console.log("Total", totalAmount);
        return totalAmount;
    }

    const validateBudget = () => {

        const totalAmount = calculateTotalIncome();

        if(totalAmount>props.monthlyInc)
        {
            alert("Your set budget amount total is exceeding your monthly income.")
            return false;
        }
        else
        {
            return true;
        }
        
    }

    const saveBudget = async() => {

        const totalAmount = calculateTotalIncome();

        if(!selectedCategories.includes("Additional Expenses"))
        {
            categoryWiseBudget.push({ category: "Additional Expenses", budgetPlanned: 0, budgetSpent : 0});
        }

        try{
            
            const recordId = months[props.date.getMonth()] + ""+ props.date.getFullYear();
            const docRef = await setDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId), {
                method : props.selectedBudgetingMethod,
                budget: categoryWiseBudget,
                saving : props.monthlyInc - totalAmount,
                monthlyInc : props.monthlyInc,
                totalBudget : totalAmount
              });
              console.log("Saved");
              props.navigation.navigate("Your Budget", {
                  budgetChanged : true,
              });
              alert(`Budget for ${months[props.date.getMonth()] + " " + props.date.getFullYear()} is saved Successfully!`);
              clearFields();
        }
        catch(e)
        {
            console.log(e)
        }
    }
    const confirmBudget = () => {

        if(validateBudget())
        {
            Alert.alert('Alert Title', 'Do you want to confirm a Budget?', [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { 
                    text: 'Yes', 
                    onPress: () => saveBudget()
                },
            ]);
        }
        
    }

    const clearFields = () => {
        setCategories([]);
        updateSelectedCategories([]);
        setCategoryWiseBudget([]);
    }

    return (
        <SafeAreaView >
            <View style={styles.categoryWiseBudgetContainer}>
                <View style={{ margin: 10, justifyContent: 'center' }}>
                    <Text style={styles.categoryWiseBudgetTitleText}>Budget Planned : </Text>
                </View>
                <View style={styles.categoryWiseBudget}>
                    <FlatList
                        data={categoryWiseBudget}
                        ListHeaderComponent={
                            <View style={styles.categoryWiseBudgetTitle}>
                                <Text style={styles.categoryWiseBudgetTitleText}>Envelope : </Text>
                                <TouchableOpacity style={styles.budgetCategoryCenter} onPress={addCategory} >
                                    <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
                                </TouchableOpacity>
                            </View>
                        }
                        renderItem={({ item, index }) =>
                            <View style={{ backgroundColor: "white", borderRadius: 30, borderWidth: 1, marginBottom: 5, borderColor: "black" }}>
                                <View style={styles.budgetCategory}>
                                    <TouchableOpacity style={styles.budgetCategoryEdit} onPress={() => editCategoryWiseBudget(index)}>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Image source={require('../../Assets/envelope.png')} style={{ width: 20, height: 20 }} />
                                        </View>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Category Name</Text>
                                            <Text>{item.category}</Text>
                                        </View>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Budget Planned</Text>
                                            <Text>{item.budgetPlanned}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteCategory(index)}>
                                        <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.noBudget}>
                                <Image source={require('../../Assets/no-data.png')} style={{ width: 100, height: 100 }} />
                                <Text style={styles.noBudgetText}>Budget is not set for any Category!</Text>
                            </View>
                        }
                        // extraData={isBudgetChanged}
                        style={{ backgroundColor: "white" }}
                    />
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={editCatBudgetModalVisible}
                        onRequestClose={() => {
                            setEditCatBudgetModalVisible(!editCatBudgetModalVisible);
                        }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Enter Budget</Text>
                                <TextInput
                                    style={styles.budgetAmountInput}
                                    onChangeText={text => setCategoryBudgetEdit(text)}
                                    value={categoryBudgetEdit}
                                    placeholder='Enter Budget for this category...'
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={[styles.buttonModal, styles.buttonClose]}
                                    onPress={() => setEditedCategoryWiseBudget()}>
                                    <Text style={styles.textStyle}>Set</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(!modalVisible);
                        }}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>Add Categorywise Budget</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={{ color: "black" }}
                                    data={categories}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Category"
                                    searchPlaceholder="Search..."
                                    value="category"
                                    onChange={(item) => {
                                        setSelectedCategory(item.value);
                                    }}
                                />
                                <TextInput
                                    style={styles.budgetAmountInput}
                                    onChangeText={text => setCategoryBudget(text)}
                                    value={categoryBudget}
                                    placeholder='Enter Budget for selected category...'
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={[styles.buttonModal, styles.buttonClose]}
                                    onPress={addCategoryWiseBudget}>
                                    <Text style={styles.textStyle}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
                <View style={styles.buttonContainer} >
                    <TouchableOpacity style={[styles.button, (categoryWiseBudget != null && categoryWiseBudget.length > 0) ? styles.enabled : styles.disabled]} disabled={(categoryWiseBudget != null && categoryWiseBudget.length > 0) ? false : true} onPress={confirmBudget}>
                        <Text style={styles.buttonText}>Set Budget</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Envelope;

const styles = StyleSheet.create({
    EnvelopeContainer: {
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.02)',
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
    categoryWiseBudgetContainer: {
        marginBottom: 5,
        marginHorizontal: 5,
        borderRadius: 10,
        height: "100%",
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    categoryWiseBudget: {
        height: "80%",
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
    budgetCategoryEdit : {
        flexDirection: "row",
        width : "90%",
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
    }

});
