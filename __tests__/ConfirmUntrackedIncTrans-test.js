import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConfirmUntrackedIncTrans from '../Components/Income/ConfirmUntrackedIncTrans';
import { BackHandler } from 'react-native'
import renderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
import { auth, db, collection, getDocs, doc,updateDoc,  getDoc, deleteDoc} from "../Firebase/config";


jest.mock('../Firebase/config', () => ({
    auth: {
        onAuthStateChanged: jest.fn(callback => callback({ emailVerified: true })),
        signOut: jest.fn(),
        currentUser: {
            uid: "mockId"
        },
    },
    db: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    storage: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

describe('ConfirmUntrackedIncTrans', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  it('renders correctly with empty message list', () => {
    const route = {
      params: {
        messageList: [],
      },
    };
    const { getByText } = render(<ConfirmUntrackedIncTrans route={route} navigation={mockNavigation} />);
    
    const title = getByText('Untracked Incoming Transactions!');
    const acceptAllButton = getByText('Accept All Transactions');

    expect(title).toBeDefined();
    expect(acceptAllButton).toBeDefined();
  });

  it('renders correctly with non-empty message list', () => {
    const messageList = [
      {
        amount: '10',
        date: '2023-05-22',
      },
      {
        amount: '20',
        date: '2023-05-23',
      },
    ];
    const route = {
      params: {
        messageList,
      },
    };
    const { getByText, getAllByText } = render(<ConfirmUntrackedIncTrans route={route} navigation={mockNavigation} />);
    
    const title = getByText('Untracked Incoming Transactions!');
    const acceptAllButton = getByText('Accept All Transactions');
    const transactionItems = getAllByText(/Transaction \d+/);

    expect(title).toBeDefined();
    expect(acceptAllButton).toBeDefined();
    expect(transactionItems.length).toBe(2);
  });

  it('Save all income records', async() => {
    const messageList = [
      {
        amount: '10',
        date: '2023-05-22',
      },
      {
        amount: '20',
        date: '2023-05-23',
      },
    ];
    const route = {
      params: {
        messageList,
      },
    };

    const user = { data: () => ({ accBalance: '100' }) };
    getDoc.mockReturnValue(user);

    global.alert=jest.fn();
    let component ;
    await act(async () => {
        component = renderer.create(<ConfirmUntrackedIncTrans route={route} navigation={mockNavigation} />);
    });

    const root = component.root;
    const acceptAllIncTransactions = root.findByProps({ testID:"acceptAll" });
    fireEvent.press(acceptAllIncTransactions)
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Income');

  });

  it('Delete income records', async() => {
    const messageList = [
      {
        amount: '10',
        date: '2023-05-22',
      },
      {
        amount: '20',
        date: '2023-05-23',
      },
    ];
    const route = {
      params: {
        messageList,
      },
    };

    global.alert=jest.fn();
    let component ;
    await act(async () => {
        component = renderer.create(<ConfirmUntrackedIncTrans route={route} navigation={mockNavigation} />);
    });

    const root = component.root;
    const deleteIncRec = root.findAllByProps({ testID:"deleteIncRec" });
    fireEvent.press(deleteIncRec[0])

  });

  // test('should handle back button press', () => {
  //   const mockNavigate = jest.fn();
  //   const mockAddListener = jest.spyOn(BackHandler, 'addEventListener');
  //   const mockRemoveListener = jest.spyOn(BackHandler, 'removeEventListener');

  //   render(
  //     <ConfirmUntrackedIncTrans route={{ params: { messageList: [] } }} navigation={{ navigate: mockNavigate }} />
  //   );

  //   expect(mockAddListener).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));

  //   fireEvent(BackHandler, 'hardwareBackPress');

  //   expect(mockRemoveListener).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
  //   expect(mockNavigate).toHaveBeenCalledWith('Income');
  // });
 
});


