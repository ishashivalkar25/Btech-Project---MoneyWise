import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
  ImageBackground,
  ScrollView
} from 'react-native';

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
import { green } from './Constants';

const { width, height } = Dimensions.get('window');
const EditProfile = ({ navigation, route}) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNo, setPhoneNo] = React.useState('');
  const [DOB, setDOB] = React.useState(new Date());
  const [bankName, setBankName] = React.useState('');
  const [accBalance, setAccBalance] = React.useState(0.0);
  const [phoneNumberValidity, setPhoneNumberValidity] = React.useState(true);
  const [accBalanceValidity, setAccBalanceValidity] = React.useState(true);
  const [show, setShow] = React.useState(false);
  const [formattedDate, setFormattedDate] = React.useState('');
  const [isChanged, setChanged] = React.useState(false);

  React.useEffect(()=> {
   
    const tempDate = new Date(route.params.DOB);
    console.log(tempDate, '****************************************************************');
    setName(route.params.name);
    setPhoneNo(route.params.phoneNo);
    setDOB(tempDate);
    setBankName(route.params.bankName);
    setAccBalance(route.params.accBalance);
    setFormattedDate(tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear());
    
  }, [route.params])

  const handlePhoneNumberChange = phoneNumberInput => {
    const reg = /^[0]?[789]\d{9}$/;
    if (reg.test(phoneNumberInput) === true) {
      setPhoneNumberValidity(true);
      setPhoneNo(phoneNumberInput);
      setChanged(true);
    } else {
      setPhoneNumberValidity(false);
    }
  };

  const handleAccBalanceChange = accBalanceInput => {
    const reg = new RegExp('^[0-9]*$');

    if (reg.test(accBalanceInput) === true) {
      setAccBalanceValidity(true);
      setAccBalance(accBalanceInput);
      setChanged(true);
    } else {
      setAccBalanceValidity(false);
    }
  };

  const onChange = (event, selectedDate) => {
    console.log('Inside', event);
    setShow(false);
    if (event.type == 'set') {
      setChanged(true);
      const todayDate = new Date();
      if (selectedDate.getTime() >= todayDate.getTime()) {
        alert('Please select correct date of birth!');
      } else {
        const currentDate = selectedDate || DOB;
        setDOB(currentDate);
        console.log(currentDate.getDate(), 'new');
        let fDate =
          currentDate.getDate() +
          '/' +
          (currentDate.getMonth() + 1) +
          '/' +
          currentDate.getFullYear();
        setFormattedDate(fDate);
        console.log(fDate, 'Date');
      }
    }
  };

  const validateInputOnSubmit = () => {
    console.log(name, phoneNo, DOB, bankName, accBalance);
    if (
      name === '' ||
      phoneNo == '' ||
      !DOB ||
      bankName === '' ||
      !phoneNumberValidity ||
      !accBalanceValidity
    ) {
      alert('Please enter all required fields correctly!');
      return false;
    }
    return true;
  };

  const updateUserDetails = async () => {
    if (validateInputOnSubmit()) {
      console.log('Updated');
      try {
        const docRef = doc(db, 'User', 'o4qWuRGsfDRbSyuA1OO2yljfjDr1');
        await updateDoc(docRef, {
          DOB: DOB,
          accBalance: accBalance,
          bankName: bankName,
          name: name,
          phoneNo: phoneNo,
        });

        console.log('User Details Updated Successfully!');
        navigation.navigate('Profile');
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log('Not Updated');
    }
  };

  return (
    <View>
      <ImageBackground
        source={require('../Assets/Background.jpg')}
        style={{ width: width, height: '100%' }}>
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.action} >
              <Image
                source={require('../Assets/profile1.png')}
                style={styles.img}
              />
              <TextInput
                placeholder="Name"
                placeholderTextColor="#666666"
                autoCorrect={false}
                style={[
                  styles.textInput
                ]}
                onChangeText={text => {
                  setName(text);
                  setChanged(true);
                }}
              >{name}</TextInput>
            </View>

            {/* <View style={styles.action}>
              <Image
                source={require('../Assets/email.png')}
                style={styles.img}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCorrect={false}
                style={[
                  styles.textInput,
                ]}
                >{email}</TextInput>
            </View> */}

            <View style={styles.action}>
              <Image
                source={require('../Assets/telephone.png')}
                style={styles.img}
              />
              <TextInput
                placeholder="Phone"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                autoCorrect={false}
                style={[
                  styles.textInput,
                ]}
                onChangeText={text => handlePhoneNumberChange(text)}
                >{phoneNo}</TextInput>
            </View>

            <View style={styles.action}>
              <Image
                source={require('../Assets/calendar.png')}
                style={styles.img}
              />

              <Pressable
                onPress={() => setShow(true)}>
                <Text style={styles.textInput} >{formattedDate}</Text>
              </Pressable>
            </View>

            <View style={styles.action}>
              <Image
                source={require('../Assets/bank.png')}
                style={styles.img}
              />
              <TextInput
                placeholder="Bank Name"
                placeholderTextColor="#666666"
                autoCorrect={false}
                style={[
                  styles.textInput,
                ]}
                onChangeText={text => {
                  setBankName(text);
                  setChanged(true);
                }}>{bankName}</TextInput>
            </View>

            <View style={styles.action}>
              <Image
                source={require('../Assets/balance.png')}
                style={styles.img}
              />
              <TextInput
                placeholder="Account Balance"
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                autoCorrect={false}
                style={[
                  styles.textInput,
                ]}
                onChangeText={text => handleAccBalanceChange(text)}
                >{accBalance}</TextInput>
            </View>

            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={DOB}
                display="default"
                is24Hour={true}
                onChange={onChange}
                style={styles.datePicker}
              />
            )}

            <TouchableOpacity
              style={[{
                backgroundColor: green,
                borderRadius: 200,
                alignItems: 'center',
                width: 250,
                paddingVertical: 5,
                marginVertical: 100,
                alignSelf: 'center',
              }, isChanged ? styles.enabled : styles.disabled ]}
              onPress={() => updateUserDetails()}
              disabled={!isChanged}
              >
              <Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', margin: 0 }}> Submit </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    // flex: Platform.OS === 'ios' ? 3 : 5,
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 30,
    width: '95%',
    height: 300,
    alignSelf: 'center',
    marginVertical: 35,
    shadowOpacity: 0.5,
    shadowColor: 'black',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 6,
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginTop: 10,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    paddingHorizontal: 35,
    paddingBottom : 5,
    marginHorizontal: 20,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  img: {
    height: 19,
    width: 19,
    marginRight : 20,
  },

  textInput: {
    color: green,
    fontSize: 15,
    padding: 0,
    margin: 0,
    height: 40,
    textAlignVertical: 'bottom',
  },

  disabled: {
    opacity: 0.7
  },
  enabled: {
      opacity: 1
  }

});