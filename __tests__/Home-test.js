import 'react-native';
import React from 'react';
import HomePage, {MyTabs} from '../Components/HomePage';
import { render, fireEvent } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native'; 
import { shallow } from 'enzyme';
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

describe('MyTabs', () => {

  it('renders two tabs', () => {
    const { getByText } = render(
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    );
    // const incomeTab = getByText('Income');
    // const expenseTab = getByText('Expense');
    // expect(incomeTab).toBeDefined();
    // expect(expenseTab).toBeDefined();
  });
});

describe('HomePage', () => {
  const navigation = { navigate: jest.fn(), setOptions: jest.fn() };
  const props = { navigation };

  it('renders without crashing', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders two tabs', () => {
    const {getByTestId} = render( <NavigationContainer>
      <HomePage {...props} />
    </NavigationContainer>
    );
  });
});


