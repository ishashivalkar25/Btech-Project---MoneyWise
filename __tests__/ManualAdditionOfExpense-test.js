import Toast from 'react-native-root-toast'; // import Toast
import ManualAdditionOfExpense from '../Components/Expense/ManualAdditionOfExpense';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Blob, Image } from 'react-native';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import uploadImg from "../Assets/uploadReceiptIcon.png";
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import * as ImagePicker from 'react-native-image-picker';
import {
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    storage,
    auth,
    doc,
    updateDoc
} from '../Firebase/config';

// Mock XMLHttpRequest
mockXHR = {
    onload: jest.fn(),
    onerror: jest.fn(),
    responseType: '',
    open: jest.fn(),
    send:  jest.fn().mockImplementation(function () {
        const response = { /* your response object */ };
        this.readyState = 4;
        this.status = 200;
        this.responseText = JSON.stringify(response);
        this.onload();
    }),
    setRequestHeader: jest.fn(),
    status: 200,
    readyState: 4,
    responseText:"Success"
}
global.XMLHttpRequest = jest.fn(() => mockXHR);

jest.mock("react-native-root-toast", () => ({
    show: jest.fn(),
    durations: {
        LONG: 8000,
    },
    hide: jest.fn(),
}));

jest.mock("react-native-image-picker", () => ({
    launchImageLibrary: jest.fn(),
    launchCamera: jest.fn(),
}));

jest.mock('../Firebase/config', () => ({
    auth: {
        onAuthStateChanged: jest.fn(),
        signInWithEmailAndPassword: jest.fn(),
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
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn()
}));

console.error = jest.fn();


describe('saveExpense function', () => {

    const navigation = {
        navigate: jest.fn(),
    }

    const mockParams = {
        grpMembersList: [
        { name: 'John', contactNo: '1234567890', amount: 10 },
        { name: 'Jane', contactNo: '9876543210', amount: 20 },
        ],
    };

    const mockRoute = {
        params: mockParams,
    };


    it("should render correctly", () => {
        render(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
    });

    it("fetch income categories, select category and select date and set description", async () => {

        const mockUser = {
            data: () => ({
                incCategories: ['category1', 'category2', 'category3']
            }),
        };

        getDoc.mockResolvedValueOnce(mockUser);

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        //set date 
        const showDatePicker = root.findByProps({ testID: "showDatePicker" });
        fireEvent.press(showDatePicker);

        const dateTimePicker = root.findByProps({ testID: "dateTimePicker" })
        //Valid Input-previous date
        fireEvent(dateTimePicker, 'change', new Date())

        const dropdownInput = root.findByProps({ testID: "setSelectedCatId" });
        fireEvent(dropdownInput, 'change', { label: 'Category 1', value: 'category1' });

        fireEvent.changeText(root.findByProps({ placeholder: "Description" }), "Mock Description");

    });

    it("fetch income categories, select Other category and custom category", async () => {

        const mockUser = {
            data: () => ({
                incCategories: ['category1', 'category2', 'category3']
            }),
        };

        getDoc.mockResolvedValueOnce(mockUser);

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        const dropdownInput = root.findByProps({ testID: "setSelectedCatId" });
        fireEvent(dropdownInput, 'change', { label: 'Other', value: 'Other' });

        const customCat = root.findByProps({ placeholder: "Enter Category" });
        fireEvent.changeText(customCat, "Food")
        fireEvent.press(root.findByProps({ testID: "addCategory" }));

    });

    it("Upload Receipt from gallery", async () => {

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        const mockedResponse = {
            assets: [
                {
                    uri: 'https://dummyimage.com/400x300/000000/ffffff&text=Dummy+Image',
                },
            ],
        };

        ImagePicker.launchImageLibrary.mockResolvedValue(mockedResponse);

        //add image
        fireEvent.press(root.findByProps({ testID: "setVisibilityOfImgModal" }))
        //upload Image from gallery
        fireEvent.press(root.findByProps({ testID: "showImagePicker" }))

        //to select other image open modal
        fireEvent.press(root.findByProps({ testID: "selectOtherImg" }))

        //close modal
        fireEvent(root.findByProps({ testID: "imgModal" }), 'onDismiss')

    });

    it("Upload Receipt using Camera", async () => {

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        const mockedResponse = {
            assets: [
                {
                    uri: 'https://dummyimage.com/400x300/000000/ffffff&text=Dummy+Image',
                },
            ],
        };

        ImagePicker.launchCamera.mockResolvedValue(mockedResponse);

        //add image
        fireEvent.press(root.findByProps({ testID: "setVisibilityOfImgModal" }))
        //upload Image from gallery
        fireEvent.press(root.findByProps({ testID: "openCamera" }))

        fireEvent.press(root.findByProps({ testID: "closeImagePicker" }))
    });

    it('should show toast message if amount is 0', async () => {

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        const amount = root.findByProps({ testID: "setAmtId" });
        fireEvent.changeText(amount, 0);

        const saveExpense = root.findByProps({ testID: "saveExpenseBtn" });
        fireEvent.press(saveExpense);

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith('Please enter amount.', {
            duration: Toast.durations.LONG,
        }));
        jest.advanceTimersByTime(8000);
        await waitFor(() => expect(Toast.hide).toHaveBeenCalled());

    });

    it('should show toast message if category is not selected', async () => {

        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;

        const amount = root.findByProps({ testID: "setAmtId" });
        fireEvent.changeText(amount, 100);

        const saveExpense = root.findByProps({ testID: "saveExpenseBtn" });
        fireEvent.press(saveExpense);

        await waitFor(() => expect(Toast.show).toHaveBeenCalledWith("Please select category.", {
            duration: Toast.durations.LONG,
        }));
        jest.advanceTimersByTime(8000);
        await waitFor(() => expect(Toast.hide).toHaveBeenCalled());

    });

    

    // it("upload image to storage and get download URL and save income record", async () => {

    //     const mockUser = {
    //         data: () => ({
    //             incCategories: ['category1', 'category2', 'category3']
    //         }),
    //     };

    //     global.alert=jest.fn();

    //     getDoc.mockResolvedValueOnce(mockUser);
    //     const path = { uri: 'https://example.com/image.jpg' };
    //     Image.resolveAssetSource = jest.fn(() => path);


    //     const mockGetDownloadURL = jest.fn().mockResolvedValue('mock-download-url');
    //     const uploadTask = {
    //         on: jest.fn().mockImplementation((eventName, progressCallback, errorCallback, completeCallback) => {
    //           // Simulate upload progress
    //           progressCallback({ bytesTransferred: 50, totalBytes: 100, state: 'running' });
    //           completeCallback();
    //         }),
    //         snapshot: { ref: {} }, // Mock snapshot object
    //     };
    
    //     uploadBytesResumable.mockReturnValue(uploadTask);
    //     getDownloadURL.mockImplementation(mockGetDownloadURL);

        
    //     let component;
    //     await act(async () => {
    //         component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
    //     });
    //     const root = component.root;

    //     const amount = root.findByProps({ testID: "setAmtId" });
    //     fireEvent.changeText(amount, 100);

    //     const dropdownInput = root.findByProps({ testID: "setSelectedCatId" });
    //     fireEvent(dropdownInput, 'change', { label: 'category1', value: 'category1' });

    //     const mockedResponse = {
    //         assets: [
    //             {
    //                 uri: 'https://dummyimage.com/400x300/000000/ffffff&text=Dummy+Image',
    //             },
    //         ],
    //     };

    //     ImagePicker.launchImageLibrary.mockResolvedValue(mockedResponse);
    //     //add image
    //     fireEvent.press(root.findByProps({ testID: "setVisibilityOfImgModal" }))
    //     //upload Image from gallery
    //     await fireEvent.press(root.findByProps({ testID: "showImagePicker" }))

    //     const saveExpense = root.findByProps({ testID: "saveExpenseBtn" });
    //     await fireEvent.press(saveExpense);

    //     expect(navigation.navigate).toHaveBeenCalledWith("Root")

    // });

    it("Check whethere all errors are handled correctly", async () => {

        const path = { uri: 'https://example.com/image.jpg' };
        Image.resolveAssetSource = jest.fn(() => path);


        const mockGetDownloadURL = jest.fn().mockResolvedValue('mock-download-url');
        const uploadTask = {
            on: jest.fn().mockImplementation((eventName, progressCallback, errorCallback, completeCallback) => {
              // Simulate upload progress
              progressCallback({ bytesTransferred: 50, totalBytes: 100, state: 'paused' });
              completeCallback();
            }),
            snapshot: { ref: {} }, // Mock snapshot object
        };
    
        uploadBytesResumable.mockReturnValue(uploadTask);
        getDownloadURL.mockImplementation(mockGetDownloadURL);

 


        let component;
        await act(async () => {
            component = renderer.create(<ManualAdditionOfExpense navigation={navigation} route={mockRoute}/>);
        });
        const root = component.root;
      
        fireEvent.press(root.findByProps({ testID: "setVisibilityOfImgModal" }))
        //upload Image from gallery
        await fireEvent.press(root.findByProps({ testID: "showImagePicker" }))

        const amount = root.findByProps({ testID: "setAmtId" });
        fireEvent.changeText(amount, 100);

        const dropdownInput = root.findByProps({ testID: "setSelectedCatId" });
        fireEvent(dropdownInput, 'change', { label: 'category1', value: 'category1' });

        const saveExpense = root.findByProps({ testID: "saveExpenseBtn" });
        await fireEvent.press(saveExpense);
    });


});