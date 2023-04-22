import React from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, Dimensions, Pressable } from 'react-native';

import {
  auth,
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from '../Firebase/config';

import DateTimePicker from '@react-native-community/datetimepicker';


const { width, height } = Dimensions.get('window');
const ProfileScreen = ({navigation}) => {

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNo, setPhoneNo] = React.useState("");
  const [DOB, setDOB] = React.useState(new Date());
  const [bankName, setBankName] = React.useState("");
  const [accBalance, setAccBalance] = React.useState(0.0);
  const [phoneNumberValidity, setPhoneNumberValidity] = React.useState(true);
  const [accBalanceValidity, setAccBalanceValidity] = React.useState(true);
  const [show, setShow] = React.useState(false);
  const [formattedDate, setFormattedDate] = React.useState("");
  const [isChanged, setChanged] = React.useState(false);

  const fetchUserDetails = async () => {
    try {
      const docRef = doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1");
      const data = await getDoc(docRef);
      const userData = data.data();
      setName(userData.name);
      const tempDate = new Date(userData.DOB.seconds * 1000 + userData.DOB.nanoseconds/1000000);

      console.log(tempDate, "userData.DOB");
      setDOB(tempDate);
      setEmail(userData.email);
      setBankName(userData.bankName);
      setAccBalance(userData.accBalance);
      setPhoneNo(userData.phoneNo);
      setFormattedDate(tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear())
      console.log(userData);
    }
    catch (e) {
      console.log(e);
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserDetails();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const handlePhoneNumberChange = (phoneNumberInput) => {

    const reg = /^[0]?[789]\d{9}$/;
    if (reg.test(phoneNumberInput) === true) {
      setPhoneNumberValidity(true);
      setPhoneNo(phoneNumberInput);
      setChanged(true);
    }
    else {
      setPhoneNumberValidity(false);
    }

  }

  const handleAccBalanceChange = (accBalanceInput) => {

    const reg = new RegExp("^[0-9]*$");

    if (reg.test(accBalanceInput) === true) {
      setAccBalanceValidity(true);
      setAccBalance(accBalanceInput);
      setChanged(true);
    }
    else {
      setAccBalanceValidity(false);
    }

  }

  const onChange = (event, selectedDate) => {
    console.log("Inside", event);
    setShow(false);
    if(event.type=='set')
    {
      setChanged(true);
      const todayDate = new Date();
      if (selectedDate.getTime() >= todayDate.getTime()) {
        alert("Please select correct date of birth!");
      }
      else {
        const currentDate = selectedDate || DOB;
        setDOB(currentDate);
        console.log(currentDate.getDate(), "new");
        let fDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
        setFormattedDate(fDate);
        console.log(fDate, "Date");
      }
    }
    
  }

  const validateInputOnSubmit = () => {

    console.log(name, phoneNo, DOB, bankName, accBalance)
    if (name === "" || phoneNo == "" || !DOB || bankName === "" || !phoneNumberValidity || !accBalanceValidity) {
      alert("Please enter all required fields correctly!");
      return false;
    }
    return true;
  }

  const updateUserDetails = async() => {
    if (validateInputOnSubmit()) {
      console.log("Updated");
      try{
        const docRef = doc(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1");
        await updateDoc(docRef, {
          DOB: DOB, 
          accBalance : accBalance,
          bankName: bankName, 
          name: name, 
          phoneNo: phoneNo
        });

        console.log("User Details Updated Successfully!");
        navigation.navigate("Home");
      }
      catch(e){
        console.log(e)
      }
    }
    else {
      console.log("Not Updated");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.detailsHeight}>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>User Name</Text>
          <TextInput style={styles.userDetailsContainerVal} onChangeText={(text) => {setName(text); setChanged(true);}}>{name}</TextInput>
        </View>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>User Email</Text>
          <View style={styles.userDetailsContainerVal} >
            <Text>{email}</Text>
          </View>
        </View>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>Phone No.</Text>
          <TextInput style={styles.userDetailsContainerVal} keyboardType="numeric" onChangeText={(text) => handlePhoneNumberChange(text)}>{phoneNo}</TextInput>
        </View>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>Date Of Birth</Text>
          <Pressable style={styles.userDetailsContainerVal} onPress={() => setShow(true)}>
            <Text>{formattedDate}</Text>
          </Pressable>
        </View>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>Bank Name</Text>
          <TextInput style={styles.userDetailsContainerVal} onChangeText={(text) => {setBankName(text); setChanged(true);}}>{bankName}</TextInput>
        </View>
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetailsContainerText}>Account Balance</Text>
          <TextInput style={styles.userDetailsContainerVal} keyboardType="numeric" onChangeText={(text) => handleAccBalanceChange(text)}>{accBalance}</TextInput>
        </View>
      </View>
      {show && (
        <DateTimePicker
          testID='dateTimePicker'
          value={DOB}
          display="default"
          is24Hour={true}
          onChange={onChange}
          style={styles.datePicker}
        />)}

      <View style={styles.saveDetailsBtnContainer}>
        <TouchableOpacity style={[styles.saveDetailsBtn, isChanged ? styles.enabled : styles.disabled]} onPress={() => updateUserDetails()} disable={!isChanged}>
          <Text style={styles.saveDetailsBtnText}>Save Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
  },
  detailsHeight: {
    height: height * 0.85,
    paddingVertical: 20,
  },
  userDetailsContainer: {
    padding: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    marginVertical: 5
  },
  userDetailsContainerText: {
    fontSize: 15,
    color: "green",
    fontWeight: "bold",
    padding: 5
  },
  userDetailsContainerVal: {
    backgroundColor: "rgba(0,0,0,0.05)",
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent : "center",
  },
  saveDetailsBtnContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.08,
  },
  saveDetailsBtn: {
    backgroundColor: "green",
    height: 45,
    width: "60%",
    padding: 10,
    alignItems: "center",
    borderRadius: 15,
  },
  saveDetailsBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.7
  },
  enabled: {
      opacity: 1
  }


});