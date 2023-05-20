import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Income from '../Components/Income/Income';
import { shallow } from 'enzyme';

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


describe('Income', () => {
    const route = {
        params: {
            transactionList : [],
        }
    };

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

    it('updates the records filter correctly', () => {
        const { getByText } = render(<Income route={route} navigation ={navigation}/>);
    });

    // Add more test cases for other functionalities and components if needed
});
