import React, { useEffect, useState } from 'react';
import { shallow } from 'enzyme';
import SplashScreen from '../Components/SplashScreen/SplashScreen';
import { render, waitFor } from '@testing-library/react-native';
import { act } from 'react-dom/test-utils';
import { auth } from '../Firebase/config'

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


describe('SplashScreen', () => {

  const navigation = {
    replace: jest.fn(),
  }

  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers for animations
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after the test
  });

  test('renders without error', () => {
    const wrapper = shallow(<SplashScreen navigation={navigation} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('redirects to Root if user is authenticated and email is verified', () => {

 
    // Mock the onAuthStateChanged callback to simulate an authenticated user with email verification
    auth.onAuthStateChanged.mockImplementationOnce(callback => {
      const mockUser = {
        emailVerified: true,
      };
      callback(mockUser);
    });

    render(<SplashScreen navigation={navigation} />);
    jest.runAllTimers(); // Run all timers to trigger animations

    expect(navigation.replace).toHaveBeenCalledWith('Root');
  });

  test('redirects to Login if user is not authenticated or email is not verified', () => {

    // Mock the onAuthStateChanged callback to simulate an unauthenticated user or email not verified
    auth.onAuthStateChanged.mockImplementationOnce(callback => {
      const mockUser = {
        emailVerified: false,
      };
      callback(mockUser);
    });

    render(<SplashScreen navigation={navigation} />);
    jest.runAllTimers(); // Run all timers to trigger animations

    expect(navigation.replace).toHaveBeenCalledWith('Login');
  });
  


});
