import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { JSDOM } from 'jsdom';

// const { window } = new JSDOM('<!doctype html><html><body></body></html>');
// global.window = window;
// global.document = window.document;
// global.navigator = {
//   userAgent: 'node.js',
// };
configure({ adapter: new Adapter() });

jest.useFakeTimers();
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@notifee/react-native', () => require('@notifee/react-native/jest-mock'))

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));


import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const Platform = require('react-native/Libraries/Utilities/Platform.android');
  Platform.OS = 'android';
  return Platform;
});


console.error = jest.fn();

import mockBackHandler from 'react-native/Libraries/Utilities/__mocks__/BackHandler.js';

jest.mock(
  'react-native/Libraries/Utilities/BackHandler',
  () => mockBackHandler,
);