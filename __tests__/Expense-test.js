import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Expense from '../Components/Expense/Expense';
import { shallow } from 'enzyme';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { auth, db, collection, getDocs, doc,updateDoc,  getDoc, deleteDoc} from "../Firebase/config";
import SmsAndroid from 'react-native-get-sms-android';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';

// Mock the PermissionsAndroid module
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => {
    const PermissionsAndroid = jest.requireActual(
      'react-native/Libraries/PermissionsAndroid/PermissionsAndroid'
    );
  
    return {
      ...PermissionsAndroid,
      requestMultiple: jest.fn().mockResolvedValue({
        [PermissionsAndroid.PERMISSIONS.READ_SMS]: PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.SEND_SMS]: PermissionsAndroid.RESULTS.GRANTED,
        [PermissionsAndroid.PERMISSIONS.RECEIVE_SMS]: PermissionsAndroid.RESULTS.GRANTED,
      }),
    };
  });

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
    deleteDoc: jest.fn(),
    setDoc: jest.fn()
}));


describe('Expense', () => {

    console.error = jest.fn();
    global.alert = jest.fn();

    const navigation = {
        addListener: jest.fn(),
        navigate: jest.fn(),
        replace: jest.fn(),
        setOptions: jest.fn(),
    }

    it('renders correctly', () => {
        const wrapper = shallow(<Expense navigation ={navigation}/>);
        expect(wrapper.exists()).toBe(true);
    });

    it('Fetch Expense Transactions ', async() => {
        
        const unsubscribe = jest.fn();
        navigation.addListener = jest.fn((event, callback) => {
            if (event === 'focus') {
                callback();
                return unsubscribe;
            }
        });

        getDocs.mockResolvedValueOnce({
            forEach: (callback) => {
                // Simulating forEach loop for each document
                const mockDocument1 = {
                    id: 'mockId1',
                    data: () => ({
                        expAmount: 100,
                        expDescription: 'Mock Description 1',
                        expCategory: 'Mock Category 1',
                        expDate: { seconds: new Date().getTime()/1000, nanoseconds: 0 }
                    })
                };
                const mockDocument2 = {
                    id: 'mockId2',
                    data: () => ({
                        expAmount: 200,
                        expDescription: 'Mock Description 2',
                        expCategory: 'Mock Category 2',
                        expDate: { seconds:  new Date().getTime()/1000, nanoseconds: 0 },
                        expImage: "https://dummyimage.com/400x300/000000/ffffff&text=Dummy+Image"
                    })
                };
                const mockDocument3 = {
                    id: 'mockId3',
                    data: () => ({
                        expAmount: 100,
                        expDescription: 'Mock Description 3',
                        expCategory: 'Mock Category 2',
                        expDate: { seconds:  new Date().getTime()/1000, nanoseconds: 0 },
                        groupExp : true,
                        grpMembersList : [{
                            contactName: 'abc',
                            contactNo: '7854123654',
                            amount: 50
                          },
                          {
                            contactName: 'xyz',
                            contactNo: '9876543210',
                            amount: 75
                          }
                        ]
                    })
                };
                // Calling the callback function for each document
                callback(mockDocument1);
                callback(mockDocument2);
                callback(mockDocument3);
            }
        })

        const user = {
            data: jest.fn().mockReturnValue({
              accBalance: "1000.00",
            }),
          };

        getDoc.mockResolvedValueOnce(user);

        let component ;
        await act(async () => {
            component = renderer.create(<Expense navigation ={navigation}/>);
        });

        const root = component.root;

        const changeFilterToDay = root.findByProps({ testID:"dayFilter" });
        fireEvent.press(changeFilterToDay);
        fireEvent.press(root.findByProps({ testID:"showDatePicker" }));
        const dateTimePicker = root.findByProps({ testID:"dateTimePicker" })
        //Valid Input-previous date
        fireEvent(dateTimePicker , 'change', new Date())
        const ShowExpenseDetailsByDate=root.findAllByProps({ testID:"ShowExpenseDetailsByDate" })
        fireEvent.press(ShowExpenseDetailsByDate[0]);
        
        const zeroBasedBudgetingMethodData = {
            method: 'Zero Based Budgeting',
            budget: [
            { category: 'Groceries', budgetSpent: 100, budgetPlanned: 200 },
            { category: 'Utilities', budgetSpent: 50, budgetPlanned: 100 },
            { category: 'Entertainment', budgetSpent: 30, budgetPlanned: 50 },
            { category: 'Savings', budgetSpent: 200, budgetPlanned: 500 },
            ],
        };
        
        // Mocking getDoc to return documentData
        getDoc.mockReturnValue({ data: () => zeroBasedBudgetingMethodData });
        const deleteRecByDate = root.findAllByProps({ testID:"deleteRecByDate" });
        fireEvent.press(deleteRecByDate[0]);

        const changeFilterToMonth = root.findByProps({ testID:"monthFilter" });
        fireEvent.press(changeFilterToMonth);
        //exprement and decrement month
        fireEvent.press(root.findByProps({ testID:"decrementMonth" }));
        fireEvent.press(root.findByProps({ testID:"incrementMonth" }));
        const ShowExpenseDetailsByMonth=root.findAllByProps({ testID:"ShowExpenseDetailsByMonth" })
        fireEvent.press(ShowExpenseDetailsByMonth[0]);

        // Mock data for the Envelop Method
        const envelopMethodData = {
            method: 'Envelop Method',
            budget: [
            { category: 'Mock Category 1', budgetSpent: 100 },
            { category: 'Utilities', budgetSpent: 50 },
            { category: 'Entertainment', budgetSpent: 30 },
            { category: 'Additional Expenses', budgetSpent: 20 },
            ],
        };
        
        getDoc.mockReturnValue({ data: () => envelopMethodData });
        const deleteRecByMonth = root.findAllByProps({ testID:"deleteRecByMonth" });
        fireEvent.press(deleteRecByMonth[0]);


        const changeFilterToYear = root.findByProps({ testID:"yearFilter" });
        fireEvent.press(changeFilterToYear);
         //exprement and decrement year
        fireEvent.press(root.findByProps({ testID:"decrementYear" }));
        fireEvent.press(root.findByProps({ testID:"incrementYear" }));
        
        const yearInput = root.findByProps({ testID:"yearInput" });
        fireEvent.changeText(yearInput, "2025");
        fireEvent.changeText(yearInput, "2023");
       
        const ShowExpenseDetails=root.findAllByProps({ testID:"ShowExpenseDetails" })
        fireEvent.press(ShowExpenseDetails[0]);

        // Mock data for the FiftyThirtyTwenty Method
        const fiftyThirtyTwentyMethodData = {
            method: 'FiftyThirtyTwenty Method',
            budget: {
            needs: [
                { category: 'Mock Category 2', budgetSpent: 500 },
                { category: 'Utilities', budgetSpent: 200 },
            ],
            wants: [
                { category: 'Entertainment', budgetSpent: 100 },
                { category: 'Shopping', budgetSpent: 50 },
            ],
            savings: [
                { category: 'Retirement', budgetSpent: 300 },
                { category: 'Emergency Fund', budgetSpent: 200 },
            ],
            },
        };
        
        // Mocking getDoc to return documentData
        getDoc.mockReturnValue({ data: () => fiftyThirtyTwentyMethodData });

        const deleteRec = root.findAllByProps({ testID:"deleteRec" });
        fireEvent.press(deleteRec[0]);
     

    });

    it('Navigate to add Expense ', async() => {
        
        let component ;
        await act(async () => {
            component = renderer.create(<Expense navigation ={navigation}/>);
        });

        const root = component.root;

        const addExpense = root.findByProps({ testID:"addExpense" });
        fireEvent.press(addExpense);
        
    });
 

});
