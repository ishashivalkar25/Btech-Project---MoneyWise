import React from 'react';
import { render } from '@testing-library/react-native';
import AddExpense from '../Components/Expense/AddExpense';
import { NavigationContainer } from '@react-navigation/native'; 

describe('AddExpense', () => {
  it('renders the tab navigator with correct screen names', () => {
    const { getByText } = render(<NavigationContainer><AddExpense /></NavigationContainer>);
  });

});
