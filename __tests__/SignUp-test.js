import React from 'react';
import { mount, shallow } from 'enzyme';
import SignUp from '../Components/SignUp';
import { render, fireEvent, waitFor} from '@testing-library/react-native';

describe('<SignUp />', () => {
  let wrapper;
  const mockProps = {
    navigation: {
      replace: jest.fn(),
      navigate: jest.fn(),
    },
  };

  beforeEach(() => {
    wrapper = shallow(<SignUp {...mockProps}/>);
  });

  it('should update email state on input change with valid Email', async() => {
    wrapper.find('[placeholder="Email / Username"]').simulate('changeText', 'test@example.com');
  });

  it('should not update email state on input change with invalid Email', async() => {
    wrapper.find('[placeholder="Email / Username"]').simulate('changeText', 'testinvalidemail');
  });

  it('should update phone number state on input change with valid phone number', () => {
    wrapper.find('[placeholder="Contact Number"]').simulate('changeText', '9314526200');
  });

  it('should not update phone number state on input change with invalid phone number', () => {
    wrapper.find('[placeholder="Contact Number"]').simulate('changeText', '1234567890');
  });

  it('should update password state on input change with valid password', () => {
    wrapper.find('[placeholder="Password"]').simulate('changeText', 'Password123!');
  });

  it('should not update password state on input change with invalid password', () => {
    wrapper.find('[placeholder="Password"]').simulate('changeText', 'Password');
  });

  it('should update confirm password state on input change with valid confirm password', () => {
    wrapper.find('[placeholder="Password"]').simulate('changeText', 'Password123!');
    wrapper.find('[placeholder="Confirm Password"]').simulate('changeText', 'Password123!');
  });

  it('should not update confirm password state on input change with invalid confirm password', () => {
    wrapper.find('[placeholder="Confirm Password"]').simulate('changeText', 'NonMatchingPassword');
  });

  it('should update bank name state on input change', () => {
    wrapper.find('[placeholder="Bank Name"]').simulate('changeText', 'dumy bank');
  });

  it('should update account balance state on input change with valid account balance', () => {
    wrapper.find('[placeholder="Account Balance"]').simulate('changeText', '2301');
  });

  it('should update account balance state on input change with valid account balance', () => {
    wrapper.find('[placeholder="Account Balance"]').simulate('changeText', '-2301a');
  });

  // it('should call the signUpToAcc function on button press', () => {
  //   const signUpToAcc = jest.spyOn(wrapper.instance(), 'signUpToAcc');
  //   wrapper.instance().forceUpdate();
  //   wrapper.find('TouchableOpacity').at(0).simulate('press');
  //   expect(signUpToAcc).toHaveBeenCalled();
  // });

});


// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import SignUp from '../Components/SignUp';

// // mock dependencies
// jest.mock('../Firebase/config', () => ({
//   auth: {
//     currentUser: { uid: 'fakeUid' },
//     signOut: jest.fn(),
//   },
//   db: {
//     doc: jest.fn(),
//     setDoc: jest.fn(),
//   },
// }));

// describe('SignUp', () => {
//   it('should validate inputs on submit', () => {

//     const navigationMock = {
//         replace: jest.fn(),
//         navigate: jest.fn(),
//     };

//     const { getByPlaceholderText, getByText } = render(<SignUp navigation={navigationMock}/>);
    
//     // fill in valid values
//     fireEvent.changeText(getByPlaceholderText('name'), 'John');
//     fireEvent.changeText(getByPlaceholderText('emailInput'), 'john@example.com');
//     fireEvent.changeText(getByTestId('phoneNoInput'), '9876543210');
//     fireEvent.press(getByTestId('dateOfBirthInput')); // open date picker
//     fireEvent(getByTestId('datePicker'), 'onChange', new Date('1990-01-01')); // select date
//     fireEvent.press(getByText('OK')); // confirm date
//     fireEvent.changeText(getByTestId('passwordInput'), 'Password1!');
//     fireEvent.changeText(getByTestId('confirmPasswordInput'), 'Password1!');
//     fireEvent.changeText(getByTestId('bankNameInput'), 'MyBank');
//     fireEvent.changeText(getByTestId('accBalanceInput'), '1000');

//     // submit form
//     fireEvent.press(getByTestId('submitButton'));

//     // expect valid input
//     expect(db.doc).toHaveBeenCalledWith(db.doc('User/fakeUid'));
//     expect(db.setDoc).toHaveBeenCalledWith(db.doc('User/fakeUid'), {
//       name: 'John',
//       email: 'john@example.com',
//       phoneNo: '9876543210',
//       DOB: new Date('1990-01-01'),
//       bankName: 'MyBank',
//       accBalance: '1000',
//     });
//     expect(auth.currentUser.uid).toEqual('fakeUid');
//     expect(auth.signOut).toHaveBeenCalled();
//     expect(useNavigation().replace).toHaveBeenCalledWith('Login');
//   });

//   it('should show an error if invalid input is submitted', () => {
    
//     const navigationMock = {
//         replace: jest.fn(),
//         navigate: jest.fn(),
//     };

//     const { getByTestId, getByText } = render(<SignUp navigation={navigationMock}/>);
    
//     // fill in invalid values
//     fireEvent.changeText(getByTestId('nameInput'), '');
//     fireEvent.changeText(getByTestId('emailInput'), 'invalid email');
//     fireEvent.changeText(getByTestId('phoneNoInput'), '1234');
//     fireEvent.press(getByTestId('dateOfBirthInput')); // open date picker
//     fireEvent(getByTestId('datePicker'), 'onChange', new Date()); // select today's date
//     fireEvent.press(getByText('OK')); // confirm date
//     fireEvent.changeText(getByTestId('passwordInput'), 'password');
//     fireEvent.changeText(getByTestId('confirmPasswordInput'), '');
//     fireEvent.changeText(getByTestId('bankNameInput'), '');
//     fireEvent.changeText(getByTestId('accBalanceInput'), 'not a number');

//     // submit form
//     fireEvent.press(getByTestId('submitButton'));

//     // expect error messages
//     expect(getByText('Please enter all required fields correctly!')).toBeTruthy();
//     expect(db.doc).not.toHaveBeenCalled();
//     expect(db.setDoc).not.toHaveBeenCalled();
//     expect(auth.currentUser).toBeFalsy();
//     expect(auth.signOut).not.toHaveBeenCalled();
//     expect(useNavigation().replace).not.toHaveBeenCalled();
//   });
// });
