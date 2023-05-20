import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Visualisation from '../Components/Visualisation/Visualisation';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
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
      onAuthStateChanged: jest.fn(callback => callback({ emailVerified: true })),
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

describe('Visualisation component', () => {

  test('renders correctly', () => {
    const wrapper = shallow(<Visualisation/>);
    expect(wrapper.exists()).toBe(true);
  });

  test('updates date on month-year button press', () => {

    const wrapper = shallow(<Visualisation/>);
    wrapper.find('[testID="month-year-button"]').simulate('press');
    wrapper.find('[testID="MonthPicker"]').prop('onChange')({}, new Date(2022, 1));
    const date = new Date(2022, 1);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const expectedText = `${month} ${year}`;
    const monthYearText = wrapper.find({ testID: 'month-year-text' }).props('value').children;
    expect(monthYearText).toBe(expectedText);
  });

  test('fetch records', async() => {

    getDocs.mockResolvedValueOnce({
        forEach: (callback) => {
            // Simulating forEach loop for each document
            const mockDocument1 = {
                id: 'mockId1',
                data: () => ({
                    incAmount: 100,
                    incDescription: 'Mock Description 1',
                    incCategory: 'Mock Category 1',
                    incDate: { seconds: new Date().getTime()/1000, nanoseconds: 0 }
                })
            };
            const mockDocument2 = {
                id: 'mockId2',
                data: () => ({
                    incAmount: 200,
                    incDescription: 'Mock Description 2',
                    incCategory: 'Mock Category 2',
                    incDate: { seconds:  new Date().getTime()/1000, nanoseconds: 0 }
                })
            };
            // Calling the callback function for each document
            callback(mockDocument1);
            callback(mockDocument2);
        }
    })
    .mockResolvedValueOnce({
    forEach: (callback) => {
        // Simulating forEach loop for each document
        const mockDocument1 = {
            id: 'mockId1',
            data: () => ({
                expAmount: 100,
                expDescription: 'Mock Description 1',
                expCategory: 'Mock Category 1',
                expDate: { seconds: new Date().getTime() / 1000, nanoseconds: 0 }
            })
        };
        const mockDocument2 = {
            id: 'mockId2',
            data: () => ({
                expAmount: 200,
                expDescription: 'Mock Description 2',
                expCategory: 'Mock Category 2',
                expDate: { seconds: new Date().getTime() / 1000, nanoseconds: 0 }
            })
        };
        const mockDocument3 = {
            id: 'mockId3',
            data: () => ({
                expAmount: 1000,
                expDescription: 'Mock Description 3',
                expCategory: 'Mock Category 3',
                expDate: { seconds: new Date("2023-05-08").getTime() / 1000, nanoseconds: 0 }
            })
        };
        // Calling the callback function for each document
        callback(mockDocument1);
        callback(mockDocument2);
        callback(mockDocument3);
    }
    }) 

    console.error = jest.fn();

    await act(async () => {
        return renderer.create(<Visualisation/>);
    });
  });

  // Add more tests for other functionality as needed
});
