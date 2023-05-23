import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Income from '../Components/Income/Income';
import { shallow } from 'enzyme';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { auth, db, collection, getDocs, doc,updateDoc,  getDoc, deleteDoc} from "../Firebase/config";
import SmsAndroid from 'react-native-get-sms-android';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';

var filter = {
	box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
	minDate: 0, // timestamp (in milliseconds since UNIX epoch)
	maxDate: 0, // timestamp (in milliseconds since UNIX epoch)1679211532291000
	bodyRegex: "(.*)(?=.*[Aa]ccount.*|.*[Aa]/[Cc].*|.*[Aa][Cc][Cc][Tt].*|.*[Cc][Aa][Rr][Dd].*)(?=.*[Cc]redit.*)(?=.*[Ii][Nn][Rr].*|.*[Rr][Ss].*)(.*)", // content regex to match
	indexFrom: 0, // start from index 0
	maxCount: 10, // count of SMS to return each time
};

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
}));


describe('Income', () => {
    const route = {
        params: {
            transactionList : [],
        }
    };

    console.error = jest.fn();
    global.alert = jest.fn();

    const navigation = {
        addListener: jest.fn(),
        navigate: jest.fn(),
        replace: jest.fn(),
        setOptions: jest.fn(),
    }

    it('renders correctly', () => {
        const wrapper = shallow(<Income route={route} navigation ={navigation}/>);
        expect(wrapper.exists()).toBe(true);
    });

    it('Fetch and show untracked income transactions ', async() => {
        const mockUser = {
            data: () => ({
              lastViewTS: new Date("2023-05-20T00:00:00").getTime(),
            }),
        };

        const smsList = [
            // Create sample SMS objects here for testing
            { body: 'Rs.25.00 credited thru A/C XX1234 on 18-3-23 09:45:21 to John Doe, UPI Ref 987654321. If not done, SMS BLOCKUPI to 1234567890.-ABC Bank', date: 1621531539000 },
            { body: 'Rs.50.00 credited thru A/C XX5678 on 19-3-23 15:30:12 to Jane Smith, UPI Ref 123456789. If not done, SMS BLOCKUPI to 0987654321.-XYZ Bank', date: 1621531538000 },
        ];
    
        const messageList = [];
    
        // Mock the behavior of the SmsAndroid.list callback functions
        SmsAndroid.list.mockImplementationOnce((filter, failCallback, successCallback) => {
            successCallback(smsList.length, JSON.stringify(smsList));
        });

        getDoc.mockResolvedValueOnce(mockUser);

        const appStateSpy = jest.spyOn(AppState, 'addEventListener');

        appStateSpy.mockImplementationOnce((_, listener) => {
            listener('active');
        });

        let component ;
        await act(async () => {
            component = renderer.create(<Income route={route} navigation ={navigation}/>);
        });

        const root = component.root;
        const showUntrackedTransactions = root.findByProps({ testID:"showUntrackedTransactions" });
        fireEvent.press(showUntrackedTransactions);

    });

    it('Fetch Income Transactions ', async() => {
        
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
                        incDate: { seconds:  new Date().getTime()/1000, nanoseconds: 0 },
                        incImage: "https://dummyimage.com/400x300/000000/ffffff&text=Dummy+Image"
                    })
                };
                const mockDocument3 = {
                    id: 'mockId3',
                    data: () => ({
                        incAmount: 100,
                        incDescription: 'Mock Description 3',
                        incCategory: 'Mock Category 2',
                        incDate: { seconds:  new Date().getTime()/1000, nanoseconds: 0 },
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
            component = renderer.create(<Income route={route} navigation ={navigation}/>);
        });

        const root = component.root;

        const changeFilterToDay = root.findByProps({ testID:"dayFilter" });
        fireEvent.press(changeFilterToDay);
        fireEvent.press(root.findByProps({ testID:"showDatePicker" }));
        const dateTimePicker = root.findByProps({ testID:"dateTimePicker" })
        //Valid Input-previous date
        fireEvent(dateTimePicker , 'change', new Date())
        const ShowIncomeDetailsByDate=root.findAllByProps({ testID:"ShowIncomeDetailsByDate" })
        fireEvent.press(ShowIncomeDetailsByDate[0]);

        const changeFilterToMonth = root.findByProps({ testID:"monthFilter" });
        fireEvent.press(changeFilterToMonth);
        //increment and decrement month
        fireEvent.press(root.findByProps({ testID:"decrementMonth" }));
        fireEvent.press(root.findByProps({ testID:"incrementMonth" }));
        const ShowIncomeDetailsByMonth=root.findAllByProps({ testID:"ShowIncomeDetailsByMonth" })
        fireEvent.press(ShowIncomeDetailsByMonth[0]);

        const changeFilterToYear = root.findByProps({ testID:"yearFilter" });
        fireEvent.press(changeFilterToYear);
         //increment and decrement year
        fireEvent.press(root.findByProps({ testID:"decrementYear" }));
        fireEvent.press(root.findByProps({ testID:"incrementYear" }));
        
        const yearInput = root.findByProps({ testID:"yearInput" });
        fireEvent.changeText(yearInput, "2025");
        fireEvent.changeText(yearInput, "2023");
        const ShowIncomeDetails=root.findAllByProps({ testID:"ShowIncomeDetails" })
        fireEvent.press(ShowIncomeDetails[0]);
        
        const deleteRec = root.findAllByProps({ testID:"deleteRec" });
        fireEvent.press(deleteRec[0]);

    });

    it('Navigate to add income ', async() => {
        
        let component ;
        await act(async () => {
            component = renderer.create(<Income route={route} navigation ={navigation}/>);
        });

        const root = component.root;

        const addIncome = root.findByProps({ testID:"addIncome" });
        fireEvent.press(addIncome);
        
    });
 

});
