import React, { useEffect, useState } from 'react';
import { shallow, mount } from 'enzyme';
import EditProfile from '../Components/EditProfile';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { act } from 'react-dom/test-utils';
import { Text } from 'react-native'
import renderer from 'react-test-renderer';
import {
  auth,
  db,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from '../Firebase/config';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn().mockResolvedValueOnce(),
}));

jest.mock('../Firebase/config', () => ({

  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
    currentUser: jest.fn(),
  },
  db: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  storage: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));


describe('Edit ProfileScreen', () => {

  const navigation = {
    addListener: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    setOptions: jest.fn(),
  }

  global.alert = jest.fn()

  const route = {
    params: {
      name: 'John Doe',
      phoneNo: '1234567890',
      DOB: new Date(),
      bankName: 'ABC Bank',
      accBalance: 100.0
    }
  };
  

  test('renders without error', () => {
    const { getByPlaceholderText, getByText } = render(<EditProfile navigation={navigation}  route={route}/>);
  
    // Assert that the required elements are rendered
    expect(getByPlaceholderText('Name')).toBeDefined();
    expect(getByPlaceholderText('Phone')).toBeDefined();
    expect(getByPlaceholderText('Bank Name')).toBeDefined();
    expect(getByPlaceholderText('Account Balance')).toBeDefined();
    expect(getByText('Submit')).toBeDefined();
  });

  test('updates name input value', () => {
    const { getByPlaceholderText, getByText } = render(<EditProfile navigation={navigation}  route={route}/>);
    const nameInput = getByPlaceholderText('Name');

    //Valid Input
    fireEvent.changeText(nameInput, 'abc');
    expect(nameInput.props.children).toBe('abc');
  });

  test('updates phone number input value', () => {
    const { getByPlaceholderText, getByText } = render(<EditProfile navigation={navigation}  route={route}/>);
    const phoneNoInput = getByPlaceholderText('Phone');
    
    //Invalid Input 
    fireEvent.changeText(phoneNoInput, '1234567890');
    //Valid Input
    fireEvent.changeText(phoneNoInput, '8923561478');
    expect(phoneNoInput.props.children).toBe('8923561478');
    
  });

  test('updates bank name input value', () => {
    const { getByPlaceholderText, getByText } = render(<EditProfile navigation={navigation}  route={route}/>);
    const bankNameInput = getByPlaceholderText('Bank Name');

    //Valid Input
    fireEvent.changeText(bankNameInput, 'abc bank');
    expect(bankNameInput.props.children).toBe('abc bank');
  });

  test('updates account balance input value', () => {
    const { getByPlaceholderText, getByText } = render(<EditProfile navigation={navigation}  route={route}/>);
    const accBalanceInput = getByPlaceholderText('Account Balance');
    //Invalid Input 
    fireEvent.changeText(accBalanceInput, -120);
    //Valid Input
    fireEvent.changeText(accBalanceInput, 200);
    expect(accBalanceInput.props.children).toBe(200.0);
  });

  test('handle invalid date of birth input value', () => {
    const { getByTestId } = render(<EditProfile navigation={navigation}  route={route}/>);
    const showDOB = getByTestId("showDOB")
    fireEvent.press(showDOB);
    const dateTimePicker = getByTestId('dateTimePicker')
    //Invalid Input-previous date
    fireEvent(dateTimePicker , 'change', {
      nativeEvent: {
        timestamp: new Date().getTime(),
      },
    });

  });


  test('updates user details', () => {
    const { getByPlaceholderText, getByTestId } = render(<EditProfile navigation={navigation}  route={route}/>);
    const submitBtn = getByTestId("submitBtn")
    const showDOB = getByTestId("showDOB")
    fireEvent.press(showDOB);
    fireEvent(getByTestId('dateTimePicker'), 'change', {
      nativeEvent: {
        timestamp: new Date('1995-05-18').getTime(),
      },
    });
    fireEvent.changeText(getByPlaceholderText('Name'), 'abc');
    fireEvent.changeText(getByPlaceholderText('Phone'), '8923561478');
    fireEvent.changeText(getByPlaceholderText('Bank Name'), 'abc bank');
    fireEvent.changeText(getByPlaceholderText('Account Balance'), 100);
    fireEvent.press(submitBtn);
  });

});
