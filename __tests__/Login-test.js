// import React from 'react';
// import { render, fireEvent } from '@testing-library/react-native';
// import Login from '../Components/Login';
// import { NavigationContainer } from '@react-navigation/native';

// jest.mock('../Firebase/config', () => ({
//   auth: {
//     onAuthStateChanged: jest.fn(),
//     signInWithEmailAndPassword: jest.fn(),
//     signOut: jest.fn(),
//     currentUser: jest.fn(),
//   },
//   db: jest.fn(),
//   collection: jest.fn(),
//   addDoc: jest.fn(),
//   getDocs: jest.fn(),
//   getDoc: jest.fn(),
//   storage: jest.fn(),
//   doc: jest.fn(),
//   updateDoc: jest.fn(),
//   sendPasswordResetEmail: jest.fn(),
// }));



// describe('Login', () => {

//   it('should handle login with valid credentials', async () => {
//     const navigationMock = {
//       replace: jest.fn(),
//       navigate: jest.fn(),
//     };

    

//     // Mock the alert function
//     global.alert = jest.fn();

//     const { queryByPlaceholderText, getByTestId } = render(
//       <NavigationContainer>
//         <Login navigation={navigationMock} />
//       </NavigationContainer>
//     );

//     // Fill in the login form fields
//     const emailInput = queryByPlaceholderText('Email / Username');
//     const passwordInput = queryByPlaceholderText('Password');

//     expect(emailInput).toBeTruthy();
//     expect(passwordInput).toBeTruthy();

//     fireEvent.changeText(emailInput, 'test@example.com');
//     fireEvent.changeText(passwordInput, 'password');



//     const navigationSpy = jest.spyOn(navigationMock, "replace");

//     // Trigger the login action
//     const loginButton = getByTestId('LoginBtn');
//     fireEvent.press(loginButton);

//     expect(navigationSpy).toHaveBeenCalledWith("Root");

//     navigationSpy.mockRestore();

//     // // Assert that the navigation method is called
//     // await (() => {
//     //     // Assert that the navigation method is called
//     //     expect(navigationMock.replace).toHaveBeenCalledWith("Root");
//     // });
//     //  // Assert that the alert function was not called
//     //  expect(global.alert).not.toHaveBeenCalled();
//   });

//   it('should handle forgot password', async () => {
//     const navigationMock = {
//       replace: jest.fn(),
//       navigate: jest.fn(),
//     };

//     const { getByText } = render(
//       <NavigationContainer>
//         <Login navigation={navigationMock} />
//       </NavigationContainer>
//     );


//     // Trigger the forgot password action
//     const forgotPasswordButton = getByText('Forgot Password ?');
//     fireEvent.press(forgotPasswordButton);

//     // Assert that the dialog box visibility state is updated
//     // For example, you can assert that the dialog box becomes visible
//     // by checking for its existence or a specific UI element within it
//     // expect(...) assertions for dialog box visibility
//     await (() => {
//       // Assert that the navigation method is called
//       expect(navigationMock.navigate).toHaveBeenCalledWith("Sign Up");
//     });

//   });

//   // Add more test cases for other user interactions and edge cases
// });