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

const {width, height} = Dimensions.get('window');
const EditProfile = ({navigation}) => {
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

  const fetchUserDetails = async () => {
    try {
      const docRef = doc(db, 'User', 'o4qWuRGsfDRbSyuA1OO2yljfjDr1');
      const data = await getDoc(docRef);
      const userData = data.data();
      setName(userData.name);
      const tempDate = new Date(
        userData.DOB.seconds * 1000 + userData.DOB.nanoseconds / 1000000,
      );

      console.log(tempDate, 'userData.DOB');
      setDOB(tempDate);
      setEmail(userData.email);
      setBankName(userData.bankName);
      setAccBalance(userData.accBalance);
      setPhoneNo(userData.phoneNo);
      setFormattedDate(
        tempDate.getDate() +
          ' / ' +
          (tempDate.getMonth() + 1) +
          ' / ' +
          tempDate.getFullYear(),
      );
      console.log(userData);
    } catch (e) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserDetails();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

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
        navigation.navigate('Home');
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
			source={require('../Assets/Gradient_Back.jpeg')}
			style={{ width: width, height: '100%'}}>
    <View style={styles.container}>
        <ScrollView>
      <View style={styles.action} >
        <Image
          source={require('../Assets/profile1.png')}
          style={{height: 17, width: 19, marginRight: 0.20}}
        />
        <TextInput
          placeholder="Name"
          placeholderTextColor="#666666"
          autoCorrect={false}
          style={[
            styles.textInput,
            {
              color: '#006A42',
            },
          ]}
          onChangeText={text => {
            setName(text);
            setChanged(true);
          }}
        />
      </View>

      <View style={styles.action}>
        <Image
          source={require('../Assets/email.png')}
          style={{height: 22, width: 22, marginRight: 0.20}}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          autoCorrect={false}
          style={[
            styles.textInput,
            {
              color: '#006A42',
            },
          ]}
        />
      </View>

      <View style={styles.action}>
        <Image
          source={require('../Assets/telephone.png')}
          style={{height: 17, width: 17, marginRight: 0.20}}
        />
        <TextInput
          placeholder="Phone"
          placeholderTextColor="#666666"
          keyboardType="number-pad"
          autoCorrect={false}
          style={[
            styles.textInput,
            {
              color: '#006A42',
            },
          ]}
          onChangeText={text => handlePhoneNumberChange(text)}
        />
      </View>

      <View style={styles.action}>
        <Image
          source={require('../Assets/calendar.png')}
          style={{height: 18, width: 18, marginRight: 0.20}}
        />

        <Pressable
            onPress={() => setShow(true)}>
            <Text style={{color :'#666666', fontSize:15, paddingLeft:20, marginBottom:9}} >Date Of Birth</Text>
          </Pressable>
      </View>

      <View style={styles.action}>
        <Image
          source={require('../Assets/bank.png')}
          style={{height: 17, width: 17, marginRight: 0.20}}
        />
        <TextInput
          placeholder="Bank Name"
          placeholderTextColor="#666666"
          autoCorrect={false}
          style={[
            styles.textInput,
            {
              color: '#006A42',
            },
          ]}
          onChangeText={text => {
            setBankName(text);
            setChanged(true);
          }}></TextInput>
      </View>

      <View style={styles.action}>
        <Image
          source={require('../Assets/balance.png')}
          style={{height: 25, width: 25, marginRight: 0.20}}
        />
        <TextInput
          placeholder="Account Balance"
          placeholderTextColor="#666666"
          keyboardType="number-pad"
          autoCorrect={false}
          style={[
            styles.textInput,
            {
              color: '#006A42',
            },
          ]}
          onChangeText={text => handleAccBalanceChange(text)}
        />
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
              onPress={() => {}}
              style={{
                backgroundColor: '#006A42',
                borderRadius: 200,
                alignItems: 'center',
                width: 250,
                paddingVertical: 5,
                marginVertical: 100,
                alignSelf: 'center',
              }}>
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
    flex: Platform.OS === 'ios' ? 3 : 5,
    //flex:1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 30,
    width: '95%',
    height:300,
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
  disabled: {
    opacity: 0.7,
  },
  enabled: {
    opacity: 1,
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginTop: 10,
  },
  
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  action: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
    paddingLeft: 35,
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
  textInput: {
    //flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
    fontSize:15,
  },  
});