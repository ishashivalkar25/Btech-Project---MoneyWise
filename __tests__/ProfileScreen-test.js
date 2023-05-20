import React, { useEffect, useState } from 'react';
import { shallow, mount } from 'enzyme';
import ProfileScreen from '../Components/ProfileScreen';
import { render, waitFor } from '@testing-library/react-native';
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


describe('ProfileScreen', () => {

  const navigation = {
    addListener: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
    setOptions: jest.fn(),
  }
  test('renders without error', () => {
    const wrapper = shallow(<ProfileScreen navigation={navigation} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('fetchUserDetails function returns user data', async () => {

    const spy = jest.spyOn(React, "useEffect");
    const useStateSpy = jest.spyOn(React, "useState").mockImplementationOnce();
    spy.mockImplementationOnce((f) => f()).mockImplementationOnce((f)=> f(), [navigation]);

    const userData = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      phoneNo: '1234567890',
      DOB: { seconds: 1651932693, nanoseconds: 0 },
      bankName: 'XYZ Bank',
      accBalance: 10000,
    }
    const unsubscribe = jest.fn();
    navigation.addListener = jest.fn((event, callback) => {
      if (event === 'focus') {
        callback();
        return unsubscribe;
      }
    });
    // const mockfetchUserDetails = jest.fn().mockImplementation(fetchUserDetails);
    getDoc.mockResolvedValueOnce({ data: jest.fn(() => userData) })

    const testRenderer = await act(async () => {
        return renderer.create(<ProfileScreen navigation={navigation} />);
    });
   
    // const testInstance = testRenderer.root;
    // testInstance.findByProps({ testID: 'editProfile' }).simulate('press')

    // expect(testInstance.find('[testID="editProfile]"').simulate('press')).toBe('bar');
    // expect(testInstance.findByProps({className: "sub"}).children).toEqual(['Sub']);

    // await waitFor(() => expect(mockfetchUserDetails).toHaveBeenCalledWith());


    // const userData = { 
    //   name: 'John Doe',
    //   email: 'johndoe@example.com',
    //   phoneNo: '1234567890',
    //   DOB: { seconds: 1651932693, nanoseconds: 0 },
    //   bankName: 'XYZ Bank',
    //   accBalance: 10000,
    // }

    // const wrapper = shallow(<ProfileScreen />);
    // getDoc.mockResolvedValueOnce({ data : jest.fn(() => tempData)})
    // const userData = await fetchUserDetails();
    // expect(wrapper.find('[testID="Name"]').props().children).toBe('John Doe');

    // const setNameSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setDOBspy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setEmailSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setBankNameSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setAccBalanceSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setPhoneNoSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);
    // const setFormattedDateSpy = jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]);

    // const tempDate = new Date(userData.DOB.seconds * 1000 + userData.DOB.nanoseconds / 1000000);

    // const wrapper = shallow(<ProfileScreen />);
    // await waitFor(() => expect(navigation.addListener).toHaveBeenCalledWith('focus', expect.any(Function)));
    // expect(global.fetchUserDetails).toHaveBeenCalled();
    // expect(setNameSpy).toHaveBeenCalledWith(userData.name);
    // expect(setDOBspy).toHaveBeenCalledWith(tempDate);
    // expect(setEmailSpy).toHaveBeenCalledWith(userData.email);
    // expect(setBankNameSpy).toHaveBeenCalledWith(userData.bankName);
    // expect(setAccBalanceSpy).toHaveBeenCalledWith(userData.accBalance);
    // expect(setPhoneNoSpy).toHaveBeenCalledWith(userData.phoneNo);
    // expect(setFormattedDateSpy).toHaveBeenCalledWith(tempDate.getDate() + ' / ' + (tempDate.getMonth() + 1) + ' / ' + tempDate.getFullYear());

    // expect(wrapper).toMatchSnapshot();
    React.useEffect.mockRestore();
  });
});
