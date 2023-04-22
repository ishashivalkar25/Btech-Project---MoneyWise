import { StyleSheet, Text, View, TextInput, Button, KeyboardAvoidingView, ScrollView, TouchableOpacity, Pressable, Dimensions} from 'react-native';
import React from 'react';
import { auth , db } from '../Firebase/config'
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc , setDoc  } from "firebase/firestore";
import DateTimePicker from '@react-native-community/datetimepicker';
import Background from "./Background";
import Btn from "./Btn";
import Field from "./Field";
import { darkGreen } from "./Constants";
import { useNavigation } from '@react-navigation/core';
const { width, height } = Dimensions.get("window");

export default function SignUp(props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNo, setPhoneNo] = React.useState("");
  const [DOB, setDOB] = React.useState(new Date());
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [accBalance, setAccBalance] = React.useState(0.0);
  const [text, setText] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [emailValidity, setEmailValidity] = React.useState(true);
  const [passwordValidity, setPasswordValidity] = React.useState(true);
  const [confirmPasswordValidity, setConfirmPasswordValidity] = React.useState(true);
  const [phoneNumberValidity, setPhoneNumberValidity] = React.useState(true);
  const [accBalanceValidity, setAccBalanceValidity] = React.useState(true);
  const [formattedDate, setFormattedDate] = React.useState("Date of Birth");


  const navigation = useNavigation();

  const handleEmailChange = (emailInput) => {

    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(emailInput) === true){
      setEmailValidity(true);
      setEmail(emailInput);
    }
    else{
      setEmailValidity(false);
    }
  }

  const handlePhoneNumberChange = (phoneNumberInput) => {

    const reg = /^[0]?[789]\d{9}$/;
    if (reg.test(phoneNumberInput) === true){
      setPhoneNumberValidity(true);
      setPhoneNo(phoneNumberInput);
    }
    else{
      setPhoneNumberValidity(false);
    }

  }

  const handlePasswordChange = (passwordInput) => {
   
    const reg = new RegExp("^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$");

    if (reg.test(passwordInput) === true){
      setPasswordValidity(true);
      setPassword(passwordInput);
    }
    else{
      setPasswordValidity(false);
    }
  }

  const handleConfirmPasswordChange = (confirmPasswordInput) => {

      if(confirmPasswordInput === password)
      {
        setConfirmPasswordValidity(true);
        setConfirmPassword(confirmPasswordInput);
      }
      else{
        setConfirmPasswordValidity(false);
      }
  }


  const validateInputOnSubmit = () => {

    if(name === "" || email === "" || phoneNo == "" || !DOB || password === "" || confirmPassword === "" || bankName === "" || !passwordValidity || !phoneNumberValidity || !emailValidity || !confirmPasswordValidity || !accBalanceValidity)
    {
      alert("Please enter all required fields correctly!");
      return false;
    }
    return true;
  }

  const signUpToAcc = ()=>
  {
    if(validateInputOnSubmit())
    {
      createUserWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log("Sign In Successfully!!!", user.uid);
        
        try {
          setDoc(doc(db, "User", user.uid), {
            name: name,
            email: email,
            phoneNo: phoneNo,
            DOB:DOB,
            bankName: bankName,
            accBalance: accBalance
          });
          sendEmailVerification(auth.currentUser)
            .then(() => {
              console.log("Your account is created successfully!! Email verification Link is sent to your registered Email.");
            });
          auth.signOut();
          navigation.replace("Login");
          
        } catch (e) {
          console.log("Error adding document ");
        }
       
      })
      .catch(error => {
        // signUpSuccess = false;
        alert("Sign In Unsuccesfull!!!");
      });

    }

  }

  const handleAccBalanceChange = (accBalanceInput) => {

    const reg = new RegExp("^[0-9]*$");

    if (reg.test(accBalanceInput) === true){
      setAccBalanceValidity(true);
      setAccBalance(accBalanceInput);
    }
    else{
      setAccBalanceValidity(false);
    }

  }

  const onChange = (event, selectedDate) => {
    console.log("Inside");
    setShow(false);

    const todayDate = new Date();
    if(selectedDate.getTime() >= todayDate.getTime())
    {
      alert("Please select correct date of birth!");
    }
    else
    {
      const currentDate = selectedDate || DOB;
      setDOB(currentDate);
      console.log(DOB, "new");
      const tempDate = new Date(currentDate);
      let fDate = tempDate.getDate() + '/'+ (tempDate.getMonth()+1) + '/' +tempDate.getFullYear();
      setText(fDate);
      setFormattedDate(fDate);
      console.log(fDate, "Date");
    }
    // console.log(selectedDate);
    // console.log(DOB);
    

  }


  return (
    //
    <View>
      <Background>
        {/* <ScrollView contentContainerStyle={{paddingBottom: 120}}> */}
          <View style={{alignItems: 'center', width: width , height: height*0.18,}}>
            <Text
                style={{
                  color: 'white',
                  fontSize: 64,
                  fontWeight: 'bold',
                  marginTop: 20,
                }}>
                Register
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 19,
                fontWeight: 'bold',
                marginBottom: 20,
              }}>
              Create a new account
            </Text>
          </View>
          <View
          style={{
            backgroundColor: 'white',
            height: height*0.75,
            width: width,
            borderTopLeftRadius: 130,
            paddingTop: 20,
            alignItems: 'center',
          }}>

            <Field placeholder="Name" onChangeText={(text)=>setName(text)}/>

            <Field
              placeholder="Email / Username"
              keyboardType={'email-address'}
              onChangeText={(text)=>handleEmailChange(text)}
            />
            {!emailValidity && <Text style={styles.tip}>Invalid email!</Text>}

            <Field placeholder="Contact Number" keyboardType={'numeric'} onChangeText={(text)=>handlePhoneNumberChange(text)}/>
            {!phoneNumberValidity && <Text style={styles.tip}>Please enter valid Phone number!</Text>}

            <Pressable style={{borderRadius: 25, color: darkGreen, paddingHorizontal: 10, width: '70%', height:40, backgroundColor: 'rgb(220,220, 220)', marginVertical: 10, paddingVertical:10}} onPress={() => setShow(true)}>
              <Text style={{color: darkGreen}}>{formattedDate}</Text>
            </Pressable>

            <Field placeholder="Password" secureTextEntry={true} onChangeText={(text)=>handlePasswordChange(text)}/>
            {!passwordValidity && <Text style={styles.tip}>Please enter strong password!</Text>}

            <Field placeholder="Confirm Password" secureTextEntry={true} onChangeText={(text)=>handleConfirmPasswordChange(text)}/>
            {!confirmPasswordValidity && <Text style={styles.tip}>It should match with the new password!</Text>}

            <Field placeholder="Bank Name" onChangeText={(text)=>setBankName(text)}/>

            <Field placeholder="Account Balance" keyboardType="decimal-pad" onChangeText={(text)=>handleAccBalanceChange(text)} />
            {!accBalanceValidity && <Text style={styles.tip}>Invalid Amount!</Text>}


            {show && (
              <DateTimePicker
              testID = 'dateTimePicker'
              value = {DOB}
              display="default"
              is24Hour={true}
              onChange={onChange}
              style={styles.datePicker}
            />)}

            <Btn
              textColor="white"
              bgColor={darkGreen}
              btnLabel="Signup"
              Press={signUpToAcc}
            />

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                Already have an account ?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => props.navigation.navigate('Login')}>
                <Text
                  style={{color: darkGreen, fontWeight: 'bold', fontSize: 16}}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        {/* </ScrollView> */}
      </Background>
     
    </View>

  );
}

const styles = StyleSheet.create({
  
  tip:{
    color:"red", 
    textAlign: 'left', 
    width: '70%', 
    paddingLeft: 10
  },
  datePicker: {
    width: 320,
    height: 260,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});
