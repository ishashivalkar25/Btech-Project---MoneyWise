import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignUp from '../Components/SignUp';

// mock dependencies
jest.mock('../Firebase/config', () => ({
  auth: {
    currentUser: { uid: 'fakeUid' },
    signOut: jest.fn(),
  },
  db: {
    doc: jest.fn(),
    setDoc: jest.fn(),
  },
}));

describe('SignUp', () => {
  it('should validate inputs on submit', () => {

    const navigationMock = {
        replace: jest.fn(),
        navigate: jest.fn(),
    };

    const { getByPlaceholderText, getByText } = render(<SignUp navigation={navigationMock}/>);
    
    // fill in valid values
    fireEvent.changeText(getByPlaceholderText('name'), 'John');
    fireEvent.changeText(getByPlaceholderText('emailInput'), 'john@example.com');
    fireEvent.changeText(getByTestId('phoneNoInput'), '9876543210');
    fireEvent.press(getByTestId('dateOfBirthInput')); // open date picker
    fireEvent(getByTestId('datePicker'), 'onChange', new Date('1990-01-01')); // select date
    fireEvent.press(getByText('OK')); // confirm date
    fireEvent.changeText(getByTestId('passwordInput'), 'Password1!');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'Password1!');
    fireEvent.changeText(getByTestId('bankNameInput'), 'MyBank');
    fireEvent.changeText(getByTestId('accBalanceInput'), '1000');

    // submit form
    fireEvent.press(getByTestId('submitButton'));

    // expect valid input
    expect(db.doc).toHaveBeenCalledWith(db.doc('User/fakeUid'));
    expect(db.setDoc).toHaveBeenCalledWith(db.doc('User/fakeUid'), {
      name: 'John',
      email: 'john@example.com',
      phoneNo: '9876543210',
      DOB: new Date('1990-01-01'),
      bankName: 'MyBank',
      accBalance: '1000',
    });
    expect(auth.currentUser.uid).toEqual('fakeUid');
    expect(auth.signOut).toHaveBeenCalled();
    expect(useNavigation().replace).toHaveBeenCalledWith('Login');
  });

  it('should show an error if invalid input is submitted', () => {
    
    const navigationMock = {
        replace: jest.fn(),
        navigate: jest.fn(),
    };

    const { getByTestId, getByText } = render(<SignUp navigation={navigationMock}/>);
    
    // fill in invalid values
    fireEvent.changeText(getByTestId('nameInput'), '');
    fireEvent.changeText(getByTestId('emailInput'), 'invalid email');
    fireEvent.changeText(getByTestId('phoneNoInput'), '1234');
    fireEvent.press(getByTestId('dateOfBirthInput')); // open date picker
    fireEvent(getByTestId('datePicker'), 'onChange', new Date()); // select today's date
    fireEvent.press(getByText('OK')); // confirm date
    fireEvent.changeText(getByTestId('passwordInput'), 'password');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), '');
    fireEvent.changeText(getByTestId('bankNameInput'), '');
    fireEvent.changeText(getByTestId('accBalanceInput'), 'not a number');

    // submit form
    fireEvent.press(getByTestId('submitButton'));

    // expect error messages
    expect(getByText('Please enter all required fields correctly!')).toBeTruthy();
    expect(db.doc).not.toHaveBeenCalled();
    expect(db.setDoc).not.toHaveBeenCalled();
    expect(auth.currentUser).toBeFalsy();
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(useNavigation().replace).not.toHaveBeenCalled();
  });
});
