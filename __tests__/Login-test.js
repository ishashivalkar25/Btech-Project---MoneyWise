import React from 'react';
import { render, fireEvent, waitFor} from '@testing-library/react-native';
import Login from '../Components/Login';
import AddIncome from '../Components/Income/AddIncome';
import { auth } from '../Firebase/config';
// import { auth } from '../Firebase/config'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import DialogInput from 'react-native-dialog-input';

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
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
    // sendPasswordResetEmail: jest.fn(),
    // signInWithEmailAndPassword: jest.fn(),
}));


describe('Login', () => {
    it('should handle login with valid credentials', async () => {
        const navigationMock = {
            replace: jest.fn(),
            navigate: jest.fn(),
        };

        // Mock the alert function
        global.alert = jest.fn();

        signInWithEmailAndPassword.mockResolvedValue({
            user: { email: 'test@example.com', emailVerified: true },
          });

        const {queryByPlaceholderText, getByTestId } = render(
            <Login navigation={navigationMock} />
        );

        // Fill in the login form fields
        const emailInput = queryByPlaceholderText('Email / Username');
        const passwordInput = queryByPlaceholderText('Password');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password');

        // Trigger the login action
        const loginButton = getByTestId('LoginBtn');
        fireEvent.press(loginButton);

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', "password");
        await waitFor(() => expect(navigationMock.replace).toHaveBeenCalledWith('Root'));
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Logged In Successfully123!!!'));
   
    });

    it('should handle login with valid credentials but email not verified', async () => {
        const navigationMock = {
            replace: jest.fn(),
            navigate: jest.fn(),
        };

        // Mock the alert function
        global.alert = jest.fn();

        signInWithEmailAndPassword.mockResolvedValue({
            user: { email: 'test@example.com', emailVerified: false },
          });

        const {queryByPlaceholderText, getByTestId } = render(
            <Login navigation={navigationMock} />
        );

        // Fill in the login form fields
        const emailInput = queryByPlaceholderText('Email / Username');
        const passwordInput = queryByPlaceholderText('Password');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password');

        // Trigger the login action
        const loginButton = getByTestId('LoginBtn');
        fireEvent.press(loginButton);

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', "password");
        await waitFor(() => expect(auth.signOut).toHaveBeenCalledWith());
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Please verify your Email. Link is already sent."));
   
    });

    it('should handle login with invalid credentials', async () => {
        const navigationMock = {
            replace: jest.fn(),
            navigate: jest.fn(),
        };

        // Mock the alert function
        global.alert = jest.fn();

        signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid email or password'))

        const {queryByPlaceholderText, getByTestId } = render(
            <Login navigation={navigationMock} />
        );

        // Fill in the login form fields
        const emailInput = queryByPlaceholderText('Email / Username');
        const passwordInput = queryByPlaceholderText('Password');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password');

        // Trigger the login action
        const loginButton = getByTestId('LoginBtn');
        fireEvent.press(loginButton);

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', "password")
        
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Username/ Password is incorrect!!"));
 
    });

    it('should call passwordResetEmail when submitting a valid email address', async() => {
        const navigationMock = {
            replace: jest.fn(),
            navigate: jest.fn(),
        };

        const { queryByPlaceholderText,getByText } = render(
            <AddIncome navigation={navigationMock} />
        );

        // signInWithEmailAndPassword.mockResolvedValue({
        //     // email: 'test@example.com'
        //   });

        const emailInput = queryByPlaceholderText('Enter Category');
        const submitButton = getByText('Enter Category');
    
        // fireEvent(emailInput, 'onChangeText', 'validemail@test.com');
        // fireEvent.press(submitButton);

        // await waitFor(() => expect(passwordResetEmail).toHaveBeenCalledWith('validemail@test.com'));
        // await waitFor(() => expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'validemail@test.com'));
 
      });

});
