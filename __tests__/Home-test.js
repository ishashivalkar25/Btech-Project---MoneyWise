import 'react-native';
import React from 'react';
import Income from '../Components/Income/Income';
import HomePage from '../Components/HomePage';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native'; 

// it('renders correctly', () => {

//   const navigationMock = {
//     setOptions: jest.fn(),
//     navigate: jest.fn(),
//   };

//   const route = { params: {} };
//   renderer.create(<Income navigation={navigationMock} route ={route}/>);
// });

it('renders correctly', () => {

  renderer.create(
    <NavigationContainer>
      <HomePage/>
    </NavigationContainer>
  );
});
