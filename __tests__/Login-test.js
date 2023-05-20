import React from 'react';
import { render, fireEvent, waitFor} from '@testing-library/react-native';
import Login from '../Components/Login';
import { auth } from '../Firebase/config';
// import { auth } from '../Firebase/config'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import DialogInput from 'react-native-dialog-input';
import { mount, shallow } from 'enzyme';

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

        fireEvent.changeText(emailInput, 'test1@example.com');
        fireEvent.changeText(passwordInput, 'password1');

        // Trigger the login action
        const loginButton = getByTestId('LoginBtn');
        fireEvent.press(loginButton);

        await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Username/ Password is incorrect!!"));
 
    });

    it('should send password reset email when submitting a valid email address', async() => {
        const wrapper = shallow(<Login />);
        const validEmail = 'user@example.com';
        const dialogInput = wrapper.find('[testID="resetPassword"]');
        dialogInput.props().submitInput(validEmail);

        global.alert = jest.fn();
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, validEmail);
        await waitFor(() => expect(global.alert).toHaveBeenCalledWith('Password reset link is sent successfully!'));

    });

    it('On clicking on Register Button redirect to Sign Up Page', async() => {
        const navigationMock = {
            navigate: jest.fn(),
        };
        const wrapper = shallow(<Login navigation={navigationMock}/>);
        const registerBtn = wrapper.find('[testID="redirectToSignUpBtn"]');
        registerBtn.props().onPress();

        await waitFor(() => expect(navigationMock.navigate).toHaveBeenCalledWith('Sign Up'));
    });

    it('On clicking on Forgot Password Button show Dialog Box', async() => {
        const wrapper = shallow(<Login/>);
        const forgotPassBtn = wrapper.find('[testID="Forgot Password"]');
        forgotPassBtn.props().onPress();
        const dialogInput = wrapper.find('[testID="resetPassword"]');
        expect(dialogInput.props().isDialogVisible).toBeTruthy();
    });

    it('After clicking on close button , hide Dialog Box', async() => {
        const wrapper = shallow(<Login/>);
        const dialogInput = wrapper.find('[testID="resetPassword"]');
        dialogInput.props().closeDialog();
        expect(dialogInput.props().isDialogVisible).toBeFalsy();
    });


    // it('should not send password reset email and give error when submitting a invalid email address', async() => {
    //     const wrapper = shallow(<Login />);
    //     const invalidEmail = 'user@example.com';
    //     const dialogInput = wrapper.find('[testID="resetPassword"]');
    //     dialogInput.props().submitInput(invalidEmail);

    //     global.alert = jest.fn();
    //     sendPasswordResetEmail.mockRejectedValue(new Error('Invalid email or password'));

    //     // expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    //     // expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'user1@example.com');
    //     await waitFor(() => expect(global.alert).toHaveBeenCalledWith("Please enter valid email address!"));

    // });

});
