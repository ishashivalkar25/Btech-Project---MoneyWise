import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import { auth, db, collection, getDocs, getDoc, doc, updateDoc, setDoc, addDoc } from "../../Firebase/config";

import { Dropdown } from 'react-native-element-dropdown';
import { green } from "../Constants";
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


const FiftyThirtyTwenty = (props) => {

    const [categoryWiseFiftyPerBudget, setCategoryWiseFiftyPerBudget] = React.useState([]);
    const [categoryWiseThirtyPerBudget, setCategoryWiseThirtyPerBudget] = React.useState([]);
    const [categoryWiseTwentyPerBudget, setCategoryWiseTwentyPerBudget] = React.useState([]);

    const [fiftyPerAmt, setFiftyPerAmt] = React.useState([]);
    const [thirtyPerAmt, setThirtyPerAmt] = React.useState([]);
    const [twentyPerAmt, setTwentyPerAmt] = React.useState([]);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [editCatBudgetModalVisible, setEditCatBudgetModalVisible] = React.useState(false);
    const [monthlyInc, setMonthlyInc] = React.useState();
    const [fiftyPerCategories, setFiftyPerCategories] = React.useState();
    const [thirtyPerCategories, setThirtyPerCategories] = React.useState([]);
    const [twentyPerCategories, setTwentyPerCategories] = React.useState([]);

    const [selectedFiftyPerCategories, updateSelectedFiftyPerCategories] = React.useState([]);
    const [selectedThirtyPerCategories, updateSelectedThirtyPerCategories] = React.useState([]);
    const [selectedTwentyPerCategories, updateSelectedTwentyPerCategories] = React.useState([]);

    const [selectedCategory, setSelectedCategory] = React.useState();
    const [categoryBudget, setCategoryBudget] = React.useState();
    const [categoryBudgetEdit, setCategoryBudgetEdit] = React.useState()
    const [editIdx, setEditIdx] = React.useState(-1);

    const [isCategoryWiseFiftyPerBudgetChanged, updateIsCategoryWiseFiftyPerBudgetChanged] = React.useState(false);
    const [isCategoryWiseThirtyPerBudgetChanged, updateIsCategoryWiseThirtyPerBudgetChanged] = React.useState(false);
    const [isCategoryWiseTwentyPerBudgetChanged, updateIsCategoryWiseTwentyPerBudgetChanged] = React.useState(false);

    const [whichPercentage, setWhichPercentage] = React.useState()
    const fiftyarr = []
    const thirtyarr = []
    const twentyarr = []

    const [wantToAddOtherCat, editWantToAddOtherCat] = React.useState(false);

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {

        try {
            const fiftyDocRef = doc(db, "FiftyThirtyTwenty", "Fifty");
            const fiftyCat = await getDoc(fiftyDocRef);
            for (index = 0; index < fiftyCat.data().categories.length; index++) {
                fiftyarr.push({ label: fiftyCat.data().categories[index], value: fiftyCat.data().categories[index] })
            }
            fiftyarr.push({ label: 'Other', value: 'Other' })
            setFiftyPerCategories(fiftyarr)

            const thirtyDocRef = doc(db, "FiftyThirtyTwenty", "Thirty");
            const thirtyCat = await getDoc(thirtyDocRef);
            for (index = 0; index < thirtyCat.data().categories.length; index++) {
                thirtyarr.push({ label: thirtyCat.data().categories[index], value: thirtyCat.data().categories[index] })
            }
            thirtyarr.push({ label: 'Other', value: 'Other' })
            setThirtyPerCategories(thirtyarr)

            const twentyDocRef = doc(db, "FiftyThirtyTwenty", "Twenty");
            const twentyCat = await getDoc(twentyDocRef);
            for (index = 0; index < twentyCat.data().categories.length; index++) {
                twentyarr.push({ label: twentyCat.data().categories[index], value: twentyCat.data().categories[index] })
            }
            twentyarr.push({ label: 'Other', value: 'Other' })
            setTwentyPerCategories(twentyarr)
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }

    React.useEffect(() => {
        if (props.monthlyInc) {
            setFiftyPerAmt(props.monthlyInc * 50 / 100);
            setThirtyPerAmt(props.monthlyInc * 30 / 100);
            setTwentyPerAmt(props.monthlyInc * 20 / 100);
        }
    }, [props.monthlyInc]);

    const addCategory = (percentage) => {

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
            setWhichPercentage(percentage)
            setModalVisible(true);
        }
    }

    const deleteCategory = (index, percentage) => {
        if (percentage === "Fifty") {
            const rm = categoryWiseFiftyPerBudget.splice(index, 1);
            const rms = selectedFiftyPerCategories.splice(index, 1);
            console.log(rm, "rm");
            console.log(rms, "rms");
            updateIsCategoryWiseFiftyPerBudgetChanged(true);
        }
        else if (percentage === "Thirty") {
            const rm = categoryWiseThirtyPerBudget.splice(index, 1);
            const rms = selectedThirtyPerCategories.splice(index, 1);
            console.log(rm, "rm");
            console.log(rms, "rms");
            updateIsCategoryWiseThirtyPerBudgetChanged(true);
        }
        else if (percentage === "Twenty") {
            const rm = categoryWiseTwentyPerBudget.splice(index, 1);
            const rms = selectedTwentyPerCategories.splice(index, 1);
            console.log(rm, "rm");
            console.log(rms, "rms");
            updateIsCategoryWiseTwentyPerBudgetChanged(true);
        }
    }

    const editCategoryWiseBudget = (index, percentage) => {
        setWhichPercentage(percentage)
        setEditCatBudgetModalVisible(!editCatBudgetModalVisible)
        console.log(index);
        setEditIdx(index);
    }

    const setEditedCategoryWiseBudget = (percentage) => {

        setEditCatBudgetModalVisible(!editCatBudgetModalVisible);
        console.log(editIdx, " ", categoryBudgetEdit);

        if (categoryBudgetEdit == null) {
            alert("Please enter budget amount!")
        }
        else if (categoryBudgetEdit <= 0) {
            alert("Please enter valid budget amount!")
        }
        else if (percentage === "Fifty" && editIdx > -1 && categoryWiseFiftyPerBudget.length > editIdx && categoryWiseFiftyPerBudget[editIdx] != null) {
            console.log(categoryWiseFiftyPerBudget[editIdx], "****");
            console.log(categoryWiseFiftyPerBudget[editIdx].budgetPlanned, "**");
            categoryWiseFiftyPerBudget[editIdx].budgetPlanned = parseFloat(categoryBudgetEdit);
            console.log(categoryWiseFiftyPerBudget[editIdx]);
            setCategoryBudgetEdit(null);
            setEditIdx(-1);
        }
        else if (percentage === "Thirty" && editIdx > -1 && categoryWiseThirtyPerBudget.length > editIdx && categoryWiseThirtyPerBudget[editIdx] != null) {
            console.log(categoryWiseThirtyPerBudget[editIdx], "****");
            console.log(categoryWiseThirtyPerBudget[editIdx].budgetPlanned, "**");
            categoryWiseThirtyPerBudget[editIdx].budgetPlanned = parseFloat(categoryBudgetEdit);
            console.log(categoryWiseThirtyPerBudget[editIdx]);
            setCategoryBudgetEdit(null);
            setEditIdx(-1);
        }
        else if (percentage === "Twenty" && editIdx > -1 && categoryWiseTwentyPerBudget.length > editIdx && categoryWiseTwentyPerBudget[editIdx] != null) {
            console.log(categoryWiseTwentyPerBudget[editIdx], "****");
            console.log(categoryWiseTwentyPerBudget[editIdx].budgetPlanned, "**");
            categoryWiseTwentyPerBudget[editIdx].budgetPlanned = parseFloat(categoryBudgetEdit);
            console.log(categoryWiseTwentyPerBudget[editIdx]);
            setCategoryBudgetEdit(null);
            setEditIdx(-1);
        }


    }

    const addCategoryWiseBudget = (percentage) => {

        setModalVisible(!modalVisible);
        editWantToAddOtherCat(false);
        if (selectedCategory == null) {
            alert("Please select category!");
        }
        else if ((percentage === "Fifty" && selectedFiftyPerCategories.includes(selectedCategory)) || (percentage === "Thirty" && selectedThirtyPerCategories.includes(selectedCategory)) || (percentage === "Twenty" && selectedTwentyPerCategories.includes(selectedCategory))) {
            alert(`You have already added ${selectedCategory} category in Budget!`);
        }
        else if (categoryBudget <= 0 || (percentage === "Fifty" && categoryBudget > fiftyPerAmt) || (percentage === "Thirty" && categoryBudget > thirtyPerAmt) || (percentage === "Twenty" && categoryBudget > twentyPerAmt)) {
            alert("Please enter valid budget amount!");
        }
        else {
            if (percentage === "Fifty") {
                fiftyPerCategories.splice(fiftyPerCategories.length - 1, 0, { label: selectedCategory, value: selectedCategory })
                selectedFiftyPerCategories.push(selectedCategory);
                categoryWiseFiftyPerBudget.push({ category: selectedCategory, budgetPlanned: parseFloat(categoryBudget), budgetSpent: 0 });
                console.log("categoryWiseBudget", categoryWiseFiftyPerBudget);
                updateIsCategoryWiseFiftyPerBudgetChanged(true);
                console.log(isCategoryWiseFiftyPerBudgetChanged);
                setSelectedCategory(null);
                setCategoryBudget(null);
            }
            else if (percentage === "Thirty") {
                thirtyPerCategories.splice(thirtyPerCategories.length - 1, 0, { label: selectedCategory, value: selectedCategory })
                selectedThirtyPerCategories.push(selectedCategory);
                categoryWiseThirtyPerBudget.push({ category: selectedCategory, budgetPlanned: parseFloat(categoryBudget), budgetSpent: 0 });
                console.log("categoryWiseThirtyBudget", categoryWiseThirtyPerBudget);
                updateIsCategoryWiseThirtyPerBudgetChanged(true);
                console.log(isCategoryWiseThirtyPerBudgetChanged);
                setSelectedCategory(null);
                setCategoryBudget(null);
            }
            else if (percentage === "Twenty") {
                twentyPerCategories.splice(twentyPerCategories.length - 1, 0, { label: selectedCategory, value: selectedCategory })
                selectedTwentyPerCategories.push(selectedCategory);
                categoryWiseTwentyPerBudget.push({ category: selectedCategory, budgetPlanned: parseFloat(categoryBudget), budgetSpent: 0 });
                console.log("categoryWiseBudget", categoryWiseTwentyPerBudget);
                updateIsCategoryWiseTwentyPerBudgetChanged(true);
                console.log(isCategoryWiseTwentyPerBudgetChanged);
                setSelectedCategory(null);
                setCategoryBudget(null);
            }
        }

        updateIsCategoryWiseFiftyPerBudgetChanged(false);
        updateIsCategoryWiseThirtyPerBudgetChanged(false);
        updateIsCategoryWiseTwentyPerBudgetChanged(false);
    }

    const calculateTotalIncome = () => {

        const totalAmount = []

        var fiftyPerTotalAmt = 0;
        var thirtyPerTotalAmt = 0;
        var twentyPerTotalAmt = 0;

        categoryWiseFiftyPerBudget.forEach((item) => {
            fiftyPerTotalAmt = fiftyPerTotalAmt + item.budgetPlanned;
        })

        categoryWiseThirtyPerBudget.forEach((item) => {
            thirtyPerTotalAmt = thirtyPerTotalAmt + item.budgetPlanned;
        })

        categoryWiseTwentyPerBudget.forEach((item) => {
            twentyPerTotalAmt = twentyPerTotalAmt + item.budgetPlanned;
        })

        totalAmount.push(fiftyPerTotalAmt);
        totalAmount.push(thirtyPerTotalAmt);
        totalAmount.push(twentyPerTotalAmt);

        console.log("Total", totalAmount);
        return totalAmount;
    }

    const validateBudget = () => {

        const totalAmount = calculateTotalIncome();
        var fiftyPerTotalAmt = totalAmount[0];
        var thirtyPerTotalAmt = totalAmount[1];
        var twentyPerTotalAmt = totalAmount[2];

        if (fiftyPerTotalAmt > fiftyPerAmt) {
            alert("Your set budget amount total is exceeding 50%.")
            return false;
        }
        else if (thirtyPerTotalAmt > thirtyPerAmt) {
            alert("Your set budget amount total is exceeding 30%.")
            return false;
        }
        else if (twentyPerTotalAmt > twentyPerAmt) {
            alert("Your set budget amount total is exceeding 20%.")
            return false;
        }
        else {
            return true;
        }

    }



    // const clearFields = () => {
    //     setDate(new Date());
    //     setMonthlyInc(null);
    //     setCategories([]);
    //     updateSelectedCategories([]);
    //     setCategoryWiseFiftyPerBudget([]);
    //     setCategoryWiseThirtyPerBudget([]);
    //     setCategoryWiseTwentyPerBudget([]);
    //     setSelectedBudgetingMethod(null);
    // }


    const saveBudget = async () => {

        const totalAmount = calculateTotalIncome();
        var fiftyPerTotalAmt = totalAmount[0];
        var thirtyPerTotalAmt = totalAmount[1];
        var twentyPerTotalAmt = totalAmount[2];


        if (!selectedTwentyPerCategories.includes("Other Savings")) {
            categoryWiseTwentyPerBudget.push({ category: "Other Savings", budgetPlanned: twentyPerAmt - twentyPerTotalAmt, budgetSpent: 0 });
        }

        try {

            const recordId = months[props.date.getMonth()] + "" + props.date.getFullYear();
            const docRef = await setDoc(doc(db, "User", auth.currentUser.uid, "Budget", recordId), {
                method: props.selectedBudgetingMethod,
                budget: {
                    needs: categoryWiseFiftyPerBudget,
                    wants: categoryWiseThirtyPerBudget,
                    savings: categoryWiseTwentyPerBudget,
                },
                monthlyInc: props.monthlyInc,
                totalBudget: fiftyPerTotalAmt + thirtyPerTotalAmt + twentyPerTotalAmt
            });
            console.log("Saved");
            props.navigation.navigate("Your Budget", {
                budgetChanged: true,
            });


            alert(`Budget for ${months[props.date.getMonth()] + " " + props.date.getFullYear()} is saved Successfully!`);
            //   clearFields();
        }
        catch (e) {
            console.log(e)
        }
    }
    const confirmBudget = () => {

        if (validateBudget()) {
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



    return (
        <View style={styles.categoryWiseBudgetContainer}>
            <View style={{ margin: 10, justifyContent: 'center' }}>
                <Text style={styles.categoryWiseBudgetTitleText}>Budget Planned : </Text>
            </View>
            <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={() => (
                    <>
                        <FlatList
                            data={categoryWiseFiftyPerBudget}
                            ListHeaderComponent={
                                <View style={styles.categoryWiseBudgetTitle}>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Needs (50%) </Text>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Amount- {fiftyPerAmt} </Text>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => addCategory("Fifty")} >
                                        <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
                                    </TouchableOpacity>
                                </View>
                            }
                            renderItem={({ item, index }) =>
                                <View style={styles.budgetCategory}>
                                    <TouchableOpacity style={styles.budgetCategoryEdit} onPress={() => editCategoryWiseBudget(index, "Fifty")}>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Category Name</Text>
                                            <Text>{item.category}</Text>
                                        </View>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Budget Planned</Text>
                                            <Text>{item.budgetPlanned}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteCategory(index, "Fifty")}>
                                        <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={
                                <View style={styles.noBudget}>
                                    <Image source={require('../../Assets/no-data.png')} style={{ width: 70, height: 70 }} />
                                    <Text style={styles.noBudgetText}>Budget is not set for any Category!</Text>
                                </View>
                            }
                        // extraData={isBudgetChanged}
                        />

                        <FlatList
                            data={categoryWiseThirtyPerBudget}
                            ListHeaderComponent={
                                <View style={styles.categoryWiseBudgetTitle}>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Wants (30%) </Text>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Amount- {thirtyPerAmt} </Text>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => addCategory("Thirty")} >
                                        <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
                                    </TouchableOpacity>
                                </View>
                            }
                            renderItem={({ item, index }) =>
                                <View style={styles.budgetCategory}>
                                    <TouchableOpacity style={styles.budgetCategoryEdit} onPress={() => editCategoryWiseBudget(index, "Thirty")}>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Category Name</Text>
                                            <Text>{item.category}</Text>
                                        </View>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Budget Planned</Text>
                                            <Text>{item.budgetPlanned}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteCategory(index, "Thirty")}>
                                        <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={
                                <View style={styles.noBudget}>
                                    <Image source={require('../../Assets/no-data.png')} style={{ width: 70, height: 70 }} />
                                    <Text style={styles.noBudgetText}>Budget is not set for any Category!</Text>
                                </View>
                            }
                        // extraData={isBudgetChanged}
                        />

                        <FlatList
                            data={categoryWiseTwentyPerBudget}
                            ListHeaderComponent={
                                <View style={styles.categoryWiseBudgetTitle}>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Savings (20%) </Text>
                                    <Text style={styles.categoryWiseBudgetTitleText}>Amount- {twentyPerAmt} </Text>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => addCategory("Twenty")} >
                                        <Image source={require('../../Assets/more.png')} style={{ width: 20, height: 20, tintColor: green }} />
                                    </TouchableOpacity>
                                </View>
                            }
                            renderItem={({ item, index }) =>
                                <View style={styles.budgetCategory}>
                                    <TouchableOpacity style={styles.budgetCategoryEdit} onPress={() => editCategoryWiseBudget(index, "Twenty")}>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Category Name</Text>
                                            <Text>{item.category}</Text>
                                        </View>
                                        <View style={styles.budgetCategoryCenter}>
                                            <Text style={styles.budgetCategoryText}>Budget Planned</Text>
                                            <Text>{item.budgetPlanned}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.budgetCategoryCenter} onPress={() => deleteCategory(index, "Twenty")}>
                                        <Image source={require('../../Assets/remove.png')} style={styles.buttonImg} />
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={
                                <View style={styles.noBudget}>
                                    <Image source={require('../../Assets/no-data.png')} style={{ width: 70, height: 70 }} />
                                    <Text style={styles.noBudgetText}>Budget is not set for any Category!</Text>
                                </View>
                            }
                        // extraData={isBudgetChanged}
                        />

                        <View style={styles.buttonContainer} >
                            <TouchableOpacity style={[styles.button, ((categoryWiseFiftyPerBudget != null && categoryWiseFiftyPerBudget.length > 0) || (categoryWiseThirtyPerBudget != null && categoryWiseThirtyPerBudget.length > 0) || (categoryWiseTwentyPerBudget != null && categoryWiseTwentyPerBudget.length > 0)) ? styles.enabled : styles.disabled]} disabled={((categoryWiseFiftyPerBudget != null && categoryWiseFiftyPerBudget.length > 0) || (categoryWiseThirtyPerBudget != null && categoryWiseThirtyPerBudget.length > 0) || (categoryWiseTwentyPerBudget != null && categoryWiseTwentyPerBudget.length > 0)) ? false : true} onPress={confirmBudget}>
                                <Text style={styles.buttonText}>Set Budget</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
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
                            onPress={() => setEditedCategoryWiseBudget(whichPercentage)}>
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
                    editWantToAddOtherCat(false);
                    setSelectedCategory(null);
                    setCategoryBudget(null);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Add Categorywise Budget</Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            data={(whichPercentage === "Fifty") ? fiftyPerCategories : ((whichPercentage === "Thirty") ? thirtyPerCategories : twentyPerCategories)}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Category"
                            searchPlaceholder="Search..."
                            value="category"
                            onChange={(item) => {
                                if (item.value != "Other") {
                                    setSelectedCategory(item.value);
                                    editWantToAddOtherCat(false);
                                }
                                else {
                                    editWantToAddOtherCat(true);
                                    setSelectedCategory(null);
                                }
                            }}
                        />

                        {wantToAddOtherCat && <TextInput
                            style={styles.budgetAmountInput}
                            onChangeText={text => setSelectedCategory(text)}
                            value={selectedCategory}
                            placeholder='Enter Other custom category...'
                        />}
                        <TextInput
                            style={styles.budgetAmountInput}
                            onChangeText={text => setCategoryBudget(text)}
                            value={categoryBudget}
                            placeholder='Enter Budget for selected category...'
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            style={[styles.buttonModal, styles.buttonClose]}
                            onPress={() => addCategoryWiseBudget(whichPercentage)}>
                            <Text style={styles.textStyle}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



        </View>

    )
}

export default FiftyThirtyTwenty

const styles = StyleSheet.create({
    setBudgetContainer: {
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
    }

});