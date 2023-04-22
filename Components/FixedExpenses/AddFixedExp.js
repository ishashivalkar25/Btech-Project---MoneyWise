
import React from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import {
  auth,
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from '../../Firebase/config';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
// import Field from './Field';
import { Dropdown } from 'react-native-element-dropdown';
import { useState, useEffect } from 'react';
import { darkGreen } from '../../Assets/Constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const AddFixedExp = ({ navigation }) => {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState([]);
  const [ExpName, setExpName] = useState('');
  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('');

  function showDatePicker() {
    setDatePicker(true);
  }

  function onDateSelected(event, value) {
    setDate(value);
    setDatePicker(false);
  }

  const saveFixedExpense = () => {

    if (ExpName == "" && category == "" && amount <= 0) {
      alert("Please, enter valid details!");
      return;
    }
    addFixedExpToDB();
  }

  const addFixedExpToDB = async() => {

    try {
      const docRef = await addDoc(collection(db, "User", "o4qWuRGsfDRbSyuA1OO2yljfjDr1", "FixedExpenses"), {
        ExpName: ExpName,
        category: category,
        amount: amount,
        dueDate: date,
        status : "Unpaid"
      });
      console.log("Saved");
      navigation.navigate("FixedExp");
      alert(`Fixed Expense is saved Successfully!`);
    }
    catch (e) {
      console.log(e)
    }
}

return (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.curve}>
        <ImageBackground
          source={require('../../Assets/background.jpg')}
          style={styles.curvedImg}>
          <Text style={styles.text_header}>Add Fixed Payment</Text>
        </ImageBackground>
      </View>
    </View>
    <Animatable.View animation="fadeInUpBig" style={styles.footer}>
      <ScrollView >
        <Text style={styles.text_footer}>Expense Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Name"
          onChangeText={text => setExpName(text)}
        />
        <View style={styles.action}>
          <Text style={styles.text_footer}>Category</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Category"
            onChangeText={text => setCategory(text)}
          />

          <Text style={styles.text_footer}>Amount</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Amount"
            keyboardType="numeric"
            onChangeText={text => setAmount(text)}
          />

          {datePicker && (
            <DateTimePicker
              value={date}
              mode={'date'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour={true}
              onChange={onDateSelected}
              style={styles.datePicker}
            />
          )}

          <Text style={styles.text_footer}>Deu Date</Text>


          {!datePicker && (

            <Pressable style={styles.dateButton} onPress={showDatePicker}>
              <Text >
                {date.getDate() +
                  ' / ' +
                  (date.getMonth() + 1) +
                  ' / ' +
                  date.getFullYear()}
              </Text>
              <Image
                source={require("../../Assets/Calender.jpg")}
                style={{ width: 30, height: 30 }}
                onPress={() => console.log("image pressed")}
              />
            </Pressable>

          )}



          <Animatable.View animation="bounceIn" />
        </View>

        <TouchableOpacity
          onPress={() => saveFixedExpense()}
          style={{
            backgroundColor: darkGreen,
            borderRadius: 200,
            alignItems: 'center',
            width: 250,
            paddingVertical: 5,
            marginVertical: 10,
            alignSelf: 'center',
            marginTop: 68,
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              margin: 0,
            }}>
            {' '}
            Save{' '}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Animatable.View>
  </View>
);
};

export default AddFixedExp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: darkGreen,
  },
  header: {
    // flex: 1,
    height: height * 0.15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'pink',
  },
  footer: {
    flex: Platform.OS === 'ios' ? 3 : 5,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 30,
    // height : "80%",
    width: '85%',
    alignSelf: 'center',
    borderWidth: 1.1,
    borderColor: 'black',
    marginVertical: 35,
    shadowOpacity: 0.5,
    shadowColor: 'black',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 6,

  },
  text_header: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 33,
    alignSelf: 'center',
    paddingTop: 150,
  },
  text_footer: {
    // color: '#05375a',
    // fontSize: 18,
    fontWeight: 'bold',
    fontSize: 16,
    color: darkGreen,
  },
  action: {
    // flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    flexDirection: 'row'
  },
  button: {
    alignItems: 'center',
    marginTop: 50,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  color_textPrivate: {
    color: 'grey',
  },
  dropdown: {
    margin: 10,
    width: '85%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 5,
    alignSelf: 'center',
    borderRadius: 6,
    // flexDirection:'row',
    alignItems: 'center',
  },
  placeholderStyle: {
    fontSize: 14,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  inputText: {
    borderRadius: 5,
    color: darkGreen,
    paddingHorizontal: 5,
    width: '60%',
    height: 35,
    backgroundColor: 'rgb(220,220, 220)',
  },
  dateButton: {
    // padding: 7,
    // alignSelf: 'center',
    // borderRadius: 5,
    // flexDirection: 'row',
    // width: 180,
    // alignItems: 'center',
    // backgroundColor: 'rgb(220,220, 220)',
    borderRadius: 25,
    paddingHorizontal: 10,
    width: '90%',
    height: 40,
    backgroundColor: 'rgb(220,220, 220)',
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  textInput: {
    borderRadius: 25,
    paddingHorizontal: 10,
    width: '90%',
    height: 40,
    backgroundColor: 'rgb(220,220, 220)',
    marginVertical: 10,
  },
  curve: {
    height: 300,
    width: "155%",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    padding: 0,
    overflow: 'hidden',
    marginTop: -150,
  },
  curvedImg: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  }

});

// import AddFixedExp from "./Components/AddFixedExp"
// import FixedExp from "./Components/FixedExp"
{/* <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="FixedExp" component={FixedExp}/>
                <Stack.Screen name="AddFixedExp" component={AddFixedExp}/>
            </Stack.Navigator>
        </NavigationContainer> */}