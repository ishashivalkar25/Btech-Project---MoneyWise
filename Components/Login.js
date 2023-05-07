import { StyleSheet, Text, View, TextInput, Dimensions, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import React from 'react';
import { auth } from '../Firebase/config'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/core';
import DialogInput from 'react-native-dialog-input';
import Background from "./Background";
import Btn from "./Btn";
import Field from "./Field";
import { green } from "./Constants";
const { width, height } = Dimensions.get("window");

export default function Login(props) {
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [dialogBoxVisibility, setDialogBoxVisibility] = React.useState(false);
  const [userNameValidity, setUserNameValidity] = React.useState(true);

  // const navigation = useNavigation();
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if(user && user.emailVerified){
        props.navigation.replace("Root");
        console.log(user);
      }
    });
    setUserName("");
    setPassword("");
    setUserNameValidity(true);
    return unsubscribe;
  }, []);

  const logInToAcc = ()=>{
    console.log("Logged In Successfully!!!", auth);
    signInWithEmailAndPassword(auth, userName, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log("user email :", user.email);
        if(user.emailVerified){
          props.navigation.replace("Root");
          console.log(JSON.stringify(user));
          alert("Logged In Successfully!!!");
        }
        else
        {
          alert("Please verify your Email. Link is already sent.");
          auth.signOut();
        }
      })
      .catch(error => alert("Username/ Password is incorrect!!"));
  }

  //validate email i.e username
  const handleUserNameChange = (userNameInput) => {

    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(userNameInput) === true){
      setUserName(userNameInput);
      setUserNameValidity(true);
    }
    else{
      setUserNameValidity(false);
      setUserName("");
    }
  }
  

  const redirectToSignUp = () => {
    props.navigation.navigate("Sign Up");
  }

  const forgotPassword = () => {
    setDialogBoxVisibility(true);
  }

  const passwordResetEmail = (emailInput) => {
    console.log("Email : ", emailInput);
    setDialogBoxVisibility(false);
    
    sendPasswordResetEmail(auth, emailInput)
      .then(function() {
        alert("Password reset link is sent successfully!");
      })
      .catch(function(error) {
        alert("Please enter valid email address!");
      });
  }

  return (
    // <SafeAreaProvider>
    <Background>
      <View style={{ justifyContent:"center", alignItems: "center", width: "100%",  height:height*0.15,}}>
        <Text
            style={{
              flex:1,
              color: "white",
              fontSize: 64,
              fontWeight: "bold",
              justifyContent:"center",
             
            }}
        >
            Login
        </Text>
        </View>
        <View 
          style={{
            backgroundColor: "white",
            height: height*0.85,
            width: width,
            borderTopLeftRadius: 130,
            paddingTop: 100,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "grey",
              fontSize: 19,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Login to your account
          </Text>
          <Field
            placeholder="Email / Username"
            keyboardType={"email-address"}
            onChangeText={(text)=>handleUserNameChange(text)}
          />
          {!userNameValidity && <Text style={styles.tip}>Invalid Email / Username!</Text>}
        
          <Field placeholder="Password" secureTextEntry={true} onChangeText={(text)=>setPassword(text)}/>

          <View
            style={{
              alignItems: "flex-end",
              width: "78%",
              paddingRight: 16,
              marginBottom: 200,
            }}
          >
            <Text
              style={{ color: green, fontWeight: "bold", fontSize: 16 }}
              onPress={forgotPassword}
              testID='Forgot Password'
            >Forgot Password ?</Text>
          </View>

          {/* <Btn
            textColor="white"
            bgColor={green}
            btnLabel="Login"
            Press={logInToAcc}
            testID = "LoginBtn"
          /> */}
          <TouchableOpacity
            onPress={logInToAcc}
            style={{
              backgroundColor: green,
              borderRadius: 200,
              alignItems: 'center',
              width: 250,
              paddingVertical: 5,
              marginVertical: 10
            }}
            testID="LoginBtn"
          >
            <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold' }}>
              Login
            </Text>
          </TouchableOpacity>

          <DialogInput isDialogVisible={dialogBoxVisibility}
              title={"Password Recovery"}
              message={"Enter registered email address :"}
              hintInput ={"abc@gmail.com"}
              submitInput={ (inputText) => {passwordResetEmail(inputText)} }
              closeDialog={ () => {setDialogBoxVisibility(false)}}>
          </DialogInput>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Don't have an account ?{" "}
            </Text>
            <TouchableOpacity
              onPress={redirectToSignUp}
            >
              <Text
                style={{ color: green, fontWeight: "bold", fontSize: 16 }}
              >
                Signup
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      
    </Background>
   
  );
}

const styles = StyleSheet.create({
  tip:{
    color:"red", 
    textAlign: 'left', 
    width: '70%', 
    paddingLeft: 10
  }
});
